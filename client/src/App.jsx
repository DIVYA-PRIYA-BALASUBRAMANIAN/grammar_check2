import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';

// Pages
import { FeedView } from './pages/FeedView';
import { VetNetworkView } from './pages/VetNetworkView';
import { ClinicalCasesView } from './pages/ClinicalCasesView';
import { ShortVideosView } from './pages/ShortVideosView';
import { MessagesView } from './pages/MessagesView';
import { SearchView } from './pages/SearchView';
import { MemberBenefitsView } from './pages/MemberBenefitsView';
import { AdvertiseView } from './pages/AdvertiseView';
import { LoginPage } from './pages/LoginPage';
import { ProfileView } from './pages/ProfileView';

// Modals
import { DoctorModal } from './components/DoctorModal';
import { CreateProfileModal } from './components/CreateProfileModal';
import { AiCaseAssistantModal } from './components/AiCaseAssistantModal';
import { StoryModal } from './components/StoryModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { ClinicalCaseModal } from './components/ClinicalCaseModal';
import { CreatePostModal } from './components/CreatePostModal';

// API Service
import { api } from './services/api';
import { createStompClient } from './services/websocket';

export function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [globalSearch, setGlobalSearch] = useState('');

  // Authentication State: strictly initialized from stored session or null
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = localStorage.getItem('doctor_vet_token');
      if (!token) {
        localStorage.removeItem('doctor_vet_user');
        return null;
      }
      const saved = localStorage.getItem('doctor_vet_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && parsed.avatar && typeof parsed.avatar === 'string' && parsed.avatar.includes('unsplash.com')) {
        parsed.avatar = '';
        localStorage.setItem('doctor_vet_user', JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });
  const [isLoginView, setIsLoginView] = useState(false);

  // Dynamic App State (Directly populated from Spring Boot API)
  const [doctors, setDoctors] = useState([]);
  const [posts, setPosts] = useState([]);
  const [clinicalCases, setClinicalCases] = useState([]);
  const [videos, setVideos] = useState([]);
  const [stories, setStories] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [connectedMap, setConnectedMap] = useState({});
  const [myConnections, setMyConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [liveCampaigns, setLiveCampaigns] = useState([]);

  // Active Modals
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [viewedProfileDoctor, setViewedProfileDoctor] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [createPostInitialType, setCreatePostInitialType] = useState('CLINICAL_CASE');

  // Active chat peer
  const [activeChatDoctor, setActiveChatDoctor] = useState(null);
  const [profileReturnTab, setProfileReturnTab] = useState('feed');

  // 1. Validate session on startup with backend
  useEffect(() => {
    async function validateSession() {
      const token = localStorage.getItem('doctor_vet_token');
      if (currentUser && !token) {
        console.warn('Doctor session user exists without token. Logging out.');
        handleLogout();
        return;
      }
      if (currentUser && token) {
        try {
          const profile = await api.auth.getMe();
          if (profile) {
            setCurrentUser(prev => ({ ...prev, ...profile }));
          }
        } catch (e) {
          console.warn('Session expired on startup. Logging out.');
          handleLogout();
        }
      }
    }
    validateSession();
  }, []);

  // 2. Listen for 401 unauthorized events from API client
  useEffect(() => {
    const onUnauthorized = () => {
      console.warn('Received unauthorized event from API. Resetting state.');
      handleLogout();
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  // 3. Sync public and private data based on authentication status
  useEffect(() => {
    async function loadBackendData() {
      // Public catalogs
      let loadedDocs = [];
      try {
        const docs = await api.doctors.getAll();
        if (docs && docs.length > 0) {
          loadedDocs = docs;
          setDoctors(docs);
          if (currentUser?.id) {
            const fresh = docs.find(d => d.id === currentUser.id || String(d.id).replace('doc-', '') === String(currentUser.id).replace('doc-', ''));
            if (fresh) {
              setCurrentUser(prev => {
                if (!prev) return fresh;
                const hasChanged = fresh.name !== prev.name ||
                  fresh.avatar !== prev.avatar ||
                  fresh.specialty !== prev.specialty ||
                  fresh.verified !== prev.verified ||
                  fresh.headline !== prev.headline;
                if (hasChanged) {
                  const merged = { ...prev, ...fresh };
                  try {
                    localStorage.setItem('doctor_vet_user', JSON.stringify(merged));
                  } catch (err) { }
                  return merged;
                }
                return prev;
              });
            }
          }
        }
      } catch (e) {
        console.log('Using local doctors catalog');
      }

      try {
        const feedPosts = await api.feed.getPosts();
        if (feedPosts && feedPosts.length > 0) {
          setPosts(feedPosts.map(p => {
            const freshDoc = loadedDocs.find(d =>
              d.id === p.authorId ||
              String(d.id).replace('doc-', '') === String(p.authorId).replace('doc-', '') ||
              (d.name && p.authorName && d.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === p.authorName.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
            );
            return freshDoc ? { ...p, authorAvatar: freshDoc.avatar || p.authorAvatar } : p;
          }));
        }
      } catch (e) {
        console.log('Using local feed posts');
      }

      try {
        // Load active 24h stories
        const backendStories = await api.stories.getAll();
        if (backendStories && backendStories.length > 0) {
          setStories(backendStories.map(s => {
            const freshDoc = loadedDocs.find(d =>
              d.id === s.doctorId ||
              String(d.id).replace('doc-', '') === String(s.doctorId).replace('doc-', '') ||
              (d.name && s.doctorName && d.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === s.doctorName.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
            );
            return {
              id: s.id,
              doctorId: s.doctorId,
              doctorName: s.doctorName ? s.doctorName.replace(/^dr\.?\s*/i, '').split(' ')[0] : (freshDoc?.name ? freshDoc.name.replace(/^dr\.?\s*/i, '').split(' ')[0] : 'Doctor'),
              fullDoctorName: s.doctorName || freshDoc?.name || 'Doctor',
              avatar: (freshDoc?.avatar && !freshDoc.avatar.includes('unsplash.com')) ? freshDoc.avatar : (s.avatar || ''),
              image: s.mediaUrl || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
              videoUrl: s.mediaType === 'VIDEO' ? s.mediaUrl : null,
              caption: s.caption || 'Moments from clinical practice',
              time: 'Active'
            };
          }));
        }
      } catch (e) {
        console.log('Using local stories');
      }

      try {
        // Load clinical cases
        const backendCases = await api.cases.getAll();
        if (backendCases && backendCases.length > 0) {
          setClinicalCases(backendCases.map(c => {
            const freshDoc = loadedDocs.find(d => d.id === c.authorId || String(d.id).replace('doc-', '') === String(c.authorId).replace('doc-', '') || d.name === c.authorName);
            return freshDoc ? { ...c, authorAvatar: freshDoc.avatar || c.authorAvatar } : c;
          }));
        }
      } catch (e) {
        console.log('Using local clinical cases');
      }

      try {
        // Load short videos
        const backendVideos = await api.videos.getAll();
        if (backendVideos && backendVideos.length > 0) {
          setVideos(backendVideos);
        }
      } catch (e) {
        console.log('Using local short videos');
      }

      try {
        // Load active public live advertising campaigns for live feed
        const liveAds = await api.campaigns.getPublicLive('Feed');
        if (liveAds && Array.isArray(liveAds)) {
          setLiveCampaigns(liveAds);
        }
      } catch (e) {
        console.log('Using local live ads');
      }

      // Private Endpoints: ONLY requested when user is authenticated AND token exists
      const token = localStorage.getItem('doctor_vet_token');
      if (currentUser?.id && token) {
        const rawId = currentUser.id;
        const docId = typeof rawId === 'string' && rawId.startsWith('doc-')
          ? parseInt(rawId.replace('doc-', ''), 10)
          : Number(rawId);

        if (!isNaN(docId) && docId > 0) {
          try {
            const notifs = await api.notifications.getNotifications(docId);
            if (notifs) setNotifications(notifs);
          } catch (e) { }

          try {
            const myCons = await api.connections.getMy(docId);
            if (myCons && myCons.length > 0) {
              const enrichedCons = myCons.map(c => {
                const fresh = loadedDocs.find(d => d.id === c.id || String(d.id).replace('doc-', '') === String(c.id).replace('doc-', '') || d.name === c.name);
                return fresh ? { ...c, avatar: fresh.avatar || c.avatar, specialty: fresh.specialty || c.specialty } : c;
              });
              setMyConnections(enrichedCons);
              const map = {};
              enrichedCons.forEach(c => { map[c.id] = true; map[`doc-${c.id}`] = true; });
              setConnectedMap(map);
            } else {
              setMyConnections([]);
              setConnectedMap({});
            }
            const pending = await api.connections.getPending(docId);
            if (pending) setPendingRequests(pending);
          } catch (e) {
            setMyConnections([]);
            setConnectedMap({});
          }

          try {
            const convList = await api.chat.getConversations(docId);
            if (convList && convList.length > 0) {
              const fullConvs = await Promise.all(convList.map(async (c) => {
                let msgs = [];
                try {
                  msgs = await api.chat.getMessages(c.id);
                } catch (e) { }
                const otherDocId = c.doctor1Id === docId ? c.doctor2Id : c.doctor1Id;
                const otherDocName = c.doctor1Id === docId ? c.doctor2Name : c.doctor1Name;
                const freshDoc = loadedDocs.find(d => d.id === otherDocId || String(d.id).replace('doc-', '') === String(otherDocId).replace('doc-', '') || d.name === otherDocName);
                const resolvedAvatar = freshDoc?.avatar || (c.doctor1Id === docId ? c.doctor2Avatar : c.doctor1Avatar) || '';
                return {
                  id: c.id,
                  doctor: {
                    id: otherDocId,
                    name: otherDocName,
                    avatar: resolvedAvatar,
                    specialty: freshDoc?.specialty || 'Veterinary Practitioner',
                    city: freshDoc?.city || 'Bengaluru'
                  },
                  lastMessage: c.lastMessage,
                  timestamp: 'Active',
                  unread: c.doctor1Id === docId ? c.unreadCountDoctor1 : c.unreadCountDoctor2,
                  messages: (msgs || []).map(m => ({
                    id: m.id,
                    sender: m.senderId === docId ? 'user' : 'doctor',
                    senderId: m.senderId,
                    text: m.text,
                    attachmentUrl: m.attachmentUrl,
                    attachmentType: m.attachmentType,
                    time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'
                  }))
                };
              }));
              setConversations(fullConvs);
            }
          } catch (e) {
            setConversations([]);
          }

          try {
            const sent = await api.connections.getSent(docId);
            if (sent && sent.length > 0) {
              setSentRequests(sent);
            }
          } catch (e) { }
        }
      } else {
        // Cleanly wipe any private data from memory when not signed in
        setConversations([]);
        setConnectedMap({});
        setMyConnections([]);
        setPendingRequests([]);
        setSentRequests([]);
        setNotifications([]);
      }
    }

    loadBackendData();
  }, [currentUser?.id]);

  // Whenever the user switches to the 'feed' tab, refresh public live campaigns
  useEffect(() => {
    if (activeTab === 'feed') {
      api.campaigns.getPublicLive('Feed')
        .then(liveAds => {
          if (Array.isArray(liveAds)) setLiveCampaigns(liveAds);
        })
        .catch(() => {});
    }
  }, [activeTab]);

  // STOMP WebSocket for real-time notifications & 2-way messages
  useEffect(() => {
    if (!currentUser?.id) return;

    let client = null;
    try {
      client = createStompClient((stomp) => {
        // Subscribe to live notifications
        stomp.subscribe(`/topic/user/${currentUser.id}/notifications`, () => {
          api.notifications.getNotifications(currentUser.id).then(notifs => {
            if (notifs) setNotifications(notifs);
          }).catch(() => { });
        });

        // Subscribe to live incoming direct chat messages
        stomp.subscribe(`/topic/user/${currentUser.id}/messages`, (frame) => {
          try {
            const incoming = JSON.parse(frame.body);
            const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setConversations(prev => {
              const convIdx = prev.findIndex(c =>
                (c.id != null && incoming.conversationId != null && String(c.id).replace(/\D/g, '') === String(incoming.conversationId).replace(/\D/g, '')) ||
                (c.doctor && (
                  (c.doctor.id != null && (String(c.doctor.id).replace(/\D/g, '') === String(incoming.senderId).replace(/\D/g, '') || String(c.doctor.id).replace(/\D/g, '') === String(incoming.receiverId).replace(/\D/g, '')))
                ))
              );
              const formattedMsg = {
                id: incoming.id || Date.now(),
                sender: incoming.senderId === currentUser.id ? 'user' : 'doctor',
                senderId: incoming.senderId,
                text: incoming.text,
                attachmentUrl: incoming.attachmentUrl,
                attachmentType: incoming.attachmentType,
                time: incoming.createdAt ? new Date(incoming.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : nowTime
              };

              if (convIdx >= 0) {
                const updated = [...prev];
                const existingList = updated[convIdx].messages || [];
                if (!existingList.some(m => m.id === incoming.id)) {
                  const isCurrentChatOpen = activeTab === 'messages' && activeChatDoctor && (
                    activeChatDoctor.id === incoming.senderId ||
                    updated[convIdx].doctor?.id === activeChatDoctor.id ||
                    updated[convIdx].doctor?.name === activeChatDoctor.name
                  );
                  if (isCurrentChatOpen && incoming.conversationId) {
                    api.chat.markAsRead(incoming.conversationId, currentUser.id).catch(() => { });
                  }
                  updated[convIdx] = {
                    ...updated[convIdx],
                    id: incoming.conversationId || updated[convIdx].id,
                    lastMessage: incoming.text || 'Sent an attachment',
                    timestamp: formattedMsg.time,
                    unread: (incoming.senderId !== currentUser.id && !isCurrentChatOpen) ? (updated[convIdx].unread || 0) + 1 : 0,
                    messages: [...existingList, formattedMsg]
                  };
                }
                return updated;
              } else {
                // If brand new conversation started from peer, fetch conversations
                api.chat.getConversations(currentUser.id).then(list => {
                  if (list) {
                    setConversations(list.map(c => ({
                      id: c.id,
                      doctor: {
                        id: c.doctor1Id === currentUser.id ? c.doctor2Id : c.doctor1Id,
                        name: c.doctor1Id === currentUser.id ? c.doctor2Name : c.doctor1Name,
                        avatar: c.doctor1Id === currentUser.id ? c.doctor2Avatar : c.doctor1Avatar,
                        specialty: 'Veterinary Practitioner',
                        city: 'Bengaluru'
                      },
                      lastMessage: c.lastMessage,
                      timestamp: 'Just now',
                      unread: 1,
                      messages: [formattedMsg]
                    })));
                  }
                }).catch(() => { });
                return prev;
              }
            });
          } catch (e) { }
        });
      });
    } catch (e) {
      console.warn('STOMP client connection error:', e);
    }

    return () => {
      if (client && client.deactivate) {
        try { client.deactivate(); } catch (e) { }
      }
    };
  }, [currentUser?.id]);

  // Real-time chat & registered doctors sync: guarantees live peer updates & new registrations
  useEffect(() => {
    if (!currentUser?.id) return;

    const interval = setInterval(async () => {
      // 1. Refresh active conversation messages in real-time when in messages tab
      if (activeTab === 'messages' && activeChatDoctor) {
        const targetConv = conversations.find(c =>
          (c.doctor?.id && (c.doctor.id === activeChatDoctor.id || String(c.doctor.id).replace(/\D/g, '') === String(activeChatDoctor.id).replace(/\D/g, ''))) ||
          (c.doctor?.name && c.doctor.name === activeChatDoctor.name)
        );
        const convId = targetConv?.id;
        const numId = typeof convId === 'number' ? convId : parseInt(String(convId || '').replace(/\D/g, ''), 10);
        if (!isNaN(numId) && numId > 0) {
          try {
            const msgs = await api.chat.getMessages(numId);
            if (msgs && Array.isArray(msgs)) {
              setConversations(prev => prev.map(c => {
                const isMatch = (c.id === convId || c.id === numId) ||
                  (c.doctor && (c.doctor.id === activeChatDoctor.id || String(c.doctor.id).replace(/\D/g, '') === String(activeChatDoctor.id).replace(/\D/g, '')));
                if (isMatch) {
                  const existingMsgMap = new Map();
                  (c.messages || []).forEach(m => {
                    const key = m.id || `${m.senderId}-${m.text}`;
                    existingMsgMap.set(key, m);
                  });

                  let hasNew = false;
                  const formatted = msgs.map(m => {
                    if (!existingMsgMap.has(m.id)) hasNew = true;
                    return {
                      id: m.id,
                      sender: m.senderId === currentUser.id ? 'user' : 'doctor',
                      senderId: m.senderId,
                      text: m.text,
                      attachmentUrl: m.attachmentUrl,
                      attachmentType: m.attachmentType,
                      time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                  });

                  if (hasNew || (c.messages || []).length < formatted.length) {
                    const last = formatted[formatted.length - 1];
                    return {
                      ...c,
                      id: numId,
                      lastMessage: last ? last.text : c.lastMessage,
                      timestamp: last ? last.time : c.timestamp,
                      messages: formatted
                    };
                  }
                }
                return c;
              }));
            }
          } catch (e) { }
        }
      }

      // 2. Poll registered doctors list to dynamically show any newly registered doctors in "People to Know"
      try {
        const liveDocs = await api.doctors.getAll();
        if (liveDocs && Array.isArray(liveDocs) && liveDocs.length > 0) {
          setDoctors(prev => {
            if (liveDocs.length !== prev.length || liveDocs.some((d, idx) => !prev[idx] || prev[idx].id !== d.id)) {
              return liveDocs;
            }
            return prev;
          });
        }
      } catch (e) { }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser?.id, activeTab, activeChatDoctor?.id, conversations.length]);

  const handleLoginSuccess = (user) => {
    const activeUser = { ...user, active: true };
    setCurrentUser(activeUser);
    setDoctors(prev => prev.map(d =>
      (d.id === user.id || String(d.id).replace('doc-', '') === String(user.id).replace('doc-', ''))
        ? { ...d, active: true }
        : d
    ));
    setIsLoginView(false);
    setActiveTab('feed');
  };

  const handleLogout = async () => {
    const oldUserId = currentUser?.id;
    try {
      await api.auth.logout();
    } catch (e) { }
    localStorage.removeItem('doctor_vet_user');
    localStorage.removeItem('doctor_vet_token');
    setCurrentUser(null);
    if (oldUserId) {
      setDoctors(prev => prev.map(d =>
        (d.id === oldUserId || String(d.id).replace('doc-', '') === String(oldUserId).replace('doc-', ''))
          ? { ...d, active: false }
          : d
      ));
    }
    setConversations([]);
    setConnectedMap({});
    setMyConnections([]);
    setNotifications([]);
    setPendingRequests([]);
    setSentRequests([]);
    setActiveChatDoctor(null);
    setSelectedDoctor(null);
    setActiveTab('feed');
  };

  const handleOpenCreatePost = (type = 'CLINICAL_CASE') => {
    setCreatePostInitialType(type);
    setIsCreatePostOpen(true);
  };

  // Connection System Handlers
  const handleSendRequest = async (targetDoctor) => {
    const senderId = currentUser?.id || 1;
    const senderName = currentUser?.name || 'Dr. You';
    const senderAvatar = currentUser?.avatar || null;
    const senderSpecialty = currentUser?.specialty || 'Veterinary Practitioner';

    try {
      await api.connections.sendRequest(senderId, senderName, senderAvatar, senderSpecialty, targetDoctor.id);
    } catch (e) {
      console.log('Request sent in offline state');
    }

    setSentRequests(prev => [...prev, { id: Date.now(), receiverId: targetDoctor.id, targetDoctor }]);
    alert(`Connection request sent to ${targetDoctor.name}!`);
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.connections.acceptRequest(requestId);
    } catch (e) {
      console.log('Accept processed in offline state');
    }

    const req = pendingRequests.find(r => r.id === requestId);
    if (req) {
      setConnectedMap(prev => ({ ...prev, [req.senderId]: true, [`doc-${req.senderId}`]: true }));
      const doc = doctors.find(d => d.id === req.senderId);
      if (doc) {
        setMyConnections(prev => [...prev.filter(p => p.id !== doc.id), doc]);
      }
    }
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    setNotifications(prev => prev.filter(n => n.targetId !== requestId));
    alert('Connection accepted! Doctor added to your professional network.');
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.connections.rejectRequest(requestId);
    } catch (e) {
      console.log('Reject processed in offline state');
    }
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleCancelRequest = async (targetDoctorId) => {
    setSentRequests(prev => prev.filter(r => r.receiverId !== targetDoctorId && r.id !== targetDoctorId));
    alert('Connection request withdrawn.');
  };

  const handleDisconnect = async (targetDoctorId) => {
    try {
      await api.connections.disconnect(currentUser?.id || 1, targetDoctorId);
    } catch (e) { }
    setConnectedMap(prev => {
      const copy = { ...prev };
      delete copy[targetDoctorId];
      delete copy[`doc-${targetDoctorId}`];
      return copy;
    });
    setMyConnections(prev => prev.filter(c => c.id !== targetDoctorId && `doc-${c.id}` !== targetDoctorId));
    alert('Doctor removed from connections.');
  };

  // Feed Actions
  const handleLikePost = async (postId) => {
    try {
      await api.feed.toggleLike(postId, currentUser?.id || 1, currentUser?.name || 'Dr. You');
    } catch (e) { }

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? Math.max(0, p.likes - 1) : p.likes + 1
        };
      }
      return p;
    }));
  };

  const handleAddComment = async (postId, content) => {
    const authorName = currentUser?.name || 'Dr. You (Verified)';
    const authorAvatar = currentUser?.avatar || null;
    const authorSpecialty = currentUser?.specialty || 'Veterinary Surgeon';

    try {
      await api.feed.addComment(postId, {
        authorId: currentUser?.id || 1,
        authorName,
        authorAvatar,
        authorSpecialty,
        content
      });
    } catch (e) { }

    const newComment = {
      id: Date.now(),
      authorName,
      authorAvatar,
      authorSpecialty,
      content,
      createdAt: new Date().toISOString()
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const existingComments = p.comments || [];
        return {
          ...p,
          commentsCount: (p.commentsCount || 0) + 1,
          comments: [...existingComments, newComment]
        };
      }
      return p;
    }));
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this clinical post?')) return;
    try {
      await api.feed.deletePost(postId);
    } catch (e) { }
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleBookmarkPost = async (postId) => {
    try {
      await api.feed.toggleBookmark(postId, currentUser?.id || 1);
    } catch (e) { }

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, isBookmarked: !p.isBookmarked };
      }
      return p;
    }));
  };

  const handleReportPost = async (postId) => {
    const reason = prompt('Please specify why you are reporting this post (e.g. Inappropriate content, Misinformation):');
    if (!reason) return;
    try {
      await api.feed.reportPost(postId, currentUser?.id || 1, reason);
    } catch (e) { }
    alert('Thank you. The post has been flagged for veterinary moderation review.');
  };

  const handleCreatePost = async ({ content, postType, imageUrl, videoUrl, videoTitle, specialty, duration, species }) => {
    const authorName = currentUser?.name || 'Dr. You (Verified)';
    const authorSpecialty = currentUser?.specialty || specialty || 'Veterinary Medicine';
    const authorAvatar = currentUser?.avatar || '';

    const isVideoMedia = !!videoUrl || (imageUrl && (imageUrl.endsWith('.mp4') || imageUrl.endsWith('.mov') || imageUrl.endsWith('.webm') || imageUrl.includes('data:video')));
    const effectiveVideoUrl = videoUrl || (isVideoMedia ? imageUrl : null);

    if (postType === 'STORY') {
      const storyPayload = {
        doctorId: currentUser?.id || 1,
        doctorName: currentUser?.name || 'Dr. You',
        avatar: authorAvatar,
        mediaUrl: imageUrl || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
        mediaType: isVideoMedia ? 'VIDEO' : 'IMAGE',
        caption: content || 'Moments from clinical practice'
      };
      try {
        const savedStory = await api.stories.create(storyPayload);
        const formattedStory = {
          id: savedStory.id || `story-${Date.now()}`,
          doctorId: currentUser?.id || 1,
          doctorName: currentUser?.name ? currentUser.name.replace(/^dr\.?\s*/i, '').split(' ')[0] : 'You',
          fullDoctorName: authorName,
          avatar: authorAvatar,
          image: savedStory.mediaUrl || imageUrl,
          videoUrl: savedStory.mediaType === 'VIDEO' ? savedStory.mediaUrl : null,
          caption: savedStory.caption || content,
          time: 'Just now'
        };
        setStories(prev => [formattedStory, ...prev]);
      } catch (e) {
        console.warn('Backend story persistence error:', e);
      }

      // If user uploaded a video reel, publish it down to the scrollable feed as well!
      if (isVideoMedia) {
        const reelPostPayload = {
          authorId: currentUser?.id || 1,
          authorName,
          authorSpecialty,
          authorCity: currentUser?.city || 'Bengaluru',
          authorAvatar,
          postType: 'SHORT_VIDEO',
          badgeLabel: 'CLINICAL REEL · VIDEO',
          content: content || 'Clinical reel demonstration',
          imageUrl: (imageUrl && !imageUrl.endsWith('.mp4')) ? imageUrl : null,
          videoUrl: effectiveVideoUrl,
          species: species || 'Canine',
          likes: 1,
          commentsCount: 0
        };
        try {
          const savedPost = await api.feed.createPost(reelPostPayload);
          setPosts(prev => [savedPost, ...prev]);
        } catch (e) {
          setPosts(prev => [{ ...reelPostPayload, id: `post-${Date.now()}`, comments: [] }, ...prev]);
        }

        const reelVideoPayload = {
          title: content ? content.slice(0, 50) : 'Clinical Technique Reel',
          doctorName: authorName,
          doctorSpecialty: `${authorSpecialty} · ${currentUser?.city || 'Bengaluru'}`,
          views: '1',
          duration: '0:45',
          thumbnail: (imageUrl && !imageUrl.endsWith('.mp4')) ? imageUrl : 'http://localhost:8080/uploads/543a7dc6-e985-4130-967d-7aac4969ff9f.png',
          videoUrl: effectiveVideoUrl,
          likes: 1,
          comments: 0
        };
        try {
          const savedVideo = await api.videos.create(reelVideoPayload);
          setVideos(prev => [savedVideo, ...prev]);
        } catch (e) {
          setVideos(prev => [{ ...reelVideoPayload, id: `vid-${Date.now()}` }, ...prev]);
        }
        alert('Your clinical reel is live in both the community stories and the scrollable feed below!');
      } else {
        alert('Your 24-hour story is now live in the community moments bar!');
      }
      return;
    }

    if (postType === 'SHORT_VIDEO') {
      const videoPayload = {
        title: videoTitle || (content ? content.slice(0, 50) : 'Clinical Technique Reel'),
        doctorName: authorName,
        doctorSpecialty: `${authorSpecialty} · ${currentUser?.city || 'Bengaluru'}`,
        views: '1',
        duration: duration || '0:45',
        thumbnail: (imageUrl && !imageUrl.endsWith('.mp4')) ? imageUrl : 'http://localhost:8080/uploads/543a7dc6-e985-4130-967d-7aac4969ff9f.png',
        videoUrl: effectiveVideoUrl,
        likes: 1,
        comments: 0
      };
      try {
        const savedVideo = await api.videos.create(videoPayload);
        setVideos(prev => [savedVideo, ...prev]);
      } catch (e) {
        setVideos(prev => [{ ...videoPayload, id: `vid-${Date.now()}` }, ...prev]);
      }
    }

    if (postType === 'CLINICAL_CASE') {
      const casePayload = {
        title: (videoTitle || content).slice(0, 50) + '...',
        authorName,
        authorSpecialty,
        species: species || 'Canine',
        presentingComplaint: content,
        clinicalFindings: 'Physical exam and diagnostic tests evaluated.',
        diagnostics: 'Diagnostics completed.',
        diagnosis: 'Case under peer review',
        treatmentProtocol: 'Evidence-based veterinary protocol.',
        outcome: 'Active management',
        views: 1,
        comments: 0,
        mediaUrl: imageUrl
      };
      try {
        const savedCase = await api.cases.create(casePayload);
        setClinicalCases(prev => [savedCase, ...prev]);
      } catch (e) {
        setClinicalCases(prev => [{ ...casePayload, id: `case-${Date.now()}` }, ...prev]);
      }
    }

    const postPayload = {
      authorId: currentUser?.id || 1,
      authorName,
      authorSpecialty,
      authorCity: currentUser?.city || 'Bengaluru',
      authorAvatar,
      postType,
      badgeLabel: postType === 'CLINICAL_CASE'
        ? 'CLINICAL CASE REPORT'
        : postType === 'SHORT_VIDEO'
          ? 'CLINICAL REEL · VIDEO'
          : 'CLINICAL UPDATE',
      content: videoTitle ? `${videoTitle} — ${content}` : content,
      imageUrl: (imageUrl && !imageUrl.endsWith('.mp4')) ? imageUrl : null,
      videoUrl: effectiveVideoUrl,
      species: species || 'Canine',
      likes: 1,
      commentsCount: 0
    };

    try {
      const savedPost = await api.feed.createPost(postPayload);
      setPosts(prev => [savedPost, ...prev]);
    } catch (e) {
      setPosts(prev => [{ ...postPayload, id: `post-${Date.now()}`, comments: [] }, ...prev]);
    }
  };

  // Real-time Messaging Handlers
  const handleOpenDirectChat = async (doctor) => {
    // Doctors can only message after connecting
    const isConnected = !!connectedMap[doctor.id] ||
      !!connectedMap[`doc-${doctor.id}`] ||
      myConnections.some(c => c.id === doctor.id || String(c.id).replace('doc-', '') === String(doctor.id).replace('doc-', ''));

    if (!isConnected) {
      alert(`Please connect with Dr. ${doctor.name} first before messaging.`);
      return;
    }

    setActiveChatDoctor(doctor);
    let existing = conversations.find(c => c.doctor.id === doctor.id || c.doctor.name === doctor.name);
    if (!existing) {
      try {
        const started = await api.chat.startConversation(currentUser?.id || 1, doctor.id, `Hello Doctor, this is ${currentUser?.name || 'Dr. You'}.`);
        let msgs = [];
        if (started && started.id) {
          try {
            msgs = await api.chat.getMessages(started.id);
          } catch (e) { }
          existing = {
            id: started.id,
            doctor,
            lastMessage: started.lastMessage || 'Started new consultation.',
            timestamp: 'Just now',
            unread: 0,
            messages: (msgs || []).map(m => ({
              id: m.id,
              sender: m.senderId === currentUser?.id ? 'user' : 'doctor',
              senderId: m.senderId,
              text: m.text,
              attachmentUrl: m.attachmentUrl,
              attachmentType: m.attachmentType,
              time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
            }))
          };
          setConversations(prev => [existing, ...prev]);
        }
      } catch (e) {
        existing = {
          id: `chat-${Date.now()}`,
          doctor,
          lastMessage: 'Started new direct consultation.',
          timestamp: 'Just now',
          unread: 0,
          messages: [
            { id: 1, sender: 'doctor', text: `Hello Doctor, this is ${doctor.name}. How can I assist you with this clinical case?`, time: 'Just now' }
          ]
        };
        setConversations(prev => [existing, ...prev]);
      }
    } else {
      // Immediately reset unread to 0 for this conversation
      setConversations(prev => prev.map(c => {
        if (c.id === existing.id || (c.doctor && (c.doctor.id === doctor.id || c.doctor.name === doctor.name))) {
          return { ...c, unread: 0 };
        }
        return c;
      }));

      const numId = typeof existing.id === 'number' ? existing.id : parseInt(String(existing.id).replace(/\D/g, ''), 10);
      if (!isNaN(numId) && numId > 0) {
        try {
          const msgs = await api.chat.getMessages(numId);
          setConversations(prev => prev.map(c => (c.id === existing.id || c.id === numId) ? {
            ...c,
            unread: 0,
            messages: (msgs || []).map(m => ({
              id: m.id,
              sender: m.senderId === currentUser?.id ? 'user' : 'doctor',
              senderId: m.senderId,
              text: m.text,
              attachmentUrl: m.attachmentUrl,
              attachmentType: m.attachmentType,
              time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
            }))
          } : c));
          api.chat.markAsRead(numId, currentUser?.id || 1).catch(() => { });
        } catch (e) { }
      }
    }

    // Immediately mark all message notifications from this doctor as read
    setNotifications(prev => prev.map(n => {
      const isMsgNotif = (n.type === 'NEW_MESSAGE' || n.type === 'MESSAGE' || n.type === 'DIRECT_MESSAGE' || !n.type) &&
        ((doctor.id && n.senderId === doctor.id) || (doctor.name && n.senderName === doctor.name));
      if (isMsgNotif && !n.read) {
        if (n.id) api.notifications.markAsRead(n.id).catch(() => {});
        return { ...n, read: true };
      }
      return n;
    }));

    setActiveTab('messages');
  };

  const handleSelectConversation = async (conv) => {
    if (!conv) return;
    if (conv.doctor) setActiveChatDoctor(conv.doctor);

    // 1. Immediately reset unread count to 0 in local state so badges vanish instantly
    setConversations(prev => prev.map(c => {
      const isMatch = (conv.id && c.id === conv.id) ||
                      (conv.doctor?.id && c.doctor?.id === conv.doctor.id) ||
                      (conv.doctor?.name && c.doctor?.name === conv.doctor.name);
      if (isMatch) {
        return { ...c, unread: 0 };
      }
      return c;
    }));

    // 2. Mark any related NEW_MESSAGE notifications as read immediately
    setNotifications(prev => prev.map(n => {
      const isMatch = (n.type === 'NEW_MESSAGE' || n.type === 'MESSAGE' || n.type === 'DIRECT_MESSAGE' || !n.type) &&
                      ((conv.id && n.targetId === conv.id) ||
                       (conv.doctor?.id && n.senderId === conv.doctor.id) ||
                       (conv.doctor?.name && n.senderName === conv.doctor.name));
      if (isMatch && !n.read) {
        if (n.id) api.notifications.markAsRead(n.id).catch(() => {});
        return { ...n, read: true };
      }
      return n;
    }));

    // 3. Mark as read on backend and load latest messages if available
    const numId = typeof conv.id === 'number' ? conv.id : parseInt(String(conv.id).replace(/\D/g, ''), 10);
    if (!isNaN(numId) && numId > 0) {
      try {
        const msgs = await api.chat.getMessages(numId);
        setConversations(prev => prev.map(c => {
          if (c.id === conv.id || c.id === numId) {
            return {
              ...c,
              unread: 0,
              messages: (msgs || []).map(m => ({
                id: m.id,
                sender: m.senderId === currentUser?.id ? 'user' : 'doctor',
                senderId: m.senderId,
                text: m.text,
                attachmentUrl: m.attachmentUrl,
                attachmentType: m.attachmentType,
                time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
              }))
            };
          }
          return c;
        }));
        api.chat.markAsRead(numId, currentUser?.id || 1).catch(() => { });
      } catch (e) { }
    }
  };

  const handleSendMessage = async ({ conversationId, receiverId, text, attachmentUrl, attachmentType }) => {
    let targetConvId = conversationId;
    if (typeof conversationId !== 'number' && receiverId) {
      try {
        const started = await api.chat.startConversation(currentUser?.id || 1, receiverId, text);
        if (started?.id) targetConvId = started.id;
      } catch (e) { }
    }

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const optimisticMsg = {
      id: Date.now(),
      sender: 'user',
      senderId: currentUser?.id,
      text,
      attachmentUrl,
      attachmentType,
      time: timeFormatted
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId || conv.id === targetConvId || (conv.doctor?.id === receiverId)) {
        return {
          ...conv,
          id: targetConvId,
          lastMessage: text || 'Sent an attachment',
          timestamp: timeFormatted,
          messages: [...(conv.messages || []), optimisticMsg]
        };
      }
      return conv;
    }));

    try {
      await api.chat.sendMessage({
        conversationId: typeof targetConvId === 'number' ? targetConvId : (typeof conversationId === 'number' ? conversationId : 1),
        senderId: currentUser?.id,
        receiverId: receiverId,
        text,
        attachmentUrl,
        attachmentType
      });
    } catch (e) {
      console.warn('Real-time chat persistence fallback:', e);
    }
  };

  // Notifications Handlers
  const handleMarkNotificationRead = async (id) => {
    try {
      await api.notifications.markAsRead(id);
    } catch (e) { }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.notifications.markAllAsRead(currentUser?.id || 1);
    } catch (e) { }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const handleDoctorProfileUpdated = (updatedDoc) => {
    if (!updatedDoc) return;

    // Helper to check match
    const isDocMatch = (entityId, entityName) => {
      if (!entityId && !entityName) return false;
      if (entityId && updatedDoc.id) {
        if (entityId === updatedDoc.id) return true;
        if (String(entityId).replace('doc-', '') === String(updatedDoc.id).replace('doc-', '')) return true;
      }
      if (entityName && updatedDoc.name) {
        const n1 = entityName.toLowerCase().replace(/^dr\.?\s*/i, '').trim();
        const n2 = updatedDoc.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim();
        if (n1 === n2) return true;
      }
      return false;
    };

    // 1. Current user
    if (currentUser) {
      setCurrentUser(prev => {
        const next = { ...prev, ...updatedDoc };
        try { localStorage.setItem('doctor_vet_user', JSON.stringify(next)); } catch (e) { }
        return next;
      });
    }

    // 2. Selected Doctor modal & Viewed Profile
    setSelectedDoctor(prev => {
      if (!prev) return prev;
      if (prev.id === currentUser?.id || isDocMatch(prev.id, prev.name)) {
        return { ...prev, ...updatedDoc };
      }
      return prev;
    });

    setViewedProfileDoctor(prev => {
      if (!prev) return updatedDoc;
      if (prev.id === currentUser?.id || isDocMatch(prev.id, prev.name)) {
        return { ...prev, ...updatedDoc };
      }
      return prev;
    });

    // 3. Doctors catalog
    setDoctors(prev => {
      const idx = prev.findIndex(d => isDocMatch(d.id, d.name));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...updatedDoc };
        return copy;
      }
      return [updatedDoc, ...prev];
    });

    // 4. Feed Posts
    setPosts(prev => prev.map(p => {
      if (isDocMatch(p.authorId, p.authorName)) {
        return {
          ...p,
          authorAvatar: updatedDoc.avatar,
          authorName: updatedDoc.name || p.authorName,
          authorSpecialty: updatedDoc.specialty || p.authorSpecialty
        };
      }
      return p;
    }));

    // 5. 24h Stories
    setStories(prev => prev.map(s => {
      if (isDocMatch(s.doctorId, s.doctorName) || isDocMatch(s.doctorId, s.fullDoctorName)) {
        return {
          ...s,
          avatar: updatedDoc.avatar,
          doctorName: updatedDoc.name ? updatedDoc.name.replace(/^dr\.?\s*/i, '').split(' ')[0] : s.doctorName,
          fullDoctorName: updatedDoc.name || s.fullDoctorName
        };
      }
      return s;
    }));

    // 6. Clinical Cases
    setClinicalCases(prev => prev.map(c => {
      if (isDocMatch(c.authorId, c.authorName)) {
        return {
          ...c,
          authorAvatar: updatedDoc.avatar,
          authorName: updatedDoc.name || c.authorName,
          authorSpecialty: updatedDoc.specialty || c.authorSpecialty
        };
      }
      return c;
    }));

    // 7. My Connections
    setMyConnections(prev => prev.map(c => {
      if (isDocMatch(c.id, c.name)) {
        return {
          ...c,
          avatar: updatedDoc.avatar,
          name: updatedDoc.name || c.name,
          specialty: updatedDoc.specialty || c.specialty
        };
      }
      return c;
    }));

    // 8. Active Chat Doctor & Conversations
    setActiveChatDoctor(prev => {
      if (!prev) return prev;
      if (isDocMatch(prev.id, prev.name)) {
        return { ...prev, ...updatedDoc, avatar: updatedDoc.avatar };
      }
      return prev;
    });

    setConversations(prev => prev.map(conv => {
      if (conv.doctor && isDocMatch(conv.doctor.id, conv.doctor.name)) {
        return {
          ...conv,
          doctor: { ...conv.doctor, ...updatedDoc, avatar: updatedDoc.avatar }
        };
      }
      return conv;
    }));
  };

  const handleOpenDoctorProfile = (doc, openAsPage = false) => {
    const target = doc || currentUser;
    if (!target) return;

    const fresh = (doctors || []).find(d =>
      d.id === target.id ||
      String(d.id).replace('doc-', '') === String(target.id).replace('doc-', '') ||
      (d.name && target.name && d.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === target.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
    );

    const merged = fresh
      ? { ...target, ...fresh, avatar: (fresh.avatar && !fresh.avatar.includes('unsplash.com')) ? fresh.avatar : (target.avatar || fresh.avatar) }
      : target;

    setViewedProfileDoctor(merged);
    if (openAsPage) {
      setProfileReturnTab(activeTab);
      setSelectedDoctor(null);
      setActiveTab('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSelectedDoctor(merged);
    }
  };

  const handleTabNavigation = (tab) => {
    setActiveTab(tab);
    if (tab === 'profile') setViewedProfileDoctor(currentUser);
    if (tab === 'messages') {
      const targetConv = conversations.find(c => activeChatDoctor && (c.doctor?.id === activeChatDoctor.id || c.doctor?.name === activeChatDoctor.name)) || conversations[0];
      if (targetConv) {
        handleSelectConversation(targetConv);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentUser || isLoginView || activeTab === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onCancel={currentUser ? () => {
          setIsLoginView(false);
          if (activeTab === 'login') setActiveTab('feed');
        } : null}
      />
    );
  }

  return (
    <div className="app-container">
      {/* 1. Left Sidebar Navigation */}
      <LeftSidebar
        activeTab={activeTab}
        onTabSelect={handleTabNavigation}
        unreadMessagesCount={conversations.reduce((acc, c) => acc + (c.unread || 0), 0)}
        onOpenBenefitsModal={() => setActiveTab('benefits')}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginView(true)}
        onLogout={handleLogout}
        onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
        onOpenDoctorProfile={handleOpenDoctorProfile}
      />

      {/* 2. Main Content Layout */}
      <div className="main-content-layout">
        {/* Top Persistent Header & notification dropdown */}
        <Header
          searchQuery={globalSearch}
          onSearchChange={(query) => {
            setGlobalSearch(query);
            if (query.trim() && activeTab !== 'search') {
              setActiveTab('search');
            }
          }}
          activeTab={activeTab}
          onTabSelect={handleTabNavigation}
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginView(true)}
          onLogout={handleLogout}
          onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
          onOpenDoctorProfile={handleOpenDoctorProfile}
          unreadMessagesCount={conversations.reduce((acc, c) => acc + (c.unread || 0), 0)}
          unreadNotificationsCount={unreadNotifsCount}
          pendingRequestsCount={pendingRequests.length}
          notifications={notifications}
          onAcceptRequest={handleAcceptRequest}
          onIgnoreRequest={handleRejectRequest}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onOpenCreatePost={handleOpenCreatePost}
          onOpenDirectChat={handleOpenDirectChat}
        />

        {/* Workspace Layout */}
        {activeTab === 'messages' ? (
          <div className="messages-workspace-layout" style={{
            display: 'flex',
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '16px 20px',
            boxSizing: 'border-box'
          }}>
            <MessagesView
              conversations={conversations}
              activeChatDoctor={activeChatDoctor}
              onSelectConversation={handleSelectConversation}
              onSendMessage={handleSendMessage}
              onOpenDoctorProfile={handleOpenDoctorProfile}
              currentUser={currentUser}
              doctors={doctors}
              connectedDoctors={myConnections}
              onOpenLogin={() => setIsLoginView(true)}
              onNavigateTab={handleTabNavigation}
              onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
              onSendRequest={handleSendRequest}
            />
          </div>
        ) : (
          <div className="workspace-two-column-layout">
            {/* Main Feed Column */}
            <main className={`feed-main-column ${activeTab === 'advertise' ? 'full-width-column' : ''}`}>
              {activeTab === 'feed' && (
                <FeedView
                  posts={posts}
                  stories={stories}
                  doctors={doctors}
                  liveCampaigns={liveCampaigns}
                  onExpireCampaign={(campId) => {
                    setLiveCampaigns(prev => prev.filter(c => c.id !== campId));
                    api.campaigns.updateStatus(campId, 'Completed').catch(() => {});
                  }}
                  onOpenStory={(s) => setSelectedStory(s)}
                  onOpenCreatePost={handleOpenCreatePost}
                  onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
                  onOpenClinicalCase={(c) => setSelectedCase(c)}
                  onLikePost={handleLikePost}
                  onAddComment={handleAddComment}
                  onDeletePost={handleDeletePost}
                  onBookmarkPost={handleBookmarkPost}
                  onReportPost={handleReportPost}
                  currentUser={currentUser}
                  onOpenDoctorProfile={handleOpenDoctorProfile}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  doctor={viewedProfileDoctor || currentUser}
                  doctors={doctors}
                  currentUser={currentUser}
                  cases={clinicalCases}
                  posts={posts}
                  onEditProfile={() => setIsCreateProfileOpen(true)}
                  onSelectCase={(c) => setSelectedCase(c)}
                  onUpdateAvatar={async (newAvatarUrl) => {
                    const docId = currentUser?.id || 1;
                    try {
                      const updated = await api.doctors.update(docId, { avatar: newAvatarUrl });
                      handleDoctorProfileUpdated(updated);
                      alert('Profile photo updated successfully!');
                    } catch (e) {
                      const fallback = { ...(currentUser || {}), avatar: newAvatarUrl };
                      handleDoctorProfileUpdated(fallback);
                    }
                  }}
                  onUpdateCover={async (newCoverUrl) => {
                    const docId = currentUser?.id || 1;
                    try {
                      const updated = await api.doctors.update(docId, { coverImage: newCoverUrl });
                      handleDoctorProfileUpdated(updated);
                      alert('Cover photo updated successfully!');
                    } catch (e) {
                      const fallback = { ...(currentUser || {}), coverImage: newCoverUrl };
                      handleDoctorProfileUpdated(fallback);
                    }
                  }}
                  onUpdatePhone={async (newPhone) => {
                    const docId = currentUser?.id || 1;
                    try {
                      const updated = await api.doctors.update(docId, { phone: newPhone });
                      handleDoctorProfileUpdated(updated);
                      alert('Phone number updated successfully!');
                    } catch (e) {
                      const fallback = { ...(currentUser || {}), phone: newPhone };
                      handleDoctorProfileUpdated(fallback);
                    }
                  }}
                  onUpdateEmail={async (newEmail) => {
                    const docId = currentUser?.id || 1;
                    try {
                      const updated = await api.doctors.update(docId, { email: newEmail });
                      handleDoctorProfileUpdated(updated);
                      alert('Email address updated successfully!');
                    } catch (e) {
                      const fallback = { ...(currentUser || {}), email: newEmail };
                      handleDoctorProfileUpdated(fallback);
                    }
                  }}
                  onOpenChat={handleOpenDirectChat}
                  onToggleConnect={(docId) => handleDisconnect(docId)}
                  isConnected={viewedProfileDoctor ? (!!connectedMap[viewedProfileDoctor.id] || !!connectedMap[`doc-${viewedProfileDoctor.id}`]) : false}
                  isPending={viewedProfileDoctor ? sentRequests.some(r => r.receiverId === viewedProfileDoctor.id) : false}
                  onSendRequest={handleSendRequest}
                  onBackToFeed={() => setActiveTab(profileReturnTab || 'feed')}
                  returnTab={profileReturnTab}
                  onOpenCreateCase={handleOpenCreatePost}
                />
              )}

              {activeTab === 'network' && (
                <VetNetworkView
                  doctors={doctors}
                  onSelectDoctor={handleOpenDoctorProfile}
                  connectedDoctors={connectedMap}
                  pendingRequests={pendingRequests}
                  sentRequests={sentRequests}
                  onSendRequest={handleSendRequest}
                  onAcceptRequest={handleAcceptRequest}
                  onRejectRequest={handleRejectRequest}
                  onCancelRequest={handleCancelRequest}
                  onDisconnect={handleDisconnect}
                  onOpenChat={handleOpenDirectChat}
                  currentUser={currentUser}
                />
              )}

              {activeTab === 'cases' && (
                <ClinicalCasesView
                  clinicalCases={clinicalCases}
                  stories={stories}
                  doctors={doctors}
                  currentUser={currentUser}
                  onOpenStory={(s) => setSelectedStory(s)}
                  onOpenCreateCase={handleOpenCreatePost}
                  onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
                  onSelectCase={(c) => setSelectedCase(c)}
                />
              )}

              {activeTab === 'videos' && (
                <ShortVideosView
                  videos={videos}
                  stories={stories}
                  doctors={doctors}
                  currentUser={currentUser}
                  onOpenStory={(s) => setSelectedStory(s)}
                  onOpenCreateVideo={handleOpenCreatePost}
                  onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
                  onSelectVideo={(v) => setSelectedVideo(v)}
                />
              )}

              {activeTab === 'search' && (
                <SearchView
                  doctors={doctors}
                  connectedDoctors={connectedMap}
                  onSelectDoctor={handleOpenDoctorProfile}
                  onSelectCase={(c) => setSelectedCase(c)}
                  onSelectVideo={(v) => setSelectedVideo(v)}
                  onOpenChat={handleOpenDirectChat}
                />
              )}

              {activeTab === 'benefits' && (
                <MemberBenefitsView
                  onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
                />
              )}

              {activeTab === 'advertise' && (
                <AdvertiseView
                  onCampaignsUpdated={async () => {
                    try {
                      const liveAds = await api.campaigns.getPublicLive('Feed');
                      if (Array.isArray(liveAds)) setLiveCampaigns(liveAds);
                    } catch (e) {}
                  }}
                />
              )}
            </main>

            {/* Right Rail Widgets (People to Know & Network Advantage) - Hidden on full-width Advertise Dashboard */}
            {activeTab !== 'advertise' && (
              <RightSidebar
                doctors={doctors}
                currentUser={currentUser}
                onSelectDoctor={handleOpenDoctorProfile}
                onOpenChat={handleOpenDirectChat}
                onViewAllDoctors={() => setActiveTab('network')}
                onSendRequest={handleSendRequest}
                connectedDoctors={Object.keys(connectedMap).map(k => ({ id: isNaN(k) ? k : Number(k) }))}
              />
            )}
          </div>
        )}
      </div>

      {/* Interactive Modals */}
      <DoctorModal
        doctor={selectedDoctor}
        doctors={doctors}
        onClose={() => setSelectedDoctor(null)}
        onOpenChat={handleOpenDirectChat}
        isConnected={selectedDoctor ? (!!connectedMap[selectedDoctor.id] || !!connectedMap[`doc-${selectedDoctor.id}`]) : false}
        isPending={selectedDoctor ? sentRequests.some(r => r.receiverId === selectedDoctor.id) : false}
        onSendRequest={handleSendRequest}
        onToggleConnect={(docId) => handleDisconnect(docId)}
        onSelectCase={(c) => setSelectedCase(c)}
        cases={clinicalCases}
        posts={posts}
        currentUser={currentUser}
        onEditProfile={() => setIsCreateProfileOpen(true)}
        onUpdateAvatar={async (newAvatarUrl) => {
          const docId = currentUser?.id || selectedDoctor?.id || 1;
          try {
            const updated = await api.doctors.update(docId, { avatar: newAvatarUrl });
            handleDoctorProfileUpdated(updated);
            alert('Profile photo updated successfully!');
          } catch (e) {
            console.error('Failed to update avatar:', e);
            const fallback = { ...(currentUser || selectedDoctor), avatar: newAvatarUrl };
            handleDoctorProfileUpdated(fallback);
          }
        }}
        onUpdateCover={async (newCoverUrl) => {
          const docId = currentUser?.id || selectedDoctor?.id || 1;
          try {
            const updated = await api.doctors.update(docId, { coverImage: newCoverUrl });
            handleDoctorProfileUpdated(updated);
            alert('Cover photo updated successfully!');
          } catch (e) {
            console.error('Failed to update cover:', e);
            const fallback = { ...(currentUser || selectedDoctor), coverImage: newCoverUrl };
            handleDoctorProfileUpdated(fallback);
          }
        }}
        onViewFullPageProfile={(doc) => handleOpenDoctorProfile(doc, true)}
      />

      <CreateProfileModal
        isOpen={isCreateProfileOpen}
        onClose={() => setIsCreateProfileOpen(false)}
        currentUser={currentUser}
        onProfileCreated={(savedDoc) => {
          handleDoctorProfileUpdated(savedDoc);
        }}
      />

      <AiCaseAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onInsertCase={(text) => handleCreatePost({ content: text, postType: 'CLINICAL_CASE' })}
      />

      <StoryModal
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
      />

      <VideoPlayerModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        currentUser={currentUser}
        doctors={doctors}
      />

      <ClinicalCaseModal
        clinicalCase={selectedCase}
        onClose={() => setSelectedCase(null)}
      />

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostSubmit={handleCreatePost}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        initialType={createPostInitialType}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;
