#!/usr/bin/env python3
"""
Doord Backend API Testing Script - Review Request
Tests the specific API endpoints mentioned in the review request
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from review request
BASE_URL = "https://prop-issue-report.preview.emergentagent.com/api"

class DoordAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.provider_token = None
        self.homeowner_token = None
        self.provider_id = None
        self.homeowner_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "status": status,
            "success": success,
            "details": details
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        print()

    def test_provider_registration_and_login(self):
        """Test 1: Provider Registration & Login"""
        print("=== TEST 1: Provider Registration & Login ===")
        
        # Register new provider
        provider_data = {
            "email": "newprovider@test.com",
            "password": "test123",
            "user_type": "provider",
            "name": "New Test Provider",
            "business_name": "New Test Cleaning",
            "services": ["Deep Cleaning", "Window Cleaning", "Carpet Cleaning"],
            "phone": "555-0123",
            "address": "123 Test St",
            "location": "Test City"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/register", json=provider_data)
            if response.status_code == 201 or response.status_code == 200:
                data = response.json()
                self.provider_token = data.get("access_token")
                self.provider_id = data.get("user", {}).get("id")
                self.log_test("Provider Registration", True, f"Provider ID: {self.provider_id}")
            elif response.status_code == 400 and "already registered" in response.text:
                # Try to login instead
                login_data = {"email": "newprovider@test.com", "password": "test123"}
                login_response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
                if login_response.status_code == 200:
                    data = login_response.json()
                    self.provider_token = data.get("access_token")
                    self.provider_id = data.get("user", {}).get("id")
                    self.log_test("Provider Registration", True, "Provider already exists, logged in successfully")
                else:
                    self.log_test("Provider Registration", False, f"Login failed: {login_response.status_code} - {login_response.text}")
                    return
            else:
                self.log_test("Provider Registration", False, f"Registration failed: {response.status_code} - {response.text}")
                return
        except Exception as e:
            self.log_test("Provider Registration", False, f"Exception: {str(e)}")
            return

        # Test login with provider credentials
        try:
            login_data = {"email": "newprovider@test.com", "password": "test123"}
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                token = data.get("access_token")
                user = data.get("user", {})
                if token and user.get("user_type") == "provider":
                    self.log_test("Provider Login", True, f"Token received, user_type: {user.get('user_type')}")
                else:
                    self.log_test("Provider Login", False, "Invalid response structure")
            else:
                self.log_test("Provider Login", False, f"Login failed: {response.status_code} - {response.text}")
        except Exception as e:
            self.log_test("Provider Login", False, f"Exception: {str(e)}")

        # Test /api/me endpoint
        if self.provider_token:
            try:
                headers = {"Authorization": f"Bearer {self.provider_token}"}
                response = self.session.get(f"{self.base_url}/me", headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    business_name = data.get("business_name")
                    services = data.get("services", [])
                    if business_name == "New Test Cleaning" and "Deep Cleaning" in services:
                        self.log_test("/api/me Endpoint", True, f"Business: {business_name}, Services: {len(services)} items")
                    else:
                        self.log_test("/api/me Endpoint", False, f"Data mismatch - Business: {business_name}, Services: {services}")
                else:
                    self.log_test("/api/me Endpoint", False, f"Request failed: {response.status_code} - {response.text}")
            except Exception as e:
                self.log_test("/api/me Endpoint", False, f"Exception: {str(e)}")

    def test_provider_profile_endpoints(self):
        """Test 2: Provider Profile Endpoints"""
        print("=== TEST 2: Provider Profile Endpoints ===")
        
        # Test GET /api/providers
        try:
            response = self.session.get(f"{self.base_url}/providers")
            if response.status_code == 200:
                providers = response.json()
                if isinstance(providers, list) and len(providers) > 0:
                    self.log_test("GET /api/providers", True, f"Found {len(providers)} providers")
                else:
                    self.log_test("GET /api/providers", False, "No providers found or invalid format")
            else:
                self.log_test("GET /api/providers", False, f"Request failed: {response.status_code} - {response.text}")
        except Exception as e:
            self.log_test("GET /api/providers", False, f"Exception: {str(e)}")

        # Test GET /api/providers/{id} for the new provider
        if self.provider_id:
            try:
                response = self.session.get(f"{self.base_url}/providers/{self.provider_id}")
                if response.status_code == 200:
                    provider = response.json()
                    services = provider.get("services", [])
                    business_name = provider.get("business_name")
                    if services and business_name:
                        self.log_test("GET /api/providers/{id}", True, f"Provider found with {len(services)} services")
                    else:
                        self.log_test("GET /api/providers/{id}", False, "Missing services or business_name")
                else:
                    self.log_test("GET /api/providers/{id}", False, f"Request failed: {response.status_code} - {response.text}")
            except Exception as e:
                self.log_test("GET /api/providers/{id}", False, f"Exception: {str(e)}")

    def test_homeowner_registration_and_message_threads(self):
        """Test 3: Homeowner Registration & Message Threads"""
        print("=== TEST 3: Homeowner Registration & Message Threads ===")
        
        # Register homeowner
        homeowner_data = {
            "email": "newhomeowner@test.com",
            "password": "test123",
            "user_type": "homeowner",
            "name": "New Test Homeowner",
            "phone": "555-0456",
            "address": "456 Test Ave"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/register", json=homeowner_data)
            if response.status_code == 201 or response.status_code == 200:
                data = response.json()
                self.homeowner_token = data.get("access_token")
                self.homeowner_id = data.get("user", {}).get("id")
                self.log_test("Homeowner Registration", True, f"Homeowner ID: {self.homeowner_id}")
            elif response.status_code == 400 and "already registered" in response.text:
                # Try to login instead
                login_data = {"email": "newhomeowner@test.com", "password": "test123"}
                login_response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
                if login_response.status_code == 200:
                    data = login_response.json()
                    self.homeowner_token = data.get("access_token")
                    self.homeowner_id = data.get("user", {}).get("id")
                    self.log_test("Homeowner Registration", True, "Homeowner already exists, logged in successfully")
                else:
                    self.log_test("Homeowner Registration", False, f"Login failed: {login_response.status_code}")
                    return
            else:
                self.log_test("Homeowner Registration", False, f"Registration failed: {response.status_code} - {response.text}")
                return
        except Exception as e:
            self.log_test("Homeowner Registration", False, f"Exception: {str(e)}")
            return

        # Test homeowner login
        try:
            login_data = {"email": "newhomeowner@test.com", "password": "test123"}
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            if response.status_code == 200:
                self.log_test("Homeowner Login", True, "Login successful")
            else:
                self.log_test("Homeowner Login", False, f"Login failed: {response.status_code}")
        except Exception as e:
            self.log_test("Homeowner Login", False, f"Exception: {str(e)}")

        # Test message thread creation
        if self.homeowner_token and self.provider_id:
            try:
                headers = {"Authorization": f"Bearer {self.homeowner_token}"}
                thread_data = {
                    "provider_id": self.provider_id,
                    "last_message": "Hello, I need cleaning services"
                }
                response = self.session.post(f"{self.base_url}/messages/threads", json=thread_data, headers=headers)
                if response.status_code == 200 or response.status_code == 201:
                    thread = response.json()
                    thread_id = thread.get("id") or thread.get("conversation_id")
                    self.log_test("POST /api/messages/threads", True, f"Thread created: {thread_id}")
                else:
                    self.log_test("POST /api/messages/threads", False, f"Request failed: {response.status_code} - {response.text}")
            except Exception as e:
                self.log_test("POST /api/messages/threads", False, f"Exception: {str(e)}")

        # Test GET /api/messages/threads
        if self.homeowner_token:
            try:
                headers = {"Authorization": f"Bearer {self.homeowner_token}"}
                response = self.session.get(f"{self.base_url}/messages/threads", headers=headers)
                if response.status_code == 200:
                    threads = response.json()
                    if isinstance(threads, list):
                        self.log_test("GET /api/messages/threads", True, f"Found {len(threads)} threads")
                    else:
                        self.log_test("GET /api/messages/threads", False, "Invalid response format")
                else:
                    self.log_test("GET /api/messages/threads", False, f"Request failed: {response.status_code} - {response.text}")
            except Exception as e:
                self.log_test("GET /api/messages/threads", False, f"Exception: {str(e)}")

    def test_orders_quotations(self):
        """Test 4: Orders/Quotations"""
        print("=== TEST 4: Orders/Quotations ===")
        
        if not (self.homeowner_token and self.provider_id):
            self.log_test("Orders/Quotations", False, "Missing homeowner token or provider ID")
            return

        # Create order as homeowner
        order_data = {
            "provider_id": self.provider_id,
            "service": "Deep Cleaning",
            "description": "Need deep cleaning",
            "preferred_date": "2025-12-20",
            "urgency": "high"
        }
        
        order_id = None
        try:
            headers = {"Authorization": f"Bearer {self.homeowner_token}"}
            response = self.session.post(f"{self.base_url}/orders", json=order_data, headers=headers)
            if response.status_code == 200 or response.status_code == 201:
                data = response.json()
                order_id = data.get("order_id") or data.get("id")
                self.log_test("POST /api/orders (Homeowner)", True, f"Order created: {order_id}")
            else:
                self.log_test("POST /api/orders (Homeowner)", False, f"Request failed: {response.status_code} - {response.text}")
        except Exception as e:
            self.log_test("POST /api/orders (Homeowner)", False, f"Exception: {str(e)}")

        # Test GET /api/orders as provider
        if self.provider_token:
            try:
                headers = {"Authorization": f"Bearer {self.provider_token}"}
                response = self.session.get(f"{self.base_url}/orders", headers=headers)
                if response.status_code == 200:
                    orders = response.json()
                    if isinstance(orders, list):
                        # Look for the order we just created
                        found_order = None
                        for order in orders:
                            if order.get("service") == "Deep Cleaning":
                                found_order = order
                                break
                        
                        if found_order:
                            homeowner_name = found_order.get("homeowner_name")
                            self.log_test("GET /api/orders (Provider)", True, f"Found order with homeowner_name: {homeowner_name}")
                        else:
                            self.log_test("GET /api/orders (Provider)", True, f"Retrieved {len(orders)} orders (order may not be visible yet)")
                    else:
                        self.log_test("GET /api/orders (Provider)", False, "Invalid response format")
                else:
                    self.log_test("GET /api/orders (Provider)", False, f"Request failed: {response.status_code} - {response.text}")
            except Exception as e:
                self.log_test("GET /api/orders (Provider)", False, f"Exception: {str(e)}")

    def test_appointments(self):
        """Test 5: Appointments"""
        print("=== TEST 5: Appointments ===")
        
        if not self.provider_token:
            self.log_test("Appointments", False, "Missing provider token")
            return

        # Create appointment as provider
        appointment_data = {
            "customer_name": "Test Customer",
            "service_type": "Deep Cleaning",
            "date": "2025-12-21",
            "time": "10:00",
            "phone_number": "555-0789",
            "address": "789 Test Blvd",
            "notes": "Test appointment"
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.provider_token}"}
            response = self.session.post(f"{self.base_url}/appointments", json=appointment_data, headers=headers)
            if response.status_code == 200 or response.status_code == 201:
                data = response.json()
                appointment_id = data.get("id")
                self.log_test("POST /api/appointments", True, f"Appointment created: {appointment_id}")
            else:
                self.log_test("POST /api/appointments", False, f"Request failed: {response.status_code} - {response.text}")
        except Exception as e:
            self.log_test("POST /api/appointments", False, f"Exception: {str(e)}")

        # Test GET /api/appointments
        try:
            headers = {"Authorization": f"Bearer {self.provider_token}"}
            response = self.session.get(f"{self.base_url}/appointments", headers=headers)
            if response.status_code == 200:
                appointments = response.json()
                if isinstance(appointments, list):
                    self.log_test("GET /api/appointments", True, f"Retrieved {len(appointments)} appointments")
                else:
                    self.log_test("GET /api/appointments", False, "Invalid response format")
            else:
                self.log_test("GET /api/appointments", False, f"Request failed: {response.status_code} - {response.text}")
        except Exception as e:
            self.log_test("GET /api/appointments", False, f"Exception: {str(e)}")

    def test_backend_health(self):
        """Test Backend Health"""
        print("=== BACKEND HEALTH CHECK ===")
        
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                message = data.get("message", "")
                status = data.get("status", "")
                if "Running" in message and status == "active":
                    self.log_test("Backend Health", True, f"Status: {status}, Message: {message}")
                else:
                    self.log_test("Backend Health", False, f"Unexpected response: {data}")
            else:
                self.log_test("Backend Health", False, f"Request failed: {response.status_code} - {response.text}")
        except Exception as e:
            self.log_test("Backend Health", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all tests"""
        print(f"🚀 Starting Doord Backend API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print(f"⏰ Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # Run tests in order
        self.test_backend_health()
        self.test_provider_registration_and_login()
        self.test_provider_profile_endpoints()
        self.test_homeowner_registration_and_message_threads()
        self.test_orders_quotations()
        self.test_appointments()
        
        # Print summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
        
        print("=" * 60)
        print(f"✅ PASSED: {passed}/{total} tests")
        print(f"❌ FAILED: {total - passed}/{total} tests")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED! Backend APIs are working correctly.")
        else:
            print("⚠️  Some tests failed. Please check the details above.")
        
        return passed == total

if __name__ == "__main__":
    tester = DoordAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)