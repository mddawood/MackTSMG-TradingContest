// Main Application Entry Point & Bootstrap
import { loadConfig, authAPI, setUnauthorizedHandler } from './api.js';
import { router } from './router.js';
import { initNavbar, updateNavbar } from './components/Navbar.js';
import { initAuthModal, openAuthModal } from './components/AuthModal.js';
import { initCreateCompModal, openCreateCompModal } from './components/CreateCompModal.js';
import { showToast } from './components/Toast.js';
import { LandingPage } from './pages/LandingPage.js';
import { LeaderboardPage } from './pages/LeaderboardPage.js';
import { JoinPage } from './pages/JoinPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { SignupPage } from './pages/SignupPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { ResetPasswordPage } from './pages/ResetPasswordPage.js';

// Global Application State
export const state = {
    token: localStorage.getItem('token') || null,
    user: null
};

// Page Instances (instantiated on DOM ready)
let landingPage = null;
let leaderboardPage = null;
let joinPage = null;
let loginPage = null;
let signupPage = null;
let dashboardPage = null;
let adminPage = null;
let forgotPasswordPage = null;
let resetPasswordPage = null;

let activePage = null;

function mountPage(page, user = null) {
    const appView = document.getElementById('app-view');
    if (!appView) return;

    if (activePage && typeof activePage.unmount === 'function') {
        activePage.unmount();
    }

    activePage = page;
    page.mount(appView, user);
}

export function handleLogout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    updateNavbar(null);
    router.navigate('/');
    showToast('Logged out successfully.', 'success');
}

export async function handleLoginSuccess(token, redirect = true) {
    state.token = token;
    localStorage.setItem('token', token);
    try {
        state.user = await authAPI.getMe();
        updateNavbar(state.user);
        if (redirect) {
            if (state.user?.role === 'admin') {
                router.navigate('/admin');
            } else {
                router.navigate('/dashboard');
            }
        }
    } catch (err) {
        console.error('Failed to get user after login:', err);
        handleLogout();
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Instantiate Page Components now that all modules have evaluated
    landingPage = new LandingPage();
    leaderboardPage = new LeaderboardPage();
    joinPage = new JoinPage({ onLoginSuccess: handleLoginSuccess });
    loginPage = new LoginPage({ onLoginSuccess: handleLoginSuccess });
    signupPage = new SignupPage({ onLoginSuccess: handleLoginSuccess });
    dashboardPage = new DashboardPage();
    adminPage = new AdminPage();
    forgotPasswordPage = new ForgotPasswordPage();
    resetPasswordPage = new ResetPasswordPage();

    await loadConfig();

    // Setup 401 callback from api.js
    setUnauthorizedHandler(() => {
        handleLogout();
        showToast('Session expired. Please log in again.', 'error');
    });

    // Check existing auth token
    if (state.token) {
        try {
            state.user = await authAPI.getMe();
        } catch (err) {
            state.token = null;
            state.user = null;
            localStorage.removeItem('token');
        }
    }

    // Initialize UI Shell Components
    initNavbar({
        onLogout: handleLogout,
        onOpenAuth: (tab) => {
            if (tab === 'login') {
                router.navigate('/login');
            } else {
                router.navigate('/signup');
            }
        }
    });

    initAuthModal({
        onLoginSuccess: handleLoginSuccess
    });

    initCreateCompModal({
        onCompetitionCreated: async () => {
            if (activePage === adminPage) {
                await adminPage.loadAll();
            }
        }
    });

    updateNavbar(state.user);

    // Setup Router & Route Guards
    router.setAuthGuards(
        () => !!state.token,
        () => state.user?.role === 'admin',
        () => {
            showToast('Please log in to access this page.', 'error');
            router.navigate('/login');
        }
    );

    router
        .addRoute('/', () => {
            mountPage(landingPage);
        })
        .addRoute('/leaderboard', () => {
            mountPage(leaderboardPage);
        })
        .addRoute('/join', () => {
            joinPage.resetToNewMember();
            mountPage(joinPage);
        })
        .addRoute('/login', () => {
            if (state.token && state.user) {
                router.navigate(state.user.role === 'admin' ? '/admin' : '/dashboard');
            } else {
                mountPage(loginPage);
            }
        })
        .addRoute('/signup', () => {
            if (state.token && state.user) {
                router.navigate(state.user.role === 'admin' ? '/admin' : '/dashboard');
            } else {
                joinPage.resetToNewMember();
                mountPage(joinPage);
            }
        })
        .addRoute('/forgot-password', () => {
            if (state.token && state.user) {
                router.navigate(state.user.role === 'admin' ? '/admin' : '/dashboard');
            } else {
                mountPage(forgotPasswordPage);
            }
        })
        .addRoute('/reset-password', () => {
            mountPage(resetPasswordPage);
        })
        .addRoute('/dashboard', () => {
            mountPage(dashboardPage, state.user);
        }, { requiresAuth: true })
        .addRoute('/admin', () => {
            mountPage(adminPage, state.user);
        }, { requiresAuth: true, requiresAdmin: true });

    // Boot Router with current URL
    router.init();
});
