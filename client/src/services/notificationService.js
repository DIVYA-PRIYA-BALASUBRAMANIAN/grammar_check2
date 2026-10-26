// Universal Cross-Platform Notification Service for Desktop, Laptop, Android & iOS

let swRegistration = null;

// Register Service Worker for Web Push & Mobile Android / iOS
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    swRegistration = reg;
    return reg;
  } catch (err) {
    console.warn('Service Worker registration skipped:', err);
    return null;
  }
};

// Listen for messages from Service Worker (e.g. notification click on Android/desktop)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'NAVIGATE_NOTIFICATION') {
      window.dispatchEvent(new CustomEvent('zenve-notification-click', {
        detail: event.data.data
      }));
    }
  });
}

// Gentle, high-end medical device chime using HTML5 Web Audio API
export const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Tone 1: 587.33Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: 880Hz (A5) harmonized chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.14, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (_) {
    // Audio context may be blocked prior to first user gesture
  }
};

// Check if browser notifications are supported
export const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

// Get current system permission status ('granted' | 'denied' | 'default')
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

// Request desktop & mobile system notification permission
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      playNotificationChime();
      showNotification({
        title: 'Zenve Vet Alerts Active',
        message: 'You will now receive notifications for uploaded reels, clinical cases, and messages on this device.',
        type: 'SYSTEM'
      });
    }
    return perm;
  } catch (err) {
    console.warn('Notification permission error:', err);
    return 'denied';
  }
};

// Show a cross-platform notification (System OS + In-App Toast + Sound)
export const showNotification = ({
  title,
  message,
  type = 'GENERAL', // 'REEL_UPLOAD' | 'CLINICAL_CASE_SHARED' | 'NEW_MESSAGE' | 'CONNECTION_REQUEST' | 'SYSTEM'
  senderName,
  senderAvatar,
  targetId,
  data = {},
  onClick
}) => {
  // 1. Play auditory chime
  playNotificationChime();

  // 2. Dispatch custom in-app event for interactive floating toast banner
  // (Works seamlessly across Android, iOS Safari, and Desktop even if system notifications are blocked)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zenve-notification', {
      detail: {
        id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: title || 'Zenve Vet Clinical Alert',
        message,
        type,
        senderName,
        senderAvatar,
        targetId,
        data,
        timestamp: new Date().toISOString(),
        onClick
      }
    }));
  }

  // 3. Trigger native OS notification (Windows Action Center / Mac Notification Banner / Android Shade / iOS 16.4+ Web Push)
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const options = {
        body: message,
        icon: senderAvatar || '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200],
        tag: `zenve-${type}-${targetId || Date.now()}`,
        renotify: true,
        data: { type, targetId, ...data }
      };

      if (swRegistration && 'showNotification' in swRegistration) {
        swRegistration.showNotification(title || 'Zenve Vet Alert', options);
      } else {
        const nativeNotif = new Notification(title || 'Zenve Vet Alert', options);
        nativeNotif.onclick = () => {
          window.focus();
          nativeNotif.close();
          if (onClick) onClick();
        };
      }
    } catch (e) {
      console.warn('Native notification trigger fallback:', e);
    }
  }
};

// Convenient Helpers
export const notifyReelUploaded = ({ doctorName, reelTitle, videoId, onSelectVideo }) => {
  showNotification({
    title: 'New Surgical Reel Uploaded',
    message: `${doctorName || 'A doctor'} uploaded a surgical reel: "${reelTitle || 'Clinical Demonstration'}"`,
    type: 'REEL_UPLOAD',
    senderName: doctorName,
    targetId: videoId,
    onClick: onSelectVideo
  });
};

export const notifyCaseShared = ({ doctorName, caseTitle, caseId, onSelectCase }) => {
  showNotification({
    title: 'New Clinical Case Shared',
    message: `${doctorName || 'A doctor'} shared a clinical case: "${caseTitle || 'Case Study'}"`,
    type: 'CLINICAL_CASE_SHARED',
    senderName: doctorName,
    targetId: caseId,
    onClick: onSelectCase
  });
};

export const sendTestNotification = () => {
  showNotification({
    title: 'Zenve Vet Notification Test',
    message: 'Notifications are active on this device for surgical reels, clinical cases, and peer messages.',
    type: 'SYSTEM'
  });
};
