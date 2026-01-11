# Backend Models - Pydantic schemas for request/response validation
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# ====== AUTH MODELS ======

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

# ====== ORDER MODELS ======

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

# ====== ISSUE MODELS ======

class IssueCreate(BaseModel):
    property_manager_id: Optional[str] = None
    unit_number: Optional[str] = None
    issue_category: Optional[str] = None
    issue_size: Optional[str] = "medium"  # NEW: small, medium, big
    urgency_level: Optional[str] = None
    description: Optional[str] = None
    ai_summary: Optional[str] = None
    best_time: Optional[str] = None
    permission_to_enter: Optional[str] = None
    photos: Optional[List[str]] = None
    tenant_name: Optional[str] = None
    tenant_email: Optional[str] = None
    tenant_phone: Optional[str] = None

class IssueUpdate(BaseModel):
    status: Optional[str] = None
    resolution_notes: Optional[str] = None
    issue_size: Optional[str] = None

# ====== QUOTE MODELS ======

class QuoteSubmit(BaseModel):
    quotation_amount: float
    quotation_details: Optional[str] = None
    quotation_valid_until: Optional[str] = None
    estimated_duration: Optional[str] = None  # NEW: for calendar scheduling

# ====== MESSAGE MODELS ======

class MessageCreate(BaseModel):
    recipient_id: Optional[str] = None
    message: Optional[str] = None
    thread_id: Optional[str] = None
    content: Optional[str] = None

# ====== APPOINTMENT/CALENDAR MODELS ======

class AppointmentCreate(BaseModel):
    order_id: Optional[str] = None
    issue_id: Optional[str] = None
    provider_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    service_type: Optional[str] = None
    date: str
    time: str
    duration: Optional[int] = 60
    notes: Optional[str] = None
    source: Optional[str] = "manual"  # manual, quote_approved, pm_scheduled

class AppointmentUpdate(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    duration: Optional[int] = None
    notes: Optional[str] = None
    status: Optional[str] = None
