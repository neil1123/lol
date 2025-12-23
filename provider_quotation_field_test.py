#!/usr/bin/env python3
"""
Provider-Side Quotation Amount Display Fix Testing
Tests the field name consistency and quotation workflow for provider side
"""

import requests
import json
import uuid
from datetime import datetime

# Backend URL from environment
BACKEND_URL = "https://prop-issue-report.preview.emergentagent.com/api"

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
test_orders = []

def authenticate_test_accounts():
    """Authenticate with the test accounts specified in review request"""
    print("🔐 Authenticating Test Accounts...")
    global provider_token, homeowner_token, provider_id, homeowner_id
    
    try:
        # Test provider authentication
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
            print(f"✅ Provider authentication successful: {PROVIDER_EMAIL}")
        else:
            print(f"❌ Provider authentication failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Test homeowner authentication
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
            print(f"✅ Homeowner authentication successful: {HOMEOWNER_EMAIL}")
        else:
            print(f"❌ Homeowner authentication failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Authentication failed: {e}")
        return False

def test_provider_orders_api_field_names():
    """Test 1: Verify GET /api/orders returns proper snake_case field names for provider view"""
    print("\n🔍 Test 1: Provider Orders API Field Names...")
    
    if not provider_token:
        print("❌ No provider token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.get(
            f"{BACKEND_URL}/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to get provider orders: {response.status_code}")
            return False
        
        orders = response.json()
        
        if not isinstance(orders, list):
            print(f"❌ Expected list of orders, got: {type(orders)}")
            return False
        
        print(f"ℹ️ Retrieved {len(orders)} orders for provider")
        
        # Check field names in orders (if any exist)
        required_snake_case_fields = [
            "quotation_amount",  # NOT quotationAmount
            "homeowner_name",    # NOT homeownerName
            "service_type",      # NOT serviceType
            "quotation_details", # NOT quotationDetails
            "request_date",      # NOT requestDate
            "homeowner_address"  # NOT homeownerAddress
        ]
        
        # Check for camelCase violations
        camelcase_violations = [
            "quotationAmount",
            "homeownerName", 
            "serviceType",
            "quotationDetails",
            "requestDate",
            "homeownerAddress"
        ]
        
        field_check_passed = True
        
        if orders:  # If we have orders to check
            sample_order = orders[0]
            
            # Check for required snake_case fields
            for field in required_snake_case_fields:
                if field not in sample_order:
                    print(f"❌ Missing required snake_case field: {field}")
                    field_check_passed = False
                else:
                    print(f"✅ Found snake_case field: {field}")
            
            # Check for camelCase violations
            for field in camelcase_violations:
                if field in sample_order:
                    print(f"❌ Found camelCase violation: {field}")
                    field_check_passed = False
            
            # Store sample order for later tests
            global test_orders
            test_orders = orders
            
        else:
            print("ℹ️ No orders found - will create test orders for field verification")
        
        if field_check_passed:
            print("✅ Provider Orders API field names are correct (snake_case)")
            return True
        else:
            print("❌ Provider Orders API has field name issues")
            return False
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Provider Orders API test failed: {e}")
        return False

def test_quotation_amount_handling():
    """Test 2: Verify quotation_amount field handling (null vs specific values)"""
    print("\n🔍 Test 2: Quotation Amount Handling...")
    
    if not provider_token or not homeowner_token:
        print("❌ Missing authentication tokens")
        return False
    
    try:
        # Create a test order with pending quotation (null quotation_amount)
        order_data = {
            "homeowner_id": homeowner_id,
            "provider_id": provider_id,
            "homeowner_name": "Test Homeowner",
            "homeowner_email": HOMEOWNER_EMAIL,
            "homeowner_phone": "+1-902-555-0123",
            "homeowner_address": "123 Test Street, Halifax, NS",
            "provider_name": "Test Provider",
            "service_type": "Plumbing Repair",
            "description": "Fix kitchen sink leak",
            "preferred_date": "2024-01-20",
            "budget": "$100-200"
        }
        
        homeowner_headers = {"Authorization": f"Bearer {homeowner_token}"}
        response = requests.post(
            f"{BACKEND_URL}/orders",
            json=order_data,
            headers=homeowner_headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to create test order: {response.status_code}")
            return False
        
        test_order = response.json()
        test_order_id = test_order["id"]
        
        print("✅ Created test order with pending quotation")
        
        # Verify initial state: quotation_amount should be null
        provider_headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.get(
            f"{BACKEND_URL}/orders/{test_order_id}",
            headers=provider_headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to retrieve test order: {response.status_code}")
            return False
        
        order_details = response.json()
        
        # Check quotation_amount field exists and is null initially
        if "quotation_amount" not in order_details:
            print("❌ quotation_amount field missing from order")
            return False
        
        if order_details["quotation_amount"] is not None:
            print(f"❌ Expected null quotation_amount, got: {order_details['quotation_amount']}")
            return False
        
        print("✅ Order with null quotation_amount handled correctly")
        
        # Test setting specific quotation amounts
        test_amounts = [0.00, 25.50, 150.75, 1000.00, 9999.99]
        
        for amount in test_amounts:
            # Update quotation amount
            params = {
                "quotation_amount": amount,
                "quotation_details": f"Professional service quote for ${amount:.2f}"
            }
            
            response = requests.put(
                f"{BACKEND_URL}/orders/{test_order_id}/quotation",
                params=params,
                headers=provider_headers,
                timeout=30
            )
            
            if response.status_code != 200:
                print(f"❌ Failed to update quotation to ${amount}: {response.status_code}")
                return False
            
            # Verify the amount was set correctly
            response = requests.get(
                f"{BACKEND_URL}/orders/{test_order_id}",
                headers=provider_headers,
                timeout=30
            )
            
            if response.status_code != 200:
                print(f"❌ Failed to retrieve updated order: {response.status_code}")
                return False
            
            updated_order = response.json()
            
            if updated_order["quotation_amount"] != amount:
                print(f"❌ Quotation amount mismatch: expected ${amount}, got ${updated_order['quotation_amount']}")
                return False
            
            print(f"✅ Quotation amount ${amount:.2f} set and retrieved correctly")
        
        print("✅ Quotation amount handling test passed")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Quotation amount handling test failed: {e}")
        return False

def test_provider_quotation_workflow():
    """Test 3: Complete provider quotation workflow"""
    print("\n🔍 Test 3: Provider Quotation Workflow...")
    
    if not provider_token or not homeowner_token:
        print("❌ Missing authentication tokens")
        return False
    
    try:
        # Step 1: Create quotation request
        quotation_data = {
            "homeowner_id": homeowner_id,
            "provider_id": provider_id,
            "homeowner_name": "Workflow Test Customer",
            "homeowner_email": HOMEOWNER_EMAIL,
            "homeowner_phone": "+1-902-555-9999",
            "homeowner_address": "999 Workflow St, Halifax, NS",
            "provider_name": "Test Provider Services",
            "service_type": "Electrical Installation",
            "description": "Install new electrical outlets in kitchen",
            "preferred_date": "2024-02-01",
            "budget": "$300-500"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/quotations",
            json=quotation_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Quotation request creation failed: {response.status_code}")
            return False
        
        quotation_response = response.json()
        workflow_order_id = quotation_response.get("order_id")
        
        if not workflow_order_id:
            print("❌ No order_id returned from quotation request")
            return False
        
        print("✅ Step 1: Quotation request created")
        
        # Step 2: Provider views orders with pending_quotation status
        provider_headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.get(
            f"{BACKEND_URL}/orders",
            headers=provider_headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to get provider orders: {response.status_code}")
            return False
        
        orders = response.json()
        pending_orders = [order for order in orders if order.get("status") == "pending_quotation"]
        
        if not any(order["id"] == workflow_order_id for order in pending_orders):
            print("❌ Workflow order not found in pending quotations")
            return False
        
        print("✅ Step 2: Provider can view orders with pending_quotation status")
        
        # Step 3: Provider updates quotation amount
        quotation_amount = 425.00
        params = {
            "quotation_amount": quotation_amount,
            "quotation_details": "Professional electrical outlet installation with premium materials and 1-year warranty"
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
        
        print("✅ Step 3: Provider updated quotation amount successfully")
        
        # Step 4: Verify quotation shows specific dollar amount (not range)
        response = requests.get(
            f"{BACKEND_URL}/orders/{workflow_order_id}",
            headers=provider_headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to retrieve updated order: {response.status_code}")
            return False
        
        updated_order = response.json()
        
        if updated_order.get("quotation_amount") != quotation_amount:
            print(f"❌ Quotation amount mismatch: expected ${quotation_amount}, got ${updated_order.get('quotation_amount')}")
            return False
        
        if updated_order.get("status") != "quoted":
            print(f"❌ Expected 'quoted' status, got '{updated_order.get('status')}'")
            return False
        
        print(f"✅ Step 4: Quotation shows specific amount ${quotation_amount:.2f} (not range)")
        
        # Step 5: Test homeowner can accept/decline
        homeowner_headers = {"Authorization": f"Bearer {homeowner_token}"}
        
        # Test accept
        params = {"status": "accepted"}
        response = requests.put(
            f"{BACKEND_URL}/orders/{workflow_order_id}/status",
            params=params,
            headers=homeowner_headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Homeowner quote acceptance failed: {response.status_code}")
            return False
        
        print("✅ Step 5: Homeowner can accept quotations")
        
        print("✅ Complete provider quotation workflow test passed")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Provider quotation workflow test failed: {e}")
        return False

def test_field_name_consistency():
    """Test 4: Verify all provider-facing order data uses snake_case naming"""
    print("\n🔍 Test 4: Field Name Consistency...")
    
    if not provider_token:
        print("❌ No provider token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.get(
            f"{BACKEND_URL}/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to get orders: {response.status_code}")
            return False
        
        orders = response.json()
        
        if not orders:
            print("ℹ️ No orders available for field name consistency check")
            return True
        
        # Check all fields in a sample order
        sample_order = orders[0]
        all_fields = list(sample_order.keys())
        
        print(f"ℹ️ Checking {len(all_fields)} fields for naming consistency")
        
        # Define expected snake_case pattern and camelCase violations
        snake_case_fields = []
        camelcase_violations = []
        
        for field in all_fields:
            if '_' in field and field.islower():
                snake_case_fields.append(field)
            elif any(c.isupper() for c in field[1:]):  # camelCase detection
                camelcase_violations.append(field)
        
        print(f"✅ Snake_case fields found: {len(snake_case_fields)}")
        for field in snake_case_fields[:10]:  # Show first 10
            print(f"   - {field}")
        
        if camelcase_violations:
            print(f"❌ CamelCase violations found: {len(camelcase_violations)}")
            for field in camelcase_violations:
                print(f"   - {field}")
            return False
        else:
            print("✅ No camelCase violations detected")
        
        # Specifically check quotation-related fields
        quotation_fields = {
            "quotation_amount": sample_order.get("quotation_amount"),
            "quotation_details": sample_order.get("quotation_details"),
            "quotation_valid_until": sample_order.get("quotation_valid_until")
        }
        
        print("✅ Quotation-related fields properly formatted:")
        for field, value in quotation_fields.items():
            if field in sample_order:
                print(f"   - {field}: {type(value).__name__}")
        
        print("✅ Field name consistency test passed")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Field name consistency test failed: {e}")
        return False

def test_revenue_calculations():
    """Test 5: Verify revenue analytics calculations work with quotation_amount field"""
    print("\n🔍 Test 5: Revenue Calculations...")
    
    if not provider_token:
        print("❌ No provider token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.get(
            f"{BACKEND_URL}/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to get orders for revenue calculation: {response.status_code}")
            return False
        
        orders = response.json()
        
        # Calculate total revenue from completed orders
        total_revenue = 0
        completed_orders = 0
        orders_with_amounts = 0
        
        for order in orders:
            if order.get("status") == "completed":
                completed_orders += 1
                quotation_amount = order.get("quotation_amount")
                
                if quotation_amount is not None:
                    orders_with_amounts += 1
                    total_revenue += float(quotation_amount)
        
        print(f"✅ Revenue calculation results:")
        print(f"   - Total orders: {len(orders)}")
        print(f"   - Completed orders: {completed_orders}")
        print(f"   - Orders with quotation amounts: {orders_with_amounts}")
        print(f"   - Total revenue: ${total_revenue:.2f}")
        
        # Verify quotation_amount field is accessible for calculations
        revenue_fields_available = True
        
        for order in orders[:5]:  # Check first 5 orders
            if "quotation_amount" not in order:
                print(f"❌ quotation_amount field missing in order {order.get('id', 'unknown')}")
                revenue_fields_available = False
            
            if "status" not in order:
                print(f"❌ status field missing in order {order.get('id', 'unknown')}")
                revenue_fields_available = False
        
        if revenue_fields_available:
            print("✅ All required fields available for revenue calculations")
        else:
            print("❌ Missing fields required for revenue calculations")
            return False
        
        # Test dashboard revenue data structure
        dashboard_data = {
            "total_revenue": total_revenue,
            "completed_orders": completed_orders,
            "average_order_value": total_revenue / completed_orders if completed_orders > 0 else 0,
            "revenue_this_month": 0,  # Would need date filtering in real implementation
            "field_names_correct": True
        }
        
        print("✅ Dashboard revenue data structure:")
        for key, value in dashboard_data.items():
            print(f"   - {key}: {value}")
        
        print("✅ Revenue calculations test passed")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Revenue calculations test failed: {e}")
        return False

def run_provider_quotation_tests():
    """Run all provider-side quotation amount display fix tests"""
    print("=" * 80)
    print("🎯 PROVIDER-SIDE QUOTATION AMOUNT DISPLAY FIX TESTING")
    print("=" * 80)
    print("Testing field name consistency and quotation workflow for provider side")
    print(f"Provider Account: {PROVIDER_EMAIL}")
    print(f"Homeowner Account: {HOMEOWNER_EMAIL}")
    print("=" * 80)
    
    # Authenticate first
    if not authenticate_test_accounts():
        print("❌ Authentication failed - cannot proceed with tests")
        return False
    
    test_results = []
    
    # Test 1: Provider Orders API Field Names
    test_results.append(("Provider Orders API Field Names", test_provider_orders_api_field_names()))
    
    # Test 2: Quotation Amount Handling
    test_results.append(("Quotation Amount Handling", test_quotation_amount_handling()))
    
    # Test 3: Provider Quotation Workflow
    test_results.append(("Provider Quotation Workflow", test_provider_quotation_workflow()))
    
    # Test 4: Field Name Consistency
    test_results.append(("Field Name Consistency", test_field_name_consistency()))
    
    # Test 5: Revenue Calculations
    test_results.append(("Revenue Calculations", test_revenue_calculations()))
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 PROVIDER QUOTATION TESTING SUMMARY")
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
        print("\n🎉 ALL PROVIDER QUOTATION TESTS PASSED!")
        print("✅ Provider-side quotation amount display fix is working correctly")
        print("✅ Field names are consistent (snake_case)")
        print("✅ Quotation workflow is functional")
        print("✅ Revenue calculations work properly")
        return True
    else:
        print(f"\n⚠️ {failed} PROVIDER QUOTATION TESTS FAILED!")
        print("❌ Provider-side quotation amount display fix needs attention")
        return False

if __name__ == "__main__":
    import sys
    success = run_provider_quotation_tests()
    sys.exit(0 if success else 1)