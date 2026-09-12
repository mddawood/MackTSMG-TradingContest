// Forgot Password Page Component matching app glassmorphism styling
import { authAPI } from '../api.js';
import { router } from '../router.js';
import { showToast } from '../components/Toast.js';

export class ForgotPasswordPage {
    constructor() {
        this.container = null;
        this.escListener = null;
        this.submittedEmail = '';
        this.isSubmitted = false;
    }

    render() {
        if (this.isSubmitted) {
            return `
            <div id="forgot-page-view" class="auth-page-view" style="cursor: pointer;">
                <div class="grid-pattern absolute inset-0 opacity-30" style="pointer-events: none;"></div>
                
                <div class="auth-card" style="cursor: default; text-align: center;">
                    <!-- Close button -->
                    <button type="button" class="modal-close-btn" id="forgot-close-btn" title="Close" aria-label="Close" style="top: 1.25rem; right: 1.25rem;">
                        &times;
                    </button>

                    <div class="flex-column align-center mb-6">
                        <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; color: #10b981;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <h1 class="hero-title" style="font-size: 1.75rem; margin-bottom: 0.5rem;">Check Your Email</h1>
                        <p class="text-secondary text-sm" style="max-width: 320px; line-height: 1.6;">
                            If an account exists for <strong class="text-white">${this.escapeHtml(this.submittedEmail)}</strong>, we have sent a secure password reset link.
                        </p>
                    </div>

                    <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem; text-align: left;">
                        <p class="text-xs text-secondary mb-1" style="line-height: 1.5;">
                            ⏱️ The reset link expires in <strong>15 minutes</strong>.
                        </p>
                        <p class="text-xs text-secondary" style="line-height: 1.5;">
                            Don't see it? Check your Spam or Promotions folder.
                        </p>
                    </div>

                    <div class="flex-column gap-3">
                        <a href="/login" class="btn btn-primary btn-lg w-full" id="forgot-return-login-btn" data-link>
                            Return to Log In
                        </a>
                        <button type="button" class="btn btn-ghost w-full text-xs text-secondary" id="forgot-resend-btn">
                            Try another email address
                        </button>
                    </div>
                </div>
            </div>
            `;
        }

        return `
        <div id="forgot-page-view" class="auth-page-view" style="cursor: pointer;">
            <div class="grid-pattern absolute inset-0 opacity-30" style="pointer-events: none;"></div>
            
            <div class="auth-card" style="cursor: default;">
                <!-- Close button for pop-up style dismissal -->
                <button type="button" class="modal-close-btn" id="forgot-close-btn" title="Close" aria-label="Close" style="top: 1.25rem; right: 1.25rem;">
                    &times;
                </button>

                <div class="mb-6">
                    <h1 class="hero-title" style="font-size: 1.75rem; margin-bottom: 0.25rem;">Reset Password</h1>
                    <p class="text-secondary text-sm">Enter your registered email address and we'll send you a link to reset your password.</p>
                </div>

                <form id="standalone-forgot-form" class="flex-column gap-4">
                    <div class="form-group">
                        <label for="page-forgot-email">Email Address</label>
                        <input type="email" id="page-forgot-email" class="form-control" placeholder="you@example.com" required autocomplete="email" autofocus>
                    </div>

                    <button type="submit" class="btn btn-primary btn-lg w-full mt-2" id="forgot-submit-btn">
                        Send Reset Link
                    </button>
                </form>

                <p class="text-center text-secondary text-xs mt-6">
                    Remember your password? <a href="/login" class="text-primary font-medium hover-underline" data-link>Back to Log in</a>
                </p>
            </div>
        </div>
        `;
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
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
                router.navigate('/login');
            }
        };

        // Close button click
        const closeBtn = document.getElementById('forgot-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
            });
        }

        // Click outside the card to dismiss
        const pageView = document.getElementById('forgot-page-view');
        if (pageView) {
            pageView.addEventListener('click', (e) => {
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

        // Try another email button
        const resendBtn = document.getElementById('forgot-resend-btn');
        if (resendBtn) {
            resendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.isSubmitted = false;
                this.mount(this.container);
            });
        }

        // Return to login button
        const returnLoginBtn = document.getElementById('forgot-return-login-btn');
        if (returnLoginBtn) {
            returnLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.isSubmitted = false;
                router.navigate('/login');
            });
        }

        // Submit form
        const form = document.getElementById('standalone-forgot-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('page-forgot-email');
                const email = emailInput ? emailInput.value.trim() : '';
                const submitBtn = document.getElementById('forgot-submit-btn');

                if (!email) return;

                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <span class="inline-flex items-center gap-2">
                        <svg class="animate-spin" style="animation: spin 1s linear infinite; width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Link...
                    </span>
                `;

                try {
                    await authAPI.forgotPassword(email);
                    this.submittedEmail = email;
                    this.isSubmitted = true;
                    showToast('Password reset link sent! Check your inbox.', 'success');
                    this.mount(this.container);
                } catch (err) {
                    showToast(`Error: ${err.message}`, 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Send Reset Link';
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
