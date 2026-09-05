// Main Application Entry Point & Bootstrap
import { loadConfig, authAPI, setUnauthorizedHandler } from './api.js';
import { router } from './router.js';
import { initNavbar, updateNavbar } from './components/Navbar.js';
import { initAuthModal, openAuthModal } from './components/AuthModal.js';
import { initCreateCompModal, openCreateCompModal } from './components/CreateCompModal.js';
import { showToast } from './components/Toast.js';
import { LandingPage } from './pages/LandingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { AdminPage } from './pages/AdminPage.js';

// Global Application State
export const state = {
    token: localStorage.getItem('token') || null,
    user: null
};

// Page Instances
const landingPage = new LandingPage();
const dashboardPage = new DashboardPage();
const adminPage = new AdminPage();

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

export async function handleLoginSuccess(token) {
    state.token = token;
    try {
        state.user = await authAPI.getMe();
        updateNavbar(state.user);
        router.navigate('/dashboard');
    } catch (err) {
        handleLogout();
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', async () => {
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
        onOpenAuth: (tab) => openAuthModal(tab),
        onOpenCreateComp: () => openCreateCompModal()
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
            openAuthModal('login');
        }
    );

    router
        .addRoute('/', () => {
            mountPage(landingPage);
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
