import React, { useState, useEffect } from 'react';
import { Send, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import apiService from '../services/api';

const QuickSendToProvider = ({ issue, onSuccess }) => {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllProviders();
      
      // Sort providers - relevant ones first based on issue category
      let sortedProviders = [...data];
      if (issue.issue_category) {
        sortedProviders.sort((a, b) => {
          const aMatch = (a.services || []).some(s => 
            s.toLowerCase().includes(issue.issue_category.toLowerCase()) ||
            issue.issue_category.toLowerCase().includes(s.toLowerCase())
          );
          const bMatch = (b.services || []).some(s => 
            s.toLowerCase().includes(issue.issue_category.toLowerCase()) ||
            issue.issue_category.toLowerCase().includes(s.toLowerCase())
          );
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        });
      }
      
      setProviders(sortedProviders);
      // Auto-select first provider if available
      if (sortedProviders.length > 0) {
        setSelectedProvider(sortedProviders[0].id);
      }
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSend = async () => {
    if (!selectedProvider) {
      alert('Please select a service provider');
      return;
    }

    setSending(true);
    try {
      const result = await apiService.sendIssueToProvider(
        issue.id,
        selectedProvider,
        ''
      );
      setSent(true);
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 1000);
    } catch (error) {
      console.error('Failed to send issue to provider:', error);
      alert('Failed to send issue. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-medium" data-testid="quick-send-success">
        <CheckCircle className="h-5 w-5" />
        <span>Sent to provider!</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <p className="text-sm text-gray-500">No providers available</p>
    );
  }

  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2" data-testid="quick-send-container">
      {/* Provider Dropdown */}
      <div className="relative flex-1">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-lg bg-white hover:bg-gray-50 text-left text-sm"
          data-testid="provider-dropdown-trigger"
        >
          <span className="truncate">
            {selectedProviderData 
              ? (selectedProviderData.business_name || selectedProviderData.name)
              : 'Select provider...'
            }
          </span>
          <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>
        
        {showDropdown && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {providers.map((provider, index) => {
              const isRecommended = issue.issue_category && (provider.services || []).some(s => 
                s.toLowerCase().includes(issue.issue_category.toLowerCase()) ||
                issue.issue_category.toLowerCase().includes(s.toLowerCase())
              );
              
              return (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => {
                    setSelectedProvider(provider.id);
                    setShowDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center justify-between ${
                    selectedProvider === provider.id ? 'bg-blue-50' : ''
                  } ${index === 0 ? 'rounded-t-lg' : ''} ${index === providers.length - 1 ? 'rounded-b-lg' : ''}`}
                  data-testid={`provider-option-${provider.id}`}
                >
                  <div>
                    <div className="font-medium text-sm">
                      {provider.business_name || provider.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(provider.services || []).slice(0, 2).join(', ')}
                    </div>
                  </div>
                  {isRecommended && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Match
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Send Button */}
      <Button
        onClick={handleQuickSend}
        disabled={!selectedProvider || sending}
        className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
        data-testid="quick-send-button"
      >
        {sending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send Now
          </>
        )}
      </Button>
    </div>
  );
};

export default QuickSendToProvider;
