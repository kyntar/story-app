// src/scripts/views/HomeView.js

import { transitionToPage } from '../utils/helpers.js';

export default class HomeView {
    constructor() {
        this.pageId = 'home-page';
        this.view = document.getElementById(this.pageId);
        this.storiesContainer = document.getElementById('stories-container');
        this.loadingElement = document.getElementById('loading');
        this.mapContainer = document.getElementById('stories-map-container');
        this.map = null;
        
        // PERBAIKAN: Hapus pembuatan presenter dan service dari sini.
        // View seharusnya hanya fokus pada DOM.
        this.presenter = null; 
        this._setupEventListeners();
    }
    setPresenter(presenter) {
        this.presenter = presenter;
    }

    transitionToPage(callback) {
        transitionToPage(callback);
    }

    hideAllPages() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
    }

    showPage() {
        this.view.classList.add('active');
    }

    updateNavigation(activeRoute) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeRoute}`) {
                link.classList.add('active');
            }
        });
    }

    showLoading() {
        this.loadingElement.style.display = 'flex';
    }

    hideLoading() {
        this.loadingElement.style.display = 'none';
    }

    renderStories(stories) {
    if (!stories || stories.length === 0) {
      this.storiesContainer.innerHTML = '<div class="card"><p>Tidak ada cerita untuk ditampilkan.</p></div>';
      return;
    }
    // --- LOGIKA TAMPIL: MENAMPILKAN DATA & TOMBOL HAPUS ---
    this.storiesContainer.innerHTML = stories.map(story => `
      <article class="story-card">
        <img src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" class="story-image" loading="lazy">
        <div class="story-content">
          <h3 class="story-title">${story.name}</h3>
          <p class="story-description">${story.description}</p>
          <div class="story-meta">
            <span>${new Date(story.createdAt).toLocaleDateString('id-ID')}</span>
            ${story.lat && story.lon ? '<span>📍 Punya Lokasi</span>' : ''}
          </div>
          <button class="delete-button" data-id="${story.id}" aria-label="Hapus cerita ${story.name} dari cache">Hapus dari Cache</button>
        </div>
      </article>`).join('');
  }

    showError(message) {
        this.storiesContainer.innerHTML = `<div class="error">${message}</div>`;
    }
    
    hideMap() {
        if (this.mapContainer) this.mapContainer.style.display = 'none';
    }

    showMap() {
        if (this.mapContainer) this.mapContainer.style.display = 'block';
    }

    isMapInitialized() {
        return this.map !== null;
    }

    setMap(map) {
        this.map = map;
    }
    
    init() {
        // Pastikan presenter sudah di-set sebelum memanggil metodenya
        if (this.presenter) {
            this.presenter.show();
        } else {
            console.error("Presenter for HomeView has not been set.");
        }
    }
   _setupEventListeners() {
    // --- LOGIKA HAPUS: MENDENGARKAN KLIK PADA TOMBOL HAPUS ---
    this.storiesContainer.addEventListener('click', (event) => {
      if (event.target.classList.contains('delete-button')) {
        const storyId = event.target.dataset.id;
        const confirmation = confirm('Apakah Anda yakin ingin menghapus cerita ini dari cache offline?');
        if (confirmation) {
          this.presenter.handleDeleteStory(storyId);
        }
      }
    });
  }
}