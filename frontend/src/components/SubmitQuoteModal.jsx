import React, { useState } from 'react';
import { X, DollarSign, Clock, FileText, Loader2, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import apiService from '../services/api';

const SubmitQuoteModal = ({ order, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quotation_amount: '',
    quotation_details: '',
    estimated_duration: '',
    quotation_valid_until: ''
  });

  // Calculate default valid until date (7 days from now)
  const defaultValidUntil = new Date();
  defaultValidUntil.setDate(defaultValidUntil.getDate() + 7);

  const handleSubmit = async () => {
    if (!formData.quotation_amount) {
      alert('Please enter a quote amount');
      return;
    }

    setLoading(true);
    try {
      await apiService.submitQuote(order.id, {
        quotation_amount: parseFloat(formData.quotation_amount),
        quotation_details: formData.quotation_details,
        estimated_duration: formData.estimated_duration,
        quotation_valid_until: formData.quotation_valid_until || defaultValidUntil.toISOString().split('T')[0]
      });
      
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to submit quote:', error);
      alert('Failed to submit quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg" data-testid="submit-quote-modal">
        {/* Header */}
        <div className="bg-purple-600 text-white p-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Submit Quote
          </h2>
          <button onClick={onClose} className="hover:bg-purple-700 p-1 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Order Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900">{order.service_type}</h3>
            <p className="text-sm text-gray-600">Customer: {order.homeowner_name}</p>
            {order.homeowner_address && (
              <p className="text-sm text-gray-600">Address: {order.homeowner_address}</p>
            )}
            <div className="mt-2 text-sm text-gray-700">
              <strong>Description:</strong> {order.description}
            </div>
          </div>

          {/* Quote Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Quote Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <Input
                type="number"
                value={formData.quotation_amount}
                onChange={(e) => setFormData({ ...formData, quotation_amount: e.target.value })}
                placeholder="0.00"
                className="pl-8"
                min="0"
                step="0.01"
                data-testid="quote-amount-input"
              />
            </div>
          </div>

          {/* Estimated Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Estimated Duration
            </label>
            <select
              value={formData.estimated_duration}
              onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
              data-testid="duration-select"
            >
              <option value="">Select duration...</option>
              <option value="30 mins">30 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="2 hours">2 hours</option>
              <option value="3 hours">3 hours</option>
              <option value="4 hours">4 hours</option>
              <option value="Half day">Half day (4-5 hours)</option>
              <option value="Full day">Full day (6-8 hours)</option>
              <option value="Multiple days">Multiple days</option>
            </select>
          </div>

          {/* Quote Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Quote Details
            </label>
            <textarea
              value={formData.quotation_details}
              onChange={(e) => setFormData({ ...formData, quotation_details: e.target.value })}
              placeholder="Include breakdown, materials, labor costs, etc."
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500"
              rows="3"
              data-testid="quote-details-input"
            />
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quote Valid Until
            </label>
            <Input
              type="date"
              value={formData.quotation_valid_until}
              onChange={(e) => setFormData({ ...formData, quotation_valid_until: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              data-testid="valid-until-input"
            />
            <p className="text-xs text-gray-500 mt-1">Default: 7 days from today</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.quotation_amount}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            data-testid="submit-quote-btn"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Quote
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitQuoteModal;
