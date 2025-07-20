import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Edit,
  Eye,
  Save,
  X,
  Plus,
  Trash2,
  Star,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Bell,
  LogOut,
  Menu,
  Home,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  CheckCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import apiService from '../../services/api';
import { STANDARD_PROVIDER_SIDEBAR, handleStandardLogout } from '../../constants/providerSidebarConfig';

const ProviderProfileManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('edit');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userInitials, setUserInitials] = useState('PR');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    business_name: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: '',
    year_established: '',
    response_time: 'Usually responds within 1 hour',
    jobs_completed: 0,
    services: [],
    service_categories: [],
    properties_served: [],
    specialties: [],
    pricing_packages: []
  });

  // Editing states
  const [editingSections, setEditingSections] = useState({});
  const [tempData, setTempData] = useState({});

  // Available options
  const [availableServices, setAvailableServices] = useState([]);

  const defaultServiceCategories = [
    'Chair', 'Mattress', 'Sofa', 'Carpet', 'Kitchen', 'Bathroom', 
    'Windows', 'Floors', 'Appliances', 'Office', 'Commercial'
  ];

  const defaultServiceTypes = [
    'Deep clean', 'Vacuum', 'Sanitize', 'Organize', 'Maintenance', 'Repair'
  ];

  const defaultPropertiesServed = [
    'Commercial', 'Office', 'Residential', 'Retail', 'Industrial', 'Warehouse'
  ];

  const defaultSpecialties = [
    'Professional service', 'Quality work', 'Customer satisfaction', 
    'Licensed & Insured', '24/7 Service', 'Emergency Response',
    'Eco-friendly', 'Same-day Service'
  ];

  // Load user profile and data
  useEffect(() => {
    loadUserProfile();
    loadAvailableServices();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await apiService.getUserProfile();
      setUserProfile(profile);
      
      // Set user initials
      const initials = profile.name 
        ? profile.name.split(' ').map(name => name[0]).join('').toUpperCase() 
        : 'PR';
      setUserInitials(initials);
      
      // Set profile data
      setProfileData({
        business_name: profile.business_name || '',
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        website: profile.website || '',
        description: profile.description || '',
        year_established: profile.year_established || new Date().getFullYear().toString(),
        response_time: profile.response_time || 'Usually responds within 1 hour',
        jobs_completed: profile.jobs_completed || 0,
        services: profile.services || [],
        service_categories: profile.service_categories || [],
        properties_served: profile.properties_served || [],
        specialties: profile.specialties || [],
        pricing_packages: profile.pricing_packages || []
      });
      
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableServices = async () => {
    try {
      const services = await apiService.getAllServices();
      setAvailableServices(services);
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const handleLogout = () => handleStandardLogout(navigate);

  const sidebarItems = STANDARD_PROVIDER_SIDEBAR;

  const startEditing = (section) => {
    setEditingSections(prev => ({ ...prev, [section]: true }));
    setTempData(prev => ({ ...prev, [section]: { ...profileData } }));
  };

  const cancelEditing = (section) => {
    setEditingSections(prev => ({ ...prev, [section]: false }));
    setTempData(prev => {
      const newData = { ...prev };
      delete newData[section];
      return newData;
    });
  };

  const saveSection = async (section) => {
    try {
      setSaving(true);
      // Update backend with new data
      await apiService.updateProviderProfile(tempData[section]);
      
      // Update local state
      setProfileData(tempData[section]);
      setUserProfile(tempData[section]);
      
      // Clear editing state
      setEditingSections(prev => ({ ...prev, [section]: false }));
      setTempData(prev => {
        const newData = { ...prev };
        delete newData[section];
        return newData;
      });
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateTempData = (section, field, value) => {
    setTempData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const toggleArrayItem = (section, field, item) => {
    setTempData(prev => {
      const currentArray = prev[section][field] || [];
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
  };

  const addPricingPackage = (section) => {
    const newPackage = {
      name: 'New Package',
      price: 0,
      description: 'Package description'
    };
    
    setTempData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        pricing_packages: [...(prev[section].pricing_packages || []), newPackage]
      }
    }));
  };

  const removePricingPackage = (section, index) => {
    setTempData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        pricing_packages: prev[section].pricing_packages.filter((_, i) => i !== index)
      }
    }));
  };

  const updatePricingPackage = (section, index, field, value) => {
    setTempData(prev => {
      const packages = [...prev[section].pricing_packages];
      packages[index] = { ...packages[index], [field]: value };
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          pricing_packages: packages
        }
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Always visible on desktop */}
      <div className="hidden xl:flex xl:flex-col xl:w-64 xl:bg-white xl:border-r xl:border-gray-200">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <Building2 className="h-8 w-8 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-800">Doord</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.id === 'profile';
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 xl:hidden">
          <div className="bg-white w-64 h-full">
            <div className="flex items-center justify-between h-16 border-b border-gray-200 px-4">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-800">Doord</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="px-4 py-6 space-y-2">
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = item.id === 'profile';
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-gray-200 p-4">
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="xl:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
                <p className="text-gray-600">Manage your business profile and preview how customers see you</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/homeservices/settings')}
                className="flex items-center space-x-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Profile Management Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview Profile
                </TabsTrigger>
              </TabsList>

              {/* Edit Profile Tab */}
              <TabsContent value="edit">
                <div className="space-y-6">
                  
                  {/* Basic Information Section - Profile Style */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-16 w-16">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                              {userInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                              {profileData.business_name || 'Business Name Not Set'}
                            </h2>
                            <p className="text-gray-600 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {profileData.address || 'Address not specified'}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              {profileData.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {profileData.phone}
                                </div>
                              )}
                              {profileData.email && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="h-4 w-4 mr-1" />
                                  {profileData.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => startEditing('basic')} className="flex-shrink-0">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>

                    {/* Basic Info Edit Form */}
                    {editingSections.basic ? (
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Business Name *</Label>
                            <Input
                              value={tempData.basic?.business_name || ''}
                              onChange={(e) => updateTempData('basic', 'business_name', e.target.value)}
                              placeholder="Your Business Name"
                            />
                          </div>
                          <div>
                            <Label>Owner Name *</Label>
                            <Input
                              value={tempData.basic?.name || ''}
                              onChange={(e) => updateTempData('basic', 'name', e.target.value)}
                              placeholder="Owner Full Name"
                            />
                          </div>
                          <div>
                            <Label>Email *</Label>
                            <Input
                              type="email"
                              value={tempData.basic?.email || ''}
                              onChange={(e) => updateTempData('basic', 'email', e.target.value)}
                              placeholder="business@example.com"
                            />
                          </div>
                          <div>
                            <Label>Phone *</Label>
                            <Input
                              value={tempData.basic?.phone || ''}
                              onChange={(e) => updateTempData('basic', 'phone', e.target.value)}
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          <div>
                            <Label>Address</Label>
                            <Input
                              value={tempData.basic?.address || ''}
                              onChange={(e) => updateTempData('basic', 'address', e.target.value)}
                              placeholder="Business Address"
                            />
                          </div>
                          <div>
                            <Label>Website</Label>
                            <Input
                              value={tempData.basic?.website || ''}
                              onChange={(e) => updateTempData('basic', 'website', e.target.value)}
                              placeholder="https://yourwebsite.com"
                            />
                          </div>
                          <div>
                            <Label>Year Established</Label>
                            <Input
                              type="number"
                              value={tempData.basic?.year_established || ''}
                              onChange={(e) => updateTempData('basic', 'year_established', e.target.value)}
                              placeholder={new Date().getFullYear().toString()}
                              min="1900"
                              max={new Date().getFullYear()}
                            />
                          </div>
                          <div>
                            <Label>Response Time</Label>
                            <Input
                              value={tempData.basic?.response_time || ''}
                              onChange={(e) => updateTempData('basic', 'response_time', e.target.value)}
                              placeholder="Usually responds within 1 hour"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Business Description</Label>
                          <Textarea
                            value={tempData.basic?.description || ''}
                            onChange={(e) => updateTempData('basic', 'description', e.target.value)}
                            placeholder="Describe your business, services, and what makes you unique..."
                            rows={4}
                          />
                        </div>
                        <div className="flex space-x-3 pt-4 border-t">
                          <Button onClick={() => saveSection('basic')} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button variant="outline" onClick={() => cancelEditing('basic')}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6">
                        <p className="text-gray-600 mb-2">Business Description:</p>
                        <p className="text-gray-900">{profileData.description || 'No description provided'}</p>
                      </div>
                    )}
                  </div>

                  {/* Price List Section - Profile Style */}
                  <div className="bg-blue-600 text-white rounded-lg">
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-yellow-300" />
                        <h2 className="text-xl font-bold">Price list</h2>
                      </div>
                      <Button variant="outline" onClick={() => startEditing('pricing')} className="text-blue-600 bg-white hover:bg-gray-50">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>

                    {editingSections.pricing ? (
                      <div className="p-6 bg-white text-gray-900 rounded-b-lg">
                        <div className="space-y-4">
                          {tempData.pricing?.pricing_packages?.map((pkg, index) => (
                            <div key={index} className="border rounded-lg p-4 bg-gray-50">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900">Package #{index + 1}</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePricingPackage('pricing', index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <Label>Package Name</Label>
                                  <Input
                                    value={pkg.name}
                                    onChange={(e) => updatePricingPackage('pricing', index, 'name', e.target.value)}
                                    placeholder="Basic Package"
                                  />
                                </div>
                                <div>
                                  <Label>Price</Label>
                                  <Input
                                    value={pkg.price}
                                    onChange={(e) => updatePricingPackage('pricing', index, 'price', e.target.value)}
                                    placeholder="149"
                                  />
                                </div>
                                <div>
                                  <Label>Description</Label>
                                  <Input
                                    value={pkg.description}
                                    onChange={(e) => updatePricingPackage('pricing', index, 'description', e.target.value)}
                                    placeholder="Package description"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <Button
                            variant="outline"
                            onClick={() => addPricingPackage('pricing')}
                            className="w-full border-dashed"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Pricing Package
                          </Button>
                          
                          <div className="flex space-x-3 pt-4 border-t">
                            <Button onClick={() => saveSection('pricing')} disabled={saving}>
                              {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button variant="outline" onClick={() => cancelEditing('pricing')}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6">
                        {profileData.pricing_packages?.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {profileData.pricing_packages.slice(0, 3).map((pkg, index) => (
                              <div key={index} className="bg-white text-gray-900 rounded-lg p-6">
                                <div className="text-center mb-4">
                                  <h3 className="text-lg font-semibold mb-2">{pkg.name}</h3>
                                  <div className="text-3xl font-bold text-blue-600 mb-2">${pkg.price}</div>
                                  <p className="text-sm text-gray-600">{pkg.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-white text-gray-900 rounded-lg p-8 text-center">
                            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No pricing packages set up yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Information Section */}
                  <div className="bg-blue-600 text-white rounded-lg">
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-yellow-300" />
                        <h2 className="text-xl font-bold">Quick information</h2>
                      </div>
                      <Button variant="outline" onClick={() => startEditing('quickinfo')} className="text-blue-600 bg-white hover:bg-gray-50">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>

                    {editingSections.quickinfo ? (
                      <div className="p-6 bg-white text-gray-900 rounded-b-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Jobs Completed</Label>
                            <Input
                              type="number"
                              value={tempData.quickinfo?.jobs_completed || 0}
                              onChange={(e) => updateTempData('quickinfo', 'jobs_completed', parseInt(e.target.value) || 0)}
                              min="0"
                            />
                          </div>
                          <div>
                            <Label>Response Time</Label>
                            <Input
                              value={tempData.quickinfo?.response_time || ''}
                              onChange={(e) => updateTempData('quickinfo', 'response_time', e.target.value)}
                              placeholder="Usually responds within 1 hour"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-3 pt-4 border-t mt-4">
                          <Button onClick={() => saveSection('quickinfo')} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button variant="outline" onClick={() => cancelEditing('quickinfo')}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6">
                        <div className="bg-white text-gray-900 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                              <span className="text-sm">Year of establishment</span>
                            </div>
                            <span className="font-semibold">{profileData.year_established || '2024'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Service Categories */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-blue-600 mr-2" />
                        <h2 className="text-xl font-bold">Service Categories</h2>
                      </div>
                      <Button variant="outline" onClick={() => startEditing('services')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>

                    {editingSections.services ? (
                      <div className="p-6 space-y-6">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-3 block">Services Offered</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                            {availableServices.map((service, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`service-${service}`}
                                  checked={tempData.services?.services?.includes(service) || false}
                                  onCheckedChange={() => toggleArrayItem('services', 'services', service)}
                                />
                                <label htmlFor={`service-${service}`} className="text-sm cursor-pointer">
                                  {service}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-3 block">Service Categories</Label>
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {defaultServiceCategories.map((category, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`category-${category}`}
                                  checked={tempData.services?.service_categories?.includes(category) || false}
                                  onCheckedChange={() => toggleArrayItem('services', 'service_categories', category)}
                                />
                                <label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                                  {category}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-3 block">Properties Served</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {defaultPropertiesServed.map((property, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`property-${property}`}
                                  checked={tempData.services?.properties_served?.includes(property) || false}
                                  onCheckedChange={() => toggleArrayItem('services', 'properties_served', property)}
                                />
                                <label htmlFor={`property-${property}`} className="text-sm cursor-pointer">
                                  {property}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex space-x-3 pt-4 border-t">
                          <Button onClick={() => saveSection('services')} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button variant="outline" onClick={() => cancelEditing('services')}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6">
                        <div className="space-y-6">
                          {profileData.service_categories?.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                              {profileData.service_categories.map((category, index) => (
                                <div key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
                                  {category}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No service categories specified</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Service Types */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-blue-600 mr-2" />
                        <h2 className="text-xl font-bold">Service Types</h2>
                      </div>
                      <span className="text-sm text-gray-600">Edit in Service Categories section</span>
                    </div>
                    <div className="p-6">
                      {profileData.services?.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {profileData.services.map((service, index) => (
                            <div key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
                              {service}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No services specified</p>
                      )}
                    </div>
                  </div>

                  {/* Properties Served */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                        <h2 className="text-xl font-bold">Properties Served</h2>
                      </div>
                      <span className="text-sm text-gray-600">Edit in Service Categories section</span>
                    </div>
                    <div className="p-6">
                      {profileData.properties_served?.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {profileData.properties_served.map((property, index) => (
                            <div key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
                              {property}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No property types specified</p>
                      )}
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="bg-blue-600 text-white rounded-lg">
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-yellow-300" />
                        <h2 className="text-xl font-bold">About {profileData.business_name || 'Your Business'}</h2>
                      </div>
                      <span className="text-sm text-yellow-200">Edit in Basic Information section</span>
                    </div>
                    <div className="p-6">
                      <div className="bg-white text-gray-900 rounded-lg p-6">
                        <p className="text-gray-700 leading-relaxed">
                          {profileData.description || 'No description provided. Add a description in the Basic Information section.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </TabsContent>

              {/* Preview Profile Tab */}
              <TabsContent value="preview">
                <div className="max-w-full">
                  {/* Provider Profile Preview - Exact homeowner view */}
                  <div className="min-h-screen bg-gray-50">
                    {/* Header Section - Matches homeowner view exactly */}
                    <div className="bg-white border-b border-gray-200">
                      <div className="max-w-6xl mx-auto px-4 py-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-20 w-20 flex-shrink-0">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
                              {userInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                              {profileData.business_name || 'Business Name Not Set'}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                              {profileData.address && (
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {profileData.address}
                                </div>
                              )}
                              {profileData.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {profileData.phone}
                                </div>
                              )}
                              {profileData.email && (
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-1" />
                                  {profileData.email}
                                </div>
                              )}
                              {profileData.website && (
                                <div className="flex items-center">
                                  <Globe className="h-4 w-4 mr-1" />
                                  {profileData.website}
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-3">
                              <Button className="bg-blue-600 hover:bg-blue-700">
                                <Mail className="h-4 w-4 mr-2" />
                                Text Us
                              </Button>
                              <Button variant="outline">
                                <Phone className="h-4 w-4 mr-2" />
                                Call Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price List Section - Exact match to homeowner view */}
                    {(profileData.pricing_packages?.length > 0) && (
                      <div className="bg-blue-600 text-white py-4">
                        <div className="max-w-6xl mx-auto px-4">
                          <div className="flex items-center mb-4">
                            <DollarSign className="h-5 w-5 mr-2 text-yellow-300" />
                            <h2 className="text-xl font-bold">Price list</h2>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {profileData.pricing_packages.slice(0, 3).map((pkg, index) => (
                              <div key={index} className="bg-white text-gray-900 rounded-lg p-6 relative">
                                {index === 2 && (
                                  <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                    POPULAR
                                  </div>
                                )}
                                <div className="text-center mb-4">
                                  <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                                    {index === 0 && <Home className="h-6 w-6 text-gray-600" />}
                                    {index === 1 && <Star className="h-6 w-6 text-gray-600" />}
                                    {index === 2 && <Award className="h-6 w-6 text-blue-600" />}
                                  </div>
                                  <h3 className="text-lg font-semibold mb-2">{pkg.name}</h3>
                                  <div className="text-3xl font-bold text-blue-600 mb-2">${pkg.price}</div>
                                  <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
                                </div>
                                <Button 
                                  className={`w-full ${index === 2 ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                  variant={index === 2 ? 'default' : 'outline'}
                                >
                                  Get Quotation
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Information Section */}
                    <div className="bg-blue-600 text-white py-4">
                      <div className="max-w-6xl mx-auto px-4">
                        <div className="flex items-center mb-4">
                          <Calendar className="h-5 w-5 mr-2 text-yellow-300" />
                          <h2 className="text-xl font-bold">Quick information</h2>
                        </div>
                        <div className="bg-white text-gray-900 rounded-lg p-4">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                            <span className="text-sm">Year of establishment</span>
                            <span className="ml-auto font-semibold">{profileData.year_established || '2024'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Service Categories */}
                    {profileData.service_categories?.length > 0 && (
                      <div className="bg-white py-6">
                        <div className="max-w-6xl mx-auto px-4">
                          <div className="flex items-center mb-6">
                            <Star className="h-5 w-5 text-blue-600 mr-2" />
                            <h2 className="text-xl font-bold">Cleaning service for</h2>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {profileData.service_categories.map((category, index) => (
                              <div key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
                                {category}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Service Types */}
                    {profileData.services?.length > 0 && (
                      <div className="bg-gray-50 py-6">
                        <div className="max-w-6xl mx-auto px-4">
                          <div className="flex items-center mb-6">
                            <Award className="h-5 w-5 text-blue-600 mr-2" />
                            <h2 className="text-xl font-bold">Service type</h2>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {profileData.services.map((service, index) => (
                              <div key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
                                {service}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Properties Served */}
                    {profileData.properties_served?.length > 0 && (
                      <div className="bg-white py-6">
                        <div className="max-w-6xl mx-auto px-4">
                          <div className="flex items-center mb-6">
                            <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                            <h2 className="text-xl font-bold">Properties served</h2>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {profileData.properties_served.map((property, index) => (
                              <div key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
                                {property}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* About Section */}
                    <div className="bg-blue-600 text-white py-6">
                      <div className="max-w-6xl mx-auto px-4">
                        <div className="flex items-center mb-4">
                          <FileText className="h-5 w-5 mr-2 text-yellow-300" />
                          <h2 className="text-xl font-bold">About {profileData.business_name || 'Our Business'}</h2>
                        </div>
                        <div className="bg-white text-gray-900 rounded-lg p-6">
                          <p className="text-gray-700 leading-relaxed">
                            {profileData.description || 'No description provided. This is where you can describe your business, services, and what makes you unique.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center mt-6">
                    <div className="flex items-center justify-center space-x-2 text-blue-700 mb-2">
                      <Eye className="h-5 w-5" />
                      <span className="font-medium">Live Preview</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      This is exactly how your profile appears to homeowners. Missing information will show as empty sections.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProviderProfileManagement;