import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  Home,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  Plus,
  Bell,
  LogOut
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { mockDashboardData, mockCalendarEvents } from '../../data/mockData';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = () => {
    // Clear any stored auth tokens/data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    // Redirect to provider landing page
    navigate('/homeservices');
  };

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: Home, path: '/homeservices/dashboard' },
    { id: 'orders', label: 'Orders', icon: MessageSquare, path: '/homeservices/orders' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/homeservices/messages' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/homeservices/calendar' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/homeservices/customers' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/homeservices/settings' }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'new_order',
      message: 'New order request from Sarah Johnson',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'order_confirmed',
      message: 'Order confirmed with Mike Wilson',
      time: '4 hours ago',
      status: 'confirmed'
    },
    {
      id: 3,
      type: 'review',
      message: 'New 5-star review from Emily Davis',
      time: '1 day ago',
      status: 'new'
    },
    {
      id: 4,
      type: 'payment',
      message: 'Payment received for Order #1234',
      time: '2 days ago',
      status: 'completed'
    }
  ];

  const upcomingAppointments = mockCalendarEvents.slice(0, 3);

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
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab(item.id);
                    navigate(item.path);
                  }}
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, Elite Solutions!
            </h2>
            <p className="text-gray-600">
              Here's what's happening with your business today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{mockDashboardData.activeJobs}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-3xl font-bold text-gray-900">${mockDashboardData.totalSales}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{mockDashboardData.customerSatisfaction * 20}%</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+2% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-3xl font-bold text-gray-900">{mockDashboardData.recentCustomers.length * 10}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15% from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Recent Activity */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Weekly Performance Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Weekly Performance</span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Orders</span>
                    <span className="text-sm font-medium text-gray-600">Revenue</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {mockDashboardData.weeklyData.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex space-x-1 items-end h-48">
                          {/* Orders Bar */}
                          <div
                            className="w-1/2 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm min-h-[8px]"
                            style={{ height: `${Math.max(8, (day.orders / 25) * 180)}px` }}
                            title={`Orders: ${day.orders}`}
                          ></div>
                          {/* Revenue Bar */}
                          <div
                            className="w-1/2 bg-gradient-to-t from-green-500 to-green-400 rounded-t-sm min-h-[8px]"
                            style={{ height: `${Math.max(8, (day.revenue / 3500) * 180)}px` }}
                            title={`Revenue: $${day.revenue}`}
                          ></div>
                        </div>
                        <div className="mt-2 text-center">
                          <div className="text-xs font-medium text-gray-900">{day.orders} orders</div>
                          <div className="text-xs text-gray-600">{day.day}</div>
                          <div className="text-xs text-green-600">${day.revenue}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Sales Curve Line */}
                  <svg className="absolute top-0 left-0 w-full h-64 pointer-events-none" style={{ zIndex: 10 }}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#f87171', stopOpacity: 0.8 }} />
                      </linearGradient>
                    </defs>
                    <path
                      d={`M ${20} ${248 - (mockDashboardData.weeklyData[0].revenue / 3500) * 180} 
                          Q ${mockDashboardData.weeklyData.length > 1 ? 90 : 20} ${248 - (mockDashboardData.weeklyData[1]?.revenue || mockDashboardData.weeklyData[0].revenue) / 3500 * 180} 
                          ${160} ${248 - (mockDashboardData.weeklyData[2]?.revenue || mockDashboardData.weeklyData[0].revenue) / 3500 * 180}
                          Q ${230} ${248 - (mockDashboardData.weeklyData[3]?.revenue || mockDashboardData.weeklyData[0].revenue) / 3500 * 180}
                          ${300} ${248 - (mockDashboardData.weeklyData[4]?.revenue || mockDashboardData.weeklyData[0].revenue) / 3500 * 180}
                          Q ${370} ${248 - (mockDashboardData.weeklyData[5]?.revenue || mockDashboardData.weeklyData[0].revenue) / 3500 * 180}
                          ${440} ${248 - (mockDashboardData.weeklyData[6]?.revenue || mockDashboardData.weeklyData[0].revenue) / 3500 * 180}`}
                      stroke="url(#salesGradient)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Data points */}
                    {mockDashboardData.weeklyData.map((day, index) => (
                      <circle
                        key={index}
                        cx={20 + (index * 70)}
                        cy={248 - (day.revenue / 3500) * 180}
                        r="4"
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                </div>
                <div className="mt-4 flex justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-600">Orders</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-600">Revenue</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-sm text-gray-600">Sales Trend</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Appointments and Quick Actions */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Upcoming Appointments</span>
                  <Button variant="outline" size="sm" onClick={() => navigate('/homeservices/calendar')}>
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{appointment.title}</h4>
                        <p className="text-sm text-gray-600">{appointment.customer}</p>
                        <p className="text-xs text-gray-500">{appointment.date} at {appointment.time}</p>
                      </div>
                      <Badge className={
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => navigate('/homeservices/orders')}
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">New Order</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => navigate('/homeservices/messages')}
                  >
                    <MessageSquare className="h-6 w-6" />
                    <span className="text-sm">Messages</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => navigate('/homeservices/customers')}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Add Customer</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Star className="h-6 w-6" />
                    <span className="text-sm">View Reviews</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;