import React from 'react';
import { X, MapPin, Building, GraduationCap, Award, MessageSquare, Check, Stethoscope } from 'lucide-react';

export function DoctorModal({ doctor, onClose, onOpenChat, isConnected, onToggleConnect }) {
  if (!doctor) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header Banner */}
        <div style={{
          height: '110px',
          background: 'linear-gradient(135deg, #0D472B 0%, #15633E 100%)',
          position: 'relative',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start'
        }}>
          <button 
            className="btn-close-modal" 
            onClick={onClose}
            style={{ color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.2)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Doctor Header Info */}
        <div style={{ padding: '0 24px 24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-45px', marginBottom: '16px' }}>
            <img 
              src={doctor.avatar} 
              alt={doctor.name} 
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                border: '4px solid #FFFFFF',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                objectFit: 'cover'
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn-create-profile"
                style={{ padding: '8px 16px', fontSize: '13px' }}
                onClick={() => {
                  onClose();
                  onOpenChat(doctor);
                }}
              >
                <MessageSquare size={15} />
                <span>Message</span>
              </button>
              <button 
                className={`btn-connect-doctor ${isConnected ? 'connected' : ''}`}
                style={{ width: '38px', height: '38px' }}
                onClick={() => onToggleConnect(doctor.id)}
              >
                {isConnected ? <Check size={18} /> : <Award size={18} />}
              </button>
            </div>
          </div>

          <div>
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#C5A059',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              {doctor.verified ? 'Verified Practitioner' : 'Credentials Not Verified'}
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '700', color: '#121A15', margin: '4px 0' }}>
              {doctor.name}
            </h2>
            <p style={{ fontSize: '15px', color: '#0D472B', fontWeight: '600', marginBottom: '4px' }}>
              {doctor.specialty}
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', color: '#64726A' }}>
              <MapPin size={14} />
              <span>{doctor.clinic} · {doctor.city}, {doctor.state}</span>
            </p>
          </div>

          <div style={{ marginTop: '20px', borderTop: '1px solid #E5E9E5', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64726A', marginBottom: '8px' }}>
              Professional Background
            </h4>
            <p style={{ fontSize: '14.5px', color: '#344038', lineHeight: '1.6' }}>
              {doctor.bio}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginTop: '18px' }}>
            <div style={{ padding: '12px 14px', backgroundColor: '#F8F9FA', borderRadius: '8px', border: '1px solid #EDF1ED' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64726A', fontSize: '12px', marginBottom: '4px' }}>
                <GraduationCap size={15} />
                <span>Qualification</span>
              </div>
              <strong style={{ fontSize: '13.5px', color: '#121A15' }}>{doctor.qualification}</strong>
            </div>

            <div style={{ padding: '12px 14px', backgroundColor: '#F8F9FA', borderRadius: '8px', border: '1px solid #EDF1ED' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64726A', fontSize: '12px', marginBottom: '4px' }}>
                <Stethoscope size={15} />
                <span>Clinical Experience</span>
              </div>
              <strong style={{ fontSize: '13.5px', color: '#121A15' }}>{doctor.experienceYears} Years Practice</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
