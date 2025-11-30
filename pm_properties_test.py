#!/usr/bin/env python3
"""
Property Manager Properties Functionality Test
Focus: Testing /api/property-manager/properties endpoint
"""

import requests
import json
import sys
from datetime import datetime
import uuid

# Configuration
BACKEND_URL = "https://sqlite-rescue.preview.emergentagent.com/api"

def test_property_manager_properties():
    """
    Test Property Manager Properties functionality
    Focus: /api/property-manager/properties endpoint
    """
    print("=" * 80)
    print("TESTING PROPERTY MANAGER PROPERTIES FUNCTIONALITY")
    print("=" * 80)
    
    test_results = []
    
    # Test 1: Create Property Manager with custom PM code
    print("\n1. TESTING PROPERTY MANAGER REGISTRATION WITH CUSTOM CODE")
    pm_code = f"PM_TEST_{uuid.uuid4().hex[:8].upper()}"
    pm_data = {
        "email": f"pm.properties.{uuid.uuid4().hex[:8]}@test.com",
        "password": "password123",
        "user_type": "property_manager",
        "name": "Properties Test Manager",
        "phone": "555-0199",
        "address": "123 Manager St, Halifax, NS",
        "pm_code": pm_code
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/register", json=pm_data)
        if response.status_code == 201 or response.status_code == 200:
            property_manager_token = response.json()["access_token"]
            pm_user = response.json()["user"]
            property_manager_id = pm_user['id']
            print(f"✅ Property Manager registered successfully with PM code: {pm_code}")
            print(f"   PM ID: {property_manager_id}")
            test_results.append("✅ PM Registration: PASSED")
        else:
            print(f"❌ PM Registration failed: {response.status_code} - {response.text}")
            test_results.append("❌ PM Registration: FAILED")
            return test_results
    except Exception as e:
        print(f"❌ PM Registration error: {str(e)}")
        test_results.append("❌ PM Registration: FAILED")
        return test_results
    
    # Test 2: Register tenant with PM code to add property
    print("\n2. TESTING TENANT REGISTRATION TO ADD PROPERTY TO PM")
    tenant_data = {
        "email": f"tenant.property1.{uuid.uuid4().hex[:8]}@test.com",
        "password": "password123",
        "user_type": "homeowner",  # Will be converted to tenant
        "name": "Property Tenant 1",
        "phone": "555-0201",
        "address": "456 Tenant Ave, Halifax, NS",
        "pm_code": pm_code,
        "property_address": "456 Tenant Ave, Halifax, NS"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/register", json=tenant_data)
        if response.status_code == 201 or response.status_code == 200:
            tenant_token = response.json()["access_token"]
            tenant_user = response.json()["user"]
            tenant_id = tenant_user['id']
            print(f"✅ Tenant registered successfully and linked to PM")
            print(f"   Tenant ID: {tenant_id}")
            print(f"   Property Address: {tenant_user.get('property_address', 'N/A')}")
            test_results.append("✅ Tenant Registration: PASSED")
        else:
            print(f"❌ Tenant Registration failed: {response.status_code} - {response.text}")
            test_results.append("❌ Tenant Registration: FAILED")
    except Exception as e:
        print(f"❌ Tenant Registration error: {str(e)}")
        test_results.append("❌ Tenant Registration: FAILED")
    
    # Test 3: Register second tenant to add another property
    print("\n3. TESTING SECOND TENANT REGISTRATION FOR MULTIPLE PROPERTIES")
    tenant2_data = {
        "email": f"tenant.property2.{uuid.uuid4().hex[:8]}@test.com",
        "password": "password123",
        "user_type": "homeowner",  # Will be converted to tenant
        "name": "Property Tenant 2",
        "phone": "555-0202",
        "address": "789 Second St, Halifax, NS",
        "pm_code": pm_code,
        "property_address": "789 Second St, Halifax, NS"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/register", json=tenant2_data)
        if response.status_code == 201 or response.status_code == 200:
            tenant2_user = response.json()["user"]
            print(f"✅ Second tenant registered successfully")
            print(f"   Tenant ID: {tenant2_user['id']}")
            print(f"   Property Address: {tenant2_user.get('property_address', 'N/A')}")
            test_results.append("✅ Second Tenant Registration: PASSED")
        else:
            print(f"❌ Second Tenant Registration failed: {response.status_code} - {response.text}")
            test_results.append("❌ Second Tenant Registration: FAILED")
    except Exception as e:
        print(f"❌ Second Tenant Registration error: {str(e)}")
        test_results.append("❌ Second Tenant Registration: FAILED")
    
    # Test 4: Test Properties endpoint with PM authentication
    print("\n4. TESTING PROPERTY MANAGER PROPERTIES ENDPOINT")
    headers = {"Authorization": f"Bearer {property_manager_token}"}
    
    try:
        response = requests.get(f"{BACKEND_URL}/property-manager/properties", headers=headers)
        if response.status_code == 200:
            properties_data = response.json()
            print(f"✅ Properties endpoint accessible with PM authentication")
            print(f"   Response structure: {json.dumps(properties_data, indent=2)}")
            
            # Verify data structure
            if "properties" in properties_data:
                properties_list = properties_data["properties"]
                print(f"   Number of properties: {len(properties_list)}")
                
                if len(properties_list) >= 2:
                    print(f"✅ Properties list contains expected properties:")
                    for i, prop in enumerate(properties_list, 1):
                        print(f"      Property {i}: {prop}")
                    test_results.append("✅ Properties Endpoint Data: PASSED")
                else:
                    print(f"⚠️  Expected 2+ properties, found {len(properties_list)}")
                    test_results.append("⚠️  Properties Endpoint Data: PARTIAL")
            else:
                print(f"❌ Invalid response structure - missing 'properties' key")
                test_results.append("❌ Properties Endpoint Data: FAILED")
            
            test_results.append("✅ Properties Endpoint Access: PASSED")
        else:
            print(f"❌ Properties endpoint failed: {response.status_code} - {response.text}")
            test_results.append("❌ Properties Endpoint Access: FAILED")
    except Exception as e:
        print(f"❌ Properties endpoint error: {str(e)}")
        test_results.append("❌ Properties Endpoint Access: FAILED")
    
    # Test 5: Test authentication enforcement - homeowner should be blocked
    print("\n5. TESTING AUTHENTICATION ENFORCEMENT")
    
    # First create a homeowner account
    homeowner_data = {
        "email": f"homeowner.test.{uuid.uuid4().hex[:8]}@test.com",
        "password": "password123",
        "user_type": "homeowner",
        "name": "Test Homeowner",
        "phone": "555-0300",
        "address": "321 Homeowner Rd, Halifax, NS"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/register", json=homeowner_data)
        if response.status_code == 201 or response.status_code == 200:
            homeowner_token = response.json()["access_token"]
            print(f"✅ Homeowner account created for auth testing")
            
            # Try to access properties endpoint with homeowner token
            homeowner_headers = {"Authorization": f"Bearer {homeowner_token}"}
            response = requests.get(f"{BACKEND_URL}/property-manager/properties", headers=homeowner_headers)
            
            if response.status_code == 403:
                print(f"✅ Authentication properly enforced - homeowner blocked with 403")
                test_results.append("✅ Authentication Enforcement: PASSED")
            else:
                print(f"❌ Authentication not properly enforced - got {response.status_code}")
                test_results.append("❌ Authentication Enforcement: FAILED")
        else:
            print(f"❌ Could not create homeowner for auth testing")
            test_results.append("❌ Authentication Enforcement: SKIPPED")
    except Exception as e:
        print(f"❌ Authentication enforcement test error: {str(e)}")
        test_results.append("❌ Authentication Enforcement: FAILED")
    
    # Test 6: Test with invalid/missing token
    print("\n6. TESTING INVALID TOKEN HANDLING")
    
    try:
        # Test with no token
        response = requests.get(f"{BACKEND_URL}/property-manager/properties")
        if response.status_code == 403 or response.status_code == 401:
            print(f"✅ No token properly rejected with {response.status_code}")
        else:
            print(f"❌ No token should be rejected, got {response.status_code}")
        
        # Test with invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token_12345"}
        response = requests.get(f"{BACKEND_URL}/property-manager/properties", headers=invalid_headers)
        if response.status_code == 401:
            print(f"✅ Invalid token properly rejected with 401")
            test_results.append("✅ Invalid Token Handling: PASSED")
        else:
            print(f"❌ Invalid token should be rejected with 401, got {response.status_code}")
            test_results.append("❌ Invalid Token Handling: FAILED")
    except Exception as e:
        print(f"❌ Invalid token test error: {str(e)}")
        test_results.append("❌ Invalid Token Handling: FAILED")
    
    # Test 7: Test tenant access (should be blocked)
    print("\n7. TESTING TENANT ACCESS RESTRICTION")
    
    try:
        # Try to access properties endpoint with tenant token
        tenant_headers = {"Authorization": f"Bearer {tenant_token}"}
        response = requests.get(f"{BACKEND_URL}/property-manager/properties", headers=tenant_headers)
        
        if response.status_code == 403:
            print(f"✅ Tenant properly blocked from properties endpoint with 403")
            test_results.append("✅ Tenant Access Restriction: PASSED")
        else:
            print(f"❌ Tenant should be blocked, got {response.status_code}")
            test_results.append("❌ Tenant Access Restriction: FAILED")
    except Exception as e:
        print(f"❌ Tenant access test error: {str(e)}")
        test_results.append("❌ Tenant Access Restriction: FAILED")
    
    # Test 8: Verify PM can see their own properties after tenant registrations
    print("\n8. TESTING PM PROPERTIES AFTER TENANT ONBOARDING")
    
    try:
        response = requests.get(f"{BACKEND_URL}/property-manager/properties", headers=headers)
        if response.status_code == 200:
            final_properties = response.json()
            print(f"✅ Final properties check successful")
            print(f"   Final properties data: {json.dumps(final_properties, indent=2)}")
            
            if "properties" in final_properties:
                final_list = final_properties["properties"]
                expected_properties = ["456 Tenant Ave, Halifax, NS", "789 Second St, Halifax, NS"]
                
                all_found = all(prop in final_list for prop in expected_properties)
                if all_found:
                    print(f"✅ All expected properties found in PM's list")
                    test_results.append("✅ PM Properties After Onboarding: PASSED")
                else:
                    print(f"⚠️  Some expected properties missing")
                    print(f"   Expected: {expected_properties}")
                    print(f"   Found: {final_list}")
                    test_results.append("⚠️  PM Properties After Onboarding: PARTIAL")
            else:
                print(f"❌ Invalid response structure in final check")
                test_results.append("❌ PM Properties After Onboarding: FAILED")
        else:
            print(f"❌ Final properties check failed: {response.status_code}")
            test_results.append("❌ PM Properties After Onboarding: FAILED")
    except Exception as e:
        print(f"❌ Final properties check error: {str(e)}")
        test_results.append("❌ PM Properties After Onboarding: FAILED")
    
    return test_results

def main():
    """Run Property Manager Properties tests"""
    print("PROPERTY MANAGER PROPERTIES FUNCTIONALITY TEST")
    print("Testing backend endpoint: /api/property-manager/properties")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test started at: {datetime.now()}")
    
    try:
        # Test backend connectivity
        response = requests.get(f"{BACKEND_URL}/")
        if response.status_code != 200:
            print(f"❌ Backend not accessible at {BACKEND_URL}")
            return False
        print(f"✅ Backend accessible at {BACKEND_URL}")
        
        # Run Property Manager Properties tests
        results = test_property_manager_properties()
        
        # Summary
        print("\n" + "=" * 80)
        print("PROPERTY MANAGER PROPERTIES TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in results if "✅" in result)
        failed = sum(1 for result in results if "❌" in result)
        partial = sum(1 for result in results if "⚠️" in result)
        
        for result in results:
            print(result)
        
        print(f"\nTOTAL TESTS: {len(results)}")
        print(f"PASSED: {passed}")
        print(f"FAILED: {failed}")
        print(f"PARTIAL: {partial}")
        
        if failed == 0:
            print("\n🎉 ALL PROPERTY MANAGER PROPERTIES TESTS PASSED!")
            return True
        else:
            print(f"\n⚠️  {failed} TESTS FAILED - PROPERTY MANAGER PROPERTIES NEEDS ATTENTION")
            return False
            
    except Exception as e:
        print(f"❌ Test execution failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)