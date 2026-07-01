const CACHE_NAME = "sinity-finance-v1";

function getBasePath() {
  const path = self.location.pathname;
  if (path.endsWith("/sw.js")) {
    return path.slice(0, -"/sw.js".length);
  }
  return "";
}

const BASE = getBasePath();

const APP_SHELL = [
  `${BASE}/`,
  `${BASE}/login/`,
  `${BASE}/register/`,
  `${BASE}/dashboard/`,
  `${BASE}/accounts/`,
  `${BASE}/assistant/`,
  `${BASE}/budget/`,
  `${BASE}/goals/`,
  `${BASE}/invoices/`,
  `${BASE}/invoices/pemasukkan/`,
  `${BASE}/invoices/pengeluaran/`,
  `${BASE}/profile/`,
  `${BASE}/reports/`,
  `${BASE}/settings/`,
  `${BASE}/manifest.webmanifest`,
  `${BASE}/offline.html`,
  `${BASE}/icon-192.svg`,
  `${BASE}/icon-512.svg`,
  `${BASE}/apple-touch-icon.svg`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const isNavigation = request.mode === "navigate";

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(`${BASE}/offline.html`);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (request.url.startsWith(self.location.origin)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
