import React from 'react';
import { Search, MapPin, ChevronDown, Bell, LogIn } from 'lucide-react';

export function Header({ 
  searchQuery, 
  onSearchChange, 
  selectedCountry = 'INDIA',
  onOpenCreateProfile,
  currentUser,
  onOpenLogin
}) {
  return (
    <header className="top-header">
      {/* Search Bar Pill */}
      <div className="header-search-container">
        <div className="header-search-bar">
          <Search size={16} color="#6b7280" />
          <input 
            type="text" 
            placeholder="Search doctors, specialties, cities..."
            className="header-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="header-country-pill" title="Filter by Region">
            <MapPin size={13} color="#4b5563" />
            <span>{selectedCountry}</span>
            <ChevronDown size={12} color="#4b5563" />
          </div>
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="header-right-actions">
        <div className="open-community-badge">
          <span className="status-dot-green"></span>
          <span>Open community</span>
        </div>

        <button className="header-bell-btn" title="Notifications">
          <Bell size={19} />
          <span className="bell-badge-count">3</span>
        </button>

        {currentUser ? (
          <div 
            className="header-user-profile-btn" 
            onClick={onOpenCreateProfile}
            title={`${currentUser.name} (Verified Doctor)`}
          >
            <img 
              src={currentUser.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80"} 
              alt={currentUser.name} 
              className="header-avatar-img"
            />
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#111827', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser.name}
            </span>
            <ChevronDown size={13} color="#4b5563" />
          </div>
        ) : (
          <button 
            className="header-signin-btn"
            onClick={onOpenLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#003822',
              color: '#ffffff',
              borderRadius: '9999px',
              padding: '6px 16px',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 56, 34, 0.2)',
              transition: 'all 0.15s ease'
            }}
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
