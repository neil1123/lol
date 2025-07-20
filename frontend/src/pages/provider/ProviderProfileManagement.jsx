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
                <div className="grid gap-6">
                  
                  {/* Basic Information Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Basic Information</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Update your business details and contact information
                          </p>
                        </div>
                        {!editingSections.basic && (
                          <Button variant="outline" onClick={() => startEditing('basic')}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {!editingSections.basic ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Business Name</Label>
                            <p className="mt-1 text-sm text-gray-900">{profileData.business_name || 'Not specified'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Owner Name</Label>
                            <p className="mt-1 text-sm text-gray-900">{profileData.name || 'Not specified'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Email</Label>
                            <p className="mt-1 text-sm text-gray-900">{profileData.email || 'Not specified'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Phone</Label>
                            <p className="mt-1 text-sm text-gray-900">{profileData.phone || 'Not specified'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Address</Label>
                            <p className="mt-1 text-sm text-gray-900">{profileData.address || 'Not specified'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Website</Label>
                            <p className="mt-1 text-sm text-gray-900">{profileData.website || 'Not specified'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Year Established</Label>
                            <p className="mt-1 text-sm text-gray-900">{profileData.year_established || 'Not specified'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Response Time</Label>
                            <p className="mt-1 text-sm text-gray-900">{profileData.response_time}</p>
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-gray-700">Description</Label>
                            <p className="mt-1 text-sm text-gray-900">{profileData.description || 'No description provided'}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
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
                      )}
                    </CardContent>
                  </Card>

                  {/* Services & Categories Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Services & Categories</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Define what services you offer and categories you work with
                          </p>
                        </div>
                        {!editingSections.services && (
                          <Button variant="outline" onClick={() => startEditing('services')}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {!editingSections.services ? (
                        <div className="space-y-6">
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">Services Offered</Label>
                            {profileData.services?.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {profileData.services.map((service, index) => (
                                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No services specified</p>
                            )}
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">Service Categories</Label>
                            {profileData.service_categories?.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {profileData.service_categories.map((category, index) => (
                                  <Badge key={index} variant="outline" className="border-green-200 text-green-800">
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No categories specified</p>
                            )}
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">Properties Served</Label>
                            {profileData.properties_served?.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {profileData.properties_served.map((property, index) => (
                                  <Badge key={index} variant="outline" className="border-purple-200 text-purple-800">
                                    {property}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No property types specified</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
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
                      )}
                    </CardContent>
                  </Card>

                  {/* Specialties & Quick Facts Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Specialties & Quick Facts</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Highlight your business strengths and key information
                          </p>
                        </div>
                        {!editingSections.specialties && (
                          <Button variant="outline" onClick={() => startEditing('specialties')}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {!editingSections.specialties ? (
                        <div className="space-y-6">
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">Specialties</Label>
                            {profileData.specialties?.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {profileData.specialties.map((specialty, index) => (
                                  <Badge key={index} variant="outline" className="border-green-200 text-green-800">
                                    <Award className="h-3 w-3 mr-1" />
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No specialties specified</p>
                            )}
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">Quick Facts</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                  <span className="font-medium">Jobs Completed</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{profileData.jobs_completed || 0}</p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Clock className="h-5 w-5 text-blue-600" />
                                  <span className="font-medium">Response Time</span>
                                </div>
                                <p className="text-sm text-gray-900">{profileData.response_time}</p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Calendar className="h-5 w-5 text-purple-600" />
                                  <span className="font-medium">Year Established</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{profileData.year_established || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">Specialties</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {defaultSpecialties.map((specialty, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`specialty-${specialty}`}
                                    checked={tempData.specialties?.specialties?.includes(specialty) || false}
                                    onCheckedChange={() => toggleArrayItem('specialties', 'specialties', specialty)}
                                  />
                                  <label htmlFor={`specialty-${specialty}`} className="text-sm cursor-pointer">
                                    {specialty}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">Quick Facts</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Jobs Completed</Label>
                                <Input
                                  type="number"
                                  value={tempData.specialties?.jobs_completed || 0}
                                  onChange={(e) => updateTempData('specialties', 'jobs_completed', parseInt(e.target.value) || 0)}
                                  min="0"
                                />
                              </div>
                              <div>
                                <Label>Response Time</Label>
                                <Input
                                  value={tempData.specialties?.response_time || ''}
                                  onChange={(e) => updateTempData('specialties', 'response_time', e.target.value)}
                                  placeholder="Usually responds within 1 hour"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-3 pt-4 border-t">
                            <Button onClick={() => saveSection('specialties')} disabled={saving}>
                              {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button variant="outline" onClick={() => cancelEditing('specialties')}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Pricing Packages Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Pricing Packages</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Set up different service packages with pricing
                          </p>
                        </div>
                        {!editingSections.pricing && (
                          <Button variant="outline" onClick={() => startEditing('pricing')}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {!editingSections.pricing ? (
                        <div>
                          {profileData.pricing_packages?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {profileData.pricing_packages.map((pkg, index) => (
                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                  <h4 className="font-medium text-gray-900 mb-2">{pkg.name}</h4>
                                  <p className="text-2xl font-bold text-blue-600 mb-2">${pkg.price}</p>
                                  <p className="text-sm text-gray-600">{pkg.description}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pricing Packages</h3>
                              <p className="text-gray-600 mb-4">
                                Add pricing packages to help customers understand your rates.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
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
                                  <Label>Price ($)</Label>
                                  <Input
                                    type="number"
                                    value={pkg.price}
                                    onChange={(e) => updatePricingPackage('pricing', index, 'price', parseFloat(e.target.value) || 0)}
                                    placeholder="149"
                                    min="0"
                                    step="0.01"
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
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Preview Profile Tab */}
              <TabsContent value="preview">
                <div className="max-w-4xl mx-auto">
                  {/* Provider Profile Preview - How it looks to homeowners */}
                  <Card className="mb-6">
                    <CardHeader className="bg-blue-50 border-b">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h1 className="text-2xl font-bold text-gray-900">
                            {profileData.business_name || 'Business Name Not Set'}
                          </h1>
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
                            {profileData.website && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Globe className="h-4 w-4 mr-1" />
                                {profileData.website}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Button className="mb-2">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Text Us
                          </Button>
                          <p className="text-xs text-gray-500">
                            {profileData.year_established ? `Est. ${profileData.year_established}` : 'Year not specified'}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                          {/* Quick Information */}
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Quick Information</h3>
                            <div className="text-sm text-gray-600">
                              Year of establishment: {profileData.year_established || 'Not specified'}
                            </div>
                          </div>

                          {/* Service Categories */}
                          {profileData.service_categories?.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Service Categories</h3>
                              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                {profileData.service_categories.slice(0, 6).map((category, index) => (
                                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                                      <Home className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-800">{category}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Service Types */}
                          {profileData.services?.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Service Types</h3>
                              <div className="flex flex-wrap gap-2">
                                {profileData.services.slice(0, 8).map((service, index) => (
                                  <Badge key={index} variant="outline" className="bg-gray-50">
                                    {service}
                                  </Badge>
                                ))}
                                {profileData.services.length > 8 && (
                                  <Badge variant="outline" className="bg-gray-50">
                                    +{profileData.services.length - 8} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Properties Served */}
                          {profileData.properties_served?.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Properties We Serve</h3>
                              <div className="flex flex-wrap gap-2">
                                {profileData.properties_served.map((property, index) => (
                                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                                    {property}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* About */}
                          <div>
                            <h3 className="text-lg font-semibold mb-3">About</h3>
                            <p className="text-gray-600 leading-relaxed">
                              {profileData.description || 'No description provided. This is where you can describe your business, services, and what makes you unique.'}
                            </p>
                          </div>

                          {/* Specialties */}
                          {profileData.specialties?.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Specialties</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {profileData.specialties.map((specialty, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="text-sm font-medium">{specialty}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                          {/* Quick Facts */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Quick Facts</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Jobs Completed</span>
                                </div>
                                <p className="text-xl font-bold">{profileData.jobs_completed || 0}</p>
                              </div>
                              
                              <div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Response Time</span>
                                </div>
                                <p className="text-sm font-medium">{profileData.response_time}</p>
                              </div>
                              
                              <div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Year Established</span>
                                </div>
                                <p className="text-xl font-bold">{profileData.year_established || 'N/A'}</p>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Price List */}
                          {profileData.pricing_packages?.length > 0 ? (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Price List</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {profileData.pricing_packages.map((pkg, index) => (
                                  <div key={index} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <h4 className="font-medium">{pkg.name}</h4>
                                      <span className="text-xl font-bold text-blue-600">${pkg.price}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                                    <Button variant="outline" className="w-full">
                                      Get Quotation
                                    </Button>
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          ) : (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Price List</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-center py-6">
                                  <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500 mb-3">No pricing packages available</p>
                                  <Button variant="outline" className="w-full">
                                    Get Quotation
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Preview Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-blue-700 mb-2">
                      <Eye className="h-5 w-5" />
                      <span className="font-medium">Preview Mode</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      This is how your profile appears to homeowners when they browse for services.
                      Missing information will be displayed as "Not specified" or left blank.
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