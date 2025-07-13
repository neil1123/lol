#!/usr/bin/env python3
"""
Doord Backend API Testing Script
Tests all backend endpoints for the home services marketplace
"""

import requests
import json
import os
from datetime import datetime
import sys
import uuid

# Load environment variables
BACKEND_URL = "https://c058bacf-440a-40c3-a20e-260ce2a9aecf.preview.emergentagent.com/api"

# Global variables to store test data
provider_token = None
homeowner_token = None
provider_id = None
homeowner_id = None
test_order_id = None
test_thread_id = None

def test_backend_health():
    """Test if backend server is running and accessible"""
    print("🔍 Testing Backend Health...")
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "Doord API" in data.get("message", ""):
                print("✅ Backend server is running and accessible")
                return True
            else:
                print(f"❌ Unexpected response: {data}")
                return False
        else:
            print(f"❌ Backend health check failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_provider_registration():
    """Test provider registration"""
    print("\n🔍 Testing Provider Registration...")
    global provider_token, provider_id
    
    try:
        test_data = {
            "email": f"provider_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "testpass123",
            "user_type": "provider",
            "name": "John Smith",
            "phone": "+1-902-555-0123",
            "address": "123 Main St, Halifax, NS",
            "business_name": "Smith Home Services",
            "services": ["Plumbing", "Electrical"],
            "license": "NS-12345"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                provider_token = data["access_token"]
                provider_id = data["user"]["id"]
                print("✅ Provider registration successful")
                return True
            else:
                print(f"❌ Invalid response structure: {data}")
                return False
        else:
            print(f"❌ Provider registration failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Provider registration failed: {e}")
        return False

def test_homeowner_registration():
    """Test homeowner registration"""
    print("\n🔍 Testing Homeowner Registration...")
    global homeowner_token, homeowner_id
    
    try:
        test_data = {
            "email": f"homeowner_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "testpass123",
            "user_type": "homeowner",
            "name": "Jane Doe",
            "phone": "+1-902-555-0456",
            "address": "456 Oak Ave, Halifax, NS"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                homeowner_token = data["access_token"]
                homeowner_id = data["user"]["id"]
                print("✅ Homeowner registration successful")
                return True
            else:
                print(f"❌ Invalid response structure: {data}")
                return False
        else:
            print(f"❌ Homeowner registration failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Homeowner registration failed: {e}")
        return False

def test_provider_login():
    """Test provider login with existing credentials"""
    print("\n🔍 Testing Provider Login...")
    
    try:
        # First register a provider for login test
        test_email = f"logintest_{uuid.uuid4().hex[:8]}@doordtest.com"
        register_data = {
            "email": test_email,
            "password": "logintest123",
            "user_type": "provider",
            "name": "Login Test Provider",
            "business_name": "Test Services"
        }
        
        # Register
        register_response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=register_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if register_response.status_code != 200:
            print("❌ Failed to register test user for login")
            return False
        
        # Now test login
        login_data = {
            "email": test_email,
            "password": "logintest123"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                print("✅ Provider login successful")
                return True
            else:
                print(f"❌ Invalid login response structure: {data}")
                return False
        else:
            print(f"❌ Provider login failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Provider login failed: {e}")
        return False

def test_jwt_validation():
    """Test JWT token validation"""
    print("\n🔍 Testing JWT Token Validation...")
    
    if not provider_token:
        print("❌ No provider token available for validation test")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.get(
            f"{BACKEND_URL}/auth/me",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "email" in data:
                print("✅ JWT token validation successful")
                return True
            else:
                print(f"❌ Invalid user data structure: {data}")
                return False
        else:
            print(f"❌ JWT validation failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ JWT validation failed: {e}")
        return False

def test_get_all_providers():
    """Test getting all providers"""
    print("\n🔍 Testing Get All Providers...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/providers", timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Providers retrieved successfully ({len(data)} providers)")
                return True
            else:
                print(f"❌ Expected list, got: {type(data)}")
                return False
        else:
            print(f"❌ Get providers failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Get providers failed: {e}")
        return False

def test_get_individual_provider():
    """Test getting individual provider"""
    print("\n🔍 Testing Get Individual Provider...")
    
    if not provider_id:
        print("❌ No provider ID available for individual provider test")
        return False
    
    try:
        response = requests.get(f"{BACKEND_URL}/providers/{provider_id}", timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "business_name" in data:
                print("✅ Individual provider retrieved successfully")
                return True
            else:
                print(f"❌ Invalid provider data structure: {data}")
                return False
        else:
            print(f"❌ Get individual provider failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Get individual provider failed: {e}")
        return False

def test_order_creation():
    """Test order creation"""
    print("\n🔍 Testing Order Creation...")
    global test_order_id
    
    if not homeowner_token or not provider_id or not homeowner_id:
        print("❌ Missing required data for order creation test")
        return False
    
    try:
        order_data = {
            "homeowner_id": homeowner_id,
            "provider_id": provider_id,
            "homeowner_name": "Jane Doe",
            "homeowner_email": "jane@doordtest.com",
            "homeowner_phone": "+1-902-555-0456",
            "homeowner_address": "456 Oak Ave, Halifax, NS",
            "provider_name": "Smith Home Services",
            "service_type": "Plumbing",
            "description": "Fix leaky kitchen faucet",
            "preferred_date": "2024-01-15",
            "preferred_time": "10:00 AM",
            "urgency": "medium",
            "budget": "$100-200"
        }
        
        headers = {"Authorization": f"Bearer {homeowner_token}"}
        response = requests.post(
            f"{BACKEND_URL}/orders",
            json=order_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "service_type" in data:
                test_order_id = data["id"]
                print("✅ Order creation successful")
                return True
            else:
                print(f"❌ Invalid order response structure: {data}")
                return False
        else:
            print(f"❌ Order creation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Order creation failed: {e}")
        return False

def test_quotation_request():
    """Test quotation request creation"""
    print("\n🔍 Testing Quotation Request...")
    
    if not provider_id:
        print("❌ No provider ID available for quotation request test")
        return False
    
    try:
        quotation_data = {
            "homeowner_id": str(uuid.uuid4()),
            "provider_id": provider_id,
            "homeowner_name": "Test Customer",
            "homeowner_email": "customer@doordtest.com",
            "homeowner_phone": "+1-902-555-0789",
            "homeowner_address": "789 Pine St, Halifax, NS",
            "provider_name": "Smith Home Services",
            "service_type": "Electrical",
            "description": "Install new ceiling fan",
            "preferred_date": "2024-01-20",
            "budget": "$200-300"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/quotations",
            json=quotation_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "order_id" in data:
                print("✅ Quotation request successful")
                return True
            else:
                print(f"❌ Invalid quotation response structure: {data}")
                return False
        else:
            print(f"❌ Quotation request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Quotation request failed: {e}")
        return False

def test_order_retrieval():
    """Test order retrieval for providers"""
    print("\n🔍 Testing Order Retrieval...")
    
    if not provider_token:
        print("❌ No provider token available for order retrieval test")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.get(
            f"{BACKEND_URL}/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Orders retrieved successfully ({len(data)} orders)")
                return True
            else:
                print(f"❌ Expected list, got: {type(data)}")
                return False
        else:
            print(f"❌ Order retrieval failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Order retrieval failed: {e}")
        return False

def test_message_thread_creation():
    """Test message thread creation"""
    print("\n🔍 Testing Message Thread Creation...")
    global test_thread_id
    
    if not provider_token or not provider_id or not homeowner_id:
        print("❌ Missing required data for message thread creation test")
        return False
    
    try:
        thread_data = {
            "homeowner_id": homeowner_id,
            "provider_id": provider_id,
            "homeowner_name": "Jane Doe",
            "provider_name": "Smith Home Services",
            "order_type": "Plumbing",
            "last_message": "Initial message"
        }
        
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.post(
            f"{BACKEND_URL}/messages/threads",
            json=thread_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                test_thread_id = data["id"]
                print("✅ Message thread creation successful")
                return True
            else:
                print(f"❌ Invalid thread response structure: {data}")
                return False
        else:
            print(f"❌ Message thread creation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Message thread creation failed: {e}")
        return False

def test_send_message():
    """Test sending messages"""
    print("\n🔍 Testing Send Message...")
    
    if not provider_token or not test_thread_id:
        print("❌ Missing required data for send message test")
        return False
    
    try:
        message_data = {
            "thread_id": test_thread_id,
            "content": "Hello, I can help you with your plumbing needs!"
        }
        
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.post(
            f"{BACKEND_URL}/messages",
            json=message_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "content" in data:
                print("✅ Message sending successful")
                return True
            else:
                print(f"❌ Invalid message response structure: {data}")
                return False
        else:
            print(f"❌ Message sending failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Message sending failed: {e}")
        return False

def test_appointment_creation():
    """Test appointment creation"""
    print("\n🔍 Testing Appointment Creation...")
    
    if not provider_token:
        print("❌ No provider token available for appointment creation test")
        return False
    
    try:
        appointment_data = {
            "customer_name": "Test Customer",
            "phone_number": "+1-902-555-0999",
            "service_type": "Plumbing",
            "date": "2024-01-25",
            "time": "2:00 PM",
            "address": "999 Test St, Halifax, NS",
            "notes": "Test appointment"
        }
        
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.post(
            f"{BACKEND_URL}/appointments",
            json=appointment_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "customer_name" in data:
                print("✅ Appointment creation successful")
                return True
            else:
                print(f"❌ Invalid appointment response structure: {data}")
                return False
        else:
            print(f"❌ Appointment creation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Appointment creation failed: {e}")
        return False

def test_mongodb_persistence():
    """Test MongoDB data persistence"""
    print("\n🔍 Testing MongoDB Data Persistence...")
    
    # Test by retrieving previously created data
    if not provider_token:
        print("❌ No provider token available for persistence test")
        return False
    
    try:
        # Get providers to check if our registered provider persists
        response = requests.get(f"{BACKEND_URL}/providers", timeout=30)
        
        if response.status_code == 200:
            providers = response.json()
            if any(p.get("id") == provider_id for p in providers):
                print("✅ MongoDB data persistence verified")
                return True
            else:
                print("❌ Registered provider not found in database")
                return False
        else:
            print(f"❌ Failed to verify persistence with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ MongoDB persistence test failed: {e}")
        return False

def run_all_tests():
    """Run all backend tests"""
    print("=" * 70)
    print("🚀 DOORD BACKEND API TESTING STARTED")
    print("=" * 70)
    
    test_results = []
    
    # Test 1: Backend Health
    test_results.append(("Backend Health", test_backend_health()))
    
    # Test 2: Provider Registration
    test_results.append(("Provider Registration", test_provider_registration()))
    
    # Test 3: Homeowner Registration
    test_results.append(("Homeowner Registration", test_homeowner_registration()))
    
    # Test 4: Provider Login
    test_results.append(("Provider Login", test_provider_login()))
    
    # Test 5: JWT Token Validation
    test_results.append(("JWT Token Validation", test_jwt_validation()))
    
    # Test 6: Get All Providers
    test_results.append(("Get All Providers", test_get_all_providers()))
    
    # Test 7: Get Individual Provider
    test_results.append(("Get Individual Provider", test_get_individual_provider()))
    
    # Test 8: Order Creation
    test_results.append(("Order Creation", test_order_creation()))
    
    # Test 9: Quotation Request
    test_results.append(("Quotation Request", test_quotation_request()))
    
    # Test 10: Order Retrieval
    test_results.append(("Order Retrieval", test_order_retrieval()))
    
    # Test 11: Message Thread Creation
    test_results.append(("Message Thread Creation", test_message_thread_creation()))
    
    # Test 12: Send Message
    test_results.append(("Send Message", test_send_message()))
    
    # Test 13: Appointment Creation
    test_results.append(("Appointment Creation", test_appointment_creation()))
    
    # Test 14: MongoDB Persistence
    test_results.append(("MongoDB Persistence", test_mongodb_persistence()))
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<30} {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal Tests: {len(test_results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 ALL BACKEND TESTS PASSED!")
        return True
    else:
        print(f"\n⚠️ {failed} BACKEND TESTS FAILED!")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)