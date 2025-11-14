const CACHE_NAME = 'ore-dipendenti-v2';
const urlsToCache = [
  '/ore_dipendenti/',
  '/ore_dipendenti/index.html',
  '/ore_dipendenti/styles.css',
  '/ore_dipendenti/app.js',
  '/ore_dipendenti/firebase-config.js'
];

// Installazione del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aperta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Attivazione del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Rimozione cache vecchia:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Intercettazione delle richieste
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - ritorna la risposta dalla cache
        if (response) {
          return response;
        }
        // Altrimenti fetch dalla rete
        return fetch(event.request).then(
          (response) => {
            // Controlla se la risposta è valida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona la risposta
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Promemoria Ore';
  const options = {
    body: data.body || 'Ricordati di inserire le tue ore!',
    icon: '/ore_dipendenti/icon-192.png',
    badge: '/ore_dipendenti/badge-72.png',
    vibrate: [200, 100, 200],
    tag: 'ore-reminder',
    requireInteraction: false,
    data: {
      url: data.url || '/ore_dipendenti/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url || '/ore_dipendenti/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se c'è già una finestra aperta, la focalizza
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Altrimenti apri una nuova finestra
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
