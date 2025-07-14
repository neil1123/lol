from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
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
import ssl

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# MongoDB connection with SSL context configuration for OpenSSL 3.0 compatibility
mongo_url = os.environ['MONGO_URL']

# Create SSL context to work around OpenSSL 3.0 compatibility issues
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Configure client with SSL context
client = AsyncIOMotorClient(
    mongo_url,
    ssl_context=ssl_context,
    serverSelectionTimeoutMS=10000,
    connectTimeoutMS=10000,
    maxPoolSize=50,
    minPoolSize=10
)
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
    return {"message": "Doord API - Home Services Marketplace"}

# ====== AUTHENTICATION ENDPOINTS ======

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user object
    user_dict = user_data.dict()
    del user_dict["password"]
    user_dict["password_hash"] = hashed_password
    
    # Add provider-specific fields if provider
    if user_data.user_type == "provider":
        user_dict.update({
            "description": f"Professional {', '.join(user_data.services or [])} services",
            "rating": 5.0,
            "reviews": 0,
            "completed_jobs": 0,
            "location": "Halifax, NS",
            "response_time": "Usually responds within 1 hour",
            "year_established": "2024",
            "specialties": ["Professional service", "Quality work", "Customer satisfaction"],
            "price_range": "$50-$500"
        })
    
    user = User(**user_dict)
    
    # Save to database
    await db.users.insert_one(user.dict())
    
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
    # Find user
    user_doc = await db.users.find_one({"email": user_credentials.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = User(**user_doc)
    
    # Verify password
    if not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
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

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# ====== PROVIDER ENDPOINTS ======

@api_router.get("/providers", response_model=List[Dict[str, Any]])
async def get_all_providers():
    providers = await db.users.find({"user_type": "provider", "is_active": True}).to_list(1000)
    # Remove MongoDB _id and password_hash from response
    for provider in providers:
        if "_id" in provider:
            del provider["_id"]
        if "password_hash" in provider:
            del provider["password_hash"]
    return providers

@api_router.get("/providers/{provider_id}", response_model=Dict[str, Any])
async def get_provider(provider_id: str):
    provider = await db.users.find_one({"id": provider_id, "user_type": "provider"})
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    if "_id" in provider:
        del provider["_id"]
    if "password_hash" in provider:
        del provider["password_hash"]
    return provider

# ====== ORDER ENDPOINTS ======

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    order = Order(**order_data.dict())
    await db.orders.insert_one(order.dict())
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: User = Depends(get_current_user)):
    if current_user.user_type == "provider":
        orders = await db.orders.find({"provider_id": current_user.id}).to_list(1000)
    else:  # homeowner
        orders = await db.orders.find({"homeowner_id": current_user.id}).to_list(1000)
    
    return [Order(**order) for order in orders]

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: User = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if user has access to this order
    if (current_user.user_type == "provider" and order["provider_id"] != current_user.id) or \
       (current_user.user_type == "homeowner" and order["homeowner_id"] != current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return Order(**order)

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str = Query(...), current_user: User = Depends(get_current_user)):
    # Get the order first to check ownership
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check permissions based on user type
    if current_user.user_type == "provider":
        # Providers can update orders assigned to them with any valid status
        if order["provider_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Update the order status
        result = await db.orders.update_one(
            {"id": order_id, "provider_id": current_user.id},
            {"$set": {"status": status}}
        )
    elif current_user.user_type == "homeowner":
        # Homeowners can only update their own orders and only to accept/decline
        if order["homeowner_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Homeowners can only accept or decline quotes
        if status not in ["accepted", "declined"]:
            raise HTTPException(status_code=400, detail="Homeowners can only accept or decline quotes")
        
        # Update the order status
        result = await db.orders.update_one(
            {"id": order_id, "homeowner_id": current_user.id},
            {"$set": {"status": status}}
        )
    else:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated"}

# ====== MESSAGE ENDPOINTS ======

@api_router.post("/messages/threads", response_model=MessageThread)
async def create_message_thread(thread_data: MessageThread, current_user: User = Depends(get_current_user)):
    await db.message_threads.insert_one(thread_data.dict())
    return thread_data

@api_router.get("/messages/threads", response_model=List[MessageThread])
async def get_message_threads(current_user: User = Depends(get_current_user)):
    if current_user.user_type == "provider":
        threads = await db.message_threads.find({"provider_id": current_user.id}).to_list(1000)
    else:  # homeowner
        threads = await db.message_threads.find({"homeowner_id": current_user.id}).to_list(1000)
    
    return [MessageThread(**thread) for thread in threads]

@api_router.post("/messages", response_model=Message)
async def send_message(message_data: Message, current_user: User = Depends(get_current_user)):
    message_data.sender_id = current_user.id
    message_data.sender_type = current_user.user_type
    
    await db.messages.insert_one(message_data.dict())
    
    # Update thread's last message
    await db.message_threads.update_one(
        {"id": message_data.thread_id},
        {"$set": {
            "last_message": message_data.content,
            "last_message_time": message_data.timestamp
        }}
    )
    
    return message_data

@api_router.get("/messages/{thread_id}", response_model=List[Message])
async def get_messages(thread_id: str, current_user: User = Depends(get_current_user)):
    messages = await db.messages.find({"thread_id": thread_id}).sort("timestamp", 1).to_list(1000)
    return [Message(**message) for message in messages]

# ====== APPOINTMENT ENDPOINTS ======

@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment_data: Appointment, current_user: User = Depends(get_current_user)):
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Only providers can create appointments")
    
    appointment_data.provider_id = current_user.id
    await db.appointments.insert_one(appointment_data.dict())
    return appointment_data

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments(current_user: User = Depends(get_current_user)):
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Only providers can view appointments")
    
    appointments = await db.appointments.find({"provider_id": current_user.id}).to_list(1000)
    return [Appointment(**appointment) for appointment in appointments]

# ====== QUOTATION REQUEST ENDPOINT ======

@api_router.post("/quotations", response_model=Dict[str, str])
async def create_quotation_request(order_data: OrderCreate):
    # Create order
    order = Order(**order_data.dict())
    await db.orders.insert_one(order.dict())
    
    # Create message thread
    thread_data = {
        "id": str(uuid.uuid4()),
        "homeowner_id": order.homeowner_id,
        "provider_id": order.provider_id,
        "homeowner_name": order.homeowner_name,
        "provider_name": order.provider_name,
        "order_id": order.id,
        "order_type": order.service_type,
        "last_message": f"New quotation request for {order.service_type}",
        "last_message_time": datetime.utcnow(),
        "created_at": datetime.utcnow()
    }
    
    thread = MessageThread(**thread_data)
    await db.message_threads.insert_one(thread.dict())
    
    # Create initial message
    initial_message = {
        "id": str(uuid.uuid4()),
        "thread_id": thread.id,
        "sender_id": order.homeowner_id,
        "sender_type": "homeowner",
        "content": f"Hi {order.provider_name}! I'm interested in your {order.service_type} services. Here are the details: {order.description}. My preferred date is {order.preferred_date} and budget is {order.budget}.",
        "timestamp": datetime.utcnow(),
        "read": False
    }
    
    message = Message(**initial_message)
    await db.messages.insert_one(message.dict())
    
    return {"message": "Quotation request sent successfully!", "order_id": order.id}

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