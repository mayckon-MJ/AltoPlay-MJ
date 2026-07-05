
const CACHE_NAME = 'autoplaymj-v1';
const ASSETS = [
  './',
  './index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instala o Service Worker e guarda o esqueleto inicial no cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Ativa o SW e limpa caches antigos automaticamente
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

// Intercepta as requisições e gerencia o cache dinâmico de imagens e mídias externas
self.addEventListener('fetch', (e) => {
  // Ignora chamadas que não sejam do tipo GET
  if (e.request.method !== 'GET') return;

  // Ignora links locais em formato data: ou blob:
  if (e.request.url.startsWith('data:') || e.request.url.startsWith('blob:')) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        // status 200 = sucesso local / status 0 = sucesso de servidores externos (imagens/CDNs)
        if (networkResponse.status === 200 || networkResponse.status === 0) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // Silencia erros caso o usuário fique sem internet e tente buscar um recurso novo
      });

      // Retorna o cache instantaneamente se existir, caso contrário aguarda a rede
      return cachedResponse || fetchPromise;
    })
  );
});
