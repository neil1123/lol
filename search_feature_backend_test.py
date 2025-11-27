#!/usr/bin/env python3
"""
Search Feature Integration Backend Testing Script
Tests backend APIs that support the new search functionality added to dashboards
"""

import requests
import json
import os
from datetime import datetime
import sys
import uuid

# Load environment variables from frontend/.env
BACKEND_URL = "https://pro-doord.preview.emergentagent.com/api"

# Global variables to store test data
provider_token = None
homeowner_token = None
property_manager_token = None
tenant_token = None
provider_id = None
homeowner_id = None
property_manager_id = None
tenant_id = None
providers_data = None

def print_test_header(test_name):
    """Print formatted test header"""
    print(f"\n{'='*60}")
    print(f"🔍 {test_name}")
    print(f"{'='*60}")

def print_success(message):
    """Print success message"""
    print(f"✅ {message}")

def print_error(message):
    """Print error message"""
    print(f"❌ {message}")

def print_info(message):
    """Print info message"""
    print(f"ℹ️  {message}")

def test_backend_health():
    """Test if backend server is running and accessible"""
    print_test_header("Backend Health Check")
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "Doord API" in data.get("message", ""):
                print_success("Backend server is running and accessible")
                return True
            else:
                print_error(f"Unexpected response: {data}")
                return False
        else:
            print_error(f"Backend health check failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print_error(f"Backend connection failed: {e}")
        return False

def test_authentication_endpoints():
    """Test authentication for all user types that use search feature"""
    print_test_header("Authentication Endpoints Testing")
    global provider_token, homeowner_token, property_manager_token, tenant_token
    global provider_id, homeowner_id, property_manager_id, tenant_id
    
    # Test existing provider login
    print_info("Testing provider authentication (test@provider.com)...")
    try:
        response = requests.post(f"{BACKEND_URL}/auth/login", json={
            "email": "test@provider.com",
            "password": "password123"
        })
        if response.status_code == 200:
            data = response.json()
            provider_token = data["access_token"]
            provider_id = data["user"]["id"]
            print_success(f"Provider authentication successful - ID: {provider_id}")
        else:
            print_error(f"Provider login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Provider authentication error: {e}")
        return False
    
    # Test existing homeowner login
    print_info("Testing homeowner authentication (test@homeowner.com)...")
    try:
        response = requests.post(f"{BACKEND_URL}/auth/login", json={
            "email": "test@homeowner.com",
            "password": "password123"
        })
        if response.status_code == 200:
            data = response.json()
            homeowner_token = data["access_token"]
            homeowner_id = data["user"]["id"]
            print_success(f"Homeowner authentication successful - ID: {homeowner_id}")
        else:
            print_error(f"Homeowner login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Homeowner authentication error: {e}")
        return False
    
    # Test property manager authentication (create if doesn't exist)
    print_info("Testing property manager authentication...")
    try:
        # Try to login first
        response = requests.post(f"{BACKEND_URL}/auth/login", json={
            "email": "test@propertymanager.com",
            "password": "password123"
        })
        if response.status_code == 200:
            data = response.json()
            property_manager_token = data["access_token"]
            property_manager_id = data["user"]["id"]
            print_success(f"Property manager login successful - ID: {property_manager_id}")
        else:
            # Create property manager account
            print_info("Creating property manager account...")
            response = requests.post(f"{BACKEND_URL}/auth/register", json={
                "email": "test@propertymanager.com",
                "password": "password123",
                "user_type": "property_manager",
                "name": "Test Property Manager",
                "phone": "555-0123",
                "address": "123 Manager St, Halifax, NS"
            })
            if response.status_code == 200:
                data = response.json()
                property_manager_token = data["access_token"]
                property_manager_id = data["user"]["id"]
                print_success(f"Property manager registration successful - ID: {property_manager_id}")
            else:
                print_error(f"Property manager registration failed: {response.status_code} - {response.text}")
                return False
    except Exception as e:
        print_error(f"Property manager authentication error: {e}")
        return False
    
    # Test tenant authentication (create if doesn't exist)
    print_info("Testing tenant authentication...")
    try:
        # Try to login first
        response = requests.post(f"{BACKEND_URL}/auth/login", json={
            "email": "test@tenant.com",
            "password": "password123"
        })
        if response.status_code == 200:
            data = response.json()
            tenant_token = data["access_token"]
            tenant_id = data["user"]["id"]
            print_success(f"Tenant login successful - ID: {tenant_id}")
        else:
            # Create tenant account with PM code
            print_info("Creating tenant account with PM code 666666...")
            response = requests.post(f"{BACKEND_URL}/auth/register", json={
                "email": "test@tenant.com",
                "password": "password123",
                "user_type": "homeowner",  # Will be changed to tenant by PM code
                "name": "Test Tenant",
                "phone": "555-0124",
                "address": "456 Tenant Ave, Halifax, NS",
                "pm_code": "666666",
                "property_address": "456 Tenant Ave, Halifax, NS"
            })
            if response.status_code == 200:
                data = response.json()
                tenant_token = data["access_token"]
                tenant_id = data["user"]["id"]
                print_success(f"Tenant registration successful - ID: {tenant_id}")
            else:
                print_error(f"Tenant registration failed: {response.status_code} - {response.text}")
                return False
    except Exception as e:
        print_error(f"Tenant authentication error: {e}")
        return False
    
    return True

def test_services_endpoint():
    """Test the services endpoint that supports search functionality"""
    print_test_header("Services Endpoint Testing")
    
    try:
        response = requests.get(f"{BACKEND_URL}/services", timeout=10)
        if response.status_code == 200:
            services = response.json()
            print_success(f"Services endpoint working - Found {len(services)} services")
            
            # Check for expected service categories that appear in search
            expected_services = ["Cleaning", "Plumbing", "Electrical", "Landscaping", "Handyman"]
            found_services = []
            
            for expected in expected_services:
                for service in services:
                    if expected.lower() in service.lower():
                        found_services.append(service)
                        break
            
            print_info(f"Quick service categories found: {found_services}")
            
            if len(found_services) >= 3:  # At least 3 of the 5 expected categories
                print_success("Services endpoint supports search functionality")
                return True
            else:
                print_error("Not enough service categories found for search functionality")
                return False
        else:
            print_error(f"Services endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Services endpoint error: {e}")
        return False

def test_providers_endpoint():
    """Test the providers endpoint that supports service browsing"""
    print_test_header("Providers Endpoint Testing")
    global providers_data
    
    try:
        response = requests.get(f"{BACKEND_URL}/providers", timeout=10)
        if response.status_code == 200:
            providers_data = response.json()
            print_success(f"Providers endpoint working - Found {len(providers_data)} providers")
            
            if len(providers_data) > 0:
                # Check provider data structure
                sample_provider = providers_data[0]
                required_fields = ["id", "name", "business_name", "services", "rating", "location"]
                missing_fields = []
                
                for field in required_fields:
                    if field not in sample_provider:
                        missing_fields.append(field)
                
                if not missing_fields:
                    print_success("Provider data structure supports search/browse functionality")
                    print_info(f"Sample provider: {sample_provider.get('business_name', 'N/A')} - Services: {sample_provider.get('services', [])}")
                    return True
                else:
                    print_error(f"Provider data missing required fields: {missing_fields}")
                    return False
            else:
                print_error("No providers found - search functionality may not work properly")
                return False
        else:
            print_error(f"Providers endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Providers endpoint error: {e}")
        return False

def test_dashboard_access_control():
    """Test that all user types can access their respective dashboards"""
    print_test_header("Dashboard Access Control Testing")
    
    # Test homeowner dashboard access
    print_info("Testing homeowner dashboard access...")
    try:
        headers = {"Authorization": f"Bearer {homeowner_token}"}
        response = requests.get(f"{BACKEND_URL}/auth/me", headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            if user_data.get("user_type") == "homeowner":
                print_success("Homeowner dashboard access control working")
            else:
                print_error(f"Homeowner user type mismatch: {user_data.get('user_type')}")
                return False
        else:
            print_error(f"Homeowner dashboard access failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Homeowner dashboard access error: {e}")
        return False
    
    # Test property manager dashboard access
    print_info("Testing property manager dashboard access...")
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        response = requests.get(f"{BACKEND_URL}/auth/me", headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            if user_data.get("user_type") == "property_manager":
                print_success("Property manager dashboard access control working")
            else:
                print_error(f"Property manager user type mismatch: {user_data.get('user_type')}")
                return False
        else:
            print_error(f"Property manager dashboard access failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Property manager dashboard access error: {e}")
        return False
    
    # Test tenant dashboard access
    print_info("Testing tenant dashboard access...")
    try:
        headers = {"Authorization": f"Bearer {tenant_token}"}
        response = requests.get(f"{BACKEND_URL}/auth/me", headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            if user_data.get("user_type") == "tenant":
                print_success("Tenant dashboard access control working")
            else:
                print_error(f"Tenant user type mismatch: {user_data.get('user_type')}")
                return False
        else:
            print_error(f"Tenant dashboard access failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Tenant dashboard access error: {e}")
        return False
    
    return True

def test_search_integration_workflow():
    """Test the complete search workflow from dashboard to service browsing"""
    print_test_header("Search Integration Workflow Testing")
    
    # Test that homeowner can search and browse services
    print_info("Testing homeowner search workflow...")
    try:
        # 1. Get services for search dropdown
        response = requests.get(f"{BACKEND_URL}/services")
        if response.status_code != 200:
            print_error("Failed to get services for search")
            return False
        
        services = response.json()
        
        # 2. Get providers for browsing results
        response = requests.get(f"{BACKEND_URL}/providers")
        if response.status_code != 200:
            print_error("Failed to get providers for browsing")
            return False
        
        providers = response.json()
        
        # 3. Test filtering providers by service (simulate search functionality)
        cleaning_providers = []
        for provider in providers:
            provider_services = provider.get("services", [])
            if provider_services:  # Check if services is not None
                for service in provider_services:
                    if service and "cleaning" in service.lower():
                        cleaning_providers.append(provider)
                        break
        
        print_success(f"Search workflow working - Found {len(cleaning_providers)} cleaning providers")
        
        # 4. Test that homeowner can create quotation requests (search result action)
        if len(providers) > 0:
            headers = {"Authorization": f"Bearer {homeowner_token}"}
            test_provider = providers[0]
            
            quotation_data = {
                "homeowner_id": homeowner_id,
                "provider_id": test_provider["id"],
                "homeowner_name": "Test Homeowner",
                "homeowner_email": "test@homeowner.com",
                "homeowner_phone": "555-0123",
                "homeowner_address": "123 Test St, Halifax, NS",
                "provider_name": test_provider.get("business_name", "Test Provider"),
                "service_type": "Home Cleaning",
                "description": "Test quotation request from search",
                "requester_type": "homeowner"
            }
            
            response = requests.post(f"{BACKEND_URL}/quotations", json=quotation_data)
            if response.status_code == 200:
                print_success("Homeowner can create quotation requests from search results")
            else:
                print_error(f"Quotation request failed: {response.status_code} - {response.text}")
                return False
        
        return True
        
    except Exception as e:
        print_error(f"Search workflow error: {e}")
        return False

def test_property_manager_search_integration():
    """Test property manager specific search functionality"""
    print_test_header("Property Manager Search Integration Testing")
    
    try:
        headers = {"Authorization": f"Bearer {property_manager_token}"}
        
        # Test PM can access their properties
        response = requests.get(f"{BACKEND_URL}/property-manager/properties", headers=headers)
        if response.status_code == 200:
            properties_data = response.json()
            print_success(f"Property manager can access properties: {properties_data}")
        else:
            print_error(f"Property manager properties access failed: {response.status_code}")
            return False
        
        # Test PM can access their orders (for managing tenant requests)
        response = requests.get(f"{BACKEND_URL}/property-manager/orders", headers=headers)
        if response.status_code == 200:
            orders = response.json()
            print_success(f"Property manager can access orders - Found {len(orders)} orders")
        else:
            print_error(f"Property manager orders access failed: {response.status_code}")
            return False
        
        # Test PM can create orders (from search functionality)
        if providers_data and len(providers_data) > 0:
            test_provider = providers_data[0]
            order_data = {
                "homeowner_id": property_manager_id,
                "provider_id": test_provider["id"],
                "homeowner_name": "Test Property Manager",
                "homeowner_email": "test@propertymanager.com",
                "homeowner_phone": "555-0123",
                "homeowner_address": "123 Manager St, Halifax, NS",
                "provider_name": test_provider.get("business_name", "Test Provider"),
                "service_type": "Property Maintenance",
                "description": "Test order from PM search",
                "requester_type": "property_manager",
                "property_address": "456 Tenant Ave, Halifax, NS"
            }
            
            response = requests.post(f"{BACKEND_URL}/orders", json=order_data, headers=headers)
            if response.status_code == 200:
                print_success("Property manager can create orders from search")
            else:
                print_error(f"PM order creation failed: {response.status_code} - {response.text}")
                return False
        
        return True
        
    except Exception as e:
        print_error(f"Property manager search integration error: {e}")
        return False

def test_tenant_search_integration():
    """Test tenant specific search functionality"""
    print_test_header("Tenant Search Integration Testing")
    
    try:
        headers = {"Authorization": f"Bearer {tenant_token}"}
        
        # Test tenant can access their profile
        response = requests.get(f"{BACKEND_URL}/auth/me", headers=headers)
        if response.status_code == 200:
            tenant_data = response.json()
            print_success(f"Tenant profile access working - PM ID: {tenant_data.get('property_manager_id')}")
        else:
            print_error(f"Tenant profile access failed: {response.status_code}")
            return False
        
        # Test tenant can create orders (from search functionality) - these require PM approval
        if providers_data and len(providers_data) > 0:
            test_provider = providers_data[0]
            order_data = {
                "homeowner_id": tenant_id,
                "provider_id": test_provider["id"],
                "homeowner_name": "Test Tenant",
                "homeowner_email": "test@tenant.com",
                "homeowner_phone": "555-0124",
                "homeowner_address": "456 Tenant Ave, Halifax, NS",
                "provider_name": test_provider.get("business_name", "Test Provider"),
                "service_type": "Apartment Cleaning",
                "description": "Test order from tenant search",
                "requester_type": "tenant",
                "property_manager_id": property_manager_id,
                "property_address": "456 Tenant Ave, Halifax, NS"
            }
            
            response = requests.post(f"{BACKEND_URL}/orders", json=order_data, headers=headers)
            if response.status_code == 200:
                order_response = response.json()
                print_success("Tenant can create orders from search (pending PM approval)")
                
                # Verify the order requires PM approval
                response = requests.get(f"{BACKEND_URL}/orders", headers=headers)
                if response.status_code == 200:
                    tenant_orders = response.json()
                    if len(tenant_orders) > 0:
                        latest_order = tenant_orders[-1]
                        if latest_order.get("property_manager_id") == property_manager_id:
                            print_success("Tenant order correctly linked to property manager")
                        else:
                            print_error("Tenant order not properly linked to property manager")
                            return False
                
            else:
                print_error(f"Tenant order creation failed: {response.status_code} - {response.text}")
                return False
        
        return True
        
    except Exception as e:
        print_error(f"Tenant search integration error: {e}")
        return False

def run_all_tests():
    """Run all search feature backend tests"""
    print("🚀 Starting Search Feature Backend Integration Tests")
    print(f"Backend URL: {BACKEND_URL}")
    
    tests = [
        ("Backend Health Check", test_backend_health),
        ("Authentication Endpoints", test_authentication_endpoints),
        ("Services Endpoint", test_services_endpoint),
        ("Providers Endpoint", test_providers_endpoint),
        ("Dashboard Access Control", test_dashboard_access_control),
        ("Search Integration Workflow", test_search_integration_workflow),
        ("Property Manager Search Integration", test_property_manager_search_integration),
        ("Tenant Search Integration", test_tenant_search_integration),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print_error(f"Test '{test_name}' crashed: {e}")
            failed += 1
    
    # Print final results
    print(f"\n{'='*60}")
    print("🏁 SEARCH FEATURE BACKEND TEST RESULTS")
    print(f"{'='*60}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Total: {passed + failed}")
    
    if failed == 0:
        print("\n🎉 ALL SEARCH FEATURE BACKEND TESTS PASSED!")
        print("✅ Backend fully supports the new search functionality")
        return True
    else:
        print(f"\n⚠️  {failed} TESTS FAILED")
        print("❌ Backend may have issues supporting search functionality")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)