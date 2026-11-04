const THUMBNAIL_CACHE = 'mapsok-thumbnails-v1';
const MAX_THUMBNAILS = 500;

function isThumbnailRequest(request) {
  if (request.destination !== 'image') {
    return false;
  }

  try {
    const url = new URL(request.url);
    return url.hostname === 'dc.library.okstate.edu'
      && url.pathname.includes('/iiif/2/');
  } catch {
    return false;
  }
}

async function trimThumbnailCache(cache) {
  const requests = await cache.keys();
  if (requests.length <= MAX_THUMBNAILS) {
    return;
  }

  const excess = requests.length - MAX_THUMBNAILS;
  await Promise.all(requests.slice(0, excess).map((request) => cache.delete(request)));
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (!isThumbnailRequest(event.request)) {
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(THUMBNAIL_CACHE);
    const cachedResponse = await cache.match(event.request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(event.request);
    if (networkResponse.ok && networkResponse.type !== 'opaque') {
      await cache.put(event.request, networkResponse.clone());
      await trimThumbnailCache(cache);
    }

    return networkResponse;
  })());
});
