#!/usr/bin/env python3
"""
Tenant & Property Manager Linking Feature Test
Focus: Testing PM code generation, tenant joining, and issue reporting system
"""

import requests
import json
import os
from datetime import datetime
import sys
import uuid

# Load environment variables
BACKEND_URL = "https://prop-issue-report.preview.emergentagent.com/api"

# Global variables to store test data
property_manager_token = None
tenant_token = None
property_manager_id = None
tenant_id = None
generated_pm_code = None
test_issue_id = None

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

def test_property_manager_registration():
    """Test Property Manager registration"""
    print("\n🔍 Testing Property Manager Registration...")
    global property_manager_token, property_manager_id
    
    try:
        test_data = {
            "email": f"pm_{uuid.uuid4().hex[:8]}@testpm.com",
            "password": "pmpass123",
            "user_type": "property_manager",
            "name": "John Property Manager",
            "phone": "+1-555-0123",
            "address": "123 PM Street, City, State",
            "business_name": "Premium Property Management LLC"
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
                property_manager_token = data["access_token"]
                property_manager_id = data["user"]["id"]
                print("✅ Property Manager registration successful")
                print(f"   PM ID: {property_manager_id}")
                return True
            else:
                print(f"❌ Invalid response structure: {data}")
                return False
        else:
            print(f"❌ Property Manager registration failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Property Manager registration failed: {e}")
        return False

def test_pm_generate_code():
    """Test Property Manager code generation"""
    print("\n🔍 Testing PM Code Generation...")
    global generated_pm_code
    
    if not property_manager_token:
        print("❌ No Property Manager token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.post(
            f"{BACKEND_URL}/pm/generate-code",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "code" in data and "message" in data:
                generated_pm_code = data["code"]
                print(f"✅ PM code generated successfully: {generated_pm_code}")
                
                # Verify code is 6 characters
                if len(generated_pm_code) == 6:
                    print("✅ Code length is correct (6 characters)")
                    return True
                else:
                    print(f"❌ Code length incorrect: {len(generated_pm_code)} (expected 6)")
                    return False
            else:
                print(f"❌ Invalid response structure: {data}")
                return False
        else:
            print(f"❌ PM code generation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PM code generation failed: {e}")
        return False

def test_pm_get_code():
    """Test retrieving Property Manager's current code"""
    print("\n🔍 Testing Get PM Code...")
    
    if not property_manager_token or not generated_pm_code:
        print("❌ No Property Manager token or generated code available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.get(
            f"{BACKEND_URL}/pm/my-code",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "code" in data:
                retrieved_code = data["code"]
                if retrieved_code == generated_pm_code:
                    print(f"✅ PM code retrieved successfully: {retrieved_code}")
                    return True
                else:
                    print(f"❌ Code mismatch: generated={generated_pm_code}, retrieved={retrieved_code}")
                    return False
            else:
                print(f"❌ Invalid response structure: {data}")
                return False
        else:
            print(f"❌ Get PM code failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Get PM code failed: {e}")
        return False

def test_tenant_registration():
    """Test Tenant (homeowner) registration"""
    print("\n🔍 Testing Tenant Registration...")
    global tenant_token, tenant_id
    
    try:
        test_data = {
            "email": f"tenant_{uuid.uuid4().hex[:8]}@testtenant.com",
            "password": "tenantpass123",
            "user_type": "homeowner",
            "name": "Jane Tenant",
            "phone": "+1-555-0456",
            "address": "456 Tenant Ave, Apt 2B, City, State"
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
                tenant_token = data["access_token"]
                tenant_id = data["user"]["id"]
                print("✅ Tenant registration successful")
                print(f"   Tenant ID: {tenant_id}")
                return True
            else:
                print(f"❌ Invalid response structure: {data}")
                return False
        else:
            print(f"❌ Tenant registration failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Tenant registration failed: {e}")
        return False

def test_tenant_join_pm():
    """Test Tenant joining Property Manager using code"""
    print("\n🔍 Testing Tenant Join PM...")
    
    if not tenant_token or not generated_pm_code:
        print("❌ No tenant token or PM code available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {tenant_token}"}
        data = {"code": generated_pm_code}
        
        response = requests.post(
            f"{BACKEND_URL}/tenant/join-pm",
            json=data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            response_data = response.json()
            if "message" in response_data and "property_manager" in response_data:
                pm_info = response_data["property_manager"]
                if pm_info["id"] == property_manager_id:
                    print("✅ Tenant successfully joined Property Manager")
                    print(f"   PM Name: {pm_info.get('name')}")
                    print(f"   PM Business: {pm_info.get('business_name')}")
                    return True
                else:
                    print(f"❌ PM ID mismatch: expected={property_manager_id}, got={pm_info['id']}")
                    return False
            else:
                print(f"❌ Invalid response structure: {response_data}")
                return False
        else:
            print(f"❌ Tenant join PM failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Tenant join PM failed: {e}")
        return False

def test_tenant_get_pm():
    """Test retrieving tenant's linked Property Manager"""
    print("\n🔍 Testing Get Tenant's PM...")
    
    if not tenant_token:
        print("❌ No tenant token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {tenant_token}"}
        response = requests.get(
            f"{BACKEND_URL}/tenant/my-pm",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "property_manager" in data and data["property_manager"]:
                pm_info = data["property_manager"]
                if pm_info["id"] == property_manager_id:
                    print("✅ Tenant's PM retrieved successfully")
                    print(f"   PM Name: {pm_info.get('name')}")
                    print(f"   PM Business: {pm_info.get('business_name')}")
                    print(f"   PM Phone: {pm_info.get('phone')}")
                    print(f"   PM Email: {pm_info.get('email')}")
                    return True
                else:
                    print(f"❌ PM ID mismatch: expected={property_manager_id}, got={pm_info['id']}")
                    return False
            else:
                print(f"❌ No property manager found or invalid structure: {data}")
                return False
        else:
            print(f"❌ Get tenant's PM failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Get tenant's PM failed: {e}")
        return False

def test_pm_get_tenants():
    """Test Property Manager getting list of linked tenants"""
    print("\n🔍 Testing PM Get Tenants...")
    
    if not property_manager_token:
        print("❌ No Property Manager token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.get(
            f"{BACKEND_URL}/pm/tenants",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            tenants = response.json()
            if isinstance(tenants, list):
                print(f"✅ PM tenants retrieved successfully ({len(tenants)} tenants)")
                
                # Verify our test tenant is in the list
                tenant_found = False
                for tenant in tenants:
                    if tenant["id"] == tenant_id:
                        tenant_found = True
                        print(f"   Tenant: {tenant.get('name')} ({tenant.get('email')})")
                        print(f"   Address: {tenant.get('address')}")
                        print(f"   Joined: {tenant.get('joined_at')}")
                        break
                
                if tenant_found:
                    print("✅ Test tenant found in PM's tenant list")
                    return True
                else:
                    print("❌ Test tenant not found in PM's tenant list")
                    return False
            else:
                print(f"❌ Expected list, got: {type(tenants)}")
                return False
        else:
            print(f"❌ PM get tenants failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PM get tenants failed: {e}")
        return False

def test_create_issue():
    """Test creating an issue report from tenant"""
    print("\n🔍 Testing Create Issue Report...")
    global test_issue_id
    
    if not tenant_token or not property_manager_id:
        print("❌ No tenant token or PM ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {tenant_token}"}
        issue_data = {
            "property_manager_id": property_manager_id,
            "unit_number": "Apt 2B",
            "issue_category": "Plumbing",
            "urgency_level": "High",
            "description": "Kitchen sink is leaking water underneath. Water is pooling on the floor and may cause damage to the cabinet and flooring if not fixed soon.",
            "ai_summary": "Urgent plumbing issue: Kitchen sink leak causing water damage risk to cabinet and flooring. Requires immediate attention to prevent property damage.",
            "best_time": "Weekday mornings (9 AM - 12 PM)",
            "permission_to_enter": "Yes, with 24-hour notice",
            "photos": []
        }
        
        response = requests.post(
            f"{BACKEND_URL}/issues",
            json=issue_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "issue_id" in data:
                test_issue_id = data["issue_id"]
                print("✅ Issue report created successfully")
                print(f"   Issue ID: {test_issue_id}")
                print(f"   Category: {issue_data['issue_category']}")
                print(f"   Urgency: {issue_data['urgency_level']}")
                return True
            else:
                print(f"❌ Invalid response structure: {data}")
                return False
        else:
            print(f"❌ Issue creation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Issue creation failed: {e}")
        return False

def test_tenant_get_issues():
    """Test tenant retrieving their own issues"""
    print("\n🔍 Testing Tenant Get Issues...")
    
    if not tenant_token:
        print("❌ No tenant token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {tenant_token}"}
        response = requests.get(
            f"{BACKEND_URL}/issues",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            issues = response.json()
            if isinstance(issues, list):
                print(f"✅ Tenant issues retrieved successfully ({len(issues)} issues)")
                
                # Verify our test issue is in the list
                issue_found = False
                for issue in issues:
                    if issue["id"] == test_issue_id:
                        issue_found = True
                        print(f"   Issue: {issue.get('issue_category')} - {issue.get('urgency_level')}")
                        print(f"   Description: {issue.get('description')[:50]}...")
                        print(f"   Status: {issue.get('status')}")
                        print(f"   Created: {issue.get('created_at')}")
                        break
                
                if issue_found:
                    print("✅ Test issue found in tenant's issue list")
                    return True
                else:
                    print("❌ Test issue not found in tenant's issue list")
                    return False
            else:
                print(f"❌ Expected list, got: {type(issues)}")
                return False
        else:
            print(f"❌ Tenant get issues failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Tenant get issues failed: {e}")
        return False

def test_pm_get_issues():
    """Test Property Manager retrieving issues from their tenants"""
    print("\n🔍 Testing PM Get Issues...")
    
    if not property_manager_token:
        print("❌ No Property Manager token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.get(
            f"{BACKEND_URL}/issues",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            issues = response.json()
            if isinstance(issues, list):
                print(f"✅ PM issues retrieved successfully ({len(issues)} issues)")
                
                # Verify our test issue is in the list
                issue_found = False
                for issue in issues:
                    if issue["id"] == test_issue_id:
                        issue_found = True
                        print(f"   Issue: {issue.get('issue_category')} - {issue.get('urgency_level')}")
                        print(f"   Tenant: {issue.get('tenant_name')} ({issue.get('tenant_email')})")
                        print(f"   Unit: {issue.get('unit_number')}")
                        print(f"   Description: {issue.get('description')[:50]}...")
                        print(f"   AI Summary: {issue.get('ai_summary')[:50]}...")
                        print(f"   Status: {issue.get('status')}")
                        break
                
                if issue_found:
                    print("✅ Test issue found in PM's issue list")
                    return True
                else:
                    print("❌ Test issue not found in PM's issue list")
                    return False
            else:
                print(f"❌ Expected list, got: {type(issues)}")
                return False
        else:
            print(f"❌ PM get issues failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PM get issues failed: {e}")
        return False

def test_invalid_pm_code():
    """Test tenant trying to join with invalid PM code"""
    print("\n🔍 Testing Invalid PM Code...")
    
    # Register a new tenant for this test
    try:
        test_data = {
            "email": f"invalidtest_{uuid.uuid4().hex[:8]}@testtenant.com",
            "password": "tenantpass123",
            "user_type": "homeowner",
            "name": "Invalid Test Tenant"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to register test tenant for invalid code test")
            return False
        
        invalid_tenant_token = response.json()["access_token"]
        
        # Try to join with invalid code
        headers = {"Authorization": f"Bearer {invalid_tenant_token}"}
        data = {"code": "INVALID"}
        
        response = requests.post(
            f"{BACKEND_URL}/tenant/join-pm",
            json=data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 404:
            print("✅ Invalid PM code properly rejected (404)")
            return True
        else:
            print(f"❌ Expected 404 for invalid code, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Invalid PM code test failed: {e}")
        return False

def test_authentication_errors():
    """Test authentication and authorization errors"""
    print("\n🔍 Testing Authentication Errors...")
    
    try:
        # Test 1: Non-PM trying to generate code
        if tenant_token:
            headers = {"Authorization": f"Bearer {tenant_token}"}
            response = requests.post(
                f"{BACKEND_URL}/pm/generate-code",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 403:
                print("✅ Non-PM code generation properly blocked (403)")
            else:
                print(f"❌ Expected 403 for non-PM code generation, got {response.status_code}")
                return False
        
        # Test 2: Non-tenant trying to join PM
        if property_manager_token:
            headers = {"Authorization": f"Bearer {property_manager_token}"}
            data = {"code": generated_pm_code}
            
            response = requests.post(
                f"{BACKEND_URL}/tenant/join-pm",
                json=data,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 403:
                print("✅ Non-tenant PM join properly blocked (403)")
            else:
                print(f"❌ Expected 403 for non-tenant PM join, got {response.status_code}")
                return False
        
        # Test 3: Unauthorized access to PM endpoints
        response = requests.get(f"{BACKEND_URL}/pm/my-code", timeout=30)
        
        if response.status_code in [401, 403]:
            print("✅ Unauthorized PM endpoint access properly blocked")
        else:
            print(f"❌ Expected 401/403 for unauthorized access, got {response.status_code}")
            return False
        
        # Test 4: Invalid JWT token
        invalid_headers = {"Authorization": "Bearer invalid-token"}
        response = requests.get(
            f"{BACKEND_URL}/pm/my-code",
            headers=invalid_headers,
            timeout=30
        )
        
        if response.status_code == 401:
            print("✅ Invalid JWT token properly handled (401)")
        else:
            print(f"❌ Expected 401 for invalid token, got {response.status_code}")
            return False
        
        print("✅ All authentication error tests passed")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Authentication error tests failed: {e}")
        return False

def run_all_tests():
    """Run all Tenant & Property Manager linking tests"""
    print("=" * 80)
    print("🚀 TENANT & PROPERTY MANAGER LINKING FEATURE TESTING STARTED")
    print("=" * 80)
    
    test_results = []
    
    # Test 1: Backend Health
    test_results.append(("Backend Health", test_backend_health()))
    
    # Test 2: Property Manager Registration
    test_results.append(("Property Manager Registration", test_property_manager_registration()))
    
    # Test 3: PM Generate Code
    test_results.append(("PM Generate Code", test_pm_generate_code()))
    
    # Test 4: PM Get Code
    test_results.append(("PM Get Code", test_pm_get_code()))
    
    # Test 5: Tenant Registration
    test_results.append(("Tenant Registration", test_tenant_registration()))
    
    # Test 6: Tenant Join PM
    test_results.append(("Tenant Join PM", test_tenant_join_pm()))
    
    # Test 7: Tenant Get PM
    test_results.append(("Tenant Get PM", test_tenant_get_pm()))
    
    # Test 8: PM Get Tenants
    test_results.append(("PM Get Tenants", test_pm_get_tenants()))
    
    # Test 9: Create Issue Report
    test_results.append(("Create Issue Report", test_create_issue()))
    
    # Test 10: Tenant Get Issues
    test_results.append(("Tenant Get Issues", test_tenant_get_issues()))
    
    # Test 11: PM Get Issues
    test_results.append(("PM Get Issues", test_pm_get_issues()))
    
    # Test 12: Invalid PM Code
    test_results.append(("Invalid PM Code", test_invalid_pm_code()))
    
    # Test 13: Authentication Errors
    test_results.append(("Authentication Errors", test_authentication_errors()))
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 TEST SUMMARY")
    print("=" * 80)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<35} {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal Tests: {len(test_results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 ALL TENANT & PM LINKING TESTS PASSED!")
        print("\n📋 COMPLETE TEST FLOW VERIFIED:")
        print("   1. ✅ Property Manager registration")
        print("   2. ✅ PM generates 6-digit code")
        print("   3. ✅ PM can retrieve their code")
        print("   4. ✅ Tenant registration")
        print("   5. ✅ Tenant joins PM using code")
        print("   6. ✅ Tenant can see linked PM details")
        print("   7. ✅ PM can see list of linked tenants")
        print("   8. ✅ Tenant can create issue reports")
        print("   9. ✅ Tenant sees their own issues")
        print("   10. ✅ PM sees issues from all linked tenants")
        print("   11. ✅ Invalid codes properly rejected")
        print("   12. ✅ Authentication & authorization working")
        return True
    else:
        print(f"\n⚠️ {failed} TENANT & PM LINKING TESTS FAILED!")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)