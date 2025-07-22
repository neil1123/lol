import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { 
  BarChart3, 
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowLeft,
  PieChart,
  FileText,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import NotificationBadge from '../../components/NotificationBadge';
import { STANDARD_PROVIDER_SIDEBAR, handleStandardLogout } from '../../constants/providerSidebarConfig';

const ProviderAnalytics = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState('weekly');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    confirmedSales: 0,
    pendingQuotations: 0,
    quotations: 0
  });

  // Mock notification state - in real app this would come from API/context
  const [notifications] = useState({
    totalUnreadMessages: 0,
    newOrders: 0,
    quotationRequests: 0
  });

  // User profile state - fetch from database
  const [userProfile, setUserProfile] = useState(null);
  const [userInitials, setUserInitials] = useState('U');

  const handleLogout = () => {
    handleStandardLogout(navigate);
  };

  const sidebarItems = STANDARD_PROVIDER_SIDEBAR;

  useEffect(() => {
    loadUserProfile();
    loadAnalyticsData();
  }, [timePeriod]);

  const loadUserProfile = async () => {
    try {
      const profile = await apiService.getUserProfile();
      setUserProfile(profile);
      
      // Set user initials from actual database data
      const initials = profile.name 
        ? profile.name.split(' ').map(name => name[0]).join('').toUpperCase() 
        : 'U';
      setUserInitials(initials);
      
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

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);

      // Calculate analytics from real order data
      const analytics = calculateAnalytics(ordersData);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (ordersData) => {
    const now = new Date();
    
    // Filter orders based on time period
    const filteredOrders = ordersData.filter(order => {
      const orderDate = new Date(order.created_at);
      const diffTime = Math.abs(now - orderDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (timePeriod) {
        case 'daily':
          return diffDays <= 1;
        case 'weekly':
          return diffDays <= 7;
        case 'monthly':
          return diffDays <= 30;
        case 'yearly':
          return diffDays <= 365;
        default:
          return true;
      }
    });

    const totalRevenue = filteredOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (parseFloat(order.quotation_amount) || 0), 0);

    const confirmedSales = filteredOrders.filter(order => 
      ['accepted', 'in_progress', 'completed'].includes(order.status)
    ).length;

    const pendingQuotations = filteredOrders.filter(order => 
      order.status === 'pending_quotation'
    ).length;

    const quotations = filteredOrders.filter(order => 
      order.status === 'quoted'
    ).length;

    return {
      totalRevenue,
      confirmedSales,
      pendingQuotations,
      quotations
    };
  };

  const getChartData = () => {
    const statusColors = {
      'pending_quotation': '#fbbf24', // Yellow
      'quoted': '#3b82f6', // Blue
      'accepted': '#10b981', // Green
      'in_progress': '#8b5cf6', // Purple
      'completed': '#059669', // Dark green
    };

    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: statusColors[status] || '#6b7280',
      label: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));
  };

  const chartData = getChartData();
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

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
            
            {/* Desktop Right Side */}
            <div className="hidden xl:flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
                {notifications.totalUnreadMessages > 0 && (
                  <NotificationBadge count={notifications.totalUnreadMessages} className="ml-1" />
                )}
              </Button>
              <div className="flex items-center space-x-2">
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
                <span className="text-sm font-medium">{userProfile?.business_name || userProfile?.name || 'User'}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Right Side */}
            <div className="xl:hidden flex items-center space-x-2">
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
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveTab(item.id);
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
            </div>
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab(item.id);
                    navigate(item.path);
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

        {/* Main Content - Adjust width for desktop sidebar */}
        <div className="flex-1 xl:pl-0 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate('/homeservices/dashboard')}
                      className="mr-4"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Revenue Analytics</h2>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">Track your business performance and revenue insights</p>
                </div>

                {/* Time Period Selector */}
                <div className="flex flex-wrap gap-2">
                  {['daily', 'weekly', 'monthly', 'yearly'].map(period => (
                    <Button
                      key={period}
                      variant={timePeriod === period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimePeriod(period)}
                      className="capitalize text-xs sm:text-sm"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading analytics...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                          <p className="text-2xl font-bold text-gray-900">${analyticsData.totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Confirmed Sales</p>
                          <p className="text-2xl font-bold text-green-600">{analyticsData.confirmedSales}</p>
                        </div>
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pending Quotations</p>
                          <p className="text-2xl font-bold text-yellow-600">{analyticsData.pendingQuotations}</p>
                        </div>
                        <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-yellow-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Quotations</p>
                          <p className="text-2xl font-bold text-blue-600">{analyticsData.quotations}</p>
                        </div>
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Order Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChart className="h-5 w-5 mr-2" />
                        Order Status Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {chartData.length > 0 ? (
                        <div className="space-y-4">
                          {chartData.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                              <div 
                                className="w-4 h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                              <div className="flex-1 max-w-32">
                                <div className="bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full" 
                                    style={{ 
                                      backgroundColor: item.color,
                                      width: `${(item.count / maxCount) * 100}%` 
                                    }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-8 text-right">
                                {item.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No order data available</p>
                          <p className="text-sm">Create orders to see analytics</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Orders Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Orders Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {orders.slice(0, 5).length > 0 ? (
                        <div className="space-y-4">
                          {orders.slice(0, 5).map((order) => (
                            <div key={order.id} className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Order #{order.id?.slice(-6)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.request_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge 
                                  variant={order.status === 'completed' ? 'default' : 'secondary'}
                                  className="mb-1"
                                >
                                  {order.status.replace('_', ' ')}
                                </Badge>
                                {order.quotation_amount && (
                                  <p className="text-sm font-medium text-gray-900">
                                    ${parseFloat(order.quotation_amount).toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No recent orders</p>
                          <p className="text-sm">Create orders to see summary</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderAnalytics;