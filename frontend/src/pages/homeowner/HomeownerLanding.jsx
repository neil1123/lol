import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, ArrowRight, Shield, Clock, Users, CheckCircle, Menu, X, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { serviceCategories } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';
import ChatSidebar from '../../components/chat/ChatSidebar';
import SignInPopup from '../../components/chat/SignInPopup';

const HomeownerLanding = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [initialMessage, setInitialMessage] = useState('');
  const navigate = useNavigate();

  const handleStartChat = () => {
    if (searchTerm.trim()) {
      if (!isLoggedIn) {
        setShowSignInPopup(true);
      } else {
        setInitialMessage(searchTerm);
        setIsChatOpen(true);
        setSearchTerm('');
        navigate('/homeowners/browse');
      }
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const userType = localStorage.getItem('userType');
    setIsLoggedIn(userType === 'homeowner');
    
    // Remove auto-redirect - allow users to see dashboard without logging in
  }, [navigate]);

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

  // Mock data for top rated providers - display only
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

  const handleQuotationRequest = () => {
    // Allow users to browse services without login
    navigate('/homeowners/browse');
  };

  const handleServiceCategoryClick = (service) => {
    // Allow users to browse services without login
    navigate(`/homeowners/browse?service=${service}`);
  };

  const handleGetDeals = () => {
    // Allow users to see dashboard without signing up
    navigate('/homeowners/dashboard');
  };

  const handleServiceClick = (service) => {
    console.log('Service clicked:', service);
    console.log('Service name:', service.name);
    navigate(`/homeowners/browse?service=${encodeURIComponent(service.name)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Cal.com Island Style */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center h-14 px-6">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Doord.</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/homeservices')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                For Service Providers
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/property-manager')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                For Property Managers
              </Button>
              <Button 
                onClick={() => window.open('https://cal.com/neil-edward/30min', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Book Demo
              </Button>
              {isLoggedIn ? (
                <Button variant="outline" onClick={() => {
                  localStorage.removeItem('userType');
                  localStorage.removeItem('user');
                  setIsLoggedIn(false);
                }} className="text-sm">
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate('/homeowners/auth')} className="text-sm">
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/homeowners/auth')} className="text-sm">
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
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur-md rounded-b-2xl">
              <div className="p-4 space-y-3">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/homeservices');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start w-full text-sm"
                >
                  For Service Providers
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/property-manager');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start w-full text-sm"
                >
                  For Property Managers
                </Button>
                <Button 
                  onClick={() => {
                    window.open('https://cal.com/neil-edward/30min', '_blank');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold mb-2 text-sm"
                >
                  Book Demo
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
                    className="justify-start w-full text-sm"
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
                      className="justify-start w-full text-sm"
                    >
                      Sign In
                    </Button>
                    <Button 
                      onClick={() => {
                        navigate('/homeowners/auth');
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-start w-full text-sm"
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

      {/* Hero Section - Cal.com Style */}
      <section className="relative overflow-hidden bg-white pt-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:6rem_4rem]" />
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              Home services
              <br />
              <span className="text-blue-600">at your doorstep</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed font-medium" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              Connect with verified professionals for all your home service needs. Get instant quotes and transform your home effortlessly.
            </p>

            {/* AI Prompt Input Bar */}
            <div className="relative max-w-3xl mx-auto mb-8">
              <div className="relative bg-white rounded-2xl shadow-xl border-2 border-gray-200 hover:border-blue-400 transition-all duration-300">
                <div className="flex items-center p-3">
                  <div className="flex-1 flex items-center gap-3 px-3">
                    <MessageCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <Input
                      placeholder="Describe what service you need... (e.g., I need a plumber for a leaky faucet)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && searchTerm.trim()) {
                          handleStartChat();
                        }
                      }}
                      className="border-0 bg-transparent focus:ring-0 focus:outline-none text-base placeholder:text-gray-400"
                      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                    />
                  </div>
                  <Button
                    onClick={handleStartChat}
                    disabled={!searchTerm.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-3" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                Our AI will guide you to the perfect service provider
              </p>
            </div>

            {/* Quick Service Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {['Cleaning', 'Plumbing', 'Electrical', 'Landscaping', 'Handyman'].map((service) => (
                <Button
                  key={service}
                  variant="outline"
                  size="sm"
                  onClick={() => handleServiceCategoryClick(service)}
                  className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-blue-700 transition-all duration-300 rounded-full px-6 py-2"
                  style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  {service}
                </Button>
              ))}
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => window.open('https://cal.com/neil-edward/30min', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Book Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/homeowners/dashboard')}
                className="border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-700 px-8 py-4 text-lg font-semibold rounded-xl"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Browse Services
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 mt-12">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Verified Providers</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Quick Response</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <span style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Trusted by 1000+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Cal.com Style Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              Get quality home services in four simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Step 1: Search services */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="mb-8 relative h-40 flex items-center justify-center overflow-hidden">
                <svg className="w-32 h-32 transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="35" cy="35" r="20" stroke="#3B82F6" strokeWidth="3" fill="none" className="animate-pulse"/>
                  <line x1="50" y1="50" x2="70" y2="70" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="35" cy="35" r="12" fill="#DBEAFE" className="opacity-50"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                Search services
              </h3>
              <p className="text-gray-600 text-base leading-relaxed" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                Tell us what you need. From cleaning to repairs, we connect you with the right professionals.
              </p>
            </div>

            {/* Step 2: Get matched */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="mb-8 relative h-40 flex items-center justify-center overflow-hidden">
                <svg className="w-32 h-32 transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="15" fill="#DBEAFE"/>
                  <circle cx="30" cy="30" r="7" fill="#3B82F6"/>
                  <circle cx="70" cy="30" r="15" fill="#DBEAFE"/>
                  <circle cx="70" cy="30" r="7" fill="#3B82F6"/>
                  <path d="M30 48 Q50 35 70 48" stroke="#3B82F6" strokeWidth="2" fill="none" strokeDasharray="2,2" className="animate-pulse"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                Get matched
              </h3>
              <p className="text-gray-600 text-base leading-relaxed" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                We show you verified professionals in your area. Compare profiles, reviews, and pricing.
              </p>
            </div>

            {/* Step 3: Book easily */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="mb-8 relative h-40 flex items-center justify-center overflow-hidden">
                <svg className="w-32 h-32 transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="25" y="30" width="50" height="45" rx="5" stroke="#3B82F6" strokeWidth="2" fill="#DBEAFE" fillOpacity="0.2"/>
                  <line x1="35" y1="45" x2="45" y2="45" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="35" y1="55" x2="65" y2="55" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="35" y1="65" x2="55" y2="65" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="75" cy="65" r="12" fill="#3B82F6" className="animate-pulse"/>
                  <path d="M70 65 L73 68 L80 60" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                Book easily
              </h3>
              <p className="text-gray-600 text-base leading-relaxed" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                Choose your preferred professional and book a time that works for you. It's that simple.
              </p>
            </div>

            {/* Step 4: Enjoy results */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="mb-8 relative h-40 flex items-center justify-center overflow-hidden">
                <svg className="w-32 h-32 transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="40" r="25" fill="#DBEAFE" fillOpacity="0.3"/>
                  <path d="M35 40 L45 50 L65 30" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M30 65 Q50 75 70 65" stroke="#3B82F6" strokeWidth="2" fill="none" className="animate-pulse"/>
                  <circle cx="35" cy="55" r="2" fill="#3B82F6"/>
                  <circle cx="65" cy="55" r="2" fill="#3B82F6"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                Enjoy results
              </h3>
              <p className="text-gray-600 text-base leading-relaxed" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                Relax while professionals take care of your home. Rate your experience when done.
              </p>
            </div>
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
              category.services.slice(0, 2).map(service => {
                // Function to return custom SVG icon based on service name
                const getServiceIcon = (serviceName) => {
                  const iconMap = {
                    'Electrician': (
                      <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 20 L60 50 L50 50 L55 80 L35 50 L45 50 Z" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2"/>
                        <circle cx="50" cy="50" r="35" stroke="#DBEAFE" strokeWidth="2" fill="none" opacity="0.3"/>
                      </svg>
                    ),
                    'Plumber': (
                      <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M30 70 L30 50 Q30 30 50 30 Q70 30 70 50 L70 70" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" fill="none"/>
                        <circle cx="30" cy="75" r="5" fill="#3B82F6"/>
                        <circle cx="70" cy="75" r="5" fill="#3B82F6"/>
                        <path d="M40 40 Q50 35 60 40" stroke="#DBEAFE" strokeWidth="2" fill="none"/>
                      </svg>
                    ),
                    'Home Cleaning': (
                      <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="35" y="40" width="8" height="35" rx="4" fill="#3B82F6"/>
                        <rect x="30" y="25" width="18" height="20" rx="3" fill="#DBEAFE"/>
                        <path d="M50 50 L70 35 L70 70 L50 70 Z" fill="#3B82F6" opacity="0.6"/>
                        <line x1="55" y1="50" x2="65" y2="50" stroke="white" strokeWidth="2"/>
                        <line x1="55" y1="58" x2="65" y2="58" stroke="white" strokeWidth="2"/>
                      </svg>
                    ),
                    'Office Cleaning': (
                      <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="25" y="30" width="50" height="45" rx="3" stroke="#3B82F6" strokeWidth="2" fill="#DBEAFE" fillOpacity="0.2"/>
                        <line x1="35" y1="45" x2="65" y2="45" stroke="#3B82F6" strokeWidth="2"/>
                        <line x1="35" y1="55" x2="65" y2="55" stroke="#3B82F6" strokeWidth="2"/>
                        <circle cx="55" cy="65" r="8" fill="#3B82F6"/>
                        <path d="M52 65 L54 67 L58 62" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ),
                    'Landscaping': (
                      <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 60 Q35 45 35 35 Q35 25 45 25 Q50 30 50 30 Q50 30 55 25 Q65 25 65 35 Q65 45 50 60" fill="#DBEAFE"/>
                        <path d="M50 60 Q35 45 35 35 Q35 25 45 25 Q50 30 50 30 Q50 30 55 25 Q65 25 65 35 Q65 45 50 60" stroke="#3B82F6" strokeWidth="2"/>
                        <rect x="47" y="55" width="6" height="20" fill="#3B82F6"/>
                      </svg>
                    ),
                    'Lawn Mowing & Maintenance': (
                      <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="30" y="50" width="40" height="15" rx="3" fill="#3B82F6"/>
                        <circle cx="38" cy="70" r="8" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
                        <circle cx="62" cy="70" r="8" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
                        <rect x="45" y="35" width="10" height="18" rx="2" fill="#3B82F6"/>
                      </svg>
                    ),
                    'Window Cleaning': (
                      <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="30" y="25" width="40" height="50" rx="2" stroke="#3B82F6" strokeWidth="2" fill="#DBEAFE" fillOpacity="0.2"/>
                        <line x1="50" y1="25" x2="50" y2="75" stroke="#3B82F6" strokeWidth="2"/>
                        <line x1="30" y1="50" x2="70" y2="50" stroke="#3B82F6" strokeWidth="2"/>
                        <circle cx="55" cy="35" r="3" fill="#3B82F6"/>
                        <path d="M35 40 L45 50" stroke="white" strokeWidth="2" opacity="0.6"/>
                      </svg>
                    ),
                    'Pressure Washing': (
                      <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="30" y="35" width="12" height="30" rx="2" fill="#3B82F6"/>
                        <circle cx="36" cy="30" r="5" fill="#3B82F6"/>
                        <path d="M42 50 L55 50 L55 65 L60 70" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
                        <line x1="60" y1="70" x2="65" y2="75" stroke="#DBEAFE" strokeWidth="2"/>
                        <line x1="63" y1="72" x2="68" y2="77" stroke="#DBEAFE" strokeWidth="2"/>
                        <line x1="66" y1="74" x2="71" y2="79" stroke="#DBEAFE" strokeWidth="2"/>
                      </svg>
                    ),
                    'Gutter Cleaning': (
                      <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25 40 L50 25 L75 40 L75 45 L25 45 Z" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
                        <rect x="70" y="45" width="8" height="25" fill="#3B82F6"/>
                        <path d="M73 70 L73 75 L70 78" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <circle cx="68" cy="80" r="2" fill="#3B82F6"/>
                      </svg>
                    ),
                    'HVAC Services': (
                      <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="30" y="35" width="40" height="30" rx="3" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
                        <line x1="35" y1="45" x2="65" y2="45" stroke="#3B82F6" strokeWidth="1.5"/>
                        <line x1="35" y1="50" x2="65" y2="50" stroke="#3B82F6" strokeWidth="1.5"/>
                        <line x1="35" y1="55" x2="65" y2="55" stroke="#3B82F6" strokeWidth="1.5"/>
                        <circle cx="50" cy="50" r="8" fill="white" stroke="#3B82F6" strokeWidth="2"/>
                      </svg>
                    ),
                    'Handyman Services': (
                      <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="42" y="30" width="6" height="35" fill="#3B82F6"/>
                        <circle cx="45" cy="25" r="8" fill="#3B82F6"/>
                        <path d="M35 65 L55 65 L52 75 L38 75 Z" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
                        <rect x="52" y="40" width="15" height="8" rx="2" fill="#3B82F6" transform="rotate(45 60 44)"/>
                      </svg>
                    ),
                    'Car Detailing': (
                      <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25 55 L30 45 L40 40 L60 40 L70 45 L75 55 L75 65 L25 65 Z" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
                        <circle cx="35" cy="65" r="6" fill="white" stroke="#3B82F6" strokeWidth="2"/>
                        <circle cx="65" cy="65" r="6" fill="white" stroke="#3B82F6" strokeWidth="2"/>
                        <rect x="42" y="45" width="16" height="12" rx="1" fill="white" stroke="#3B82F6" strokeWidth="1.5"/>
                      </svg>
                    )
                  };
                  
                  return iconMap[serviceName] || (
                    <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="30" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
                      <path d="M40 50 L48 58 L62 42" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  );
                };
                
                return (
                  <Card 
                    key={service.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 group"
                    onClick={() => handleServiceClick(service)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="mb-3 flex justify-center transform group-hover:scale-110 transition-transform duration-300">
                        {getServiceIcon(service.name)}
                      </div>
                      <h4 className="font-semibold text-sm">{service.name}</h4>
                    </CardContent>
                  </Card>
                );
              })
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

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onMinimize={() => setIsChatOpen(false)}
        sessionId={sessionId}
        initialMessage={initialMessage}
      />

      {/* Sign In Popup */}
      <SignInPopup
        isOpen={showSignInPopup}
        onClose={() => setShowSignInPopup(false)}
        onContinueWithoutSignIn={() => {
          setInitialMessage(searchTerm);
          setSearchTerm('');
          setIsChatOpen(true);
          navigate('/homeowners/browse');
        }}
      />
    </div>
  );
};

export default HomeownerLanding;