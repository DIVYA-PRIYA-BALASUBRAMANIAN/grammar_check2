import React, { useState } from 'react';
import { 
  ArrowRight, 
  Plus, 
  Image as ImageIcon, 
  Briefcase, 
  Video, 
  Sparkles, 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Share2, 
  CheckCircle2,
  Stethoscope,
  Users,
  PawPrint
} from 'lucide-react';
import heroVetImg from '../assets/hero_vet_dog.jpg';
import { SPECIALTIES, STATES_INDIA } from '../data/mockData';

export function FeedView({ 
  posts = [], 
  stories = [], 
  onOpenStory, 
  onOpenCreatePost, 
  onOpenAiAssistant,
  onOpenClinicalCase,
  onLikePost
}) {
  const [activeTab, setActiveTab] = useState('for_you');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All specialties');
  const [selectedState, setSelectedState] = useState('All states');
  const [selectedType, setSelectedType] = useState('All posts');

  const filteredPosts = posts.filter(post => {
    if (selectedSpecialty !== 'All specialties' && post.authorSpecialty !== selectedSpecialty) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Hero Banner with Veterinarian & Golden Retriever */}
      <div className="feed-hero-banner">
        <div className="hero-banner-inner">
          <div className="hero-text-content">
            <span className="hero-tag-kicker">The Doctor Vet Community</span>
            <h1 className="hero-headline">
              A world of care.<br />
              <span className="hero-headline-highlight">Connected.</span>
            </h1>
            <p className="hero-subtext">
              Meet your peers. Share your practice. Move veterinary care forward.
            </p>
            <button 
              className="btn-make-mark"
              onClick={onOpenCreatePost}
            >
              <span>Make your mark</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="hero-photo-wrap">
            <PawPrint size={90} className="hero-paw-watermark" />
            <img 
              src={heroVetImg} 
              alt="Veterinarian with dog" 
              className="hero-photo-img" 
            />
          </div>
        </div>
      </div>

      {/* 2. Moments from the community (Stories Carousel) */}
      <div className="stories-section-container">
        <div className="stories-section-header">
          <div className="stories-header-left">
            <Users size={17} color="#059669" />
            <span>Moments from the community</span>
          </div>

          <button 
            className="stories-view-all-link"
            onClick={() => stories.length > 0 && onOpenStory(stories[0])}
          >
            <span>STORIES</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="stories-avatar-track">
          {/* Your Story Button */}
          <button className="story-circle-item" onClick={onOpenCreatePost}>
            <div className="story-ring-circle add-your-story">
              <Plus size={20} />
            </div>
            <span className="story-doc-label">Your story</span>
          </button>

          {/* Doctor Community Stories */}
          {stories.map((story, index) => {
            const hasActiveDot = index === stories.length - 1; // Ritika has active green dot
            return (
              <button 
                key={story.id} 
                className="story-circle-item"
                onClick={() => onOpenStory(story)}
              >
                <div className="story-ring-circle">
                  <img src={story.avatar} alt={story.doctorName} className="story-avatar-photo" />
                  {hasActiveDot && <span className="story-active-dot" />}
                </div>
                <span className="story-doc-label">{story.doctorName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Post Composer Card */}
      <div className="feed-post-composer">
        <div className="composer-input-row">
          <div className="composer-stethoscope-badge">
            <Stethoscope size={21} />
          </div>
          <div 
            className="composer-fake-input-pill"
            onClick={onOpenCreatePost}
          >
            <span>Share a discovery, a case, a little inspiration...</span>
            <ImageIcon size={17} color="#9ca3af" />
          </div>
        </div>

        <div className="composer-tools-row">
          <div className="composer-action-pills">
            <button className="btn-composer-pill" onClick={onOpenCreatePost}>
              <ImageIcon size={15} color="#059669" />
              <span>Photo / Post</span>
            </button>

            <button className="btn-composer-pill" onClick={onOpenCreatePost}>
              <Briefcase size={15} color="#059669" />
              <span>Clinical case</span>
            </button>

            <button className="btn-composer-pill" onClick={onOpenCreatePost}>
              <Plus size={15} color="#059669" />
              <span>Story</span>
            </button>

            <button className="btn-composer-pill" onClick={onOpenCreatePost}>
              <Video size={15} color="#059669" />
              <span>Short video</span>
            </button>

            <button className="btn-composer-pill ai-assistant-pill" onClick={onOpenAiAssistant}>
              <Sparkles size={15} color="#059669" />
              <span>AI case assistant</span>
            </button>
          </div>

          <button className="btn-post-submit-dark" onClick={onOpenCreatePost}>
            <span>Post</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 4. Filter Tabs & Controls Row */}
      <div className="feed-filter-bar">
        <div className="feed-tabs-row">
          <div className="feed-tabs-group">
            <button 
              className={`feed-tab-btn ${activeTab === 'for_you' ? 'active' : ''}`}
              onClick={() => setActiveTab('for_you')}
            >
              For you
            </button>
            <button 
              className={`feed-tab-btn ${activeTab === 'popular' ? 'active' : ''}`}
              onClick={() => setActiveTab('popular')}
            >
              Popular
            </button>
            <button 
              className={`feed-tab-btn ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              Following
            </button>
          </div>

          <div className="community-feed-badge">
            <span className="status-dot-green"></span>
            <span>Community Feed</span>
          </div>
        </div>

        <div className="filter-dropdowns-strip">
          <select 
            className="pill-select-control"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            className="pill-select-control"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            {STATES_INDIA.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            className="pill-select-control"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="All posts">All posts</option>
            <option value="Clinical cases">Clinical cases</option>
            <option value="Short videos">Short videos</option>
          </select>

          <span className="results-count-label">{filteredPosts.length} RESULTS</span>
        </div>
      </div>

      {/* 5. Feed Posts Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredPosts.map((post) => (
          <article key={post.id} className="feed-post-card" id={`post-${post.id}`}>
            <div className="post-card-header">
              <div className="post-author-block">
                <img src={post.authorAvatar} alt={post.authorName} className="post-avatar-img" />
                <div>
                  <div className="post-author-name-row">
                    <h3 className="post-author-name">{post.authorName}</h3>
                    <CheckCircle2 size={15} color="#00a86b" />
                  </div>
                  <span className="post-author-meta">{post.authorSpecialty} · {post.authorCity}</span>
                </div>
              </div>

              <button style={{ color: '#9ca3af' }}>
                <Bookmark size={18} />
              </button>
            </div>

            {post.badgeLabel && (
              <div className="post-badge-pill">
                <Stethoscope size={13} />
                <span>{post.badgeLabel}</span>
              </div>
            )}

            <p className="post-body-text">{post.content}</p>

            {post.imageUrl && (
              <div 
                className="post-image-preview-container"
                onClick={() => onOpenClinicalCase && onOpenClinicalCase({
                  title: post.badgeLabel || "Clinical Case Finding",
                  authorName: post.authorName,
                  authorSpecialty: post.authorSpecialty,
                  species: post.species || "Canine",
                  presentingComplaint: post.content,
                  clinicalFindings: "Presented for routine follow-up and specialized examination.",
                  diagnostics: "Microscopic cytology and diagnostic imaging evaluated.",
                  diagnosis: "Presumptive / Confirmed Clinical Case",
                  treatmentProtocol: "Medical management with targeted therapeutics.",
                  outcome: "Full clinical remission observed at follow-up.",
                  mediaUrl: post.imageUrl
                })}
                style={{ cursor: 'pointer' }}
                title="Click to review clinical details"
              >
                <img src={post.imageUrl} alt="Clinical case" className="post-image-preview" loading="lazy" />
              </div>
            )}

            <div className="post-card-footer">
              <div className="post-actions-group">
                <button 
                  className={`post-action-btn ${post.isLiked ? 'liked' : ''}`}
                  onClick={() => onLikePost(post.id)}
                >
                  <Heart size={17} fill={post.isLiked ? '#ef4444' : 'none'} color={post.isLiked ? '#ef4444' : '#6b7280'} />
                  <span>{post.likes}</span>
                </button>

                <button className="post-action-btn">
                  <MessageSquare size={17} />
                  <span>{post.commentsCount} comments</span>
                </button>

                <button className="post-action-btn">
                  <Share2 size={17} />
                  <span>Share</span>
                </button>
              </div>

              <span style={{ fontSize: '12px', color: '#9ca3af' }}>{post.timeAgo}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
