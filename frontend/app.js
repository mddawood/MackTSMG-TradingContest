// Base Backend API configuration
const API_URL = 'http://127.0.0.1:8000';

// Global application state
let state = {
    token: localStorage.getItem('token') || null,
    user: null,
    competitions: [],
    apiKeys: [],
    selectedCompId: null,
    adminUsers: {
        q: '',
        page: 1,
        limit: 10,
        total: 0
    },
    adminComps: {
        q: '',
        page: 1,
        limit: 10,
        total: 0
    }
};

// ==========================================================================
// Initialization & Event Binding
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    bindEvents();
});

function initApp() {
    // Check if user is logged in
    if (state.token) {
        fetchProfileAndLoadDashboard();
    } else {
        showView('landing');
        loadPublicCompetitions();
    }
}

function bindEvents() {
    // Nav Navigation buttons
    document.getElementById('nav-logo').addEventListener('click', (e) => {
        e.preventDefault();
        showView('landing');
        loadPublicCompetitions();
    });

    // Auth Modal toggle handlers
    const authModal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegisterBtn = document.getElementById('tab-register-btn');
    const closeBtn = document.getElementById('modal-close-btn');

    const openAuthModal = (tab = 'login') => {
        authModal.classList.remove('hidden');
        switchTab(tab);
    };

    const closeAuthModal = () => {
        authModal.classList.add('hidden');
        loginForm.reset();
        registerForm.reset();
    };

    const switchTab = (tab) => {
        if (tab === 'login') {
            tabLoginBtn.classList.add('active');
            tabRegisterBtn.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            tabRegisterBtn.classList.add('active');
            tabLoginBtn.classList.remove('active');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        }
    };

    document.getElementById('login-nav-btn').addEventListener('click', () => openAuthModal('login'));
    document.getElementById('join-nav-btn').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('hero-join-btn').addEventListener('click', () => openAuthModal('register'));

    closeBtn.addEventListener('click', closeAuthModal);
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });

    tabLoginBtn.addEventListener('click', () => switchTab('login'));
    tabRegisterBtn.addEventListener('click', () => switchTab('register'));

    // Form Submissions
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    document.getElementById('api-key-form').addEventListener('submit', handleAddAPIKey);

    // Create Competition Modal toggle handlers
    const compModal = document.getElementById('comp-modal');
    const adminCreateCompBtn = document.getElementById('admin-create-comp-btn');
    const compModalCloseBtn = document.getElementById('comp-modal-close-btn');
    const compFormModal = document.getElementById('admin-comp-form-modal');

    if (adminCreateCompBtn) {
        adminCreateCompBtn.addEventListener('click', () => {
            compModal.classList.remove('hidden');
        });
    }

    const closeCompModal = () => {
        if (compModal) {
            compModal.classList.add('hidden');
        }
        if (compFormModal) {
            compFormModal.reset();
        }
    };

    if (compModalCloseBtn) {
        compModalCloseBtn.addEventListener('click', closeCompModal);
    }

    if (compModal) {
        compModal.addEventListener('click', (e) => {
            if (e.target === compModal) closeCompModal();
        });
    }

    if (compFormModal) {
        compFormModal.addEventListener('submit', handleCreateCompetition);
    }

    // Admin Users search and pagination controls
    const usersSearchInput = document.getElementById('admin-users-search');
    const usersSearchBtn = document.getElementById('admin-users-search-btn');
    const usersClearBtn = document.getElementById('admin-users-clear-btn');
    const usersPrevBtn = document.getElementById('admin-users-prev-btn');
    const usersNextBtn = document.getElementById('admin-users-next-btn');

    if (usersSearchBtn) {
        usersSearchBtn.addEventListener('click', () => {
            state.adminUsers.q = usersSearchInput.value.trim();
            state.adminUsers.page = 1;
            loadAdminUsers();
        });
    }
    if (usersSearchInput) {
        usersSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                state.adminUsers.q = usersSearchInput.value.trim();
                state.adminUsers.page = 1;
                loadAdminUsers();
            }
        });
    }
    if (usersClearBtn) {
        usersClearBtn.addEventListener('click', () => {
            usersSearchInput.value = '';
            state.adminUsers.q = '';
            state.adminUsers.page = 1;
            loadAdminUsers();
        });
    }
    if (usersPrevBtn) {
        usersPrevBtn.addEventListener('click', () => {
            if (state.adminUsers.page > 1) {
                state.adminUsers.page--;
                loadAdminUsers();
            }
        });
    }
    if (usersNextBtn) {
        usersNextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(state.adminUsers.total / state.adminUsers.limit) || 1;
            if (state.adminUsers.page < totalPages) {
                state.adminUsers.page++;
                loadAdminUsers();
            }
        });
    }

    // Admin Competitions search and pagination controls
    const compsSearchInput = document.getElementById('admin-comps-search');
    const compsSearchBtn = document.getElementById('admin-comps-search-btn');
    const compsClearBtn = document.getElementById('admin-comps-clear-btn');
    const compsPrevBtn = document.getElementById('admin-comps-prev-btn');
    const compsNextBtn = document.getElementById('admin-comps-next-btn');

    if (compsSearchBtn) {
        compsSearchBtn.addEventListener('click', () => {
            state.adminComps.q = compsSearchInput.value.trim();
            state.adminComps.page = 1;
            loadAdminCompetitions();
        });
    }
    if (compsSearchInput) {
        compsSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                state.adminComps.q = compsSearchInput.value.trim();
                state.adminComps.page = 1;
                loadAdminCompetitions();
            }
        });
    }
    if (compsClearBtn) {
        compsClearBtn.addEventListener('click', () => {
            compsSearchInput.value = '';
            state.adminComps.q = '';
            state.adminComps.page = 1;
            loadAdminCompetitions();
        });
    }
    if (compsPrevBtn) {
        compsPrevBtn.addEventListener('click', () => {
            if (state.adminComps.page > 1) {
                state.adminComps.page--;
                loadAdminCompetitions();
            }
        });
    }
    if (compsNextBtn) {
        compsNextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(state.adminComps.total / state.adminComps.limit) || 1;
            if (state.adminComps.page < totalPages) {
                state.adminComps.page++;
                loadAdminCompetitions();
            }
        });
    }

    // Dashboard navigation & controls
    document.getElementById('dashboard-nav-btn').addEventListener('click', () => {
        showView('dashboard');
        loadDashboardData();
    });

    document.getElementById('admin-nav-btn').addEventListener('click', () => {
        showView('admin');
        loadAdminData();
    });

    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('refresh-dash-btn').addEventListener('click', loadDashboardData);

    // Public Leaderboard selector
    const compSelect = document.getElementById('leaderboard-comp-select');
    compSelect.addEventListener('change', (e) => {
        const compId = e.target.value;
        if (compId) {
            loadLeaderboard(compId);
        } else {
            clearLeaderboard();
        }
    });
}

// ==========================================================================
// View Controller (Landing vs Dashboard vs Admin)
// ==========================================================================
function showView(viewName) {
    const landingView = document.getElementById('landing-view');
    const dashboardView = document.getElementById('dashboard-view');
    const adminView = document.getElementById('admin-view');
    const publicNav = document.getElementById('public-nav');

    if (viewName === 'landing') {
        landingView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
        adminView.classList.add('hidden');
        publicNav.style.display = 'flex';
    } else if (viewName === 'dashboard') {
        landingView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        adminView.classList.add('hidden');
        publicNav.style.display = 'none';
    } else if (viewName === 'admin') {
        landingView.classList.add('hidden');
        dashboardView.classList.add('hidden');
        adminView.classList.remove('hidden');
        publicNav.style.display = 'none';
    }
}

function updateNavUI() {
    const authBtns = document.getElementById('nav-auth-buttons');
    const userControls = document.getElementById('nav-user-controls');
    const greetingSpan = document.getElementById('user-greeting');
    const adminNavBtn = document.getElementById('admin-nav-btn');
    const adminCreateCompBtn = document.getElementById('admin-create-comp-btn');

    if (state.token && state.user) {
        authBtns.classList.add('hidden');
        userControls.classList.remove('hidden');
        greetingSpan.textContent = `Welcome, ${state.user.full_name}`;

        if (state.user.role === 'admin') {
            adminNavBtn.classList.remove('hidden');
            if (adminCreateCompBtn) adminCreateCompBtn.classList.remove('hidden');
        } else {
            adminNavBtn.classList.add('hidden');
            if (adminCreateCompBtn) adminCreateCompBtn.classList.add('hidden');
        }
    } else {
        authBtns.classList.remove('hidden');
        userControls.classList.add('hidden');
        adminNavBtn.classList.add('hidden');
        if (adminCreateCompBtn) adminCreateCompBtn.classList.add('hidden');
    }
}

// ==========================================================================
// API Fetch Wrappers
// ==========================================================================
async function apiRequest(endpoint, options = {}) {
    const headers = { ...options.headers };

    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        // Handle 401 token expiration
        if (response.status === 401 && state.token) {
            handleLogout();
            showToast('Session expired. Please log in again.', 'error');
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Request failed with status ${response.status}`);
        }

        if (response.status === 244 || response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (err) {
        console.error(`API Error (${endpoint}):`, err);
        throw err;
    }
}

// ==========================================================================
// User Authentication Handlers
// ==========================================================================
async function handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        await apiRequest('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, full_name: fullName, password })
        });

        showToast('Account created successfully! Please log in.', 'success');
        document.getElementById('tab-login-btn').click();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });

        state.token = data.access_token;
        localStorage.setItem('token', data.access_token);

        document.getElementById('auth-modal').classList.add('hidden');
        showToast('Logged in successfully!', 'success');

        await fetchProfileAndLoadDashboard();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function fetchProfileAndLoadDashboard() {
    try {
        const user = await apiRequest('/auth/me');
        state.user = user;
        updateNavUI();

        // Update user dashboard banner details
        document.getElementById('dash-user-name').textContent = user.full_name;
        document.getElementById('dash-user-email').textContent = user.email;

        showView('dashboard');
        await loadDashboardData();
    } catch (err) {
        handleLogout();
    }
}

function handleLogout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    updateNavUI();
    showView('landing');
    loadPublicCompetitions();
    showToast('Logged out.', 'success');
}

// ==========================================================================
// API Key Management Handlers
// ==========================================================================
async function loadAPIKeys() {
    try {
        const keys = await apiRequest('/api-keys/');
        state.apiKeys = keys;
        renderAPIKeys();
    } catch (err) {
        showToast('Failed to load API keys.', 'error');
    }
}

function renderAPIKeys() {
    const listContainer = document.getElementById('keys-list');

    if (state.apiKeys.length === 0) {
        listContainer.innerHTML = '<div class="text-center py-4 text-muted text-sm">No API keys registered yet.</div>';
        return;
    }

    listContainer.innerHTML = '';
    state.apiKeys.forEach(key => {
        const keyItem = document.createElement('div');
        keyItem.className = 'key-item flex-column gap-2';

        // Obfuscate key for display: e.g. key_1234...abcd
        const displayKey = key.api_key.substring(0, 8) + '...' + key.api_key.substring(key.api_key.length - 4);
        const statusClass = key.is_valid ? 'status-active' : 'status-invalid';
        const statusLabel = key.is_valid ? 'Active & Verified' : 'Invalid / Verification Failed';

        keyItem.innerHTML = `
            <div class="flex-row justify-between align-center">
                <div class="key-title">${displayKey}</div>
                <span class="env-badge env-${key.environment}">${key.environment}</span>
            </div>
            <div class="flex-row justify-between align-center mt-2">
                <div class="key-status ${statusClass}">${statusLabel}</div>
                <button class="btn btn-ghost text-destructive" onclick="deleteAPIKey(${key.id})" style="padding: 0 0.5rem; height: 1.75rem;">Delete</button>
            </div>
        `;
        listContainer.appendChild(keyItem);
    });
}

async function handleAddAPIKey(e) {
    e.preventDefault();
    const apiKey = document.getElementById('api-key-input').value;
    const apiSecret = document.getElementById('api-secret-input').value;
    const environment = document.getElementById('api-env-input').value;
    const submitBtn = document.getElementById('api-key-submit-btn');

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Verifying with Delta...';
    submitBtn.disabled = true;

    try {
        await apiRequest('/api-keys/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: apiKey, api_secret: apiSecret, environment })
        });

        showToast('API Key registered and verified successfully!', 'success');
        document.getElementById('api-key-form').reset();
        await loadAPIKeys();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function deleteAPIKey(keyId) {
    if (!confirm('Are you sure you want to delete this API Key? Any active registrations using this key will stop updating.')) {
        return;
    }

    try {
        await apiRequest(`/api-keys/${keyId}`, { method: 'DELETE' });
        showToast('API Key deleted.', 'success');
        await loadAPIKeys();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ==========================================================================
// Competition & Leaderboard Controller
// ==========================================================================
async function loadPublicCompetitions() {
    try {
        const comps = await apiRequest('/competitions/');
        state.competitions = comps;

        const compSelect = document.getElementById('leaderboard-comp-select');
        compSelect.innerHTML = '<option value="">-- Select Active Competition --</option>';

        comps.forEach(comp => {
            if (comp.is_active) {
                const opt = document.createElement('option');
                opt.value = comp.id;
                opt.textContent = `${comp.title} (Active)`;
                compSelect.appendChild(opt);
            }
        });
    } catch (err) {
        console.error('Failed to load public competitions:', err);
    }
}

async function loadLeaderboard(compId) {
    const tbody = document.getElementById('leaderboard-tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-muted">Loading standings...</td></tr>';

    try {
        const leaderboard = await apiRequest(`/competitions/${compId}/leaderboard`);

        if (leaderboard.entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-muted">No participants registered in this competition yet.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        leaderboard.entries.forEach(entry => {
            const row = document.createElement('tr');

            // Format rank styles
            let rankHtml = `<span class="rank-badge">${entry.rank}</span>`;
            if (entry.rank === 1) rankHtml = `<span class="rank-badge rank-1">1</span>`;
            else if (entry.rank === 2) rankHtml = `<span class="rank-badge rank-2">2</span>`;
            else if (entry.rank === 3) rankHtml = `<span class="rank-badge rank-3">3</span>`;

            // ROI styling
            const roiClass = entry.roi_percentage >= 0 ? 'roi-positive' : 'roi-negative';
            const roiPrefix = entry.roi_percentage >= 0 ? '+' : '';

            // Format volume and dates
            const formattedVolume = '₹' + entry.trading_volume.toLocaleString('en-IN', { maximumFractionDigits: 2 });
            const formattedPnL = (entry.absolute_pnl >= 0 ? '+' : '') + entry.absolute_pnl.toFixed(2);
            const formattedDate = new Date(entry.last_updated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(entry.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            row.innerHTML = `
                <td>${rankHtml}</td>
                <td><span style="font-weight: 600;">${entry.full_name}</span></td>
                <td class="text-right ${roiClass}">${roiPrefix}${entry.roi_percentage.toFixed(2)}%</td>
                <td class="text-right ${roiClass}">${formattedPnL}</td>
                <td class="text-right volume-val">${formattedVolume}</td>
                <td class="text-right text-muted" style="font-size: 0.75rem;">${formattedDate}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-destructive">Failed to load leaderboard data.</td></tr>';
    }
}

function clearLeaderboard() {
    const tbody = document.getElementById('leaderboard-tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-muted">Select a competition above to load the leaderboard.</td></tr>';
}

// ==========================================================================
// Dashboard View Loaders & Handlers
// ==========================================================================
async function loadDashboardData() {
    if (!state.token) return;

    await Promise.all([
        loadAPIKeys(),
        loadDashboardCompetitions()
    ]);
}

async function loadDashboardCompetitions() {
    try {
        const comps = await apiRequest('/competitions/');
        state.competitions = comps;

        // Fetch active user's registrations from backend
        const myRegs = await apiRequest('/competitions/my-registrations');

        renderMyStandings(myRegs);

        const registeredCompIds = myRegs.map(r => r.competition_id);
        renderAvailableCompetitions(registeredCompIds);
    } catch (err) {
        showToast('Failed to load dashboard data: ' + err.message, 'error');
    }
}

function renderMyStandings(myRegs) {
    const container = document.getElementById('my-registrations-list');

    if (myRegs.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-muted">Register for a championship below to track your stats.</div>';
        return;
    }

    container.innerHTML = '';
    myRegs.forEach(reg => {
        const item = document.createElement('div');
        item.className = 'comp-item flex-column gap-3';

        const roiClass = reg.roi_percentage >= 0 ? 'roi-positive' : 'roi-negative';
        const roiPrefix = reg.roi_percentage >= 0 ? '+' : '';
        const formattedPnL = (reg.absolute_pnl >= 0 ? '+' : '') + reg.absolute_pnl.toFixed(2);

        item.innerHTML = `
            <div class="comp-header flex-row justify-between align-center">
                <div>
                    <h3 class="comp-item-title">${reg.competition_title}</h3>
                    <span class="comp-item-dates" style="font-size: 0.7rem; color: var(--text-secondary);">Registered at: ${new Date(reg.registered_at).toLocaleDateString()}</span>
                </div>
                <button class="btn btn-secondary" onclick="syncRegistration(${reg.competition_id})" style="height: 2rem; font-size: 0.75rem; padding: 0 0.75rem;">
                    Sync Balance
                </button>
            </div>
            <div class="comp-metrics">
                <div class="metric-box">
                    <span class="metric-label">Start Balance</span>
                    <span class="metric-value">₹${reg.starting_balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div class="metric-box">
                    <span class="metric-label">Current Equity</span>
                    <span class="metric-value">₹${reg.current_equity.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div class="metric-box">
                    <span class="metric-label">ROI (%)</span>
                    <span class="metric-value ${roiClass}">${roiPrefix}${reg.roi_percentage.toFixed(2)}%</span>
                </div>
            </div>
            <div class="comp-metrics mt-2 border-top pt-2" style="border-top-style: dashed;">
                <div class="metric-box">
                    <span class="metric-label">Absolute PnL</span>
                    <span class="metric-value ${roiClass}">${formattedPnL}</span>
                </div>
                <div class="metric-box">
                    <span class="metric-label">Trading Volume</span>
                    <span class="metric-value">₹${reg.trading_volume.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div class="metric-box">
                    <span class="metric-label">Last Updated</span>
                    <span class="metric-value" style="font-size: 0.75rem; font-weight: normal; color: var(--text-secondary);">${new Date(reg.last_updated).toLocaleTimeString()}</span>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderAvailableCompetitions(registeredCompIds) {
    const container = document.getElementById('dashboard-competitions-list');
    const activeComps = state.competitions.filter(c => c.is_active);
    const joinableComps = activeComps.filter(c => !registeredCompIds.includes(c.id));

    if (joinableComps.length === 0) {
        container.innerHTML = '<div class="text-center py-6 text-muted text-sm">No new active championships available to join.</div>';
        return;
    }

    container.innerHTML = '';
    joinableComps.forEach(comp => {
        const item = document.createElement('div');
        item.className = 'comp-item flex-row justify-between align-center flex-wrap gap-4';

        const formattedStart = new Date(comp.start_time).toLocaleDateString();
        const formattedEnd = new Date(comp.end_time).toLocaleDateString();

        item.innerHTML = `
            <div>
                <h3 class="comp-item-title">${comp.title}</h3>
                <p class="comp-item-dates" style="font-size: 0.75rem; color: var(--text-secondary);">${formattedStart} – ${formattedEnd}</p>
                <p class="text-secondary text-xs mt-1" style="max-width: 380px; font-size: 0.75rem; line-height: 1.4;">${comp.description || 'No description provided.'}</p>
            </div>
            <button class="btn btn-primary" onclick="registerForComp(${comp.id})">
                Register Now
            </button>
        `;
        container.appendChild(item);
    });
}

async function registerForComp(compId) {
    try {
        await apiRequest(`/competitions/${compId}/register`, { method: 'POST' });
        showToast('Registered for the competition successfully!', 'success');
        await loadDashboardCompetitions();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function syncRegistration(compId) {
    try {
        await apiRequest(`/competitions/${compId}/sync`, { method: 'POST' });
        showToast('Leaderboard sync request queued in the background!', 'success');

        // Wait 1.5 seconds and reload standings
        setTimeout(async () => {
            await loadDashboardCompetitions();
        }, 1500);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ==========================================================================
// Admin Panel Management Handlers
// ==========================================================================
async function loadAdminData() {
    if (!state.token || state.user?.role !== 'admin') return;
    await Promise.all([
        loadAdminStats(),
        loadAdminUsers(),
        loadAdminCompetitions()
    ]);
}

async function loadAdminStats() {
    try {
        const stats = await apiRequest('/admin/stats');
        document.getElementById('admin-stat-users').textContent = stats.total_users;
        document.getElementById('admin-stat-deleted').textContent = stats.deleted_users;
        document.getElementById('admin-stat-keys').textContent = `${stats.valid_api_keys} / ${stats.total_api_keys}`;
        document.getElementById('admin-stat-comps').textContent = stats.total_competitions;
    } catch (err) {
        showToast('Failed to load admin stats.', 'error');
    }
}

async function loadAdminUsers() {
    const tbody = document.getElementById('admin-users-tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-muted">Loading user database...</td></tr>';

    try {
        const data = await apiRequest(`/admin/users?q=${state.adminUsers.q}&page=${state.adminUsers.page}&limit=${state.adminUsers.limit}`);
        state.adminUsers.total = data.total;
        const users = data.users;

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-muted">No users found.</td></tr>';
            document.getElementById('admin-users-page-info').textContent = `Showing page 1 of 1`;
            document.getElementById('admin-users-prev-btn').disabled = true;
            document.getElementById('admin-users-next-btn').disabled = true;
            return;
        }

        tbody.innerHTML = '';
        users.forEach(u => {
            const row = document.createElement('tr');
            if (u.is_deleted) {
                row.className = 'soft-deleted-row';
            }

            // Role badge
            const roleBadgeClass = u.role === 'admin' ? 'badge-admin' : 'badge-user';
            const roleHtml = `<span class="badge ${roleBadgeClass}">${u.role.toUpperCase()}</span>`;

            // Status badge
            const statusBadgeClass = u.is_deleted ? 'badge-deleted' : 'badge-active';
            const statusText = u.is_deleted ? 'Soft Deleted' : 'Active';
            const statusHtml = `<span class="badge ${statusBadgeClass}">${statusText}</span>`;

            // API Keys list format
            let keysHtml = '';
            if (u.api_keys.length === 0) {
                keysHtml = '<span class="text-muted" style="font-size:0.75rem;">None</span>';
            } else {
                keysHtml = u.api_keys.map(k => {
                    const checkMark = k.is_valid ? '✅' : '❌';
                    return `<div style="font-size:0.75rem;">${checkMark} ${k.api_key} (${k.environment})</div>`;
                }).join('');
            }

            // Action buttons
            let actionButtonsHtml = '';

            if (u.id !== state.user.id) {
                // Toggle Soft Delete / Restore
                if (u.is_deleted) {
                    actionButtonsHtml += `<button class="btn btn-secondary" onclick="restoreUser(${u.id})" style="height: 1.75rem; font-size: 0.7rem; padding: 0 0.5rem; margin-right: 0.25rem;">Restore</button>`;
                } else {
                    actionButtonsHtml += `<button class="btn btn-secondary text-destructive" onclick="softDeleteUser(${u.id})" style="height: 1.75rem; font-size: 0.7rem; padding: 0 0.5rem; margin-right: 0.25rem;">Soft Delete</button>`;
                }

                // Hard Delete
                actionButtonsHtml += `<button class="btn btn-danger" onclick="hardDeleteUser(${u.id})" style="height: 1.75rem; font-size: 0.7rem; padding: 0 0.5rem; margin-right: 0.25rem;">Hard Delete</button>`;

                // Promote to Admin (if not already admin)
                if (u.role !== 'admin') {
                    actionButtonsHtml += `<button class="btn btn-secondary" onclick="promoteUser(${u.id})" style="height: 1.75rem; font-size: 0.7rem; padding: 0 0.5rem; border-color: rgba(37, 99, 235, 0.3); color:#60a5fa;">Make Admin</button>`;
                }
            } else {
                actionButtonsHtml = '<span class="text-muted" style="font-size:0.75rem;">Current Session</span>';
            }

            row.innerHTML = `
                <td>
                    <div style="font-weight: 600;">${u.full_name}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">${u.email}</div>
                </td>
                <td>${roleHtml}</td>
                <td>${statusHtml}</td>
                <td>${keysHtml}</td>
                <td class="text-right">
                    <div class="action-btn-group">${actionButtonsHtml}</div>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Update pagination UI
        const totalPages = Math.ceil(state.adminUsers.total / state.adminUsers.limit) || 1;
        document.getElementById('admin-users-page-info').textContent = `Showing page ${state.adminUsers.page} of ${totalPages}`;
        document.getElementById('admin-users-prev-btn').disabled = state.adminUsers.page <= 1;
        document.getElementById('admin-users-next-btn').disabled = state.adminUsers.page >= totalPages;
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-destructive">Failed to load user database.</td></tr>';
    }
}

async function loadAdminCompetitions() {
    const tbody = document.getElementById('admin-comps-tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-muted">Loading competition database...</td></tr>';

    try {
        const data = await apiRequest(`/admin/competitions?q=${state.adminComps.q}&page=${state.adminComps.page}&limit=${state.adminComps.limit}`);
        state.adminComps.total = data.total;
        const comps = data.competitions;

        if (comps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-muted">No competitions found.</td></tr>';
            document.getElementById('admin-comps-page-info').textContent = `Showing page 1 of 1`;
            document.getElementById('admin-comps-prev-btn').disabled = true;
            document.getElementById('admin-comps-next-btn').disabled = true;
            return;
        }

        tbody.innerHTML = '';
        comps.forEach(c => {
            const row = document.createElement('tr');

            // Status badge
            const statusBadgeClass = c.is_active ? 'badge-active' : 'badge-deleted';
            const statusText = c.is_active ? 'Active' : 'Inactive';
            const statusHtml = `<span class="badge ${statusBadgeClass}">${statusText}</span>`;

            // Format times
            const formattedStart = new Date(c.start_time).toLocaleString();
            const formattedEnd = new Date(c.end_time).toLocaleString();

            // Action buttons
            let actionButtonsHtml = '';
            // Sync balance
            actionButtonsHtml += `<button class="btn btn-secondary" onclick="syncCompetition(${c.id})" style="height: 1.75rem; font-size: 0.7rem; padding: 0 0.5rem; margin-right: 0.25rem;">Sync Balance</button>`;

            // Toggle active
            actionButtonsHtml += `<button class="btn btn-secondary" onclick="toggleCompActive(${c.id})" style="height: 1.75rem; font-size: 0.7rem; padding: 0 0.5rem; margin-right: 0.25rem;">Toggle Status</button>`;

            // Delete
            actionButtonsHtml += `<button class="btn btn-danger" onclick="deleteCompetition(${c.id})" style="height: 1.75rem; font-size: 0.7rem; padding: 0 0.5rem;">Delete</button>`;

            row.innerHTML = `
                <td>
                    <div style="font-weight: 600;">${c.title}</div>
                    <div class="text-muted" style="font-size: 0.75rem; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${c.description || ''}">${c.description || 'No description'}</div>
                </td>
                <td><div style="font-size: 0.8rem;">${formattedStart}</div></td>
                <td><div style="font-size: 0.8rem;">${formattedEnd}</div></td>
                <td>${statusHtml}</td>
                <td class="text-center">${c.registration_count}</td>
                <td class="text-right">
                    <div class="action-btn-group">${actionButtonsHtml}</div>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Update pagination UI
        const totalPages = Math.ceil(state.adminComps.total / state.adminComps.limit) || 1;
        document.getElementById('admin-comps-page-info').textContent = `Showing page ${state.adminComps.page} of ${totalPages}`;
        document.getElementById('admin-comps-prev-btn').disabled = state.adminComps.page <= 1;
        document.getElementById('admin-comps-next-btn').disabled = state.adminComps.page >= totalPages;

    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-destructive">Failed to load competition database.</td></tr>';
    }
}

async function toggleCompActive(compId) {
    try {
        const res = await apiRequest(`/admin/competitions/${compId}/toggle-active`, { method: 'POST' });
        showToast(res.message, 'success');
        await loadAdminCompetitions();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteCompetition(compId) {
    if (!confirm('Are you sure you want to delete this competition? All registrations and leaderboards will be deleted!')) return;
    try {
        await apiRequest(`/admin/competitions/${compId}/delete`, { method: 'DELETE' });
        showToast('Competition deleted successfully.', 'success');
        await loadAdminStats();
        await loadAdminCompetitions();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function syncCompetition(compId) {
    try {
        const res = await apiRequest(`/competitions/${compId}/sync`, { method: 'POST' });
        showToast('Leaderboard sync request queued in the background!', 'success');
        setTimeout(async () => {
            await loadAdminCompetitions();
        }, 1500);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function softDeleteUser(userId) {
    if (!confirm('Are you sure you want to soft delete this user? They will be locked out and hidden from public leaderboards.')) return;
    try {
        await apiRequest(`/admin/users/${userId}/soft-delete`, { method: 'POST' });
        showToast('User account successfully soft-deleted.', 'success');
        await loadAdminData();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function restoreUser(userId) {
    try {
        await apiRequest(`/admin/users/${userId}/restore`, { method: 'POST' });
        showToast('User account restored successfully.', 'success');
        await loadAdminData();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function hardDeleteUser(userId) {
    if (!confirm('🚨 WARNING: Are you sure you want to PERMANENTLY delete this user? This will completely purge them, all their API Keys, all competition registrations, and leaderboard records from the database. This action is irreversible.')) return;
    try {
        await apiRequest(`/admin/users/${userId}/hard-delete`, { method: 'DELETE' });
        showToast('User permanently purged from the system.', 'success');
        await loadAdminData();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function promoteUser(userId) {
    if (!confirm('Are you sure you want to promote this user to Administrator?')) return;
    try {
        await apiRequest(`/admin/users/${userId}/promote`, { method: 'POST' });
        showToast('User successfully elevated to Admin.', 'success');
        await loadAdminData();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function handleCreateCompetition(e) {
    e.preventDefault();
    const title = document.getElementById('modal-comp-title').value;
    const description = document.getElementById('modal-comp-desc').value;
    const startTimeVal = document.getElementById('modal-comp-start').value;
    const endTimeVal = document.getElementById('modal-comp-end').value;
    const submitBtn = document.getElementById('modal-comp-submit-btn');

    // Parse to ISO string
    const start_time = new Date(startTimeVal).toISOString();
    const end_time = new Date(endTimeVal).toISOString();

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Launching...';
    submitBtn.disabled = true;

    try {
        await apiRequest('/competitions/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, start_time, end_time })
        });

        showToast('Competition created and launched successfully!', 'success');

        // Close modal
        const compModal = document.getElementById('comp-modal');
        if (compModal) {
            compModal.classList.add('hidden');
        }
        const compFormModal = document.getElementById('admin-comp-form-modal');
        if (compFormModal) {
            compFormModal.reset();
        }

        await loadAdminData();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Make globally accessible for inline onclick handlers
window.deleteAPIKey = deleteAPIKey;
window.registerForComp = registerForComp;
window.syncRegistration = syncRegistration;
window.softDeleteUser = softDeleteUser;
window.restoreUser = restoreUser;
window.hardDeleteUser = hardDeleteUser;
window.promoteUser = promoteUser;
window.toggleCompActive = toggleCompActive;
window.deleteCompetition = deleteCompetition;
window.syncCompetition = syncCompetition;

// ==========================================================================
// Global Window Helpers & Notification
// ==========================================================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');

    toastMsg.textContent = message;
    toast.className = 'toast'; // reset classes

    if (type === 'error') {
        toast.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        toast.style.boxShadow = '0 10px 35px rgba(239, 68, 68, 0.15)';
    } else {
        toast.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        toast.style.boxShadow = '0 10px 35px rgba(16, 185, 129, 0.15)';
    }

    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}
