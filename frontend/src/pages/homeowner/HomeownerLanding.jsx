import React, { useState } from 'react';
import { Calendar, ArrowRight, Check, Users, Zap, Shield, Star, Play, ChevronRight, Menu, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const HomeownerLanding = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleBookDemo = () => {
    window.open('https://cal.com/neil-edward/30min', '_blank');
  };

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Get More Customers",
      description: "Connect with verified homeowners actively seeking your services in Halifax and surrounding areas"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Smart Matching",
      description: "Our platform matches you with the right customers based on your skills, location, and availability"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Trusted",
      description: "All customers are verified, payments are secure, and reviews help build your reputation"
    }
  ];

  const benefits = [
    "Get matched with customers actively looking for your services",
    "Manage all your bookings and appointments in one place",
    "Secure payment processing with instant payouts",
    "Build your reputation with customer reviews and ratings",
    "Work with property managers for recurring maintenance jobs",
    "Mobile-friendly platform works on any device"
  ];

  const testimonials = [
    {
      quote: "Since joining Doord, I've tripled my customer base. The platform connects me with homeowners who actually need my services.",
      author: "Mike Thompson",
      role: "Plumbing Contractor",
      avatar: "MT"
    },
    {
      quote: "Property managers love working with me through Doord. I get steady recurring work maintaining their rental properties.",
      author: "Sarah Chen",
      role: "Handyman Services",
      avatar: "SC"
    },
    {
      quote: "The booking system is so simple. Customers find me, book directly, and payments are handled automatically.",
      author: "David Rodriguez",
      role: "Cleaning Services",
      avatar: "DR"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header - Cal.com Style */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Doord</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Testimonials
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </a>
            <Button
              onClick={handleBookDemo}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
            >
              Book Demo
            </Button>
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="container mx-auto py-4 px-4 space-y-3">
              <a href="#features" className="block text-sm font-medium text-gray-600 hover:text-gray-900 py-2">
                Features
              </a>
              <a href="#testimonials" className="block text-sm font-medium text-gray-600 hover:text-gray-900 py-2">
                Testimonials
              </a>
              <a href="#pricing" className="block text-sm font-medium text-gray-600 hover:text-gray-900 py-2">
                Pricing
              </a>
              <Button
                onClick={handleBookDemo}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Book Demo
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section - Exact Cal.com Style */}
      <section className="relative overflow-hidden bg-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:6rem_4rem]" />
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 text-sm font-medium">
                🚀 Join 1000+ service providers
              </Badge>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6 font-inter">
              Connect with
              <br />
              <span className="text-blue-600">trusted homeowners</span>
              <br />
              in your area
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
              Join Doord's home services marketplace. Get matched with local customers, 
              manage bookings, and grow your business with verified homeowners seeking quality services.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                onClick={handleBookDemo}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center group"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Demo Call
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <button className="flex items-center text-gray-600 hover:text-gray-900 font-semibold transition-colors">
                <Play className="mr-2 h-5 w-5" />
                See how it works
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Verified customers</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Secure payments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-gray-500 mb-8">Trusted by service providers across Halifax</p>
          <div className="flex items-center justify-center space-x-8 opacity-60">
            {/* Mock service categories */}
            <div className="text-2xl font-bold text-gray-400">Cleaning Pro</div>
            <div className="text-2xl font-bold text-gray-400">Fix Master</div>
            <div className="text-2xl font-bold text-gray-400">Garden Plus</div>
            <div className="text-2xl font-bold text-gray-400">Handy Helpers</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to grow
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join Doord's marketplace and start connecting with customers today
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
          
          {/* Benefits List */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">What's included</h3>
              <ul className="space-y-3">
                {benefits.slice(0, 3).map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Advanced features</h3>
              <ul className="space-y-3">
                {benefits.slice(3).map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by entrepreneurs
            </h2>
            <p className="text-xl text-gray-600">
              See how businesses are scaling with Doord
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 border-0 shadow-sm">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-4 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to launch your marketplace?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Book a 30-minute demo to see how Doord can transform your business idea into reality
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={handleBookDemo}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Your Demo Now
              </Button>
              <p className="text-blue-100 text-sm">
                Free consultation • No commitment required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="text-xl font-bold text-white">Doord</span>
              </div>
              <p className="text-gray-400 text-sm">
                The complete home services marketplace platform for entrepreneurs
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><button onClick={handleBookDemo} className="hover:text-white transition-colors">Demo</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 Doord. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeownerLanding;