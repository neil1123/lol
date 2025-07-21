import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { 
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  LogOut,
  Menu,
  X,
  Save,
  Eye,
  EyeOff,
  Edit,
  Plus,
  Trash2,
  Briefcase,
  Building2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { STANDARD_PROVIDER_SIDEBAR, handleStandardLogout } from '../../constants/providerSidebarConfig';

const ProviderSettings = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // User profile state - fetch from database
  const [userProfile, setUserProfile] = useState(null);
  const [userInitials, setUserInitials] = useState('U');

  // Services management state
  const [availableServices, setAvailableServices] = useState([]);
  const [providerServices, setProviderServices] = useState([]);
  const [isEditingServices, setIsEditingServices] = useState(false);
  const [editedServices, setEditedServices] = useState([]);
  const [newService, setNewService] = useState('');
  const [showAddService, setShowAddService] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesSaving, setServicesSaving] = useState(false);

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
    loadServices();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await apiService.getUserProfile();
      setUserProfile(profile);
      
      // Set user initials from actual database data
      const initials = profile.name 
        ? profile.name.split(' ').map(name => name[0]).join('').toUpperCase() 
        : 'U';
      setUserInitials(initials);
      
      // Set provider services
      setProviderServices(profile.services || []);
      setEditedServices(profile.services || []);
      
      // Update profile form with actual database data
      setProfileData({
        businessName: profile.business_name || 'Your Business Name',
        ownerName: profile.name || 'Your Name',
        email: profile.email || 'your@email.com',
        phone: profile.phone || '(555) 123-4567',
        address: profile.address || 'Your Address',
        description: profile.description || 'Professional home services provider.',
        website: profile.website || ''
      });
      
      console.log('User profile loaded:', profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Fallback to localStorage if API fails
      const fallbackUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (fallbackUser.name) {
        const initials = fallbackUser.name.split(' ').map(name => name[0]).join('').toUpperCase();
        setUserInitials(initials);
      }
    }
  };

  const loadServices = async () => {
    try {
      setServicesLoading(true);
      const services = await apiService.getAllServices();
      setAvailableServices(services);
    } catch (error) {
      console.error('Failed to load services:', error);
      // Fall back to default services if API fails
      setAvailableServices([
        'Home Cleaning', 'Office Cleaning', 'Window Cleaning', 'Pressure Washing', 'Gutter Cleaning',
        'Electrician', 'Plumber', 'HVAC Services', 'Handyman Services', 'Home Renovations', 'Carpenter', 'Painter',
        'Landscaping', 'Lawn Mowing & Maintenance', 'Snow Removal', 'Fence & Deck Services', 'Siding Installation & Repair',
        'Car Detailing', 'Roofing', 'Pest Control', 'Appliance Repair', 'Junk Removal'
      ]);
    } finally {
      setServicesLoading(false);
    }
  };

  // Profile settings - Initialize with empty data, will be populated from database
  const [profileData, setProfileData] = useState({
    businessName: 'Loading...',
    ownerName: 'Loading...',
    email: 'Loading...',
    phone: 'Loading...',
    address: 'Loading...',
    description: 'Loading...',
    website: ''
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
    weeklyReports: true
  });

  // Security settings
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleLogout = () => {
    handleStandardLogout(navigate);
  };

  const sidebarItems = STANDARD_PROVIDER_SIDEBAR;

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, checked) => {
    setNotificationSettings(prev => ({ ...prev, [field]: checked }));
  };

  const handleSecurityChange = (field, value) => {
    setSecurityData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    console.log('Saving profile:', profileData);
    // Add save logic here
  };

  const handleSaveNotifications = () => {
    console.log('Saving notifications:', notificationSettings);
    // Add save logic here
  };

  const handleSavePassword = () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Updating password');
    // Add password update logic here
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Services management functions
  const handleEditServices = () => {
    setIsEditingServices(true);
    setEditedServices([...providerServices]);
  };

  const handleCancelEditServices = () => {
    setIsEditingServices(false);
    setEditedServices([...providerServices]);
    setShowAddService(false);
    setNewService('');
  };

  const handleServiceToggle = (serviceName) => {
    setEditedServices(prev => {
      return prev.includes(serviceName)
        ? prev.filter(s => s !== serviceName)
        : [...prev, serviceName];
    });
  };

  const handleAddNewService = () => {
    if (newService.trim() && !availableServices.includes(newService.trim())) {
      const trimmedService = newService.trim();
      setAvailableServices(prev => [...prev, trimmedService].sort());
      setEditedServices(prev => [...prev, trimmedService]);
      setNewService('');
      setShowAddService(false);
    }
  };

  const handleRemoveService = (serviceName) => {
    setEditedServices(prev => prev.filter(s => s !== serviceName));
  };

  const handleSaveServices = async () => {
    try {
      setServicesSaving(true);
      await apiService.updateProviderServices(editedServices);
      
      // Update local state
      setProviderServices([...editedServices]);
      setIsEditingServices(false);
      
      // Update user profile with new services
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          services: editedServices
        });
      }
      
      alert('Services updated successfully!');
      
    } catch (error) {
      console.error('Failed to update services:', error);
      alert('Failed to update services. Please try again.');
    } finally {
      setServicesSaving(false);
    }
  };

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
            const isActive = item.id === 'settings';
            
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
                const isActive = item.id === 'settings';
                
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
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your account settings and preferences</p>
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
            {/* Settings Header */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Settings</h2>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Services</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Billing</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          value={profileData.businessName}
                          onChange={(e) => handleProfileChange('businessName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerName">Owner Name</Label>
                        <Input
                          id="ownerName"
                          value={profileData.ownerName}
                          onChange={(e) => handleProfileChange('ownerName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => handleProfileChange('address', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        onChange={(e) => handleProfileChange('website', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Business Description</Label>
                      <Textarea
                        id="description"
                        value={profileData.description}
                        onChange={(e) => handleProfileChange('description', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleSaveProfile} className="w-full sm:w-auto">
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-gray-600">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">SMS Notifications</h4>
                          <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                        </div>
                        <Switch
                          checked={notificationSettings.smsNotifications}
                          onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Push Notifications</h4>
                          <p className="text-sm text-gray-600">Receive browser push notifications</p>
                        </div>
                        <Switch
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Order Updates</h4>
                          <p className="text-sm text-gray-600">Get notified about order status changes</p>
                        </div>
                        <Switch
                          checked={notificationSettings.orderUpdates}
                          onCheckedChange={(checked) => handleNotificationChange('orderUpdates', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Promotional Emails</h4>
                          <p className="text-sm text-gray-600">Receive promotional content and tips</p>
                        </div>
                        <Switch
                          checked={notificationSettings.promotionalEmails}
                          onCheckedChange={(checked) => handleNotificationChange('promotionalEmails', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Weekly Reports</h4>
                          <p className="text-sm text-gray-600">Get weekly performance reports</p>
                        </div>
                        <Switch
                          checked={notificationSettings.weeklyReports}
                          onCheckedChange={(checked) => handleNotificationChange('weeklyReports', checked)}
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveNotifications} className="w-full sm:w-auto">
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={securityData.currentPassword}
                          onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSavePassword} className="w-full sm:w-auto">
                      <Save className="h-4 w-4 mr-2" />
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Billing Management</h3>
                      <p className="text-gray-600 mb-4">Manage your payment methods and billing preferences</p>
                      <Button>Manage Billing</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Service Management</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Manage the services you offer to customers
                        </p>
                      </div>
                      {!isEditingServices && (
                        <Button onClick={handleEditServices} variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Services
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {servicesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading services...</p>
                      </div>
                    ) : (
                      <>
                        {/* Current Services Display */}
                        {!isEditingServices && (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-base font-medium">Your Current Services</Label>
                              <p className="text-sm text-gray-600 mb-3">
                                These services will appear in homeowner quotation forms and your order/appointment forms.
                              </p>
                            </div>
                            
                            {providerServices.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {providerServices.map((service, index) => (
                                  <div key={index} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-md text-sm font-medium">
                                    {service}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Added</h3>
                                <p className="text-gray-600 mb-4">
                                  Add services to let customers know what you offer.
                                </p>
                                <Button onClick={handleEditServices}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Services
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Services Editing Interface */}
                        {isEditingServices && (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-base font-medium">Edit Your Services</Label>
                              <p className="text-sm text-gray-600 mb-3">
                                Select all services you want to offer. Changes will be reflected across your orders, appointments, and customer quotation forms.
                              </p>
                            </div>

                            {/* Selected Services Tags */}
                            {editedServices.length > 0 && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-green-700">Selected Services ({editedServices.length})</Label>
                                <div className="flex flex-wrap gap-2 p-3 bg-green-50 rounded-md">
                                  {editedServices.map((service, index) => (
                                    <div key={index} className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">
                                      <span>{service}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveService(service)}
                                        className="ml-1 text-green-600 hover:text-green-800"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Add New Service */}
                            {showAddService && (
                              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
                                <Input
                                  value={newService}
                                  onChange={(e) => setNewService(e.target.value)}
                                  placeholder="Enter new service name"
                                  className="flex-1"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddNewService();
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={handleAddNewService}
                                  disabled={!newService.trim()}
                                >
                                  Add
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setShowAddService(false);
                                    setNewService('');
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}

                            {/* Service Selection Grid */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Available Services</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowAddService(true)}
                                  className="text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Custom Service
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-md max-h-64 overflow-y-auto">
                                {availableServices.map((serviceName, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={serviceName}
                                      checked={editedServices.includes(serviceName)}
                                      onCheckedChange={() => handleServiceToggle(serviceName)}
                                    />
                                    <label
                                      htmlFor={serviceName}
                                      className="text-sm cursor-pointer hover:text-blue-600"
                                      onClick={() => handleServiceToggle(serviceName)}
                                    >
                                      {serviceName}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3 pt-4 border-t">
                              <Button 
                                onClick={handleSaveServices} 
                                disabled={servicesSaving}
                                className="flex-1 sm:flex-none"
                              >
                                {servicesSaving ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Services
                                  </>
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={handleCancelEditServices}
                                disabled={servicesSaving}
                                className="flex-1 sm:flex-none"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProviderSettings;