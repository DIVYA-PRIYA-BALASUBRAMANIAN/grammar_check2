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
import { MOCK_DOCTORS } from '../data/mockData';

export function SearchView({ onSelectDoctor, onOpenChat }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [savedDoctors, setSavedDoctors] = useState({});

  const toggleSave = (id) => {
    setSavedDoctors(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getSpecialtyIcon = (specialty) => {
    if (specialty.includes('Surgery')) return <Scissors size={13} color="#9333ea" />;
    if (specialty.includes('Dermatology')) return <Sparkles size={13} color="#ea580c" />;
    if (specialty.includes('Equine')) return <Activity size={13} color="#0284c7" />;
    return <PawPrint size={13} color="#059669" />;
  };

  const doctorList = [
    {
      ...MOCK_DOCTORS[0],
      exp: '8+ years experience',
      rating: '4.8',
      reviews: '124'
    },
    {
      ...MOCK_DOCTORS[1],
      exp: '12+ years experience',
      rating: '4.9',
      reviews: '218'
    },
    {
      ...MOCK_DOCTORS[2],
      exp: '6+ years experience',
      rating: '4.7',
      reviews: '96'
    },
    {
      ...MOCK_DOCTORS[3],
      exp: '10+ years experience',
      rating: '4.8',
      reviews: '142'
    },
    {
      ...MOCK_DOCTORS[4],
      exp: '7+ years experience',
      rating: '4.6',
      reviews: '87'
    },
    {
      ...MOCK_DOCTORS[5],
      exp: '9+ years experience',
      rating: '4.7',
      reviews: '112'
    }
  ];

  const filteredDoctors = doctorList.filter(doc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return doc.name.toLowerCase().includes(q) || 
           doc.specialty.toLowerCase().includes(q) || 
           doc.city.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Light Hero Banner with Embedded Search Pill */}
      <div className="search-hero-banner">
        <div className="hero-banner-inner">
          <div className="hero-text-content">
            <span className="hero-tag-kicker">Unified Directory</span>
            <h1 className="hero-headline">Explore the Doctor Vet Ecosystem</h1>
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
          DOCTORS ({filteredDoctors.length})
        </h3>
      </div>

      {/* 4. Doctors Directory Cards Grid */}
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
                <img src={doctor.avatar} alt={doctor.name} className="doctor-dir-avatar-img" />

                <div className="doctor-dir-info-col">
                  {/* Verified Indicator */}
                  <div className="doctor-dir-verified-tag">
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span>Verified</span>
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
                    <span>{doctor.city}, {doctor.state}</span>
                  </div>

                  {/* Meta Stats Row (Experience & Rating) */}
                  <div className="doctor-dir-meta-stats">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Briefcase size={11} color="#6b7280" />
                      <span>{doctor.exp}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#111827', fontWeight: '700' }}>
                      <Star size={11} fill="#eab308" color="#eab308" />
                      <span>{doctor.rating}</span>
                      <span style={{ color: '#9ca3af', fontWeight: '500' }}>({doctor.reviews})</span>
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

                <button 
                  className="btn-chat-icon-square"
                  onClick={() => onOpenChat && onOpenChat(doctor)}
                  title="Message Doctor"
                >
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
