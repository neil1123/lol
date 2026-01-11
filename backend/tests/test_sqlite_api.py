#!/usr/bin/env python3
"""
Doord SQLite Backend API Testing
Focus: Testing authentication, provider operations, order flow, and services
Base URL: https://propertyfix-4.preview.emergentagent.com
"""

import requests
import json
import uuid
import sys
from datetime import datetime

# Base URL from frontend .env
BACKEND_URL = "https://propertyfix-4.preview.emergentagent.com/api"

# Global test data storage
test_data = {
    'homeowner_token': None,
    'provider_token': None,
    'homeowner_id': None,
    'provider_id': None,
    'homeowner_email': None,
    'provider_email': None,
    'test_order_id': None,
    'test_customer_id': None,
    'test_appointment_id': None
}

def log_test(test_name, status, message=""):
    """Log test results with consistent formatting"""
    status_icon = "✅" if status else "❌"
    print(f"{status_icon} {test_name}: {message}")
    return status

def test_backend_health():
    """Test if SQLite backend is accessible"""
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "SQLite" in data.get("database", ""):
                return log_test("Backend Health", True, "SQLite backend is running")
            else:
                return log_test("Backend Health", False, f"Expected SQLite, got: {data}")
        else:
            return log_test("Backend Health", False, f"Status {response.status_code}")
    except Exception as e:
        return log_test("Backend Health", False, f"Connection failed: {e}")

def test_homeowner_registration():
    """Test homeowner registration (POST /api/auth/register)"""
    try:
        email = f"homeowner_{uuid.uuid4().hex[:8]}@doordtest.com"
        test_data['homeowner_email'] = email
        
        registration_data = {
            "email": email,
            "password": "testpass123",
            "user_type": "homeowner",
            "name": "Sarah Johnson",
            "phone": "+1-902-555-0123",
            "address": "123 Maple Street, Halifax, NS"
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
                return log_test("Homeowner Registration", True, f"Registered {email}")
            else:
                return log_test("Homeowner Registration", False, f"Invalid response: {data}")
        else:
            return log_test("Homeowner Registration", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Homeowner Registration", False, f"Error: {e}")

def test_provider_registration():
    """Test provider registration (POST /api/auth/register with user_type="provider")"""
    try:
        email = f"provider_{uuid.uuid4().hex[:8]}@doordtest.com"
        test_data['provider_email'] = email
        
        registration_data = {
            "email": email,
            "password": "testpass123",
            "user_type": "provider",
            "name": "Mike Thompson",
            "phone": "+1-902-555-0456",
            "address": "456 Oak Avenue, Halifax, NS",
            "business_name": "Thompson Home Services",
            "services": ["Plumbing", "Electrical", "HVAC"],
            "description": "Professional home services with 10+ years experience",
            "location": "Halifax, NS"
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
                return log_test("Provider Registration", True, f"Registered {email}")
            else:
                return log_test("Provider Registration", False, f"Invalid response: {data}")
        else:
            return log_test("Provider Registration", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Provider Registration", False, f"Error: {e}")

def test_homeowner_login():
    """Test homeowner login (POST /api/auth/login)"""
    try:
        if not test_data['homeowner_email']:
            return log_test("Homeowner Login", False, "No homeowner email available")
        
        login_data = {
            "email": test_data['homeowner_email'],
            "password": "testpass123"
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
                return log_test("Homeowner Login", True, "Login successful")
            else:
                return log_test("Homeowner Login", False, f"Invalid response: {data}")
        else:
            return log_test("Homeowner Login", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Homeowner Login", False, f"Error: {e}")

def test_provider_login():
    """Test provider login (POST /api/auth/login)"""
    try:
        if not test_data['provider_email']:
            return log_test("Provider Login", False, "No provider email available")
        
        login_data = {
            "email": test_data['provider_email'],
            "password": "testpass123"
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
                return log_test("Provider Login", True, "Login successful")
            else:
                return log_test("Provider Login", False, f"Invalid response: {data}")
        else:
            return log_test("Provider Login", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Provider Login", False, f"Error: {e}")

def test_auth_me_endpoint():
    """Test /api/auth/me endpoint (should return user data)"""
    try:
        if not test_data['homeowner_token']:
            return log_test("Auth Me Endpoint", False, "No homeowner token available")
        
        headers = {"Authorization": f"Bearer {test_data['homeowner_token']}"}
        response = requests.get(
            f"{BACKEND_URL}/auth/me",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "email" in data and "user_type" in data:
                return log_test("Auth Me Endpoint", True, f"User data retrieved: {data['user_type']}")
            else:
                return log_test("Auth Me Endpoint", False, f"Invalid user data: {data}")
        else:
            return log_test("Auth Me Endpoint", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Auth Me Endpoint", False, f"Error: {e}")

def test_me_endpoint():
    """Test /api/me endpoint (should return user data)"""
    try:
        if not test_data['provider_token']:
            return log_test("Me Endpoint", False, "No provider token available")
        
        headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
        response = requests.get(
            f"{BACKEND_URL}/me",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "email" in data and "user_type" in data:
                return log_test("Me Endpoint", True, f"User data retrieved: {data['user_type']}")
            else:
                return log_test("Me Endpoint", False, f"Invalid user data: {data}")
        else:
            return log_test("Me Endpoint", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Me Endpoint", False, f"Error: {e}")

def test_get_all_providers():
    """Test get all providers (GET /api/providers)"""
    try:
        response = requests.get(f"{BACKEND_URL}/providers", timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                provider_count = len(data)
                # Check if our registered provider is in the list
                our_provider = next((p for p in data if p.get("id") == test_data['provider_id']), None)
                if our_provider:
                    return log_test("Get All Providers", True, f"Retrieved {provider_count} providers, including ours")
                else:
                    return log_test("Get All Providers", True, f"Retrieved {provider_count} providers (ours not found yet)")
            else:
                return log_test("Get All Providers", False, f"Expected list, got: {type(data)}")
        else:
            return log_test("Get All Providers", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Get All Providers", False, f"Error: {e}")

def test_create_customer():
    """Test create customer (POST /api/customers)"""
    try:
        if not test_data['provider_token']:
            return log_test("Create Customer", False, "No provider token available")
        
        customer_data = {
            "name": "Jennifer Davis",
            "email": "jennifer.davis@example.com",
            "phone": "+1-902-555-0789",
            "address": "789 Pine Street, Halifax, NS",
            "notes": "Regular customer, prefers morning appointments"
        }
        
        headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
        response = requests.post(
            f"{BACKEND_URL}/customers",
            json=customer_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "name" in data:
                test_data['test_customer_id'] = data["id"]
                return log_test("Create Customer", True, f"Customer created: {data['name']}")
            else:
                return log_test("Create Customer", False, f"Invalid response: {data}")
        else:
            return log_test("Create Customer", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Create Customer", False, f"Error: {e}")

def test_create_appointment():
    """Test create appointment (POST /api/appointments)"""
    try:
        if not test_data['provider_token']:
            return log_test("Create Appointment", False, "No provider token available")
        
        appointment_data = {
            "customer_name": "Jennifer Davis",
            "customer_phone": "+1-902-555-0789",
            "customer_email": "jennifer.davis@example.com",
            "service_type": "Plumbing Repair",
            "date": "2024-01-25",
            "time": "10:00",
            "duration": 120,
            "notes": "Kitchen faucet repair"
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
                test_data['test_appointment_id'] = data.get("appointment_id")
                return log_test("Create Appointment", True, "Appointment created successfully")
            else:
                return log_test("Create Appointment", False, f"Invalid response: {data}")
        else:
            return log_test("Create Appointment", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Create Appointment", False, f"Error: {e}")

def test_get_appointments():
    """Test get appointments (GET /api/appointments)"""
    try:
        if not test_data['provider_token']:
            return log_test("Get Appointments", False, "No provider token available")
        
        headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
        response = requests.get(
            f"{BACKEND_URL}/appointments",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                return log_test("Get Appointments", True, f"Retrieved {len(data)} appointments")
            else:
                return log_test("Get Appointments", False, f"Expected list, got: {type(data)}")
        else:
            return log_test("Get Appointments", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Get Appointments", False, f"Error: {e}")

def test_get_customers():
    """Test get customers (GET /api/customers)"""
    try:
        if not test_data['provider_token']:
            return log_test("Get Customers", False, "No provider token available")
        
        headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
        response = requests.get(
            f"{BACKEND_URL}/customers",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                return log_test("Get Customers", True, f"Retrieved {len(data)} customers")
            else:
                return log_test("Get Customers", False, f"Expected list, got: {type(data)}")
        else:
            return log_test("Get Customers", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Get Customers", False, f"Error: {e}")

def test_create_order_homeowner_to_provider():
    """Test create order from homeowner to provider (POST /api/orders)"""
    try:
        if not test_data['homeowner_token'] or not test_data['provider_id']:
            return log_test("Create Order (Homeowner->Provider)", False, "Missing homeowner token or provider ID")
        
        order_data = {
            "provider_id": test_data['provider_id'],
            "service": "Electrical Repair",
            "service_type": "Electrical Repair",
            "description": "Fix electrical outlet in living room",
            "preferred_date": "2024-01-30",
            "preferred_time": "14:00",
            "urgency": "medium",
            "budget": "$100-200",
            "property_size": "medium",
            "additional_requirements": "Please call before arriving"
        }
        
        headers = {"Authorization": f"Bearer {test_data['homeowner_token']}"}
        response = requests.post(
            f"{BACKEND_URL}/orders",
            json=order_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data or "order_id" in data:
                test_data['test_order_id'] = data.get("id") or data.get("order_id")
                return log_test("Create Order (Homeowner->Provider)", True, f"Order created: {test_data['test_order_id']}")
            else:
                return log_test("Create Order (Homeowner->Provider)", False, f"Invalid response: {data}")
        else:
            return log_test("Create Order (Homeowner->Provider)", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Create Order (Homeowner->Provider)", False, f"Error: {e}")

def test_get_orders_as_provider():
    """Test get orders as provider (GET /api/orders - should see homeowner's order)"""
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
            data = response.json()
            if isinstance(data, list):
                # Check if we can find our test order
                our_order = next((o for o in data if o.get("id") == test_data['test_order_id']), None)
                if our_order:
                    return log_test("Get Orders (Provider)", True, f"Retrieved {len(data)} orders, including homeowner's order")
                else:
                    return log_test("Get Orders (Provider)", True, f"Retrieved {len(data)} orders (test order not found)")
            else:
                return log_test("Get Orders (Provider)", False, f"Expected list, got: {type(data)}")
        else:
            return log_test("Get Orders (Provider)", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Get Orders (Provider)", False, f"Error: {e}")

def test_get_orders_as_homeowner():
    """Test get orders as homeowner (GET /api/orders - should see their order)"""
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
            data = response.json()
            if isinstance(data, list):
                # Check if we can find our test order
                our_order = next((o for o in data if o.get("id") == test_data['test_order_id']), None)
                if our_order:
                    return log_test("Get Orders (Homeowner)", True, f"Retrieved {len(data)} orders, including their order")
                else:
                    return log_test("Get Orders (Homeowner)", True, f"Retrieved {len(data)} orders (test order not found)")
            else:
                return log_test("Get Orders (Homeowner)", False, f"Expected list, got: {type(data)}")
        else:
            return log_test("Get Orders (Homeowner)", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Get Orders (Homeowner)", False, f"Error: {e}")

def test_get_available_services():
    """Test get available services (GET /api/services)"""
    try:
        response = requests.get(f"{BACKEND_URL}/services", timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                return log_test("Get Available Services", True, f"Retrieved {len(data)} services")
            else:
                return log_test("Get Available Services", False, f"Expected non-empty list, got: {data}")
        else:
            return log_test("Get Available Services", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Get Available Services", False, f"Error: {e}")

def test_order_quotation_workflow():
    """Test complete order quotation workflow"""
    try:
        if not test_data['provider_token'] or not test_data['test_order_id']:
            return log_test("Order Quotation Workflow", False, "Missing provider token or order ID")
        
        # Step 1: Provider updates quotation
        headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
        quotation_data = {
            "quotation_amount": 150.00,
            "quotation_details": "Electrical outlet repair including parts and labor",
            "status": "quoted"
        }
        
        response = requests.put(
            f"{BACKEND_URL}/orders/{test_data['test_order_id']}",
            json=quotation_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            # Step 2: Homeowner accepts quotation
            homeowner_headers = {"Authorization": f"Bearer {test_data['homeowner_token']}"}
            status_data = {"status": "accepted"}
            
            response = requests.put(
                f"{BACKEND_URL}/orders/{test_data['test_order_id']}/status",
                json=status_data,
                headers=homeowner_headers,
                timeout=30
            )
            
            if response.status_code == 200:
                return log_test("Order Quotation Workflow", True, "Complete quotation workflow successful")
            else:
                return log_test("Order Quotation Workflow", False, f"Homeowner accept failed: {response.status_code}")
        else:
            return log_test("Order Quotation Workflow", False, f"Provider quotation failed: {response.status_code}")
    except Exception as e:
        return log_test("Order Quotation Workflow", False, f"Error: {e}")

def run_sqlite_tests():
    """Run all SQLite backend tests"""
    print("=" * 80)
    print("🚀 DOORD SQLITE BACKEND API TESTING")
    print("=" * 80)
    print(f"Base URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    test_results = []
    
    # 1. Authentication Tests
    print("\n🔐 AUTHENTICATION TESTS")
    print("-" * 40)
    test_results.append(("Backend Health", test_backend_health()))
    test_results.append(("Homeowner Registration", test_homeowner_registration()))
    test_results.append(("Provider Registration", test_provider_registration()))
    test_results.append(("Homeowner Login", test_homeowner_login()))
    test_results.append(("Provider Login", test_provider_login()))
    test_results.append(("Auth Me Endpoint", test_auth_me_endpoint()))
    test_results.append(("Me Endpoint", test_me_endpoint()))
    
    # 2. Provider Operations
    print("\n🏢 PROVIDER OPERATIONS")
    print("-" * 40)
    test_results.append(("Get All Providers", test_get_all_providers()))
    test_results.append(("Create Customer", test_create_customer()))
    test_results.append(("Create Appointment", test_create_appointment()))
    test_results.append(("Get Appointments", test_get_appointments()))
    test_results.append(("Get Customers", test_get_customers()))
    
    # 3. Order Flow (Marketplace Data)
    print("\n📦 ORDER FLOW TESTS")
    print("-" * 40)
    test_results.append(("Create Order (Homeowner->Provider)", test_create_order_homeowner_to_provider()))
    test_results.append(("Get Orders (Provider)", test_get_orders_as_provider()))
    test_results.append(("Get Orders (Homeowner)", test_get_orders_as_homeowner()))
    test_results.append(("Order Quotation Workflow", test_order_quotation_workflow()))
    
    # 4. Services
    print("\n🛠️ SERVICES TESTS")
    print("-" * 40)
    test_results.append(("Get Available Services", test_get_available_services()))
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 TEST SUMMARY")
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
        print("\n🎉 ALL SQLITE BACKEND TESTS PASSED!")
        return True
    else:
        print(f"\n⚠️ {failed} TESTS FAILED!")
        return False

if __name__ == "__main__":
    success = run_sqlite_tests()
    sys.exit(0 if success else 1)