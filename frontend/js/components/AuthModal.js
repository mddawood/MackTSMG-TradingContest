// Auth Modal Component (Login & Sign Up)
import { authAPI } from '../api.js';
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

    if (closeBtn) {
        closeBtn.addEventListener('click', closeAuthModal);
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
    const deltaUserId = document.getElementById('register-delta-id').value;

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
