import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, ArrowRight, Shield, Clock, Users, CheckCircle, Menu, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { serviceCategories } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

const HomeownerLanding = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userType = localStorage.getItem('userType');
    setIsLoggedIn(userType === 'homeowner');
  }, [navigate]);

  const customerReviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "Halifax, NS",
      service: "House Cleaning",
      rating: 5,
      review: "Absolutely fantastic service! The team arrived on time, was incredibly professional, and left my house spotless.",
      avatar: "SJ",
      date: "2 weeks ago"
    },
    {
      id: 2,
      name: "Michael Chen",
      location: "Halifax, NS",
      service: "Electrical Work",
      rating: 5,
      review: "Outstanding electrical work. The electrician was knowledgeable, explained everything clearly, and completed the job efficiently.",
      avatar: "MC",
      date: "1 month ago"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      location: "Halifax, NS",
      service: "Landscaping",
      rating: 5,
      review: "Transformed our backyard completely! The team was creative, professional, and delivered exactly what we envisioned.",
      avatar: "ER",
      date: "3 weeks ago"
    }
  ];

  const topProviders = [
    {
      id: 1,
      name: "Halifax Pro Services",
      description: "Professional electrical and plumbing services with over 10 years of experience",
      services: ["Electrical", "Plumbing", "HVAC"],
      rating: 4.9,
      reviews: 127,
      location: "Halifax, NS"
    },
    {
      id: 2,
      name: "Elite Home Solutions",
      description: "Comprehensive home maintenance and cleaning services for residential properties",
      services: ["Home Cleaning", "Landscaping", "Handyman"],
      rating: 4.8,
      reviews: 93,
      location: "Halifax, NS"
    },
    {
      id: 3,
      name: "Quality Care Services",
      description: "Reliable window cleaning and pressure washing services with excellent customer reviews",
      services: ["Window Cleaning", "Pressure Washing", "Gutter Cleaning"],
      rating: 4.7,
      reviews: 156,
      location: "Halifax, NS"
    }
  ];

  const handleSearch = () => {
    navigate(`/homeowners/browse?search=${searchTerm}`);
  };

  const handleServiceCategoryClick = (service) => {
    navigate(`/homeowners/browse?service=${service}`);
  };

  const handleServiceClick = (service) => {
    navigate(`/homeowners/browse?service=${encodeURIComponent(service.name)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sharp Header - Cal.com Style */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-3xl font-black text-blue-600">Doord</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/homeservices')}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg"
              >
                For Providers
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/property-manager')}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg"
              >
                Property Managers
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/homeowners/dashboard')}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg"
              >
                Browse
              </Button>
              {isLoggedIn ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    localStorage.removeItem('userType');
                    localStorage.removeItem('user');
                    setIsLoggedIn(false);
                  }}
                  className="text-sm font-semibold border-gray-300 text-gray-700 hover:border-gray-400 px-4 py-2 rounded-lg"
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/homeowners/auth')}
                    className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/homeowners/auth')}
                    className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-sm"
                  >
                    Get Started
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
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/homeservices');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start font-semibold"
                >
                  For Providers
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/property-manager');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start font-semibold"
                >
                  Property Managers
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/homeowners/dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start font-semibold"
                >
                  Browse
                </Button>
                <div className="border-t pt-2 mt-2">
                  {isLoggedIn ? (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        localStorage.removeItem('userType');
                        localStorage.removeItem('user');
                        setIsLoggedIn(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-start w-full font-semibold"
                    >
                      Sign Out
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          navigate('/homeowners/auth');
                          setIsMobileMenuOpen(false);
                        }}
                        className="justify-start w-full font-semibold mb-2"
                      >
                        Sign In
                      </Button>
                      <Button 
                        onClick={() => {
                          navigate('/homeowners/auth');
                          setIsMobileMenuOpen(false);
                        }}
                        className="justify-start w-full font-bold bg-blue-600 hover:bg-blue-700"
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Cal.com Style Hero Section */}
      <section className="relative bg-white pt-16 pb-20 md:pt-20 md:pb-28">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-blue-50/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%232563eb" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-800 text-sm font-semibold mb-8">
              <Shield className="h-4 w-4 mr-2" />
              Trusted by 1,000+ Halifax homeowners
            </div>

            {/* Main Headline - Cal.com Style Bold */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-6">
              Home services
              <br />
              <span className="text-blue-600">made simple</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect with verified professionals. Get instant quotes. 
              <br className="hidden md:block" />
              Transform your home effortlessly.
            </p>

            {/* Sharp Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row bg-white rounded-2xl p-2 shadow-xl border border-gray-200">
                <div className="relative flex-1 mb-2 sm:mb-0 sm:mr-2">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="What service do you need?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-4 text-lg font-medium border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:text-gray-500 placeholder:font-medium rounded-xl"
                  />
                </div>
                <Button 
                  size="lg" 
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] min-h-[56px]"
                >
                  Find Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick Service Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {['Cleaning', 'Plumbing', 'Electrical', 'Landscaping', 'Handyman'].map((service) => (
                <button
                  key={service}
                  onClick={() => handleServiceCategoryClick(service)}
                  className="px-6 py-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 font-semibold rounded-full transition-all duration-200 hover:shadow-md"
                >
                  {service}
                </button>
              ))}
            </div>

            {/* Sharp CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => navigate('/homeowners/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Browse Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="ghost"
                onClick={() => navigate('/homeowners/auth')}
                className="text-gray-600 hover:text-gray-900 font-semibold text-lg px-6 py-4 rounded-xl"
              >
                Learn more →
              </Button>
            </div>
          </div>
        </div>
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
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  {/* Image Gallery */}
                  <div className="grid grid-cols-4 gap-1 h-32 mb-4">
                    <div className="col-span-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl mb-1">
                          {provider.services.includes('Home Cleaning') || provider.services.includes('Office Cleaning') ? '🧹' :
                           provider.services.includes('Plumbing') ? '🔧' :
                           provider.services.includes('Electrical') ? '⚡' :
                           provider.services.includes('Landscaping') ? '🌱' :
                           provider.services.includes('Window Cleaning') ? '🪟' : '🏠'}
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
                    <span className="text-sm text-blue-600 font-medium">
                      Top Rated ⭐
                    </span>
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
                <li>
                  <button 
                    onClick={() => navigate('/homeowners/browse')}
                    className="hover:text-white transition-colors"
                  >
                    Browse Services
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/homeowners/auth')}
                    className="hover:text-white transition-colors"
                  >
                    Sign Up
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors">
                    How It Works
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors">
                    Support
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Providers</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={() => navigate('/homeservices/auth')}
                    className="hover:text-white transition-colors"
                  >
                    Join as Provider
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/homeowners/browse')}
                    className="hover:text-white transition-colors"
                  >
                    Explore Services
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors">
                    Resources
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors">
                    Community
                  </button>
                </li>
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