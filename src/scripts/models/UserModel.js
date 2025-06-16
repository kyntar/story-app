// src/scripts/models/UserModel.js

import ApiService from '../services/ApiService.js';

export default class UserModel {
    constructor() {
        this.apiService = new ApiService();
        this.currentUser = null;
    }

    // PERBAIKAN: Metode login yang sudah dikoreksi
    async login(email, password) {
        try {
            const responseData = await this.apiService.login(email, password);

            // Cek apakah respons dari API valid dan memiliki `loginResult`
            if (responseData && responseData.loginResult) {
                const { name, userId, token } = responseData.loginResult;

                // Tetapkan data pengguna saat ini di dalam model
                this.currentUser = { name, id: userId };

                // Simpan token dan nama pengguna ke localStorage.
                // Semua logika ini sekarang terpusat di Model.
                localStorage.setItem('authToken', token);
                localStorage.setItem('userName', name);

                return responseData; // Kembalikan data asli jika diperlukan oleh presenter
            } else {
                // Jika `loginResult` tidak ada, lempar error dengan pesan dari server
                throw new Error(responseData.message || 'Respons login tidak valid.');
            }
        } catch (error) {
            console.error('Login failed in UserModel:', error);
            // Lempar kembali error agar bisa ditangkap oleh AuthPresenter dan ditampilkan ke user
            throw error;
        }
    }

    // Register user
    async register(name, email, password) {
        try {
            const userData = await this.apiService.register(name, email, password);
            return userData;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }

    // Get current user info
    getCurrentUser() {
        // Jika state `currentUser` kosong (misalnya setelah refresh halaman),
        // coba ambil dari localStorage.
        if (!this.currentUser) {
            const userName = localStorage.getItem('userName');
            if (userName) {
                this.currentUser = { name: userName };
            }
        }
        return this.currentUser;
    }
}