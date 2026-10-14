import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Send, 
  Paperclip, 
  CheckCheck, 
  Image as ImageIcon, 
  MoreVertical, 
  User, 
  X, 
  Check, 
  Sparkles,
  Phone,
  Video
} from 'lucide-react';

export function MessagesView({
  conversations = [],
  activeChatDoctor = null,
  onSelectConversation,
  onSendMessage,
  onOpenDoctorProfile,
  currentUser
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentType, setAttachmentType] = useState('image');
  const [isAttaching, setIsAttaching] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeChatDoctor]);

  // Selected conversation
  const selectedConv = conversations.find(c => 
    activeChatDoctor && (c.doctor?.id === activeChatDoctor.id || c.doctor?.id === activeChatDoctor.id?.toString())
  ) || conversations[0];

  const currentDoctor = selectedConv?.doctor || activeChatDoctor;

  const filteredConversations = conversations.filter(c => {
    if (filterUnread && c.unread === 0) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const docName = c.doctor?.name?.toLowerCase() || '';
      const lastMsg = c.lastMessage?.toLowerCase() || '';
      return docName.includes(q) || lastMsg.includes(q);
    }
    return true;
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() && !attachmentUrl) return;

    if (onSendMessage && selectedConv) {
      onSendMessage({
        conversationId: selectedConv.id,
        receiverId: currentDoctor?.id,
        text: messageText.trim(),
        attachmentUrl: attachmentUrl || null,
        attachmentType: attachmentUrl ? attachmentType : null
      });
    }

    setMessageText('');
    setAttachmentUrl('');
    setIsAttaching(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachmentUrl(ev.target.result);
        setAttachmentType('image');
        setIsAttaching(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const quickPrompts = [
    "Could you review this radiograph scan?",
    "Available for a quick surgical case consult?",
    "Sharing the lab biopsy report for this patient."
  ];

  return (
    <div style={{
      display: 'flex',
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid #E5E7EB',
      overflow: 'hidden',
      height: 'calc(100vh - 120px)',
      minHeight: '600px',
      boxShadow: '0 4px 20px rgba(0, 45, 25, 0.05)'
    }}>
      {/* ======================================================== */}
      {/* LEFT: Conversation List                                  */}
      {/* ======================================================== */}
      <div style={{
        width: '320px',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FAFAFA'
      }}>
        {/* Top Header */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
              Messages
            </h3>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
              {conversations.length} Consultations
            </span>
          </div>

          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F3F4F6',
            borderRadius: '9999px',
            padding: '6px 14px',
            border: '1px solid #E5E7EB'
          }}>
            <Search size={14} color="#9CA3AF" />
            <input 
              type="text" 
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        </div>

        {/* Conversation List Stream */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConversations.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
              No messages found.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = selectedConv && selectedConv.id === conv.id;
              const doc = conv.doctor || {};
              return (
                <div 
                  key={conv.id}
                  onClick={() => onSelectConversation && onSelectConversation(conv)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderBottom: '1px solid #F3F4F6',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#E8F3ED' : '#FFFFFF',
                    borderLeft: isSelected ? '4px solid #003822' : '4px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  {/* Doctor Avatar with Active Online Dot */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img 
                      src={doc.avatar || "https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=150&q=80"}
                      alt={doc.name} 
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      border: '2px solid #FFFFFF'
                    }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: isSelected ? 700 : 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.name}
                      </h4>
                      <span style={{ fontSize: '10.5px', color: '#9CA3AF' }}>
                        {conv.timestamp || 'Today'}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '12px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.lastMessage || 'Started new direct consultation.'}
                    </p>
                  </div>

                  {conv.unread > 0 && (
                    <span style={{
                      backgroundColor: '#003822',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 700,
                      borderRadius: '9999px',
                      padding: '2px 6px',
                      flexShrink: 0
                    }}>
                      {conv.unread}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT: Active Conversation Workspace                     */}
      {/* ======================================================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
        {currentDoctor ? (
          <>
            {/* Chat Header Bar */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={currentDoctor.avatar || "https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=150&q=80"}
                    alt={currentDoctor.name} 
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    border: '2px solid #FFFFFF'
                  }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: '#111827' }}>
                    {currentDoctor.name}
                  </h3>
                  <p style={{ margin: '1px 0 0 0', fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>
                    {currentDoctor.specialty || 'Veterinary Medicine'} · Active Now
                  </p>
                </div>
              </div>

              {/* Header Right Action */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onOpenDoctorProfile && onOpenDoctorProfile(currentDoctor)}
                  style={{
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <User size={13} />
                  <span>Profile</span>
                </button>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: '#F9FAFB'
            }}>
              {/* Consultation Security Badge */}
              <div style={{
                textAlign: 'center',
                margin: '0 auto 8px auto',
                padding: '6px 14px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '9999px',
                fontSize: '11.5px',
                color: '#065F46',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Sparkles size={13} color="#059669" />
                <span>Verified Peer Consultation · Direct Doctor-to-Doctor Messaging</span>
              </div>

              {/* Message Bubbles */}
              {(selectedConv?.messages || [
                { id: 1, sender: 'doctor', text: `Hello Doctor, this is ${currentDoctor.name}. How can I assist you with this clinical case?`, time: '10:30 AM' }
              ]).map((msg) => {
                const isMe = msg.sender === 'user' || msg.sender === 'me' || msg.senderId === (currentUser?.id || 1);
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-end',
                      gap: '8px'
                    }}
                  >
                    {!isMe && (
                      <img 
                        src={currentDoctor.avatar} 
                        alt="Doctor" 
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    )}

                    <div style={{
                      maxWidth: '68%',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '10px 14px',
                      backgroundColor: isMe ? '#003822' : '#FFFFFF',
                      color: isMe ? '#FFFFFF' : '#111827',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      border: isMe ? 'none' : '1px solid #E5E7EB'
                    }}>
                      {/* Attached Image if any */}
                      {msg.attachmentUrl && (
                        <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                          <img 
                            src={msg.attachmentUrl} 
                            alt="Attachment" 
                            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} 
                          />
                        </div>
                      )}

                      <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.45 }}>
                        {msg.text}
                      </p>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px',
                        marginTop: '4px',
                        fontSize: '10px',
                        color: isMe ? 'rgba(255,255,255,0.7)' : '#9CA3AF'
                      }}>
                        <span>{msg.time || 'Just now'}</span>
                        {isMe && <CheckCheck size={12} color="#A7F3D0" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Consultation Prompt Chips */}
            <div style={{
              padding: '6px 16px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #F3F4F6',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto'
            }}>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessageText(p)}
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    color: '#4B5563',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Attachment Preview if selected */}
            {attachmentUrl && (
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#ECFDF5',
                borderTop: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={16} color="#059669" />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#065F46' }}>Clinical image scan attached</span>
                </div>
                <button 
                  onClick={() => setAttachmentUrl('')} 
                  style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Bottom Message Input Box */}
            <form onSubmit={handleSend} style={{
              padding: '12px 18px',
              borderTop: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach Radiograph / Clinical Photo"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6B7280',
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                <Paperclip size={18} />
              </button>

              <input 
                type="text" 
                placeholder={`Message ${currentDoctor.name}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '9999px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#F9FAFB',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />

              <button
                type="submit"
                disabled={!messageText.trim() && !attachmentUrl}
                style={{
                  backgroundColor: (!messageText.trim() && !attachmentUrl) ? '#E5E7EB' : '#003822',
                  color: (!messageText.trim() && !attachmentUrl) ? '#9CA3AF' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (!messageText.trim() && !attachmentUrl) ? 'default' : 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <Send size={15} style={{ marginLeft: '2px' }} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
            Select a doctor to start consultation.
          </div>
        )}
      </div>
    </div>
  );
}
