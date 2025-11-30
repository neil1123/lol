#!/usr/bin/env python3
"""
Debug login persistence issue
"""

import requests
import json
import uuid

BACKEND_URL = "https://doord.site/api"

def test_login_debug():
    """Debug the login persistence issue"""
    
    # First register a new user
    email = f"debug_{uuid.uuid4().hex[:8]}@doordtest.com"
    password = "testpass123"
    
    print(f"Testing with email: {email}")
    
    # Register
    registration_data = {
        "email": email,
        "password": password,
        "user_type": "provider",
        "name": "Debug User",
        "business_name": "Debug Services"
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
    else:
        print(f"Registration failed: {reg_response.text}")
        return
    
    # Now try to login
    print("\n2. Attempting login...")
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
    else:
        print(f"Login failed: {login_response.text}")
        
        # Let's check what users exist
        print("\n3. Checking if user exists in database...")
        # Try to get all providers to see if our user is there
        providers_response = requests.get(f"{BACKEND_URL}/providers", timeout=30)
        if providers_response.status_code == 200:
            providers = providers_response.json()
            our_provider = next((p for p in providers if p.get("email") == email), None)
            if our_provider:
                print(f"User found in providers list: {our_provider.get('id')}")
            else:
                print("User not found in providers list")
                print(f"Total providers: {len(providers)}")
        else:
            print(f"Failed to get providers: {providers_response.status_code}")

if __name__ == "__main__":
    test_login_debug()