import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, ArrowRight, Shield, Clock, Users, CheckCircle, Menu, X, Zap, Target, Calendar } from 'lucide-react';
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

      {/* Sharp Features Section - Cal.com Style */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Why choose Doord?
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              The fastest way to find trusted home services
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Instant Quotes</h3>
              <p className="text-gray-600 font-medium">Get quotes from verified professionals within minutes, not days</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Verified Pros</h3>
              <p className="text-gray-600 font-medium">All service providers are background checked and reviewed</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Perfect Match</h3>
              <p className="text-gray-600 font-medium">Smart matching connects you with the right pro for your project</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simplified Cal.com Style */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              From request to completion in 3 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-black mx-auto mb-6">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Describe your project</h3>
              <p className="text-gray-600">Tell us what you need and get matched with local professionals</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-black mx-auto mb-6">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Compare quotes</h3>
              <p className="text-gray-600">Review proposals and choose the best professional for your needs</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-black mx-auto mb-6">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get it done</h3>
              <p className="text-gray-600">Schedule and track your service from start to finish</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/homeowners/browse')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Your Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Services - Grid Style */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Popular services
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              Choose from our most requested home services
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {serviceCategories.flatMap(category => 
              category.services.slice(0, 2).map(service => (
                <div
                  key={service.id} 
                  className="bg-white border border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200 hover:scale-105"
                  onClick={() => handleServiceClick(service)}
                >
                  <div className="text-4xl mb-3">{service.icon}</div>
                  <h4 className="font-bold text-sm text-gray-900">{service.name}</h4>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              onClick={() => navigate('/homeowners/browse')}
              className="border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-700 font-semibold px-8 py-3 rounded-xl"
            >
              View All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof - Customer Reviews */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Trusted by homeowners
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              Real reviews from Halifax residents
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {customerReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                {/* Rating */}
                <div className="flex justify-center mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Review */}
                <blockquote className="text-lg text-gray-700 text-center mb-6 font-medium">
                  "{review.review}"
                </blockquote>

                {/* Customer */}
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {review.avatar}
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                    <p className="text-sm text-gray-600">{review.service}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Cal.com Style */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to transform your home?
          </h2>
          <p className="text-xl text-blue-100 font-medium mb-10">
            Join thousands of satisfied homeowners in Halifax
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => navigate('/homeowners/browse')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Find Services Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="ghost"
              onClick={() => navigate('/homeowners/auth')}
              className="text-white hover:text-blue-100 font-semibold text-lg px-8 py-4 rounded-xl border border-blue-400 hover:border-blue-300"
            >
              Sign up for free
            </Button>
          </div>
        </div>
      </section>

      {/* Sharp Footer - Cal.com Style */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-2xl font-black text-white mb-4">Doord</h4>
              <p className="text-gray-400 font-medium">
                The trusted marketplace for home services
              </p>
            </div>
            <div>
              <h5 className="font-bold text-white mb-4">For Homeowners</h5>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <button 
                    onClick={() => navigate('/homeowners/browse')}
                    className="hover:text-white transition-colors font-medium"
                  >
                    Browse Services
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/homeowners/auth')}
                    className="hover:text-white transition-colors font-medium"
                  >
                    Get Started
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors font-medium">
                    How It Works
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-4">For Providers</h5>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <button 
                    onClick={() => navigate('/homeservices/auth')}
                    className="hover:text-white transition-colors font-medium"
                  >
                    Join as Provider
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors font-medium">
                    Resources
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-4">Company</h5>
              <ul className="space-y-3 text-gray-400">
                <li className="font-medium">About</li>
                <li className="font-medium">Contact</li>
                <li className="font-medium">Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 font-medium">&copy; 2024 Doord. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button className="text-gray-400 hover:text-white font-medium">Privacy</button>
              <button className="text-gray-400 hover:text-white font-medium">Terms</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeownerLanding;