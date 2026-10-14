// Zenve Vet™ — API Client for Spring Boot Backend (http://localhost:8080/api/v1)

const BASE_URL = 'http://localhost:8080/api/v1';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API error ${res.status}: ${errText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Fetch error for ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    login: (identifier, password) => 
      fetchJson('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      }),
    register: (userData) => 
      fetchJson('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      })
  },

  // Doctors / Profiles
  doctors: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return fetchJson(`/doctors${qs ? '?' + qs : ''}`);
    },
    getById: (id) => fetchJson(`/doctors/${id}`),
    update: (id, data) => fetchJson(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    create: (data) => fetchJson('/doctors', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Connection System
  connections: {
    getSuggestions: (doctorId) => fetchJson(`/connections/suggestions?doctorId=${doctorId}`),
    getPending: (doctorId) => fetchJson(`/connections/pending?doctorId=${doctorId}`),
    getSent: (doctorId) => fetchJson(`/connections/sent?doctorId=${doctorId}`),
    getMy: (doctorId) => fetchJson(`/connections/my?doctorId=${doctorId}`),
    sendRequest: (senderId, senderName, senderAvatar, senderSpecialty, receiverId) =>
      fetchJson('/connections/request', {
        method: 'POST',
        body: JSON.stringify({ senderId, senderName, senderAvatar, senderSpecialty, receiverId })
      }),
    acceptRequest: (requestId) =>
      fetchJson(`/connections/${requestId}/accept`, { method: 'POST' }),
    rejectRequest: (requestId) =>
      fetchJson(`/connections/${requestId}/reject`, { method: 'POST' }),
    cancelRequest: (requestId) =>
      fetchJson(`/connections/${requestId}/cancel`, { method: 'DELETE' }),
    disconnect: (currentDoctorId, targetDoctorId) =>
      fetchJson(`/connections/disconnect/${targetDoctorId}?currentDoctorId=${currentDoctorId}`, { method: 'DELETE' })
  },

  // Feed & Posts
  feed: {
    getPosts: (type) => {
      const qs = type && type !== 'all' ? `?type=${encodeURIComponent(type)}` : '';
      return fetchJson(`/feed${qs}`);
    },
    createPost: (post) =>
      fetchJson('/feed/posts', {
        method: 'POST',
        body: JSON.stringify(post)
      }),
    updatePost: (id, data) =>
      fetchJson(`/feed/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    deletePost: (id) =>
      fetchJson(`/feed/posts/${id}`, { method: 'DELETE' }),
    toggleLike: (postId, doctorId = 1, doctorName = 'Dr. You') =>
      fetchJson(`/feed/posts/${postId}/like?doctorId=${doctorId}&doctorName=${encodeURIComponent(doctorName)}`, {
        method: 'POST'
      }),
    getComments: (postId) => fetchJson(`/feed/posts/${postId}/comments`),
    addComment: (postId, comment) =>
      fetchJson(`/feed/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify(comment)
      }),
    toggleBookmark: (postId, doctorId = 1) =>
      fetchJson(`/feed/posts/${postId}/bookmark?doctorId=${doctorId}`, {
        method: 'POST'
      }),
    getSaved: (doctorId = 1) => fetchJson(`/feed/posts/saved?doctorId=${doctorId}`),
    reportPost: (postId, reporterId = 1, reason = 'Inappropriate content') =>
      fetchJson(`/feed/posts/${postId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reporterId, reason })
      })
  },

  // 1-to-1 Chat
  chat: {
    getConversations: (doctorId = 1) => fetchJson(`/chat/conversations?doctorId=${doctorId}`),
    startConversation: (doctor1Id, doctor2Id, initialMessage) =>
      fetchJson('/chat/conversations/start', {
        method: 'POST',
        body: JSON.stringify({ doctor1Id, doctor2Id, initialMessage })
      }),
    getMessages: (conversationId) => fetchJson(`/chat/conversations/${conversationId}/messages`),
    sendMessage: (msg) =>
      fetchJson('/chat/messages', {
        method: 'POST',
        body: JSON.stringify(msg)
      }),
    markAsRead: (conversationId, doctorId = 1) =>
      fetchJson(`/chat/conversations/${conversationId}/read?doctorId=${doctorId}`, {
        method: 'PUT'
      })
  },

  // Notifications
  notifications: {
    getNotifications: (doctorId = 1) => fetchJson(`/notifications?doctorId=${doctorId}`),
    getUnreadCount: (doctorId = 1) => fetchJson(`/notifications/unread-count?doctorId=${doctorId}`),
    markAsRead: (id) => fetchJson(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllAsRead: (doctorId = 1) => fetchJson(`/notifications/read-all?doctorId=${doctorId}`, { method: 'PUT' })
  },

  // Short Videos
  videos: {
    getAll: () => fetchJson('/videos'),
    create: (video) => fetchJson('/videos', {
      method: 'POST',
      body: JSON.stringify(video)
    })
  },

  // Clinical Cases
  cases: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return fetchJson(`/cases${qs ? '?' + qs : ''}`);
    },
    getById: (id) => fetchJson(`/cases/${id}`),
    create: (caseData) => fetchJson('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData)
    })
  }
};
