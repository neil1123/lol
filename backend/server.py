from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import hashlib
import aiosqlite
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# SQLite Database Configuration
DB_PATH = os.getenv('DB_PATH', '/app/backend/doord.db')

# Helper function to get database connection
async def get_db():
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    return db

# JWT settings
SECRET_KEY = os.getenv('SECRET_KEY', 'fallback-dev-key-only-not-for-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60  # 24 hours

# Create the main app without a prefix
app = FastAPI(title="Doord API (SQLite)", description="Home Services Marketplace API - SQLite Database")

# Startup event to initialize database
@app.on_event("startup")
async def startup():
    # Run database initialization
    import subprocess
    subprocess.run(["python", "/app/backend/init_db.py"], check=True)
    logging.info(f"✅ SQLite database ready at {DB_PATH}")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ====== SIMPLE MODELS (NO DATABASE) ======

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    user_type: str  # "provider", "homeowner", "property_manager", or "tenant"
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    user_type: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

# ====== HELPER FUNCTIONS ======

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    # Get user from SQLite database
    db = await get_db()
    cursor = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = await cursor.fetchone()
    await db.close()
    
    if row is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Convert row to dict
    user_dict = dict(row)
    # Parse JSON fields
    if user_dict.get('services'):
        user_dict['services'] = json.loads(user_dict['services']) if isinstance(user_dict['services'], str) else user_dict['services']
    if user_dict.get('specialties'):
        user_dict['specialties'] = json.loads(user_dict['specialties']) if isinstance(user_dict['specialties'], str) else user_dict['specialties']
    
    return User(**user_dict)

# ====== API ENDPOINTS ======

@api_router.get("/")
async def root():
    db = await get_db()
    cursor = await db.execute("SELECT COUNT(*) as count FROM users")
    row = await cursor.fetchone()
    user_count = row[0] if row else 0
    await db.close()
    
    return {
        "message": "Doord API (SQLite) - Running", 
        "status": "active",
        "database": f"SQLite - {user_count} users registered",
        "database_path": DB_PATH
    }

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    db = await get_db()
    
    # Check if user already exists
    cursor = await db.execute("SELECT id FROM users WHERE email = ?", (user_data.email,))
    existing = await cursor.fetchone()
    
    if existing:
        await db.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user ID
    user_id = str(uuid.uuid4())
    
    # Prepare user data
    user_dict = user_data.dict()
    del user_dict["password"]
    
    # Handle services and other array fields as JSON
    services_json = json.dumps(user_dict.get('services', [])) if user_dict.get('services') else None
    specialties_json = json.dumps(user_dict.get('specialties', [])) if user_dict.get('specialties') else None
    
    # Insert user
    await db.execute("""
        INSERT INTO users (
            id, email, password_hash, user_type, name, phone, address,
            business_name, services, description, location, specialties, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        user_data.email,
        hashed_password,
        user_data.user_type,
        user_data.name,
        user_dict.get('phone'),
        user_dict.get('address'),
        user_dict.get('business_name'),
        services_json,
        user_dict.get('description'),
        user_dict.get('location'),
        specialties_json,
        datetime.utcnow().isoformat()
    ))
    
    await db.commit()
    await db.close()
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    # Prepare user response
    user_response = {
        "id": user_id,
        "email": user_data.email,
        "user_type": user_data.user_type,
        "name": user_data.name,
        "phone": user_dict.get('phone'),
        "address": user_dict.get('address'),
        "business_name": user_dict.get('business_name'),
        "services": user_dict.get('services', []),
        "created_at": datetime.utcnow().isoformat()
    }
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@api_router.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    db = await get_db()
    
    # Find user by email
    cursor = await db.execute("SELECT * FROM users WHERE email = ?", (user_credentials.email,))
    row = await cursor.fetchone()
    
    if not row:
        await db.close()
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    user = dict(row)
    
    # Verify password
    if not verify_password(user_credentials.password, user["password_hash"]):
        await db.close()
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    await db.close()
    
    # Parse JSON fields
    if user.get('services'):
        user['services'] = json.loads(user['services']) if isinstance(user['services'], str) else user['services']
    if user.get('specialties'):
        user['specialties'] = json.loads(user['specialties']) if isinstance(user['specialties'], str) else user['specialties']
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"]})
    
    # Return user data without password
    user_data_return = {k: v for k, v in user.items() if k != "password_hash"}
    
    return Token(access_token=access_token, token_type="bearer", user=user_data_return)

@api_router.get("/users/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    user_data = current_user.dict()
    del user_data["password_hash"]
    return user_data

@api_router.get("/providers")
async def get_providers():
    db = await get_db()
    cursor = await db.execute("SELECT * FROM users WHERE user_type = 'provider'")
    rows = await cursor.fetchall()
    await db.close()
    
    providers = []
    for row in rows:
        user_data = dict(row)
        # Remove password hash
        if "password_hash" in user_data:
            del user_data["password_hash"]
        # Parse JSON fields
        if user_data.get('services'):
            user_data['services'] = json.loads(user_data['services']) if isinstance(user_data['services'], str) else user_data['services']
        if user_data.get('specialties'):
            user_data['specialties'] = json.loads(user_data['specialties']) if isinstance(user_data['specialties'], str) else user_data['specialties']
        providers.append(user_data)
    
    return providers

@api_router.get("/services")
async def get_services():
    # Return static services list since no database
    return [
        "Home Cleaning", "Office Cleaning", "Deep Cleaning",
        "Plumbing", "Emergency Plumbing", "Pipe Repair",
        "Electrical", "Wiring", "Electrical Repair",
        "HVAC", "Air Conditioning", "Heating",
        "Landscaping", "Lawn Care", "Garden Maintenance",
        "Handyman", "General Repairs", "Home Maintenance",
        "Painting", "Interior Painting", "Exterior Painting",
        "Roofing", "Roof Repair", "Gutter Cleaning",
        "Window Cleaning", "Pressure Washing", "Car Detailing"
    ]

@api_router.get("/orders")
async def get_orders(current_user: User = Depends(get_current_user)):
    user_orders = []
    for order in orders_storage.values():
        if (order.get("homeowner_id") == current_user.id or 
            order.get("provider_id") == current_user.id):
            user_orders.append(order)
    return user_orders

# ====== AI CHAT ENDPOINTS ======

class AIChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class AIChatResponse(BaseModel):
    response: str
    session_id: str

@api_router.post("/ai/chat", response_model=AIChatResponse)
async def ai_chat(chat_message: AIChatMessage):
    """Send a message to AI assistant and get response"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    # Generate or use existing session ID
    session_id = chat_message.session_id or str(uuid.uuid4())
    
    # System message for Doord marketplace context
    system_message = """You are Doord's AI assistant, helping homeowners and service providers in the home services marketplace.

Your role:
1. Help homeowners find the right service providers (Electrician, Plumber, HVAC, Handyman, Home Cleaning, Office Cleaning, Window Cleaning, Pressure Washing, Gutter Cleaning, Landscaping, Lawn Mowing, Car Detailing, Painting, etc.)
2. Ask clarifying questions about their service needs (budget, location, urgency, specific requirements)
3. Guide them through the booking process
4. If you don't know specific pricing, say: "Pricing varies by project scope. I can connect you with professionals who will provide accurate quotes after evaluating your needs."
5. Be conversational, helpful, and guide users to the browse services page when appropriate

Available Services:
- Home Maintenance: Electrician, Plumber, HVAC, Handyman, Carpenter, Painter
- Cleaning: Home Cleaning, Office Cleaning, Window Cleaning, Pressure Washing, Gutter Cleaning
- Outdoor: Landscaping, Lawn Mowing, Snow Removal
- Other: Car Detailing, Roofing, Pest Control, Appliance Repair, Junk Removal

Keep responses concise and actionable. Always be helpful and professional."""
    
    try:
        # Initialize LLM chat
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=session_id,
            system_message=system_message
        ).with_model("gemini", "gemini-2.0-flash-exp")
        
        # Create user message
        user_message = UserMessage(text=chat_message.message)
        
        # Get AI response
        ai_response = await chat.send_message(user_message)
        
        # Store in SQLite database
        db = await get_db()
        await db.execute("""
            INSERT INTO ai_chats (session_id, role, content, timestamp)
            VALUES (?, ?, ?, ?)
        """, (session_id, "user", chat_message.message, datetime.utcnow().isoformat()))
        
        await db.execute("""
            INSERT INTO ai_chats (session_id, role, content, timestamp)
            VALUES (?, ?, ?, ?)
        """, (session_id, "assistant", ai_response, datetime.utcnow().isoformat()))
        
        await db.commit()
        await db.close()
        
        return AIChatResponse(response=ai_response, session_id=session_id)
        
    except Exception as e:
        logging.error(f"AI chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")

@api_router.get("/ai/history/{session_id}")
async def get_ai_chat_history(session_id: str, limit: Optional[int] = 50):
    """Get chat history for a session"""
    db = await get_db()
    
    query = "SELECT role, content, timestamp FROM ai_chats WHERE session_id = ? ORDER BY timestamp DESC"
    if limit:
        query += f" LIMIT {limit}"
    
    cursor = await db.execute(query, (session_id,))
    rows = await cursor.fetchall()
    await db.close()
    
    messages = [{"role": row[0], "content": row[1], "timestamp": row[2]} for row in reversed(rows)]
    return {"messages": messages}

@api_router.delete("/ai/history/{session_id}")
async def clear_ai_chat_history(session_id: str):
    """Clear chat history for a session"""
    db = await get_db()
    await db.execute("DELETE FROM ai_chats WHERE session_id = ?", (session_id,))
    await db.commit()
    await db.close()
    return {"message": "Chat history cleared"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)