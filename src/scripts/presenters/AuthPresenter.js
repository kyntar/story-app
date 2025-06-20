import BasePresenter from '../core/BasePresenter.js';
import { transitionToPage } from '../utils/helpers.js';

export default class AuthPresenter extends BasePresenter {
    constructor(authView, userModel, storyModel, router) {
        super();
        this.authView = authView;
        this.userModel = userModel;
        this.storyModel = storyModel;
        this.router = router;

        // PERBAIKAN: Hapus pengambilan elemen DOM dari presenter
        // this.loginForm = document.getElementById('login-form');
        // this.registerForm = document.getElementById('register-form');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Event listener sekarang berada di elemen yang dikelola oleh View
        if (this.authView.loginForm) {
            this.authView.loginForm.addEventListener('submit', e => this.handleLogin(e));
        }
        if (this.authView.registerForm) {
            this.authView.registerForm.addEventListener('submit', e => this.handleRegister(e));
        }
    }

    showLogin() {
        transitionToPage(() => {
            this.hideAllPages();
            this.authView.showLogin();
            this.updateNavigation('login');
        });
        this.authView.clearMessages();
    }

    showRegister() {
        transitionToPage(() => {
            this.hideAllPages();
            this.authView.showRegister();
            this.updateNavigation('register');
        });
        this.authView.clearMessages();
    }
    
    async handleLogin(e) {
        e.preventDefault();
        // PERBAIKAN: Ambil data dari View, bukan dari DOM langsung
        const { email, password } = this.authView.getLoginCredentials();

        if (!email || !password) {
            // PERBAIKAN: Perintahkan View untuk menampilkan pesan
            this.authView.showLoginMessage('Email and password are required.', 'error');
            return;
        }
        
        this.authView.setLoginButtonState(true, 'Logging in...');

        try {
            await this.userModel.login(email, password);
            this.authView.showLoginMessage('Login successful!', 'success');
            
            if (window.updateUI) window.updateUI();

            setTimeout(() => {
                this.router.navigate('home');
            }, 1000);

        } catch (error) {
            this.authView.showLoginMessage(`Login failed: ${error.message}`, 'error');
        } finally {
            this.authView.setLoginButtonState(false, 'Login');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        // PERBAIKAN: Ambil data dari View
        const { name, email, password } = this.authView.getRegisterCredentials();

        if (!name || !email || !password) {
            this.authView.showRegisterMessage('All fields are required.', 'error');
            return;
        }

        this.authView.setRegisterButtonState(true, 'Registering...');

        try {
            await this.userModel.register(name, email, password);
            this.authView.showRegisterMessage('Registration successful! Please login.', 'success');

            setTimeout(() => {
                this.router.navigate('login');
            }, 2000);

        } catch (error) {
            this.authView.showRegisterMessage(`Registration failed: ${error.message}`, 'error');
        } finally {
            this.authView.setRegisterButtonState(false, 'Register');
        }
    }

    logout() {
        console.log('Logging out...');
        this.userModel.logout();
        this.storyModel.clearStories();

        if (window.updateUI) window.updateUI();

        this.router.navigate('home');
    }

    // Metode updateNavigation dan hideAllPages ada di BasePresenter
    // Metode showMessage dan clearMessages sudah tidak ada di sini, karena sudah dihandle oleh View
}