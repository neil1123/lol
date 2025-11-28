import React, { useState, useEffect } from 'react';
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
  MapPin,
  Home,
  ShoppingCart
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const ServiceProviderLanding = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const howItWorksSection = document.getElementById('how-it-works');
      if (howItWorksSection) {
        const rect = howItWorksSection.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        // Calculate scroll progress through the section
        const scrolled = Math.max(0, windowHeight - sectionTop);
        const progress = Math.min(1, scrolled / (sectionHeight + windowHeight));
        
        setScrollProgress(progress);
        
        // Update glowing orb position
        const timelineOrb = document.getElementById('timeline-orb');
        if (timelineOrb) {
          const orbPosition = progress * 100;
          timelineOrb.style.top = `${orbPosition}%`;
          timelineOrb.style.boxShadow = `0 0 ${20 + progress * 30}px rgba(59, 130, 246, ${0.3 + progress * 0.7})`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Cal.com Island Style */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center h-14 px-6">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Doord.</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/homeowners')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                For Homeowners
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/property-manager')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                For Property Managers
              </Button>
              <Button 
                onClick={() => window.open('https://cal.com/neil-edward/30min', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Book Demo
              </Button>
              <Button variant="outline" onClick={() => navigate('/homeservices/auth?mode=signin')} className="text-sm">
                Sign In
              </Button>
              <Button onClick={() => navigate('/homeservices/auth?mode=signup')} className="text-sm">
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
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur-md rounded-b-2xl">
              <div className="p-4 space-y-3">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/homeowners');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start w-full text-sm"
                >
                  For Homeowners
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/property-manager');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start w-full text-sm"
                >
                  For Property Managers
                </Button>
                <Button 
                  onClick={() => {
                    window.open('https://cal.com/neil-edward/30min', '_blank');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold mb-2 text-sm"
                >
                  Book Demo
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigate('/homeservices/auth?mode=signin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start w-full text-sm"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => {
                    navigate('/homeservices/auth?mode=signup');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start w-full text-sm"
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Cal.com Style */}
      <section className="relative overflow-hidden bg-white pt-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:6rem_4rem]" />
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Main Headline - Cal.com Style */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              Grow your
              <br />
              <span className="text-blue-600">service business</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              Join Doord's marketplace and connect with customers looking for your services. 
              Streamline your bookings and grow your revenue.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button 
                size="lg"
                onClick={() => window.open('https://cal.com/neil-edward/30min', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Book Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/homeservices/auth?mode=signup')}
                className="border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-700 px-8 py-4 text-lg font-semibold rounded-xl"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Get Started Free
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <span style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>1000+ customers</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Instant payments</span>
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
      <section id="how-it-works" className="py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              How Doord works for Home service companies?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A streamlined process designed to help you focus on what you do best while we handle the rest.
            </p>
          </div>

          {/* Timeline with Center Line */}
          <div className="relative">
            {/* Center Line with Dynamic Glow */}
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-200 via-blue-500 to-blue-200 hidden lg:block"
              style={{
                filter: `drop-shadow(0 0 ${10 + scrollProgress * 20}px rgba(59, 130, 246, ${0.3 + scrollProgress * 0.4}))`
              }}
            ></div>
            
            {/* Glowing Orb */}
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 top-0 w-6 h-6 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse hidden lg:block transition-all duration-300" 
              id="timeline-orb"
              style={{
                filter: `drop-shadow(0 0 ${15 + scrollProgress * 25}px rgba(59, 130, 246, ${0.4 + scrollProgress * 0.6}))`
              }}
            ></div>

            <div className="space-y-32">
              {/* Step 1 */}
              <div className="relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="lg:pr-20">
                    <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105">
                      <div className="flex items-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-3xl flex items-center justify-center font-bold text-3xl mr-8 shadow-xl">
                          1
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900">Customers order</h3>
                      </div>
                      <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                        Communicate with the customer to understand their needs. Check details on chat and provide personalized service recommendations.
                      </p>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-6 w-6 mr-4" />
                          <span className="font-semibold text-lg">Real-time communication</span>
                        </div>
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-6 w-6 mr-4" />
                          <span className="font-semibold text-lg">Detailed requirements</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:pl-20">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-10 border border-blue-200 shadow-lg">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-2xl font-bold text-gray-900">New Order Received</h4>
                        <Badge className="bg-blue-600 text-white px-4 py-2 text-base">Active</Badge>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <h5 className="text-xl font-semibold text-gray-800">House Cleaning Service</h5>
                          <p className="text-gray-600 text-lg">3-bedroom house, deep cleaning required</p>
                        </div>
                        <div className="flex items-center space-x-6 text-base text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-5 w-5 mr-2" />
                            <span>Halifax, NS</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 mr-2" />
                            <span>Flexible timing</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Step Connector */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 w-10 h-10 bg-blue-500 rounded-full border-4 border-white shadow-xl hidden lg:block"></div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="lg:order-2 lg:pl-20">
                    <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105">
                      <div className="flex items-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-3xl flex items-center justify-center font-bold text-3xl mr-8 shadow-xl">
                          2
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900">Provide Quotation</h3>
                      </div>
                      <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                        Analyze requirements and send detailed quotation. Include timelines, materials, and any additional costs for complete transparency.
                      </p>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-6 w-6 mr-4" />
                          <span className="font-semibold text-lg">Detailed breakdown</span>
                        </div>
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-6 w-6 mr-4" />
                          <span className="font-semibold text-lg">Timeline estimation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:order-1 lg:pr-20">
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl p-10 border border-yellow-200 shadow-lg">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-2xl font-bold text-gray-900">Quotation Sent</h4>
                        <Badge className="bg-yellow-600 text-white px-4 py-2 text-base">Pending</Badge>
                      </div>
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-green-600 mb-3">$425</div>
                          <div className="text-gray-600 text-lg">Total Cost</div>
                        </div>
                        <div className="space-y-3 text-base text-gray-600">
                          <div className="flex justify-between">
                            <span>Service Duration:</span>
                            <span className="font-medium">4 hours</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Team Size:</span>
                            <span className="font-medium">2 cleaners</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Step Connector */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-xl hidden lg:block"></div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="lg:pr-20">
                    <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105">
                      <div className="flex items-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-3xl flex items-center justify-center font-bold text-3xl mr-8 shadow-xl">
                          3
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900">Order Confirmation</h3>
                      </div>
                      <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                        Once customer approves, proceed with confirming the order. Coordinate scheduling and prepare for service delivery.
                      </p>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-6 w-6 mr-4" />
                          <span className="font-semibold text-lg">Instant confirmation</span>
                        </div>
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-6 w-6 mr-4" />
                          <span className="font-semibold text-lg">Schedule coordination</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:pl-20">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-10 border border-green-200 shadow-lg">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-2xl font-bold text-gray-900">Order Confirmed</h4>
                        <Badge className="bg-green-600 text-white px-4 py-2 text-base">Approved</Badge>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <h5 className="text-xl font-semibold text-gray-800">House Cleaning Service</h5>
                          <p className="text-gray-600 text-lg">Scheduled for December 15, 2024</p>
                        </div>
                        <div className="flex items-center justify-between text-base">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium text-gray-800">10:00 AM - 2:00 PM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Step Connector */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 w-10 h-10 bg-purple-500 rounded-full border-4 border-white shadow-xl hidden lg:block"></div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="lg:order-2 lg:pl-20">
                    <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105">
                      <div className="flex items-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl flex items-center justify-center font-bold text-3xl mr-8 shadow-xl">
                          4
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900">Complete the Job</h3>
                      </div>
                      <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                        Start and complete work as per agreed terms. Keep customer updated on progress and ensure quality delivery.
                      </p>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-6 w-6 mr-4" />
                          <span className="font-semibold text-lg">Progress tracking</span>
                        </div>
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-6 w-6 mr-4" />
                          <span className="font-semibold text-lg">Quality assurance</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:order-1 lg:pr-20">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-10 border border-blue-200 shadow-lg">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-2xl font-bold text-gray-900">Job in Progress</h4>
                        <Badge className="bg-blue-600 text-white px-4 py-2 text-base">Active</Badge>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <h5 className="text-xl font-semibold text-gray-800">House Cleaning</h5>
                          <div className="w-full bg-gray-200 rounded-full h-4 mt-3">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-1000" style={{width: '75%'}}></div>
                          </div>
                          <p className="text-base text-gray-600 mt-2">75% Complete</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Step Connector */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 w-10 h-10 bg-orange-500 rounded-full border-4 border-white shadow-xl hidden lg:block"></div>
              </div>

              {/* Step 5 */}
              <div className="relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="lg:pr-20">
                    <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105">
                      <div className="flex items-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-3xl flex items-center justify-center font-bold text-3xl mr-8 shadow-xl">
                          5
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900">Get Paid Instantly</h3>
                      </div>
                      <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                        Complete the job to receive payment instantly. Mark job as complete and get paid through secure payment processing.
                      </p>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-6 w-6 mr-4" />
                          <span className="font-semibold text-lg">Instant payment</span>
                        </div>
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-6 w-6 mr-4" />
                          <span className="font-semibold text-lg">Customer rating</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:pl-20">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-10 border border-green-200 shadow-lg">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-2xl font-bold text-gray-900">Payment Received</h4>
                        <Badge className="bg-green-600 text-white px-4 py-2 text-base">Completed</Badge>
                      </div>
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-green-600 mb-3">$425</div>
                          <div className="text-gray-600 text-lg">Paid Instantly</div>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                          ))}
                          <span className="ml-3 text-gray-600 text-lg">5.0 rating</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Provider Reviews Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">
              Trusted by service professionals
            </h3>
            <p className="text-xl text-gray-600">
              Join thousands of service providers who have transformed their businesses with Doord.
            </p>
          </div>

          {/* Reviews Grid */}
          <div className="relative">
            {/* Desktop: Grid Layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-700 text-center mb-6 leading-relaxed">
                    "Doord has completely transformed my business. I've seen a 40% increase in bookings and my revenue has doubled in just 6 months."
                  </blockquote>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      SM
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900">Sarah Miller</h4>
                      <p className="text-sm text-gray-600">Halifax, NS</p>
                      <p className="text-xs text-blue-600 font-medium">Cleaning Services</p>
                    </div>
                  </div>
                  <div className="flex justify-center mt-6">
                    <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                      Cleaning Services
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-700 text-center mb-6 leading-relaxed">
                    "The payment system is incredibly fast and reliable. I get paid instantly after completing jobs, which has improved my cash flow significantly."
                  </blockquote>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      MJ
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900">Mike Johnson</h4>
                      <p className="text-sm text-gray-600">Halifax, NS</p>
                      <p className="text-xs text-blue-600 font-medium">Electrical Services</p>
                    </div>
                  </div>
                  <div className="flex justify-center mt-6">
                    <span className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                      Electrical Services
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-700 text-center mb-6 leading-relaxed">
                    "The customer quality is outstanding. Doord connects me with serious customers who value professional service and are willing to pay fair prices."
                  </blockquote>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      LW
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900">Lisa Wang</h4>
                      <p className="text-sm text-gray-600">Halifax, NS</p>
                      <p className="text-xs text-blue-600 font-medium">Landscaping</p>
                    </div>
                  </div>
                  <div className="flex justify-center mt-6">
                    <span className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                      Landscaping
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-700 text-center mb-6 leading-relaxed">
                    "The scheduling system is a game-changer. Customers can book directly and I never miss an appointment. My efficiency has improved by 60%."
                  </blockquote>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                      RB
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900">Robert Brown</h4>
                      <p className="text-sm text-gray-600">Halifax, NS</p>
                      <p className="text-xs text-blue-600 font-medium">Plumbing Services</p>
                    </div>
                  </div>
                  <div className="flex justify-center mt-6">
                    <span className="bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                      Plumbing Services
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-700 text-center mb-6 leading-relaxed">
                    "Professional platform with excellent customer support. The dashboard helps me track everything and the booking system is seamless."
                  </blockquote>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                      JD
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900">Jessica Davis</h4>
                      <p className="text-sm text-gray-600">Halifax, NS</p>
                      <p className="text-xs text-blue-600 font-medium">HVAC Services</p>
                    </div>
                  </div>
                  <div className="flex justify-center mt-6">
                    <span className="bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium">
                      HVAC Services
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-700 text-center mb-6 leading-relaxed">
                    "Since joining Doord, I've expanded my team and doubled my revenue. The platform brings consistent, high-quality leads every week."
                  </blockquote>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                      DM
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900">David Miller</h4>
                      <p className="text-sm text-gray-600">Halifax, NS</p>
                      <p className="text-xs text-blue-600 font-medium">Handyman Services</p>
                    </div>
                  </div>
                  <div className="flex justify-center mt-6">
                    <span className="bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium">
                      Handyman Services
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile: Horizontal Scroll */}
            <div className="md:hidden">
              <div className="flex overflow-x-auto space-x-6 pb-6 scrollbar-hide">
                {/* Mobile cards with same content but horizontal scroll */}
                <Card className="border-0 shadow-lg flex-shrink-0 w-80">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-base text-gray-700 text-center mb-6 leading-relaxed">
                      "Doord has completely transformed my business. I've seen a 40% increase in bookings and my revenue has doubled in just 6 months."
                    </blockquote>
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        SM
                      </div>
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900">Sarah Miller</h4>
                        <p className="text-sm text-gray-600">Halifax, NS</p>
                        <p className="text-xs text-blue-600 font-medium">Cleaning Services</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Add other mobile cards similarly */}
              </div>
              
              <div className="flex justify-center mt-4">
                <p className="text-sm text-gray-500">← Swipe to see more reviews →</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 mb-6">
              Join thousands of satisfied service providers in Halifax
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/homeservices/auth')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
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