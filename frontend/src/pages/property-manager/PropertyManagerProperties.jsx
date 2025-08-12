import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Home, MapPin, Users, Plus, Trash2 } from 'lucide-react';
import apiService from '../../services/api';

const PropertyManagerProperties = () => {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newProperty, setNewProperty] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
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
      loadProperties();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/property-manager/auth');
    }
  }, [navigate]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const propertiesData = await apiService.getPropertyManagerProperties();
      setProperties(propertiesData.properties || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = () => {
    if (!newProperty.trim()) {
      setError('Please enter a property address');
      return;
    }

    // For now, we'll manage properties locally since there's no backend endpoint to add them
    // In a full implementation, you'd want to add a backend endpoint
    const updatedProperties = [...properties, newProperty.trim()];
    setProperties(updatedProperties);
    setNewProperty('');
    setShowAddForm(false);
    setError('');
  };

  const handleRemoveProperty = (propertyToRemove) => {
    const updatedProperties = properties.filter(property => property !== propertyToRemove);
    setProperties(updatedProperties);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/property-manager');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading properties...</p>
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
              <span className="text-gray-600 ml-2 text-sm sm:text-base">My Properties</span>
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
                  onClick={() => navigate('/property-manager/tenants')}
                  className="text-gray-600 hover:text-blue-600 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium"
                >
                  Tenants
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">My Properties</h2>
                <p className="text-gray-600 mt-2">Manage properties under your supervision</p>
              </div>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
            {user?.pm_code && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Your Tenant Onboarding Code:</strong> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{user.pm_code}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">When tenants register with this code, their property addresses will be automatically added here</p>
              </div>
            )}
          </div>

          {/* Add Property Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Property</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <input
                    type="text"
                    placeholder="Enter property address (e.g., 123 Main St, Halifax, NS)"
                    value={newProperty}
                    onChange={(e) => setNewProperty(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleAddProperty}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      Add
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewProperty('');
                        setError('');
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
              {error.includes('Failed to load') && (
                <Button variant="outline" onClick={loadProperties} className="mt-2">
                  Try Again
                </Button>
              )}
            </div>
          )}

          {/* Properties List */}
          {properties.length === 0 ? (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Yet</h3>
                <p className="text-gray-600 mb-4">
                  You haven't added any properties yet. Properties will be automatically added when tenants register using your PM code.
                </p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {properties.map((property, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Home className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            Property #{index + 1}
                          </h3>
                          <div className="flex items-start text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="break-words">{property}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                        <Button
                          onClick={() => handleRemoveProperty(property)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Properties Summary */}
          {properties.length > 0 && (
            <Card className="mt-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">{properties.length}</div>
                    <div className="text-sm text-gray-600">Total Properties</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">{properties.length}</div>
                    <div className="text-sm text-gray-600">Active Properties</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">
                      {user?.pm_code ? 1 : 0}
                    </div>
                    <div className="text-sm text-gray-600">Onboarding Code</div>
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

export default PropertyManagerProperties;