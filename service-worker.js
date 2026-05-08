const CACHE_NAME = 'woshite-offline-v1';

const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './service-worker.js',

  // アイコン
  './icons/icon-192.png',
  './icons/icon-512.png',

  // JSON
  './data/aya-list.json',

  './data/hotsuma_aya00.json',
  './data/hotsuma_aya01.json',
  './data/hotsuma_aya02.json',
  './data/hotsuma_aya03.json',
  './data/hotsuma_aya04.json',
  './data/hotsuma_aya05.json',
  './data/hotsuma_aya06.json',
  './data/hotsuma_aya07.json',
  './data/hotsuma_aya08.json',
  './data/hotsuma_aya09.json',

  './data/hotsuma_aya10.json',
  './data/hotsuma_aya11.json',
  './data/hotsuma_aya12.json',
  './data/hotsuma_aya13.json',
  './data/hotsuma_aya14.json',
  './data/hotsuma_aya15.json',
  './data/hotsuma_aya16.json',
  './data/hotsuma_aya17.json',
  './data/hotsuma_aya18.json',

  './data/hotsuma_aya19i.json',
  './data/hotsuma_aya19Ro.json',

  './data/hotsuma_aya20.json',
  './data/hotsuma_aya21.json',
  './data/hotsuma_aya22.json',
  './data/hotsuma_aya23.json',
  './data/hotsuma_aya24.json',
  './data/hotsuma_aya25.json',
  './data/hotsuma_aya26.json',
  './data/hotsuma_aya27.json',
  './data/hotsuma_aya28.json',
  './data/hotsuma_aya29.json',

  './data/hotsuma_aya30.json',
  './data/hotsuma_aya31.json',
  './data/hotsuma_aya32.json',
  './data/hotsuma_aya33.json',
  './data/hotsuma_aya34.json',
  './data/hotsuma_aya35.json',
  './data/hotsuma_aya36.json',
  './data/hotsuma_aya37.json',
  './data/hotsuma_aya38.json',
  './data/hotsuma_aya39.json',
  './data/hotsuma_aya40.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {

      for (const file of CACHE_FILES) {
        try {
          await cache.add(file);
          console.log('Cached:', file);
        } catch (err) {
          console.error('Failed:', file, err);
        }
      }

    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});