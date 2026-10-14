import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  CheckCircle2,
  PawPrint,
  ArrowRight,
  Users,
  UserPlus,
  Clock,
  Check,
  X,
  MessageSquare,
  MapPin,
  Building,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { SPECIALTIES, STATES_INDIA } from '../data/mockData';
import heroVetImg from '../assets/hero_vet_dog.jpg';
import { Avatar } from '../components/Avatar';

export function VetNetworkView({
  doctors = [],
  onSelectDoctor,
  connectedDoctors = {},
  pendingRequests = [], // received requests
  sentRequests = [],    // sent requests
  onSendRequest,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
  onDisconnect,
  onOpenChat,
  currentUser
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All specialties');
  const [selectedState, setSelectedState] = useState('All states');
  const [activeTab, setActiveTab] = useState('grow'); // 'grow' | 'pending' | 'connections'

  // Connected doctor IDs
  const connectedIds = new Set(
    Object.keys(connectedDoctors).filter(id => connectedDoctors[id])
  );

  // Sent pending doctor IDs
  const sentPendingIds = new Set(
    sentRequests.map(r => r.receiverId?.toString() || r.id?.toString())
  );

  const filteredDoctors = doctors.filter(doc => {
    if (currentUser && doc.id === currentUser.id) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match = doc.name.toLowerCase().includes(q) ||
        doc.specialty.toLowerCase().includes(q) ||
        (doc.city && doc.city.toLowerCase().includes(q)) ||
        (doc.clinic && doc.clinic.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedSpecialty !== 'All specialties' && doc.specialty !== selectedSpecialty) return false;
    if (selectedState !== 'All states' && doc.state !== selectedState) return false;
    return true;
  });

  const myConnectedDoctors = filteredDoctors.filter(d => connectedIds.has(d.id.toString()) || connectedIds.has(d.id));
  const suggestedDoctors = filteredDoctors.filter(d => !connectedIds.has(d.id.toString()) && !connectedIds.has(d.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Hero Banner */}
      <div className="cases-hero-banner-light" style={{ padding: '24px 28px', borderRadius: '16px' }}>
        <div className="hero-banner-inner">
          <div className="hero-text-content">
            <span className="hero-tag-kicker">Veterinary Network</span>
            <h1 className="hero-headline" style={{ fontSize: '28px', margin: '4px 0 8px 0' }}>
              Connect with India's Veterinary Specialists
            </h1>
            <p className="hero-subtext" style={{ fontSize: '13.5px', maxWidth: '480px' }}>
              Exchange clinical referrals, discuss complex surgeries, and build trusted relationships with peer practitioners.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#065F46', fontWeight: 600 }}>
                <Users size={16} />
                <span>{connectedIds.size} Connected Doctors</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#065F46', fontWeight: 600 }}>
                <Clock size={16} />
                <span>{pendingRequests.length} Pending Invitations</span>
              </div>
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

      {/* 2. Received Invitations / Pending Requests Card */}
      {pendingRequests.length > 0 && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          padding: '18px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} color="#003822" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                Invitations ({pendingRequests.length})
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
              Veterinarians requesting to join your network
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '10px',
                  border: '1px solid #F3F4F6',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar
                    src={req.senderAvatar}
                    name={req.senderName}
                    size={48}
                    style={{ border: '2px solid #E5E7EB', flexShrink: 0 }}
                  />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                      {req.senderName}
                    </h4>
                    <p style={{ margin: '1px 0 0 0', fontSize: '12.5px', color: '#059669', fontWeight: 600 }}>
                      {req.senderSpecialty || 'Veterinary Practitioner'}
                    </p>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>
                      ✦ Mutual connection via Bengaluru Veterinary Association
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onAcceptRequest && onAcceptRequest(req.id)}
                    style={{
                      backgroundColor: '#003822',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '7px 18px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Check size={14} />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => onRejectRequest && onRejectRequest(req.id)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#6B7280',
                      border: '1px solid #D1D5DB',
                      borderRadius: '9999px',
                      padding: '7px 14px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Ignore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Sent Pending Requests Strip */}
      {sentRequests.length > 0 && (
        <div style={{
          backgroundColor: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12.5px'
        }}>
          <span style={{ color: '#4B5563' }}>
            <strong>{sentRequests.length}</strong> connection request(s) waiting for response from peers.
          </span>
          <span style={{ color: '#059669', fontWeight: 600, cursor: 'pointer' }}>
            Manage Sent ({sentRequests.length})
          </span>
        </div>
      )}

      {/* 4. Filter Tabs & Search Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#FFFFFF',
        padding: '16px 20px',
        borderRadius: '14px',
        border: '1px solid #E5E7EB'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {/* Sub tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('grow')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'grow' ? '#E8F3ED' : '#F3F4F6',
                color: activeTab === 'grow' ? '#003822' : '#6B7280'
              }}
            >
              Discover & Connect ({suggestedDoctors.length})
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'connections' ? '#E8F3ED' : '#F3F4F6',
                color: activeTab === 'connections' ? '#003822' : '#6B7280'
              }}
            >
              My Connections ({myConnectedDoctors.length})
            </button>
          </div>

          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
            {activeTab === 'grow' ? `${suggestedDoctors.length} Suggested Specialists` : `${myConnectedDoctors.length} Verified Peers`}
          </span>
        </div>

        {/* Search & Select Controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            flex: '1.4',
            minWidth: '220px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '9999px',
            padding: '7px 16px'
          }}>
            <Search size={15} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search by name, specialty, hospital or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                paddingLeft: '10px',
                fontSize: '13px',
                color: '#111827'
              }}
            />
          </div>

          <select
            className="pill-select-control"
            style={{ flex: 1, minWidth: '150px' }}
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            className="pill-select-control"
            style={{ flex: 1, minWidth: '140px' }}
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            {STATES_INDIA.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* 5. Doctor Cards Grid  */}
      {((activeTab === 'grow' ? suggestedDoctors : myConnectedDoctors).length === 0) ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB'
        }}>
          <Users size={40} color="#059669" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
            {activeTab === 'connections' ? 'No Connected Peers Yet' : 'No Other Doctors Found'}
          </h3>
          <p style={{ fontSize: '13px', color: '#6B7280', maxWidth: '380px', margin: '0 auto' }}>
            {activeTab === 'connections'
              ? 'Send connection requests to fellow veterinarians to grow your professional clinical network.'
              : 'As other veterinary practitioners register their profiles, they will appear here for you to connect with.'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          {(activeTab === 'grow' ? suggestedDoctors : myConnectedDoctors).map((doc) => {
            const isConnected = connectedIds.has(doc.id.toString()) || connectedIds.has(doc.id);
            const isPending = sentPendingIds.has(doc.id.toString()) || sentPendingIds.has(doc.id);

            return (
              <div
                key={doc.id}
                className="doctor-card"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* Cover Gradient Banner */}
                <div style={{
                  height: '70px',
                  background: 'linear-gradient(135deg, #003822 0%, #05633C 100%)',
                  position: 'relative',
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <PawPrint size={18} color="rgba(255,255,255,0.3)" />
                  <span style={{ fontSize: '10.5px', color: '#D1FAE5', fontWeight: 600 }}>
                    {doc.city || 'India'}
                  </span>
                </div>

                {/* Avatar with Verified checkmark */}
                <div style={{ marginTop: '-36px', marginLeft: '16px', position: 'relative', width: '64px', height: '64px' }}>
                  <Avatar
                    src={doc.avatar}
                    name={doc.name}
                    size={64}
                    fontSize={26}
                    style={{
                      border: '3px solid #FFFFFF',
                      backgroundColor: '#F3F4F6',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  {doc.verified && (
                    <CheckCircle2
                      size={16}
                      color="#00a86b"
                      fill="#FFFFFF"
                      style={{ position: 'absolute', bottom: '2px', right: '0px' }}
                    />
                  )}
                </div>

                {/* Card Body */}
                <div style={{ padding: '8px 16px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3
                    onClick={() => onSelectDoctor && onSelectDoctor(doc)}
                    style={{
                      margin: '0 0 2px 0',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#111827',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#059669'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#111827'}
                  >
                    {doc.name}
                  </h3>

                  <p style={{ margin: '0 0 4px 0', fontSize: '12.5px', color: '#003822', fontWeight: 600 }}>
                    {doc.specialty}
                  </p>

                  <p style={{ margin: '0 0 8px 0', fontSize: '11.5px', color: '#6B7280', lineHeight: 1.3 }}>
                    {doc.clinic || 'Specialty Veterinary Hospital'} · {doc.state || 'India'}
                  </p>

                  {/* Mutual Connection Tag */}
                  <div style={{
                    padding: '4px 8px',
                    backgroundColor: '#F8FBF9',
                    borderRadius: '6px',
                    border: '1px solid #E8F3ED',
                    fontSize: '10.5px',
                    color: '#065F46',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>✦ 4 mutual peer connections</span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => onOpenChat && onOpenChat(doc)}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            backgroundColor: '#003822',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '9999px',
                            padding: '7px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <MessageSquare size={13} />
                          <span>Message</span>
                        </button>
                        <button
                          onClick={() => onDisconnect && onDisconnect(doc.id)}
                          title="Remove connection"
                          style={{
                            backgroundColor: '#F3F4F6',
                            color: '#6B7280',
                            border: '1px solid #E5E7EB',
                            borderRadius: '9999px',
                            padding: '7px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Check size={13} color="#059669" />
                        </button>
                      </>
                    ) : isPending ? (
                      <button
                        onClick={() => onCancelRequest && onCancelRequest(doc.id)}
                        style={{
                          width: '100%',
                          backgroundColor: '#F3F4F6',
                          color: '#4B5563',
                          border: '1px solid #D1D5DB',
                          borderRadius: '9999px',
                          padding: '7px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <Clock size={13} />
                        <span>Pending · Withdraw</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onSendRequest && onSendRequest(doc)}
                        style={{
                          width: '100%',
                          backgroundColor: '#FFFFFF',
                          color: '#003822',
                          border: '1.5px solid #003822',
                          borderRadius: '9999px',
                          padding: '7px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#003822';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                          e.currentTarget.style.color = '#003822';
                        }}
                      >
                        <UserPlus size={14} />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
