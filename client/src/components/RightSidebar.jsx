import React, { useState } from 'react';
import { Plus, Check, ChevronRight, Globe, Users, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

export function RightSidebar({ doctors = [], onSelectDoctor, onViewAllDoctors }) {
  const [connectedMap, setConnectedMap] = useState({});

  const toggleConnect = (docId) => {
    setConnectedMap(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const previewDoctors = doctors.slice(1, 4);

  return (
    <aside className="feed-right-rail">
      {/* People to Know Widget Card */}
      <div className="rail-widget-card">
        <div className="rail-widget-header">
          <span className="rail-widget-title">People to Know</span>
          <button 
            className="rail-link-view-all"
            onClick={onViewAllDoctors}
          >
            <span>View all</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="people-list-container">
          {previewDoctors.map((doc) => {
            const isConnected = !!connectedMap[doc.id];
            return (
              <div key={doc.id} className="people-card-row">
                <div 
                  className="people-meta-left"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectDoctor && onSelectDoctor(doc)}
                >
                  <img src={doc.avatar} alt={doc.name} className="people-avatar-img" />
                  <div>
                    <h4 className="people-doctor-name">{doc.name}</h4>
                    <p className="people-doctor-spec">{doc.specialty}</p>
                    <p className="people-doctor-city">{doc.city}</p>
                  </div>
                </div>

                <button
                  className={`btn-circle-add ${isConnected ? 'connected' : ''}`}
                  onClick={() => toggleConnect(doc.id)}
                  title={isConnected ? 'Connected' : 'Connect with Doctor'}
                >
                  {isConnected ? <Check size={15} /> : <Plus size={16} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* The Doctor Vet Advantage Widget Card */}
      <div className="rail-widget-card">
        <div className="rail-widget-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="rail-widget-title">The Doctor Vet Advantage</span>
            <Sparkles size={14} color="#d97706" />
          </div>
        </div>

        <div className="advantage-items-group">
          {/* Card 1: Your own professional page */}
          <div className="advantage-single-row" onClick={onViewAllDoctors}>
            <div className="advantage-icon-circle gold">
              <Globe size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 className="advantage-title-text">Your own professional page</h4>
              <p className="advantage-desc-text">A place for your work, your voice, your professional identity.</p>
            </div>
            <ChevronRight size={15} color="#9ca3af" style={{ alignSelf: 'center' }} />
          </div>

          {/* Card 2: Meaningful connections */}
          <div className="advantage-single-row" onClick={onViewAllDoctors}>
            <div className="advantage-icon-circle teal">
              <Users size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 className="advantage-title-text">Meaningful connections</h4>
              <p className="advantage-desc-text">Discover peers beyond your clinic and your city.</p>
            </div>
            <ChevronRight size={15} color="#9ca3af" style={{ alignSelf: 'center' }} />
          </div>

          {/* Card 3: Grow with possibility */}
          <div className="advantage-single-row">
            <div className="advantage-icon-circle purple">
              <TrendingUp size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 className="advantage-title-text">Grow with possibility</h4>
              <p className="advantage-desc-text">Mentorship, research and innovation pathways.</p>
            </div>
            <ChevronRight size={15} color="#9ca3af" style={{ alignSelf: 'center' }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
