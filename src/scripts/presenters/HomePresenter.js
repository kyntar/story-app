import DbHelper from '../utils/db-helper.js';

export default class HomePresenter {
  constructor(view, storyModel, mapService, userModel) {
    this.view = view;
    this.model = storyModel;
    this.mapService = mapService;
    this.userModel = userModel;
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
      // Cek status koneksi
      if (navigator.onLine) {
        // --- LOGIKA ONLINE: MENYIMPAN DATA ---
        console.log('Mode Online: Mengambil data dari API...');
        const stories = await this.model.fetchStories();
        
        if (stories && stories.length > 0) {
          // Simpan setiap cerita ke IndexedDB
          for (const story of stories) {
            await DbHelper.putStory(story);
          }
        }
        this.view.renderStories(stories);
      } else {
        // --- LOGIKA OFFLINE: MENAMPILKAN DATA ---
        console.log('Mode Offline: Mengambil data dari IndexedDB...');
        const stories = await DbHelper.getAllStories();
        
        if (stories && stories.length > 0) {
          this.view.renderStories(stories);
        } else {
          this.view.showError('Tidak ada data yang tersimpan untuk ditampilkan saat offline.');
        }
      }
    } catch (error) {
      this.view.showError(`Gagal memuat cerita: ${error.message}`);
    } finally {
      this.view.hideLoading();
    }
  }

  async handleDeleteStory(id) {
    try {
      await DbHelper.deleteStory(id);
      alert('Cerita berhasil dihapus dari cache offline.');
      await this.loadStories(); // Muat ulang cerita untuk memperbarui tampilan
    } catch (error) {
      alert('Gagal menghapus cerita dari cache.');
    }
  }
  
    initStoriesMap() {
        // Logika ini sekarang hanya berjalan jika user sudah login,
        // karena pemanggilannya ada di dalam blok if (this.userModel.isAuthenticated())
        setTimeout(async () => {
            if (!this.view.isMapInitialized()) {
                const map = this.mapService.initMap('stories-map');
                this.view.setMap(map);
            }
            try {
                // Ambil cerita lagi untuk menempatkan marker di peta.
                const stories = await this.model.fetchStories();
                stories.forEach(story => {
                    const lat = story.lat ?? story.latitude;
                    const lon = story.lon ?? story.longitude;
                    if (lat && lon) {
                        this.mapService.addMarker('stories-map', lat, lon, 
                            `<div>
                                <h4>${story.name || 'Story'}</h4>
                                <p>${story.description || ''}</p>
                                <small>${new Date(story.createdAt).toLocaleDateString('id-ID')}</small>
                            </div>`
                        );
                    }
                });
            } catch (error) {
                console.error('Error memuat cerita untuk peta:', error);
            }
        }, 100);
    }
}