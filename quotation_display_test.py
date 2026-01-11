#!/usr/bin/env python3
"""
Quotation Amount Display Fix Testing Script
Tests the specific field name mismatch fix between backend and frontend
"""

import requests
import json
import uuid
from datetime import datetime

# Backend URL from environment
BACKEND_URL = "https://tenantfix-1.preview.emergentagent.com/api"

# Test credentials as specified in review request
PROVIDER_EMAIL = "test@provider.com"
PROVIDER_PASSWORD = "password123"
HOMEOWNER_EMAIL = "test@homeowner.com"
HOMEOWNER_PASSWORD = "password123"

# Global test data
provider_token = None
homeowner_token = None
provider_id = None
homeowner_id = None

def authenticate_users():
    """Authenticate both test users"""
    global provider_token, homeowner_token, provider_id, homeowner_id
    
    print("🔐 Authenticating test users...")
    
    # Authenticate provider
    try:
        provider_login = {
            "email": PROVIDER_EMAIL,
            "password": PROVIDER_PASSWORD
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/login",
            json=provider_login,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            provider_token = data["access_token"]
            provider_id = data["user"]["id"]
            print(f"✅ Provider authenticated: {PROVIDER_EMAIL}")
        else:
            print(f"❌ Provider authentication failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Provider authentication error: {e}")
        return False
    
    # Authenticate homeowner
    try:
        homeowner_login = {
            "email": HOMEOWNER_EMAIL,
            "password": HOMEOWNER_PASSWORD
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/login",
            json=homeowner_login,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            homeowner_token = data["access_token"]
            homeowner_id = data["user"]["id"]
            print(f"✅ Homeowner authenticated: {HOMEOWNER_EMAIL}")
        else:
            print(f"❌ Homeowner authentication failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Homeowner authentication error: {e}")
        return False
    
    return True

def test_order_data_structure():
    """Test 1: Verify GET /api/orders returns proper snake_case field names"""
    print("\n🔍 Test 1: Order Data Structure - Snake Case Field Names")
    
    if not homeowner_token:
        print("❌ No homeowner token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {homeowner_token}"}
        response = requests.get(
            f"{BACKEND_URL}/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to get orders: {response.status_code}")
            return False
        
        orders = response.json()
        
        if not isinstance(orders, list):
            print(f"❌ Expected list, got: {type(orders)}")
            return False
        
        # Check field names in snake_case format
        required_snake_case_fields = [
            "quotation_amount",
            "provider_name", 
            "service_type",
            "quotation_details",
            "request_date",
            "homeowner_name",
            "homeowner_email",
            "homeowner_phone",
            "homeowner_address"
        ]
        
        # Check if we have orders to test
        if len(orders) == 0:
            print("ℹ️ No orders found - creating test order for field validation")
            # Create a test order to validate field structure
            test_order = create_test_order()
            if not test_order:
                print("❌ Failed to create test order for validation")
                return False
            orders = [test_order]
        
        # Validate field names in first order
        order = orders[0]
        print(f"📋 Validating field names in order: {order.get('id', 'unknown')}")
        
        for field in required_snake_case_fields:
            if field not in order:
                print(f"❌ Missing snake_case field: {field}")
                return False
            else:
                print(f"✅ Found snake_case field: {field}")
        
        # Check that camelCase fields are NOT present
        camel_case_fields = [
            "quotationAmount",
            "providerName",
            "serviceType", 
            "quotationDetails",
            "requestDate"
        ]
        
        for field in camel_case_fields:
            if field in order:
                print(f"❌ Found unexpected camelCase field: {field}")
                return False
        
        print("✅ All field names are in correct snake_case format")
        return True
        
    except Exception as e:
        print(f"❌ Order data structure test failed: {e}")
        return False

def create_test_order():
    """Helper function to create a test order"""
    if not homeowner_token or not provider_id:
        return None
    
    try:
        order_data = {
            "homeowner_id": homeowner_id,
            "provider_id": provider_id,
            "homeowner_name": "Test Homeowner",
            "homeowner_email": HOMEOWNER_EMAIL,
            "homeowner_phone": "+1-902-555-0123",
            "homeowner_address": "123 Test St, Halifax, NS",
            "provider_name": "Test Provider",
            "service_type": "Plumbing",
            "description": "Test order for field validation",
            "preferred_date": "2024-01-15",
            "budget": "$100-200"
        }
        
        headers = {"Authorization": f"Bearer {homeowner_token}"}
        response = requests.post(
            f"{BACKEND_URL}/orders",
            json=order_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to create test order: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error creating test order: {e}")
        return None

def test_quotation_amount_handling():
    """Test 2: Test orders with different quotation_amount values"""
    print("\n🔍 Test 2: Quotation Amount Handling")
    
    if not provider_token or not homeowner_token:
        print("❌ Missing authentication tokens")
        return False
    
    try:
        # Create test order with null quotation_amount
        test_order = create_test_order()
        if not test_order:
            print("❌ Failed to create test order")
            return False
        
        order_id = test_order["id"]
        
        # Test 2a: Order with null quotation_amount
        print("📋 Testing null quotation_amount...")
        
        headers = {"Authorization": f"Bearer {homeowner_token}"}
        response = requests.get(
            f"{BACKEND_URL}/orders/{order_id}",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to get order: {response.status_code}")
            return False
        
        order = response.json()
        
        # Check that quotation_amount is null initially
        if order.get("quotation_amount") is not None:
            print(f"❌ Expected null quotation_amount, got: {order.get('quotation_amount')}")
            return False
        
        print("✅ Order with null quotation_amount handled correctly")
        
        # Test 2b: Update order with specific quotation amount
        print("📋 Testing specific quotation_amount...")
        
        provider_headers = {"Authorization": f"Bearer {provider_token}"}
        params = {
            "quotation_amount": 150.75,
            "quotation_details": "Complete plumbing repair with parts and labor"
        }
        
        response = requests.put(
            f"{BACKEND_URL}/orders/{order_id}/quotation",
            params=params,
            headers=provider_headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to update quotation: {response.status_code}")
            return False
        
        # Verify quotation_amount was set correctly
        response = requests.get(
            f"{BACKEND_URL}/orders/{order_id}",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to get updated order: {response.status_code}")
            return False
        
        updated_order = response.json()
        
        if updated_order.get("quotation_amount") != 150.75:
            print(f"❌ Expected quotation_amount 150.75, got: {updated_order.get('quotation_amount')}")
            return False
        
        print("✅ Order with specific quotation_amount ($150.75) handled correctly")
        
        # Test 2c: Test different quotation amounts
        test_amounts = [0.0, 25.50, 1000.00, 9999.99]
        
        for amount in test_amounts:
            params = {"quotation_amount": amount}
            
            response = requests.put(
                f"{BACKEND_URL}/orders/{order_id}/quotation",
                params=params,
                headers=provider_headers,
                timeout=30
            )
            
            if response.status_code != 200:
                print(f"❌ Failed to update quotation to {amount}: {response.status_code}")
                return False
            
            # Verify the amount was set
            response = requests.get(
                f"{BACKEND_URL}/orders/{order_id}",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                order = response.json()
                if order.get("quotation_amount") == amount:
                    print(f"✅ Quotation amount ${amount} set correctly")
                else:
                    print(f"❌ Expected ${amount}, got: {order.get('quotation_amount')}")
                    return False
        
        return True
        
    except Exception as e:
        print(f"❌ Quotation amount handling test failed: {e}")
        return False

def test_field_name_consistency():
    """Test 3: Verify all order fields use snake_case naming convention"""
    print("\n🔍 Test 3: Field Name Consistency - All Snake Case")
    
    if not homeowner_token:
        print("❌ No homeowner token available")
        return False
    
    try:
        # Get all orders to check field consistency
        headers = {"Authorization": f"Bearer {homeowner_token}"}
        response = requests.get(
            f"{BACKEND_URL}/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to get orders: {response.status_code}")
            return False
        
        orders = response.json()
        
        if len(orders) == 0:
            # Create test order if none exist
            test_order = create_test_order()
            if test_order:
                orders = [test_order]
            else:
                print("❌ No orders available for field consistency test")
                return False
        
        # Define all expected snake_case fields
        expected_snake_case_fields = [
            "id",
            "homeowner_id",
            "provider_id", 
            "homeowner_name",
            "homeowner_email",
            "homeowner_phone",
            "homeowner_address",
            "provider_name",
            "service_type",
            "services",
            "description",
            "quotation_amount",
            "quotation_details",
            "quotation_valid_until",
            "order_details",
            "priority",
            "status",
            "request_date",
            "scheduled_date",
            "preferred_date",
            "preferred_time",
            "urgency",
            "budget",
            "property_size",
            "additional_requirements"
        ]
        
        # Check first order for field consistency
        order = orders[0]
        print(f"📋 Checking field consistency in order: {order.get('id', 'unknown')}")
        
        # Verify snake_case fields are present where expected
        snake_case_found = []
        for field in order.keys():
            if field in expected_snake_case_fields:
                snake_case_found.append(field)
                print(f"✅ Snake case field found: {field}")
        
        # Check for any camelCase fields that shouldn't be there
        camel_case_violations = []
        for field in order.keys():
            # Check if field contains camelCase pattern
            if any(c.isupper() for c in field) and '_' not in field:
                camel_case_violations.append(field)
        
        if camel_case_violations:
            print(f"❌ Found camelCase violations: {camel_case_violations}")
            return False
        
        # Verify critical fields are in snake_case
        critical_fields = ["quotation_amount", "provider_name", "service_type", "request_date"]
        for field in critical_fields:
            if field not in order:
                print(f"⚠️ Critical field '{field}' not found (may be null)")
            else:
                print(f"✅ Critical snake_case field present: {field}")
        
        print("✅ All field names follow snake_case convention")
        return True
        
    except Exception as e:
        print(f"❌ Field name consistency test failed: {e}")
        return False

def test_quotation_workflow():
    """Test 5: Test the complete quotation workflow"""
    print("\n🔍 Test 5: Complete Quotation Workflow")
    
    if not provider_token or not homeowner_token:
        print("❌ Missing authentication tokens")
        return False
    
    try:
        # Step 1: Create quotation request (homeowner)
        print("📋 Step 1: Creating quotation request...")
        
        quotation_data = {
            "homeowner_id": homeowner_id,
            "provider_id": provider_id,
            "homeowner_name": "Workflow Test User",
            "homeowner_email": HOMEOWNER_EMAIL,
            "homeowner_phone": "+1-902-555-9999",
            "homeowner_address": "999 Workflow St, Halifax, NS",
            "provider_name": "Test Provider Services",
            "service_type": "Electrical Work",
            "description": "Install new electrical outlets in kitchen",
            "preferred_date": "2024-02-01",
            "budget": "$300-500",
            "urgency": "medium"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/quotations",
            json=quotation_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Quotation request failed: {response.status_code}")
            return False
        
        quotation_response = response.json()
        workflow_order_id = quotation_response.get("order_id")
        
        if not workflow_order_id:
            print("❌ No order_id returned from quotation request")
            return False
        
        print("✅ Quotation request created successfully")
        
        # Step 2: Verify order in pending_quotation status
        print("📋 Step 2: Verifying order status...")
        
        homeowner_headers = {"Authorization": f"Bearer {homeowner_token}"}
        response = requests.get(
            f"{BACKEND_URL}/orders/{workflow_order_id}",
            headers=homeowner_headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to get order: {response.status_code}")
            return False
        
        order = response.json()
        
        # Verify snake_case fields are present
        if "quotation_amount" not in order:
            print("❌ quotation_amount field missing")
            return False
        
        if order.get("quotation_amount") is not None:
            print(f"❌ Expected null quotation_amount, got: {order.get('quotation_amount')}")
            return False
        
        if order.get("status") != "pending_quotation":
            print(f"❌ Expected pending_quotation status, got: {order.get('status')}")
            return False
        
        print("✅ Order in pending_quotation status with null quotation_amount")
        
        # Step 3: Provider provides quotation
        print("📋 Step 3: Provider providing quotation...")
        
        provider_headers = {"Authorization": f"Bearer {provider_token}"}
        params = {
            "quotation_amount": 425.00,
            "quotation_details": "Professional electrical outlet installation including materials and labor. 2-year warranty included."
        }
        
        response = requests.put(
            f"{BACKEND_URL}/orders/{workflow_order_id}/quotation",
            params=params,
            headers=provider_headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Quotation update failed: {response.status_code}")
            return False
        
        print("✅ Provider quotation submitted successfully")
        
        # Step 4: Verify order status changed to quoted
        print("📋 Step 4: Verifying quoted status...")
        
        response = requests.get(
            f"{BACKEND_URL}/orders/{workflow_order_id}",
            headers=homeowner_headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to get updated order: {response.status_code}")
            return False
        
        updated_order = response.json()
        
        if updated_order.get("status") != "quoted":
            print(f"❌ Expected quoted status, got: {updated_order.get('status')}")
            return False
        
        if updated_order.get("quotation_amount") != 425.00:
            print(f"❌ Expected quotation_amount 425.00, got: {updated_order.get('quotation_amount')}")
            return False
        
        print("✅ Order status changed to quoted with correct quotation_amount")
        
        # Step 5: Test homeowner can accept quote
        print("📋 Step 5: Testing homeowner quote acceptance...")
        
        params = {"status": "accepted"}
        response = requests.put(
            f"{BACKEND_URL}/orders/{workflow_order_id}/status",
            params=params,
            headers=homeowner_headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Quote acceptance failed: {response.status_code}")
            return False
        
        print("✅ Homeowner can accept quotes")
        
        # Step 6: Test homeowner can decline quote (create another order for this)
        print("📋 Step 6: Testing homeowner quote decline...")
        
        # Create another quotation for decline test
        decline_quotation_data = quotation_data.copy()
        decline_quotation_data["description"] = "Decline test order"
        
        response = requests.post(
            f"{BACKEND_URL}/quotations",
            json=decline_quotation_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            decline_response = response.json()
            decline_order_id = decline_response.get("order_id")
            
            if decline_order_id:
                # Provide quotation
                params = {"quotation_amount": 300.00}
                requests.put(
                    f"{BACKEND_URL}/orders/{decline_order_id}/quotation",
                    params=params,
                    headers=provider_headers,
                    timeout=30
                )
                
                # Test decline
                params = {"status": "declined"}
                response = requests.put(
                    f"{BACKEND_URL}/orders/{decline_order_id}/status",
                    params=params,
                    headers=homeowner_headers,
                    timeout=30
                )
                
                if response.status_code == 200:
                    print("✅ Homeowner can decline quotes")
                else:
                    print(f"❌ Quote decline failed: {response.status_code}")
                    return False
        
        print("✅ Complete quotation workflow test passed")
        return True
        
    except Exception as e:
        print(f"❌ Quotation workflow test failed: {e}")
        return False

def test_orders_different_statuses():
    """Test orders in different statuses to verify quotation display"""
    print("\n🔍 Test 6: Orders in Different Statuses")
    
    if not provider_token or not homeowner_token:
        print("❌ Missing authentication tokens")
        return False
    
    try:
        # Test different order statuses
        statuses_to_test = [
            ("pending_quotation", None, "Should show 'Quote Pending'"),
            ("quoted", 250.00, "Should show '$250.00'"),
            ("accepted", 250.00, "Should show '$250.00'"),
            ("declined", 250.00, "Should show '$250.00'")
        ]
        
        for status, expected_amount, description in statuses_to_test:
            print(f"📋 Testing {status} status - {description}")
            
            # Create test order
            test_order = create_test_order()
            if not test_order:
                print(f"❌ Failed to create test order for {status}")
                continue
            
            order_id = test_order["id"]
            
            # Set quotation amount if needed
            if expected_amount is not None:
                provider_headers = {"Authorization": f"Bearer {provider_token}"}
                params = {"quotation_amount": expected_amount}
                
                response = requests.put(
                    f"{BACKEND_URL}/orders/{order_id}/quotation",
                    params=params,
                    headers=provider_headers,
                    timeout=30
                )
                
                if response.status_code != 200:
                    print(f"❌ Failed to set quotation for {status}")
                    continue
            
            # Update status if needed (for accepted/declined)
            if status in ["accepted", "declined"]:
                homeowner_headers = {"Authorization": f"Bearer {homeowner_token}"}
                params = {"status": status}
                
                response = requests.put(
                    f"{BACKEND_URL}/orders/{order_id}/status",
                    params=params,
                    headers=homeowner_headers,
                    timeout=30
                )
                
                if response.status_code != 200:
                    print(f"❌ Failed to set status to {status}")
                    continue
            
            # Verify final order state
            homeowner_headers = {"Authorization": f"Bearer {homeowner_token}"}
            response = requests.get(
                f"{BACKEND_URL}/orders/{order_id}",
                headers=homeowner_headers,
                timeout=30
            )
            
            if response.status_code == 200:
                order = response.json()
                actual_amount = order.get("quotation_amount")
                actual_status = order.get("status")
                
                if expected_amount is None and actual_amount is None:
                    print(f"✅ {status}: quotation_amount is null (frontend should show 'Quote Pending')")
                elif actual_amount == expected_amount:
                    print(f"✅ {status}: quotation_amount is ${actual_amount} (frontend should show '${actual_amount}')")
                else:
                    print(f"❌ {status}: Expected {expected_amount}, got {actual_amount}")
                    return False
            else:
                print(f"❌ Failed to verify {status} order")
                return False
        
        print("✅ All order statuses tested successfully")
        return True
        
    except Exception as e:
        print(f"❌ Orders different statuses test failed: {e}")
        return False

def run_quotation_display_tests():
    """Run all quotation display fix tests"""
    print("=" * 80)
    print("🎯 QUOTATION AMOUNT DISPLAY FIX TESTING")
    print("=" * 80)
    print("Testing field name mismatch fix between backend and frontend")
    print("Backend should return snake_case fields, frontend expects snake_case")
    print("=" * 80)
    
    # Authenticate users first
    if not authenticate_users():
        print("❌ Authentication failed - cannot proceed with tests")
        return False
    
    test_results = []
    
    # Test 1: Order Data Structure
    test_results.append(("Order Data Structure (Snake Case)", test_order_data_structure()))
    
    # Test 2: Quotation Amount Handling  
    test_results.append(("Quotation Amount Handling", test_quotation_amount_handling()))
    
    # Test 3: Field Name Consistency
    test_results.append(("Field Name Consistency", test_field_name_consistency()))
    
    # Test 5: Quotation Workflow
    test_results.append(("Complete Quotation Workflow", test_quotation_workflow()))
    
    # Test 6: Orders in Different Statuses
    test_results.append(("Orders in Different Statuses", test_orders_different_statuses()))
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 QUOTATION DISPLAY FIX TEST SUMMARY")
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
        print("\n🎉 ALL QUOTATION DISPLAY FIX TESTS PASSED!")
        print("✅ Backend API returns proper snake_case field names")
        print("✅ quotation_amount field handled correctly (null and specific values)")
        print("✅ Field name consistency maintained throughout")
        print("✅ Complete quotation workflow functional")
        print("✅ Orders in different statuses display correctly")
        return True
    else:
        print(f"\n⚠️ {failed} QUOTATION DISPLAY FIX TESTS FAILED!")
        return False

if __name__ == "__main__":
    success = run_quotation_display_tests()
    exit(0 if success else 1)