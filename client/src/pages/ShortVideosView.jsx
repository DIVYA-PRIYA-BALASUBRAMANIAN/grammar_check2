import React, { useState } from 'react';
import { 
  ArrowRight, 
  Play, 
  Eye, 
  Heart, 
  MessageSquare, 
  Video, 
  Plus, 
  PawPrint 
} from 'lucide-react';
import heroVetImg from '../assets/hero_vet_dog.jpg';
import { SPECIALTIES, STATES_INDIA } from '../data/mockData';

import { Avatar } from '../components/Avatar';

export function ShortVideosView({ 
  videos = [], 
  stories = [], 
  doctors = [],
  currentUser,
  onOpenStory, 
  onOpenCreateVideo, 
  onSelectVideo 
}) {
  const [activeTab, setActiveTab] = useState('for_you');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All specialties');
  const [selectedState, setSelectedState] = useState('All states');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Light Hero Banner with Veterinarian & Golden Retriever */}
      <div className="cases-hero-banner-light">
        <div className="hero-banner-inner">
          <div className="hero-text-content">
            <span className="hero-tag-kicker">Clinical Demonstrations</span>
            <h1 className="hero-headline">Small moments. Big discoveries.</h1>
            <p className="hero-subtext">
              Explore veterinary surgical procedures, ultrasound techniques, and clinical case demos.
            </p>
            <button 
              className="btn-make-mark-link"
              onClick={() => onOpenCreateVideo('SHORT_VIDEO')}
            >
              <span>Share a clinical reel</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="hero-photo-wrap">
            <PawPrint size={90} className="hero-paw-watermark" style={{ color: 'rgba(0, 56, 34, 0.15)' }} />
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
            <Video size={17} color="#059669" />
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
          <button className="story-circle-item" onClick={() => onOpenCreateVideo('STORY')}>
            <div className="story-ring-circle add-your-story">
              <Plus size={20} />
            </div>
            <span className="story-doc-label">Your story</span>
          </button>

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

      {/* 3. Filter Tabs & Controls Row */}
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
            <span>Reels Feed</span>
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

          <select className="pill-select-control" defaultValue="Short videos">
            <option value="Short videos">Short videos</option>
            <option value="All posts">All posts</option>
          </select>

          <span className="results-count-label">{videos.length} RESULTS</span>
        </div>
      </div>

      {/* 4. Glassy Video Cards Grid */}
      {videos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <Video size={40} color="#059669" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>No Clinical Video Reels Yet</h3>
          <p style={{ fontSize: '13px', color: '#6B7280', maxWidth: '380px', margin: '0 auto 16px' }}>
            Share your surgical procedures, ultrasound examinations, or clinical technique reels with peers.
          </p>
          <button 
            className="btn-make-mark"
            onClick={() => onOpenCreateVideo('SHORT_VIDEO')}
            style={{ margin: '0 auto' }}
          >
            <span>Share First Clinical Reel</span>
            <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(225px, 1fr))', gap: '16px' }}>
          {videos.map((vid) => (
          <div 
            key={vid.id}
            onClick={() => onSelectVideo(vid)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(229, 231, 235, 0.9)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 18px rgba(0, 45, 25, 0.04)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 10px 24px rgba(0, 45, 25, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 45, 25, 0.04)';
            }}
          >
            {/* Video Cover Area with Glassy Badges */}
            <div style={{ position: 'relative', height: '230px', backgroundColor: '#07180F', overflow: 'hidden' }}>
              {vid.videoUrl ? (
                <video 
                  src={`${vid.videoUrl}#t=0.001`} 
                  preload="metadata"
                  muted 
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', backgroundColor: '#000' }}
                  onMouseEnter={(e) => {
                    try { e.currentTarget.play(); } catch (_) {}
                  }}
                  onMouseLeave={(e) => {
                    try { 
                      e.currentTarget.pause(); 
                      e.currentTarget.currentTime = 0; 
                    } catch (_) {}
                  }}
                />
              ) : (vid.thumbnail && !vid.thumbnail.includes('543a7dc6') && !vid.thumbnail.includes('bcb16239')) ? (
                <img 
                  src={vid.thumbnail} 
                  alt={vid.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #062b1b 0%, #021a10 100%)', color: '#34D399' }}>
                  <Video size={40} />
                  <span style={{ fontSize: '11px', marginTop: '6px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Clinical Reel</span>
                </div>
              )}
              
              {/* Glassy Duration Badge */}
              <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'rgba(0, 40, 25, 0.75)',
                backdropFilter: 'blur(4px)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                {vid.duration}
              </div>

              {/* Centered Glassy Play Button */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(0, 56, 34, 0.78)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                pointerEvents: 'none'
              }}>
                <Play size={20} fill="#ffffff" style={{ marginLeft: '3px' }} />
              </div>

              {/* Glassy Views Badge */}
              <div style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(4px)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '600',
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                <Eye size={12} />
                <span>{vid.views}</span>
              </div>
            </div>

            {/* Video Details */}
            {(() => {
              const vidDoc = (doctors || []).find(d => 
                d.id === vid.doctorId || 
                String(d.id).replace('doc-', '') === String(vid.doctorId).replace('doc-', '') || 
                (d.name && vid.doctorName && d.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === vid.doctorName.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
              );
              const authorAvatar = vidDoc?.avatar || vid.authorAvatar;

              return (
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', lineHeight: '1.35', marginBottom: '8px' }}>
                    {vid.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
                    <Avatar src={authorAvatar} name={vid.doctorName} size={22} />
                    <p style={{ fontSize: '12.5px', color: '#059669', fontWeight: '600', margin: 0 }}>
                      {vid.doctorName}
                    </p>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#6b7280' }}>{vid.doctorSpecialty}</span>
                </div>
              );
            })()}
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
