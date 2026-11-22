// چمبیلی خوشبو ایپ — آف لائن اور انسٹال کے لیے
const C = 'khushbu-v6';
const CORE = ['khushbu.html', 'jism-khushbu.html', 'app-nav.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
// باہر کی فائلیں جو بغیر انٹرنیٹ بھی چاہییں: Firebase لائبریری اور فونٹ
const EXT = [
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js',
  'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@600;700&family=Noto+Naskh+Arabic:wght@400;600;700&family=IBM+Plex+Sans:wght@400;600&display=swap'
];
// صرف یہ جگہیں محفوظ کی جائیں؛ Firebase کا لائیو ڈیٹا (firestore.googleapis.com) کبھی نہیں
const CACHE_HOSTS = ['www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => Promise.all([
    c.addAll(CORE).catch(() => {}),
    ...EXT.map(u => fetch(new Request(u, { mode: 'no-cors' })).then(res => c.put(u, res)).catch(() => {}))
  ])));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// انٹرنیٹ سست ہو تو 4 سیکنڈ بعد محفوظ کاپی دکھا دیں
const timeout = (p, ms) => new Promise((ok, no) => { const t = setTimeout(() => no(new Error('timeout')), ms); p.then(v => { clearTimeout(t); ok(v); }, x => { clearTimeout(t); no(x); }); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const same = u.origin === self.location.origin;
  if (!same && !CACHE_HOSTS.includes(u.hostname)) return;
  // صفحہ: پہلے انٹرنیٹ سے تازہ (تاکہ اپ ڈیٹ فوراً آئے)، نہ ملے تو محفوظ کاپی
  if (same && (r.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('.js'))) {
    const net = fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); } return res; });
    e.respondWith(
      timeout(net, 4000).catch(() => caches.match(r, { ignoreSearch: true })
        .then(m => m || (r.mode === 'navigate' ? caches.match('khushbu.html') : null))
        .then(m => m || net))
    );
    return;
  }
  // باقی چیزیں (آئیکن، فونٹ، Firebase لائبریری): پہلے محفوظ کاپی، نہ ہو تو انٹرنیٹ
  e.respondWith(
    caches.match(r).then(m => m || fetch(r).then(res => {
      if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); }
      return res;
    }))
  );
});
