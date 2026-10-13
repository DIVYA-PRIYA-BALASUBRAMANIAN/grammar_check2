import React, { useState } from 'react';
import { X, Heart, MessageSquare, Bookmark, Share2, Play, Pause, Volume2, VolumeX } from 'lucide-react';

export function VideoPlayerModal({ video, onClose }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    { id: 1, author: 'Dr. Priya Nair', text: 'Excellent tension relief! What suture material was used?' },
    { id: 2, author: 'Dr. Vikram Singh', text: 'Clean surgical field. Thanks for sharing this technique.' }
  ]);

  if (!video) return null;

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([...comments, { id: Date.now(), author: 'You', text: commentText }]);
    setCommentText('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        style={{
          width: '740px',
          maxWidth: '95vw',
          height: '560px',
          backgroundColor: '#0E1410',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          animation: 'modalPop 0.25s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Video Player Area */}
        <div style={{ flex: '1.2', position: 'relative', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={video.thumbnail} 
            alt={video.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Video Overlay Info */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px 16px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
            color: '#FFF'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0' }}>{video.title}</h3>
            <p style={{ fontSize: '12.5px', color: '#C8DEC9', margin: 0 }}>{video.doctorName} · {video.doctorSpecialty}</p>
          </div>

          {/* Quick Floating Action Icons */}
          <div style={{ position: 'absolute', right: 14, bottom: 80, display: 'flex', flexDirection: 'column', gap: 14, zIndex: 10 }}>
            <button 
              onClick={() => setIsLiked(!isLiked)} 
              style={{ background: 'rgba(0,0,0,0.5)', width: 40, height: 40, borderRadius: '50%', color: isLiked ? '#EF4444' : '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Heart size={20} fill={isLiked ? '#EF4444' : 'none'} />
            </button>
            <button 
              onClick={() => setIsSaved(!isSaved)} 
              style={{ background: 'rgba(0,0,0,0.5)', width: 40, height: 40, borderRadius: '50%', color: isSaved ? '#C5A059' : '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Bookmark size={20} fill={isSaved ? '#C5A059' : 'none'} />
            </button>
          </div>
        </div>

        {/* Right Discussion Area */}
        <div style={{ flex: '1', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E9E5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0D472B' }}>
              Clinical Discussion
            </span>
            <button onClick={onClose} className="btn-close-modal">
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comments.map((c) => (
              <div key={c.id} style={{ fontSize: '13px' }}>
                <strong style={{ color: '#121A15', display: 'block', marginBottom: '2px' }}>{c.author}</strong>
                <span style={{ color: '#55635B' }}>{c.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} style={{ padding: '12px 16px', borderTop: '1px solid #E5E9E5', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Add your veterinary comment..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="custom-filter-select"
              style={{ flex: 1, padding: '8px 12px' }}
            />
            <button type="submit" className="btn-submit-post" style={{ padding: '8px 14px' }}>
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
