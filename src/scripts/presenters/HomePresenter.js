import DbHelper from '../utils/db-helper.js';

export default class HomePresenter {
    constructor(view, storyModel, mapService, userModel) {
        this.view = view;
        this.model = storyModel;
        this.mapService = mapService;
        this.userModel = userModel;
        this.favoriteIds = new Set();
    }

    async show() {
        this.view.transitionToPage(() => {
            this.view.hideAllPages();
            this.view.showPage();
            this.view.updateNavigation('home');
        });

        if (this.userModel.isAuthenticated() && navigator.onLine) {
            this.view.showMap();
            this.initStoriesMap();
        } else {
            this.view.hideMap();
        }

        await this.loadStories();
    }

    async loadStories() {
        this.view.showLoading();
        try {
            // PERBAIKAN: Selalu ambil data dari API jika online.
            // Service Worker akan menyajikannya dari cache jika tersedia & sesuai strategi.
            if (navigator.onLine) {
                console.log('Online: Fetching stories from API...');
                const stories = await this.model.fetchStories();
                await this.loadFavorites(); // Muat ID favorit dari DB
                this.view.renderStories(stories, this.favoriteIds);
            } else {
                this.view.showError('You are offline. Please check your connection. Your favorite stories are available on the Favorites page.');
            }
        } catch (error) {
            this.view.showError(`Failed to load stories: ${error.message}`);
        } finally {
            this.view.hideLoading();
        }
    }

    // BARU: Memuat daftar ID cerita favorit dari IndexedDB
    async loadFavorites() {
        const favoriteStories = await DbHelper.getAllStories();
        this.favoriteIds = new Set(favoriteStories.map(story => story.id));
    }

    // PERBAIKAN: Logika untuk menambah/menghapus favorit
    async handleToggleFavorite(id) {
        try {
            if (this.favoriteIds.has(id)) {
                // Jika sudah favorit, hapus
                await DbHelper.deleteStory(id);
                alert('Story removed from favorites.');
            } else {
                // Jika belum, tambahkan
                const storyToSave = this.model.getStoryById(id);
                if (storyToSave) {
                    await DbHelper.putStory(storyToSave);
                    alert('Story added to favorites!');
                }
            }
            // Muat ulang cerita untuk memperbarui tampilan tombol
            await this.loadStories();
        } catch (error) {
            alert('Operation failed.');
            console.error('Failed to toggle favorite:', error);
        }
    }
    
    initStoriesMap() {
        setTimeout(async () => {
            if (!this.view.isMapInitialized()) {
                const map = this.mapService.initMap('stories-map');
                this.view.setMap(map);
            }
            try {
                const stories = await this.model.fetchStories();
                stories.forEach(story => {
                    const lat = story.lat ?? story.latitude;
                    const lon = story.lon ?? story.longitude;
                    if (lat && lon) {
                        this.mapService.addMarker('stories-map', lat, lon, 
                            `<div><h4>${story.name || 'Story'}</h4><p>${story.description.substring(0, 50)}...</p></div>`
                        );
                    }
                });
            } catch (error) {
                console.error('Error loading stories for map:', error);
            }
        }, 100);
    }
}