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

export function ClinicalCasesView({ 
  stories = [], 
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

  const casePosts = [
    {
      id: 'case-post-1',
      authorName: 'Dr. Arjun Mehta',
      authorSpecialty: 'Veterinary Surgeon',
      authorCity: 'Mumbai',
      authorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
      timeAgo: '2h',
      content: 'Great discussion today on managing canine parvovirus cases. Learned a lot from the community!',
      imgLeft: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=700&q=80',
      imgRight: heroVetImg,
      likes: 124,
      comments: 18,
      fullCase: {
        title: 'Canine Parvoviral Enteritis Management & Early Enteral Nutrition Protocol',
        authorName: 'Dr. Arjun Mehta',
        authorSpecialty: 'Veterinary Surgery & Critical Care',
        species: 'Canine (Golden Retriever, 4 months)',
        presentingComplaint: 'Severe hemorrhagic diarrhea, vomiting, hypothermia, profound lethargy for 24 hours.',
        clinicalFindings: 'Dehydration 8%, weak pulses, tacky pale mucous membranes, leukopenia (WBC 1,200/µL).',
        diagnostics: 'CPV fecal antigen SNAP test positive. Hypoalbuminemia (1.8 g/dL) and hypoglycemia (58 mg/dL).',
        diagnosis: 'Acute Canine Parvoviral Enteritis with septic SIRS.',
        treatmentProtocol: 'Balanced IV crystalloids + potassium supplementation, Maropitant, Ampicillin-Sulbactam, early microenteral nutrition via NG tube within 12 hours.',
        outcome: 'Discharged on Day 5 with full appetite and normal stool consistency.',
        mediaUrl: heroVetImg
      }
    },
    {
      id: 'case-post-2',
      authorName: 'Dr. Ananya Sharma',
      authorSpecialty: 'Small Animal Medicine',
      authorCity: 'Bengaluru',
      authorAvatar: 'https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80',
      timeAgo: '5h',
      content: 'Follow-up on Bruno: 6-year-old Doberman with acute DCM and atrial fibrillation. Normal sinus rhythm restored with rate control protocol.',
      imgLeft: 'https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=700&q=80',
      imgRight: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=700&q=80',
      likes: 186,
      comments: 29,
      fullCase: {
        title: 'Acute Dilated Cardiomyopathy with Atrial Fibrillation in a Doberman Pinscher',
        authorName: 'Dr. Ananya Sharma',
        authorSpecialty: 'Small Animal Cardiology',
        species: 'Canine (Doberman, 6 yr, Male)',
        presentingComplaint: 'Acute syncope episode, exercise intolerance, tachypnea at rest for 48 hours.',
        clinicalFindings: 'Heart rate 190 bpm with pulse deficits. Gallop sound noted on auscultation.',
        diagnostics: 'Echocardiogram: LVIDd 62mm, Fractional Shortening 11%. ECG confirmed fast atrial fibrillation.',
        diagnosis: 'Stage C Dilated Cardiomyopathy complicated by atrial fibrillation.',
        treatmentProtocol: 'Pimobendan 0.25 mg/kg PO BID, Furosemide 1.5 mg/kg PO BID, Diltiazem 0.5 mg/kg PO TID.',
        outcome: 'Patient stabilized within 36 hours. Resting respiratory rate decreased to 22 bpm.',
        mediaUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80'
      }
    }
  ];

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
              onClick={onOpenCreateCase}
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
          <button className="story-circle-item" onClick={onOpenCreateCase}>
            <div className="story-ring-circle add-your-story">
              <Plus size={20} />
            </div>
            <span className="story-doc-label">Your story</span>
          </button>

          {/* Doctor Community Stories */}
          {stories.map((story) => (
            <button 
              key={story.id} 
              className="story-circle-item"
              onClick={() => onOpenStory(story)}
            >
              <div className="story-ring-circle">
                <img src={story.avatar} alt={story.doctorName} className="story-avatar-photo" />
              </div>
              <span className="story-doc-label">{story.doctorName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Clinical Cases Feed Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {casePosts.map((post) => {
          const currentLikes = likedMap[post.id] !== undefined ? likedMap[post.id] : post.likes;
          const isLiked = likedMap[post.id] !== undefined;

          return (
            <article key={post.id} className="feed-post-card" id={`case-post-${post.id}`}>
              {/* Card Header: Avatar, Name, Verified Badge, Time, Options */}
              <div className="post-card-header">
                <div className="post-author-block">
                  <img src={post.authorAvatar} alt={post.authorName} className="post-avatar-img" />
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
        })}
      </div>
    </div>
  );
}
