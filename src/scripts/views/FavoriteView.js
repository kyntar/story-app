import { transitionToPage } from '../utils/helpers.js';

export default class FavoriteView {
    constructor() {
        this.pageId = 'favorites-page';
        this.view = document.getElementById(this.pageId);
        this.container = document.getElementById('favorite-stories-container');
        this.presenter = null;
        this._setupEventListeners();
    }

    setPresenter(presenter) {
        this.presenter = presenter;
    }

    // PERBAIKAN: Menambahkan metode yang hilang
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

    renderFavoriteStories(stories) {
        if (!stories || stories.length === 0) {
            this.container.innerHTML = '<div class="card"><p>You have no favorite stories yet. Add some from the Home page!</p></div>';
            return;
        }

        this.container.innerHTML = stories.map(story => `
            <article class="story-card">
              <img src="${story.photoUrl}" alt="Photo story by ${story.name}" class="story-image" loading="lazy">
              <div class="story-content">
                <h2 class="story-title">${story.name}</h2>
                <p class="story-description">${story.description}</p>
                <div class="story-meta">
                  <span>${new Date(story.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                <button class="favorite-button favorited" data-id="${story.id}" aria-label="Remove from favorites">
                  ❤️ Remove Favorite
                </button>
              </div>
            </article>
        `).join('');
    }

    _setupEventListeners() {
        this.container.addEventListener('click', (event) => {
            if (event.target.classList.contains('favorite-button')) {
                const storyId = event.target.dataset.id;
                const confirmation = confirm('Are you sure you want to remove this story from your favorites?');
                if (confirmation) {
                    this.presenter.handleRemoveFavorite(storyId);
                }
            }
        });
    }

    init() {
        if (this.presenter) {
            this.presenter.show();
        }
    }
}