import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, ArrowRight, Shield, Clock, Users, CheckCircle, Menu, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { serviceCategories, mockProviders } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

const HomeownerLanding = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userType = localStorage.getItem('userType');
    setIsLoggedIn(userType === 'homeowner');
    
    // Remove auto-redirect - allow users to see dashboard without logging in
  }, [navigate]);

  // Auto-switch reviews every 4 seconds - REMOVED
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setActiveReviewIndex((prevIndex) => 
  //       prevIndex === customerReviews.length - 1 ? 0 : prevIndex + 1
  //     );
  //   }, 4000);

  //   return () => clearInterval(interval);
  // }, []);

  const customerReviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "Halifax, NS",
      service: "House Cleaning",
      rating: 5,
      review: "Absolutely fantastic service! The team arrived on time, was incredibly professional, and left my house spotless. I've never seen my windows so clean!",
      avatar: "SJ",
      date: "2 weeks ago"
    },
    {
      id: 2,
      name: "Michael Chen",
      location: "Halifax, NS",
      service: "Electrical Work",
      rating: 5,
      review: "Outstanding electrical work. The electrician was knowledgeable, explained everything clearly, and completed the job efficiently. Highly recommend!",
      avatar: "MC",
      date: "1 month ago"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      location: "Halifax, NS",
      service: "Landscaping",
      rating: 5,
      review: "Transformed our backyard completely! The team was creative, professional, and delivered exactly what we envisioned. Worth every penny!",
      avatar: "ER",
      date: "3 weeks ago"
    },
    {
      id: 4,
      name: "David Thompson",
      location: "Halifax, NS",
      service: "Plumbing",
      rating: 5,
      review: "Quick response time and excellent service. Fixed our emergency plumbing issue within hours. Professional and reasonably priced!",
      avatar: "DT",
      date: "1 week ago"
    },
    {
      id: 5,
      name: "Jessica Park",
      location: "Halifax, NS",
      service: "Interior Painting",
      rating: 5,
      review: "Amazing attention to detail! The painters were neat, fast, and the quality is exceptional. Our home looks brand new!",
      avatar: "JP",
      date: "2 months ago"
    },
    {
      id: 6,
      name: "Robert Wilson",
      location: "Halifax, NS",
      service: "HVAC Services",
      rating: 5,
      review: "Professional HVAC installation and maintenance. The technician was punctual, courteous, and explained everything thoroughly. Great value for money!",
      avatar: "RW",
      date: "1 month ago"
    }
  ];

  const featuredServices = serviceCategories.slice(0, 3);
  const topProviders = mockProviders.slice(0, 3);

  const handleSearch = () => {
    navigate(`/homeowners/browse?search=${searchTerm}`);
  };

  const handleGetDeals = () => {
    // Allow users to see dashboard without signing up
    navigate('/homeowners/dashboard');
  };

  const handleServiceClick = (service) => {
    navigate(`/homeowners/browse?service=${service.name}`);
  };

  // How it works steps for homeowners
  const howItWorksSteps = [
    {
      step: "1",
      title: "Tell us what you need",
      description: "Describe your project and select the service you're looking for",
      icon: "🔍",
      color: "bg-blue-500"
    },
    {
      step: "2", 
      title: "Get matched with pros",
      description: "We'll show you verified service providers in your area",
      icon: "👥",
      color: "bg-green-500"
    },
    {
      step: "3",
      title: "Receive quotes",
      description: "Compare quotes and choose the best provider for your needs",
      icon: "💰",
      color: "bg-purple-500"
    },
    {
      step: "4",
      title: "Book & get it done",
      description: "Schedule your service and track progress through completion",
      icon: "✅",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Doord.</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/homeservices')}
                className="text-sm"
              >
                For Service Providers
              </Button>
              {isLoggedIn && (
                <Button variant="ghost" onClick={() => navigate('/homeowners/dashboard')}>
                  Dashboard
                </Button>
              )}
              <Button variant="ghost" onClick={() => navigate('/homeowners/quotations')}>
                My Quotations
              </Button>
              {isLoggedIn ? (
                <Button variant="outline" onClick={() => {
                  localStorage.removeItem('userType');
                  localStorage.removeItem('user');
                  setIsLoggedIn(false);
                }}>
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate('/homeowners/auth')}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/homeowners/auth')}>
                    Sign Up
                  </Button>
                </>
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
                    navigate('/homeservices');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  For Service Providers
                </Button>
                {isLoggedIn && (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      navigate('/homeowners/dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    Dashboard
                  </Button>
                )}
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
                      localStorage.removeItem('userType');
                      localStorage.removeItem('user');
                      setIsLoggedIn(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    Sign Out
                  </Button>
                ) : (
                  <>
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
                    <Button 
                      onClick={() => {
                        navigate('/homeowners/auth');
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Circles */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute top-32 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 right-1/4 w-4 h-4 bg-blue-400 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute top-1/3 left-1/3 w-3 h-3 bg-blue-600 rounded-full opacity-40 animate-bounce"></div>
          <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-blue-500 rounded-full opacity-50 animate-ping"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-12 lg:p-16">
            {/* Trust Indicators - Hidden on Mobile */}
            <div className="hidden md:flex justify-center space-x-8 mb-8 opacity-70">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Verified Providers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Quick Response</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Trusted by 1000+</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Home Services{' '}
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                at your doorstep
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect with verified professionals for all your home service needs. 
              Get instant quotes, book services, and transform your home effortlessly.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="relative bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="What service do you need? (e.g., cleaning, plumbing, electrical)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 py-4 text-lg border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:text-gray-500"
                    />
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/homeowners/browse')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-h-[56px] sm:min-h-[auto]"
                  >
                    Find Services
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Service Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['Cleaning', 'Plumbing', 'Electrical', 'Landscaping', 'Handyman'].map((service) => (
                <Button
                  key={service}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/homeowners/browse')}
                  className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-blue-700 transition-all duration-300 rounded-full px-6 py-2"
                >
                  {service}
                </Button>
              ))}
            </div>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button 
                size="lg"
                onClick={() => navigate('/homeowners/browse')}
                className="bg-white text-blue-600 hover:bg-gray-50 border-2 border-blue-600 hover:border-blue-700 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Browse All Services
              </Button>
              <p className="text-gray-600 text-sm">
                or{' '}
                <button 
                  onClick={() => navigate('/homeowners/auth')}
                  className="text-blue-600 hover:text-blue-700 font-semibold underline"
                >
                  sign up for free
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 mt-12 lg:mt-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-xl text-gray-600">
              Get your home projects done in 4 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="text-center group relative">
                {/* Animated step circle */}
                <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold transform group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  {step.step}
                </div>
                
                {/* Step content */}
                <div className="space-y-3">
                  <div className="text-4xl mb-3">{step.icon}</div>
                  <h4 className="text-xl font-semibold text-gray-900">{step.title}</h4>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/homeowners/browse')}
            >
              Start Your Project Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Services
            </h3>
            <p className="text-lg text-gray-600">
              Choose from our most requested home services
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {serviceCategories.flatMap(category => 
              category.services.slice(0, 2).map(service => (
                <Card 
                  key={service.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => handleServiceClick(service)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl mb-3">{service.icon}</div>
                    <h4 className="font-semibold text-sm">{service.name}</h4>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <div className="text-center">
            <Button variant="outline" onClick={() => navigate('/homeowners/browse')}>
              View All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Top Rated Providers
            </h3>
            <p className="text-lg text-gray-600">
              Trusted professionals with excellent reviews
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topProviders.map(provider => (
              <Card 
                key={provider.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/homeowners/provider/${provider.id}`)}
              >
                <CardContent className="p-4">
                  {/* Image Gallery */}
                  <div className="grid grid-cols-4 gap-1 h-32 mb-4">
                    <div className="col-span-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl mb-1">
                          {provider.services.includes('Home Cleaning') || provider.services.includes('Office Cleaning') ? '🧹' :
                           provider.services.includes('Plumber') ? '🔧' :
                           provider.services.includes('Electrician') ? '⚡' :
                           provider.services.includes('Landscaping') ? '🌱' : '🏠'}
                        </div>
                        <p className="text-xs text-gray-600">Professional</p>
                      </div>
                    </div>
                    <div className="grid grid-rows-2 gap-1">
                      <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                        <div className="text-lg">✨</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                        <div className="text-lg">🏠</div>
                      </div>
                    </div>
                    <div className="grid grid-rows-2 gap-1">
                      <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                        <div className="text-lg">💯</div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                        <div className="text-lg">⭐</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        {provider.rating} ★
                      </div>
                      <span className="text-gray-500 text-xs">({provider.reviews})</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3 text-sm">{provider.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {provider.services.slice(0, 3).map(service => (
                      <Badge key={service} variant="secondary" className="text-xs">{service}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      📍 {provider.location}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/homeowners/provider/${provider.id}`);
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Doord?
            </h3>
            <p className="text-lg text-gray-600">
              We make finding reliable home services simple and stress-free
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Verified Providers</h4>
              <p className="text-gray-600">All service providers are background checked and verified</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Quick Response</h4>
              <p className="text-gray-600">Get quotes within hours, not days</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Trusted Reviews</h4>
              <p className="text-gray-600">Read real reviews from verified customers</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Quality Guarantee</h4>
              <p className="text-gray-600">100% satisfaction guarantee on all services</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">
              What Our Customers Say
            </h3>
            <p className="text-xl text-gray-600">
              Real experiences from homeowners who trusted us with their projects
            </p>
          </div>

          {/* Horizontal Scrollable Reviews */}
          <div className="relative">
            {/* Desktop: Grid Layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {customerReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  {/* Rating Stars */}
                  <div className="flex justify-center mb-6">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-lg text-gray-700 text-center mb-6 leading-relaxed">
                    "{review.review}"
                  </blockquote>

                  {/* Customer Info */}
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {review.avatar}
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      <p className="text-sm text-gray-600">{review.location}</p>
                      <p className="text-xs text-blue-600 font-medium">{review.service} • {review.date}</p>
                    </div>
                  </div>

                  {/* Service Badge */}
                  <div className="flex justify-center mt-6">
                    <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                      {review.service}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: Horizontal Scroll */}
            <div className="md:hidden">
              <div className="flex overflow-x-auto space-x-6 pb-6 scrollbar-hide">
                {customerReviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex-shrink-0 w-80">
                    {/* Rating Stars */}
                    <div className="flex justify-center mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    {/* Review Text */}
                    <blockquote className="text-base text-gray-700 text-center mb-6 leading-relaxed">
                      "{review.review}"
                    </blockquote>

                    {/* Customer Info */}
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {review.avatar}
                      </div>
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900">{review.name}</h4>
                        <p className="text-sm text-gray-600">{review.location}</p>
                        <p className="text-xs text-blue-600 font-medium">{review.service}</p>
                      </div>
                    </div>

                    {/* Service Badge */}
                    <div className="flex justify-center mt-4">
                      <span className="bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm font-medium">
                        {review.service}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Scroll Indicator for Mobile */}
              <div className="flex justify-center mt-4">
                <p className="text-sm text-gray-500">← Swipe to see more reviews →</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 mb-6">
              Join thousands of satisfied customers in Halifax
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/homeowners/browse')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Doord.</h4>
              <p className="text-gray-400">
                Your trusted marketplace for home services
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Homeowners</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Browse Services</li>
                <li>How It Works</li>
                <li>Safety</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Providers</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Join as Provider</li>
                <li>Dashboard</li>
                <li>Resources</li>
                <li>Community</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Doord. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeownerLanding;