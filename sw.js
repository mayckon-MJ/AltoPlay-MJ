
const CACHE_NAME = 'autoplaymj-v1';
const ASSETS = [
  './',
  './index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instala o Service Worker e guarda o esqueleto do app no cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Ativa o SW e limpa caches antigos se houverem atualizações
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Estratégia de Cache: Serve do cache se existir, senão busca na rede e salva
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // Evita tentar cachear esquemas de arquivos locais temporários (blob: ou data:)
  if (e.request.url.startsWith('data:') || e.request.url.startsWith('blob:')) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).then((networkResponse) => {
        // Faz o cache se a resposta for bem-sucedida (status 200 ou 0 para CDNs externos)
        if (networkResponse.status === 200 || networkResponse.status === 0) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // Silencia falhas de rede se estiver offline
      });
    })
  );
});
