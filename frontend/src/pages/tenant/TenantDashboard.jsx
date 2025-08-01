import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import apiService from '../../services/api';

const TenantDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sent-requests');
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication and get user data
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/homeowners/auth');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.user_type !== 'tenant') {
        navigate('/homeowners/auth');
        return;
      }
      setUser(parsedUser);
      loadTenantOrders();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/homeowners/auth');
    }
  }, [navigate]);

  const loadTenantOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading tenant orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/homeowners');
  };

  // Filter orders by status for tenant workflow
  const sentRequests = orders.filter(order => 
    order.status === 'pending_quotation'  // Requests sent directly to providers
  );
  
  const waitingForApproval = orders.filter(order => 
    order.status === 'pending_pm_approval'  // Quotations awaiting PM approval
  );
  
  const confirmedOrders = orders.filter(order => 
    order.status === 'quoted' || ['accepted', 'confirmed', 'completed'].includes(order.status)
  );

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

  const getStatusText = (order) => {
    if (order.status === 'pending_quotation') return 'Sent to Provider';
    if (order.status === 'pending_pm_approval') return 'Quotation Awaiting PM Approval';
    if (order.status === 'quoted') return 'Quote Ready - Approved by PM';
    if (order.status === 'accepted') return 'Accepted';
    if (order.status === 'confirmed') return 'Confirmed';
    if (order.status === 'completed') return 'Completed';
    if (order.status === 'denied') return 'Denied';
    return order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const renderOrderCard = (order) => (
    <Card key={order.id} className="mb-4">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{order.service_type}</h3>
            <p className="text-sm text-gray-600">Provider: {order.provider_name}</p>
            <p className="text-sm text-gray-600">Property: {order.property_address || order.homeowner_address}</p>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order)}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              Requested: {formatDate(order.request_date)}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Service Description:</h4>
          <p className="text-gray-700">{order.description}</p>
        </div>

        {order.quotation_amount && (
          <div className="bg-green-50 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-green-800">Quote Amount:</span>
              <span className="text-xl font-bold text-green-600">
                ${order.quotation_amount}
              </span>
            </div>
            {order.quotation_details && (
              <p className="text-sm text-green-700 mt-2">{order.quotation_details}</p>
            )}
          </div>
        )}

        {order.budget && (
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Budget:</span> {order.budget}
          </div>
        )}

        {order.preferred_date && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Preferred Date:</span> {order.preferred_date}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tenant dashboard...</p>
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
              <span className="text-gray-600 ml-2 text-sm sm:text-base">Tenant Dashboard</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <span className="text-gray-700 text-sm sm:text-base">Welcome, {user?.name}</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate('/homeowners/browse')}
                  className="text-gray-600 hover:text-blue-600 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium"
                >
                  Browse Services
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
          {/* Welcome Card */}
          <Card className="mb-4 sm:mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h2>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Property: {user?.property_address || user?.address}
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    🏢 Tenant Account - Your requests require property manager approval
                  </p>
                </div>
                <div className="flex justify-center lg:justify-end">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">{sentRequests.length}</div>
                      <div className="text-xs text-gray-500">Sent</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-yellow-600">{waitingForApproval.length}</div>
                      <div className="text-xs text-gray-500">Pending</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-green-600">{confirmedOrders.length}</div>
                      <div className="text-xs text-gray-500">Confirmed</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Tabs */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Your Service Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
                  <TabsTrigger value="sent-requests" className="px-2 py-1">
                    <span className="hidden sm:inline">Sent Requests</span>
                    <span className="sm:hidden">Sent</span>
                    <span className="ml-1">({sentRequests.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="waiting-approval" className="px-2 py-1">
                    <span className="hidden sm:inline">Waiting Approval</span>
                    <span className="sm:hidden">Pending</span>
                    <span className="ml-1">({waitingForApproval.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="confirmed-orders" className="px-2 py-1">
                    <span className="hidden sm:inline">Confirmed</span>
                    <span className="sm:hidden">Done</span>
                    <span className="ml-1">({confirmedOrders.length})</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sent-requests" className="mt-4 sm:mt-6">
                  {sentRequests.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-gray-500 mb-4 text-sm sm:text-base">No sent requests yet</p>
                      <Button onClick={() => navigate('/homeowners/browse')} size="sm">
                        Browse Services
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {sentRequests.map(renderOrderCard)}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="waiting-approval" className="mt-4 sm:mt-6">
                  {waitingForApproval.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-gray-500 text-sm sm:text-base">No requests waiting for approval</p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {waitingForApproval.map(renderOrderCard)}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="confirmed-orders" className="mt-4 sm:mt-6">
                  {confirmedOrders.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-gray-500 text-sm sm:text-base">No confirmed orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {confirmedOrders.map(renderOrderCard)}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TenantDashboard;