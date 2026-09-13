// Reset Password Page Component with real-time token validation, password strength meter, checklist, and glassmorphism styling
import { authAPI } from '../api.js';
import { router } from '../router.js';
import { showToast } from '../components/Toast.js';

const EYE_OPEN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const EYE_OFF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

const CHECK_EMPTY_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>`;
const CHECK_VALID_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

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
                        <p class="text-secondary text-sm" style="max-width: 340px; line-height: 1.6;">
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
                        <div class="password-input-wrap">
                            <input type="password" id="page-reset-new-password" class="form-control" placeholder="Min. 8 characters" minlength="8" required autocomplete="new-password" autofocus>
                            <button type="button" class="password-toggle-btn" id="toggle-new-pwd-btn" aria-label="Toggle password visibility" title="Show password">
                                ${EYE_OPEN_SVG}
                            </button>
                        </div>
                        
                        <!-- Strength Meter Bar -->
                        <div class="pwd-strength-wrap" id="pwd-strength-wrap">
                            <div class="pwd-strength-bar">
                                <div class="pwd-strength-fill" id="pwd-strength-fill"></div>
                            </div>
                            <div class="pwd-strength-label">
                                <span>Password Strength</span>
                                <span class="pwd-strength-text" id="pwd-strength-text">Too short</span>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="page-reset-confirm-password">Confirm New Password</label>
                        <div class="password-input-wrap">
                            <input type="password" id="page-reset-confirm-password" class="form-control" placeholder="Re-enter new password" minlength="8" required autocomplete="new-password">
                            <button type="button" class="password-toggle-btn" id="toggle-confirm-pwd-btn" aria-label="Toggle confirm password visibility" title="Show password">
                                ${EYE_OPEN_SVG}
                            </button>
                        </div>
                    </div>

                    <!-- Live Password Requirements Checklist -->
                    <div style="background: rgba(15, 23, 42, 0.4); border-radius: 8px; padding: 0.85rem 1rem; border: 1px solid rgba(255, 255, 255, 0.05);">
                        <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); font-weight: 600;">Requirements</span>
                        <ul class="pwd-checklist" id="pwd-checklist">
                            <li class="pwd-check-item" id="check-length">
                                <span class="pwd-check-icon" id="check-icon-length">${CHECK_EMPTY_SVG}</span>
                                <span>At least 8 characters</span>
                            </li>
                            <li class="pwd-check-item" id="check-variety">
                                <span class="pwd-check-icon" id="check-icon-variety">${CHECK_EMPTY_SVG}</span>
                                <span>Includes letters and numbers or symbols</span>
                            </li>
                            <li class="pwd-check-item" id="check-match">
                                <span class="pwd-check-icon" id="check-icon-match">${CHECK_EMPTY_SVG}</span>
                                <span>Passwords match</span>
                            </li>
                        </ul>
                    </div>

                    <button type="submit" class="btn btn-primary btn-lg w-full mt-2" id="reset-submit-btn" disabled>
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

        // Password input elements
        const newPasswordInput = document.getElementById('page-reset-new-password');
        const confirmPasswordInput = document.getElementById('page-reset-confirm-password');
        const toggleNewBtn = document.getElementById('toggle-new-pwd-btn');
        const toggleConfirmBtn = document.getElementById('toggle-confirm-pwd-btn');
        const submitBtn = document.getElementById('reset-submit-btn');

        // Toggle visibility helper
        const setupPasswordToggle = (btn, input) => {
            if (!btn || !input) return;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                btn.innerHTML = isPassword ? EYE_OFF_SVG : EYE_OPEN_SVG;
                btn.title = isPassword ? 'Hide password' : 'Show password';
            });
        };

        setupPasswordToggle(toggleNewBtn, newPasswordInput);
        setupPasswordToggle(toggleConfirmBtn, confirmPasswordInput);

        // Real-time strength and checklist update
        const updateValidationUI = () => {
            if (!newPasswordInput || !confirmPasswordInput || !submitBtn) return;

            const pwd = newPasswordInput.value;
            const confirm = confirmPasswordInput.value;

            const hasLength = pwd.length >= 8;
            const hasLetter = /[a-zA-Z]/.test(pwd);
            const hasNumberOrSymbol = /[\d\W_]/.test(pwd);
            const hasVariety = hasLetter && hasNumberOrSymbol;
            const hasMatch = pwd.length > 0 && confirm.length > 0 && pwd === confirm;

            // Update Checklist Items
            const updateCheckItem = (itemId, iconId, isValid) => {
                const item = document.getElementById(itemId);
                const icon = document.getElementById(iconId);
                if (item && icon) {
                    if (isValid) {
                        item.classList.add('valid');
                        icon.innerHTML = CHECK_VALID_SVG;
                    } else {
                        item.classList.remove('valid');
                        icon.innerHTML = CHECK_EMPTY_SVG;
                    }
                }
            };

            updateCheckItem('check-length', 'check-icon-length', hasLength);
            updateCheckItem('check-variety', 'check-icon-variety', hasVariety);
            updateCheckItem('check-match', 'check-icon-match', hasMatch);

            // Update Strength Bar & Label
            const fill = document.getElementById('pwd-strength-fill');
            const label = document.getElementById('pwd-strength-text');

            if (fill && label) {
                fill.className = 'pwd-strength-fill';
                label.className = 'pwd-strength-text';

                if (pwd.length === 0) {
                    label.innerText = 'Too short';
                } else if (!hasLength || (!hasLetter && !hasNumberOrSymbol)) {
                    fill.classList.add('is-weak');
                    label.classList.add('is-weak');
                    label.innerText = 'Weak';
                } else if (!hasVariety || pwd.length < 10) {
                    fill.classList.add('is-fair');
                    label.classList.add('is-fair');
                    label.innerText = 'Fair';
                } else {
                    fill.classList.add('is-strong');
                    label.classList.add('is-strong');
                    label.innerText = 'Strong';
                }
            }

            // Enable submit button only if all requirements are met
            submitBtn.disabled = !(hasLength && hasVariety && hasMatch);
        };

        if (newPasswordInput && confirmPasswordInput) {
            newPasswordInput.addEventListener('input', updateValidationUI);
            confirmPasswordInput.addEventListener('input', updateValidationUI);
        }

        // Submit form
        const form = document.getElementById('standalone-reset-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const newPassword = newPasswordInput ? newPasswordInput.value : '';
                const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

                if (newPassword.length < 8) {
                    showToast('Password must be at least 8 characters long.', 'error');
                    if (newPasswordInput) newPasswordInput.focus();
                    return;
                }

                if (!/[a-zA-Z]/.test(newPassword) || !/[\d\W_]/.test(newPassword)) {
                    showToast('Password must contain at least one letter and one number or symbol.', 'error');
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
                    showToast('Password reset successfully! You can now log in with your new password.', 'success');
                    router.navigate('/login');
                } catch (err) {
                    showToast(err.message || 'Failed to reset password', 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Update Password';
                    updateValidationUI();
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

