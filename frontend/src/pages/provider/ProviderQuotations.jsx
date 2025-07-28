import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  Plus,
  Clock,
  DollarSign,
  Send,
  CheckCircle,
  Bell,
  Package,
  LogOut
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { mockQuotations } from '../../data/mockData';
import apiService from '../../services/api';

const ProviderQuotations = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [showNewQuoteForm, setShowNewQuoteForm] = useState(false);
  const [newQuote, setNewQuote] = useState({
    customerName: '',
    serviceType: '',
    description: '',
    amount: '',
    details: '',
    notes: ''
  });

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    navigate('/homeservices');
  };

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: Home, path: '/homeservices/dashboard' },
    { id: 'orders', label: 'Orders', icon: Package, path: '/homeservices/orders' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/homeservices/messages' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/homeservices/calendar' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/homeservices/customers' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/homeservices/settings' }
  ];

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      // Load orders from database instead of mock data
      const ordersData = await apiService.getOrders();
      setQuotations(ordersData);
    } catch (error) {
      console.error('Failed to load quotations:', error);
      // Fallback to mock data if API fails
      const providerQuotes = mockQuotations.filter(q => q.providerId === 1);
      setQuotations(providerQuotes);
    }
  };

  const handleSendQuote = (quoteId) => {
    // Mock sending quote
    const updatedQuotes = quotations.map(quote =>
      quote.id === quoteId ? { ...quote, status: 'quoted' } : quote
    );
    setQuotations(updatedQuotes);
  };

  const handleCreateQuote = () => {
    const quote = {
      id: Date.now(),
      homeownerId: Date.now(),
      providerId: 1,
      providerName: 'Elite Home Solutions',
      homeownerName: newQuote.customerName,
      serviceType: newQuote.serviceType,
      description: newQuote.description,
      quotationAmount: parseFloat(newQuote.amount),
      quotationDetails: newQuote.details,
      providerResponse: newQuote.notes,
      status: 'quoted',
      requestDate: new Date().toISOString(),
      homeownerAddress: '123 Main St, Toronto, ON'
    };

    setQuotations([...quotations, quote]);
    setNewQuote({
      customerName: '',
      serviceType: '',
      description: '',
      amount: '',
      details: '',
      notes: ''
    });
    setShowNewQuoteForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoted':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const pendingQuotes = quotations.filter(q => q.status === 'pending');
  const sentQuotes = quotations.filter(q => q.status === 'quoted');
  const acceptedQuotes = quotations.filter(q => q.status === 'accepted');
  const rejectedQuotes = quotations.filter(q => q.status === 'rejected');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">Doord.</h1>
              <span className="text-sm text-gray-600">for Merchants</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    ES
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Elite Solutions</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant={item.id === 'orders' ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quotations</h2>
              <p className="text-gray-600">Manage your quotes and customer requests</p>
            </div>
            <Button onClick={() => setShowNewQuoteForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Quote
            </Button>
          </div>

          {/* New Quote Form */}
          {showNewQuoteForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create New Quote</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={newQuote.customerName}
                      onChange={(e) => setNewQuote({...newQuote, customerName: e.target.value})}
                      placeholder="Enter customer name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Input
                      id="serviceType"
                      value={newQuote.serviceType}
                      onChange={(e) => setNewQuote({...newQuote, serviceType: e.target.value})}
                      placeholder="e.g., Plumbing, Electrical"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Quote Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newQuote.amount}
                      onChange={(e) => setNewQuote({...newQuote, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      value={newQuote.description}
                      onChange={(e) => setNewQuote({...newQuote, description: e.target.value})}
                      placeholder="Describe the project..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="details">Quote Details</Label>
                    <Textarea
                      id="details"
                      value={newQuote.details}
                      onChange={(e) => setNewQuote({...newQuote, details: e.target.value})}
                      placeholder="Detailed breakdown of work and materials..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={newQuote.notes}
                      onChange={(e) => setNewQuote({...newQuote, notes: e.target.value})}
                      placeholder="Any additional information for the customer..."
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <Button onClick={handleCreateQuote}>
                    Create Quote
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewQuoteForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quotations Tabs */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                Pending ({pendingQuotes.length})
              </TabsTrigger>
              <TabsTrigger value="sent">
                Sent ({sentQuotes.length})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Accepted ({acceptedQuotes.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedQuotes.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4">
              {pendingQuotes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No pending quote requests.</p>
                </div>
              ) : (
                pendingQuotes.map(quote => (
                  <Card key={quote.id} className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{quote.homeowner_name}</CardTitle>
                          <p className="text-sm text-gray-600">{quote.service_type}</p>
                        </div>
                        <Badge className={getStatusColor(quote.status)}>
                          <Clock className="h-3 w-3 mr-1" />
                          {quote.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Customer Request</h4>
                          <p className="text-gray-700">{quote.description}</p>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>📍 {quote.homeownerAddress}</span>
                          <span>📅 {formatDate(quote.requestDate)}</span>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button onClick={() => handleSendQuote(quote.id)}>
                            <Send className="h-4 w-4 mr-2" />
                            Send Quote
                          </Button>
                          <Button variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message Customer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="sent" className="space-y-4">
              {sentQuotes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No sent quotes.</p>
                </div>
              ) : (
                sentQuotes.map(quote => (
                  <Card key={quote.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{quote.homeowner_name}</CardTitle>
                          <p className="text-sm text-gray-600">{quote.service_type}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            ${quote.quotationAmount}
                          </div>
                          <Badge className={getStatusColor(quote.status)}>
                            <Send className="h-3 w-3 mr-1" />
                            {quote.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Quote Details</h4>
                          <p className="text-gray-700">{quote.quotationDetails}</p>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <Send className="h-4 w-4 inline mr-1" />
                            Quote sent! Waiting for customer response.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="accepted" className="space-y-4">
              {acceptedQuotes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No accepted quotes.</p>
                </div>
              ) : (
                acceptedQuotes.map(quote => (
                  <Card key={quote.id} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{quote.homeowner_name}</CardTitle>
                          <p className="text-sm text-gray-600">{quote.service_type}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            ${quote.quotationAmount}
                          </div>
                          <Badge className={getStatusColor(quote.status)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {quote.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-800">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Quote accepted! Contact customer to schedule the work.
                          </p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Work
                          </Button>
                          <Button variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message Customer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="rejected" className="space-y-4">
              {rejectedQuotes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No rejected quotes.</p>
                </div>
              ) : (
                rejectedQuotes.map(quote => (
                  <Card key={quote.id} className="border-l-4 border-l-red-500 opacity-75">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{quote.homeownerName}</CardTitle>
                          <p className="text-sm text-gray-600">{quote.serviceType}</p>
                        </div>
                        <Badge className={getStatusColor(quote.status)}>
                          {quote.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-800">
                          Quote was declined by the customer.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProviderQuotations;