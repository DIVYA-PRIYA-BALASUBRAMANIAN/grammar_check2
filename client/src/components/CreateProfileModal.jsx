import React, { useState } from 'react';
import { X, Check, Stethoscope, Building, Award, MapPin } from 'lucide-react';
import { SPECIALTIES, STATES_INDIA } from '../data/mockData';

export function CreateProfileModal({ isOpen, onClose, onProfileCreated }) {
  const [formData, setFormData] = useState({
    name: 'Dr. ',
    specialty: 'Small Animal Medicine',
    qualification: 'BVSc & AH',
    registrationNo: '',
    clinic: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    bio: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name === 'Dr. ') {
      alert('Please enter your doctor name');
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
      experienceYears: 4,
      casesCount: 1,
      bio: formData.bio || 'Practicing veterinary surgeon and clinical care professional.',
      connectionsCount: 1
    };

    onProfileCreated(newDoctor);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-emblem" style={{ width: '32px', height: '32px' }}>
              <Stethoscope size={18} />
            </div>
            <div>
              <h3 className="modal-title">Create Your Professional Page</h3>
              <p style={{ fontSize: '12.5px', color: '#64726A' }}>Join the Doctor Vet™ verified veterinary registry</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#121A15' }}>
                Full Name with Title *
              </label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Dr. Ramesh Kumar"
                className="custom-filter-select"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#121A15' }}>
                  Primary Specialty *
                </label>
                <select 
                  className="custom-filter-select"
                  style={{ width: '100%' }}
                  value={formData.specialty}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                >
                  {SPECIALTIES.filter(s => s !== 'All specialties').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#121A15' }}>
                  Degrees & Credentials *
                </label>
                <input 
                  type="text" 
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  placeholder="e.g. BVSc & AH, MVSc"
                  className="custom-filter-select"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#121A15' }}>
                  City *
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="e.g. Chennai"
                  className="custom-filter-select"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#121A15' }}>
                  State / Region *
                </label>
                <select 
                  className="custom-filter-select"
                  style={{ width: '100%' }}
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                >
                  {STATES_INDIA.filter(s => s !== 'All states').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#121A15' }}>
                Clinic or Veterinary Hospital Name
              </label>
              <input 
                type="text" 
                value={formData.clinic}
                onChange={(e) => setFormData({...formData, clinic: e.target.value})}
                placeholder="e.g. Apollo Pet Health Center"
                className="custom-filter-select"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#121A15' }}>
                State Veterinary Council Reg. No.
              </label>
              <input 
                type="text" 
                value={formData.registrationNo}
                onChange={(e) => setFormData({...formData, registrationNo: e.target.value})}
                placeholder="e.g. KVC-84920 (for verified tick badge)"
                className="custom-filter-select"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#121A15' }}>
                Bio & Clinical Focus
              </label>
              <textarea 
                rows="3"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Briefly describe your clinical interests, surgical expertise, or caseload..."
                className="custom-filter-select"
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-submit-post"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '10px' }}
            >
              <span>Publish Verified Doctor Profile</span>
              <Check size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
