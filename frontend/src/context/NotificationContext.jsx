import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    orders: 0,
    messages: 0,
    total: 0
  });

  const updateNotifications = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) return;

      // Get unread orders count (pending quotations)
      const orders = await apiService.getOrders();
      const pendingOrders = orders.filter(order => 
        order.status === 'pending_quotation' && order.provider_id === user.id
      ).length;

      // Get unread messages count
      const messageThreads = await apiService.getMessageThreads();
      const unreadMessages = messageThreads.reduce((count, thread) => 
        count + (thread.unread_count || 0), 0
      );

      const newNotifications = {
        orders: pendingOrders,
        messages: unreadMessages,
        total: pendingOrders + unreadMessages
      };

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Failed to update notifications:', error);
    }
  };

  useEffect(() => {
    // Update notifications on mount
    updateNotifications();

    // Set up interval to update notifications every 30 seconds
    const interval = setInterval(updateNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    updateNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};