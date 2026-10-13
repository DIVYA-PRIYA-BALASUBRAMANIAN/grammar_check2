import React from 'react';
import { MapPin, ExternalLink, Plus, Check, ShieldCheck } from 'lucide-react';

export function DoctorCard({ doctor, onSelect, isConnected, onToggleConnect }) {
  return (
    <div className="network-doctor-card" id={`doctor-card-${doctor.id}`}>
      {/* 1. Card Top Cover Image with City Pill Badge */}
      <div className="doctor-card-cover-wrap">
        <img 
          src={doctor.avatar} 
          alt={doctor.name} 
          className="doctor-card-cover-img"
          loading="lazy"
        />
        <div className="doctor-city-overlay-pill">
          <MapPin size={11} />
          <span>{doctor.city}</span>
        </div>
      </div>

      {/* 2. Card Content Body */}
      <div className="doctor-card-content">
        {/* Verified Practitioner Badge */}
        <div className="badge-verified-practitioner">
          <ShieldCheck size={12} strokeWidth={2.4} />
          <span>VERIFIED PRACTITIONER</span>
        </div>

        {/* Doctor Name & Specialty */}
        <h3 className="doctor-card-fullname">{doctor.name}</h3>
        <p className="doctor-card-spec-text">{doctor.specialty}</p>

        {/* Location Row with Map Pin */}
        <div className="doctor-card-location-row">
          <MapPin size={12} color="#6b7280" />
          <span>{doctor.city}, {doctor.state}</span>
        </div>

        {/* Action Buttons: Mint 'View page' Pill + Dark Emerald Square '+' */}
        <div className="doctor-card-footer-actions">
          <button 
            className="btn-view-page-mint"
            onClick={() => onSelect(doctor)}
          >
            <span>View page</span>
            <ExternalLink size={12} />
          </button>

          <button 
            className={`btn-add-connect-square ${isConnected ? 'connected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleConnect(doctor.id);
            }}
            title={isConnected ? 'Connected' : 'Connect with Doctor'}
          >
            {isConnected ? <Check size={15} /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
