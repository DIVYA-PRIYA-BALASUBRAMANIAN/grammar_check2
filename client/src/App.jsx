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

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
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

  // Connection & Notification State
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Active Modals
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [createPostInitialType, setCreatePostInitialType] = useState('CLINICAL_CASE');

  // Active chat peer
  const [activeChatDoctor, setActiveChatDoctor] = useState(null);

  // Sync with Spring Boot MySQL backend on startup
  useEffect(() => {
    async function loadBackendData() {
      try {
        // Load doctors
        const docs = await api.doctors.getAll();
        if (docs && docs.length > 0) {
          setDoctors(docs);
          if (currentUser?.id) {
            const fresh = docs.find(d => d.id === currentUser.id);
            if (fresh) {
              setCurrentUser(fresh);
              try {
                localStorage.setItem('doctor_vet_user', JSON.stringify(fresh));
              } catch (err) {}
            }
          }
        }
      } catch (e) {
        console.log('Using local doctors catalog');
      }

      try {
        // Load feed posts
        const feedPosts = await api.feed.getPosts();
        if (feedPosts && feedPosts.length > 0) {
          setPosts(feedPosts);
        }
      } catch (e) {
        console.log('Using local feed posts');
      }

      try {
        // Load active 24h stories
        const backendStories = await api.stories.getAll();
        if (backendStories && backendStories.length > 0) {
          setStories(backendStories.map(s => ({
            id: s.id,
            doctorName: s.doctorName || 'Doctor',
            fullDoctorName: s.doctorName || 'Doctor',
            avatar: s.avatar || 'https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80',
            image: s.mediaUrl || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
            videoUrl: s.mediaType === 'VIDEO' ? s.mediaUrl : null,
            caption: s.caption || 'Moments from clinical practice',
            time: 'Active'
          })));
        }
      } catch (e) {
        console.log('Using local stories');
      }

      try {
        // Load clinical cases
        const backendCases = await api.cases.getAll();
        if (backendCases && backendCases.length > 0) {
          setClinicalCases(backendCases);
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
        // Load notifications
        if (currentUser?.id) {
          const notifs = await api.notifications.getNotifications(currentUser.id);
          if (notifs && notifs.length > 0) {
            setNotifications(notifs);
          }
        }
      } catch (e) {
        console.log('Using local notifications');
      }

      try {
        // Load connections
        if (currentUser?.id) {
          const myCons = await api.connections.getMy(currentUser.id);
          if (myCons && myCons.length > 0) {
            const map = {};
            myCons.forEach(c => { map[c.id] = true; });
            setConnectedMap(prev => ({ ...prev, ...map }));
          }
          const pending = await api.connections.getPending(currentUser.id);
          if (pending && pending.length > 0) {
            setPendingRequests(pending);
          }
          const sent = await api.connections.getSent(currentUser.id);
          if (sent && sent.length > 0) {
            setSentRequests(sent);
          }
        }
      } catch (e) {
        console.log('No connections yet');
      }

      try {
        // Load chat conversations
        // Load chat conversations with dynamic message history
        if (currentUser?.id) {
          const convList = await api.chat.getConversations(currentUser.id);
          if (convList && convList.length > 0) {
            const fullConvs = await Promise.all(convList.map(async (c) => {
              let msgs = [];
              try {
                msgs = await api.chat.getMessages(c.id);
              } catch (e) {}
              return {
                id: c.id,
                doctor: {
                  id: c.doctor1Id === currentUser.id ? c.doctor2Id : c.doctor1Id,
                  name: c.doctor1Id === currentUser.id ? c.doctor2Name : c.doctor1Name,
                  avatar: c.doctor1Id === currentUser.id ? c.doctor2Avatar : c.doctor1Avatar,
                  specialty: 'Veterinary Practitioner',
                  city: 'Bengaluru'
                },
                lastMessage: c.lastMessage,
                timestamp: 'Active',
                unread: c.doctor1Id === currentUser.id ? c.unreadCountDoctor1 : c.unreadCountDoctor2,
                messages: (msgs || []).map(m => ({
                  id: m.id,
                  sender: m.senderId === currentUser.id ? 'user' : 'doctor',
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
        }
      } catch (e) {
        console.log('No chat conversations yet');
      }
    }

    loadBackendData();
  }, [currentUser]);

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
          }).catch(() => {});
        });

        // Subscribe to live incoming direct chat messages
        stomp.subscribe(`/topic/user/${currentUser.id}/messages`, (frame) => {
          try {
            const incoming = JSON.parse(frame.body);
            setConversations(prev => {
              const convIdx = prev.findIndex(c => c.id === incoming.conversationId);
              const formattedMsg = {
                id: incoming.id || Date.now(),
                sender: incoming.senderId === currentUser.id ? 'user' : 'doctor',
                senderId: incoming.senderId,
                text: incoming.text,
                attachmentUrl: incoming.attachmentUrl,
                attachmentType: incoming.attachmentType,
                time: incoming.createdAt ? new Date(incoming.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
              };

              if (convIdx >= 0) {
                const updated = [...prev];
                const existingList = updated[convIdx].messages || [];
                if (!existingList.some(m => m.id === incoming.id)) {
                  updated[convIdx] = {
                    ...updated[convIdx],
                    lastMessage: incoming.text || 'Sent an attachment',
                    timestamp: 'Just now',
                    unread: incoming.senderId !== currentUser.id ? (updated[convIdx].unread || 0) + 1 : updated[convIdx].unread,
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
                }).catch(() => {});
                return prev;
              }
            });
          } catch (e) {}
        });
      });
    } catch (e) {
      console.warn('STOMP client connection error:', e);
    }

    return () => {
      if (client && client.deactivate) {
        try { client.deactivate(); } catch (e) {}
      }
    };
  }, [currentUser?.id]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoginView(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('doctor_vet_user');
    setCurrentUser(null);
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
    } catch (e) {}
    setConnectedMap(prev => {
      const copy = { ...prev };
      delete copy[targetDoctorId];
      delete copy[`doc-${targetDoctorId}`];
      return copy;
    });
    alert('Doctor removed from connections.');
  };

  // Feed Actions
  const handleLikePost = async (postId) => {
    try {
      await api.feed.toggleLike(postId, currentUser?.id || 1, currentUser?.name || 'Dr. You');
    } catch (e) {}

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
    } catch (e) {}

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
    } catch (e) {}
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleBookmarkPost = async (postId) => {
    try {
      await api.feed.toggleBookmark(postId, currentUser?.id || 1);
    } catch (e) {}

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
    } catch (e) {}
    alert('Thank you. The post has been flagged for veterinary moderation review.');
  };

  const handleCreatePost = async ({ content, postType, imageUrl, videoUrl, videoTitle, specialty, duration, species }) => {
    const authorName = currentUser?.name || 'Dr. You (Verified)';
    const authorSpecialty = currentUser?.specialty || specialty || 'Veterinary Medicine';
    const authorAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80';

    if (postType === 'STORY') {
      const storyPayload = {
        doctorId: currentUser?.id || 1,
        doctorName: currentUser?.name || 'Dr. You',
        avatar: authorAvatar,
        mediaUrl: imageUrl || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
        mediaType: videoUrl ? 'VIDEO' : 'IMAGE',
        caption: content || 'Moments from clinical practice'
      };
      try {
        const savedStory = await api.stories.create(storyPayload);
        const formattedStory = {
          id: savedStory.id || `story-${Date.now()}`,
          doctorName: currentUser?.name ? currentUser.name.replace('Dr. ', '').split(' ')[0] : 'You',
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
      alert('Your 24-hour story is now live in the community moments bar!');
      return;
    }

    if (postType === 'SHORT_VIDEO') {
      const videoPayload = {
        title: videoTitle || (content ? content.slice(0, 50) : 'Clinical Technique Reel'),
        doctorName: authorName,
        doctorSpecialty: `${authorSpecialty} · ${currentUser?.city || 'Bengaluru'}`,
        views: '1',
        duration: duration || '0:45',
        thumbnail: imageUrl || 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=500&q=80',
        videoUrl: videoUrl || null,
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
      imageUrl,
      videoUrl,
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
    setActiveChatDoctor(doctor);
    let existing = conversations.find(c => c.doctor.id === doctor.id || c.doctor.name === doctor.name);
    if (!existing) {
      try {
        const started = await api.chat.startConversation(currentUser?.id || 1, doctor.id, `Hello Doctor, this is ${currentUser?.name || 'Dr. You'}.`);
        let msgs = [];
        if (started && started.id) {
          try {
            msgs = await api.chat.getMessages(started.id);
          } catch (e) {}
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
    } else if (typeof existing.id === 'number') {
      try {
        const msgs = await api.chat.getMessages(existing.id);
        setConversations(prev => prev.map(c => c.id === existing.id ? {
          ...c,
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
      } catch (e) {}
    }
    setActiveTab('messages');
  };

  const handleSelectConversation = async (conv) => {
    setActiveChatDoctor(conv.doctor);
    if (conv?.id && typeof conv.id === 'number') {
      try {
        const msgs = await api.chat.getMessages(conv.id);
        setConversations(prev => prev.map(c => {
          if (c.id === conv.id) {
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
        api.chat.markAsRead(conv.id, currentUser?.id || 1).catch(() => {});
      } catch (e) {}
    }
  };

  const handleSendMessage = async ({ conversationId, receiverId, text, attachmentUrl, attachmentType }) => {
    let targetConvId = conversationId;
    if (typeof conversationId !== 'number' && receiverId) {
      try {
        const started = await api.chat.startConversation(currentUser?.id || 1, receiverId, text);
        if (started?.id) targetConvId = started.id;
      } catch (e) {}
    }

    const optimisticMsg = {
      id: Date.now(),
      sender: 'user',
      senderId: currentUser?.id || 1,
      text,
      attachmentUrl,
      attachmentType,
      time: 'Just now'
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId || conv.id === targetConvId) {
        return {
          ...conv,
          id: targetConvId,
          lastMessage: text || 'Sent an attachment',
          timestamp: 'Just now',
          messages: [...(conv.messages || []), optimisticMsg]
        };
      }
      return conv;
    }));

    try {
      await api.chat.sendMessage({
        conversationId: typeof targetConvId === 'number' ? targetConvId : 1,
        senderId: currentUser?.id || 1,
        receiverId: receiverId || 2,
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
    } catch (e) {}
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.notifications.markAllAsRead(currentUser?.id || 1);
    } catch (e) {}
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

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
        onTabSelect={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        unreadMessagesCount={conversations.reduce((acc, c) => acc + (c.unread || 0), 0)}
        onOpenBenefitsModal={() => setActiveTab('benefits')}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginView(true)}
        onLogout={handleLogout}
        onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
      />

      {/* 2. Main Content Layout */}
      <div className="main-content-layout">
        {/* Top Persistent Header with LinkedIn-style navigation & notification dropdown */}
        <Header
          searchQuery={globalSearch}
          onSearchChange={(query) => {
            setGlobalSearch(query);
            if (query.trim() && activeTab !== 'search') {
              setActiveTab('search');
            }
          }}
          activeTab={activeTab}
          onTabSelect={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginView(true)}
          onLogout={handleLogout}
          onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
          onOpenDoctorProfile={(doc) => setSelectedDoctor(doc || currentUser)}
          unreadMessagesCount={conversations.reduce((acc, c) => acc + (c.unread || 0), 0)}
          unreadNotificationsCount={unreadNotifsCount}
          pendingRequestsCount={pendingRequests.length}
          notifications={notifications}
          onAcceptRequest={handleAcceptRequest}
          onIgnoreRequest={handleRejectRequest}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onOpenCreatePost={handleOpenCreatePost}
        />

        {/* 2-Column Workspace Layout */}
        <div className="workspace-two-column-layout">
          {/* Main Feed Column */}
          <main className="feed-main-column">
            {activeTab === 'feed' && (
              <FeedView
                posts={posts}
                stories={stories}
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
              />
            )}

            {activeTab === 'network' && (
              <VetNetworkView
                doctors={doctors}
                onSelectDoctor={(doc) => setSelectedDoctor(doc)}
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
                onOpenStory={(s) => setSelectedStory(s)}
                onOpenCreateVideo={handleOpenCreatePost}
                onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
                onSelectVideo={(v) => setSelectedVideo(v)}
              />
            )}

            {activeTab === 'messages' && (
              <MessagesView
                conversations={conversations}
                activeChatDoctor={activeChatDoctor}
                onSelectConversation={handleSelectConversation}
                onSendMessage={handleSendMessage}
                onOpenDoctorProfile={(doc) => setSelectedDoctor(doc)}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'search' && (
              <SearchView
                doctors={doctors}
                onSelectDoctor={(doc) => setSelectedDoctor(doc)}
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
              <AdvertiseView />
            )}
          </main>

          {/* Right Rail Widgets (People to Know & Network Advantage) */}
          <RightSidebar
            doctors={doctors}
            onSelectDoctor={(doc) => setSelectedDoctor(doc)}
            onViewAllDoctors={() => setActiveTab('network')}
            onSendRequest={handleSendRequest}
            connectedDoctors={Object.keys(connectedMap).map(k => ({ id: isNaN(k) ? k : Number(k) }))}
          />
        </div>
      </div>

      {/* Interactive Modals */}
      <DoctorModal
        doctor={selectedDoctor}
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
      />

      <CreateProfileModal
        isOpen={isCreateProfileOpen}
        onClose={() => setIsCreateProfileOpen(false)}
        currentUser={currentUser}
        onProfileCreated={(savedDoc) => {
          setDoctors(prev => {
            const idx = prev.findIndex(d => d.id === savedDoc.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = savedDoc;
              return copy;
            }
            return [savedDoc, ...prev];
          });
          setCurrentUser(savedDoc);
          try {
            localStorage.setItem('doctor_vet_user', JSON.stringify(savedDoc));
          } catch (e) {}
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
