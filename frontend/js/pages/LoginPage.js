// Login Page Component matching Netlify prototype
import { authAPI } from '../api.js';
import { router } from '../router.js';
import { showToast } from '../components/Toast.js';
export class LoginPage {
    constructor({ onLoginSuccess } = {}) {
        this.container = null;
        this.onLoginSuccess = onLoginSuccess;
    }

    render() {
        return `
        <div id="login-page-view" class="view-section py-16 flex-row justify-center align-center min-h-screen relative">
            <div class="grid-pattern absolute inset-0 opacity-30"></div>
            
            <div class="container" style="max-width: 440px; position: relative; z-index: 10;">
                <div class="card glass p-8" style="border: 1px solid var(--border-color); border-radius: 1rem; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);">
                    <div class="mb-6">
                        <h1 class="hero-title" style="font-size: 1.75rem; margin-bottom: 0.25rem;">Log in</h1>
                        <p class="text-secondary text-sm">Welcome back. Enter your details to continue.</p>
                    </div>

                    <form id="standalone-login-form" class="flex-column gap-4">
                        <div class="form-group">
                            <label for="page-login-email">Email</label>
                            <input type="email" id="page-login-email" class="form-control" placeholder="you@example.com" required value="dbzdawood@gmail.com">
                        </div>

                        <div class="form-group">
                            <div class="flex-row justify-between align-center mb-1">
                                <label for="page-login-password">Password</label>
                                <a href="#" id="forgot-password-link" class="text-xs text-primary hover-underline">Forgot password?</a>
                            </div>
                            <input type="password" id="page-login-password" class="form-control" placeholder="••••••••" required value="Password123">
                        </div>

                        <button type="submit" class="btn btn-primary btn-lg w-full mt-2" id="login-submit-btn">
                            Log in
                        </button>
                    </form>

                    <!-- Demo credentials hint matching Netlify design -->
                    <div class="mt-6 p-3" style="background: rgba(37, 99, 235, 0.08); border: 1px dashed rgba(37, 99, 235, 0.3); border-radius: 0.5rem; font-size: 0.775rem; line-height: 1.4; color: var(--text-secondary);">
                        <strong style="color: var(--text-primary);">Demo Admin:</strong>
                        Use <code class="text-primary font-mono">dbzdawood@gmail.com</code> or <code class="text-primary font-mono">admin@marketswithmack.com</code> with password <code class="text-primary font-mono">Password123</code> to access the admin command center.
                    </div>

                    <p class="text-center text-secondary text-xs mt-6">
                        No account? <a href="/join" class="text-primary font-medium hover-underline" data-link>Join the championship</a>
                    </p>
                </div>
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
                showToast('Password reset link sent to your registered email.', 'info');
            });
        }
    }
}
