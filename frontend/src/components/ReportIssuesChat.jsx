import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Home,
  Zap,
  Droplets,
  Wrench,
  Thermometer,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import apiService from '../services/api';

const ISSUE_CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', icon: Droplets, color: 'text-blue-500' },
  { id: 'electrical', label: 'Electrical', icon: Zap, color: 'text-yellow-500' },
  { id: 'hvac', label: 'HVAC', icon: Thermometer, color: 'text-red-500' },
  { id: 'appliance', label: 'Appliance', icon: Wrench, color: 'text-gray-500' },
  { id: 'structural', label: 'Structural', icon: Home, color: 'text-amber-700' },
  { id: 'other', label: 'Other', icon: HelpCircle, color: 'text-purple-500' },
];

const URGENCY_LEVELS = [
  { id: 'emergency', label: 'Emergency', description: 'Immediate danger or major damage', color: 'bg-red-100 border-red-500 text-red-700' },
  { id: 'high', label: 'High', description: 'Significant inconvenience', color: 'bg-orange-100 border-orange-500 text-orange-700' },
  { id: 'medium', label: 'Medium', description: 'Can wait a few days', color: 'bg-yellow-100 border-yellow-500 text-yellow-700' },
  { id: 'low', label: 'Low', description: 'Minor issue, no rush', color: 'bg-green-100 border-green-500 text-green-700' },
];

const ReportIssuesChat = ({ onIssueSubmitted }) => {
  const [step, setStep] = useState(1); // 1: Prompt, 2: Form, 3: Summary, 4: Success
  const [issueDescription, setIssueDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [linkedPM, setLinkedPM] = useState(null);
  const [loadingPM, setLoadingPM] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    unit_number: '',
    issue_category: '',
    urgency_level: '',
    best_time: '',
    permission_to_enter: '',
    additional_notes: ''
  });
  
  const [aiSummary, setAiSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load linked PM and user's property info on mount
  useEffect(() => {
    loadLinkedPM();
    loadUserPropertyInfo();
  }, []);

  const loadLinkedPM = async () => {
    setLoadingPM(true);
    try {
      // First check localStorage for cached PM info
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // If user already has property_manager_id in localStorage, try to load from API
      if (user.property_manager_id) {
        try {
          const response = await apiService.getTenantPM();
          if (response.property_manager) {
            setLinkedPM(response.property_manager);
            setLoadingPM(false);
            return;
          }
        } catch (apiError) {
          console.log('API error, using cached PM info:', apiError);
          // If API fails but we have property_manager_id, use a fallback
          setLinkedPM({ 
            id: user.property_manager_id, 
            name: 'Your Property Manager'
          });
          setLoadingPM(false);
          return;
        }
      }
      
      // User is a homeowner without PM connection - that's fine
      setLinkedPM(null);
    } catch (error) {
      console.error('Failed to load PM:', error);
      setLinkedPM(null);
    } finally {
      setLoadingPM(false);
    }
  };

  const loadUserPropertyInfo = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.unit_number) {
        setFormData(prev => ({ ...prev, unit_number: user.unit_number }));
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  const handleSubmitDescription = async () => {
    if (!issueDescription.trim()) {
      setError('Please describe your issue');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Try to get AI suggestions for category/urgency (with timeout)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI processing timeout')), 8000)
      );
      
      const apiPromise = apiService.summarizeIssue({ message: issueDescription });
      
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      // Parse AI response for suggestions
      if (response && response.response) {
        setAiSuggestion(response.response);
        
        // Try to auto-detect category from description
        const descLower = issueDescription.toLowerCase();
        if (descLower.includes('water') || descLower.includes('leak') || descLower.includes('drain') || descLower.includes('toilet') || descLower.includes('faucet')) {
          setFormData(prev => ({ ...prev, issue_category: 'plumbing' }));
        } else if (descLower.includes('electric') || descLower.includes('outlet') || descLower.includes('light') || descLower.includes('power')) {
          setFormData(prev => ({ ...prev, issue_category: 'electrical' }));
        } else if (descLower.includes('heat') || descLower.includes('ac') || descLower.includes('air condition') || descLower.includes('cold') || descLower.includes('hot')) {
          setFormData(prev => ({ ...prev, issue_category: 'hvac' }));
        } else if (descLower.includes('appliance') || descLower.includes('dishwasher') || descLower.includes('washer') || descLower.includes('dryer') || descLower.includes('refrigerator') || descLower.includes('stove')) {
          setFormData(prev => ({ ...prev, issue_category: 'appliance' }));
        }

        // Auto-detect urgency
        if (descLower.includes('emergency') || descLower.includes('flood') || descLower.includes('fire') || descLower.includes('no heat') || descLower.includes('dangerous')) {
          setFormData(prev => ({ ...prev, urgency_level: 'emergency' }));
        } else if (descLower.includes('urgent') || descLower.includes('asap') || descLower.includes('immediately')) {
          setFormData(prev => ({ ...prev, urgency_level: 'high' }));
        }
      }

      setStep(2);
    } catch (error) {
      console.error('AI processing error:', error);
      // Auto-detect from keywords even without AI
      const descLower = issueDescription.toLowerCase();
      if (descLower.includes('water') || descLower.includes('leak') || descLower.includes('plumb')) {
        setFormData(prev => ({ ...prev, issue_category: 'plumbing' }));
      } else if (descLower.includes('electric') || descLower.includes('power')) {
        setFormData(prev => ({ ...prev, issue_category: 'electrical' }));
      }
      // Continue to form even if AI fails
      setStep(2);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateSummary = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      const response = await apiService.generateIssueSummary({
        description: issueDescription,
        form_data: formData
      });
      
      setAiSummary(response.summary);
      setStep(3);
    } catch (error) {
      console.error('Summary generation error:', error);
      // Use a basic summary if AI fails
      const category = ISSUE_CATEGORIES.find(c => c.id === formData.issue_category)?.label || formData.issue_category;
      const urgency = URGENCY_LEVELS.find(u => u.id === formData.urgency_level)?.label || formData.urgency_level;
      
      setAiSummary(`Issue Report for Unit ${formData.unit_number}\n\nCategory: ${category}\nUrgency: ${urgency}\n\nDescription:\n${issueDescription}\n\nBest Time for Visit: ${formData.best_time || 'Not specified'}\nPermission to Enter: ${formData.permission_to_enter === 'yes' ? 'Yes' : 'No'}`);
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitIssue = async () => {
    if (!linkedPM) {
      setError('You must be linked to a Property Manager to report issues. Please connect using a PM code first.');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const issueData = {
        tenant_name: user.name,
        tenant_email: user.email,
        tenant_phone: user.phone,
        property_manager_id: linkedPM.id,
        unit_number: formData.unit_number,
        issue_category: formData.issue_category,
        urgency_level: formData.urgency_level,
        description: issueDescription,
        ai_summary: aiSummary,
        best_time: formData.best_time,
        permission_to_enter: formData.permission_to_enter,
        photos: []
      };
      
      await apiService.createIssue(issueData);
      setStep(4);
      
      if (onIssueSubmitted) {
        onIssueSubmitted();
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('Failed to submit issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartNew = () => {
    setStep(1);
    setIssueDescription('');
    setAiSuggestion(null);
    setFormData({
      unit_number: '',
      issue_category: '',
      urgency_level: '',
      best_time: '',
      permission_to_enter: '',
      additional_notes: ''
    });
    setAiSummary('');
    setError('');
    loadUserPropertyInfo();
  };

  // Step 1: Simple Prompt Bar
  if (step === 1) {
    return (
      <div className="space-y-6" data-testid="report-issue-step-1">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Report an Issue</h2>
          <p className="text-gray-600 mt-2">Describe your maintenance issue and we'll help you report it</p>
        </div>

        {!linkedPM && (
          <Card className="max-w-2xl mx-auto border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <p className="text-sm text-orange-700">
                  You need to connect to a Property Manager before reporting issues. 
                  Go to the "My PM" tab to enter your PM code.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            {/* Simple Prompt Input */}
            <div className="space-y-4">
              <Label htmlFor="issue-description" className="text-base font-medium">
                What's the problem?
              </Label>
              <div className="relative">
                <textarea
                  id="issue-description"
                  data-testid="issue-description-input"
                  value={issueDescription}
                  onChange={(e) => {
                    setIssueDescription(e.target.value);
                    setError('');
                  }}
                  placeholder="Describe your issue in detail... e.g., 'The kitchen faucet is leaking and water is pooling under the sink'"
                  className="w-full p-4 border rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button 
                onClick={handleSubmitDescription}
                disabled={!issueDescription.trim() || isProcessing || !linkedPM}
                className="w-full bg-blue-600 hover:bg-blue-700"
                data-testid="continue-to-form-btn"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Our AI will help categorize your issue and suggest priority
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Details Form
  if (step === 2) {
    return (
      <div className="space-y-6" data-testid="report-issue-step-2">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Additional Details</h2>
          <p className="text-gray-600 mt-2">Help us address your issue faster</p>
        </div>

        {/* AI Suggestion Card */}
        {aiSuggestion && (
          <Card className="max-w-2xl mx-auto border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">AI Assistant</p>
                  <p className="text-sm text-blue-700 mt-1">{aiSuggestion}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 space-y-6">
            {/* Issue Description Preview */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Your issue:</p>
              <p className="text-sm text-gray-700">{issueDescription}</p>
            </div>

            {/* Unit Number */}
            <div>
              <Label htmlFor="unit_number">Unit/Apartment Number *</Label>
              <Input
                id="unit_number"
                data-testid="unit-number-input"
                value={formData.unit_number}
                onChange={(e) => handleFormChange('unit_number', e.target.value)}
                placeholder="e.g., 4B, 101, Unit 5"
                className="mt-1"
              />
            </div>

            {/* Issue Category */}
            <div>
              <Label>Issue Category *</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {ISSUE_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    data-testid={`category-${cat.id}`}
                    onClick={() => handleFormChange('issue_category', cat.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.issue_category === cat.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <cat.icon className={`w-6 h-6 mx-auto mb-1 ${cat.color}`} />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency Level */}
            <div>
              <Label>Urgency Level *</Label>
              <div className="space-y-2 mt-2">
                {URGENCY_LEVELS.map(level => (
                  <button
                    key={level.id}
                    data-testid={`urgency-${level.id}`}
                    onClick={() => handleFormChange('urgency_level', level.id)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      formData.urgency_level === level.id 
                        ? level.color + ' border-2' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span className="font-medium">{level.label}</span>
                    <span className="text-sm text-gray-500 ml-2">- {level.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Best Time */}
            <div>
              <Label htmlFor="best_time">Best Time for Maintenance Visit</Label>
              <select
                id="best_time"
                data-testid="best-time-select"
                value={formData.best_time}
                onChange={(e) => handleFormChange('best_time', e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg"
              >
                <option value="">Select preferred time...</option>
                <option value="morning">Morning (8AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 5PM)</option>
                <option value="evening">Evening (5PM - 8PM)</option>
                <option value="weekend">Weekend Only</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>

            {/* Permission to Enter */}
            <div>
              <Label>Permission to Enter if Not Home *</Label>
              <div className="flex gap-4 mt-2">
                <button
                  data-testid="permission-yes"
                  onClick={() => handleFormChange('permission_to_enter', 'yes')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    formData.permission_to_enter === 'yes'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Yes, they can enter
                </button>
                <button
                  data-testid="permission-no"
                  onClick={() => handleFormChange('permission_to_enter', 'no')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    formData.permission_to_enter === 'no'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  No, I must be present
                </button>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <Label htmlFor="additional_notes">Additional Notes (Optional)</Label>
              <textarea
                id="additional_notes"
                data-testid="additional-notes-input"
                value={formData.additional_notes}
                onChange={(e) => handleFormChange('additional_notes', e.target.value)}
                placeholder="Any other details that might help..."
                className="w-full mt-1 p-2 border rounded-lg h-20"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleGenerateSummary}
                disabled={!formData.unit_number || !formData.issue_category || !formData.urgency_level || !formData.permission_to_enter || submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                data-testid="review-submit-btn"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Review & Submit
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: Summary Review
  if (step === 3) {
    return (
      <div className="space-y-6" data-testid="report-issue-step-3">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Review Your Report</h2>
          <p className="text-gray-600 mt-2">Please review before submitting</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Issue Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                {aiSummary}
              </pre>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Unit:</span>
                <span className="ml-2">{formData.unit_number}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Category:</span>
                <span className="ml-2 capitalize">{ISSUE_CATEGORIES.find(c => c.id === formData.issue_category)?.label || formData.issue_category}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Urgency:</span>
                <span className="ml-2 capitalize">{URGENCY_LEVELS.find(u => u.id === formData.urgency_level)?.label || formData.urgency_level}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Permission:</span>
                <span className="ml-2">{formData.permission_to_enter === 'yes' ? 'Can enter' : 'Must be present'}</span>
              </div>
            </div>

            {linkedPM && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Sending to:</span> {linkedPM.business_name || linkedPM.name}
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Edit Details
              </Button>
              <Button 
                onClick={handleSubmitIssue}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
                data-testid="submit-issue-btn"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Issue Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 4: Success
  return (
    <div className="space-y-6" data-testid="report-issue-step-4">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Reported Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your maintenance request has been submitted to {linkedPM?.business_name || linkedPM?.name || 'your property manager'}. 
            They will review it and get back to you soon.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              View My Issues
            </Button>
            <Button 
              onClick={handleStartNew} 
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="report-another-btn"
            >
              Report Another Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportIssuesChat;
