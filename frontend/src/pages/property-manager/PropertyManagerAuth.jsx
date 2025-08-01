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
    address: ''
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
        response = await apiService.login(formData.email, formData.password);
      } else {
        const userData = {
          ...formData,
          user_type: 'property_manager'
        };
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 
            className="text-3xl font-bold text-blue-600 cursor-pointer" 
            onClick={() => navigate('/property-manager')}
          >
            Doord
          </h1>
          <p className="text-gray-600">for Property Managers</p>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your property manager account'}
          </h2>
        </div>

        {/* Auth Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isLogin ? 'Property Manager Login' : 'Property Manager Registration'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
              </div>

              {/* Registration Fields */}
              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="name">Company/Full Name</Label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your company or full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your phone number (optional)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Business Address</Label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your business address (optional)"
                    />
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
                      address: ''
                    });
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
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
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to Property Manager Landing
          </button>
        </div>

        {/* Other User Types */}
        <div className="text-center text-sm text-gray-500">
          <p>Not a property manager?</p>
          <div className="mt-2 space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800"
            >
              Homeowner Login
            </button>
            <button
              onClick={() => navigate('/homeservices/auth')}
              className="text-blue-600 hover:text-blue-800"
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