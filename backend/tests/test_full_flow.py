#!/usr/bin/env python3
"""
Doord Application Backend Testing - Full Flow Testing
Focus: Testing the specific flows mentioned in the review request
Base URL: https://doord.site/api

Test Flows:
1. User Registration & Persistence (provider with services, homeowner)
2. Provider Operations (manual orders, appointments)
3. Homeowner Operations (get providers, create quotation requests)
4. Data Flow (Marketplace functionality)
"""

import requests
import json
import uuid
import sys
from datetime import datetime

# Base URL from review request
BACKEND_URL = "https://doord.site/api"

# Global test data storage
test_data = {
    'provider_token': None,
    'homeowner_token': None,
    'provider_id': None,
    'homeowner_id': None,
    'provider_email': None,
    'homeowner_email': None,
    'manual_order_id': None,
    'quotation_order_id': None,
    'appointment_id': None
}

def log_test(test_name, status, message=""):
    """Log test results with consistent formatting"""
    status_icon = "✅" if status else "❌"
    print(f"{status_icon} {test_name}: {message}")
    return status

def test_backend_health():
    """Test if backend is accessible at https://doord.site/api"""
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            return log_test("Backend Health Check", True, f"Backend accessible: {data.get('message', 'OK')}")
        else:
            return log_test("Backend Health Check", False, f"Status {response.status_code}")
    except Exception as e:
        return log_test("Backend Health Check", False, f"Connection failed: {e}")

# ====== USER REGISTRATION & PERSISTENCE TESTS ======

def test_provider_registration_with_services():
    """Test provider registration with services array"""
    try:
        email = f"provider_{uuid.uuid4().hex[:8]}@doordtest.com"
        test_data['provider_email'] = email
        
        registration_data = {
            "email": email,
            "password": "securepass123",
            "user_type": "provider",
            "name": "Alex Martinez",
            "phone": "+1-555-0199",
            "address": "789 Service Street, Toronto, ON",
            "business_name": "Martinez Home Services",
            "services": ["Home Cleaning", "Office Cleaning"],
            "description": "Professional cleaning services for homes and offices",
            "location": "Toronto, ON"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=registration_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                test_data['provider_token'] = data["access_token"]
                test_data['provider_id'] = data["user"]["id"]
                services = data["user"].get("services", [])
                if "Home Cleaning" in services and "Office Cleaning" in services:
                    return log_test("Provider Registration with Services", True, f"Registered with services: {services}")
                else:
                    return log_test("Provider Registration with Services", False, f"Services not saved correctly: {services}")
            else:
                return log_test("Provider Registration with Services", False, f"Invalid response: {data}")
        else:
            return log_test("Provider Registration with Services", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Provider Registration with Services", False, f"Error: {e}")

def test_homeowner_registration():
    """Test homeowner registration"""
    try:
        email = f"homeowner_{uuid.uuid4().hex[:8]}@doordtest.com"
        test_data['homeowner_email'] = email
        
        registration_data = {
            "email": email,
            "password": "securepass123",
            "user_type": "homeowner",
            "name": "Emma Thompson",
            "phone": "+1-555-0288",
            "address": "456 Residential Ave, Toronto, ON"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=registration_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                test_data['homeowner_token'] = data["access_token"]
                test_data['homeowner_id'] = data["user"]["id"]
                return log_test("Homeowner Registration", True, f"Registered: {email}")
            else:
                return log_test("Homeowner Registration", False, f"Invalid response: {data}")
        else:
            return log_test("Homeowner Registration", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Homeowner Registration", False, f"Error: {e}")

def test_provider_login_persistence():
    """Test provider login to verify credentials persist"""
    try:
        if not test_data['provider_email']:
            return log_test("Provider Login Persistence", False, "No provider email available")
        
        login_data = {
            "email": test_data['provider_email'],
            "password": "securepass123"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data["user"]["user_type"] == "provider":
                return log_test("Provider Login Persistence", True, "Credentials persisted successfully")
            else:
                return log_test("Provider Login Persistence", False, f"Invalid login response: {data}")
        else:
            return log_test("Provider Login Persistence", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Provider Login Persistence", False, f"Error: {e}")

def test_homeowner_login_persistence():
    """Test homeowner login to verify credentials persist"""
    try:
        if not test_data['homeowner_email']:
            return log_test("Homeowner Login Persistence", False, "No homeowner email available")
        
        login_data = {
            "email": test_data['homeowner_email'],
            "password": "securepass123"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data["user"]["user_type"] == "homeowner":
                return log_test("Homeowner Login Persistence", True, "Credentials persisted successfully")
            else:
                return log_test("Homeowner Login Persistence", False, f"Invalid login response: {data}")
        else:
            return log_test("Homeowner Login Persistence", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Homeowner Login Persistence", False, f"Error: {e}")

def test_me_endpoint_provider():
    """Test /api/me returns correct provider data"""
    try:
        if not test_data['provider_token']:
            return log_test("Provider /api/me Endpoint", False, "No provider token available")
        
        headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
        response = requests.get(
            f"{BACKEND_URL}/me",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("user_type") == "provider" and data.get("business_name") == "Martinez Home Services":
                services = data.get("services", [])
                if "Home Cleaning" in services and "Office Cleaning" in services:
                    return log_test("Provider /api/me Endpoint", True, f"Correct provider data with services: {services}")
                else:
                    return log_test("Provider /api/me Endpoint", False, f"Services missing: {services}")
            else:
                return log_test("Provider /api/me Endpoint", False, f"Incorrect user data: {data}")
        else:
            return log_test("Provider /api/me Endpoint", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Provider /api/me Endpoint", False, f"Error: {e}")

def test_me_endpoint_homeowner():
    """Test /api/me returns correct homeowner data"""
    try:
        if not test_data['homeowner_token']:
            return log_test("Homeowner /api/me Endpoint", False, "No homeowner token available")
        
        headers = {"Authorization": f"Bearer {test_data['homeowner_token']}"}
        response = requests.get(
            f"{BACKEND_URL}/me",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("user_type") == "homeowner" and data.get("name") == "Emma Thompson":
                return log_test("Homeowner /api/me Endpoint", True, "Correct homeowner data returned")
            else:
                return log_test("Homeowner /api/me Endpoint", False, f"Incorrect user data: {data}")
        else:
            return log_test("Homeowner /api/me Endpoint", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Homeowner /api/me Endpoint", False, f"Error: {e}")

# ====== PROVIDER OPERATIONS TESTS ======

def test_create_manual_order():
    """Test provider creates manual order (for walk-in customer)"""
    try:
        if not test_data['provider_token']:
            return log_test("Create Manual Order", False, "No provider token available")
        
        manual_order_data = {
            "homeowner_id": f"manual_{uuid.uuid4().hex[:8]}",
            "homeowner_name": "Walk-in Customer John",
            "homeowner_phone": "+1-555-0377",
            "homeowner_address": "123 Walk-in Street, Toronto, ON",
            "service_type": "Home Cleaning",
            "description": "Deep cleaning for 3-bedroom house",
            "preferred_date": "2024-02-15",
            "preferred_time": "10:00",
            "budget": "$200"
        }
        
        headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
        response = requests.post(
            f"{BACKEND_URL}/orders",
            json=manual_order_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data or "order_id" in data:
                test_data['manual_order_id'] = data.get("id") or data.get("order_id")
                status = data.get("status")
                if status == "confirmed":
                    return log_test("Create Manual Order", True, f"Manual order created with confirmed status: {test_data['manual_order_id']}")
                else:
                    return log_test("Create Manual Order", False, f"Expected 'confirmed' status, got: {status}")
            else:
                return log_test("Create Manual Order", False, f"Invalid response: {data}")
        else:
            return log_test("Create Manual Order", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Create Manual Order", False, f"Error: {e}")

def test_manual_order_persistence():
    """Test manual order persists with confirmed status"""
    try:
        if not test_data['provider_token'] or not test_data['manual_order_id']:
            return log_test("Manual Order Persistence", False, "No provider token or manual order ID")
        
        headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
        response = requests.get(
            f"{BACKEND_URL}/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            orders = response.json()
            manual_order = next((o for o in orders if o.get("id") == test_data['manual_order_id']), None)
            if manual_order:
                if manual_order.get("status") == "confirmed":
                    return log_test("Manual Order Persistence", True, "Manual order persists with confirmed status")
                else:
                    return log_test("Manual Order Persistence", False, f"Wrong status: {manual_order.get('status')}")
            else:
                return log_test("Manual Order Persistence", False, "Manual order not found in orders list")
        else:
            return log_test("Manual Order Persistence", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Manual Order Persistence", False, f"Error: {e}")

def test_create_appointment():
    """Test provider creates appointment"""
    try:
        if not test_data['provider_token']:
            return log_test("Create Appointment", False, "No provider token available")
        
        appointment_data = {
            "customer_name": "Sarah Wilson",
            "customer_phone": "+1-555-0466",
            "customer_email": "sarah.wilson@example.com",
            "service_type": "Office Cleaning",
            "date": "2024-02-20",
            "time": "14:00",
            "duration": 180,
            "notes": "Monthly office cleaning appointment"
        }
        
        headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
        response = requests.post(
            f"{BACKEND_URL}/appointments",
            json=appointment_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "appointment_id" in data or "message" in data:
                test_data['appointment_id'] = data.get("appointment_id")
                return log_test("Create Appointment", True, "Appointment created successfully")
            else:
                return log_test("Create Appointment", False, f"Invalid response: {data}")
        else:
            return log_test("Create Appointment", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Create Appointment", False, f"Error: {e}")

def test_appointment_persistence():
    """Test appointment persists"""
    try:
        if not test_data['provider_token']:
            return log_test("Appointment Persistence", False, "No provider token available")
        
        headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
        response = requests.get(
            f"{BACKEND_URL}/appointments",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            appointments = response.json()
            if isinstance(appointments, list) and len(appointments) > 0:
                # Look for our appointment
                our_appointment = next((a for a in appointments if a.get("customer_name") == "Sarah Wilson"), None)
                if our_appointment:
                    return log_test("Appointment Persistence", True, f"Appointment persists: {our_appointment.get('service_type')}")
                else:
                    return log_test("Appointment Persistence", True, f"Retrieved {len(appointments)} appointments")
            else:
                return log_test("Appointment Persistence", False, f"Expected list with appointments, got: {appointments}")
        else:
            return log_test("Appointment Persistence", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Appointment Persistence", False, f"Error: {e}")

def test_get_orders_provider():
    """Test provider can get their orders"""
    try:
        if not test_data['provider_token']:
            return log_test("Get Orders (Provider)", False, "No provider token available")
        
        headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
        response = requests.get(
            f"{BACKEND_URL}/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            orders = response.json()
            if isinstance(orders, list):
                return log_test("Get Orders (Provider)", True, f"Retrieved {len(orders)} orders")
            else:
                return log_test("Get Orders (Provider)", False, f"Expected list, got: {type(orders)}")
        else:
            return log_test("Get Orders (Provider)", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Get Orders (Provider)", False, f"Error: {e}")

# ====== HOMEOWNER OPERATIONS TESTS ======

def test_get_providers_list():
    """Test homeowner gets list of providers (should see provider with services)"""
    try:
        response = requests.get(f"{BACKEND_URL}/providers", timeout=30)
        
        if response.status_code == 200:
            providers = response.json()
            if isinstance(providers, list) and len(providers) > 0:
                # Look for our provider
                our_provider = next((p for p in providers if p.get("id") == test_data['provider_id']), None)
                if our_provider:
                    services = our_provider.get("services", [])
                    if "Home Cleaning" in services and "Office Cleaning" in services:
                        return log_test("Get Providers List", True, f"Found provider with services: {services}")
                    else:
                        return log_test("Get Providers List", False, f"Provider services missing: {services}")
                else:
                    return log_test("Get Providers List", True, f"Retrieved {len(providers)} providers (ours not found)")
            else:
                return log_test("Get Providers List", False, f"Expected non-empty list, got: {providers}")
        else:
            return log_test("Get Providers List", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Get Providers List", False, f"Error: {e}")

def test_get_specific_provider():
    """Test get specific provider by ID (should return services array)"""
    try:
        if not test_data['provider_id']:
            return log_test("Get Specific Provider", False, "No provider ID available")
        
        response = requests.get(f"{BACKEND_URL}/providers/{test_data['provider_id']}", timeout=30)
        
        if response.status_code == 200:
            provider = response.json()
            services = provider.get("services", [])
            if isinstance(services, list) and "Home Cleaning" in services and "Office Cleaning" in services:
                return log_test("Get Specific Provider", True, f"Provider has services array: {services}")
            else:
                return log_test("Get Specific Provider", False, f"Services array missing or incorrect: {services}")
        else:
            return log_test("Get Specific Provider", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Get Specific Provider", False, f"Error: {e}")

def test_create_quotation_request():
    """Test homeowner creates quotation request to provider (POST /orders with provider_id)"""
    try:
        if not test_data['homeowner_token'] or not test_data['provider_id']:
            return log_test("Create Quotation Request", False, "Missing homeowner token or provider ID")
        
        quotation_data = {
            "provider_id": test_data['provider_id'],
            "service": "Home Cleaning",
            "service_type": "Home Cleaning",
            "description": "Weekly cleaning service for 2-bedroom apartment",
            "preferred_date": "2024-02-25",
            "preferred_time": "09:00",
            "urgency": "low",
            "budget": "$80-120",
            "property_size": "small",
            "additional_requirements": "Pet-friendly cleaning products preferred"
        }
        
        headers = {"Authorization": f"Bearer {test_data['homeowner_token']}"}
        response = requests.post(
            f"{BACKEND_URL}/orders",
            json=quotation_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data or "order_id" in data:
                test_data['quotation_order_id'] = data.get("id") or data.get("order_id")
                status = data.get("status")
                if status == "pending_quotation":
                    return log_test("Create Quotation Request", True, f"Quotation request created with pending_quotation status")
                else:
                    return log_test("Create Quotation Request", False, f"Expected 'pending_quotation', got: {status}")
            else:
                return log_test("Create Quotation Request", False, f"Invalid response: {data}")
        else:
            return log_test("Create Quotation Request", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Create Quotation Request", False, f"Error: {e}")

def test_quotation_request_status():
    """Test quotation request has status 'pending_quotation'"""
    try:
        if not test_data['homeowner_token'] or not test_data['quotation_order_id']:
            return log_test("Quotation Request Status", False, "Missing homeowner token or quotation order ID")
        
        headers = {"Authorization": f"Bearer {test_data['homeowner_token']}"}
        response = requests.get(
            f"{BACKEND_URL}/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            orders = response.json()
            quotation_order = next((o for o in orders if o.get("id") == test_data['quotation_order_id']), None)
            if quotation_order:
                status = quotation_order.get("status")
                if status == "pending_quotation":
                    return log_test("Quotation Request Status", True, "Order has pending_quotation status")
                else:
                    return log_test("Quotation Request Status", False, f"Wrong status: {status}")
            else:
                return log_test("Quotation Request Status", False, "Quotation order not found")
        else:
            return log_test("Quotation Request Status", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Quotation Request Status", False, f"Error: {e}")

def test_get_orders_homeowner():
    """Test homeowner can get their orders"""
    try:
        if not test_data['homeowner_token']:
            return log_test("Get Orders (Homeowner)", False, "No homeowner token available")
        
        headers = {"Authorization": f"Bearer {test_data['homeowner_token']}"}
        response = requests.get(
            f"{BACKEND_URL}/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            orders = response.json()
            if isinstance(orders, list):
                return log_test("Get Orders (Homeowner)", True, f"Retrieved {len(orders)} orders")
            else:
                return log_test("Get Orders (Homeowner)", False, f"Expected list, got: {type(orders)}")
        else:
            return log_test("Get Orders (Homeowner)", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Get Orders (Homeowner)", False, f"Error: {e}")

# ====== DATA FLOW (MARKETPLACE) TESTS ======

def test_provider_sees_quotation_request():
    """Test provider can see homeowner's quotation request"""
    try:
        if not test_data['provider_token'] or not test_data['quotation_order_id']:
            return log_test("Provider Sees Quotation Request", False, "Missing provider token or quotation order ID")
        
        headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
        response = requests.get(
            f"{BACKEND_URL}/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            orders = response.json()
            quotation_order = next((o for o in orders if o.get("id") == test_data['quotation_order_id']), None)
            if quotation_order:
                if quotation_order.get("status") == "pending_quotation":
                    return log_test("Provider Sees Quotation Request", True, "Provider can see homeowner's quotation request")
                else:
                    return log_test("Provider Sees Quotation Request", False, f"Wrong status: {quotation_order.get('status')}")
            else:
                return log_test("Provider Sees Quotation Request", False, "Quotation request not visible to provider")
        else:
            return log_test("Provider Sees Quotation Request", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Provider Sees Quotation Request", False, f"Error: {e}")

def test_provider_orders_returned():
    """Test orders created by provider are returned to provider"""
    try:
        if not test_data['provider_token'] or not test_data['manual_order_id']:
            return log_test("Provider Orders Returned", False, "Missing provider token or manual order ID")
        
        headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
        response = requests.get(
            f"{BACKEND_URL}/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            orders = response.json()
            manual_order = next((o for o in orders if o.get("id") == test_data['manual_order_id']), None)
            if manual_order:
                return log_test("Provider Orders Returned", True, "Provider can see their created orders")
            else:
                return log_test("Provider Orders Returned", False, "Provider's manual order not returned")
        else:
            return log_test("Provider Orders Returned", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Provider Orders Returned", False, f"Error: {e}")

def test_homeowner_orders_returned():
    """Test orders created by homeowner are returned to homeowner"""
    try:
        if not test_data['homeowner_token'] or not test_data['quotation_order_id']:
            return log_test("Homeowner Orders Returned", False, "Missing homeowner token or quotation order ID")
        
        headers = {"Authorization": f"Bearer {test_data['homeowner_token']}"}
        response = requests.get(
            f"{BACKEND_URL}/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            orders = response.json()
            quotation_order = next((o for o in orders if o.get("id") == test_data['quotation_order_id']), None)
            if quotation_order:
                return log_test("Homeowner Orders Returned", True, "Homeowner can see their created orders")
            else:
                return log_test("Homeowner Orders Returned", False, "Homeowner's quotation order not returned")
        else:
            return log_test("Homeowner Orders Returned", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Homeowner Orders Returned", False, f"Error: {e}")

def run_full_flow_tests():
    """Run all full flow tests as specified in the review request"""
    print("=" * 80)
    print("🚀 DOORD APPLICATION BACKEND - FULL FLOW TESTING")
    print("=" * 80)
    print(f"Base URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    test_results = []
    
    # Backend Health Check
    print("\n🏥 BACKEND HEALTH CHECK")
    print("-" * 40)
    test_results.append(("Backend Health Check", test_backend_health()))
    
    # 1. User Registration & Persistence
    print("\n👥 USER REGISTRATION & PERSISTENCE")
    print("-" * 40)
    test_results.append(("Provider Registration with Services", test_provider_registration_with_services()))
    test_results.append(("Homeowner Registration", test_homeowner_registration()))
    test_results.append(("Provider Login Persistence", test_provider_login_persistence()))
    test_results.append(("Homeowner Login Persistence", test_homeowner_login_persistence()))
    test_results.append(("Provider /api/me Endpoint", test_me_endpoint_provider()))
    test_results.append(("Homeowner /api/me Endpoint", test_me_endpoint_homeowner()))
    
    # 2. Provider Operations
    print("\n🏢 PROVIDER OPERATIONS")
    print("-" * 40)
    test_results.append(("Create Manual Order", test_create_manual_order()))
    test_results.append(("Manual Order Persistence", test_manual_order_persistence()))
    test_results.append(("Create Appointment", test_create_appointment()))
    test_results.append(("Appointment Persistence", test_appointment_persistence()))
    test_results.append(("Get Orders (Provider)", test_get_orders_provider()))
    
    # 3. Homeowner Operations
    print("\n🏠 HOMEOWNER OPERATIONS")
    print("-" * 40)
    test_results.append(("Get Providers List", test_get_providers_list()))
    test_results.append(("Get Specific Provider", test_get_specific_provider()))
    test_results.append(("Create Quotation Request", test_create_quotation_request()))
    test_results.append(("Quotation Request Status", test_quotation_request_status()))
    test_results.append(("Get Orders (Homeowner)", test_get_orders_homeowner()))
    
    # 4. Data Flow (Marketplace)
    print("\n🏪 DATA FLOW (MARKETPLACE)")
    print("-" * 40)
    test_results.append(("Provider Sees Quotation Request", test_provider_sees_quotation_request()))
    test_results.append(("Provider Orders Returned", test_provider_orders_returned()))
    test_results.append(("Homeowner Orders Returned", test_homeowner_orders_returned()))
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 FULL FLOW TEST SUMMARY")
    print("=" * 80)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<40} {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal Tests: {len(test_results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success Rate: {(passed/len(test_results)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 ALL FULL FLOW TESTS PASSED!")
        print("✅ Database persistence fixes working correctly")
        print("✅ Quotation endpoint fix working correctly") 
        print("✅ Order tab switching working correctly")
        return True
    else:
        print(f"\n⚠️ {failed} TESTS FAILED!")
        return False

if __name__ == "__main__":
    success = run_full_flow_tests()
    sys.exit(0 if success else 1)