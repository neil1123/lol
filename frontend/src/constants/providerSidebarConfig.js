/**
 * STANDARDIZED PROVIDER SIDEBAR CONFIGURATION
 * 
 * This is the definitive sidebar structure that ALL provider pages MUST use.
 * No deviations allowed to ensure 100% consistency.
 */

import { 
  Home, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  Package
} from 'lucide-react';

export const STANDARD_PROVIDER_SIDEBAR = [
  { id: 'home', label: 'Dashboard', icon: Home, path: '/homeservices/dashboard' },
  { id: 'orders', label: 'Orders', icon: Package, path: '/homeservices/orders' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/homeservices/messages' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/homeservices/calendar' },
  { id: 'customers', label: 'Customers', icon: Users, path: '/homeservices/customers' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/homeservices/settings' }
];

/**
 * STANDARD LOGOUT FUNCTION
 * Use this exact function in all provider pages
 */
export const handleStandardLogout = (navigate) => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userType');
  navigate('/homeservices');
};