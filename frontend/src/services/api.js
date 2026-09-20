const API_BASE = '/api';

async function fetchJSON(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMsg = `Error ${response.status}: ${response.statusText}`;
    let errData = {};
    try {
      const errObj = await response.json();
      if (errObj) {
        errData = errObj;
        if (errObj.error || errObj.message) {
          errorMsg = errObj.error || errObj.message;
        }
      }
    } catch {
      // Ignored
    }
    const error = new Error(errorMsg);
    Object.assign(error, errData, { status: response.status });
    throw error;
  }


  return response.json();
}

export const api = {
  // Authentication
  login: (credentials) => fetchJSON('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  googleLogin: (googleData) => fetchJSON('/auth/google-login', { method: 'POST', body: JSON.stringify(googleData) }),
  getAdminStatus: () => fetchJSON('/auth/admin-status'),
  registerAdmin: (adminData) => fetchJSON('/auth/register-admin', { method: 'POST', body: JSON.stringify(adminData) }),
  verifyMemberCode: (code) => fetchJSON(`/registration-codes/verify/${encodeURIComponent(code)}`).catch(() => fetchJSON(`/auth/verify-code/${encodeURIComponent(code)}`)),
  registerMemberWithCode: (data) => fetchJSON('/auth/register-member', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (data) => fetchJSON('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data) => fetchJSON('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  // Registration Code Generator & Redemption
  getRegistrationCodes: (status = 'ALL') =>
    fetchJSON(`/registration-codes${status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : ''}`),
  generateRegistrationCodes: (payload) =>
    fetchJSON('/registration-codes/generate', { method: 'POST', body: JSON.stringify(payload) }),
  verifyRegistrationCode: (code) =>
    fetchJSON(`/registration-codes/verify/${encodeURIComponent(code)}`),
  redeemRegistrationCode: (payload) =>
    fetchJSON('/registration-codes/redeem', { method: 'POST', body: JSON.stringify(payload) }),
  revokeRegistrationCode: (id) =>
    fetchJSON(`/registration-codes/${id}`, { method: 'DELETE' }),

  // Real-Time Notifications
  getNotifications: (memberId) => fetchJSON(`/notifications${memberId ? `?memberId=${memberId}` : ''}`),
  getUnreadNotificationCount: (memberId) => fetchJSON(`/notifications/unread-count?memberId=${memberId}`),
  markNotificationRead: (id) => fetchJSON(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: (memberId) => fetchJSON(`/notifications/mark-all-read?memberId=${memberId}`, { method: 'POST' }),

  // Chat & Messaging
  getChatMessages: (channel = 'GENERAL') => fetchJSON(`/chat/messages?channel=${encodeURIComponent(channel)}`),
  sendChatMessage: (payload) => fetchJSON('/chat/messages', { method: 'POST', body: JSON.stringify(payload) }),
  deleteChatMessage: (id) => fetchJSON(`/chat/messages/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboardStats: () => fetchJSON('/dashboard/stats'),

  // Members & Profile
  getMembers: (query = '') => fetchJSON(`/members${query ? `?query=${encodeURIComponent(query)}` : ''}`),
  getMemberSummaries: () => fetchJSON('/members/summaries'),
  getMemberById: (id) => fetchJSON(`/members/${id}`),
  getMemberByCode: (code) => fetchJSON(`/members/code/${encodeURIComponent(code)}`),
  getMemberSummary: (id) => fetchJSON(`/members/${id}/summary`),
  createMember: (member) => fetchJSON('/members', { method: 'POST', body: JSON.stringify(member) }),
  updateMember: (id, member) => fetchJSON(`/members/${id}`, { method: 'PUT', body: JSON.stringify(member) }),
  updateProfile: (id, member) => fetchJSON(`/members/${id}`, { method: 'PUT', body: JSON.stringify(member) }),
  deleteMember: (id) => fetchJSON(`/members/${id}`, { method: 'DELETE' }),
  cleanSlateMembers: (preserveAdminId) => fetchJSON(`/members/clean-slate${preserveAdminId ? `?preserveAdminId=${preserveAdminId}` : ''}`, { method: 'POST' }),

  // Dues Schedules
  getSchedules: (activeOnly = false) => fetchJSON(`/dues-schedules${activeOnly ? '?activeOnly=true' : ''}`),
  getScheduleProgress: () => fetchJSON('/dues-schedules/progress'),
  getScheduleById: (id) => fetchJSON(`/dues-schedules/${id}`),
  createSchedule: (schedule) => fetchJSON('/dues-schedules', { method: 'POST', body: JSON.stringify(schedule) }),
  updateSchedule: (id, schedule) => fetchJSON(`/dues-schedules/${id}`, { method: 'PUT', body: JSON.stringify(schedule) }),
  deleteSchedule: (id) => fetchJSON(`/dues-schedules/${id}`, { method: 'DELETE' }),

  // Payments & Receipts
  getPayments: (keyword = '') => fetchJSON(`/payments${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`),
  getRecentPayments: () => fetchJSON('/payments/recent'),
  getPaymentById: (id) => fetchJSON(`/payments/${id}`),
  getPaymentByReceipt: (receiptNumber) => fetchJSON(`/payments/receipt/${encodeURIComponent(receiptNumber)}`),
  getPaymentsByMember: (memberId) => fetchJSON(`/payments/member/${memberId}`),
  getPaymentsBySchedule: (scheduleId) => fetchJSON(`/payments/schedule/${scheduleId}`),
  recordPayment: (paymentData) => fetchJSON('/payments', { method: 'POST', body: JSON.stringify(paymentData) }),
  updatePaymentStatus: (id, status) => fetchJSON(`/payments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deletePayment: (id) => fetchJSON(`/payments/${id}`, { method: 'DELETE' }),

  // Announcements
  getAnnouncements: () => fetchJSON('/announcements'),
  getRecentAnnouncements: () => fetchJSON('/announcements/recent'),
  getAnnouncementById: (id) => fetchJSON(`/announcements/${id}`),
  createAnnouncement: (announcement, authorId) =>
    fetchJSON(`/announcements${authorId ? `?authorId=${authorId}` : ''}`, { method: 'POST', body: JSON.stringify(announcement) }),
  updateAnnouncement: (id, announcement) =>
    fetchJSON(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(announcement) }),
  deleteAnnouncement: (id) => fetchJSON(`/announcements/${id}`, { method: 'DELETE' }),
};
