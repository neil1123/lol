import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  Bell,
  Package,
  LogOut,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  Notifications,
  Key
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';

const ProviderSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    companyName: 'Elite Home Solutions',
    email: 'contact@elitehomesolutions.com',
    phone: '(555) 123-4567',
    address: '123 Business St, Halifax, NS B3H 1A1',
    notificationEmails: true,
    notificationSMS: false,
    autoAcceptOrders: false,
    showOnlineStatus: true
  });

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    navigate('/homeservices');
  };

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: Home, path: '/homeservices/dashboard' },
    { id: 'orders', label: 'Orders', icon: Package, path: '/homeservices/orders' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/homeservices/messages' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/homeservices/calendar' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/homeservices/customers' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/homeservices/settings' }
  ];

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
    // Here you would normally save to backend
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">Doord.</h1>
              <span className="text-sm text-gray-600">Provider Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    ES
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Elite Solutions</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant={item.id === 'settings' ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
              <p className="text-gray-600">Manage your account and business preferences</p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Business Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={settings.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Business Address</Label>
                      <Input
                        id="address"
                        value={settings.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 pt-4">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                        ES
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">
                        Change Photo
                      </Button>
                      <p className="text-sm text-gray-500 mt-1">
                        JPG, PNG up to 10MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Notifications className="h-5 w-5" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications about new orders and messages
                      </p>
                    </div>
                    <Switch
                      checked={settings.notificationEmails}
                      onCheckedChange={(checked) => handleInputChange('notificationEmails', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Get SMS alerts for urgent orders
                      </p>
                    </div>
                    <Switch
                      checked={settings.notificationSMS}
                      onCheckedChange={(checked) => handleInputChange('notificationSMS', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Accept Orders</Label>
                      <p className="text-sm text-gray-500">
                        Automatically accept orders that match your criteria
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoAcceptOrders}
                      onCheckedChange={(checked) => handleInputChange('autoAcceptOrders', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Online Status</Label>
                      <p className="text-sm text-gray-500">
                        Let customers see when you're available
                      </p>
                    </div>
                    <Switch
                      checked={settings.showOnlineStatus}
                      onCheckedChange={(checked) => handleInputChange('showOnlineStatus', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter current password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <Button className="w-full md:w-auto">
                    <Key className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Billing Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900">Current Plan: Professional</h3>
                    <p className="text-sm text-blue-700">$49/month • Unlimited orders</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CreditCard className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-500">Expires 12/25</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button variant="outline">Update Payment Method</Button>
                    <Button variant="outline">View Billing History</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 flex justify-end">
            <Button onClick={handleSave} className="px-8">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderSettings;