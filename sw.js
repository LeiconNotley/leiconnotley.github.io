/* Service worker — caches the app shell so the register keeps working
   if the connection drops. The QR engine is loaded from a CDN and is
   cached opportunistically on first successful load. */
const CACHE = "payid-register-twc-v2";
const SHELL = [
  "./",
  "./index.html",
  "./pay.html",
  "./assets/styles.css",
  "./assets/app.js",
  "./assets/pay.js",
  "./assets/emv.js",
  "./manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  e.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          // Cache same-origin + CDN QR library for offline reuse.
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
