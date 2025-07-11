import React from 'react';
import { ArrowRight, BarChart3, Calendar, Users, DollarSign, Star, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';

const ServiceProviderLanding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Smart Dashboard",
      description: "Track your sales, orders, and performance metrics in real-time"
    },
    {
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      title: "Calendar Management",
      description: "Schedule appointments and manage your availability seamlessly"
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Customer Management",
      description: "Keep track of all your customers and their service history"
    },
    {
      icon: <DollarSign className="h-8 w-8 text-blue-600" />,
      title: "Quote Management",
      description: "Create and send professional quotes to potential customers"
    }
  ];

  const benefits = [
    "Get more customers through our marketplace",
    "Manage your business with powerful CRM tools",
    "Track your earnings and growth",
    "Build your reputation with customer reviews",
    "Streamline your scheduling and appointments",
    "Professional quote and invoice management"
  ];

  const stats = [
    { label: "Active Providers", value: "2,500+" },
    { label: "Jobs Completed", value: "15,000+" },
    { label: "Customer Satisfaction", value: "4.8/5" },
    { label: "Average Earnings", value: "$3,200/mo" }
  ];

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
            <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Grow Your Home Services
              <span className="text-blue-600"> Business</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Join thousands of service providers who use Doord to manage their business,
              get more customers, and increase their earnings.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/homeservices/auth')}
                className="text-lg px-8 py-4"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/homeservices/dashboard')}
                className="text-lg px-8 py-4"
              >
                See Demo Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Business
            </h3>
            <p className="text-lg text-gray-600">
              Powerful tools designed specifically for home service providers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Doord for Your Business?
              </h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">Free</div>
                <div className="text-lg text-gray-600 mb-4">30-day trial</div>
                <p className="text-gray-600 mb-6">
                  Try all features risk-free. No credit card required.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/homeservices/auth')}
                  className="w-full"
                >
                  Get Started Today
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h3>
            <p className="text-lg text-gray-600">
              See how other service providers are growing with Doord
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Mike's Plumbing",
                service: "Plumbing Services",
                quote: "Doord helped me double my customer base in just 6 months. The dashboard makes it so easy to track everything.",
                rating: 5,
                growth: "+150% revenue"
              },
              {
                name: "CleanPro Services",
                service: "Cleaning Services",
                quote: "The quote management system is incredible. I can send professional quotes in minutes instead of hours.",
                rating: 5,
                growth: "+80% efficiency"
              },
              {
                name: "Elite Electrical",
                service: "Electrical Services",
                quote: "Customer management has never been easier. I can see my entire business at a glance.",
                rating: 5,
                growth: "+200% customers"
              }
            ].map((story, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{story.name}</CardTitle>
                      <p className="text-sm text-gray-600">{story.service}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{story.growth}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-3">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic">"{story.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Grow Your Business?
          </h3>
          <p className="text-xl mb-8">
            Join thousands of successful service providers on Doord
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/homeservices/auth')}
            className="text-lg px-8 py-4"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Doord.</h4>
              <p className="text-gray-400">
                The complete business management platform for home service providers
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Platform</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Dashboard</li>
                <li>Calendar</li>
                <li>Customer Management</li>
                <li>Quotes & Invoices</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Resources</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Training Videos</li>
                <li>Best Practices</li>
                <li>Community</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Doord. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServiceProviderLanding;