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
            <Card>
              <CardHeader>
                <CardTitle>Price list</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-2">House cleaning services</h4>
                    <p className="text-sm text-gray-600 mb-4">House cleaning services offers comprehensive...</p>
                    <button className="text-blue-600 text-sm hover:underline mb-4">View details</button>
                    <Button variant="outline" className="w-full">Get Quotation</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-2">House cleaning services</h4>
                    <p className="text-sm text-gray-600 mb-4">House cleaning services offers comprehensive...</p>
                    <button className="text-blue-600 text-sm hover:underline mb-4">View details</button>
                    <Button variant="outline" className="w-full">Get Quotation</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-2">House cleaning services</h4>
                    <p className="text-sm text-gray-600 mb-4">House cleaning services offers comprehensive...</p>
                    <button className="text-blue-600 text-sm hover:underline mb-4">View details</button>
                    <Button className="w-full">Get Quotation</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Information */}
            <Card>
              <CardHeader>
                <CardTitle>Quick information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold mb-2">Year of establishment</h5>
                    <p className="text-gray-700">{provider.yearEstablished}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h5 className="font-semibold mb-2 flex items-center">
                        <span className="mr-2">✓</span> Cleaning service for
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Chair</Badge>
                        <Badge variant="secondary">Mattress</Badge>
                        <Badge variant="secondary">+6</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold mb-2 flex items-center">
                        <span className="mr-2">✓</span> Service type
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Deep clean</Badge>
                        <Badge variant="secondary">Vacuum</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold mb-2 flex items-center">
                        <span className="mr-2">✓</span> Properties served
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Commercial</Badge>
                        <Badge variant="secondary">Office</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About {provider.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{provider.description}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Specialties</h4>
                    <ul className="space-y-1">
                      {provider.specialties.map((specialty, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          <span className="text-gray-600">{specialty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Quick Facts</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jobs Completed</span>
                        <span className="font-semibold">{provider.completedJobs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Response Time</span>
                        <span className="font-semibold">{provider.responseTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year Established</span>
                        <span className="font-semibold">{provider.yearEstablished}</span>
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