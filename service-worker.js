const CACHE_NAME = 'ore-dipendenti-v4';  // ← Incrementato per forzare aggiornamento
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './firebase-config.js',
  './icon-192.png',
  './icon-512.png'
];

// Installazione del Service Worker
self.addEventListener('install', (event) => {
  // Forza l'attivazione immediata
  self.skipWaiting();
  
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
  // Prendi controllo immediato di tutte le pagine
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
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Intercettazione delle richieste
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // SEMPRE dalla rete per Firebase e file JS/HTML (dati dinamici)
  if (url.hostname.includes('firebase') || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.html') ||
      url.pathname === './' ||
      url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Aggiorna la cache con la nuova versione
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Se offline, usa la cache come fallback
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Cache-first solo per CSS e immagini (risorse statiche)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
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
    icon: './icon-192.png',
    badge: './badge-72.png',
    vibrate: [200, 100, 200],
    tag: 'ore-reminder',
    requireInteraction: false,
    data: {
      url: data.url || './'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url || './';
  
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
