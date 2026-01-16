import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import apiService from '../services/api';

const SendToProviderModal = ({ issue, issues, provider, onClose, onSuccess }) => {
  // If provider is passed, we're selecting an issue to send to that provider
  // If issue is passed, we're selecting a provider to send that issue to
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(provider || null);
  const [selectedIssue, setSelectedIssue] = useState(issue || null);
  const [loading, setLoading] = useState(!provider);
  const [sending, setSending] = useState(false);
  const [propertyAddress, setPropertyAddress] = useState('');
  
  // Determine which mode we're in
  const isSelectingIssue = !!provider;
  const availableIssues = issues || (issue ? [issue] : []);

  useEffect(() => {
    if (!provider) {
      loadProviders();
    }
  }, [provider]);

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
      if (issue?.issue_category) {
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
    
    if (!selectedIssue) {
      alert('Please select an issue to send');
      return;
    }

    setSending(true);
    try {
      const result = await apiService.sendIssueToProvider(
        selectedIssue.id,
        selectedProvider.id,
        propertyAddress
      );
      
      alert(`Issue sent to ${result.provider_name} successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to send issue to provider:', error);
      alert('Failed to send issue. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      emergency: 'bg-red-100 text-red-800',
      urgent: 'bg-orange-100 text-orange-800',
      normal: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return urgencyConfig[urgency] || urgencyConfig.normal;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {isSelectingIssue ? `Send Issue to ${provider.name}` : 'Send Issue to Service Provider'}
          </h2>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* If selecting issue (provider is pre-selected) */}
          {isSelectingIssue ? (
            <>
              {/* Selected Provider Info */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                <h3 className="font-semibold text-lg mb-2">Selected Provider</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{provider.business_name || provider.name}</p>
                    <p className="text-sm text-gray-600">{provider.location}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm">
                      <span>⭐ {provider.rating || 5.0}</span>
                      {provider.services && (
                        <span className="text-gray-500">
                          {provider.services.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Issue Selection */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-4">Select Issue to Send</h3>
                {availableIssues.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>No pending issues to send</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {availableIssues.map((iss) => (
                      <Card
                        key={iss.id}
                        className={`cursor-pointer transition-all ${
                          selectedIssue?.id === iss.id
                            ? 'border-2 border-blue-600 bg-blue-50'
                            : 'border hover:border-blue-300'
                        }`}
                        onClick={() => setSelectedIssue(iss)}
                        data-testid={`issue-card-${iss.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{iss.issue_category || 'General Issue'}</h4>
                                <Badge className={getUrgencyBadge(iss.urgency_level)}>
                                  {iss.urgency_level || 'normal'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{iss.tenant_name}</p>
                              {iss.unit_number && (
                                <p className="text-xs text-gray-500">Unit: {iss.unit_number}</p>
                              )}
                              <p className="text-sm text-gray-700 mt-2 line-clamp-2">{iss.description}</p>
                            </div>
                            {selectedIssue?.id === iss.id && (
                              <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Issue Summary (when selecting provider) */}
              {selectedIssue && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-lg mb-2">Issue Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Category:</span> {selectedIssue.issue_category || 'N/A'}</p>
                    <p><span className="font-medium">Urgency:</span> {selectedIssue.urgency_level || 'Normal'}</p>
                    <p><span className="font-medium">Tenant:</span> {selectedIssue.tenant_name}</p>
                    {selectedIssue.unit_number && (
                      <p><span className="font-medium">Unit:</span> {selectedIssue.unit_number}</p>
                    )}
                    <p><span className="font-medium">Description:</span> {selectedIssue.description}</p>
                  </div>
                </div>
              )}

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
                    data-testid="search-providers-input"
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
                  {filteredProviders.map((prov) => (
                    <Card
                      key={prov.id}
                      className={`cursor-pointer transition-all ${
                        selectedProvider?.id === prov.id
                          ? 'border-2 border-blue-600 bg-blue-50'
                          : 'border hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedProvider(prov)}
                      data-testid={`provider-card-${prov.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">
                              {prov.business_name || prov.name}
                            </h4>
                            <p className="text-sm text-gray-600">{prov.location}</p>
                            
                            {prov.services && prov.services.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {prov.services.slice(0, 4).map((service, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                  >
                                    {service}
                                  </span>
                                ))}
                                {prov.services.length > 4 && (
                                  <span className="text-xs text-gray-500">
                                    +{prov.services.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>⭐ {prov.rating || 5.0}</span>
                              <span>{prov.completed_jobs || 0} jobs</span>
                              {prov.response_time && (
                                <span>⏱️ {prov.response_time}</span>
                              )}
                            </div>
                          </div>

                          {selectedProvider?.id === prov.id && (
                            <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Property Address Input */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Address (Optional)
            </label>
            <Input
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="Enter property address if different from tenant address"
              data-testid="property-address-input"
            />
          </div>
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
            disabled={!selectedProvider || !selectedIssue || sending}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="send-to-provider-btn"
          >
            {sending ? 'Sending...' : 'Send to Provider'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SendToProviderModal;
