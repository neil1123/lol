#!/usr/bin/env python3
"""
Debug homeowner authentication issue specifically
"""

import requests
import json
import uuid
import time

BACKEND_URL = "https://doord.site/api"

def test_homeowner_debug():
    """Debug the homeowner authentication issue"""
    
    # Register a new homeowner
    email = f"homeowner_debug_{uuid.uuid4().hex[:8]}@doordtest.com"
    password = "testpass123"
    
    print(f"Testing homeowner with email: {email}")
    
    # Register
    registration_data = {
        "email": email,
        "password": password,
        "user_type": "homeowner",
        "name": "Debug Homeowner",
        "phone": "+1-555-0199",
        "address": "123 Debug Street, Toronto, ON"
    }
    
    print("1. Registering homeowner...")
    reg_response = requests.post(
        f"{BACKEND_URL}/auth/register",
        json=registration_data,
        headers={"Content-Type": "application/json"},
        timeout=30
    )
    
    print(f"Registration status: {reg_response.status_code}")
    if reg_response.status_code == 200:
        reg_data = reg_response.json()
        print(f"Registration successful: {reg_data.get('user', {}).get('id')}")
        reg_token = reg_data.get('access_token')
        print(f"Registration token: {reg_token[:50]}...")
        
        # Test the registration token immediately
        print("\n2. Testing registration token immediately...")
        headers = {"Authorization": f"Bearer {reg_token}"}
        me_response = requests.get(f"{BACKEND_URL}/me", headers=headers, timeout=30)
        print(f"Me endpoint with reg token: {me_response.status_code}")
        if me_response.status_code != 200:
            print(f"Error: {me_response.text}")
        else:
            print(f"Success: {me_response.json().get('user_type')}")
    else:
        print(f"Registration failed: {reg_response.text}")
        return
    
    # Wait a bit
    print("\n3. Waiting 2 seconds...")
    time.sleep(2)
    
    # Now try to login
    print("\n4. Attempting login...")
    login_data = {
        "email": email,
        "password": password
    }
    
    login_response = requests.post(
        f"{BACKEND_URL}/auth/login",
        json=login_data,
        headers={"Content-Type": "application/json"},
        timeout=30
    )
    
    print(f"Login status: {login_response.status_code}")
    if login_response.status_code == 200:
        login_data = login_response.json()
        print(f"Login successful: {login_data.get('user', {}).get('id')}")
        login_token = login_data.get('access_token')
        print(f"Login token: {login_token[:50]}...")
        
        # Test the login token
        print("\n5. Testing login token...")
        headers = {"Authorization": f"Bearer {login_token}"}
        me_response = requests.get(f"{BACKEND_URL}/me", headers=headers, timeout=30)
        print(f"Me endpoint with login token: {me_response.status_code}")
        if me_response.status_code != 200:
            print(f"Error: {me_response.text}")
        else:
            print(f"Success: {me_response.json().get('user_type')}")
            
        # Test creating an order
        print("\n6. Testing order creation...")
        order_data = {
            "provider_id": "test-provider-id",
            "service": "Test Service",
            "description": "Test order from homeowner"
        }
        
        order_response = requests.post(
            f"{BACKEND_URL}/orders",
            json=order_data,
            headers=headers,
            timeout=30
        )
        print(f"Order creation: {order_response.status_code}")
        if order_response.status_code != 200:
            print(f"Error: {order_response.text}")
        else:
            print(f"Success: {order_response.json().get('message')}")
    else:
        print(f"Login failed: {login_response.text}")
        
        # Check if user exists in database by trying to register again
        print("\n7. Checking if user exists by trying duplicate registration...")
        dup_response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=registration_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        print(f"Duplicate registration status: {dup_response.status_code}")
        if dup_response.status_code == 400:
            print("User exists in database (duplicate email error)")
        else:
            print(f"Unexpected response: {dup_response.text}")

if __name__ == "__main__":
    test_homeowner_debug()