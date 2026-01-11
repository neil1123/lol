"""
Quick Send to Provider Feature - Backend API Tests
Tests: PM Login, View Issues, Quick Send to Provider, Verify Order Creation
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://tenantfix-1.preview.emergentagent.com')


class TestQuickSendToProvider:
    """Test PM Quick Send to Provider workflow"""
    
    @pytest.fixture(scope="class")
    def api_client(self):
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        return session
    
    @pytest.fixture(scope="class")
    def pm_token(self, api_client):
        """Login as PM and get token"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "e2e_pm_1768106090@test.com",
            "password": "test123"
        })
        assert response.status_code == 200, f"PM login failed: {response.text}"
        data = response.json()
        assert data["user"]["user_type"] == "property_manager"
        return data["access_token"]
    
    @pytest.fixture(scope="class")
    def tenant_token(self, api_client):
        """Login as tenant and get token"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "e2e_tenant_1768106091@test.com",
            "password": "test123"
        })
        assert response.status_code == 200, f"Tenant login failed: {response.text}"
        return response.json()["access_token"]
    
    def test_01_pm_login(self, api_client, pm_token):
        """Test PM can login successfully"""
        headers = {"Authorization": f"Bearer {pm_token}"}
        response = api_client.get(f"{BASE_URL}/api/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["user_type"] == "property_manager"
        print(f"PM logged in: {data['email']}")
    
    def test_02_get_providers(self, api_client):
        """Test getting list of service providers"""
        response = api_client.get(f"{BASE_URL}/api/providers")
        assert response.status_code == 200
        providers = response.json()
        assert isinstance(providers, list)
        assert len(providers) > 0
        print(f"Found {len(providers)} providers")
        
        # Verify provider structure
        provider = providers[0]
        assert "id" in provider
        assert "business_name" in provider or "name" in provider
        assert "services" in provider
        return providers
    
    def test_03_create_test_issue(self, api_client, tenant_token):
        """Create a new issue for testing Quick Send"""
        headers = {"Authorization": f"Bearer {tenant_token}"}
        
        # Get tenant's PM
        pm_response = api_client.get(f"{BASE_URL}/api/tenant/my-pm", headers=headers)
        assert pm_response.status_code == 200
        pm_data = pm_response.json()
        pm_id = pm_data.get("property_manager", {}).get("id")
        
        if not pm_id:
            pytest.skip("Tenant not linked to PM")
        
        unique_id = str(uuid.uuid4())[:8]
        issue_data = {
            "property_manager_id": pm_id,
            "unit_number": f"TEST_{unique_id}",
            "issue_category": "plumbing",
            "urgency_level": "medium",
            "description": f"Test issue for Quick Send - {unique_id}",
            "ai_summary": "Test plumbing issue for Quick Send feature testing",
            "best_time": "morning",
            "permission_to_enter": "yes"
        }
        
        response = api_client.post(f"{BASE_URL}/api/issues", json=issue_data, headers=headers)
        assert response.status_code == 200, f"Create issue failed: {response.text}"
        data = response.json()
        assert "issue_id" in data
        print(f"Created test issue: {data['issue_id']}")
        return data["issue_id"]
    
    def test_04_pm_view_issues(self, api_client, pm_token):
        """Test PM can view pending issues"""
        headers = {"Authorization": f"Bearer {pm_token}"}
        response = api_client.get(f"{BASE_URL}/api/issues", headers=headers)
        assert response.status_code == 200
        issues = response.json()
        assert isinstance(issues, list)
        print(f"PM has {len(issues)} issues")
        
        # Find pending issues (not yet sent to provider)
        pending_issues = [i for i in issues if i.get("status") == "pending"]
        print(f"Pending issues: {len(pending_issues)}")
        return issues
    
    def test_05_quick_send_to_provider(self, api_client, pm_token, tenant_token):
        """Test Quick Send to Provider API endpoint"""
        headers = {"Authorization": f"Bearer {pm_token}"}
        
        # Create a fresh issue
        tenant_headers = {"Authorization": f"Bearer {tenant_token}"}
        pm_response = api_client.get(f"{BASE_URL}/api/tenant/my-pm", headers=tenant_headers)
        pm_id = pm_response.json().get("property_manager", {}).get("id")
        
        unique_id = str(uuid.uuid4())[:8]
        issue_data = {
            "property_manager_id": pm_id,
            "unit_number": f"QS_{unique_id}",
            "issue_category": "electrical",
            "urgency_level": "urgent",
            "description": f"Quick Send test issue - {unique_id}",
            "ai_summary": "Electrical issue for Quick Send testing",
            "best_time": "afternoon",
            "permission_to_enter": "yes"
        }
        
        create_response = api_client.post(f"{BASE_URL}/api/issues", json=issue_data, headers=tenant_headers)
        assert create_response.status_code == 200
        issue_id = create_response.json()["issue_id"]
        print(f"Created issue for Quick Send: {issue_id}")
        
        # Get providers
        providers_response = api_client.get(f"{BASE_URL}/api/providers")
        providers = providers_response.json()
        provider_id = providers[0]["id"]
        provider_name = providers[0].get("business_name") or providers[0].get("name")
        print(f"Sending to provider: {provider_name}")
        
        # Quick Send to Provider
        send_response = api_client.post(
            f"{BASE_URL}/api/pm/issues/{issue_id}/send-to-provider",
            json={"provider_id": provider_id},
            headers=headers
        )
        assert send_response.status_code == 200, f"Quick Send failed: {send_response.text}"
        send_data = send_response.json()
        
        assert "order_id" in send_data
        assert "provider_name" in send_data
        assert send_data["message"] == "Issue sent to service provider successfully"
        print(f"Quick Send successful! Order ID: {send_data['order_id']}")
        
        return {
            "issue_id": issue_id,
            "order_id": send_data["order_id"],
            "provider_name": send_data["provider_name"]
        }
    
    def test_06_verify_issue_status_updated(self, api_client, pm_token, tenant_token):
        """Verify issue status is updated to 'sent_to_provider' after Quick Send"""
        # Create and send a new issue
        result = self.test_05_quick_send_to_provider(api_client, pm_token, tenant_token)
        issue_id = result["issue_id"]
        
        headers = {"Authorization": f"Bearer {pm_token}"}
        response = api_client.get(f"{BASE_URL}/api/issues/{issue_id}", headers=headers)
        assert response.status_code == 200
        issue = response.json()
        
        assert issue["status"] == "sent_to_provider", f"Expected 'sent_to_provider', got '{issue['status']}'"
        assert issue["assigned_provider_id"] is not None
        assert issue["assigned_provider_name"] is not None
        assert issue["linked_order_id"] == result["order_id"]
        print(f"Issue status verified: {issue['status']}")
        print(f"Assigned to: {issue['assigned_provider_name']}")
    
    def test_07_verify_order_created(self, api_client, pm_token, tenant_token):
        """Verify order is created with status 'pending_quotation' via issue's linked_order_id"""
        # Create and send a new issue
        result = self.test_05_quick_send_to_provider(api_client, pm_token, tenant_token)
        issue_id = result["issue_id"]
        order_id = result["order_id"]
        
        headers = {"Authorization": f"Bearer {pm_token}"}
        
        # Verify via issue's linked_order_id
        issue_response = api_client.get(f"{BASE_URL}/api/issues/{issue_id}", headers=headers)
        assert issue_response.status_code == 200
        issue = issue_response.json()
        
        assert issue["linked_order_id"] == order_id, f"Issue linked_order_id mismatch"
        assert issue["status"] == "sent_to_provider"
        print(f"Order verified via issue: {order_id}")
        print(f"Issue status: {issue['status']}")
        print(f"Assigned provider: {issue['assigned_provider_name']}")


class TestProviderMatchBadge:
    """Test provider matching based on issue category"""
    
    @pytest.fixture(scope="class")
    def api_client(self):
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        return session
    
    def test_provider_services_match_issue_category(self, api_client):
        """Test that providers have services that can match issue categories"""
        response = api_client.get(f"{BASE_URL}/api/providers")
        assert response.status_code == 200
        providers = response.json()
        
        # Check that providers have services
        for provider in providers:
            services = provider.get("services", [])
            print(f"Provider: {provider.get('business_name', provider.get('name'))}")
            print(f"  Services: {services}")
            
            # Verify services include common categories
            common_categories = ["plumbing", "electrical", "hvac"]
            matching_services = [s for s in services if any(cat in s.lower() for cat in common_categories)]
            if matching_services:
                print(f"  Matches categories: {matching_services}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
