import React, { useState, useEffect } from 'react';
import {
  Video,
  Stethoscope,
  MessageSquare,
  UserPlus,
  Bell,
  X,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Avatar } from './Avatar';

export function NotificationToast({ onNavigate }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNotification = (e) => {
      const notif = e.detail;
      if (!notif) return;

      setToasts((prev) => [notif, ...prev.slice(0, 2)]);

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== notif.id));
      }, 6000);
    };

    const handleSwClick = (e) => {
      const data = e.detail;
      if (data && onNavigate) {
        onNavigate(data);
      }
    };

    window.addEventListener('zenve-notification', handleNotification);
    window.addEventListener('zenve-notification-click', handleSwClick);

    return () => {
      window.removeEventListener('zenve-notification', handleNotification);
      window.removeEventListener('zenve-notification-click', handleSwClick);
    };
  }, [onNavigate]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'REEL_UPLOAD':
        return <Video size={16} color="#059669" />;
      case 'CLINICAL_CASE_SHARED':
        return <Stethoscope size={16} color="#0284c7" />;
      case 'NEW_MESSAGE':
        return <MessageSquare size={16} color="#2563eb" />;
      case 'CONNECTION_REQUEST':
        return <UserPlus size={16} color="#d97706" />;
      default:
        return <Bell size={16} color="#003822" />;
    }
  };

  const getActionButtonLabel = (type) => {
    switch (type) {
      case 'REEL_UPLOAD':
        return 'Watch Reel';
      case 'CLINICAL_CASE_SHARED':
        return 'Review Case';
      case 'NEW_MESSAGE':
        return 'Reply in Chat';
      case 'CONNECTION_REQUEST':
        return 'View Request';
      default:
        return 'View';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="notification-toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="notification-toast-item"
          onClick={() => {
            if (toast.onClick) toast.onClick();
            removeToast(toast.id);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {toast.senderAvatar ? (
              <Avatar
                src={toast.senderAvatar}
                name={toast.senderName || 'Doctor'}
                size={38}
                fontSize={14}
                style={{ flexShrink: 0 }}
              />
            ) : (
              <div className="notification-toast-icon-wrap">
                {getIcon(toast.type)}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span className="notification-toast-title">
                  {toast.title}
                </span>
                <button
                  type="button"
                  className="notification-toast-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  title="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </div>

              <p className="notification-toast-body">
                {toast.message}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>
                  Just now · Zenve Alert
                </span>
                <span className="notification-toast-action-btn">
                  <span>{getActionButtonLabel(toast.type)}</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </div>

          {/* Animated Countdown Progress Bar */}
          <div className="notification-toast-progress" />
        </div>
      ))}
    </div>
  );
}
