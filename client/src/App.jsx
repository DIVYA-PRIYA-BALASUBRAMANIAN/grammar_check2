import React, { useState } from 'react';
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

// Mock Data
import {
  MOCK_DOCTORS,
  MOCK_STORIES,
  MOCK_POSTS,
  MOCK_CLINICAL_CASES,
  MOCK_SHORT_VIDEOS,
  MOCK_CONVERSATIONS
} from './data/mockData';

export function App() {
  const [activeTab, setActiveTab] = useState('feed'); // Start directly on the Feed page!
  const [globalSearch, setGlobalSearch] = useState('');

  // Dynamic App State
  const [doctors, setDoctors] = useState(MOCK_DOCTORS);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [clinicalCases, setClinicalCases] = useState(MOCK_CLINICAL_CASES);
  const [videos, setVideos] = useState(MOCK_SHORT_VIDEOS);
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [connectedMap, setConnectedMap] = useState({ 'doc-1': true });

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('doctor_vet_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isLoginView, setIsLoginView] = useState(false);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoginView(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('doctor_vet_user');
    setCurrentUser(null);
  };

  // Active Modals
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  // Active chat peer
  const [activeChatDoctor, setActiveChatDoctor] = useState(null);

  const toggleConnect = (docId) => {
    setConnectedMap(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const handleLikePost = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  const handleDoctorCreated = (newDoctor) => {
    setDoctors([newDoctor, ...doctors]);
    setConnectedMap(prev => ({ ...prev, [newDoctor.id]: true }));
    setActiveTab('network');
  };

  const handleCreatePost = ({ content, postType, imageUrl, species }) => {
    const newPost = {
      id: `post-${Date.now()}`,
      authorId: 'doc-me',
      authorName: 'Dr. You (Verified)',
      authorSpecialty: 'Veterinary Medicine',
      authorCity: 'Bengaluru',
      authorAvatar: 'https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80',
      timeAgo: 'Just now',
      type: postType,
      badgeLabel: postType === 'CLINICAL_CASE' ? 'CLINICAL CASE REPORT' : 'CLINICAL UPDATE',
      content,
      imageUrl,
      likes: 1,
      commentsCount: 0,
      isLiked: false,
      species: species || 'Canine'
    };

    setPosts([newPost, ...posts]);
    if (postType === 'CLINICAL_CASE') {
      const newCase = {
        id: `case-${Date.now()}`,
        title: content.slice(0, 50) + '...',
        authorName: 'Dr. You (Verified)',
        authorSpecialty: 'Veterinary Medicine',
        species: species || 'Canine',
        presentingComplaint: content,
        clinicalFindings: 'Physical exam and diagnostic tests completed.',
        diagnostics: 'Diagnostics evaluated.',
        diagnosis: 'Case under peer review',
        treatmentProtocol: 'Standard clinical management protocol.',
        outcome: 'Active management',
        views: 12,
        comments: 0,
        mediaUrl: imageUrl
      };
      setClinicalCases([newCase, ...clinicalCases]);
    }
  };

  const handleOpenDirectChat = (doctor) => {
    setActiveChatDoctor(doctor);
    const existing = conversations.find(c => c.doctor.id === doctor.id);
    if (!existing) {
      const newConv = {
        id: `chat-${Date.now()}`,
        doctor,
        lastMessage: 'Started new direct consultation.',
        timestamp: 'Just now',
        unread: 0,
        messages: [
          { id: 1, sender: 'doctor', text: `Hello Doctor, this is ${doctor.name}. How can I collaborate on this case with you?`, time: 'Just now' }
        ]
      };
      setConversations([newConv, ...conversations]);
    }
    setActiveTab('messages');
  };

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
      {/* 1. Left Sidebar (Fixed, Dark Forest Green) */}
      <LeftSidebar
        activeTab={activeTab}
        onTabSelect={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        unreadMessagesCount={1}
        onOpenBenefitsModal={() => setActiveTab('benefits')}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginView(true)}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Layout (Top Header + 2-Column Workspace) */}
      <div className="main-content-layout">
        {/* Top Persistent Header */}
        <Header
          searchQuery={globalSearch}
          onSearchChange={(query) => {
            setGlobalSearch(query);
            if (query.trim() && activeTab !== 'search') {
              setActiveTab('search');
            }
          }}
          onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginView(true)}
        />

        {/* 2-Column Workspace Layout */}
        <div className="workspace-two-column-layout">
          {/* Main Feed Column */}
          <main className="feed-main-column">
            {activeTab === 'feed' && (
              <FeedView
                posts={posts}
                stories={MOCK_STORIES}
                onOpenStory={(s) => setSelectedStory(s)}
                onOpenCreatePost={() => setIsCreatePostOpen(true)}
                onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
                onOpenClinicalCase={(c) => setSelectedCase(c)}
                onLikePost={handleLikePost}
              />
            )}

            {activeTab === 'network' && (
              <VetNetworkView
                doctors={doctors}
                onSelectDoctor={(doc) => setSelectedDoctor(doc)}
                connectedDoctors={connectedMap}
                onToggleConnect={toggleConnect}
              />
            )}

            {activeTab === 'cases' && (
              <ClinicalCasesView
                clinicalCases={clinicalCases}
                stories={MOCK_STORIES}
                onOpenStory={(s) => setSelectedStory(s)}
                onOpenCreateCase={() => setIsCreatePostOpen(true)}
                onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
                onSelectCase={(c) => setSelectedCase(c)}
              />
            )}

            {activeTab === 'videos' && (
              <ShortVideosView
                videos={videos}
                stories={MOCK_STORIES}
                onOpenStory={(s) => setSelectedStory(s)}
                onOpenCreateVideo={() => setIsCreatePostOpen(true)}
                onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
                onSelectVideo={(v) => setSelectedVideo(v)}
              />
            )}

            {activeTab === 'messages' && (
              <MessagesView
                conversations={conversations}
                onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
                activeChatDoctor={activeChatDoctor}
                onSelectConversation={(c) => setActiveChatDoctor(c.doctor)}
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

          {/* Right Rail Widgets (People to Know & Advantage) */}
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
        isConnected={selectedDoctor ? !!connectedMap[selectedDoctor.id] : false}
        onToggleConnect={toggleConnect}
      />

      <CreateProfileModal
        isOpen={isCreateProfileOpen}
        onClose={() => setIsCreateProfileOpen(false)}
        onProfileCreated={handleDoctorCreated}
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
      />
    </div>
  );
}

export default App;
