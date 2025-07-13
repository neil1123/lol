from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
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

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT settings
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60  # 24 hours

# Create the main app without a prefix
app = FastAPI(title="Doord API", description="Home Services Marketplace API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ====== DATABASE MODELS ======

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    user_type: str  # "provider" or "homeowner"
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    
    # Provider specific fields
    business_name: Optional[str] = None
    services: Optional[List[str]] = None
    license: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[float] = 5.0
    reviews: Optional[int] = 0
    completed_jobs: Optional[int] = 0
    location: Optional[str] = "Halifax, NS"
    response_time: Optional[str] = "Usually responds within 1 hour"
    year_established: Optional[str] = "2024"
    specialties: Optional[List[str]] = None
    price_range: Optional[str] = "$50-$500"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    user_type: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    business_name: Optional[str] = None
    services: Optional[List[str]] = None
    license: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    homeowner_id: str
    provider_id: str
    homeowner_name: str
    homeowner_email: str
    homeowner_phone: str
    homeowner_address: str
    provider_name: str
    service_type: str
    description: str
    quotation_amount: Optional[float] = None
    order_details: Optional[str] = None
    priority: str = "medium"
    status: str = "pending_quotation"
    request_date: datetime = Field(default_factory=datetime.utcnow)
    scheduled_date: Optional[str] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    urgency: Optional[str] = None
    budget: Optional[str] = None
    property_size: Optional[str] = None
    additional_requirements: Optional[str] = None

class OrderCreate(BaseModel):
    homeowner_id: str
    provider_id: str
    homeowner_name: str
    homeowner_email: str
    homeowner_phone: str
    homeowner_address: str
    provider_name: str
    service_type: str
    description: str
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    urgency: Optional[str] = "medium"
    budget: Optional[str] = None
    property_size: Optional[str] = None
    additional_requirements: Optional[str] = None

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    thread_id: str
    sender_id: str
    sender_type: str  # "provider" or "homeowner"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    read: bool = False

class MessageThread(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    homeowner_id: str
    provider_id: str
    homeowner_name: str
    provider_name: str
    order_id: Optional[str] = None
    order_type: str
    last_message: str
    last_message_time: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Appointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    provider_id: str
    customer_name: str
    phone_number: str
    service_type: str
    date: str
    time: str
    address: str
    notes: Optional[str] = None
    order_id: Optional[str] = None
    source: Optional[str] = "manual"
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ====== UTILITY FUNCTIONS ======

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
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

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
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()