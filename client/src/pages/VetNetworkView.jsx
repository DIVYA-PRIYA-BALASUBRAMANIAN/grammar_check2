import React, { useState } from 'react';
import { Search, ChevronDown, CheckCircle2, PawPrint, ArrowRight } from 'lucide-react';
import { DoctorCard } from '../components/DoctorCard';
import { SPECIALTIES, STATES_INDIA } from '../data/mockData';
import heroVetImg from '../assets/hero_vet_dog.jpg';

export function VetNetworkView({ 
  doctors = [], 
  onSelectDoctor, 
  connectedDoctors = {}, 
  onToggleConnect 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All specialties');
  const [selectedState, setSelectedState] = useState('All states');
  const [selectedAudience, setSelectedAudience] = useState('Everyone');

  const filteredDoctors = doctors.filter(doc => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match = doc.name.toLowerCase().includes(q) || 
                    doc.specialty.toLowerCase().includes(q) || 
                    doc.city.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedSpecialty !== 'All specialties' && doc.specialty !== selectedSpecialty) return false;
    if (selectedState !== 'All states' && doc.state !== selectedState) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Light Hero Banner with Veterinarian & Retriever matching website UI */}
      <div className="cases-hero-banner-light">
        <div className="hero-banner-inner">
          <div className="hero-text-content">
            <span className="hero-tag-kicker">A Community Without Boundaries</span>
            <h1 className="hero-headline">Find your kind of brilliant.</h1>
            <p className="hero-subtext">
              Veterinary perspectives from every corner of India. Connect with leading specialists and peers.
            </p>
            <div className="btn-make-mark-link">
              <span>Explore Verified Network</span>
              <ArrowRight size={15} />
            </div>
          </div>

          <div className="hero-photo-wrap">
            <PawPrint size={90} className="hero-paw-watermark" style={{ color: 'rgba(0, 56, 34, 0.12)' }} />
            <img 
              src={heroVetImg} 
              alt="Veterinarian with dog" 
              className="hero-photo-img" 
            />
          </div>
        </div>
      </div>

      {/* 2. Search & Pill Filters Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {/* Search input with lens icon */}
        <div style={{
          flex: '1.4',
          minWidth: '220px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '9999px',
          padding: '7px 16px'
        }}>
          <Search size={16} color="#6b7280" />
          <input 
            type="text" 
            placeholder="Name, specialty or city"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              paddingLeft: '10px',
              fontSize: '13.5px',
              color: '#111827'
            }}
          />
        </div>

        {/* Specialty pill filter */}
        <select 
          className="pill-select-control"
          style={{ flex: 1, minWidth: '150px' }}
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
        >
          {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* State pill filter */}
        <select 
          className="pill-select-control"
          style={{ flex: 1, minWidth: '130px' }}
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
        >
          {STATES_INDIA.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Audience filter */}
        <select 
          className="pill-select-control"
          style={{ minWidth: '120px' }}
          value={selectedAudience}
          onChange={(e) => setSelectedAudience(e.target.value)}
        >
          <option value="Everyone">Everyone</option>
          <option value="Verified only">Verified only</option>
          <option value="Surgeons">Surgeons</option>
        </select>
      </div>

      {/* 3. Section Title & Verification Note */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2px 0'
      }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: '700',
          color: '#111827'
        }}>
          Professional pages
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: '500',
          color: '#4b5563'
        }}>
          <span>Verified veterinary practitioners & clinical members</span>
          <CheckCircle2 size={16} fill="#003822" color="#ffffff" />
        </div>
      </div>

      {/* 4. Doctor Grid (3 columns, rectangular cover photos) */}
      <div className="network-doctor-grid">
        {filteredDoctors.map(doctor => (
          <DoctorCard 
            key={doctor.id}
            doctor={doctor}
            onSelect={onSelectDoctor}
            isConnected={!!connectedDoctors[doctor.id]}
            onToggleConnect={onToggleConnect}
          />
        ))}
      </div>
    </div>
  );
}
