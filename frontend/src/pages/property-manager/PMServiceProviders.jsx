import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, ArrowLeft, SlidersHorizontal, Menu, X, Heart, HeartOff, Send, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { serviceCategories } from '../../data/mockData';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../services/api';
import SendToProviderModal from '../../components/SendToProviderModal';

const PMServiceProviders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [allProviders, setAllProviders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [pendingIssues, setPendingIssues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/property-manager/auth');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.user_type !== 'property_manager') {
        navigate('/property-manager/auth');
        return;
      }
    } catch (error) {
      navigate('/property-manager/auth');
      return;
    }

    loadProviders();
    loadFavorites();
    loadPendingIssues();
  }, [navigate]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const providers = await apiService.getAllProviders();
      
      const formattedProviders = providers.map(provider => ({
        id: provider.id,
        name: provider.business_name || provider.name,
        business_name: provider.business_name,
        ownerName: provider.name,
        description: provider.description || `Professional ${Array.isArray(provider.services) && provider.services.length > 0 ? provider.services.join(' and ') : 'service'} services`,
        services: Array.isArray(provider.services) && provider.services.length > 0 ? provider.services : ['General Services'],
        rating: provider.rating || 5.0,
        reviews: provider.reviews || 0,
        completedJobs: provider.completed_jobs || 0,
        location: provider.location || provider.address || "Halifax, NS",
        responseTime: provider.response_time || "Usually responds within 1 hour",
        email: provider.email,
        phone: provider.phone
      }));
      
      setAllProviders(formattedProviders);
    } catch (error) {
      console.error('Failed to load providers:', error);
      setAllProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favs = await apiService.getPMFavorites();
      setFavorites(favs || []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setFavorites([]);
    }
  };

  const loadPendingIssues = async () => {
    try {
      const issues = await apiService.getIssues();
      const pending = (issues || []).filter(issue => issue.status === 'pending' || issue.status === 'reviewing');
      setPendingIssues(pending);
    } catch (error) {
      console.error('Failed to load issues:', error);
      setPendingIssues([]);
    }
  };

  const isFavorite = (providerId) => {
    return favorites.some(f => f.provider_id === providerId);
  };

  const toggleFavorite = async (provider) => {
    try {
      if (isFavorite(provider.id)) {
        await apiService.removePMFavorite(provider.id);
        setFavorites(prev => prev.filter(f => f.provider_id !== provider.id));
      } else {
        await apiService.addPMFavorite(provider.id);
        await loadFavorites();
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert(error.message || 'Failed to update favorites');
    }
  };

  const handleSendToProvider = (provider) => {
    setSelectedProvider(provider);
    setSendModalOpen(true);
  };

  const filteredProviders = allProviders.filter(provider => {
    try {
      const providerName = (provider.name || '').toLowerCase();
      const businessName = (provider.business_name || '').toLowerCase();
      const email = (provider.email || '').toLowerCase();
      
      // Filter out test/dummy accounts - expanded list
      const testPatterns = ['wilson', 'test', 'dummy', 'fake', 'demo', 'sample', 'example'];
      const isTestAccount = testPatterns.some(pattern => 
        providerName.includes(pattern) || 
        businessName.includes(pattern) ||
        email.includes(pattern)
      );
      
      if (isTestAccount) {
        return false;
      }
      
      const providerServices = Array.isArray(provider.services) ? provider.services : [];
      
      const matchesSearch = !searchTerm || 
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        providerServices.some(service => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesServices = selectedServices.length === 0 ||
        selectedServices.some(service => {
          return providerServices.some(providerService => {
            const providerServiceLower = providerService.toLowerCase().trim();
            const serviceLower = service.toLowerCase().trim();
            return providerServiceLower.includes(serviceLower) || 
                   serviceLower.includes(providerServiceLower);
          });
        });
      
      return matchesSearch && matchesServices;
    } catch (error) {
      return false;
    }
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

  const displayProviders = activeTab === 'favorites' 
    ? sortedProviders.filter(p => isFavorite(p.id))
    : sortedProviders;

  const handleServiceToggle = (serviceName) => {
    setSelectedServices(prev => 
      prev.includes(serviceName)
        ? prev.filter(s => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const ProviderCard = ({ provider }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Provider Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-4">
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                      {provider.business_name || provider.name}
                    </h3>
                    {provider.business_name && provider.ownerName && (
                      <span className="text-sm text-gray-500">by {provider.ownerName}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(provider)}
                    className={`p-2 ${isFavorite(provider.id) ? 'text-red-500' : 'text-gray-400'}`}
                    data-testid={`favorite-btn-${provider.id}`}
                  >
                    {isFavorite(provider.id) ? (
                      <Heart className="h-5 w-5 fill-current" />
                    ) : (
                      <Heart className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
                    {provider.rating} ★
                  </div>
                  <span className="text-gray-500 text-sm">({provider.reviews} reviews)</span>
                  <span className="text-gray-300 hidden sm:inline">•</span>
                  <span className="text-gray-600 text-sm">{provider.completedJobs} jobs completed</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm sm:text-base line-clamp-2">{provider.description}</p>
            
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
              {provider.services.slice(0, 5).map(service => (
                <Badge key={service} variant="outline" className="text-xs">{service}</Badge>
              ))}
              {provider.services.length > 5 && (
                <Badge variant="outline" className="text-xs bg-gray-100">+{provider.services.length - 5} more</Badge>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {provider.location}
              </span>
              <span>⏱️ {provider.responseTime}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                onClick={() => navigate(`/homeowners/provider/${provider.id}`)}
                variant="outline"
                className="w-full sm:w-auto"
                data-testid={`view-profile-btn-${provider.id}`}
              >
                View Profile
              </Button>
              {pendingIssues.length > 0 && (
                <Button
                  onClick={() => handleSendToProvider(provider)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid={`send-issue-btn-${provider.id}`}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Issue ({pendingIssues.length})
                </Button>
              )}
              {isFavorite(provider.id) && (
                <Badge className="bg-red-50 text-red-600 border-red-200 self-center">
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                  Favorite
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading service providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/property-manager/dashboard')}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Doord.</h1>
              <span className="text-gray-600 ml-2 text-sm hidden sm:inline">Service Providers</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/property-manager/dashboard')}
              >
                Dashboard
              </Button>
            </div>
          </div>
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
                  data-testid="search-providers-input"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48 bg-white" data-testid="sort-select">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="z-[9999] bg-white border border-gray-200 shadow-2xl">
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center space-x-2 w-full sm:w-auto"
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
                              id={`filter-${service.name}`}
                              checked={selectedServices.includes(service.name)}
                              onCheckedChange={() => handleServiceToggle(service.name)}
                            />
                            <label
                              htmlFor={`filter-${service.name}`}
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

      {/* Results with Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <TabsList className="grid grid-cols-2 w-full sm:w-auto">
              <TabsTrigger value="all" data-testid="all-providers-tab">
                <Users className="h-4 w-4 mr-2" />
                All Providers
              </TabsTrigger>
              <TabsTrigger value="favorites" data-testid="favorites-tab">
                <Heart className="h-4 w-4 mr-2" />
                Favorites ({favorites.length})
              </TabsTrigger>
            </TabsList>
            
            <p className="text-gray-600">
              {displayProviders.length} provider{displayProviders.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <TabsContent value="all" className="mt-0">
            {displayProviders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No providers found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or browse all services.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedServices([]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {displayProviders.map(provider => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            {displayProviders.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No favorite providers yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Add service providers to your favorites for quick access when sending issues.
                </p>
                <Button 
                  onClick={() => setActiveTab('all')}
                >
                  Browse Providers
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {displayProviders.map(provider => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Send to Provider Modal */}
      {sendModalOpen && selectedProvider && (
        <SendToProviderModal
          isOpen={sendModalOpen}
          onClose={() => {
            setSendModalOpen(false);
            setSelectedProvider(null);
          }}
          provider={selectedProvider}
          issues={pendingIssues}
          onSuccess={() => {
            loadPendingIssues();
          }}
        />
      )}
    </div>
  );
};

export default PMServiceProviders;
