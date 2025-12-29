#!/usr/bin/env python3
"""
Phase 2 & 3 Implementation Testing: Quote Management & Completion/Resolution
Focus: Testing the complete flow from quote submission to issue resolution
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
provider_token = None
homeowner_token = None
property_manager_token = None
tenant_token = None
provider_id = None
homeowner_id = None
property_manager_id = None
tenant_id = None
test_issue_id = None
test_order_id = None
pm_sourced_order_id = None

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

def setup_test_users():
    """Create test users for all roles needed in the flow"""
    print("\n🔍 Setting up Test Users...")
    global provider_token, homeowner_token, property_manager_token, tenant_token
    global provider_id, homeowner_id, property_manager_id, tenant_id
    
    try:
        # Create Property Manager
        pm_data = {
            "email": f"pm_{uuid.uuid4().hex[:8]}@testdoord.com",
            "password": "testpass123",
            "user_type": "property_manager",
            "name": "Test Property Manager",
            "business_name": "Test Property Management Co",
            "phone": "+1-902-555-0100"
        }
        
        response = requests.post(f"{BACKEND_URL}/auth/register", json=pm_data, timeout=30)
        if response.status_code != 200:
            print(f"❌ PM registration failed: {response.status_code}")
            return False
        
        pm_result = response.json()
        property_manager_token = pm_result["access_token"]
        property_manager_id = pm_result["user"]["id"]
        
        # Generate PM code
        pm_headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.post(f"{BACKEND_URL}/pm/generate-code", headers=pm_headers, timeout=30)
        if response.status_code != 200:
            print(f"❌ PM code generation failed: {response.status_code}")
            return False
        
        pm_code = response.json()["code"]
        print(f"✅ Property Manager created with code: {pm_code}")
        
        # Create Tenant
        tenant_data = {
            "email": f"tenant_{uuid.uuid4().hex[:8]}@testdoord.com",
            "password": "testpass123",
            "user_type": "homeowner",
            "name": "Test Tenant",
            "phone": "+1-902-555-0200",
            "address": "123 Tenant St, Halifax, NS"
        }
        
        response = requests.post(f"{BACKEND_URL}/auth/register", json=tenant_data, timeout=30)
        if response.status_code != 200:
            print(f"❌ Tenant registration failed: {response.status_code}")
            return False
        
        tenant_result = response.json()
        tenant_token = tenant_result["access_token"]
        tenant_id = tenant_result["user"]["id"]
        
        # Link tenant to PM
        tenant_headers = {"Authorization": f"Bearer {tenant_token}"}
        response = requests.post(f"{BACKEND_URL}/tenant/join-pm", 
                               json={"code": pm_code}, 
                               headers=tenant_headers, timeout=30)
        if response.status_code != 200:
            print(f"❌ Tenant-PM linking failed: {response.status_code}")
            return False
        
        print("✅ Tenant created and linked to PM")
        
        # Create Provider
        provider_data = {
            "email": f"provider_{uuid.uuid4().hex[:8]}@testdoord.com",
            "password": "testpass123",
            "user_type": "provider",
            "name": "Test Provider",
            "business_name": "Test Home Services",
            "services": ["Plumbing", "Electrical", "HVAC"],
            "phone": "+1-902-555-0300"
        }
        
        response = requests.post(f"{BACKEND_URL}/auth/register", json=provider_data, timeout=30)
        if response.status_code != 200:
            print(f"❌ Provider registration failed: {response.status_code}")
            return False
        
        provider_result = response.json()
        provider_token = provider_result["access_token"]
        provider_id = provider_result["user"]["id"]
        print("✅ Provider created")
        
        # Create regular Homeowner for comparison
        homeowner_data = {
            "email": f"homeowner_{uuid.uuid4().hex[:8]}@testdoord.com",
            "password": "testpass123",
            "user_type": "homeowner",
            "name": "Test Homeowner",
            "phone": "+1-902-555-0400",
            "address": "456 Homeowner Ave, Halifax, NS"
        }
        
        response = requests.post(f"{BACKEND_URL}/auth/register", json=homeowner_data, timeout=30)
        if response.status_code != 200:
            print(f"❌ Homeowner registration failed: {response.status_code}")
            return False
        
        homeowner_result = response.json()
        homeowner_token = homeowner_result["access_token"]
        homeowner_id = homeowner_result["user"]["id"]
        print("✅ Homeowner created")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ User setup failed: {e}")
        return False

def test_phase1_tenant_reports_issue():
    """Phase 1: Tenant reports issue via AI chat"""
    print("\n🔍 Phase 1: Testing Tenant Issue Reporting...")
    global test_issue_id
    
    if not tenant_token or not property_manager_id:
        print("❌ Missing tenant token or PM ID")
        return False
    
    try:
        issue_data = {
            "tenant_name": "Test Tenant",
            "tenant_email": "tenant@testdoord.com",
            "tenant_phone": "+1-902-555-0200",
            "property_manager_id": property_manager_id,
            "unit_number": "Apt 101",
            "issue_category": "Plumbing",
            "urgency_level": "high",
            "description": "Kitchen sink is completely blocked and water is backing up into the dishwasher. This started yesterday evening and is getting worse.",
            "ai_summary": "Emergency plumbing issue: Kitchen sink blockage causing water backup into dishwasher. High urgency repair needed.",
            "best_time": "Morning (9 AM - 12 PM)",
            "permission_to_enter": "Yes, with 24-hour notice"
        }
        
        headers = {"Authorization": f"Bearer {tenant_token}"}
        response = requests.post(f"{BACKEND_URL}/issues", json=issue_data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            test_issue_id = result["issue_id"]
            print("✅ Tenant issue reported successfully")
            return True
        else:
            print(f"❌ Issue reporting failed: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Issue reporting failed: {e}")
        return False

def test_pm_receives_issue():
    """PM receives issue in Orders → Issues tab"""
    print("\n🔍 Testing PM Receives Issue...")
    
    if not property_manager_token or not test_issue_id:
        print("❌ Missing PM token or issue ID")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.get(f"{BACKEND_URL}/issues", headers=headers, timeout=30)
        
        if response.status_code == 200:
            issues = response.json()
            
            # Find our test issue
            found_issue = None
            for issue in issues:
                if issue["id"] == test_issue_id:
                    found_issue = issue
                    break
            
            if found_issue:
                print("✅ PM can see tenant's issue")
                print(f"   Issue: {found_issue['issue_category']} - {found_issue['urgency_level']} urgency")
                return True
            else:
                print("❌ PM cannot see the reported issue")
                return False
        else:
            print(f"❌ Failed to get PM issues: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ PM issue retrieval failed: {e}")
        return False

def test_pm_adds_notes_to_issue():
    """PM adds notes to issue"""
    print("\n🔍 Testing PM Adds Notes to Issue...")
    
    if not property_manager_token or not test_issue_id:
        print("❌ Missing PM token or issue ID")
        return False
    
    try:
        notes_data = {
            "notes": "Contacted tenant - confirmed kitchen sink blockage. Scheduling emergency plumbing service. Tenant available for entry with 24hr notice."
        }
        
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.put(f"{BACKEND_URL}/pm/issues/{test_issue_id}/notes", 
                              json=notes_data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            print("✅ PM notes added successfully")
            return True
        else:
            print(f"❌ Failed to add PM notes: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ PM notes addition failed: {e}")
        return False

def test_pm_sends_issue_to_provider():
    """PM sends issue to service provider"""
    print("\n🔍 Testing PM Sends Issue to Provider...")
    global pm_sourced_order_id
    
    if not property_manager_token or not test_issue_id or not provider_id:
        print("❌ Missing required data for PM-to-provider flow")
        return False
    
    try:
        send_data = {
            "provider_id": provider_id,
            "property_address": "123 Tenant St, Apt 101, Halifax, NS"
        }
        
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.post(f"{BACKEND_URL}/pm/issues/{test_issue_id}/send-to-provider", 
                               json=send_data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            pm_sourced_order_id = result["order_id"]
            print("✅ Issue sent to provider successfully")
            print(f"   Order ID: {pm_sourced_order_id}")
            print(f"   Provider: {result['provider_name']}")
            return True
        else:
            print(f"❌ Failed to send issue to provider: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ PM-to-provider sending failed: {e}")
        return False

def test_issue_status_updates():
    """Verify issue status updates correctly"""
    print("\n🔍 Testing Issue Status Updates...")
    
    if not property_manager_token or not test_issue_id:
        print("❌ Missing PM token or issue ID")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.get(f"{BACKEND_URL}/issues/{test_issue_id}", headers=headers, timeout=30)
        
        if response.status_code == 200:
            issue = response.json()
            
            # Verify issue status and assignments
            if issue["status"] == "sent_to_provider":
                print("✅ Issue status updated to 'sent_to_provider'")
            else:
                print(f"❌ Expected status 'sent_to_provider', got '{issue['status']}'")
                return False
            
            if issue.get("assigned_provider_id") == provider_id:
                print("✅ Provider assigned to issue")
            else:
                print("❌ Provider not properly assigned to issue")
                return False
            
            if issue.get("linked_order_id") == pm_sourced_order_id:
                print("✅ Order linked to issue")
            else:
                print("❌ Order not properly linked to issue")
                return False
            
            return True
        else:
            print(f"❌ Failed to get issue details: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Issue status check failed: {e}")
        return False

def test_provider_receives_pm_sourced_order():
    """Provider receives PM-sourced order with 'From Property Manager' badge data"""
    print("\n🔍 Testing Provider Receives PM-Sourced Order...")
    
    if not provider_token or not pm_sourced_order_id:
        print("❌ Missing provider token or PM-sourced order ID")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.get(f"{BACKEND_URL}/orders", headers=headers, timeout=30)
        
        if response.status_code == 200:
            orders = response.json()
            
            # Find our PM-sourced order
            found_order = None
            for order in orders:
                if order["id"] == pm_sourced_order_id:
                    found_order = order
                    break
            
            if found_order:
                print("✅ Provider can see PM-sourced order")
                
                # Verify PM-sourced order characteristics
                if found_order.get("source_issue_id") == test_issue_id:
                    print("✅ Order has source_issue_id (From Property Manager badge data)")
                else:
                    print("❌ Order missing source_issue_id")
                    return False
                
                if found_order.get("property_manager_id") == property_manager_id:
                    print("✅ Order has property_manager_id")
                else:
                    print("❌ Order missing property_manager_id")
                    return False
                
                if found_order.get("pm_approved") == 1:
                    print("✅ Order is pre-approved by PM")
                else:
                    print("❌ Order not pre-approved by PM")
                    return False
                
                print(f"   Service: {found_order.get('service_type')}")
                print(f"   Status: {found_order.get('status')}")
                return True
            else:
                print("❌ Provider cannot see PM-sourced order")
                return False
        else:
            print(f"❌ Failed to get provider orders: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Provider order retrieval failed: {e}")
        return False

def test_phase2_provider_submits_quote():
    """Phase 2: Provider submits quote on PM-sourced order"""
    print("\n🔍 Phase 2: Testing Provider Submits Quote...")
    
    if not provider_token or not pm_sourced_order_id:
        print("❌ Missing provider token or order ID")
        return False
    
    try:
        # Provider submits quote using PUT /api/orders/{order_id}
        quote_data = {
            "quotation_amount": 275.00,
            "quotation_details": "Emergency plumbing service: Clear kitchen sink blockage, inspect dishwasher connection, test drainage system. Includes parts and labor.",
            "status": "quoted"
        }
        
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.put(f"{BACKEND_URL}/orders/{pm_sourced_order_id}", 
                              json=quote_data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            print("✅ Provider quote submitted successfully")
            print(f"   Quote Amount: ${quote_data['quotation_amount']}")
            return True
        else:
            print(f"❌ Quote submission failed: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Quote submission failed: {e}")
        return False

def test_pm_reviews_quotes():
    """PM reviews quotes via GET /api/pm/quotes"""
    print("\n🔍 Testing PM Reviews Quotes...")
    
    if not property_manager_token:
        print("❌ Missing PM token")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.get(f"{BACKEND_URL}/pm/quotes", headers=headers, timeout=30)
        
        if response.status_code == 200:
            quotes = response.json()
            
            # Find our quoted order
            found_quote = None
            for quote in quotes:
                if quote["id"] == pm_sourced_order_id:
                    found_quote = quote
                    break
            
            if found_quote:
                print("✅ PM can see provider's quote")
                print(f"   Quote Amount: ${found_quote.get('quotation_amount')}")
                print(f"   Quote Details: {found_quote.get('quotation_details')}")
                print(f"   Status: {found_quote.get('status')}")
                return True
            else:
                print("❌ PM cannot see the provider's quote")
                return False
        else:
            print(f"❌ Failed to get PM quotes: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ PM quote review failed: {e}")
        return False

def test_pm_approves_quote():
    """PM approves quote via PUT /api/pm/orders/{order_id}/approve-quote"""
    print("\n🔍 Testing PM Approves Quote...")
    
    if not property_manager_token or not pm_sourced_order_id:
        print("❌ Missing PM token or order ID")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.put(f"{BACKEND_URL}/pm/orders/{pm_sourced_order_id}/approve-quote", 
                              headers=headers, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ PM approved quote successfully")
            print(f"   New Status: {result.get('new_status')}")
            
            # Verify order status changed to 'confirmed'
            response = requests.get(f"{BACKEND_URL}/orders", headers=headers, timeout=30)
            if response.status_code == 200:
                orders = response.json()
                for order in orders:
                    if order["id"] == pm_sourced_order_id:
                        if order["status"] == "confirmed":
                            print("✅ Order status updated to 'confirmed'")
                        else:
                            print(f"❌ Expected 'confirmed' status, got '{order['status']}'")
                            return False
                        break
            
            # Verify issue status changed to 'in_progress'
            response = requests.get(f"{BACKEND_URL}/issues/{test_issue_id}", headers=headers, timeout=30)
            if response.status_code == 200:
                issue = response.json()
                if issue["status"] == "in_progress":
                    print("✅ Issue status updated to 'in_progress'")
                else:
                    print(f"❌ Expected 'in_progress' issue status, got '{issue['status']}'")
                    return False
            
            return True
        else:
            print(f"❌ Quote approval failed: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Quote approval failed: {e}")
        return False

def test_pm_rejects_quote():
    """Test PM rejecting a quote via PUT /api/pm/orders/{order_id}/reject-quote"""
    print("\n🔍 Testing PM Rejects Quote...")
    
    # First, create another order to test rejection
    if not property_manager_token or not provider_id:
        print("❌ Missing required data for quote rejection test")
        return False
    
    try:
        # Create another issue for rejection test
        issue_data = {
            "tenant_name": "Test Tenant",
            "tenant_email": "tenant@testdoord.com", 
            "tenant_phone": "+1-902-555-0200",
            "property_manager_id": property_manager_id,
            "unit_number": "Apt 102",
            "issue_category": "Electrical",
            "urgency_level": "medium",
            "description": "Light switch not working in bedroom",
            "ai_summary": "Electrical issue: Non-functioning light switch needs repair",
            "best_time": "Afternoon (1 PM - 5 PM)",
            "permission_to_enter": "Yes"
        }
        
        headers = {"Authorization": f"Bearer {tenant_token}"}
        response = requests.post(f"{BACKEND_URL}/issues", json=issue_data, headers=headers, timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Failed to create test issue for rejection: {response.status_code}")
            return False
        
        test_issue_2_id = response.json()["issue_id"]
        
        # Send to provider
        pm_headers = {"Authorization": f"Bearer {property_manager_token}"}
        send_data = {"provider_id": provider_id, "property_address": "123 Tenant St, Apt 102"}
        response = requests.post(f"{BACKEND_URL}/pm/issues/{test_issue_2_id}/send-to-provider", 
                               json=send_data, headers=pm_headers, timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Failed to send test issue to provider: {response.status_code}")
            return False
        
        test_order_2_id = response.json()["order_id"]
        
        # Provider submits quote
        quote_data = {
            "quotation_amount": 150.00,
            "quotation_details": "Replace faulty light switch and test electrical connection",
            "status": "quoted"
        }
        
        provider_headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.put(f"{BACKEND_URL}/orders/{test_order_2_id}", 
                              json=quote_data, headers=provider_headers, timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Failed to submit test quote: {response.status_code}")
            return False
        
        # Now test PM rejection
        rejection_data = {
            "reason": "Quote too high for simple switch replacement. Please provide revised quote."
        }
        
        response = requests.put(f"{BACKEND_URL}/pm/orders/{test_order_2_id}/reject-quote", 
                              json=rejection_data, headers=pm_headers, timeout=30)
        
        if response.status_code == 200:
            print("✅ PM rejected quote successfully")
            
            # Verify order status changed back to 'pending_quotation'
            response = requests.get(f"{BACKEND_URL}/orders", headers=provider_headers, timeout=30)
            if response.status_code == 200:
                orders = response.json()
                for order in orders:
                    if order["id"] == test_order_2_id:
                        if order["status"] == "pending_quotation":
                            print("✅ Order status reset to 'pending_quotation'")
                        else:
                            print(f"❌ Expected 'pending_quotation' status, got '{order['status']}'")
                            return False
                        break
            
            # Verify rejection note added to issue
            response = requests.get(f"{BACKEND_URL}/issues/{test_issue_2_id}", headers=pm_headers, timeout=30)
            if response.status_code == 200:
                issue = response.json()
                if rejection_data["reason"] in issue.get("pm_notes", ""):
                    print("✅ Rejection note added to issue")
                else:
                    print("❌ Rejection note not found in issue")
                    return False
            
            return True
        else:
            print(f"❌ Quote rejection failed: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Quote rejection test failed: {e}")
        return False

def test_phase3_provider_completes_service():
    """Phase 3: Provider marks order complete via PUT /api/orders/{order_id}/complete"""
    print("\n🔍 Phase 3: Testing Provider Completes Service...")
    
    if not provider_token or not pm_sourced_order_id:
        print("❌ Missing provider token or order ID")
        return False
    
    try:
        # Provider completes the service using the specific completion endpoint
        completion_data = {
            "completion_notes": "Kitchen sink blockage cleared successfully. Dishwasher connection inspected and working properly. Drainage system tested - all functioning normally."
        }
        
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.put(f"{BACKEND_URL}/orders/{pm_sourced_order_id}/complete", 
                              json=completion_data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            print("✅ Provider marked service as completed")
            
            # Verify order status is 'completed'
            response = requests.get(f"{BACKEND_URL}/orders", headers=headers, timeout=30)
            if response.status_code == 200:
                orders = response.json()
                for order in orders:
                    if order["id"] == pm_sourced_order_id:
                        if order["status"] == "completed":
                            print("✅ Order status updated to 'completed'")
                        else:
                            print(f"❌ Expected 'completed' status, got '{order['status']}'")
                            return False
                        break
            
            return True
        else:
            print(f"❌ Service completion failed: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Service completion failed: {e}")
        return False

def test_pm_resolves_issue():
    """PM marks issue as resolved via PUT /api/pm/issues/{issue_id}/resolve"""
    print("\n🔍 Testing PM Resolves Issue...")
    
    if not property_manager_token or not test_issue_id:
        print("❌ Missing PM token or issue ID")
        return False
    
    try:
        resolution_data = {
            "status": "resolved",
            "resolution_notes": "Plumbing issue resolved successfully. Kitchen sink blockage cleared by Test Home Services. Tenant confirmed everything is working properly. No further action needed."
        }
        
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.put(f"{BACKEND_URL}/pm/issues/{test_issue_id}/status", 
                              json=resolution_data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            print("✅ PM marked issue as resolved")
            
            # Verify issue status and resolution details
            response = requests.get(f"{BACKEND_URL}/issues/{test_issue_id}", headers=headers, timeout=30)
            if response.status_code == 200:
                issue = response.json()
                
                if issue["status"] == "resolved":
                    print("✅ Issue status updated to 'resolved'")
                else:
                    print(f"❌ Expected 'resolved' status, got '{issue['status']}'")
                    return False
                
                if issue.get("resolved_at"):
                    print("✅ Resolved timestamp set")
                else:
                    print("❌ Resolved timestamp not set")
                    return False
                
                if resolution_data["resolution_notes"] in issue.get("resolution_notes", ""):
                    print("✅ Resolution notes saved")
                else:
                    print("❌ Resolution notes not saved")
                    return False
            
            return True
        else:
            print(f"❌ Issue resolution failed: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Issue resolution failed: {e}")
        return False

def test_tenant_views_resolution():
    """Tenant checks 'My Issues' tab and sees resolved status"""
    print("\n🔍 Testing Tenant Views Resolution...")
    
    if not tenant_token or not test_issue_id:
        print("❌ Missing tenant token or issue ID")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {tenant_token}"}
        response = requests.get(f"{BACKEND_URL}/issues", headers=headers, timeout=30)
        
        if response.status_code == 200:
            issues = response.json()
            
            # Find our resolved issue
            found_issue = None
            for issue in issues:
                if issue["id"] == test_issue_id:
                    found_issue = issue
                    break
            
            if found_issue:
                print("✅ Tenant can see their issue")
                
                if found_issue["status"] == "resolved":
                    print("✅ Issue shows 'resolved' status")
                else:
                    print(f"❌ Expected 'resolved' status, got '{found_issue['status']}'")
                    return False
                
                if found_issue.get("resolution_notes"):
                    print("✅ Resolution notes visible to tenant")
                    print(f"   Notes: {found_issue['resolution_notes'][:100]}...")
                else:
                    print("❌ Resolution notes not visible to tenant")
                    return False
                
                if found_issue.get("resolved_at"):
                    print("✅ Resolution timestamp visible")
                else:
                    print("❌ Resolution timestamp not visible")
                    return False
                
                return True
            else:
                print("❌ Tenant cannot see their issue")
                return False
        else:
            print(f"❌ Failed to get tenant issues: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Tenant issue viewing failed: {e}")
        return False

def test_database_verification():
    """Verify database state changes throughout the flow"""
    print("\n🔍 Testing Database State Verification...")
    
    if not property_manager_token or not test_issue_id or not pm_sourced_order_id:
        print("❌ Missing required data for database verification")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        
        # Verify final order state
        response = requests.get(f"{BACKEND_URL}/orders", headers=headers, timeout=30)
        if response.status_code == 200:
            orders = response.json()
            order_found = False
            for order in orders:
                if order["id"] == pm_sourced_order_id:
                    order_found = True
                    
                    # Check all expected fields
                    expected_fields = {
                        "status": "completed",
                        "quotation_amount": 275.00,
                        "source_issue_id": test_issue_id,
                        "property_manager_id": property_manager_id,
                        "pm_approved": 1
                    }
                    
                    for field, expected_value in expected_fields.items():
                        if order.get(field) == expected_value:
                            print(f"✅ Order {field}: {order.get(field)}")
                        else:
                            print(f"❌ Order {field}: expected {expected_value}, got {order.get(field)}")
                            return False
                    break
            
            if not order_found:
                print("❌ Order not found in database")
                return False
        
        # Verify final issue state
        response = requests.get(f"{BACKEND_URL}/issues/{test_issue_id}", headers=headers, timeout=30)
        if response.status_code == 200:
            issue = response.json()
            
            expected_issue_fields = {
                "status": "resolved",
                "assigned_provider_id": provider_id,
                "linked_order_id": pm_sourced_order_id
            }
            
            for field, expected_value in expected_issue_fields.items():
                if issue.get(field) == expected_value:
                    print(f"✅ Issue {field}: {issue.get(field)}")
                else:
                    print(f"❌ Issue {field}: expected {expected_value}, got {issue.get(field)}")
                    return False
            
            # Check timestamps
            if issue.get("resolved_at"):
                print("✅ Issue resolved_at timestamp set")
            else:
                print("❌ Issue resolved_at timestamp missing")
                return False
            
            if issue.get("resolution_notes"):
                print("✅ Issue resolution_notes saved")
            else:
                print("❌ Issue resolution_notes missing")
                return False
        
        print("✅ Database state verification completed successfully")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Database verification failed: {e}")
        return False

def run_phase2_3_tests():
    """Run all Phase 2 & 3 tests"""
    print("=" * 80)
    print("🚀 PHASE 2 & 3 QUOTE MANAGEMENT & COMPLETION/RESOLUTION TESTING")
    print("=" * 80)
    
    test_results = []
    
    # Setup
    test_results.append(("Backend Health Check", test_backend_health()))
    test_results.append(("Setup Test Users", setup_test_users()))
    
    # Phase 1 Prerequisites
    print("\n" + "=" * 60)
    print("📋 PHASE 1 PREREQUISITES")
    print("=" * 60)
    test_results.append(("Tenant Reports Issue", test_phase1_tenant_reports_issue()))
    test_results.append(("PM Receives Issue", test_pm_receives_issue()))
    test_results.append(("PM Adds Notes", test_pm_adds_notes_to_issue()))
    test_results.append(("PM Sends to Provider", test_pm_sends_issue_to_provider()))
    test_results.append(("Issue Status Updates", test_issue_status_updates()))
    test_results.append(("Provider Receives PM Order", test_provider_receives_pm_sourced_order()))
    
    # Phase 2: Quote Management
    print("\n" + "=" * 60)
    print("💰 PHASE 2: QUOTE MANAGEMENT")
    print("=" * 60)
    test_results.append(("Provider Submits Quote", test_phase2_provider_submits_quote()))
    test_results.append(("PM Reviews Quotes", test_pm_reviews_quotes()))
    test_results.append(("PM Approves Quote", test_pm_approves_quote()))
    test_results.append(("PM Rejects Quote", test_pm_rejects_quote()))
    
    # Phase 3: Completion & Resolution
    print("\n" + "=" * 60)
    print("✅ PHASE 3: COMPLETION & RESOLUTION")
    print("=" * 60)
    test_results.append(("Provider Completes Service", test_phase3_provider_completes_service()))
    test_results.append(("PM Resolves Issue", test_pm_resolves_issue()))
    test_results.append(("Tenant Views Resolution", test_tenant_views_resolution()))
    
    # Database Verification
    print("\n" + "=" * 60)
    print("🗄️ DATABASE VERIFICATION")
    print("=" * 60)
    test_results.append(("Database State Verification", test_database_verification()))
    
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
        print("\n🎉 ALL PHASE 2 & 3 TESTS PASSED!")
        print("✅ Quote Management & Completion/Resolution flow is fully functional!")
        return True
    else:
        print(f"\n⚠️ {failed} TESTS FAILED!")
        print("❌ Some issues found in Quote Management & Completion/Resolution flow")
        return False

if __name__ == "__main__":
    success = run_phase2_3_tests()
    sys.exit(0 if success else 1)