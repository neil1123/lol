import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, DollarSign } from 'lucide-react';
import apiService from '../services/api';

const PMCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'list'

  useEffect(() => {
    loadCalendarEvents();
  }, [currentDate]);

  const loadCalendarEvents = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPMCalendar();
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to load calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, date: null });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dayDate);
      days.push({ day: i, date: dayDate, events: dayEvents });
    }
    
    return days;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-300';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const selectedDateEvents = selectedDate 
    ? events.filter(e => e.date === selectedDate)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="pm-calendar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">Service Calendar</h2>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[180px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {days.map((dayData, index) => (
                  <div
                    key={index}
                    className={`min-h-[80px] border rounded-lg p-1 ${
                      dayData.day ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                    } ${selectedDate === dayData.date ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => dayData.day && setSelectedDate(dayData.date)}
                    data-testid={dayData.date ? `calendar-day-${dayData.date}` : undefined}
                  >
                    {dayData.day && (
                      <>
                        <div className="text-sm font-medium text-gray-700">{dayData.day}</div>
                        <div className="space-y-1 mt-1">
                          {dayData.events?.slice(0, 2).map((event, idx) => (
                            <div
                              key={idx}
                              className={`text-xs p-1 rounded truncate ${getStatusColor(event.status)}`}
                              title={event.title}
                            >
                              {event.time?.slice(0, 5)} {event.title?.split(' - ')[0]}
                            </div>
                          ))}
                          {dayData.events?.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayData.events.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate 
                  ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Select a Date'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event, idx) => (
                      <div key={idx} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{event.title?.split(' - ')[0]}</span>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {event.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {event.tenant_name}
                          </div>
                          {event.provider_name && (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              {event.provider_name}
                            </div>
                          )}
                          {event.quotation_amount && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              ${event.quotation_amount}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No services scheduled</p>
                )
              ) : (
                <p className="text-gray-500 text-center py-4">Click on a date to see scheduled services</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-4">
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event, idx) => (
                  <div key={idx} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })} at {event.time}
                      </div>
                      <div className="text-sm text-gray-500">
                        Provider: {event.provider_name}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {event.quotation_amount && (
                        <span className="text-lg font-semibold text-green-600">
                          ${event.quotation_amount}
                        </span>
                      )}
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No scheduled services</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PMCalendar;
