export default class AuthView {
    constructor() {
        this.loginPage = document.getElementById('login-page');
        this.registerPage = document.getElementById('register-page');
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
    }

  showLogin() {
    if (this.loginPage) this.loginPage.style.display = 'block';
    if (this.registerPage) this.registerPage.style.display = 'none';
  }

  showRegister() {
    if (this.loginPage) this.loginPage.style.display = 'none';
    if (this.registerPage) this.registerPage.style.display = 'block';
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
