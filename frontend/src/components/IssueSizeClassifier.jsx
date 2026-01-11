import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Loader2, Check } from 'lucide-react';
import apiService from '../services/api';

const IssueSizeClassifier = ({ issue, onClassified }) => {
  const [loading, setLoading] = useState(false);
  const [currentSize, setCurrentSize] = useState(issue.issue_size || 'medium');

  const sizes = [
    { 
      value: 'small', 
      label: 'Small', 
      description: 'Quick fix, < 1 hour',
      color: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      description: '1-4 hours work',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200'
    },
    { 
      value: 'big', 
      label: 'Big', 
      description: 'Major repair, 4+ hours',
      color: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
    }
  ];

  const handleClassify = async (size) => {
    if (size === currentSize) return;
    
    setLoading(true);
    try {
      await apiService.classifyIssue(issue.id, size);
      setCurrentSize(size);
      onClassified && onClassified(size);
    } catch (error) {
      console.error('Failed to classify issue:', error);
      alert('Failed to classify issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2" data-testid={`issue-classifier-${issue.id}`}>
      <label className="text-xs font-medium text-gray-600">Issue Size:</label>
      <div className="flex gap-2">
        {sizes.map((size) => (
          <button
            key={size.value}
            onClick={() => handleClassify(size.value)}
            disabled={loading}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
              currentSize === size.value 
                ? size.color + ' ring-2 ring-offset-1 ring-gray-400' 
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
            }`}
            title={size.description}
            data-testid={`classify-${size.value}`}
          >
            {loading && currentSize !== size.value ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : currentSize === size.value ? (
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                {size.label}
              </span>
            ) : (
              size.label
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IssueSizeClassifier;
