// Simpan sebagai: src/sw.js

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'; // <-- Tambahkan CacheFirst
import { ExpirationPlugin } from 'workbox-expiration'; // <-- Tambahkan ExpirationPlugin

// 1. Precache semua aset lokal (App Shell) yang dihasilkan Webpack.
precacheAndRoute(self.__WB_MANIFEST);

// 2. Aturan caching untuk aset dari luar (seperti Leaflet CSS)
registerRoute(
  ({ url }) => url.href.startsWith('https://unpkg.com/leaflet@1.9.4/dist/'),
  new StaleWhileRevalidate({
    cacheName: 'leaflet-assets',
  }),
);

// ======================================================================
// BARU: Tambahkan strategi caching untuk gambar cerita dari API
registerRoute(
  // Aturan untuk mencocokkan URL gambar dari API Dicoding
  ({ url }) => url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/images/stories/'),

  // Gunakan strategi CacheFirst: sajikan dari cache dulu jika ada.
  new CacheFirst({
    cacheName: 'story-images',
    plugins: [
      // Atur agar cache tidak terlalu besar dan tidak menyimpan gambar selamanya
      new ExpirationPlugin({
        maxEntries: 50, // Hanya simpan 50 gambar terakhir
        maxAgeSeconds: 30 * 24 * 60 * 60, // Simpan cache selama 30 hari
      }),
    ],
  }),
);
// ======================================================================

// 3. Kode Push Notification Anda (tidak ada perubahan, sudah benar)
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

// 4. Kode Aksi Klik Notifikasi (tidak ada perubahan, sudah benar)
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