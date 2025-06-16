// PERBAIKAN: Impor global yang tidak perlu telah dihapus.

export default class AddStoryPresenter {
    constructor(view, storyModel, mapService, cameraService, router, userModel) {
        this.view = view;
        this.storyModel = storyModel;
        this.userModel = userModel;
        this.mapService = mapService;
        this.cameraService = cameraService;
        this.router = router;

        // State (data) sekarang sepenuhnya dikelola di dalam presenter ini.
        this.selectedLocation = null;
        this.capturedPhoto = null;
        this.addStoryMap = null;
        this.isSubmitting = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.view.onStartCamera(() => this.startCamera());
        this.view.onCapturePhoto(() => this.capturePhoto());
        this.view.onRetakePhoto(() => this.retakePhoto());
        this.view.onSubmitForm(e => this.handleSubmit(e));
        this.view.onMapClick(latlng => this.handleMapClick(latlng));
    }

    show() {
        this.view.transitionToPage(() => {
            this.view.hideAllPages();
            this.view.showPage();
            this.view.updateNavigation('add-story');
        });

        this.initAddStoryMap();
        this.resetForm();
    }

    async startCamera() {
        try {
            await this.cameraService.startCamera(
                this.view.getCameraVideoElement(),
                this.view.getCameraCanvasElement()
            );
            this.view.showCameraPreview();
            this.view.toggleStartCaptureButtons('started');
        } catch (error) {
            this.view.showMessage(error.message, 'error');
        }
    }

    async capturePhoto() {
        try {
            // State internal `this.capturedPhoto` langsung di-update.
            this.capturedPhoto = await this.cameraService.capturePhoto();
            const dataUrl = this.cameraService.getDataUrl();

            this.view.showCapturedPhoto(dataUrl);
            this.view.toggleStartCaptureButtons('captured');

            this.cameraService.stopCamera();
            // PERBAIKAN: Pemanggilan `setCapturedPhoto()` dihapus karena tidak ada lagi.
        } catch (error) {
            this.view.showMessage('Failed to capture photo: ' + error.message, 'error');
        }
    }

    retakePhoto() {
        this.capturedPhoto = null;
        this.view.resetPhotoCaptureUI();
        // PERBAIKAN: Pemanggilan `setCapturedPhoto()` dihapus.
    }

    initAddStoryMap() {
        setTimeout(() => {
            if (!this.addStoryMap) {
                this.addStoryMap = this.mapService.initMap('add-story-map', {
                    center: [-6.2088, 106.8456],
                    zoom: 10,
                });
                // PERBAIKAN: Pemanggilan `setAddStoryMap()` dihapus.

                this.view.setMap(this.addStoryMap);
                this.mapService.onMapClick('add-story-map', e => {
                    this.handleMapClick(e.latlng);
                });
            }
        }, 100);
    }

    handleMapClick(latlng) {
        // State internal `this.selectedLocation` langsung di-update.
        this.selectedLocation = {
            lat: latlng.lat,
            lon: latlng.lng,
        };
        // PERBAIKAN: Pemanggilan `setSelectedLocation()` dihapus.

        this.view.clearMapMarkers(this.addStoryMap);
        this.mapService.addMarker('add-story-map', this.selectedLocation.lat, this.selectedLocation.lon, 'Selected Location');
        this.view.updateSelectedLocationText(this.selectedLocation);
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;

        if (!this.capturedPhoto) {
            this.view.showMessage('Please capture a photo first.', 'error');
            return;
        }

        const description = this.view.getDescription().trim();
        if (!description) {
            this.view.showMessage('Description cannot be empty.', 'error');
            return;
        }

        this.isSubmitting = true;
        this.view.setSubmitButtonState(true, 'Sharing...');

        try {
            const photoFile = new File([this.capturedPhoto], 'story-photo.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now()
            });

            const formData = new FormData();
            formData.append('description', description);
            formData.append('photo', photoFile);

            if (this.selectedLocation?.lat && this.selectedLocation?.lon) {
                formData.append('lat', this.selectedLocation.lat.toString());
                formData.append('lon', this.selectedLocation.lon.toString());
            }
            
            // Menggunakan metode yang ada di StoryModel
            await this.storyModel.addStoryWithFormData(formData);

            this.view.showMessage('Story shared successfully!', 'success');
            
            setTimeout(() => {
                this.router.navigate('home');
                this.resetForm(); // Reset form setelah navigasi
            }, 2000);

        } catch (error) {
            this.view.showMessage('Failed to share story: ' + error.message, 'error');
        } finally {
            this.isSubmitting = false;
            this.view.setSubmitButtonState(false, 'Share Story');
        }
    }

    resetForm() {
        this.selectedLocation = null;
        this.capturedPhoto = null;
        this.isSubmitting = false;
        this.view.resetFormUI(this.addStoryMap);
        // PERBAIKAN: Pemanggilan `setSelectedLocation()` dan `setCapturedPhoto()` dihapus.
    }

    // Metode `hide` ditambahkan di perbaikan sebelumnya untuk mematikan kamera
    hide() {
        console.log('Cleaning up AddStory page...');
        this.cameraService.stopCamera();
        this.resetForm();
    }
}