#!/usr/bin/env python3
"""
Authentication Verification Test
Verify the specific test accounts work as mentioned in review request
"""

import requests
import json

BACKEND_URL = "https://deploy-doord.preview.emergentagent.com/api"

def test_specific_accounts():
    """Test the specific accounts mentioned in review request"""
    print("🔐 Testing Specific Test Accounts from Review Request")
    print("=" * 60)
    
    # Test accounts from review request
    test_accounts = [
        {
            "email": "test@provider.com",
            "password": "password123",
            "type": "provider"
        },
        {
            "email": "test@homeowner.com", 
            "password": "password123",
            "type": "homeowner"
        }
    ]
    
    results = []
    
    for account in test_accounts:
        print(f"\n🔍 Testing {account['type']}: {account['email']}")
        
        try:
            login_data = {
                "email": account["email"],
                "password": account["password"]
            }
            
            response = requests.post(
                f"{BACKEND_URL}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                if "access_token" in data and "user" in data:
                    user = data["user"]
                    
                    # Verify user type matches expected
                    if user.get("user_type") == account["type"]:
                        print(f"✅ {account['type'].title()} login successful")
                        print(f"   User ID: {user.get('id')}")
                        print(f"   Name: {user.get('name')}")
                        print(f"   Email: {user.get('email')}")
                        print(f"   User Type: {user.get('user_type')}")
                        
                        if account["type"] == "provider":
                            print(f"   Business Name: {user.get('business_name', 'N/A')}")
                            print(f"   Services: {user.get('services', 'N/A')}")
                        
                        results.append((account["email"], True, "Login successful"))
                    else:
                        print(f"❌ User type mismatch: expected {account['type']}, got {user.get('user_type')}")
                        results.append((account["email"], False, f"User type mismatch"))
                else:
                    print(f"❌ Invalid response structure: {data}")
                    results.append((account["email"], False, "Invalid response structure"))
            else:
                print(f"❌ Login failed with status {response.status_code}")
                print(f"   Response: {response.text}")
                results.append((account["email"], False, f"HTTP {response.status_code}"))
                
        except Exception as e:
            print(f"❌ Login error: {e}")
            results.append((account["email"], False, f"Exception: {e}"))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 AUTHENTICATION TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for email, success, message in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{email:<25} {status} - {message}")
        if success:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal Accounts: {len(results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    return failed == 0

if __name__ == "__main__":
    success = test_specific_accounts()
    exit(0 if success else 1)