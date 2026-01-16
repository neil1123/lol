#!/usr/bin/env python3
"""
Dynamic Property Manager Code System Testing
Tests the new dynamic PM code system that replaced the hardcoded 666666 system
"""

import requests
import json
import uuid
import sys
from datetime import datetime

# Load environment variables
BACKEND_URL = "https://propmanage-app-7.preview.emergentagent.com/api"

# Global test data
pm_tokens = {}
pm_ids = {}
tenant_tokens = {}
tenant_ids = {}
test_pm_codes = []

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

def test_property_manager_registration_with_custom_codes():
    """Test Property Manager registration with custom PM codes"""
    print("\n🔍 Testing Property Manager Registration with Custom PM Codes...")
    global pm_tokens, pm_ids, test_pm_codes
    
    # Test multiple PM registrations with different codes
    pm_test_data = [
        {
            "email": f"pm1_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "pmpass123",
            "user_type": "property_manager",
            "name": "John Property Manager",
            "phone": "+1-902-555-1001",
            "address": "100 PM Street, Halifax, NS",
            "pm_code": f"PM{uuid.uuid4().hex[:6].upper()}"
        },
        {
            "email": f"pm2_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "pmpass123",
            "user_type": "property_manager",
            "name": "Sarah Property Manager",
            "phone": "+1-902-555-1002",
            "address": "200 PM Avenue, Halifax, NS",
            "pm_code": f"PM{uuid.uuid4().hex[:6].upper()}"
        },
        {
            "email": f"pm3_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "pmpass123",
            "user_type": "property_manager",
            "name": "Mike Property Manager",
            "phone": "+1-902-555-1003",
            "address": "300 PM Boulevard, Halifax, NS",
            "pm_code": f"PM{uuid.uuid4().hex[:6].upper()}"
        }
    ]
    
    success_count = 0
    
    for i, pm_data in enumerate(pm_test_data):
        try:
            response = requests.post(
                f"{BACKEND_URL}/auth/register",
                json=pm_data,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    pm_key = f"pm{i+1}"
                    pm_tokens[pm_key] = data["access_token"]
                    pm_ids[pm_key] = data["user"]["id"]
                    test_pm_codes.append(pm_data["pm_code"])
                    
                    # Verify user type and pm_code in response
                    user_data = data["user"]
                    if user_data.get("user_type") != "property_manager":
                        print(f"❌ PM{i+1}: Wrong user type: {user_data.get('user_type')}")
                        continue
                    
                    if user_data.get("pm_code") != pm_data["pm_code"]:
                        print(f"❌ PM{i+1}: PM code mismatch: expected {pm_data['pm_code']}, got {user_data.get('pm_code')}")
                        continue
                    
                    print(f"✅ PM{i+1} registration successful with code: {pm_data['pm_code']}")
                    success_count += 1
                else:
                    print(f"❌ PM{i+1}: Invalid response structure: {data}")
            else:
                print(f"❌ PM{i+1} registration failed with status {response.status_code}")
                print(f"Response: {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"❌ PM{i+1} registration failed: {e}")
    
    if success_count == len(pm_test_data):
        print(f"✅ All {success_count} Property Managers registered successfully with unique codes")
        return True
    else:
        print(f"❌ Only {success_count}/{len(pm_test_data)} Property Managers registered successfully")
        return False

def test_pm_code_uniqueness_validation():
    """Test that duplicate PM codes are rejected during registration"""
    print("\n🔍 Testing PM Code Uniqueness Validation...")
    
    if not test_pm_codes:
        print("❌ No PM codes available for uniqueness test")
        return False
    
    # Try to register a new PM with an existing code
    duplicate_pm_data = {
        "email": f"duplicate_pm_{uuid.uuid4().hex[:8]}@doordtest.com",
        "password": "pmpass123",
        "user_type": "property_manager",
        "name": "Duplicate PM",
        "phone": "+1-902-555-9999",
        "address": "999 Duplicate St, Halifax, NS",
        "pm_code": test_pm_codes[0]  # Use first PM's code
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=duplicate_pm_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 400:
            data = response.json()
            if "already in use" in data.get("detail", "").lower():
                print(f"✅ Duplicate PM code properly rejected: {test_pm_codes[0]}")
                return True
            else:
                print(f"❌ Wrong error message for duplicate code: {data}")
                return False
        else:
            print(f"❌ Expected 400 for duplicate PM code, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PM code uniqueness test failed: {e}")
        return False

def test_tenant_registration_with_valid_pm_codes():
    """Test tenant registration using valid PM codes"""
    print("\n🔍 Testing Tenant Registration with Valid PM Codes...")
    global tenant_tokens, tenant_ids
    
    if not test_pm_codes or not pm_ids:
        print("❌ No PM codes or PM IDs available for tenant registration test")
        return False
    
    # Test tenant registration with each PM code
    tenant_test_data = [
        {
            "email": f"tenant1_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "tenantpass123",
            "user_type": "homeowner",  # Will be changed to tenant by backend
            "name": "Alice Tenant",
            "phone": "+1-902-555-2001",
            "address": "1001 Tenant Lane, Halifax, NS",
            "pm_code": test_pm_codes[0],
            "property_address": "Apartment 101, 1001 Tenant Lane, Halifax, NS"
        },
        {
            "email": f"tenant2_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "tenantpass123",
            "user_type": "homeowner",  # Will be changed to tenant by backend
            "name": "Bob Tenant",
            "phone": "+1-902-555-2002",
            "address": "2002 Tenant Street, Halifax, NS",
            "pm_code": test_pm_codes[1],
            "property_address": "Unit 202, 2002 Tenant Street, Halifax, NS"
        }
    ]
    
    success_count = 0
    
    for i, tenant_data in enumerate(tenant_test_data):
        try:
            response = requests.post(
                f"{BACKEND_URL}/auth/register",
                json=tenant_data,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    tenant_key = f"tenant{i+1}"
                    tenant_tokens[tenant_key] = data["access_token"]
                    tenant_ids[tenant_key] = data["user"]["id"]
                    
                    # Verify user was converted to tenant
                    user_data = data["user"]
                    if user_data.get("user_type") != "tenant":
                        print(f"❌ Tenant{i+1}: User type not converted to tenant: {user_data.get('user_type')}")
                        continue
                    
                    # Verify property manager linkage
                    expected_pm_id = pm_ids[f"pm{i+1}"]
                    if user_data.get("property_manager_id") != expected_pm_id:
                        print(f"❌ Tenant{i+1}: Wrong PM linkage: expected {expected_pm_id}, got {user_data.get('property_manager_id')}")
                        continue
                    
                    # Verify property address
                    if user_data.get("property_address") != tenant_data["property_address"]:
                        print(f"❌ Tenant{i+1}: Property address mismatch")
                        continue
                    
                    print(f"✅ Tenant{i+1} registration successful with PM code: {tenant_data['pm_code']}")
                    success_count += 1
                else:
                    print(f"❌ Tenant{i+1}: Invalid response structure: {data}")
            else:
                print(f"❌ Tenant{i+1} registration failed with status {response.status_code}")
                print(f"Response: {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Tenant{i+1} registration failed: {e}")
    
    if success_count == len(tenant_test_data):
        print(f"✅ All {success_count} tenants registered successfully with valid PM codes")
        return True
    else:
        print(f"❌ Only {success_count}/{len(tenant_test_data)} tenants registered successfully")
        return False

def test_invalid_pm_code_handling():
    """Test invalid PM code handling during tenant registration"""
    print("\n🔍 Testing Invalid PM Code Handling...")
    
    # Test with non-existent PM code
    invalid_tenant_data = {
        "email": f"invalid_tenant_{uuid.uuid4().hex[:8]}@doordtest.com",
        "password": "tenantpass123",
        "user_type": "homeowner",
        "name": "Invalid Tenant",
        "phone": "+1-902-555-9998",
        "address": "9998 Invalid St, Halifax, NS",
        "pm_code": "INVALID123",
        "property_address": "Unit 999, 9998 Invalid St, Halifax, NS"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=invalid_tenant_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 400:
            data = response.json()
            if "invalid property manager code" in data.get("detail", "").lower():
                print("✅ Invalid PM code properly rejected")
                return True
            else:
                print(f"❌ Wrong error message for invalid PM code: {data}")
                return False
        else:
            print(f"❌ Expected 400 for invalid PM code, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Invalid PM code test failed: {e}")
        return False

def test_pm_tenant_list_endpoint():
    """Test PM tenant list endpoint returns tenants for logged-in PM"""
    print("\n🔍 Testing PM Tenant List Endpoint...")
    
    if not pm_tokens or not tenant_ids:
        print("❌ No PM tokens or tenant IDs available for tenant list test")
        return False
    
    # Test each PM can see their tenants
    for pm_key, pm_token in pm_tokens.items():
        try:
            headers = {"Authorization": f"Bearer {pm_token}"}
            response = requests.get(
                f"{BACKEND_URL}/property-manager/tenants",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                tenants = response.json()
                if isinstance(tenants, list):
                    # Find expected tenant for this PM
                    pm_number = pm_key[-1]  # Extract number from pm1, pm2, etc.
                    expected_tenant_key = f"tenant{pm_number}"
                    expected_tenant_id = tenant_ids.get(expected_tenant_key)
                    
                    if expected_tenant_id:
                        # Check if expected tenant is in the list
                        tenant_found = any(t.get("id") == expected_tenant_id for t in tenants)
                        if tenant_found:
                            print(f"✅ {pm_key.upper()} can see their tenant ({len(tenants)} tenants)")
                        else:
                            print(f"❌ {pm_key.upper()}: Expected tenant not found in list")
                            return False
                    else:
                        print(f"ℹ️ {pm_key.upper()}: No expected tenant for this PM")
                else:
                    print(f"❌ {pm_key.upper()}: Expected list, got {type(tenants)}")
                    return False
            else:
                print(f"❌ {pm_key.upper()}: Tenant list failed with status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ {pm_key.upper()}: Tenant list test failed: {e}")
            return False
    
    print("✅ All PMs can access their tenant lists correctly")
    return True

def test_hardcoded_666666_system_removed():
    """Test that the hardcoded 666666 system has been completely removed"""
    print("\n🔍 Testing Hardcoded 666666 System Removal...")
    
    # Try to register a tenant with the old hardcoded code
    old_system_tenant_data = {
        "email": f"old_system_tenant_{uuid.uuid4().hex[:8]}@doordtest.com",
        "password": "tenantpass123",
        "user_type": "homeowner",
        "name": "Old System Tenant",
        "phone": "+1-902-555-6666",
        "address": "6666 Old System St, Halifax, NS",
        "pm_code": "666666",
        "property_address": "Unit 666, 6666 Old System St, Halifax, NS"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=old_system_tenant_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 400:
            data = response.json()
            if "invalid property manager code" in data.get("detail", "").lower():
                print("✅ Hardcoded 666666 system properly removed - code rejected")
                return True
            else:
                print(f"❌ Wrong error message for 666666 code: {data}")
                return False
        elif response.status_code == 200:
            # If it succeeds, check if it was linked to a real PM with code 666666
            data = response.json()
            user_data = data.get("user", {})
            if user_data.get("user_type") == "tenant":
                print("❌ 666666 code still works - hardcoded system not fully removed")
                return False
            else:
                print("✅ 666666 code rejected - hardcoded system removed")
                return True
        else:
            print(f"❌ Unexpected status code for 666666 test: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Hardcoded system removal test failed: {e}")
        return False

def test_existing_user_authentication():
    """Test that existing user authentication still works"""
    print("\n🔍 Testing Existing User Authentication...")
    
    # Test existing accounts
    existing_accounts = [
        {
            "email": "test@homeowner.com",
            "password": "password123",
            "expected_type": "homeowner"
        },
        {
            "email": "test@provider.com", 
            "password": "password123",
            "expected_type": "provider"
        }
    ]
    
    success_count = 0
    
    for account in existing_accounts:
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
                if "access_token" in data and "user" in data:
                    user_data = data["user"]
                    if user_data.get("user_type") == account["expected_type"]:
                        print(f"✅ {account['email']} login successful ({account['expected_type']})")
                        success_count += 1
                    else:
                        print(f"❌ {account['email']}: Wrong user type: expected {account['expected_type']}, got {user_data.get('user_type')}")
                else:
                    print(f"❌ {account['email']}: Invalid login response structure")
            else:
                print(f"❌ {account['email']}: Login failed with status {response.status_code}")
                print(f"Response: {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {account['email']}: Login test failed: {e}")
    
    if success_count == len(existing_accounts):
        print(f"✅ All {success_count} existing accounts work correctly")
        return True
    else:
        print(f"❌ Only {success_count}/{len(existing_accounts)} existing accounts work")
        return False

def test_tenant_order_workflow_with_pm_approval():
    """Test tenant order workflow requires PM approval"""
    print("\n🔍 Testing Tenant Order Workflow with PM Approval...")
    
    if not tenant_tokens or not pm_tokens:
        print("❌ No tenant or PM tokens available for order workflow test")
        return False
    
    # Create a provider for this test
    provider_data = {
        "email": f"test_provider_{uuid.uuid4().hex[:8]}@doordtest.com",
        "password": "providerpass123",
        "user_type": "provider",
        "name": "Test Provider",
        "business_name": "Test Services",
        "services": ["Plumbing", "Electrical"]
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=provider_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to create test provider: {response.status_code}")
            return False
        
        provider_info = response.json()
        provider_id = provider_info["user"]["id"]
        
        # Create order as tenant
        tenant_token = list(tenant_tokens.values())[0]
        tenant_id = list(tenant_ids.values())[0]
        pm_id = list(pm_ids.values())[0]
        
        order_data = {
            "homeowner_id": tenant_id,
            "provider_id": provider_id,
            "homeowner_name": "Test Tenant",
            "homeowner_email": "tenant@doordtest.com",
            "homeowner_phone": "+1-902-555-3001",
            "homeowner_address": "3001 Tenant Ave, Halifax, NS",
            "provider_name": "Test Provider",
            "service_type": "Plumbing",
            "description": "Fix leaky faucet",
            "requester_type": "tenant",
            "property_manager_id": pm_id,
            "property_address": "Unit 301, 3001 Tenant Ave, Halifax, NS"
        }
        
        headers = {"Authorization": f"Bearer {tenant_token}"}
        response = requests.post(
            f"{BACKEND_URL}/orders",
            json=order_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            order = response.json()
            order_id = order["id"]
            
            # Verify order requires PM approval
            if order.get("requester_type") == "tenant" and order.get("property_manager_id") == pm_id:
                print("✅ Tenant order created with PM approval requirement")
                
                # Test PM can see and approve the order
                pm_token = list(pm_tokens.values())[0]
                pm_headers = {"Authorization": f"Bearer {pm_token}"}
                
                # Get PM orders
                response = requests.get(
                    f"{BACKEND_URL}/property-manager/orders",
                    headers=pm_headers,
                    timeout=30
                )
                
                if response.status_code == 200:
                    pm_orders = response.json()
                    order_found = any(o.get("id") == order_id for o in pm_orders)
                    
                    if order_found:
                        print("✅ PM can see tenant order requiring approval")
                        return True
                    else:
                        print("❌ PM cannot see tenant order")
                        return False
                else:
                    print(f"❌ PM orders retrieval failed: {response.status_code}")
                    return False
            else:
                print("❌ Tenant order not properly configured for PM approval")
                return False
        else:
            print(f"❌ Tenant order creation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Tenant order workflow test failed: {e}")
        return False

def run_dynamic_pm_code_tests():
    """Run all dynamic PM code system tests"""
    print("=" * 80)
    print("🚀 DYNAMIC PROPERTY MANAGER CODE SYSTEM TESTING STARTED")
    print("=" * 80)
    
    test_results = []
    
    # Test 1: Backend Health
    test_results.append(("Backend Health", test_backend_health()))
    
    # Test 2: Property Manager Registration with Custom Codes
    test_results.append(("PM Registration with Custom Codes", test_property_manager_registration_with_custom_codes()))
    
    # Test 3: PM Code Uniqueness Validation
    test_results.append(("PM Code Uniqueness Validation", test_pm_code_uniqueness_validation()))
    
    # Test 4: Tenant Registration with Valid PM Codes
    test_results.append(("Tenant Registration with Valid PM Codes", test_tenant_registration_with_valid_pm_codes()))
    
    # Test 5: Invalid PM Code Handling
    test_results.append(("Invalid PM Code Handling", test_invalid_pm_code_handling()))
    
    # Test 6: PM Tenant List Endpoint
    test_results.append(("PM Tenant List Endpoint", test_pm_tenant_list_endpoint()))
    
    # Test 7: Hardcoded 666666 System Removed
    test_results.append(("Hardcoded 666666 System Removed", test_hardcoded_666666_system_removed()))
    
    # Test 8: Existing User Authentication
    test_results.append(("Existing User Authentication", test_existing_user_authentication()))
    
    # Test 9: Tenant Order Workflow with PM Approval
    test_results.append(("Tenant Order Workflow with PM Approval", test_tenant_order_workflow_with_pm_approval()))
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 DYNAMIC PM CODE SYSTEM TEST SUMMARY")
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
    
    if failed == 0:
        print("\n🎉 ALL DYNAMIC PM CODE SYSTEM TESTS PASSED!")
        print("✅ Dynamic PM code system is working correctly")
        print("✅ Hardcoded 666666 system has been successfully removed")
        print("✅ PM-Tenant relationship management is functional")
        return True
    else:
        print(f"\n⚠️ {failed} DYNAMIC PM CODE SYSTEM TESTS FAILED!")
        return False

if __name__ == "__main__":
    success = run_dynamic_pm_code_tests()
    sys.exit(0 if success else 1)