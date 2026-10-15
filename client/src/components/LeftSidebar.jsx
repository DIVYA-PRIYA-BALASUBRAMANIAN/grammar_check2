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
  User
} from 'lucide-react';
import zenveLogo from '../assets/zenve_logo.png';

export function LeftSidebar({
  activeTab,
  onTabSelect,
  unreadMessagesCount = 0,
  onOpenBenefitsModal,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenCreateProfile,
  onOpenDoctorProfile
}) {
  const navItems = [
    { id: 'feed', label: 'Home', icon: Home },
    { id: 'network', label: 'Vet Network', icon: Users },
    { id: 'cases', label: 'Clinical Cases', icon: FolderHeart },
    { id: 'videos', label: 'Short Videos', icon: Video },
    { id: 'messages', label: 'Messages', icon: MessageSquare, hasBadge: true },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'benefits', label: 'Member Benefits', icon: Award },
    { id: 'advertise', label: 'Advertise', icon: Megaphone },
    { id: 'profile', label: 'My Profile', icon: User }
  ];

  return (
    <aside className="left-sidebar">
      {/* Brand Header with Official Zenve Golden Logo */}
      <div className="sidebar-brand-block">
        <img
          src={zenveLogo}
          alt="Zenve Vet Logo"
          className="sidebar-zenve-logo-img"
        />
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
