const CACHE_NAME = "kovid-portfolio-v7";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./achievements.html",
  "./achievements.css",
  "./achievements.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./images/bb-custom-name.png",
  "./images/bb-heisenberg.png",
  "./images/bb-science-cat.png",
  "./images/bb-custom-name.png?v=2",
  "./images/bb-heisenberg.png?v=2",
  "./images/bb-science-cat.png?v=2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned)).catch(() => {});
          return networkResponse;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
