// router.js

export default class Router {
    constructor() {
        this.routes = {};
        this.currentHandler = null; // Menyimpan handler/presenter yang sedang aktif
        this._onHashChange = this.handleRouteChange.bind(this);
    }

    addRoute(path, handler) {
        // Menyimpan presenter instance, bukan fungsi anonim
        this.routes[path] = handler;
    }

    start() {
        window.addEventListener('hashchange', this._onHashChange);
        window.addEventListener('load', this._onHashChange);
        this.handleRouteChange();
    }

    async handleRouteChange() {
        const hash = window.location.hash.slice(1) || 'home';
        const token = localStorage.getItem('authToken');
        const needsAuth = ['home', 'add-story'];

        if (needsAuth.includes(hash) && !token) {
            window.location.hash = '#login';
            return;
        }

        const newHandler = this.routes[hash];

        if (newHandler) {
            // Panggil metode hide() pada handler lama jika ada
            if (this.currentHandler && typeof this.currentHandler.hide === 'function') {
                this.currentHandler.hide();
            }

            this.currentHandler = newHandler;

            if (typeof newHandler.show === 'function') {
                await newHandler.show();
            }
        } else {
            window.location.hash = '#home';
        }
    }
    
    navigate(path) {
        if (window.location.hash.slice(1) === path) {
            // Jika navigasi ke halaman yang sama, panggil handleRouteChange untuk refresh
            this.handleRouteChange();
        } else {
            window.location.hash = `#${path}`;
        }
    }

    destroy() {
        window.removeEventListener('hashchange', this._onHashChange);
        window.removeEventListener('load', this._onHashChange);
    }
}