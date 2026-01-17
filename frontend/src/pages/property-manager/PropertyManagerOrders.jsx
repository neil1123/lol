import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { CheckCircle, XCircle, Clock, Eye, Send, User, Zap, Calendar, DollarSign } from 'lucide-react';
import apiService from '../../services/api';
import SendToProviderModal from '../../components/SendToProviderModal';
import QuickSendToProvider from '../../components/QuickSendToProvider';
import IssueSizeClassifier from '../../components/IssueSizeClassifier';
import ScheduleServiceModal from '../../components/ScheduleServiceModal';
import PMCalendar from '../../components/PMCalendar';

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
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedOrderForSchedule, setSelectedOrderForSchedule] = useState(null);
  const [resolvingIssue, setResolvingIssue] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
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

  const handleApproveQuote = async (orderId) => {
    if (!window.confirm('Approve this quote and proceed to scheduling?')) return;
    
    try {
      setProcessingOrder(orderId);
      await apiService.approveQuote(orderId);
      
      // Find the order for scheduling
      const order = quotes.find(q => q.id === orderId);
      if (order) {
        setSelectedOrderForSchedule(order);
        setShowScheduleModal(true);
      }
      
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

  const handleSendToProvider = (issue) => {
    setSelectedIssue(issue);
    setShowSendModal(true);
  };

  const handleSendSuccess = () => {
    loadOrders();
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

  // Filter issues
  const pendingIssues = issues.filter(issue => 
    issue.status !== 'resolved' && issue.status !== 'cancelled'
  );

  // Filter orders by status
  const activeOrders = orders.filter(order => 
    ['pending_quotation', 'quoted', 'accepted', 'confirmed', 'scheduled'].includes(order.status)
  );
  const completedOrders = orders.filter(order => 
    order.status === 'completed' || order.status === 'denied'
  );

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getIssueSizeColor = (size) => {
    switch (size) {
      case 'small': return 'bg-green-100 text-green-800';
      case 'big': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
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
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Order Management</h2>
          <p className="text-gray-600 text-sm sm:text-base">Review tenant issues, manage quotes, and schedule services</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                <Send className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-purple-500" 
            onClick={() => setActiveTab('quotes')}
            data-testid="quotes-summary-card"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Provider Quotes</h3>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-purple-500" />
                    <span className="text-2xl font-bold text-purple-600">{quotes.length}</span>
                    <span className="text-sm text-gray-500">to review</span>
                  </div>
                </div>
                <Eye className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500" 
            onClick={() => setActiveTab('calendar')}
            data-testid="calendar-summary-card"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Calendar</h3>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-500">View schedule</span>
                  </div>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Card>
          <CardContent className="p-3 sm:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 text-xs sm:text-sm">
                <TabsTrigger value="issue-reports" data-testid="issues-tab">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Issues ({pendingIssues.length})
                </TabsTrigger>
                <TabsTrigger value="quotes" data-testid="quotes-tab">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Quotes ({quotes.length})
                </TabsTrigger>
                <TabsTrigger value="active-orders" data-testid="active-orders-tab">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Active ({activeOrders.length})
                </TabsTrigger>
                <TabsTrigger value="completed-orders" data-testid="completed-orders-tab">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Done ({completedOrders.length})
                </TabsTrigger>
                <TabsTrigger value="calendar" data-testid="calendar-tab">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Calendar
                </TabsTrigger>
              </TabsList>

              {/* Issues Tab */}
              <TabsContent value="issue-reports" className="mt-4 sm:mt-6">
                {pendingIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-500">No pending issues - all caught up!</p>
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
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                  {issue.issue_category || 'Issue Report'}
                                </h3>
                                {issue.issue_size && (
                                  <Badge className={getIssueSizeColor(issue.issue_size)}>
                                    {issue.issue_size}
                                  </Badge>
                                )}
                              </div>
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

                          <div className="mb-4">
                            <p className="text-gray-700 text-sm sm:text-base">{issue.description}</p>
                          </div>

                          {issue.ai_summary && (
                            <div className="bg-blue-50 p-3 rounded-lg mb-4">
                              <h4 className="font-medium text-blue-900 mb-1 text-sm">AI Summary:</h4>
                              <p className="text-sm text-blue-800">{issue.ai_summary}</p>
                            </div>
                          )}

                          {/* Issue Size Classifier - P3 Feature */}
                          {!issue.assigned_provider_id && (
                            <div className="mb-4">
                              <IssueSizeClassifier 
                                issue={issue} 
                                onClassified={() => loadOrders()} 
                              />
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

                          {/* Actions */}
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
                                  >
                                    or use advanced options
                                  </button>
                                </div>
                              </div>
                            ) : issue.status === 'in_progress' ? (
                              <Button
                                onClick={() => handleResolveIssue(issue)}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
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

              {/* Quotes Tab - P2 Feature */}
              <TabsContent value="quotes" className="mt-4 sm:mt-6">
                {quotes.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No pending quotes</p>
                    <p className="text-sm text-gray-400 mt-2">Quotes will appear here when providers respond to your requests</p>
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

                          {quote.estimated_duration && (
                            <div className="mb-4 text-sm text-gray-600">
                              <span className="font-medium">Estimated Duration:</span> {quote.estimated_duration}
                            </div>
                          )}

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
                              {processingOrder === quote.id ? 'Processing...' : 'Approve & Schedule'}
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
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active orders</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeOrders.map((order) => (
                      <Card key={order.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{order.service_type}</h3>
                              <p className="text-sm text-gray-600">Tenant: {order.homeowner_name}</p>
                              <p className="text-sm text-gray-600">Provider: {order.provider_name}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={
                                order.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {order.status}
                              </Badge>
                              {order.scheduled_date && (
                                <p className="text-sm text-blue-600 mt-1">
                                  📅 {formatDate(order.scheduled_date)} at {order.scheduled_time}
                                </p>
                              )}
                            </div>
                          </div>
                          {order.quotation_amount && (
                            <p className="text-lg font-bold text-green-600">
                              ${order.quotation_amount}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Completed Orders Tab */}
              <TabsContent value="completed-orders" className="mt-4 sm:mt-6">
                {completedOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No completed orders</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedOrders.map((order) => (
                      <Card key={order.id} className="border-l-4 border-l-gray-400">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{order.service_type}</h3>
                              <p className="text-sm text-gray-600">Tenant: {order.homeowner_name}</p>
                              <p className="text-sm text-gray-600">Provider: {order.provider_name}</p>
                            </div>
                            <Badge className="bg-gray-100 text-gray-800">
                              {order.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Calendar Tab - P2 Feature */}
              <TabsContent value="calendar" className="mt-4 sm:mt-6">
                <PMCalendar />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
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

      {showScheduleModal && selectedOrderForSchedule && (
        <ScheduleServiceModal
          order={selectedOrderForSchedule}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedOrderForSchedule(null);
          }}
          onSuccess={() => {
            loadOrders();
            alert('Service scheduled successfully!');
          }}
        />
      )}

      {showResolveModal && resolvingIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="bg-green-600 text-white p-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-xl font-bold">Resolve Issue</h2>
              <button onClick={() => setShowResolveModal(false)} className="hover:bg-green-700 p-1 rounded">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">{resolvingIssue.issue_category}</h3>
                <p className="text-sm text-gray-600">Tenant: {resolvingIssue.tenant_name}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Notes *</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe how the issue was resolved..."
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                  rows="4"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowResolveModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={confirmResolveIssue} className="flex-1 bg-green-600 hover:bg-green-700">
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
