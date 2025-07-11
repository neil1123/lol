import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, Shield, Phone, Mail, Calendar, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { mockProviders } from '../../data/mockData';

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [quoteDescription, setQuoteDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [contactMethod, setContactMethod] = useState('email');

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
              <h1 className="text-2xl font-bold text-blue-600">Doord.</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/homeowners/quotations')}>
                My Quotations
              </Button>
              <Button variant="outline">Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Provider Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Image Gallery */}
          <div className="grid grid-cols-4 gap-2 mb-6 h-64">
            <div className="col-span-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🧹</div>
                <p className="text-sm text-gray-600">Professional Cleaning</p>
              </div>
            </div>
            <div className="grid grid-rows-2 gap-2">
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                <div className="text-2xl">🏠</div>
              </div>
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                <div className="text-2xl">✨</div>
              </div>
            </div>
            <div className="grid grid-rows-2 gap-2">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <div className="text-2xl">🧽</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                <div className="text-2xl">💯</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start">
            <div className="flex items-start space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-600">
                  {provider.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
                      {provider.rating} ★
                    </div>
                    <span className="text-gray-500">({provider.reviews} Reviews)</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 mb-4 text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{provider.location}</span>
                  </div>
                </div>
                
                {/* Service Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">Chairs and wardrobe cleaning</Badge>
                  <Badge variant="outline">Deep cleaning</Badge>
                  <Badge variant="outline">Vacuum</Badge>
                </div>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0 flex flex-col space-y-2">
              <Button className="w-full lg:w-auto" onClick={() => setActiveTab('quote')}>
                Get Quotation
              </Button>
              <Button variant="outline" className="w-full lg:w-auto bg-blue-600 text-white hover:bg-blue-700">
                Starts from $199.00
              </Button>
              <Button variant="outline" className="w-full lg:w-auto">
                <MessageCircle className="h-4 w-4 mr-2" />
                Get best deal
                <span className="ml-2 text-xs">Response in 1 hrs</span>
              </Button>
            </div>
          </div>

          {/* Rating Section */}
          <div className="mt-6 flex items-center justify-end">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Click to rate</div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} className="text-gray-300 hover:text-yellow-400 transition-colors">
                    <Star className="h-6 w-6" />
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
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">💰 Price list</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl text-white">🏠</span>
                      </div>
                      <h4 className="font-bold text-lg mb-2 text-gray-800">Basic House Cleaning</h4>
                      <div className="text-3xl font-bold text-blue-600 mb-2">$149</div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Standard cleaning service for homes up to 1500 sq ft. Includes all basic cleaning tasks.</p>
                    <button className="text-blue-600 text-sm hover:underline mb-4 block mx-auto">View details →</button>
                    <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">Get Quotation</Button>
                  </div>
                  
                  <div className="bg-white border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl text-white">✨</span>
                      </div>
                      <h4 className="font-bold text-lg mb-2 text-gray-800">Deep House Cleaning</h4>
                      <div className="text-3xl font-bold text-green-600 mb-2">$199</div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Comprehensive deep cleaning with detailed attention to every corner of your home.</p>
                    <button className="text-green-600 text-sm hover:underline mb-4 block mx-auto">View details →</button>
                    <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white">Get Quotation</Button>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                      POPULAR
                    </div>
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl text-white">🌟</span>
                      </div>
                      <h4 className="font-bold text-lg mb-2 text-gray-800">Premium Package</h4>
                      <div className="text-3xl font-bold text-purple-600 mb-2">$299</div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Complete premium service with eco-friendly products and post-cleaning maintenance.</p>
                    <button className="text-purple-600 text-sm hover:underline mb-4 block mx-auto">View details →</button>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">Get Quotation</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Information */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">⚡ Quick information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
                    <h5 className="font-bold mb-3 text-gray-800 flex items-center">
                      <span className="text-yellow-500 mr-2">📅</span> Year of establishment
                    </h5>
                    <div className="bg-yellow-100 inline-block px-4 py-2 rounded-full">
                      <span className="font-bold text-yellow-800">{provider.yearEstablished}</span>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-4 border-2 border-blue-200 hover:shadow-md transition-shadow">
                      <h5 className="font-bold mb-3 flex items-center text-blue-700">
                        <span className="mr-2">🧹</span> Cleaning service for
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Chair</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Mattress</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Sofa</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Carpet</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Kitchen</Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Bathroom</Badge>
                        <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-300">+6</Badge>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 border-2 border-green-200 hover:shadow-md transition-shadow">
                      <h5 className="font-bold mb-3 flex items-center text-green-700">
                        <span className="mr-2">🌟</span> Service type
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Deep clean</Badge>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Vacuum</Badge>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Sanitize</Badge>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Organize</Badge>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 border-2 border-purple-200 hover:shadow-md transition-shadow">
                      <h5 className="font-bold mb-3 flex items-center text-purple-700">
                        <span className="mr-2">🏢</span> Properties served
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Commercial</Badge>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Office</Badge>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Residential</Badge>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Retail</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">📋 About {provider.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">{provider.description}</p>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-6 border-2 border-orange-200">
                    <h4 className="font-bold mb-4 text-orange-700 flex items-center text-lg">
                      <span className="mr-2">🎯</span> Specialties
                    </h4>
                    <ul className="space-y-3">
                      {provider.specialties.map((specialty, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <span className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
                          <span className="text-gray-700 font-medium">{specialty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 border-2 border-red-200">
                    <h4 className="font-bold mb-4 text-red-700 flex items-center text-lg">
                      <span className="mr-2">📊</span> Quick Facts
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-gray-700 font-medium">Jobs Completed</span>
                        <span className="font-bold text-red-600 text-lg">{provider.completedJobs}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-gray-700 font-medium">Response Time</span>
                        <span className="font-bold text-orange-600">{provider.responseTime}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-gray-700 font-medium">Year Established</span>
                        <span className="font-bold text-yellow-600">{provider.yearEstablished}</span>
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