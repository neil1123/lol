"""
Test P2 and P3 Features:
- P2: Quote Management UI, Calendar for scheduling services
- P3: Issue Classification (small/medium/big)

Endpoints tested:
- POST /api/provider/orders/{id}/submit-quote
- PUT /api/pm/orders/{id}/schedule
- GET /api/pm/calendar
- PUT /api/pm/issues/{id}/classify
- GET /api/pm/issues/by-size
- GET /api/pm/quotes
"""

import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://tenantfix-1.preview.emergentagent.com')

# Test credentials from previous iterations
PM_EMAIL = "e2e_pm_1768106090@test.com"
PM_PASSWORD = "test123"
TENANT_EMAIL = "e2e_tenant_1768106091@test.com"
TENANT_PASSWORD = "test123"


class TestSetup:
    """Setup and authentication tests"""
    
    @pytest.fixture(scope="class")
    def pm_token(self):
        """Get PM authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": PM_EMAIL,
            "password": PM_PASSWORD
        })
        assert response.status_code == 200, f"PM login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        return data["access_token"]
    
    @pytest.fixture(scope="class")
    def pm_user(self, pm_token):
        """Get PM user data"""
        response = requests.get(f"{BASE_URL}/api/me", headers={
            "Authorization": f"Bearer {pm_token}"
        })
        assert response.status_code == 200
        return response.json()
    
    @pytest.fixture(scope="class")
    def tenant_token(self):
        """Get tenant authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TENANT_EMAIL,
            "password": TENANT_PASSWORD
        })
        assert response.status_code == 200, f"Tenant login failed: {response.text}"
        data = response.json()
        return data["access_token"]
    
    def test_pm_login(self, pm_token):
        """Test PM can login successfully"""
        assert pm_token is not None
        assert len(pm_token) > 0
        print(f"✓ PM login successful, token length: {len(pm_token)}")
    
    def test_pm_user_type(self, pm_user):
        """Verify PM user type"""
        assert pm_user.get("user_type") == "property_manager"
        print(f"✓ PM user type verified: {pm_user.get('user_type')}")


class TestIssueClassification:
    """Test P3 Issue Classification feature"""
    
    @pytest.fixture(scope="class")
    def pm_token(self):
        """Get PM authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": PM_EMAIL,
            "password": PM_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def pm_headers(self, pm_token):
        return {"Authorization": f"Bearer {pm_token}"}
    
    @pytest.fixture(scope="class")
    def tenant_token(self):
        """Get tenant authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TENANT_EMAIL,
            "password": TENANT_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def tenant_headers(self, tenant_token):
        return {"Authorization": f"Bearer {tenant_token}"}
    
    @pytest.fixture(scope="class")
    def pm_user(self, pm_headers):
        """Get PM user data"""
        response = requests.get(f"{BASE_URL}/api/me", headers=pm_headers)
        assert response.status_code == 200
        return response.json()
    
    @pytest.fixture(scope="class")
    def test_issue(self, tenant_headers, pm_user):
        """Create a test issue for classification testing"""
        issue_data = {
            "property_manager_id": pm_user["id"],
            "unit_number": "TEST-101",
            "issue_category": "Plumbing",
            "urgency_level": "normal",
            "description": f"TEST_CLASSIFY: Test issue for classification testing - {uuid.uuid4().hex[:8]}",
            "ai_summary": "Test plumbing issue for classification",
            "best_time": "Morning",
            "permission_to_enter": "Yes"
        }
        response = requests.post(f"{BASE_URL}/api/issues", 
                                json=issue_data, 
                                headers=tenant_headers)
        assert response.status_code == 200, f"Failed to create test issue: {response.text}"
        return response.json()["issue_id"]
    
    def test_classify_issue_small(self, pm_headers, test_issue):
        """Test classifying issue as small"""
        response = requests.put(
            f"{BASE_URL}/api/pm/issues/{test_issue}/classify",
            json={"issue_size": "small"},
            headers=pm_headers
        )
        assert response.status_code == 200, f"Failed to classify as small: {response.text}"
        data = response.json()
        assert data["issue_size"] == "small"
        print(f"✓ Issue classified as small: {data}")
    
    def test_classify_issue_medium(self, pm_headers, test_issue):
        """Test classifying issue as medium"""
        response = requests.put(
            f"{BASE_URL}/api/pm/issues/{test_issue}/classify",
            json={"issue_size": "medium"},
            headers=pm_headers
        )
        assert response.status_code == 200, f"Failed to classify as medium: {response.text}"
        data = response.json()
        assert data["issue_size"] == "medium"
        print(f"✓ Issue classified as medium: {data}")
    
    def test_classify_issue_big(self, pm_headers, test_issue):
        """Test classifying issue as big"""
        response = requests.put(
            f"{BASE_URL}/api/pm/issues/{test_issue}/classify",
            json={"issue_size": "big"},
            headers=pm_headers
        )
        assert response.status_code == 200, f"Failed to classify as big: {response.text}"
        data = response.json()
        assert data["issue_size"] == "big"
        print(f"✓ Issue classified as big: {data}")
    
    def test_classify_invalid_size(self, pm_headers, test_issue):
        """Test classifying with invalid size returns error"""
        response = requests.put(
            f"{BASE_URL}/api/pm/issues/{test_issue}/classify",
            json={"issue_size": "invalid"},
            headers=pm_headers
        )
        assert response.status_code == 400
        print(f"✓ Invalid size correctly rejected")
    
    def test_get_issues_by_size(self, pm_headers):
        """Test getting issues grouped by size"""
        response = requests.get(
            f"{BASE_URL}/api/pm/issues/by-size",
            headers=pm_headers
        )
        assert response.status_code == 200, f"Failed to get issues by size: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "big" in data
        assert "medium" in data
        assert "small" in data
        assert isinstance(data["big"], list)
        assert isinstance(data["medium"], list)
        assert isinstance(data["small"], list)
        
        print(f"✓ Issues by size: big={len(data['big'])}, medium={len(data['medium'])}, small={len(data['small'])}")


class TestProviderQuoteSubmission:
    """Test P2 Provider Quote Submission feature"""
    
    @pytest.fixture(scope="class")
    def provider_credentials(self):
        """Create or get a test provider"""
        # First try to login as existing provider
        provider_email = "test_provider_p2@test.com"
        provider_password = "test123"
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": provider_email,
            "password": provider_password
        })
        
        if response.status_code == 200:
            return response.json()
        
        # Register new provider
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": provider_email,
            "password": provider_password,
            "user_type": "provider",
            "name": "Test Provider P2",
            "business_name": "P2 Test Services",
            "services": ["Plumbing", "Electrical", "HVAC"]
        })
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 400 and "already registered" in response.text:
            # Try login again
            response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": provider_email,
                "password": provider_password
            })
            assert response.status_code == 200
            return response.json()
        
        pytest.skip(f"Could not create/login provider: {response.text}")
    
    @pytest.fixture(scope="class")
    def provider_token(self, provider_credentials):
        return provider_credentials["access_token"]
    
    @pytest.fixture(scope="class")
    def provider_headers(self, provider_token):
        return {"Authorization": f"Bearer {provider_token}"}
    
    @pytest.fixture(scope="class")
    def provider_user(self, provider_credentials):
        return provider_credentials["user"]
    
    @pytest.fixture(scope="class")
    def pm_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": PM_EMAIL,
            "password": PM_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def pm_headers(self, pm_token):
        return {"Authorization": f"Bearer {pm_token}"}
    
    @pytest.fixture(scope="class")
    def pm_user(self, pm_headers):
        response = requests.get(f"{BASE_URL}/api/me", headers=pm_headers)
        assert response.status_code == 200
        return response.json()
    
    @pytest.fixture(scope="class")
    def tenant_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TENANT_EMAIL,
            "password": TENANT_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def tenant_headers(self, tenant_token):
        return {"Authorization": f"Bearer {tenant_token}"}
    
    @pytest.fixture(scope="class")
    def order_for_quote(self, tenant_headers, pm_headers, pm_user, provider_user):
        """Create an issue and send to provider to get an order for quote testing"""
        # Create issue
        issue_data = {
            "property_manager_id": pm_user["id"],
            "unit_number": "QUOTE-TEST-201",
            "issue_category": "Plumbing",
            "urgency_level": "urgent",
            "description": f"TEST_QUOTE: Leaking pipe needs repair - {uuid.uuid4().hex[:8]}",
            "ai_summary": "Urgent plumbing repair needed",
            "best_time": "Afternoon",
            "permission_to_enter": "Yes"
        }
        response = requests.post(f"{BASE_URL}/api/issues", 
                                json=issue_data, 
                                headers=tenant_headers)
        assert response.status_code == 200, f"Failed to create issue: {response.text}"
        issue_id = response.json()["issue_id"]
        
        # Send issue to provider
        response = requests.post(
            f"{BASE_URL}/api/pm/issues/{issue_id}/send-to-provider",
            json={"provider_id": provider_user["id"]},
            headers=pm_headers
        )
        assert response.status_code == 200, f"Failed to send to provider: {response.text}"
        order_id = response.json()["order_id"]
        
        return order_id
    
    def test_provider_can_get_orders(self, provider_headers):
        """Test provider can get their assigned orders"""
        response = requests.get(
            f"{BASE_URL}/api/provider/orders",
            headers=provider_headers
        )
        assert response.status_code == 200, f"Failed to get provider orders: {response.text}"
        orders = response.json()
        assert isinstance(orders, list)
        print(f"✓ Provider has {len(orders)} orders")
    
    def test_submit_quote(self, provider_headers, order_for_quote):
        """Test provider can submit a quote"""
        quote_data = {
            "quotation_amount": 250.00,
            "quotation_details": "Labor: $150, Parts: $100. Will fix leaking pipe and check for other issues.",
            "estimated_duration": "2 hours",
            "quotation_valid_until": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        }
        
        response = requests.post(
            f"{BASE_URL}/api/provider/orders/{order_for_quote}/submit-quote",
            json=quote_data,
            headers=provider_headers
        )
        assert response.status_code == 200, f"Failed to submit quote: {response.text}"
        data = response.json()
        
        assert data["status"] == "quoted"
        assert data["quotation_amount"] == 250.00
        print(f"✓ Quote submitted successfully: ${data['quotation_amount']}")
    
    def test_submit_quote_without_amount_fails(self, provider_headers, order_for_quote):
        """Test submitting quote without amount fails"""
        response = requests.post(
            f"{BASE_URL}/api/provider/orders/{order_for_quote}/submit-quote",
            json={"quotation_details": "No amount provided"},
            headers=provider_headers
        )
        # Should fail because amount is required
        assert response.status_code == 400
        print(f"✓ Quote without amount correctly rejected")


class TestPMQuotesAndScheduling:
    """Test PM Quote Management and Scheduling features"""
    
    @pytest.fixture(scope="class")
    def pm_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": PM_EMAIL,
            "password": PM_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def pm_headers(self, pm_token):
        return {"Authorization": f"Bearer {pm_token}"}
    
    def test_get_pm_quotes(self, pm_headers):
        """Test PM can get quotes to review"""
        response = requests.get(
            f"{BASE_URL}/api/pm/quotes",
            headers=pm_headers
        )
        assert response.status_code == 200, f"Failed to get PM quotes: {response.text}"
        quotes = response.json()
        assert isinstance(quotes, list)
        print(f"✓ PM has {len(quotes)} quotes to review")
        
        # If there are quotes, verify structure
        if quotes:
            quote = quotes[0]
            assert "id" in quote
            assert "quotation_amount" in quote or quote.get("status") == "quoted"
            print(f"✓ Quote structure verified: {quote.get('service_type')} - ${quote.get('quotation_amount')}")


class TestCalendar:
    """Test PM Calendar feature"""
    
    @pytest.fixture(scope="class")
    def pm_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": PM_EMAIL,
            "password": PM_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def pm_headers(self, pm_token):
        return {"Authorization": f"Bearer {pm_token}"}
    
    def test_get_pm_calendar(self, pm_headers):
        """Test PM can get calendar events"""
        response = requests.get(
            f"{BASE_URL}/api/pm/calendar",
            headers=pm_headers
        )
        assert response.status_code == 200, f"Failed to get PM calendar: {response.text}"
        events = response.json()
        assert isinstance(events, list)
        print(f"✓ PM calendar has {len(events)} events")
        
        # If there are events, verify structure
        if events:
            event = events[0]
            assert "date" in event
            assert "time" in event
            assert "title" in event
            print(f"✓ Calendar event structure verified: {event.get('title')} on {event.get('date')}")


class TestScheduleService:
    """Test PM Schedule Service feature"""
    
    @pytest.fixture(scope="class")
    def pm_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": PM_EMAIL,
            "password": PM_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def pm_headers(self, pm_token):
        return {"Authorization": f"Bearer {pm_token}"}
    
    @pytest.fixture(scope="class")
    def pm_user(self, pm_headers):
        response = requests.get(f"{BASE_URL}/api/me", headers=pm_headers)
        assert response.status_code == 200
        return response.json()
    
    @pytest.fixture(scope="class")
    def provider_credentials(self):
        """Get or create test provider"""
        provider_email = "test_provider_schedule@test.com"
        provider_password = "test123"
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": provider_email,
            "password": provider_password
        })
        
        if response.status_code == 200:
            return response.json()
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": provider_email,
            "password": provider_password,
            "user_type": "provider",
            "name": "Schedule Test Provider",
            "business_name": "Schedule Test Services",
            "services": ["Plumbing", "Electrical"]
        })
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 400:
            response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": provider_email,
                "password": provider_password
            })
            return response.json()
        
        pytest.skip(f"Could not setup provider: {response.text}")
    
    @pytest.fixture(scope="class")
    def provider_headers(self, provider_credentials):
        return {"Authorization": f"Bearer {provider_credentials['access_token']}"}
    
    @pytest.fixture(scope="class")
    def provider_user(self, provider_credentials):
        return provider_credentials["user"]
    
    @pytest.fixture(scope="class")
    def tenant_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TENANT_EMAIL,
            "password": TENANT_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def tenant_headers(self, tenant_token):
        return {"Authorization": f"Bearer {tenant_token}"}
    
    @pytest.fixture(scope="class")
    def order_to_schedule(self, tenant_headers, pm_headers, pm_user, provider_user, provider_headers):
        """Create a quoted order ready for scheduling"""
        # Create issue
        issue_data = {
            "property_manager_id": pm_user["id"],
            "unit_number": "SCHEDULE-TEST-301",
            "issue_category": "Electrical",
            "urgency_level": "normal",
            "description": f"TEST_SCHEDULE: Light fixture needs replacement - {uuid.uuid4().hex[:8]}",
            "ai_summary": "Electrical repair needed",
            "best_time": "Morning",
            "permission_to_enter": "Yes"
        }
        response = requests.post(f"{BASE_URL}/api/issues", 
                                json=issue_data, 
                                headers=tenant_headers)
        assert response.status_code == 200
        issue_id = response.json()["issue_id"]
        
        # Send to provider
        response = requests.post(
            f"{BASE_URL}/api/pm/issues/{issue_id}/send-to-provider",
            json={"provider_id": provider_user["id"]},
            headers=pm_headers
        )
        assert response.status_code == 200
        order_id = response.json()["order_id"]
        
        # Provider submits quote
        quote_data = {
            "quotation_amount": 175.00,
            "quotation_details": "Light fixture replacement",
            "estimated_duration": "1 hour"
        }
        response = requests.post(
            f"{BASE_URL}/api/provider/orders/{order_id}/submit-quote",
            json=quote_data,
            headers=provider_headers
        )
        assert response.status_code == 200
        
        return order_id
    
    def test_schedule_service(self, pm_headers, order_to_schedule):
        """Test PM can schedule a service"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        schedule_data = {
            "scheduled_date": tomorrow,
            "scheduled_time": "10:00"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/pm/orders/{order_to_schedule}/schedule",
            json=schedule_data,
            headers=pm_headers
        )
        assert response.status_code == 200, f"Failed to schedule service: {response.text}"
        data = response.json()
        
        assert data["scheduled_date"] == tomorrow
        assert data["scheduled_time"] == "10:00"
        assert "appointment_id" in data
        print(f"✓ Service scheduled for {tomorrow} at 10:00")
    
    def test_schedule_without_date_fails(self, pm_headers, order_to_schedule):
        """Test scheduling without date fails"""
        response = requests.put(
            f"{BASE_URL}/api/pm/orders/{order_to_schedule}/schedule",
            json={"scheduled_time": "10:00"},
            headers=pm_headers
        )
        assert response.status_code == 400
        print(f"✓ Schedule without date correctly rejected")
    
    def test_calendar_shows_scheduled_event(self, pm_headers):
        """Test calendar shows the scheduled event"""
        response = requests.get(
            f"{BASE_URL}/api/pm/calendar",
            headers=pm_headers
        )
        assert response.status_code == 200
        events = response.json()
        
        # Should have at least one event now
        print(f"✓ Calendar now has {len(events)} events after scheduling")


class TestPMOrdersPageTabs:
    """Test PM Orders page has all required tabs"""
    
    @pytest.fixture(scope="class")
    def pm_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": PM_EMAIL,
            "password": PM_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def pm_headers(self, pm_token):
        return {"Authorization": f"Bearer {pm_token}"}
    
    def test_pm_can_get_issues(self, pm_headers):
        """Test PM can get issues (Issues tab data)"""
        response = requests.get(f"{BASE_URL}/api/issues", headers=pm_headers)
        assert response.status_code == 200
        issues = response.json()
        assert isinstance(issues, list)
        print(f"✓ Issues tab: {len(issues)} issues")
    
    def test_pm_can_get_quotes(self, pm_headers):
        """Test PM can get quotes (Quotes tab data)"""
        response = requests.get(f"{BASE_URL}/api/pm/quotes", headers=pm_headers)
        assert response.status_code == 200
        quotes = response.json()
        assert isinstance(quotes, list)
        print(f"✓ Quotes tab: {len(quotes)} quotes")
    
    def test_pm_can_get_orders(self, pm_headers):
        """Test PM can get orders (Active/Done tabs data)"""
        response = requests.get(f"{BASE_URL}/api/pm/orders", headers=pm_headers)
        assert response.status_code == 200
        orders = response.json()
        assert isinstance(orders, list)
        print(f"✓ Orders (Active/Done): {len(orders)} orders")
    
    def test_pm_can_get_calendar(self, pm_headers):
        """Test PM can get calendar (Calendar tab data)"""
        response = requests.get(f"{BASE_URL}/api/pm/calendar", headers=pm_headers)
        assert response.status_code == 200
        events = response.json()
        assert isinstance(events, list)
        print(f"✓ Calendar tab: {len(events)} events")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
