// Zenve Vet™ — API Client for Spring Boot Backend (http://localhost:8080/api/v1)

const BASE_URL = 'http://localhost:8080/api/v1';

let lastAuthUnauthorizedTime = 0;

async function fetchJson(endpoint, options = {}) {
  const isAdvertiser = options.isAdvertiser || endpoint.startsWith('/advertisers') || endpoint.startsWith('/campaigns');

  let authHeader = null;
  if (isAdvertiser) {
    if (options.headers?.Authorization) {
      authHeader = options.headers.Authorization;
    } else {
      const advToken = localStorage.getItem('zenve_advertiser_token');
      if (advToken) authHeader = `Bearer ${advToken}`;
    }
  } else {
    if (options.headers?.Authorization) {
      authHeader = options.headers.Authorization;
    } else {
      const docToken = localStorage.getItem('doctor_vet_token');
      if (docToken) authHeader = `Bearer ${docToken}`;
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(authHeader ? { 'Authorization': authHeader } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 401) {
      if (isAdvertiser) {
        console.warn(`Unauthorized advertiser request on ${endpoint}. Clearing advertiser credentials.`);
        localStorage.removeItem('zenve_advertiser_token');
        localStorage.removeItem('zenve_advertiser_account');
        window.dispatchEvent(new CustomEvent('advertiser:unauthorized', { detail: { endpoint } }));
        throw new Error('Unauthorized: Advertiser session expired or invalid credentials');
      } else {
        const isAuthPublic = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');
        if (!isAuthPublic) {
          const now = Date.now();
          if (now - lastAuthUnauthorizedTime > 1500) {
            lastAuthUnauthorizedTime = now;
            console.warn(`Unauthorized request on ${endpoint}. Clearing doctor session.`);
            localStorage.removeItem('doctor_vet_user');
            localStorage.removeItem('doctor_vet_token');
            window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { endpoint } }));
          }
        }
        throw new Error('Unauthorized: Session expired or invalid credentials');
      }
    }

    if (!res.ok) {
      const errText = await res.text();
      let errorMsg = `HTTP ${res.status}: ${errText}`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.message) errorMsg = parsed.message;
        else if (parsed.error) errorMsg = parsed.error;
      } catch (e) { }
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (err) {
    if (err.message?.includes('Unauthorized')) {
      throw err;
    }
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
      }),
    getMe: () => fetchJson('/auth/me'),
    logout: () => fetchJson('/auth/logout', { method: 'POST' }).catch(() => ({}))
  },

  // Doctors / Profiles
  doctors: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return fetchJson(`/doctors${qs ? '?' + qs : ''}`);
    },
    getById: (id) => fetchJson(`/doctors/${id}`),
    update: (id, data) => {
      const cleanId = id ? (String(id).replace(/^[^\d]+/g, '') || id) : '1';
      return fetchJson(`/doctors/${cleanId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
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

  // Stories (24h ephemeral)
  stories: {
    getAll: () => fetchJson('/stories'),
    create: (story) => fetchJson('/stories', {
      method: 'POST',
      body: JSON.stringify(story)
    })
  },

  // Media File Upload
  media: {
    upload: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${BASE_URL}/media/upload`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        throw new Error(`Media upload failed with HTTP ${res.status}`);
      }
      return await res.json();
    }
  },

  // Unified Search
  search: {
    query: (q) => fetchJson(`/search?q=${encodeURIComponent(q || '')}`)
  },

  // AI Assistant Clinical Engine
  ai: {
    diagnose: (data) => fetchJson('/ai-assist/diagnose', {
      method: 'POST',
      body: JSON.stringify(data)
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
    }),
    delete: (id) => {
      const cleanId = String(id).replace(/^vid-/i, '');
      return fetchJson(`/videos/${cleanId}`, { method: 'DELETE' });
    },
    getComments: (id) => fetchJson(`/videos/${id}/comments`).catch(() => []),
    addComment: (id, comment) => fetchJson(`/videos/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment)
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
    }),
    delete: (id) => {
      const cleanId = String(id).replace(/^case-/i, '');
      return fetchJson(`/cases/${cleanId}`, { method: 'DELETE' });
    }
  },

  // Communities (Facebook-style Dynamic Groups)
  communities: {
    getAll: (currentDoctorId) => {
      const qs = currentDoctorId ? `?currentDoctorId=${currentDoctorId}` : '';
      return fetchJson(`/communities${qs}`);
    },
    getById: (id, currentDoctorId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const qs = currentDoctorId ? `?currentDoctorId=${currentDoctorId}` : '';
      return fetchJson(`/communities/${cleanId}${qs}`);
    },
    create: (data, creatorId) => {
      const qs = creatorId ? `?creatorId=${creatorId}` : '';
      return fetchJson(`/communities${qs}`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    delete: (id, doctorId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/${cleanId}${qs}`, {
        method: 'DELETE'
      });
    },
    updateCover: (id, coverImage, doctorId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/${cleanId}/cover${qs}`, {
        method: 'PUT',
        body: JSON.stringify({ coverImage })
      });
    },
    join: (id, doctorId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/${cleanId}/join${qs}`, {
        method: 'POST'
      });
    },
    leave: (id, doctorId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/${cleanId}/leave${qs}`, {
        method: 'POST'
      });
    },
    invite: (id, targetDoctorId, currentDoctorId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const qs = `?doctorId=${targetDoctorId}${currentDoctorId ? `&currentDoctorId=${currentDoctorId}` : ''}`;
      return fetchJson(`/communities/${cleanId}/invite${qs}`, {
        method: 'POST'
      });
    },
    addPost: (id, postData, doctorId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/${cleanId}/posts${qs}`, {
        method: 'POST',
        body: JSON.stringify(postData)
      });
    },
    deletePost: (id, postId, doctorId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const cleanPostId = String(postId).replace(/^cp-/i, '');
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/${cleanId}/posts/${cleanPostId}${qs}`, {
        method: 'DELETE'
      });
    },
    toggleLike: (id, postId, doctorId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const cleanPostId = String(postId).replace(/^cp-/i, '');
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/${cleanId}/posts/${cleanPostId}/like${qs}`, {
        method: 'POST'
      });
    },
    addComment: (id, postId, text, authorId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const cleanPostId = String(postId).replace(/^cp-/i, '');
      const qs = authorId ? `?authorId=${authorId}` : '';
      return fetchJson(`/communities/${cleanId}/posts/${cleanPostId}/comments${qs}`, {
        method: 'POST',
        body: JSON.stringify({ text })
      });
    },
    addCase: (id, caseData, authorId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const qs = authorId ? `?authorId=${authorId}` : '';
      return fetchJson(`/communities/${cleanId}/cases${qs}`, {
        method: 'POST',
        body: JSON.stringify(caseData)
      });
    },
    deleteCase: (id, caseId, doctorId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const cleanCaseId = String(caseId).replace(/^cc-/i, '');
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/${cleanId}/cases/${cleanCaseId}${qs}`, {
        method: 'DELETE'
      });
    },
    addReel: (id, reelData, authorId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const qs = authorId ? `?authorId=${authorId}` : '';
      return fetchJson(`/communities/${cleanId}/reels${qs}`, {
        method: 'POST',
        body: JSON.stringify(reelData)
      });
    },
    deleteReel: (id, reelId, doctorId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const cleanReelId = String(reelId).replace(/^cr-/i, '');
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/${cleanId}/reels/${cleanReelId}${qs}`, {
        method: 'DELETE'
      });
    },
    sendMessage: (id, text, senderId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const qs = senderId ? `?senderId=${senderId}` : '';
      return fetchJson(`/communities/${cleanId}/messages${qs}`, {
        method: 'POST',
        body: JSON.stringify({ text })
      });
    },
    joinByCode: (code, doctorId) => {
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/join-by-code${qs}`, {
        method: 'POST',
        body: JSON.stringify({ code })
      });
    },
    acceptInvite: (inviteId, doctorId) => {
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/invites/${inviteId}/accept${qs}`, {
        method: 'POST'
      });
    },
    rejectInvite: (inviteId, doctorId) => {
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/invites/${inviteId}/reject${qs}`, {
        method: 'POST'
      });
    },
    acceptCommunityInvite: (communityId, doctorId) => {
      const cleanId = String(communityId).replace(/^comm-/i, '');
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/${cleanId}/accept-invite${qs}`, {
        method: 'POST'
      });
    },
    rejectCommunityInvite: (communityId, doctorId) => {
      const cleanId = String(communityId).replace(/^comm-/i, '');
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/${cleanId}/reject-invite${qs}`, {
        method: 'POST'
      });
    },
    getPendingInvites: (doctorId) => {
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/invites/pending${qs}`);
    },
    updateCover: (id, coverImage, doctorId) => {
      const cleanId = String(id).replace(/^comm-/i, '');
      const qs = doctorId ? `?doctorId=${doctorId}` : '';
      return fetchJson(`/communities/${cleanId}/cover${qs}`, {
        method: 'PUT',
        body: JSON.stringify({ coverImage })
      });
    }
  },

  // Media File Upload
  media: {
    upload: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${BASE_URL}/media/upload`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        throw new Error('Image upload failed');
      }
      return await res.json();
    }
  },

  // Advertiser Account & Campaign Management
  advertisers: {
    register: (data) => fetchJson('/advertisers/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    login: (email, password) => fetchJson('/advertisers/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
    loginWithKey: (accessKey) => fetchJson('/advertisers/login-with-key', {
      method: 'POST',
      body: JSON.stringify({ accessKey })
    }),
    getMe: (token, accessKey) => {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (accessKey) headers['X-Advertiser-Key'] = accessKey;
      return fetchJson('/advertisers/me', { headers });
    },
    regenerateKey: (token) => fetchJson('/advertisers/regenerate-key', {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }),
    forgotPassword: (email) => fetchJson('/advertisers/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  },

  campaigns: {
    getAll: (token, accessKey) => {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (accessKey) headers['X-Advertiser-Key'] = accessKey;
      return fetchJson('/campaigns', { headers });
    },
    getById: (id) => fetchJson(`/campaigns/${id}`),
    create: (data, token, accessKey) => {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (accessKey) headers['X-Advertiser-Key'] = accessKey;
      return fetchJson('/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
        headers
      });
    },
    update: (id, data, token, accessKey) => {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (accessKey) headers['X-Advertiser-Key'] = accessKey;
      return fetchJson(`/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers
      });
    },
    delete: (id, token, accessKey) => {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (accessKey) headers['X-Advertiser-Key'] = accessKey;
      return fetchJson(`/campaigns/${id}`, {
        method: 'DELETE',
        headers
      });
    },
    updateStatus: (id, status) => fetchJson(`/campaigns/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    }),
    recordEvent: (id, eventType, sessionId) => fetchJson(`/campaigns/${id}/events`, {
      method: 'POST',
      body: JSON.stringify({ eventType, sessionId })
    }),
    getReports: (params = {}, token, accessKey) => {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (accessKey) headers['X-Advertiser-Key'] = accessKey;
      const qs = new URLSearchParams(params).toString();
      return fetchJson(`/campaigns/reports${qs ? '?' + qs : ''}`, { headers });
    },
    getCsvUrl: (from, to, token, accessKey) => {
      let url = `${BASE_URL}/campaigns/reports/csv?from=${from || ''}&to=${to || ''}`;
      return url;
    },
    getPublicLive: (placement) => fetchJson(`/campaigns/public/live${placement ? '?placement=' + encodeURIComponent(placement) : ''}`)
  }
};
