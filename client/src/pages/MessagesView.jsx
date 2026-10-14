import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Send,
  Paperclip,
  CheckCheck,
  ChevronRight,
  User,
  ShieldCheck,
  Image as ImageIcon,
  X,
  Lock,
  MessageSquare,
  ArrowRight,
  UserCheck,
  Sparkles,
  Shield
} from 'lucide-react';
import { Avatar } from '../components/Avatar';

export function MessagesView({
  conversations = [],
  activeChatDoctor = null,
  onSelectConversation,
  onSendMessage,
  onOpenDoctorProfile,
  currentUser = null,
  doctors = [],
  connectedDoctors = [],
  onOpenLogin,
  onNavigateTab,
  onOpenCreateProfile
}) {
  const [messageText, setMessageText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [searchPersonQuery, setSearchPersonQuery] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeChatDoctor]);

  // =========================================================================
  // 1. SIGNED-OUT STATE: SECURE GATE
  // =========================================================================
  if (!currentUser) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 'calc(100vh - 130px)',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 4px 24px rgba(0, 45, 25, 0.04)',
        border: '1px solid #E5E7EB',
        padding: '50px 24px',
        boxSizing: 'border-box',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '640px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Branded Security Lock Icon */}
          <div style={{
            position: 'relative',
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #003822 0%, #0D4B2D 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0, 56, 34, 0.22)',
            marginBottom: '22px'
          }}>
            <Lock size={38} color="#A7F3D0" strokeWidth={2.2} />
            <span style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              backgroundColor: '#10B981',
              borderRadius: '50%',
              padding: '6px',
              border: '3px solid #FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={14} color="#FFFFFF" strokeWidth={2.5} />
            </span>
          </div>

          {/* Privacy Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: '9999px',
            backgroundColor: '#EDF8F2',
            border: '1px solid #A4DFBE',
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#0B6B3F',
            marginBottom: '14px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            <ShieldCheck size={14} color="#0B6B3F" />
            <span>End-to-End Encrypted Doctor Communications</span>
          </div>

          {/* Main Headline */}
          <h2 style={{
            margin: '0 0 12px 0',
            fontSize: '28px',
            fontWeight: 800,
            color: '#111827',
            letterSpacing: '-0.02em',
            lineHeight: 1.25
          }}>
            Sign in to view your messages & consultations
          </h2>

          {/* Subtext */}
          <p style={{
            margin: '0 0 28px 0',
            fontSize: '14.5px',
            color: '#4B5563',
            lineHeight: 1.6,
            maxWidth: '560px'
          }}>
            Direct clinical peer discussions, surgical consults, and diagnostic scans are strictly private to authenticated veterinary professionals.
          </p>

          {/* 3 Pillar Value Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px',
            width: '100%',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              padding: '16px 14px',
              textAlign: 'left'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EDF8F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <MessageSquare size={17} color="#0D4B2D" />
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                Peer Consults
              </h4>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#6B7280', lineHeight: 1.45 }}>
                Direct 1-on-1 consultations with veterinary surgeons & specialists.
              </p>
            </div>

            <div style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              padding: '16px 14px',
              textAlign: 'left'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EDF8F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <ImageIcon size={17} color="#0D4B2D" />
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                Case Scans
              </h4>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#6B7280', lineHeight: 1.45 }}>
                Share radiographs, ECG strips, and histopathology files safely.
              </p>
            </div>

            <div style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              padding: '16px 14px',
              textAlign: 'left'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EDF8F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <Users size={17} color="#0D4B2D" />
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                Verified Network
              </h4>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#6B7280', lineHeight: 1.45 }}>
                Chat exclusively with verified veterinary professionals and alumni.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <button
              onClick={() => onOpenLogin && onOpenLogin()}
              style={{
                backgroundColor: '#003822',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '13px 32px',
                fontSize: '14.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 56, 34, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0D4B2D';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#003822';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Sign In to Zenve Vet</span>
              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => onOpenCreateProfile ? onOpenCreateProfile() : onOpenLogin && onOpenLogin()}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#003822',
                border: '1.5px solid #003822',
                borderRadius: '9999px',
                padding: '12px 26px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0FDF4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <UserCheck size={16} />
              <span>Join as a Doctor</span>
            </button>
          </div>

          {/* Demo Login Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 18px',
            backgroundColor: '#EDF8F2',
            border: '1px solid #A4DFBE',
            borderRadius: '14px',
            maxWidth: '540px'
          }}>
            <Sparkles size={16} color="#0B7A48" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '12px', color: '#0B6B3F', textAlign: 'left', lineHeight: 1.45 }}>
              <strong>Quick Demo:</strong> Use 1-click Demo Accounts (Dr. Arjun Mehta or Dr. Ananya Sharma) on the Sign In page to test real-time peer messaging.
            </p>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED STATE: FULL PEER CONSULTATION EXPERIENCE
  // =========================================================================

  // Resolve user's actual connections strictly - enriched with live doctor catalog
  const userConnections = useMemo(() => {
    return (connectedDoctors || []).map(p => {
      const fresh = (doctors || []).find(d =>
        d.id === p.id ||
        String(d.id).replace('doc-', '') === String(p.id).replace('doc-', '') ||
        (d.name && p.name && d.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === p.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
      );
      return fresh ? { ...p, ...fresh, avatar: fresh.avatar || p.avatar } : p;
    });
  }, [connectedDoctors, doctors]);

  // Filter connected people by search query
  const filteredPeople = userConnections.filter(p => {
    if (!searchPersonQuery.trim()) return true;
    const q = searchPersonQuery.toLowerCase();
    return (p.name && p.name.toLowerCase().includes(q)) ||
      (p.specialty && p.specialty.toLowerCase().includes(q)) ||
      (p.city && p.city.toLowerCase().includes(q));
  });

  // Selected conversation strictly belonging to this user
  const selectedConv = conversations.find(c =>
    activeChatDoctor && (c.doctor?.id === activeChatDoctor.id || c.doctor?.name === activeChatDoctor.name)
  ) || (conversations.length > 0 ? conversations[0] : null);

  // Active doctor peer for consultation - dynamically resolved from live doctor catalog
  const rawDoctor = activeChatDoctor || selectedConv?.doctor || null;
  const currentDoctor = useMemo(() => {
    if (!rawDoctor) return null;
    const fresh = (doctors || []).find(d =>
      d.id === rawDoctor.id ||
      String(d.id).replace('doc-', '') === String(rawDoctor.id).replace('doc-', '') ||
      (d.name && rawDoctor.name && d.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === rawDoctor.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
    );
    return fresh ? { ...rawDoctor, ...fresh, avatar: fresh.avatar || rawDoctor.avatar } : rawDoctor;
  }, [rawDoctor, doctors]);

  // Active chat message stream (strictly from user's selected conversation)
  const chatMessages = selectedConv?.messages || [];

  // Handle Send
  const handleSend = (e) => {
    e?.preventDefault();
    if (!messageText.trim() && !attachmentUrl) return;

    if (onSendMessage) {
      onSendMessage({
        conversationId: selectedConv?.id || `chat-${currentDoctor?.id || Date.now()}`,
        receiverId: currentDoctor?.id || 1,
        text: messageText.trim(),
        attachmentUrl: attachmentUrl || null,
        attachmentType: attachmentUrl ? 'image' : null
      });
    }

    setMessageText('');
    setAttachmentUrl('');
  };

  // Handle File Change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachmentUrl(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Clinical Prompts
  const quickPrompts = [
    "Could you review this radiograph scan?",
    "Available for a quick surgical case consult?",
    "Sharing the lab biopsy report for this patient."
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      width: '100%',
      height: 'calc(100vh - 100px)',
      minHeight: '620px',
      boxSizing: 'border-box'
    }}>
      {/* ======================================================== */}
      {/* 1. CENTER: ACTIVE CHAT CONTAINER                         */}
      {/* ======================================================== */}
      <div style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 4px 20px rgba(0, 45, 25, 0.04)',
        border: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {currentDoctor ? (
          <>
            {/* Chat Header Bar */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #F3F4F6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF'
            }}>
              {/* Doctor Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ position: 'relative', width: '46px', height: '46px' }}>
                  <Avatar
                    src={currentDoctor.avatar}
                    name={currentDoctor.name}
                    size={46}
                    fontSize={18}
                  />
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '11px',
                    height: '11px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    border: '2px solid #FFFFFF'
                  }} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '16.5px',
                      fontWeight: 700,
                      color: '#111827'
                    }}>
                      {currentDoctor.name}
                    </h3>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      display: 'inline-block'
                    }} />
                  </div>
                  <p style={{
                    margin: '2px 0 0 0',
                    fontSize: '12px',
                    color: '#059669',
                    fontWeight: 600
                  }}>
                    {currentDoctor.specialty || 'Veterinary Practitioner'} · Active Now
                  </p>
                </div>
              </div>

              {/* Header Action: Profile Button */}
              <button
                onClick={() => onOpenDoctorProfile && onOpenDoctorProfile(currentDoctor)}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  border: '1px solid #E5E7EB',
                  borderRadius: '9999px',
                  padding: '7px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <User size={15} color="#4B5563" />
                <span>Profile</span>
              </button>
            </div>

            {/* Chat Messages Stream */}
            <div style={{
              flex: 1,
              padding: '16px 28px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backgroundColor: '#FFFFFF'
            }}>
              {/* Verified Peer Consultation Pill Badge */}
              <div style={{
                textAlign: 'center',
                margin: '4px auto 10px auto',
                padding: '7px 20px',
                backgroundColor: '#EDF8F2',
                border: '1px solid #A4DFBE',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0B6B3F',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 1px 4px rgba(11, 107, 63, 0.04)'
              }}>
                <ShieldCheck size={15} color="#0B7A48" />
                <span>Verified Peer Consultation · Direct Doctor-to-Doctor Messaging</span>
              </div>

              {/* Message Stream */}
              {chatMessages.map((msg) => {
                const isMe = msg.sender === 'user' || msg.sender === 'me' || msg.senderId === (currentUser?.id || 1);

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-start',
                      gap: '10px',
                      maxWidth: '100%'
                    }}
                  >
                    {/* Doctor Avatar on the left for received messages */}
                    {!isMe && (
                      <div style={{ position: 'relative', flexShrink: 0, marginTop: '2px' }}>
                        <Avatar
                          src={currentDoctor.avatar}
                          name={currentDoctor.name}
                          size={34}
                          fontSize={13}
                        />
                        <span style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          backgroundColor: '#10B981',
                          border: '1.5px solid #FFFFFF'
                        }} />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div style={{
                      maxWidth: isMe ? '68%' : '72%',
                      backgroundColor: isMe ? '#0D4B2D' : '#F8FAF9',
                      color: isMe ? '#FFFFFF' : '#1F2937',
                      borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      padding: '13px 20px',
                      border: isMe ? 'none' : '1px solid #ECEFEF',
                      boxShadow: isMe ? '0 2px 8px rgba(13, 75, 45, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)'
                    }}>
                      {/* Attached Image if any */}
                      {msg.attachmentUrl && (
                        <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
                          <img
                            src={msg.attachmentUrl}
                            alt="Clinical Radiograph / Photo"
                            style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                      )}

                      <p style={{
                        margin: 0,
                        fontSize: '13.5px',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {msg.text}
                      </p>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px',
                        marginTop: '5px',
                        fontSize: '10.5px',
                        color: isMe ? 'rgba(255, 255, 255, 0.75)' : '#9CA3AF'
                      }}>
                        <span>{msg.time || '10:45 AM'}</span>
                        {isMe && <CheckCheck size={13} color="#A7F3D0" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Consultation Prompt Chips */}
            <div style={{
              padding: '6px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #F9FAFB'
            }}>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessageText(prompt)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '9999px',
                    padding: '7px 16px',
                    fontSize: '11.5px',
                    color: '#4B5563',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10B981';
                    e.currentTarget.style.backgroundColor = '#F0FDF4';
                    e.currentTarget.style.color = '#065F46';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.color = '#4B5563';
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Attachment preview if image chosen */}
            {attachmentUrl && (
              <div style={{
                margin: '4px 24px',
                padding: '8px 14px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={16} color="#059669" />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#065F46' }}>
                    Clinical image attached
                  </span>
                </div>
                <button
                  onClick={() => setAttachmentUrl('')}
                  style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Bottom Message Input Bar */}
            <form onSubmit={handleSend} style={{
              padding: '12px 24px 20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#FFFFFF'
            }}>
              {/* File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />

              {/* Attachment Paperclip Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach Radiograph, Scan or Case Photo"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4B5563',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0D4B2D';
                  e.currentTarget.style.color = '#0D4B2D';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.color = '#4B5563';
                }}
              >
                <Paperclip size={18} style={{ transform: 'rotate(-45deg)' }} />
              </button>

              {/* Message Input Field */}
              <input
                type="text"
                placeholder={`Message ${currentDoctor?.name || 'Doctor'}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '13px 22px',
                  borderRadius: '9999px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#F9FAFB',
                  fontSize: '13.5px',
                  color: '#111827',
                  outline: 'none',
                  transition: 'border-color 0.15s ease, background-color 0.15s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0D4B2D';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                }}
              />

              {/* Send Circular Button */}
              <button
                type="submit"
                disabled={!messageText.trim() && !attachmentUrl}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: (!messageText.trim() && !attachmentUrl) ? '#E5E7EB' : '#0D4B2D',
                  color: (!messageText.trim() && !attachmentUrl) ? '#9CA3AF' : '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (!messageText.trim() && !attachmentUrl) ? 'default' : 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  boxShadow: (!messageText.trim() && !attachmentUrl) ? 'none' : '0 4px 12px rgba(13, 75, 45, 0.25)'
                }}
                onMouseEnter={(e) => {
                  if (messageText.trim() || attachmentUrl) {
                    e.currentTarget.style.backgroundColor = '#083B24';
                    e.currentTarget.style.transform = 'scale(1.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (messageText.trim() || attachmentUrl) {
                    e.currentTarget.style.backgroundColor = '#0D4B2D';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <Send size={17} style={{ marginLeft: '2px' }} />
              </button>
            </form>
          </>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#EDF8F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <MessageSquare size={28} color="#0D4B2D" />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              Start a Peer Consultation
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#6B7280', maxWidth: '400px', lineHeight: 1.5 }}>
              Select a colleague from Connected People on the right to start messaging, or explore the network to find veterinary specialists.
            </p>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('network')}
                style={{
                  backgroundColor: '#003822',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '10px 24px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Find Veterinary Doctors
              </button>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. RIGHT: CONNECTED PEOPLE SIDEBAR                       */}
      {/* ======================================================== */}
      <aside style={{
        width: '340px',
        minWidth: '340px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 4px 20px rgba(0, 45, 25, 0.04)',
        border: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 20px',
        boxSizing: 'border-box'
      }}>
        {/* Header: Connected People + online pill */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#0D4B2D" strokeWidth={2.2} />
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 700,
              color: '#111827'
            }}>
              Connected People
            </h3>
          </div>

          <span style={{
            backgroundColor: '#003822',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 700,
            borderRadius: '9999px',
            padding: '4px 12px'
          }}>
            {filteredPeople.length} connected
          </span>
        </div>

        {/* Search People Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: '9999px',
          padding: '8px 14px',
          marginBottom: '16px'
        }}>
          <Search size={14} color="#9CA3AF" />
          <input
            type="text"
            placeholder="Search people..."
            value={searchPersonQuery}
            onChange={(e) => setSearchPersonQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              paddingLeft: '8px',
              fontSize: '12.5px',
              color: '#111827'
            }}
          />
        </div>

        {/* Connected Doctors List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {filteredPeople.length > 0 ? (
            filteredPeople.map((person) => {
              const isSelected = currentDoctor?.id === person.id || currentDoctor?.name === person.name;

              return (
                <div
                  key={person.id}
                  onClick={() => {
                    if (onSelectConversation) {
                      const existing = conversations.find(c => c.doctor?.id === person.id || c.doctor?.name === person.name);
                      if (existing) {
                        onSelectConversation({ ...existing, doctor: person });
                      } else {
                        onSelectConversation({
                          id: `chat-${person.id}`,
                          doctor: person,
                          lastMessage: 'Started new direct consultation.',
                          timestamp: 'Just now',
                          messages: []
                        });
                      }
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#EDF8F2' : 'transparent',
                    border: isSelected ? '1px solid #A4DFBE' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Avatar and Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <Avatar
                        src={person.avatar}
                        name={person.name}
                        size={40}
                        fontSize={16}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        border: '1.5px solid #FFFFFF'
                      }} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#111827',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {person.name}
                      </h4>
                      <p style={{
                        margin: '1px 0',
                        fontSize: '11px',
                        color: '#6B7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {person.specialty || 'Veterinary Practitioner'}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '10.5px',
                        color: '#059669',
                        fontWeight: 500
                      }}>
                        <span style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: '#10B981',
                          display: 'inline-block'
                        }} />
                        <span>Online · Active Now</span>
                      </div>
                    </div>
                  </div>

                  {/* Chevron Right */}
                  <ChevronRight size={15} color="#9CA3AF" style={{ flexShrink: 0, marginLeft: '6px' }} />
                </div>
              );
            })
          ) : (
            <div style={{
              padding: '24px 12px',
              textAlign: 'center',
              color: '#6B7280'
            }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '12.5px' }}>
                {searchPersonQuery ? `No colleagues matching "${searchPersonQuery}"` : 'No connected colleagues yet.'}
              </p>
              {onNavigateTab && !searchPersonQuery && (
                <button
                  onClick={() => onNavigateTab('network')}
                  style={{
                    backgroundColor: '#EDF8F2',
                    color: '#0D4B2D',
                    border: '1px solid #A4DFBE',
                    borderRadius: '9999px',
                    padding: '6px 14px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Explore Vet Network
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
