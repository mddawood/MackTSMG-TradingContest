// Signup Page Component with modal dismiss controls
import { authAPI } from '../api.js';
import { router } from '../router.js';
import { showToast } from '../components/Toast.js';

export class SignupPage {
    constructor({ onLoginSuccess } = {}) {
        this.container = null;
        this.onLoginSuccess = onLoginSuccess;
        this.escListener = null;
    }

    render() {
        return `
        <div id="signup-page-view" class="auth-page-view" style="cursor: pointer;">
            <div class="grid-pattern absolute inset-0 opacity-30" style="pointer-events: none;"></div>
            
            <div class="auth-card" style="cursor: default;">
                <!-- Close button for pop-up style dismissal -->
                <button type="button" class="modal-close-btn" id="signup-close-btn" title="Close" aria-label="Close" style="top: 1.25rem; right: 1.25rem;">
                    &times;
                </button>

                <div class="mb-6">
                    <h1 class="hero-title" style="font-size: 1.75rem; margin-bottom: 0.25rem;">Sign Up</h1>
                    <p class="text-secondary text-sm">Join the 2026 MWM Trading Championship.</p>
                </div>

                <form id="standalone-signup-form" class="flex-column gap-4">
                    <div class="form-group">
                        <label for="page-signup-name">Full Name</label>
                        <input type="text" id="page-signup-name" class="form-control" placeholder="John Doe" required>
                    </div>

                    <div class="form-group">
                        <label for="page-signup-email">Email Address</label>
                        <input type="email" id="page-signup-email" class="form-control" placeholder="you@example.com" required>
                    </div>

                    <div class="form-group">
                        <label for="page-signup-phone">WhatsApp Number</label>
                        <input type="tel" id="page-signup-phone" class="form-control" placeholder="+91 98765 43210" required>
                    </div>

                    <div class="form-group">
                        <label for="page-signup-password">Password (Min. 8 characters)</label>
                        <div class="password-input-wrap">
                            <input type="password" id="page-signup-password" class="form-control" placeholder="Min. 8 characters" minlength="8" required>
                            <button type="button" class="password-toggle-btn" id="toggle-page-signup-pwd-btn" aria-label="Toggle password visibility" title="Show password">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="page-signup-confirm-password">Confirm Password</label>
                        <div class="password-input-wrap">
                            <input type="password" id="page-signup-confirm-password" class="form-control" placeholder="Re-enter password" minlength="8" required>
                            <button type="button" class="password-toggle-btn" id="toggle-page-signup-confirm-pwd-btn" aria-label="Toggle password visibility" title="Show password">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary btn-lg w-full mt-2" id="signup-submit-btn">
                        Create Free Account
                    </button>
                </form>

                <p class="text-center text-secondary text-xs mt-6">
                    Already have an account? <a href="/login" class="text-primary font-medium hover-underline" data-link>Log in</a>
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
        const closeBtn = document.getElementById('signup-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
            });
        }

        // Click outside the card to dismiss
        const pageView = document.getElementById('signup-page-view');
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

        // Password visibility toggles
        const setupToggle = (btnId, inputId) => {
            const btn = document.getElementById(btnId);
            const input = document.getElementById(inputId);
            if (!btn || !input) return;

            const eyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            const eyeOff = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                btn.innerHTML = isPassword ? eyeOff : eyeOpen;
                btn.title = isPassword ? 'Hide password' : 'Show password';
            });
        };

        setupToggle('toggle-page-signup-pwd-btn', 'page-signup-password');
        setupToggle('toggle-page-signup-confirm-pwd-btn', 'page-signup-confirm-password');

        const form = document.getElementById('standalone-signup-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('page-signup-name').value.trim();
                const email = document.getElementById('page-signup-email').value.trim();
                const phone = document.getElementById('page-signup-phone').value.trim();
                const password = document.getElementById('page-signup-password').value;
                const confirmPassword = document.getElementById('page-signup-confirm-password').value;

                if (password.length < 8) {
                    showToast('Password must be at least 8 characters long.', 'error');
                    const pwdInput = document.getElementById('page-signup-password');
                    if (pwdInput) pwdInput.focus();
                    return;
                }

                if (!/[a-zA-Z]/.test(password) || !/[\d\W_]/.test(password)) {
                    showToast('Password must contain at least one letter and one number or symbol.', 'error');
                    const pwdInput = document.getElementById('page-signup-password');
                    if (pwdInput) pwdInput.focus();
                    return;
                }

                if (password !== confirmPassword) {
                    showToast('Passwords do not match. Please verify and try again.', 'error');
                    const confirmInput = document.getElementById('page-signup-confirm-password');
                    if (confirmInput) confirmInput.focus();
                    return;
                }

                const submitBtn = document.getElementById('signup-submit-btn');
                submitBtn.disabled = true;
                submitBtn.innerText = 'Creating account...';

                try {
                    await authAPI.register({
                        full_name: name,
                        email: email,
                        phone: phone,
                        password: password
                    });

                    const res = await authAPI.login(email, password);
                    if (typeof this.onLoginSuccess === 'function') {
                        await this.onLoginSuccess(res.access_token);
                    }
                    showToast('Account created! Proceeding to connect Delta exchange.', 'success');
                    router.navigate('/join');
                } catch (err) {
                    showToast(`Signup failed: ${err.message}`, 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Create Free Account';
                }
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
