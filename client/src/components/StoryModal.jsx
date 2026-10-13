import React from 'react';
import { X, Heart, MessageCircle, Send } from 'lucide-react';

export function StoryModal({ story, onClose }) {
  if (!story) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        style={{
          width: '380px',
          height: '620px',
          backgroundColor: '#000',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          animation: 'modalPop 0.25s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Story Progress Bar */}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', gap: 4, zIndex: 10 }}>
          <div style={{ height: 3, flex: 1, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 2 }} />
        </div>

        {/* Story Header */}
        <div style={{ position: 'absolute', top: 22, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img 
              src={story.avatar} 
              alt={story.doctorName} 
              style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #C5A059' }} 
            />
            <div>
              <p style={{ color: '#FFF', fontWeight: 700, fontSize: 13.5, margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                {story.fullDoctorName}
              </p>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>{story.time}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#FFF', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Story Image */}
        <img 
          src={story.image} 
          alt={story.caption}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Caption & Controls */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px 16px 20px 16px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
          color: '#FFF',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <p style={{ fontSize: 13.5, margin: 0, lineHeight: 1.4 }}>
            {story.caption}
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder={`Reply to ${story.doctorName}...`}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: 20,
                padding: '8px 14px',
                color: '#FFF',
                fontSize: 13,
                outline: 'none'
              }}
            />
            <button style={{ color: '#FFF' }}>
              <Heart size={20} />
            </button>
            <button style={{ color: '#FFF' }}>
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
