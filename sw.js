const CACHE = "math-app-v1.7";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll([
        "./",
        "./index.html",
        "./manifest.json",
        "./icon-192.png",
        "./icon-512.png",        
        "./sounds/click.mp3",
        "./sounds/correct.mp3",
        "./sounds/wrong.mp3",
        "./sounds/perfect.mp3",
        './gifs/01.gif',
        './gifs/02.gif',
        './gifs/03.gif',
        './gifs/04.gif',
        './gifs/05.gif',
        './gifs/06.gif',
        './gifs/07.gif',
        './gifs/08.gif',
        './gifs/09.gif',
        './gifs/10.gif',
        './gifs/11.gif',
        './gifs/12.gif',
        './gifs/13.gif',
        './gifs/14.gif',
        './gifs/15.gif',
        './gifs/16.gif',
        './gifs/17.gif',
        './gifs/18.gif',
        './gifs/19.gif',
        './gifs/20.gif',
        './gifs/21.gif',
        './gifs/22.gif',
        './gifs/23.gif',
        './gifs/24.gif',
        './gifs/25.gif',
        './gifs/26.gif',
        './gifs/27.gif',
        './gifs/28.gif',
        './gifs/29.gif',
        './gifs/30.gif',
        './gifs/31.gif',
        './gifs/32.gif',
        './gifs/33.gif',
        './gifs/34.gif',
        './gifs/35.gif',
        './gifs/36.gif',
        './gifs/37.gif',
        './gifs/38.gif',
        './gifs/39.gif',
        './gifs/40.gif',
        './gifs/41.gif',
        './gifs/42.gif',
        './gifs/43.gif',
        './gifs/44.gif',
        './gifs/45.gif',
        './gifs/46.gif',
        './gifs/47.gif',
        './gifs/48.gif',
        './gifs/49.gif',
        './gifs/50.gif'
      ]);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(

    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE)
            .map(key => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});