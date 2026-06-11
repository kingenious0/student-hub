const CACHE_NAME = 'lahustle-cache-v2';

const PRECACHE_ASSETS = [
  '/',
  '/lahustle-icon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/LaHustle-Official_logo.svg',
  '/Lahustle Logo Official.png',
  '/manifest.json',
  '/services',
  '/notifications',
  '/settings',
  '/cart',
  '/profile',
  '/deals',
  '/wishlist',
  '/orders',
  '/become-vendor',
  '/help',
  '/about',
  '/privacy',
  '/terms',
  '/category/more',
  '/category/food-and-snacks',
  '/category/tech-and-gadgets',
  '/category/books-and-notes',
  '/category/fashion',
  '/category/services',
  '/category/everything-else'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.all(
        PRECACHE_ASSETS.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('LaHustle SW: Optional precache failed for ' + url, err);
          });
        })
      );
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
          .map(function(n) { return caches.delete(n); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Specific API feeds for offline browsing: Network first, then Cache fallback
  if (
    url.pathname.startsWith('/api/marketplace/discovery') ||
    url.pathname.startsWith('/api/products') ||
    url.pathname.startsWith('/api/services')
  ) {
    event.respondWith(
      fetch(event.request).then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(function() {
        return caches.match(event.request);
      })
    );
  }
  // 2. Generic API calls: Network only (with catch fallback)
  else if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request);
      })
    );
  } 
  // 3. Static assets & Images (local and external like Cloudinary): Cache First, then Network
  else if (
    url.pathname.startsWith('/_next/static/') ||
    event.request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|css|js|webp|ico)$/) ||
    event.request.url.includes('cloudinary.com') ||
    event.request.url.includes('res.cloudinary.com')
  ) {
    event.respondWith(
      caches.match(event.request).then(function(cachedResponse) {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then(function(networkResponse) {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
  } 
  // 4. Pages/HTML: Network First, then Cache
  else {
    event.respondWith(
      fetch(event.request).then(function(networkResponse) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(function() {
        return caches.match(event.request).then(function(cachedResponse) {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
        });
      })
    );
  }
});

self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: 'LaHustle Update',
      body: event.data ? event.data.text() : ''
    };
  }
  const options = {
    body: data.body || '',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    silent: false,
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(data.title || 'OMNI', options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
