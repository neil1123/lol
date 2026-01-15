import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Building2, CheckCircle, UserPlus, Phone, Mail } from 'lucide-react';
import apiService from '../services/api';

const TenantJoinPM = ({ onJoined }) => {
  const [code, setCode] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [propertyManager, setPropertyManager] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCurrentPM();
  }, []);

  const loadCurrentPM = async () => {
    try {
      // First check localStorage for cached PM info
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.property_manager_id) {
        // Try to get full PM details from API
        try {
          const response = await apiService.getTenantPM();
          if (response.property_manager) {
            setPropertyManager(response.property_manager);
          }
        } catch (apiError) {
          console.error('API error getting PM details:', apiError);
          // If API fails but we have PM ID, show basic connected state
          setPropertyManager({ id: user.property_manager_id, name: 'Property Manager' });
        }
      }
    } catch (error) {
      console.error('Failed to load PM:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!code.trim()) {
      setError('Please enter a code');
      return;
    }

    if (!propertyAddress.trim()) {
      setError('Please enter your property address');
      return;
    }

    setJoining(true);
    setError('');

    try {
      const response = await apiService.tenantJoinPM(code.trim(), propertyAddress, unitNumber);
      setPropertyManager(response.property_manager);
      setCode('');
      setPropertyAddress('');
      setUnitNumber('');
      
      // Update localStorage with new PM info
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.property_manager_id = response.property_manager?.id;
      user.user_type = 'tenant';
      localStorage.setItem('user', JSON.stringify(user));
      
      if (onJoined) {
        onJoined(response.property_manager);
      }
    } catch (error) {
      console.error('Join failed:', error);
      if (error.message?.includes('fetch')) {
        setError('Connection error. Please check your internet and try again.');
      } else if (error.message?.includes('401') || error.message?.includes('403')) {
        setError('Session expired. Please refresh the page and try again.');
      } else {
        setError(error.message || 'Invalid code. Please check and try again.');
      }
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  // Already connected to a PM
  if (propertyManager) {
    return (
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Connected to Property Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {propertyManager.business_name || propertyManager.name}
                </h3>
                <p className="text-sm text-gray-500">{propertyManager.name}</p>
              </div>
            </div>
            
            {propertyManager.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {propertyManager.phone}
              </div>
            )}
            
            {propertyManager.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {propertyManager.email}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-3">
              Your reported issues will be sent directly to this property manager.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not connected - show join form
  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="w-5 h-5 text-orange-600" />
          Connect to Property Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Enter the code provided by your property manager to connect and start reporting issues.
        </p>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PM Code *
            </label>
            <Input
              value={code}
              onChange={(e) => {
                // Allow alphanumeric characters
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                setCode(value);
                setError('');
              }}
              placeholder="Enter code (e.g., ABC123)"
              maxLength={10}
              className="text-center text-2xl font-mono tracking-widest uppercase"
              data-testid="pm-code-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Address *
            </label>
            <Input
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="123 Main St, City, State ZIP"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Number (Optional)
            </label>
            <Input
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              placeholder="Apt 101, Unit A, etc."
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </div>
        
        <Button 
          onClick={handleJoin}
          disabled={joining || code.length < 4}
          className="w-full bg-orange-600 hover:bg-orange-700"
          data-testid="connect-pm-btn"
        >
          {joining ? 'Connecting...' : 'Connect'}
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          Don't have a code? Contact your property manager.
        </p>
      </CardContent>
    </Card>
  );
};

export default TenantJoinPM;
