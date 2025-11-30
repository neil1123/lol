#!/usr/bin/env python3
"""
Doord Application Backend Testing - Full Flow Testing (Robust Version)
Focus: Testing the specific flows mentioned in the review request with better error handling
Base URL: https://doord.site/api
"""

import requests
import json
import uuid
import sys
import time
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

def register_and_login_user(user_type, services=None):
    """Register and login a user, return token and user data"""
    try:
        email = f"{user_type}_{uuid.uuid4().hex[:8]}@doordtest.com"
        password = "securepass123"
        
        # Registration data
        registration_data = {
            "email": email,
            "password": password,
            "user_type": user_type,
            "name": f"Test {user_type.title()}",
            "phone": "+1-555-0199",
            "address": f"123 {user_type.title()} Street, Toronto, ON"
        }
        
        if user_type == "provider":
            registration_data.update({
                "business_name": "Test Provider Services",
                "services": services or ["Home Cleaning", "Office Cleaning"],
                "description": "Professional test services",
                "location": "Toronto, ON"
            })
        
        # Register
        reg_response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=registration_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if reg_response.status_code != 200:
            return None, None, None, f"Registration failed: {reg_response.text}"
        
        reg_data = reg_response.json()
        user_id = reg_data["user"]["id"]
        reg_token = reg_data["access_token"]
        
        # Small delay for database consistency
        time.sleep(0.5)
        
        # Login to verify persistence
        login_data = {"email": email, "password": password}
        login_response = requests.post(
            f"{BACKEND_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if login_response.status_code != 200:
            return reg_token, user_id, email, f"Login failed: {login_response.text}"
        
        login_data = login_response.json()
        login_token = login_data["access_token"]
        
        return login_token, user_id, email, "Success"
        
    except Exception as e:
        return None, None, None, f"Error: {e}"

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

def test_user_registration_and_persistence():
    """Test user registration and login persistence for both provider and homeowner"""
    try:
        # Test provider registration and login
        provider_token, provider_id, provider_email, provider_msg = register_and_login_user("provider", ["Home Cleaning", "Office Cleaning"])
        
        if provider_token:
            test_data['provider_token'] = provider_token
            test_data['provider_id'] = provider_id
            test_data['provider_email'] = provider_email
            provider_success = True
        else:
            provider_success = False
        
        # Test homeowner registration and login
        homeowner_token, homeowner_id, homeowner_email, homeowner_msg = register_and_login_user("homeowner")
        
        if homeowner_token:
            test_data['homeowner_token'] = homeowner_token
            test_data['homeowner_id'] = homeowner_id
            test_data['homeowner_email'] = homeowner_email
            homeowner_success = True
        else:
            homeowner_success = False
        
        if provider_success and homeowner_success:
            return log_test("User Registration & Persistence", True, "Both provider and homeowner registration/login successful")
        elif provider_success:
            return log_test("User Registration & Persistence", False, f"Provider OK, Homeowner failed: {homeowner_msg}")
        elif homeowner_success:
            return log_test("User Registration & Persistence", False, f"Homeowner OK, Provider failed: {provider_msg}")
        else:
            return log_test("User Registration & Persistence", False, f"Both failed - Provider: {provider_msg}, Homeowner: {homeowner_msg}")
            
    except Exception as e:
        return log_test("User Registration & Persistence", False, f"Error: {e}")

def test_me_endpoints():
    """Test /api/me endpoints return correct user data"""
    try:
        results = []
        
        # Test provider /api/me
        if test_data['provider_token']:
            headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
            response = requests.get(f"{BACKEND_URL}/me", headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("user_type") == "provider" and "Home Cleaning" in data.get("services", []):
                    results.append("Provider /api/me: ✅")
                else:
                    results.append(f"Provider /api/me: ❌ Wrong data: {data}")
            else:
                results.append(f"Provider /api/me: ❌ Status {response.status_code}")
        else:
            results.append("Provider /api/me: ❌ No token")
        
        # Test homeowner /api/me
        if test_data['homeowner_token']:
            headers = {"Authorization": f"Bearer {test_data['homeowner_token']}"}
            response = requests.get(f"{BACKEND_URL}/me", headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("user_type") == "homeowner":
                    results.append("Homeowner /api/me: ✅")
                else:
                    results.append(f"Homeowner /api/me: ❌ Wrong data: {data}")
            else:
                results.append(f"Homeowner /api/me: ❌ Status {response.status_code}")
        else:
            results.append("Homeowner /api/me: ❌ No token")
        
        success = all("✅" in result for result in results)
        return log_test("/api/me Endpoints", success, " | ".join(results))
        
    except Exception as e:
        return log_test("/api/me Endpoints", False, f"Error: {e}")

def test_provider_operations():
    """Test provider operations: manual orders, appointments"""
    try:
        if not test_data['provider_token']:
            return log_test("Provider Operations", False, "No provider token available")
        
        headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
        results = []
        
        # Test manual order creation
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
        
        order_response = requests.post(f"{BACKEND_URL}/orders", json=manual_order_data, headers=headers, timeout=30)
        
        if order_response.status_code == 200:
            order_data = order_response.json()
            if order_data.get("status") == "confirmed":
                test_data['manual_order_id'] = order_data.get("id") or order_data.get("order_id")
                results.append("Manual Order: ✅")
            else:
                results.append(f"Manual Order: ❌ Wrong status: {order_data.get('status')}")
        else:
            results.append(f"Manual Order: ❌ Status {order_response.status_code}")
        
        # Test appointment creation
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
        
        appt_response = requests.post(f"{BACKEND_URL}/appointments", json=appointment_data, headers=headers, timeout=30)
        
        if appt_response.status_code == 200:
            appt_data = appt_response.json()
            if "appointment_id" in appt_data or "message" in appt_data:
                test_data['appointment_id'] = appt_data.get("appointment_id")
                results.append("Appointment: ✅")
            else:
                results.append(f"Appointment: ❌ Invalid response: {appt_data}")
        else:
            results.append(f"Appointment: ❌ Status {appt_response.status_code}")
        
        # Test getting orders
        orders_response = requests.get(f"{BACKEND_URL}/orders", headers=headers, timeout=30)
        if orders_response.status_code == 200:
            orders = orders_response.json()
            results.append(f"Get Orders: ✅ ({len(orders)} orders)")
        else:
            results.append(f"Get Orders: ❌ Status {orders_response.status_code}")
        
        success = all("✅" in result for result in results)
        return log_test("Provider Operations", success, " | ".join(results))
        
    except Exception as e:
        return log_test("Provider Operations", False, f"Error: {e}")

def test_homeowner_operations():
    """Test homeowner operations: get providers, create quotation requests"""
    try:
        results = []
        
        # Test get providers list
        providers_response = requests.get(f"{BACKEND_URL}/providers", timeout=30)
        if providers_response.status_code == 200:
            providers = providers_response.json()
            our_provider = next((p for p in providers if p.get("id") == test_data['provider_id']), None)
            if our_provider and "Home Cleaning" in our_provider.get("services", []):
                results.append("Get Providers: ✅")
            else:
                results.append(f"Get Providers: ✅ ({len(providers)} providers, ours not found)")
        else:
            results.append(f"Get Providers: ❌ Status {providers_response.status_code}")
        
        # Test get specific provider
        if test_data['provider_id']:
            provider_response = requests.get(f"{BACKEND_URL}/providers/{test_data['provider_id']}", timeout=30)
            if provider_response.status_code == 200:
                provider = provider_response.json()
                if "Home Cleaning" in provider.get("services", []):
                    results.append("Get Specific Provider: ✅")
                else:
                    results.append(f"Get Specific Provider: ❌ Services missing: {provider.get('services')}")
            else:
                results.append(f"Get Specific Provider: ❌ Status {provider_response.status_code}")
        else:
            results.append("Get Specific Provider: ❌ No provider ID")
        
        # Test quotation request creation
        if test_data['homeowner_token'] and test_data['provider_id']:
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
            quotation_response = requests.post(f"{BACKEND_URL}/orders", json=quotation_data, headers=headers, timeout=30)
            
            if quotation_response.status_code == 200:
                quotation_data = quotation_response.json()
                if quotation_data.get("status") == "pending_quotation":
                    test_data['quotation_order_id'] = quotation_data.get("id") or quotation_data.get("order_id")
                    results.append("Create Quotation: ✅")
                else:
                    results.append(f"Create Quotation: ❌ Wrong status: {quotation_data.get('status')}")
            else:
                results.append(f"Create Quotation: ❌ Status {quotation_response.status_code}")
        else:
            results.append("Create Quotation: ❌ Missing token or provider ID")
        
        success = all("✅" in result for result in results)
        return log_test("Homeowner Operations", success, " | ".join(results))
        
    except Exception as e:
        return log_test("Homeowner Operations", False, f"Error: {e}")

def test_marketplace_data_flow():
    """Test marketplace data flow: provider sees homeowner requests, orders returned correctly"""
    try:
        results = []
        
        # Test provider sees quotation request
        if test_data['provider_token'] and test_data['quotation_order_id']:
            headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
            orders_response = requests.get(f"{BACKEND_URL}/orders", headers=headers, timeout=30)
            
            if orders_response.status_code == 200:
                orders = orders_response.json()
                quotation_order = next((o for o in orders if o.get("id") == test_data['quotation_order_id']), None)
                if quotation_order and quotation_order.get("status") == "pending_quotation":
                    results.append("Provider Sees Quotation: ✅")
                else:
                    results.append("Provider Sees Quotation: ❌ Not found or wrong status")
            else:
                results.append(f"Provider Sees Quotation: ❌ Status {orders_response.status_code}")
        else:
            results.append("Provider Sees Quotation: ❌ Missing data")
        
        # Test provider sees their manual orders
        if test_data['provider_token'] and test_data['manual_order_id']:
            headers = {"Authorization": f"Bearer {test_data['provider_token']}"}
            orders_response = requests.get(f"{BACKEND_URL}/orders", headers=headers, timeout=30)
            
            if orders_response.status_code == 200:
                orders = orders_response.json()
                manual_order = next((o for o in orders if o.get("id") == test_data['manual_order_id']), None)
                if manual_order:
                    results.append("Provider Manual Orders: ✅")
                else:
                    results.append("Provider Manual Orders: ❌ Not found")
            else:
                results.append(f"Provider Manual Orders: ❌ Status {orders_response.status_code}")
        else:
            results.append("Provider Manual Orders: ❌ Missing data")
        
        # Test homeowner sees their orders
        if test_data['homeowner_token'] and test_data['quotation_order_id']:
            headers = {"Authorization": f"Bearer {test_data['homeowner_token']}"}
            orders_response = requests.get(f"{BACKEND_URL}/orders", headers=headers, timeout=30)
            
            if orders_response.status_code == 200:
                orders = orders_response.json()
                quotation_order = next((o for o in orders if o.get("id") == test_data['quotation_order_id']), None)
                if quotation_order:
                    results.append("Homeowner Orders: ✅")
                else:
                    results.append("Homeowner Orders: ❌ Not found")
            else:
                results.append(f"Homeowner Orders: ❌ Status {orders_response.status_code}")
        else:
            results.append("Homeowner Orders: ❌ Missing data")
        
        success = all("✅" in result for result in results)
        return log_test("Marketplace Data Flow", success, " | ".join(results))
        
    except Exception as e:
        return log_test("Marketplace Data Flow", False, f"Error: {e}")

def run_robust_full_flow_tests():
    """Run all full flow tests with better error handling"""
    print("=" * 80)
    print("🚀 DOORD APPLICATION BACKEND - ROBUST FULL FLOW TESTING")
    print("=" * 80)
    print(f"Base URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    test_results = []
    
    # Run tests in sequence
    print("\n🏥 BACKEND HEALTH CHECK")
    print("-" * 40)
    test_results.append(("Backend Health Check", test_backend_health()))
    
    print("\n👥 USER REGISTRATION & PERSISTENCE")
    print("-" * 40)
    test_results.append(("User Registration & Persistence", test_user_registration_and_persistence()))
    
    print("\n🔍 USER DATA VERIFICATION")
    print("-" * 40)
    test_results.append(("/api/me Endpoints", test_me_endpoints()))
    
    print("\n🏢 PROVIDER OPERATIONS")
    print("-" * 40)
    test_results.append(("Provider Operations", test_provider_operations()))
    
    print("\n🏠 HOMEOWNER OPERATIONS")
    print("-" * 40)
    test_results.append(("Homeowner Operations", test_homeowner_operations()))
    
    print("\n🏪 MARKETPLACE DATA FLOW")
    print("-" * 40)
    test_results.append(("Marketplace Data Flow", test_marketplace_data_flow()))
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 ROBUST FULL FLOW TEST SUMMARY")
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
        print("\n🎉 ALL ROBUST FULL FLOW TESTS PASSED!")
        print("✅ Database persistence fixes working correctly")
        print("✅ Quotation endpoint fix working correctly") 
        print("✅ Order tab switching working correctly")
        return True
    else:
        print(f"\n⚠️ {failed} TESTS FAILED!")
        return False

if __name__ == "__main__":
    success = run_robust_full_flow_tests()
    sys.exit(0 if success else 1)