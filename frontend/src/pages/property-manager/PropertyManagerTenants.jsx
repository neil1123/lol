import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ArrowLeft, User, Home, Phone, Mail, Calendar } from 'lucide-react';
import apiService from '../../services/api';

const PropertyManagerTenants = () => {
  const [user, setUser] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication and get user data
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/property-manager/auth');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.user_type !== 'property_manager') {
        navigate('/property-manager/auth');
        return;
      }
      setUser(parsedUser);
      loadTenants();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/property-manager/auth');
    }
  }, [navigate]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError('');
      const tenantsData = await apiService.getPropertyManagerTenants();
      setTenants(tenantsData);
    } catch (error) {
      console.error('Error loading tenants:', error);
      setError('Failed to load tenants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/property-manager');
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0">
            <div className="flex items-center mb-4 sm:mb-0">
              <Button
                variant="ghost"
                onClick={() => navigate('/property-manager/dashboard')}
                className="mr-4 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Doord</h1>
              <span className="text-gray-600 ml-2 text-sm sm:text-base">My Tenants</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <span className="text-gray-700 text-sm sm:text-base">Welcome, {user?.name}</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate('/property-manager/dashboard')}
                  className="text-gray-600 hover:text-blue-600 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/property-manager/orders')}
                  className="text-gray-600 hover:text-blue-600 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium"
                >
                  Orders
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div>
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">My Tenants</h2>
            <p className="text-gray-600 mt-2">Manage tenants who have registered using your onboarding code</p>
            {user?.pm_code && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Your Tenant Onboarding Code:</strong> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{user.pm_code}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">Share this code with tenants so they can register under your management</p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
              <Button variant="outline" onClick={loadTenants} className="mt-2">
                Try Again
              </Button>
            </div>
          )}

          {/* Tenants List */}
          {tenants.length === 0 ? (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tenants Yet</h3>
                <p className="text-gray-600 mb-4">
                  No tenants have registered using your onboarding code yet.
                </p>
                {user?.pm_code && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">Share your code with tenants:</p>
                    <p className="font-mono text-lg font-bold text-blue-600">{user.pm_code}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {tenants.map((tenant) => (
                <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{tenant.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        Tenant
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Contact Information */}
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{tenant.email}</span>
                        </div>
                        {tenant.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>{tenant.phone}</span>
                          </div>
                        )}
                        {tenant.property_address && (
                          <div className="flex items-start text-sm text-gray-600">
                            <Home className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="break-words">{tenant.property_address}</span>
                          </div>
                        )}
                      </div>

                      {/* Registration Date */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Registered: {formatDate(tenant.created_at)}</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex justify-between items-center pt-2">
                        <Badge 
                          variant={tenant.is_active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {tenant.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Summary Stats */}
          {tenants.length > 0 && (
            <Card className="mt-6 sm:mt-8">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{tenants.length}</div>
                    <div className="text-sm text-gray-600">Total Tenants</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {tenants.filter(t => t.is_active).length}
                    </div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {new Set(tenants.map(t => t.property_address).filter(Boolean)).size}
                    </div>
                    <div className="text-sm text-gray-600">Properties</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {user?.pm_code ? 1 : 0}
                    </div>
                    <div className="text-sm text-gray-600">Active Code</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default PropertyManagerTenants;