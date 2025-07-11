import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LogOut
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { mockOrders } from '../../data/mockData';

const ProviderOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    serviceType: '',
    description: '',
    address: '',
    quotationAmount: '',
    orderDetails: '',
    priority: 'medium',
    scheduledDate: ''
  });

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: Home, path: '/homeservices/dashboard' },
    { id: 'orders', label: 'Orders', icon: Package, path: '/homeservices/orders' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/homeservices/messages' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/homeservices/calendar' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/homeservices/customers' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/homeservices/settings' }
  ];

  useEffect(() => {
    // Filter orders for current provider (mock provider ID = 1)
    const providerOrders = mockOrders.filter(order => order.providerId === 1);
    setOrders(providerOrders);
  }, []);

  const handleCreateOrder = () => {
    const order = {
      id: Date.now(),
      homeownerId: Date.now(),
      providerId: 1,
      providerName: 'Elite Home Solutions',
      homeownerName: newOrder.customerName,
      homeownerEmail: newOrder.customerEmail,
      homeownerPhone: newOrder.customerPhone,
      serviceType: newOrder.serviceType,
      description: newOrder.description,
      homeownerAddress: newOrder.address,
      quotationAmount: parseFloat(newOrder.quotationAmount),
      orderDetails: newOrder.orderDetails,
      priority: newOrder.priority,
      status: 'pending_quotation',
      requestDate: new Date().toISOString(),
      scheduledDate: newOrder.scheduledDate || null,
      messages: []
    };

    setOrders([...orders, order]);
    setNewOrder({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      serviceType: '',
      description: '',
      address: '',
      quotationAmount: '',
      orderDetails: '',
      priority: 'medium',
      scheduledDate: ''
    });
    setShowNewOrderForm(false);
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
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
                  variant={item.id === 'orders' ? "default" : "ghost"}
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Orders</h2>
              <p className="text-gray-600">Manage your orders from quotation to completion</p>
            </div>
            <Button onClick={() => setShowNewOrderForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>

          {/* New Order Form */}
          {showNewOrderForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create New Order</CardTitle>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Input
                      id="serviceType"
                      value={newOrder.serviceType}
                      onChange={(e) => setNewOrder({...newOrder, serviceType: e.target.value})}
                      placeholder="e.g., Plumbing, Electrical"
                    />
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
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
                
                <div className="flex space-x-3 mt-6">
                  <Button onClick={handleCreateOrder}>
                    Create Order
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewOrderForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orders Tabs */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="pending">
                Pending ({pendingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="quoted">
                Quoted ({quotationSentOrders.length})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Confirmed ({confirmedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="progress">
                In Progress ({inProgressOrders.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedOrders.length})
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
                          <CardTitle className="text-lg">{order.homeownerName}</CardTitle>
                          <p className="text-sm text-gray-600">{order.serviceType}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
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
                            <span>{order.homeownerAddress}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{order.homeownerEmail}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{order.homeownerPhone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{formatDate(order.requestDate)}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button onClick={() => handleUpdateOrderStatus(order.id, 'quotation_sent')}>
                            <FileText className="h-4 w-4 mr-2" />
                            Send Quotation
                          </Button>
                          <Button variant="outline" onClick={() => navigate('/homeservices/messages')}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message Customer
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
                          <CardTitle className="text-lg">{order.homeownerName}</CardTitle>
                          <p className="text-sm text-gray-600">{order.serviceType}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            ${order.quotationAmount}
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
                          <p className="text-gray-700">{order.orderDetails}</p>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <Send className="h-4 w-4 inline mr-1" />
                            Quotation sent! Waiting for customer response.
                          </p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button variant="outline" onClick={() => navigate('/homeservices/messages')}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Follow Up
                          </Button>
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
                          <CardTitle className="text-lg">{order.homeownerName}</CardTitle>
                          <p className="text-sm text-gray-600">{order.serviceType}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            ${order.quotationAmount}
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirmed
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-800">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Order confirmed! Ready to start work.
                          </p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button onClick={() => handleUpdateOrderStatus(order.id, 'in_progress')}>
                            <Clock className="h-4 w-4 mr-2" />
                            Start Work
                          </Button>
                          <Button variant="outline" onClick={() => navigate('/homeservices/calendar')}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule
                          </Button>
                          <Button variant="outline" onClick={() => navigate('/homeservices/messages')}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message Customer
                          </Button>
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
                          <CardTitle className="text-lg">{order.homeownerName}</CardTitle>
                          <p className="text-sm text-gray-600">{order.serviceType}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress
                        </Badge>
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
                        
                        <div className="flex space-x-3">
                          <Button onClick={() => handleUpdateOrderStatus(order.id, 'completed')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                          <Button variant="outline" onClick={() => navigate('/homeservices/messages')}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Update Customer
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
                          <CardTitle className="text-lg">{order.homeownerName}</CardTitle>
                          <p className="text-sm text-gray-600">{order.serviceType}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            ${order.quotationAmount}
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
                        
                        <div className="flex space-x-3">
                          <Button variant="outline">
                            <Star className="h-4 w-4 mr-2" />
                            Request Review
                          </Button>
                          <Button variant="outline" onClick={() => navigate('/homeservices/messages')}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message Customer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProviderOrders;