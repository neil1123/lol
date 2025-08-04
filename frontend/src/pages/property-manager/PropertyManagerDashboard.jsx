import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, ArrowRight } from 'lucide-react';
import apiService from '../../services/api';

const PropertyManagerDashboard = () => {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalTenants: 0,
    pendingApprovals: 0,
    activeOrders: 0
  });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [tenants, setTenants] = useState([]);
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
      setTenants(tenants.slice(0, 4)); // Show latest 4 tenants in dashboard
      
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0">
            <div className="flex items-center mb-4 sm:mb-0">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Doord</h1>
              <span className="text-gray-600 ml-2 text-sm sm:text-base">Property Manager Dashboard</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <span className="text-gray-700 text-sm sm:text-base">Welcome, {user?.name}</span>
              <div className="flex flex-wrap gap-2">
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
                  onClick={() => navigate('/property-manager/properties')}
                  className="text-gray-600 hover:text-blue-600 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium"
                >
                  Properties
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
          {/* Hero Search Section */}
          <div className="mb-8 sm:mb-12">
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 sm:p-8 lg:p-12">
              {/* Background Elements */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute top-4 right-4 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 bg-blue-300/20 rounded-full blur-xl"></div>
              </div>

              {/* Main Content */}
              <div className="relative z-10 text-center">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Home Services{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    for Your Properties
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
                  Manage and book services for all your properties and tenants
                </p>

                {/* Search Bar */}
                <div className="relative max-w-xl mx-auto mb-4 sm:mb-6">
                  <div className="relative bg-white rounded-xl p-2 shadow-lg border border-gray-200">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          placeholder="What service do you need? (e.g., cleaning, plumbing)"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 py-3 text-sm sm:text-base border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:text-gray-500"
                        />
                      </div>
                      <Button 
                        size="lg" 
                        onClick={() => navigate(`/homeowners/browse?search=${searchTerm}`)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        Find Services
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Service Categories */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {['Cleaning', 'Plumbing', 'Electrical', 'Landscaping', 'Handyman'].map((service) => (
                    <Button
                      key={service}
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/homeowners/browse?service=${encodeURIComponent(service)}`)}
                      className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-blue-700 transition-all duration-300 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm"
                    >
                      {service}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
            <Card className="col-span-1">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-2 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Properties</p>
                    <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.totalProperties}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-2 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Tenants</p>
                    <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.totalTenants}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-2 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.pendingApprovals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-2 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Active</p>
                    <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.activeOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Pending Approvals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {pendingOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No pending approvals</p>
                ) : (
                  <div className="space-y-3">
                    {pendingOrders.map((order) => (
                      <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-yellow-50 rounded-lg space-y-2 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{order.service_type}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{order.homeowner_name}</p>
                          <p className="text-xs text-gray-500 truncate">Property: {order.homeowner_address}</p>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <Badge className={getStatusColor(order.status)} size="sm">
                            Awaiting Approval
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(order.request_date)}</p>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => navigate('/property-manager/orders')}
                      className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2 transition-colors"
                    >
                      View All Approvals →
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((order) => (
                      <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{order.service_type}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{order.homeowner_name}</p>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <Badge className={getStatusColor(order.status)} size="sm">
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