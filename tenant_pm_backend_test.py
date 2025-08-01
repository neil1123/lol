#!/usr/bin/env python3
"""
Property Manager & Tenant System Backend Testing Script
Tests the complete PM-Tenant workflow including Phase 3 and Phase 5 implementations
"""

import requests
import json
import os
from datetime import datetime
import sys
import uuid

# Load environment variables
BACKEND_URL = "https://e9a186a0-552e-428d-8681-e3901f1a654d.preview.emergentagent.com/api"

# Global variables to store test data
property_manager_token = None
property_manager_id = None
tenant_token = None
tenant_id = None
homeowner_token = None
homeowner_id = None
provider_token = None
provider_id = None
tenant_order_id = None

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
            "email": f"pm_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "pmpass123",
            "user_type": "property_manager",
            "name": "Sarah Wilson",
            "phone": "+1-902-555-0100",
            "address": "100 Property Management Ave, Halifax, NS"
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
                
                # Verify PM-specific fields
                if (user_data.get("user_type") == "property_manager" and
                    "properties" in user_data):
                    print("✅ Property Manager registration successful")
                    print(f"   PM ID: {property_manager_id}")
                    print(f"   Properties: {user_data.get('properties', [])}")
                    return True
                else:
                    print(f"❌ Missing PM-specific fields: {user_data}")
                    return False
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
    """Test normal homeowner registration without PM code"""
    print("\n🔍 Testing Homeowner Registration (without PM code)...")
    global homeowner_token, homeowner_id
    
    try:
        test_data = {
            "email": f"homeowner_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "homepass123",
            "user_type": "homeowner",
            "name": "Mike Johnson",
            "phone": "+1-902-555-0200",
            "address": "200 Homeowner St, Halifax, NS"
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
                
                # Verify homeowner type and no PM fields
                if (user_data.get("user_type") == "homeowner" and
                    user_data.get("property_manager_id") is None and
                    user_data.get("property_address") is None):
                    print("✅ Homeowner registration (without PM code) successful")
                    print(f"   Homeowner ID: {homeowner_id}")
                    print(f"   User type: {user_data.get('user_type')}")
                    return True
                else:
                    print(f"❌ Unexpected homeowner data: {user_data}")
                    return False
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

def test_tenant_registration_with_pm_code():
    """Test tenant registration with PM code 666666 - should auto-link to PM"""
    print("\n🔍 Testing Tenant Registration (with PM code 666666)...")
    global tenant_token, tenant_id
    
    if not property_manager_id:
        print("❌ No Property Manager ID available for tenant registration test")
        return False
    
    try:
        test_data = {
            "email": f"tenant_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "tenantpass123",
            "user_type": "homeowner",  # Will be changed to tenant by PM code
            "name": "Lisa Chen",
            "phone": "+1-902-555-0300",
            "address": "300 Tenant Blvd, Halifax, NS",
            "pm_code": "666666",
            "property_address": "Apartment 5B, 300 Tenant Blvd, Halifax, NS"
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
                
                # Verify tenant-specific fields
                if (user_data.get("user_type") == "tenant" and
                    user_data.get("property_manager_id") == property_manager_id and
                    user_data.get("property_address") == "Apartment 5B, 300 Tenant Blvd, Halifax, NS"):
                    print("✅ Tenant registration with PM code successful")
                    print(f"   Tenant ID: {tenant_id}")
                    print(f"   User type: {user_data.get('user_type')}")
                    print(f"   Property Manager ID: {user_data.get('property_manager_id')}")
                    print(f"   Property Address: {user_data.get('property_address')}")
                    return True
                else:
                    print(f"❌ Tenant data incorrect: {user_data}")
                    return False
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

def test_pm_properties_list_updated():
    """Verify tenant registration updates PM's properties list"""
    print("\n🔍 Testing PM Properties List Update...")
    
    if not property_manager_token or not property_manager_id:
        print("❌ No Property Manager token available for properties test")
        return False
    
    try:
        # Get PM's properties via the properties endpoint
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.get(
            f"{BACKEND_URL}/property-manager/properties",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            properties = data.get("properties", [])
            
            # Check if tenant's property address was added
            expected_property = "Apartment 5B, 300 Tenant Blvd, Halifax, NS"
            if expected_property in properties:
                print("✅ PM properties list updated with tenant's property")
                print(f"   Properties: {properties}")
                return True
            else:
                print(f"❌ Tenant property not found in PM's list: {properties}")
                return False
        else:
            print(f"❌ Failed to get PM properties with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PM properties test failed: {e}")
        return False

def test_invalid_pm_code_rejection():
    """Test that invalid PM codes are rejected"""
    print("\n🔍 Testing Invalid PM Code Rejection...")
    
    try:
        test_data = {
            "email": f"invalid_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "invalidpass123",
            "user_type": "homeowner",
            "name": "Invalid User",
            "pm_code": "123456",  # Invalid PM code
            "property_address": "Invalid Property"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 400:
            error_data = response.json()
            if "Invalid property manager code" in error_data.get("detail", ""):
                print("✅ Invalid PM code properly rejected (400)")
                return True
            else:
                print(f"❌ Unexpected error message: {error_data}")
                return False
        else:
            print(f"❌ Expected 400 for invalid PM code, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Invalid PM code test failed: {e}")
        return False

def test_provider_registration():
    """Register a provider for order testing"""
    print("\n🔍 Testing Provider Registration...")
    global provider_token, provider_id
    
    try:
        test_data = {
            "email": f"provider_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "providerpass123",
            "user_type": "provider",
            "name": "David Smith",
            "phone": "+1-902-555-0400",
            "address": "400 Provider Ave, Halifax, NS",
            "business_name": "Smith Home Services",
            "services": ["Plumbing", "Electrical", "HVAC"],
            "license": "NS-54321"
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
                provider_token = data["access_token"]
                provider_id = data["user"]["id"]
                print("✅ Provider registration successful")
                print(f"   Provider ID: {provider_id}")
                return True
            else:
                print(f"❌ Invalid response structure: {data}")
                return False
        else:
            print(f"❌ Provider registration failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Provider registration failed: {e}")
        return False

def test_tenant_order_creation():
    """Test tenant order creation with requester_type='tenant'"""
    print("\n🔍 Testing Tenant Order Creation...")
    global tenant_order_id
    
    if not tenant_token or not provider_id or not tenant_id or not property_manager_id:
        print("❌ Missing required data for tenant order creation test")
        return False
    
    try:
        order_data = {
            "homeowner_id": tenant_id,
            "provider_id": provider_id,
            "homeowner_name": "Lisa Chen",
            "homeowner_email": "lisa@doordtest.com",
            "homeowner_phone": "+1-902-555-0300",
            "homeowner_address": "Apartment 5B, 300 Tenant Blvd, Halifax, NS",
            "provider_name": "Smith Home Services",
            "service_type": "Plumbing Repair",
            "description": "Fix leaky bathroom faucet in apartment 5B",
            "preferred_date": "2024-01-20",
            "preferred_time": "2:00 PM",
            "urgency": "medium",
            "budget": "$150-250",
            "requester_type": "tenant",
            "property_manager_id": property_manager_id,
            "property_address": "Apartment 5B, 300 Tenant Blvd, Halifax, NS"
        }
        
        headers = {"Authorization": f"Bearer {tenant_token}"}
        response = requests.post(
            f"{BACKEND_URL}/orders",
            json=order_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                tenant_order_id = data["id"]
                
                # Verify tenant order fields
                if (data.get("requester_type") == "tenant" and
                    data.get("property_manager_id") == property_manager_id and
                    data.get("status") == "pending_quotation"):  # Regular orders don't need PM approval
                    print("✅ Tenant order creation successful")
                    print(f"   Order ID: {tenant_order_id}")
                    print(f"   Requester type: {data.get('requester_type')}")
                    print(f"   Property Manager ID: {data.get('property_manager_id')}")
                    print(f"   Status: {data.get('status')}")
                    return True
                else:
                    print(f"❌ Tenant order data incorrect: {data}")
                    return False
            else:
                print(f"❌ Invalid order response structure: {data}")
                return False
        else:
            print(f"❌ Tenant order creation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Tenant order creation failed: {e}")
        return False

def test_tenant_quotation_request_pm_approval():
    """Test tenant quotation request that requires PM approval"""
    print("\n🔍 Testing Tenant Quotation Request (PM Approval Required)...")
    
    if not provider_id or not tenant_id or not property_manager_id:
        print("❌ Missing required data for tenant quotation request test")
        return False
    
    try:
        quotation_data = {
            "homeowner_id": tenant_id,
            "provider_id": provider_id,
            "homeowner_name": "Lisa Chen",
            "homeowner_email": "lisa@doordtest.com",
            "homeowner_phone": "+1-902-555-0300",
            "homeowner_address": "Apartment 5B, 300 Tenant Blvd, Halifax, NS",
            "provider_name": "Smith Home Services",
            "service_type": "HVAC Maintenance",
            "description": "Annual HVAC system maintenance and filter replacement",
            "preferred_date": "2024-01-25",
            "budget": "$200-300",
            "requester_type": "tenant",
            "property_manager_id": property_manager_id,
            "property_address": "Apartment 5B, 300 Tenant Blvd, Halifax, NS"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/quotations",
            json=quotation_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if ("order_id" in data and 
                "Property Manager for approval" in data.get("message", "")):
                
                # Get the created order to verify status
                order_id = data["order_id"]
                headers = {"Authorization": f"Bearer {property_manager_token}"}
                order_response = requests.get(
                    f"{BACKEND_URL}/orders/{order_id}",
                    headers=headers,
                    timeout=30
                )
                
                if order_response.status_code == 200:
                    order_data = order_response.json()
                    if order_data.get("status") == "pending_pm_approval":
                        print("✅ Tenant quotation request requires PM approval")
                        print(f"   Order ID: {order_id}")
                        print(f"   Status: {order_data.get('status')}")
                        print(f"   Message: {data.get('message')}")
                        
                        # Store this order ID for PM approval tests
                        global tenant_order_id
                        tenant_order_id = order_id
                        return True
                    else:
                        print(f"❌ Expected 'pending_pm_approval' status, got '{order_data.get('status')}'")
                        return False
                else:
                    print(f"❌ Failed to retrieve created order: {order_response.status_code}")
                    return False
            else:
                print(f"❌ Invalid quotation response: {data}")
                return False
        else:
            print(f"❌ Tenant quotation request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Tenant quotation request failed: {e}")
        return False

def test_pm_view_tenant_orders():
    """Test Property Manager can view tenant orders via GET /property-manager/orders"""
    print("\n🔍 Testing PM View Tenant Orders...")
    
    if not property_manager_token or not tenant_order_id:
        print("❌ Missing PM token or tenant order ID for PM orders test")
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
            if isinstance(orders, list):
                # Find our tenant order
                tenant_order = None
                for order in orders:
                    if order.get("id") == tenant_order_id:
                        tenant_order = order
                        break
                
                if tenant_order:
                    print("✅ PM can view tenant orders")
                    print(f"   Found tenant order: {tenant_order_id}")
                    print(f"   Order status: {tenant_order.get('status')}")
                    print(f"   Requester type: {tenant_order.get('requester_type')}")
                    print(f"   Total orders visible to PM: {len(orders)}")
                    return True
                else:
                    print(f"❌ Tenant order not found in PM's orders list")
                    print(f"   Available orders: {[o.get('id') for o in orders]}")
                    return False
            else:
                print(f"❌ Expected list of orders, got: {type(orders)}")
                return False
        else:
            print(f"❌ PM orders retrieval failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PM view tenant orders failed: {e}")
        return False

def test_pm_approve_tenant_order():
    """Test PM can approve tenant order via PUT /property-manager/orders/{id}/approve"""
    print("\n🔍 Testing PM Approve Tenant Order...")
    
    if not property_manager_token or not tenant_order_id:
        print("❌ Missing PM token or tenant order ID for approval test")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.put(
            f"{BACKEND_URL}/property-manager/orders/{tenant_order_id}/approve",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "approved successfully" in data.get("message", ""):
                print("✅ PM order approval successful")
                print(f"   Message: {data.get('message')}")
                
                # Verify order status changed
                order_response = requests.get(
                    f"{BACKEND_URL}/orders/{tenant_order_id}",
                    headers=headers,
                    timeout=30
                )
                
                if order_response.status_code == 200:
                    order_data = order_response.json()
                    if (order_data.get("status") == "pending_quotation" and
                        order_data.get("pm_approved") == True and
                        order_data.get("pm_approval_date") is not None):
                        print("✅ Order status updated correctly after approval")
                        print(f"   Status: {order_data.get('status')}")
                        print(f"   PM Approved: {order_data.get('pm_approved')}")
                        print(f"   PM Approval Date: {order_data.get('pm_approval_date')}")
                        return True
                    else:
                        print(f"❌ Order status not updated correctly: {order_data}")
                        return False
                else:
                    print(f"❌ Failed to verify order status: {order_response.status_code}")
                    return False
            else:
                print(f"❌ Unexpected approval response: {data}")
                return False
        else:
            print(f"❌ PM order approval failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PM order approval failed: {e}")
        return False

def test_pm_deny_tenant_order():
    """Test PM can deny orders via PUT /property-manager/orders/{id}/deny"""
    print("\n🔍 Testing PM Deny Tenant Order...")
    
    if not property_manager_token or not provider_id or not tenant_id:
        print("❌ Missing required data for PM deny test")
        return False
    
    try:
        # Create another tenant order for denial test
        quotation_data = {
            "homeowner_id": tenant_id,
            "provider_id": provider_id,
            "homeowner_name": "Lisa Chen",
            "homeowner_email": "lisa@doordtest.com",
            "homeowner_phone": "+1-902-555-0300",
            "homeowner_address": "Apartment 5B, 300 Tenant Blvd, Halifax, NS",
            "provider_name": "Smith Home Services",
            "service_type": "Electrical Upgrade",
            "description": "Upgrade electrical panel - expensive work",
            "preferred_date": "2024-02-01",
            "budget": "$2000-3000",
            "requester_type": "tenant",
            "property_manager_id": property_manager_id,
            "property_address": "Apartment 5B, 300 Tenant Blvd, Halifax, NS"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/quotations",
            json=quotation_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to create order for denial test: {response.status_code}")
            return False
        
        deny_order_id = response.json().get("order_id")
        if not deny_order_id:
            print("❌ No order ID returned for denial test")
            return False
        
        # Now deny the order
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.put(
            f"{BACKEND_URL}/property-manager/orders/{deny_order_id}/deny",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "denied" in data.get("message", ""):
                print("✅ PM order denial successful")
                print(f"   Message: {data.get('message')}")
                
                # Verify order status changed to denied
                order_response = requests.get(
                    f"{BACKEND_URL}/orders/{deny_order_id}",
                    headers=headers,
                    timeout=30
                )
                
                if order_response.status_code == 200:
                    order_data = order_response.json()
                    if (order_data.get("status") == "denied" and
                        order_data.get("pm_approved") == False and
                        order_data.get("pm_approval_date") is not None):
                        print("✅ Order status updated correctly after denial")
                        print(f"   Status: {order_data.get('status')}")
                        print(f"   PM Approved: {order_data.get('pm_approved')}")
                        return True
                    else:
                        print(f"❌ Order status not updated correctly after denial: {order_data}")
                        return False
                else:
                    print(f"❌ Failed to verify denied order status: {order_response.status_code}")
                    return False
            else:
                print(f"❌ Unexpected denial response: {data}")
                return False
        else:
            print(f"❌ PM order denial failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ PM order denial failed: {e}")
        return False

def test_complete_end_to_end_workflow():
    """Test complete end-to-end workflow: Tenant → PM approval → Provider quote → PM quote approval"""
    print("\n🔍 Testing Complete End-to-End Workflow...")
    
    if not all([tenant_token, property_manager_token, provider_token, tenant_id, property_manager_id, provider_id]):
        print("❌ Missing required tokens/IDs for end-to-end workflow test")
        return False
    
    try:
        # Step 1: Tenant creates service request
        print("   Step 1: Tenant creates service request...")
        quotation_data = {
            "homeowner_id": tenant_id,
            "provider_id": provider_id,
            "homeowner_name": "Lisa Chen",
            "homeowner_email": "lisa@doordtest.com",
            "homeowner_phone": "+1-902-555-0300",
            "homeowner_address": "Apartment 5B, 300 Tenant Blvd, Halifax, NS",
            "provider_name": "Smith Home Services",
            "service_type": "Kitchen Appliance Repair",
            "description": "Repair dishwasher - not draining properly",
            "preferred_date": "2024-02-10",
            "budget": "$150-300",
            "requester_type": "tenant",
            "property_manager_id": property_manager_id,
            "property_address": "Apartment 5B, 300 Tenant Blvd, Halifax, NS"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/quotations",
            json=quotation_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Step 1 failed: {response.status_code}")
            return False
        
        workflow_order_id = response.json().get("order_id")
        if not workflow_order_id:
            print("❌ Step 1 failed: No order ID returned")
            return False
        
        # Verify status is pending_pm_approval
        pm_headers = {"Authorization": f"Bearer {property_manager_token}"}
        order_response = requests.get(
            f"{BACKEND_URL}/orders/{workflow_order_id}",
            headers=pm_headers,
            timeout=30
        )
        
        if order_response.status_code != 200:
            print(f"❌ Step 1 verification failed: {order_response.status_code}")
            return False
        
        order_data = order_response.json()
        if order_data.get("status") != "pending_pm_approval":
            print(f"❌ Step 1 failed: Expected 'pending_pm_approval', got '{order_data.get('status')}'")
            return False
        
        print("   ✅ Step 1: Service request created with 'pending_pm_approval' status")
        
        # Step 2: PM approves request
        print("   Step 2: PM approves request...")
        response = requests.put(
            f"{BACKEND_URL}/property-manager/orders/{workflow_order_id}/approve",
            headers=pm_headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Step 2 failed: {response.status_code}")
            return False
        
        # Verify status changed to pending_quotation and pm_approved=True
        order_response = requests.get(
            f"{BACKEND_URL}/orders/{workflow_order_id}",
            headers=pm_headers,
            timeout=30
        )
        
        if order_response.status_code != 200:
            print(f"❌ Step 2 verification failed: {order_response.status_code}")
            return False
        
        order_data = order_response.json()
        if (order_data.get("status") != "pending_quotation" or
            order_data.get("pm_approved") != True):
            print(f"❌ Step 2 failed: Status '{order_data.get('status')}', PM approved: {order_data.get('pm_approved')}")
            return False
        
        print("   ✅ Step 2: PM approved, status changed to 'pending_quotation', pm_approved=True")
        
        # Step 3: Provider quotes order
        print("   Step 3: Provider quotes order...")
        provider_headers = {"Authorization": f"Bearer {provider_token}"}
        params = {
            "quotation_amount": 225.00,
            "quotation_details": "Dishwasher repair including drain pump replacement and cleaning"
        }
        
        response = requests.put(
            f"{BACKEND_URL}/orders/{workflow_order_id}/quotation",
            params=params,
            headers=provider_headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Step 3 failed: {response.status_code}")
            return False
        
        # Verify status changed to quoted
        order_response = requests.get(
            f"{BACKEND_URL}/orders/{workflow_order_id}",
            headers=provider_headers,
            timeout=30
        )
        
        if order_response.status_code != 200:
            print(f"❌ Step 3 verification failed: {order_response.status_code}")
            return False
        
        order_data = order_response.json()
        if (order_data.get("status") != "quoted" or
            order_data.get("quotation_amount") != 225.00):
            print(f"❌ Step 3 failed: Status '{order_data.get('status')}', Amount: {order_data.get('quotation_amount')}")
            return False
        
        print("   ✅ Step 3: Provider quoted order, status changed to 'quoted'")
        
        # Step 4: Verify tenant can see order status (as homeowner in this case)
        print("   Step 4: Verify tenant can see order status...")
        tenant_headers = {"Authorization": f"Bearer {tenant_token}"}
        order_response = requests.get(
            f"{BACKEND_URL}/orders/{workflow_order_id}",
            headers=tenant_headers,
            timeout=30
        )
        
        if order_response.status_code != 200:
            print(f"❌ Step 4 failed: {order_response.status_code}")
            return False
        
        order_data = order_response.json()
        if order_data.get("status") != "quoted":
            print(f"❌ Step 4 failed: Tenant sees status '{order_data.get('status')}' instead of 'quoted'")
            return False
        
        print("   ✅ Step 4: Tenant can see correct order status")
        
        # Step 5: Tenant accepts quote (simulating final step)
        print("   Step 5: Tenant accepts quote...")
        params = {"status": "accepted"}
        response = requests.put(
            f"{BACKEND_URL}/orders/{workflow_order_id}/status",
            params=params,
            headers=tenant_headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Step 5 failed: {response.status_code}")
            return False
        
        print("   ✅ Step 5: Tenant accepted quote")
        
        print("✅ COMPLETE END-TO-END WORKFLOW SUCCESSFUL!")
        print(f"   Order ID: {workflow_order_id}")
        print("   Workflow: Tenant request → PM approval → Provider quote → Tenant acceptance")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ End-to-end workflow failed: {e}")
        return False

def test_pm_endpoints_authentication():
    """Test all Property Manager endpoints with proper authentication"""
    print("\n🔍 Testing PM Endpoints Authentication...")
    
    if not property_manager_token:
        print("❌ No PM token available for authentication test")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        
        # Test 1: GET /property-manager/tenants
        response = requests.get(
            f"{BACKEND_URL}/property-manager/tenants",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ PM tenants endpoint failed: {response.status_code}")
            return False
        
        tenants = response.json()
        if not isinstance(tenants, list):
            print(f"❌ Expected list of tenants, got: {type(tenants)}")
            return False
        
        print(f"   ✅ GET /property-manager/tenants: {len(tenants)} tenants")
        
        # Test 2: GET /property-manager/orders
        response = requests.get(
            f"{BACKEND_URL}/property-manager/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ PM orders endpoint failed: {response.status_code}")
            return False
        
        orders = response.json()
        if not isinstance(orders, list):
            print(f"❌ Expected list of orders, got: {type(orders)}")
            return False
        
        print(f"   ✅ GET /property-manager/orders: {len(orders)} orders")
        
        # Test 3: GET /property-manager/properties
        response = requests.get(
            f"{BACKEND_URL}/property-manager/properties",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ PM properties endpoint failed: {response.status_code}")
            return False
        
        properties_data = response.json()
        if "properties" not in properties_data:
            print(f"❌ Expected properties field, got: {properties_data}")
            return False
        
        print(f"   ✅ GET /property-manager/properties: {len(properties_data['properties'])} properties")
        
        print("✅ All PM endpoints working with proper authentication")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ PM endpoints authentication test failed: {e}")
        return False

def test_cross_user_access_blocked():
    """Test that cross-user access is properly blocked"""
    print("\n🔍 Testing Cross-User Access Control...")
    
    if not all([homeowner_token, tenant_token, property_manager_token]):
        print("❌ Missing tokens for cross-user access test")
        return False
    
    try:
        # Test 1: Homeowner trying to access PM endpoints
        homeowner_headers = {"Authorization": f"Bearer {homeowner_token}"}
        
        response = requests.get(
            f"{BACKEND_URL}/property-manager/tenants",
            headers=homeowner_headers,
            timeout=30
        )
        
        if response.status_code != 403:
            print(f"❌ Expected 403 for homeowner accessing PM tenants, got {response.status_code}")
            return False
        
        print("   ✅ Homeowner blocked from PM tenants endpoint (403)")
        
        # Test 2: Tenant trying to access PM endpoints
        tenant_headers = {"Authorization": f"Bearer {tenant_token}"}
        
        response = requests.get(
            f"{BACKEND_URL}/property-manager/orders",
            headers=tenant_headers,
            timeout=30
        )
        
        if response.status_code != 403:
            print(f"❌ Expected 403 for tenant accessing PM orders, got {response.status_code}")
            return False
        
        print("   ✅ Tenant blocked from PM orders endpoint (403)")
        
        # Test 3: Homeowner trying to approve orders
        if tenant_order_id:
            response = requests.put(
                f"{BACKEND_URL}/property-manager/orders/{tenant_order_id}/approve",
                headers=homeowner_headers,
                timeout=30
            )
            
            if response.status_code != 403:
                print(f"❌ Expected 403 for homeowner approving orders, got {response.status_code}")
                return False
            
            print("   ✅ Homeowner blocked from approving orders (403)")
        
        print("✅ Cross-user access properly blocked")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Cross-user access test failed: {e}")
        return False

def test_field_mappings():
    """Test that field mappings are correct (requester_type, property_manager_id, property_address)"""
    print("\n🔍 Testing Field Mappings...")
    
    if not tenant_order_id or not property_manager_token:
        print("❌ Missing order ID or PM token for field mapping test")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.get(
            f"{BACKEND_URL}/orders/{tenant_order_id}",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to get order for field mapping test: {response.status_code}")
            return False
        
        order_data = response.json()
        
        # Check required field mappings
        required_fields = {
            "requester_type": "tenant",
            "property_manager_id": property_manager_id,
            "property_address": "Apartment 5B, 300 Tenant Blvd, Halifax, NS"
        }
        
        for field, expected_value in required_fields.items():
            actual_value = order_data.get(field)
            if actual_value != expected_value:
                print(f"❌ Field mapping incorrect: {field} = '{actual_value}', expected '{expected_value}'")
                return False
        
        # Check PM approval fields exist
        pm_fields = ["pm_approved", "pm_approval_date"]
        for field in pm_fields:
            if field not in order_data:
                print(f"❌ Missing PM field: {field}")
                return False
        
        print("✅ All field mappings correct")
        print(f"   requester_type: {order_data.get('requester_type')}")
        print(f"   property_manager_id: {order_data.get('property_manager_id')}")
        print(f"   property_address: {order_data.get('property_address')}")
        print(f"   pm_approved: {order_data.get('pm_approved')}")
        print(f"   pm_approval_date: {order_data.get('pm_approval_date')}")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Field mappings test failed: {e}")
        return False

def run_all_tests():
    """Run all Property Manager & Tenant system tests"""
    print("=" * 80)
    print("🚀 PROPERTY MANAGER & TENANT SYSTEM BACKEND TESTING STARTED")
    print("=" * 80)
    
    test_results = []
    
    # Phase 1: User Registration Tests
    print("\n" + "=" * 60)
    print("📋 PHASE 1: USER REGISTRATION TESTS")
    print("=" * 60)
    
    test_results.append(("Backend Health", test_backend_health()))
    test_results.append(("Property Manager Registration", test_property_manager_registration()))
    test_results.append(("Homeowner Registration (no PM code)", test_homeowner_registration_without_pm_code()))
    test_results.append(("Tenant Registration (PM code 666666)", test_tenant_registration_with_pm_code()))
    test_results.append(("PM Properties List Updated", test_pm_properties_list_updated()))
    test_results.append(("Invalid PM Code Rejection", test_invalid_pm_code_rejection()))
    test_results.append(("Provider Registration", test_provider_registration()))
    
    # Phase 2: Order Creation & PM Approval Tests
    print("\n" + "=" * 60)
    print("📋 PHASE 2: ORDER CREATION & PM APPROVAL TESTS")
    print("=" * 60)
    
    test_results.append(("Tenant Order Creation", test_tenant_order_creation()))
    test_results.append(("Tenant Quotation Request (PM Approval)", test_tenant_quotation_request_pm_approval()))
    test_results.append(("PM View Tenant Orders", test_pm_view_tenant_orders()))
    test_results.append(("PM Approve Tenant Order", test_pm_approve_tenant_order()))
    test_results.append(("PM Deny Tenant Order", test_pm_deny_tenant_order()))
    
    # Phase 3: End-to-End Workflow Tests
    print("\n" + "=" * 60)
    print("📋 PHASE 3: END-TO-END WORKFLOW TESTS")
    print("=" * 60)
    
    test_results.append(("Complete End-to-End Workflow", test_complete_end_to_end_workflow()))
    
    # Phase 4: API Integration & Security Tests
    print("\n" + "=" * 60)
    print("📋 PHASE 4: API INTEGRATION & SECURITY TESTS")
    print("=" * 60)
    
    test_results.append(("PM Endpoints Authentication", test_pm_endpoints_authentication()))
    test_results.append(("Cross-User Access Blocked", test_cross_user_access_blocked()))
    test_results.append(("Field Mappings Correct", test_field_mappings()))
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 TEST SUMMARY")
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
        print("\n🎉 ALL PROPERTY MANAGER & TENANT SYSTEM TESTS PASSED!")
        print("✅ Complete tenant-to-PM approval workflow is functional and ready for frontend integration")
        return True
    else:
        print(f"\n⚠️ {failed} TESTS FAILED!")
        print("❌ Some issues need to be resolved before frontend integration")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)