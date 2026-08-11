/* つくる手帖 ── キャッシュはオリジン単位で共有されます。
   github.io は全リポジトリが同じオリジンなので、
   自分の名前空間（TT_NS）のものだけを消します。 */
/* 方眼ソリティア Service Worker */
const TT_NS = 'tt:solitaire:';
const TT_OLD = 'hougan-solitaire-v2';   /* 旧名。次の更新のときに消して構いません */
const CACHE = TT_NS + 'v2';
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => (k.startsWith(TT_NS) || k === TT_OLD) && k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && new URL(e.request.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      });
    })
  );
});
