export default class BasePresenter {
    constructor(viewId) {
        this.view = document.getElementById(viewId);
    }

    hideAllPages() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
    }

    updateNavigation(activeRoute) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeRoute}`) {
                link.classList.add('active');
            }
        });
    }

    showMessage(message, type, elementId) {
        const messageElement = document.getElementById(elementId);
        if (messageElement) {
            messageElement.innerHTML = `<div class="${type}">${message}</div>`;
            setTimeout(() => {
                messageElement.innerHTML = '';
            }, 5000);
        }
    }
}