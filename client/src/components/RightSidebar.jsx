import React, { useState, useMemo } from 'react';
import { Plus, Check, ChevronRight, Globe, Users, TrendingUp, Sparkles, ArrowRight, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Avatar } from './Avatar';

export function RightSidebar({
  doctors = [],
  currentUser,
  onSelectDoctor,
  onOpenChat,
  onViewAllDoctors,
  onSendRequest,
  connectedDoctors = []
}) {
  const [connectedMap, setConnectedMap] = useState({});

  const toggleConnect = (doc) => {
    setConnectedMap(prev => ({
      ...prev,
      [doc.id]: !prev[doc.id]
    }));
    if (onSendRequest) {
      onSendRequest(doc);
    }
  };

  // Filter registered profiles: exclude current logged-in doctor
  const registeredColleagues = useMemo(() => {
    return (doctors || []).filter(doc => {
      if (!doc) return false;
      if (!currentUser) return true;
      const selfId = String(currentUser.id || '').replace('doc-', '');
      const docId = String(doc.id || '').replace('doc-', '');
      if (selfId && docId && selfId === docId) return false;
      if (doc.email && currentUser.email && doc.email.toLowerCase() === currentUser.email.toLowerCase()) return false;
      if (doc.name && currentUser.name && doc.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === currentUser.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim()) return false;
      return true;
    });
  }, [doctors, currentUser]);

  const previewDoctors = registeredColleagues.slice(0, 5);

  return (
    <aside className="feed-right-rail">
      {/* People to Know Widget Card */}
      <div className="rail-widget-card">
        <div className="rail-widget-header">
          <span className="rail-widget-title">People to Know</span>
          <button 
            className="rail-link-view-all"
            onClick={onViewAllDoctors}
            title="Browse all registered veterinarians"
          >
            <span>View all</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="people-list-container">
          {previewDoctors.length > 0 ? (
            previewDoctors.map((doc) => {
              const isConnected = !!connectedMap[doc.id] ||
                !!connectedMap[`doc-${doc.id}`] ||
                connectedDoctors.some(c => c.id === doc.id || String(c.id).replace('doc-', '') === String(doc.id).replace('doc-', ''));

              const isDocActive = !!doc.active || (currentUser && (doc.id === currentUser.id || String(doc.id).replace('doc-', '') === String(currentUser.id).replace('doc-', '')));

              return (
                <div key={`sidebar-doc-${doc.id}`} className="people-card-row">
                  <div 
                    className="people-meta-left"
                    style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
                    onClick={() => onSelectDoctor && onSelectDoctor(doc)}
                    title={`View ${doc.name}'s profile (${isDocActive ? 'Active' : 'Inactive'})`}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <Avatar src={doc.avatar} name={doc.name} size={40} className="people-avatar-img" />
                      <span 
                        title={isDocActive ? 'Active' : 'Inactive'}
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          backgroundColor: isDocActive ? '#10b981' : '#9ca3af',
                          border: '1.5px solid #ffffff'
                        }} 
                      />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <h4 className="people-doctor-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.name}
                        </h4>
                        {doc.verified && (
                          <CheckCircle2 size={12} color="#059669" style={{ flexShrink: 0 }} />
                        )}
                      </div>
                      <p className="people-doctor-spec" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.specialty || 'Veterinary Practitioner'}
                      </p>
                      <p className="people-doctor-city" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{doc.city ? `${doc.city}, India` : 'Registered Doctor'}</span>
                        <span>·</span>
                        <span style={{
                          color: isDocActive ? '#059669' : '#9ca3af',
                          fontWeight: 600,
                          fontSize: '10.5px'
                        }}>
                          {isDocActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="people-action-btns">
                    <button
                      className={`btn-circle-add ${isConnected ? 'connected' : ''}`}
                      onClick={() => toggleConnect(doc)}
                      title={isConnected ? 'Connected with Doctor' : 'Connect with Doctor'}
                    >
                      {isConnected ? <Check size={14} /> : <Plus size={15} />}
                    </button>

                    {isConnected && (
                      <button
                        className="btn-circle-msg"
                        onClick={() => onOpenChat && onOpenChat(doc)}
                        title={`Start real-time chat with ${doc.name}`}
                      >
                        <MessageSquare size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{
              padding: '18px 14px',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '14px',
              border: '1px dashed #e5e7eb'
            }}>
              <Users size={22} color="#9ca3af" style={{ margin: '0 auto 6px auto', display: 'block' }} />
              <p style={{ margin: '0 0 4px 0', fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>
                No other registered doctors yet
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', lineHeight: 1.45 }}>
                When new doctors register on Zenve Vet, their profiles will appear here to connect & message in real time.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* The Zenve Vet Advantage Widget Card */}
      <div className="rail-widget-card">
        <div className="rail-widget-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="rail-widget-title">The Zenve Vet Advantage</span>
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
