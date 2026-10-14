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
  UserPen
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
  currentUser,
  onEditProfile,
  onUpdateAvatar,
  onUpdateCover
}) {
  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'cases' | 'posts' | 'contact'
  const modalPhotoInputRef = React.useRef(null);
  const modalCoverInputRef = React.useRef(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

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

  if (!doctor) return null;

  const isOwnProfile = currentUser && (
    doctor.id === currentUser.id ||
    String(doctor.id).replace('doc-', '') === String(currentUser.id).replace('doc-', '') ||
    (doctor.email && currentUser.email && doctor.email.toLowerCase() === currentUser.email.toLowerCase()) ||
    (doctor.name && currentUser.name && doctor.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === currentUser.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
  );

  const resolvedDoctor = React.useMemo(() => {
    if (!doctor) return null;
    if (isOwnProfile && currentUser) {
      return { ...doctor, ...currentUser };
    }
    const fresh = (doctors || []).find(d => 
      d.id === doctor.id || 
      String(d.id).replace('doc-', '') === String(doctor.id).replace('doc-', '') || 
      (d.name && doctor.name && d.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === doctor.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
    );
    return fresh ? { ...doctor, ...fresh, avatar: fresh.avatar || doctor.avatar } : doctor;
  }, [doctor, doctors, isOwnProfile, currentUser]);

  const activeDoc = resolvedDoctor || doctor;

  const doctorCases = cases.filter(c => c.authorName === activeDoc.name || c.authorName?.includes(activeDoc.name.replace('Dr. ', '')));
  const doctorPosts = posts.filter(p => p.authorName === activeDoc.name || p.authorName?.includes(activeDoc.name.replace('Dr. ', '')));

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 60 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '100%', borderRadius: '18px', overflow: 'hidden' }}
      >
        {/* Cover Image Banner */}
        <div style={{
          height: '130px',
          background: (isOwnProfile && currentUser?.coverImage)
            ? `url(${currentUser.coverImage}) center/cover no-repeat`
            : (activeDoc.coverImage
              ? `url(${activeDoc.coverImage}) center/cover no-repeat`
              : 'linear-gradient(135deg, #003822 0%, #05633C 50%, #0D472B 100%)'),
          position: 'relative',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: isOwnProfile ? 'space-between' : 'flex-end',
          alignItems: 'flex-start'
        }}>
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.15s ease'
                }}
                title="Change Cover Banner Photo"
              >
                <Camera size={13} />
                <span>{isUploadingCover ? 'Uploading...' : 'Change Cover'}</span>
              </button>
            </>
          )}

          <button
            className="btn-close-modal"
            onClick={onClose}
            style={{ color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '50%', width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Doctor Header Info Card */}
        <div style={{ padding: '0 24px 20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-48px', marginBottom: '14px' }}>
            <div style={{ position: 'relative' }}>
              <Avatar
                src={(isOwnProfile && currentUser?.avatar) ? currentUser.avatar : (activeDoc.avatar || doctor.avatar)}
                name={activeDoc.name || doctor.name}
                size={96}
                fontSize={38}
                style={{
                  border: '4px solid #FFFFFF',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
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
                      bottom: '2px',
                      right: '2px',
                      backgroundColor: '#003822',
                      color: '#FFFFFF',
                      border: '2.5px solid #FFFFFF',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                      transition: 'all 0.15s ease'
                    }}
                    title="Upload / Change Doctor Profile Photo"
                  >
                    <Camera size={15} />
                  </button>
                </>
              ) : activeDoc.verified ? (
                <CheckCircle2
                  size={22}
                  color="#00a86b"
                  fill="#FFFFFF"
                  style={{ position: 'absolute', bottom: '4px', right: '4px' }}
                />
              ) : null}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {isOwnProfile ? (
                <button
                  onClick={() => {
                    onClose();
                    onEditProfile && onEditProfile();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    backgroundColor: '#003822',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 56, 34, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <UserPen size={14} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenChat && onOpenChat(doctor);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#003822',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '8px 18px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <MessageSquare size={14} />
                    <span>Message</span>
                  </button>

                  {isConnected ? (
                    <button
                      onClick={() => onToggleConnect && onToggleConnect(doctor.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#ECFDF5',
                        color: '#065F46',
                        border: '1px solid #A7F3D0',
                        borderRadius: '9999px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Check size={14} color="#059669" />
                      <span>Connected</span>
                    </button>
                  ) : isPending ? (
                    <button
                      style={{
                        backgroundColor: '#F3F4F6',
                        color: '#6B7280',
                        border: '1px solid #E5E7EB',
                        borderRadius: '9999px',
                        padding: '8px 16px',
                        fontSize: '13px',
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
                        gap: '6px',
                        backgroundColor: '#FFFFFF',
                        color: '#003822',
                        border: '1.5px solid #003822',
                        borderRadius: '9999px',
                        padding: '8px 18px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <UserPlus size={14} />
                      <span>Connect</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Name & Headline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>
                {activeDoc.name}
              </h2>
              {activeDoc.verified && (
                <span style={{ fontSize: '11px', color: '#065F46', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  Verified Practitioner
                </span>
              )}
            </div>

            <p style={{ fontSize: '14.5px', color: '#003822', fontWeight: '700', margin: '4px 0 2px 0' }}>
              {activeDoc.specialty}
            </p>

            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64726A', margin: 0 }}>
              <MapPin size={14} />
              <span>{activeDoc.clinic || 'Specialty Pet Care'} · {activeDoc.city}, {activeDoc.state}</span>
            </p>

            {/* Stats Bar */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', padding: '10px 14px', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                  {activeDoc.connectionsCount || 428}
                </span>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>Connections</span>
              </div>
              <div style={{ borderLeft: '1px solid #E5E7EB', paddingLeft: '16px' }}>
                <span style={{ display: 'block', fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                  {doctorCases.length > 0 ? doctorCases.length : (activeDoc.casesCount || 34)}
                </span>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>Clinical Cases</span>
              </div>
              <div style={{ borderLeft: '1px solid #E5E7EB', paddingLeft: '16px' }}>
                <span style={{ display: 'block', fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                  {activeDoc.experienceYears || 8} yrs
                </span>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>Experience</span>
              </div>
            </div>
          </div>

          {/* Profile Section Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginTop: '16px', gap: '16px' }}>
            {[
              { id: 'about', label: 'About & Credentials' },
              { id: 'cases', label: `Cases (${doctorCases.length})` },
              { id: 'posts', label: `Posts (${doctorPosts.length})` },
              { id: 'contact', label: 'Hospital Contact' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 4px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2.5px solid #003822' : '2.5px solid transparent',
                  color: activeTab === tab.id ? '#003822' : '#6B7280',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer'
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
              <p style={{ fontSize: '13.5px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                {activeDoc.bio || 'Dedicated veterinary practitioner committed to providing high-quality companion and large animal care, advancing evidence-based veterinary clinical medicine.'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>
                    <GraduationCap size={15} />
                    <span>Qualifications</span>
                  </div>
                  <strong style={{ fontSize: '13px', color: '#111827' }}>{activeDoc.qualification || 'BVSc & AH, MVSc'}</strong>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>
                    <Building size={15} />
                    <span>Practice Center</span>
                  </div>
                  <strong style={{ fontSize: '13px', color: '#111827' }}>{activeDoc.clinic || 'Specialty Animal Hospital'}</strong>
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
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', color: '#003822', fontWeight: 700 }}>
                      {c.title}
                    </h4>
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
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>{p.badgeLabel || 'CLINICAL UPDATE'}</span>
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
                <span>Clinic Desk: {activeDoc.phone || '+91 80 2558 4920'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#374151' }}>
                <Mail size={16} color="#059669" />
                <span>Professional Email: {activeDoc.email || `${activeDoc.name.toLowerCase().replace(/[^a-z]/g, '')}@doctorvet.com`}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#374151' }}>
                <MapPin size={16} color="#059669" />
                <span>Location: {activeDoc.clinic || 'Clinic'}, {activeDoc.city}, {activeDoc.state || 'Karnataka'}, India</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
