#!/usr/bin/env python3
"""
Property Manager & Tenant Backend Testing Script
Tests Phase 1 Backend Foundation for Property Manager & Tenant system
"""

import requests
import json
import uuid
from datetime import datetime
import sys

# Load environment variables
BACKEND_URL = "https://propmanage-app-7.preview.emergentagent.com/api"

# Global variables to store test data
property_manager_token = None
property_manager_id = None
tenant_token = None
tenant_id = None
homeowner_token = None
homeowner_id = None
provider_token = None
provider_id = None
test_order_id = None

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
    """Test property manager registration"""
    print("\n🔍 Testing Property Manager Registration...")
    global property_manager_token, property_manager_id
    
    try:
        test_data = {
            "email": f"pm_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "pmpass123",
            "user_type": "property_manager",
            "name": "John Property Manager",
            "phone": "+1-902-555-0100",
            "address": "100 Property St, Halifax, NS"
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
                user_data = data["user"]
                
                # Verify user type is property_manager
                if user_data.get("user_type") != "property_manager":
                    print(f"❌ Expected user_type 'property_manager', got '{user_data.get('user_type')}'")
                    return False
                
                # Verify properties field exists (should be empty initially)
                if "properties" not in user_data:
                    print("❌ Missing 'properties' field in property manager user data")
                    return False
                
                print("✅ Property Manager registration successful")
                print(f"   - User ID: {property_manager_id}")
                print(f"   - User Type: {user_data.get('user_type')}")
                print(f"   - Properties: {user_data.get('properties', [])}")
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

def test_homeowner_registration_without_pm_code():
    """Test homeowner registration without PM code"""
    print("\n🔍 Testing Homeowner Registration (without PM code)...")
    global homeowner_token, homeowner_id
    
    try:
        test_data = {
            "email": f"homeowner_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "homepass123",
            "user_type": "homeowner",
            "name": "Jane Homeowner",
            "phone": "+1-902-555-0200",
            "address": "200 Home Ave, Halifax, NS"
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
                homeowner_token = data["access_token"]
                homeowner_id = data["user"]["id"]
                user_data = data["user"]
                
                # Verify user type is homeowner
                if user_data.get("user_type") != "homeowner":
                    print(f"❌ Expected user_type 'homeowner', got '{user_data.get('user_type')}'")
                    return False
                
                # Verify no PM-related fields
                if user_data.get("property_manager_id") is not None:
                    print(f"❌ Homeowner should not have property_manager_id, got '{user_data.get('property_manager_id')}'")
                    return False
                
                print("✅ Homeowner registration (without PM code) successful")
                print(f"   - User ID: {homeowner_id}")
                print(f"   - User Type: {user_data.get('user_type')}")
                return True
            else:
                print(f"❌ Invalid response structure: {data}")
                return False
        else:
            print(f"❌ Homeowner registration failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Homeowner registration failed: {e}")
        return False

def test_tenant_registration_with_valid_pm_code():
    """Test tenant registration with valid PM code (666666)"""
    print("\n🔍 Testing Tenant Registration (with valid PM code 666666)...")
    global tenant_token, tenant_id
    
    if not property_manager_id:
        print("❌ No property manager available for tenant registration test")
        return False
    
    try:
        test_data = {
            "email": f"tenant_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "tenantpass123",
            "user_type": "homeowner",  # Should be auto-changed to tenant
            "name": "Bob Tenant",
            "phone": "+1-902-555-0300",
            "address": "300 Tenant Blvd, Halifax, NS",
            "pm_code": "666666",
            "property_address": "123 Managed Property St, Halifax, NS"
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
                user_data = data["user"]
                
                # Verify user type was auto-changed to tenant
                if user_data.get("user_type") != "tenant":
                    print(f"❌ Expected user_type 'tenant' (auto-set), got '{user_data.get('user_type')}'")
                    return False
                
                # Verify property_manager_id is set
                if user_data.get("property_manager_id") != property_manager_id:
                    print(f"❌ Expected property_manager_id '{property_manager_id}', got '{user_data.get('property_manager_id')}'")
                    return False
                
                # Verify property_address is set
                if user_data.get("property_address") != test_data["property_address"]:
                    print(f"❌ Expected property_address '{test_data['property_address']}', got '{user_data.get('property_address')}'")
                    return False
                
                print("✅ Tenant registration (with valid PM code) successful")
                print(f"   - User ID: {tenant_id}")
                print(f"   - User Type: {user_data.get('user_type')} (auto-set from homeowner)")
                print(f"   - Property Manager ID: {user_data.get('property_manager_id')}")
                print(f"   - Property Address: {user_data.get('property_address')}")
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

def test_tenant_registration_with_invalid_pm_code():
    """Test tenant registration with invalid PM code"""
    print("\n🔍 Testing Tenant Registration (with invalid PM code)...")
    
    try:
        test_data = {
            "email": f"badtenant_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "badtenantpass123",
            "user_type": "homeowner",
            "name": "Bad Tenant",
            "phone": "+1-902-555-0400",
            "address": "400 Bad Tenant Ave, Halifax, NS",
            "pm_code": "invalid123",  # Invalid PM code
            "property_address": "456 Invalid Property St, Halifax, NS"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        # Should return error for invalid PM code
        if response.status_code == 400:
            data = response.json()
            if "Invalid property manager code" in data.get("detail", ""):
                print("✅ Invalid PM code properly rejected (400)")
                return True
            else:
                print(f"❌ Expected 'Invalid property manager code' error, got: {data}")
                return False
        else:
            print(f"❌ Expected 400 for invalid PM code, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Invalid PM code test failed: {e}")
        return False

def test_pm_properties_updated_after_tenant_registration():
    """Test that PM's properties list is updated when tenant registers"""
    print("\n🔍 Testing PM Properties List Update After Tenant Registration...")
    
    if not property_manager_token or not property_manager_id:
        print("❌ No property manager available for properties test")
        return False
    
    try:
        # Get current property manager data
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.get(
            f"{BACKEND_URL}/auth/me",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            pm_data = response.json()
            properties = pm_data.get("properties", [])
            
            # Should contain the property address from tenant registration
            expected_property = "123 Managed Property St, Halifax, NS"
            if expected_property not in properties:
                print(f"❌ Expected property '{expected_property}' not found in PM properties: {properties}")
                return False
            
            print("✅ PM properties list updated after tenant registration")
            print(f"   - Properties managed: {properties}")
            return True
        else:
            print(f"❌ Failed to get PM data with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PM properties test failed: {e}")
        return False

def test_valid_user_types():
    """Test all valid user types are supported"""
    print("\n🔍 Testing Valid User Types...")
    
    valid_types = ["provider", "homeowner", "property_manager", "tenant"]
    
    try:
        # Test provider registration
        provider_data = {
            "email": f"testprovider_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "providerpass123",
            "user_type": "provider",
            "name": "Test Provider",
            "business_name": "Test Services",
            "services": ["Plumbing"]
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=provider_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data["user"]["user_type"] == "provider":
                print("✅ Provider user type supported")
                global provider_token, provider_id
                provider_token = data["access_token"]
                provider_id = data["user"]["id"]
            else:
                print("❌ Provider user type not working correctly")
                return False
        else:
            print(f"❌ Provider registration failed: {response.status_code}")
            return False
        
        # We already tested homeowner, property_manager, and tenant in previous tests
        print("✅ All valid user types supported:")
        print("   - provider ✅")
        print("   - homeowner ✅")
        print("   - property_manager ✅")
        print("   - tenant ✅")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Valid user types test failed: {e}")
        return False

def test_property_manager_tenants_endpoint():
    """Test GET /property-manager/tenants endpoint"""
    print("\n🔍 Testing Property Manager Tenants Endpoint...")
    
    if not property_manager_token:
        print("❌ No property manager token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.get(
            f"{BACKEND_URL}/property-manager/tenants",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            tenants = response.json()
            
            if not isinstance(tenants, list):
                print(f"❌ Expected list of tenants, got: {type(tenants)}")
                return False
            
            # Should contain our registered tenant
            tenant_found = False
            for tenant in tenants:
                if tenant.get("id") == tenant_id:
                    tenant_found = True
                    # Verify tenant data structure
                    if tenant.get("user_type") != "tenant":
                        print(f"❌ Expected tenant user_type, got: {tenant.get('user_type')}")
                        return False
                    if tenant.get("property_manager_id") != property_manager_id:
                        print(f"❌ Expected property_manager_id {property_manager_id}, got: {tenant.get('property_manager_id')}")
                        return False
                    # Verify no password_hash in response
                    if "password_hash" in tenant:
                        print("❌ Password hash should not be in tenant response")
                        return False
                    break
            
            if not tenant_found:
                print(f"❌ Registered tenant {tenant_id} not found in PM's tenants list")
                return False
            
            print("✅ Property Manager tenants endpoint working")
            print(f"   - Found {len(tenants)} tenant(s)")
            print(f"   - Registered tenant found in list")
            return True
        else:
            print(f"❌ PM tenants endpoint failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PM tenants endpoint test failed: {e}")
        return False

def test_property_manager_properties_endpoint():
    """Test GET /property-manager/properties endpoint"""
    print("\n🔍 Testing Property Manager Properties Endpoint...")
    
    if not property_manager_token:
        print("❌ No property manager token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.get(
            f"{BACKEND_URL}/property-manager/properties",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if "properties" not in data:
                print(f"❌ Expected 'properties' field in response, got: {data}")
                return False
            
            properties = data["properties"]
            if not isinstance(properties, list):
                print(f"❌ Expected list of properties, got: {type(properties)}")
                return False
            
            # Should contain the property from tenant registration
            expected_property = "123 Managed Property St, Halifax, NS"
            if expected_property not in properties:
                print(f"❌ Expected property '{expected_property}' not found: {properties}")
                return False
            
            print("✅ Property Manager properties endpoint working")
            print(f"   - Properties managed: {properties}")
            return True
        else:
            print(f"❌ PM properties endpoint failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PM properties endpoint test failed: {e}")
        return False

def test_tenant_order_workflow():
    """Test tenant order creation with PM approval workflow"""
    print("\n🔍 Testing Tenant Order Workflow (PM Approval Required)...")
    
    if not tenant_token or not provider_id:
        print("❌ Missing tenant token or provider ID")
        return False
    
    try:
        # Create tenant order via quotation request
        order_data = {
            "homeowner_id": tenant_id,
            "provider_id": provider_id,
            "homeowner_name": "Bob Tenant",
            "homeowner_email": "tenant@doordtest.com",
            "homeowner_phone": "+1-902-555-0300",
            "homeowner_address": "123 Managed Property St, Halifax, NS",
            "provider_name": "Test Provider",
            "service_type": "Plumbing Repair",
            "description": "Fix leaky faucet in apartment",
            "preferred_date": "2024-02-01",
            "budget": "$100-200",
            "requester_type": "tenant",
            "property_manager_id": property_manager_id,
            "property_address": "123 Managed Property St, Halifax, NS"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/quotations",
            json=order_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "order_id" not in data:
                print(f"❌ No order_id in response: {data}")
                return False
            
            global test_order_id
            test_order_id = data["order_id"]
            
            # Check if message indicates PM approval needed
            if "Property Manager for approval" not in data.get("message", ""):
                print(f"❌ Expected PM approval message, got: {data.get('message')}")
                return False
            
            print("✅ Tenant order created with PM approval requirement")
            print(f"   - Order ID: {test_order_id}")
            print(f"   - Message: {data.get('message')}")
            return True
        else:
            print(f"❌ Tenant order creation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Tenant order workflow test failed: {e}")
        return False

def test_homeowner_order_workflow():
    """Test homeowner order creation (normal workflow)"""
    print("\n🔍 Testing Homeowner Order Workflow (Normal Process)...")
    
    if not homeowner_token or not provider_id:
        print("❌ Missing homeowner token or provider ID")
        return False
    
    try:
        # Create homeowner order via quotation request
        order_data = {
            "homeowner_id": homeowner_id,
            "provider_id": provider_id,
            "homeowner_name": "Jane Homeowner",
            "homeowner_email": "homeowner@doordtest.com",
            "homeowner_phone": "+1-902-555-0200",
            "homeowner_address": "200 Home Ave, Halifax, NS",
            "provider_name": "Test Provider",
            "service_type": "Electrical Work",
            "description": "Install new outlet",
            "preferred_date": "2024-02-05",
            "budget": "$150-250",
            "requester_type": "homeowner"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/quotations",
            json=order_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "order_id" not in data:
                print(f"❌ No order_id in response: {data}")
                return False
            
            homeowner_order_id = data["order_id"]
            
            # Should proceed normally (no PM approval needed)
            if "Property Manager" in data.get("message", ""):
                print(f"❌ Homeowner order should not require PM approval: {data.get('message')}")
                return False
            
            print("✅ Homeowner order created with normal workflow")
            print(f"   - Order ID: {homeowner_order_id}")
            print(f"   - Message: {data.get('message')}")
            return True
        else:
            print(f"❌ Homeowner order creation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Homeowner order workflow test failed: {e}")
        return False

def test_property_manager_orders_endpoint():
    """Test GET /property-manager/orders endpoint"""
    print("\n🔍 Testing Property Manager Orders Endpoint...")
    
    if not property_manager_token:
        print("❌ No property manager token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.get(
            f"{BACKEND_URL}/property-manager/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            orders = response.json()
            
            if not isinstance(orders, list):
                print(f"❌ Expected list of orders, got: {type(orders)}")
                return False
            
            # Should contain our tenant order requiring approval
            tenant_order_found = False
            for order in orders:
                if order.get("id") == test_order_id:
                    tenant_order_found = True
                    # Verify order data
                    if order.get("status") != "pending_pm_approval":
                        print(f"❌ Expected status 'pending_pm_approval', got: {order.get('status')}")
                        return False
                    if order.get("requester_type") != "tenant":
                        print(f"❌ Expected requester_type 'tenant', got: {order.get('requester_type')}")
                        return False
                    if order.get("property_manager_id") != property_manager_id:
                        print(f"❌ Expected property_manager_id {property_manager_id}, got: {order.get('property_manager_id')}")
                        return False
                    break
            
            if not tenant_order_found:
                print(f"❌ Tenant order {test_order_id} not found in PM orders list")
                return False
            
            print("✅ Property Manager orders endpoint working")
            print(f"   - Found {len(orders)} order(s) requiring PM attention")
            print(f"   - Tenant order found with pending_pm_approval status")
            return True
        else:
            print(f"❌ PM orders endpoint failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PM orders endpoint test failed: {e}")
        return False

def test_property_manager_approve_order():
    """Test PUT /property-manager/orders/{id}/approve endpoint"""
    print("\n🔍 Testing Property Manager Order Approval...")
    
    if not property_manager_token or not test_order_id:
        print("❌ Missing PM token or test order ID")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.put(
            f"{BACKEND_URL}/property-manager/orders/{test_order_id}/approve",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "approved successfully" not in data.get("message", ""):
                print(f"❌ Expected approval success message, got: {data}")
                return False
            
            # Verify order status changed to pending_quotation
            if provider_token:
                provider_headers = {"Authorization": f"Bearer {provider_token}"}
                order_response = requests.get(
                    f"{BACKEND_URL}/orders/{test_order_id}",
                    headers=provider_headers,
                    timeout=30
                )
                
                if order_response.status_code == 200:
                    order_data = order_response.json()
                    if order_data.get("status") != "pending_quotation":
                        print(f"❌ Expected status 'pending_quotation' after approval, got: {order_data.get('status')}")
                        return False
                    if order_data.get("pm_approved") != True:
                        print(f"❌ Expected pm_approved=True, got: {order_data.get('pm_approved')}")
                        return False
                    if "pm_approval_date" not in order_data:
                        print("❌ Missing pm_approval_date after approval")
                        return False
                else:
                    print(f"❌ Failed to verify order status after approval: {order_response.status_code}")
                    return False
            
            print("✅ Property Manager order approval working")
            print(f"   - Order approved successfully")
            print(f"   - Status changed to pending_quotation")
            print(f"   - PM approval fields updated")
            return True
        else:
            print(f"❌ PM order approval failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PM order approval test failed: {e}")
        return False

def test_property_manager_deny_order():
    """Test PUT /property-manager/orders/{id}/deny endpoint"""
    print("\n🔍 Testing Property Manager Order Denial...")
    
    if not property_manager_token or not tenant_token or not provider_id:
        print("❌ Missing required tokens or provider ID")
        return False
    
    try:
        # Create another tenant order to test denial
        order_data = {
            "homeowner_id": tenant_id,
            "provider_id": provider_id,
            "homeowner_name": "Bob Tenant",
            "homeowner_email": "tenant@doordtest.com",
            "homeowner_phone": "+1-902-555-0300",
            "homeowner_address": "123 Managed Property St, Halifax, NS",
            "provider_name": "Test Provider",
            "service_type": "Carpet Cleaning",
            "description": "Clean apartment carpets",
            "preferred_date": "2024-02-10",
            "budget": "$200-300",
            "requester_type": "tenant",
            "property_manager_id": property_manager_id,
            "property_address": "123 Managed Property St, Halifax, NS"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/quotations",
            json=order_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to create test order for denial: {response.status_code}")
            return False
        
        deny_order_id = response.json()["order_id"]
        
        # Now deny the order
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.put(
            f"{BACKEND_URL}/property-manager/orders/{deny_order_id}/deny",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "denied" not in data.get("message", ""):
                print(f"❌ Expected denial message, got: {data}")
                return False
            
            # Verify order status changed to denied
            if provider_token:
                provider_headers = {"Authorization": f"Bearer {provider_token}"}
                order_response = requests.get(
                    f"{BACKEND_URL}/orders/{deny_order_id}",
                    headers=provider_headers,
                    timeout=30
                )
                
                if order_response.status_code == 200:
                    order_data = order_response.json()
                    if order_data.get("status") != "denied":
                        print(f"❌ Expected status 'denied' after denial, got: {order_data.get('status')}")
                        return False
                    if order_data.get("pm_approved") != False:
                        print(f"❌ Expected pm_approved=False, got: {order_data.get('pm_approved')}")
                        return False
                    if "pm_approval_date" not in order_data:
                        print("❌ Missing pm_approval_date after denial")
                        return False
                else:
                    print(f"❌ Failed to verify order status after denial: {order_response.status_code}")
                    return False
            
            print("✅ Property Manager order denial working")
            print(f"   - Order denied successfully")
            print(f"   - Status changed to denied")
            print(f"   - PM approval fields updated")
            return True
        else:
            print(f"❌ PM order denial failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PM order denial test failed: {e}")
        return False

def test_order_model_fields():
    """Test that Order model supports all required PM/Tenant fields"""
    print("\n🔍 Testing Order Model PM/Tenant Fields...")
    
    if not provider_token or not test_order_id:
        print("❌ Missing provider token or test order ID")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.get(
            f"{BACKEND_URL}/orders/{test_order_id}",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            order = response.json()
            
            # Check for required PM/Tenant fields
            required_fields = [
                "property_manager_id",
                "pm_approved", 
                "pm_approval_date",
                "requester_type",
                "property_address"
            ]
            
            for field in required_fields:
                if field not in order:
                    print(f"❌ Missing required field '{field}' in order model")
                    return False
            
            # Verify field values
            if order.get("property_manager_id") != property_manager_id:
                print(f"❌ Expected property_manager_id {property_manager_id}, got: {order.get('property_manager_id')}")
                return False
            
            if order.get("requester_type") != "tenant":
                print(f"❌ Expected requester_type 'tenant', got: {order.get('requester_type')}")
                return False
            
            if order.get("pm_approved") != True:
                print(f"❌ Expected pm_approved=True (after approval), got: {order.get('pm_approved')}")
                return False
            
            print("✅ Order model supports all PM/Tenant fields")
            print(f"   - property_manager_id: {order.get('property_manager_id')}")
            print(f"   - pm_approved: {order.get('pm_approved')}")
            print(f"   - pm_approval_date: {order.get('pm_approval_date')}")
            print(f"   - requester_type: {order.get('requester_type')}")
            print(f"   - property_address: {order.get('property_address')}")
            return True
        else:
            print(f"❌ Failed to get order for model test: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Order model fields test failed: {e}")
        return False

def test_user_model_fields():
    """Test that User model supports all required PM/Tenant fields"""
    print("\n🔍 Testing User Model PM/Tenant Fields...")
    
    if not property_manager_token or not tenant_token:
        print("❌ Missing PM or tenant tokens")
        return False
    
    try:
        # Test Property Manager fields
        pm_headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.get(
            f"{BACKEND_URL}/auth/me",
            headers=pm_headers,
            timeout=30
        )
        
        if response.status_code == 200:
            pm_user = response.json()
            
            # Check PM-specific fields
            if "properties" not in pm_user:
                print("❌ Missing 'properties' field in Property Manager user model")
                return False
            
            print("✅ Property Manager user model fields verified")
            print(f"   - properties: {pm_user.get('properties')}")
        else:
            print(f"❌ Failed to get PM user data: {response.status_code}")
            return False
        
        # Test Tenant fields
        tenant_headers = {"Authorization": f"Bearer {tenant_token}"}
        response = requests.get(
            f"{BACKEND_URL}/auth/me",
            headers=tenant_headers,
            timeout=30
        )
        
        if response.status_code == 200:
            tenant_user = response.json()
            
            # Check tenant-specific fields
            required_tenant_fields = ["property_manager_id", "property_address"]
            for field in required_tenant_fields:
                if field not in tenant_user:
                    print(f"❌ Missing '{field}' field in Tenant user model")
                    return False
            
            # Verify field values
            if tenant_user.get("property_manager_id") != property_manager_id:
                print(f"❌ Expected property_manager_id {property_manager_id}, got: {tenant_user.get('property_manager_id')}")
                return False
            
            print("✅ Tenant user model fields verified")
            print(f"   - property_manager_id: {tenant_user.get('property_manager_id')}")
            print(f"   - property_address: {tenant_user.get('property_address')}")
            return True
        else:
            print(f"❌ Failed to get tenant user data: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ User model fields test failed: {e}")
        return False

def test_access_control():
    """Test access control for PM endpoints"""
    print("\n🔍 Testing Access Control for PM Endpoints...")
    
    if not homeowner_token or not tenant_token:
        print("❌ Missing homeowner or tenant tokens")
        return False
    
    try:
        # Test 1: Homeowner trying to access PM tenants endpoint (should fail)
        homeowner_headers = {"Authorization": f"Bearer {homeowner_token}"}
        response = requests.get(
            f"{BACKEND_URL}/property-manager/tenants",
            headers=homeowner_headers,
            timeout=30
        )
        
        if response.status_code != 403:
            print(f"❌ Expected 403 for homeowner accessing PM tenants, got {response.status_code}")
            return False
        
        print("✅ Homeowner properly blocked from PM tenants endpoint (403)")
        
        # Test 2: Tenant trying to access PM orders endpoint (should fail)
        tenant_headers = {"Authorization": f"Bearer {tenant_token}"}
        response = requests.get(
            f"{BACKEND_URL}/property-manager/orders",
            headers=tenant_headers,
            timeout=30
        )
        
        if response.status_code != 403:
            print(f"❌ Expected 403 for tenant accessing PM orders, got {response.status_code}")
            return False
        
        print("✅ Tenant properly blocked from PM orders endpoint (403)")
        
        # Test 3: Homeowner trying to approve orders (should fail)
        if test_order_id:
            response = requests.put(
                f"{BACKEND_URL}/property-manager/orders/{test_order_id}/approve",
                headers=homeowner_headers,
                timeout=30
            )
            
            if response.status_code != 403:
                print(f"❌ Expected 403 for homeowner approving orders, got {response.status_code}")
                return False
            
            print("✅ Homeowner properly blocked from order approval (403)")
        
        print("✅ All access control tests passed")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Access control test failed: {e}")
        return False

def run_all_tests():
    """Run all Property Manager & Tenant backend tests"""
    print("=" * 80)
    print("🚀 PROPERTY MANAGER & TENANT BACKEND TESTING STARTED")
    print("=" * 80)
    
    test_results = []
    
    # Phase 1: Basic Setup Tests
    print("\n" + "=" * 60)
    print("📋 PHASE 1: BASIC SETUP & REGISTRATION")
    print("=" * 60)
    
    test_results.append(("Backend Health", test_backend_health()))
    test_results.append(("Property Manager Registration", test_property_manager_registration()))
    test_results.append(("Homeowner Registration (no PM code)", test_homeowner_registration_without_pm_code()))
    test_results.append(("Tenant Registration (valid PM code)", test_tenant_registration_with_valid_pm_code()))
    test_results.append(("Tenant Registration (invalid PM code)", test_tenant_registration_with_invalid_pm_code()))
    test_results.append(("PM Properties Updated After Tenant Registration", test_pm_properties_updated_after_tenant_registration()))
    test_results.append(("Valid User Types Support", test_valid_user_types()))
    
    # Phase 2: Order Workflow Tests (moved up to create test data)
    print("\n" + "=" * 60)
    print("📋 PHASE 2: ORDER WORKFLOW TESTING")
    print("=" * 60)
    
    test_results.append(("Tenant Order Workflow", test_tenant_order_workflow()))
    test_results.append(("Homeowner Order Workflow", test_homeowner_order_workflow()))
    
    # Phase 3: Property Manager Endpoints (moved down to use test data)
    print("\n" + "=" * 60)
    print("🏢 PHASE 3: PROPERTY MANAGER ENDPOINTS")
    print("=" * 60)
    
    test_results.append(("PM Tenants Endpoint", test_property_manager_tenants_endpoint()))
    test_results.append(("PM Properties Endpoint", test_property_manager_properties_endpoint()))
    test_results.append(("PM Orders Endpoint", test_property_manager_orders_endpoint()))
    test_results.append(("PM Order Approval", test_property_manager_approve_order()))
    test_results.append(("PM Order Denial", test_property_manager_deny_order()))
    
    # Phase 4: Data Model Tests
    print("\n" + "=" * 60)
    print("🗃️ PHASE 4: DATA MODEL VALIDATION")
    print("=" * 60)
    
    test_results.append(("Order Model PM/Tenant Fields", test_order_model_fields()))
    test_results.append(("User Model PM/Tenant Fields", test_user_model_fields()))
    
    # Phase 5: Security & Access Control
    print("\n" + "=" * 60)
    print("🔒 PHASE 5: SECURITY & ACCESS CONTROL")
    print("=" * 60)
    
    test_results.append(("Access Control for PM Endpoints", test_access_control()))
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 PROPERTY MANAGER & TENANT TESTING SUMMARY")
    print("=" * 80)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<45} {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal Tests: {len(test_results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 ALL PROPERTY MANAGER & TENANT BACKEND TESTS PASSED!")
        print("✅ Phase 1 Backend Foundation is fully functional and ready for frontend implementation")
        return True
    else:
        print(f"\n⚠️ {failed} PROPERTY MANAGER & TENANT BACKEND TESTS FAILED!")
        print("❌ Phase 1 Backend Foundation needs fixes before proceeding to frontend")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)