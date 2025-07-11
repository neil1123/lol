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
        
        <nav className="mt-8">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span>Recent Orders</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Window Cleaning</h4>
                          <p className="text-sm text-gray-600">Clean Pro Services</p>
                          <p className="text-xs text-gray-500">Scheduled for Dec 15, 2024</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">House Cleaning</h4>
                          <p className="text-sm text-gray-600">Elite Cleaners</p>
                          <p className="text-xs text-gray-500">Completed Dec 10, 2024</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                        <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              CP
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">Clean Pro Services</h4>
                              <p className="text-xs text-gray-600">Window cleaning confirmed for Dec 15</p>
                              <p className="text-xs text-gray-400">2 hours ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                              EC
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">Elite Cleaners</h4>
                              <p className="text-xs text-gray-600">Thank you for your rating!</p>
                              <p className="text-xs text-gray-400">1 day ago</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Message View */}
                <div className="lg:col-span-2">
                  <Card className="h-96">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          CP
                        </div>
                        <span>Clean Pro Services</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col h-full">
                      <div className="flex-1 space-y-3 mb-4">
                        <div className="flex">
                          <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                            <p className="text-sm">Hi! We've confirmed your window cleaning appointment for December 15th at 10 AM. Is this time still good for you?</p>
                            <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                            <p className="text-sm">Yes, that works perfect! Thank you for confirming.</p>
                            <p className="text-xs text-blue-200 mt-1">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Input placeholder="Type your message..." className="flex-1" />
                        <Button>Send</Button>
                      </div>
                    </CardContent>
                  </Card>
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