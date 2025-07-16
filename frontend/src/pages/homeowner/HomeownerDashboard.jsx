import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  DollarSign,
  BarChart3,
  LogOut
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { serviceCategories } from '../../data/mockData';
import apiService from '../../services/api';
import NotificationBadge from '../../components/NotificationBadge';

const HomeownerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState({
    orders: 0,
    messages: 0,
    total: 0
  });
  const [messageThreads, setMessageThreads] = useState([]);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
    reason: ''
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [activeOrdersTab, setActiveOrdersTab] = useState('all');

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError('');
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        setOrders([]);
        return;
      }

      const ordersData = await apiService.getOrders();
      
      // Filter orders for this homeowner
      const userOrders = ordersData.filter(order => 
        order.homeowner_id === user.id || order.homeowner_email === user.email
      );
      
      setOrders(userOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrdersError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await apiService.updateOrderStatus(orderId, 'accepted');
      await loadOrders(); // Reload orders
      await updateNotifications(); // Update notification counts
    } catch (error) {
      console.error('Failed to accept order:', error);
      alert('Failed to accept order. Please try again.');
    }
  };

  const handleDeclineOrder = async (orderId) => {
    try {
      await apiService.updateOrderStatus(orderId, 'declined');
      await loadOrders(); // Reload orders
      await updateNotifications(); // Update notification counts
    } catch (error) {
      console.error('Failed to decline order:', error);
      alert('Failed to decline order. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setActiveTab('home');
    navigate('/homeowners');
  };

  const loadMessageThreads = async () => {
    try {
      const threads = await apiService.getMessageThreads();
      setMessageThreads(threads);
    } catch (error) {
      console.error('Failed to load message threads:', error);
      setMessageThreads([]);
    }
  };

  const loadConversationMessages = async (threadId) => {
    try {
      const messages = await apiService.getMessages(threadId);
      setConversationMessages(messages);
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
      setConversationMessages([]);
    }
  };

  const updateNotifications = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) return;

      // Get unread orders count (quoted orders waiting for homeowner response)
      const orders = await apiService.getOrders();
      const quotedOrders = orders.filter(order => 
        order.status === 'quoted' && order.homeowner_id === user.id
      ).length;

      // Get unread messages count
      const messageThreads = await apiService.getMessageThreads();
      const unreadMessages = messageThreads.reduce((count, thread) => 
        count + (thread.unread_count || 0), 0
      );

      const newNotifications = {
        orders: quotedOrders,
        messages: unreadMessages,
        total: quotedOrders + unreadMessages
      };

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Failed to update notifications:', error);
    }
  };

  const sendMessage = async (messageContent) => {
    if (!messageContent.trim() || !selectedConversation) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const newMessage = {
        thread_id: selectedConversation.id,
        sender_id: user.id,
        sender_type: 'homeowner',
        content: messageContent,
        timestamp: new Date().toISOString()
      };

      await apiService.sendMessage(newMessage);
      
      // Reload conversation messages
      await loadConversationMessages(selectedConversation.id);
      setNewMessage('');
      
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleReschedule = async () => {
    if (!selectedConversation || !rescheduleData.date || !rescheduleData.time) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const rescheduleMessage = {
        thread_id: selectedConversation.id,
        sender_id: user.id,
        sender_type: 'homeowner',
        content: `🗓️ Reschedule Request:\n\nNew Date: ${rescheduleData.date}\nNew Time: ${rescheduleData.time}\n${rescheduleData.reason ? `Reason: ${rescheduleData.reason}` : ''}\n\nPlease confirm if this new schedule works for you.`,
        timestamp: new Date().toISOString()
      };

      await apiService.sendMessage(rescheduleMessage);
      
      // Reload conversation messages
      await loadConversationMessages(selectedConversation.id);
      
      setShowRescheduleForm(false);
      setRescheduleData({
        date: '',
        time: '',
        reason: ''
      });
      
    } catch (error) {
      console.error('Failed to send reschedule request:', error);
      alert('Failed to send reschedule request. Please try again.');
    }
  };

  const handleViewOrderDetails = () => {
    setActiveTab('orders');
  };

  // Notification functions
  const loadNotifications = () => {
    // Always start with empty notifications for new/fresh users
    setNotifications({
      orders: 0,
      messages: 0,
      total: 0
    });
    
    // Clear any existing mock data
    localStorage.removeItem('homeowner_notifications');
  };

  const markNotificationAsRead = (notificationId) => {
    // Updated to work with new notification system
    updateNotifications();
  };

  const markAllAsRead = () => {
    // Updated to work with new notification system
    updateNotifications();
  };

  const createNotification = (type, title, message, data = {}) => {
    // This is now handled by the updateNotifications function
    // No need for manual notification creation
    updateNotifications();
  };

  // Check for new data and create notifications
  const checkForNewNotifications = () => {
    // This is now handled by the updateNotifications function
    updateNotifications();
  };

  useEffect(() => {
    // Check if user is logged in - improved check
    const user = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');
    const authToken = localStorage.getItem('authToken');
    const hasValidAuth = user && authToken && userType === 'homeowner';
    setIsLoggedIn(hasValidAuth);
    
    // Check for mobile view
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Load notifications and messages if authenticated
    if (hasValidAuth) {
      loadNotifications();
      loadMessageThreads();
      loadOrders();
      updateNotifications();
      
      // Set up interval to update notifications every 30 seconds
      const interval = setInterval(updateNotifications, 30000);
      
      // Cleanup interval on unmount
      return () => {
        clearInterval(interval);
        window.removeEventListener('resize', checkMobile);
      };
    }
    
    // Handle provider context from "Get best deals" button
    const urlParams = new URLSearchParams(window.location.search);
    const urlTab = urlParams.get('tab');
    if (urlTab === 'messages') {
      setActiveTab('messages');
      
      // Handle provider ID and thread ID from state or URL
      const providerId = location.state?.providerId;
      const threadId = location.state?.threadId;
      const providerName = location.state?.providerName;
      const action = location.state?.action;
      
      if (hasValidAuth && (providerId || threadId)) {
        const initializeConversation = async () => {
          try {
            // Load message threads first
            await loadMessageThreads();
            
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const threads = await apiService.getMessageThreads();
            
            // If threadId is provided, find and select that specific thread
            if (threadId) {
              const specificThread = threads.find(thread => thread.id === threadId);
              if (specificThread) {
                setSelectedConversation(specificThread);
                await loadConversationMessages(specificThread.id);
                
                // If this is a new conversation, show it immediately
                if (action === 'newConversation') {
                  setShowMobileChat(true);
                }
                return;
              }
            }
            
            // Find existing thread with this provider
            const existingThread = threads.find(thread => 
              thread.provider_id === providerId && thread.homeowner_id === user.id
            );
            
            if (existingThread) {
              setSelectedConversation(existingThread);
              await loadConversationMessages(existingThread.id);
              setShowMobileChat(true);
            } else if (providerId) {
              // Create a new thread if none exists
              const providers = await apiService.getAllProviders();
              const provider = providers.find(p => p.id === providerId);
              
              if (provider) {
                const threadData = {
                  homeowner_id: user.id,
                  provider_id: providerId,
                  homeowner_name: user.name,
                  provider_name: provider.business_name || provider.name,
                  service_type: 'General Inquiry',
                  last_message: 'Conversation started',
                  last_message_time: new Date().toISOString()
                };
                
                const newThread = await apiService.createMessageThread(threadData);
                setSelectedConversation(newThread);
                await loadConversationMessages(newThread.id);
                setShowMobileChat(true);
                
                // Reload message threads to update the list
                await loadMessageThreads();
              }
            }
          } catch (error) {
            console.error('Failed to initialize conversation:', error);
          }
        };
        
        initializeConversation();
      }
    }
    
    // Handle back button behavior for logged in users
    if (hasValidAuth) {
      const handlePopState = (event) => {
        // If user is logged in and tries to navigate back to landing, redirect to home tab
        if (window.location.pathname === '/homeowners' || window.location.pathname === '/') {
          event.preventDefault();
          setActiveTab('home');
          window.history.pushState(null, '', '/homeowners/dashboard');
        }
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
    
    // Handle URL parameters for tab switching
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Check for tab parameter in URL
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location]);

  const handleAuthenticatedAction = (action) => {
    if (!isLoggedIn) {
      navigate('/homeowners/auth');
    } else {
      action();
    }
  };

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: Home, active: true },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, active: false, badge: notifications.orders },
    { id: 'book-service', label: 'Book service', icon: Calendar, active: false },
    { id: 'messages', label: 'Messages', icon: MessageCircle, active: false, badge: notifications.messages },
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
    // Navigate to browse page with service filter
    const service = mostBookedServices[serviceId];
    if (service) {
      navigate(`/homeowners/browse?service=${encodeURIComponent(service.name)}`);
    } else {
      navigate('/homeowners/browse');
    }
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
                    className={`w-full justify-start h-12 relative ${
                      activeTab === item.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <NotificationBadge count={item.badge} />
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
          
          {/* Logout Button - Only show when logged in */}
          {isLoggedIn && (
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
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">Doord</h1>
                <span className="ml-2 text-gray-500">Explore</span>
              </div>

              {/* Right side - Desktop auth buttons */}
              <div className="hidden md:flex items-center space-x-4">
                {!isLoggedIn ? (
                  // Not logged in - show auth buttons
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/homeowners/auth')}
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => navigate('/homeowners/auth')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Sign Up
                    </Button>
                  </div>
                ) : (
                  // Logged in - show user menu
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('settings')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotifications(!showNotifications)}
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                        {notifications.total > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                            {notifications.total > 99 ? '99+' : notifications.total}
                          </span>
                        )}
                      </Button>
                      
                      {/* Notifications Dropdown */}
                      {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">Notifications</h3>
                              {notifications.total > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={markAllAsRead}
                                  className="text-blue-600"
                                >
                                  Mark all read
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.total === 0 ? (
                              <div className="p-6 text-center text-gray-500">
                                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>You don't have any new notifications</p>
                              </div>
                            ) : (
                              <div className="p-6 text-center text-gray-500">
                                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>You have {notifications.total} unread notification{notifications.total !== 1 ? 's' : ''}</p>
                                <p className="text-sm mt-2">
                                  {notifications.orders > 0 && `${notifications.orders} order update${notifications.orders !== 1 ? 's' : ''}`}
                                  {notifications.orders > 0 && notifications.messages > 0 && ', '}
                                  {notifications.messages > 0 && `${notifications.messages} message${notifications.messages !== 1 ? 's' : ''}`}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log Out
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile hamburger menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            
            {/* Sidebar */}
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <h2 className="text-xl font-bold text-blue-600">Doord</h2>
                    <span className="ml-2 text-gray-500">Explore</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto p-4">
                  <nav className="space-y-2">
                    {sidebarItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.id}
                          variant={activeTab === item.id ? "default" : "ghost"}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full justify-start h-12 relative ${
                            activeTab === item.id 
                              ? 'bg-blue-600 text-white' 
                              : 'text-gray-700 hover:bg-blue-50'
                          }`}
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          {item.label}
                          {item.badge && item.badge > 0 && (
                            <NotificationBadge count={item.badge} />
                          )}
                        </Button>
                      );
                    })}
                  </nav>
                </div>

                {/* Bottom Section - Auth/User Options */}
                <div className="border-t border-gray-200 p-4">
                  {!isLoggedIn ? (
                    // Not logged in - show auth buttons
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate('/homeowners/auth');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full"
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => {
                          navigate('/homeowners/auth');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Sign Up
                      </Button>
                    </div>
                  ) : (
                    // Logged in - show user options
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setActiveTab('settings');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowNotifications(!showNotifications);
                          setIsMobileMenuOpen(false); // Close sidebar when opening notifications
                        }}
                        className="w-full justify-start relative"
                      >
                        <Bell className="h-4 w-4 mr-3" />
                        Notifications
                        {notifications.total > 0 && (
                          <span className="absolute right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {notifications.total}
                          </span>
                        )}
                      </Button>
                      <hr className="my-3" />
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Log Out
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Notifications Overlay */}
        {showNotifications && isLoggedIn && (
          <div className="fixed inset-0 z-[9999] md:hidden">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowNotifications(false)}
            ></div>
            <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl">
              <div className="flex flex-col h-full bg-white">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto bg-white">
                  {notifications.total === 0 ? (
                    <div className="p-6 text-center text-gray-500 bg-white h-full flex flex-col justify-center">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>You don't have any new notifications</p>
                    </div>
                  ) : (
                    <div className="bg-white">
                      <div className="p-6 text-center text-gray-500 bg-white">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>You have {notifications.total} unread notification{notifications.total !== 1 ? 's' : ''}</p>
                        <p className="text-sm mt-2">
                          {notifications.orders > 0 && `${notifications.orders} order update${notifications.orders !== 1 ? 's' : ''}`}
                          {notifications.orders > 0 && notifications.messages > 0 && ', '}
                          {notifications.messages > 0 && `${notifications.messages} message${notifications.messages !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
              
              {/* Loading State */}
              {ordersLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading orders...</p>
                </div>
              )}
              
              {/* Error State */}
              {ordersError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600">{ordersError}</p>
                  <Button variant="outline" onClick={loadOrders} className="mt-2">
                    Try Again
                  </Button>
                </div>
              )}
              
              {/* Orders Overview */}
              {!ordersLoading && !ordersError && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${activeOrdersTab === 'active' ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}
                    onClick={() => setActiveOrdersTab('active')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Orders</p>
                          <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'accepted' || o.status === 'in_progress').length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${activeOrdersTab === 'completed' ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}
                    onClick={() => setActiveOrdersTab('completed')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Completed</p>
                          <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'completed').length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${activeOrdersTab === 'quotes' ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}
                    onClick={() => setActiveOrdersTab('quotes')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Quotes</p>
                          <p className="text-2xl font-bold text-gray-900">{orders.filter(q => q.status === 'quoted').length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Order List */}
              {!ordersLoading && !ordersError && (
                <div className="space-y-6">
                  {(() => {
                    let filteredOrders = orders;
                    
                    // Filter orders based on active tab
                    switch (activeOrdersTab) {
                      case 'active':
                        filteredOrders = orders.filter(o => o.status === 'accepted' || o.status === 'in_progress');
                        break;
                      case 'completed':
                        filteredOrders = orders.filter(o => o.status === 'completed');
                        break;
                      case 'quotes':
                        filteredOrders = orders.filter(o => o.status === 'quoted');
                        break;
                      default:
                        filteredOrders = orders;
                    }
                    
                    if (filteredOrders.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <p className="text-gray-500 text-lg">
                            {activeOrdersTab === 'active' ? 'No active orders.' :
                             activeOrdersTab === 'completed' ? 'No completed orders.' :
                             activeOrdersTab === 'quotes' ? 'No quotes yet.' :
                             'No orders yet.'}
                          </p>
                          {activeOrdersTab === 'quotes' && (
                            <Button 
                              onClick={() => navigate('/homeowners/browse')}
                              className="mt-4"
                            >
                              Browse Services
                            </Button>
                          )}
                        </div>
                      );
                    }
                    
                    return filteredOrders.map(order => (
                      <Card key={order.id} className="border-l-4 border-l-blue-500">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{order.service_type}</CardTitle>
                              <p className="text-sm text-gray-600">{order.provider_name}</p>
                              <p className="text-xs text-gray-500">Order #{order.id} - {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {order.quotation_amount ? `$${order.quotation_amount}` : 'Pending Quote'}
                              </div>
                              <Badge className={`mt-2 ${
                                order.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                order.status === 'declined' ? 'bg-red-100 text-red-800' :
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status === 'quoted' ? 'Quote Received' :
                                 order.status === 'accepted' ? 'Accepted' :
                                 order.status === 'declined' ? 'Declined' :
                                 order.status === 'completed' ? 'Completed' :
                                 'Pending Quote'}
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span>{order.homeowner_address || 'Address not provided'}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>{order.preferred_date ? new Date(order.preferred_date).toLocaleDateString() : 'Date TBD'}</span>
                              </div>
                            </div>
                            
                            {order.status === 'quoted' && (
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handleAcceptOrder(order.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Accept Quote
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => handleDeclineOrder(order.id)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  Decline Quote
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ));
                  })()}
                </div>
              )}
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
              
              {/* Mobile Chat View */}
              {showMobileChat && isMobileView && (
                <div className="fixed inset-0 bg-white z-50 flex flex-col">
                  {/* Chat Header */}
                  <div className="bg-blue-600 text-white p-4 flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowMobileChat(false)}
                      className="text-white mr-3"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {selectedConversation?.provider_name ? selectedConversation.provider_name.split(' ').map(n => n[0]).join('') : 'P'}
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedConversation?.provider_name}</h3>
                        <p className="text-xs text-blue-100">{selectedConversation?.service_type}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {conversationMessages && conversationMessages.length > 0 ? (
                      conversationMessages.map(message => (
                        <div key={message.id} className={`flex ${message.sender_type === 'homeowner' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-lg p-3 ${
                            message.sender_type === 'homeowner' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm break-words">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_type === 'homeowner' ? 'text-blue-200' : 'text-gray-500'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No messages yet. Start a conversation!</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t bg-white">
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Type your message..." 
                        className="flex-1"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            sendMessage(newMessage);
                          }
                        }}
                      />
                      <Button 
                        onClick={() => {
                          sendMessage(newMessage);
                        }}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Desktop/Tablet View */}
              {(!isMobileView || !showMobileChat) && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Conversation List */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle>Conversations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {messageThreads.map(thread => (
                          <div 
                            key={thread.id}
                            className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedConversation?.id === thread.id ? 'border-blue-500 bg-blue-50' : ''
                            }`}
                            onClick={() => {
                              setSelectedConversation(thread);
                              loadConversationMessages(thread.id);
                              if (isMobileView) {
                                setShowMobileChat(true);
                              }
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {thread.provider_name ? thread.provider_name.split(' ').map(n => n[0]).join('') : 'P'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">{thread.provider_name}</h4>
                                <p className="text-xs text-gray-600 truncate">{thread.service_type}</p>
                                <p className="text-xs text-gray-400">
                                  Order #{thread.order_id}
                                </p>
                                {thread.last_message && (
                                  <p className="text-xs text-gray-500 truncate mt-1">
                                    {thread.last_message}
                                  </p>
                                )}
                              </div>
                              {thread.unread_count && thread.unread_count > 0 && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))}
                        {messageThreads.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No conversations yet</p>
                          </div>
                        )}
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
                            {selectedConversation.provider_name ? selectedConversation.provider_name.split(' ').map(n => n[0]).join('') : 'P'}
                          </div>
                          <div>
                            <span>{selectedConversation.provider_name}</span>
                            <p className="text-sm font-normal text-gray-600">{selectedConversation.service_type} - Order #{selectedConversation.order_id}</p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col h-full">
                        <div className="flex-1 space-y-3 mb-4 overflow-y-auto px-2">
                          {conversationMessages && conversationMessages.length > 0 ? (
                            conversationMessages.map(message => (
                              <div key={message.id} className={`flex ${message.sender_type === 'homeowner' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-lg p-3 ${
                                  message.sender_type === 'homeowner' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                  <p className="text-sm break-words">{message.content}</p>
                                  <p className={`text-xs mt-1 ${
                                    message.sender_type === 'homeowner' ? 'text-blue-200' : 'text-gray-500'
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
                                sendMessage(newMessage);
                              }
                            }}
                          />
                          <Button 
                            onClick={() => {
                              sendMessage(newMessage);
                            }}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowRescheduleForm(true)}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Reschedule
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleViewOrderDetails}
                          >
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
              )}
              
              {/* Reschedule Form Modal */}
              {showRescheduleForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <Card className="w-full max-w-md bg-white">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Reschedule Service</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowRescheduleForm(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="reschedule-date">New Date</Label>
                        <Input
                          id="reschedule-date"
                          type="date"
                          value={rescheduleData.date}
                          onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="reschedule-time">New Time</Label>
                        <Input
                          id="reschedule-time"
                          type="time"
                          value={rescheduleData.time}
                          onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="reschedule-reason">Reason (Optional)</Label>
                        <Textarea
                          id="reschedule-reason"
                          placeholder="Please explain why you need to reschedule..."
                          value={rescheduleData.reason}
                          onChange={(e) => setRescheduleData({...rescheduleData, reason: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowRescheduleForm(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleReschedule}
                          className="flex-1"
                        >
                          Send Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
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
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h4 className="font-semibold text-gray-600 mb-2">No Reports Yet</h4>
                      <p className="text-sm text-gray-500">
                        You haven't submitted any reports or issues yet.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Account Settings</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <Input defaultValue="John Smith" placeholder="Enter your full name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <Input defaultValue="john.smith@example.com" type="email" placeholder="your.email@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <Input defaultValue="+1 (555) 123-4567" placeholder="+1 (555) 123-4567" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date of Birth</label>
                      <Input type="date" />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Update Personal Info
                    </Button>
                  </CardContent>
                </Card>

                {/* Property Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Property Address *</label>
                      <Input defaultValue="123 Main Street, Halifax, NS B3H 1A1" placeholder="Enter your address" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Property Type *</label>
                      <select className="w-full p-2 border rounded-lg bg-white">
                        <option value="">Select property type</option>
                        <option value="apartment">Apartment</option>
                        <option value="condo">Condominium</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="house">Single Family House</option>
                        <option value="duplex">Duplex</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">House Size (sq ft) *</label>
                      <select className="w-full p-2 border rounded-lg bg-white">
                        <option value="">Select house size</option>
                        <option value="under-1000">Under 1,000 sq ft</option>
                        <option value="1000-1500">1,000 - 1,500 sq ft</option>
                        <option value="1500-2000">1,500 - 2,000 sq ft</option>
                        <option value="2000-2500">2,000 - 2,500 sq ft</option>
                        <option value="2500-3000">2,500 - 3,000 sq ft</option>
                        <option value="3000-4000">3,000 - 4,000 sq ft</option>
                        <option value="over-4000">Over 4,000 sq ft</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Number of Bedrooms</label>
                      <select className="w-full p-2 border rounded-lg bg-white">
                        <option value="">Select bedrooms</option>
                        <option value="1">1 Bedroom</option>
                        <option value="2">2 Bedrooms</option>
                        <option value="3">3 Bedrooms</option>
                        <option value="4">4 Bedrooms</option>
                        <option value="5">5+ Bedrooms</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Number of Bathrooms</label>
                      <select className="w-full p-2 border rounded-lg bg-white">
                        <option value="">Select bathrooms</option>
                        <option value="1">1 Bathroom</option>
                        <option value="1.5">1.5 Bathrooms</option>
                        <option value="2">2 Bathrooms</option>
                        <option value="2.5">2.5 Bathrooms</option>
                        <option value="3">3 Bathrooms</option>
                        <option value="3.5">3.5 Bathrooms</option>
                        <option value="4">4+ Bathrooms</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Year Built</label>
                      <Input type="number" placeholder="e.g., 1995" min="1800" max="2024" />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Update Property Info
                    </Button>
                  </CardContent>
                </Card>

                {/* Service Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Service Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Budget Range</label>
                      <select className="w-full p-2 border rounded-lg bg-white">
                        <option value="">Select budget range</option>
                        <option value="under-100">Under $100</option>
                        <option value="100-250">$100 - $250</option>
                        <option value="250-500">$250 - $500</option>
                        <option value="500-1000">$500 - $1,000</option>
                        <option value="1000-2000">$1,000 - $2,000</option>
                        <option value="over-2000">Over $2,000</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Service Times</label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="weekdays" className="rounded" />
                          <label htmlFor="weekdays" className="text-sm">Weekdays (Mon-Fri)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="weekends" className="rounded" />
                          <label htmlFor="weekends" className="text-sm">Weekends (Sat-Sun)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="mornings" className="rounded" />
                          <label htmlFor="mornings" className="text-sm">Mornings (8AM-12PM)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="afternoons" className="rounded" />
                          <label htmlFor="afternoons" className="text-sm">Afternoons (12PM-5PM)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="evenings" className="rounded" />
                          <label htmlFor="evenings" className="text-sm">Evenings (5PM-8PM)</label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Special Requirements</label>
                      <textarea 
                        className="w-full p-2 border rounded-lg h-20" 
                        placeholder="Pet-friendly, eco-friendly products, specific allergies, etc."
                      ></textarea>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>

                {/* Security & Privacy */}
                <Card>
                  <CardHeader>
                    <CardTitle>Security & Privacy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Change Password</label>
                      <div className="space-y-3">
                        <Input type="password" placeholder="Current password" />
                        <Input type="password" placeholder="New password" />
                        <Input type="password" placeholder="Confirm new password" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Notification Preferences</label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Email notifications</span>
                          <input type="checkbox" className="rounded" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">SMS notifications</span>
                          <input type="checkbox" className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Marketing communications</span>
                          <input type="checkbox" className="rounded" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Emergency Contact</label>
                      <div className="space-y-3">
                        <Input placeholder="Emergency contact name" />
                        <Input placeholder="Emergency contact phone" />
                        <Input placeholder="Relationship" />
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Update Security Settings
                    </Button>
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