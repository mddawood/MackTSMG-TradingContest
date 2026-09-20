// Verify Email Landing Page Component
import { authAPI } from '../api.js';
import { router } from '../router.js';
import { showToast } from '../components/Toast.js';

export class VerifyEmailPage {
    constructor() {
        this.container = null;
        this.status = 'loading'; // 'loading', 'success', 'error', 'already_verified'
        this.message = '';
        this.email = '';
        this.token = '';
    }

    async mount(container) {
        this.container = container;
        this.status = 'loading';
        this.container.innerHTML = this.render();

        const urlParams = new URLSearchParams(window.location.search);
        this.token = urlParams.get('token') || '';

        if (!this.token) {
            this.status = 'error';
            this.message = 'No verification token was provided. Please check the link from your email.';
            this.container.innerHTML = this.render();
            this.bindEvents();
            return;
        }

        try {
            const res = await authAPI.verifyEmail(this.token);
            if (res.status === 'already_verified') {
                this.status = 'already_verified';
                this.message = res.message || 'Your email is already verified. You can log in directly.';
            } else {
                this.status = 'success';
                this.message = res.message || 'Your email address has been verified successfully!';
            }
            this.email = res.email || '';
            this.container.innerHTML = this.render();
            this.bindEvents();
        } catch (err) {
            this.status = 'error';
            this.message = err.message || 'Verification link is invalid or has expired.';
            this.container.innerHTML = this.render();
            this.bindEvents();
        }
    }

    render() {
        return `
        <div id="verify-email-page-view" class="auth-page-view">
            <div class="grid-pattern absolute inset-0 opacity-30" style="pointer-events: none;"></div>

            <div class="auth-card text-center" style="max-width: 480px; width: 100%;">
                ${this.renderStatusContent()}
            </div>
        </div>
        `;
    }

    renderStatusContent() {
        if (this.status === 'loading') {
            return `
            <div class="py-8 flex-column align-center gap-4">
                <div class="spinner-large" style="width: 48px; height: 48px; border: 3px solid rgba(59, 130, 246, 0.2); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                <h2 style="font-size: 1.35rem; font-weight: 700;">Verifying Your Email</h2>
                <p class="text-secondary text-sm">Please wait while we confirm your credentials...</p>
            </div>
            `;
        } else if (this.status === 'success' || this.status === 'already_verified') {
            const isAlready = this.status === 'already_verified';
            return `
            <div class="py-4 flex-column align-center">
                <!-- Verified Checkmark Badge -->
                <div class="email-verify-icon-wrap mb-4 success">
                    <div class="verify-icon-halo success"></div>
                    <div class="verify-icon-circle success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </div>

                <h2 class="hero-title" style="font-size: 1.65rem; margin-bottom: 0.5rem;">
                    ${isAlready ? 'Email Already Verified!' : 'Email Verified Successfully!'}
                </h2>
                <p class="text-secondary text-sm" style="max-width: 380px; margin-bottom: 1.75rem; line-height: 1.6;">
                    ${this.message}
                </p>

                <button type="button" class="btn btn-primary btn-lg w-full" id="verify-login-btn">
                    Log In to Your Account →
                </button>
            </div>
            `;
        } else {
            return `
            <div class="py-4 flex-column align-center">
                <!-- Error Alert Icon -->
                <div class="email-verify-icon-wrap mb-4 error">
                    <div class="verify-icon-halo error"></div>
                    <div class="verify-icon-circle error">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                </div>

                <h2 class="hero-title text-destructive" style="font-size: 1.65rem; margin-bottom: 0.5rem;">
                    Verification Failed
                </h2>
                <p class="text-secondary text-sm" style="max-width: 380px; margin-bottom: 1.5rem; line-height: 1.6;">
                    ${this.message}
                </p>

                <!-- Form to Resend Verification Email -->
                <div class="p-4 mb-4 text-left w-full" style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 0.75rem;">
                    <div class="text-xs text-muted mb-2">REQUEST A NEW VERIFICATION LINK:</div>
                    <form id="resend-link-form" class="flex-column gap-3">
                        <input type="email" id="resend-input-email" class="form-control" placeholder="Enter your registered email" required>
                        <button type="submit" class="btn btn-secondary w-full" id="resend-submit-btn">
                            Send New Verification Link
                        </button>
                    </form>
                </div>

                <button type="button" class="btn btn-ghost text-sm w-full" id="verify-back-home-btn">
                    ← Back to Home
                </button>
            </div>
            `;
        }
    }

    bindEvents() {
        const loginBtn = document.getElementById('verify-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                router.navigate('/login');
            });
        }

        const backHomeBtn = document.getElementById('verify-back-home-btn');
        if (backHomeBtn) {
            backHomeBtn.addEventListener('click', () => {
                router.navigate('/');
            });
        }

        const resendForm = document.getElementById('resend-link-form');
        if (resendForm) {
            resendForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('resend-input-email');
                const submitBtn = document.getElementById('resend-submit-btn');
                if (!emailInput || !emailInput.value.trim()) return;

                submitBtn.disabled = true;
                submitBtn.innerText = 'Sending link...';

                try {
                    await authAPI.resendVerification(emailInput.value.trim());
                    showToast('New verification link sent! Check your inbox.', 'success');
                    submitBtn.innerText = 'Link Sent ✓';
                } catch (err) {
                    showToast(`Failed: ${err.message}`, 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Send New Verification Link';
                }
            });
        }
    }

    unmount() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
