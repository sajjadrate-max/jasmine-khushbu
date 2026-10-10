// چمبیلی خوشبو ایپ — آف لائن اور انسٹال کے لیے
const C = 'khushbu-v1';
const CORE = ['khushbu.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  // صفحہ: پہلے انٹرنیٹ سے تازہ (تاکہ اپ ڈیٹ فوراً آئے)، نہ ملے تو محفوظ کاپی
  if (r.mode === 'navigate' || u.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; })
        .catch(() => caches.match(r).then(m => m || caches.match('khushbu.html')))
    );
    return;
  }
  // باقی چیزیں (آئیکن، فونٹ): پہلے محفوظ کاپی، نہ ہو تو انٹرنیٹ
  e.respondWith(
    caches.match(r).then(m => m || fetch(r).then(res => {
      if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); }
      return res;
    }))
  );
});
