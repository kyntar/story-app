import '../styles/main.css';
import NotificationHelper from './utils/notification-helper.js'; 
import HomePresenter from './presenters/HomePresenter.js';
import AddStoryPresenter from './presenters/AddStoryPresenter.js';
import AuthPresenter from './presenters/AuthPresenter.js';
import StoryModel from './models/StoryModel.js';
import UserModel from './models/UserModel.js';
import Router from './core/Router.js';
import CameraService from './services/CameraService.js';
import MapService from './services/MapService.js';
import AddStoryView from './views/AddStoryView.js';
import HomeView from './views/HomeView.js';
import AuthView from './views/AuthView.js';

// BARU: Impor untuk fitur Favorites
import FavoriteView from './views/FavoriteView.js';
import FavoritePresenter from './presenters/FavoritePresenter.js';

// --- Inisialisasi Komponen Aplikasi ---
const storyModel = new StoryModel();
const userModel = new UserModel();
const homeView = new HomeView();
const addStoryView = new AddStoryView();
const authView = new AuthView();
const favoriteView = new FavoriteView(); // BARU
const router = new Router();
const mapService = new MapService();
const cameraService = new CameraService();

const homePresenter = new HomePresenter(homeView, storyModel, mapService, userModel);
const addStoryPresenter = new AddStoryPresenter(addStoryView, storyModel, mapService, cameraService, router, userModel);
const authPresenter = new AuthPresenter(authView, userModel, storyModel, router);
const favoritePresenter = new FavoritePresenter(favoriteView); // BARU

homeView.setPresenter(homePresenter);
favoriteView.setPresenter(favoritePresenter); // BARU

// --- Konfigurasi Rute ---
router.addRoute('home', homePresenter);
router.addRoute('favorites', favoritePresenter); // BARU
router.addRoute('add-story', addStoryPresenter);
router.addRoute('login', { show: () => authPresenter.showLogin() });
router.addRoute('register', { show: () => authPresenter.showRegister() });
router.addRoute('logout', { show: () => authPresenter.logout() });

// --- Fungsi Global untuk Sinkronisasi UI ---
window.updateUI = function () {
  const isAuthenticated = userModel.isAuthenticated();
  const authLink = document.getElementById('auth-link');
  const addStoryLink = document.querySelector('a[href="#add-story"]');
  const favoritesLink = document.querySelector('a[href="#favorites"]'); // BARU

  if (isAuthenticated) {
    const user = userModel.getCurrentUser();
    if (authLink) {
      authLink.textContent = `Logout (${user.name})`;
      authLink.href = '#logout';
    }
    if (addStoryLink) addStoryLink.parentElement.style.display = 'list-item';
    if (favoritesLink) favoritesLink.parentElement.style.display = 'list-item'; // BARU
  } else {
    if (authLink) {
      authLink.textContent = 'Login';
      authLink.href = '#login';
    }
    if (addStoryLink) addStoryLink.parentElement.style.display = 'none';
    if (favoritesLink) favoritesLink.parentElement.style.display = 'none'; // BARU
  }
};

// --- Event Listener Utama Aplikasi ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = e.target.getAttribute('href');
      if (href?.startsWith('#')) {
        e.preventDefault();
        router.navigate(href.slice(1));
      }
    });
  });

  const authLink = document.getElementById('auth-link');
  if (authLink) {
    authLink.addEventListener('click', (e) => {
      if (authLink.getAttribute('href') === '#logout') {
        e.preventDefault();
        authPresenter.logout();
      }
    });
  }

  const notificationButton = document.getElementById('notificationButton');
  if (notificationButton) {
    NotificationHelper.init({ button: notificationButton });
  }

  window.updateUI();
  router.start();

  if (!window.location.hash) {
    router.navigate('home');
  }
});

// --- Cleanup dan Service Worker ---
window.addEventListener('beforeunload', () => {
  cameraService?.stopCamera?.();
  router?.destroy?.();
});

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('✅ Service Worker registered in production'))
      .catch((error) => console.log('Service Worker registration failed:', error));
  });
} else {
  console.log('Development mode: Service Worker not registered.');
}