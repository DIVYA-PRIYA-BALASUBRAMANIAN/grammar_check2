import React, { useState, useRef } from 'react';
import {
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
  ArrowLeft,
  Calendar,
  Sparkles,
  ExternalLink,
  Plus,
  Pencil,
  X,
  Trash2
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { api } from '../services/api';

export function ProfileView({
  doctor,
  doctors = [],
  currentUser,
  cases = [],
  posts = [],
  connectedDoctors = [],
  onEditProfile,
  onSelectCase,
  onUpdateAvatar,
  onUpdateCover,
  onUpdatePhone,
  onUpdateEmail,
  onUpdateVci,
  onOpenChat,
  onToggleConnect,
  isConnected,
  isPending,
  onSendRequest,
  onBackToFeed,
  onOpenCreateCase,
  onDeleteCase,
  onDeletePost,
  returnTab = 'feed'
}) {
  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'cases' | 'posts' | 'contact'

  const photoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const targetDoc = doctor || currentUser;

  React.useEffect(() => {
    setActiveTab('about');
  }, [targetDoc?.id, targetDoc?.name]);

  const isOwnProfile = !doctor || targetDoc?.isCurrentUser || Boolean(currentUser && (
    (targetDoc.id != null && currentUser.id != null && String(targetDoc.id).replace('doc-', '') === String(currentUser.id).replace('doc-', '')) ||
    (targetDoc.email && currentUser.email && targetDoc.email.toLowerCase() === currentUser.email.toLowerCase()) ||
    (targetDoc.name && currentUser.name && targetDoc.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === currentUser.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
  ));

  const resolvedDoctor = React.useMemo(() => {
    if (!targetDoc) return currentUser || null;

    const targetId = targetDoc.id || (isOwnProfile && currentUser?.id);
    const targetName = targetDoc.name || (isOwnProfile && currentUser?.name);

    const fresh = (doctors || []).find(d =>
      (targetId && (d.id === targetId || String(d.id).replace('doc-', '') === String(targetId).replace('doc-', ''))) ||
      (d.name && targetName && d.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === targetName.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
    );

    const base = {
      ...(fresh || {}),
      ...targetDoc,
      ...(isOwnProfile && currentUser ? currentUser : {})
    };

    if (fresh) {
      if (fresh.bio && (!base.bio || base.bio.startsWith('Dedicated veterinary'))) base.bio = fresh.bio;
      if (fresh.qualification) base.qualification = fresh.qualification;
      if (fresh.clinic) base.clinic = fresh.clinic;
      if (fresh.city) base.city = fresh.city;
      if (fresh.state) base.state = fresh.state;
      if (fresh.phone) base.phone = fresh.phone;
      if (fresh.email) base.email = fresh.email;
      if (fresh.experienceYears) base.experienceYears = fresh.experienceYears;
      if (fresh.coverImage && (!base.coverImage || base.coverImage.includes('unsplash.com'))) base.coverImage = fresh.coverImage;
      if (fresh.avatar && (!base.avatar || base.avatar.includes('unsplash.com'))) base.avatar = fresh.avatar;
    }

    return base;
  }, [targetDoc, doctors, isOwnProfile, currentUser]);

  const activeDoc = resolvedDoctor || targetDoc || {};
  const displayPhone = activeDoc.phone || (isOwnProfile && currentUser?.phone) || '';
  const displayEmail = activeDoc.email || (isOwnProfile && currentUser?.email) || '';

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
    if (activeDoc.id && (authorId === activeDoc.id || String(authorId).replace('doc-', '') === String(activeDoc.id).replace('doc-', ''))) return true;
    if (authorName && activeDoc.name) {
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
    : (activeDoc.connectionsCount != null ? Number(activeDoc.connectionsCount) : (isConnected ? 1 : 0));

  const displayExperienceYears = (activeDoc.experienceYears != null && activeDoc.experienceYears > 0)
    ? activeDoc.experienceYears
    : (activeDoc.experience && activeDoc.experience > 0 ? activeDoc.experience : 0);
  const displayExperienceText = displayExperienceYears > 0 ? `${displayExperienceYears} ${Number(displayExperienceYears) === 1 ? 'yr' : 'yrs'}` : '0 yrs';

  const displayAvatar = (activeDoc.avatar && !activeDoc.avatar.includes('unsplash.com'))
    ? activeDoc.avatar
    : ((isOwnProfile && currentUser?.avatar && !currentUser.avatar.includes('unsplash.com')) ? currentUser.avatar : (targetDoc?.avatar || ''));

  const displayCover = (activeDoc.coverImage && !activeDoc.coverImage.includes('unsplash.com'))
    ? activeDoc.coverImage
    : ((isOwnProfile && currentUser?.coverImage && !currentUser.coverImage.includes('unsplash.com')) ? currentUser.coverImage : (targetDoc?.coverImage || ''));

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

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };



  return (
    <div className="profile-view-container" style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={onBackToFeed}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '9999px',
            padding: '7px 16px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#374151',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
        >
          <ArrowLeft size={16} />
          <span>{returnTab === 'messages' ? 'Back to Messages' : (returnTab === 'network' ? 'Back to Network' : 'Back to Feed')}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleShareProfile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '9999px',
              padding: '7px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#4B5563',
              cursor: 'pointer'
            }}
          >
            <Share2 size={14} />
            <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="profile-main-card" style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 20px rgba(0, 35, 20, 0.05)'
      }}>
        {/* Cover Banner */}
        <div className="profile-cover-banner" style={{
          height: '140px',
          background: displayCover
            ? `url(${displayCover}) center/cover no-repeat`
            : 'linear-gradient(135deg, #003822 0%, #05633C 50%, #0D472B 100%)',
          position: 'relative',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: isOwnProfile ? 'flex-end' : 'flex-end',
          alignItems: 'flex-start'
        }}>
          {isOwnProfile && (
            <>
              <input
                type="file"
                ref={coverInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleQuickCoverUpload}
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={isUploadingCover}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)',
                  transition: 'all 0.15s ease'
                }}
                title="Change Cover Banner Photo"
              >
                <Camera size={13} />
                <span>{isUploadingCover ? 'Uploading...' : 'Change Cover Photo'}</span>
              </button>
            </>
          )}
        </div>

        {/* Doctor Identity Header */}
        <div className="profile-identity-header" style={{ padding: '0 20px 18px 20px' }}>
          <div className="profile-avatar-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-42px', marginBottom: '14px' }}>
            <div style={{ position: 'relative' }}>
              <Avatar
                src={displayAvatar}
                name={activeDoc.name || 'Doctor'}
                size={80}
                fontSize={30}
                style={{
                  border: '3.5px solid #FFFFFF',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
                }}
              />
              {isOwnProfile ? (
                <>
                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleQuickPhotoUpload}
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      backgroundColor: '#003822',
                      color: '#FFFFFF',
                      border: '2px solid #FFFFFF',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                      transition: 'all 0.15s ease'
                    }}
                    title="Upload / Change Doctor Profile Photo"
                  >
                    <Camera size={13} />
                  </button>
                </>
              ) : activeDoc.verified ? (
                <CheckCircle2
                  size={20}
                  color="#00a86b"
                  fill="#FFFFFF"
                  style={{ position: 'absolute', bottom: '4px', right: '4px' }}
                />
              ) : null}
            </div>

            {/* Profile Action Buttons */}
            <div className="profile-actions-wrap" style={{ display: 'flex', gap: '8px' }}>
              {isOwnProfile ? (
                <button
                  onClick={onEditProfile}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#003822',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '7px 18px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 56, 34, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#05633C'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#003822'; }}
                >
                  <UserPen size={13} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  {isConnected && (
                    <button
                      onClick={() => onOpenChat && onOpenChat(activeDoc)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#003822',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '9999px',
                        padding: '7px 16px',
                        fontSize: '12.5px',
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
                      onClick={() => onToggleConnect && onToggleConnect(activeDoc.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#ECFDF5',
                        color: '#065F46',
                        border: '1px solid #A7F3D0',
                        borderRadius: '9999px',
                        padding: '7px 15px',
                        fontSize: '12.5px',
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
                        padding: '7px 15px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'default'
                      }}
                    >
                      Pending
                    </button>
                  ) : (
                    <button
                      onClick={() => onSendRequest && onSendRequest(activeDoc)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#FFFFFF',
                        color: '#003822',
                        border: '1.5px solid #003822',
                        borderRadius: '9999px',
                        padding: '7px 16px',
                        fontSize: '12.5px',
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

          {/* Title & Headline */}
          <div>
            <div className="profile-name-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 className="profile-name-text" style={{ fontFamily: 'var(--font-display)', fontSize: '21px', fontWeight: '800', color: '#111827', margin: 0 }}>
                {activeDoc.name || 'Veterinary Practitioner'}
              </h1>
              {activeDoc.active ? (
                <span style={{ fontSize: '11.5px', color: '#065F46', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  Active
                </span>
              ) : (
                <span style={{ fontSize: '11.5px', color: '#6B7280', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', padding: '3px 10px', borderRadius: '9999px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#9CA3AF' }} />
                  Inactive
                </span>
              )}
            </div>

            <p style={{ fontSize: '16px', color: '#003822', fontWeight: '700', margin: '6px 0 3px 0' }}>
              {activeDoc.specialty || 'Veterinary Surgeon'}
            </p>

            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', color: '#64726A', margin: 0 }}>
              <MapPin size={15} />
              <span>{[activeDoc.clinic, activeDoc.city, activeDoc.state].filter(Boolean).join(' · ') || (isOwnProfile ? 'Add clinic & location details (Edit Profile)' : 'Location not specified')}</span>
            </p>

            {/* Contact Badges: Phone Number & Email Address */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              {displayPhone && (
                <a
                  href={`tel:${displayPhone.replace(/\s+/g, '')}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#065F46',
                    backgroundColor: '#ECFDF5',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    border: '1px solid #A7F3D0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease'
                  }}
                  title="Call doctor directly"
                >
                  <Phone size={13.5} color="#059669" />
                  <span>{displayPhone}</span>
                </a>
              )}

              {displayEmail && (
                <a
                  href={`mailto:${displayEmail}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1E40AF',
                    backgroundColor: '#EFF6FF',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    border: '1px solid #BFDBFE',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease'
                  }}
                  title="Send professional email"
                >
                  <Mail size={13.5} color="#2563EB" />
                  <span>{displayEmail}</span>
                </a>
              )}
            </div>

            {/* Metrics Impact Bar */}
            <div className="profile-metrics-bar" style={{
              display: 'flex',
              gap: '24px',
              marginTop: '16px',
              padding: '14px 20px',
              backgroundColor: '#F8F9FA',
              borderRadius: '10px',
              border: '1px solid #F0F2F5'
            }}>
              <div>
                <span style={{ display: 'block', fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                  {displayConnectionsCount}
                </span>
                <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 500 }}>Professional Network</span>
              </div>
              <div style={{ borderLeft: '1px solid #E5E7EB', paddingLeft: '24px' }}>
                <span style={{ display: 'block', fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                  {doctorCases.length}
                </span>
                <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 500 }}>Published Cases</span>
              </div>
              <div style={{ borderLeft: '1px solid #E5E7EB', paddingLeft: '24px' }}>
                <span style={{ display: 'block', fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                  {displayExperienceText}
                </span>
                <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 500 }}>Clinical Practice</span>
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="profile-section-tabs" style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginTop: '22px', gap: '24px' }}>
            {[
              { id: 'about', label: 'About & Credentials' },
              { id: 'cases', label: `Published Cases (${doctorCases.length})` },
              { id: 'posts', label: `Discussions & Posts (${doctorPosts.length})` },
              { id: 'contact', label: 'Practice & Contact' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 4px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2.5px solid #003822' : '2.5px solid transparent',
                  color: activeTab === tab.id ? '#003822' : '#6B7280',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: About & Credentials */}
          {activeTab === 'about' && (
            <div style={{ paddingTop: '20px' }}>
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64726A', marginBottom: '8px' }}>
                  Professional Biography
                </h4>
                <p style={{ fontSize: '14.5px', color: '#374151', lineHeight: '1.65', margin: 0, backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                  {activeDoc.bio || (isOwnProfile ? 'No biography added yet. Click "Edit Profile" to share your background, clinical interests, and specializations.' : 'No biography provided.')}
                </p>
              </div>

              <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64726A', marginBottom: '10px' }}>
                Credentials & Hospital Practice
              </h4>
              <div className="profile-creds-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    <GraduationCap size={17} />
                    <span>Degrees & Qualifications</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#111827', display: 'block' }}>{activeDoc.qualification || (isOwnProfile ? 'Not added yet (Edit Profile)' : 'Not specified')}</strong>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>Veterinary Medical Qualifications</span>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    <Building size={17} />
                    <span>Practice Center / Hospital</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#111827', display: 'block' }}>{activeDoc.clinic || (isOwnProfile ? 'Not added yet (Edit Profile)' : 'Not specified')}</strong>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>{[activeDoc.city, activeDoc.state].filter(Boolean).join(', ') || 'Location not specified'}</span>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    <Calendar size={17} />
                    <span>Experience in Practice</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#111827', display: 'block' }}>{displayExperienceYears > 0 ? `${displayExperienceYears} Years` : (isOwnProfile ? 'Not specified (Edit Profile)' : '0 Years')}</strong>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>Companion & Large Animal Care</span>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    <Phone size={17} />
                    <span>Clinic Desk & Phone</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#111827', display: 'block' }}>{displayPhone || (isOwnProfile ? 'Not added (Edit Profile)' : 'Not specified')}</strong>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>Direct Patient & Peer Inquiries</span>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    <Mail size={17} />
                    <span>Professional Email</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#111827', display: 'block', wordBreak: 'break-all' }}>{displayEmail || (isOwnProfile ? 'Not added' : 'Not specified')}</strong>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>Official Registry & Consultation</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Clinical Cases */}
          {activeTab === 'cases' && (
            <div style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>All clinical cases published to the peer registry</span>
                {isOwnProfile && onOpenCreateCase && (
                  <button
                    onClick={onOpenCreateCase}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#003822',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={14} />
                    <span>Publish New Case</span>
                  </button>
                )}
              </div>

              {doctorCases.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px dashed #E5E7EB' }}>
                  <FolderHeart size={36} color="#9CA3AF" style={{ margin: '0 auto 10px auto' }} />
                  <p style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 600, color: '#374151' }}>No published cases yet</p>
                  <span style={{ fontSize: '12.5px', color: '#9CA3AF' }}>Cases authored by this practitioner will appear here.</span>
                </div>
              ) : (
                doctorCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectCase && onSelectCase(c)}
                    style={{
                      padding: '16px 18px',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#F9FAFB',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#003822'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#003822', fontWeight: 700 }}>
                        {c.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          {c.species || 'Canine'}
                        </span>
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
                              borderRadius: '6px',
                              cursor: 'pointer',
                              padding: '3px 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 600
                            }}
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#4B5563', lineHeight: 1.4 }}>
                      {c.presentingComplaint || c.treatment || 'Clinical diagnosis and surgical report.'}
                    </p>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '11.5px', color: '#9CA3AF' }}>
                      <span>Outcome: {c.outcome || 'Complete Recovery'}</span>
                      <span>·</span>
                      <span>Verified Case Study</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Posts & Activity */}
          {activeTab === 'posts' && (
            <div style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {doctorPosts.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px dashed #E5E7EB' }}>
                  <FileText size={36} color="#9CA3AF" style={{ margin: '0 auto 10px auto' }} />
                  <p style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 600, color: '#374151' }}>No community updates yet</p>
                  <span style={{ fontSize: '12.5px', color: '#9CA3AF' }}>Peer discussions and clinical feed updates will be listed here.</span>
                </div>
              ) : (
                doctorPosts.map((p) => (
                  <div key={p.id} style={{ padding: '16px 18px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          {p.badgeLabel || 'CLINICAL UPDATE'}
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#9CA3AF' }}>{p.timestamp || 'Recent'}</span>
                      </div>
                      {isOwnProfile && onDeletePost && (
                        <button
                          type="button"
                          onClick={() => onDeletePost(p.id)}
                          title="Delete post"
                          style={{
                            border: '1px solid #fee2e2',
                            backgroundColor: '#fff5f5',
                            color: '#dc2626',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            padding: '3px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                    <p style={{ margin: '6px 0 10px 0', fontSize: '13.5px', color: '#1F2937', lineHeight: 1.5 }}>
                      {p.content}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6B7280', borderTop: '1px solid #F3F4F6', paddingTop: '8px' }}>
                      <span>{p.likes || 0} Likes</span>
                      <span>{p.commentsCount || (p.comments ? p.comments.length : 0)} Comments</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Hospital & Contact */}
          {activeTab === 'contact' && (
            <div style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={18} color="#059669" />
                <div>
                  <span style={{ display: 'block', fontSize: '11.5px', color: '#6B7280', fontWeight: 600 }}>CLINIC DESK TELEPHONE</span>
                  {displayPhone ? (
                    <a href={`tel:${displayPhone.replace(/\s+/g, '')}`} style={{ fontSize: '14px', color: '#111827', textDecoration: 'none', fontWeight: 700 }}>
                      {displayPhone}
                    </a>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Not provided</span>
                  )}
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} color="#059669" />
                <div>
                  <span style={{ display: 'block', fontSize: '11.5px', color: '#6B7280', fontWeight: 600 }}>PROFESSIONAL EMAIL</span>
                  {displayEmail ? (
                    <a href={`mailto:${displayEmail}`} style={{ fontSize: '14px', color: '#111827', textDecoration: 'none', fontWeight: 700 }}>
                      {displayEmail}
                    </a>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Not provided</span>
                  )}
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={18} color="#059669" />
                <div>
                  <span style={{ display: 'block', fontSize: '11.5px', color: '#6B7280', fontWeight: 600 }}>HOSPITAL LOCATION</span>
                  <strong style={{ fontSize: '14px', color: '#111827' }}>
                    {[activeDoc.clinic, activeDoc.city, activeDoc.state].filter(Boolean).join(', ') || (isOwnProfile ? 'Not added (Edit Profile)' : 'Location not specified')}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
