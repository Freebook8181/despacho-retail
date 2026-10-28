/* Service worker mínimo para COMEX QD (PWA).
   Estrategia: "network-first" para que SIEMPRE se vean los datos más nuevos
   cuando hay internet, y respaldo en caché cuando no hay conexión. */
const CACHE='comexqd-v1';
const SHELL=['./comexqd.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL).catch(()=>{})));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'){return;}
  const url=new URL(req.url);
  // Solo gestionamos lo del mismo origen (la propia app); el resto (CDNs, Firebase) pasa directo.
  if(url.origin!==self.location.origin){return;}
  e.respondWith(
    fetch(req).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match(req).then(r=>r||caches.match('./comexqd.html')))
  );
});
