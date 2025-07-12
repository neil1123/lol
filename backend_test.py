#!/usr/bin/env python3
"""
Backend API Testing Script
Tests all backend endpoints to ensure proper functionality
"""

import requests
import json
import os
from datetime import datetime
import sys

# Load environment variables
BACKEND_URL = "https://d79bbc34-a006-429d-b8bc-e0af09e0e534.preview.emergentagent.com/api"

def test_backend_health():
    """Test if backend server is running and accessible"""
    print("🔍 Testing Backend Health...")
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Hello World":
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

def test_cors_configuration():
    """Test CORS configuration"""
    print("\n🔍 Testing CORS Configuration...")
    try:
        # Test preflight request
        headers = {
            'Origin': 'https://example.com',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options(f"{BACKEND_URL}/status", headers=headers, timeout=10)
        
        if response.status_code in [200, 204]:
            cors_headers = response.headers
            if 'access-control-allow-origin' in cors_headers:
                print("✅ CORS is properly configured")
                return True
            else:
                print("⚠️ CORS headers not found in response")
                return False
        else:
            print(f"❌ CORS preflight failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ CORS test failed: {e}")
        return False

def test_create_status_check():
    """Test POST /api/status endpoint"""
    print("\n🔍 Testing Create Status Check...")
    try:
        test_data = {
            "client_name": "Test Client Backend"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/status",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("client_name") == "Test Client Backend" and "id" in data and "timestamp" in data:
                print("✅ Status check creation successful")
                return True, data.get("id")
            else:
                print(f"❌ Invalid response structure: {data}")
                return False, None
        else:
            print(f"❌ Status check creation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
    except requests.exceptions.RequestException as e:
        print(f"❌ Status check creation failed: {e}")
        return False, None

def test_get_status_checks():
    """Test GET /api/status endpoint"""
    print("\n🔍 Testing Get Status Checks...")
    try:
        response = requests.get(f"{BACKEND_URL}/status", timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Status checks retrieved successfully ({len(data)} records)")
                return True
            else:
                print(f"❌ Expected list, got: {type(data)}")
                return False
        else:
            print(f"❌ Status checks retrieval failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Status checks retrieval failed: {e}")
        return False

def test_mongodb_connection():
    """Test MongoDB connection indirectly through API operations"""
    print("\n🔍 Testing MongoDB Connection (via API)...")
    
    # Create a test record
    create_success, record_id = test_create_status_check()
    if not create_success:
        print("❌ MongoDB connection test failed - cannot create records")
        return False
    
    # Retrieve records to verify persistence
    get_success = test_get_status_checks()
    if not get_success:
        print("❌ MongoDB connection test failed - cannot retrieve records")
        return False
    
    print("✅ MongoDB connection working properly")
    return True

def run_all_tests():
    """Run all backend tests"""
    print("=" * 60)
    print("🚀 BACKEND API TESTING STARTED")
    print("=" * 60)
    
    test_results = []
    
    # Test 1: Backend Health
    test_results.append(("Backend Health", test_backend_health()))
    
    # Test 2: CORS Configuration
    test_results.append(("CORS Configuration", test_cors_configuration()))
    
    # Test 3: MongoDB Connection (via API)
    test_results.append(("MongoDB Connection", test_mongodb_connection()))
    
    # Test 4: Get Status Checks
    test_results.append(("Get Status Checks", test_get_status_checks()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<25} {status}")
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