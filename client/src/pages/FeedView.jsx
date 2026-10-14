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
  PawPrint,
  Send,
  Trash2,
  Flag,
  MoreHorizontal
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
  onLikePost,
  onAddComment,
  onDeletePost,
  onBookmarkPost,
  onReportPost,
  currentUser
}) {
  const [activeTab, setActiveTab] = useState('for_you');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All specialties');
  const [selectedState, setSelectedState] = useState('All states');
  const [selectedType, setSelectedType] = useState('All posts');

  // Expanded comments for each post: { [postId]: boolean }
  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);

  const toggleComments = (postId) => {
    setOpenComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentSubmit = (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    if (onAddComment) {
      onAddComment(postId, text);
    }
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const filteredPosts = posts.filter(post => {
    if (selectedSpecialty !== 'All specialties' && post.authorSpecialty !== selectedSpecialty) return false;
    if (selectedType === 'Clinical cases' && post.type !== 'CLINICAL_CASE') return false;
    if (selectedType === 'Short videos' && post.type !== 'SHORT_VIDEO') return false;
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
              Meet your peers. Share your clinical cases. Move veterinary practice forward.
            </p>
            <button 
              className="btn-make-mark"
              onClick={() => onOpenCreatePost('CLINICAL_CASE')}
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
          <button className="story-circle-item" onClick={() => onOpenCreatePost('STORY')}>
            <div className="story-ring-circle add-your-story">
              <Plus size={20} />
            </div>
            <span className="story-doc-label">Your story</span>
          </button>

          {/* Doctor Community Stories */}
          {stories.map((story, index) => {
            const hasActiveDot = index === stories.length - 1;
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
            onClick={() => onOpenCreatePost('CLINICAL_CASE')}
          >
            <span>Share a clinical discovery, diagnosis, surgical technique, or little inspiration...</span>
            <ImageIcon size={17} color="#9ca3af" />
          </div>
        </div>

        <div className="composer-tools-row">
          <div className="composer-action-pills">
            <button className="btn-composer-pill" onClick={() => onOpenCreatePost('GENERAL_POST')}>
              <ImageIcon size={15} color="#059669" />
              <span>Photo / Post</span>
            </button>

            <button className="btn-composer-pill" onClick={() => onOpenCreatePost('CLINICAL_CASE')}>
              <Briefcase size={15} color="#059669" />
              <span>Clinical case</span>
            </button>

            <button className="btn-composer-pill" onClick={() => onOpenCreatePost('STORY')}>
              <Plus size={15} color="#059669" />
              <span>Story</span>
            </button>

            <button className="btn-composer-pill" onClick={() => onOpenCreatePost('SHORT_VIDEO')}>
              <Video size={15} color="#059669" />
              <span>Short video</span>
            </button>

            <button className="btn-composer-pill ai-assistant-pill" onClick={onOpenAiAssistant}>
              <Sparkles size={15} color="#059669" />
              <span>AI case assistant</span>
            </button>
          </div>

          <button className="btn-post-submit-dark" onClick={() => onOpenCreatePost('CLINICAL_CASE')}>
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
        {filteredPosts.map((post) => {
          const isOwnPost = currentUser && (
            post.authorId === currentUser.id ||
            post.authorName === currentUser.name ||
            post.authorId === 'doc-me'
          );

          return (
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                  <button 
                    onClick={() => onBookmarkPost && onBookmarkPost(post.id)}
                    style={{ background: 'none', border: 'none', color: post.isBookmarked ? '#C5A059' : '#9ca3af', cursor: 'pointer', padding: '4px' }}
                    title={post.isBookmarked ? 'Bookmarked' : 'Save post'}
                  >
                    <Bookmark size={18} fill={post.isBookmarked ? '#C5A059' : 'none'} />
                  </button>

                  <button
                    onClick={() => setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)}
                    style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
                    title="Options"
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  {/* Post Options Dropdown */}
                  {activeMenuPostId === post.id && (
                    <div style={{
                      position: 'absolute',
                      top: '28px',
                      right: 0,
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      border: '1px solid #E5E7EB',
                      padding: '4px',
                      zIndex: 30,
                      width: '140px'
                    }}>
                      {isOwnPost && onDeletePost && (
                        <button
                          onClick={() => {
                            setActiveMenuPostId(null);
                            onDeletePost(post.id);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            width: '100%',
                            padding: '6px 10px',
                            border: 'none',
                            background: 'none',
                            color: '#DC2626',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            borderRadius: '4px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Trash2 size={13} />
                          <span>Delete Post</span>
                        </button>
                      )}
                      {onReportPost && (
                        <button
                          onClick={() => {
                            setActiveMenuPostId(null);
                            onReportPost(post.id);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            width: '100%',
                            padding: '6px 10px',
                            border: 'none',
                            background: 'none',
                            color: '#4B5563',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            borderRadius: '4px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Flag size={13} />
                          <span>Report Post</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {post.badgeLabel && (
                <div className="post-badge-pill">
                  <Stethoscope size={13} />
                  <span>{post.badgeLabel}</span>
                </div>
              )}

              <p className="post-body-text">{post.content}</p>

              {/* Video Player or Image Preview */}
              {post.videoUrl ? (
                <div style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000', maxHeight: '380px', marginBottom: '14px' }}>
                  <video 
                    src={post.videoUrl} 
                    controls 
                    playsInline 
                    style={{ width: '100%', maxHeight: '380px', objectFit: 'contain', display: 'block' }} 
                  />
                </div>
              ) : post.imageUrl ? (
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
              ) : null}

              {/* Action Buttons */}
              <div className="post-card-footer">
                <div className="post-actions-group">
                  <button 
                    className={`post-action-btn ${post.isLiked ? 'liked' : ''}`}
                    onClick={() => onLikePost(post.id)}
                  >
                    <Heart size={17} fill={post.isLiked ? '#ef4444' : 'none'} color={post.isLiked ? '#ef4444' : '#6b7280'} />
                    <span>{post.likes}</span>
                  </button>

                  <button 
                    className="post-action-btn"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageSquare size={17} color={openComments[post.id] ? '#059669' : '#6b7280'} />
                    <span>{post.commentsCount || (post.comments ? post.comments.length : 0)} comments</span>
                  </button>

                  <button 
                    className="post-action-btn"
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert('Post link copied to clipboard!');
                    }}
                  >
                    <Share2 size={17} />
                    <span>Share</span>
                  </button>
                </div>

                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{post.timeAgo || 'Recent'}</span>
              </div>

              {/* Expandable Comments Drawer */}
              {openComments[post.id] && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #F3F4F6',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {/* Comments Stream */}
                  {(post.comments && post.comments.length > 0) ? (
                    post.comments.map((c, idx) => (
                      <div key={c.id || idx} style={{ display: 'flex', gap: '8px', fontSize: '12.5px' }}>
                        <img 
                          src={c.authorAvatar || "https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=150&q=80"} 
                          alt={c.authorName}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{
                          backgroundColor: '#F9FAFB',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          flex: 1
                        }}>
                          <strong style={{ color: '#111827', display: 'block', fontSize: '12px' }}>{c.authorName}</strong>
                          <span style={{ color: '#4B5563', lineHeight: 1.35 }}>{c.content}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic' }}>
                      No comments yet. Start the clinical discussion!
                    </p>
                  )}

                  {/* Add Comment Input Form */}
                  <form 
                    onSubmit={(e) => handleCommentSubmit(e, post.id)}
                    style={{ display: 'flex', gap: '8px', marginTop: '6px' }}
                  >
                    <input 
                      type="text" 
                      placeholder="Add a clinical comment or inquiry..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      style={{
                        flex: 1,
                        padding: '8px 14px',
                        borderRadius: '9999px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#F9FAFB',
                        fontSize: '12.5px',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#003822',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '9999px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Send</span>
                      <Send size={12} />
                    </button>
                  </form>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
