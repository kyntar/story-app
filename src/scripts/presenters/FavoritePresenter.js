import DbHelper from '../utils/db-helper.js';

export default class FavoritePresenter {
    constructor(view) {
        this.view = view;
    }

    async show() {
        this.view.transitionToPage(() => {
            this.view.hideAllPages();
            this.view.showPage();
            this.view.updateNavigation('favorites');
        });

        await this.loadFavoriteStories();
    }

    async loadFavoriteStories() {
        const stories = await DbHelper.getAllStories();
        this.view.renderFavoriteStories(stories);
    }

    async handleRemoveFavorite(id) {
        try {
            await DbHelper.deleteStory(id);
            alert('Story removed from favorites.');
            // Reload the view to show the updated list
            await this.loadFavoriteStories();
        } catch (error) {
            alert('Failed to remove story.');
            console.error(error);
        }
    }
    
    hide() {
        // Tidak ada cleanup spesifik yang dibutuhkan untuk halaman ini
        console.log('Hiding Favorites page');
    }
}