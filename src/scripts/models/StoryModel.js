import ApiService from '../services/ApiService.js';

export default class StoryModel {
    constructor() {
        this.apiService = new ApiService();
        this.stories = [];
    }

    // Ambil semua cerita
    async fetchStories() {
        try {
            const response = await this.apiService.getStories();
            this.stories = response.listStory || [];
            return this.stories;
        } catch (error) {
            console.error('StoryModel.fetchStories error:', error);
            throw error;
        }
    }

    // Tambahkan cerita pakai FormData
    async addStoryWithFormData(formData) {
        console.log('[StoryModel] Received FormData for upload');

        try {
            if (!(formData instanceof FormData)) {
                throw new Error('Expected FormData instance');
            }

            // Validasi
            const description = formData.get('description');
            const photo = formData.get('photo');

            if (!description || !description.trim()) {
                throw new Error('Description is required');
            }

            if (!(photo instanceof File || photo instanceof Blob)) {
                throw new Error('Photo must be a File or Blob');
            }

            // Debug isi formData
            console.log('FormData contents:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            const result = await this.apiService.addStory(formData);

            // Tambahkan ke stories lokal (jika struktur respons valid)
            if (result && result.listStory) {
                this.stories.unshift(result.listStory[0]); // Asumsikan 1 item terbaru
            }

            return result;
        } catch (error) {
            console.error('StoryModel.addStoryWithFormData error:', error);
            throw error;
        }
    }

    // Backward compatibility: menerima object biasa
    async addStory({ description, photo, lat, lng }) {
        console.log('[StoryModel] Preparing story data...');

        try {
            if (!description || description.trim() === '') {
                throw new Error('Description is required');
            }

            if (!photo || !(photo instanceof File || photo instanceof Blob)) {
                throw new Error('Photo is required and must be a File or Blob');
            }

            // Konversi Blob ke File jika perlu
            let photoFile = photo;
            if (photo instanceof Blob && !(photo instanceof File)) {
                photoFile = new File([photo], 'story-photo.jpg', {
                    type: photo.type || 'image/jpeg',
                    lastModified: Date.now()
                });
            }

            const formData = new FormData();
            formData.append('description', description.trim());
            formData.append('photo', photoFile);

            if (!isNaN(lat) && !isNaN(lng)) {
                formData.append('lat', lat.toString());
                formData.append('lon', lng.toString());
                console.log('Added coordinates:', { lat, lon: lng });
            }

            const result = await this.apiService.addStory(formData);

            // Tambahkan ke cache lokal
            if (result && result.listStory) {
                this.stories.unshift(result.listStory[0]);
            }

            return result;
        } catch (error) {
            console.error('StoryModel.addStory error:', error);
            throw error;
        }
    }

    getStoryById(id) {
        return this.stories.find(story => story.id === id);
    }

    getStories() {
        return this.stories;
    }

    clearStories() {
        this.stories = [];
        console.log('Local stories cleared.');
    }
}
