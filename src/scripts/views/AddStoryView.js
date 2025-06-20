// PERBAIKAN: Menambahkan impor 'L' dari leaflet untuk memperbaiki bug
import L from 'leaflet';
import AddStoryPresenter from '../presenters/AddStoryPresenter.js';
import ApiService from '../services/ApiService.js';
import MapService from '../services/MapService.js';
import CameraService from '../services/CameraService.js';
import Router from '../core/Router.js';
import { transitionToPage } from '../utils/helpers.js';

export default class AddStoryView {
    constructor() {
        this.pageId = 'add-story-page';
        this.view = document.getElementById(this.pageId);
        this.form = document.getElementById('add-story-form');
        this.messageElement = document.getElementById('add-story-message');

        this.videoElement = document.getElementById('camera-preview');
        this.canvasElement = document.getElementById('photo-canvas');
        this.capturedPhotoImg = document.getElementById('captured-photo');

        this.startCameraBtn = document.getElementById('start-camera');
        this.capturePhotoBtn = document.getElementById('capture-photo');
        this.retakePhotoBtn = document.getElementById('retake-photo');

        this.selectedLocationText = document.getElementById('selected-location');
        this.submitButton = document.getElementById('submit-story');

        this.map = null;

        // PERBAIKAN: Instansiasi Service dan Presenter seharusnya dilakukan di main.js
        // Namun untuk sementara kita biarkan agar tidak merusak struktur yang ada
        // Idealnya, presenter akan di-set dari luar seperti pada HomeView
        this.apiService = new ApiService();
        this.mapService = new MapService();
        this.cameraService = new CameraService();
        this.router = new Router();

        this.presenter = new AddStoryPresenter(this, this.apiService, this.mapService, this.cameraService, this.router);
    }

    transitionToPage(callback) {
        transitionToPage(callback);
    }

    hideAllPages() {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
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

    onStartCamera(callback) {
        this.startCameraBtn.addEventListener('click', callback);
    }

    onCapturePhoto(callback) {
        this.capturePhotoBtn.addEventListener('click', callback);
    }

    onRetakePhoto(callback) {
        this.retakePhotoBtn.addEventListener('click', callback);
    }

    onSubmitForm(callback) {
        this.form.addEventListener('submit', callback);
    }

    onMapClick(callback) {
        // Will be handled by mapService.onMapClick in presenter
    }

    getCameraVideoElement() {
        return this.videoElement;
    }

    getCameraCanvasElement() {
        return this.canvasElement;
    }

    showCameraPreview() {
        this.videoElement.style.display = 'block';
    }

    toggleStartCaptureButtons(state) {
        switch (state) {
            case 'started':
                this.startCameraBtn.style.display = 'none';
                this.capturePhotoBtn.style.display = 'inline-block';
                this.retakePhotoBtn.style.display = 'none';
                this.capturedPhotoImg.style.display = 'none';
                this.videoElement.style.display = 'block';
                break;
            case 'captured':
                this.startCameraBtn.style.display = 'none';
                this.capturePhotoBtn.style.display = 'none';
                this.retakePhotoBtn.style.display = 'inline-block';
                this.videoElement.style.display = 'none';
                this.capturedPhotoImg.style.display = 'block';
                break;
            default: // initial or reset
                this.startCameraBtn.style.display = 'inline-block';
                this.capturePhotoBtn.style.display = 'none';
                this.retakePhotoBtn.style.display = 'none';
                this.capturedPhotoImg.style.display = 'none';
                this.videoElement.style.display = 'none';
                break;
        }
    }

    showCapturedPhoto(dataUrl) {
        this.capturedPhotoImg.src = dataUrl;
        this.capturedPhotoImg.style.display = 'block';
        this.videoElement.style.display = 'none';
    }

    resetPhotoCaptureUI() {
        this.toggleStartCaptureButtons('initial');
        this.capturedPhotoImg.style.display = 'none';
        this.videoElement.style.display = 'none';
    }

    updateSelectedLocationText(location) {
        this.selectedLocationText.textContent = `${location.lat.toFixed(6)}, ${location.lon.toFixed(6)}`;
    }

    clearMapMarkers(map) {
        map.eachLayer(layer => {
            // PERBAIKAN: Bug 'L is not defined' sudah teratasi dengan adanya import
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
    }

    setMap(map) {
        this.map = map;
    }

    getDescription() {
        return this.form.querySelector('#story-description').value;
    }

    setSubmitButtonState(disabled, text) {
        this.submitButton.disabled = disabled;
        this.submitButton.textContent = text;
    }

    showMessage(message, type) {
        this.messageElement.innerHTML = `<div class="${type}">${message}</div>`;
        setTimeout(() => {
            this.messageElement.innerHTML = '';
        }, 5000);
    }

    resetFormUI(map) {
        this.form.reset();
        this.messageElement.innerHTML = '';
        this.selectedLocationText.textContent = 'Not selected';
        this.resetPhotoCaptureUI();

        if (map) {
            this.clearMapMarkers(map);
        }
    }

    init() {
        this.presenter.show();
    }
}