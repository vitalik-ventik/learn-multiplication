importScripts("version.js");

// Основний кеш версіонується: при зміні APP_VERSION у version.js старий видаляється.
const CACHE = "math-app-v" + self.APP_VERSION;
// Тваринки кешуються по мірі показу й переживають оновлення версії.
const MEDIA_CACHE = "math-media-v1";

const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.js",
  "./vendor/confetti.browser.min.js",
  "./fonts/nunito-latin.woff2",
  "./fonts/nunito-cyrillic.woff2",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./sounds/click.mp3",
  "./sounds/correct.mp3",
  "./sounds/wrong.mp3",
  "./sounds/perfect.mp3"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE && key !== MEDIA_CACHE).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Анімації тваринок: з кешу, а якщо немає — з мережі з подальшим збереженням
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(MEDIA_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

// Решта: одразу віддаємо з кешу, а в фоні оновлюємо з мережі.
// Так нова версія index.html підхоплюється при наступному запуску навіть без зміни версії.
async function staleWhileRevalidate(event) {
  const request = event.request;
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreSearch: request.mode === "navigate" });
  const network = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached || Response.error());

  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return network;
}

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (/\/(animals|gifs)\//.test(url.pathname)) {
    e.respondWith(cacheFirst(e.request));
  } else {
    e.respondWith(staleWhileRevalidate(e));
  }
});
