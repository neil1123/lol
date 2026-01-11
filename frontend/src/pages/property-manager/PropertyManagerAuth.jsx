import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import apiService from '../../services/api';

const PropertyManagerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    pm_code: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await apiService.login({ email: formData.email, password: formData.password });
      } else {
        // Registration - pm_code is optional during registration
        const userData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          user_type: 'property_manager',
          business_name: formData.name // Use name as business_name if not provided
        };
        
        // Add pm_code only if provided
        if (formData.pm_code && formData.pm_code.trim()) {
          userData.pm_code = formData.pm_code.trim().toUpperCase();
        }
        
        response = await apiService.register(userData);
      }

      if (response.user) {
        // Verify user is property manager
        if (response.user.user_type !== 'property_manager') {
          setError('This account is not a property manager account. Please use the correct login page.');
          return;
        }

        // Store auth data
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Navigate to property manager dashboard
        navigate('/property-manager/dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError(isLogin ? 'Login failed. Please try again.' : 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 
            className="text-2xl sm:text-3xl font-bold text-blue-600 cursor-pointer" 
            onClick={() => navigate('/property-manager')}
          >
            Doord
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">for Property Managers</p>
          <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your property manager account'}
          </h2>
        </div>

        {/* Auth Card */}
        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg sm:text-xl">
              {isLogin ? 'Property Manager Login' : 'Property Manager Registration'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
              </div>

              {/* Registration Fields */}
              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">Company/Full Name</Label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your company or full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your phone number (optional)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-sm font-medium">Business Address</Label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your business address (optional)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pm_code" className="text-sm font-medium">Tenant Onboarding Code (Optional)</Label>
                    <input
                      id="pm_code"
                      name="pm_code"
                      type="text"
                      value={formData.pm_code}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Create a unique code for your tenants (e.g., MANAGER123)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tenants will use this code to register under your management</p>
                  </div>
                </>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>

              {/* Toggle Login/Register */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setFormData({
                      email: '',
                      password: '',
                      name: '',
                      phone: '',
                      address: '',
                      pm_code: ''
                    });
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Back to Landing */}
        <div className="text-center">
          <button
            onClick={() => navigate('/property-manager')}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            ← Back to Property Manager Landing
          </button>
        </div>

        {/* Other User Types */}
        <div className="text-center text-sm text-gray-500">
          <p className="mb-2">Not a property manager?</p>
          <div className="flex flex-col sm:flex-row sm:justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Homeowner Login
            </button>
            <button
              onClick={() => navigate('/homeservices/auth')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Service Provider Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyManagerAuth;