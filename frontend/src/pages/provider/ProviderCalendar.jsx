import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import apiService from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  Menu,
  X,
  Clock,
  User,
  MapPin,
  Phone,
  FileText
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { STANDARD_PROVIDER_SIDEBAR, handleStandardLogout } from '../../constants/providerSidebarConfig';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../calendar-custom.css';

// Setup the localizer by providing the moment (or globalize, or Luxon) Object
// to the correct localizer.
const localizer = momentLocalizer(moment);

const ProviderCalendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calendarView, setCalendarView] = useState(Views.MONTH);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [popupDetails, setPopupDetails] = useState(null);
  
  // Services state
  const [availableServices, setAvailableServices] = useState([]);
  const [providerServices, setProviderServices] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Load appointments and orders from API on component mount
  useEffect(() => {
    loadAppointments();
    loadOrders();
    loadUserProfile();
    loadServices();
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const appointmentsData = await apiService.getAppointments();
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profile = await apiService.getUserProfile();
      setUserProfile(profile);
      setProviderServices(profile.services || []);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const loadServices = async () => {
    try {
      const services = await apiService.getAllServices();
      setAvailableServices(services);
    } catch (error) {
      console.error('Failed to load services:', error);
      // Fall back to default services if API fails
      setAvailableServices([
        'Home Cleaning', 'Office Cleaning', 'Window Cleaning', 'Pressure Washing', 'Gutter Cleaning',
        'Electrician', 'Plumber', 'HVAC Services', 'Handyman Services', 'Home Renovations', 'Carpenter', 'Painter',
        'Landscaping', 'Lawn Mowing & Maintenance', 'Snow Removal', 'Fence & Deck Services', 'Siding Installation & Repair',
        'Car Detailing', 'Roofing', 'Pest Control', 'Appliance Repair', 'Junk Removal'
      ]);
    }
  };

  // Convert appointments and orders to calendar events
  useEffect(() => {
    const appointmentEvents = appointments.map(apt => ({
      id: `apt-${apt.id}`,
      title: `${apt.customer_name} - ${apt.service_type}`,
      start: new Date(`${apt.date} ${apt.time || '09:00'}`),
      end: moment(`${apt.date} ${apt.time || '09:00'}`).add(1, 'hour').toDate(),
      type: 'appointment',
      data: apt
    }));

    const orderEvents = orders
      .filter(order => order.preferred_date)
      .map(order => ({
        id: `order-${order.id}`,
        title: `Order: ${order.homeowner_name} - ${order.service_type}`,
        start: new Date(`${order.preferred_date} ${order.preferred_time || '09:00'}`),
        end: moment(`${order.preferred_date} ${order.preferred_time || '09:00'}`).add(2, 'hours').toDate(),
        type: 'order',
        data: order
      }));

    setEvents([...appointmentEvents, ...orderEvents]);
  }, [appointments, orders]);


  const [appointmentForm, setAppointmentForm] = useState({
    customerName: '',
    phoneNumber: '',
    serviceType: '',
    services: [], // Array for multiple services
    date: '',
    time: '',
    address: '',
    notes: ''
  });

  const handleLogout = () => {
    handleStandardLogout(navigate);
  };

  const sidebarItems = STANDARD_PROVIDER_SIDEBAR;

  const handleServiceToggle = (serviceName) => {
    setAppointmentForm(prev => {
      const newServices = prev.services.includes(serviceName)
        ? prev.services.filter(s => s !== serviceName)
        : [...prev.services, serviceName];
      
      return {
        ...prev,
        services: newServices,
        serviceType: newServices.join(', ') // Update serviceType for backend compatibility
      };
    });
  };

  // Handle calendar slot selection (click to create appointment)
  const handleSelectSlot = useCallback(({ start }) => {
    // Prevent selecting past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to beginning of day for comparison
    
    const selectedDate = new Date(start);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      alert('Cannot create appointments for past dates');
      return;
    }
    
    const formattedDate = moment(start).format('YYYY-MM-DD');
    const formattedTime = moment(start).format('HH:mm');
    
    setAppointmentForm(prev => ({
      ...prev,
      date: formattedDate,
      time: formattedTime
    }));
    setShowAppointmentForm(true);
  }, []);

  // Handle event selection - show pop-up with details
  const handleSelectEvent = useCallback((event) => {
    console.log('Event selected:', event);
    setPopupDetails(event);
    setShowDetailPopup(true);
  }, []);

  // Handle view change
  const handleViewChange = useCallback((view) => {
    setCalendarView(view);
  }, []);

  // Auto-add customer when appointment is created
  const autoAddCustomer = async (customerData) => {
    try {
      // Check if customer already exists (by name and phone)
      const existingCustomers = JSON.parse(localStorage.getItem('providerCustomers') || '[]');
      
      const customerExists = existingCustomers.some(c => 
        c.name.toLowerCase() === customerData.name.toLowerCase() ||
        (customerData.phone && c.phone === customerData.phone)
      );

      if (!customerExists) {
        const newCustomer = {
          id: existingCustomers.length + 1,
          name: customerData.name,
          email: customerData.email || 'Not provided',
          phone: customerData.phone || 'N/A',
          address: customerData.address || 'N/A',
          totalOrders: 1,
          totalSpent: 0,
          rating: 0,
          lastOrder: new Date().toISOString(),
          status: 'active',
          notes: `Added from appointment: ${customerData.serviceType}`
        };
        
        const updatedCustomers = [...existingCustomers, newCustomer];
        localStorage.setItem('providerCustomers', JSON.stringify(updatedCustomers));
        console.log('Customer automatically added:', newCustomer);
      }
    } catch (error) {
      console.error('Failed to auto-add customer:', error);
    }
  };

  const handleCreateAppointment = async () => {
    if (appointmentForm.customerName && appointmentForm.date && appointmentForm.time && appointmentForm.serviceType) {
      try {
        // Validate date is not in the past
        const selectedDate = new Date(appointmentForm.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          alert('Cannot create appointments for past dates');
          return;
        }
        
        console.log('Creating appointment with data:', {
          customer_name: appointmentForm.customerName,
          phone_number: appointmentForm.phoneNumber,
          service_type: appointmentForm.serviceType,
          date: appointmentForm.date,
          time: appointmentForm.time,
          address: appointmentForm.address,
          notes: appointmentForm.notes,
          source: 'manual'
        });
        
        const appointmentData = {
          customer_name: appointmentForm.customerName,
          phone_number: appointmentForm.phoneNumber,
          service_type: appointmentForm.serviceType,
          services: appointmentForm.services, // Add services array
          date: appointmentForm.date,
          time: appointmentForm.time,
          address: appointmentForm.address,
          notes: appointmentForm.notes,
          source: 'manual'
        };
        
        const createdAppointment = await apiService.createAppointment(appointmentData);
        console.log('Appointment created successfully:', createdAppointment);
        
        // Auto-add customer
        await autoAddCustomer({
          name: appointmentForm.customerName,
          phone: appointmentForm.phoneNumber,
          address: appointmentForm.address,
          serviceType: appointmentForm.serviceType
        });
        
        // Reset form and reload appointments
        setAppointmentForm({
          customerName: '',
          phoneNumber: '',
          serviceType: '',
          services: [], // Reset services array
          date: '',
          time: '',
          address: '',
          notes: ''
        });
        setShowAppointmentForm(false);
        loadAppointments(); // Reload from database
        alert('Appointment created successfully!');
        
      } catch (error) {
        console.error('Failed to create appointment:', error);
        console.error('Error details:', error.message);
        alert(`Failed to create appointment: ${error.message}. Please try again.`);
      }
    } else {
      alert('Please fill in all required fields (Customer Name, Date, Time, Service Type)');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button - Only show on mobile */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center xl:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              <h1 className="text-xl md:text-2xl font-bold text-blue-600">Doord.</h1>
              <span className="text-sm text-gray-600 hidden sm:inline">for Merchants</span>
            </div>
            
            {/* Mobile Right Side */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  ES
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay - Only show on mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Navigation</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={item.id === 'calendar' ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                ))}
                <hr className="my-4" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar - Always show on desktop like homeowner explore */}
        <div className="hidden xl:block w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-blue-600">Doord.</h1>
            </div>
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant={item.id === 'calendar' ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
              <hr className="my-4" />
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </Button>
            </nav>
          </div>
        </div>

        {/* Main Content - Adjust width for desktop sidebar */}
        <div className="flex-1 xl:pl-0 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Calendar</h2>
                  <p className="text-gray-600">Manage your appointments and schedule</p>
                </div>
                <Button className="w-full sm:w-auto" onClick={() => setShowAppointmentForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Appointment
                </Button>
              </div>
            </div>

            {/* Enhanced Calendar with Day/Week/Month Views */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-lg md:text-xl">Calendar</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={calendarView === Views.MONTH ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setCalendarView(Views.MONTH)}
                    >
                      Month
                    </Button>
                    <Button 
                      variant={calendarView === Views.WEEK ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setCalendarView(Views.WEEK)}
                    >
                      Week
                    </Button>
                    <Button 
                      variant={calendarView === Views.DAY ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setCalendarView(Views.DAY)}
                    >
                      Day
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96 md:h-[600px]">
                  <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    view={calendarView}
                    onView={handleViewChange}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    selectable
                    step={30}
                    showMultiDayTimes
                    defaultDate={currentDate}
                    eventPropGetter={(event) => {
                      let backgroundColor = '#3174ad';
                      if (event.type === 'appointment') {
                        backgroundColor = '#10b981'; // Green for appointments
                      } else if (event.type === 'order') {
                        backgroundColor = '#f59e0b'; // Amber for orders
                      }
                      
                      return {
                        style: {
                          backgroundColor,
                          borderRadius: '4px',
                          opacity: 0.8,
                          color: 'white',
                          border: '0px',
                          display: 'block'
                        }
                      };
                    }}
                    components={{
                      toolbar: (props) => (
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => props.onNavigate('PREV')}>
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => props.onNavigate('TODAY')}>
                              Today
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => props.onNavigate('NEXT')}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                          <h3 className="text-lg font-semibold">{props.label}</h3>
                        </div>
                      )
                    }}
                  />
                </div>
                
                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Appointments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-500 rounded"></div>
                    <span>Scheduled Orders</span>
                  </div>
                  <p className="text-gray-600 text-xs">
                    Click on any empty slot to create a new appointment
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments & Orders</h3>
              <div className="space-y-3">
                {appointments.length === 0 && orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No upcoming appointments or scheduled orders</p>
                    <p className="text-sm">Click on the calendar to create a new appointment</p>
                  </div>
                ) : (
                  <>
                    {appointments.map((appointment, index) => (
                      <Card key={`apt-${index}`} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  Appointment
                                </Badge>
                                {appointment.customer_name} - {appointment.service_type}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {appointment.date} at {appointment.time || '09:00'}
                              </p>
                              {appointment.address && (
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {appointment.address}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button variant="outline" size="sm">Cancel</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {orders.filter(order => order.preferred_date).map((order, index) => (
                      <Card key={`order-${index}`} className="hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                                  Scheduled Order
                                </Badge>
                                {order.homeowner_name} - {order.service_type}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {order.preferred_date} at {order.preferred_time || '09:00'}
                              </p>
                              {order.homeowner_address && (
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {order.homeowner_address}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/homeservices/orders?tab=confirmed`)}
                              >
                                View Order
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleReschedule(order)}
                              >
                                Reschedule
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Appointment Form Modal */}
      {showAppointmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-lg font-semibold text-gray-900">New Appointment</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAppointmentForm(false)}
                className="hover:bg-gray-100 rounded-full p-1"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Customer Name *
                  </label>
                  <Input
                    value={appointmentForm.customerName}
                    onChange={(e) => setAppointmentForm({...appointmentForm, customerName: e.target.value})}
                    placeholder="Enter customer name"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Phone Number
                  </label>
                  <Input
                    value={appointmentForm.phoneNumber}
                    onChange={(e) => setAppointmentForm({...appointmentForm, phoneNumber: e.target.value})}
                    placeholder="(555) 123-4567"
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    Service Type * (Select multiple services)
                  </label>
                  <div className="text-xs text-gray-500">
                    {appointmentForm.services.length > 0 && `${appointmentForm.services.length} selected`}
                  </div>
                </div>
                
                {/* Selected Services Tags */}
                {appointmentForm.services.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-blue-50 rounded-md mb-2">
                    {appointmentForm.services.map((service, index) => (
                      <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                        <span>{service}</span>
                        <button
                          type="button"
                          onClick={() => handleServiceToggle(service)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Service Selection Interface */}
                <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {providerServices.map((serviceName, index) => (
                      <div key={`provider-${index}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`provider-${serviceName}`}
                          checked={appointmentForm.services.includes(serviceName)}
                          onCheckedChange={() => handleServiceToggle(serviceName)}
                        />
                        <label
                          htmlFor={`provider-${serviceName}`}
                          className="text-sm cursor-pointer text-blue-700 font-medium"
                          onClick={() => handleServiceToggle(serviceName)}
                        >
                          {serviceName}
                        </label>
                      </div>
                    ))}
                    
                    {providerServices.length === 0 && (
                      <div className="col-span-2 text-center text-gray-500 text-sm py-2">
                        No services available. Add services from your profile.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Date *
                  </label>
                  <Input
                    type="date"
                    value={appointmentForm.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Time *
                  </label>
                  <Input
                    type="time"
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Address
                </label>
                <Input
                  value={appointmentForm.address}
                  onChange={(e) => setAppointmentForm({...appointmentForm, address: e.target.value})}
                  placeholder="Service address"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Notes
                </label>
                <Textarea
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                  placeholder="Any additional notes or requirements..."
                  rows={3}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button 
                  onClick={handleCreateAppointment}
                  className="flex-1"
                  disabled={!appointmentForm.customerName || !appointmentForm.date || !appointmentForm.time || !appointmentForm.serviceType}
                >
                  Create Appointment
                </Button>
                <Button variant="outline" onClick={() => setShowAppointmentForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderCalendar;