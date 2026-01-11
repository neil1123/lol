"""
Property Management App - Backend API Tests
Tests: PM Registration, Login, Invite Code, Tenant Registration with PM Code, 
       PM Dashboard APIs, Issue Reporting
"""
import pytest
import requests
import os
import uuid
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://tenantfix-1.preview.emergentagent.com')

class TestAuthAndPMCode:
    """Test PM and Tenant authentication flows with PM code linking"""
    
    @pytest.fixture(scope="class")
    def api_client(self):
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        return session
    
    @pytest.fixture(scope="class")
    def test_pm_data(self):
        """Generate unique PM test data"""
        unique_id = str(uuid.uuid4())[:8]
        return {
            "email": f"test_pm_{unique_id}@test.com",
            "password": "test123",
            "user_type": "property_manager",
            "name": f"Test PM {unique_id}",
            "business_name": f"Test Properties {unique_id}"
        }
    
    @pytest.fixture(scope="class")
    def test_tenant_data(self):
        """Generate unique tenant test data"""
        unique_id = str(uuid.uuid4())[:8]
        return {
            "email": f"test_tenant_{unique_id}@test.com",
            "password": "test123",
            "user_type": "homeowner",
            "name": f"Test Tenant {unique_id}",
            "address": "123 Test Street, Unit 101"
        }
    
    def test_01_ping_api(self, api_client):
        """Test API is running"""
        response = api_client.get(f"{BASE_URL}/api/ping")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print(f"API ping successful: {data}")
    
    def test_02_pm_registration(self, api_client, test_pm_data):
        """Test PM registration"""
        response = api_client.post(f"{BASE_URL}/api/auth/register", json=test_pm_data)
        assert response.status_code == 200, f"PM registration failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == test_pm_data["email"]
        assert data["user"]["user_type"] == "property_manager"
        
        # Store token for later tests
        test_pm_data["token"] = data["access_token"]
        test_pm_data["user_id"] = data["user"]["id"]
        print(f"PM registered successfully: {data['user']['email']}")
    
    def test_03_pm_login(self, api_client, test_pm_data):
        """Test PM login"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": test_pm_data["email"],
            "password": test_pm_data["password"]
        })
        assert response.status_code == 200, f"PM login failed: {response.text}"
        data = response.json()
        
        assert "access_token" in data
        assert data["user"]["user_type"] == "property_manager"
        test_pm_data["token"] = data["access_token"]
        print(f"PM login successful: {data['user']['email']}")
    
    def test_04_pm_generate_invite_code(self, api_client, test_pm_data):
        """Test PM generates invite code"""
        headers = {"Authorization": f"Bearer {test_pm_data['token']}"}
        response = api_client.post(f"{BASE_URL}/api/pm/generate-code", headers=headers)
        assert response.status_code == 200, f"Generate code failed: {response.text}"
        data = response.json()
        
        assert "code" in data
        assert len(data["code"]) == 6  # 6-character code
        test_pm_data["pm_code"] = data["code"]
        print(f"PM code generated: {data['code']}")
    
    def test_05_pm_get_my_code(self, api_client, test_pm_data):
        """Test PM can retrieve their code"""
        headers = {"Authorization": f"Bearer {test_pm_data['token']}"}
        response = api_client.get(f"{BASE_URL}/api/pm/my-code", headers=headers)
        assert response.status_code == 200, f"Get my code failed: {response.text}"
        data = response.json()
        
        assert data["code"] == test_pm_data["pm_code"]
        print(f"PM code retrieved: {data['code']}")
    
    def test_06_tenant_registration_with_pm_code(self, api_client, test_pm_data, test_tenant_data):
        """Test tenant registration with PM code links them automatically"""
        # Add PM code to tenant registration
        tenant_data_with_code = {
            **test_tenant_data,
            "pm_code": test_pm_data["pm_code"]
        }
        
        response = api_client.post(f"{BASE_URL}/api/auth/register", json=tenant_data_with_code)
        assert response.status_code == 200, f"Tenant registration failed: {response.text}"
        data = response.json()
        
        assert "access_token" in data
        assert data["user"]["user_type"] == "homeowner"
        assert data["user"]["property_manager_id"] == test_pm_data["user_id"], "Tenant not linked to PM"
        
        test_tenant_data["token"] = data["access_token"]
        test_tenant_data["user_id"] = data["user"]["id"]
        print(f"Tenant registered and linked to PM: {data['user']['email']}")
    
    def test_07_tenant_get_linked_pm(self, api_client, test_tenant_data, test_pm_data):
        """Test tenant can see their linked PM"""
        headers = {"Authorization": f"Bearer {test_tenant_data['token']}"}
        response = api_client.get(f"{BASE_URL}/api/tenant/my-pm", headers=headers)
        assert response.status_code == 200, f"Get tenant PM failed: {response.text}"
        data = response.json()
        
        assert data["property_manager"] is not None
        assert data["property_manager"]["id"] == test_pm_data["user_id"]
        print(f"Tenant linked PM: {data['property_manager']['name']}")
    
    def test_08_pm_get_tenants(self, api_client, test_pm_data, test_tenant_data):
        """Test PM can see linked tenants"""
        headers = {"Authorization": f"Bearer {test_pm_data['token']}"}
        response = api_client.get(f"{BASE_URL}/api/pm/tenants", headers=headers)
        assert response.status_code == 200, f"Get PM tenants failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Find our test tenant
        tenant_found = any(t["id"] == test_tenant_data["user_id"] for t in data)
        assert tenant_found, "Test tenant not found in PM's tenant list"
        print(f"PM has {len(data)} tenant(s)")
    
    def test_09_pm_get_properties(self, api_client, test_pm_data):
        """Test PM can get properties with tenant details"""
        headers = {"Authorization": f"Bearer {test_pm_data['token']}"}
        response = api_client.get(f"{BASE_URL}/api/pm/properties", headers=headers)
        assert response.status_code == 200, f"Get PM properties failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        print(f"PM has {len(data)} property group(s)")
        
        # Verify structure if properties exist
        if len(data) > 0:
            prop = data[0]
            assert "address" in prop
            assert "tenant_count" in prop
            assert "tenants" in prop


class TestIssueReporting:
    """Test tenant issue reporting flow"""
    
    @pytest.fixture(scope="class")
    def api_client(self):
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        return session
    
    @pytest.fixture(scope="class")
    def existing_tenant_credentials(self):
        """Use existing test tenant credentials"""
        return {
            "email": "e2e_tenant_1768106091@test.com",
            "password": "test123"
        }
    
    @pytest.fixture(scope="class")
    def tenant_token(self, api_client, existing_tenant_credentials):
        """Login as existing tenant and get token"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=existing_tenant_credentials)
        if response.status_code != 200:
            # Create new tenant if existing doesn't work
            unique_id = str(uuid.uuid4())[:8]
            new_tenant = {
                "email": f"issue_test_tenant_{unique_id}@test.com",
                "password": "test123",
                "user_type": "homeowner",
                "name": f"Issue Test Tenant {unique_id}"
            }
            response = api_client.post(f"{BASE_URL}/api/auth/register", json=new_tenant)
        
        assert response.status_code == 200, f"Tenant auth failed: {response.text}"
        return response.json()["access_token"]
    
    def test_01_ai_summarize_issue(self, api_client, tenant_token):
        """Test AI issue summarization endpoint"""
        headers = {"Authorization": f"Bearer {tenant_token}"}
        issue_data = {
            "description": "The kitchen faucet is leaking badly. Water is dripping constantly and the handle is loose.",
            "issue_category": "plumbing",
            "urgency_level": "high"
        }
        
        response = api_client.post(f"{BASE_URL}/api/ai/summarize-issue", json=issue_data, headers=headers)
        assert response.status_code == 200, f"AI summarize failed: {response.text}"
        data = response.json()
        
        assert "summary" in data
        assert len(data["summary"]) > 0
        print(f"AI Summary generated: {data['summary'][:100]}...")
    
    def test_02_create_issue(self, api_client, tenant_token):
        """Test creating a new issue"""
        headers = {"Authorization": f"Bearer {tenant_token}"}
        issue_data = {
            "unit_number": "101",
            "issue_category": "plumbing",
            "urgency_level": "medium",
            "description": "Test issue - bathroom sink is clogged",
            "ai_summary": "Bathroom sink drainage issue requiring plumbing attention",
            "best_time": "morning",
            "permission_to_enter": "yes"
        }
        
        response = api_client.post(f"{BASE_URL}/api/issues", json=issue_data, headers=headers)
        assert response.status_code == 200, f"Create issue failed: {response.text}"
        data = response.json()
        
        assert "id" in data or "issue_id" in data
        print(f"Issue created successfully")
        return data.get("id") or data.get("issue_id")
    
    def test_03_get_tenant_issues(self, api_client, tenant_token):
        """Test tenant can see their issues"""
        headers = {"Authorization": f"Bearer {tenant_token}"}
        response = api_client.get(f"{BASE_URL}/api/issues", headers=headers)
        assert response.status_code == 200, f"Get issues failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        print(f"Tenant has {len(data)} issue(s)")


class TestExistingCredentials:
    """Test with provided test credentials"""
    
    @pytest.fixture(scope="class")
    def api_client(self):
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        return session
    
    def test_01_pm_login_existing(self, api_client):
        """Test login with existing PM credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "e2e_pm_1768106090@test.com",
            "password": "test123"
        })
        
        if response.status_code == 401:
            pytest.skip("Existing PM credentials not valid - may need to create new account")
        
        assert response.status_code == 200, f"PM login failed: {response.text}"
        data = response.json()
        assert data["user"]["user_type"] == "property_manager"
        print(f"Existing PM login successful")
        return data["access_token"]
    
    def test_02_tenant_login_existing(self, api_client):
        """Test login with existing tenant credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "e2e_tenant_1768106091@test.com",
            "password": "test123"
        })
        
        if response.status_code == 401:
            pytest.skip("Existing tenant credentials not valid - may need to create new account")
        
        assert response.status_code == 200, f"Tenant login failed: {response.text}"
        data = response.json()
        assert data["user"]["user_type"] == "homeowner"
        print(f"Existing tenant login successful")


class TestServicesAndProviders:
    """Test services and providers endpoints"""
    
    @pytest.fixture(scope="class")
    def api_client(self):
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        return session
    
    def test_01_get_services(self, api_client):
        """Test get all services"""
        response = api_client.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200, f"Get services failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Available services: {len(data)}")
    
    def test_02_get_providers(self, api_client):
        """Test get all providers"""
        response = api_client.get(f"{BASE_URL}/api/providers")
        assert response.status_code == 200, f"Get providers failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        print(f"Available providers: {len(data)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
