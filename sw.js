
const CACHE_NAME = 'autoplaymj-v1';
const ASSETS = [
  './',
  './index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instala o Service Worker e guarda o esqueleto do app no cache.
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

// Estratégia de Cache: Serve o que está salvo para carregar instantaneamente,
// mas busca na rede para atualizar caso o usuário mude o código do index.html.

self.addEventListener('fetch', (e) => {
  // Ignora chamadas que não são GET (como POST/PUT)
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Se estiver no cache, retorna ele. Se não, busca na rede.
      return cachedResponse || fetch(e.request).then((networkResponse) => {
        // Só faz cache de respostas válidas (status 200)
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
