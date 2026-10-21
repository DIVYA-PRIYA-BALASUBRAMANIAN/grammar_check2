import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Send,
  Paperclip,
  Check,
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
  UserPlus,
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
  onOpenCreateProfile,
  onSendRequest,
  onMarkAsRead
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

  // Merge conversations and connected doctors, prioritizing unread chats first like Instagram
  const allContacts = useMemo(() => {
    const map = new Map();

    // 1. Existing conversations first (with fresh doctor info)
    (conversations || []).forEach(conv => {
      if (conv.doctor) {
        const fresh = (doctors || []).find(d =>
          d.id === conv.doctor.id ||
          String(d.id).replace('doc-', '') === String(conv.doctor.id).replace('doc-', '') ||
          (d.name && conv.doctor.name && d.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === conv.doctor.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
        );
        const resolvedDoctor = fresh ? { ...conv.doctor, ...fresh, avatar: fresh.avatar || conv.doctor.avatar } : conv.doctor;
        const key = resolvedDoctor.id ? String(resolvedDoctor.id).replace('doc-', '') : resolvedDoctor.name;

        map.set(key, {
          doctor: resolvedDoctor,
          conv: conv,
          lastMessage: conv.lastMessage || (conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].text : 'Direct chat consultation'),
          timestamp: conv.timestamp || 'Active',
          unread: conv.unread || 0
        });
      }
    });

    // 2. Add connected doctors who might not have had messages yet
    (userConnections || []).forEach(doc => {
      const key = doc.id ? String(doc.id).replace('doc-', '') : doc.name;
      if (!map.has(key)) {
        map.set(key, {
          doctor: doc,
          conv: null,
          lastMessage: doc.specialty || 'Veterinary Practitioner',
          timestamp: 'Connected',
          unread: 0
        });
      }
    });

    const list = Array.from(map.values());
    // Sort: unread chats at the very top, then active chats, then connected
    return list.sort((a, b) => {
      const unreadDiff = (b.unread || 0) - (a.unread || 0);
      if (unreadDiff !== 0) return unreadDiff;
      if (b.conv && !a.conv) return 1;
      if (a.conv && !b.conv) return -1;
      return 0;
    });
  }, [conversations, userConnections, doctors, currentUser]);

  // Format real-time message timestamp
  const formatTime = (t) => {
    if (!t) return 'Just now';
    if (typeof t === 'string' && (t.includes(':') || t.toLowerCase() === 'just now')) return t;
    try {
      const d = new Date(t);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch (e) { }
    return String(t);
  };

  // Filter contacts by search query
  const filteredContacts = allContacts.filter(item => {
    if (!searchPersonQuery.trim()) return true;
    const q = searchPersonQuery.toLowerCase();
    const doc = item.doctor;
    return (doc.name && doc.name.toLowerCase().includes(q)) ||
      (doc.specialty && doc.specialty.toLowerCase().includes(q)) ||
      (item.lastMessage && item.lastMessage.toLowerCase().includes(q));
  });

  // Selected conversation strictly belonging to this user
  const selectedConv = conversations.find(c =>
    activeChatDoctor && (
      c.doctor?.id === activeChatDoctor.id ||
      String(c.doctor?.id || '').replace('doc-', '') === String(activeChatDoctor.id || '').replace('doc-', '') ||
      c.doctor?.name === activeChatDoctor.name
    )
  ) || (conversations.length > 0 ? conversations[0] : null);

  // Track browser window focus and document visibility
  const [isWindowActive, setIsWindowActive] = useState(() =>
    typeof document !== 'undefined' ? (!document.hidden && document.hasFocus()) : true
  );

  useEffect(() => {
    const updateActiveState = () => {
      setIsWindowActive(!document.hidden && document.hasFocus());
    };
    const handleVisibility = () => updateActiveState();
    const handleFocus = () => updateActiveState();
    const handleBlur = () => setIsWindowActive(false);

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Mark conversation as read only when active conversation is visible and focused
  useEffect(() => {
    if (!isWindowActive || !selectedConv) return;

    // Check if there are any unread messages sent by peer to currentUser
    const hasUnreadReceived = (selectedConv.messages || []).some(m =>
      (m.senderId !== currentUser?.id && m.sender !== 'user' && m.sender !== 'me') &&
      (!m.isRead || m.status !== 'SEEN')
    );

    if (selectedConv.unread > 0 || hasUnreadReceived) {
      if (onMarkAsRead && selectedConv.id) {
        onMarkAsRead(selectedConv.id);
      } else if (onSelectConversation) {
        onSelectConversation(selectedConv);
      }
    }
  }, [selectedConv?.id, selectedConv?.unread, selectedConv?.messages, isWindowActive, onMarkAsRead, onSelectConversation, currentUser?.id]);

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

  // Active chat message stream (strictly from user's selected conversation, deduplicated by message ID)
  const chatMessages = useMemo(() => {
    const list = selectedConv?.messages || [];
    const seen = new Set();
    const result = [];
    for (const msg of list) {
      if (!msg) continue;
      const key = msg.id != null ? String(msg.id) : (msg.tempId || `${msg.senderId}-${msg.createdAt}-${msg.text}`);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(msg);
      }
    }
    return result;
  }, [selectedConv?.messages]);

  // Check if current doctor is connected to allow messaging
  const isPeerConnected = useMemo(() => {
    if (!currentDoctor) return false;
    const isConn = (connectedDoctors || []).some(c =>
      c.id === currentDoctor.id ||
      String(c.id).replace('doc-', '') === String(currentDoctor.id).replace('doc-', '') ||
      (c.name && currentDoctor.name && c.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === currentDoctor.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
    );
    const hasConvWithMessages = (conversations || []).some(c =>
      c.doctor && (
        c.doctor.id === currentDoctor.id ||
        String(c.doctor.id).replace('doc-', '') === String(currentDoctor.id).replace('doc-', '') ||
        (c.doctor.name && currentDoctor.name && c.doctor.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim() === currentDoctor.name.toLowerCase().replace(/^dr\.?\s*/i, '').trim())
      ) && c.messages && c.messages.length > 0
    );
    return isConn || hasConvWithMessages;
  }, [currentDoctor, connectedDoctors, conversations]);

  // Handle Send
  const handleSend = (e) => {
    e?.preventDefault();
    if (!isPeerConnected) {
      alert(`You must connect with ${currentDoctor?.name || 'this doctor'} first before messaging.`);
      return;
    }
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
              {/* Doctor Info (Clickable to open profile) */}
              <div
                onClick={() => onOpenDoctorProfile && onOpenDoctorProfile(currentDoctor, true)}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
                title={`View ${currentDoctor.name}'s Profile`}
              >
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
                    backgroundColor: currentDoctor.active ? '#10B981' : '#9CA3AF',
                    border: '2px solid #FFFFFF'
                  }} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '16.5px',
                      fontWeight: 700,
                      color: '#111827',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#003822'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#111827'; }}
                    >
                      {currentDoctor.name}
                    </h3>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: currentDoctor.active ? '#10B981' : '#9CA3AF',
                      display: 'inline-block'
                    }} />
                  </div>
                  <p style={{
                    margin: '2px 0 0 0',
                    fontSize: '12px',
                    color: currentDoctor.active ? '#059669' : '#6B7280',
                    fontWeight: 600
                  }}>
                    {currentDoctor.specialty || 'Veterinary Practitioner'} · {currentDoctor.active ? 'Active Now' : 'Inactive'}
                  </p>
                </div>
              </div>

              {/* Header Action: Profile Button */}
              <button
                type="button"
                onClick={() => onOpenDoctorProfile && onOpenDoctorProfile(currentDoctor, true)}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#003822',
                  border: '1.5px solid #003822',
                  borderRadius: '9999px',
                  padding: '7px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0, 56, 34, 0.08)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0FDF4';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                title={`View ${currentDoctor.name}'s Profile`}
              >
                <User size={15} color="#003822" />
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
              {chatMessages.map((msg, idx) => {
                const isMe = msg.sender === 'user' || msg.sender === 'me' || msg.senderId === (currentUser?.id || 1);
                // Determine if this is the last message sent by me in this conversation
                const isLastSentByMe = isMe && (chatMessages.slice(idx + 1).every(m => m.sender !== 'user' && m.sender !== 'me' && m.senderId !== (currentUser?.id || 1)));

                const isSeen = msg.status === 'SEEN' || msg.isRead === true;
                const isDelivered = !isSeen && msg.status === 'DELIVERED';

                let statusTooltip = 'Sent successfully';
                if (isSeen) {
                  statusTooltip = `Seen${msg.readAt ? ` at ${formatTime(msg.readAt)}` : ''}`;
                } else if (isDelivered) {
                  statusTooltip = `Delivered${msg.deliveredAt ? ` at ${formatTime(msg.deliveredAt)}` : ''} · Unseen`;
                } else {
                  statusTooltip = 'Sent · Unseen';
                }

                return (
                  <div key={`chat-msg-${msg.id || msg.tempId || idx}`} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
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
                          <span>{formatTime(msg.time)}</span>
                          {isMe && (
                            <span
                              title={statusTooltip}
                              style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '2px' }}
                            >
                              {isSeen ? (
                                <CheckCheck
                                  size={14}
                                  color="#38BDF8"
                                  strokeWidth={2.5}
                                  style={{ filter: 'drop-shadow(0 0 1px rgba(56, 189, 248, 0.5))' }}
                                />
                              ) : isDelivered ? (
                                <CheckCheck
                                  size={13}
                                  color="rgba(255, 255, 255, 0.85)"
                                  strokeWidth={2}
                                />
                              ) : (
                                <Check
                                  size={13}
                                  color="rgba(255, 255, 255, 0.65)"
                                  strokeWidth={2}
                                />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Instagram/WhatsApp-style Seen / Delivered status beneath the last sent message */}
                    {isLastSentByMe && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        marginTop: '4px',
                        paddingRight: '6px'
                      }}>
                        {isSeen ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284C7' }}>
                            <CheckCheck size={13} color="#0284C7" strokeWidth={2.4} />
                            <span>Seen{msg.readAt ? ` · ${formatTime(msg.readAt)}` : ''}</span>
                          </div>
                        ) : isDelivered ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B' }}>
                            <CheckCheck size={13} color="#64748B" strokeWidth={2} />
                            <span>Delivered · Unseen</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94A3B8' }}>
                            <Check size={13} color="#94A3B8" strokeWidth={2} />
                            <span>Sent · Unseen</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Controls: Gated strictly by connection */}
            {isPeerConnected ? (
              <>
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
                padding: '24px 20px',
                backgroundColor: '#FAFAFA',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Lock size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: '#111827' }}>
                  Connect to Message {currentDoctor?.name || 'Doctor'}
                </h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#6B7280', maxWidth: '380px', lineHeight: 1.4 }}>
                  To ensure clinical privacy and mutual professional consent, you can only message peers after connecting with them.
                </p>
                {onSendRequest && currentDoctor && (
                  <button
                    type="button"
                    onClick={() => onSendRequest(currentDoctor)}
                    style={{
                      marginTop: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#003822',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '8px 20px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0, 56, 34, 0.2)'
                    }}
                  >
                    <UserPlus size={15} />
                    <span>Connect with Doctor</span>
                  </button>
                )}
              </div>
            )}
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
        {/* Header: Direct Messages + count badge */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={19} color="#0D4B2D" strokeWidth={2.2} />
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 700,
              color: '#111827'
            }}>
              Direct Messages
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
            {filteredContacts.length} chats
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
            placeholder="Search chats or doctors..."
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

        {/* Direct Messages & Contacts List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {filteredContacts.length > 0 ? (
            filteredContacts.map(({ doctor: person, conv: existing, lastMessage, timestamp, unread }, idx) => {
              const isSelected = currentDoctor?.id === person.id || currentDoctor?.name === person.name;
              const isUnread = unread > 0 && !isSelected;

              return (
                <div
                  key={`contact-item-${person.id || person.name || idx}`}
                  onClick={() => {
                    if (onSelectConversation) {
                      if (existing) {
                        onSelectConversation({ ...existing, doctor: person, unread: 0 });
                      } else {
                        onSelectConversation({
                          id: `chat-${person.id || Date.now()}`,
                          doctor: person,
                          lastMessage: 'Started new direct consultation.',
                          timestamp: 'Just now',
                          unread: 0,
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
                    backgroundColor: isSelected ? '#EDF8F2' : (isUnread ? '#F0FDF4' : 'transparent'),
                    border: isSelected ? '1px solid #A4DFBE' : (isUnread ? '1px solid #BBF7D0' : '1px solid transparent'),
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = isUnread ? '#DCFCE7' : '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = isUnread ? '#F0FDF4' : 'transparent';
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
                        backgroundColor: person.active ? '#10B981' : '#9CA3AF',
                        border: '1.5px solid #FFFFFF'
                      }} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '13px',
                          fontWeight: isUnread ? 800 : 700,
                          color: isUnread ? '#065F46' : '#111827',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {person.name}
                        </h4>
                        <span style={{
                          fontSize: '10.5px',
                          color: isUnread ? '#059669' : '#9CA3AF',
                          fontWeight: isUnread ? 700 : 400,
                          flexShrink: 0,
                          marginLeft: '4px'
                        }}>
                          {timestamp}
                        </span>
                      </div>

                      <p style={{
                        margin: '1px 0 0 0',
                        fontSize: '11px',
                        color: isUnread ? '#065F46' : '#6B7280',
                        fontWeight: isUnread ? 700 : 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {existing?.messages && existing.messages.length > 0 && (
                          (() => {
                            const lastM = existing.messages[existing.messages.length - 1];
                            const isMeMsg = lastM.sender === 'user' || lastM.sender === 'me' || lastM.senderId === (currentUser?.id || 1);
                            if (!isMeMsg) return null;
                            const isSeenM = lastM.status === 'SEEN' || lastM.isRead;
                            const isDelivM = lastM.status === 'DELIVERED';
                            if (isSeenM) return <CheckCheck size={12} color="#0284C7" strokeWidth={2.4} style={{ flexShrink: 0 }} />;
                            if (isDelivM) return <CheckCheck size={12} color="#64748B" strokeWidth={2} style={{ flexShrink: 0 }} />;
                            return <Check size={12} color="#94A3B8" strokeWidth={2} style={{ flexShrink: 0 }} />;
                          })()
                        )}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lastMessage}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Unread Badge / Instagram Dot */}
                  {isUnread ? (
                    <span style={{
                      backgroundColor: '#059669',
                      color: '#FFFFFF',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      borderRadius: '9999px',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 5px',
                      boxShadow: '0 2px 6px rgba(5, 150, 105, 0.35)',
                      flexShrink: 0,
                      marginLeft: '8px'
                    }}>
                      {unread}
                    </span>
                  ) : (
                    <ChevronRight size={15} color="#9CA3AF" style={{ flexShrink: 0, marginLeft: '6px' }} />
                  )}
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
                {searchPersonQuery ? `No chats matching "${searchPersonQuery}"` : 'No messages or connected colleagues yet.'}
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
