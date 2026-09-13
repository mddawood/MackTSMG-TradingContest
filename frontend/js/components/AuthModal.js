// Auth Modal Component (Login & Sign Up)
import { authAPI } from '../api.js';
import { router } from '../router.js';
import { showToast } from './Toast.js';

let loginSuccessCallback = null;

export function initAuthModal({ onLoginSuccess }) {
    loginSuccessCallback = onLoginSuccess;

    const authModal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegisterBtn = document.getElementById('tab-register-btn');
    const closeBtn = document.getElementById('modal-close-btn');
    const forgotLink = document.getElementById('modal-forgot-password-link');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeAuthModal);
    }

    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeAuthModal();
            router.navigate('/forgot-password');
        });
    }

    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) closeAuthModal();
        });
    }

    if (tabLoginBtn) {
        tabLoginBtn.addEventListener('click', () => switchTab('login'));
    }

    if (tabRegisterBtn) {
        tabRegisterBtn.addEventListener('click', () => switchTab('register'));
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Password visibility toggle helper
    const setupToggle = (btnId, inputId) => {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        if (!btn || !input) return;

        const eyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        const eyeOff = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            btn.innerHTML = isPassword ? eyeOff : eyeOpen;
            btn.title = isPassword ? 'Hide password' : 'Show password';
        });
    };

    setupToggle('toggle-modal-login-pwd-btn', 'login-password');
    setupToggle('toggle-modal-register-pwd-btn', 'register-password');
    setupToggle('toggle-modal-register-confirm-pwd-btn', 'register-confirm-password');
}

export function openAuthModal(tab = 'login') {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.remove('hidden');
        switchTab(tab);
    }
}

export function closeAuthModal() {
    const authModal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (authModal) authModal.classList.add('hidden');
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();
}

export function switchTab(tab) {
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegisterBtn = document.getElementById('tab-register-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (tab === 'login') {
        if (tabLoginBtn) tabLoginBtn.classList.add('active');
        if (tabRegisterBtn) tabRegisterBtn.classList.remove('active');
        if (loginForm) loginForm.classList.remove('hidden');
        if (registerForm) registerForm.classList.add('hidden');
    } else {
        if (tabRegisterBtn) tabRegisterBtn.classList.add('active');
        if (tabLoginBtn) tabLoginBtn.classList.remove('active');
        if (registerForm) registerForm.classList.remove('hidden');
        if (loginForm) loginForm.classList.add('hidden');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const data = await authAPI.login(email, password);
        localStorage.setItem('token', data.access_token);
        closeAuthModal();
        showToast('Logged in successfully!', 'success');

        if (loginSuccessCallback) {
            await loginSuccessCallback(data.access_token);
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const deltaUserId = document.getElementById('register-delta-id').value;

    if (password.length < 8) {
        showToast('Password must be at least 8 characters long.', 'error');
        const pwdInput = document.getElementById('register-password');
        if (pwdInput) pwdInput.focus();
        return;
    }

    if (!/[a-zA-Z]/.test(password) || !/[\d\W_]/.test(password)) {
        showToast('Password must contain at least one letter and one number or symbol.', 'error');
        const pwdInput = document.getElementById('register-password');
        if (pwdInput) pwdInput.focus();
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match. Please verify and try again.', 'error');
        const confirmInput = document.getElementById('register-confirm-password');
        if (confirmInput) confirmInput.focus();
        return;
    }

    try {
        await authAPI.register({
            email,
            full_name: fullName,
            password,
            delta_user_id: deltaUserId
        });

        showToast('Account created successfully! Please log in.', 'success');
        switchTab('login');
    } catch (err) {
        showToast(err.message, 'error');
    }
}
