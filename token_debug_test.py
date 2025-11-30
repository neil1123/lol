#!/usr/bin/env python3
"""
Debug token authentication issue
"""

import requests
import json
import uuid

BACKEND_URL = "https://doord.site/api"

def test_token_debug():
    """Debug the token authentication issue"""
    
    # Register a new provider
    email = f"token_debug_{uuid.uuid4().hex[:8]}@doordtest.com"
    password = "testpass123"
    
    print(f"Testing with email: {email}")
    
    # Register
    registration_data = {
        "email": email,
        "password": password,
        "user_type": "provider",
        "name": "Token Debug User",
        "business_name": "Token Debug Services",
        "services": ["Test Service"]
    }
    
    print("1. Registering user...")
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
        
        # Test the registration token
        print("\n2. Testing registration token...")
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
    
    # Now try to login
    print("\n3. Attempting login...")
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
        print("\n4. Testing login token...")
        headers = {"Authorization": f"Bearer {login_token}"}
        me_response = requests.get(f"{BACKEND_URL}/me", headers=headers, timeout=30)
        print(f"Me endpoint with login token: {me_response.status_code}")
        if me_response.status_code != 200:
            print(f"Error: {me_response.text}")
        else:
            print(f"Success: {me_response.json().get('user_type')}")
            
        # Test creating an order
        print("\n5. Testing order creation...")
        order_data = {
            "homeowner_id": f"manual_{uuid.uuid4().hex[:8]}",
            "homeowner_name": "Test Customer",
            "service_type": "Test Service",
            "description": "Test order"
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

if __name__ == "__main__":
    test_token_debug()