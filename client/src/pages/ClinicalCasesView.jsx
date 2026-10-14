import React, { useState } from 'react';
import { 
  ArrowRight, 
  Plus, 
  MessageSquare, 
  Heart, 
  Share2, 
  Bookmark, 
  CheckCircle2, 
  MoreHorizontal,
  PawPrint,
  Stethoscope
} from 'lucide-react';
import heroVetImg from '../assets/hero_vet_dog.jpg';

import { Avatar } from '../components/Avatar';

export function ClinicalCasesView({ 
  clinicalCases = [],
  stories = [], 
  doctors = [],
  currentUser,
  onOpenStory, 
  onOpenCreateCase, 
  onSelectCase 
}) {
  const [likedMap, setLikedMap] = useState({});

  const toggleLike = (id, baseLikes) => {
    setLikedMap(prev => ({
      ...prev,
      [id]: prev[id] ? undefined : baseLikes + 1
    }));
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Light Hero Banner matching reference image */}
      <div className="cases-hero-banner-light">
        <div className="hero-banner-inner">
          <div className="hero-text-content">
            <span className="hero-tag-kicker">The Doctor Vet Community</span>
            <h1 className="hero-headline">Every case. A new perspective.</h1>
            <p className="hero-subtext">
              Explore the knowledge and experiences of your community.
            </p>
            <button 
              className="btn-make-mark-link"
              onClick={() => onOpenCreateCase('CLINICAL_CASE')}
            >
              <span>Make your mark</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="hero-photo-wrap">
            <PawPrint size={90} className="hero-paw-watermark" style={{ color: 'rgba(0, 56, 34, 0.15)' }} />
            <img 
              src={heroVetImg} 
              alt="Doctor and golden retriever" 
              className="hero-photo-img" 
            />
          </div>
        </div>
      </div>

      {/* 2. Moments from the community (Stories Carousel) */}
      <div className="stories-section-container">
        <div className="stories-section-header">
          <div className="stories-header-left">
            <MessageSquare size={17} color="#059669" />
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
          <button className="story-circle-item" onClick={() => onOpenCreateCase('STORY')}>
            <div className="story-ring-circle add-your-story">
              <Plus size={20} />
            </div>
            <span className="story-doc-label">Your story</span>
          </button>

          {/* Doctor Community Stories */}
          {stories.map((story) => {
            const storyDoc = (doctors || []).find(d => 
              d.id === story.doctorId || 
              String(d.id).replace('doc-', '') === String(story.doctorId).replace('doc-', '') || 
              (d.name && story.doctorName && d.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === story.doctorName.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
            );
            const resolvedStoryAvatar = (storyDoc && storyDoc.avatar && !storyDoc.avatar.includes('unsplash.com'))
              ? storyDoc.avatar
              : (story.avatar || '');

            return (
              <button 
                key={story.id} 
                className="story-circle-item"
                onClick={() => onOpenStory({ ...story, avatar: resolvedStoryAvatar })}
              >
                <div className="story-ring-circle">
                  <Avatar src={resolvedStoryAvatar} name={story.doctorName} size={48} className="story-avatar-photo" />
                </div>
                <span className="story-doc-label">{story.doctorName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Clinical Cases Feed Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {clinicalCases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#FFF', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <PawPrint size={36} color="#059669" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>No Clinical Cases Published Yet</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', maxWidth: '380px', margin: '0 auto 14px' }}>
              Publish an interesting clinical observation, surgical procedure, or diagnostic report.
            </p>
            <button 
              className="btn-make-mark"
              onClick={() => onOpenCreateCase('CLINICAL_CASE')}
              style={{ margin: '0 auto' }}
            >
              <span>Publish First Clinical Case</span>
              <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          clinicalCases.map(c => {
            const isOwnCase = currentUser && (
              c.authorId === currentUser.id ||
              c.authorName === currentUser.name ||
              (c.authorName && currentUser.name && c.authorName.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === currentUser.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
            );
            const caseDoc = doctors?.find(d => 
              d.id === c.authorId || 
              (d.name && c.authorName && d.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === c.authorName.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
            );
            const resolvedAvatar = (isOwnCase && currentUser?.avatar) ? currentUser.avatar : (caseDoc?.avatar || c.authorAvatar || '');

            return {
              id: c.id,
              authorName: c.authorName || 'Dr. Practitioner',
              authorSpecialty: c.authorSpecialty || 'Veterinary Surgeon',
              authorCity: 'Bengaluru',
              authorAvatar: resolvedAvatar,
              timeAgo: 'Case Study',
              content: c.presentingComplaint ? `${c.title} — ${c.presentingComplaint}` : c.title,
              imgLeft: c.mediaUrl || heroVetImg,
              imgRight: heroVetImg,
              likes: c.views || 1,
              comments: 0,
              fullCase: c
            };
          }).map((post) => {
            const currentLikes = likedMap[post.id] !== undefined ? likedMap[post.id] : post.likes;
            const isLiked = likedMap[post.id] !== undefined;

          return (
            <article key={post.id} className="feed-post-card" id={`case-post-${post.id}`}>
              {/* Card Header: Avatar, Name, Verified Badge, Time, Options */}
              <div className="post-card-header">
                <div className="post-author-block">
                  <Avatar 
                    src={post.authorAvatar} 
                    name={post.authorName} 
                    size={40} 
                    className="post-avatar-img" 
                  />
                  <div>
                    <div className="post-author-name-row">
                      <h3 className="post-author-name">{post.authorName}</h3>
                      <CheckCircle2 size={15} fill="#059669" color="#ffffff" />
                    </div>
                    <span className="post-author-meta">{post.authorSpecialty} · {post.authorCity}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{post.timeAgo}</span>
                  <button style={{ color: '#9ca3af' }}>
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              {/* Content Text */}
              <p className="post-body-text" style={{ fontSize: '14.5px', marginBottom: '14px' }}>
                {post.content}
              </p>

              {/* Dual Media Grid matching reference screenshot */}
              <div 
                className="case-dual-media-grid"
                onClick={() => onSelectCase && onSelectCase(post.fullCase)}
                style={{ cursor: 'pointer' }}
                title="Click to review complete case study"
              >
                <div className="case-split-img-box">
                  <img src={post.imgLeft} alt="Doctor in clinic" className="case-split-img" />
                </div>
                <div className="case-split-img-box">
                  <img src={post.imgRight} alt="Doctor and pet" className="case-split-img" />
                </div>
              </div>

              {/* Card Footer Actions: Heart, Comment, Share, Bookmark */}
              <div className="post-card-footer">
                <div className="post-actions-group">
                  <button 
                    className={`post-action-btn ${isLiked ? 'liked' : ''}`}
                    onClick={() => toggleLike(post.id, post.likes)}
                  >
                    <Heart size={17} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : '#6b7280'} />
                    <span>{currentLikes}</span>
                  </button>

                  <button 
                    className="post-action-btn"
                    onClick={() => onSelectCase && onSelectCase(post.fullCase)}
                  >
                    <MessageSquare size={17} />
                    <span>{post.comments}</span>
                  </button>

                  <button className="post-action-btn">
                    <Share2 size={17} />
                    <span>Share</span>
                  </button>
                </div>

                <button style={{ color: '#9ca3af' }}>
                  <Bookmark size={18} />
                </button>
              </div>
            </article>
          );
        })
      )}
      </div>
    </div>
  );
}
