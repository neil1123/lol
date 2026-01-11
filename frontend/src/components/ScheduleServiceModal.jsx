import React, { useState } from 'react';
import { X, Calendar, Clock, Loader2, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import apiService from '../services/api';

const ScheduleServiceModal = ({ order, onClose, onSuccess }) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [loading, setLoading] = useState(false);

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      alert('Please select both date and time');
      return;
    }

    setLoading(true);
    try {
      await apiService.scheduleService(order.id, {
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime
      });
      
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to schedule service:', error);
      alert('Failed to schedule service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md" data-testid="schedule-modal">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Service
          </h2>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Order Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold">{order.service_type}</h3>
            <p className="text-sm text-gray-600">Provider: {order.provider_name}</p>
            <p className="text-sm text-gray-600">Tenant: {order.homeowner_name}</p>
            {order.quotation_amount && (
              <p className="text-lg font-bold text-green-600 mt-2">
                Quote: ${order.quotation_amount}
              </p>
            )}
            {order.estimated_duration && (
              <p className="text-sm text-gray-500">
                Est. Duration: {order.estimated_duration}
              </p>
            )}
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Service Date *
            </label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={minDate}
              className="w-full"
              data-testid="schedule-date-input"
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Service Time *
            </label>
            <select
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              data-testid="schedule-time-input"
            >
              <option value="08:00">8:00 AM</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="13:00">1:00 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
              <option value="17:00">5:00 PM</option>
            </select>
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
            onClick={handleSchedule}
            disabled={loading || !scheduledDate}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            data-testid="confirm-schedule-btn"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Schedule Service
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleServiceModal;
