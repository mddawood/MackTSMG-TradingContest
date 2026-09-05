// Client-Side Router with HTML5 History API support

export class Router {
    constructor() {
        this.routes = [];
        this.currentRoute = null;
        this.authCheck = () => false;
        this.adminCheck = () => false;
        this.onAuthRequired = null;

        // Listen for browser Back/Forward buttons
        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.pathname, false);
        });

        // Intercept clicks on links with data-link or local href
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-link]');
            if (link) {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href) {
                    this.navigate(href);
                }
            }
        });
    }

    setAuthGuards(authCheck, adminCheck, onAuthRequired) {
        this.authCheck = authCheck;
        this.adminCheck = adminCheck;
        this.onAuthRequired = onAuthRequired;
    }

    addRoute(path, handler, options = {}) {
        this.routes.push({
            path,
            handler,
            requiresAuth: options.requiresAuth || false,
            requiresAdmin: options.requiresAdmin || false
        });
        return this;
    }

    navigate(path, push = true) {
        // Strip query/hash for route matching, but keep full URL in browser history
        const cleanPath = path.split('?')[0].split('#')[0] || '/';

        if (push && window.location.pathname !== path) {
            window.history.pushState({}, '', path);
        }

        this.handleRoute(cleanPath, push);
    }

    handleRoute(pathname, pushState = true) {
        // Find matching route or fallback to '/'
        let route = this.routes.find(r => r.path === pathname);

        if (!route) {
            // Default fallback
            route = this.routes.find(r => r.path === '/');
            pathname = '/';
            if (pushState) {
                window.history.replaceState({}, '', '/');
            }
        }

        // Check guards
        if (route.requiresAuth && !this.authCheck()) {
            if (this.onAuthRequired) {
                this.onAuthRequired();
            }
            this.navigate('/', false);
            return;
        }

        if (route.requiresAdmin && !this.adminCheck()) {
            this.navigate('/dashboard', false);
            return;
        }

        this.currentRoute = route;

        // Execute route handler
        if (route.handler) {
            route.handler(pathname);
        }

        // Scroll to top or to hash anchor
        if (window.location.hash) {
            const el = document.querySelector(window.location.hash);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                return;
            }
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    init() {
        // Process current URL path
        this.handleRoute(window.location.pathname, false);
    }
}

export const router = new Router();
