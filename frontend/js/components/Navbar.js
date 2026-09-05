// Navbar Component (Desktop & Mobile Drawer)
import { router } from '../router.js';

let logoutHandler = null;
let authModalHandler = null;
let createCompModalHandler = null;

export function initNavbar({ onLogout, onOpenAuth, onOpenCreateComp }) {
    logoutHandler = onLogout;
    authModalHandler = onOpenAuth;
    createCompModalHandler = onOpenCreateComp;

    // Desktop Nav events
    const navLogo = document.getElementById('nav-logo');
    if (navLogo) {
        navLogo.addEventListener('click', (e) => {
            e.preventDefault();
            router.navigate('/');
        });
    }

    const loginBtn = document.getElementById('login-nav-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => authModalHandler && authModalHandler('login'));
    }

    const joinBtn = document.getElementById('join-nav-btn');
    if (joinBtn) {
        joinBtn.addEventListener('click', () => authModalHandler && authModalHandler('register'));
    }

    const dashBtn = document.getElementById('dashboard-nav-btn');
    if (dashBtn) {
        dashBtn.addEventListener('click', () => router.navigate('/dashboard'));
    }

    const adminBtn = document.getElementById('admin-nav-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', () => router.navigate('/admin'));
    }

    const createCompBtn = document.getElementById('admin-create-comp-btn');
    if (createCompBtn) {
        createCompBtn.addEventListener('click', () => createCompModalHandler && createCompModalHandler());
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => logoutHandler && logoutHandler());
    }

    // Mobile Drawer Setup
    const mobileDrawer = document.getElementById('mobile-menu-drawer');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenuCloseBtn = document.getElementById('mobile-menu-close-btn');

    const openDrawer = () => {
        if (mobileDrawer) mobileDrawer.classList.remove('hidden');
    };

    const closeDrawer = () => {
        if (mobileDrawer) mobileDrawer.classList.add('hidden');
    };

    if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', openDrawer);
    if (mobileMenuCloseBtn) mobileMenuCloseBtn.addEventListener('click', closeDrawer);

    if (mobileDrawer) {
        mobileDrawer.addEventListener('click', (e) => {
            if (e.target === mobileDrawer) closeDrawer();
        });

        // Close on public link clicks
        const mobileLinks = mobileDrawer.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', closeDrawer);
        });
    }

    // Mobile action buttons
    const mobileLoginBtn = document.getElementById('mobile-login-nav-btn');
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', () => {
            closeDrawer();
            authModalHandler && authModalHandler('login');
        });
    }

    const mobileJoinBtn = document.getElementById('mobile-join-nav-btn');
    if (mobileJoinBtn) {
        mobileJoinBtn.addEventListener('click', () => {
            closeDrawer();
            authModalHandler && authModalHandler('register');
        });
    }

    const mobileDashBtn = document.getElementById('mobile-dashboard-nav-btn');
    if (mobileDashBtn) {
        mobileDashBtn.addEventListener('click', () => {
            closeDrawer();
            router.navigate('/dashboard');
        });
    }

    const mobileAdminBtn = document.getElementById('mobile-admin-nav-btn');
    if (mobileAdminBtn) {
        mobileAdminBtn.addEventListener('click', () => {
            closeDrawer();
            router.navigate('/admin');
        });
    }

    const mobileCreateCompBtn = document.getElementById('mobile-admin-create-comp-btn');
    if (mobileCreateCompBtn) {
        mobileCreateCompBtn.addEventListener('click', () => {
            closeDrawer();
            createCompModalHandler && createCompModalHandler();
        });
    }

    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', () => {
            closeDrawer();
            logoutHandler && logoutHandler();
        });
    }
}

export function updateNavbar(user) {
    const authBtns = document.getElementById('nav-auth-buttons');
    const userControls = document.getElementById('nav-user-controls');
    const greetingSpan = document.getElementById('user-greeting');
    const adminNavBtn = document.getElementById('admin-nav-btn');
    const adminCreateCompBtn = document.getElementById('admin-create-comp-btn');
    const publicNav = document.getElementById('public-nav');

    // Mobile references
    const mobileAuthBtns = document.getElementById('mobile-nav-auth-buttons');
    const mobileUserControls = document.getElementById('mobile-nav-user-controls');
    const mobileGreetingSpan = document.getElementById('mobile-user-greeting');
    const mobileAdminNavBtn = document.getElementById('mobile-admin-nav-btn');
    const mobileAdminCreateCompBtn = document.getElementById('mobile-admin-create-comp-btn');
    const mobileRoleBadge = document.getElementById('mobile-user-role-badge');

    if (user) {
        if (authBtns) authBtns.classList.add('hidden');
        if (userControls) userControls.classList.remove('hidden');
        if (greetingSpan) greetingSpan.textContent = `Welcome, ${user.full_name || 'Trader'}`;

        // Mobile drawer updates
        if (mobileAuthBtns) mobileAuthBtns.classList.add('hidden');
        if (mobileUserControls) mobileUserControls.classList.remove('hidden');
        if (mobileGreetingSpan) mobileGreetingSpan.textContent = user.full_name || 'Trader';

        if (user.role === 'admin') {
            if (adminNavBtn) adminNavBtn.classList.remove('hidden');
            if (adminCreateCompBtn) adminCreateCompBtn.classList.remove('hidden');
            if (mobileAdminNavBtn) mobileAdminNavBtn.classList.remove('hidden');
            if (mobileAdminCreateCompBtn) mobileAdminCreateCompBtn.classList.remove('hidden');

            if (mobileRoleBadge) {
                mobileRoleBadge.textContent = 'System Admin';
                mobileRoleBadge.style.color = '#60a5fa';
            }
        } else {
            if (adminNavBtn) adminNavBtn.classList.add('hidden');
            if (adminCreateCompBtn) adminCreateCompBtn.classList.add('hidden');
            if (mobileAdminNavBtn) mobileAdminNavBtn.classList.add('hidden');
            if (mobileAdminCreateCompBtn) mobileAdminCreateCompBtn.classList.add('hidden');

            if (mobileRoleBadge) {
                mobileRoleBadge.textContent = 'Trader';
                mobileRoleBadge.style.color = 'var(--text-secondary)';
            }
        }
    } else {
        if (authBtns) authBtns.classList.remove('hidden');
        if (userControls) userControls.classList.add('hidden');
        if (adminNavBtn) adminNavBtn.classList.add('hidden');
        if (adminCreateCompBtn) adminCreateCompBtn.classList.add('hidden');

        // Mobile drawer updates
        if (mobileAuthBtns) mobileAuthBtns.classList.remove('hidden');
        if (mobileUserControls) mobileUserControls.classList.add('hidden');
        if (mobileAdminNavBtn) mobileAdminNavBtn.classList.add('hidden');
        if (mobileAdminCreateCompBtn) mobileAdminCreateCompBtn.classList.add('hidden');
    }
}
