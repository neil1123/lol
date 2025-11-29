import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  Plus,
  Clock,
  DollarSign,
  Send,
  CheckCircle,
  Bell,
  Package,
  FileText,
  Star,
  MapPin,
  Phone,
  Mail,
  LogOut,
  Menu,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { STANDARD_PROVIDER_SIDEBAR, handleStandardLogout } from '../../constants/providerSidebarConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import apiService from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import NotificationBadge from '../../components/NotificationBadge';

const ProviderOrders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notifications, updateNotifications } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [showEditQuoteForm, setShowEditQuoteForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Services state
  const [availableServices, setAvailableServices] = useState([]);
  const [providerServices, setProviderServices] = useState([]);
  
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    serviceType: '',
    services: [], // Array for multiple services
    description: '',
    address: '',
    quotationAmount: '',
    orderDetails: '',
    priority: 'medium',
    scheduledDate: ''
  });

  const [editQuoteForm, setEditQuoteForm] = useState({
    quotationAmount: '',
    quotationDetails: '',
    validUntil: ''
  });

  // User profile state - fetch from database
  const [userProfile, setUserProfile] = useState(null);
  const [userInitials, setUserInitials] = useState('U');

  const handleLogout = () => {
    handleStandardLogout(navigate);
  };

  const sidebarItems = STANDARD_PROVIDER_SIDEBAR;

  // Load user profile and orders on component mount
  useEffect(() => {
    loadUserProfile();
    loadOrders();
    loadServices();
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  // Handle tab query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['all', 'pending', 'quoted', 'confirmed', 'in_progress', 'completed'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const loadUserProfile = async () => {
    try {
      const profile = await apiService.getUserProfile();
      setUserProfile(profile);
      
      // Set user initials from actual database data
      const initials = profile.name 
        ? profile.name.split(' ').map(name => name[0]).join('').toUpperCase() 
        : 'U';
      setUserInitials(initials);
      
      // Set provider services from profile
      setProviderServices(profile.services || []);
      
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
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
      
      // Update notifications after loading orders
      updateNotifications();
    } catch (error) {
      console.error('Failed to load orders:', error);
      setError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Remove the localStorage save effect since we're using database
  // useEffect(() => {
  //   if (orders.length > 0) {
  //     localStorage.setItem('providerOrders', JSON.stringify(orders));
  //   }
  // }, [orders]);

  // Auto-add customer when order is created
  const autoAddCustomer = async (customerData) => {
    try {
      // Check if customer already exists (by name and email)
      const existingCustomers = JSON.parse(localStorage.getItem('providerCustomers') || '[]');
      
      const customerExists = existingCustomers.some(c => 
        c.name.toLowerCase() === customerData.name.toLowerCase() ||
        (customerData.email && c.email === customerData.email)
      );

      if (!customerExists) {
        const newCustomer = {
          id: existingCustomers.length + 1,
          name: customerData.name,
          email: customerData.email || 'Not provided',
          phone: customerData.phone || 'N/A',
          address: customerData.address || 'N/A',
          totalOrders: 1,
          totalSpent: parseInt(customerData.quotationAmount) || 0,
          rating: 0,
          lastOrder: new Date().toISOString(),
          status: 'active',
          notes: `Added from order: ${customerData.serviceType}`
        };
        
        const updatedCustomers = [...existingCustomers, newCustomer];
        localStorage.setItem('providerCustomers', JSON.stringify(updatedCustomers));
        console.log('Customer automatically added:', newCustomer);
      }
    } catch (error) {
      console.error('Failed to auto-add customer:', error);
    }
  };

  // Handle edit quote
  const handleEditQuote = (order) => {
    setEditingQuote(order);
    setEditQuoteForm({
      quotationAmount: order.quotation_amount || '',
      quotationDetails: order.quotation_details || '',
      validUntil: order.quotation_valid_until || ''
    });
    setShowEditQuoteForm(true);
  };

  // Handle delete quote
  const handleDeleteQuote = async (order) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the quote for ${order.homeowner_name}? This will remove the quote from both your system and the customer's view.`
    );
    
    if (!confirmDelete) return;
    
    try {
      await apiService.deleteQuotation(order.id);
      
      // Reload orders to reflect the change
      loadOrders();
      alert('Quote deleted successfully!');
    } catch (error) {
      console.error('Failed to delete quote:', error);
      alert('Failed to delete quote. Please try again.');
    }
  };

  // Handle update quote
  const handleUpdateQuote = async () => {
    if (!editingQuote || !editQuoteForm.quotationAmount) {
      alert('Please enter a quotation amount');
      return;
    }
    
    try {
      const updateData = {
        quotation_amount: editQuoteForm.quotationAmount,
        quotation_details: editQuoteForm.quotationDetails,
        quotation_valid_until: editQuoteForm.validUntil
      };
      
      await apiService.updateQuotation(editingQuote.id, updateData);
      
      // Reset form and reload orders
      setEditQuoteForm({
        quotationAmount: '',
        quotationDetails: '',
        validUntil: ''
      });
      setEditingQuote(null);
      setShowEditQuoteForm(false);
      loadOrders();
      alert('Quote updated successfully!');
      
    } catch (error) {
      console.error('Failed to update quote:', error);
      alert('Failed to update quote. Please try again.');
    }
  };

  const handleServiceToggle = (serviceName) => {
    setNewOrder(prev => {
      const newServices = prev.services.includes(serviceName)
        ? prev.services.filter(s => s !== serviceName)
        : [...prev.services, serviceName];
      
      return {
        ...prev,
        services: newServices,
        serviceType: newServices.join(', ') // Update serviceType for backend compatibility
      };
    });
  };

  const addNewServiceToOrder = (serviceName) => {
    if (serviceName.trim() && !availableServices.includes(serviceName.trim())) {
      const trimmedService = serviceName.trim();
      setAvailableServices(prev => [...prev, trimmedService].sort());
      setNewOrder(prev => ({
        ...prev,
        services: [...prev.services, trimmedService],
        serviceType: [...prev.services, trimmedService].join(', ')
      }));
    }
  };

  const handleCreateOrder = async () => {
    try {
      setError('');
      
      // Use database user profile instead of localStorage
      if (!userProfile || !userProfile.id) {
        throw new Error('Please ensure you are logged in properly');
      }

      // Check if we're editing an existing order
      if (editingQuote) {
        // Update existing order
        const updateData = {
          homeowner_name: newOrder.customerName,
          homeowner_email: newOrder.customerEmail,
          homeowner_phone: newOrder.customerPhone,
          homeowner_address: newOrder.address,
          service_type: newOrder.serviceType,
          services: newOrder.services,
          description: newOrder.description,
          preferred_date: newOrder.scheduledDate,
          urgency: newOrder.priority,
          budget: newOrder.quotationAmount ? `$${newOrder.quotationAmount}` : '',
          additional_requirements: newOrder.orderDetails,
          quotation_amount: newOrder.quotationAmount ? parseFloat(newOrder.quotationAmount) : null
        };
        
        await apiService.updateOrder(editingQuote.id, updateData);
        
        // Reset editing state
        setEditingQuote(null);
        alert('Order updated successfully!');
      } else {
        // Create new order (existing logic)
        const homeownerId = `manual_${Date.now()}`;
        
        const orderData = {
          homeowner_id: homeownerId,
          provider_id: userProfile.id,
          homeowner_name: newOrder.customerName,
          homeowner_email: newOrder.customerEmail,
          homeowner_phone: newOrder.customerPhone,
          homeowner_address: newOrder.address,
          provider_name: userProfile.business_name || userProfile.name,
          service_type: newOrder.serviceType,
          services: newOrder.services, // Add services array
          description: newOrder.description,
          preferred_date: newOrder.scheduledDate,
          preferred_time: '09:00',
          urgency: newOrder.priority,
          budget: newOrder.quotationAmount ? `$${newOrder.quotationAmount}` : '',
          additional_requirements: newOrder.orderDetails
        };

        const createdOrder = await apiService.createOrder(orderData);
        
        // Auto-add customer
        await autoAddCustomer({
          name: newOrder.customerName,
          email: newOrder.customerEmail,
          phone: newOrder.customerPhone,
          address: newOrder.address,
          serviceType: newOrder.serviceType,
          quotationAmount: newOrder.quotationAmount
        });
        
        // If there's a scheduled date, create appointment
        if (newOrder.scheduledDate) {
          const appointmentData = {
            customer_name: newOrder.customerName,
            phone_number: newOrder.customerPhone,
            service_type: newOrder.serviceType,
            services: newOrder.services, // Add services array
            date: newOrder.scheduledDate,
            time: '09:00',
            address: newOrder.address,
            notes: `Order #${createdOrder.id} - ${newOrder.description}`,
            order_id: createdOrder.id,
            source: 'order'
          };
          
          try {
            await apiService.createAppointment(appointmentData);
          } catch (appointmentError) {
            console.error('Failed to create appointment:', appointmentError);
            // Don't fail the order creation if appointment fails
          }
        }
      }
      
      // Reset form and reload orders
      setNewOrder({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        serviceType: '',
        services: [], // Reset services array
        description: '',
        address: '',
        quotationAmount: '',
        orderDetails: '',
        priority: 'medium',
        scheduledDate: ''
      });
      setShowNewOrderForm(false);
      loadOrders(); // Reload orders from database
      
    } catch (error) {
      console.error('Failed to create order:', error);
      setError(error.message || 'Failed to create order. Please try again.');
    }
  };

  // Handle edit order - only for manual orders
  const handleEditOrder = (order) => {
    if (!order.homeowner_id || !order.homeowner_id.startsWith('manual_')) {
      alert('Only manual orders can be edited.');
      return;
    }
    
    // Populate the form with existing order data
    setNewOrder({
      customerName: order.homeowner_name,
      customerEmail: order.homeowner_email,
      customerPhone: order.homeowner_phone,
      serviceType: order.service_type,
      services: order.services || order.service_type.split(', '),
      description: order.description,
      address: order.homeowner_address,
      quotationAmount: order.quotation_amount ? order.quotation_amount.toString() : '',
      orderDetails: order.additional_requirements || '',
      priority: order.urgency || 'medium',
      scheduledDate: order.preferred_date || ''
    });
    
    // Store the order being edited
    setEditingQuote(order);
    setShowNewOrderForm(true);
  };

  // Handle delete order - only for manual orders
  const handleDeleteOrder = async (order) => {
    if (!order.homeowner_id || !order.homeowner_id.startsWith('manual_')) {
      alert('Only manual orders can be deleted.');
      return;
    }
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the order for ${order.homeowner_name}? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    try {
      await apiService.deleteOrder(order.id);
      
      // Reload orders to reflect the change
      loadOrders();
      alert('Order deleted successfully!');
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order. Please try again.');
    }
  };

  // Function to handle messaging with proper validation
  const handleMessageCustomer = (order) => {
    if (!order.id || order.status === 'pending_quotation') {
      // Don't allow messaging for orders without proper setup or pending quotation
      alert('Please send a quotation first before messaging the customer.');
      return;
    }
    navigate('/homeservices/messages');
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      loadOrders(); // Reload orders after status update
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleSendQuotation = async (orderId, quotationAmount) => {
    try {
      if (!quotationAmount || quotationAmount <= 0) {
        alert('Please enter a valid quotation amount');
        return;
      }

      // Update order with quotation amount and status
      await apiService.updateOrderQuotation(orderId, parseFloat(quotationAmount), 'Quotation provided');
      
      // Create a message thread for this quotation
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Create message thread
        const threadData = {
          order_id: orderId,
          homeowner_id: order.homeowner_id,
          provider_id: user.id,
          homeowner_name: order.homeowner_name,
          provider_name: user.business_name || user.name,
          service_type: order.service_type,
          last_message: `Quotation sent: $${quotationAmount}`,
          last_message_time: new Date().toISOString()
        };
        
        const messageThread = await apiService.createMessageThread(threadData);
        
        // Send quotation message
        const quotationMessage = {
          thread_id: messageThread.id,
          sender_id: user.id,
          sender_type: 'provider',
          content: `I've prepared a quotation for your ${order.service_type} request.\n\n💰 Quotation Amount: $${quotationAmount}\n\nPlease let me know if you have any questions or if you'd like to proceed with this quote.`,
          timestamp: new Date().toISOString()
        };
        
        await apiService.sendMessage(quotationMessage);
      }
      
      loadOrders(); // Reload orders
      updateNotifications(); // Update notification counts
      alert('Quotation sent successfully!');
      
    } catch (error) {
      console.error('Failed to send quotation:', error);
      alert('Failed to send quotation. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_quotation':
        return 'bg-yellow-100 text-yellow-800';
      case 'quotation_sent':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const pendingOrders = orders.filter(o => o.status === 'pending_quotation');
  const quotationSentOrders = orders.filter(o => o.status === 'quotation_sent');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const inProgressOrders = orders.filter(o => o.status === 'in_progress');
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button - Only show on mobile */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center xl:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">Doord.</h1>
              <span className="text-sm text-gray-600 hidden sm:inline">for Merchants</span>
            </div>
            
            {/* Mobile Right Side */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
                {notifications.totalUnreadMessages > 0 && (
                  <NotificationBadge count={notifications.totalUnreadMessages} className="ml-1" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/homeservices/settings')}
                className="p-1"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
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
                    variant={item.id === 'orders' ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                    {item.notificationKey && notifications[item.notificationKey] > 0 && (
                      <NotificationBadge count={notifications[item.notificationKey]} className="ml-auto" />
                    )}
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
        {/* Desktop Sidebar - Always visible on desktop */}
        <div className="hidden xl:block w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-blue-600">Doord.</h1>
            </div>
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant={item.id === 'orders' ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                  {item.notificationKey && notifications[item.notificationKey] > 0 && (
                    <NotificationBadge count={notifications[item.notificationKey]} className="ml-auto" />
                  )}
                </Button>
              ))}
              <hr className="my-4" />
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Orders</h2>
                  <p className="text-gray-600">Manage your orders from quotation to completion</p>
                </div>
                <Button onClick={() => setShowNewOrderForm(true)} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  New Order
                </Button>
              </div>
            </div>

          {/* New Order Form */}
          {showNewOrderForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{editingQuote ? 'Edit Order' : 'Create New Order'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={newOrder.customerName}
                      onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                      placeholder="Enter customer name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Customer Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={newOrder.customerEmail}
                      onChange={(e) => setNewOrder({...newOrder, customerEmail: e.target.value})}
                      placeholder="customer@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Customer Phone</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={newOrder.customerPhone}
                      onChange={(e) => setNewOrder({...newOrder, customerPhone: e.target.value})}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Service Type (Select multiple services)</Label>
                      <div className="text-xs text-gray-500">
                        {newOrder.services.length > 0 && `${newOrder.services.length} selected`}
                      </div>
                    </div>
                    
                    {/* Selected Services Tags */}
                    {newOrder.services.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 bg-blue-50 rounded-md">
                        {newOrder.services.map((service, index) => (
                          <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                            <span>{service}</span>
                            <button
                              type="button"
                              onClick={() => handleServiceToggle(service)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Service Selection Interface */}
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {providerServices.map((serviceName, index) => (
                          <div key={`provider-${index}`} className="flex items-center space-x-2">
                            <Checkbox
                              id={`provider-${serviceName}`}
                              checked={newOrder.services.includes(serviceName)}
                              onCheckedChange={() => handleServiceToggle(serviceName)}
                            />
                            <label
                              htmlFor={`provider-${serviceName}`}
                              className="text-sm cursor-pointer text-blue-700 font-medium"
                              onClick={() => handleServiceToggle(serviceName)}
                            >
                              {serviceName}
                            </label>
                          </div>
                        ))}
                        
                        {providerServices.length === 0 && (
                          <div className="col-span-2 text-center text-gray-500 text-sm py-4">
                            No services available. Add services from your profile.
                          </div>
                        )}
                      </div>
                      
                      {/* Other available services */}
                      {availableServices.filter(service => !providerServices.includes(service)).length > 0 && (
                        <>
                          <hr className="my-2" />
                          <div className="text-xs text-gray-500 mb-2">Other Available Services:</div>
                          <div className="grid grid-cols-2 gap-2">
                            {availableServices
                              .filter(service => !providerServices.includes(service))
                              .map((serviceName, index) => (
                              <div key={`other-${index}`} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`other-${serviceName}`}
                                  checked={newOrder.services.includes(serviceName)}
                                  onCheckedChange={() => handleServiceToggle(serviceName)}
                                />
                                <label
                                  htmlFor={`other-${serviceName}`}
                                  className="text-sm cursor-pointer text-gray-600"
                                  onClick={() => handleServiceToggle(serviceName)}
                                >
                                  {serviceName}
                                </label>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Service Address</Label>
                    <Input
                      id="address"
                      value={newOrder.address}
                      onChange={(e) => setNewOrder({...newOrder, address: e.target.value})}
                      placeholder="123 Main St, City, Province"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quotationAmount">Quotation Amount ($)</Label>
                    <Input
                      id="quotationAmount"
                      type="number"
                      value={newOrder.quotationAmount}
                      onChange={(e) => setNewOrder({...newOrder, quotationAmount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newOrder.priority} onValueChange={(value) => setNewOrder({...newOrder, priority: value})}>
                      <SelectTrigger className="relative z-50">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="z-[100]">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={newOrder.scheduledDate}
                      onChange={(e) => setNewOrder({...newOrder, scheduledDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      value={newOrder.description}
                      onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                      placeholder="Describe the project..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="orderDetails">Order Details</Label>
                    <Textarea
                      id="orderDetails"
                      value={newOrder.orderDetails}
                      onChange={(e) => setNewOrder({...newOrder, orderDetails: e.target.value})}
                      placeholder="Detailed breakdown of work and materials..."
                      rows={4}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0 mt-6">
                  <Button onClick={handleCreateOrder} className="w-full sm:w-auto">
                    {editingQuote ? 'Update Order' : 'Create Order'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowNewOrderForm(false);
                    setEditingQuote(null);
                  }} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit Quote Form */}
          {showEditQuoteForm && editingQuote && (
            <Card className="mb-6 border-orange-200 shadow-lg">
              <CardHeader className="bg-orange-50">
                <CardTitle className="text-orange-800">Edit Quote for {editingQuote.homeowner_name}</CardTitle>
                <p className="text-sm text-orange-600">Service: {editingQuote.service_type}</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editQuotationAmount">Quotation Amount *</Label>
                    <Input
                      id="editQuotationAmount"
                      type="number"
                      value={editQuoteForm.quotationAmount}
                      onChange={(e) => setEditQuoteForm({...editQuoteForm, quotationAmount: e.target.value})}
                      placeholder="Enter amount (e.g., 500)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Quote Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={editQuoteForm.validUntil}
                      onChange={(e) => setEditQuoteForm({...editQuoteForm, validUntil: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="editQuotationDetails">Quotation Details</Label>
                    <Textarea
                      id="editQuotationDetails"
                      value={editQuoteForm.quotationDetails}
                      onChange={(e) => setEditQuoteForm({...editQuoteForm, quotationDetails: e.target.value})}
                      placeholder="Detailed breakdown of costs, materials, labor..."
                      rows={4}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0 mt-6">
                  <Button onClick={handleUpdateQuote} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700">
                    Update Quote
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowEditQuoteForm(false);
                      setEditingQuote(null);
                      setEditQuoteForm({ quotationAmount: '', quotationDetails: '', validUntil: '' });
                    }} 
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
              <Button 
                variant="outline" 
                onClick={loadOrders}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading orders...</p>
            </div>
          )}

          {/* Orders Content */}
          {!loading && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 gap-1 h-auto p-1">
              <TabsTrigger value="pending" className="text-xs px-1 py-2 min-w-0 flex-col">
                <span className="truncate w-full text-center">Pending</span>
                <span className="text-xs mt-0.5">({pendingOrders.length})</span>
              </TabsTrigger>
              <TabsTrigger value="quoted" className="text-xs px-1 py-2 min-w-0 flex-col">
                <span className="truncate w-full text-center">Quoted</span>
                <span className="text-xs mt-0.5">({quotationSentOrders.length})</span>
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="text-xs px-1 py-2 min-w-0 flex-col">
                <span className="truncate w-full text-center">
                  <span className="hidden sm:inline">Confirmed</span>
                  <span className="sm:hidden">Conf.</span>
                </span>
                <span className="text-xs mt-0.5">({confirmedOrders.length})</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="text-xs px-1 py-2 min-w-0 flex-col sm:block">
                <span className="truncate w-full text-center">
                  <span className="hidden sm:inline">Progress</span>
                  <span className="sm:hidden">Prog.</span>
                </span>
                <span className="text-xs mt-0.5">({inProgressOrders.length})</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs px-1 py-2 min-w-0 flex-col sm:block">
                <span className="truncate w-full text-center">Done</span>
                <span className="text-xs mt-0.5">({completedOrders.length})</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4">
              {pendingOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No pending orders.</p>
                </div>
              ) : (
                pendingOrders.map(order => (
                  <Card key={order.id} className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{order.homeowner_name}</CardTitle>
                          <p className="text-sm text-gray-600">{order.service_type}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(order.urgency || order.priority)}>
                            {order.urgency || order.priority}
                          </Badge>
                          <Badge className={getStatusColor(order.status)}>
                            <Clock className="h-3 w-3 mr-1" />
                            Quotation Needed
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Customer Request</h4>
                          <p className="text-gray-700">{order.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{order.homeowner_address || 'Address not provided'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{order.homeowner_email || 'Email not provided'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{order.homeowner_phone || 'Phone not provided'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{formatDate(order.created_at || order.request_date)}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0">
                          <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              className="flex-1"
                              id={`quotation-${order.id}`}
                            />
                            <Button onClick={() => {
                              const amount = document.getElementById(`quotation-${order.id}`).value;
                              handleSendQuotation(order.id, amount);
                            }} className="w-auto">
                              <DollarSign className="h-4 w-4 mr-1" />
                              Send Quote
                            </Button>
                          </div>
                          <Button variant="outline" 
                            onClick={() => handleMessageCustomer(order)} 
                            className="w-full sm:w-auto"
                            disabled={order.status === 'pending_quotation'}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Message Customer</span>
                            <span className="sm:hidden">Message</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="quoted" className="space-y-4">
              {quotationSentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No quoted orders.</p>
                </div>
              ) : (
                quotationSentOrders.map(order => (
                  <Card key={order.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{order.homeowner_name}</CardTitle>
                          <p className="text-sm text-gray-600">{order.service_type}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            ${order.quotation_amount || order.budget || 'TBD'}
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            <Send className="h-3 w-3 mr-1" />
                            Quotation Sent
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Order Details</h4>
                          <p className="text-gray-700">{order.description || order.additional_requirements}</p>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <Send className="h-4 w-4 inline mr-1" />
                            Quotation sent! Waiting for customer response.
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0">
                          <Button 
                            variant="default" 
                            onClick={() => handleEditQuote(order)} 
                            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Edit Quote</span>
                            <span className="sm:hidden">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleDeleteQuote(order)} 
                            className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Delete Quote</span>
                            <span className="sm:hidden">Delete</span>
                          </Button>
                          {/* Only show message button for real homeowner orders, not manual orders */}
                          {order.homeowner_id && !order.homeowner_id.startsWith('manual_') && (
                            <Button variant="outline" onClick={() => handleMessageCustomer(order)} className="w-full sm:w-auto">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">Message Customer</span>
                              <span className="sm:hidden">Message</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="confirmed" className="space-y-4">
              {confirmedOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No confirmed orders.</p>
                </div>
              ) : (
                confirmedOrders.map(order => (
                  <Card key={order.id} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{order.homeowner_name}</CardTitle>
                          <p className="text-sm text-gray-600">{order.service_type}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {order.quotation_amount ? `$${order.quotation_amount}` : (order.budget || 'Price TBD')}
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Scheduled
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-800">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Order scheduled! Ready to start work.
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0">
                          <Button onClick={() => handleUpdateOrderStatus(order.id, 'in_progress')} className="w-full sm:w-auto">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Start Work</span>
                            <span className="sm:hidden">Start</span>
                          </Button>
                          <Button variant="outline" onClick={() => navigate('/homeservices/calendar')} className="w-full sm:w-auto">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule
                          </Button>
                          {/* Show Edit and Delete buttons for manual orders */}
                          {order.homeowner_id && order.homeowner_id.startsWith('manual_') && (
                            <>
                              <Button variant="outline" onClick={() => handleEditOrder(order)} className="w-full sm:w-auto">
                                <Edit className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Edit Order</span>
                                <span className="sm:hidden">Edit</span>
                              </Button>
                              <Button variant="outline" onClick={() => handleDeleteOrder(order)} className="w-full sm:w-auto text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">
                                <Trash2 className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Delete Order</span>
                                <span className="sm:hidden">Delete</span>
                              </Button>
                            </>
                          )}
                          {/* Only show message button for real homeowner orders, not manual orders */}
                          {order.homeowner_id && !order.homeowner_id.startsWith('manual_') && (
                            <Button variant="outline" onClick={() => handleMessageCustomer(order)} className="w-full sm:w-auto">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">Message Customer</span>
                              <span className="sm:hidden">Message</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="progress" className="space-y-4">
              {inProgressOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No orders in progress.</p>
                </div>
              ) : (
                inProgressOrders.map(order => (
                  <Card key={order.id} className="border-l-4 border-l-purple-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{order.homeowner_name}</CardTitle>
                          <p className="text-sm text-gray-600">{order.service_type}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">
                            {order.quotation_amount ? `$${order.quotation_amount}` : (order.budget || 'Price TBD')}
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            <Clock className="h-3 w-3 mr-1" />
                            In Progress
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-purple-800">
                            <Clock className="h-4 w-4 inline mr-1" />
                            Work in progress. Keep customer updated on progress.
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0">
                          <Button onClick={() => handleUpdateOrderStatus(order.id, 'completed')} className="w-full sm:w-auto">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Mark Complete</span>
                            <span className="sm:hidden">Complete</span>
                          </Button>
                          <Button variant="outline" onClick={() => handleMessageCustomer(order)} className="w-full sm:w-auto">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Update Customer</span>
                            <span className="sm:hidden">Update</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {completedOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No completed orders.</p>
                </div>
              ) : (
                completedOrders.map(order => (
                  <Card key={order.id} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{order.homeowner_name}</CardTitle>
                          <p className="text-sm text-gray-600">{order.service_type}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {order.quotation_amount ? `$${order.quotation_amount}` : (order.budget || 'Price TBD')}
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-800">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Order completed successfully! Payment processed.
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0">
                          <Button variant="outline" className="w-full sm:w-auto">
                            <Star className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Request Review</span>
                            <span className="sm:hidden">Review</span>
                          </Button>
                          <Button variant="outline" onClick={() => handleMessageCustomer(order)} className="w-full sm:w-auto">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Message Customer</span>
                            <span className="sm:hidden">Message</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default ProviderOrders;