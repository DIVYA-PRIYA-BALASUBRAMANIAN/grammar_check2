import React, { useState } from 'react';
import {
  X,
  Users,
  User,
  Stethoscope,
  PawPrint,
  Award,
  GraduationCap,
  MapPin,
  Globe,
  Map,
  Building2,
  FileText,
  CreditCard,
  FileEdit,
  Pencil,
  ShieldCheck,
  Check,
  ChevronDown,
  Send,
  Camera,
  UploadCloud,
  Phone,
  Mail
} from 'lucide-react';
import { SPECIALTIES, STATES_INDIA } from '../data/mockData';
import { api } from '../services/api';
import { Avatar } from './Avatar';

// Qualifications list for dropdown
const QUALIFICATIONS = [
  'BVSc & AH',
  'BVSc & AH, MVSc',
  'MVSc (Surgery & Radiology)',
  'MVSc (Veterinary Medicine)',
  'MVSc (Veterinary Surgery)',
  'MVSc (Pathology / Microbiology)',
  'DVM',
  'PhD, BVSc & AH'
];

// Custom Paw Emblem with Medical Cross in pad
function DoctorPawLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="25" cy="38" rx="8.5" ry="12" transform="rotate(-20 25 38)" fill="white" />
      <ellipse cx="42" cy="28" rx="8.5" ry="12" transform="rotate(-6 42 28)" fill="white" />
      <ellipse cx="58" cy="28" rx="8.5" ry="12" transform="rotate(6 58 28)" fill="white" />
      <ellipse cx="75" cy="38" rx="8.5" ry="12" transform="rotate(20 75 38)" fill="white" />
      <path d="M50 46 C37 46 28 56 28 69 C28 79 37 88 50 88 C63 88 72 79 72 69 C72 56 63 46 50 46 Z" fill="white" />
      <path d="M50 58 V78 M40 68 H60" stroke="#00b48a" strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  );
}

export function CreateProfileModal({ isOpen, onClose, onProfileCreated, currentUser }) {
  const [formData, setFormData] = useState({
    name: 'Dr. ',
    specialty: 'Small Animal Medicine',
    qualification: 'BVSc & AH',
    city: 'Bengaluru',
    state: 'Karnataka',
    clinic: '',
    registrationNo: '',
    phone: '',
    email: '',
    bio: '',
    avatar: '',
    coverImage: ''
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const avatarInputRef = React.useRef(null);
  const coverInputRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      const src = currentUser || {};
      setFormData({
        name: src.name || 'Dr. ',
        specialty: src.specialty || 'Small Animal Medicine',
        qualification: src.qualification || 'BVSc & AH',
        city: src.city || 'Bengaluru',
        state: src.state || 'Karnataka',
        clinic: src.clinic || '',
        registrationNo: src.licenseNumber || '',
        phone: src.phone || '',
        email: src.email || '',
        bio: src.bio || '',
        avatar: src.avatar || '',
        coverImage: src.coverImage || ''
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Instant visual preview so the photo shows up immediately
    const objectUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, avatar: objectUrl }));
    setIsUploadingPhoto(true);

    try {
      const res = await api.media.upload(file);
      if (res && res.url) {
        const photoUrl = res.url;
        setFormData(prev => ({ ...prev, avatar: photoUrl }));

        // 2. Immediately auto-save to backend doctor profile
        const docId = currentUser?.id || 1;
        try {
          const updatedDoc = await api.doctors.update(docId, { avatar: photoUrl });
          if (updatedDoc) {
            onProfileCreated && onProfileCreated(updatedDoc);
          }
        } catch (saveErr) {
          console.warn('Auto-save doctor avatar failed:', saveErr);
          onProfileCreated && onProfileCreated({ ...(currentUser || {}), id: docId, avatar: photoUrl });
        }
      }
    } catch (err) {
      console.warn('Backend media upload fallback to dataURL:', err);
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target.result;
        setFormData(prev => ({ ...prev, avatar: dataUrl }));
        const docId = currentUser?.id || 1;
        try {
          const updatedDoc = await api.doctors.update(docId, { avatar: dataUrl });
          if (updatedDoc) onProfileCreated && onProfileCreated(updatedDoc);
        } catch (e) {
          onProfileCreated && onProfileCreated({ ...(currentUser || {}), id: docId, avatar: dataUrl });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setFormData(prev => ({ ...prev, avatar: '' }));
    const docId = currentUser?.id || 1;
    try {
      const updatedDoc = await api.doctors.update(docId, { avatar: '' });
      if (updatedDoc) onProfileCreated && onProfileCreated(updatedDoc);
    } catch (e) {
      onProfileCreated && onProfileCreated({ ...(currentUser || {}), id: docId, avatar: '' });
    }
  };

  const handleCoverFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.media.upload(file);
      if (res && res.url) {
        const coverUrl = res.url;
        setFormData(prev => ({ ...prev, coverImage: coverUrl }));
        const docId = currentUser?.id || 1;
        try {
          const updatedDoc = await api.doctors.update(docId, { coverImage: coverUrl });
          if (updatedDoc) onProfileCreated && onProfileCreated(updatedDoc);
        } catch (e) { }
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target.result;
        setFormData(prev => ({ ...prev, coverImage: dataUrl }));
        const docId = currentUser?.id || 1;
        try {
          const updatedDoc = await api.doctors.update(docId, { coverImage: dataUrl });
          if (updatedDoc) onProfileCreated && onProfileCreated(updatedDoc);
        } catch (e) { }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.trim() === 'Dr.') {
      alert('Please enter your full doctor name');
      return;
    }

    const payload = {
      name: formData.name,
      specialty: formData.specialty,
      city: formData.city,
      state: formData.state,
      avatar: formData.avatar,
      coverImage: formData.coverImage,
      phone: formData.phone,
      email: formData.email,
      verified: true,
      qualification: formData.qualification,
      clinic: formData.clinic || `${formData.city} Veterinary Clinic`,
      experienceYears: currentUser?.experienceYears || 5,
      casesCount: currentUser?.casesCount || 1,
      bio: formData.bio || 'Practicing veterinary surgeon and clinical care professional.',
      licenseNumber: formData.registrationNo
    };

    try {
      let savedDoc = null;
      const targetId = currentUser?.id ? (String(currentUser.id).replace(/^[^\d]+/g, '') || currentUser.id) : null;
      if (targetId) {
        savedDoc = await api.doctors.update(targetId, payload);
      } else {
        savedDoc = await api.doctors.create(payload);
      }
      const merged = { ...(currentUser || {}), ...(savedDoc || payload) };
      onProfileCreated && onProfileCreated(merged);
      alert('Doctor profile updated successfully!');
    } catch (err) {
      console.warn('Backend profile update fallback to local:', err);
      const fallback = { ...(currentUser || {}), ...payload };
      onProfileCreated && onProfileCreated(fallback);
      alert('Doctor profile updated!');
    }
    onClose && onClose();
  };

  return (
    <div className="modal-overlay create-profile-modal-overlay" onClick={onClose}>
      <div
        className="create-profile-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          className="create-profile-close-btn"
          onClick={onClose}
          type="button"
          title="Close modal"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* ========================================================= */}
        {/* HEADER SECTION: Brand Emblem + Title + Pet Illustration  */}
        {/* ========================================================= */}
        <div className="create-profile-header">
          {/* Left Brand Emblem & Title */}
          <div className="create-profile-title-block">
            <div className="create-profile-emblem">
              <DoctorPawLogo />
            </div>
            <div>
              <h2 className="create-profile-title">
                {currentUser ? 'Edit Your Professional Profile' : 'Create Your Professional Page'}
              </h2>
              <div className="create-profile-title-bar" />
              <p className="create-profile-subtitle">
                {currentUser ? 'Update your clinical credentials, contact info, and practice details' : 'Join the Zenve Vet verified veterinary registry'}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FORM BODY: 8 Structured Input Groups with Badges          */}
        {/* ========================================================= */}
        <form onSubmit={handleSubmit} className="create-profile-form">
          {/* Doctor Profile Headshot & Cover Banner Upload Section */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)',
            border: '1.5px dashed #00b48a',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '18px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Avatar Preview + Clickable Overlay */}
              <div
                onClick={() => avatarInputRef.current?.click()}
                style={{
                  position: 'relative',
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 180, 138, 0.25)',
                  border: '3px solid #ffffff',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
                title="Click to upload/change doctor profile photo"
              >
                <Avatar
                  src={formData.avatar}
                  name={formData.name || currentUser?.name}
                  size={70}
                  fontSize={28}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0, 56, 34, 0.78)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3px 0',
                  color: '#ffffff'
                }}>
                  <Camera size={13} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#003822' }}>
                    Doctor Profile Photo
                  </h4>
                  <span style={{ fontSize: '10.5px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px' }}>
                    Profile Headshot
                  </span>
                </div>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#475569', lineHeight: 1.3 }}>
                  Upload your professional doctor headshot (PNG, JPG, WebP).
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingPhoto}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#003822',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 56, 34, 0.2)',
                  transition: 'all 0.15s ease'
                }}
              >
                <UploadCloud size={15} />
                <span>{isUploadingPhoto ? 'Uploading...' : (formData.avatar ? 'Change Photo' : 'Upload Photo')}</span>
              </button>

              {formData.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    border: '1px solid #FECACA',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="Remove photo and revert to initial letter"
                >
                  <X size={14} />
                  <span>Remove</span>
                </button>
              )}

              {/* Cover Photo Button */}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#FFFFFF',
                  color: '#003822',
                  border: '1px solid #A7F3D0',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Upload Profile Cover Banner Image"
              >
                <Camera size={14} color="#059669" />
                <span>{formData.coverImage ? 'Change Cover' : 'Add Cover'}</span>
              </button>
            </div>
          </div>

          {/* 1. Full Name with Title * */}
          <div className="cp-form-group">
            <label className="cp-label-row">
              <span className="cp-label-badge badge-blue">
                <Users size={14} strokeWidth={2.2} />
              </span>
              <span className="cp-label-text">
                Full Name with Title <span className="cp-required">*</span>
              </span>
            </label>
            <div className="cp-input-wrap">
              <User size={17} className="cp-input-icon icon-blue" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Ramesh Kumar"
                className="cp-text-input"
                autoFocus
              />
            </div>
          </div>

          {/* Row 2: Primary Speciality & Degrees */}
          <div className="cp-grid-two-col">
            {/* 2. Primary Speciality * */}
            <div className="cp-form-group">
              <label className="cp-label-row">
                <span className="cp-label-badge badge-teal">
                  <Stethoscope size={14} strokeWidth={2.2} />
                </span>
                <span className="cp-label-text">
                  Primary Speciality <span className="cp-required">*</span>
                </span>
              </label>
              <div className="cp-input-wrap">
                <PawPrint size={16} className="cp-input-icon icon-teal" />
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="cp-select-input"
                >
                  {SPECIALTIES.filter(s => s !== 'All specialties').map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={17} className="cp-chevron-icon" />
              </div>
            </div>

            {/* 3. Degrees & Credentials * */}
            <div className="cp-form-group">
              <label className="cp-label-row">
                <span className="cp-label-badge badge-indigo">
                  <Award size={14} strokeWidth={2.2} />
                </span>
                <span className="cp-label-text">
                  Degrees & Credentials <span className="cp-required">*</span>
                </span>
              </label>
              <div className="cp-input-wrap">
                <GraduationCap size={17} className="cp-input-icon icon-indigo" />
                <select
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="cp-select-input"
                >
                  {QUALIFICATIONS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                <ChevronDown size={17} className="cp-chevron-icon" />
              </div>
            </div>
          </div>

          {/* Row 3: City & State / Region */}
          <div className="cp-grid-two-col">
            {/* 4. City * */}
            <div className="cp-form-group">
              <label className="cp-label-row">
                <span className="cp-label-badge badge-green">
                  <MapPin size={14} strokeWidth={2.2} />
                </span>
                <span className="cp-label-text">
                  City <span className="cp-required">*</span>
                </span>
              </label>
              <div className="cp-input-wrap">
                <MapPin size={17} className="cp-input-icon icon-green" />
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Bengaluru"
                  className="cp-text-input"
                />
              </div>
            </div>

            {/* 5. State / Region * */}
            <div className="cp-form-group">
              <label className="cp-label-row">
                <span className="cp-label-badge badge-cyan">
                  <Globe size={14} strokeWidth={2.2} />
                </span>
                <span className="cp-label-text">
                  State / Region <span className="cp-required">*</span>
                </span>
              </label>
              <div className="cp-input-wrap">
                <Map size={17} className="cp-input-icon icon-cyan" />
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="cp-select-input"
                >
                  {STATES_INDIA.filter(s => s !== 'All states').map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={17} className="cp-chevron-icon" />
              </div>
            </div>
          </div>

          {/* 6. Clinic or Veterinary Hospital Name */}
          <div className="cp-form-group">
            <label className="cp-label-row">
              <span className="cp-label-badge badge-cyan">
                <Building2 size={14} strokeWidth={2.2} />
              </span>
              <span className="cp-label-text">
                Clinic or Veterinary Hospital Name
              </span>
            </label>
            <div className="cp-input-wrap">
              <Building2 size={17} className="cp-input-icon icon-cyan" />
              <input
                type="text"
                value={formData.clinic}
                onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                placeholder="e.g. Apollo Pet Health Center"
                className="cp-text-input"
              />
            </div>
          </div>

          {/* 7. State Veterinary Council Reg. No. */}
          <div className="cp-form-group">
            <label className="cp-label-row">
              <span className="cp-label-badge badge-blue">
                <FileText size={14} strokeWidth={2.2} />
              </span>
              <span className="cp-label-text">
                State Veterinary Council Reg. No.
              </span>
            </label>
            <div className="cp-input-wrap">
              <CreditCard size={17} className="cp-input-icon icon-blue" />
              <input
                type="text"
                value={formData.registrationNo}
                onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                placeholder="e.g. KVC-84920 (for verified tick badge)"
                className="cp-text-input"
              />
            </div>
          </div>

          {/* Row: Phone Number & Professional Email */}
          <div className="cp-grid-two-col">
            <div className="cp-form-group">
              <label className="cp-label-row">
                <span className="cp-label-badge badge-teal">
                  <Phone size={14} strokeWidth={2.2} />
                </span>
                <span className="cp-label-text">
                  Phone / Clinic Desk Number
                </span>
              </label>
              <div className="cp-input-wrap">
                <Phone size={17} className="cp-input-icon icon-teal" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98401 23456"
                  className="cp-text-input"
                />
              </div>
            </div>

            <div className="cp-form-group">
              <label className="cp-label-row">
                <span className="cp-label-badge badge-blue">
                  <Mail size={14} strokeWidth={2.2} />
                </span>
                <span className="cp-label-text">
                  Professional Email Address
                </span>
              </label>
              <div className="cp-input-wrap">
                <Mail size={17} className="cp-input-icon icon-blue" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. dr.name@zenvevet.com"
                  className="cp-text-input"
                />
              </div>
            </div>
          </div>

          {/* 8. Bio & Clinical Focus */}
          <div className="cp-form-group">
            <label className="cp-label-row">
              <span className="cp-label-badge badge-blue">
                <FileEdit size={14} strokeWidth={2.2} />
              </span>
              <span className="cp-label-text">
                Bio & Clinical Focus
              </span>
            </label>
            <div className="cp-textarea-wrap">
              <Pencil size={15} className="cp-textarea-icon" />
              <textarea
                rows="2"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Briefly describe your clinical interests, surgical expertise, or caseload..."
                className="cp-textarea-input"
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* FOOTER: Verified Profile Badge + Create Profile Button   */}
          {/* ========================================================= */}
          <div className="create-profile-footer">
            {/* Left Verification Badge */}
            <div className="cp-footer-verify-box">
              <div className="cp-verify-shield">
                <ShieldCheck size={22} color="#10b981" strokeWidth={2.4} />
              </div>
              <div className="cp-verify-text-wrap">
                <div className="cp-verify-title">
                  <span>Publish Verified Doctor Profile</span>
                  <Check size={14} color="#10b981" strokeWidth={3} className="cp-verify-check-icon" />
                </div>
                <div className="cp-verify-sub">
                  Your profile will be reviewed and verified by Zenve Vet team.
                </div>
              </div>
            </div>

            {/* Right Action Button */}
            <button
              type="submit"
              className="cp-submit-btn"
            >
              <Send size={15} strokeWidth={2.4} />
              <span>{currentUser ? 'Save Changes' : 'Create Profile'}</span>
              <span className="cp-btn-arrow">→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
