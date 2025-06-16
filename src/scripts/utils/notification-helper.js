// src/scripts/utils/notification-helper.js

import ApiService from '../services/ApiService.js'; // Impor ApiService

// Fungsi ini diperlukan untuk mengonversi VAPID public key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const NotificationHelper = {
  async subscribeToPushManager() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push Messaging tidak didukung oleh browser ini.');
      return;
    }

    // PERBAIKAN: Cek apakah pengguna sudah login sebelum subscribe
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Anda harus login terlebih dahulu untuk mengaktifkan notifikasi.');
        return;
    }

    try {
      const permissionResult = await Notification.requestPermission();
      if (permissionResult !== 'granted') {
        console.log('Izin notifikasi tidak diberikan.');
        return;
      }
      
      const registration = await navigator.serviceWorker.ready;
      
      // PERBAIKAN: Gunakan VAPID Public Key dari dokumentasi
      const vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      console.log('✅ Berhasil subscribe!', subscription);

      // PERBAIKAN: Kirim objek subscription ke server API
      const apiService = new ApiService();
      await apiService.subscribeToNotifications(subscription);
      alert('Berhasil mengaktifkan notifikasi!');

    } catch (error) {
      console.error('❌ Gagal melakukan subscribe:', error);
      alert('Gagal mengaktifkan notifikasi. Coba lagi nanti.');
    }
  },

  init({ button }) {
    if (!button) return;
    
    button.addEventListener('click', (event) => {
      event.preventDefault();
      this.subscribeToPushManager();
    });
  },
};

export default NotificationHelper;