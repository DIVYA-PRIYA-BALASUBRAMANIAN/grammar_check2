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
  connectedDoctors = [],
  communities = [],
  onOpenCommunity,
  onOpenCreateCommunity
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
                <div key={doc.id} className="people-card-row">
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

      {/* Vet Communities Widget Card */}
      <div className="rail-widget-card">
        <div className="rail-widget-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="rail-widget-title">Vet Communities</span>
            <span className="comm-widget-count-badge">{(communities || []).length}</span>
          </div>
          <button
            className="rail-link-view-all"
            onClick={() => onOpenCreateCommunity ? onOpenCreateCommunity() : (onOpenCommunity && onOpenCommunity())}
            title="Start a new veterinary community"
          >
            <Plus size={13} />
            <span>Create</span>
          </button>
        </div>

        <div className="comm-widget-list">
          {(communities || []).length > 0 ? (
            (communities || []).slice(0, 3).map((comm) => {
              return (
                <div
                  key={comm.id}
                  className="comm-widget-card-item"
                  onClick={() => onOpenCommunity && onOpenCommunity(comm.id)}
                >
                  <div
                    className="comm-widget-avatar-badge"
                    style={{ background: comm.coverGradient || '#064e3b' }}
                  >
                    <Users size={16} color="#ffffff" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 className="comm-widget-title-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {comm.name}
                    </h4>
                    <p className="comm-widget-desc-text">
                      <span>{comm.category}</span>
                      <span> · </span>
                      <span>{comm.members?.length || 1} members</span>
                    </p>
                  </div>

                  <ChevronRight size={15} color="#9ca3af" style={{ alignSelf: 'center', flexShrink: 0 }} />
                </div>
              );
            })
          ) : (
            <div style={{
              padding: '16px 12px',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              border: '1px dashed #e5e7eb'
            }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                No active communities yet
              </p>
              <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#6b7280', lineHeight: 1.4 }}>
                Create the first specialty group to collaborate with peers.
              </p>
              <button
                type="button"
                onClick={() => onOpenCreateCommunity ? onOpenCreateCommunity() : (onOpenCommunity && onOpenCommunity())}
                style={{
                  backgroundColor: '#003822',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Start Community
              </button>
            </div>
          )}
        </div>

        <button
          className="comm-widget-explore-btn"
          onClick={() => onOpenCommunity && onOpenCommunity()}
        >
          <span>Explore All Groups & Discussions</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </aside>
  );
}
