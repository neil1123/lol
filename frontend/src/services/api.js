// API Service Layer for Doord Application
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Set auth token
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Remove auth token
  removeAuthToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Make API request with authentication
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ====== AUTHENTICATION ======
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token and user data
    this.setAuthToken(response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('userType', response.user.user_type);
    
    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token and user data
    this.setAuthToken(response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('userType', response.user.user_type);
    
    return response;
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  logout() {
    this.removeAuthToken();
    window.location.href = '/';
  }

  // ====== PROVIDERS ======
  async getAllProviders() {
    return await this.request('/providers');
  }

  async getProvider(providerId) {
    return await this.request(`/providers/${providerId}`);
  }

  async getProviderById(providerId) {
    return await this.request(`/providers/${providerId}`);
  }

  // ====== ORDERS ======
  async createOrder(orderData) {
    return await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return await this.request('/orders');
  }

  async getOrder(orderId) {
    return await this.request(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId, status) {
    return await this.request(`/orders/${orderId}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
    });
  }

  async updateOrderQuotation(orderId, quotationAmount, quotationDetails = null) {
    const params = new URLSearchParams({ quotation_amount: quotationAmount });
    if (quotationDetails) {
      params.append('quotation_details', quotationDetails);
    }
    return await this.request(`/orders/${orderId}/quotation?${params}`, {
      method: 'PUT',
    });
  }

  // ====== QUOTATIONS ======
  async sendQuotation(quotationData) {
    return await this.request('/quotations', {
      method: 'POST',
      body: JSON.stringify(quotationData),
    });
  }

  async updateQuotation(orderId, updateData) {
    return await this.request(`/quotations/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteQuotation(orderId) {
    return await this.request(`/quotations/${orderId}`, {
      method: 'DELETE',
    });
  }

  // ====== MESSAGES ======
  async createMessageThread(threadData) {
    return await this.request('/messages/threads', {
      method: 'POST',
      body: JSON.stringify(threadData),
    });
  }

  async getMessageThreads() {
    return await this.request('/messages/threads');
  }

  async sendMessage(messageData) {
    return await this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getMessages(threadId) {
    return await this.request(`/messages/${threadId}`);
  }

  // ====== USER PROFILE ======
  async getUserProfile() {
    return await this.request('/auth/profile');
  }

  // ====== APPOINTMENTS ======
  async createAppointment(appointmentData) {
    return await this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getAppointments() {
    return await this.request('/appointments');
  }

  // ====== SERVICES ======
  async getAllServices() {
    return await this.request('/services');
  }

  async updateProviderServices(services) {
    return await this.request('/providers/services', {
      method: 'PUT',
      body: JSON.stringify(services),
    });
  }

  async updateProviderProfile(profileData) {
    return await this.request('/providers/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;