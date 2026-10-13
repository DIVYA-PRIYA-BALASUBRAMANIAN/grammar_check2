import React, { useState } from 'react';
import { X, Image, FileText, Video, Sparkles, Send, Check } from 'lucide-react';

export function CreatePostModal({ isOpen, onClose, onPostSubmit, onOpenAiAssistant }) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('CLINICAL_CASE');
  const [imageUrl, setImageUrl] = useState('');
  const [species, setSpecies] = useState('Canine');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    onPostSubmit({
      content,
      postType,
      imageUrl: imageUrl.trim() || null,
      species
    });

    setContent('');
    setImageUrl('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Share to Doctor Vet Community</h3>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {['CLINICAL_CASE', 'GENERAL_POST', 'STORY', 'SHORT_VIDEO'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPostType(type)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  border: '1px solid',
                  borderColor: postType === type ? '#0D472B' : '#E5E9E5',
                  background: postType === type ? '#E8F3ED' : '#FFF',
                  color: postType === type ? '#0D472B' : '#64726A'
                }}
              >
                {type === 'CLINICAL_CASE' && 'Clinical Case'}
                {type === 'GENERAL_POST' && 'Photo / Post'}
                {type === 'STORY' && 'Story'}
                {type === 'SHORT_VIDEO' && 'Short Video'}
              </button>
            ))}
          </div>

          <textarea 
            rows="5"
            className="custom-filter-select"
            style={{ width: '100%', resize: 'vertical', marginBottom: '14px' }}
            placeholder="Share a clinical discovery, diagnosis, surgical technique, or discussion with peer veterinarians..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#121A15', marginBottom: '4px' }}>
              Add Clinical Scan or Photo URL (Optional)
            </label>
            <input 
              type="text"
              placeholder="https://... (radiograph, cytology, or surgical photo)"
              className="custom-filter-select"
              style={{ width: '100%' }}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #E5E9E5' }}>
            <button 
              type="button" 
              className="btn-post-type ai-special"
              onClick={() => {
                onClose();
                onOpenAiAssistant();
              }}
            >
              <Sparkles size={16} />
              <span>Use AI Case Assistant</span>
            </button>

            <button type="submit" className="btn-submit-post">
              <span>Post to Network</span>
              <Send size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
