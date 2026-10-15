import React from 'react';
import {
  Home,
  Users,
  FolderPlus,
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
import sidebarDoctorBg from '../assets/sidebar_vet_doctor.jpg';

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
    { id: 'cases', label: 'Clinical Cases', icon: FolderPlus },
    { id: 'videos', label: 'Short Videos', icon: Video },
    { id: 'messages', label: 'Messages', icon: MessageSquare, hasBadge: true },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'benefits', label: 'Member Benefits', icon: Award },
    { id: 'advertise', label: 'Advertise', icon: Megaphone },
    { id: 'profile', label: 'My Profile', icon: User }
  ];

  return (
    <aside className="left-sidebar">
      {/* Background Graphic Layers */}
      <div className="sidebar-bg-container" aria-hidden="true">
        <img
          src={sidebarDoctorBg}
          alt=""
          className="sidebar-doctor-bg-img"
        />
        <div className="sidebar-bg-overlay-grad" />
        
        {/* Subtle background paw print watermark */}
        <div className="sidebar-watermark-paw">
          <PawPrint size={56} strokeWidth={1.5} />
        </div>

        {/* Ambient layered curves at bottom right */}
        <svg
          className="sidebar-bottom-waves-svg"
          viewBox="0 0 200 110"
          fill="none"
          preserveAspectRatio="none"
        >
          <path d="M0,110 C70,75 130,90 200,30 L200,110 Z" fill="rgba(4, 52, 39, 0.65)" />
          <path d="M30,110 C95,80 150,92 200,50 L200,110 Z" fill="rgba(16, 185, 129, 0.28)" />
          <path d="M75,110 C130,90 165,96 200,72 L200,110 Z" fill="rgba(46, 229, 157, 0.22)" />
        </svg>
      </div>

      {/* Foreground Content */}
      <div className="sidebar-content-inner">
        {/* Brand Header with Official Zenve Golden Logo */}
        <div className="sidebar-brand-block">
          <img
            src={zenveLogo}
            alt="Zenve Vet Logo"
            className="sidebar-zenve-logo-img"
          />
          <div className="brand-text-block">
            <span className="brand-main-name">ZENVE VET</span>
            <div className="brand-main-subtitle">
              <span>THE PROFESSIONAL</span>
              <span>NETWORK</span>
            </div>
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
                    <Icon size={20} strokeWidth={isActive ? 2.2 : 1.85} />
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
          <p className="discover-kicker">DISCOVER & GROW</p>

          <a
            href="#scholarships"
            className="discover-nav-link"
            onClick={(e) => { e.preventDefault(); onTabSelect('benefits'); }}
          >
            <div className="nav-item-content">
              <Lightbulb size={19} strokeWidth={1.85} />
              <span>Innovation & Scholarships</span>
            </div>
            <ExternalLink size={14} className="discover-external-icon" />
          </a>

          <a
            href="#mentorship"
            className="discover-nav-link"
            onClick={(e) => { e.preventDefault(); onTabSelect('network'); }}
          >
            <div className="nav-item-content">
              <GraduationCap size={19} strokeWidth={1.85} />
              <span>Expert Mentorship</span>
            </div>
            <ExternalLink size={14} className="discover-external-icon" />
          </a>
        </div>

        {/* Bottom Promo Card */}
        <div
          className="sidebar-bottom-promo-card"
          onClick={() => onOpenBenefitsModal ? onOpenBenefitsModal() : onTabSelect('benefits')}
        >
          <div className="promo-header-row">
            <div className="promo-title-left">
              <Crown size={16} color="#fbbf24" strokeWidth={2.2} />
              <span>Your next chapter</span>
            </div>
            <ArrowRight size={15} color="#fbbf24" strokeWidth={2.2} />
          </div>
          <p className="promo-desc-text">
            Unlock specialized CME, networking and career growth.
          </p>
        </div>

        {/* Bottom Decorative Ornament */}
        <div className="sidebar-footer-ornament">
          <PawPrint size={15} color="#2ee59d" className="sidebar-footer-paw" />
          <div className="sidebar-footer-line" />
        </div>
      </div>
    </aside>
  );
}

export default LeftSidebar;
