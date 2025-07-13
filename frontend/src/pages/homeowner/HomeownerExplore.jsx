import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  Shield, 
  Heart,
  Filter,
  Zap,
  Home,
  User,
  Bell,
  LogOut,
  Menu,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import apiService from '../../services/api';

const HomeownerExplore = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    navigate('/homeowners');
  };

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');
    setIsLoggedIn(user && userType === 'homeowner');

    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const providersData = await apiService.getAllProviders();
      
      // Format providers for display
      const formattedProviders = providersData.map(provider => ({
        id: provider.id,
        name: provider.business_name || provider.name,
        description: provider.description || `Professional services`,
        services: Array.isArray(provider.services) ? provider.services : [provider.services],
        rating: provider.rating || 5.0,
        reviews: provider.reviews || 0,
        location: provider.location || "Halifax, NS",
        responseTime: provider.response_time || "Usually responds within 1 hour",
        priceRange: provider.price_range || "$50-$500",
        isAvailable: true
      }));
      
      setProviders(formattedProviders);
    } catch (error) {
      console.error('Failed to load providers:', error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const serviceCategories = [
    { name: 'Home Cleaning', icon: '🧹', color: 'bg-blue-100 text-blue-700' },
    { name: 'Plumbing', icon: '🔧', color: 'bg-green-100 text-green-700' },
    { name: 'Electrical', icon: '⚡', color: 'bg-yellow-100 text-yellow-700' },
    { name: 'HVAC Services', icon: '❄️', color: 'bg-cyan-100 text-cyan-700' },
    { name: 'Landscaping', icon: '🌱', color: 'bg-emerald-100 text-emerald-700' },
    { name: 'Painting', icon: '🎨', color: 'bg-purple-100 text-purple-700' },
    { name: 'Handyman Services', icon: '🔨', color: 'bg-orange-100 text-orange-700' },
    { name: 'Window Cleaning', icon: '🪟', color: 'bg-indigo-100 text-indigo-700' }
  ];

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = !searchTerm || 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || 
      provider.services.some(service => service.toLowerCase().includes(selectedCategory.toLowerCase()));
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Doord</h1>
              <span className="ml-2 text-gray-500">Explore Services</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => navigate('/homeowners')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <Home className="h-4 w-4 inline mr-2" />
                Home
              </button>
              <button
                className="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700"
              >
                <Search className="h-4 w-4 inline mr-2" />
                Explore
              </button>
              {isLoggedIn && (
                <button
                  onClick={() => navigate('/homeowners/dashboard')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Dashboard
                </button>
              )}
            </nav>

            {/* Right side - Auth aware */}
            <div className="flex items-center space-x-4">
              {!isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/homeowners/auth')}
                    className="hidden sm:flex"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/homeowners/auth')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Sign Up
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/homeowners/dashboard')}
                    className="hidden sm:flex"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigate('/homeowners');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-500"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </button>
                
                {isLoggedIn && (
                  <button
                    onClick={() => {
                      navigate('/homeowners/dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-500"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </button>
                )}
                
                {!isLoggedIn && (
                  <>
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        navigate('/homeowners/auth');
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-blue-600"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Sign In / Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Search Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find the Perfect Service Provider
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Browse trusted professionals in your area
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search for services (e.g., home cleaning, plumbing...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-lg py-3"
                />
              </div>
              <Button 
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (searchTerm.trim()) {
                    navigate(`/homeowners/browse?search=${encodeURIComponent(searchTerm)}`);
                  }
                }}
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedCategory === '' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory('')}
              className={selectedCategory === '' ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              All Services
            </Button>
            {serviceCategories.slice(0, 4).map(category => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className={selectedCategory === category.name ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Service Categories Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {serviceCategories.map(category => (
              <Card 
                key={category.name}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  navigate(`/homeowners/browse?service=${encodeURIComponent(category.name)}`);
                }}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <h3 className="font-semibold text-sm">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Providers */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Providers</h2>
            <Button 
              variant="outline"
              onClick={() => navigate('/homeowners/browse')}
            >
              View All
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading providers...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.slice(0, 6).map(provider => (
                <Card 
                  key={provider.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg">{provider.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{provider.rating}</span>
                        <span className="text-gray-500 text-sm">({provider.reviews})</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 text-sm">{provider.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {provider.services.slice(0, 3).map(service => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {provider.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Available
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          if (!isLoggedIn) {
                            navigate('/homeowners/auth');
                          } else {
                            navigate(`/homeowners/provider/${provider.id}`);
                          }
                        }}
                      >
                        Get Quote
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/homeowners/provider/${provider.id}`)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{providers.length}+</div>
              <p className="text-gray-600">Verified Providers</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <p className="text-gray-600">Service Categories</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">4.8★</div>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeownerExplore;