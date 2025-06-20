import { transitionToPage } from '../utils/helpers.js';

export default class HomeView {
    constructor() {
        this.pageId = 'home-page';
        this.view = document.getElementById(this.pageId);
        this.storiesContainer = document.getElementById('stories-container');
        this.loadingElement = document.getElementById('loading');
        this.mapContainer = document.getElementById('stories-map-container');
        this.map = null;
        this.presenter = null; 
        
        this._setupEventListeners();
    }

    setPresenter(presenter) {
        this.presenter = presenter;
    }

    // PERBAIKAN: Menambahkan kembali metode yang hilang
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

    renderStories(stories, favoriteIds = new Set()) {
        if (!stories || stories.length === 0) {
            this.storiesContainer.innerHTML = '<div class="card"><p>No stories to display.</p></div>';
            return;
        }
        
        this.storiesContainer.innerHTML = stories.map(story => {
            const isFavorited = favoriteIds.has(story.id);
            return `
            <article class="story-card">
              <img src="${story.photoUrl}" alt="Photo story by ${story.name}" class="story-image" loading="lazy">
              <div class="story-content">
                <h2 class="story-title">${story.name}</h2>
                <p class="story-description">${story.description}</p>
                <div class="story-meta">
                  <span>${new Date(story.createdAt).toLocaleDateString('id-ID')}</span>
                  ${story.lat && story.lon ? '<span>📍 Has Location</span>' : ''}
                </div>
                <button 
                  class="favorite-button ${isFavorited ? 'favorited' : ''}" 
                  data-id="${story.id}" 
                  aria-label="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
                  ❤️ ${isFavorited ? 'Favorited' : 'Favorite'}
                </button>
              </div>
            </article>`;
        }).join('');
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
        if (this.presenter) {
            this.presenter.show();
        } else {
            console.error("Presenter for HomeView has not been set.");
        }
    }

    _setupEventListeners() {
        this.storiesContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('favorite-button')) {
                const storyId = event.target.dataset.id;
                this.presenter.handleToggleFavorite(storyId);
            }
        });
    }
}