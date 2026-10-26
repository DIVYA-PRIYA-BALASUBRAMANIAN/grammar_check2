// Service Worker for Zenve Vet Desktop, Laptop, Android & iOS Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming background push notifications
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Zenve Vet Notification', body: event.data.text() };
    }
  }

  const title = data.title || 'Zenve Vet Clinical Alert';
  const options = {
    body: data.body || 'New clinical update from peer veterinary practitioners.',
    icon: data.icon || '/favicon.svg',
    badge: '/favicon.svg',
    data: data.data || {},
    vibrate: [200, 100, 200],
    tag: data.tag || 'zenve-vet-alert',
    renotify: true,
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle clicking on desktop/Android notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetData = event.notification.data || {};
  const targetUrl = targetData.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus if tab already open
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NAVIGATE_NOTIFICATION',
            data: targetData
          });
          return client.focus();
        }
      }
      // Otherwise open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
