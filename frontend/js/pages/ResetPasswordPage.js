// Reset Password Page Component with real-time token validation and glassmorphism styling
import { authAPI } from '../api.js';
import { router } from '../router.js';
import { showToast } from '../components/Toast.js';

export class ResetPasswordPage {
    constructor() {
        this.container = null;
        this.escListener = null;
        this.token = '';
        this.isValidating = true;
        this.isValidToken = false;
        this.errorMessage = '';
        this.userEmail = '';
    }

    render() {
        // 1. Loading state while validating token
        if (this.isValidating) {
            return `
            <div id="reset-page-view" class="auth-page-view" style="cursor: pointer;">
                <div class="grid-pattern absolute inset-0 opacity-30" style="pointer-events: none;"></div>
                
                <div class="auth-card" style="cursor: default; text-align: center; padding: 3rem 2rem;">
                    <div class="flex-column align-center justify-center gap-4">
                        <svg class="animate-spin" style="animation: spin 1s linear infinite; width: 40px; height: 40px; color: var(--primary);" viewBox="0 0 24 24" fill="none">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <div>
                            <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.25rem;">Validating Reset Link...</h2>
                            <p class="text-secondary text-xs">Please wait while we verify your security credentials.</p>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }

        // 2. Invalid or expired token error state
        if (!this.isValidToken) {
            return `
            <div id="reset-page-view" class="auth-page-view" style="cursor: pointer;">
                <div class="grid-pattern absolute inset-0 opacity-30" style="pointer-events: none;"></div>
                
                <div class="auth-card" style="cursor: default; text-align: center;">
                    <!-- Close button -->
                    <button type="button" class="modal-close-btn" id="reset-close-btn" title="Close" aria-label="Close" style="top: 1.25rem; right: 1.25rem;">
                        &times;
                    </button>

                    <div class="flex-column align-center mb-6">
                        <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; color: #ef4444;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <h1 class="hero-title" style="font-size: 1.75rem; margin-bottom: 0.5rem;">Link Expired or Invalid</h1>
                        <p class="text-secondary text-sm" style="max-width: 320px; line-height: 1.6;">
                            ${this.escapeHtml(this.errorMessage || 'This password reset link is invalid, has expired, or has already been used.')}
                        </p>
                    </div>

                    <div class="flex-column gap-3">
                        <a href="/forgot-password" class="btn btn-primary btn-lg w-full" id="reset-request-new-btn" data-link>
                            Request a New Link
                        </a>
                        <a href="/login" class="btn btn-ghost w-full text-xs text-secondary hover-underline" data-link>
                            Back to Log In
                        </a>
                    </div>
                </div>
            </div>
            `;
        }

        // 3. Valid state: New Password Form
        return `
        <div id="reset-page-view" class="auth-page-view" style="cursor: pointer;">
            <div class="grid-pattern absolute inset-0 opacity-30" style="pointer-events: none;"></div>
            
            <div class="auth-card" style="cursor: default;">
                <!-- Close button for pop-up style dismissal -->
                <button type="button" class="modal-close-btn" id="reset-close-btn" title="Close" aria-label="Close" style="top: 1.25rem; right: 1.25rem;">
                    &times;
                </button>

                <div class="mb-6">
                    <h1 class="hero-title" style="font-size: 1.75rem; margin-bottom: 0.25rem;">Create New Password</h1>
                    <p class="text-secondary text-sm">
                        ${this.userEmail ? `Setting a new password for <strong class="text-white">${this.escapeHtml(this.userEmail)}</strong>.` : 'Enter and confirm your new password below.'}
                    </p>
                </div>

                <form id="standalone-reset-form" class="flex-column gap-4">
                    <div class="form-group">
                        <label for="page-reset-new-password">New Password</label>
                        <input type="password" id="page-reset-new-password" class="form-control" placeholder="Min. 6 characters" minlength="6" required autocomplete="new-password" autofocus>
                    </div>

                    <div class="form-group">
                        <label for="page-reset-confirm-password">Confirm New Password</label>
                        <input type="password" id="page-reset-confirm-password" class="form-control" placeholder="Re-enter new password" minlength="6" required autocomplete="new-password">
                    </div>

                    <div style="background: rgba(15, 23, 42, 0.4); border-radius: 8px; padding: 0.75rem 1rem; border: 1px solid rgba(255, 255, 255, 0.05);">
                        <p class="text-xs text-secondary" style="margin: 0;">
                            🔒 Must be at least 6 characters. Use letters, numbers, and symbols for better security.
                        </p>
                    </div>

                    <button type="submit" class="btn btn-primary btn-lg w-full mt-2" id="reset-submit-btn">
                        Update Password
                    </button>
                </form>

                <p class="text-center text-secondary text-xs mt-6">
                    Remembered your password? <a href="/login" class="text-primary font-medium hover-underline" data-link>Log in</a>
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
        
        // Extract token from query params
        const params = new URLSearchParams(window.location.search);
        this.token = params.get('token') || '';

        if (!this.token) {
            this.isValidating = false;
            this.isValidToken = false;
            this.errorMessage = 'No password reset token was found in the link. Please request a new reset link.';
            this.container.innerHTML = this.render();
            this.bindEvents();
            return;
        }

        this.isValidating = true;
        this.container.innerHTML = this.render();
        this.bindEvents();

        // Verify token with backend
        try {
            const res = await authAPI.verifyResetToken(this.token);
            this.isValidating = false;
            if (res && res.valid) {
                this.isValidToken = true;
                this.userEmail = res.email || '';
            } else {
                this.isValidToken = false;
                this.errorMessage = res?.detail || 'This reset link has expired or has already been used.';
            }
        } catch (err) {
            this.isValidating = false;
            this.isValidToken = false;
            this.errorMessage = err.message || 'Failed to verify reset link.';
        }

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
        const closeBtn = document.getElementById('reset-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
            });
        }

        // Click outside the card to dismiss
        const pageView = document.getElementById('reset-page-view');
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

        // Submit form
        const form = document.getElementById('standalone-reset-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const newPasswordInput = document.getElementById('page-reset-new-password');
                const confirmPasswordInput = document.getElementById('page-reset-confirm-password');
                const submitBtn = document.getElementById('reset-submit-btn');

                const newPassword = newPasswordInput ? newPasswordInput.value : '';
                const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

                if (newPassword.length < 6) {
                    showToast('Password must be at least 6 characters long.', 'error');
                    if (newPasswordInput) newPasswordInput.focus();
                    return;
                }

                if (newPassword !== confirmPassword) {
                    showToast('Passwords do not match. Please verify and try again.', 'error');
                    if (confirmPasswordInput) confirmPasswordInput.focus();
                    return;
                }

                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <span class="inline-flex items-center gap-2">
                        <svg class="animate-spin" style="animation: spin 1s linear infinite; width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating Password...
                    </span>
                `;

                try {
                    await authAPI.resetPassword(this.token, newPassword);
                    showToast('Password reset successfully! You can now log in.', 'success');
                    router.navigate('/login');
                } catch (err) {
                    showToast(`Failed to reset password: ${err.message}`, 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Update Password';
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
