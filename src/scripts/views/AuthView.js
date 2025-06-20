export default class AuthView {
    constructor() {
        this.loginPage = document.getElementById('login-page');
        this.registerPage = document.getElementById('register-page');
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        
        // PERBAIKAN: Ambil elemen message di View
        this.loginMessageElement = document.getElementById('auth-message');
        this.registerMessageElement = document.getElementById('register-message');
    }

    showLogin() {
        if (this.loginPage) this.loginPage.style.display = 'block';
        if (this.registerPage) this.registerPage.style.display = 'none';
    }

    showRegister() {
        if (this.loginPage) this.loginPage.style.display = 'none';
        if (this.registerPage) this.registerPage.style.display = 'block';
    }

    // PERBAIKAN: Metode untuk mengambil data dari form login
    getLoginCredentials() {
        const email = this.loginForm.querySelector('#login-email').value.trim();
        const password = this.loginForm.querySelector('#login-password').value;
        return { email, password };
    }

    // PERBAIKAN: Metode untuk mengambil data dari form registrasi
    getRegisterCredentials() {
        const name = this.registerForm.querySelector('#register-name').value.trim();
        const email = this.registerForm.querySelector('#register-email').value.trim();
        const password = this.registerForm.querySelector('#register-password').value;
        return { name, email, password };
    }

    // PERBAIKAN: Metode untuk menampilkan pesan yang dikontrol oleh Presenter
    showLoginMessage(message, type) {
        this.loginMessageElement.innerHTML = `<div class="${type}">${message}</div>`;
        this._clearMessageAfterDelay(this.loginMessageElement);
    }

    showRegisterMessage(message, type) {
        this.registerMessageElement.innerHTML = `<div class="${type}">${message}</div>`;
        this._clearMessageAfterDelay(this.registerMessageElement);
    }
    
    // PERBAIKAN: Metode untuk membersihkan semua pesan
    clearMessages() {
        if (this.loginMessageElement) this.loginMessageElement.innerHTML = '';
        if (this.registerMessageElement) this.registerMessageElement.innerHTML = '';
    }
    
    _clearMessageAfterDelay(element, delay = 5000) {
        setTimeout(() => {
            if (element) element.innerHTML = '';
        }, delay);
    }

    setLoginButtonState(disabled, text = 'Login') {
        const button = this.loginForm.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = disabled;
            button.textContent = text;
        }
    }

    setRegisterButtonState(disabled, text = 'Register') {
        const button = this.registerForm.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = disabled;
            button.textContent = text;
        }
    }

    hideAll() {
        if (this.loginPage) this.loginPage.style.display = 'none';
        if (this.registerPage) this.registerPage.style.display = 'none';
    }
}