import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  Calendar, 
  Users, 
  DollarSign, 
  Star, 
  CheckCircle, 
  Menu, 
  X,
  Clock,
  Shield,
  Zap,
  CreditCard,
  MessageCircle,
  TrendingUp,
  Award,
  Globe,
  PlayCircle,
  MapPin
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const ServiceProviderLanding = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    province: '',
    city: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    navigate('/homeservices/auth');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Doord.</h1>
              <span className="ml-2 text-sm text-gray-600">for Service Providers</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/homeowners')}
                className="text-sm"
              >
                For Homeowners
              </Button>
              <Button variant="outline" onClick={() => navigate('/homeservices/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/homeservices/auth')}>
                Get Started
              </Button>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t bg-white py-4">
              <div className="flex flex-col space-y-3">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/homeowners');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  For Homeowners
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigate('/homeservices/auth');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => {
                    navigate('/homeservices/auth');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Dashboard */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Unlock a new{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  revenue stream
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Build your service business with Doord's marketplace platform. Connect with customers, 
                streamline operations, and unlock new revenue streams with our comprehensive suite of tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/homeservices/auth')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Right Dashboard Screenshot */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">ES</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Elite Solutions</h3>
                      <p className="text-sm text-gray-600">Provider Dashboard</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                    <div className="text-xs text-green-600">+12% from last month</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$24,500</div>
                    <div className="text-sm text-gray-600">Total Sales</div>
                    <div className="text-xs text-green-600">+8% from last month</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">96%</div>
                    <div className="text-sm text-gray-600">Conversion</div>
                    <div className="text-xs text-green-600">+2% from last month</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">30</div>
                    <div className="text-sm text-gray-600">Customers</div>
                    <div className="text-xs text-green-600">+15% from last month</div>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Weekly Performance</h4>
                  <div className="flex items-end space-x-2 h-20">
                    <div className="w-8 bg-blue-200 rounded-t" style={{height: '60%'}}></div>
                    <div className="w-8 bg-blue-300 rounded-t" style={{height: '40%'}}></div>
                    <div className="w-8 bg-blue-400 rounded-t" style={{height: '80%'}}></div>
                    <div className="w-8 bg-blue-500 rounded-t" style={{height: '70%'}}></div>
                    <div className="w-8 bg-blue-600 rounded-t" style={{height: '90%'}}></div>
                    <div className="w-8 bg-blue-500 rounded-t" style={{height: '65%'}}></div>
                    <div className="w-8 bg-blue-400 rounded-t" style={{height: '75%'}}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                    <span>Sun</span>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-600">New quote request from Sarah Johnson</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-gray-600">Payment received for Job #1234</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <DollarSign className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Elevate your business with powerful tools
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to grow your service business, from customer acquisition to payment processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Marketplace Access</h3>
                <p className="text-gray-600">
                  Connect with thousands of customers actively looking for your services. 
                  Get discovered and grow your customer base effortlessly.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Smart Scheduling</h3>
                <p className="text-gray-600">
                  Automated booking system that syncs with your calendar. 
                  Let customers book appointments 24/7 while you focus on your work.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Secure Payments</h3>
                <p className="text-gray-600">
                  Get paid instantly with our secure payment processing. 
                  Multiple payment methods supported with transparent fee structure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Doord works for Home service companies?
            </h2>
            <p className="text-xl text-gray-600">
              A streamlined process designed to help you focus on what you do best while we handle the rest.
            </p>
          </div>

          <div className="space-y-16">
            {/* Step 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    1
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">Customers order</h3>
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  Communicate with the customer to understand their needs. Check details on chat.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Real-time customer communication
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Detailed service requirements
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">New Order</h4>
                  <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                </div>
                <h5 className="font-medium mb-2">House Cleaning Service</h5>
                <p className="text-sm text-gray-600">3-bedroom house, deep cleaning required</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    2
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">Understand Requirement & Provide Quotation</h3>
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  Analyze the requirements and send a detailed quotation. Include timelines, materials, and any additional costs.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Detailed cost breakdown
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Timeline estimation
                  </li>
                </ul>
              </div>
              <div className="lg:order-1 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Quotation</h4>
                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">$425</div>
                <div className="space-y-1 text-sm">
                  <div>Service: Deep Cleaning</div>
                  <div>Duration: 4 hours</div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    3
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">Order confirmation</h3>
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  Once the customer approves, proceed with confirming the order.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Instant confirmation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Schedule coordination
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Order Confirmed</h4>
                  <Badge className="bg-green-100 text-green-800">Approved</Badge>
                </div>
                <div className="text-lg font-medium">House Cleaning Service</div>
                <div className="text-sm text-gray-600">Scheduled for Dec 15, 2024</div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    4
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">Complete the Job</h3>
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  Start and complete the work as per the agreed terms. Keep the customer updated on progress.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Progress tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Quality assurance
                  </li>
                </ul>
              </div>
              <div className="lg:order-1 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Job Status</h4>
                  <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                </div>
                <div className="text-lg font-medium mb-2">House Cleaning</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
                <div className="text-sm text-gray-600">75% Complete</div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    5
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">Job Done & Final Payment</h3>
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  Complete the job to receive payment. Mark the job as complete for payment.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Instant payment processing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Customer satisfaction rating
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Payment Complete</h4>
                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">$425</div>
                <div className="text-sm text-gray-600">Paid Instantly</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Registration Form */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              BECOME OUR PARTNER
            </h2>
            <p className="text-xl text-blue-100">
              Join Hands, Unlock Opportunities
            </p>
          </div>

          <Card className="bg-white">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="province" className="text-sm font-medium text-gray-700">
                    Province
                  </Label>
                  <select
                    id="province"
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Province</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="ON">Ontario</option>
                    <option value="QC">Quebec</option>
                    <option value="BC">British Columbia</option>
                    <option value="AB">Alberta</option>
                    <option value="MB">Manitoba</option>
                    <option value="SK">Saskatchewan</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    City
                  </Label>
                  <select
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select City</option>
                    <option value="Halifax">Halifax</option>
                    <option value="Toronto">Toronto</option>
                    <option value="Vancouver">Vancouver</option>
                    <option value="Montreal">Montreal</option>
                    <option value="Calgary">Calgary</option>
                    <option value="Ottawa">Ottawa</option>
                    <option value="Edmonton">Edmonton</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Button 
                    type="submit"
                    size="lg" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to grow your business?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Join thousands of service providers who have transformed their businesses with Doord. 
            Start connecting with more customers and increase your revenue today.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Free to get started</h3>
              <p className="text-gray-600">No upfront costs or monthly fees</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant customer access</h3>
              <p className="text-gray-600">Connect with ready-to-book customers</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Complete business tools</h3>
              <p className="text-gray-600">Everything you need in one platform</p>
            </div>
          </div>

          <Button 
            size="lg"
            onClick={() => navigate('/homeservices/auth')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
          <p className="text-gray-500 mt-4">No credit card required • Free for up to 10 bookings</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Doord.</h3>
              <p className="text-gray-300 mb-6">
                The ultimate marketplace platform for home service providers. 
                Connect, grow, and succeed with Doord.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  About Us
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  Contact
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Providers</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Get Started</a></li>
                <li><a href="#" className="hover:text-white">Dashboard</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Doord. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServiceProviderLanding;