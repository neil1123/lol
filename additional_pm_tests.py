#!/usr/bin/env python3
"""
Additional Property Manager & Tenant System Tests
Tests additional PM functionality and edge cases
"""

import requests
import json
import uuid

# Backend URL
BACKEND_URL = "https://doord-verify.preview.emergentagent.com/api"

def test_pm_endpoints():
    """Test all Property Manager endpoints"""
    print("🔍 Testing Property Manager Endpoints...")
    
    # Register PM
    pm_data = {
        "email": f"pm_test_{uuid.uuid4().hex[:8]}@doordtest.com",
        "password": "pmpass123",
        "user_type": "property_manager",
        "name": "Test PM",
        "phone": "+1-902-555-PM02"
    }
    
    response = requests.post(f"{BACKEND_URL}/auth/register", json=pm_data, timeout=30)
    if response.status_code != 200:
        print(f"❌ PM registration failed: {response.status_code}")
        return False
    
    pm_token = response.json()["access_token"]
    pm_id = response.json()["user"]["id"]
    
    # Register tenant with PM code
    tenant_data = {
        "email": f"tenant_test_{uuid.uuid4().hex[:8]}@doordtest.com",
        "password": "tenantpass123",
        "user_type": "homeowner",
        "name": "Test Tenant",
        "pm_code": "666666",
        "property_address": "123 Test Property St"
    }
    
    response = requests.post(f"{BACKEND_URL}/auth/register", json=tenant_data, timeout=30)
    if response.status_code != 200:
        print(f"❌ Tenant registration failed: {response.status_code}")
        return False
    
    tenant_token = response.json()["access_token"]
    tenant_id = response.json()["user"]["id"]
    
    headers = {"Authorization": f"Bearer {pm_token}"}
    
    # Test 1: Get PM tenants
    response = requests.get(f"{BACKEND_URL}/property-manager/tenants", headers=headers, timeout=30)
    if response.status_code == 200:
        tenants = response.json()
        print(f"✅ PM can view tenants ({len(tenants)} tenants)")
    else:
        print(f"❌ PM tenants endpoint failed: {response.status_code}")
        return False
    
    # Test 2: Get PM properties
    response = requests.get(f"{BACKEND_URL}/property-manager/properties", headers=headers, timeout=30)
    if response.status_code == 200:
        properties = response.json()
        print(f"✅ PM can view properties: {properties}")
    else:
        print(f"❌ PM properties endpoint failed: {response.status_code}")
        return False
    
    # Test 3: Get PM orders
    response = requests.get(f"{BACKEND_URL}/property-manager/orders", headers=headers, timeout=30)
    if response.status_code == 200:
        orders = response.json()
        print(f"✅ PM can view orders ({len(orders)} orders)")
    else:
        print(f"❌ PM orders endpoint failed: {response.status_code}")
        return False
    
    print("✅ All Property Manager endpoints working correctly")
    return True

def test_invalid_pm_code():
    """Test invalid PM code rejection"""
    print("\n🔍 Testing Invalid PM Code Rejection...")
    
    tenant_data = {
        "email": f"invalid_tenant_{uuid.uuid4().hex[:8]}@doordtest.com",
        "password": "tenantpass123",
        "user_type": "homeowner",
        "name": "Invalid Tenant",
        "pm_code": "123456",  # Invalid code
        "property_address": "123 Invalid St"
    }
    
    response = requests.post(f"{BACKEND_URL}/auth/register", json=tenant_data, timeout=30)
    if response.status_code == 400:
        print("✅ Invalid PM code properly rejected (400)")
        return True
    else:
        print(f"❌ Expected 400 for invalid PM code, got {response.status_code}")
        return False

def test_pm_deny_order():
    """Test PM denying an order"""
    print("\n🔍 Testing PM Order Denial...")
    
    # Register PM and tenant
    pm_data = {
        "email": f"pm_deny_{uuid.uuid4().hex[:8]}@doordtest.com",
        "password": "pmpass123",
        "user_type": "property_manager",
        "name": "Deny Test PM"
    }
    
    response = requests.post(f"{BACKEND_URL}/auth/register", json=pm_data, timeout=30)
    if response.status_code != 200:
        return False
    
    pm_token = response.json()["access_token"]
    pm_id = response.json()["user"]["id"]
    
    tenant_data = {
        "email": f"tenant_deny_{uuid.uuid4().hex[:8]}@doordtest.com",
        "password": "tenantpass123",
        "user_type": "homeowner",
        "name": "Deny Test Tenant",
        "pm_code": "666666",
        "property_address": "123 Deny Test St"
    }
    
    response = requests.post(f"{BACKEND_URL}/auth/register", json=tenant_data, timeout=30)
    if response.status_code != 200:
        return False
    
    tenant_id = response.json()["user"]["id"]
    
    # Register provider
    provider_data = {
        "email": f"provider_deny_{uuid.uuid4().hex[:8]}@doordtest.com",
        "password": "providerpass123",
        "user_type": "provider",
        "name": "Deny Test Provider",
        "business_name": "Deny Test Services",
        "services": ["Plumbing"]
    }
    
    response = requests.post(f"{BACKEND_URL}/auth/register", json=provider_data, timeout=30)
    if response.status_code != 200:
        return False
    
    provider_token = response.json()["access_token"]
    provider_id = response.json()["user"]["id"]
    
    # Create tenant order
    quotation_data = {
        "homeowner_id": tenant_id,
        "provider_id": provider_id,
        "homeowner_name": "Deny Test Tenant",
        "homeowner_email": "deny.tenant@test.com",
        "homeowner_phone": "+1-902-555-DENY",
        "homeowner_address": "123 Deny Test St",
        "provider_name": "Deny Test Services",
        "service_type": "Plumbing",
        "description": "Test order for denial",
        "requester_type": "tenant",
        "property_manager_id": pm_id,
        "property_address": "123 Deny Test St"
    }
    
    response = requests.post(f"{BACKEND_URL}/quotations", json=quotation_data, timeout=30)
    if response.status_code != 200:
        return False
    
    order_id = response.json()["order_id"]
    
    # Provider gives quotation
    provider_headers = {"Authorization": f"Bearer {provider_token}"}
    params = {"quotation_amount": 100.00, "quotation_details": "Test quotation"}
    
    response = requests.put(
        f"{BACKEND_URL}/orders/{order_id}/quotation",
        params=params,
        headers=provider_headers,
        timeout=30
    )
    
    if response.status_code != 200:
        return False
    
    # PM denies the order
    pm_headers = {"Authorization": f"Bearer {pm_token}"}
    response = requests.put(
        f"{BACKEND_URL}/property-manager/orders/{order_id}/deny",
        headers=pm_headers,
        timeout=30
    )
    
    if response.status_code == 200:
        print("✅ PM can deny orders successfully")
        
        # Verify order status is "denied"
        response = requests.get(
            f"{BACKEND_URL}/orders/{order_id}",
            headers=provider_headers,
            timeout=30
        )
        
        if response.status_code == 200:
            order_data = response.json()
            if order_data.get("status") == "denied" and order_data.get("pm_approved") == False:
                print("✅ Order properly marked as denied")
                return True
            else:
                print(f"❌ Order not properly denied: status={order_data.get('status')}, pm_approved={order_data.get('pm_approved')}")
                return False
        else:
            print(f"❌ Failed to retrieve denied order: {response.status_code}")
            return False
    else:
        print(f"❌ PM order denial failed: {response.status_code}")
        return False

def run_additional_tests():
    """Run additional PM/Tenant tests"""
    print("=" * 60)
    print("🔧 ADDITIONAL PROPERTY MANAGER & TENANT TESTS")
    print("=" * 60)
    
    test_results = []
    
    test_results.append(("PM Endpoints", test_pm_endpoints()))
    test_results.append(("Invalid PM Code", test_invalid_pm_code()))
    test_results.append(("PM Order Denial", test_pm_deny_order()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 ADDITIONAL TESTS SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in test_results if result)
    failed = len(test_results) - passed
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<25} {status}")
    
    print(f"\nTotal Tests: {len(test_results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    return failed == 0

if __name__ == "__main__":
    success = run_additional_tests()
    exit(0 if success else 1)