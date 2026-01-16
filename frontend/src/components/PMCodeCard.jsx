import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Copy, RefreshCw, Users, CheckCircle } from 'lucide-react';
import apiService from '../services/api';

const PMCodeCard = ({ onDataChange }) => {
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tenantCount, setTenantCount] = useState(0);

  const loadCode = useCallback(async () => {
    try {
      const response = await apiService.getMyPMCode();
      setCode(response.code);
      // Also update localStorage user to keep pm_code in sync
      const userStr = localStorage.getItem('user');
      if (userStr && response.code) {
        const user = JSON.parse(userStr);
        user.pm_code = response.code;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Failed to load code:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTenantCount = useCallback(async () => {
    try {
      const tenants = await apiService.getPMTenants();
      setTenantCount(tenants.length);
      // Notify parent of data change if callback provided
      if (onDataChange) {
        onDataChange({ tenantCount: tenants.length });
      }
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  }, [onDataChange]);

  useEffect(() => {
    loadCode();
    loadTenantCount();
  }, [loadCode, loadTenantCount]);

  const loadCode = async () => {
    try {
      const response = await apiService.getMyPMCode();
      setCode(response.code);
    } catch (error) {
      console.error('Failed to load code:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTenantCount = async () => {
    try {
      const tenants = await apiService.getPMTenants();
      setTenantCount(tenants.length);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  };

  const generateCode = async () => {
    setGenerating(true);
    try {
      const response = await apiService.generatePMCode();
      setCode(response.code);
    } catch (error) {
      console.error('Failed to generate code:', error);
      alert('Failed to generate code. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-blue-600" />
          Tenant Invite Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {code ? (
          <>
            <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300 text-center">
              <p className="text-xs text-gray-500 mb-1">Share this code with your tenants</p>
              <div className="text-3xl font-mono font-bold tracking-widest text-blue-600">
                {code}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={copyCode} 
                variant="outline" 
                className="flex-1"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
              <Button 
                onClick={generateCode} 
                variant="outline"
                disabled={generating}
              >
                <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <span className="font-semibold text-blue-600">{tenantCount}</span> tenant{tenantCount !== 1 ? 's' : ''} connected
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Generate a code to allow tenants to connect with you
            </p>
            <Button 
              onClick={generateCode} 
              disabled={generating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Invite Code'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PMCodeCard;
