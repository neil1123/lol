import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { CheckCircle, XCircle, Clock, Eye, Calendar, Send, User } from 'lucide-react';
import apiService from '../../services/api';
import SendToProviderModal from '../../components/SendToProviderModal';

const PropertyManagerOrders = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [issues, setIssues] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('pending-approval');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolvingIssue, setResolvingIssue] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
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
      const [ordersData, issuesData, quotesData] = await Promise.all([
        apiService.getPropertyManagerOrders(),
        apiService.getIssues(),
        apiService.getPMQuotes()
      ]);
      setOrders(ordersData);
      setIssues(issuesData || []);
      setQuotes(quotesData || []);
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

  // Filter issues
  const pendingIssues = issues.filter(issue => 
    issue.status !== 'resolved' && issue.status !== 'cancelled'
  );
  const inProgressIssues = issues.filter(issue => issue.status === 'in_progress');
  const resolvedIssues = issues.filter(issue => issue.status === 'resolved');

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

  const handleSendToProvider = (issue) => {
    setSelectedIssue(issue);
    setShowSendModal(true);
  };

  const handleSendSuccess = () => {
    loadOrders(); // Reload data after sending
  };

  const handleApproveQuote = async (orderId) => {
    if (!window.confirm('Are you sure you want to approve this quote?')) return;
    
    try {
      setProcessingOrder(orderId);
      await apiService.approveQuote(orderId);
      alert('Quote approved successfully!');
      loadOrders();
    } catch (error) {
      console.error('Failed to approve quote:', error);
      alert('Failed to approve quote. Please try again.');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleRejectQuote = async (orderId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      setProcessingOrder(orderId);
      await apiService.rejectQuote(orderId, reason);
      alert('Quote rejected. Provider will be notified.');
      loadOrders();
    } catch (error) {
      console.error('Failed to reject quote:', error);
      alert('Failed to reject quote. Please try again.');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleResolveIssue = (issue) => {
    setResolvingIssue(issue);
    setResolutionNotes('');
    setShowResolveModal(true);
  };

  const confirmResolveIssue = async () => {
    if (!resolutionNotes.trim()) {
      alert('Please provide resolution notes');
      return;
    }
    
    try {
      await apiService.resolveIssue(resolvingIssue.id, resolutionNotes);
      alert('Issue marked as resolved!');
      setShowResolveModal(false);
      setResolvingIssue(null);
      setResolutionNotes('');
      loadOrders();
    } catch (error) {
      console.error('Failed to resolve issue:', error);
      alert('Failed to resolve issue. Please try again.');
    }
  };

  const renderOrderCard = (order, showApprovalButtons = false) => (
    <Card key={order.id} className="mb-3 sm:mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{order.service_type}</h3>
            <p className="text-sm text-gray-600 truncate">
              {order.requester_type === 'tenant' ? 'Tenant' : 'Requestor'}: {order.homeowner_name}
            </p>
            <p className="text-sm text-gray-600 truncate">Provider: {order.provider_name}</p>
            <p className="text-sm text-gray-600 truncate">Property: {order.property_address || order.homeowner_address}</p>
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <Badge className={getStatusColor(order.status, order.pm_approved)} size="sm">
              {getStatusText(order)}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              Requested: {formatDate(order.request_date)}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Service Description:</h4>
          <p className="text-gray-700 text-sm sm:text-base">{order.description}</p>
        </div>

        {order.services && order.services.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Services Requested:</h4>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {order.services.map((service, index) => (
                <Badge key={index} variant="outline" className="text-xs">{service}</Badge>
              ))}
            </div>
          </div>
        )}

        {order.quotation_amount && (
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg mb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
              <span className="font-medium text-green-800 text-sm sm:text-base">Quote Amount:</span>
              <span className="text-lg sm:text-xl font-bold text-green-600">
                ${order.quotation_amount}
              </span>
            </div>
            {order.quotation_details && (
              <p className="text-sm text-green-700 mt-2">{order.quotation_details}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm text-gray-600 mb-4">
          {order.budget && (


                <TabsContent value="quotes" className="mt-4 sm:mt-6">
                  {quotes.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <Eye className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm sm:text-base">No pending quotes</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quotes.map((order) => (
                        <Card key={order.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                              <div className="flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                  {order.service_type}
                                </h3>
                                <p className="text-sm text-gray-600">Tenant: {order.homeowner_name}</p>
                                <p className="text-sm text-gray-600">Provider: {order.provider_name}</p>
                                {order.source_issue_id && (
                                  <Badge className="mt-2 bg-blue-100 text-blue-800">
                                    From Issue Report
                                  </Badge>
                                )}
                              </div>
                              <div className="text-left sm:text-right">
                                <div className="text-2xl font-bold text-blue-600">
                                  ${order.quotation_amount}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(order.created_at)}
                                </p>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Quote Details:</h4>
                              <p className="text-gray-700 text-sm sm:text-base">
                                {order.quotation_details || 'No details provided'}
                              </p>
                            </div>

                            {order.quotation_valid_until && (
                              <div className="mb-4 text-sm text-gray-600">
                                <span className="font-medium">Valid Until:</span> {formatDate(order.quotation_valid_until)}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="pt-4 border-t flex flex-col sm:flex-row gap-2">
                              <Button
                                onClick={() => handleApproveQuote(order.id)}
                                disabled={processingOrder === order.id}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {processingOrder === order.id ? 'Processing...' : 'Approve Quote'}
                              </Button>
                              <Button
                                onClick={() => handleRejectQuote(order.id)}
                                disabled={processingOrder === order.id}
                                variant="outline"
                                className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

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
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
            <Button
              onClick={() => handleApproveOrder(order.id)}
              disabled={processingOrder === order.id}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
            >
              {processingOrder === order.id ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Approving...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Request
                </div>
              )}
            </Button>
            <Button
              onClick={() => handleDenyOrder(order.id)}
              disabled={processingOrder === order.id}
              variant="destructive"
              className="flex-1 text-sm"
            >
              {processingOrder === order.id ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Denying...
                </div>
              ) : (
                <div className="flex items-center justify-center">
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0">
            <div className="flex items-center mb-4 sm:mb-0">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Doord</h1>
              <span className="text-gray-600 ml-2 text-sm sm:text-base">PM - Orders</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/property-manager/dashboard')}
                className="text-sm"
              >
                Back to Dashboard
              </Button>
              <span className="text-gray-700 text-sm sm:text-base">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div>
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Order Management</h2>
            <p className="text-gray-600 text-sm sm:text-base">Review and approve tenant service requests</p>
          </div>

          {/* Summary Cards - Issue reports and Quotes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('issue-reports')}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Issue reports</h3>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-gray-600">Pending ({pendingIssues.length})</span>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('quotes')}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Quotes</h3>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-gray-600">Pending ({quotes.length})</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Tabs */}
          <Card>
            <CardContent className="p-3 sm:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 text-xs sm:text-sm">
                  <TabsTrigger value="issue-reports" className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Issues</span>
                    <span className="sm:hidden">({pendingIssues.length})</span>
                    <span className="hidden sm:inline">({pendingIssues.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="quotes" className="flex items-center space-x-1">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Quotes</span>
                    <span className="sm:hidden">({quotes.length})</span>
                    <span className="hidden sm:inline">({quotes.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="pending-approval" className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Pending</span>
                    <span className="sm:hidden">({pendingApprovalOrders.length})</span>
                    <span className="hidden sm:inline">({pendingApprovalOrders.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="active-orders" className="flex items-center space-x-1">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Active</span>
                    <span className="sm:hidden">({activeOrders.length})</span>
                    <span className="hidden sm:inline">({activeOrders.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="completed-orders" className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Completed</span>
                    <span className="sm:hidden">({completedOrders.length})</span>
                    <span className="hidden sm:inline">({completedOrders.length})</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="issue-reports" className="mt-4 sm:mt-6">
                  {pendingIssues.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm sm:text-base">No pending issue reports</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingIssues.map((issue) => (
                        <Card key={issue.id} className="border-l-4 border-l-orange-500">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                  {issue.issue_category || 'Issue Report'}
                                </h3>
                                <p className="text-sm text-gray-600 truncate">Tenant: {issue.tenant_name}</p>
                                {issue.unit_number && (
                                  <p className="text-sm text-gray-600">Unit: {issue.unit_number}</p>
                                )}
                                
                                {/* Show assigned provider if exists */}
                                {issue.assigned_provider_name && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <User className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm text-blue-600 font-medium">
                                      Assigned to: {issue.assigned_provider_name}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-left sm:text-right flex-shrink-0">
                                <Badge className={
                                  issue.urgency_level === 'emergency' ? 'bg-red-100 text-red-800' :
                                  issue.urgency_level === 'urgent' ? 'bg-orange-100 text-orange-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }>
                                  {issue.urgency_level || 'Normal'}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(issue.created_at)}
                                </p>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Description:</h4>
                              <p className="text-gray-700 text-sm sm:text-base">{issue.description}</p>
                            </div>

                            {issue.ai_summary && (
                              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                                <h4 className="font-medium text-blue-900 mb-1 text-sm">AI Summary:</h4>
                                <p className="text-sm text-blue-800">{issue.ai_summary}</p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                              {issue.best_time && (
                                <div><span className="font-medium">Best Time:</span> {issue.best_time}</div>
                              )}
                              {issue.permission_to_enter && (
                                <div><span className="font-medium">Entry Permission:</span> {issue.permission_to_enter}</div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            {!issue.assigned_provider_id ? (
                              <div className="pt-4 border-t">
                                <Button
                                  onClick={() => handleSendToProvider(issue)}
                                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Send to Service Provider
                                </Button>
                              </div>
                            ) : issue.status === 'in_progress' ? (
                              <div className="pt-4 border-t flex gap-2">
                                <Button
                                  onClick={() => handleResolveIssue(issue)}
                                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Resolved
                                </Button>
                              </div>
                            ) : (
                              <div className="pt-4 border-t">
                                <p className="text-sm text-green-600 font-medium">
                                  ✓ Sent to provider - Awaiting quote
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="pending-approval" className="mt-4 sm:mt-6">
                  {pendingApprovalOrders.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm sm:text-base">No orders pending approval</p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {pendingApprovalOrders.map(order => renderOrderCard(order, true))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="active-orders" className="mt-4 sm:mt-6">
                  {activeOrders.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <Eye className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm sm:text-base">No active orders</p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {activeOrders.map(order => renderOrderCard(order, false))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed-orders" className="mt-4 sm:mt-6">
                  {completedOrders.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm sm:text-base">No completed orders</p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {completedOrders.map(order => renderOrderCard(order, false))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Send to Provider Modal */}
      {showSendModal && selectedIssue && (
        <SendToProviderModal
          issue={selectedIssue}
          onClose={() => {
            setShowSendModal(false);
            setSelectedIssue(null);
          }}
          onSuccess={handleSendSuccess}
        />
      )}
    </div>
  );
};

export default PropertyManagerOrders;