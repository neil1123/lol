import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search,
  Plus,
  Mail,
  Phone,
  Star,
  Bell,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Eye,
  MapPin,
  User
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { STANDARD_PROVIDER_SIDEBAR, handleStandardLogout } from '../../constants/providerSidebarConfig';

const ProviderCustomers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const handleLogout = () => {
    handleStandardLogout(navigate);
  };

  const sidebarItems = STANDARD_PROVIDER_SIDEBAR;

  useEffect(() => {
    // Load customers from localStorage for persistence, start with empty for fresh platform
    const storedCustomers = localStorage.getItem('providerCustomers');
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    } else {
      // Start with empty array for fresh platform
      setCustomers([]);
    }
  }, []);

  // Save customers to localStorage whenever customers change
  useEffect(() => {
    if (customers.length >= 0) {
      localStorage.setItem('providerCustomers', JSON.stringify(customers));
    }
  }, [customers]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = () => {
    if (customerForm.name) {
      const newCustomer = {
        id: customers.length + 1,
        name: customerForm.name,
        email: customerForm.email || 'Not provided',
        phone: customerForm.phone || 'N/A',
        address: customerForm.address || 'N/A',
        totalOrders: 0,
        totalSpent: 0,
        rating: 0,
        lastOrder: null,
        status: 'active',
        notes: customerForm.notes
      };
      
      setCustomers([...customers, newCustomer]);
      setCustomerForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      });
      setShowCustomerForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              <h1 className="text-xl md:text-2xl font-bold text-blue-600">Doord.</h1>
              <span className="text-sm text-gray-600 hidden sm:inline">for Merchants</span>
            </div>
            
            {/* Mobile Right Side */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  ES
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay - Only show on mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Navigation</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={item.id === 'customers' ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                ))}
                <hr className="my-4" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar - Always show on desktop like homeowner explore */}
        <div className="hidden xl:block w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-blue-600">Doord.</h1>
              <span className="text-sm text-gray-600">for Merchants</span>
            </div>
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant={item.id === 'customers' ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
              <hr className="my-4" />
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </Button>
            </nav>
          </div>
        </div>

        {/* Main Content - Adjust width for desktop sidebar */}
        <div className="flex-1 xl:pl-0 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Customers</h2>
                  <p className="text-gray-600">Manage your customer relationships</p>
                </div>
                <Button className="w-full sm:w-auto" onClick={() => setShowCustomerForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Customers</p>
                      <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                    </div>
                    <div className="ml-auto">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Customers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {customers.filter(c => c.status === 'active').length}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">$</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(customers.reduce((sum, c) => sum + c.rating, 0) / customers.length).toFixed(1)}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Star className="h-8 w-8 text-yellow-500 fill-current" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer List */}
            <div className="grid gap-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Customer Info */}
                      <div className="flex items-center space-x-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
                            <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                              {customer.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{customer.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-500">Orders</p>
                          <p className="font-semibold">{customer.totalOrders}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Spent</p>
                          <p className="font-semibold">${customer.totalSpent}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Rating</p>
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="font-semibold">{customer.rating}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Last Order</p>
                          <p className="font-semibold text-xs">
                            {new Date(customer.lastOrder).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">View</span>
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">Message</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Form Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-lg font-semibold text-gray-900">Add New Customer</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCustomerForm(false)}
                className="hover:bg-gray-100 rounded-full p-1"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Customer Name *
                </label>
                <Input
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                  placeholder="Enter customer name"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                  placeholder="customer@email.com"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Phone Number
                </label>
                <Input
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Address
                </label>
                <Input
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                  placeholder="Customer address"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Notes
                </label>
                <Textarea
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm({...customerForm, notes: e.target.value})}
                  placeholder="Any additional notes about the customer..."
                  rows={3}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button 
                  onClick={handleAddCustomer}
                  className="flex-1"
                  disabled={!customerForm.name}
                >
                  Add Customer
                </Button>
                <Button variant="outline" onClick={() => setShowCustomerForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderCustomers;