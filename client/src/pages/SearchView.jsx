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
  ShieldCheck,
  X,
  ArrowUpDown,
  Play,
  Stethoscope,
  Eye,
  FileText
} from 'lucide-react';
import heroVetImg from '../assets/hero_vet_dog.jpg';
import { api } from '../services/api';
import { Avatar } from '../components/Avatar';

export function SearchView({
  doctors: initialDoctors = [],
  clinicalCases: initialCases = [],
  videos: initialVideos = [],
  onSelectDoctor,
  onOpenChat,
  onSelectCase,
  onSelectVideo,
  connectedDoctors = {},
  currentUser
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('Relevance'); // 'Relevance' | 'Experience' | 'Rating' | 'Name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Live pool of cases and videos from props or API
  const [liveCases, setLiveCases] = useState(initialCases);
  const [liveVideos, setLiveVideos] = useState(initialVideos);

  React.useEffect(() => {
    if (initialCases && initialCases.length > 0) {
      setLiveCases(initialCases);
    } else {
      api.cases.getAll()
        .then(res => { if (res && res.length) setLiveCases(res); })
        .catch(() => {});
    }
  }, [initialCases]);

  React.useEffect(() => {
    const sanitizeVideos = (list) => (list || []).map(v => {
      if (v.thumbnail && (v.thumbnail.includes('543a7dc6') || v.thumbnail.includes('bcb16239') || v.thumbnail.includes('43090d16'))) {
        return { ...v, thumbnail: null };
      }
      return v;
    });

    if (initialVideos && initialVideos.length > 0) {
      setLiveVideos(sanitizeVideos(initialVideos));
    } else {
      api.videos.getAll()
        .then(res => { if (res && res.length) setLiveVideos(sanitizeVideos(res)); })
        .catch(() => {});
    }
  }, [initialVideos]);

  // Persist bookmarked/saved doctors in localStorage
  const [savedDoctors, setSavedDoctors] = useState(() => {
    try {
      const saved = localStorage.getItem('zenve_saved_doctors');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleSave = (id) => {
    setSavedDoctors(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('zenve_saved_doctors', JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  const executeSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.search.query(query.trim());
      setSearchResults(res);
    } catch (e) {
      console.warn('Backend search fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let cancel = false;
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search.query(searchQuery.trim());
        if (!cancel) setSearchResults(res);
      } catch (e) {
        console.warn('Backend search fallback:', e);
      } finally {
        if (!cancel) setLoading(false);
      }
    }, 300);

    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    executeSearch(searchQuery);
  };

  const getSpecialtyIcon = (specialty = '') => {
    if (specialty.includes('Surgery')) return <Scissors size={12} color="#9333ea" />;
    if (specialty.includes('Dermatology')) return <Sparkles size={12} color="#ea580c" />;
    if (specialty.includes('Equine')) return <Activity size={12} color="#0284c7" />;
    return <PawPrint size={12} color="#059669" />;
  };

  // Pools
  const allDoctorsPool = (searchResults?.doctors && searchResults.doctors.length > 0)
    ? searchResults.doctors
    : initialDoctors;

  const allCasesPool = (searchResults?.cases && searchResults.cases.length > 0)
    ? searchResults.cases
    : liveCases;

  const allVideosPool = (searchResults?.videos && searchResults.videos.length > 0)
    ? searchResults.videos
    : liveVideos;

  // Filter doctors
  const filteredDoctors = allDoctorsPool.filter(doc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (doc.name && doc.name.toLowerCase().includes(q)) ||
      (doc.specialty && doc.specialty.toLowerCase().includes(q)) ||
      (doc.city && doc.city.toLowerCase().includes(q)) ||
      (doc.state && doc.state.toLowerCase().includes(q));
  });

  // Filter cases
  const filteredCases = allCasesPool.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.presentingComplaint && c.presentingComplaint.toLowerCase().includes(q)) ||
      (c.species && c.species.toLowerCase().includes(q)) ||
      (c.diagnosis && c.diagnosis.toLowerCase().includes(q)) ||
      (c.authorName && c.authorName.toLowerCase().includes(q)) ||
      (c.authorSpecialty && c.authorSpecialty.toLowerCase().includes(q))
    );
  });

  // Filter videos
  const filteredVideos = allVideosPool.filter(v => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (v.title && v.title.toLowerCase().includes(q)) ||
      (v.description && v.description.toLowerCase().includes(q)) ||
      (v.doctorName && v.doctorName.toLowerCase().includes(q)) ||
      (v.doctorSpecialty && v.doctorSpecialty.toLowerCase().includes(q)) ||
      (v.species && v.species.toLowerCase().includes(q))
    );
  });

  // Apply Sorting to Doctors
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    let diff = 0;
    if (sortBy === 'Experience') {
      const expA = Number(a.experienceYears || 0);
      const expB = Number(b.experienceYears || 0);
      diff = expB - expA;
    } else if (sortBy === 'Rating') {
      const rateA = Number(a.rating || 4.9);
      const rateB = Number(b.rating || 4.9);
      diff = rateB - rateA;
    } else if (sortBy === 'Name') {
      diff = (a.name || '').localeCompare(b.name || '');
    } else {
      const idA = Number(String(a.id).replace(/\D/g, '') || 0);
      const idB = Number(String(b.id).replace(/\D/g, '') || 0);
      diff = idB - idA;
    }
    return sortOrder === 'asc' ? -diff : diff;
  });

  // Apply Sorting to Cases
  const sortedCases = [...filteredCases].sort((a, b) => {
    let diff = 0;
    if (sortBy === 'Rating' || sortBy === 'Experience') {
      const valA = Number(a.views || a.likesCount || 0);
      const valB = Number(b.views || b.likesCount || 0);
      diff = valB - valA;
    } else if (sortBy === 'Name') {
      diff = (a.title || '').localeCompare(b.title || '');
    } else {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      diff = (dateB || a.id || 0) - (dateA || b.id || 0);
    }
    return sortOrder === 'asc' ? -diff : diff;
  });

  // Apply Sorting to Videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    let diff = 0;
    if (sortBy === 'Rating' || sortBy === 'Experience') {
      const valA = Number(a.viewsCount || a.views || a.likes || 0);
      const valB = Number(b.viewsCount || b.views || b.likes || 0);
      diff = valB - valA;
    } else if (sortBy === 'Name') {
      diff = (a.title || '').localeCompare(b.title || '');
    } else {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      diff = (dateB || a.id || 0) - (dateA || b.id || 0);
    }
    return sortOrder === 'asc' ? -diff : diff;
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const totalResultsCount = sortedDoctors.length + sortedCases.length + sortedVideos.length;

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

            {/* Embedded Search Input Pill Form */}
            <form onSubmit={handleSearchSubmit} className="search-input-pill-in-banner">
              <Search size={15} color="#9ca3af" />
              <input
                type="text"
                placeholder="Search across doctors, cases, surgical reels, symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field-banner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}
                  title="Clear"
                >
                  <X size={14} />
                </button>
              )}
              <button type="submit" className="btn-search-arrow-banner" title="Search">
                <ArrowRight size={15} />
              </button>
            </form>
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
        {/* Filter Pills Group (Left) */}
        <div className="search-pills-group">
          {[
            { id: 'ALL', label: `ALL (${totalResultsCount})` },
            { id: 'DOCTORS', label: `DOCTORS (${sortedDoctors.length})` },
            { id: 'CASES', label: `CASES (${sortedCases.length})` },
            { id: 'VIDEOS', label: `VIDEOS (${sortedVideos.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              className={`search-filter-pill-btn ${activeFilter === tab.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Mode & Sort Group (Right) */}
        <div className="search-view-mode-group">
          {/* List / Grid Symbol Controls */}
          <div className="view-mode-toggle-box">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
              type="button"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
              type="button"
            >
              <List size={15} />
            </button>
          </div>

          {/* Sort Dropdown & Sort Symbol Button */}
          <div className="search-sort-wrapper">
            <span className="search-sort-label">Sort by</span>
            <select
              className="search-sort-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Relevance">Relevance / Newest</option>
              <option value="Experience">Experience / Popular</option>
              <option value="Rating">Rating / Views</option>
              <option value="Name">Name / Title (A-Z)</option>
            </select>

            {/* Sort By Symbol Button (Direction Toggle) */}
            <button
              type="button"
              className={`search-sort-btn-symbol ${sortOrder === 'asc' ? 'active-asc' : ''}`}
              onClick={toggleSortOrder}
              title={`Sort direction: ${sortOrder === 'desc' ? 'Descending (High to Low / Z-A)' : 'Ascending (Low to High / A-Z)'}. Click to reverse order.`}
            >
              <ArrowUpDown
                size={14}
                style={{
                  transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Section Title with Category Indicator */}
      <div className="search-section-header-row">
        <h3 className="search-section-title">
          {activeFilter === 'CASES' ? `CLINICAL CASES (${sortedCases.length})` :
            activeFilter === 'VIDEOS' ? `SHORT VIDEOS (${sortedVideos.length})` :
              activeFilter === 'DOCTORS' ? `DOCTORS (${sortedDoctors.length})` :
                `DIRECTORY RESULTS (${totalResultsCount})`}
        </h3>
      </div>

      {/* ==================== DOCTORS SECTION ==================== */}
      {(activeFilter === 'ALL' || activeFilter === 'DOCTORS') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {activeFilter === 'ALL' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#003822', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PawPrint size={15} color="#059669" />
                <span>PRACTITIONERS & SPECIALISTS ({sortedDoctors.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveFilter('DOCTORS')}
                style={{ background: 'none', border: 'none', color: '#059669', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View all doctors <ArrowRight size={13} />
              </button>
            </div>
          )}

          <div className={viewMode === 'list' ? 'doctor-directory-list' : 'doctor-directory-grid'}>
            {sortedDoctors.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '30px 20px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                  No veterinarians found matching "{searchQuery}".
                </p>
              </div>
            ) : (
              sortedDoctors.map(doctor => {
                const isSaved = !!savedDoctors[doctor.id];

                const isConnected = !!connectedDoctors[doctor.id] ||
                  !!connectedDoctors[`doc-${doctor.id}`] ||
                  (Array.isArray(connectedDoctors) && connectedDoctors.some(c => c.id === doctor.id || String(c.id).replace('doc-', '') === String(doctor.id).replace('doc-', '')));

                return (
                  <div
                    key={doctor.id}
                    className={`doctor-dir-card ${viewMode === 'list' ? 'list-mode' : ''}`}
                    id={`doctor-search-${doctor.id}`}
                  >
                    {/* Bookmark Heart Button */}
                    <button
                      className={`doctor-dir-favorite-btn ${isSaved ? 'saved' : ''}`}
                      onClick={() => toggleSave(doctor.id)}
                      title={isSaved ? 'Remove from saved' : 'Save doctor'}
                      type="button"
                    >
                      <Heart size={14} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : '#9ca3af'} />
                    </button>

                    {/* Card Top Info Row */}
                    <div className="doctor-dir-top-row">
                      <Avatar
                        src={doctor.avatar}
                        name={doctor.name}
                        size={44}
                        fontSize={16}
                        className="doctor-dir-avatar-img"
                      />

                      <div className="doctor-dir-info-col">
                        {/* Status Badges Row */}
                        <div className="doctor-dir-status-row">
                          {doctor.verified ? (
                            <div className="doctor-dir-verified-tag">
                              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                              <span>Verified</span>
                            </div>
                          ) : (
                            <div className="doctor-dir-verified-tag" style={{ backgroundColor: '#f0fdf4', color: '#047857' }}>
                              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                              <span>Registered</span>
                            </div>
                          )}
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1.5px 6px',
                            borderRadius: '9999px',
                            backgroundColor: doctor.active ? '#ECFDF5' : '#F3F4F6',
                            color: doctor.active ? '#065F46' : '#6B7280',
                            border: doctor.active ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3.5px',
                            lineHeight: 1
                          }}>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: doctor.active ? '#10B981' : '#9CA3AF' }} />
                            {doctor.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {/* Doctor Name */}
                        <h4 className="doctor-dir-name">{doctor.name}</h4>

                        {/* Specialty with Category Icon */}
                        <div className="doctor-dir-specialty-badge">
                          {getSpecialtyIcon(doctor.specialty)}
                          <span>{doctor.specialty || 'General Veterinary'}</span>
                        </div>

                        {/* Location */}
                        <div className="doctor-dir-location-text">
                          <MapPin size={11} color="#6b7280" />
                          <span>{[doctor.city, doctor.state].filter(Boolean).join(', ') || 'India'}</span>
                        </div>

                        {/* Meta Stats Row (Experience & Rating) */}
                        <div className="doctor-dir-meta-stats">
                          <div className="doctor-dir-stat-badge">
                            <Briefcase size={11} color="#6b7280" />
                            <span>{doctor.experienceYears ? `${doctor.experienceYears}+ yrs exp` : 'Registered'}</span>
                          </div>

                          <div className="doctor-dir-rating-badge">
                            <Star size={11} fill="#eab308" color="#eab308" />
                            <span>4.9</span>
                            <span style={{ color: '#9ca3af', fontWeight: '500', fontSize: '10.5px' }}>
                              ({doctor.connectionsCount != null ? doctor.connectionsCount : 0} conn)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="doctor-dir-actions-row">
                      <button
                        className="btn-view-profile-dark"
                        onClick={() => onSelectDoctor && onSelectDoctor(doctor)}
                        type="button"
                      >
                        <span>View Profile</span>
                        <ArrowRight size={13} />
                      </button>

                      {isConnected && (
                        <button
                          className="btn-chat-icon-square"
                          onClick={() => onOpenChat && onOpenChat(doctor)}
                          title="Message Doctor"
                          type="button"
                        >
                          <MessageSquare size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==================== CLINICAL CASES SECTION ==================== */}
      {(activeFilter === 'ALL' || activeFilter === 'CASES') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: activeFilter === 'ALL' ? '20px' : '0' }}>
          {activeFilter === 'ALL' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#003822', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Stethoscope size={15} color="#059669" />
                <span>CLINICAL CASES ({sortedCases.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveFilter('CASES')}
                style={{ background: 'none', border: 'none', color: '#059669', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View all cases <ArrowRight size={13} />
              </button>
            </div>
          )}

          <div className={viewMode === 'list' ? 'cases-directory-list' : 'cases-directory-grid'}>
            {sortedCases.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '30px 20px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                  {searchQuery ? `No clinical cases found matching "${searchQuery}".` : 'No clinical cases uploaded yet. Cases uploaded by any doctor or connection will appear here.'}
                </p>
              </div>
            ) : (
              sortedCases.map(c => {
                if (viewMode === 'list') {
                  return (
                    <div
                      key={c.id}
                      className="case-dir-card list-mode"
                      onClick={() => onSelectCase && onSelectCase(c)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                        {(c.mediaUrl || c.images?.[0]) ? (
                          <img
                            src={c.mediaUrl || c.images?.[0]}
                            alt={c.title}
                            className="case-dir-list-thumb"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="case-dir-list-icon-thumb">
                            <Stethoscope size={28} />
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 7px', borderRadius: '5px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                              🐾 {c.species || 'Veterinary'}
                            </span>
                            <span style={{ fontSize: '11.5px', color: '#6b7280' }}>
                              By {c.authorName || 'Dr. Practitioner'} · {c.authorSpecialty || 'Veterinarian'}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: '#003822', margin: '0 0 3px 0', lineHeight: 1.3 }}>
                            {c.title}
                          </h4>
                          <p style={{ fontSize: '12.5px', color: '#4b5563', margin: 0, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {c.presentingComplaint || c.diagnosis || 'Clinical case presentation and diagnosis.'}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                        <span style={{ fontSize: '11.5px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={12} /> {c.views || 1} views
                        </span>
                        <button className="btn-view-profile-dark" style={{ padding: '6px 12px', fontSize: '12px' }} type="button">
                          <span>Review Case</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                }

                // Grid Mode
                return (
                  <div
                    key={c.id}
                    className="case-dir-card"
                    onClick={() => onSelectCase && onSelectCase(c)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: '700', padding: '2px 7px', borderRadius: '5px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                        🐾 {c.species || 'Veterinary'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Eye size={11} /> {c.views || 1}
                      </span>
                    </div>

                    {(c.mediaUrl || c.images?.[0]) && (
                      <div style={{ width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', backgroundColor: '#f3f4f6' }}>
                        <img
                          src={c.mediaUrl || c.images?.[0]}
                          alt={c.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#003822', marginBottom: '4px', lineHeight: 1.3 }}>
                      {c.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#4b5563', lineHeight: 1.45, marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.presentingComplaint || c.diagnosis || 'Clinical case presentation and evaluation.'}
                    </p>

                    <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                        <Avatar
                          src={c.authorAvatar}
                          name={c.authorName || 'Dr. Practitioner'}
                          size={20}
                          fontSize={9}
                        />
                        <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.authorName || 'Dr. Practitioner'}
                        </span>
                      </div>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        Read <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==================== SHORT VIDEOS SECTION ==================== */}
      {(activeFilter === 'ALL' || activeFilter === 'VIDEOS') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: activeFilter === 'ALL' ? '20px' : '0' }}>
          {activeFilter === 'ALL' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#003822', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Play size={15} color="#059669" />
                <span>SURGICAL & CLINICAL REELS ({sortedVideos.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveFilter('VIDEOS')}
                style={{ background: 'none', border: 'none', color: '#059669', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View all reels <ArrowRight size={13} />
              </button>
            </div>
          )}

          <div className={viewMode === 'list' ? 'videos-directory-list' : 'videos-directory-grid'}>
            {sortedVideos.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '30px 20px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                  {searchQuery ? `No video reels found matching "${searchQuery}".` : 'No clinical video reels uploaded yet. Videos uploaded by any doctor or connection will appear here.'}
                </p>
              </div>
            ) : (
              sortedVideos.map(v => {
                if (viewMode === 'list') {
                  return (
                    <div
                      key={v.id}
                      className="video-dir-card list-mode"
                      onClick={() => onSelectVideo && onSelectVideo(v)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                        <div className="video-dir-thumb-wrap" style={{ width: '110px', height: '70px', borderRadius: '8px', flexShrink: 0, backgroundColor: '#07180F', overflow: 'hidden' }}>
                          {v.videoUrl ? (
                            <video
                              src={`${v.videoUrl}#t=0.001`}
                              preload="metadata"
                              muted
                              playsInline
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', backgroundColor: '#07180F' }}
                            />
                          ) : (v.thumbnail && !v.thumbnail.includes('543a7dc6') && !v.thumbnail.includes('bcb16239') && !v.thumbnail.includes('43090d16')) ? (
                            <img
                              src={v.thumbnail || v.thumbnailUrl}
                              alt={v.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#07180f', color: '#10b981' }}>
                              <Play size={20} />
                            </div>
                          )}
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none'
                          }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              color: '#003822',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              paddingLeft: '2px'
                            }}>
                              <Play size={10} fill="#003822" />
                            </div>
                          </div>
                          {v.duration && (
                            <span style={{
                              position: 'absolute',
                              bottom: '4px',
                              right: '4px',
                              backgroundColor: 'rgba(0, 0, 0, 0.75)',
                              color: '#ffffff',
                              fontSize: '9.5px',
                              fontWeight: '700',
                              padding: '1px 4px',
                              borderRadius: '3px'
                            }}>
                              {v.duration}
                            </span>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: '#111827', margin: '0 0 3px 0', lineHeight: 1.3 }}>
                            {v.title}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#6b7280', flexWrap: 'wrap' }}>
                            <span style={{ color: '#059669', fontWeight: 600 }}>By {v.doctorName || 'Doctor Reel'}</span>
                            {v.doctorSpecialty && <span>· {v.doctorSpecialty}</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                        <span style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Eye size={12} /> {v.viewsCount || v.views || 1}
                        </span>
                        <button className="btn-view-profile-dark" style={{ padding: '6px 12px', fontSize: '11.5px' }} type="button">
                          <span>Watch</span>
                          <Play size={10} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  );
                }

                // Grid Mode
                return (
                  <div
                    key={v.id}
                    className="video-dir-card"
                    onClick={() => onSelectVideo && onSelectVideo(v)}
                  >
                    <div className="video-dir-thumb-wrap" style={{ backgroundColor: '#07180F', overflow: 'hidden' }}>
                      {v.videoUrl ? (
                        <video
                          src={`${v.videoUrl}#t=0.001`}
                          preload="metadata"
                          muted
                          playsInline
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', backgroundColor: '#07180F' }}
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
                      ) : (v.thumbnail && !v.thumbnail.includes('543a7dc6') && !v.thumbnail.includes('bcb16239') && !v.thumbnail.includes('43090d16')) ? (
                        <img
                          src={v.thumbnail || v.thumbnailUrl}
                          alt={v.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#07180f', color: '#10b981' }}>
                          <Play size={28} />
                        </div>
                      )}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        pointerEvents: 'none'
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          color: '#003822',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingLeft: '2px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}>
                          <Play size={14} fill="#003822" />
                        </div>
                      </div>
                      {v.duration && (
                        <span style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          backgroundColor: 'rgba(0, 0, 0, 0.75)',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '1.5px 5px',
                          borderRadius: '3px'
                        }}>
                          {v.duration}
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {v.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', fontSize: '11.5px' }}>
                        <span style={{ color: '#059669', fontWeight: 600 }}>{v.doctorName || 'Doctor Reel'}</span>
                        <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Eye size={11} /> {v.viewsCount || v.views || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. Trusted By Veterinary Professionals Footer */}
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
