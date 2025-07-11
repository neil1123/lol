import React, { useState } from 'react';
import { Search, MapPin, Star, ArrowRight, Shield, Clock, Users, CheckCircle, Menu, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { serviceCategories, mockProviders } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

const HomeownerLanding = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const featuredServices = serviceCategories.slice(0, 3);
  const topProviders = mockProviders.slice(0, 3);

  const handleSearch = () => {
    navigate(`/homeowners/browse?search=${searchTerm}`);
  };

  const handleServiceClick = (service) => {
    navigate(`/homeowners/browse?service=${service.name}`);
  };

  // How it works steps for homeowners
  const howItWorksSteps = [
    {
      step: "1",
      title: "Tell us what you need",
      description: "Describe your project and select the service you're looking for",
      icon: "🔍",
      color: "bg-blue-500"
    },
    {
      step: "2", 
      title: "Get matched with pros",
      description: "We'll show you verified service providers in your area",
      icon: "👥",
      color: "bg-green-500"
    },
    {
      step: "3",
      title: "Receive quotes",
      description: "Compare quotes and choose the best provider for your needs",
      icon: "💰",
      color: "bg-purple-500"
    },
    {
      step: "4",
      title: "Book & get it done",
      description: "Schedule your service and track progress through completion",
      icon: "✅",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Doord.</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/homeservices')}
                className="text-sm"
              >
                For Service Providers
              </Button>
              <Button variant="ghost" onClick={() => navigate('/homeowners/quotations')}>
                My Quotations
              </Button>
              <Button variant="outline" onClick={() => navigate('/homeowners/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/homeowners/auth')}>
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Home services at your 
              <span className="text-blue-600"> door step</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Connect with trusted local professionals for all your home maintenance needs.
              Get quotes, compare services, and book with confidence.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto mb-8">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="What service do you need? (e.g., plumbing, cleaning)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <Button onClick={handleSearch} className="h-12 px-8 text-lg">
                  Find Services
                </Button>
              </div>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-8 text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Verified Providers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-sm">Top Rated Services</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-xl text-gray-600">
              Get your home projects done in 4 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="text-center group relative">
                {/* Animated step circle */}
                <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold transform group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  {step.step}
                </div>
                
                {/* Step content */}
                <div className="space-y-3">
                  <div className="text-4xl mb-3">{step.icon}</div>
                  <h4 className="text-xl font-semibold text-gray-900">{step.title}</h4>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/homeowners/browse')}
            >
              Start Your Project Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Services
            </h3>
            <p className="text-lg text-gray-600">
              Choose from our most requested home services
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {serviceCategories.flatMap(category => 
              category.services.slice(0, 2).map(service => (
                <Card 
                  key={service.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => handleServiceClick(service)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl mb-3">{service.icon}</div>
                    <h4 className="font-semibold text-sm">{service.name}</h4>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <div className="text-center">
            <Button variant="outline" onClick={() => navigate('/homeowners/browse')}>
              View All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Top Rated Providers
            </h3>
            <p className="text-lg text-gray-600">
              Trusted professionals with excellent reviews
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topProviders.map(provider => (
              <Card 
                key={provider.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/homeowners/provider/${provider.id}`)}
              >
                <CardContent className="p-4">
                  {/* Image Gallery */}
                  <div className="grid grid-cols-4 gap-1 h-32 mb-4">
                    <div className="col-span-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl mb-1">
                          {provider.services.includes('Home Cleaning') || provider.services.includes('Office Cleaning') ? '🧹' :
                           provider.services.includes('Plumber') ? '🔧' :
                           provider.services.includes('Electrician') ? '⚡' :
                           provider.services.includes('Landscaping') ? '🌱' : '🏠'}
                        </div>
                        <p className="text-xs text-gray-600">Professional</p>
                      </div>
                    </div>
                    <div className="grid grid-rows-2 gap-1">
                      <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                        <div className="text-lg">✨</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                        <div className="text-lg">🏠</div>
                      </div>
                    </div>
                    <div className="grid grid-rows-2 gap-1">
                      <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                        <div className="text-lg">💯</div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                        <div className="text-lg">⭐</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        {provider.rating} ★
                      </div>
                      <span className="text-gray-500 text-xs">({provider.reviews})</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3 text-sm">{provider.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {provider.services.slice(0, 3).map(service => (
                      <Badge key={service} variant="secondary" className="text-xs">{service}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      📍 {provider.location}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/homeowners/provider/${provider.id}`);
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Doord?
            </h3>
            <p className="text-lg text-gray-600">
              We make finding reliable home services simple and stress-free
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Verified Providers</h4>
              <p className="text-gray-600">All service providers are background checked and verified</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Quick Response</h4>
              <p className="text-gray-600">Get quotes within hours, not days</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Trusted Reviews</h4>
              <p className="text-gray-600">Read real reviews from verified customers</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Quality Guarantee</h4>
              <p className="text-gray-600">100% satisfaction guarantee on all services</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to get started?
          </h3>
          <p className="text-xl mb-8">
            Join thousands of satisfied homeowners who found their perfect service provider
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/homeowners/browse')}
          >
            Browse Services Now
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
                Your trusted marketplace for home services
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Homeowners</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Browse Services</li>
                <li>How It Works</li>
                <li>Safety</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Providers</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Join as Provider</li>
                <li>Dashboard</li>
                <li>Resources</li>
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

export default HomeownerLanding;