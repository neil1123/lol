import React, { useState } from 'react';
import { Calendar, ArrowRight, Check, Users, Zap, Shield, Star, Play, ChevronRight, Menu, X, CreditCard, Clock, Target } from 'lucide-react';
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
      title: "Marketplace Access",
      description: "Connect with thousands of customers actively looking for your services. Get discovered and grow your customer base effortlessly."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Smart Scheduling",
      description: "Automated booking system that syncs with your calendar. Let customers book appointments 24/7 while you focus on your work."
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Secure Payments",
      description: "Get paid instantly with our secure payment processing. Multiple payment methods supported with transparent fee structure."
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Customers order",
      description: "Communicate with the customer to understand their needs. Check details on chat and provide personalized service recommendations.",
      features: ["Real-time communication", "Detailed requirements"]
    },
    {
      step: "2", 
      title: "Provide Quotation",
      description: "Analyze requirements and send detailed quotation. Include timelines, materials, and any additional costs for complete transparency.",
      features: ["Detailed breakdown", "Timeline estimation"]
    },
    {
      step: "3",
      title: "Order Confirmation",
      description: "Once customer approves, proceed with confirming the order. Coordinate scheduling and prepare for service delivery.",
      features: ["Instant confirmation", "Schedule coordination"]
    },
    {
      step: "4",
      title: "Complete the Job",
      description: "Start and complete work as per agreed terms. Keep customer updated on progress and ensure quality delivery.",
      features: ["Progress tracking", "Quality assurance"]
    },
    {
      step: "5",
      title: "Get Paid Instantly",
      description: "Complete the job to receive payment instantly. Mark job as complete and get paid through secure payment processing.",
      features: ["Instant payment", "Customer rating"]
    }
  ];

  const testimonials = [
    {
      quote: "Doord has completely transformed my business. I've seen a 40% increase in bookings and my revenue has doubled in just 6 months.",
      author: "Sarah Miller",
      role: "Cleaning Services",
      location: "Halifax, NS",
      avatar: "SM"
    },
    {
      quote: "The payment system is incredibly fast and reliable. I get paid instantly after completing jobs, which has improved my cash flow significantly.",
      author: "Mike Johnson", 
      role: "Electrical Services",
      location: "Halifax, NS",
      avatar: "MJ"
    },
    {
      quote: "The customer quality is outstanding. Doord connects me with serious customers who value professional service and are willing to pay fair prices.",
      author: "Lisa Wang",
      role: "Landscaping", 
      location: "Halifax, NS",
      avatar: "LW"
    },
    {
      quote: "The scheduling system is a game-changer. Customers can book directly and I never miss an appointment. My efficiency has improved by 60%.",
      author: "Robert Brown",
      role: "Plumbing Services",
      location: "Halifax, NS", 
      avatar: "RB"
    },
    {
      quote: "Professional platform with excellent customer support. The dashboard helps me track everything and the booking system is seamless.",
      author: "Jessica Davis",
      role: "HVAC Services",
      location: "Halifax, NS",
      avatar: "JD"
    },
    {
      quote: "Since joining Doord, I've expanded my team and doubled my revenue. The platform brings consistent, high-quality leads every week.",
      author: "David Miller",
      role: "Handyman Services",
      location: "Halifax, NS",
      avatar: "DM"
    }
  ];

  const finalBenefits = [
    {
      icon: <Check className="h-6 w-6 text-green-500" />,
      title: "Free to get started",
      description: "No upfront costs or monthly fees"
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "Instant customer access", 
      description: "Connect with ready-to-book customers"
    },
    {
      icon: <Target className="h-6 w-6 text-purple-500" />,
      title: "Complete business tools",
      description: "Everything you need in one platform"
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
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              How it works
            </a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Reviews
            </a>
            <Button
              onClick={handleBookDemo}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
            >
              Get Started
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
              <a href="#how-it-works" className="block text-sm font-medium text-gray-600 hover:text-gray-900 py-2">
                How it works
              </a>
              <a href="#testimonials" className="block text-sm font-medium text-gray-600 hover:text-gray-900 py-2">
                Reviews
              </a>
              <Button
                onClick={handleBookDemo}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Get Started
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
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6">
              Unlock a new
              <br />
              <span className="text-blue-600">revenue stream</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
              Build your service business with Doord's marketplace platform. Connect with customers, 
              streamline operations, and unlock new revenue streams with our comprehensive suite of tools.
            </p>
            
            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                onClick={handleBookDemo}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center group"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Elevate your business with powerful tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to grow your service business, from customer acquisition to payment processing.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
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
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Doord works for Home service companies?
            </h2>
            <p className="text-xl text-gray-600">
              A streamlined process designed to help you focus on what you do best while we handle the rest.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row items-start gap-6 mb-12 last:mb-0">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-3">{step.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {step.features.map((feature, idx) => (
                      <Badge key={idx} className="bg-blue-50 text-blue-700 border-blue-200">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by service professionals
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of service providers who have transformed their businesses with Doord.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, 6).map((testimonial, index) => (
              <Card key={index} className="p-6 border-0 shadow-sm">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-4 leading-relaxed text-sm">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{testimonial.author}</p>
                    <p className="text-xs text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">Join thousands of satisfied service providers in Halifax</p>
            <Button
              onClick={handleBookDemo}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to grow your business?
            </h2>
            <p className="text-xl text-blue-100 mb-12">
              Join thousands of service providers who have transformed their businesses with Doord. 
              Start connecting with more customers and increase your revenue today.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {finalBenefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-blue-100 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={handleBookDemo}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Get Started Free
              </Button>
              <p className="text-blue-100 text-sm">
                No credit card required • Free for up to 10 bookings
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
                Build your service business with our marketplace platform
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                <li><button onClick={handleBookDemo} className="hover:text-white transition-colors">Get Started</button></li>
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
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 Doord. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeownerLanding;