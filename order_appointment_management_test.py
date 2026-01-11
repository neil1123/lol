#!/usr/bin/env python3
"""
Order and Appointment Management Backend Testing Script
Tests the new backend endpoints for order and appointment management as requested in the review.

Focus Areas:
1. PUT /api/orders/{id} - Update manual orders (homeowner_id starts with 'manual_')
2. DELETE /api/orders/{id} - Delete manual orders with proper validation
3. PUT /api/appointments/{id} - Update provider appointments
4. Access control validation for all endpoints
"""

import requests
import json
import uuid
from datetime import datetime
import sys

# Backend URL from environment
BACKEND_URL = "https://propertyfix-4.preview.emergentagent.com/api"

# Global test data
provider_token = None
homeowner_token = None
provider_id = None
homeowner_id = None
manual_order_id = None
regular_order_id = None
appointment_id = None

def setup_test_accounts():
    """Setup test provider and homeowner accounts"""
    print("🔧 Setting up test accounts...")
    global provider_token, homeowner_token, provider_id, homeowner_id
    
    try:
        # Login with existing test provider account
        login_data = {
            "email": "test@provider.com",
            "password": "password123"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            provider_token = data["access_token"]
            provider_id = data["user"]["id"]
            print("✅ Provider login successful")
        else:
            print(f"❌ Provider login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Create a test homeowner for testing
        homeowner_data = {
            "email": f"homeowner_{uuid.uuid4().hex[:8]}@testdoord.com",
            "password": "testpass123",
            "user_type": "homeowner",
            "name": "Test Homeowner",
            "phone": "+1-902-555-0123",
            "address": "123 Test St, Halifax, NS"
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
            print("✅ Homeowner registration successful")
            return True
        else:
            print(f"❌ Homeowner registration failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Account setup failed: {e}")
        return False

def create_test_orders():
    """Create test orders for testing - both manual and regular"""
    print("\n🔧 Creating test orders...")
    global manual_order_id, regular_order_id
    
    if not provider_token or not homeowner_token:
        print("❌ Missing tokens for order creation")
        return False
    
    try:
        # Create a manual order (provider creates with manual_ homeowner_id)
        manual_order_data = {
            "homeowner_id": f"manual_{uuid.uuid4().hex[:8]}",
            "provider_id": provider_id,
            "homeowner_name": "Manual Customer",
            "homeowner_email": "manual@customer.com",
            "homeowner_phone": "+1-902-555-9999",
            "homeowner_address": "999 Manual St, Halifax, NS",
            "provider_name": "Test Provider Services",
            "service_type": "Plumbing",
            "services": ["Plumbing", "Pipe Repair"],
            "description": "Fix leaky pipes in basement",
            "preferred_date": "2024-02-15",
            "preferred_time": "10:00 AM",
            "urgency": "high",
            "budget": "$200-300"
        }
        
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.post(
            f"{BACKEND_URL}/orders",
            json=manual_order_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            manual_order_id = data["id"]
            print(f"✅ Manual order created: {manual_order_id}")
        else:
            print(f"❌ Manual order creation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Create a regular order (homeowner creates)
        regular_order_data = {
            "homeowner_id": homeowner_id,
            "provider_id": provider_id,
            "homeowner_name": "Test Homeowner",
            "homeowner_email": "homeowner@test.com",
            "homeowner_phone": "+1-902-555-0123",
            "homeowner_address": "123 Test St, Halifax, NS",
            "provider_name": "Test Provider Services",
            "service_type": "Electrical",
            "services": ["Electrical", "Outlet Installation"],
            "description": "Install new electrical outlets",
            "preferred_date": "2024-02-20",
            "preferred_time": "2:00 PM",
            "urgency": "medium",
            "budget": "$150-250"
        }
        
        homeowner_headers = {"Authorization": f"Bearer {homeowner_token}"}
        response = requests.post(
            f"{BACKEND_URL}/orders",
            json=regular_order_data,
            headers=homeowner_headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            regular_order_id = data["id"]
            print(f"✅ Regular order created: {regular_order_id}")
            return True
        else:
            print(f"❌ Regular order creation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Order creation failed: {e}")
        return False

def create_test_appointment():
    """Create a test appointment for testing"""
    print("\n🔧 Creating test appointment...")
    global appointment_id
    
    if not provider_token:
        print("❌ Missing provider token for appointment creation")
        return False
    
    try:
        appointment_data = {
            "customer_name": "Test Customer",
            "phone_number": "+1-902-555-7777",
            "service_type": "HVAC",
            "services": ["HVAC", "Furnace Maintenance"],
            "date": "2024-02-25",
            "time": "3:00 PM",
            "address": "777 Test Ave, Halifax, NS",
            "notes": "Annual furnace maintenance check",
            "source": "manual"
        }
        
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.post(
            f"{BACKEND_URL}/appointments",
            json=appointment_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            appointment_id = data["id"]
            print(f"✅ Test appointment created: {appointment_id}")
            return True
        else:
            print(f"❌ Appointment creation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Appointment creation failed: {e}")
        return False

def test_manual_order_update():
    """Test PUT /api/orders/{id} - Update manual orders"""
    print("\n🔍 Testing Manual Order Update (PUT /api/orders/{id})...")
    
    if not provider_token or not manual_order_id:
        print("❌ Missing data for manual order update test")
        return False
    
    try:
        # Test 1: Provider updating their own manual order (should succeed)
        update_data = {
            "homeowner_name": "Updated Manual Customer",
            "homeowner_phone": "+1-902-555-8888",
            "description": "Updated: Fix leaky pipes and install new fixtures",
            "preferred_date": "2024-02-16",
            "preferred_time": "11:00 AM",
            "budget": "$300-400",
            "urgency": "medium"
        }
        
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.put(
            f"{BACKEND_URL}/orders/{manual_order_id}",
            json=update_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "updated successfully" in data.get("message", "").lower():
                print("✅ Provider can update manual orders")
            else:
                print(f"❌ Unexpected response: {data}")
                return False
        else:
            print(f"❌ Manual order update failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Test 2: Verify the update was applied
        response = requests.get(
            f"{BACKEND_URL}/orders/{manual_order_id}",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            order_data = response.json()
            if (order_data.get("homeowner_name") == "Updated Manual Customer" and
                order_data.get("homeowner_phone") == "+1-902-555-8888"):
                print("✅ Manual order update persisted correctly")
            else:
                print("❌ Manual order update not persisted")
                return False
        else:
            print(f"❌ Failed to verify order update: {response.status_code}")
            return False
        
        # Test 3: Homeowner trying to update manual order (should fail)
        if homeowner_token:
            homeowner_headers = {"Authorization": f"Bearer {homeowner_token}"}
            response = requests.put(
                f"{BACKEND_URL}/orders/{manual_order_id}",
                json={"description": "Homeowner trying to update"},
                headers=homeowner_headers,
                timeout=30
            )
            
            if response.status_code == 403:
                print("✅ Homeowner properly blocked from updating manual orders")
            else:
                print(f"❌ Expected 403 for homeowner update, got {response.status_code}")
                return False
        
        # Test 4: Try to update regular order (should fail - not manual)
        if regular_order_id:
            response = requests.put(
                f"{BACKEND_URL}/orders/{regular_order_id}",
                json={"description": "Trying to update regular order"},
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 403:
                print("✅ Regular order update properly blocked (not manual)")
            else:
                print(f"❌ Expected 403 for regular order update, got {response.status_code}")
                return False
        
        print("✅ Manual order update tests passed")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Manual order update test failed: {e}")
        return False

def test_manual_order_deletion():
    """Test DELETE /api/orders/{id} - Delete manual orders"""
    print("\n🔍 Testing Manual Order Deletion (DELETE /api/orders/{id})...")
    
    if not provider_token:
        print("❌ Missing provider token for deletion test")
        return False
    
    try:
        # First create a new manual order for deletion test
        delete_test_order_data = {
            "homeowner_id": f"manual_{uuid.uuid4().hex[:8]}",
            "provider_id": provider_id,
            "homeowner_name": "Delete Test Customer",
            "homeowner_email": "delete@test.com",
            "homeowner_phone": "+1-902-555-0000",
            "homeowner_address": "000 Delete St, Halifax, NS",
            "provider_name": "Test Provider Services",
            "service_type": "Window Cleaning",
            "description": "Clean all windows - to be deleted",
            "preferred_date": "2024-03-01",
            "budget": "$100-150"
        }
        
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.post(
            f"{BACKEND_URL}/orders",
            json=delete_test_order_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to create order for deletion test")
            return False
        
        delete_order_id = response.json()["id"]
        print(f"✅ Created order for deletion test: {delete_order_id}")
        
        # Test 1: Homeowner trying to delete manual order (should fail)
        if homeowner_token:
            homeowner_headers = {"Authorization": f"Bearer {homeowner_token}"}
            response = requests.delete(
                f"{BACKEND_URL}/orders/{delete_order_id}",
                headers=homeowner_headers,
                timeout=30
            )
            
            if response.status_code == 403:
                print("✅ Homeowner properly blocked from deleting orders")
            else:
                print(f"❌ Expected 403 for homeowner deletion, got {response.status_code}")
                return False
        
        # Test 2: Try to delete regular order (should fail - not manual)
        if regular_order_id:
            response = requests.delete(
                f"{BACKEND_URL}/orders/{regular_order_id}",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 403:
                print("✅ Regular order deletion properly blocked (not manual)")
            else:
                print(f"❌ Expected 403 for regular order deletion, got {response.status_code}")
                return False
        
        # Test 3: Provider deleting their own manual order (should succeed)
        response = requests.delete(
            f"{BACKEND_URL}/orders/{delete_order_id}",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "deleted successfully" in data.get("message", "").lower():
                print("✅ Provider can delete manual orders")
            else:
                print(f"❌ Unexpected deletion response: {data}")
                return False
        else:
            print(f"❌ Manual order deletion failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Test 4: Verify order was actually deleted
        response = requests.get(
            f"{BACKEND_URL}/orders/{delete_order_id}",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 404:
            print("✅ Order successfully deleted from database")
        else:
            print(f"❌ Order still exists after deletion: {response.status_code}")
            return False
        
        # Test 5: Try to delete non-existent order
        fake_order_id = str(uuid.uuid4())
        response = requests.delete(
            f"{BACKEND_URL}/orders/{fake_order_id}",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 404:
            print("✅ Non-existent order deletion properly handled (404)")
        else:
            print(f"❌ Expected 404 for non-existent order, got {response.status_code}")
            return False
        
        print("✅ Manual order deletion tests passed")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Manual order deletion test failed: {e}")
        return False

def test_appointment_update():
    """Test PUT /api/appointments/{id} - Update provider appointments"""
    print("\n🔍 Testing Appointment Update (PUT /api/appointments/{id})...")
    
    if not provider_token or not appointment_id:
        print("❌ Missing data for appointment update test")
        return False
    
    try:
        # Test 1: Provider updating their own appointment (should succeed)
        update_data = {
            "customer_name": "Updated Test Customer",
            "phone_number": "+1-902-555-6666",
            "service_type": "HVAC, Duct Cleaning",
            "services": ["HVAC", "Duct Cleaning", "Air Quality Check"],
            "date": "2024-02-26",
            "time": "4:00 PM",
            "address": "888 Updated Ave, Halifax, NS",
            "notes": "Updated: Annual furnace maintenance and duct cleaning"
        }
        
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.put(
            f"{BACKEND_URL}/appointments/{appointment_id}",
            json=update_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "updated successfully" in data.get("message", "").lower():
                print("✅ Provider can update their appointments")
            else:
                print(f"❌ Unexpected response: {data}")
                return False
        else:
            print(f"❌ Appointment update failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Test 2: Verify the update was applied
        response = requests.get(
            f"{BACKEND_URL}/appointments",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            appointments = response.json()
            updated_appointment = None
            for apt in appointments:
                if apt.get("id") == appointment_id:
                    updated_appointment = apt
                    break
            
            if updated_appointment:
                if (updated_appointment.get("customer_name") == "Updated Test Customer" and
                    updated_appointment.get("phone_number") == "+1-902-555-6666" and
                    updated_appointment.get("date") == "2024-02-26"):
                    print("✅ Appointment update persisted correctly")
                else:
                    print("❌ Appointment update not persisted correctly")
                    return False
            else:
                print("❌ Updated appointment not found")
                return False
        else:
            print(f"❌ Failed to verify appointment update: {response.status_code}")
            return False
        
        # Test 3: Homeowner trying to update appointment (should fail)
        if homeowner_token:
            homeowner_headers = {"Authorization": f"Bearer {homeowner_token}"}
            response = requests.put(
                f"{BACKEND_URL}/appointments/{appointment_id}",
                json={"notes": "Homeowner trying to update"},
                headers=homeowner_headers,
                timeout=30
            )
            
            if response.status_code == 403:
                print("✅ Homeowner properly blocked from updating appointments")
            else:
                print(f"❌ Expected 403 for homeowner update, got {response.status_code}")
                return False
        
        # Test 4: Try to update non-existent appointment
        fake_appointment_id = str(uuid.uuid4())
        response = requests.put(
            f"{BACKEND_URL}/appointments/{fake_appointment_id}",
            json={"notes": "Updating non-existent appointment"},
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 404:
            print("✅ Non-existent appointment update properly handled (404)")
        else:
            print(f"❌ Expected 404 for non-existent appointment, got {response.status_code}")
            return False
        
        print("✅ Appointment update tests passed")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Appointment update test failed: {e}")
        return False

def test_access_control_comprehensive():
    """Test comprehensive access control scenarios"""
    print("\n🔍 Testing Comprehensive Access Control...")
    
    if not provider_token or not homeowner_token:
        print("❌ Missing tokens for access control test")
        return False
    
    try:
        # Create another provider to test cross-provider access
        other_provider_data = {
            "email": f"otherprovider_{uuid.uuid4().hex[:8]}@testdoord.com",
            "password": "testpass123",
            "user_type": "provider",
            "name": "Other Provider",
            "business_name": "Other Services Inc",
            "services": ["Landscaping"],
            "phone": "+1-902-555-9999"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=other_provider_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to create other provider for access control test")
            return False
        
        other_provider_data = response.json()
        other_provider_token = other_provider_data["access_token"]
        other_provider_id = other_provider_data["user"]["id"]
        
        print("✅ Created second provider for cross-access testing")
        
        # Test 1: Other provider trying to update first provider's manual order
        if manual_order_id:
            other_headers = {"Authorization": f"Bearer {other_provider_token}"}
            response = requests.put(
                f"{BACKEND_URL}/orders/{manual_order_id}",
                json={"description": "Other provider trying to update"},
                headers=other_headers,
                timeout=30
            )
            
            if response.status_code == 403:
                print("✅ Cross-provider order access properly blocked")
            else:
                print(f"❌ Expected 403 for cross-provider access, got {response.status_code}")
                return False
        
        # Test 2: Create appointment with other provider and test cross-access
        other_appointment_data = {
            "customer_name": "Other Customer",
            "phone_number": "+1-902-555-1111",
            "service_type": "Landscaping",
            "date": "2024-03-05",
            "time": "9:00 AM",
            "address": "111 Other St, Halifax, NS",
            "notes": "Lawn maintenance"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/appointments",
            json=other_appointment_data,
            headers=other_headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to create appointment with other provider")
            return False
        
        other_appointment_id = response.json()["id"]
        
        # Test first provider trying to update other provider's appointment
        first_provider_headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.put(
            f"{BACKEND_URL}/appointments/{other_appointment_id}",
            json={"notes": "First provider trying to update"},
            headers=first_provider_headers,
            timeout=30
        )
        
        if response.status_code == 403:
            print("✅ Cross-provider appointment access properly blocked")
        else:
            print(f"❌ Expected 403 for cross-provider appointment access, got {response.status_code}")
            return False
        
        # Test 3: Invalid JWT token
        invalid_headers = {"Authorization": "Bearer invalid-jwt-token"}
        response = requests.put(
            f"{BACKEND_URL}/orders/{manual_order_id}",
            json={"description": "Invalid token test"},
            headers=invalid_headers,
            timeout=30
        )
        
        if response.status_code == 401:
            print("✅ Invalid JWT token properly rejected (401)")
        else:
            print(f"❌ Expected 401 for invalid token, got {response.status_code}")
            return False
        
        # Test 4: No authorization header
        response = requests.put(
            f"{BACKEND_URL}/orders/{manual_order_id}",
            json={"description": "No auth test"},
            timeout=30
        )
        
        if response.status_code == 403:
            print("✅ Missing authorization properly rejected (403)")
        else:
            print(f"❌ Expected 403 for missing auth, got {response.status_code}")
            return False
        
        print("✅ Comprehensive access control tests passed")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Access control test failed: {e}")
        return False

def test_integration_with_existing_workflow():
    """Test integration with existing order creation workflow"""
    print("\n🔍 Testing Integration with Existing Workflow...")
    
    if not provider_token:
        print("❌ Missing provider token for integration test")
        return False
    
    try:
        # Test 1: Create manual order, update it, then verify it appears in orders list
        integration_order_data = {
            "homeowner_id": f"manual_{uuid.uuid4().hex[:8]}",
            "provider_id": provider_id,
            "homeowner_name": "Integration Test Customer",
            "homeowner_email": "integration@test.com",
            "homeowner_phone": "+1-902-555-2222",
            "homeowner_address": "222 Integration St, Halifax, NS",
            "provider_name": "Test Provider Services",
            "service_type": "Carpet Cleaning",
            "services": ["Carpet Cleaning", "Upholstery Cleaning"],
            "description": "Deep clean carpets and furniture",
            "preferred_date": "2024-03-10",
            "budget": "$250-350"
        }
        
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.post(
            f"{BACKEND_URL}/orders",
            json=integration_order_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to create integration test order")
            return False
        
        integration_order_id = response.json()["id"]
        print("✅ Integration test order created")
        
        # Test 2: Update the order
        update_data = {
            "description": "Updated: Deep clean carpets, furniture, and drapes",
            "budget": "$300-400",
            "preferred_time": "1:00 PM"
        }
        
        response = requests.put(
            f"{BACKEND_URL}/orders/{integration_order_id}",
            json=update_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to update integration test order")
            return False
        
        print("✅ Integration test order updated")
        
        # Test 3: Verify order appears in provider's orders list with updates
        response = requests.get(
            f"{BACKEND_URL}/orders",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to retrieve orders list")
            return False
        
        orders = response.json()
        integration_order = None
        for order in orders:
            if order.get("id") == integration_order_id:
                integration_order = order
                break
        
        if not integration_order:
            print("❌ Integration order not found in orders list")
            return False
        
        # Verify updates were applied
        if (integration_order.get("description") == "Updated: Deep clean carpets, furniture, and drapes" and
            integration_order.get("budget") == "$300-400" and
            integration_order.get("status") == "confirmed"):  # Manual orders should be confirmed
            print("✅ Integration order properly updated and listed")
        else:
            print("❌ Integration order updates not properly reflected")
            return False
        
        # Test 4: Test appointment integration
        integration_appointment_data = {
            "customer_name": "Integration Appointment Customer",
            "phone_number": "+1-902-555-3333",
            "service_type": "Home Inspection",
            "services": ["Home Inspection", "Safety Check"],
            "date": "2024-03-15",
            "time": "10:00 AM",
            "address": "333 Inspection Ave, Halifax, NS",
            "notes": "Pre-purchase home inspection",
            "order_id": integration_order_id
        }
        
        response = requests.post(
            f"{BACKEND_URL}/appointments",
            json=integration_appointment_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to create integration appointment")
            return False
        
        integration_appointment_id = response.json()["id"]
        print("✅ Integration appointment created")
        
        # Test 5: Update the appointment
        appointment_update_data = {
            "time": "11:00 AM",
            "notes": "Updated: Pre-purchase home inspection with detailed report"
        }
        
        response = requests.put(
            f"{BACKEND_URL}/appointments/{integration_appointment_id}",
            json=appointment_update_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to update integration appointment")
            return False
        
        print("✅ Integration appointment updated")
        
        # Test 6: Verify appointment appears in appointments list with updates
        response = requests.get(
            f"{BACKEND_URL}/appointments",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to retrieve appointments list")
            return False
        
        appointments = response.json()
        integration_appointment = None
        for apt in appointments:
            if apt.get("id") == integration_appointment_id:
                integration_appointment = apt
                break
        
        if not integration_appointment:
            print("❌ Integration appointment not found in appointments list")
            return False
        
        # Verify updates were applied
        if (integration_appointment.get("time") == "11:00 AM" and
            "detailed report" in integration_appointment.get("notes", "")):
            print("✅ Integration appointment properly updated and listed")
        else:
            print("❌ Integration appointment updates not properly reflected")
            return False
        
        print("✅ Integration with existing workflow tests passed")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Integration workflow test failed: {e}")
        return False

def test_data_integrity():
    """Test data integrity after updates and deletions"""
    print("\n🔍 Testing Data Integrity...")
    
    if not provider_token:
        print("❌ Missing provider token for data integrity test")
        return False
    
    try:
        # Test 1: Create order with appointment, update both, verify consistency
        integrity_order_data = {
            "homeowner_id": f"manual_{uuid.uuid4().hex[:8]}",
            "provider_id": provider_id,
            "homeowner_name": "Integrity Test Customer",
            "homeowner_email": "integrity@test.com",
            "homeowner_phone": "+1-902-555-4444",
            "homeowner_address": "444 Integrity Blvd, Halifax, NS",
            "provider_name": "Test Provider Services",
            "service_type": "Roofing",
            "services": ["Roofing", "Gutter Repair"],
            "description": "Roof inspection and gutter repair",
            "preferred_date": "2024-03-20",
            "budget": "$500-800"
        }
        
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.post(
            f"{BACKEND_URL}/orders",
            json=integrity_order_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to create integrity test order")
            return False
        
        integrity_order_id = response.json()["id"]
        
        # Create related appointment
        integrity_appointment_data = {
            "customer_name": "Integrity Test Customer",
            "phone_number": "+1-902-555-4444",
            "service_type": "Roofing, Gutter Repair",
            "services": ["Roofing", "Gutter Repair"],
            "date": "2024-03-20",
            "time": "8:00 AM",
            "address": "444 Integrity Blvd, Halifax, NS",
            "notes": "Roof inspection and gutter repair appointment",
            "order_id": integrity_order_id
        }
        
        response = requests.post(
            f"{BACKEND_URL}/appointments",
            json=integrity_appointment_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to create integrity test appointment")
            return False
        
        integrity_appointment_id = response.json()["id"]
        print("✅ Created order and appointment for integrity test")
        
        # Test 2: Update order and verify appointment relationship maintained
        order_update = {
            "homeowner_phone": "+1-902-555-5555",
            "description": "Updated: Comprehensive roof inspection and gutter system repair"
        }
        
        response = requests.put(
            f"{BACKEND_URL}/orders/{integrity_order_id}",
            json=order_update,
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to update integrity test order")
            return False
        
        # Test 3: Update appointment and verify consistency
        appointment_update = {
            "phone_number": "+1-902-555-5555",  # Match updated order
            "notes": "Updated: Comprehensive roof inspection and gutter system repair appointment"
        }
        
        response = requests.put(
            f"{BACKEND_URL}/appointments/{integrity_appointment_id}",
            json=appointment_update,
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to update integrity test appointment")
            return False
        
        # Test 4: Verify both updates are consistent
        response = requests.get(
            f"{BACKEND_URL}/orders/{integrity_order_id}",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to retrieve updated order")
            return False
        
        updated_order = response.json()
        
        response = requests.get(
            f"{BACKEND_URL}/appointments",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to retrieve appointments")
            return False
        
        appointments = response.json()
        updated_appointment = None
        for apt in appointments:
            if apt.get("id") == integrity_appointment_id:
                updated_appointment = apt
                break
        
        if not updated_appointment:
            print("❌ Updated appointment not found")
            return False
        
        # Verify phone numbers match
        if (updated_order.get("homeowner_phone") == "+1-902-555-5555" and
            updated_appointment.get("phone_number") == "+1-902-555-5555"):
            print("✅ Order and appointment updates maintain consistency")
        else:
            print("❌ Data inconsistency detected after updates")
            return False
        
        # Test 5: Delete order and verify related appointments are cleaned up
        response = requests.delete(
            f"{BACKEND_URL}/orders/{integrity_order_id}",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print("❌ Failed to delete integrity test order")
            return False
        
        # Verify appointment was also deleted (based on backend code)
        response = requests.get(
            f"{BACKEND_URL}/appointments",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            appointments = response.json()
            deleted_appointment_exists = any(apt.get("order_id") == integrity_order_id for apt in appointments)
            
            if not deleted_appointment_exists:
                print("✅ Related appointments properly cleaned up on order deletion")
            else:
                print("❌ Related appointments not cleaned up on order deletion")
                return False
        
        print("✅ Data integrity tests passed")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Data integrity test failed: {e}")
        return False

def run_order_appointment_management_tests():
    """Run all order and appointment management tests"""
    print("=" * 80)
    print("🚀 ORDER AND APPOINTMENT MANAGEMENT BACKEND TESTING")
    print("=" * 80)
    
    test_results = []
    
    # Setup
    test_results.append(("Setup Test Accounts", setup_test_accounts()))
    test_results.append(("Create Test Orders", create_test_orders()))
    test_results.append(("Create Test Appointment", create_test_appointment()))
    
    # Core functionality tests
    test_results.append(("Manual Order Update", test_manual_order_update()))
    test_results.append(("Manual Order Deletion", test_manual_order_deletion()))
    test_results.append(("Appointment Update", test_appointment_update()))
    
    # Access control tests
    test_results.append(("Comprehensive Access Control", test_access_control_comprehensive()))
    
    # Integration tests
    test_results.append(("Integration with Existing Workflow", test_integration_with_existing_workflow()))
    test_results.append(("Data Integrity", test_data_integrity()))
    
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
        print("\n🎉 ALL ORDER AND APPOINTMENT MANAGEMENT TESTS PASSED!")
        print("\n✅ Key Findings:")
        print("   • PUT /api/orders/{id} works correctly for manual orders")
        print("   • DELETE /api/orders/{id} works correctly for manual orders")
        print("   • PUT /api/appointments/{id} works correctly for provider appointments")
        print("   • Access control properly implemented for all endpoints")
        print("   • Only providers who created manual orders can edit/delete them")
        print("   • Only providers who created appointments can update them")
        print("   • Integration with existing workflow maintained")
        print("   • Data integrity preserved across operations")
        return True
    else:
        print(f"\n⚠️ {failed} TESTS FAILED!")
        return False

if __name__ == "__main__":
    success = run_order_appointment_management_tests()
    sys.exit(0 if success else 1)