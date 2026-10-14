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
  Heart
} from 'lucide-react';
import modalPetsImg from '../assets/modal_pets_header.jpg';
import { SPECIALTIES, STATES_INDIA } from '../data/mockData';

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

export function CreateProfileModal({ isOpen, onClose, onProfileCreated }) {
  const [formData, setFormData] = useState({
    name: 'Dr. ',
    specialty: 'Small Animal Medicine',
    qualification: 'BVSc & AH',
    city: 'Bengaluru',
    state: 'Karnataka',
    clinic: '',
    registrationNo: '',
    bio: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.trim() === 'Dr.') {
      alert('Please enter your full doctor name');
      return;
    }

    const newDoctor = {
      id: `doc-${Date.now()}`,
      name: formData.name,
      specialty: formData.specialty,
      city: formData.city,
      state: formData.state,
      avatar: 'https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80',
      verified: true,
      qualification: formData.qualification,
      clinic: formData.clinic || `${formData.city} Veterinary Clinic`,
      experienceYears: 5,
      casesCount: 1,
      bio: formData.bio || 'Practicing veterinary surgeon and clinical care professional.',
      connectionsCount: 1
    };

    onProfileCreated && onProfileCreated(newDoctor);
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
              <h2 className="create-profile-title">Create Your Professional Page</h2>
              <div className="create-profile-title-bar" />
              <p className="create-profile-subtitle">Join the Zenve Vet verified veterinary registry</p>
            </div>
          </div>

          {/* Right Pets Banner Illustration with Floating Badges */}
          <div className="create-profile-pets-banner">
            <div className="pets-banner-backdrop" />
            
            {/* Floating Badge 1: Stethoscope/Heart in Blue */}
            <div className="floating-badge badge-heart" title="Compassionate Veterinary Care">
              <Heart size={13} fill="#ffffff" color="#ffffff" />
            </div>

            {/* Floating Badge 2: Paw in Mint */}
            <div className="floating-badge badge-paw" title="Pet Health & Medicine">
              <PawPrint size={13} fill="#ffffff" color="#ffffff" />
            </div>

            {/* Dog & Cat Duo Image */}
            <img 
              src={modalPetsImg} 
              alt="Golden retriever and tabby cat" 
              className="create-profile-pets-img" 
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* FORM BODY: 8 Structured Input Groups with Badges          */}
        {/* ========================================================= */}
        <form onSubmit={handleSubmit} className="create-profile-form">
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
              <span>Create Profile</span>
              <span className="cp-btn-arrow">→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
