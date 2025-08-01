import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import apiService from '../../services/api';

const PropertyManagerDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalTenants: 0,
    pendingApprovals: 0,
    activeOrders: 0
  });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
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
      loadDashboardData();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/property-manager/auth');
    }
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load tenants, orders, and properties
      const [tenants, orders, properties] = await Promise.all([
        apiService.getPropertyManagerTenants(),
        apiService.getPropertyManagerOrders(),
        apiService.getPropertyManagerProperties()
      ]);

      // Calculate stats
      const pendingApprovalOrders = orders.filter(order => order.status === 'pending_pm_approval');
      const activeOrders = orders.filter(order => ['pending_quotation', 'quoted', 'accepted', 'confirmed'].includes(order.status));
      
      setStats({
        totalProperties: properties.properties?.length || 0,
        totalTenants: tenants.length,
        pendingApprovals: pendingApprovalOrders.length,
        activeOrders: activeOrders.length
      });

      setPendingOrders(pendingApprovalOrders.slice(0, 5)); // Show latest 5
      
      // Create recent activity from orders
      const sortedOrders = orders.sort((a, b) => new Date(b.request_date) - new Date(a.request_date));
      setRecentActivity(sortedOrders.slice(0, 8));
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/property-manager');
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending_pm_approval': 'bg-yellow-100 text-yellow-800',
      'pending_quotation': 'bg-blue-100 text-blue-800',
      'quoted': 'bg-purple-100 text-purple-800',
      'accepted': 'bg-green-100 text-green-800',
      'confirmed': 'bg-emerald-100 text-emerald-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
      'denied': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
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
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Doord</h1>
              <span className="text-gray-600 ml-2">Property Manager Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/property-manager/orders')}
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Orders
                </button>
                <button
                  onClick={() => navigate('/property-manager/tenants')}
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Tenants
                </button>
                <button
                  onClick={() => navigate('/property-manager/properties')}
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Properties
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Properties</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalProperties}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tenants</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalTenants}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.pendingApprovals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.activeOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending approvals</p>
                ) : (
                  <div className="space-y-3">
                    {pendingOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{order.service_type}</h4>
                          <p className="text-sm text-gray-600">{order.homeowner_name}</p>
                          <p className="text-sm text-gray-500">Property: {order.homeowner_address}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            Awaiting Approval
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(order.request_date)}</p>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => navigate('/property-manager/orders')}
                      className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2"
                    >
                      View All Approvals →
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{order.service_type}</h4>
                          <p className="text-sm text-gray-600">{order.homeowner_name}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(order.request_date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyManagerDashboard;