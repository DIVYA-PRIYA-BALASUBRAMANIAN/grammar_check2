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

// Mock Data Fallbacks
import {
  MOCK_DOCTORS,
  MOCK_STORIES,
  MOCK_POSTS,
  MOCK_CLINICAL_CASES,
  MOCK_SHORT_VIDEOS,
  MOCK_CONVERSATIONS
} from './data/mockData';

export function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [globalSearch, setGlobalSearch] = useState('');

  // Authentication State: strictly initialized from stored session or null
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('doctor_vet_user');
      const token = localStorage.getItem('doctor_vet_token');
      return (saved && token) ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isLoginView, setIsLoginView] = useState(false);

  // Dynamic App State (Public items like feed & doctors are loaded, private items start empty)
  const [doctors, setDoctors] = useState(MOCK_DOCTORS);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [clinicalCases, setClinicalCases] = useState(MOCK_CLINICAL_CASES);
  const [videos, setVideos] = useState(MOCK_SHORT_VIDEOS);
  const [stories, setStories] = useState(MOCK_STORIES);

  // Private User States: strictly populated only for authenticated users
  const [conversations, setConversations] = useState([]);
  const [connectedMap, setConnectedMap] = useState({});
  const [myConnections, setMyConnections] = useState([]);
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

  // 1. Validate session on startup with backend
  useEffect(() => {
    async function validateSession() {
      const token = localStorage.getItem('doctor_vet_token');
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
      try {
        const docs = await api.doctors.getAll();
        if (docs && docs.length > 0) {
          setDoctors(docs);
        }
      } catch (e) {
        console.log('Using local doctors catalog');
      }

      try {
        const feedPosts = await api.feed.getPosts();
        if (feedPosts && feedPosts.length > 0) {
          setPosts(feedPosts);
        }
      } catch (e) {
        console.log('Using local feed posts');
      }

      // Private Endpoints: ONLY requested when user is authenticated
      if (currentUser?.id && localStorage.getItem('doctor_vet_token')) {
        const rawId = currentUser.id;
        const docId = typeof rawId === 'string' && rawId.startsWith('doc-')
          ? parseInt(rawId.replace('doc-', ''), 10)
          : Number(rawId);

        if (!isNaN(docId) && docId > 0) {
          try {
            const notifs = await api.notifications.getNotifications(docId);
            if (notifs) setNotifications(notifs);
          } catch (e) {}

          try {
            const myCons = await api.connections.getMy(docId);
            if (myCons && myCons.length > 0) {
              setMyConnections(myCons);
              const map = {};
              myCons.forEach(c => { map[c.id] = true; map[`doc-${c.id}`] = true; });
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
            const convs = await api.chat.getConversations(docId);
            setConversations(convs || []);
          } catch (e) {
            setConversations([]);
          }
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
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoginView(false);
    setActiveTab('feed');
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {}
    localStorage.removeItem('doctor_vet_user');
    localStorage.removeItem('doctor_vet_token');
    setCurrentUser(null);
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
    const authorAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80';

    if (postType === 'STORY') {
      const newStory = {
        id: `story-${Date.now()}`,
        doctorName: currentUser?.name ? currentUser.name.replace('Dr. ', '').split(' ')[0] : 'You',
        fullDoctorName: authorName,
        avatar: authorAvatar,
        image: imageUrl || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
        videoUrl: videoUrl || null,
        caption: content || 'Moments from clinical practice',
        time: 'Just now'
      };
      setStories([newStory, ...stories]);
      alert('Your 24-hour story is now live in the community moments bar!');
      return;
    }

    if (postType === 'SHORT_VIDEO') {
      const newVideo = {
        id: `vid-${Date.now()}`,
        title: videoTitle || content.slice(0, 50) || 'Clinical Technique Reel',
        doctorName: authorName,
        doctorSpecialty: `${authorSpecialty} · Bengaluru`,
        views: '1',
        duration: duration || '0:45',
        thumbnail: imageUrl || 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=500&q=80',
        videoUrl: videoUrl || null,
        likes: 1,
        comments: 0
      };
      setVideos([newVideo, ...videos]);
      try {
        await api.videos.create(newVideo);
      } catch (e) { }
    }

    const newPost = {
      id: `post-${Date.now()}`,
      authorId: currentUser?.id || 1,
      authorName,
      authorSpecialty,
      authorCity: currentUser?.city || 'Bengaluru',
      authorAvatar,
      timeAgo: 'Just now',
      type: postType,
      badgeLabel: postType === 'CLINICAL_CASE'
        ? 'CLINICAL CASE REPORT'
        : postType === 'SHORT_VIDEO'
          ? 'CLINICAL REEL · VIDEO'
          : 'CLINICAL UPDATE',
      content: videoTitle ? `${videoTitle} — ${content}` : content,
      imageUrl,
      videoUrl,
      likes: 1,
      commentsCount: 0,
      isLiked: false,
      species: species || 'Canine',
      comments: []
    };

    setPosts([newPost, ...posts]);
    try {
      await api.feed.createPost(newPost);
    } catch (e) { }

    if (postType === 'CLINICAL_CASE') {
      const newCase = {
        id: `case-${Date.now()}`,
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
      setClinicalCases([newCase, ...clinicalCases]);
      try {
        await api.cases.create(newCase);
      } catch (e) { }
    }
  };

  // Messaging Handlers
  const handleOpenDirectChat = async (doctor) => {
    setActiveChatDoctor(doctor);
    const existing = conversations.find(c => c.doctor?.id === doctor.id || c.doctor?.name === doctor.name);
    if (!existing) {
      let convId = `chat-${Date.now()}`;
      if (currentUser?.id) {
        try {
          const created = await api.chat.startConversation(currentUser.id, doctor.id, '');
          if (created?.id) convId = created.id;
        } catch (e) {}
      }

      const newConv = {
        id: convId,
        doctor,
        lastMessage: 'Started new direct consultation.',
        timestamp: 'Just now',
        unread: 0,
        messages: []
      };
      setConversations(prev => [newConv, ...prev.filter(c => c.id !== convId)]);
    }
    setActiveTab('messages');
  };

  const handleSendMessage = async ({ conversationId, receiverId, text, attachmentUrl, attachmentType }) => {
    const newMessage = {
      id: Date.now(),
      sender: 'user',
      senderId: currentUser?.id,
      text,
      attachmentUrl,
      attachmentType,
      time: 'Just now'
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId || (conv.doctor?.id === receiverId)) {
        return {
          ...conv,
          lastMessage: text || 'Sent an attachment',
          timestamp: 'Just now',
          messages: [...(conv.messages || []), newMessage]
        };
      }
      return conv;
    }));

    try {
      await api.chat.sendMessage({
        conversationId: typeof conversationId === 'number' ? conversationId : 1,
        senderId: currentUser?.id,
        receiverId: receiverId,
        text,
        attachmentUrl,
        attachmentType
      });
    } catch (e) { }
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

  if (isLoginView || activeTab === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onCancel={() => {
          setIsLoginView(false);
          if (activeTab === 'login') setActiveTab('feed');
        }}
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
              onSelectConversation={(c) => setActiveChatDoctor(c.doctor)}
              onSendMessage={handleSendMessage}
              onOpenDoctorProfile={(doc) => setSelectedDoctor(doc)}
              currentUser={currentUser}
              doctors={doctors}
              connectedDoctors={myConnections}
              onOpenLogin={() => setIsLoginView(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
            />
          </div>
        ) : (
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

              {activeTab === 'search' && (
                <SearchView
                  onSelectDoctor={(doc) => setSelectedDoctor(doc)}
                  onSelectCase={(c) => setSelectedCase(c)}
                  onSelectVideo={(v) => setSelectedVideo(v)}
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
            />
          </div>
        )}
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
      />

      <CreateProfileModal
        isOpen={isCreateProfileOpen}
        onClose={() => setIsCreateProfileOpen(false)}
        onProfileCreated={(newDoc) => {
          setDoctors([newDoc, ...doctors]);
          setCurrentUser(newDoc);
          setActiveTab('network');
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
