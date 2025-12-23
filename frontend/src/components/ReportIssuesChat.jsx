import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Home,
  Zap,
  Droplets,
  Wrench,
  Thermometer,
  HelpCircle
} from 'lucide-react';
import apiService from '../services/api';

const ISSUE_CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', icon: Droplets, color: 'text-blue-500' },
  { id: 'electrical', label: 'Electrical', icon: Zap, color: 'text-yellow-500' },
  { id: 'hvac', label: 'HVAC', icon: Thermometer, color: 'text-red-500' },
  { id: 'appliance', label: 'Appliance', icon: Wrench, color: 'text-gray-500' },
  { id: 'structural', label: 'Structural', icon: Home, color: 'text-brown-500' },
  { id: 'other', label: 'Other', icon: HelpCircle, color: 'text-purple-500' },
];

const URGENCY_LEVELS = [
  { id: 'emergency', label: 'Emergency', description: 'Immediate danger or major damage', color: 'bg-red-100 border-red-500 text-red-700' },
  { id: 'high', label: 'High', description: 'Significant inconvenience', color: 'bg-orange-100 border-orange-500 text-orange-700' },
  { id: 'medium', label: 'Medium', description: 'Can wait a few days', color: 'bg-yellow-100 border-yellow-500 text-yellow-700' },
  { id: 'low', label: 'Low', description: 'Minor issue, no rush', color: 'bg-green-100 border-green-500 text-green-700' },
];

const ReportIssuesChat = ({ propertyManagers = [], onIssueSubmitted }) => {
  const [step, setStep] = useState(1); // 1: Chat, 2: Form, 3: Summary, 4: Success
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm here to help you report a maintenance issue. Please describe the problem you're experiencing in detail. What's going on?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [sessionId, setSessionId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    unit_number: '',
    issue_category: '',
    urgency_level: '',
    best_time: '',
    permission_to_enter: '',
    additional_notes: '',
    property_manager_id: propertyManagers[0]?.id || ''
  });
  
  const [aiSummary, setAiSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      const response = await apiService.summarizeIssue({ message: userMessage });
      
      if (response.session_id) {
        setSessionId(response.session_id);
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
      
      // Store the description
      setIssueDescription(prev => prev + (prev ? '\n' : '') + userMessage);
      
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble processing your request. Let's continue with the form to capture all the details."
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProceedToForm = () => {
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: "Great, I've noted down your issue. Now let's gather some additional details to help the property manager address this quickly."
    }]);
    setStep(2);
  };
  
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleGenerateSummary = async () => {
    setSubmitting(true);
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
      setAiSummary(`Issue Report for Unit ${formData.unit_number}\n\nCategory: ${formData.issue_category}\nUrgency: ${formData.urgency_level}\n\nDescription: ${issueDescription}`);
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleSubmitIssue = async () => {
    setSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const issueData = {
        tenant_name: user.name,
        tenant_email: user.email,
        tenant_phone: user.phone,
        property_manager_id: formData.property_manager_id,
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
      alert('Failed to submit issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleStartNew = () => {
    setStep(1);
    setMessages([{
      role: 'assistant',
      content: "Hello! I'm here to help you report a maintenance issue. Please describe the problem you're experiencing in detail. What's going on?"
    }]);
    setInputMessage('');
    setIssueDescription('');
    setFormData({
      unit_number: '',
      issue_category: '',
      urgency_level: '',
      best_time: '',
      permission_to_enter: '',
      additional_notes: '',
      property_manager_id: propertyManagers[0]?.id || ''
    });
    setAiSummary('');
  };
  
  // Step 1: AI Chat
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Report an Issue</h2>
          <p className="text-gray-600 mt-2">Describe your maintenance issue and I'll help you report it</p>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-0">
            {/* Chat Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border shadow-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border rounded-lg p-3 shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Describe your issue..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !inputMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {issueDescription && (
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    onClick={handleProceedToForm}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Continue to Details Form →
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Step 2: Form
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Additional Details</h2>
          <p className="text-gray-600 mt-2">Please provide more information to help us address your issue</p>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 space-y-6">
            {/* Unit Number */}
            <div>
              <Label htmlFor="unit_number">Unit/Apartment Number *</Label>
              <Input
                id="unit_number"
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
                value={formData.additional_notes}
                onChange={(e) => handleFormChange('additional_notes', e.target.value)}
                placeholder="Any other details that might help..."
                className="w-full mt-1 p-2 border rounded-lg h-20"
              />
            </div>
            
            {/* Submit Button */}
            <Button 
              onClick={handleGenerateSummary}
              disabled={!formData.unit_number || !formData.issue_category || !formData.urgency_level || !formData.permission_to_enter || submitting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Summary...
                </>
              ) : (
                'Review & Submit →'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Step 3: Summary Review
  if (step === 3) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Review Your Report</h2>
          <p className="text-gray-600 mt-2">Please review the summary before submitting</p>
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
                <span className="ml-2 capitalize">{formData.issue_category}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Urgency:</span>
                <span className="ml-2 capitalize">{formData.urgency_level}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Permission:</span>
                <span className="ml-2">{formData.permission_to_enter === 'yes' ? 'Can enter' : 'Must be present'}</span>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                ← Edit Details
              </Button>
              <Button 
                onClick={handleSubmitIssue}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Issue Report'
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
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Reported Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your maintenance request has been submitted to the property manager. 
            They will review it and get back to you soon.
          </p>
          <Button onClick={handleStartNew} className="bg-blue-600 hover:bg-blue-700">
            Report Another Issue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportIssuesChat;
