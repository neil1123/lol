import React, { useState } from 'react';
import { Calendar, ArrowRight, Check, Users, Zap, CreditCard, Star, Menu, X, Play, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const HomeownerLanding = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleBookDemo = () => {
    window.open('https://cal.com/neil-edward/30min', '_blank');
  };

  const testimonials = [
    {
      quote: "Revenue doubled in 6 months",
      author: "Sarah M.",
      role: "Cleaning",
      avatar: "SM"
    },
    {
      quote: "Get paid instantly every job", 
      author: "Mike J.",
      role: "Electrical",
      avatar: "MJ"
    },
    {
      quote: "60% efficiency improvement",
      author: "Robert B.",
      role: "Plumbing",
      avatar: "RB"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header - Same as your doord.site */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="text-xl font-bold text-blue-600">Doord.</span>
            </a>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <a href="/" className="text-foreground/60 transition-colors hover:text-foreground/80">Home</a>
              <a href="/homeowners" className="text-foreground/60 transition-colors hover:text-foreground/80">For Homeowners</a>
              <a href="/homeservices" className="text-foreground/60 transition-colors hover:text-foreground/80">For Service Providers</a>
              <a href="/property-manager" className="text-foreground/60 transition-colors hover:text-foreground/80">Property Managers</a>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="hidden md:flex items-center">
              <Button onClick={handleBookDemo} className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
              </Button>
            </nav>
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="container py-4 space-y-3">
              <a href="/" className="block text-sm font-medium text-gray-600 hover:text-gray-900 py-2">Home</a>
              <a href="/homeowners" className="block text-sm font-medium text-gray-600 hover:text-gray-900 py-2">For Homeowners</a>
              <a href="/homeservices" className="block text-sm font-medium text-gray-600 hover:text-gray-900 py-2">For Service Providers</a>
              <a href="/property-manager" className="block text-sm font-medium text-gray-600 hover:text-gray-900 py-2">Property Managers</a>
              <Button onClick={handleBookDemo} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section - Cal.com Style with Less Text */}
      <section className="relative overflow-hidden bg-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:6rem_4rem]" />
        
        <div className="relative container mx-auto px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6">
              Unlock a new
              <br />
              <span className="text-blue-600">revenue stream</span>
            </h1>
            
            {/* Short Subheadline */}
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Connect with customers, streamline operations, and grow your service business.
            </p>
            
            {/* CTA Button */}
            <Button
              onClick={handleBookDemo}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mb-16"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            {/* Visual Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">1000+</div>
                <div className="text-sm text-gray-600">Service Providers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">40%</div>
                <div className="text-sm text-gray-600">Revenue Increase</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">24/7</div>
                <div className="text-sm text-gray-600">Booking System</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Visual with Icons */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
            Everything you need to grow
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Customers</h3>
              <p className="text-gray-600">Connect with thousands actively looking for your services</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Booking</h3>
              <p className="text-gray-600">24/7 automated booking that syncs with your calendar</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Pay</h3>
              <p className="text-gray-600">Get paid instantly with secure payment processing</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Visual Process */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            How it works
          </h2>
          <p className="text-gray-600 text-center mb-16">Simple process, powerful results</p>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">1</div>
                <h3 className="font-semibold text-gray-900 mb-2">Order</h3>
                <p className="text-sm text-gray-600">Customer places order</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">2</div>
                <h3 className="font-semibold text-gray-900 mb-2">Quote</h3>
                <p className="text-sm text-gray-600">Send detailed quote</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">3</div>
                <h3 className="font-semibold text-gray-900 mb-2">Confirm</h3>
                <p className="text-sm text-gray-600">Order confirmed</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">4</div>
                <h3 className="font-semibold text-gray-900 mb-2">Work</h3>
                <p className="text-sm text-gray-600">Complete the job</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">5</div>
                <h3 className="font-semibold text-gray-900 mb-2">Paid</h3>
                <p className="text-sm text-gray-600">Get paid instantly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Compact */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
            Trusted by professionals
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="font-semibold text-gray-900 mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{testimonial.author}</p>
                    <p className="text-xs text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Visual */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to grow?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of service providers growing their business with Doord
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Free to start</h3>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready customers</h3>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Grow revenue</h3>
            </div>
          </div>
          
          <Button
            onClick={handleBookDemo}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Get Started Free
          </Button>
          <p className="text-blue-200 text-sm mt-4">
            No credit card required • Free for up to 10 bookings
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomeownerLanding;