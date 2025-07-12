import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter, ArrowLeft, SlidersHorizontal, Menu, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { serviceCategories } from '../../data/mockData';
import { useNavigate, useLocation } from 'react-router-dom';

const ServiceBrowse = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedServices, setSelectedServices] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [allProviders, setAllProviders] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();


  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get query params and load providers
  useEffect(() => {
    // Check if user is logged in
    const userType = localStorage.getItem('userType');
    setIsLoggedIn(userType === 'homeowner');
    
    // Get URL parameters
    const searchParams = new URLSearchParams(location.search);
    const searchParam = searchParams.get('search');
    const serviceParam = searchParams.get('service');
    
    if (searchParam) setSearchTerm(searchParam);
    if (serviceParam) setSelectedServices([serviceParam]);
    
    // Load all providers (mock + registered)
    const providers = getAllProviders();
    setAllProviders(providers);
  }, [location]);

  // Refresh providers periodically to catch new registrations
  useEffect(() => {
    const interval = setInterval(() => {
      const providers = getAllProviders();
      setAllProviders(providers);
    }, 2000); // Check every 2 seconds for new providers
    
    return () => clearInterval(interval);
  }, []);

  // Get all providers: ONLY registered providers (no mock data for production)
  const getAllProviders = () => {
    const registeredProviders = JSON.parse(localStorage.getItem('registeredProviders') || '[]');
    
    // Filter only active providers and use their complete profile data
    const formattedRegisteredProviders = registeredProviders
      .filter(provider => provider.isActive !== false) // Only show active providers
      .map(provider => ({
        id: provider.id,
        name: provider.businessName,
        description: provider.description || `Professional ${Array.isArray(provider.services) ? provider.services.join(' and ') : provider.services} services`,
        services: Array.isArray(provider.services) ? provider.services : [provider.services],
        rating: provider.rating || 5.0,
        reviews: provider.reviews || 0,
        completedJobs: provider.completedJobs || 0,
        location: provider.location || "Halifax, NS",
        responseTime: provider.responseTime || "Usually responds within 1 hour",
        yearEstablished: provider.yearEstablished || "2024",
        specialties: provider.specialties || ["Professional service", "Quality work", "Customer satisfaction"],
        priceRange: provider.priceRange || "$50-$500",
        ownerName: provider.ownerName,
        email: provider.email,
        phone: provider.phone
      }));
    
    // Return ONLY registered providers (no mock data)
    return formattedRegisteredProviders;
  };


  const filteredProviders = allProviders.filter(provider => {
    const matchesSearch = !searchTerm || 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.services.some(service => 
        service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesServices = selectedServices.length === 0 ||
      selectedServices.some(service => {
        // Handle partial matching for service categories (e.g., "Cleaning" matches "Home Cleaning")
        return provider.services.some(providerService => 
          providerService.toLowerCase().includes(service.toLowerCase()) ||
          service.toLowerCase().includes(providerService.toLowerCase())
        );
      });
    
    return matchesSearch && matchesServices;
  });

  const sortedProviders = [...filteredProviders].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'reviews':
        return b.reviews - a.reviews;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleServiceToggle = (serviceName) => {
    setSelectedServices(prev => 
      prev.includes(serviceName)
        ? prev.filter(s => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const handleRequestQuote = (providerId) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      navigate('/homeowners/auth');
      return;
    }
    
    // If logged in, proceed to messages
    navigate('/homeowners/dashboard?tab=messages');
  };

  const handleGetQuotation = (providerId) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      navigate('/homeowners/auth');
      return;
    }
    
    // If logged in, proceed to messages
    navigate('/homeowners/dashboard?tab=messages');
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
                onClick={() => navigate('/homeowners')}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Doord.</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/homeowners/dashboard')}
              >
                Dashboard
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
                    navigate('/homeowners/dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Dashboard
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

          {/* Search and Filters */}
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search services or providers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-48 bg-white">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999] bg-white border border-gray-200 shadow-2xl rounded-md min-w-[200px] max-h-[200px] overflow-auto">
                        <SelectItem value="rating" className="hover:bg-gray-50 cursor-pointer px-3 py-2 text-gray-900">Highest Rated</SelectItem>
                        <SelectItem value="reviews" className="hover:bg-gray-50 cursor-pointer px-3 py-2 text-gray-900">Most Reviews</SelectItem>
                        <SelectItem value="name" className="hover:bg-gray-50 cursor-pointer px-3 py-2 text-gray-900">Name A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-white hover:bg-gray-50 border-gray-200"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Filters</span>
                  </Button>
                </div>
                
                {/* Filters Panel */}
                {showFilters && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold mb-4">Filter by Services</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {serviceCategories.map(category => (
                        <div key={category.id}>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">{category.name}</h4>
                          <div className="space-y-2">
                            {category.services.map(service => (
                              <div key={service.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={service.name}
                                  checked={selectedServices.includes(service.name)}
                                  onCheckedChange={() => handleServiceToggle(service.name)}
                                />
                                <label
                                  htmlFor={service.name}
                                  className="text-sm text-gray-600 cursor-pointer"
                                >
                                  {service.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedServices.length > 0 
              ? `${selectedServices.join(', ')} Services` 
              : 'All Services'
            }
          </h2>
          <p className="text-gray-600">
            {sortedProviders.length} providers found
          </p>
        </div>

        {sortedProviders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No providers found matching your criteria.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedServices([]);
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {sortedProviders.map(provider => (
              <Card 
                key={provider.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/homeowners/provider/${provider.id}`)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4 sm:gap-6">
                    {/* Image Gallery */}
                    <div className="w-full sm:w-80 mx-auto sm:mx-0">
                      <div className="grid grid-cols-4 gap-2 h-32 sm:h-48">
                        <div className="col-span-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">
                              {provider.services.includes('Home Cleaning') || provider.services.includes('Office Cleaning') ? '🧹' :
                               provider.services.includes('Plumber') ? '🔧' :
                               provider.services.includes('Electrician') ? '⚡' :
                               provider.services.includes('Landscaping') ? '🌱' : '🏠'}
                            </div>
                            <p className="text-xs text-gray-600">Professional Services</p>
                          </div>
                        </div>
                        <div className="grid grid-rows-2 gap-2">
                          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                            <div className="text-lg sm:text-xl">✨</div>
                          </div>
                          <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                            <div className="text-lg sm:text-xl">🏠</div>
                          </div>
                        </div>
                        <div className="grid grid-rows-2 gap-2">
                          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                            <div className="text-lg sm:text-xl">💯</div>
                          </div>
                          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                            <div className="text-lg sm:text-xl">⭐</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row items-start justify-between mb-4">
                        <div className="w-full">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{provider.name}</h3>
                            <button className="p-1 hover:bg-gray-100 rounded-full self-start sm:self-auto">
                              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mt-1">
                            <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
                              {provider.rating} ★
                            </div>
                            <span className="text-gray-500 text-sm">({provider.reviews} reviews)</span>
                            <span className="text-gray-300 hidden sm:inline">•</span>
                            <span className="text-gray-600 text-sm">{provider.completedJobs} jobs completed</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 text-sm sm:text-base">{provider.description}</p>
                      
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                        {provider.services.map(service => (
                          <Badge key={service} variant="outline" className="text-xs">{service}</Badge>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500 mb-4">
                        <span>📍 {provider.location}</span>
                        <span>⏱️ {provider.responseTime}</span>
                        <span>📅 Est. {provider.yearEstablished}</span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGetQuotation(provider.id);
                          }}
                          className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Get Quotation
                        </Button>
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequestQuote(provider.id);
                          }}
                          className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Starts from $199.00
                        </Button>
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle messaging
                          }}
                          className="w-full sm:w-auto"
                        >
                          Get best deal
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceBrowse;