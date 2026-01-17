"""
Test Suite for Quote Management Workflow (P2 Feature)
Tests the complete flow: Issue -> PM sends to Provider -> Provider quotes -> PM approves -> PM schedules -> Calendar shows event

Endpoints tested:
- POST /api/provider/orders/{id}/submit-quote - Provider submits quote
- GET /api/pm/quotes - PM gets pending quotes
- PUT /api/pm/orders/{id}/approve-quote - PM approves quote
- PUT /api/pm/orders/{id}/reject-quote - PM rejects quote
- PUT /api/pm/orders/{id}/schedule - PM schedules service
- GET /api/pm/calendar - PM calendar shows scheduled events
- GET /api/provider/orders - Provider sees assigned orders
"""

import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data
TEST_PM_EMAIL = f"test_pm_{uuid.uuid4().hex[:8]}@test.com"
TEST_PM_PASSWORD = "TestPass123!"
TEST_PROVIDER_EMAIL = f"test_provider_{uuid.uuid4().hex[:8]}@test.com"
TEST_PROVIDER_PASSWORD = "TestPass123!"
TEST_TENANT_EMAIL = f"test_tenant_{uuid.uuid4().hex[:8]}@test.com"
TEST_TENANT_PASSWORD = "TestPass123!"


class TestQuoteManagementWorkflow:
    """Test the complete Quote Management workflow"""
    
    pm_token = None
    pm_id = None
    pm_code = None
    provider_token = None
    provider_id = None
    tenant_token = None
    tenant_id = None
    issue_id = None
    order_id = None
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        pass
    
    def test_01_health_check(self):
        """Verify API is running"""
        response = requests.get(f"{BASE_URL}/api/ping")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("✓ API health check passed")
    
    def test_02_register_property_manager(self):
        """Register a Property Manager account"""
        pm_code = f"PM{uuid.uuid4().hex[:4].upper()}"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_PM_EMAIL,
            "password": TEST_PM_PASSWORD,
            "user_type": "property_manager",
            "name": "Test Property Manager",
            "pm_code": pm_code
        })
        
        assert response.status_code == 200, f"PM registration failed: {response.text}"
        data = response.json()
        
        TestQuoteManagementWorkflow.pm_token = data.get("access_token")
        TestQuoteManagementWorkflow.pm_id = data.get("user", {}).get("id")
        TestQuoteManagementWorkflow.pm_code = pm_code
        
        assert TestQuoteManagementWorkflow.pm_token is not None
        assert TestQuoteManagementWorkflow.pm_id is not None
        print(f"✓ PM registered with code: {pm_code}")
    
    def test_03_register_provider(self):
        """Register a Service Provider account"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_PROVIDER_EMAIL,
            "password": TEST_PROVIDER_PASSWORD,
            "user_type": "provider",
            "name": "Test Service Provider",
            "business_name": "Test Plumbing Services",
            "services": ["Plumbing", "HVAC"]
        })
        
        assert response.status_code == 200, f"Provider registration failed: {response.text}"
        data = response.json()
        
        TestQuoteManagementWorkflow.provider_token = data.get("access_token")
        TestQuoteManagementWorkflow.provider_id = data.get("user", {}).get("id")
        
        assert TestQuoteManagementWorkflow.provider_token is not None
        assert TestQuoteManagementWorkflow.provider_id is not None
        print("✓ Provider registered successfully")
    
    def test_04_register_tenant_with_pm_code(self):
        """Register a Tenant with PM code"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_TENANT_EMAIL,
            "password": TEST_TENANT_PASSWORD,
            "user_type": "homeowner",
            "name": "Test Tenant",
            "pm_code": TestQuoteManagementWorkflow.pm_code,
            "address": "123 Test Street, Unit 101"
        })
        
        assert response.status_code == 200, f"Tenant registration failed: {response.text}"
        data = response.json()
        
        TestQuoteManagementWorkflow.tenant_token = data.get("access_token")
        TestQuoteManagementWorkflow.tenant_id = data.get("user", {}).get("id")
        
        assert TestQuoteManagementWorkflow.tenant_token is not None
        assert TestQuoteManagementWorkflow.tenant_id is not None
        print("✓ Tenant registered with PM code")
    
    def test_05_tenant_creates_issue(self):
        """Tenant creates an issue report"""
        headers = {"Authorization": f"Bearer {TestQuoteManagementWorkflow.tenant_token}"}
        
        response = requests.post(f"{BASE_URL}/api/issues", json={
            "property_manager_id": TestQuoteManagementWorkflow.pm_id,
            "unit_number": "101",
            "issue_category": "Plumbing",
            "urgency_level": "urgent",
            "description": "Leaking faucet in kitchen - water dripping constantly",
            "best_time": "Morning",
            "permission_to_enter": "Yes"
        }, headers=headers)
        
        assert response.status_code == 200, f"Issue creation failed: {response.text}"
        data = response.json()
        
        TestQuoteManagementWorkflow.issue_id = data.get("issue_id")
        assert TestQuoteManagementWorkflow.issue_id is not None
        print(f"✓ Issue created: {TestQuoteManagementWorkflow.issue_id}")
    
    def test_06_pm_sees_issue(self):
        """PM can see the tenant's issue"""
        headers = {"Authorization": f"Bearer {TestQuoteManagementWorkflow.pm_token}"}
        
        response = requests.get(f"{BASE_URL}/api/issues", headers=headers)
        assert response.status_code == 200
        
        issues = response.json()
        assert len(issues) > 0, "PM should see at least one issue"
        
        # Find our test issue
        test_issue = next((i for i in issues if i.get("id") == TestQuoteManagementWorkflow.issue_id), None)
        assert test_issue is not None, "PM should see the test issue"
        assert test_issue.get("issue_category") == "Plumbing"
        print("✓ PM can see tenant's issue")
    
    def test_07_pm_sends_issue_to_provider(self):
        """PM sends issue to provider (creates order)"""
        headers = {"Authorization": f"Bearer {TestQuoteManagementWorkflow.pm_token}"}
        
        response = requests.post(f"{BASE_URL}/api/pm/issues/{TestQuoteManagementWorkflow.issue_id}/send-to-provider", json={
            "provider_id": TestQuoteManagementWorkflow.provider_id,
            "notes": "Please provide a quote for fixing the leaking faucet"
        }, headers=headers)
        
        assert response.status_code == 200, f"Send to provider failed: {response.text}"
        data = response.json()
        
        TestQuoteManagementWorkflow.order_id = data.get("order_id")
        assert TestQuoteManagementWorkflow.order_id is not None
        print(f"✓ Issue sent to provider, order created: {TestQuoteManagementWorkflow.order_id}")
    
    def test_08_provider_sees_assigned_order(self):
        """Provider can see the assigned order via /api/provider/orders"""
        headers = {"Authorization": f"Bearer {TestQuoteManagementWorkflow.provider_token}"}
        
        response = requests.get(f"{BASE_URL}/api/provider/orders", headers=headers)
        assert response.status_code == 200, f"Get provider orders failed: {response.text}"
        
        orders = response.json()
        assert isinstance(orders, list), "Response should be a list"
        
        # Find our test order
        test_order = next((o for o in orders if o.get("id") == TestQuoteManagementWorkflow.order_id), None)
        assert test_order is not None, "Provider should see the assigned order"
        assert test_order.get("status") == "pending_quotation"
        assert test_order.get("source_issue_id") == TestQuoteManagementWorkflow.issue_id
        print("✓ Provider can see assigned order")
    
    def test_09_provider_submits_quote(self):
        """Provider submits a quote via /api/provider/orders/{id}/submit-quote"""
        headers = {"Authorization": f"Bearer {TestQuoteManagementWorkflow.provider_token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/provider/orders/{TestQuoteManagementWorkflow.order_id}/submit-quote",
            json={
                "quotation_amount": 250.00,
                "quotation_details": "Replace faucet cartridge and check for pipe damage. Parts and labor included.",
                "estimated_duration": "2 hours",
                "quotation_valid_until": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
            },
            headers=headers
        )
        
        assert response.status_code == 200, f"Submit quote failed: {response.text}"
        data = response.json()
        
        assert data.get("status") == "quoted"
        assert data.get("quotation_amount") == 250.00
        print("✓ Provider submitted quote: $250.00")
    
    def test_10_pm_sees_pending_quote(self):
        """PM can see the pending quote via /api/pm/quotes"""
        headers = {"Authorization": f"Bearer {TestQuoteManagementWorkflow.pm_token}"}
        
        response = requests.get(f"{BASE_URL}/api/pm/quotes", headers=headers)
        assert response.status_code == 200, f"Get PM quotes failed: {response.text}"
        
        quotes = response.json()
        assert isinstance(quotes, list), "Response should be a list"
        
        # Find our test quote
        test_quote = next((q for q in quotes if q.get("id") == TestQuoteManagementWorkflow.order_id), None)
        assert test_quote is not None, "PM should see the pending quote"
        assert test_quote.get("status") == "quoted"
        assert test_quote.get("quotation_amount") == 250.00
        assert test_quote.get("quotation_details") is not None
        print("✓ PM can see pending quote")
    
    def test_11_pm_approves_quote(self):
        """PM approves the quote via /api/pm/orders/{id}/approve-quote"""
        headers = {"Authorization": f"Bearer {TestQuoteManagementWorkflow.pm_token}"}
        
        response = requests.put(
            f"{BASE_URL}/api/pm/orders/{TestQuoteManagementWorkflow.order_id}/approve-quote",
            headers=headers
        )
        
        assert response.status_code == 200, f"Approve quote failed: {response.text}"
        data = response.json()
        
        assert data.get("new_status") == "confirmed"
        print("✓ PM approved quote")
    
    def test_12_pm_schedules_service(self):
        """PM schedules the service via /api/pm/orders/{id}/schedule"""
        headers = {"Authorization": f"Bearer {TestQuoteManagementWorkflow.pm_token}"}
        
        # Schedule for tomorrow at 10 AM
        scheduled_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        response = requests.put(
            f"{BASE_URL}/api/pm/orders/{TestQuoteManagementWorkflow.order_id}/schedule",
            json={
                "scheduled_date": scheduled_date,
                "scheduled_time": "10:00"
            },
            headers=headers
        )
        
        assert response.status_code == 200, f"Schedule service failed: {response.text}"
        data = response.json()
        
        assert data.get("scheduled_date") == scheduled_date
        assert data.get("scheduled_time") == "10:00"
        assert data.get("appointment_id") is not None
        print(f"✓ Service scheduled for {scheduled_date} at 10:00")
    
    def test_13_pm_calendar_shows_event(self):
        """PM calendar shows the scheduled event via /api/pm/calendar"""
        headers = {"Authorization": f"Bearer {TestQuoteManagementWorkflow.pm_token}"}
        
        response = requests.get(f"{BASE_URL}/api/pm/calendar", headers=headers)
        assert response.status_code == 200, f"Get PM calendar failed: {response.text}"
        
        events = response.json()
        assert isinstance(events, list), "Response should be a list"
        
        # Find our scheduled event
        test_event = next((e for e in events if e.get("id") == TestQuoteManagementWorkflow.order_id), None)
        assert test_event is not None, "Calendar should show the scheduled event"
        assert test_event.get("status") == "scheduled"
        assert test_event.get("quotation_amount") == 250.00
        assert "Plumbing" in test_event.get("title", "")
        print("✓ PM calendar shows scheduled event")


class TestQuoteRejectionFlow:
    """Test the quote rejection flow"""
    
    pm_token = None
    pm_id = None
    pm_code = None
    provider_token = None
    provider_id = None
    order_id = None
    
    def test_01_setup_accounts(self):
        """Setup PM and Provider accounts"""
        # Register PM
        pm_code = f"PM{uuid.uuid4().hex[:4].upper()}"
        pm_email = f"test_pm_reject_{uuid.uuid4().hex[:8]}@test.com"
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": pm_email,
            "password": "TestPass123!",
            "user_type": "property_manager",
            "name": "Test PM Reject",
            "pm_code": pm_code
        })
        assert response.status_code == 200
        data = response.json()
        TestQuoteRejectionFlow.pm_token = data.get("access_token")
        TestQuoteRejectionFlow.pm_id = data.get("user", {}).get("id")
        TestQuoteRejectionFlow.pm_code = pm_code
        
        # Register Provider
        provider_email = f"test_provider_reject_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": provider_email,
            "password": "TestPass123!",
            "user_type": "provider",
            "name": "Test Provider Reject",
            "services": ["Electrical"]
        })
        assert response.status_code == 200
        data = response.json()
        TestQuoteRejectionFlow.provider_token = data.get("access_token")
        TestQuoteRejectionFlow.provider_id = data.get("user", {}).get("id")
        
        print("✓ Setup accounts for rejection test")
    
    def test_02_create_order_for_rejection(self):
        """Create an issue and send to provider"""
        # Register tenant
        tenant_email = f"test_tenant_reject_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": tenant_email,
            "password": "TestPass123!",
            "user_type": "homeowner",
            "name": "Test Tenant Reject",
            "pm_code": TestQuoteRejectionFlow.pm_code
        })
        assert response.status_code == 200
        tenant_token = response.json().get("access_token")
        
        # Create issue
        headers = {"Authorization": f"Bearer {tenant_token}"}
        response = requests.post(f"{BASE_URL}/api/issues", json={
            "property_manager_id": TestQuoteRejectionFlow.pm_id,
            "unit_number": "202",
            "issue_category": "Electrical",
            "urgency_level": "normal",
            "description": "Light switch not working"
        }, headers=headers)
        assert response.status_code == 200
        issue_id = response.json().get("issue_id")
        
        # PM sends to provider
        headers = {"Authorization": f"Bearer {TestQuoteRejectionFlow.pm_token}"}
        response = requests.post(f"{BASE_URL}/api/pm/issues/{issue_id}/send-to-provider", json={
            "provider_id": TestQuoteRejectionFlow.provider_id
        }, headers=headers)
        assert response.status_code == 200
        TestQuoteRejectionFlow.order_id = response.json().get("order_id")
        
        print("✓ Order created for rejection test")
    
    def test_03_provider_submits_high_quote(self):
        """Provider submits a high quote"""
        headers = {"Authorization": f"Bearer {TestQuoteRejectionFlow.provider_token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/provider/orders/{TestQuoteRejectionFlow.order_id}/submit-quote",
            json={
                "quotation_amount": 1500.00,
                "quotation_details": "Full electrical panel replacement needed"
            },
            headers=headers
        )
        assert response.status_code == 200
        print("✓ Provider submitted high quote: $1500")
    
    def test_04_pm_rejects_quote(self):
        """PM rejects the quote via /api/pm/orders/{id}/reject-quote"""
        headers = {"Authorization": f"Bearer {TestQuoteRejectionFlow.pm_token}"}
        
        response = requests.put(
            f"{BASE_URL}/api/pm/orders/{TestQuoteRejectionFlow.order_id}/reject-quote",
            json={
                "reason": "Quote too high. Please provide a more reasonable estimate for just fixing the light switch."
            },
            headers=headers
        )
        
        assert response.status_code == 200, f"Reject quote failed: {response.text}"
        data = response.json()
        assert "rejected" in data.get("message", "").lower() or "Quote rejected" in data.get("message", "")
        print("✓ PM rejected quote")
    
    def test_05_order_status_reset(self):
        """Verify order status is reset to pending_quotation"""
        headers = {"Authorization": f"Bearer {TestQuoteRejectionFlow.provider_token}"}
        
        response = requests.get(f"{BASE_URL}/api/provider/orders", headers=headers)
        assert response.status_code == 200
        
        orders = response.json()
        test_order = next((o for o in orders if o.get("id") == TestQuoteRejectionFlow.order_id), None)
        
        assert test_order is not None
        assert test_order.get("status") == "pending_quotation", f"Expected pending_quotation, got {test_order.get('status')}"
        print("✓ Order status reset to pending_quotation")


class TestProviderOrdersEndpoint:
    """Test the /api/provider/orders endpoint specifically"""
    
    def test_provider_orders_requires_auth(self):
        """Provider orders endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/provider/orders")
        assert response.status_code == 403 or response.status_code == 401
        print("✓ Provider orders requires auth")
    
    def test_provider_orders_requires_provider_role(self):
        """Provider orders endpoint requires provider role"""
        # Register a homeowner
        email = f"test_homeowner_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": "TestPass123!",
            "user_type": "homeowner",
            "name": "Test Homeowner"
        })
        assert response.status_code == 200
        token = response.json().get("access_token")
        
        # Try to access provider orders
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/provider/orders", headers=headers)
        assert response.status_code == 403
        print("✓ Provider orders requires provider role")


class TestPMCalendarEndpoint:
    """Test the /api/pm/calendar endpoint specifically"""
    
    def test_pm_calendar_requires_auth(self):
        """PM calendar endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/pm/calendar")
        assert response.status_code == 403 or response.status_code == 401
        print("✓ PM calendar requires auth")
    
    def test_pm_calendar_requires_pm_role(self):
        """PM calendar endpoint requires property_manager role"""
        # Register a provider
        email = f"test_provider_cal_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": "TestPass123!",
            "user_type": "provider",
            "name": "Test Provider Cal"
        })
        assert response.status_code == 200
        token = response.json().get("access_token")
        
        # Try to access PM calendar
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/pm/calendar", headers=headers)
        assert response.status_code == 403
        print("✓ PM calendar requires PM role")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
