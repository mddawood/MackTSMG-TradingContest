// Login Page Component matching Netlify prototype with modal dismiss controls
import { authAPI } from '../api.js';
import { router } from '../router.js';
import { showToast } from '../components/Toast.js';

export class LoginPage {
    constructor({ onLoginSuccess } = {}) {
        this.container = null;
        this.onLoginSuccess = onLoginSuccess;
        this.escListener = null;
    }

    render() {
        return `
        <div id="login-page-view" class="auth-page-view" style="cursor: pointer;">
            <div class="grid-pattern absolute inset-0 opacity-30" style="pointer-events: none;"></div>
            
            <div class="auth-card" style="cursor: default;">
                <!-- Close button for pop-up style dismissal -->
                <button type="button" class="modal-close-btn" id="login-close-btn" title="Close" aria-label="Close" style="top: 1.25rem; right: 1.25rem;">
                    &times;
                </button>

                <div class="mb-6">
                    <h1 class="hero-title" style="font-size: 1.75rem; margin-bottom: 0.25rem;">Log in</h1>
                    <p class="text-secondary text-sm">Welcome back. Enter your details to continue.</p>
                </div>

                <form id="standalone-login-form" class="flex-column gap-4">
                    <div class="form-group">
                        <label for="page-login-email">Email</label>
                        <input type="email" id="page-login-email" class="form-control" placeholder="you@example.com" required autocomplete="email">
                    </div>

                    <div class="form-group">
                        <div class="flex-row justify-between align-center mb-1">
                            <label for="page-login-password">Password</label>
                            <a href="/forgot-password" id="forgot-password-link" class="text-xs text-primary hover-underline" data-link>Forgot password?</a>
                        </div>
                        <div class="password-input-wrap">
                            <input type="password" id="page-login-password" class="form-control" placeholder="••••••••" required autocomplete="current-password">
                            <button type="button" class="password-toggle-btn" id="toggle-page-login-pwd-btn" aria-label="Toggle password visibility" title="Show password">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary btn-lg w-full mt-2" id="login-submit-btn">
                        Log in
                    </button>
                </form>

                <p class="text-center text-secondary text-xs mt-6">
                    No account? <a href="/signup" class="text-primary font-medium hover-underline" data-link>Sign up</a>
                </p>
            </div>
        </div>
        `;
    }

    async mount(container) {
        this.container = container;
        this.container.innerHTML = this.render();
        this.bindEvents();
    }

    bindEvents() {
        const handleClose = () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                router.navigate('/');
            }
        };

        // Cross button click
        const closeBtn = document.getElementById('login-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
            });
        }

        // Click outside the card to dismiss
        const pageView = document.getElementById('login-page-view');
        if (pageView) {
            pageView.addEventListener('click', (e) => {
                if (!e.target || !e.target.isConnected) {
                    return;
                }
                if (e.composedPath && e.composedPath().some(el => el && el.classList && el.classList.contains('auth-card'))) {
                    return;
                }
                if (!e.target.closest('.auth-card')) {
                    handleClose();
                }
            });
        }

        // Escape key to dismiss
        this.escListener = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        document.addEventListener('keydown', this.escListener);

        // Password visibility toggle
        const toggleBtn = document.getElementById('toggle-page-login-pwd-btn');
        const passwordInput = document.getElementById('page-login-password');
        if (toggleBtn && passwordInput) {
            const eyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            const eyeOff = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                toggleBtn.innerHTML = isPassword ? eyeOff : eyeOpen;
                toggleBtn.title = isPassword ? 'Hide password' : 'Show password';
            });
        }

        const form = document.getElementById('standalone-login-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('page-login-email').value.trim();
                const password = document.getElementById('page-login-password').value;
                const submitBtn = document.getElementById('login-submit-btn');

                submitBtn.disabled = true;
                submitBtn.innerText = 'Logging in...';

                try {
                    const res = await authAPI.login(email, password);
                    if (typeof this.onLoginSuccess === 'function') {
                        await this.onLoginSuccess(res.access_token);
                    }
                    showToast('Logged in successfully!', 'success');
                } catch (err) {
                    showToast(`Login failed: ${err.message}`, 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Log in';
                }
            });
        }

        const forgotLink = document.getElementById('forgot-password-link');
        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                router.navigate('/forgot-password');
            });
        }
    }

    unmount() {
        if (this.escListener) {
            document.removeEventListener('keydown', this.escListener);
            this.escListener = null;
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
