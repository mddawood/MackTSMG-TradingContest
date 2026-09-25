// Navbar Component (Desktop & Mobile Drawer)
import { router } from '../router.js';
import { calculateProfileCompletion, renderAvatarWithProgress } from '../utils.js';

let logoutHandler = null;
let authModalHandler = null;

export function initNavbar({ onLogout, onOpenAuth }) {
    logoutHandler = onLogout;
    authModalHandler = onOpenAuth;

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
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            router.navigate('/login');
        });
    }

    const joinBtn = document.getElementById('join-nav-btn');
    if (joinBtn) {
        joinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            router.navigate('/signup');
        });
    }

    const userPill = document.getElementById('nav-user-pill');
    if (userPill) {
        userPill.addEventListener('click', (e) => {
            e.preventDefault();
            router.navigate('/dashboard');
            // If dashboard page has switchToTab, switch to profile
            window.dispatchEvent(new CustomEvent('switch-dashboard-tab', { detail: { tab: 'profile' } }));
        });
    }

    // Salesforce Setup Gear Dropdown Logic
    const gearMenuBtn = document.getElementById('gear-menu-btn');
    const gearDropdown = document.getElementById('gear-dropdown-menu');

    let isGearOpen = false;

    const openGearMenu = () => {
        if (!gearDropdown) return;
        isGearOpen = true;
        gearDropdown.classList.remove('hidden');
        if (gearMenuBtn) gearMenuBtn.setAttribute('aria-expanded', 'true');
    };

    const closeGearMenu = () => {
        if (!gearDropdown) return;
        isGearOpen = false;
        gearDropdown.classList.add('hidden');
        if (gearMenuBtn) gearMenuBtn.setAttribute('aria-expanded', 'false');
    };

    const toggleGearMenu = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (isGearOpen) {
            closeGearMenu();
        } else {
            openGearMenu();
        }
    };

    if (gearMenuBtn) {
        gearMenuBtn.addEventListener('click', toggleGearMenu);
    }

    // Close gear dropdown on click outside
    document.addEventListener('click', (e) => {
        // If clicking on or inside the gear button or dropdown, do not close here
        if (e.target.closest('#gear-menu-btn') || e.target.closest('#gear-dropdown-menu')) {
            return;
        }
        closeGearMenu();
    });

    // Close gear dropdown on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeGearMenu();
    });

    // Gear Dropdown Links
    const gearDashBtn = document.getElementById('gear-dash-btn');
    if (gearDashBtn) {
        gearDashBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeGearMenu();
            router.navigate('/dashboard');
        });
    }

    const gearAdminBtn = document.getElementById('gear-admin-btn');
    if (gearAdminBtn) {
        gearAdminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeGearMenu();
            router.navigate('/admin');
        });
    }

    const gearLogoutBtn = document.getElementById('gear-logout-btn');
    if (gearLogoutBtn) {
        gearLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeGearMenu();
            logoutHandler && logoutHandler();
        });
    }

    // Navbar Quick Logout button
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
        mobileLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeDrawer();
            router.navigate('/login');
        });
    }

    const mobileJoinBtn = document.getElementById('mobile-join-nav-btn');
    if (mobileJoinBtn) {
        mobileJoinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeDrawer();
            router.navigate('/signup');
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

    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', () => {
            closeDrawer();
            logoutHandler && logoutHandler();
        });
    }

    // Smooth scrolling for hash anchor links in desktop & mobile public nav
    const handleAnchorScroll = (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#') {
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
                if (window.history && window.history.pushState) {
                    window.history.pushState(null, '', targetId);
                }
            }
        }
    };

    const publicNav = document.getElementById('public-nav');
    if (publicNav) {
        publicNav.addEventListener('click', handleAnchorScroll);
    }

    const mobilePublicNav = document.getElementById('mobile-public-nav');
    if (mobilePublicNav) {
        mobilePublicNav.addEventListener('click', (e) => {
            closeDrawer();
            handleAnchorScroll(e);
        });
    }

    // Listen for route changes to toggle landing page navbar links
    router.onRouteChange(updateNavbarRoute);
    updateNavbarRoute(window.location.pathname);
}

export function updateNavbarRoute(pathname) {
    const isHomePage = pathname === '/' || pathname === '' || pathname === '/index.html';
    const isAppShell = pathname === '/dashboard' || pathname === '/admin';
    const publicNav = document.getElementById('public-nav');
    const mobilePublicNav = document.getElementById('mobile-public-nav');
    const contextBadge = document.getElementById('header-context-badge');
    const mainFooter = document.querySelector('.main-footer');

    // Toggle Salesforce-style full-height app shell mode
    if (isAppShell) {
        document.body.classList.add('app-shell-mode');
        if (mainFooter) mainFooter.classList.add('hidden');
    } else {
        document.body.classList.remove('app-shell-mode');
        if (mainFooter) mainFooter.classList.remove('hidden');
    }

    if (publicNav) {
        if (isHomePage) {
            publicNav.classList.remove('hidden');
        } else {
            publicNav.classList.add('hidden');
        }
    }

    if (contextBadge) {
        if (!isHomePage) {
            contextBadge.classList.remove('hidden');
        } else {
            contextBadge.classList.add('hidden');
        }
    }

    if (mobilePublicNav) {
        if (isHomePage) {
            mobilePublicNav.classList.remove('hidden');
        } else {
            mobilePublicNav.classList.add('hidden');
        }
    }
}

export function updateNavbar(user) {
    const authBtns = document.getElementById('nav-auth-buttons');
    const userControls = document.getElementById('nav-user-controls');
    const greetingSpan = document.getElementById('user-greeting');
    const gearDropdown = document.getElementById('gear-dropdown-menu');
    const gearAdminBtn = document.getElementById('gear-admin-btn');
    const gearUserName = document.getElementById('gear-user-name');
    const gearUserRole = document.getElementById('gear-user-role');

    // Mobile references
    const mobileAuthBtns = document.getElementById('mobile-nav-auth-buttons');
    const mobileUserControls = document.getElementById('mobile-nav-user-controls');
    const mobileGreetingSpan = document.getElementById('mobile-user-greeting');
    const mobileAdminNavBtn = document.getElementById('mobile-admin-nav-btn');
    const mobileRoleBadge = document.getElementById('mobile-user-role-badge');

    if (user) {
        if (authBtns) authBtns.classList.add('hidden');
        if (userControls) userControls.classList.remove('hidden');
        if (greetingSpan) greetingSpan.textContent = user.full_name || 'Trader';

        // Render Avatars with Progress Ring
        const navAvatarWrap = document.getElementById('nav-avatar-wrap');
        if (navAvatarWrap) {
            navAvatarWrap.innerHTML = renderAvatarWithProgress(user, 34, true);
        }

        const gearAvatarWrap = document.getElementById('gear-avatar-wrap');
        if (gearAvatarWrap) {
            gearAvatarWrap.innerHTML = renderAvatarWithProgress(user, 36, false);
        }

        const gearPctText = document.getElementById('gear-pct-text');
        if (gearPctText) {
            const pct = calculateProfileCompletion(user);
            gearPctText.textContent = `${pct}% Profile Complete`;
            gearPctText.style.color = pct === 100 ? '#10b981' : (pct >= 50 ? '#60a5fa' : 'var(--text-secondary)');
        }

        // Gear Dropdown Profile
        if (gearUserName) gearUserName.textContent = user.full_name || 'Trader';

        // Mobile drawer updates
        if (mobileAuthBtns) mobileAuthBtns.classList.add('hidden');
        if (mobileUserControls) mobileUserControls.classList.remove('hidden');
        if (mobileGreetingSpan) mobileGreetingSpan.textContent = user.full_name || 'Trader';

        if (user.role === 'admin') {
            if (gearAdminBtn) gearAdminBtn.classList.remove('hidden');
            if (gearUserRole) {
                gearUserRole.textContent = 'ADMIN';
                gearUserRole.className = 'badge badge-admin';
            }

            if (mobileAdminNavBtn) mobileAdminNavBtn.classList.remove('hidden');
            if (mobileRoleBadge) {
                mobileRoleBadge.textContent = 'System Admin';
                mobileRoleBadge.style.color = '#60a5fa';
            }
        } else {
            if (gearAdminBtn) gearAdminBtn.classList.add('hidden');
            if (gearUserRole) {
                gearUserRole.textContent = 'TRADER';
                gearUserRole.className = 'badge badge-user';
            }

            if (mobileAdminNavBtn) mobileAdminNavBtn.classList.add('hidden');
            if (mobileRoleBadge) {
                mobileRoleBadge.textContent = 'Trader';
                mobileRoleBadge.style.color = 'var(--text-secondary)';
            }
        }
    } else {
        if (gearDropdown) gearDropdown.classList.add('hidden');
        if (authBtns) authBtns.classList.remove('hidden');
        if (userControls) userControls.classList.add('hidden');

        // Mobile drawer updates
        if (mobileAuthBtns) mobileAuthBtns.classList.remove('hidden');
        if (mobileUserControls) mobileUserControls.classList.add('hidden');
        if (mobileAdminNavBtn) mobileAdminNavBtn.classList.add('hidden');
    }
}

