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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# NO DATABASE - ALL MONGODB CODE REMOVED
# In-memory storage (data will be lost on restart)
users_storage = {}
orders_storage = {}
messages_storage = {}
appointments_storage = {}
ai_chat_storage = {}  # {session_id: [{"role": "user/assistant", "content": "...", "timestamp": "..."}]}

# JWT settings
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60  # 24 hours

# Create the main app without a prefix
app = FastAPI(title="Doord API (No Database)", description="Home Services Marketplace API - No Database Version")

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
    
    # Get user from in-memory storage
    user = users_storage.get(user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

# ====== API ENDPOINTS ======

@api_router.get("/")
async def root():
    return {
        "message": "Doord API (No Database Version) - Running", 
        "status": "active",
        "database": "DISCONNECTED - In-memory storage only",
        "warning": "All data will be lost on server restart"
    }

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = None
    for stored_user in users_storage.values():
        if stored_user["email"] == user_data.email:
            existing_user = stored_user
            break
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user_dict = user_data.dict()
    user_dict["password_hash"] = hashed_password
    del user_dict["password"]
    
    user = User(**user_dict)
    
    # Store in memory
    users_storage[user.id] = user.dict()
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    # Return user data without password
    user_data_return = user.dict()
    del user_data_return["password_hash"]
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data_return
    }

@api_router.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    # Find user by email
    user = None
    for stored_user in users_storage.values():
        if stored_user["email"] == user_credentials.email:
            user = stored_user
            break
    
    if not user or not verify_password(user_credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"]})
    
    # Return user data without password
    user_data_return = user.copy()
    del user_data_return["password_hash"]
    
    return {
        "access_token": access_token,
        "token_type": "bearer", 
        "user": user_data_return
    }

@api_router.get("/users/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    user_data = current_user.dict()
    del user_data["password_hash"]
    return user_data

@api_router.get("/providers")
async def get_providers():
    providers = []
    for user_data in users_storage.values():
        if user_data.get("user_type") == "provider":
            user_copy = user_data.copy()
            if "password_hash" in user_copy:
                del user_copy["password_hash"]
            providers.append(user_copy)
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