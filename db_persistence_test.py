#!/usr/bin/env python3
"""
Test database persistence directly
"""

import requests
import json
import uuid
import time

BACKEND_URL = "https://doord.site/api"

def test_db_persistence():
    """Test if users are actually being saved to the database"""
    
    # Get initial user count
    print("1. Getting initial user count...")
    response = requests.get(f"{BACKEND_URL}/", timeout=10)
    if response.status_code == 200:
        data = response.json()
        print(f"Initial: {data.get('database', 'Unknown')}")
    
    # Register a user
    email = f"persistence_test_{uuid.uuid4().hex[:8]}@doordtest.com"
    registration_data = {
        "email": email,
        "password": "testpass123",
        "user_type": "homeowner",
        "name": "Persistence Test User"
    }
    
    print(f"\n2. Registering user: {email}")
    reg_response = requests.post(
        f"{BACKEND_URL}/auth/register",
        json=registration_data,
        headers={"Content-Type": "application/json"},
        timeout=30
    )
    
    print(f"Registration status: {reg_response.status_code}")
    if reg_response.status_code == 200:
        reg_data = reg_response.json()
        user_id = reg_data.get('user', {}).get('id')
        print(f"User ID: {user_id}")
    else:
        print(f"Registration failed: {reg_response.text}")
        return
    
    # Wait a moment
    time.sleep(2)
    
    # Check user count again
    print("\n3. Getting updated user count...")
    response = requests.get(f"{BACKEND_URL}/", timeout=10)
    if response.status_code == 200:
        data = response.json()
        print(f"After registration: {data.get('database', 'Unknown')}")
    
    # Try to login immediately
    print(f"\n4. Attempting login with {email}...")
    login_data = {"email": email, "password": "testpass123"}
    login_response = requests.post(
        f"{BACKEND_URL}/auth/login",
        json=login_data,
        headers={"Content-Type": "application/json"},
        timeout=30
    )
    
    print(f"Login status: {login_response.status_code}")
    if login_response.status_code == 200:
        print("Login successful!")
    else:
        print(f"Login failed: {login_response.text}")
    
    # Try duplicate registration to see if user exists
    print(f"\n5. Testing duplicate registration...")
    dup_response = requests.post(
        f"{BACKEND_URL}/auth/register",
        json=registration_data,
        headers={"Content-Type": "application/json"},
        timeout=30
    )
    
    print(f"Duplicate registration status: {dup_response.status_code}")
    if dup_response.status_code == 400:
        print("User exists in database (got duplicate email error)")
    else:
        print(f"Unexpected: {dup_response.text}")

if __name__ == "__main__":
    test_db_persistence()