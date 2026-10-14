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

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('doctor_vet_user');
      return saved ? JSON.parse(saved) : {
        id: 1,
        name: 'Dr. Ananya Sharma',
        specialty: 'Small Animal Medicine',
        city: 'Bengaluru',
        state: 'Karnataka',
        avatar: 'https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80',
        verified: true
      };
    } catch (e) {
      return null;
    }
  });
  const [isLoginView, setIsLoginView] = useState(false);

  // Dynamic App State
  const [doctors, setDoctors] = useState(MOCK_DOCTORS);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [clinicalCases, setClinicalCases] = useState(MOCK_CLINICAL_CASES);
  const [videos, setVideos] = useState(MOCK_SHORT_VIDEOS);
  const [stories, setStories] = useState(MOCK_STORIES);
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [connectedMap, setConnectedMap] = useState({ 'doc-2': true, '2': true });

  // Connection & Notification State
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 101,
      senderId: 3,
      senderName: 'Dr. Priya Nair',
      senderSpecialty: 'Veterinary Dermatology · Kochi',
      senderAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
      receiverId: 1
    }
  ]);
  const [sentRequests, setSentRequests] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      senderName: 'Dr. Priya Nair',
      senderAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
      type: 'CONNECTION_REQUEST',
      message: 'Dr. Priya Nair sent you a connection request.',
      targetId: 101,
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      senderName: 'Dr. Arjun Mehta',
      senderAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
      type: 'CONNECTION_ACCEPTED',
      message: 'Dr. Arjun Mehta accepted your connection request.',
      targetId: 2,
      read: true,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]);

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
        }
      } catch (e) {
        console.log('Using local connection states');
      }
    }

    loadBackendData();
  }, [currentUser]);

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
      } catch (e) {}
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
    } catch (e) {}

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
      } catch (e) {}
    }
  };

  // Messaging Handlers
  const handleOpenDirectChat = (doctor) => {
    setActiveChatDoctor(doctor);
    const existing = conversations.find(c => c.doctor.id === doctor.id || c.doctor.name === doctor.name);
    if (!existing) {
      const newConv = {
        id: `chat-${Date.now()}`,
        doctor,
        lastMessage: 'Started new direct consultation.',
        timestamp: 'Just now',
        unread: 0,
        messages: [
          { id: 1, sender: 'doctor', text: `Hello Doctor, this is ${doctor.name}. How can I assist you with this clinical case?`, time: 'Just now' }
        ]
      };
      setConversations([newConv, ...conversations]);
    }
    setActiveTab('messages');
  };

  const handleSendMessage = async ({ conversationId, receiverId, text, attachmentUrl, attachmentType }) => {
    const newMessage = {
      id: Date.now(),
      sender: 'user',
      senderId: currentUser?.id || 1,
      text,
      attachmentUrl,
      attachmentType,
      time: 'Just now'
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
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
        senderId: currentUser?.id || 1,
        receiverId: receiverId || 2,
        text,
        attachmentUrl,
        attachmentType
      });
    } catch (e) {}
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
                onSelectConversation={(c) => setActiveChatDoctor(c.doctor)}
                onSendMessage={handleSendMessage}
                onOpenDoctorProfile={(doc) => setSelectedDoctor(doc)}
                currentUser={currentUser}
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
