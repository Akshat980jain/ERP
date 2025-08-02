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

  async request<T>(
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

  async updateProfile(profileData: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    studentId?: string;
    employeeId?: string;
    semester?: string;
    section?: string;
    department?: string;
  }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
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
  async getAttendance(courseId?: string) {
    const queryString = courseId ? `?courseId=${courseId}` : '';
    return this.request(`/academic/attendance${queryString}`);
  }

  async updateAttendance(attendanceData: {
    courseId: string;
    studentId: string;
    date: string;
    status: 'present' | 'absent';
    remarks?: string;
  }) {
    return this.request('/academic/attendance', {
      method: 'PUT',
      body: JSON.stringify(attendanceData)
    });
  }

  // Schedule-based attendance methods
  async getScheduleAttendance(courseId: string, date: string): Promise<{
    success: boolean;
    course: {
      _id: string;
      name: string;
      code: string;
    };
    date: string;
    dayOfWeek: string;
    schedule: Array<{
      day: string;
      time: string;
      room: string;
    }>;
    attendanceMatrix: Array<{
      slot: {
        day: string;
        time: string;
        room: string;
      };
      attendance: Array<{
        student: {
          _id: string;
          name: string;
          email: string;
          studentId: string;
        };
        status: 'present' | 'absent' | 'late' | null;
        markedAt: string | null;
        isWithinSchedule: boolean;
        remarks: string;
      }>;
    }>;
    message?: string;
  }> {
    return this.request(`/academic/schedule-attendance?courseId=${courseId}&date=${date}`);
  }

  async markScheduleAttendance(data: {
    courseId: string;
    date: string;
    scheduleSlot: {
      startTime: string;
      endTime: string;
    };
    attendanceData: Array<{
      studentId: string;
      status: 'present' | 'absent' | 'late';
      remarks?: string;
    }>;
  }): Promise<{
    success: boolean;
    message: string;
    results: Array<{
      studentId: string;
      status: string;
    }>;
    isWithinTimeWindow: boolean;
  }> {
    return this.request('/academic/schedule-attendance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getAttendanceSchedule(courseId: string): Promise<{
    success: boolean;
    course: {
      _id: string;
      name: string;
      code: string;
    };
    date: string;
    dayOfWeek: string;
    schedule: Array<{
      day: string;
      time: string;
      room: string;
      attendanceCount: number;
      markedCount: number;
    }>;
  }> {
    return this.request(`/academic/attendance-schedule?courseId=${courseId}`);
  }

  async enrollStudent(courseId: string, studentId: string) {
    return this.request(`/courses/${courseId}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ studentId })
    });
  }

  // Course management
  async getCourses() {
    return this.request('/courses');
  }

  async getMyCourses() {
    return this.request('/courses/my-courses');
  }

  async getFacultyCourses() {
    return this.request('/courses/faculty-courses');
  }

  async createCourse(courseData: Record<string, unknown>) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  }

  async updateCourse(courseId: string, courseData: Record<string, unknown>) {
    return this.request(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
  }

  async deleteCourse(courseId: string) {
    return this.request(`/courses/${courseId}`, {
      method: 'DELETE'
    });
  }

  // Marks
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

  // Schedule methods
  async getSchedule() {
    return this.request('/schedule');
  }

  async addScheduleItem(scheduleData: Record<string, unknown>) {
    return this.request('/schedule', {
      method: 'POST',
      body: JSON.stringify(scheduleData)
    });
  }

  async updateScheduleItem(id: string, scheduleData: Record<string, unknown>) {
    return this.request(`/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData)
    });
  }

  async deleteScheduleItem(id: string, scheduleData: Record<string, unknown>) {
    return this.request(`/schedule/${id}`, {
      method: 'DELETE',
      body: JSON.stringify(scheduleData)
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;