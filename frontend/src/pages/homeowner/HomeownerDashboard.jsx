import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Calendar, 
  MessageCircle, 
  AlertTriangle, 
  Settings, 
  Search,
  Menu,
  X,
  Bell,
  User,
  Star,
  ArrowRight,
  Clock,
  CheckCircle,
  FileText,
  Send,
  Phone,
  Mail,
  MapPin,
  DollarSign
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { serviceCategories, mockOrders, mockQuotationRequests } from '../../data/mockData';

const HomeownerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // Get current user's orders (assuming user ID 1 for demo)
  const currentUserId = 1;
  const userOrders = mockOrders.filter(order => order.homeownerId === currentUserId);
  const userQuotationRequests = mockQuotationRequests.filter(req => req.homeownerId === currentUserId);

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: Home, active: true },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, active: false },
    { id: 'book-service', label: 'Book service', icon: Calendar, active: false },
    { id: 'messages', label: 'Messages', icon: MessageCircle, active: false },
    { id: 'reports', label: 'Reports & Issues', icon: AlertTriangle, active: false },
    { id: 'settings', label: 'Settings', icon: Settings, active: false },
  ];

  const featuredServices = [
    {
      id: 1,
      title: 'WINDOW CLEANING',
      description: 'Get the world more clearly! Our pros remove smudges, dirt, and grime from your windows—inside and out.',
      action: 'Get Nearest Vendor',
      color: 'bg-blue-500',
      icon: '🪟'
    },
    {
      id: 2,
      title: 'PRESSURE WASHING',
      description: 'Deep clean your driveways, patios, and exterior surfaces with professional pressure washing.',
      action: 'Get Nearest Vendor',
      color: 'bg-green-500',
      icon: '💦'
    },
    {
      id: 3,
      title: 'GUTTER CLEANING',
      description: 'Keep your gutters clean and functional with our professional gutter cleaning services.',
      action: 'Get Nearest Vendor',
      color: 'bg-orange-500',
      icon: '🏠'
    },
    {
      id: 4,
      title: 'LANDSCAPING',
      description: 'Transform your outdoor space with professional landscaping and garden maintenance.',
      action: 'Get Nearest Vendor',
      color: 'bg-purple-500',
      icon: '🌱'
    },
    {
      id: 5,
      title: 'CAR DETAILING',
      description: 'Professional car cleaning and detailing services right at your doorstep.',
      action: 'Get Nearest Vendor',
      color: 'bg-red-500',
      icon: '🚗'
    }
  ];

  const mostBookedServices = [
    { name: 'Plumbing', priceRange: '$397 - $836', icon: '🔧' },
    { name: 'Electrician', priceRange: '$397 - $836', icon: '⚡' },
    { name: 'Handyman services', priceRange: '$397 - $836', icon: '🔨' },
    { name: 'Gutter Cleaning', priceRange: '$397 - $836', icon: '🏠' },
    { name: 'Appliance repair', priceRange: '$397 - $836', icon: '🔧' },
    { name: 'Junk removal', priceRange: '$397 - $836', icon: '🗑️' }
  ];

  const testimonials = [
    {
      id: 1,
      title: 'Truly Impressed by the Effort',
      content: "I wasn't sure what to expect from a new startup, but these folks proved me wrong. The team was polite, showed up on time, and did a thorough job. I love supporting local businesses, and I'll definitely be booking again!",
      author: 'Jordan M.',
      location: 'Halifax'
    },
    {
      id: 2,
      title: 'Fresh Energy in the Industry',
      content: "There's something different about Doord. You can tell they care. They didn't just clean my gutters—they explained what the issue was and gave tips to maintain them. Halifax needs more service like this.",
      author: 'Priya S.',
      location: 'Halifax'
    },
    {
      id: 3,
      title: 'So Easy, So Convenient',
      content: "Booked window cleaning on a whim and wow—super smooth process. No confusing app, no annoying upsells. Just clean windows and friendly service. These guys are doing something right.",
      author: 'Tyler G.',
      location: 'Halifax'
    }
  ];

  const handleServiceClick = (serviceId) => {
    navigate('/homeowners/browse');
  };

  const handleSidebarItemClick = (itemId) => {
    setActiveTab(itemId);
    setIsSidebarOpen(false);
    
    // Handle navigation within dashboard
    switch(itemId) {
      case 'orders':
        // We'll create an orders section within dashboard
        break;
      case 'book-service':
        // We'll create a book service section within dashboard
        break;
      case 'messages':
        // We'll create a messages section within dashboard
        break;
      case 'reports':
        // We'll create a reports section within dashboard
        break;
      case 'settings':
        // We'll create a settings section within dashboard
        break;
      case 'home':
      default:
        // Stay on home dashboard
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">Doord.</h1>
          <Button
            variant="ghost"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <nav className="mt-8 flex-1 flex flex-col justify-between">
          <ul className="space-y-2 px-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Button
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => handleSidebarItemClick(item.id)}
                    className={`w-full justify-start h-12 ${
                      activeTab === item.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Button>
                </li>
              );
            })}
          </ul>
          
          {/* Logout Button */}
          <div className="px-4 pb-4">
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem('userType');
                localStorage.removeItem('user');
                navigate('/homeowners');
              }}
              className="w-full justify-start h-12 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <ArrowRight className="h-5 w-5 mr-3 rotate-180" />
              Log Out
            </Button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden mr-4"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Home Dashboard Content */}
          {activeTab === 'home' && (
            <>
              {/* Featured Services Section */}
              <div className="mb-8">
                {/* Desktop View */}
                <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {featuredServices.map((service) => (
                    <Card 
                      key={service.id} 
                      className={`${service.color} text-white cursor-pointer hover:scale-105 transition-transform duration-200`}
                      onClick={() => handleServiceClick(service.id)}
                    >
                      <CardContent className="p-6">
                        <div className="text-4xl mb-4">{service.icon}</div>
                        <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                        <p className="text-sm opacity-90 mb-4">{service.description}</p>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full"
                        >
                          {service.action}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Mobile View - Horizontal Scroll */}
                <div className="md:hidden">
                  <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
                    {featuredServices.map((service) => (
                      <Card 
                        key={service.id} 
                        className={`${service.color} text-white cursor-pointer hover:scale-105 transition-transform duration-200 flex-shrink-0 w-80`}
                        onClick={() => handleServiceClick(service.id)}
                      >
                        <CardContent className="p-6">
                          <div className="text-4xl mb-4">{service.icon}</div>
                          <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                          <p className="text-sm opacity-90 mb-4">{service.description}</p>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="w-full"
                          >
                            {service.action}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Home Services Section */}
              <div className="mb-8">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Home services at your door step
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-6">
                  {serviceCategories.flatMap(category => 
                    category.services.slice(0, 2).map(service => (
                      <Card 
                        key={service.id} 
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                        onClick={() => handleServiceClick(service.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl mb-2">{service.icon}</div>
                          <h4 className="font-semibold text-xs">{service.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{category.name}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
                
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('book-service')}
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    View More Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Most Booked Services */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Most booked services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mostBookedServices.map((service, index) => (
                    <Card 
                      key={index} 
                      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                      onClick={() => handleServiceClick(index)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="text-3xl mr-4">{service.icon}</div>
                          <div>
                            <h4 className="font-bold text-lg">{service.name}</h4>
                            <p className="text-sm text-gray-600">PRICING UNDER</p>
                            <p className="text-sm font-semibold text-blue-600">{service.priceRange}</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                          Book Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Customer Testimonials */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What our customers say</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader>
                        <CardTitle className="text-lg">{testimonial.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4 text-sm">{testimonial.content}</p>
                        <div className="flex items-center space-x-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-sm font-semibold">- {testimonial.author}</p>
                        <p className="text-xs text-gray-500">{testimonial.location}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Orders Section */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">My Orders & Quotations</h2>
              
              {/* Orders Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{userOrders.filter(o => o.status !== 'completed').length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{userOrders.filter(o => o.status === 'completed').length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Quotes</p>
                        <p className="text-2xl font-bold text-gray-900">{userQuotationRequests.filter(q => q.status === 'pending_quotes').length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order List */}
              <div className="space-y-6">
                {userOrders.map(order => (
                  <Card key={order.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{order.serviceType}</CardTitle>
                          <p className="text-sm text-gray-600">{order.providerName}</p>
                          <p className="text-xs text-gray-500">Order #{order.id} - {new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            ${order.quotationAmount}
                          </div>
                          <Badge className={`${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Service Description</h4>
                          <p className="text-gray-700">{order.description}</p>
                        </div>
                        
                        {order.scheduledDate && (
                          <div>
                            <h4 className="font-semibold mb-2">Scheduled Date</h4>
                            <p className="text-gray-700">{new Date(order.scheduledDate).toLocaleString()}</p>
                          </div>
                        )}
                        
                        {/* Work Progress */}
                        {order.workProgress && order.workProgress.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Work Progress</h4>
                            <div className="space-y-2">
                              {order.workProgress.map(progress => (
                                <div key={progress.id} className="flex items-center space-x-3">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  <div className="flex-1">
                                    <p className="text-sm">{progress.update}</p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(progress.timestamp).toLocaleString()} - Updated by {progress.updatedBy}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-3 pt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedConversation(order);
                              setActiveTab('messages');
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message Provider
                          </Button>
                          {order.invoice && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              View Invoice
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Quotation Requests */}
                {userQuotationRequests.map(request => (
                  <Card key={`quote-${request.id}`} className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{request.serviceType}</CardTitle>
                          <p className="text-sm text-gray-600">Quotation Request</p>
                          <p className="text-xs text-gray-500">Request #{request.id} - {new Date(request.requestDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {request.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Request Description</h4>
                          <p className="text-gray-700">{request.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Budget:</span> ${request.budget}
                          </div>
                          <div>
                            <span className="font-medium">Urgency:</span> {request.urgency}
                          </div>
                          <div>
                            <span className="font-medium">Property Size:</span> {request.propertySize}
                          </div>
                          <div>
                            <span className="font-medium">Preferred Date:</span> {request.preferredDate}
                          </div>
                        </div>
                        
                        {request.quotes && request.quotes.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Received Quotes</h4>
                            <div className="space-y-3">
                              {request.quotes.map(quote => (
                                <div key={quote.id} className="border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium">{quote.providerName}</h5>
                                    <span className="text-lg font-bold text-green-600">${quote.amount}</span>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2">{quote.description}</p>
                                  <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>Duration: {quote.estimatedDuration}</span>
                                    <span>Available: {quote.availability}</span>
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                      Accept Quote
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      Message Provider
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Book Service Section */}
          {activeTab === 'book-service' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Book a Service</h2>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search for services..."
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {serviceCategories.flatMap(category => 
                  category.services.map(service => (
                    <Card 
                      key={service.id} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => navigate('/homeowners/browse')}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-3">{service.icon}</div>
                        <h4 className="font-semibold text-sm">{service.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{category.name}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Messages Section */}
          {activeTab === 'messages' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Messages</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conversation List */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Conversations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {userOrders.map(order => (
                          <div 
                            key={order.id}
                            className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedConversation?.id === order.id ? 'border-blue-500 bg-blue-50' : ''
                            }`}
                            onClick={() => setSelectedConversation(order)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {order.providerName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">{order.providerName}</h4>
                                <p className="text-xs text-gray-600 truncate">{order.serviceType}</p>
                                <p className="text-xs text-gray-400">
                                  Order #{order.id} - {order.status}
                                </p>
                                {order.messages && order.messages.length > 0 && (
                                  <p className="text-xs text-gray-500 truncate mt-1">
                                    {order.messages[order.messages.length - 1].message}
                                  </p>
                                )}
                              </div>
                              {order.messages && order.messages.some(m => !m.read && m.senderType === 'provider') && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Message View */}
                <div className="lg:col-span-2">
                  {selectedConversation ? (
                    <Card className="h-96">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {selectedConversation.providerName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <span>{selectedConversation.providerName}</span>
                            <p className="text-sm font-normal text-gray-600">{selectedConversation.serviceType} - Order #{selectedConversation.id}</p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col h-full">
                        <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
                          {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                            selectedConversation.messages.map(message => (
                              <div key={message.id} className={`flex ${message.senderType === 'homeowner' ? 'justify-end' : ''}`}>
                                <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                                  message.senderType === 'homeowner' 
                                    ? 'bg-blue-600 text-white ml-auto' 
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                  <p className="text-sm">{message.message}</p>
                                  <p className={`text-xs mt-1 ${
                                    message.senderType === 'homeowner' ? 'text-blue-200' : 'text-gray-500'
                                  }`}>
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-gray-500 py-8">
                              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p>No messages yet. Start a conversation with your service provider!</p>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Input 
                            placeholder="Type your message..." 
                            className="flex-1"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                // Handle send message
                                setNewMessage('');
                              }
                            }}
                          />
                          <Button 
                            onClick={() => {
                              // Handle send message
                              setNewMessage('');
                            }}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4 mr-2" />
                            Call Provider
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Reschedule
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View Order Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="h-96 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
                        <p>Choose a provider from the list to start messaging</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reports & Issues Section */}
          {activeTab === 'reports' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Reports & Issues</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Report an Issue</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Issue Type</label>
                      <select className="w-full p-2 border rounded-lg">
                        <option>Service Quality</option>
                        <option>Payment Issue</option>
                        <option>Provider No-Show</option>
                        <option>Billing Dispute</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea 
                        className="w-full p-2 border rounded-lg h-24" 
                        placeholder="Please describe the issue..."
                      ></textarea>
                    </div>
                    <Button className="w-full">Submit Report</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">Service Quality Issue</h4>
                          <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                        </div>
                        <p className="text-xs text-gray-600">Cleaning service was not completed as agreed</p>
                        <p className="text-xs text-gray-400 mt-1">Submitted 3 days ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <Input defaultValue="John Smith" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input defaultValue="john.smith@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <Input defaultValue="+1 (555) 123-4567" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Address</label>
                      <Input defaultValue="123 Main St, City, State 12345" />
                    </div>
                    <Button className="w-full">Update Profile</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Notifications</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SMS Notifications</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Marketing Communications</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Contact Method</label>
                      <select className="w-full p-2 border rounded-lg">
                        <option>Email</option>
                        <option>Phone</option>
                        <option>SMS</option>
                      </select>
                    </div>
                    <Button className="w-full">Save Preferences</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Order ID:</span>
                      <span>#{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Service:</span>
                      <span>{selectedOrder.serviceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Provider:</span>
                      <span>{selectedOrder.providerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Amount:</span>
                      <span className="text-lg font-bold text-green-600">${selectedOrder.quotationAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge className={`${
                        selectedOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedOrder.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        selectedOrder.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedOrder.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Order Date:</span>
                      <span>{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
                    </div>
                    {selectedOrder.scheduledDate && (
                      <div className="flex justify-between">
                        <span className="font-medium">Scheduled:</span>
                        <span>{new Date(selectedOrder.scheduledDate).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Provider Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Provider Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedOrder.providerName}</span>
                    </div>
                    {selectedOrder.providerEmail && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedOrder.providerEmail}</span>
                      </div>
                    )}
                    {selectedOrder.providerPhone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedOrder.providerPhone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Service Address</h4>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <span className="text-sm">{selectedOrder.homeownerAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Service Description */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Service Description</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedOrder.description}</p>
              </div>
              
              {/* Work Progress Timeline */}
              {selectedOrder.workProgress && selectedOrder.workProgress.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Work Progress</h3>
                  <div className="space-y-4">
                    {selectedOrder.workProgress.map((progress, index) => (
                      <div key={progress.id} className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          {index < selectedOrder.workProgress.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{progress.update}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(progress.timestamp).toLocaleString()} - Updated by {progress.updatedBy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Invoice Section */}
              {selectedOrder.invoice && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium">Invoice #{selectedOrder.invoice.id}</span>
                      <Badge className={`${
                        selectedOrder.invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        selectedOrder.invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedOrder.invoice.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {selectedOrder.invoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{item.description}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              (Qty: {item.quantity} × ${item.rate})
                            </span>
                          </div>
                          <span className="font-bold">${item.amount}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Total Amount:</span>
                        <span className="text-xl font-bold text-green-600">${selectedOrder.invoice.amount}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Due Date:</span>
                        <span>{new Date(selectedOrder.invoice.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {selectedOrder.invoice.status !== 'paid' && (
                      <div className="mt-4 flex gap-2">
                        <Button className="bg-green-600 hover:bg-green-700">
                          Pay Now
                        </Button>
                        <Button variant="outline">
                          Download Invoice
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedConversation(selectedOrder);
                    setSelectedOrder(null);
                    setActiveTab('messages');
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Provider
                </Button>
                {selectedOrder.status === 'completed' && (
                  <Button variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    Rate Service
                  </Button>
                )}
                {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default HomeownerDashboard;