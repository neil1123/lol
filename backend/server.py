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
from datetime import datetime, timedelta, timezone
import jwt
from passlib.context import CryptContext
import motor.motor_asyncio
from bson import ObjectId

print("DOORD SERVER LOADING - MongoDB Version", file=sys.stderr, flush=True)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# MongoDB Configuration
MONGO_URL = os.environ.get('MONGO_URL')
if not MONGO_URL:
    print("ERROR: MONGO_URL environment variable is required", file=sys.stderr, flush=True)
    raise ValueError("MONGO_URL environment variable is required")

print("Initializing MongoDB connection...", file=sys.stderr, flush=True)

# Parse database name from connection string or use environment variable
DB_NAME = os.environ.get('DB_NAME', 'doord')

# Create the MongoDB client
try:
    client = motor.motor_asyncio.AsyncIOMotorClient(
        MONGO_URL,
        serverSelectionTimeoutMS=10000,  # 10 second timeout for server selection
        connectTimeoutMS=10000,  # 10 second connection timeout
    )
    print("MongoDB client created successfully", file=sys.stderr, flush=True)
except Exception as e:
    print(f"ERROR creating MongoDB client: {e}", file=sys.stderr, flush=True)
    raise

# Try to get default database from connection string, fall back to DB_NAME env var
try:
    db = client.get_default_database()
    print(f"Using default database from connection string: {db.name}", file=sys.stderr, flush=True)
except Exception as e:
    print(f"No default database in connection string, using '{DB_NAME}': {e}", file=sys.stderr, flush=True)
    db = client[DB_NAME]

print(f"Database initialized: {db.name}", file=sys.stderr, flush=True)

# Collections
users_collection = db.users
orders_collection = db.orders
messages_collection = db.messages
appointments_collection = db.appointments
ai_chats_collection = db.ai_chats
customers_collection = db.customers
print("Collections initialized", file=sys.stderr, flush=True)

# JWT settings
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60  # 24 hours

# Create the main app
app = FastAPI(title="Doord API (MongoDB)", description="Home Services Marketplace API - MongoDB Database")

# Background task to create indexes (non-blocking)
async def create_indexes():
    """Create database indexes in background - non-blocking"""
    try:
        print("Creating indexes in background...", file=sys.stderr, flush=True)
        await users_collection.create_index("email", unique=True)
        await users_collection.create_index("user_type")
        await users_collection.create_index("id", unique=True)
        await orders_collection.create_index("homeowner_id")
        await orders_collection.create_index("provider_id")
        await orders_collection.create_index("id", unique=True)
        await messages_collection.create_index("conversation_id")
        await messages_collection.create_index("sender_id")
        await messages_collection.create_index("recipient_id")
        await appointments_collection.create_index("provider_id")
        await ai_chats_collection.create_index("session_id")
        print("✅ All indexes created successfully", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"⚠️ Index creation warning (non-fatal): {e}", file=sys.stderr, flush=True)

# Startup event - lightweight and fast
@app.on_event("startup")
async def startup():
    import asyncio
    try:
        print("Starting application...", file=sys.stderr, flush=True)
        print(f"Database name: {db.name}", file=sys.stderr, flush=True)
        
        # Quick connection test with 5 second timeout
        try:
            await asyncio.wait_for(db.command('ping'), timeout=5.0)
            print("✅ MongoDB connection verified", file=sys.stderr, flush=True)
        except asyncio.TimeoutError:
            print("⚠️ MongoDB ping timed out, but continuing startup...", file=sys.stderr, flush=True)
        except Exception as e:
            print(f"⚠️ MongoDB ping failed: {e}, but continuing startup...", file=sys.stderr, flush=True)
        
        # Schedule index creation as background task (non-blocking)
        asyncio.create_task(create_indexes())
        
        print("✅ Application startup complete", file=sys.stderr, flush=True)
        logging.info("✅ Application started successfully")
    except Exception as e:
        print(f"❌ STARTUP ERROR: {e}", file=sys.stderr, flush=True)
        import traceback
        traceback.print_exc()
        # Don't raise - let the app start anyway
        print("⚠️ Continuing despite startup error...", file=sys.stderr, flush=True)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ====== PYDANTIC MODELS ======

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    user_type: str
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
        extra = 'ignore'

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
    token_type: str = "bearer"
    user: Dict[str, Any]

class MessageCreate(BaseModel):
    recipient_id: Optional[str] = None
    message: Optional[str] = None
    # Alternative fields for thread-based messaging
    thread_id: Optional[str] = None
    content: Optional[str] = None
    sender_id: Optional[str] = None
    sender_type: Optional[str] = None

class OrderCreate(BaseModel):
    provider_id: str
    service: str
    description: Optional[str] = None
    amount: Optional[float] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    urgency: Optional[str] = None
    budget: Optional[str] = None
    property_size: Optional[str] = None
    additional_requirements: Optional[str] = None
    # Fields for manual order creation by provider
    homeowner_id: Optional[str] = None
    homeowner_name: Optional[str] = None
    homeowner_email: Optional[str] = None
    homeowner_phone: Optional[str] = None
    homeowner_address: Optional[str] = None
    provider_name: Optional[str] = None
    service_type: Optional[str] = None
    services: Optional[List[str]] = None

class ThreadCreate(BaseModel):
    homeowner_id: Optional[str] = None
    provider_id: str
    homeowner_name: Optional[str] = None
    provider_name: Optional[str] = None
    order_type: Optional[str] = None
    last_message: Optional[str] = None
    last_message_time: Optional[str] = None

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

# ====== HELPER FUNCTIONS ======

def create_access_token(data: dict):
    to_encode = data.copy()
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
    
    user_doc = await users_collection.find_one({"id": user_id}, {"_id": 0})
    
    if user_doc is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)

def user_to_response(user_doc: dict) -> dict:
    """Convert user document to response format (remove password_hash and _id)"""
    if user_doc is None:
        return None
    response = {k: v for k, v in user_doc.items() if k not in ['password_hash', '_id']}
    return response

# ====== API ENDPOINTS ======

@api_router.get("/")
async def root():
    user_count = await users_collection.count_documents({})
    return {
        "message": "Doord API (MongoDB) - Running", 
        "status": "active",
        "database": f"MongoDB - {user_count} users registered"
    }

# ====== AUTH ENDPOINTS ======

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing = await users_collection.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    password_hash = pwd_context.hash(user_data.password)
    
    # Create user document
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": password_hash,
        "user_type": user_data.user_type,
        "name": user_data.name,
        "phone": user_data.phone,
        "address": user_data.address,
        "business_name": user_data.business_name,
        "services": user_data.services or [],
        "description": user_data.description,
        "location": user_data.location,
        "specialties": user_data.specialties or [],
        "rating": 5.0,
        "reviews": 0,
        "completed_jobs": 0,
        "response_time": None,
        "year_established": None,
        "price_range": None,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "is_active": True,
        "pm_code": user_data.pm_code
    }
    
    await users_collection.insert_one(user_doc)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_to_response(user_doc)
    }

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user_doc = await users_collection.find_one({"email": user_data.email})
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not pwd_context.verify(user_data.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user_doc["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_to_response(user_doc)
    }

# ====== USER PROFILE ENDPOINTS ======

@api_router.get("/users/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    user_data = current_user.dict()
    del user_data["password_hash"]
    return user_data

@api_router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    user_doc = await users_collection.find_one({"id": current_user.id}, {"_id": 0, "password_hash": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return user_doc

@api_router.get("/auth/me")
async def get_auth_me(current_user: User = Depends(get_current_user)):
    """Get current user profile - alias"""
    user_doc = await users_collection.find_one({"id": current_user.id}, {"_id": 0, "password_hash": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return user_doc

@api_router.put("/users/me")
async def update_user_profile(update_data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    """Update current user profile"""
    allowed_fields = ['name', 'phone', 'address', 'business_name', 'services', 
                      'description', 'location', 'specialties', 'price_range',
                      'year_established', 'response_time']
    
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}
    update_dict["updated_at"] = datetime.utcnow().isoformat()
    
    if update_dict:
        await users_collection.update_one(
            {"id": current_user.id},
            {"$set": update_dict}
        )
    
    updated_user = await users_collection.find_one({"id": current_user.id}, {"_id": 0, "password_hash": 0})
    return updated_user

# ====== PROVIDERS ENDPOINTS ======

@api_router.get("/providers")
async def get_providers(service: Optional[str] = None, location: Optional[str] = None):
    """Get all providers, optionally filtered by service or location"""
    query = {"user_type": "provider", "is_active": True}
    
    if service:
        query["services"] = {"$in": [service]}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    cursor = users_collection.find(query, {"_id": 0, "password_hash": 0}).limit(100)
    providers = await cursor.to_list(length=100)
    return providers

@api_router.get("/providers/{provider_id}")
async def get_provider(provider_id: str):
    """Get a specific provider by ID"""
    provider = await users_collection.find_one(
        {"id": provider_id, "user_type": "provider"},
        {"_id": 0, "password_hash": 0}
    )
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider

@api_router.get("/services")
async def get_all_services():
    """Get list of all available services"""
    return [
        "Home Cleaning", "Office Cleaning", "Deep Cleaning", "Window Cleaning",
        "Plumbing", "Pipe Repair", "Drain Cleaning", "Water Heater Services",
        "Electrical", "Wiring", "Panel Upgrades", "Lighting Installation",
        "HVAC", "AC Repair", "Heating Services", "Duct Cleaning",
        "Landscaping", "Lawn Care", "Garden Maintenance",
        "Handyman", "General Repairs", "Home Maintenance",
        "Painting", "Interior Painting", "Exterior Painting",
        "Roofing", "Roof Repair", "Gutter Cleaning",
        "Pressure Washing", "Car Detailing"
    ]

# ====== ORDERS ENDPOINTS ======

@api_router.get("/orders")
async def get_orders(current_user: User = Depends(get_current_user)):
    """Get orders for current user"""
    query = {"$or": [{"homeowner_id": current_user.id}, {"provider_id": current_user.id}]}
    cursor = orders_collection.find(query, {"_id": 0}).sort("created_at", -1)
    orders = await cursor.to_list(length=100)
    
    # Enrich with user details
    for order in orders:
        homeowner = await users_collection.find_one({"id": order.get("homeowner_id")}, {"_id": 0, "password_hash": 0})
        provider = await users_collection.find_one({"id": order.get("provider_id")}, {"_id": 0, "password_hash": 0})
        if homeowner:
            order["homeowner_name"] = homeowner.get("name")
            order["homeowner_email"] = homeowner.get("email")
            order["homeowner_phone"] = homeowner.get("phone")
            order["homeowner_address"] = homeowner.get("address")
        if provider:
            order["provider_name"] = provider.get("business_name") or provider.get("name")
            order["provider_email"] = provider.get("email")
            order["provider_phone"] = provider.get("phone")
    
    return orders

@api_router.post("/orders")
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    """Create a new order/quotation request"""
    
    # Check if this is a manual order created by provider
    is_manual_order = order_data.homeowner_id and order_data.homeowner_id.startswith('manual_')
    
    if is_manual_order:
        # Provider creating manual order
        order_id = str(uuid.uuid4())
        service_type = order_data.service_type or order_data.service or ''
        services_list = order_data.services or [service_type] if service_type else []
        
        order_doc = {
            "id": order_id,
            "homeowner_id": order_data.homeowner_id,
            "provider_id": current_user.id,
            "homeowner_name": order_data.homeowner_name or "Manual Customer",
            "homeowner_email": order_data.homeowner_email or "",
            "homeowner_phone": order_data.homeowner_phone or "",
            "homeowner_address": order_data.homeowner_address or "",
            "provider_name": order_data.provider_name or current_user.business_name or current_user.name,
            "service_type": service_type,
            "services": services_list,
            "service": service_type,
            "description": order_data.description,
            "status": "confirmed",  # Manual orders start as confirmed
            "request_date": datetime.utcnow().isoformat(),
            "preferred_date": order_data.preferred_date,
            "preferred_time": order_data.preferred_time or "09:00",
            "urgency": order_data.urgency or "medium",
            "budget": order_data.budget,
            "additional_requirements": order_data.additional_requirements,
            "quotation_amount": float(order_data.budget.replace('$', '')) if order_data.budget else None,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        await orders_collection.insert_one(order_doc)
        
        return {
            "message": "Order created successfully",
            "order_id": order_id,
            "id": order_id,
            "status": "confirmed"
        }
    else:
        # Homeowner creating quotation request
        provider = await users_collection.find_one({"id": order_data.provider_id, "user_type": "provider"})
        if not provider:
            raise HTTPException(status_code=404, detail="Provider not found")
        
        order_id = str(uuid.uuid4())
        order_doc = {
            "id": order_id,
            "homeowner_id": current_user.id,
            "homeowner_name": current_user.name,
            "homeowner_email": current_user.email,
            "homeowner_phone": current_user.phone or "",
            "homeowner_address": current_user.address or "",
            "provider_id": order_data.provider_id,
            "provider_name": provider.get('business_name') or provider.get('name'),
            "service": order_data.service,
            "service_type": order_data.service,
            "description": order_data.description,
            "status": "pending_quotation",
            "amount": order_data.amount,
            "request_date": datetime.utcnow().isoformat(),
            "preferred_date": order_data.preferred_date,
            "preferred_time": order_data.preferred_time,
            "urgency": order_data.urgency,
            "budget": order_data.budget,
            "property_size": order_data.property_size,
            "additional_requirements": order_data.additional_requirements,
            "quotation_amount": None,
            "quotation_details": None,
            "quotation_valid_until": None,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        await orders_collection.insert_one(order_doc)
        
        return {
            "message": "Quotation request sent successfully",
            "order_id": order_id,
            "id": order_id,
            "status": "pending_quotation"
        }

@api_router.post("/quotations")
async def create_quotation(quotation_data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    """Create a new quotation request (alias for orders)"""
    provider_id = quotation_data.get('provider_id')
    if not provider_id:
        raise HTTPException(status_code=400, detail="provider_id is required")
    
    provider = await users_collection.find_one({"id": provider_id, "user_type": "provider"})
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    order_id = str(uuid.uuid4())
    services = quotation_data.get('services', [])
    service_str = ', '.join(services) if isinstance(services, list) else str(services)
    
    order_doc = {
        "id": order_id,
        "homeowner_id": current_user.id,
        "provider_id": provider_id,
        "service": service_str,
        "description": quotation_data.get('description'),
        "status": "pending",
        "amount": None,
        "preferred_date": quotation_data.get('preferred_date'),
        "preferred_time": quotation_data.get('preferred_time'),
        "urgency": quotation_data.get('urgency'),
        "budget": quotation_data.get('budget'),
        "property_size": quotation_data.get('property_size'),
        "additional_requirements": quotation_data.get('additional_requirements'),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    await orders_collection.insert_one(order_doc)
    
    return {
        "message": "Quotation request sent successfully",
        "order_id": order_id,
        "status": "pending"
    }

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, current_user: User = Depends(get_current_user)):
    """Update order status"""
    order = await orders_collection.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["provider_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await orders_collection.update_one(
        {"id": order_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow().isoformat()}}
    )
    
    return {"message": "Order status updated", "status": status}

@api_router.put("/orders/{order_id}/quotation")
async def update_order_quotation(
    order_id: str, 
    quotation_amount: float = Query(...),
    quotation_details: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Update order quotation details"""
    order = await orders_collection.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["provider_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {
        "quotation_amount": quotation_amount,
        "status": "quoted",
        "updated_at": datetime.utcnow().isoformat()
    }
    if quotation_details:
        update_data["quotation_details"] = quotation_details
    
    await orders_collection.update_one({"id": order_id}, {"$set": update_data})
    
    return {"message": "Quotation updated", "quotation_amount": quotation_amount}

# ====== MESSAGES ENDPOINTS ======

@api_router.post("/messages")
async def send_message(message_data: MessageCreate, current_user: User = Depends(get_current_user)):
    """Send a message"""
    recipient = await users_collection.find_one({"id": message_data.recipient_id})
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    ids = sorted([current_user.id, message_data.recipient_id])
    conversation_id = f"{ids[0]}_{ids[1]}"
    
    message_id = str(uuid.uuid4())
    message_doc = {
        "id": message_id,
        "conversation_id": conversation_id,
        "sender_id": current_user.id,
        "recipient_id": message_data.recipient_id,
        "message": message_data.message,
        "timestamp": datetime.utcnow().isoformat(),
        "is_read": False
    }
    
    await messages_collection.insert_one(message_doc)
    
    return {
        "message": "Message sent successfully",
        "message_id": message_id,
        "conversation_id": conversation_id
    }

@api_router.post("/messages/threads")
async def create_message_thread(thread_data: ThreadCreate, current_user: User = Depends(get_current_user)):
    """Create a new message thread"""
    provider = await users_collection.find_one({"id": thread_data.provider_id, "user_type": "provider"})
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    ids = sorted([current_user.id, thread_data.provider_id])
    conversation_id = f"{ids[0]}_{ids[1]}"
    
    existing = await messages_collection.find_one({"conversation_id": conversation_id})
    
    if not existing:
        initial_message = thread_data.last_message or "New conversation started"
        message_id = str(uuid.uuid4())
        message_doc = {
            "id": message_id,
            "conversation_id": conversation_id,
            "sender_id": current_user.id,
            "recipient_id": thread_data.provider_id,
            "message": initial_message,
            "timestamp": datetime.utcnow().isoformat(),
            "is_read": False
        }
        await messages_collection.insert_one(message_doc)
    
    provider_name = provider.get("business_name") or provider.get("name")
    
    return {
        "id": conversation_id,
        "conversation_id": conversation_id,
        "homeowner_id": current_user.id,
        "provider_id": thread_data.provider_id,
        "provider_name": provider_name,
        "homeowner_name": current_user.name,
        "last_message": thread_data.last_message or "New conversation started",
        "last_message_time": datetime.utcnow().isoformat()
    }

@api_router.get("/messages/threads")
async def get_message_threads(current_user: User = Depends(get_current_user)):
    """Get all message threads for current user"""
    user_id = current_user.id
    
    pipeline = [
        {"$match": {"$or": [{"sender_id": user_id}, {"recipient_id": user_id}]}},
        {"$sort": {"timestamp": -1}},
        {"$group": {
            "_id": "$conversation_id",
            "last_message": {"$first": "$message"},
            "last_message_time": {"$first": "$timestamp"},
            "sender_id": {"$first": "$sender_id"},
            "recipient_id": {"$first": "$recipient_id"}
        }}
    ]
    
    cursor = messages_collection.aggregate(pipeline)
    conversations = await cursor.to_list(length=100)
    
    threads = []
    for conv in conversations:
        conv_id = conv["_id"]
        sender = conv["sender_id"]
        recipient = conv["recipient_id"]
        other_user_id = recipient if sender == user_id else sender
        
        other_user = await users_collection.find_one({"id": other_user_id}, {"_id": 0, "password_hash": 0})
        
        unread_count = await messages_collection.count_documents({
            "conversation_id": conv_id,
            "recipient_id": user_id,
            "is_read": False
        })
        
        if other_user:
            other_user_name = other_user.get("business_name") or other_user.get("name")
            other_user_type = other_user.get("user_type")
            
            thread = {
                "id": conv_id,
                "conversation_id": conv_id,
                "last_message": conv["last_message"],
                "last_message_time": conv["last_message_time"],
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
    
    return threads

@api_router.get("/conversations")
async def get_conversations(current_user: User = Depends(get_current_user)):
    """Get all conversations for current user"""
    return await get_message_threads(current_user)

@api_router.get("/messages/{conversation_id}")
async def get_conversation_messages(conversation_id: str, current_user: User = Depends(get_current_user)):
    """Get all messages in a conversation"""
    # Mark messages as read
    await messages_collection.update_many(
        {"conversation_id": conversation_id, "recipient_id": current_user.id},
        {"$set": {"is_read": True}}
    )
    
    cursor = messages_collection.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("timestamp", 1)
    
    messages = await cursor.to_list(length=500)
    return messages

# ====== APPOINTMENTS ENDPOINTS ======

@api_router.post("/appointments")
async def create_appointment(appointment_data: AppointmentCreate, current_user: User = Depends(get_current_user)):
    """Create a new appointment"""
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Only providers can create appointments")
    
    appointment_id = str(uuid.uuid4())
    appointment_doc = {
        "id": appointment_id,
        "provider_id": current_user.id,
        "customer_name": appointment_data.customer_name,
        "phone_number": appointment_data.phone_number,
        "service_type": appointment_data.service_type,
        "services": appointment_data.services or [],
        "date": appointment_data.date,
        "time": appointment_data.time,
        "address": appointment_data.address,
        "notes": appointment_data.notes,
        "source": appointment_data.source,
        "order_id": appointment_data.order_id,
        "created_at": datetime.utcnow().isoformat()
    }
    
    await appointments_collection.insert_one(appointment_doc)
    
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
    
    cursor = appointments_collection.find(
        {"provider_id": current_user.id},
        {"_id": 0}
    ).sort([("date", 1), ("time", 1)])
    
    appointments = await cursor.to_list(length=500)
    return appointments

@api_router.put("/appointments/{appointment_id}")
async def update_appointment(appointment_id: str, update_data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    """Update an appointment"""
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Only providers can update appointments")
    
    appointment = await appointments_collection.find_one({"id": appointment_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment["provider_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    allowed_fields = ['customer_name', 'phone_number', 'service_type', 'services', 'date', 'time', 'address', 'notes']
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if update_dict:
        await appointments_collection.update_one({"id": appointment_id}, {"$set": update_dict})
    
    return {"message": "Appointment updated successfully"}

# ====== NOTIFICATIONS ENDPOINTS ======

@api_router.get("/notifications/count")
async def get_notification_count(current_user: User = Depends(get_current_user)):
    """Get notification counts for current user"""
    unread_messages = await messages_collection.count_documents({
        "recipient_id": current_user.id,
        "is_read": False
    })
    
    pending_orders = 0
    if current_user.user_type == "provider":
        pending_orders = await orders_collection.count_documents({
            "provider_id": current_user.id,
            "status": "pending"
        })
    
    return {
        "unread_messages": unread_messages,
        "pending_orders": pending_orders,
        "total": unread_messages + pending_orders
    }

# ====== CUSTOMERS ENDPOINTS ======

@api_router.get("/customers")
async def get_customers(current_user: User = Depends(get_current_user)):
    """Get all customers for the current provider"""
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Only providers can access customers")
    
    customers = await customers_collection.find(
        {"provider_id": current_user.id},
        {"_id": 0}
    ).to_list(1000)
    
    return customers

@api_router.post("/customers")
async def create_customer(customer_data: dict, current_user: User = Depends(get_current_user)):
    """Create a new customer for the current provider"""
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Only providers can create customers")
    
    customer = {
        "id": str(uuid.uuid4()),
        "provider_id": current_user.id,
        "name": customer_data.get("name", ""),
        "email": customer_data.get("email", "Not provided"),
        "phone": customer_data.get("phone", "N/A"),
        "address": customer_data.get("address", "N/A"),
        "total_orders": customer_data.get("total_orders", 0),
        "total_spent": float(customer_data.get("total_spent", 0)),
        "rating": customer_data.get("rating", 0),
        "last_order": customer_data.get("last_order"),
        "status": customer_data.get("status", "active"),
        "notes": customer_data.get("notes", ""),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await customers_collection.insert_one(customer)
    
    # Return without _id
    customer.pop("_id", None)
    return customer

@api_router.put("/customers/{customer_id}")
async def update_customer(customer_id: str, customer_data: dict, current_user: User = Depends(get_current_user)):
    """Update a customer"""
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Only providers can update customers")
    
    # Only update allowed fields
    allowed_fields = ['name', 'email', 'phone', 'address', 'total_orders', 'total_spent', 'rating', 'status', 'notes']
    update_data = {k: v for k, v in customer_data.items() if k in allowed_fields}
    
    if update_data:
        await customers_collection.update_one(
            {"id": customer_id, "provider_id": current_user.id},
            {"$set": update_data}
        )
    
    updated_customer = await customers_collection.find_one(
        {"id": customer_id, "provider_id": current_user.id},
        {"_id": 0}
    )
    
    if not updated_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return updated_customer

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str, current_user: User = Depends(get_current_user)):
    """Delete a customer"""
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Only providers can delete customers")
    
    result = await customers_collection.delete_one(
        {"id": customer_id, "provider_id": current_user.id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {"message": "Customer deleted successfully"}

# ====== DEBUG ENDPOINTS ======

@api_router.get("/debug/threads/{user_id}")
async def debug_threads(user_id: str):
    """Debug endpoint to test thread query"""
    pipeline = [
        {"$match": {"$or": [{"sender_id": user_id}, {"recipient_id": user_id}]}},
        {"$sort": {"timestamp": -1}},
        {"$group": {
            "_id": "$conversation_id",
            "last_message": {"$first": "$message"},
            "last_message_time": {"$first": "$timestamp"}
        }}
    ]
    
    cursor = messages_collection.aggregate(pipeline)
    threads = await cursor.to_list(length=100)
    
    return {
        "user_id": user_id,
        "thread_count": len(threads),
        "threads": threads
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

# ====== AI CHAT ENDPOINTS (Placeholder) ======

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class AIChatResponse(BaseModel):
    response: str
    session_id: str

@api_router.post("/ai/chat", response_model=AIChatResponse)
async def ai_chat(chat_message: ChatMessage):
    """AI chat endpoint placeholder"""
    session_id = chat_message.session_id or str(uuid.uuid4())
    
    # Store chat in database
    await ai_chats_collection.insert_one({
        "session_id": session_id,
        "role": "user",
        "content": chat_message.message,
        "timestamp": datetime.utcnow().isoformat()
    })
    
    # Simple response (replace with actual AI integration)
    response = f"Thank you for your message. Our AI assistant is currently being set up. Your message: '{chat_message.message[:50]}...'"
    
    await ai_chats_collection.insert_one({
        "session_id": session_id,
        "role": "assistant",
        "content": response,
        "timestamp": datetime.utcnow().isoformat()
    })
    
    return AIChatResponse(response=response, session_id=session_id)

@api_router.get("/ai/history/{session_id}")
async def get_chat_history(session_id: str):
    """Get chat history for a session"""
    cursor = ai_chats_collection.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("timestamp", 1)
    
    messages = await cursor.to_list(length=100)
    return {"messages": messages}

@api_router.delete("/ai/history/{session_id}")
async def clear_chat_history(session_id: str):
    """Clear chat history for a session"""
    await ai_chats_collection.delete_many({"session_id": session_id})
    return {"message": "Chat history cleared"}

# ====== CORS CONFIGURATION ======

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API router
app.include_router(api_router)

# Add root health check for Kubernetes probes
@app.get("/health")
async def health_check():
    """Health check endpoint for deployment verification"""
    try:
        # Quick database ping with timeout
        await db.command('ping')
        return {
            "status": "healthy", 
            "database": "connected",
            "db_name": db.name
        }
    except Exception as e:
        print(f"Health check failed: {e}", file=sys.stderr, flush=True)
        return {"status": "unhealthy", "error": str(e)}

# Main entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
