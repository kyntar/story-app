import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// 1. Precache semua aset lokal (App Shell)
precacheAndRoute(self.__WB_MANIFEST);

// 2. Aturan caching untuk aset dari luar (seperti Leaflet CSS)
registerRoute(
  ({ url }) => url.href.startsWith('https://unpkg.com/leaflet@1.9.4/dist/'),
  new StaleWhileRevalidate({
    cacheName: 'leaflet-assets',
  }),
);

// 3. Aturan caching untuk gambar cerita dari API
registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/images/stories/'),
  new CacheFirst({
    cacheName: 'story-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Hari
      }),
    ],
  }),
);

// PERBAIKAN: Tambahkan strategi caching untuk response API stories
registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/v1/stories'),
  new StaleWhileRevalidate({
    cacheName: 'dicoding-stories-api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1, // Hanya cache 1 request terakhir (halaman pertama)
        maxAgeSeconds: 1 * 24 * 60 * 60, // 1 Hari
      }),
    ],
  })
);

// 4. Kode Push Notification (tidak ada perubahan)
self.addEventListener('push', (event) => {
  let notificationData = {};
  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = { title: 'Notifikasi Baru', body: event.data.text() };
  }

  const title = notificationData.title || 'Notifikasi Baru';
  const options = {
    body: notificationData.body || 'Ada pesan baru untuk Anda.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    data: { url: notificationData.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 5. Kode Aksi Klik Notifikasi (tidak ada perubahan)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    }),
  );
});