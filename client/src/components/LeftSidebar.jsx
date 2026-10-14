import React from 'react';
import {
  Home,
  Users,
  FolderHeart,
  Video,
  MessageSquare,
  Search,
  Award,
  Megaphone,
  ExternalLink,
  Crown,
  ArrowRight,
  PawPrint,
  Lightbulb,
  GraduationCap,
  LogIn,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { Avatar } from './Avatar';

export function LeftSidebar({
  activeTab,
  onTabSelect,
  unreadMessagesCount = 1,
  onOpenBenefitsModal,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenCreateProfile
}) {
  const navItems = [
    { id: 'feed', label: 'Home', icon: Home },
    { id: 'network', label: 'Vet Network', icon: Users },
    { id: 'cases', label: 'Clinical Cases', icon: FolderHeart },
    { id: 'videos', label: 'Short Videos', icon: Video },
    { id: 'messages', label: 'Messages', icon: MessageSquare, hasBadge: true },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'benefits', label: 'Member Benefits', icon: Award },
    { id: 'advertise', label: 'Advertise', icon: Megaphone }
  ];

  return (
    <aside className="left-sidebar">
      {/* Brand Header with Paw Emblem */}
      <div className="sidebar-brand-block">
        <div className="brand-paw-emblem">
          <PawPrint size={20} fill="#ffffff" />
        </div>
        <div className="brand-text-block">
          <span className="brand-main-name">Zenve Vet</span>
          <span className="brand-main-subtitle">The Professional Network</span>
        </div>
      </div>

      {/* Main Navigation List */}
      <ul className="sidebar-nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <button
                id={`sidebar-nav-${item.id}`}
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                onClick={() => onTabSelect(item.id)}
              >
                <div className="nav-item-content">
                  <Icon size={19} strokeWidth={isActive ? 2.2 : 1.9} />
                  <span>{item.label}</span>
                </div>
                {item.hasBadge && unreadMessagesCount > 0 && (
                  <span className="badge-messages-count">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Discover & Grow Section */}
      <div className="sidebar-discover-section">
        <p className="discover-kicker">Discover & Grow</p>

        <a
          href="#scholarships"
          className="discover-nav-link"
          onClick={(e) => { e.preventDefault(); onTabSelect('benefits'); }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lightbulb size={16} color="#7ca895" />
            <span>Innovation & Scholarships</span>
          </div>
          <ExternalLink size={13} color="#7ca895" />
        </a>

        <a
          href="#mentorship"
          className="discover-nav-link"
          onClick={(e) => { e.preventDefault(); onTabSelect('network'); }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap size={16} color="#7ca895" />
            <span>Expert Mentorship</span>
          </div>
          <ExternalLink size={13} color="#7ca895" />
        </a>
      </div>

      {/* User Session Bar or Sign In Card */}
      {currentUser ? (
        <div style={{
          marginTop: 'auto',
          marginBottom: '10px',
          padding: '10px 12px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, cursor: 'pointer' }}
            onClick={onOpenCreateProfile}
            title="Edit Doctor Profile"
          >
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size={34}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '10px', color: '#8be6bc', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <ShieldCheck size={10} />
                <span>Verified</span>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log Out"
            style={{
              color: '#94a3b8',
              padding: '4px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <LogOut size={15} />
          </button>
        </div>
      ) : (
        <button
          onClick={onOpenLogin}
          style={{
            marginTop: 'auto',
            marginBottom: '10px',
            padding: '10px 12px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: '700' }}>
            <LogIn size={15} color="#2ee59d" />
            <span>Doctor Sign In</span>
          </div>
          <ArrowRight size={13} color="#2ee59d" />
        </button>
      )}

      {/* Bottom Promo Card */}
      <div
        className="sidebar-bottom-promo-card"
        onClick={() => onOpenBenefitsModal ? onOpenBenefitsModal() : onTabSelect('benefits')}
      >
        <div className="promo-header-row">
          <div className="promo-title-left">
            <Crown size={15} color="#ffd875" />
            <span>Your next chapter</span>
          </div>
          <ArrowRight size={14} color="#ffd875" />
        </div>
        <p className="promo-desc-text">
          Unlock specialized CME, networking and career growth.
        </p>
      </div>
    </aside>
  );
}
