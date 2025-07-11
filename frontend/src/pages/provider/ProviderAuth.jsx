import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Phone, MapPin, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Checkbox } from '../../components/ui/checkbox';
import { serviceCategories } from '../../data/mockData';

const ProviderAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Sign In Form
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  
  // Sign Up Form
  const [signUpData, setSignUpData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    services: [],
    password: '',
    confirmPassword: '',
    experience: '',
    license: ''
  });

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('Login attempt:', signInData);
    
    // Simple direct authentication
    if (signInData.email === 'edwarddethe@gmail.com' && signInData.password === 'Neildethe1*') {
      console.log('Login successful - setting user data');
      
      // Set user authentication data
      localStorage.setItem('userType', 'provider');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        businessName: 'Elite Home Solutions',
        ownerName: 'Edward Dethe',
        email: signInData.email,
        type: 'provider'
      }));
      
      console.log('User data set, navigating to dashboard');
      setIsLoading(false);
      
      // Navigate to dashboard
      window.location.href = '/homeservices/dashboard';
      
    } else {
      console.log('Login failed: Invalid credentials');
      setIsLoading(false);
      alert('Invalid credentials. Please use: edwarddethe@gmail.com / Neildethe1*');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock registration
    setTimeout(() => {
      localStorage.setItem('userType', 'provider');
      localStorage.setItem('user', JSON.stringify({
        id: Date.now(),
        businessName: signUpData.businessName,
        ownerName: signUpData.ownerName,
        email: signUpData.email,
        phone: signUpData.phone,
        address: signUpData.address,
        services: signUpData.services,
        type: 'provider'
      }));
      
      setIsLoading(false);
      navigate('/homeservices/dashboard');
    }, 1000);
  };

  const handleServiceToggle = (serviceName) => {
    setSignUpData(prev => ({
      ...prev,
      services: prev.services.includes(serviceName)
        ? prev.services.filter(s => s !== serviceName)
        : [...prev.services, serviceName]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/homeservices')}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">Doord.</h1>
              <span className="text-sm text-gray-600">for Service Providers</span>
            </div>
            <div className="text-sm text-gray-600">
              Homeowner? <Button variant="link" onClick={() => navigate('/homeowners/auth')}>Sign in here</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Grow Your Business
          </h2>
          <p className="text-gray-600">
            Join the leading marketplace for home service providers
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">Service Provider Access</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your business email"
                        value={signInData.email}
                        onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  
                  <div className="text-center">
                    <Button variant="link" size="sm">
                      Forgot your password?
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="businessName"
                          type="text"
                          placeholder="Your business name"
                          value={signUpData.businessName}
                          onChange={(e) => setSignUpData({...signUpData, businessName: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Owner Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="ownerName"
                          type="text"
                          placeholder="Your full name"
                          value={signUpData.ownerName}
                          onChange={(e) => setSignUpData({...signUpData, ownerName: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your business email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Business phone number"
                          value={signUpData.phone}
                          onChange={(e) => setSignUpData({...signUpData, phone: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        placeholder="Years in business"
                        value={signUpData.experience}
                        onChange={(e) => setSignUpData({...signUpData, experience: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Service Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        type="text"
                        placeholder="Enter your business address"
                        value={signUpData.address}
                        onChange={(e) => setSignUpData({...signUpData, address: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="license">License Number (Optional)</Label>
                    <Input
                      id="license"
                      type="text"
                      placeholder="Professional license number"
                      value={signUpData.license}
                      onChange={(e) => setSignUpData({...signUpData, license: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Services Offered</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                      {serviceCategories.flatMap(category => 
                        category.services.map(service => (
                          <div key={service.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={service.name}
                              checked={signUpData.services.includes(service.name)}
                              onCheckedChange={() => handleServiceToggle(service.name)}
                            />
                            <label
                              htmlFor={service.name}
                              className="text-sm cursor-pointer"
                            >
                              {service.name}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Create a password"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData({...signUpData, confirmPassword: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading || signUpData.password !== signUpData.confirmPassword || signUpData.services.length === 0}
                  >
                    {isLoading ? 'Creating Account...' : 'Start Your Business'}
                  </Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderAuth;