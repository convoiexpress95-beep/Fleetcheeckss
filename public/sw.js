// Service Worker minimal pour notifications push uniquement (pas de cache)

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(self.skipWaiting());
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      console.error('Error parsing push data:', error);
      data = {
        title: 'FleetCheck',
        body: 'Vous avez une nouvelle notification',
        icon: '/icon-192x192.png',
      };
    }
  }

  const options = {
    body: data.body || 'Nouvelle notification',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    data: data.data || {},
    actions: data.actions || [
      {
        action: 'open',
        title: 'Ouvrir',
        icon: '/icon-192x192.png'
      }
    ],
    requireInteraction: true,
    silent: false,
    tag: data.tag || 'fleetcheck-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'FleetCheck', options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};
  
  let url = '/dashboard';
  if (data.url) {
    url = data.url;
  } else if (data.mission_id) {
    url = `/missions/${data.mission_id}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Chercher une fenêtre existante avec l'URL
        for (const client of clientList) {
          if (client.url.includes(url.split('?')[0]) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Ouvrir une nouvelle fenêtre si aucune n'existe
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Gestion des notifications fermées
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Ici on pourrait envoyer des analytics sur les notifications fermées
  const data = event.notification.data || {};
  
  // Envoyer un événement d'analytics si nécessaire
  if (data.track_close) {
    // Implémenter le tracking ici
  }
});

// Pas d'interception fetch: laisser le navigateur gérer pour éviter les incohérences de cache sur Chrome