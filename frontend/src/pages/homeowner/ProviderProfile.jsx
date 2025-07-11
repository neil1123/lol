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
import { mockProviders } from '../../data/mockData';
import QuotationRequestForm from '../../components/QuotationRequestForm';

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

  const provider = mockProviders.find(p => p.id === parseInt(id));

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Provider not found</h2>
          <Button onClick={() => navigate('/homeowners/browse')}>
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  const handleRequestQuote = () => {
    const quoteRequest = {
      providerId: provider.id,
      providerName: provider.name,
      homeownerId: 1,
      homeownerName: "John Smith",
      description: quoteDescription,
      preferredDate,
      contactMethod,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    const existingRequests = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
    localStorage.setItem('quoteRequests', JSON.stringify([...existingRequests, quoteRequest]));
    
    navigate('/homeowners/quotations');
  };

  const mockReviews = [
    {
      id: 1,
      customerName: "Sarah Johnson",
      rating: 5,
      date: "2024-01-10",
      service: "Home Cleaning",
      comment: "Excellent service! Very thorough and professional. The team arrived on time and left my house spotless. Highly recommended!"
    },
    {
      id: 2,
      customerName: "Mike Wilson",
      rating: 4,
      date: "2024-01-05",
      service: "Electrical Work",
      comment: "Great work on installing new outlets in my kitchen. Professional and clean work. Would definitely use again."
    },
    {
      id: 3,
      customerName: "Emily Davis",
      rating: 5,
      date: "2023-12-28",
      service: "Plumbing",
      comment: "Fixed my leaky faucet quickly and at a fair price. Very knowledgeable and explained everything clearly."
    }
  ];

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
              <Button variant="outline">Sign In</Button>
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
                <Button 
                  variant="outline" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="justify-start"
                >
                  Sign In
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

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
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs px-2 py-1">Chairs & wardrobe</Badge>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs px-2 py-1">Deep cleaning</Badge>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs px-2 py-1">Vacuum</Badge>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-auto lg:max-w-xs flex flex-col space-y-2 sm:space-y-3 px-2 sm:px-0">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm text-sm sm:text-base" 
                onClick={() => setIsQuotationFormOpen(true)}
              >
                🎯 Get Quotation
              </Button>
              <Button
                variant="outline"
                className="w-full bg-blue-600 text-white hover:bg-blue-700 border-blue-600 shadow-sm text-sm sm:text-base"
              >
                💰 Starts from $199.00
              </Button>
              <Button
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm text-sm sm:text-base"
                onClick={() => setIsChatOpen(true)}
              >
                <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">💬 Get best deal</span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hidden sm:inline">1 hr</span>
              </Button>
            </div>
          </div>

          {/* Rating Section */}
          <div className="mt-6 flex justify-center lg:justify-end px-2 sm:px-0">
            <div className="text-center bg-white/70 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-sm border border-blue-200 w-full max-w-xs lg:w-auto">
              <div className="text-xs sm:text-sm text-gray-700 mb-2 font-medium">⭐ Click to rate this provider</div>
              <div className="flex space-x-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} className="text-gray-300 hover:text-blue-500 transition-colors transform hover:scale-110">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                ))}
              </div>
            </div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl sm:text-2xl text-blue-600">🏠</span>
                      </div>
                      <h4 className="font-bold text-base sm:text-lg mb-2 text-gray-800">Basic House Cleaning</h4>
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">$149</div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 text-center">Standard cleaning service for homes up to 1500 sq ft. Includes all basic cleaning tasks.</p>
                    <button className="text-blue-600 text-sm hover:underline mb-4 block mx-auto">View details →</button>
                    <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">Get Quotation</Button>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl sm:text-2xl text-blue-600">✨</span>
                      </div>
                      <h4 className="font-bold text-base sm:text-lg mb-2 text-gray-800">Deep House Cleaning</h4>
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">$199</div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 text-center">Comprehensive deep cleaning with detailed attention to every corner of your home.</p>
                    <button className="text-blue-600 text-sm hover:underline mb-4 block mx-auto">View details →</button>
                    <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">Get Quotation</Button>
                  </div>
                  
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow relative">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white px-2 py-1 text-xs font-bold rounded-bl-lg">
                      POPULAR
                    </div>
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl sm:text-2xl text-white">🌟</span>
                      </div>
                      <h4 className="font-bold text-base sm:text-lg mb-2 text-gray-800">Premium Package</h4>
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">$299</div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 text-center">Complete premium service with eco-friendly products and post-cleaning maintenance.</p>
                    <button className="text-blue-600 text-sm hover:underline mb-4 block mx-auto">View details →</button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Get Quotation</Button>
                  </div>
                </div>
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
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 hover:shadow-sm transition-shadow">
                      <h5 className="font-bold mb-2 sm:mb-3 flex items-center text-blue-700 text-sm sm:text-base">
                        <span className="mr-2">🧹</span> Cleaning service for
                      </h5>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">Chair</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">Mattress</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">Sofa</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">Carpet</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">Kitchen</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">Bathroom</Badge>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 hover:shadow-sm transition-shadow">
                      <h5 className="font-bold mb-2 sm:mb-3 flex items-center text-blue-700 text-sm sm:text-base">
                        <span className="mr-2">🌟</span> Service type
                      </h5>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">Deep clean</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">Vacuum</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">Sanitize</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">Organize</Badge>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 hover:shadow-sm transition-shadow sm:col-span-2 lg:col-span-1">
                      <h5 className="font-bold mb-2 sm:mb-3 flex items-center text-blue-700 text-sm sm:text-base">
                        <span className="mr-2">🏢</span> Properties served
                      </h5>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">Commercial</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">Office</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">Residential</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">Retail</Badge>
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
                  {mockReviews.map(review => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {review.customerName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-semibold">{review.customerName}</span>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {review.date}
                        </div>
                      </div>
                      <Badge variant="secondary" className="mb-2">{review.service}</Badge>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
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