const APP_SHELL_CACHE = 'fleet-command-shell-v2';
const RUNTIME_CACHE = 'fleet-command-runtime-v2';
const IMAGE_CACHE = 'fleet-command-images-v2';
const urlsToCache = ['./', './index.html', './manifest.json'];

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
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
  }
});
