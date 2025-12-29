import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import apiService from '../services/api';

const SendToProviderModal = ({ issue, onClose, onSuccess }) => {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [propertyAddress, setPropertyAddress] = useState('');

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProviders(providers);
    } else {
      const filtered = providers.filter(provider =>
        (provider.business_name || provider.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (provider.services || []).some(service => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredProviders(filtered);
    }
  }, [searchTerm, providers]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllProviders();
      
      // Filter providers by issue category if available
      let relevantProviders = data;
      if (issue.issue_category) {
        relevantProviders = data.filter(provider => {
          const services = provider.services || [];
          return services.some(service => 
            service.toLowerCase().includes(issue.issue_category.toLowerCase()) ||
            issue.issue_category.toLowerCase().includes(service.toLowerCase())
          );
        });
        
        // If no relevant providers, show all
        if (relevantProviders.length === 0) {
          relevantProviders = data;
        }
      }
      
      setProviders(relevantProviders);
      setFilteredProviders(relevantProviders);
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedProvider) {
      alert('Please select a service provider');
      return;
    }

    setSending(true);
    try {
      const result = await apiService.sendIssueToProvider(
        issue.id,
        selectedProvider.id,
        propertyAddress
      );
      
      alert(`Issue sent to ${result.provider_name} successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to send issue to provider:', error);
      alert('Failed to send issue. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Send Issue to Service Provider</h2>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Issue Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-lg mb-2">Issue Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Category:</span> {issue.issue_category || 'N/A'}</p>
              <p><span className="font-medium">Urgency:</span> {issue.urgency_level || 'Normal'}</p>
              <p><span className="font-medium">Tenant:</span> {issue.tenant_name}</p>
              {issue.unit_number && (
                <p><span className="font-medium">Unit:</span> {issue.unit_number}</p>
              )}
              <p><span className="font-medium">Description:</span> {issue.description}</p>
            </div>
          </div>

          {/* Property Address Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Address (Optional)
            </label>
            <Input
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="Enter property address if different from tenant address"
            />
          </div>

          {/* Provider Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Service Providers
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or service..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Provider List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading providers...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No service providers found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredProviders.map((provider) => (
                <Card
                  key={provider.id}
                  className={`cursor-pointer transition-all ${
                    selectedProvider?.id === provider.id
                      ? 'border-2 border-blue-600 bg-blue-50'
                      : 'border hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedProvider(provider)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">
                          {provider.business_name || provider.name}
                        </h4>
                        <p className="text-sm text-gray-600">{provider.location}</p>
                        
                        {provider.services && provider.services.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {provider.services.slice(0, 4).map((service, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                              >
                                {service}
                              </span>
                            ))}
                            {provider.services.length > 4 && (
                              <span className="text-xs text-gray-500">
                                +{provider.services.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>⭐ {provider.rating || 5.0}</span>
                          <span>{provider.completed_jobs || 0} jobs</span>
                          {provider.response_time && (
                            <span>⏱️ {provider.response_time}</span>
                          )}
                        </div>
                      </div>

                      {selectedProvider?.id === provider.id && (
                        <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!selectedProvider || sending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {sending ? 'Sending...' : 'Send to Provider'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SendToProviderModal;
