from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import sys
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

print("DOORD SERVER LOADING - VERSION 2", file=sys.stderr, flush=True)

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
    business_name: Optional[str] = None
    services: Optional[List[str]] = []
    description: Optional[str] = None
    location: Optional[str] = None
    specialties: Optional[List[str]] = []
    rating: Optional[float] = 5.0
    reviews: Optional[int] = 0
    completed_jobs: Optional[int] = 0
    response_time: Optional[str] = None
    year_established: Optional[str] = None
    price_range: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[str] = None
    is_active: bool = True
    pm_code: Optional[str] = None
    
    class Config:
        extra = 'ignore'  # Ignore any extra fields from DB

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    user_type: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    business_name: Optional[str] = None
    services: Optional[List[str]] = []
    description: Optional[str] = None
    location: Optional[str] = None
    specialties: Optional[List[str]] = []
    pm_code: Optional[str] = None

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

@api_router.get("/debug/threads/{user_id}")
async def debug_threads(user_id: str):
    """Debug endpoint to test thread query"""
    db = await get_db()
    
    cursor = await db.execute("""
        SELECT DISTINCT conversation_id, sender_id, recipient_id, message, MAX(timestamp) as last_message_time
        FROM messages
        WHERE sender_id = ? OR recipient_id = ?
        GROUP BY conversation_id
        ORDER BY last_message_time DESC
    """, (user_id, user_id))
    
    rows = await cursor.fetchall()
    await db.close()
    
    return {
        "user_id": user_id,
        "thread_count": len(rows),
        "threads": [dict(row) for row in rows]
    }

@api_router.get("/debug/current-user")
async def debug_current_user(current_user: User = Depends(get_current_user)):
    """Debug endpoint to check current user"""
    return {
        "user_id": current_user.id,
        "user_email": current_user.email,
        "user_name": current_user.name,
        "user_type": current_user.user_type
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

@api_router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile - alias for /users/me"""
    db = await get_db()
    cursor = await db.execute("SELECT * FROM users WHERE id = ?", (current_user.id,))
    row = await cursor.fetchone()
    await db.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = dict(row)
    # Remove password hash
    if "password_hash" in user_data:
        del user_data["password_hash"]
    
    # Parse JSON fields
    if user_data.get('services'):
        user_data['services'] = json.loads(user_data['services']) if isinstance(user_data['services'], str) else user_data['services']
    if user_data.get('specialties'):
        user_data['specialties'] = json.loads(user_data['specialties']) if isinstance(user_data['specialties'], str) else user_data['specialties']
    
    return user_data

@api_router.get("/auth/me")
async def get_auth_me(current_user: User = Depends(get_current_user)):
    """Get current user profile - alias for compatibility"""
    db = await get_db()
    cursor = await db.execute("SELECT * FROM users WHERE id = ?", (current_user.id,))
    row = await cursor.fetchone()
    await db.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = dict(row)
    # Remove password hash
    if "password_hash" in user_data:
        del user_data["password_hash"]
    
    # Parse JSON fields
    if user_data.get('services'):
        user_data['services'] = json.loads(user_data['services']) if isinstance(user_data['services'], str) else user_data['services']
    if user_data.get('specialties'):
        user_data['specialties'] = json.loads(user_data['specialties']) if isinstance(user_data['specialties'], str) else user_data['specialties']
    
    return user_data

@api_router.get("/users/{user_id}")
async def get_user_by_id(user_id: str):
    """Get a user by ID (public info only)"""
    db = await get_db()
    cursor = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = await cursor.fetchone()
    await db.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = dict(row)
    # Remove sensitive data
    if "password_hash" in user_data:
        del user_data["password_hash"]
    
    # Parse JSON fields
    if user_data.get('services'):
        user_data['services'] = json.loads(user_data['services']) if isinstance(user_data['services'], str) else user_data['services']
    if user_data.get('specialties'):
        user_data['specialties'] = json.loads(user_data['specialties']) if isinstance(user_data['specialties'], str) else user_data['specialties']
    
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

@api_router.get("/providers/{provider_id}")
async def get_provider_by_id(provider_id: str):
    """Get a single provider by ID"""
    db = await get_db()
    cursor = await db.execute("SELECT * FROM users WHERE id = ? AND user_type = 'provider'", (provider_id,))
    row = await cursor.fetchone()
    await db.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    user_data = dict(row)
    # Remove password hash
    if "password_hash" in user_data:
        del user_data["password_hash"]
    
    # Parse JSON fields
    if user_data.get('services'):
        user_data['services'] = json.loads(user_data['services']) if isinstance(user_data['services'], str) else user_data['services']
    if user_data.get('specialties'):
        user_data['specialties'] = json.loads(user_data['specialties']) if isinstance(user_data['specialties'], str) else user_data['specialties']
    
    return user_data

@api_router.put("/providers/profile")
async def update_provider_profile(
    profile_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Update provider profile"""
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Only providers can update provider profiles")
    
    db = await get_db()
    
    # Prepare update fields
    update_fields = []
    update_values = []
    
    allowed_fields = ['business_name', 'description', 'location', 'phone', 'address', 
                     'services', 'specialties', 'price_range', 'year_established', 'response_time']
    
    for field in allowed_fields:
        if field in profile_data:
            update_fields.append(f"{field} = ?")
            # Handle JSON fields
            if field in ['services', 'specialties']:
                update_values.append(json.dumps(profile_data[field]) if profile_data[field] else None)
            else:
                update_values.append(profile_data[field])
    
    if not update_fields:
        await db.close()
        return {"message": "No fields to update"}
    
    # Add updated_at timestamp
    update_fields.append("updated_at = ?")
    update_values.append(datetime.utcnow().isoformat())
    
    # Add user ID for WHERE clause
    update_values.append(current_user.id)
    
    # Execute update
    query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
    await db.execute(query, tuple(update_values))
    await db.commit()
    
    # Fetch updated user
    cursor = await db.execute("SELECT * FROM users WHERE id = ?", (current_user.id,))
    row = await cursor.fetchone()
    await db.close()
    
    if row:
        user_data = dict(row)
        if "password_hash" in user_data:
            del user_data["password_hash"]
        # Parse JSON fields
        if user_data.get('services'):
            user_data['services'] = json.loads(user_data['services']) if isinstance(user_data['services'], str) else user_data['services']
        if user_data.get('specialties'):
            user_data['specialties'] = json.loads(user_data['specialties']) if isinstance(user_data['specialties'], str) else user_data['specialties']
        return {"message": "Profile updated successfully", "user": user_data}
    
    raise HTTPException(status_code=500, detail="Failed to fetch updated profile")

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
    db = await get_db()
    
    # Get orders where user is either homeowner or provider
    cursor = await db.execute("""
        SELECT o.*, 
               h.name as homeowner_name, h.email as homeowner_email, h.phone as homeowner_phone, h.address as homeowner_address,
               p.name as provider_owner_name, p.business_name as provider_name, p.email as provider_email, p.phone as provider_phone
        FROM orders o
        LEFT JOIN users h ON o.homeowner_id = h.id
        LEFT JOIN users p ON o.provider_id = p.id
        WHERE o.homeowner_id = ? OR o.provider_id = ?
        ORDER BY o.created_at DESC
    """, (current_user.id, current_user.id))
    
    rows = await cursor.fetchall()
    await db.close()
    
    orders = []
    for row in rows:
        order_dict = dict(row)
        # Use business_name for provider if available
        if order_dict.get('provider_name'):
            order_dict['provider_name'] = order_dict['provider_name']
        elif order_dict.get('provider_owner_name'):
            order_dict['provider_name'] = order_dict['provider_owner_name']
        orders.append(order_dict)
    
    return orders

class OrderCreate(BaseModel):
    provider_id: str
    service: str
    description: Optional[str] = None
    amount: Optional[float] = None

@api_router.post("/orders")
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    """Create a new order/quotation request"""
    db = await get_db()
    
    # Verify provider exists
    cursor = await db.execute("SELECT id FROM users WHERE id = ? AND user_type = 'provider'", (order_data.provider_id,))
    provider = await cursor.fetchone()
    
    if not provider:
        await db.close()
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Create order
    order_id = str(uuid.uuid4())
    await db.execute("""
        INSERT INTO orders (
            id, homeowner_id, provider_id, service, description, status, amount, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        order_id,
        current_user.id,
        order_data.provider_id,
        order_data.service,
        order_data.description,
        'pending',
        order_data.amount,
        datetime.utcnow().isoformat(),
        datetime.utcnow().isoformat()
    ))
    
    await db.commit()
    await db.close()
    
    return {
        "message": "Quotation request sent successfully",
        "order_id": order_id,
        "status": "pending"
    }

@api_router.post("/quotations")
async def create_quotation(quotation_data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    """Create a new quotation request (alias for orders)"""
    db = await get_db()
    
    provider_id = quotation_data.get('provider_id')
    if not provider_id:
        raise HTTPException(status_code=400, detail="provider_id is required")
    
    # Verify provider exists
    cursor = await db.execute("SELECT id FROM users WHERE id = ? AND user_type = 'provider'", (provider_id,))
    provider = await cursor.fetchone()
    
    if not provider:
        await db.close()
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Create order
    order_id = str(uuid.uuid4())
    service_name = quotation_data.get('service_type', '') or ', '.join(quotation_data.get('services', []))
    
    await db.execute("""
        INSERT INTO orders (
            id, homeowner_id, provider_id, service, description, status, amount, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        order_id,
        current_user.id,
        provider_id,
        service_name,
        quotation_data.get('description', ''),
        'pending',
        None,  # Amount will be filled by provider
        datetime.utcnow().isoformat(),
        datetime.utcnow().isoformat()
    ))
    
    await db.commit()
    await db.close()
    
    return {
        "message": "Quotation request sent successfully",
        "order_id": order_id,
        "status": "pending",
        "id": order_id  # For compatibility
    }

@api_router.put("/orders/{order_id}")
async def update_order_status(
    order_id: str,
    status: str,
    current_user: User = Depends(get_current_user)
):
    """Update order status (for providers)"""
    db = await get_db()
    
    # Verify order exists and user is the provider
    cursor = await db.execute("""
        SELECT provider_id FROM orders WHERE id = ?
    """, (order_id,))
    order = await cursor.fetchone()
    
    if not order:
        await db.close()
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order[0] != current_user.id:
        await db.close()
        raise HTTPException(status_code=403, detail="Not authorized to update this order")
    
    # Update status
    await db.execute("""
        UPDATE orders SET status = ?, updated_at = ? WHERE id = ?
    """, (status, datetime.utcnow().isoformat(), order_id))
    
    await db.commit()
    await db.close()
    
    return {"message": "Order status updated", "status": status}

# ====== MESSAGES/CONVERSATIONS ======

class MessageCreate(BaseModel):
    recipient_id: str
    message: str

@api_router.post("/messages")
async def send_message(message_data: MessageCreate, current_user: User = Depends(get_current_user)):
    """Send a message to another user"""
    db = await get_db()
    
    # Verify recipient exists
    cursor = await db.execute("SELECT id FROM users WHERE id = ?", (message_data.recipient_id,))
    recipient = await cursor.fetchone()
    
    if not recipient:
        await db.close()
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # Generate conversation_id (sorted IDs for consistency)
    ids = sorted([current_user.id, message_data.recipient_id])
    conversation_id = f"{ids[0]}_{ids[1]}"
    
    # Create message
    message_id = str(uuid.uuid4())
    await db.execute("""
        INSERT INTO messages (
            id, conversation_id, sender_id, recipient_id, message, timestamp, is_read
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        message_id,
        conversation_id,
        current_user.id,
        message_data.recipient_id,
        message_data.message,
        datetime.utcnow().isoformat(),
        0
    ))
    
    await db.commit()
    await db.close()
    
    return {
        "message": "Message sent successfully",
        "message_id": message_id,
        "conversation_id": conversation_id
    }

# ====== MESSAGE THREADS API (Frontend compatibility) - MUST BE BEFORE {conversation_id} ======

class ThreadCreate(BaseModel):
    homeowner_id: Optional[str] = None
    provider_id: str
    homeowner_name: Optional[str] = None
    provider_name: Optional[str] = None
    order_type: Optional[str] = None
    last_message: Optional[str] = None
    last_message_time: Optional[str] = None

@api_router.post("/messages/threads")
async def create_message_thread(thread_data: ThreadCreate, current_user: User = Depends(get_current_user)):
    """Create a new message thread between homeowner and provider"""
    db = await get_db()
    
    provider_id = thread_data.provider_id
    
    # Verify provider exists
    cursor = await db.execute("SELECT id, name, business_name FROM users WHERE id = ? AND user_type = 'provider'", (provider_id,))
    provider = await cursor.fetchone()
    
    if not provider:
        await db.close()
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Generate conversation_id (sorted IDs for consistency)
    ids = sorted([current_user.id, provider_id])
    conversation_id = f"{ids[0]}_{ids[1]}"
    
    # Check if conversation already exists
    cursor = await db.execute("SELECT id FROM messages WHERE conversation_id = ? LIMIT 1", (conversation_id,))
    existing = await cursor.fetchone()
    
    # Create initial message if no conversation exists
    if not existing:
        initial_message = thread_data.last_message or f"New conversation started"
        message_id = str(uuid.uuid4())
        await db.execute("""
            INSERT INTO messages (
                id, conversation_id, sender_id, recipient_id, message, timestamp, is_read
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            message_id,
            conversation_id,
            current_user.id,
            provider_id,
            initial_message,
            datetime.utcnow().isoformat(),
            0
        ))
        await db.commit()
    
    provider_name = provider[2] if provider[2] else provider[1]
    
    await db.close()
    
    return {
        "id": conversation_id,
        "conversation_id": conversation_id,
        "homeowner_id": current_user.id,
        "provider_id": provider_id,
        "provider_name": provider_name,
        "homeowner_name": current_user.name,
        "last_message": thread_data.last_message or "New conversation started",
        "last_message_time": datetime.utcnow().isoformat()
    }

@api_router.get("/messages/threads")
async def get_message_threads(current_user: User = Depends(get_current_user)):
    """Get all message threads for current user"""
    user_id = current_user.id
    
    db = await get_db()
    
    cursor = await db.execute("""
        SELECT DISTINCT conversation_id, sender_id, recipient_id, message, MAX(timestamp) as last_message_time
        FROM messages
        WHERE sender_id = ? OR recipient_id = ?
        GROUP BY conversation_id
        ORDER BY last_message_time DESC
    """, (user_id, user_id))
    
    rows = await cursor.fetchall()
    
    threads = []
    for row in rows:
        conv_id = row[0]
        sender = row[1]
        recipient = row[2]
        other_user_id = recipient if sender == user_id else sender
        
        # Get other user info
        user_cursor = await db.execute("SELECT id, name, business_name, user_type FROM users WHERE id = ?", (other_user_id,))
        user_info = await user_cursor.fetchone()
        
        # Count unread messages
        unread_cursor = await db.execute("""
            SELECT COUNT(*) FROM messages 
            WHERE conversation_id = ? AND recipient_id = ? AND is_read = 0
        """, (conv_id, user_id))
        unread_result = await unread_cursor.fetchone()
        unread_count = unread_result[0] if unread_result else 0
        
        if user_info:
            other_user_name = user_info[2] if user_info[2] else user_info[1]
            other_user_type = user_info[3]
            
            thread = {
                "id": conv_id,
                "conversation_id": conv_id,
                "last_message": row[3],
                "last_message_time": row[4],
                "unread_count": unread_count
            }
            
            if other_user_type == "provider":
                thread["provider_id"] = other_user_id
                thread["provider_name"] = other_user_name
                thread["homeowner_id"] = user_id
                thread["homeowner_name"] = current_user.name
            else:
                thread["homeowner_id"] = other_user_id
                thread["homeowner_name"] = other_user_name
                thread["provider_id"] = user_id
                thread["provider_name"] = current_user.business_name or current_user.name
            
            threads.append(thread)
    
    await db.close()
    return threads

@api_router.get("/conversations")
async def get_conversations(current_user: User = Depends(get_current_user)):
    """Get all conversations for current user"""
    db = await get_db()
    
    cursor = await db.execute("""
        SELECT DISTINCT conversation_id, sender_id, recipient_id, MAX(timestamp) as last_message_time
        FROM messages
        WHERE sender_id = ? OR recipient_id = ?
        GROUP BY conversation_id
        ORDER BY last_message_time DESC
    """, (current_user.id, current_user.id))
    
    rows = await cursor.fetchall()
    
    conversations = []
    for row in rows:
        conv_id = row[0]
        other_user_id = row[2] if row[1] == current_user.id else row[1]
        
        # Get other user info
        user_cursor = await db.execute("SELECT name, business_name FROM users WHERE id = ?", (other_user_id,))
        user_info = await user_cursor.fetchone()
        
        # Count unread messages
        unread_cursor = await db.execute("""
            SELECT COUNT(*) FROM messages 
            WHERE conversation_id = ? AND recipient_id = ? AND is_read = 0
        """, (conv_id, current_user.id))
        unread_count = unread_cursor.fetchone()[0]
        
        conversations.append({
            "conversation_id": conv_id,
            "other_user_id": other_user_id,
            "other_user_name": user_info[1] if user_info[1] else user_info[0],
            "last_message_time": row[3],
            "unread_count": unread_count
        })
    
    await db.close()
    return conversations

@api_router.get("/messages/{conversation_id}")
async def get_conversation_messages(conversation_id: str, current_user: User = Depends(get_current_user)):
    """Get all messages in a conversation"""
    db = await get_db()
    
    # Mark messages as read
    await db.execute("""
        UPDATE messages SET is_read = 1 
        WHERE conversation_id = ? AND recipient_id = ?
    """, (conversation_id, current_user.id))
    await db.commit()
    
    # Get messages
    cursor = await db.execute("""
        SELECT id, sender_id, recipient_id, message, timestamp, is_read
        FROM messages
        WHERE conversation_id = ?
        ORDER BY timestamp ASC
    """, (conversation_id,))
    
    rows = await cursor.fetchall()
    await db.close()
    
    messages = []
    for row in rows:
        messages.append({
            "id": row[0],
            "sender_id": row[1],
            "recipient_id": row[2],
            "message": row[3],
            "timestamp": row[4],
            "is_read": row[5]
        })
    
    return messages

# ====== MESSAGE THREADS API (Frontend compatibility) ======

class ThreadCreate(BaseModel):
    homeowner_id: Optional[str] = None
    provider_id: str
    homeowner_name: Optional[str] = None
    provider_name: Optional[str] = None
    order_type: Optional[str] = None
    last_message: Optional[str] = None
    last_message_time: Optional[str] = None

@api_router.post("/messages/threads")
async def create_message_thread(thread_data: ThreadCreate, current_user: User = Depends(get_current_user)):
    """Create a new message thread between homeowner and provider"""
    db = await get_db()
    
    provider_id = thread_data.provider_id
    
    # Verify provider exists
    cursor = await db.execute("SELECT id, name, business_name FROM users WHERE id = ? AND user_type = 'provider'", (provider_id,))
    provider = await cursor.fetchone()
    
    if not provider:
        await db.close()
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Generate conversation_id (sorted IDs for consistency)
    ids = sorted([current_user.id, provider_id])
    conversation_id = f"{ids[0]}_{ids[1]}"
    
    # Check if conversation already exists
    cursor = await db.execute("SELECT id FROM messages WHERE conversation_id = ? LIMIT 1", (conversation_id,))
    existing = await cursor.fetchone()
    
    # Create initial message if no conversation exists
    if not existing:
        initial_message = thread_data.last_message or f"New conversation started"
        message_id = str(uuid.uuid4())
        await db.execute("""
            INSERT INTO messages (
                id, conversation_id, sender_id, recipient_id, message, timestamp, is_read
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            message_id,
            conversation_id,
            current_user.id,
            provider_id,
            initial_message,
            datetime.utcnow().isoformat(),
            0
        ))
        await db.commit()
    
    provider_name = provider[2] if provider[2] else provider[1]
    
    await db.close()
    
    return {
        "id": conversation_id,
        "conversation_id": conversation_id,
        "homeowner_id": current_user.id,
        "provider_id": provider_id,
        "provider_name": provider_name,
        "homeowner_name": current_user.name,
        "last_message": thread_data.last_message or "New conversation started",
        "last_message_time": datetime.utcnow().isoformat()
    }

@api_router.get("/messages/threads")
async def get_message_threads(current_user: User = Depends(get_current_user)):
    """Get all message threads for current user (alias for conversations)"""
    user_id = current_user.id
    
    db = await get_db()
    
    cursor = await db.execute("""
        SELECT DISTINCT conversation_id, sender_id, recipient_id, message, MAX(timestamp) as last_message_time
        FROM messages
        WHERE sender_id = ? OR recipient_id = ?
        GROUP BY conversation_id
        ORDER BY last_message_time DESC
    """, (user_id, user_id))
    
    rows = await cursor.fetchall()
    
    # Debug: return raw info about what we got
    return {
        "debug": True,
        "user_id": user_id,
        "user_id_type": str(type(user_id)),
        "rows_type": str(type(rows)),
        "rows_len": len(rows) if rows else 0,
        "rows_repr": repr(rows)[:500] if rows else "None"
    }

# ====== APPOINTMENTS API ======

class AppointmentCreate(BaseModel):
    customer_name: str
    phone_number: Optional[str] = None
    service_type: str
    services: Optional[List[str]] = []
    date: str
    time: str
    address: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[str] = "manual"
    order_id: Optional[str] = None

@api_router.post("/appointments")
async def create_appointment(appointment_data: AppointmentCreate, current_user: User = Depends(get_current_user)):
    """Create a new appointment (providers only)"""
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Only providers can create appointments")
    
    db = await get_db()
    
    appointment_id = str(uuid.uuid4())
    services_json = json.dumps(appointment_data.services) if appointment_data.services else None
    
    await db.execute("""
        INSERT INTO appointments (
            id, provider_id, customer_name, phone_number, service_type, services,
            date, time, address, notes, source, order_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        appointment_id,
        current_user.id,
        appointment_data.customer_name,
        appointment_data.phone_number,
        appointment_data.service_type,
        services_json,
        appointment_data.date,
        appointment_data.time,
        appointment_data.address,
        appointment_data.notes,
        appointment_data.source,
        appointment_data.order_id,
        datetime.utcnow().isoformat()
    ))
    
    await db.commit()
    await db.close()
    
    return {
        "id": appointment_id,
        "message": "Appointment created successfully",
        **appointment_data.dict()
    }

@api_router.get("/appointments")
async def get_appointments(current_user: User = Depends(get_current_user)):
    """Get all appointments for current provider"""
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Only providers can access appointments")
    
    db = await get_db()
    
    cursor = await db.execute("""
        SELECT * FROM appointments 
        WHERE provider_id = ?
        ORDER BY date ASC, time ASC
    """, (current_user.id,))
    
    rows = await cursor.fetchall()
    await db.close()
    
    appointments = []
    for row in rows:
        apt = dict(row)
        if apt.get('services'):
            apt['services'] = json.loads(apt['services']) if isinstance(apt['services'], str) else apt['services']
        appointments.append(apt)
    
    return appointments

@api_router.put("/appointments/{appointment_id}")
async def update_appointment(
    appointment_id: str,
    update_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Update an appointment"""
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Only providers can update appointments")
    
    db = await get_db()
    
    # Verify appointment exists and belongs to provider
    cursor = await db.execute("SELECT provider_id FROM appointments WHERE id = ?", (appointment_id,))
    appointment = await cursor.fetchone()
    
    if not appointment:
        await db.close()
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment[0] != current_user.id:
        await db.close()
        raise HTTPException(status_code=403, detail="Not authorized to update this appointment")
    
    # Build update query
    allowed_fields = ['customer_name', 'phone_number', 'service_type', 'services', 'date', 'time', 'address', 'notes']
    update_fields = []
    update_values = []
    
    for field in allowed_fields:
        if field in update_data:
            update_fields.append(f"{field} = ?")
            if field == 'services':
                update_values.append(json.dumps(update_data[field]) if update_data[field] else None)
            else:
                update_values.append(update_data[field])
    
    if not update_fields:
        await db.close()
        return {"message": "No fields to update"}
    
    update_values.append(appointment_id)
    
    await db.execute(f"UPDATE appointments SET {', '.join(update_fields)} WHERE id = ?", tuple(update_values))
    await db.commit()
    await db.close()
    
    return {"message": "Appointment updated successfully"}

@api_router.get("/notifications/count")
async def get_notification_counts(current_user: User = Depends(get_current_user)):
    """Get unread message and order counts"""
    db = await get_db()
    
    # Count unread messages
    cursor = await db.execute("""
        SELECT COUNT(*) FROM messages WHERE recipient_id = ? AND is_read = 0
    """, (current_user.id,))
    unread_messages = cursor.fetchone()[0]
    
    # Count pending orders (for providers)
    if current_user.user_type == "provider":
        cursor = await db.execute("""
            SELECT COUNT(*) FROM orders WHERE provider_id = ? AND status = 'pending'
        """, (current_user.id,))
        pending_orders = cursor.fetchone()[0]
    else:
        pending_orders = 0
    
    await db.close()
    
    return {
        "unread_messages": unread_messages,
        "pending_orders": pending_orders,
        "total": unread_messages + pending_orders
    }

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