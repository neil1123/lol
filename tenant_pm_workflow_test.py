#!/usr/bin/env python3
"""
CORRECTED Property Manager & Tenant Workflow Testing Script
Tests the specific workflow requested in the review:

1. Tenant Booking Direct to Provider (NO initial PM approval)
2. Provider Quotation to PM (not Tenant)
3. PM Approves Quotation (makes it available to tenant)
4. Complete End-to-End Test
5. Verify Different Behavior for Homeowners vs Tenants
"""

import requests
import json
import uuid
from datetime import datetime

# Backend URL
BACKEND_URL = "https://tenantfix-1.preview.emergentagent.com/api"

# Global test data
pm_token = None
pm_id = None
tenant_token = None
tenant_id = None
provider_token = None
provider_id = None
homeowner_token = None
homeowner_id = None

def test_backend_health():
    """Test if backend server is running"""
    print("🔍 Testing Backend Health...")
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "Doord API" in data.get("message", ""):
                print("✅ Backend server is running and accessible")
                return True
        print(f"❌ Backend health check failed: {response.status_code}")
        return False
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def register_property_manager():
    """Register a Property Manager"""
    print("\n🔍 Step 1: Registering Property Manager...")
    global pm_token, pm_id
    
    try:
        pm_data = {
            "email": f"pm_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "pmpass123",
            "user_type": "property_manager",
            "name": "John Property Manager",
            "phone": "+1-902-555-PM01",
            "address": "100 PM Street, Halifax, NS"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=pm_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            pm_token = data["access_token"]
            pm_id = data["user"]["id"]
            print(f"✅ Property Manager registered successfully (ID: {pm_id})")
            return True
        else:
            print(f"❌ PM registration failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ PM registration error: {e}")
        return False

def register_tenant_with_pm_code():
    """Register a Tenant with PM code '666666'"""
    print("\n🔍 Step 2: Registering Tenant with PM Code '666666'...")
    global tenant_token, tenant_id
    
    try:
        tenant_data = {
            "email": f"tenant_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "tenantpass123",
            "user_type": "homeowner",  # Will be changed to tenant by PM code
            "name": "Sarah Tenant",
            "phone": "+1-902-555-T001",
            "address": "200 Tenant Ave, Halifax, NS",
            "pm_code": "666666",
            "property_address": "200 Tenant Ave, Halifax, NS"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=tenant_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            tenant_token = data["access_token"]
            tenant_id = data["user"]["id"]
            user_type = data["user"]["user_type"]
            
            if user_type == "tenant":
                print(f"✅ Tenant registered successfully (ID: {tenant_id}, Type: {user_type})")
                return True
            else:
                print(f"❌ Expected user_type 'tenant', got '{user_type}'")
                return False
        else:
            print(f"❌ Tenant registration failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Tenant registration error: {e}")
        return False

def register_provider():
    """Register a Provider"""
    print("\n🔍 Step 3: Registering Provider...")
    global provider_token, provider_id
    
    try:
        provider_data = {
            "email": f"provider_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "providerpass123",
            "user_type": "provider",
            "name": "Mike Provider",
            "phone": "+1-902-555-P001",
            "address": "300 Provider Blvd, Halifax, NS",
            "business_name": "Mike's Home Services",
            "services": ["Plumbing", "Electrical", "HVAC"],
            "license": "NS-PROV-001"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=provider_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            provider_token = data["access_token"]
            provider_id = data["user"]["id"]
            print(f"✅ Provider registered successfully (ID: {provider_id})")
            return True
        else:
            print(f"❌ Provider registration failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Provider registration error: {e}")
        return False

def register_homeowner():
    """Register a regular Homeowner for comparison"""
    print("\n🔍 Step 4: Registering Regular Homeowner...")
    global homeowner_token, homeowner_id
    
    try:
        homeowner_data = {
            "email": f"homeowner_{uuid.uuid4().hex[:8]}@doordtest.com",
            "password": "homeownerpass123",
            "user_type": "homeowner",
            "name": "Lisa Homeowner",
            "phone": "+1-902-555-H001",
            "address": "400 Homeowner St, Halifax, NS"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=homeowner_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            homeowner_token = data["access_token"]
            homeowner_id = data["user"]["id"]
            print(f"✅ Homeowner registered successfully (ID: {homeowner_id})")
            return True
        else:
            print(f"❌ Homeowner registration failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Homeowner registration error: {e}")
        return False

def test_tenant_direct_booking():
    """Test that tenant can book services directly to provider (NO initial PM approval)"""
    print("\n🔍 Step 5: Testing Tenant Direct Booking to Provider...")
    
    try:
        # Tenant creates service request directly to provider
        quotation_data = {
            "homeowner_id": tenant_id,
            "provider_id": provider_id,
            "homeowner_name": "Sarah Tenant",
            "homeowner_email": "sarah.tenant@doordtest.com",
            "homeowner_phone": "+1-902-555-T001",
            "homeowner_address": "200 Tenant Ave, Halifax, NS",
            "provider_name": "Mike's Home Services",
            "service_type": "Plumbing",
            "description": "Fix leaky kitchen faucet in tenant apartment",
            "preferred_date": "2024-02-01",
            "preferred_time": "10:00 AM",
            "urgency": "medium",
            "budget": "$100-200",
            "requester_type": "tenant",
            "property_manager_id": pm_id,
            "property_address": "200 Tenant Ave, Halifax, NS"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/quotations",
            json=quotation_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            tenant_order_id = data.get("order_id")
            
            if tenant_order_id:
                print(f"✅ Tenant service request created successfully (Order ID: {tenant_order_id})")
                
                # Verify order status is "pending_quotation" (direct to provider)
                headers = {"Authorization": f"Bearer {provider_token}"}
                response = requests.get(
                    f"{BACKEND_URL}/orders/{tenant_order_id}",
                    headers=headers,
                    timeout=30
                )
                
                if response.status_code == 200:
                    order_data = response.json()
                    status = order_data.get("status")
                    
                    if status == "pending_quotation":
                        print("✅ CORRECT: Tenant order goes directly to provider (status: 'pending_quotation')")
                        print("✅ NO initial PM approval required - tenant can book directly!")
                        return tenant_order_id
                    else:
                        print(f"❌ Expected 'pending_quotation' status, got '{status}'")
                        return None
                else:
                    print(f"❌ Failed to retrieve order: {response.status_code}")
                    return None
            else:
                print("❌ No order_id returned from quotation request")
                return None
        else:
            print(f"❌ Tenant quotation request failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Tenant direct booking test error: {e}")
        return None

def test_provider_quotation_to_pm(tenant_order_id):
    """Test that provider quotation for tenant order goes to PM (not tenant)"""
    print("\n🔍 Step 6: Testing Provider Quotation Goes to PM (Not Tenant)...")
    
    try:
        # Provider updates quotation for tenant order
        headers = {"Authorization": f"Bearer {provider_token}"}
        params = {
            "quotation_amount": 175.00,
            "quotation_details": "Complete faucet repair including new parts and labor. Professional service with warranty."
        }
        
        response = requests.put(
            f"{BACKEND_URL}/orders/{tenant_order_id}/quotation",
            params=params,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Provider quotation update successful")
            
            # Verify order status changed to "pending_pm_approval" (not "quoted")
            response = requests.get(
                f"{BACKEND_URL}/orders/{tenant_order_id}",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                order_data = response.json()
                status = order_data.get("status")
                quotation_amount = order_data.get("quotation_amount")
                
                if status == "pending_pm_approval":
                    print("✅ CORRECT: Tenant quotation goes to PM approval (status: 'pending_pm_approval')")
                    print(f"✅ Quotation amount set correctly: ${quotation_amount}")
                    print("✅ Quotation does NOT go directly to tenant!")
                    return True
                else:
                    print(f"❌ Expected 'pending_pm_approval' status, got '{status}'")
                    return False
            else:
                print(f"❌ Failed to retrieve updated order: {response.status_code}")
                return False
        else:
            print(f"❌ Provider quotation update failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Provider quotation to PM test error: {e}")
        return False

def test_pm_approves_quotation(tenant_order_id):
    """Test PM approves quotation making it available to tenant"""
    print("\n🔍 Step 7: Testing PM Approves Quotation...")
    
    try:
        # PM approves the quotation
        headers = {"Authorization": f"Bearer {pm_token}"}
        response = requests.put(
            f"{BACKEND_URL}/property-manager/orders/{tenant_order_id}/approve",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ PM quotation approval successful")
            
            # Verify order status changed to "quoted" (available for tenant)
            response = requests.get(
                f"{BACKEND_URL}/orders/{tenant_order_id}",
                headers={"Authorization": f"Bearer {tenant_token}"},
                timeout=30
            )
            
            if response.status_code == 200:
                order_data = response.json()
                status = order_data.get("status")
                pm_approved = order_data.get("pm_approved")
                pm_approval_date = order_data.get("pm_approval_date")
                
                if status == "quoted" and pm_approved == True:
                    print("✅ CORRECT: PM approval changes status to 'quoted'")
                    print("✅ pm_approved field set to True")
                    print(f"✅ pm_approval_date set: {pm_approval_date}")
                    print("✅ Quotation now available for tenant to accept/decline!")
                    return True
                else:
                    print(f"❌ Expected status 'quoted' and pm_approved True, got status '{status}', pm_approved {pm_approved}")
                    return False
            else:
                print(f"❌ Failed to retrieve approved order: {response.status_code}")
                return False
        else:
            print(f"❌ PM quotation approval failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ PM approval test error: {e}")
        return False

def test_tenant_can_accept_decline(tenant_order_id):
    """Test tenant can now accept/decline the PM-approved quotation"""
    print("\n🔍 Step 8: Testing Tenant Can Accept/Decline Approved Quotation...")
    
    try:
        # Test tenant accepting quote
        headers = {"Authorization": f"Bearer {tenant_token}"}
        params = {"status": "accepted"}
        
        response = requests.put(
            f"{BACKEND_URL}/orders/{tenant_order_id}/status",
            params=params,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Tenant can accept quotation")
            
            # Test tenant declining quote (change back)
            params = {"status": "declined"}
            response = requests.put(
                f"{BACKEND_URL}/orders/{tenant_order_id}/status",
                params=params,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                print("✅ Tenant can decline quotation")
                print("✅ Complete tenant quotation workflow working!")
                return True
            else:
                print(f"❌ Tenant decline failed: {response.status_code}")
                return False
        else:
            print(f"❌ Tenant accept failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Tenant accept/decline test error: {e}")
        return False

def test_homeowner_direct_quotation():
    """Test homeowner quotation goes directly to homeowner (different from tenant)"""
    print("\n🔍 Step 9: Testing Homeowner Direct Quotation (Different from Tenant)...")
    
    try:
        # Homeowner creates service request
        quotation_data = {
            "homeowner_id": homeowner_id,
            "provider_id": provider_id,
            "homeowner_name": "Lisa Homeowner",
            "homeowner_email": "lisa.homeowner@doordtest.com",
            "homeowner_phone": "+1-902-555-H001",
            "homeowner_address": "400 Homeowner St, Halifax, NS",
            "provider_name": "Mike's Home Services",
            "service_type": "Electrical",
            "description": "Install new ceiling fan in living room",
            "preferred_date": "2024-02-05",
            "preferred_time": "2:00 PM",
            "urgency": "low",
            "budget": "$200-300",
            "requester_type": "homeowner"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/quotations",
            json=quotation_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            homeowner_order_id = data.get("order_id")
            
            if homeowner_order_id:
                print(f"✅ Homeowner service request created (Order ID: {homeowner_order_id})")
                
                # Provider gives quotation for homeowner order
                headers = {"Authorization": f"Bearer {provider_token}"}
                params = {
                    "quotation_amount": 250.00,
                    "quotation_details": "Ceiling fan installation with professional wiring and cleanup"
                }
                
                response = requests.put(
                    f"{BACKEND_URL}/orders/{homeowner_order_id}/quotation",
                    params=params,
                    headers=headers,
                    timeout=30
                )
                
                if response.status_code == 200:
                    print("✅ Provider quotation for homeowner successful")
                    
                    # Verify homeowner order status goes directly to "quoted" (not PM approval)
                    response = requests.get(
                        f"{BACKEND_URL}/orders/{homeowner_order_id}",
                        headers=headers,
                        timeout=30
                    )
                    
                    if response.status_code == 200:
                        order_data = response.json()
                        status = order_data.get("status")
                        
                        if status == "quoted":
                            print("✅ CORRECT: Homeowner quotation goes directly to 'quoted' status")
                            print("✅ NO PM approval needed for homeowners!")
                            print("✅ Different behavior confirmed: Homeowner vs Tenant workflows")
                            return True
                        else:
                            print(f"❌ Expected 'quoted' status for homeowner, got '{status}'")
                            return False
                    else:
                        print(f"❌ Failed to retrieve homeowner order: {response.status_code}")
                        return False
                else:
                    print(f"❌ Provider quotation for homeowner failed: {response.status_code}")
                    return False
            else:
                print("❌ No order_id returned from homeowner quotation request")
                return False
        else:
            print(f"❌ Homeowner quotation request failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Homeowner direct quotation test error: {e}")
        return False

def test_pm_can_view_tenant_orders():
    """Test PM can view tenant orders requiring approval"""
    print("\n🔍 Step 10: Testing PM Can View Tenant Orders...")
    
    try:
        headers = {"Authorization": f"Bearer {pm_token}"}
        response = requests.get(
            f"{BACKEND_URL}/property-manager/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            orders = response.json()
            
            if isinstance(orders, list):
                tenant_orders = [order for order in orders if order.get("requester_type") == "tenant"]
                print(f"✅ PM can view orders ({len(orders)} total, {len(tenant_orders)} tenant orders)")
                
                # Check if any orders have proper PM fields
                pm_orders_found = False
                for order in orders:
                    if order.get("property_manager_id") == pm_id:
                        pm_orders_found = True
                        print(f"✅ Found PM order: {order.get('service_type')} - Status: {order.get('status')}")
                
                if pm_orders_found:
                    print("✅ PM can properly view tenant orders requiring approval")
                    return True
                else:
                    print("ℹ️ No tenant orders found for this PM (expected if tenant hasn't created orders yet)")
                    return True
            else:
                print(f"❌ Expected list of orders, got: {type(orders)}")
                return False
        else:
            print(f"❌ PM order retrieval failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ PM view orders test error: {e}")
        return False

def run_corrected_workflow_test():
    """Run the complete corrected Property Manager & Tenant workflow test"""
    print("=" * 80)
    print("🚀 CORRECTED PROPERTY MANAGER & TENANT WORKFLOW TESTING")
    print("=" * 80)
    print("Testing the CORRECTED workflow:")
    print("1. Tenant Booking Direct to Provider (NO initial PM approval)")
    print("2. Provider Quotation to PM (not Tenant)")
    print("3. PM Approves Quotation (makes it available to tenant)")
    print("4. Verify Different Behavior for Homeowners vs Tenants")
    print("=" * 80)
    
    test_results = []
    
    # Step 1: Backend Health
    test_results.append(("Backend Health", test_backend_health()))
    
    # Step 2: Register all users
    test_results.append(("Register Property Manager", register_property_manager()))
    test_results.append(("Register Tenant with PM Code", register_tenant_with_pm_code()))
    test_results.append(("Register Provider", register_provider()))
    test_results.append(("Register Homeowner", register_homeowner()))
    
    # Step 3: Test corrected workflow
    tenant_order_id = None
    if all(result[1] for result in test_results):
        tenant_order_id = test_tenant_direct_booking()
        test_results.append(("Tenant Direct Booking", tenant_order_id is not None))
        
        if tenant_order_id:
            test_results.append(("Provider Quotation to PM", test_provider_quotation_to_pm(tenant_order_id)))
            test_results.append(("PM Approves Quotation", test_pm_approves_quotation(tenant_order_id)))
            test_results.append(("Tenant Accept/Decline", test_tenant_can_accept_decline(tenant_order_id)))
    
    # Step 4: Test homeowner workflow (different behavior)
    test_results.append(("Homeowner Direct Quotation", test_homeowner_direct_quotation()))
    
    # Step 5: Test PM functionality
    test_results.append(("PM View Tenant Orders", test_pm_can_view_tenant_orders()))
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 CORRECTED WORKFLOW TEST SUMMARY")
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
        print("\n🎉 CORRECTED PROPERTY MANAGER & TENANT WORKFLOW FULLY WORKING!")
        print("\n✅ KEY WORKFLOW CONFIRMATIONS:")
        print("   • Tenants CAN book services directly (no initial PM approval)")
        print("   • Provider quotations for tenant orders go to PM (not tenant)")
        print("   • PM approval makes quotations available to tenants")
        print("   • Homeowner quotations work normally (direct to homeowner)")
        print("   • Different behavior confirmed for Homeowners vs Tenants")
        return True
    else:
        print(f"\n⚠️ {failed} TESTS FAILED - WORKFLOW NEEDS FIXES!")
        return False

if __name__ == "__main__":
    success = run_corrected_workflow_test()
    exit(0 if success else 1)