import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, Shield, Phone, Mail, Calendar, MessageCircle, Menu, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import QuotationRequestForm from '../../components/QuotationRequestForm';
import apiService from '../../services/api';

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [quoteDescription, setQuoteDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [contactMethod, setContactMethod] = useState('email');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuotationFormOpen, setIsQuotationFormOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedOrders, setCompletedOrders] = useState([]);
  const [canLeaveReview, setCanLeaveReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    reviewText: '',
    orderId: ''
  });
  const [providerReviews, setProviderReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Load provider from API
  useEffect(() => {
    const loadProvider = async () => {
      try {
        setLoading(true);
        setError('');
        
        const providerData = await apiService.getProviderById(id);
        
        if (providerData) {
          // Format provider data for display
          const formattedProvider = {
            id: providerData.id,
            name: providerData.business_name || providerData.name,
            description: providerData.description || `Professional ${Array.isArray(providerData.services) ? providerData.services.join(' and ') : providerData.services} services`,
            services: Array.isArray(providerData.services) ? providerData.services : [providerData.services],
            serviceCategories: providerData.service_categories || [],
            propertiesServed: providerData.properties_served || [],
            pricingPackages: providerData.pricing_packages || [],
            rating: providerData.rating || 5.0,
            reviews: providerData.reviews || 0,
            completedJobs: providerData.completed_jobs || 0,
            location: providerData.address || providerData.location || "Halifax, NS",
            responseTime: providerData.response_time || "Usually responds within 1 hour",
            yearEstablished: providerData.year_established || "2024",
            specialties: providerData.specialties || ["Professional service", "Quality work", "Customer satisfaction"],
            priceRange: providerData.price_range || "$50-$500",
            ownerName: providerData.name,
            email: providerData.email,
            phone: providerData.phone,
            website: providerData.website
          };
          
          setProvider(formattedProvider);
        } else {
          setError('Provider not found');
        }
      } catch (error) {
        console.error('Failed to load provider:', error);
        setError('Failed to load provider details');
      } finally {
        setLoading(false);
      }
    };
    
    loadProvider();
    loadProviderReviews();
  }, [id]);

  const loadProviderReviews = async () => {
    try {
      setReviewsLoading(true);
      const reviews = await apiService.getProviderReviews(id);
      setProviderReviews(reviews);
    } catch (error) {
      console.error('Failed to load provider reviews:', error);
      setProviderReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Check login status and completed orders
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    setIsLoggedIn(userType === 'homeowner');
    
    if (userType === 'homeowner') {
      checkCompletedOrders();
    }
  }, [id]);

  const checkCompletedOrders = async () => {
    try {
      const orders = await apiService.getOrders();
      const providerOrders = orders.filter(order => 
        order.provider_id === id && order.status === 'completed'
      );
      setCompletedOrders(providerOrders);
      setCanLeaveReview(providerOrders.length > 0);
    } catch (error) {
      console.error('Failed to check completed orders:', error);
    }
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading provider details...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Provider not found</h2>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleRequestQuote = () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      navigate('/homeowners/auth');
      return;
    }
    
    // Open the quotation form
    setIsQuotationFormOpen(true);
  };

  const handleTextUs = async () => {
    // Check if user is logged in
    const authToken = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');
    
    if (!authToken || !user) {
      navigate('/homeowners/auth');
      return;
    }
    
    // If user is a provider, redirect to provider dashboard
    if (userType === 'provider') {
      navigate('/homeservices/dashboard');
      return;
    }
    
    try {
      const userData = JSON.parse(user);
      
      // Check if conversation already exists
      const existingThreads = await apiService.getMessageThreads();
      const existingThread = existingThreads.find(thread => 
        thread.provider_id === provider.id && thread.homeowner_id === userData.id
      );
      
      if (existingThread) {
        // Navigate to existing conversation
        navigate('/homeowners/dashboard?tab=messages', { 
          state: { 
            threadId: existingThread.id,
            providerId: provider.id,
            action: 'openExistingConversation'
          }
        });
        return;
      }
      
      // Create new conversation thread
      const threadData = {
        homeowner_id: userData.id,
        provider_id: provider.id,
        homeowner_name: userData.name,
        provider_name: provider.name,
        order_type: 'Text Us Inquiry',
        last_message: `New conversation with ${provider.name}`,
        last_message_time: new Date().toISOString()
      };
      
      const newThread = await apiService.createMessageThread(threadData);
      
      // Navigate to messages with the new thread
      navigate('/homeowners/dashboard?tab=messages', { 
        state: { 
          threadId: newThread.id,
          providerId: provider.id,
          providerName: provider.name,
          action: 'newConversation'
        }
      });
      
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const handleReviewSubmit = async () => {
    try {
      if (!reviewForm.rating || !reviewForm.reviewText.trim()) {
        alert('Please provide both rating and review text');
        return;
      }

      // Submit review to backend
      await apiService.submitReview({
        provider_id: id,
        rating: reviewForm.rating,
        review_text: reviewForm.reviewText,
        order_id: reviewForm.orderId
      });

      alert('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewForm({ rating: 0, reviewText: '', orderId: '' });
      
      // Reload provider to get updated ratings and reload reviews
      const updatedProvider = await apiService.getProviderById(id);
      if (updatedProvider) {
        setProvider(prev => ({ ...prev, ...updatedProvider }));
      }
      
      // Reload reviews to show the new review
      loadProviderReviews();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleStarClick = (rating) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/homeowners/browse')}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Doord.</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/homeowners/quotations')}>
                My Quotations
              </Button>
              {isLoggedIn ? (
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
                    navigate('/homeowners/quotations');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  My Quotations
                </Button>
                {isLoggedIn ? (
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

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Quotation Request Form */}
      <QuotationRequestForm
        isOpen={isQuotationFormOpen}
        onClose={() => setIsQuotationFormOpen(false)}
        serviceType={provider?.services?.[0] || ''}
        providerName={provider?.name || ''}
        providerId={provider?.id}
      />

      {/* Chat Interface - Removed hardcoded messages, redirects to dashboard messages */}

      {/* Provider Header */}
      <div className="bg-blue-50 border-b overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Image Gallery */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 sm:mb-6 h-32 sm:h-48 lg:h-64 w-full">
            <div className="col-span-2 bg-blue-100 rounded-lg flex items-center justify-center shadow-sm">
              <div className="text-center px-2">
                <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2">🧹</div>
                <p className="text-xs sm:text-sm text-blue-800 font-semibold">Professional Cleaning</p>
              </div>
            </div>
            <div className="grid grid-rows-2 gap-2">
              <div className="bg-blue-100 rounded-lg flex items-center justify-center shadow-sm">
                <div className="text-lg sm:text-xl lg:text-2xl">✨</div>
              </div>
              <div className="bg-blue-100 rounded-lg flex items-center justify-center shadow-sm">
                <div className="text-lg sm:text-xl lg:text-2xl">🏠</div>
              </div>
            </div>
            <div className="grid grid-rows-2 gap-2">
              <div className="bg-blue-100 rounded-lg flex items-center justify-center shadow-sm">
                <div className="text-lg sm:text-xl lg:text-2xl">💯</div>
              </div>
              <div className="bg-blue-100 rounded-lg flex items-center justify-center shadow-sm">
                <div className="text-lg sm:text-xl lg:text-2xl">⭐</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:justify-between lg:items-start">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6 w-full lg:w-auto min-w-0">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
                <AvatarFallback className="text-lg sm:text-xl lg:text-2xl font-bold bg-blue-600 text-white">
                  {provider.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center sm:text-left flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                  <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 truncate max-w-full">{provider.name}</h1>
                  <button className="p-2 hover:bg-white/50 rounded-full transition-colors flex-shrink-0">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-bold shadow-sm">
                      {provider.rating} ★
                    </div>
                    <span className="text-gray-600 text-sm">({provider.reviews} Reviews)</span>
                  </div>
                  <Badge className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified Pro
                  </Badge>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 mb-4 text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base truncate">{provider.location}</span>
                  </div>
                </div>
                
                {/* Service Tags - Mobile Optimized */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 mb-4 max-w-full">
                  {provider.services && provider.services.length > 0 ? (
                    provider.services.slice(0, 3).map((service, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs px-2 py-1">
                        {service}
                      </Badge>
                    ))
                  ) : (
                    <Badge className="bg-gray-100 text-gray-600 text-xs px-2 py-1">
                      No services specified
                    </Badge>
                  )}
                  {provider.services && provider.services.length > 3 && (
                    <Badge className="bg-blue-50 text-blue-600 text-xs px-2 py-1">
                      +{provider.services.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-auto lg:max-w-xs flex flex-col space-y-2 sm:space-y-3 px-2 sm:px-0">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm sm:text-base" 
                onClick={handleRequestQuote}
              >
                🎯 Get Quotation
              </Button>
              <Button
                variant="outline"
                className="w-full bg-blue-600 text-white hover:bg-blue-700 border-blue-600 shadow-sm text-sm sm:text-base"
              >
                💰 {provider.pricingPackages && provider.pricingPackages.length > 0 
                  ? `Starts from $${Math.min(...provider.pricingPackages.map(pkg => pkg.price))}` 
                  : 'Contact for pricing'}
              </Button>
              <Button
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm text-sm sm:text-base"
                onClick={handleTextUs}
              >
                <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">💬 Text Us</span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hidden sm:inline">1 hr</span>
              </Button>
              <p className="text-center text-sm text-gray-600">
                {provider.price_range || provider.priceRange || 'Pricing available upon request'}
              </p>
            </div>
          </div>

          {/* Review Section */}
          <div className="mt-6 flex justify-center lg:justify-end px-2 sm:px-0">
            {canLeaveReview ? (
              <div className="text-center bg-white/70 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-sm border border-blue-200 w-full max-w-xs lg:w-auto">
                {!showReviewForm ? (
                  <>
                    <div className="text-xs sm:text-sm text-gray-700 mb-2 font-medium">✅ You can leave a review</div>
                    <Button 
                      onClick={() => setShowReviewForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
                    >
                      Write Review
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs sm:text-sm text-gray-700 font-medium">Rate & Review</div>
                    
                    {/* Star Rating */}
                    <div className="flex space-x-1 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          onClick={() => handleStarClick(star)}
                          className={`transition-colors transform hover:scale-110 ${
                            star <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'
                          }`}
                        >
                          <Star className="h-5 w-5 sm:h-6 sm:w-6" fill={star <= reviewForm.rating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                    
                    {/* Review Text */}
                    <Textarea
                      placeholder="Write your review..."
                      value={reviewForm.reviewText}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
                      className="w-full text-sm"
                      rows="3"
                    />
                    
                    {/* Order Selection */}
                    {completedOrders.length > 1 && (
                      <select 
                        className="w-full text-sm border rounded px-2 py-1"
                        value={reviewForm.orderId}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, orderId: e.target.value }))}
                      >
                        <option value="">Select order (optional)</option>
                        {completedOrders.map(order => (
                          <option key={order.id} value={order.id}>
                            Order #{order.id.slice(-6)} - {new Date(order.created_at).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleReviewSubmit}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 flex-1"
                        disabled={!reviewForm.rating || !reviewForm.reviewText.trim()}
                      >
                        Submit
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewForm({ rating: 0, reviewText: '', orderId: '' });
                        }}
                        variant="outline"
                        className="text-xs px-3 py-1 flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : isLoggedIn ? (
              <div className="text-center bg-gray-100/70 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 w-full max-w-xs lg:w-auto">
                <div className="text-xs sm:text-sm text-gray-600 mb-2 font-medium">💭 Complete an order to review</div>
                <p className="text-xs text-gray-500">You can only review providers after completing a job</p>
              </div>
            ) : (
              <div className="text-center bg-gray-100/70 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 w-full max-w-xs lg:w-auto">
                <div className="text-xs sm:text-sm text-gray-600 mb-2 font-medium">🔐 Sign in to review</div>
                <Button 
                  onClick={() => navigate('/homeowners/auth')}
                  variant="outline"
                  className="text-xs px-3 py-1"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="quote">Request Quote</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Price List Section */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">💰 Price list</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {provider.pricingPackages && provider.pricingPackages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {provider.pricingPackages.slice(0, 3).map((pkg, index) => (
                      <div 
                        key={index}
                        className={`bg-white border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow relative ${
                          index === 2 ? 'border-2 border-blue-300 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        {index === 2 && (
                          <div className="absolute top-0 right-0 bg-blue-600 text-white px-2 py-1 text-xs font-bold rounded-bl-lg">
                            POPULAR
                          </div>
                        )}
                        <div className="text-center mb-4">
                          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                            index === 2 ? 'bg-blue-600' : 'bg-blue-100'
                          }`}>
                            <span className={`text-xl sm:text-2xl ${index === 2 ? 'text-white' : 'text-blue-600'}`}>
                              {index === 0 ? '🏠' : index === 1 ? '✨' : '🌟'}
                            </span>
                          </div>
                          <h4 className="font-bold text-base sm:text-lg mb-2 text-gray-800">{pkg.name}</h4>
                          <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">${pkg.price}</div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 text-center">{pkg.description}</p>
                        <button className="text-blue-600 text-sm hover:underline mb-4 block mx-auto">View details →</button>
                        <Button 
                          className={`w-full ${
                            index === 2 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                          }`}
                          variant={index === 2 ? 'default' : 'outline'}
                          onClick={handleRequestQuote}
                        >
                          Get Quotation
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">💰</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Pricing Packages Set</h3>
                    <p className="text-gray-600 mb-6">This provider hasn't set up their pricing packages yet. Contact them directly for pricing information.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleRequestQuote}
                      >
                        Request Custom Quote
                      </Button>
                      <Button
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        onClick={handleTextUs}
                      >
                        Contact Provider
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Information */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">⚡ Quick information</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border-l-4 border-blue-500">
                    <h5 className="font-bold mb-2 sm:mb-3 text-gray-800 flex items-center text-sm sm:text-base">
                      <span className="text-blue-600 mr-2">📅</span> Year of establishment
                    </h5>
                    <div className="bg-white border border-blue-200 inline-block px-3 py-2 rounded-full">
                      <span className="font-bold text-blue-800 text-sm sm:text-base">{provider.yearEstablished}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Service Categories */}
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 hover:shadow-sm transition-shadow">
                      <h5 className="font-bold mb-2 sm:mb-3 flex items-center text-blue-700 text-sm sm:text-base">
                        <span className="mr-2">🧹</span> Service Categories
                      </h5>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {provider.serviceCategories && provider.serviceCategories.length > 0 ? (
                          provider.serviceCategories.map((category, index) => (
                            <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">
                              {category}
                            </Badge>
                          ))
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 text-xs">No categories specified</Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Services */}
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 hover:shadow-sm transition-shadow">
                      <h5 className="font-bold mb-2 sm:mb-3 flex items-center text-blue-700 text-sm sm:text-base">
                        <span className="mr-2">🌟</span> Services Offered
                      </h5>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {provider.services && provider.services.length > 0 ? (
                          provider.services.map((service, index) => (
                            <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">
                              {service}
                            </Badge>
                          ))
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 text-xs">No services specified</Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Properties Served */}
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 hover:shadow-sm transition-shadow sm:col-span-2 lg:col-span-1">
                      <h5 className="font-bold mb-2 sm:mb-3 flex items-center text-blue-700 text-sm sm:text-base">
                        <span className="mr-2">🏢</span> Properties Served
                      </h5>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {provider.propertiesServed && provider.propertiesServed.length > 0 ? (
                          provider.propertiesServed.map((property, index) => (
                            <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">
                              {property}
                            </Badge>
                          ))
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 text-xs">No properties specified</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">📋 About {provider.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">{provider.description}</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                  <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                    <h4 className="font-bold mb-3 sm:mb-4 text-blue-700 flex items-center text-sm sm:text-lg">
                      <span className="mr-2">🎯</span> Specialties
                    </h4>
                    <ul className="space-y-2 sm:space-y-3">
                      {provider.specialties.map((specialty, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                          <span className="text-gray-700 font-medium text-sm sm:text-base">{specialty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
                    <h4 className="font-bold mb-3 sm:mb-4 text-blue-700 flex items-center text-sm sm:text-lg">
                      <span className="mr-2">📊</span> Quick Facts
                    </h4>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-700 font-medium text-sm sm:text-base">Jobs Completed</span>
                        <span className="font-bold text-blue-600 text-sm sm:text-lg">{provider.completedJobs}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700 font-medium text-sm sm:text-base">Response Time</span>
                        <span className="font-bold text-blue-600 text-sm sm:text-base">{provider.responseTime}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-700 font-medium text-sm sm:text-base">Year Established</span>
                        <span className="font-bold text-blue-600 text-sm sm:text-base">{provider.yearEstablished}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {provider.services.map((service, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900">{service}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Professional {service.toLowerCase()} services
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviewsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading reviews...</p>
                    </div>
                  ) : providerReviews.length > 0 ? (
                    providerReviews.map(review => (
                      <div key={review.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {review.homeowner_name ? review.homeowner_name.split(' ').map(n => n[0]).join('') : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{review.homeowner_name || 'Anonymous'}</p>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{review.review_text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No reviews yet</p>
                      <p className="text-sm">Be the first to leave a review after completing a service!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="quote" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Request a Quote from {provider.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="description">Describe your project</Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe what you need done, including any specific requirements or preferences..."
                    value={quoteDescription}
                    onChange={(e) => setQuoteDescription(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="preferred-date">Preferred Date</Label>
                  <Input
                    id="preferred-date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Preferred Contact Method</Label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="contact"
                        value="email"
                        checked={contactMethod === 'email'}
                        onChange={(e) => setContactMethod(e.target.value)}
                      />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="contact"
                        value="phone"
                        checked={contactMethod === 'phone'}
                        onChange={(e) => setContactMethod(e.target.value)}
                      />
                      <span>Phone</span>
                    </label>
                  </div>
                </div>
                
                <Button 
                  onClick={handleRequestQuote}
                  className="w-full"
                  disabled={!quoteDescription.trim()}
                >
                  Send Quote Request
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProviderProfile;