export default class CameraService {
    constructor() {
        this.stream = null;
        this.video = null;
        this.canvas = null;
    }

    async startCamera(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });
            this.video.srcObject = this.stream;
            await this.video.play();
            return true;
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw new Error('Unable to access camera. Please ensure camera permissions are granted.');
        }
    }

    capturePhoto() {
    if (!this.video || !this.canvas) {
        throw new Error('Camera not initialized');
    }
    const context = this.canvas.getContext('2d');
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;

    context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

    return new Promise((resolve, reject) => {
        this.canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob); 
            } else {
                reject(new Error('Failed to create image blob'));
            }
        }, 'image/jpeg', 0.8);
    });
}


    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
        }
    }

    getDataUrl() {
        if (!this.canvas) {
            throw new Error('Canvas not initialized');
        }
        return this.canvas.toDataURL('image/jpeg', 0.8);
    }
}
