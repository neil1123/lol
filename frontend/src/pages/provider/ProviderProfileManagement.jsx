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

                  {/* Continue with more sections... */}
                  {/* I'll add more sections in the next response to stay within limits */}
                </div>
              </TabsContent>

              {/* Preview Profile Tab */}
              <TabsContent value="preview">
                <div className="space-y-6">
                  {/* Preview content will be added in next iteration */}
                  <Card>
                    <CardContent className="text-center py-12">
                      <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Preview</h3>
                      <p className="text-gray-600">
                        Preview functionality will be implemented in the next iteration
                      </p>
                    </CardContent>
                  </Card>
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