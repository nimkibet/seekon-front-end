self.addEventListener('push', function(event) {
  const data = event.data ? JSON.parse(event.data.text()) : {};
  const title = data.title || 'Seekon Admin';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/icon-192x192.svg',
    badge: '/icon-192x192.svg'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/admin')
  );
});
