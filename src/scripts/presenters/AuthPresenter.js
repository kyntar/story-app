import BasePresenter from '../core/BasePresenter.js';
import ApiService from '../services/ApiService.js';
import { transitionToPage } from '../utils/helpers.js';

export default class AuthPresenter extends BasePresenter {
    // PERBAIKAN: Inject StoryModel juga untuk membersihkan data saat logout
    constructor(authView, userModel, storyModel, router) {
        super();
        this.authView = authView;
        this.userModel = userModel;
        this.storyModel = storyModel; // Simpan storyModel
        this.router = router;

        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');

        this.setupEventListeners();
    }

  setupEventListeners() {
        if (this.loginForm) this.loginForm.addEventListener('submit', e => this.handleLogin(e));
        if (this.registerForm) this.registerForm.addEventListener('submit', e => this.handleRegister(e));
    }

  showLogin() {
        transitionToPage(() => {
            this.hideAllPages(); // Gunakan metode dari BasePresenter
            this.authView.showLogin();
            this.updateNavigation('login');
        });
        this.clearMessages();
    }

  showRegister() {
        transitionToPage(() => {
            this.hideAllPages();
            this.authView.showRegister();
            this.updateNavigation('register');
        });
        this.clearMessages();
    }

  updateNavigation(activeRoute) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${activeRoute}`) {
        link.classList.add('active');
      }
    });
  }

  async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            this.showMessage('Email and password are required.', 'error', 'auth-message');
            return;
        }
        
        // PERBAIKAN: Gunakan View untuk manipulasi DOM
        this.authView.setLoginButtonState(true, 'Logging in...');

        try {
            // PERBAIKAN: Gunakan UserModel untuk logika login
            await this.userModel.login(email, password);
            this.showMessage('Login successful!', 'success', 'auth-message');
            
            // Panggil update UI global
            if (window.updateUI) window.updateUI();

            setTimeout(() => {
                this.router.navigate('home');
            }, 1000);

        } catch (error) {
            this.showMessage(`Login failed: ${error.message}`, 'error', 'auth-message');
        } finally {
            this.authView.setLoginButtonState(false, 'Login');
        }
    }

  async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;

        if (!name || !email || !password) {
            this.showMessage('All fields are required.', 'error', 'register-message');
            return;
        }

        this.authView.setRegisterButtonState(true, 'Registering...');

        try {
            // PERBAIKAN: Gunakan UserModel untuk logika register
            await this.userModel.register(name, email, password);
            this.showMessage('Registration successful! Please login.', 'success', 'register-message');

            setTimeout(() => {
                this.router.navigate('login');
            }, 2000);

        } catch (error) {
            this.showMessage(`Registration failed: ${error.message}`, 'error', 'register-message');
        } finally {
            this.authView.setRegisterButtonState(false, 'Register');
        }
    }

  updateAuthState() {
    if (this.apiService.isAuthenticated()) {
      const userName = localStorage.getItem('userName') || 'User';
      if (this.authLink) {
        this.authLink.textContent = `Logout (${userName})`;
        this.authLink.href = '#logout';
      }
    } else {
      if (this.authLink) {
        this.authLink.textContent = 'Login';
        this.authLink.href = '#login';
      }
    }
  }

  logout() {
        // PERBAIKAN: Logika logout yang komprehensif
        console.log('Logging out...');
        this.userModel.logout(); // Hapus data user dari model & localStorage
        this.storyModel.clearStories(); // Bersihkan cache cerita

        // Panggil update UI global
        if (window.updateUI) window.updateUI();

        this.router.navigate('home'); // Arahkan ke home, yang akan menampilkan state "guest"
    }

  showMessage(message, type, elementId) {
    const messageElement = document.getElementById(elementId);
    if (!messageElement) return;
    messageElement.innerHTML = `<div class="${type}">${message}</div>`;
    setTimeout(() => {
      messageElement.innerHTML = '';
    }, 5000);
  }

  clearMessages() {
    const authMessage = document.getElementById('auth-message');
    const registerMessage = document.getElementById('register-message');
    if (authMessage) authMessage.innerHTML = '';
    if (registerMessage) registerMessage.innerHTML = '';
  }
}
