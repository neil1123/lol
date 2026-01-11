import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { CheckCircle, XCircle, Clock, Eye, Send, User, Zap } from 'lucide-react';
import apiService from '../../services/api';
import SendToProviderModal from '../../components/SendToProviderModal';
import QuickSendToProvider from '../../components/QuickSendToProvider';

const PropertyManagerOrders = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [issues, setIssues] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('issue-reports');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolvingIssue, setResolvingIssue] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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
      await loadOrders();
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
      await loadOrders();
      alert('Order denied.');
    } catch (error) {
      console.error('Error denying order:', error);
      alert('Failed to deny order. Please try again.');
    } finally {
      setProcessingOrder(null);
    }
  };

  // Filter orders by status
  const pendingApprovalOrders = orders.filter(order => order.status === 'pending_pm_approval');
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
    loadOrders();
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
    <Card key={order.id} className="mb-3 sm:mb-6" data-testid={`order-card-${order.id}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{order.service_type}</h3>
            <p className="text-sm text-gray-600 truncate">
              Tenant: {order.homeowner_name}
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

        {showApprovalButtons && order.status === 'pending_pm_approval' && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
            <Button
              onClick={() => handleApproveOrder(order.id)}
              disabled={processingOrder === order.id}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
              data-testid={`approve-order-${order.id}`}
            >
              {processingOrder === order.id ? 'Approving...' : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Request
                </>
              )}
            </Button>
            <Button
              onClick={() => handleDenyOrder(order.id)}
              disabled={processingOrder === order.id}
              variant="destructive"
              className="flex-1 text-sm"
              data-testid={`deny-order-${order.id}`}
            >
              {processingOrder === order.id ? 'Denying...' : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Deny Request
                </>
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
    <div className="min-h-screen bg-gray-50" data-testid="pm-orders-page">
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
                data-testid="back-to-dashboard-btn"
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
            <p className="text-gray-600 text-sm sm:text-base">Review tenant issues and manage service requests</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-orange-500" 
              onClick={() => setActiveTab('issue-reports')}
              data-testid="issues-summary-card"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Tenant Issues</h3>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-orange-500" />
                      <span className="text-2xl font-bold text-orange-600">{pendingIssues.length}</span>
                      <span className="text-sm text-gray-500">pending</span>
                    </div>
                  </div>
                  <div className="text-orange-500">
                    <Send className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500" 
              onClick={() => setActiveTab('quotes')}
              data-testid="quotes-summary-card"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Provider Quotes</h3>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-blue-500" />
                      <span className="text-2xl font-bold text-blue-600">{quotes.length}</span>
                      <span className="text-sm text-gray-500">to review</span>
                    </div>
                  </div>
                  <div className="text-blue-500">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Tabs */}
          <Card>
            <CardContent className="p-3 sm:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 text-xs sm:text-sm">
                  <TabsTrigger value="issue-reports" className="flex items-center space-x-1" data-testid="issues-tab">
                    <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Issues ({pendingIssues.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="quotes" className="flex items-center space-x-1" data-testid="quotes-tab">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Quotes ({quotes.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="active-orders" className="flex items-center space-x-1" data-testid="active-orders-tab">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Active ({activeOrders.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="completed-orders" className="flex items-center space-x-1" data-testid="completed-orders-tab">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Done ({completedOrders.length})</span>
                  </TabsTrigger>
                </TabsList>

                {/* Issue Reports Tab - WITH QUICK SEND */}
                <TabsContent value="issue-reports" className="mt-4 sm:mt-6">
                  {pendingIssues.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-base">No pending issues - all caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingIssues.map((issue) => (
                        <Card 
                          key={issue.id} 
                          className={`border-l-4 ${
                            issue.urgency_level === 'emergency' ? 'border-l-red-500' :
                            issue.urgency_level === 'urgent' ? 'border-l-orange-500' :
                            'border-l-yellow-500'
                          }`}
                          data-testid={`issue-card-${issue.id}`}
                        >
                          <CardContent className="p-4 sm:p-6">
                            {/* Issue Header */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                  {issue.issue_category || 'Issue Report'}
                                </h3>
                                <p className="text-sm text-gray-600">Tenant: {issue.tenant_name}</p>
                                {issue.unit_number && (
                                  <p className="text-sm text-gray-600">Unit: {issue.unit_number}</p>
                                )}
                                
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

                            {/* Issue Description */}
                            <div className="mb-4">
                              <p className="text-gray-700 text-sm sm:text-base">{issue.description}</p>
                            </div>

                            {/* AI Summary */}
                            {issue.ai_summary && (
                              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                                <h4 className="font-medium text-blue-900 mb-1 text-sm">AI Summary:</h4>
                                <p className="text-sm text-blue-800">{issue.ai_summary}</p>
                              </div>
                            )}

                            {/* Additional Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                              {issue.best_time && (
                                <div><span className="font-medium">Best Time:</span> {issue.best_time}</div>
                              )}
                              {issue.permission_to_enter && (
                                <div><span className="font-medium">Entry Permission:</span> {issue.permission_to_enter}</div>
                              )}
                            </div>

                            {/* QUICK SEND ACTION - SUPER EASY! */}
                            <div className="pt-4 border-t">
                              {!issue.assigned_provider_id ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                    <Zap className="h-4 w-4 text-orange-500" />
                                    <span>Quick Send to Provider</span>
                                  </div>
                                  <QuickSendToProvider 
                                    issue={issue} 
                                    onSuccess={handleSendSuccess} 
                                  />
                                  <div className="text-center">
                                    <button
                                      onClick={() => handleSendToProvider(issue)}
                                      className="text-xs text-gray-500 hover:text-blue-600 underline"
                                      data-testid={`advanced-send-${issue.id}`}
                                    >
                                      or use advanced options
                                    </button>
                                  </div>
                                </div>
                              ) : issue.status === 'in_progress' ? (
                                <Button
                                  onClick={() => handleResolveIssue(issue)}
                                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                                  data-testid={`resolve-issue-${issue.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Resolved
                                </Button>
                              ) : (
                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                  <CheckCircle className="h-5 w-5" />
                                  <span>Sent to {issue.assigned_provider_name} - Awaiting quote</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Quotes Tab */}
                <TabsContent value="quotes" className="mt-4 sm:mt-6">
                  {quotes.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-base">No pending quotes</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quotes.map((quote) => (
                        <Card key={quote.id} className="border-l-4 border-l-purple-500" data-testid={`quote-card-${quote.id}`}>
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                              <div className="flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                  {quote.service_type}
                                </h3>
                                <p className="text-sm text-gray-600">Tenant: {quote.homeowner_name}</p>
                                <p className="text-sm text-gray-600">Provider: {quote.provider_name}</p>
                                {quote.source_issue_id && (
                                  <Badge className="mt-2 bg-blue-100 text-blue-800">
                                    From Issue Report
                                  </Badge>
                                )}
                              </div>
                              <div className="text-left sm:text-right">
                                <div className="text-2xl font-bold text-purple-600">
                                  ${quote.quotation_amount}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(quote.created_at)}
                                </p>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2 text-sm">Quote Details:</h4>
                              <p className="text-gray-700 text-sm">
                                {quote.quotation_details || 'No details provided'}
                              </p>
                            </div>

                            {quote.quotation_valid_until && (
                              <div className="mb-4 text-sm text-gray-600">
                                <span className="font-medium">Valid Until:</span> {formatDate(quote.quotation_valid_until)}
                              </div>
                            )}

                            <div className="pt-4 border-t flex flex-col sm:flex-row gap-2">
                              <Button
                                onClick={() => handleApproveQuote(quote.id)}
                                disabled={processingOrder === quote.id}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                data-testid={`approve-quote-${quote.id}`}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {processingOrder === quote.id ? 'Processing...' : 'Approve Quote'}
                              </Button>
                              <Button
                                onClick={() => handleRejectQuote(quote.id)}
                                disabled={processingOrder === quote.id}
                                variant="outline"
                                className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                                data-testid={`reject-quote-${quote.id}`}
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

                {/* Active Orders Tab */}
                <TabsContent value="active-orders" className="mt-4 sm:mt-6">
                  {activeOrders.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-base">No active orders</p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {activeOrders.map(order => renderOrderCard(order, false))}
                    </div>
                  )}
                </TabsContent>

                {/* Completed Orders Tab */}
                <TabsContent value="completed-orders" className="mt-4 sm:mt-6">
                  {completedOrders.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-base">No completed orders</p>
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

      {/* Send to Provider Modal (Advanced Options) */}
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

      {/* Resolve Issue Modal */}
      {showResolveModal && resolvingIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="bg-green-600 text-white p-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-xl font-bold">Resolve Issue</h2>
              <button 
                onClick={() => setShowResolveModal(false)} 
                className="hover:bg-green-700 p-1 rounded"
                data-testid="close-resolve-modal"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">{resolvingIssue.issue_category}</h3>
                <p className="text-sm text-gray-600">Tenant: {resolvingIssue.tenant_name}</p>
                {resolvingIssue.unit_number && (
                  <p className="text-sm text-gray-600">Unit: {resolvingIssue.unit_number}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Notes *
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe how the issue was resolved..."
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="4"
                  data-testid="resolution-notes-input"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowResolveModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmResolveIssue}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="confirm-resolve-btn"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagerOrders;
