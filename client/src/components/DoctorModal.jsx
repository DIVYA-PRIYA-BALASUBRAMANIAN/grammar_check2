import React, { useState } from 'react';
import {
  X,
  MapPin,
  Building,
  GraduationCap,
  Award,
  MessageSquare,
  Check,
  Stethoscope,
  UserPlus,
  CheckCircle2,
  FolderHeart,
  FileText,
  Phone,
  Mail,
  ShieldCheck,
  Share2,
  Camera,
  UserPen,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { Avatar } from './Avatar';
import { api } from '../services/api';

export function DoctorModal({
  doctor,
  doctors = [],
  onClose,
  onOpenChat,
  isConnected,
  isPending,
  onSendRequest,
  onToggleConnect,
  onSelectCase,
  cases = [],
  posts = [],
  connectedDoctors = [],
  currentUser,
  onEditProfile,
  onUpdateAvatar,
  onUpdateCover,
  onUpdateVci,
  onViewFullPageProfile,
  onDeleteCase,
  onDeletePost
}) {
  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'cases' | 'posts' | 'contact'
  const [liveDoctor, setLiveDoctor] = useState(null);
  const modalPhotoInputRef = React.useRef(null);
  const modalCoverInputRef = React.useRef(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Fetch full live profile details whenever a doctor is selected
  React.useEffect(() => {
    setActiveTab('about');
    if (!doctor) {
      setLiveDoctor(null);
      return;
    }
    const cleanId = String(doctor.id || '').replace(/\D/g, '');
    if (cleanId) {
      api.doctors.getById(cleanId)
        .then(res => {
          if (res) setLiveDoctor(res);
        })
        .catch(() => {});
    }
  }, [doctor?.id]);

  const handleQuickPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const res = await api.media.upload(file);
      const newUrl = res?.url;
      if (newUrl && onUpdateAvatar) {
        await onUpdateAvatar(newUrl);
      }
    } catch (err) {
      console.warn('Direct upload fallback:', err);
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (onUpdateAvatar) await onUpdateAvatar(ev.target.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleQuickCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const res = await api.media.upload(file);
      const newUrl = res?.url;
      if (newUrl && onUpdateCover) {
        await onUpdateCover(newUrl);
      }
    } catch (err) {
      console.warn('Cover upload fallback:', err);
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (onUpdateCover) await onUpdateCover(ev.target.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingCover(false);
      if (e.target) e.target.value = '';
    }
  };

  const isOwnProfile = !doctor ? false : Boolean(doctor.isCurrentUser || (currentUser && (
    (doctor.id != null && currentUser.id != null && String(doctor.id).replace('doc-', '') === String(currentUser.id).replace('doc-', '')) ||
    (doctor.email && currentUser.email && doctor.email.toLowerCase() === currentUser.email.toLowerCase()) ||
    (doctor.name && currentUser.name && doctor.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === currentUser.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
  )));

  const resolvedDoctor = React.useMemo(() => {
    if (!doctor) return {};

    const targetId = doctor.id || (isOwnProfile && currentUser?.id);
    const targetName = doctor.name || (isOwnProfile && currentUser?.name);

    const fresh = (doctors || []).find(d => 
      (targetId && (d.id === targetId || String(d.id).replace('doc-', '') === String(targetId).replace('doc-', ''))) ||
      (d.name && targetName && d.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === targetName.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
    );

    const base = {
      ...(fresh || {}),
      ...doctor,
      ...(liveDoctor || {}),
      ...(isOwnProfile && currentUser ? currentUser : {})
    };

    const source = liveDoctor || fresh;
    if (source) {
      if (source.bio && (!base.bio || base.bio.startsWith('Dedicated veterinary'))) base.bio = source.bio;
      if (source.qualification) base.qualification = source.qualification;
      if (source.clinic) base.clinic = source.clinic;
      if (source.city) base.city = source.city;
      if (source.state) base.state = source.state;
      if (source.phone) base.phone = source.phone;
      if (source.email) base.email = source.email;
      if (source.licenseNumber) base.licenseNumber = source.licenseNumber;
      if (source.experienceYears != null) base.experienceYears = source.experienceYears;
      if (source.connectionsCount != null) base.connectionsCount = source.connectionsCount;
      if (source.casesCount != null) base.casesCount = source.casesCount;
      if (source.coverImage && (!base.coverImage || base.coverImage.includes('unsplash.com'))) base.coverImage = source.coverImage;
      if (source.avatar && (!base.avatar || base.avatar.includes('unsplash.com'))) base.avatar = source.avatar;
    }

    return base;
  }, [doctor, doctors, liveDoctor, isOwnProfile, currentUser]);

  const activeDoc = resolvedDoctor || liveDoctor || doctor || {};
  const displayPhone = activeDoc?.phone || (isOwnProfile && currentUser?.phone) || '';
  const displayEmail = activeDoc?.email || (isOwnProfile && currentUser?.email) || '';

  // Helper to match items authored by this practitioner
  const isDocItem = (authorId, authorName) => {
    if (isOwnProfile) {
      if (authorId === 'doc-me') return true;
      if (currentUser?.id && (authorId === currentUser.id || String(authorId).replace('doc-', '') === String(currentUser.id).replace('doc-', ''))) return true;
      if (authorName && authorName.toLowerCase().includes('you')) return true;
      if (currentUser?.name && authorName) {
        const cleanA = authorName.toLowerCase().replace(/^dr\.?\s*/i, '').replace(/\s*\([a-z\s]+\)/i, '').trim();
        const cleanMe = currentUser.name.toLowerCase().replace(/^dr\.?\s*/i, '').replace(/\s*\([a-z\s]+\)/i, '').trim();
        if (cleanA && cleanMe && (cleanA === cleanMe || cleanA.includes(cleanMe) || cleanMe.includes(cleanA))) return true;
      }
    }
    if (activeDoc?.id && (authorId === activeDoc.id || String(authorId).replace('doc-', '') === String(activeDoc.id).replace('doc-', ''))) return true;
    if (authorName && activeDoc?.name) {
      const cleanA = authorName.toLowerCase().replace(/^dr\.?\s*/i, '').replace(/\s*\([a-z\s]+\)/i, '').trim();
      const cleanD = activeDoc.name.toLowerCase().replace(/^dr\.?\s*/i, '').replace(/\s*\([a-z\s]+\)/i, '').trim();
      if (cleanA && cleanD && (cleanA === cleanD || cleanA.includes(cleanD) || cleanD.includes(cleanA))) return true;
    }
    return false;
  };

  const doctorCases = cases.filter(c => c && isDocItem(c.authorId, c.authorName));
  const doctorPosts = posts.filter(p => p && isDocItem(p.authorId, p.authorName));

  const displayConnectionsCount = isOwnProfile
    ? (Array.isArray(connectedDoctors) ? connectedDoctors.length : 0)
    : (activeDoc?.connectionsCount != null ? Number(activeDoc.connectionsCount) : (isConnected ? 1 : 0));

  const displayExperienceYears = (activeDoc?.experienceYears != null && activeDoc.experienceYears > 0)
    ? activeDoc.experienceYears
    : (activeDoc?.experience && activeDoc.experience > 0 ? activeDoc.experience : 0);
  const displayExperienceText = displayExperienceYears > 0 ? `${displayExperienceYears} ${Number(displayExperienceYears) === 1 ? 'yr' : 'yrs'}` : '0 yrs';

  const displayAvatar = (activeDoc?.avatar && !activeDoc.avatar.includes('unsplash.com'))
    ? activeDoc.avatar
    : ((isOwnProfile && currentUser?.avatar && !currentUser.avatar.includes('unsplash.com')) ? currentUser.avatar : (doctor?.avatar || ''));

  const displayCover = (activeDoc?.coverImage && !activeDoc.coverImage.includes('unsplash.com'))
    ? activeDoc.coverImage
    : ((isOwnProfile && currentUser?.coverImage && !currentUser.coverImage.includes('unsplash.com')) ? currentUser.coverImage : (doctor?.coverImage || ''));

  if (!doctor) return null;

  return (
    <div className="modal-overlay doctor-modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div
        className="modal-content doctor-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Image Banner */}
        <div
          className="doctor-modal-cover"
          style={{
            background: displayCover
              ? `url(${displayCover}) center/cover no-repeat`
              : 'linear-gradient(135deg, #003822 0%, #05633C 50%, #0D472B 100%)',
            justifyContent: isOwnProfile ? 'space-between' : 'flex-end'
          }}
        >
          {isOwnProfile && (
            <>
              <input
                type="file"
                ref={modalCoverInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleQuickCoverUpload}
              />
              <button
                type="button"
                onClick={() => modalCoverInputRef.current?.click()}
                disabled={isUploadingCover}
                className="doctor-modal-cover-btn"
                title="Change Cover Banner Photo"
              >
                <Camera size={13} />
                <span>{isUploadingCover ? 'Uploading...' : 'Change Cover'}</span>
              </button>
            </>
          )}

          <div className="doctor-modal-cover-actions">
            {onViewFullPageProfile && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewFullPageProfile(activeDoc);
                }}
                className="doctor-modal-cover-btn"
                title="Open in full page profile view"
              >
                <ExternalLink size={12} />
                <span>Full Page</span>
              </button>
            )}
            <button
              className="doctor-modal-close-btn"
              onClick={onClose}
              title="Close Profile"
              aria-label="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Doctor Header Info Card */}
        <div className="doctor-modal-body">
          <div className="doctor-modal-avatar-row">
            <div className="doctor-modal-avatar-wrap">
              <Avatar
                src={displayAvatar}
                name={activeDoc?.name || doctor.name}
                size={68}
                fontSize={26}
                style={{
                  border: '3px solid #FFFFFF',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
                }}
              />
              {isOwnProfile ? (
                <>
                  <input
                    type="file"
                    ref={modalPhotoInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleQuickPhotoUpload}
                  />
                  <button
                    type="button"
                    onClick={() => modalPhotoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    style={{
                      position: 'absolute',
                      bottom: '0px',
                      right: '0px',
                      backgroundColor: '#003822',
                      color: '#FFFFFF',
                      border: '2px solid #FFFFFF',
                      borderRadius: '50%',
                      width: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                      transition: 'all 0.15s ease'
                    }}
                    title="Upload / Change Doctor Profile Photo"
                  >
                    <Camera size={13} />
                  </button>
                </>
              ) : activeDoc?.verified ? (
                <CheckCircle2
                  size={18}
                  color="#00a86b"
                  fill="#FFFFFF"
                  style={{ position: 'absolute', bottom: '2px', right: '2px' }}
                />
              ) : null}
            </div>

            {/* Action Buttons */}
            <div className="doctor-modal-actions">
              {isOwnProfile ? (
                <button
                  onClick={() => {
                    onClose();
                    onEditProfile && onEditProfile();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#003822',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 56, 34, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <UserPen size={13} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  {isConnected && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenChat && onOpenChat(doctor);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: '#003822',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '9999px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <MessageSquare size={13} />
                      <span>Message</span>
                    </button>
                  )}

                  {isConnected ? (
                    <button
                      onClick={() => onToggleConnect && onToggleConnect(doctor.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: '#ECFDF5',
                        color: '#065F46',
                        border: '1px solid #A7F3D0',
                        borderRadius: '9999px',
                        padding: '6px 13px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Check size={13} color="#059669" />
                      <span>Connected</span>
                    </button>
                  ) : isPending ? (
                    <button
                      style={{
                        backgroundColor: '#F3F4F6',
                        color: '#6B7280',
                        border: '1px solid #E5E7EB',
                        borderRadius: '9999px',
                        padding: '6px 13px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'default'
                      }}
                    >
                      Pending
                    </button>
                  ) : (
                    <button
                      onClick={() => onSendRequest && onSendRequest(doctor)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: '#FFFFFF',
                        color: '#003822',
                        border: '1.5px solid #003822',
                        borderRadius: '9999px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <UserPlus size={13} />
                      <span>Connect</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Name & Headline */}
          <div>
            <div className="doctor-modal-name-row">
              <h2 className="doctor-modal-name">
                {activeDoc?.name || doctor.name}
              </h2>
              {activeDoc?.verified && (
                <span style={{ fontSize: '11px', color: '#065F46', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  Verified Practitioner
                </span>
              )}
              {activeDoc?.active ? (
                <span style={{ fontSize: '11px', color: '#065F46', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  Active
                </span>
              ) : (
                <span style={{ fontSize: '11px', color: '#6B7280', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#9CA3AF' }} />
                  Inactive
                </span>
              )}
            </div>

            <p className="doctor-modal-specialty">
              {activeDoc?.specialty || 'Veterinary Practitioner'}
            </p>

            <p className="doctor-modal-location">
              <MapPin size={14} />
              <span>{[activeDoc?.clinic, activeDoc?.city, activeDoc?.state].filter(Boolean).join(' · ') || (isOwnProfile ? 'Add clinic & location details' : 'Location not specified')}</span>
            </p>

            {/* Quick Contact Badges */}
            {(displayPhone || displayEmail) && (
              <div className="doctor-modal-contact-row">
                {displayPhone && (
                  <a
                    href={`tel:${displayPhone.replace(/\s+/g, '')}`}
                    className="doctor-modal-contact-badge"
                    style={{
                      color: '#065F46',
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0'
                    }}
                    title="Call doctor"
                  >
                    <Phone size={12} color="#059669" />
                    <span>{displayPhone}</span>
                  </a>
                )}

                {displayEmail && (
                  <a
                    href={`mailto:${displayEmail}`}
                    className="doctor-modal-contact-badge"
                    style={{
                      color: '#1E40AF',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE'
                    }}
                    title="Send email"
                  >
                    <Mail size={12} color="#2563EB" />
                    <span>{displayEmail}</span>
                  </a>
                )}
              </div>
            )}

            {/* Stats Bar */}
            <div className="doctor-modal-stats-bar">
              <div className="doctor-modal-stat-card">
                <span className="doctor-modal-stat-num">
                  {displayConnectionsCount}
                </span>
                <span className="doctor-modal-stat-label">Network</span>
              </div>
              <div className="doctor-modal-stat-card">
                <span className="doctor-modal-stat-num">
                  {doctorCases.length}
                </span>
                <span className="doctor-modal-stat-label">Cases</span>
              </div>
              <div className="doctor-modal-stat-card">
                <span className="doctor-modal-stat-num">
                  {displayExperienceText}
                </span>
                <span className="doctor-modal-stat-label">Practice</span>
              </div>
            </div>
          </div>

          {/* Profile Section Tabs */}
          <div className="doctor-modal-tabs-bar">
            {[
              { id: 'about', label: 'About & Credentials' },
              { id: 'cases', label: `Cases (${doctorCases.length})` },
              { id: 'posts', label: `Posts (${doctorPosts.length})` },
              { id: 'contact', label: 'Hospital Contact' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="doctor-modal-tab-btn"
                style={{
                  borderBottom: activeTab === tab.id ? '2.5px solid #003822' : '2.5px solid transparent',
                  color: activeTab === tab.id ? '#003822' : '#6B7280',
                  fontWeight: activeTab === tab.id ? 700 : 500
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: About */}
          {activeTab === 'about' && (
            <div style={{ paddingTop: '16px' }}>
              <h4 style={{ fontSize: '12.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64726A', marginBottom: '6px' }}>
                Professional Biography
              </h4>
              <p style={{ fontSize: '13.5px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px 0', backgroundColor: '#F9FAFB', padding: '12px 14px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                {activeDoc?.bio || (isOwnProfile ? 'No biography added yet. Click "Edit Profile" to add your professional bio.' : 'No biography provided.')}
              </p>

              <div className="doctor-modal-creds-grid">
                <div className="doctor-modal-cred-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>
                    <GraduationCap size={15} />
                    <span>Qualifications</span>
                  </div>
                  <strong style={{ fontSize: '13px', color: '#111827', display: 'block' }}>{activeDoc?.qualification || (isOwnProfile ? 'Not added yet (Edit Profile)' : 'Not specified')}</strong>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>Veterinary Medical Qualifications</span>
                </div>

                <div className="doctor-modal-cred-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>
                    <Building size={15} />
                    <span>Practice Center</span>
                  </div>
                  <strong style={{ fontSize: '13px', color: '#111827', display: 'block' }}>{activeDoc?.clinic || (isOwnProfile ? 'Not added yet (Edit Profile)' : 'Not specified')}</strong>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>{[activeDoc?.city, activeDoc?.state].filter(Boolean).join(', ') || 'Location not specified'}</span>
                </div>

                <div className="doctor-modal-cred-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>
                    <Stethoscope size={15} />
                    <span>Specialty Focus</span>
                  </div>
                  <strong style={{ fontSize: '13px', color: '#111827', display: 'block' }}>{activeDoc?.specialty || (isOwnProfile ? 'General Practice' : 'Not specified')}</strong>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>Clinical Case Consultations</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Clinical Cases */}
          {activeTab === 'cases' && (
            <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {doctorCases.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                  No published clinical cases yet.
                </div>
              ) : (
                doctorCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectCase && onSelectCase(c)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#F9FAFB',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '13.5px', color: '#003822', fontWeight: 700 }}>
                        {c.title}
                      </h4>
                      {isOwnProfile && isDocItem(c.authorId, c.authorName) && onDeleteCase && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCase(c.id);
                          }}
                          title="Delete clinical case"
                          style={{
                            border: '1px solid #fee2e2',
                            backgroundColor: '#fff5f5',
                            color: '#dc2626',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: '2px 6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '10.5px',
                            fontWeight: 600
                          }}
                        >
                          <Trash2 size={11} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.presentingComplaint}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Posts */}
          {activeTab === 'posts' && (
            <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {doctorPosts.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                  No community posts shared yet.
                </div>
              ) : (
                doctorPosts.map((p) => (
                  <div key={p.id} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>{p.badgeLabel || 'CLINICAL UPDATE'}</span>
                      {isOwnProfile && onDeletePost && (
                        <button
                          type="button"
                          onClick={() => onDeletePost(p.id)}
                          title="Delete post"
                          style={{
                            border: '1px solid #fee2e2',
                            backgroundColor: '#fff5f5',
                            color: '#dc2626',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: '2px 6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '10.5px',
                            fontWeight: 600
                          }}
                        >
                          <Trash2 size={11} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#1F2937', lineHeight: 1.4 }}>
                      {p.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Contact */}
          {activeTab === 'contact' && (
            <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#374151' }}>
                <Phone size={16} color="#059669" />
                <span>Clinic Desk: {displayPhone ? <a href={`tel:${displayPhone.replace(/\s+/g, '')}`} style={{ color: '#111827', textDecoration: 'none', fontWeight: 600 }}>{displayPhone}</a> : <span style={{ color: '#9CA3AF' }}>Not provided</span>}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#374151' }}>
                <Mail size={16} color="#059669" />
                <span>Professional Email: {displayEmail ? <a href={`mailto:${displayEmail}`} style={{ color: '#111827', textDecoration: 'none', fontWeight: 600 }}>{displayEmail}</a> : <span style={{ color: '#9CA3AF' }}>Not provided</span>}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#374151' }}>
                <MapPin size={16} color="#059669" />
                <span>Location: {[activeDoc?.clinic, activeDoc?.city, activeDoc?.state].filter(Boolean).join(', ') || (isOwnProfile ? 'Not added (Edit Profile)' : 'Location not specified')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
