import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { CheckCircle, XCircle, Clock, Eye, Calendar } from 'lucide-react';
import apiService from '../../services/api';

const PropertyManagerOrders = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('pending-approval');
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
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
      loadOrders();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/property-manager/auth');
    }
  }, [navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await apiService.getPropertyManagerOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      await apiService.approvePropertyManagerOrder(orderId);
      await loadOrders(); // Reload orders
      alert('Order approved successfully!');
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Failed to approve order. Please try again.');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleDenyOrder = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      await apiService.denyPropertyManagerOrder(orderId);
      await loadOrders(); // Reload orders
      alert('Order denied.');
    } catch (error) {
      console.error('Error denying order:', error);
      alert('Failed to deny order. Please try again.');
    } finally {
      setProcessingOrder(null);
    }
  };

  // Filter orders by status
  const pendingApprovalOrders = orders.filter(order => 
    order.status === 'pending_pm_approval'
  );
  
  const activeOrders = orders.filter(order => 
    ['pending_quotation', 'quoted', 'accepted', 'confirmed'].includes(order.status) && 
    order.pm_approved !== false
  );
  
  const completedOrders = orders.filter(order => 
    order.status === 'completed' || order.status === 'denied'
  );

  const getStatusColor = (status, pmApproved) => {
    if (status === 'pending_pm_approval') return 'bg-yellow-100 text-yellow-800';
    if (status === 'denied' || pmApproved === false) return 'bg-red-100 text-red-800';
    
    const statusColors = {
      'pending_quotation': 'bg-blue-100 text-blue-800',
      'quoted': 'bg-purple-100 text-purple-800',
      'accepted': 'bg-green-100 text-green-800',
      'confirmed': 'bg-emerald-100 text-emerald-800',
      'completed': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (order) => {
    if (order.status === 'pending_pm_approval') return 'Awaiting Your Approval';
    if (order.pm_approved === false) return 'Denied by You';
    if (order.status === 'pending_quotation') return 'Sent to Provider';
    if (order.status === 'quoted') return 'Quote Received';
    if (order.status === 'accepted') return 'Accepted by Tenant';
    if (order.status === 'confirmed') return 'Service Confirmed';
    if (order.status === 'completed') return 'Service Completed';
    if (order.status === 'denied') return 'Cancelled';
    return order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const renderOrderCard = (order, showApprovalButtons = false) => (
    <Card key={order.id} className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{order.service_type}</h3>
            <p className="text-sm text-gray-600">
              {order.requester_type === 'tenant' ? 'Tenant' : 'Requestor'}: {order.homeowner_name}
            </p>
            <p className="text-sm text-gray-600">Provider: {order.provider_name}</p>
            <p className="text-sm text-gray-600">Property: {order.property_address || order.homeowner_address}</p>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(order.status, order.pm_approved)}>
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

        {order.services && order.services.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Services Requested:</h4>
            <div className="flex flex-wrap gap-2">
              {order.services.map((service, index) => (
                <Badge key={index} variant="outline">{service}</Badge>
              ))}
            </div>
          </div>
        )}

        {order.quotation_amount && (
          <div className="bg-green-50 p-4 rounded-lg mb-4">
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

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          {order.budget && (
            <div><span className="font-medium">Budget:</span> {order.budget}</div>
          )}
          {order.urgency && (
            <div><span className="font-medium">Urgency:</span> {order.urgency}</div>
          )}
          {order.preferred_date && (
            <div><span className="font-medium">Preferred Date:</span> {order.preferred_date}</div>
          )}
          {order.preferred_time && (
            <div><span className="font-medium">Preferred Time:</span> {order.preferred_time}</div>
          )}
        </div>

        {/* Approval Buttons for Pending Orders */}
        {showApprovalButtons && order.status === 'pending_pm_approval' && (
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              onClick={() => handleApproveOrder(order.id)}
              disabled={processingOrder === order.id}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {processingOrder === order.id ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Approving...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Request
                </div>
              )}
            </Button>
            <Button
              onClick={() => handleDenyOrder(order.id)}
              disabled={processingOrder === order.id}
              variant="destructive"
              className="flex-1"
            >
              {processingOrder === order.id ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Denying...
                </div>
              ) : (
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 mr-2" />
                  Deny Request
                </div>
              )}
            </Button>
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
          <p className="mt-2 text-gray-600">Loading orders...</p>
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
              <span className="text-gray-600 ml-2">Property Manager - Orders</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/property-manager/dashboard')}
              >
                Back to Dashboard
              </Button>
              <span className="text-gray-700">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h2>
            <p className="text-gray-600">Review and approve tenant service requests</p>
          </div>

          {/* Orders Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending-approval">
                    <Clock className="h-4 w-4 mr-2" />
                    Pending Approval ({pendingApprovalOrders.length})
                  </TabsTrigger>
                  <TabsTrigger value="active-orders">
                    <Eye className="h-4 w-4 mr-2" />
                    Active Orders ({activeOrders.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed-orders">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed ({completedOrders.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending-approval" className="mt-6">
                  {pendingApprovalOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No orders pending approval</p>
                    </div>
                  ) : (
                    <div>
                      {pendingApprovalOrders.map(order => renderOrderCard(order, true))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="active-orders" className="mt-6">
                  {activeOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No active orders</p>
                    </div>
                  ) : (
                    <div>
                      {activeOrders.map(order => renderOrderCard(order, false))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed-orders" className="mt-6">
                  {completedOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No completed orders</p>
                    </div>
                  ) : (
                    <div>
                      {completedOrders.map(order => renderOrderCard(order, false))}
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

export default PropertyManagerOrders;