import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const HomeownerAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Sign In Form
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  
  // Sign Up Form
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Get stored users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('registeredHomeowners') || '[]');
    const user = storedUsers.find(u => u.email === signInData.email && u.password === signInData.password);
    
    if (user) {
      localStorage.setItem('userType', 'homeowner');
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        type: 'homeowner'
      }));
      
      setIsLoading(false);
      navigate('/homeowners/dashboard');
    } else {
      setIsLoading(false);
      alert('Invalid credentials. Please check your email and password.');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate form
    if (signUpData.password !== signUpData.confirmPassword) {
      alert('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Check if user already exists
    const storedUsers = JSON.parse(localStorage.getItem('registeredHomeowners') || '[]');
    const existingUser = storedUsers.find(u => u.email === signUpData.email);
    
    if (existingUser) {
      alert('User with this email already exists');
      setIsLoading(false);
      return;
    }
    
    // Create new user
    const newUser = {
      id: Date.now() + Math.random(), // Generate unique ID
      name: `${signUpData.firstName} ${signUpData.lastName}`,
      email: signUpData.email,
      phone: signUpData.phone,
      address: signUpData.address,
      password: signUpData.password,
      registeredAt: new Date().toISOString()
    };
    
    // Store user
    storedUsers.push(newUser);
    localStorage.setItem('registeredHomeowners', JSON.stringify(storedUsers));
    
    // Auto login after registration
    localStorage.setItem('userType', 'homeowner');
    localStorage.setItem('user', JSON.stringify({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      type: 'homeowner'
    }));
    
    setIsLoading(false);
    navigate('/homeowners/dashboard');
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
                onClick={() => navigate('/homeowners')}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">Doord.</h1>
            </div>
            <div className="text-sm text-gray-600">
              Service Provider? <Button variant="link" onClick={() => navigate('/homeservices/auth')}>Sign in here</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Doord
          </h2>
          <p className="text-gray-600">
            Sign in to your homeowner account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">Homeowner Access</CardTitle>
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
                        placeholder="Enter your email"
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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="First name"
                          value={signUpData.firstName}
                          onChange={(e) => setSignUpData({...signUpData, firstName: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Last name"
                        value={signUpData.lastName}
                        onChange={(e) => setSignUpData({...signUpData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData({...signUpData, phone: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        type="text"
                        placeholder="Enter your address"
                        value={signUpData.address}
                        onChange={(e) => setSignUpData({...signUpData, address: e.target.value})}
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
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading || signUpData.password !== signUpData.confirmPassword}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
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

export default HomeownerAuth;