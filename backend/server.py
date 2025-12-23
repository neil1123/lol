from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import JWTError, jwt
import aiosqlite
import uuid
import os
import sys
import logging
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Print startup message
print("DOORD SERVER LOADING - SQLite Version", file=sys.stderr, flush=True)

# Configure logging
logging.basicConfig(level=logging.INFO)

# JWT Configuration
SECRET_KEY = os.environ.get('SECRET_KEY', 'doord-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# SQLite Database path
DB_PATH = os.environ.get('SQLITE_DB_PATH', '/app/backend/doord.db')
print(f"SQLite database path: {DB_PATH}", file=sys.stderr, flush=True)

# Create the main app
app = FastAPI(title="Doord API", version="2.0.0")

# Database connection helper
async def get_db():
    db = await aiosqlite.connect(DB_PATH, isolation_level=None)  # Auto-commit mode disabled
    db.row_factory = aiosqlite.Row
    # Enable WAL mode for better concurrency and durability
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA synchronous=FULL")  # Full sync for durability
    await db.execute("PRAGMA busy_timeout=5000")  # Wait 5s if database is locked
    return db

# Initialize database tables
async def init_db():
    print("Initializing SQLite database...", file=sys.stderr, flush=True)
    db = await get_db()
    try:
        # Users table
        await db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                user_type TEXT NOT NULL,
                name TEXT,
                phone TEXT,
                address TEXT,
                business_name TEXT,
                services TEXT,
                description TEXT,
                location TEXT,
                specialties TEXT,
                rating REAL DEFAULT 5.0,
                reviews INTEGER DEFAULT 0,
                completed_jobs INTEGER DEFAULT 0,
                response_time TEXT,
                year_established TEXT,
                price_range TEXT,
                created_at TEXT,
                updated_at TEXT,
                is_active INTEGER DEFAULT 1,
                pm_code TEXT
            )
        ''')
        
        # Orders table
        await db.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                homeowner_id TEXT,
                provider_id TEXT,
                homeowner_name TEXT,
                homeowner_email TEXT,
                homeowner_phone TEXT,
                homeowner_address TEXT,
                provider_name TEXT,
                service TEXT,
                service_type TEXT,
                services TEXT,
                description TEXT,
                status TEXT DEFAULT 'pending',
                amount REAL,
                request_date TEXT,
                preferred_date TEXT,
                preferred_time TEXT,
                urgency TEXT,
                budget TEXT,
                property_size TEXT,
                additional_requirements TEXT,
                quotation_amount REAL,
                quotation_details TEXT,
                quotation_valid_until TEXT,
                created_at TEXT,
                updated_at TEXT
            )
        ''')
        
        # Messages table
        await db.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT,
                sender_id TEXT,
                recipient_id TEXT,
                message TEXT,
                timestamp TEXT,
                is_read INTEGER DEFAULT 0
            )
        ''')
        
        # Appointments table
        await db.execute('''
            CREATE TABLE IF NOT EXISTS appointments (
                id TEXT PRIMARY KEY,
                provider_id TEXT,
                customer_name TEXT,
                customer_phone TEXT,
                customer_email TEXT,
                service_type TEXT,
                date TEXT,
                time TEXT,
                duration INTEGER,
                notes TEXT,
                status TEXT DEFAULT 'scheduled',
                created_at TEXT,
                order_id TEXT,
                source TEXT DEFAULT 'manual'
            )
        ''')
        
        # Customers table
        await db.execute('''
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                provider_id TEXT,
                name TEXT,
                email TEXT,
                phone TEXT,
                address TEXT,
                total_orders INTEGER DEFAULT 0,
                total_spent REAL DEFAULT 0,
                rating REAL DEFAULT 0,
                last_order TEXT,
                status TEXT DEFAULT 'active',
                notes TEXT,
                created_at TEXT
            )
        ''')
        
        # AI Chats table
        await db.execute('''
            CREATE TABLE IF NOT EXISTS ai_chats (
                id TEXT PRIMARY KEY,
                session_id TEXT,
                user_id TEXT,
                role TEXT,
                content TEXT,
                timestamp TEXT
            )
        ''')
        
        # Reported Issues table (for tenant issue reporting)
        await db.execute('''
            CREATE TABLE IF NOT EXISTS reported_issues (
                id TEXT PRIMARY KEY,
                tenant_id TEXT,
                tenant_name TEXT,
                tenant_email TEXT,
                tenant_phone TEXT,
                property_manager_id TEXT,
                unit_number TEXT,
                issue_category TEXT,
                urgency_level TEXT,
                description TEXT,
                ai_summary TEXT,
                best_time TEXT,
                permission_to_enter TEXT,
                photos TEXT,
                status TEXT DEFAULT 'pending',
                created_at TEXT,
                updated_at TEXT,
                resolved_at TEXT,
                resolution_notes TEXT
            )
        ''')
        
        # Create indexes
        await db.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
        await db.execute('CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type)')
        await db.execute('CREATE INDEX IF NOT EXISTS idx_orders_homeowner ON orders(homeowner_id)')
        await db.execute('CREATE INDEX IF NOT EXISTS idx_orders_provider ON orders(provider_id)')
        await db.execute('CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)')
        await db.execute('CREATE INDEX IF NOT EXISTS idx_appointments_provider ON appointments(provider_id)')
        await db.execute('CREATE INDEX IF NOT EXISTS idx_customers_provider ON customers(provider_id)')
        
        await db.commit()
        print("SQLite database initialized successfully", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"Database initialization error: {e}", file=sys.stderr, flush=True)
        raise
    finally:
        await db.close()

# Startup event
@app.on_event("startup")
async def startup():
    print("Starting Doord application...", file=sys.stderr, flush=True)
    await init_db()
    print("Application startup complete", file=sys.stderr, flush=True)

# ====== PYDANTIC MODELS ======

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    user_type: str
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    business_name: Optional[str] = None
    services: Optional[List[str]] = None
    description: Optional[str] = None
    location: Optional[str] = None
    specialties: Optional[List[str]] = None
    pm_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    email: str
    user_type: str
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    business_name: Optional[str] = None
    services: Optional[List[str]] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class OrderCreate(BaseModel):
    provider_id: Optional[str] = None
    service: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    urgency: Optional[str] = None
    budget: Optional[str] = None
    property_size: Optional[str] = None
    additional_requirements: Optional[str] = None
    homeowner_id: Optional[str] = None
    homeowner_name: Optional[str] = None
    homeowner_email: Optional[str] = None
    homeowner_phone: Optional[str] = None
    homeowner_address: Optional[str] = None
    provider_name: Optional[str] = None
    service_type: Optional[str] = None
    services: Optional[List[str]] = None

class MessageCreate(BaseModel):
    recipient_id: Optional[str] = None
    message: Optional[str] = None
    thread_id: Optional[str] = None
    content: Optional[str] = None

# ====== HELPER FUNCTIONS ======

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def row_to_dict(row):
    if row is None:
        return None
    return dict(row)

def parse_json_field(value):
    if value is None:
        return []
    if isinstance(value, list):
        return value
    try:
        return json.loads(value)
    except Exception:
        return []

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = await cursor.fetchone()
        if row is None:
            raise HTTPException(status_code=401, detail="User not found")
        user_dict = row_to_dict(row)
        user_dict['services'] = parse_json_field(user_dict.get('services'))
        user_dict['specialties'] = parse_json_field(user_dict.get('specialties'))
        return User(**user_dict)
    finally:
        await db.close()

def user_to_response(user_dict: dict) -> dict:
    if user_dict is None:
        return None
    response = {k: v for k, v in user_dict.items() if k != 'password_hash'}
    if 'services' in response and isinstance(response['services'], str):
        response['services'] = parse_json_field(response['services'])
    if 'specialties' in response and isinstance(response['specialties'], str):
        response['specialties'] = parse_json_field(response['specialties'])
    return response

# ====== API ROUTER ======
api_router = APIRouter(prefix="/api")

@api_router.get("/ping")
async def ping():
    return {"status": "ok", "message": "Backend is running", "database": "SQLite"}

@api_router.get("/")
async def root():
    try:
        db = await get_db()
        cursor = await db.execute("SELECT COUNT(*) as count FROM users")
        row = await cursor.fetchone()
        user_count = row['count'] if row else 0
        await db.close()
        return {
            "message": "Doord API (SQLite) - Running",
            "status": "active",
            "database": f"SQLite - {user_count} users registered"
        }
    except Exception as e:
        return {
            "message": "Doord API - Database Error",
            "status": "error",
            "error": str(e)
        }

# ====== AUTH ENDPOINTS ======

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM users WHERE email = ?", (user_data.email,))
        existing = await cursor.fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        password_hash = pwd_context.hash(user_data.password)
        user_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        await db.execute('''
            INSERT INTO users (id, email, password_hash, user_type, name, phone, address, 
                             business_name, services, description, location, specialties,
                             rating, reviews, completed_jobs, created_at, updated_at, is_active, pm_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, user_data.email, password_hash, user_data.user_type,
            user_data.name, user_data.phone, user_data.address, user_data.business_name,
            json.dumps(user_data.services or []), user_data.description, user_data.location,
            json.dumps(user_data.specialties or []), 5.0, 0, 0, now, now, 1, user_data.pm_code
        ))
        await db.commit()
        
        cursor = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user_row = await cursor.fetchone()
        user_dict = row_to_dict(user_row)
        
        access_token = create_access_token(data={"sub": user_id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_to_response(user_dict)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    finally:
        await db.close()

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM users WHERE email = ?", (user_data.email,))
        user_row = await cursor.fetchone()
        
        if not user_row:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user_dict = row_to_dict(user_row)
        
        if not pwd_context.verify(user_data.password, user_dict["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        access_token = create_access_token(data={"sub": user_dict["id"]})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_to_response(user_dict)
        }
    finally:
        await db.close()

@api_router.get("/auth/me")
async def get_auth_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user - alias for /me used by frontend"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM users WHERE id = ?", (current_user.id,))
        user_row = await cursor.fetchone()
        return user_to_response(row_to_dict(user_row))
    finally:
        await db.close()

# ====== USER ENDPOINTS ======

@api_router.get("/users/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM users WHERE id = ?", (current_user.id,))
        user_row = await cursor.fetchone()
        return user_to_response(row_to_dict(user_row))
    finally:
        await db.close()

@api_router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM users WHERE id = ?", (current_user.id,))
        user_row = await cursor.fetchone()
        return user_to_response(row_to_dict(user_row))
    finally:
        await db.close()

@api_router.put("/users/profile")
async def update_user_profile(profile_data: dict, current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        allowed_fields = ['name', 'phone', 'address', 'business_name', 'description', 'location']
        updates = []
        values = []
        for field in allowed_fields:
            if field in profile_data:
                updates.append(f"{field} = ?")
                values.append(profile_data[field])
        
        if updates:
            values.append(datetime.utcnow().isoformat())
            values.append(current_user.id)
            query = f"UPDATE users SET {', '.join(updates)}, updated_at = ? WHERE id = ?"
            await db.execute(query, values)
            await db.commit()
        
        cursor = await db.execute("SELECT * FROM users WHERE id = ?", (current_user.id,))
        user_row = await cursor.fetchone()
        return user_to_response(row_to_dict(user_row))
    finally:
        await db.close()

# ====== PROVIDERS ENDPOINTS ======

@api_router.get("/providers")
async def get_providers():
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM users WHERE user_type = 'provider' AND is_active = 1")
        rows = await cursor.fetchall()
        providers = []
        for row in rows:
            provider = user_to_response(row_to_dict(row))
            providers.append(provider)
        return providers
    finally:
        await db.close()

@api_router.get("/providers/{provider_id}")
async def get_provider(provider_id: str):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM users WHERE id = ? AND user_type = 'provider'", (provider_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Provider not found")
        return user_to_response(row_to_dict(row))
    finally:
        await db.close()

# ====== PROPERTY MANAGER CODE SYSTEM ======

@api_router.post("/pm/generate-code")
async def generate_pm_code(current_user: User = Depends(get_current_user)):
    """Generate a unique code for Property Manager that tenants can use to join"""
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Only property managers can generate codes")
    
    db = await get_db()
    try:
        # Generate a 6-character alphanumeric code
        import random
        import string
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        
        # Update the PM's code
        await db.execute(
            "UPDATE users SET pm_code = ?, updated_at = ? WHERE id = ?",
            (code, datetime.utcnow().isoformat(), current_user.id)
        )
        await db.commit()
        
        return {"code": code, "message": "Code generated successfully"}
    finally:
        await db.close()

@api_router.get("/pm/my-code")
async def get_my_pm_code(current_user: User = Depends(get_current_user)):
    """Get the Property Manager's current code"""
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Only property managers can access this")
    
    db = await get_db()
    try:
        cursor = await db.execute("SELECT pm_code FROM users WHERE id = ?", (current_user.id,))
        row = await cursor.fetchone()
        return {"code": row[0] if row and row[0] else None}
    finally:
        await db.close()

@api_router.post("/tenant/join-pm")
async def tenant_join_pm(data: dict, current_user: User = Depends(get_current_user)):
    """Tenant joins a Property Manager using their code"""
    if current_user.user_type != "homeowner":
        raise HTTPException(status_code=403, detail="Only tenants can join property managers")
    
    code = data.get("code", "").strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Code is required")
    
    db = await get_db()
    try:
        # Find the Property Manager with this code
        cursor = await db.execute(
            "SELECT id, name, business_name FROM users WHERE pm_code = ? AND user_type = 'provider'",
            (code,)
        )
        pm_row = await cursor.fetchone()
        
        if not pm_row:
            raise HTTPException(status_code=404, detail="Invalid code. Please check and try again.")
        
        pm_id, pm_name, pm_business = pm_row
        
        # Update tenant's property_manager_id
        await db.execute(
            "UPDATE users SET property_manager_id = ?, updated_at = ? WHERE id = ?",
            (pm_id, datetime.utcnow().isoformat(), current_user.id)
        )
        await db.commit()
        
        return {
            "message": "Successfully joined!",
            "property_manager": {
                "id": pm_id,
                "name": pm_name,
                "business_name": pm_business
            }
        }
    finally:
        await db.close()

@api_router.get("/tenant/my-pm")
async def get_tenant_pm(current_user: User = Depends(get_current_user)):
    """Get the tenant's linked Property Manager"""
    if current_user.user_type != "homeowner":
        raise HTTPException(status_code=403, detail="Only tenants can access this")
    
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT property_manager_id FROM users WHERE id = ?",
            (current_user.id,)
        )
        row = await cursor.fetchone()
        
        if not row or not row[0]:
            return {"property_manager": None}
        
        # Get PM details
        cursor = await db.execute(
            "SELECT id, name, business_name, phone, email FROM users WHERE id = ?",
            (row[0],)
        )
        pm_row = await cursor.fetchone()
        
        if not pm_row:
            return {"property_manager": None}
        
        return {
            "property_manager": {
                "id": pm_row[0],
                "name": pm_row[1],
                "business_name": pm_row[2],
                "phone": pm_row[3],
                "email": pm_row[4]
            }
        }
    finally:
        await db.close()

@api_router.get("/pm/tenants")
async def get_pm_tenants(current_user: User = Depends(get_current_user)):
    """Get all tenants linked to this Property Manager"""
    if current_user.user_type != "provider":
        raise HTTPException(status_code=403, detail="Only property managers can access this")
    
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id, name, email, phone, address, created_at FROM users WHERE property_manager_id = ? AND user_type = 'homeowner'",
            (current_user.id,)
        )
        rows = await cursor.fetchall()
        
        tenants = []
        for row in rows:
            tenants.append({
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "phone": row[3],
                "address": row[4],
                "joined_at": row[5]
            })
        
        return tenants
    finally:
        await db.close()

@api_router.put("/providers/services")
async def update_provider_services(services: List[str], current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        await db.execute(
            "UPDATE users SET services = ?, updated_at = ? WHERE id = ?",
            (json.dumps(services), datetime.utcnow().isoformat(), current_user.id)
        )
        await db.commit()
        return {"message": "Services updated successfully", "services": services}
    finally:
        await db.close()

@api_router.put("/providers/profile")
async def update_provider_profile(profile_data: dict, current_user: User = Depends(get_current_user)):
    return await update_user_profile(profile_data, current_user)

# ====== SERVICES ENDPOINTS ======

@api_router.get("/services")
async def get_services():
    return [
        "Home Cleaning", "Office Cleaning", "Deep Cleaning", "Window Cleaning",
        "Carpet Cleaning", "Pressure Washing", "Gutter Cleaning", "Pool Cleaning",
        "Lawn Care", "Landscaping", "Tree Trimming", "Snow Removal",
        "Plumbing", "Electrical", "HVAC", "Appliance Repair",
        "Painting", "Carpentry", "Roofing", "Flooring",
        "Pest Control", "Home Security", "Moving Services", "Junk Removal"
    ]

# ====== ORDERS ENDPOINTS ======

@api_router.get("/orders")
async def get_orders(current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        if current_user.user_type == "provider":
            cursor = await db.execute(
                "SELECT * FROM orders WHERE provider_id = ? ORDER BY created_at DESC",
                (current_user.id,)
            )
        else:
            cursor = await db.execute(
                "SELECT * FROM orders WHERE homeowner_id = ? ORDER BY created_at DESC",
                (current_user.id,)
            )
        rows = await cursor.fetchall()
        orders = []
        for row in rows:
            order = row_to_dict(row)
            order['services'] = parse_json_field(order.get('services'))
            orders.append(order)
        return orders
    finally:
        await db.close()

@api_router.post("/orders")
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        order_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        is_manual = order_data.homeowner_id and order_data.homeowner_id.startswith('manual_')
        
        if is_manual:
            service_type = order_data.service_type or order_data.service or ''
            services_list = order_data.services or ([service_type] if service_type else [])
            
            quotation_amount = None
            if order_data.budget:
                try:
                    quotation_amount = float(order_data.budget.replace('$', '').replace(',', ''))
                except Exception:
                    pass
            
            await db.execute('''
                INSERT INTO orders (id, homeowner_id, provider_id, homeowner_name, homeowner_email,
                    homeowner_phone, homeowner_address, provider_name, service, service_type, services,
                    description, status, preferred_date, preferred_time, urgency, budget,
                    additional_requirements, quotation_amount, request_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                order_id, order_data.homeowner_id, current_user.id,
                order_data.homeowner_name or "Manual Customer",
                order_data.homeowner_email or "",
                order_data.homeowner_phone or "",
                order_data.homeowner_address or "",
                order_data.provider_name or current_user.business_name or current_user.name,
                service_type, service_type, json.dumps(services_list),
                order_data.description, "confirmed",
                order_data.preferred_date, order_data.preferred_time or "09:00",
                order_data.urgency or "medium", order_data.budget,
                order_data.additional_requirements, quotation_amount,
                now, now, now
            ))
            await db.commit()
            
            return {
                "message": "Order created successfully",
                "order_id": order_id,
                "id": order_id,
                "status": "confirmed"
            }
        else:
            cursor = await db.execute(
                "SELECT * FROM users WHERE id = ? AND user_type = 'provider'",
                (order_data.provider_id,)
            )
            provider = await cursor.fetchone()
            if not provider:
                raise HTTPException(status_code=404, detail="Provider not found")
            provider_dict = row_to_dict(provider)
            
            await db.execute('''
                INSERT INTO orders (id, homeowner_id, provider_id, homeowner_name, homeowner_email,
                    homeowner_phone, homeowner_address, provider_name, service, service_type,
                    description, status, amount, preferred_date, preferred_time, urgency, budget,
                    property_size, additional_requirements, request_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                order_id, current_user.id, order_data.provider_id,
                current_user.name, current_user.email,
                current_user.phone or "", current_user.address or "",
                provider_dict.get('business_name') or provider_dict.get('name'),
                order_data.service, order_data.service,
                order_data.description, "pending_quotation",
                order_data.amount, order_data.preferred_date, order_data.preferred_time,
                order_data.urgency, order_data.budget, order_data.property_size,
                order_data.additional_requirements, now, now, now
            ))
            await db.commit()
            
            return {
                "message": "Quotation request sent successfully",
                "order_id": order_id,
                "id": order_id,
                "status": "pending_quotation"
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Order creation error: {e}", file=sys.stderr, flush=True)
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")
    finally:
        await db.close()

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status_data: dict, current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        await db.execute(
            "UPDATE orders SET status = ?, updated_at = ? WHERE id = ?",
            (status_data.get('status'), datetime.utcnow().isoformat(), order_id)
        )
        await db.commit()
        return {"message": "Order status updated", "status": status_data.get('status')}
    finally:
        await db.close()

@api_router.put("/orders/{order_id}")
async def update_order(order_id: str, order_data: dict, current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        allowed_fields = ['status', 'quotation_amount', 'quotation_details', 'quotation_valid_until',
                         'preferred_date', 'preferred_time', 'description', 'notes']
        updates = []
        values = []
        for field in allowed_fields:
            if field in order_data:
                updates.append(f"{field} = ?")
                values.append(order_data[field])
        
        if updates:
            values.append(datetime.utcnow().isoformat())
            values.append(order_id)
            query = f"UPDATE orders SET {', '.join(updates)}, updated_at = ? WHERE id = ?"
            await db.execute(query, values)
            await db.commit()
        
        cursor = await db.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        order = await cursor.fetchone()
        return row_to_dict(order)
    finally:
        await db.close()

@api_router.delete("/orders/{order_id}")
async def delete_order(order_id: str, current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        await db.execute("DELETE FROM orders WHERE id = ?", (order_id,))
        await db.commit()
        return {"message": "Order deleted successfully"}
    finally:
        await db.close()

# ====== MESSAGES ENDPOINTS ======

@api_router.post("/messages")
async def send_message(message_data: MessageCreate, current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        message_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        if message_data.thread_id or message_data.content:
            conversation_id = message_data.thread_id
            message_content = message_data.content or message_data.message
            
            if conversation_id and '_' in conversation_id:
                parts = conversation_id.split('_')
                recipient_id = parts[1] if parts[0] == current_user.id else parts[0]
            else:
                recipient_id = message_data.recipient_id
            
            if not recipient_id:
                raise HTTPException(status_code=400, detail="Recipient ID is required")
        else:
            recipient_id = message_data.recipient_id
            message_content = message_data.message
            ids = sorted([current_user.id, recipient_id])
            conversation_id = f"{ids[0]}_{ids[1]}"
        
        await db.execute('''
            INSERT INTO messages (id, conversation_id, sender_id, recipient_id, message, timestamp, is_read)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (message_id, conversation_id, current_user.id, recipient_id, message_content, now, 0))
        await db.commit()
        
        return {
            "message": "Message sent successfully",
            "message_id": message_id,
            "conversation_id": conversation_id
        }
    finally:
        await db.close()

@api_router.get("/messages/threads")
async def get_message_threads(current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        cursor = await db.execute('''
            SELECT DISTINCT conversation_id FROM messages 
            WHERE sender_id = ? OR recipient_id = ?
        ''', (current_user.id, current_user.id))
        rows = await cursor.fetchall()
        
        threads = []
        for row in rows:
            conv_id = row['conversation_id']
            parts = conv_id.split('_') if conv_id and '_' in conv_id else []
            other_id = parts[1] if parts and parts[0] == current_user.id else (parts[0] if parts else None)
            
            if other_id:
                user_cursor = await db.execute("SELECT * FROM users WHERE id = ?", (other_id,))
                other_user = await user_cursor.fetchone()
                
                msg_cursor = await db.execute('''
                    SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT 1
                ''', (conv_id,))
                last_msg = await msg_cursor.fetchone()
                
                unread_cursor = await db.execute('''
                    SELECT COUNT(*) as count FROM messages 
                    WHERE conversation_id = ? AND recipient_id = ? AND is_read = 0
                ''', (conv_id, current_user.id))
                unread = await unread_cursor.fetchone()
                
                threads.append({
                    "conversation_id": conv_id,
                    "other_user": user_to_response(row_to_dict(other_user)) if other_user else None,
                    "last_message": row_to_dict(last_msg) if last_msg else None,
                    "unread_count": unread['count'] if unread else 0
                })
        
        return threads
    finally:
        await db.close()

@api_router.get("/messages/{thread_id}")
async def get_messages(thread_id: str, current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        cursor = await db.execute('''
            SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC
        ''', (thread_id,))
        rows = await cursor.fetchall()
        
        await db.execute('''
            UPDATE messages SET is_read = 1 
            WHERE conversation_id = ? AND recipient_id = ?
        ''', (thread_id, current_user.id))
        await db.commit()
        
        return [row_to_dict(row) for row in rows]
    finally:
        await db.close()

# ====== APPOINTMENTS ENDPOINTS ======

@api_router.post("/appointments")
async def create_appointment(appointment_data: dict, current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        appointment_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        await db.execute('''
            INSERT INTO appointments (id, provider_id, customer_name, customer_phone, customer_email,
                service_type, date, time, duration, notes, status, created_at, order_id, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            appointment_id, current_user.id,
            appointment_data.get('customer_name'),
            appointment_data.get('customer_phone'),
            appointment_data.get('customer_email'),
            appointment_data.get('service_type'),
            appointment_data.get('date'),
            appointment_data.get('time'),
            appointment_data.get('duration', 60),
            appointment_data.get('notes'),
            'scheduled', now,
            appointment_data.get('order_id'),
            appointment_data.get('source', 'manual')
        ))
        await db.commit()
        
        return {"message": "Appointment created", "appointment_id": appointment_id}
    finally:
        await db.close()

@api_router.get("/appointments")
async def get_appointments(current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM appointments WHERE provider_id = ? ORDER BY date, time",
            (current_user.id,)
        )
        rows = await cursor.fetchall()
        return [row_to_dict(row) for row in rows]
    finally:
        await db.close()

@api_router.put("/appointments/{appointment_id}")
async def update_appointment(appointment_id: str, appointment_data: dict, current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        allowed_fields = ['customer_name', 'customer_phone', 'customer_email', 'service_type',
                         'date', 'time', 'duration', 'notes', 'status']
        updates = []
        values = []
        for field in allowed_fields:
            if field in appointment_data:
                updates.append(f"{field} = ?")
                values.append(appointment_data[field])
        
        if updates:
            values.append(appointment_id)
            query = f"UPDATE appointments SET {', '.join(updates)} WHERE id = ?"
            await db.execute(query, values)
            await db.commit()
        
        return {"message": "Appointment updated"}
    finally:
        await db.close()

@api_router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str, current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        await db.execute("DELETE FROM appointments WHERE id = ?", (appointment_id,))
        await db.commit()
        return {"message": "Appointment deleted"}
    finally:
        await db.close()

# ====== CUSTOMERS ENDPOINTS ======

@api_router.get("/customers")
async def get_customers(current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM customers WHERE provider_id = ?",
            (current_user.id,)
        )
        rows = await cursor.fetchall()
        return [row_to_dict(row) for row in rows]
    finally:
        await db.close()

@api_router.post("/customers")
async def create_customer(customer_data: dict, current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        customer_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        await db.execute('''
            INSERT INTO customers (id, provider_id, name, email, phone, address,
                total_orders, total_spent, rating, last_order, status, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            customer_id, current_user.id,
            customer_data.get('name'),
            customer_data.get('email', 'Not provided'),
            customer_data.get('phone', 'N/A'),
            customer_data.get('address', 'N/A'),
            customer_data.get('total_orders', 0),
            float(customer_data.get('total_spent', 0)),
            customer_data.get('rating', 0),
            customer_data.get('last_order'),
            customer_data.get('status', 'active'),
            customer_data.get('notes', ''),
            now
        ))
        await db.commit()
        
        cursor = await db.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))
        customer = await cursor.fetchone()
        return row_to_dict(customer)
    finally:
        await db.close()

@api_router.put("/customers/{customer_id}")
async def update_customer(customer_id: str, customer_data: dict, current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        allowed_fields = ['name', 'email', 'phone', 'address', 'total_orders', 'total_spent', 'rating', 'status', 'notes']
        updates = []
        values = []
        for field in allowed_fields:
            if field in customer_data:
                updates.append(f"{field} = ?")
                values.append(customer_data[field])
        
        if updates:
            values.append(customer_id)
            values.append(current_user.id)
            query = f"UPDATE customers SET {', '.join(updates)} WHERE id = ? AND provider_id = ?"
            await db.execute(query, values)
            await db.commit()
        
        cursor = await db.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))
        customer = await cursor.fetchone()
        return row_to_dict(customer)
    finally:
        await db.close()

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str, current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        await db.execute(
            "DELETE FROM customers WHERE id = ? AND provider_id = ?",
            (customer_id, current_user.id)
        )
        await db.commit()
        return {"message": "Customer deleted successfully"}
    finally:
        await db.close()

# ====== NOTIFICATIONS ENDPOINTS ======

@api_router.get("/notifications/count")
async def get_notification_count(current_user: User = Depends(get_current_user)):
    db = await get_db()
    try:
        cursor = await db.execute('''
            SELECT COUNT(*) as count FROM messages 
            WHERE recipient_id = ? AND is_read = 0
        ''', (current_user.id,))
        msg_row = await cursor.fetchone()
        unread_messages = msg_row['count'] if msg_row else 0
        
        pending_orders = 0
        if current_user.user_type == "provider":
            cursor = await db.execute('''
                SELECT COUNT(*) as count FROM orders 
                WHERE provider_id = ? AND status = 'pending_quotation'
            ''', (current_user.id,))
            order_row = await cursor.fetchone()
            pending_orders = order_row['count'] if order_row else 0
        
        return {
            "unread_messages": unread_messages,
            "pending_orders": pending_orders,
            "total": unread_messages + pending_orders
        }
    finally:
        await db.close()

# ====== AI ISSUE REPORTING ENDPOINTS ======

@api_router.post("/ai/summarize-issue")
async def summarize_issue(data: dict, current_user: User = Depends(get_current_user)):
    """Use Gemini AI to summarize a tenant's issue description"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        session_id = f"issue_{current_user.id}_{uuid.uuid4().hex[:8]}"
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message="""You are a helpful property management assistant. Your job is to:
1. Listen to tenant issue descriptions
2. Ask clarifying questions if needed
3. Create a clear, concise summary of the issue for the property manager

Be professional, empathetic, and efficient. Focus on understanding:
- What is the problem?
- Where is it located?
- How urgent is it?
- When did it start?

Keep your responses brief and helpful."""
        ).with_model("gemini", "gemini-2.5-flash")
        
        user_message = UserMessage(text=data.get('message', ''))
        response = await chat.send_message(user_message)
        
        return {
            "response": response,
            "session_id": session_id
        }
    except Exception as e:
        print(f"AI summarize error: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@api_router.post("/ai/generate-summary")
async def generate_summary(data: dict, current_user: User = Depends(get_current_user)):
    """Generate a final summary of the issue for property manager"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        # Extract data
        description = data.get('description', '')
        form_data = data.get('form_data', {})
        
        summary_prompt = f"""Based on the following tenant issue report, create a clear and professional summary for the property manager:

TENANT'S DESCRIPTION:
{description}

FORM DETAILS:
- Unit/Apartment: {form_data.get('unit_number', 'Not provided')}
- Issue Category: {form_data.get('issue_category', 'Not specified')}
- Urgency Level: {form_data.get('urgency_level', 'Not specified')}
- Best Time for Visit: {form_data.get('best_time', 'Not specified')}
- Permission to Enter: {form_data.get('permission_to_enter', 'Not specified')}
- Additional Notes: {form_data.get('additional_notes', 'None')}

Please provide:
1. A brief title for this issue (max 10 words)
2. A summary paragraph (2-3 sentences)
3. Recommended priority level (Emergency/High/Medium/Low)
4. Suggested next steps for property manager"""

        chat = LlmChat(
            api_key=api_key,
            session_id=f"summary_{uuid.uuid4().hex[:8]}",
            system_message="You are a property management assistant. Generate clear, professional summaries of maintenance issues."
        ).with_model("gemini", "gemini-2.5-flash")
        
        user_message = UserMessage(text=summary_prompt)
        response = await chat.send_message(user_message)
        
        return {"summary": response}
    except Exception as e:
        print(f"AI summary error: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

# ====== REPORTED ISSUES ENDPOINTS ======

@api_router.post("/issues")
async def create_issue(issue_data: dict, current_user: User = Depends(get_current_user)):
    """Create a new reported issue from tenant"""
    db = await get_db()
    try:
        issue_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        await db.execute('''
            INSERT INTO reported_issues (
                id, tenant_id, tenant_name, tenant_email, tenant_phone,
                property_manager_id, unit_number, issue_category, urgency_level,
                description, ai_summary, best_time, permission_to_enter, photos,
                status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            issue_id,
            current_user.id,
            issue_data.get('tenant_name', current_user.name),
            issue_data.get('tenant_email', current_user.email),
            issue_data.get('tenant_phone', current_user.phone),
            issue_data.get('property_manager_id'),
            issue_data.get('unit_number'),
            issue_data.get('issue_category'),
            issue_data.get('urgency_level'),
            issue_data.get('description'),
            issue_data.get('ai_summary'),
            issue_data.get('best_time'),
            issue_data.get('permission_to_enter'),
            json.dumps(issue_data.get('photos', [])),
            'pending',
            now, now
        ))
        await db.commit()
        
        return {
            "message": "Issue reported successfully",
            "issue_id": issue_id
        }
    finally:
        await db.close()

@api_router.get("/issues")
async def get_issues(current_user: User = Depends(get_current_user)):
    """Get issues - for tenants (their issues) or property managers (all assigned issues)"""
    db = await get_db()
    try:
        if current_user.user_type == "homeowner":
            # Tenant sees their own issues
            cursor = await db.execute('''
                SELECT * FROM reported_issues 
                WHERE tenant_id = ?
                ORDER BY created_at DESC
            ''', (current_user.id,))
        else:
            # Property manager sees issues assigned to them
            cursor = await db.execute('''
                SELECT * FROM reported_issues 
                WHERE property_manager_id = ?
                ORDER BY created_at DESC
            ''', (current_user.id,))
        
        rows = await cursor.fetchall()
        issues = []
        for row in rows:
            issue = row_to_dict(row)
            if issue.get('photos'):
                issue['photos'] = parse_json_field(issue['photos'])
            issues.append(issue)
        
        return issues
    finally:
        await db.close()

@api_router.get("/issues/{issue_id}")
async def get_issue(issue_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific issue"""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM reported_issues WHERE id = ?",
            (issue_id,)
        )
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Issue not found")
        
        issue = row_to_dict(row)
        if issue.get('photos'):
            issue['photos'] = parse_json_field(issue['photos'])
        
        return issue
    finally:
        await db.close()

@api_router.put("/issues/{issue_id}")
async def update_issue(issue_id: str, issue_data: dict, current_user: User = Depends(get_current_user)):
    """Update an issue status or add resolution notes"""
    db = await get_db()
    try:
        now = datetime.utcnow().isoformat()
        
        update_fields = ["updated_at = ?"]
        values = [now]
        
        if 'status' in issue_data:
            update_fields.append("status = ?")
            values.append(issue_data['status'])
            if issue_data['status'] == 'resolved':
                update_fields.append("resolved_at = ?")
                values.append(now)
        
        if 'resolution_notes' in issue_data:
            update_fields.append("resolution_notes = ?")
            values.append(issue_data['resolution_notes'])
        
        values.append(issue_id)
        
        await db.execute(f'''
            UPDATE reported_issues 
            SET {', '.join(update_fields)}
            WHERE id = ?
        ''', tuple(values))
        await db.commit()
        
        return {"message": "Issue updated successfully"}
    finally:
        await db.close()

# ====== HEALTH CHECK ======

@app.get("/health")
async def health_check():
    try:
        db = await get_db()
        cursor = await db.execute("SELECT 1")
        await cursor.fetchone()
        await db.close()
        return {"status": "healthy", "database": "connected", "type": "SQLite"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# Include the API router
app.include_router(api_router)

# ====== CORS CONFIGURATION ======
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Main entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
