import React from 'react';
import { useNavigate } from 'react-router-dom';

const PropertyManagerLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Doord</h1>
              <span className="text-gray-600 ml-2">for Property Managers</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/property-manager/auth')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/property-manager/auth')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Streamline Property</span>
            <span className="block text-blue-600">Service Management</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Manage service requests across all your properties. Approve tenant bookings, 
            oversee maintenance, and maintain service quality with Doord's property management platform.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <button
              onClick={() => navigate('/property-manager/auth')}
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Start Managing Properties
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900">
              Built for Property Managers
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to manage service requests across your property portfolio
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white mx-auto mb-4">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Approve Service Requests
              </h4>
              <p className="text-gray-600">
                Review and approve tenant service requests before they're sent to providers. 
                Maintain control over property maintenance spending.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white mx-auto mb-4">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Multi-Property Management
              </h4>
              <p className="text-gray-600">
                Manage service requests across your entire property portfolio from one dashboard. 
                Track maintenance history and costs per property.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white mx-auto mb-4">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Tenant Management
              </h4>
              <p className="text-gray-600">
                Onboard tenants with unique codes. Monitor their service requests and 
                ensure quality maintenance across all your properties.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <h3 className="text-3xl font-bold text-white">
            Ready to streamline your property management?
          </h3>
          <p className="mt-4 text-lg text-blue-100">
            Join property managers who trust Doord to handle their service coordination
          </p>
          <button
            onClick={() => navigate('/property-manager/auth')}
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto transition-colors"
          >
            Get Started Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-bold text-white mb-4">Doord</h4>
            <div className="flex justify-center space-x-8 text-gray-300">
              <button
                onClick={() => navigate('/')}
                className="hover:text-white transition-colors"
              >
                For Homeowners
              </button>
              <button
                onClick={() => navigate('/homeservices')}
                className="hover:text-white transition-colors"
              >
                For Service Providers
              </button>
              <button
                onClick={() => navigate('/property-manager')}
                className="hover:text-white transition-colors"
              >
                For Property Managers
              </button>
            </div>
            <p className="mt-6 text-gray-400">
              © 2024 Doord. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PropertyManagerLanding;