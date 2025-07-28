import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, Calendar, DollarSign, MessageCircle, Menu, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import apiService from '../../services/api';

const HomeownerQuotations = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localQuotes, setLocalQuotes] = useState([]);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load orders (which include quotation requests)
      const ordersData = await apiService.getOrders();
      
      // Filter for quotations/orders for this homeowner
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userQuotations = ordersData.filter(order => 
        order.homeowner_id === user.id || order.homeowner_email === user.email
      );
      
      setQuotations(userQuotations);
      
      // Load any local quotes that haven't been synced yet
      const localQuoteRequests = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
      setLocalQuotes(localQuoteRequests);
      
    } catch (error) {
      console.error('Failed to load quotations:', error);
      setError('Failed to load quotations. Please try again.');
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (quoteId) => {
    try {
      await apiService.updateOrderStatus(quoteId, 'accepted');
      loadQuotations(); // Reload data
    } catch (error) {
      console.error('Failed to accept quote:', error);
      alert('Failed to accept quote. Please try again.');
    }
  };

  const handleDeclineQuote = async (quoteId) => {
    try {
      await apiService.updateOrderStatus(quoteId, 'declined');
      loadQuotations(); // Reload data  
    } catch (error) {
      console.error('Failed to decline quote:', error);
      alert('Failed to decline quote. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_quotation':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'quoted':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_quotation':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoted':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'declined':
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

  const pendingQuotes = quotations.filter(q => q.status === 'pending_quotation');
  const quotedQuotes = quotations.filter(q => q.status === 'quoted');
  const acceptedQuotes = quotations.filter(q => q.status === 'accepted');
  const rejectedQuotes = quotations.filter(q => q.status === 'rejected' || q.status === 'declined');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/homeowners')}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Doord.</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/homeowners/browse')}>
                Browse Services
              </Button>
              {/* Check authentication state */}
              {localStorage.getItem('userType') === 'homeowner' && localStorage.getItem('authToken') ? (
                <Button variant="outline" onClick={() => navigate('/homeowners/dashboard')}>
                  Dashboard
                </Button>
              ) : (
                <Button variant="outline" onClick={() => navigate('/homeowners/auth')}>
                  Sign In
                </Button>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t bg-white py-4">
              <div className="flex flex-col space-y-3">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/homeowners/browse');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Browse Services
                </Button>
                {/* Check authentication state */}
                {localStorage.getItem('userType') === 'homeowner' && localStorage.getItem('authToken') ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigate('/homeowners/dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    Dashboard
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigate('/homeowners/auth');
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Quotations</h2>
          <p className="text-gray-600">Track your service requests and quotations</p>
        </div>

        {/* Local Quote Requests */}
        {localQuotes.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Quote Requests</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {localQuotes.map((quote, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{quote.provider_name || quote.providerName}</h4>
                      <p className="text-sm text-gray-600">{quote.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Requested on {formatDate(quote.timestamp)}
                      </p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Pending Response
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="quoted" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quoted">
              Quotes Received ({quotedQuotes.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingQuotes.length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted ({acceptedQuotes.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedQuotes.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="quoted" className="space-y-6">
            {quotedQuotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No quotes received yet.</p>
                <Button 
                  onClick={() => navigate('/homeowners/browse')}
                  className="mt-4"
                >
                  Browse Services
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {quotedQuotes.map(quote => (
                  <Card key={quote.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{quote.providerName}</CardTitle>
                          <p className="text-sm text-gray-600">{quote.serviceType}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {quote.quotation_amount ? `$${quote.quotation_amount}` : 'Quote Pending'}
                          </div>
                          <Badge className={getStatusColor(quote.status)}>
                            {getStatusIcon(quote.status)}
                            <span className="ml-1 capitalize">{quote.status}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Your Request</h4>
                          <p className="text-gray-700">{quote.description}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Quote Details</h4>
                          <p className="text-gray-700">{quote.quotationDetails}</p>
                        </div>
                        
                        {quote.providerResponse && (
                          <div>
                            <h4 className="font-semibold mb-2">Provider Notes</h4>
                            <p className="text-gray-700">{quote.providerResponse}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>📅 Requested on {formatDate(quote.requestDate)}</span>
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                          <Button 
                            onClick={() => handleAcceptQuote(quote.id)}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept Quote
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleDeclineQuote(quote.id)}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-6">
            {pendingQuotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No pending quotes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingQuotes.map(quote => (
                  <Card key={quote.id} className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{quote.providerName}</CardTitle>
                          <p className="text-sm text-gray-600">{quote.serviceType}</p>
                        </div>
                        <Badge className={getStatusColor(quote.status)}>
                          {getStatusIcon(quote.status)}
                          <span className="ml-1 capitalize">{quote.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Your Request</h4>
                          <p className="text-gray-700">{quote.description}</p>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>📅 Requested on {formatDate(quote.requestDate)}</span>
                        </div>
                        
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <Clock className="h-4 w-4 inline mr-1" />
                            Waiting for provider response...
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="accepted" className="space-y-6">
            {acceptedQuotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No accepted quotes yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {acceptedQuotes.map(quote => (
                  <Card key={quote.id} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{quote.providerName}</CardTitle>
                          <p className="text-sm text-gray-600">{quote.serviceType}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            {quote.quotation_amount ? `$${quote.quotation_amount}` : 'Quote Pending'}
                          </div>
                          <Badge className={getStatusColor(quote.status)}>
                            {getStatusIcon(quote.status)}
                            <span className="ml-1 capitalize">{quote.status}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-800">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Quote accepted! The provider will contact you soon to schedule the service.
                          </p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message Provider
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Service
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rejected" className="space-y-6">
            {rejectedQuotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No rejected quotes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rejectedQuotes.map(quote => (
                  <Card key={quote.id} className="border-l-4 border-l-red-500 opacity-75">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{quote.providerName}</CardTitle>
                          <p className="text-sm text-gray-600">{quote.serviceType}</p>
                        </div>
                        <Badge className={getStatusColor(quote.status)}>
                          {getStatusIcon(quote.status)}
                          <span className="ml-1 capitalize">{quote.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded-lg">
                          <p className="text-sm text-red-800">
                            <XCircle className="h-4 w-4 inline mr-1" />
                            Quote was declined.
                          </p>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/homeowners/browse')}
                        >
                          Find Another Provider
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HomeownerQuotations;