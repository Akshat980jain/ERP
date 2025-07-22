const API_BASE_URL = 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('educonnect_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Notifications
  async getNotifications(params?: { category?: string; read?: string }) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/notifications${queryString}`);
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', { method: 'PUT' });
  }

  // Academic
  async getCourses() {
    return this.request('/academic/courses');
  }

  async getAttendance(courseId?: string) {
    const queryString = courseId ? `?courseId=${courseId}` : '';
    return this.request(`/academic/attendance${queryString}`);
  }

  async getMarks(courseId?: string) {
    const queryString = courseId ? `?courseId=${courseId}` : '';
    return this.request(`/academic/marks${queryString}`);
  }

  // Library
  async getBooks(params?: { search?: string; category?: string; searchType?: string }) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/library/books${queryString}`);
  }

  async getBookIssues() {
    return this.request('/library/issues');
  }

  // Placement
  async getJobs(params?: { type?: string; status?: string }) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/placement/jobs${queryString}`);
  }

  async getJobApplications() {
    return this.request('/placement/applications');
  }

  async applyForJob(jobId: string, resume: string, coverLetter?: string) {
    return this.request('/placement/apply', {
      method: 'POST',
      body: JSON.stringify({ jobId, resume, coverLetter })
    });
  }

  async getPlacementStats() {
    return this.request('/placement/stats');
  }

  // Finance
  async getFees() {
    return this.request('/finance/fees');
  }

  async payFee(feeId: string, paymentMethod: string, transactionId: string) {
    return this.request(`/finance/fees/${feeId}/pay`, {
      method: 'PUT',
      body: JSON.stringify({ paymentMethod, transactionId })
    });
  }

  async getPaymentHistory() {
    return this.request('/finance/payment-history');
  }

  // Student Services
  async getStudentServices() {
    return this.request('/services');
  }

  async applyForService(type: string, reason: string, documents?: string[]) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify({ type, reason, documents })
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;