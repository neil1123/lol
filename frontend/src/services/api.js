// API Service Layer for Doord Application
// In production, REACT_APP_BACKEND_URL is automatically set by Emergent deployment
// In development, it falls back to localhost:8001
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class ApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
    console.log('API Base URL:', this.baseURL);
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

  async updateOrder(orderId, orderData) {
    return await this.request(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(orderId) {
    return await this.request(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  // ====== QUOTATIONS ======
  async sendQuotation(quotationData) {
    // Quotation requests are actually orders with status "pending_quotation"
    // Use the /orders endpoint to create a quotation request
    return await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        ...quotationData,
        service: quotationData.service_type,
      }),
    });
  }

  async updateQuotation(orderId, updateData) {
    // Update the order's quotation fields
    return await this.request(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteQuotation(orderId) {
    // Delete the order (quotation request)
    return await this.request(`/orders/${orderId}`, {
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
    return await this.request('/me');
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

  async updateAppointment(appointmentId, updateData) {
    return await this.request(`/appointments/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
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

  // ====== CUSTOMERS ======
  async getCustomers() {
    return await this.request('/customers');
  }

  async createCustomer(customerData) {
    return await this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(customerId, customerData) {
    return await this.request(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(customerId) {
    return await this.request(`/customers/${customerId}`, {
      method: 'DELETE',
    });
  }

  // ====== REVIEWS ======
  async submitReview(reviewData) {
    return await this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getProviderReviews(providerId) {
    return await this.request(`/providers/${providerId}/reviews`);
  }

  // ====== AI ISSUE REPORTING ======
  async summarizeIssue(data) {
    return await this.request('/ai/summarize-issue', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateIssueSummary(data) {
    return await this.request('/ai/generate-summary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ====== REPORTED ISSUES ======
  async createIssue(issueData) {
    return await this.request('/issues', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  }

  async getIssues() {
    return await this.request('/issues');
  }

  async getIssue(issueId) {
    return await this.request(`/issues/${issueId}`);
  }

  async updateIssue(issueId, updateData) {
    return await this.request(`/issues/${issueId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // ====== PROPERTY MANAGER ======
  async getPropertyManagerTenants() {
    return await this.request('/property-manager/tenants');
  }

  async getPropertyManagerOrders() {
    return await this.request('/property-manager/orders');
  }

  async approvePropertyManagerOrder(orderId) {
    return await this.request(`/property-manager/orders/${orderId}/approve`, {
      method: 'PUT',
    });
  }

  async denyPropertyManagerOrder(orderId) {
    return await this.request(`/property-manager/orders/${orderId}/deny`, {
      method: 'PUT',
    });
  }

  async getPropertyManagerProperties() {
    return await this.request('/property-manager/properties');
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;