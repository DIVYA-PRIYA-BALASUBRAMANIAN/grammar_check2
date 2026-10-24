import React, { useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  Check, 
  Heart, 
  MessageSquare, 
  Briefcase, 
  Star, 
  MapPin, 
  LayoutGrid, 
  List, 
  PawPrint,
  Sparkles,
  Scissors,
  Activity,
  ShieldCheck
} from 'lucide-react';
import heroVetImg from '../assets/hero_vet_dog.jpg';
import { api } from '../services/api';
import { Avatar } from '../components/Avatar';

export function SearchView({ doctors: initialDoctors = [], onSelectDoctor, onOpenChat, onSelectCase, onSelectVideo, connectedDoctors = {} }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [savedDoctors, setSavedDoctors] = useState({});
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleSave = (id) => {
    setSavedDoctors(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  React.useEffect(() => {
    let cancel = false;
    const runSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults(null);
        return;
      }
      setLoading(true);
      try {
        const res = await api.search.query(searchQuery);
        if (!cancel) setSearchResults(res);
      } catch (e) {
        console.warn('Backend search fallback:', e);
      } finally {
        if (!cancel) setLoading(false);
      }
    };

    const timer = setTimeout(runSearch, 300);
    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const getSpecialtyIcon = (specialty) => {
    if (specialty.includes('Surgery')) return <Scissors size={13} color="#9333ea" />;
    if (specialty.includes('Dermatology')) return <Sparkles size={13} color="#ea580c" />;
    if (specialty.includes('Equine')) return <Activity size={13} color="#0284c7" />;
    return <PawPrint size={13} color="#059669" />;
  };

  const allDoctorsPool = (searchResults?.doctors && searchResults.doctors.length > 0)
    ? searchResults.doctors
    : initialDoctors;

  const filteredDoctors = allDoctorsPool.filter(doc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (doc.name && doc.name.toLowerCase().includes(q)) || 
           (doc.specialty && doc.specialty.toLowerCase().includes(q)) || 
           (doc.city && doc.city.toLowerCase().includes(q));
  });

  const matchingCases = searchResults?.cases || [];
  const matchingVideos = searchResults?.videos || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Light Hero Banner with Embedded Search Pill */}
      <div className="search-hero-banner">
        <div className="hero-banner-inner">
          <div className="hero-text-content">
            <span className="hero-tag-kicker">Unified Directory</span>
            <h1 className="hero-headline">Explore the Zenve Vet Ecosystem</h1>
            <p className="hero-subtext">
              Search peer veterinarians, clinical cases, surgical video reels, and treatment protocols.
            </p>

            {/* Embedded Search Input Pill */}
            <div className="search-input-pill-in-banner">
              <Search size={15} color="#9ca3af" />
              <input 
                type="text" 
                placeholder="Search across doctors, surgeries, cardiology, dermatology, endoscopy..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field-banner"
              />
              <button className="btn-search-arrow-banner" title="Search">
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <div className="hero-photo-wrap">
            {/* Slogan Badge Overlay */}
            <div className="hero-better-care-badge">
              <span>Better</span>
              <span>Care for</span>
              <span>Healthier</span>
              <span>Animals</span>
              <PawPrint size={14} style={{ marginTop: '2px' }} />
            </div>

            <img 
              src={heroVetImg} 
              alt="Veterinarian with dog" 
              className="hero-photo-img" 
            />
          </div>
        </div>
      </div>

      {/* 2. Filter Pills & Layout Controls Bar */}
      <div className="search-filter-controls-row">
        {/* Filter Pills Group */}
        <div className="search-pills-group">
          {['ALL', 'DOCTORS', 'CASES', 'VIDEOS'].map(tab => (
            <button
              key={tab}
              className={`search-filter-pill-btn ${activeFilter === tab ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* View Mode & Sort Group */}
        <div className="search-view-mode-group">
          <div className="view-mode-toggle-box">
            <button className="view-mode-btn active" title="Grid View">
              <LayoutGrid size={15} />
            </button>
            <button className="view-mode-btn" title="List View">
              <List size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Sort by</span>
            <select className="search-sort-dropdown" defaultValue="Relevance">
              <option value="Relevance">Relevance</option>
              <option value="Experience">Experience</option>
              <option value="Rating">Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Section Title with Green Accent */}
      <div className="search-section-header-row">
        <h3 className="search-section-title">
          {activeFilter === 'CASES' ? `CLINICAL CASES (${matchingCases.length})` :
           activeFilter === 'VIDEOS' ? `SHORT VIDEOS (${matchingVideos.length})` :
           `DOCTORS (${filteredDoctors.length})`}
        </h3>
      </div>

      {/* Clinical Cases Search Tab */}
      {activeFilter === 'CASES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {matchingCases.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic', padding: '12px 0' }}>
              No clinical cases found for "{searchQuery}". Try typing "parvo", "cardiology", or "colic".
            </p>
          ) : (
            matchingCases.map(c => (
              <div 
                key={c.id} 
                className="doctor-dir-card" 
                style={{ cursor: 'pointer', padding: '16px' }}
                onClick={() => onSelectCase && onSelectCase(c)}
              >
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#003822', marginBottom: '6px' }}>{c.title}</h4>
                <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>{c.presentingComplaint}</p>
                <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#6b7280' }}>
                  <span>Species: <strong>{c.species}</strong></span>
                  <span>·</span>
                  <span>Author: {c.authorName}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Short Videos Search Tab */}
      {activeFilter === 'VIDEOS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {matchingVideos.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic', padding: '12px 0' }}>
              No video reels found matching "{searchQuery}".
            </p>
          ) : (
            matchingVideos.map(v => (
              <div 
                key={v.id} 
                className="doctor-dir-card" 
                style={{ cursor: 'pointer', overflow: 'hidden' }}
                onClick={() => onSelectVideo && onSelectVideo(v)}
              >
                <img src={v.thumbnailUrl} alt={v.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                <div style={{ padding: '10px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{v.title}</h4>
                  <span style={{ fontSize: '11px', color: '#059669' }}>{v.doctorName}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. Doctors Directory Cards Grid */}
      {(activeFilter === 'ALL' || activeFilter === 'DOCTORS') && (
        <div className="doctor-directory-grid">
        {filteredDoctors.map(doctor => {
          const isSaved = !!savedDoctors[doctor.id];

          return (
            <div key={doctor.id} className="doctor-dir-card" id={`doctor-search-${doctor.id}`}>
              {/* Bookmark Heart Button */}
              <button 
                className={`doctor-dir-favorite-btn ${isSaved ? 'saved' : ''}`}
                onClick={() => toggleSave(doctor.id)}
                title={isSaved ? 'Remove from saved' : 'Save doctor'}
              >
                <Heart size={16} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : '#9ca3af'} />
              </button>

              {/* Card Top Info Row */}
              <div className="doctor-dir-top-row">
                <Avatar 
                  src={doctor.avatar} 
                  name={doctor.name} 
                  size={64} 
                  fontSize={24} 
                  style={{ borderRadius: '12px', flexShrink: 0 }} 
                />

                <div className="doctor-dir-info-col">
                  {/* Verified & Active Status Indicators */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="doctor-dir-verified-tag">
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      <span>Verified</span>
                    </div>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      backgroundColor: doctor.active ? '#ECFDF5' : '#F3F4F6',
                      color: doctor.active ? '#065F46' : '#6B7280',
                      border: doctor.active ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: doctor.active ? '#10B981' : '#9CA3AF' }} />
                      {doctor.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Doctor Name */}
                  <h4 className="doctor-dir-name">{doctor.name}</h4>

                  {/* Specialty with Category Icon */}
                  <div className="doctor-dir-specialty-badge">
                    {getSpecialtyIcon(doctor.specialty)}
                    <span>{doctor.specialty}</span>
                  </div>

                  {/* Location */}
                  <div className="doctor-dir-location-text">
                    <MapPin size={11} color="#6b7280" />
                    <span>{[doctor.city, doctor.state].filter(Boolean).join(', ') || 'India'}</span>
                  </div>

                  {/* Meta Stats Row (Experience & Rating) */}
                  <div className="doctor-dir-meta-stats">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Briefcase size={11} color="#6b7280" />
                      <span>{doctor.experienceYears ? `${doctor.experienceYears}+ years experience` : 'Registered Doctor'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#111827', fontWeight: '700' }}>
                      <Star size={11} fill="#eab308" color="#eab308" />
                      <span>4.9</span>
                      <span style={{ color: '#9ca3af', fontWeight: '500' }}>({doctor.connectionsCount != null ? doctor.connectionsCount : 0} connections)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="doctor-dir-actions-row">
                <button 
                  className="btn-view-profile-dark"
                  onClick={() => onSelectDoctor && onSelectDoctor(doctor)}
                >
                  <span>View Profile</span>
                  <ArrowRight size={13} />
                </button>

                {(() => {
                  const isConnected = !!connectedDoctors[doctor.id] ||
                    !!connectedDoctors[`doc-${doctor.id}`] ||
                    (Array.isArray(connectedDoctors) && connectedDoctors.some(c => c.id === doctor.id || String(c.id).replace('doc-', '') === String(doctor.id).replace('doc-', '')));

                  return isConnected ? (
                    <button 
                      className="btn-chat-icon-square"
                      onClick={() => onOpenChat && onOpenChat(doctor)}
                      title="Message Doctor"
                    >
                      <MessageSquare size={16} />
                    </button>
                  ) : null;
                })()}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* 5. Trusted By Veterinary Professionals Footer */}
      <div className="search-trusted-footer-divider">
        <div className="search-divider-line" />
        <div className="search-trusted-text">
          <ShieldCheck size={15} color="#059669" />
          <span>Trusted by 1,000+ veterinary professionals</span>
        </div>
        <div className="search-divider-line" />
      </div>
    </div>
  );
}
