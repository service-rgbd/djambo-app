const APP_SHELL_CACHE = 'djambo-shell-v3';
const RUNTIME_CACHE = 'djambo-runtime-v3';
const IMAGE_CACHE = 'djambo-images-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/favicon.svg',
  '/favicon.ico',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [APP_SHELL_CACHE, RUNTIME_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cacheName) => {
        if (!cacheWhitelist.includes(cacheName)) {
          return caches.delete(cacheName);
        }
        return Promise.resolve();
      })
    ))
  );
  self.clients.claim();
});

const isImageRequest = (request) => request.destination === 'image';
const isStaticAssetRequest = (requestUrl) => /\.(js|css|woff2?|ttf|otf|json)$/i.test(requestUrl.pathname);

const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse || networkFetch;
};

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (isImageRequest(event.request)) {
    event.respondWith(staleWhileRevalidate(event.request, IMAGE_CACHE));
    return;
  }

  if (requestUrl.origin === self.location.origin && isStaticAssetRequest(requestUrl)) {
    event.respondWith(staleWhileRevalidate(event.request, RUNTIME_CACHE));
    return;
  }

  if (requestUrl.origin === self.location.origin && event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
  }
});

self.addEventListener('push', (event) => {
  const payload = (() => {
    try {
      return event.data ? event.data.json() : {};
    } catch {
      return {};
    }
  })();

  const title = payload.title || 'Djambo';
  const body = payload.body || 'Une nouvelle mise a jour est disponible.';

  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/favicon-96x96.png',
    tag: payload.tag || 'djambo-notification',
    data: {
      url: payload.url || '/#/app/dashboard',
      ...(payload.data || {}),
    },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/#/app/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const matchingClient = clients.find((client) => 'focus' in client);
      if (matchingClient) {
        return matchingClient.navigate(targetUrl).then(() => matchingClient.focus());
      }

      return self.clients.openWindow(targetUrl);
    })
  );
});