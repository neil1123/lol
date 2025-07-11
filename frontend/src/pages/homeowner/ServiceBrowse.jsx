import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { serviceCategories, mockProviders } from '../../data/mockData';
import { useNavigate, useLocation } from 'react-router-dom';

const ServiceBrowse = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedServices, setSelectedServices] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const serviceParam = params.get('service');
    
    if (searchParam) setSearchTerm(searchParam);
    if (serviceParam) setSelectedServices([serviceParam]);
  }, [location]);

  const filteredProviders = mockProviders.filter(provider => {
    const matchesSearch = !searchTerm || 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.services.some(service => 
        service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesServices = selectedServices.length === 0 ||
      selectedServices.some(service => provider.services.includes(service));
    
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
    // Store in localStorage for mock functionality
    const quoteRequest = {
      providerId,
      homeownerId: 1, // Mock homeowner ID
      timestamp: new Date().toISOString(),
      services: selectedServices
    };
    
    const existingRequests = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
    localStorage.setItem('quoteRequests', JSON.stringify([...existingRequests, quoteRequest]));
    
    navigate('/homeowners/quotations');
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

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
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
            
            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </Button>
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-4">Filter by Services</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{provider.rating}</span>
                              <span className="text-gray-500">({provider.reviews} reviews)</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-600">{provider.completedJobs} jobs completed</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{provider.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {provider.services.map(service => (
                          <Badge key={service} variant="secondary">{service}</Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>📍 {provider.location}</span>
                        <span>⏱️ {provider.responseTime}</span>
                        <span>📅 Est. {provider.yearEstablished}</span>
                      </div>
                    </div>
                    
                    <div className="lg:ml-6 mt-4 lg:mt-0 flex flex-col space-y-2">
                      <Button
                        onClick={() => navigate(`/homeowners/provider/${provider.id}`)}
                        variant="outline"
                        className="w-full lg:w-auto"
                      >
                        View Profile
                      </Button>
                      <Button
                        onClick={() => handleRequestQuote(provider.id)}
                        className="w-full lg:w-auto"
                      >
                        Request Quote
                      </Button>
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