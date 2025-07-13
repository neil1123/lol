import React, { useState } from 'react';
import { X, Clock, MapPin, DollarSign, FileText, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import apiService from '../services/api';

const QuotationRequestForm = ({ isOpen, onClose, serviceType, providerName, providerId }) => {
  const [formData, setFormData] = useState({
    serviceType: serviceType || '',
    description: '',
    preferredDate: '',
    preferredTime: '',
    urgency: 'medium',
    budget: '',
    propertySize: '',
    address: '',
    phone: '',
    additionalRequirements: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Get user data
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.id) {
        throw new Error('Please log in to request a quotation');
      }

      // Create quotation request data
      const quotationData = {
        homeowner_id: user.id,
        provider_id: providerId,
        homeowner_name: user.name,
        homeowner_email: user.email,
        homeowner_phone: formData.phone || user.phone || '',
        homeowner_address: formData.address || user.address || '',
        provider_name: providerName,
        service_type: formData.serviceType,
        description: formData.description,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        urgency: formData.urgency,
        budget: formData.budget,
        property_size: formData.propertySize,
        additional_requirements: formData.additionalRequirements
      };
      
      // Send quotation request to API
      const response = await apiService.createQuotationRequest(quotationData);
      
      // Success
      onClose();
      alert('Quotation request sent successfully! The provider will contact you soon.');
      
    } catch (error) {
      console.error('Failed to send quotation request:', error);
      setError(error.message || 'Failed to send quotation request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Request Quotation</h2>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="p-2"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {providerName && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">Requesting quote from:</h3>
              <p className="text-blue-700">{providerName}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Service Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Input
                    id="serviceType"
                    value={formData.serviceType}
                    onChange={(e) => handleInputChange('serviceType', e.target.value)}
                    placeholder="e.g., Window Cleaning, Electrical Work"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Please describe the work you need done in detail..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertySize">Property Size</Label>
                    <select
                      id="propertySize"
                      value={formData.propertySize}
                      onChange={(e) => handleInputChange('propertySize', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      required
                    >
                      <option value="">Select property size</option>
                      <option value="under-1000">Under 1,000 sq ft</option>
                      <option value="1000-2000">1,000 - 2,000 sq ft</option>
                      <option value="2000-3000">2,000 - 3,000 sq ft</option>
                      <option value="3000-4000">3,000 - 4,000 sq ft</option>
                      <option value="over-4000">Over 4,000 sq ft</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <select
                      id="urgency"
                      value={formData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="low">Low - Within 2 weeks</option>
                      <option value="medium">Medium - Within 1 week</option>
                      <option value="high">High - Within 3 days</option>
                      <option value="urgent">Urgent - ASAP</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Preferred Scheduling</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredDate">Preferred Date</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferredTime">Preferred Time</Label>
                    <select
                      id="preferredTime"
                      value={formData.preferredTime}
                      onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      required
                    >
                      <option value="">Select preferred time</option>
                      <option value="morning">Morning (8 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                      <option value="evening">Evening (5 PM - 8 PM)</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Budget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Location & Budget</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Service Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter the address where service is needed"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget Range</Label>
                    <select
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Select budget range</option>
                      <option value="under-100">Under $100</option>
                      <option value="100-250">$100 - $250</option>
                      <option value="250-500">$250 - $500</option>
                      <option value="500-1000">$500 - $1,000</option>
                      <option value="over-1000">Over $1,000</option>
                      <option value="get-quote">Get quote first</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.additionalRequirements}
                  onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
                  placeholder="Any special requirements, access instructions, or additional details..."
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  'Send Quotation Request'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuotationRequestForm;