const CACHE_NAME = "kanamono-v2";
const urlsToCache = [
  "./",
  "./index.html"
];

// 初回キャッシュ
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// 古いキャッシュ削除
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// fetch制御
self.addEventListener("fetch", event => {
  const req = event.request;

  // data.json は常に最新
  if (req.url.includes("data.json")) {
    event.respondWith(fetch(req));
    return;
  }

  // HTMLはネット優先
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // その他はキャッシュ優先
  event.respondWith(
    caches.match(req).then(res => res || fetch(req))
  );
});
