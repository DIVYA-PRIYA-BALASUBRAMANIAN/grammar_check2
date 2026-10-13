import React, { useState } from 'react';
import { 
  Search, 
  SquarePen, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Send, 
  CheckCheck,
  PawPrint
} from 'lucide-react';

export function MessagesView() {
  const [activeDoctorId, setActiveDoctorId] = useState('doc-1');
  const [inputText, setInputText] = useState('');

  const contacts = [
    {
      id: 'doc-1',
      name: 'Dr. Ananya Sharma',
      specialty: 'Small Animal Medicine',
      city: 'Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80',
      time: '10:45 AM',
      lastMessage: 'Thank you for the echo interpretatio...',
      unread: 1,
      isOnline: true
    },
    {
      id: 'doc-2',
      name: 'Dr. Arjun Mehta',
      specialty: 'Veterinary Surgery',
      city: 'Mumbai',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
      time: 'Yesterday',
      lastMessage: 'I can take the orthopedic referral on ...',
      unread: 0,
      isOnline: true
    },
    {
      id: 'doc-3',
      name: 'Dr. Priya Nair',
      specialty: 'Veterinary Dermatology',
      city: 'Kochi',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
      time: 'Yesterday',
      lastMessage: "Sure, I'll share the latest guidelines ...",
      unread: 0,
      isOnline: false
    },
    {
      id: 'doc-4',
      name: 'Dr. Vikram Singh',
      specialty: 'Equine Medicine',
      city: 'Jaipur',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
      time: '2d',
      lastMessage: 'Looking forward to the webinar!',
      unread: 0,
      isOnline: false
    },
    {
      id: 'doc-5',
      name: 'Dr. Kavya Ramesh',
      specialty: 'Veterinary Ophthalmology',
      city: 'Hyderabad',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80',
      time: '3d',
      lastMessage: 'Thanks for the update!',
      unread: 0,
      isOnline: false
    },
    {
      id: 'doc-6',
      name: 'Dr. Sanjay Kumar',
      specialty: 'Veterinary Radiology',
      city: 'Delhi',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
      time: '3d',
      lastMessage: 'Can you share the case reference?',
      unread: 0,
      isOnline: false
    },
    {
      id: 'doc-7',
      name: 'Dr. Ritika Mehta',
      specialty: 'Wildlife Medicine',
      city: 'Pune',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=300&q=80',
      time: '4d',
      lastMessage: 'Great discussion today!',
      unread: 0,
      isOnline: false
    }
  ];

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'me',
      text: 'Hi Dr. Ananya, did you get a chance to review the ECG recording I sent for Bruno?',
      time: '10:20 AM',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 2,
      sender: 'doctor',
      text: 'Yes! Fast atrial fibrillation with variable R-R intervals. I recommend starting diltiazem at 0.5 mg/kg PO TID alongside pimobendan.',
      time: '10:35 AM',
      avatar: 'https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 3,
      sender: 'me',
      text: 'Will initiate right away and monitor blood pressure.',
      time: '10:40 AM',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 4,
      sender: 'doctor',
      text: 'Thank you for the echo interpretation! The DCM patient is now stabilized on Pimobendan.',
      time: '10:45 AM',
      avatar: 'https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80'
    }
  ]);

  const activeContact = contacts.find(c => c.id === activeDoctorId) || contacts[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: inputText,
      time: '10:46 AM',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80'
    };

    setChatMessages([...chatMessages, newMsg]);
    setInputText('');
  };

  return (
    <div className="messages-dual-container">
      {/* 1. Left Card: Conversations List */}
      <div className="messages-list-card">
        {/* Header */}
        <div className="messages-list-header">
          <h2 className="messages-title-text">Messages</h2>
          <button className="btn-compose-new-chat" title="New Message">
            <SquarePen size={17} />
          </button>
        </div>

        {/* Search Conversations Input */}
        <div className="messages-search-wrap">
          <Search size={15} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="messages-search-input"
          />
        </div>

        {/* Contacts Scrollable List */}
        <div className="messages-contacts-scroll">
          {contacts.map((doc) => {
            const isActive = doc.id === activeDoctorId;
            return (
              <div 
                key={doc.id}
                className={`contact-row-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveDoctorId(doc.id)}
              >
                <div className="contact-avatar-wrap">
                  <img src={doc.avatar} alt={doc.name} className="contact-avatar-img" />
                  {doc.isOnline && <span className="contact-status-dot" />}
                </div>

                <div className="contact-info-col">
                  <div className="contact-name-row">
                    <span className="contact-name-label">{doc.name}</span>
                    <span className="contact-time-label">{doc.time}</span>
                  </div>
                  <p className="contact-preview-text">{doc.lastMessage}</p>
                </div>

                {doc.unread > 0 && (
                  <span className="contact-unread-badge">{doc.unread}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Right Card: Active Chat Room */}
      <div className="messages-chat-card">
        {/* Chat Room Top Header */}
        <div className="chat-card-header">
          <div className="chat-header-doctor-info">
            <div className="chat-header-avatar-wrap">
              <img src={activeContact.avatar} alt={activeContact.name} className="chat-header-avatar" />
              {activeContact.isOnline && <span className="contact-status-dot" />}
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: 0 }}>
                {activeContact.name}
              </h3>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                {activeContact.specialty} · {activeContact.city}
              </p>
            </div>
          </div>

          <div className="chat-header-actions-group">
            <button className="chat-action-circle-btn" title="Audio Call">
              <Phone size={16} />
            </button>
            <button className="chat-action-circle-btn" title="Video Call">
              <Video size={16} />
            </button>
            <button className="chat-action-circle-btn" title="More Options">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Chat Messages Flow */}
        <div className="chat-messages-flow">
          {/* Paw Print Background Watermarks */}
          <PawPrint size={140} style={{ position: 'absolute', top: 50, left: 60, color: 'rgba(0, 56, 34, 0.02)', pointerEvents: 'none' }} />
          <PawPrint size={140} style={{ position: 'absolute', bottom: 80, right: 60, color: 'rgba(0, 56, 34, 0.02)', pointerEvents: 'none' }} />

          {/* Date Separator Pill */}
          <div className="chat-date-pill-divider">
            Today, 10 Aug 2025
          </div>

          {/* Messages */}
          {chatMessages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <div key={msg.id} className={`chat-bubble-row ${isMe ? 'sent' : 'received'}`}>
                <img src={msg.avatar} alt="Avatar" className="chat-bubble-avatar" />
                <div className="chat-bubble-body">
                  <div className={`chat-bubble-box ${isMe ? 'sent' : 'received'}`}>
                    {msg.text}
                  </div>
                  <div className={`chat-bubble-meta ${isMe ? 'sent' : 'received'}`}>
                    <span>{msg.time}</span>
                    {isMe && <CheckCheck size={13} color="#059669" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input Bar Footer */}
        <form onSubmit={handleSend} className="chat-input-bar-container">
          <button type="button" style={{ color: '#6b7280', padding: '4px' }} title="Attach Case / Media">
            <Paperclip size={18} />
          </button>

          <div className="chat-input-pill-field">
            <input 
              type="text" 
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="chat-text-input"
            />
            <button type="button" style={{ color: '#9ca3af', padding: '2px 4px' }} title="Insert Emoji">
              <Smile size={18} />
            </button>
          </div>

          <button type="submit" className="btn-send-message-green" title="Send Message">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
