// Admin Page Component with Dashboard-matched Sidebar Layout
import { adminAPI, competitionsAPI } from '../api.js';
import { showToast } from '../components/Toast.js';
import { openCreateCompModal } from '../components/CreateCompModal.js';

export class AdminPage {
    constructor() {
        this.container = null;
        this.currentUser = null;
        this.activeTab = 'competitions'; // 'competitions' (default / first), 'users', 'whitelist'
        this.stats = null;

        this.adminUsers = { q: '', page: 1, limit: 10, total: 0 };
        this.adminComps = { q: '', page: 1, limit: 10, total: 0 };
        this.adminWhitelist = { q: '', page: 1, limit: 10, total: 0 };
    }

    render() {
        const adminName = this.currentUser?.full_name || 'Admin';
        const adminInitials = adminName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD';

        return `
        <div id="admin-view" class="view-section">
            <div class="dashboard-layout">
                <!-- Sidebar -->
                <aside class="dashboard-sidebar">
                    <div class="p-3 mb-2 flex-row align-center gap-3">
                        <div class="avatar-circle" style="width: 2.25rem; height: 2.25rem; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);">
                            ${adminInitials}
                        </div>
                        <div class="flex-column" style="overflow: hidden;">
                            <span style="font-weight: 700; font-size: 0.9rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${adminName}</span>
                            <span class="badge badge-admin" style="width: fit-content; font-size: 0.65rem; padding: 0.1rem 0.4rem; margin-top: 0.15rem;">Administrator</span>
                        </div>
                    </div>

                    <nav class="flex-column gap-1" id="admin-sidebar-nav">
                        <button class="sidebar-link ${this.activeTab === 'competitions' ? 'active' : ''}" data-tab="competitions">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                            Competitions
                        </button>
                        <button class="sidebar-link ${this.activeTab === 'users' ? 'active' : ''}" data-tab="users">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            Users
                        </button>
                        <button class="sidebar-link ${this.activeTab === 'whitelist' ? 'active' : ''}" data-tab="whitelist">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                            Whitelist
                        </button>
                    </nav>

                </aside>

                <!-- Main Content Area -->
                <main class="dashboard-main" id="admin-tab-content">
                    ${this.renderActiveTabContent()}
                </main>
            </div>
        </div>
        `;
    }

    renderActiveTabContent() {
        if (this.activeTab === 'competitions') {
            return this.renderCompetitionsTab();
        } else if (this.activeTab === 'users') {
            return this.renderUsersTab();
        } else if (this.activeTab === 'whitelist') {
            return this.renderWhitelistTab();
        }
        return '';
    }

    renderCompetitionsTab() {
        const usersCount = this.stats ? this.stats.total_users : '-';
        const deletedCount = this.stats ? this.stats.deleted_users : '-';
        const keysCount = this.stats ? `${this.stats.valid_api_keys} / ${this.stats.total_api_keys}` : '-';
        const compsCount = this.stats ? this.stats.total_competitions : '-';

        return `
        <div class="flex-column gap-6">
            <!-- Header Banner -->
            <div class="card glass p-6 flex-row justify-between align-center flex-wrap gap-4" style="border: 1px solid var(--border-color); border-radius: 1rem;">
                <div>
                    <div class="flex-row align-center gap-3">
                        <h2 style="font-size: 1.5rem; font-weight: 700;">Admin Command Center</h2>
                        <span class="badge badge-admin" style="font-size: 0.68rem; padding: 0.2rem 0.5rem; letter-spacing: 0.05em;">RESTRICTED</span>
                    </div>
                    <p class="text-secondary text-sm mt-1">Manage competitions, user lifecycles, and view live exchange sync operations.</p>
                </div>
                <div class="flex-row gap-3">
                    <button class="btn btn-primary flex-row align-center gap-2" id="admin-launch-comp-btn" style="background: linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
                        Launch New Competition
                    </button>
                </div>
            </div>

            <!-- Quick Metrics Grid -->
            <div class="grid-4 gap-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                <div class="stat-card glass p-5 text-center">
                    <div class="text-muted text-xs text-uppercase font-mono mb-1">Total Registered Traders</div>
                    <div class="stat-value font-mono text-primary" id="admin-stat-users" style="font-size: 1.6rem; font-weight: 800;">${usersCount}</div>
                </div>
                <div class="stat-card glass p-5 text-center">
                    <div class="text-muted text-xs text-uppercase font-mono mb-1">Inactive / Soft-Deleted</div>
                    <div class="stat-value font-mono text-destructive" id="admin-stat-deleted" style="font-size: 1.6rem; font-weight: 800;">${deletedCount}</div>
                </div>
                <div class="stat-card glass p-5 text-center">
                    <div class="text-muted text-xs text-uppercase font-mono mb-1">Valid API Keys</div>
                    <div class="stat-value font-mono text-accent" id="admin-stat-keys" style="font-size: 1.6rem; font-weight: 800;">${keysCount}</div>
                </div>
                <div class="stat-card glass p-5 text-center">
                    <div class="text-muted text-xs text-uppercase font-mono mb-1">Active Competitions</div>
                    <div class="stat-value font-mono text-secondary" id="admin-stat-comps" style="font-size: 1.6rem; font-weight: 800;">${compsCount}</div>
                </div>
            </div>

            <!-- Competitions Management Section -->
            <div class="card glass p-6" style="border: 1px solid var(--border-color); border-radius: 1rem;">
                <div class="flex-row justify-between align-center mb-4 flex-wrap gap-4">
                    <h3 class="card-title flex-row align-center gap-2" style="margin-bottom: 0; font-size: 1.15rem; font-weight: 700;">
                        🏆 Competitions Management
                    </h3>
                    <div class="flex-row gap-2" style="width: 100%; max-width: 400px;">
                        <input type="text" id="admin-comps-search" class="form-control" placeholder="Search competitions..." value="${this.adminComps.q || ''}" style="height: 2.25rem; font-size: 0.85rem;">
                        <button class="btn btn-secondary" id="admin-comps-search-btn" style="height: 2.25rem; padding: 0 1rem; font-size: 0.8rem;">Search</button>
                        <button class="btn btn-ghost" id="admin-comps-clear-btn" style="height: 2.25rem; padding: 0 0.5rem; font-size: 0.8rem;" title="Clear search">Clear</button>
                    </div>
                </div>

                <div class="table-wrapper" style="border: 1px solid var(--border-color); border-radius: 0.5rem; background: rgba(0,0,0,0.2);">
                    <table class="leaderboard-table" style="margin-top: 0;">
                        <thead>
                            <tr>
                                <th>Competition</th>
                                <th>Start Time (IST)</th>
                                <th>End Time (IST)</th>
                                <th>Status</th>
                                <th>Participants</th>
                                <th class="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="admin-comps-tbody">
                            <tr>
                                <td colspan="6" class="text-center py-8 text-muted">Loading competition database...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <!-- Competitions Pagination -->
                <div class="flex-row justify-between align-center mt-4 pt-2 border-top" style="border-top-style: dashed; font-size: 0.85rem; color: var(--text-secondary);">
                    <span id="admin-comps-page-info">Showing page ${this.adminComps.page} of 1</span>
                    <div class="flex-row gap-2">
                        <button class="btn btn-secondary" id="admin-comps-prev-btn" style="height: 2rem; padding: 0 0.75rem; font-size: 0.75rem;">Previous</button>
                        <button class="btn btn-secondary" id="admin-comps-next-btn" style="height: 2rem; padding: 0 0.75rem; font-size: 0.75rem;">Next</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    renderUsersTab() {
        const usersCount = this.stats ? this.stats.total_users : '-';
        const deletedCount = this.stats ? this.stats.deleted_users : '-';
        const keysCount = this.stats ? `${this.stats.valid_api_keys} / ${this.stats.total_api_keys}` : '-';

        return `
        <div class="flex-column gap-6">
            <!-- Header Banner -->
            <div class="card glass p-6 flex-row justify-between align-center flex-wrap gap-4" style="border: 1px solid var(--border-color); border-radius: 1rem;">
                <div>
                    <div class="flex-row align-center gap-3">
                        <h2 style="font-size: 1.5rem; font-weight: 700;">User Accounts Directory</h2>
                        <span class="badge badge-user" style="font-size: 0.68rem; padding: 0.2rem 0.5rem;">TRADERS</span>
                    </div>
                    <p class="text-secondary text-sm mt-1">Manage trader accounts, roles, API credentials, and lifecycle states.</p>
                </div>
            </div>

            <!-- Quick User Metrics Grid -->
            <div class="grid-3 gap-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                <div class="stat-card glass p-5 text-center">
                    <div class="text-muted text-xs text-uppercase font-mono mb-1">Total Traders</div>
                    <div class="stat-value font-mono text-primary" id="admin-stat-users-tab" style="font-size: 1.5rem; font-weight: 800;">${usersCount}</div>
                </div>
                <div class="stat-card glass p-5 text-center">
                    <div class="text-muted text-xs text-uppercase font-mono mb-1">Inactive / Soft-Deleted</div>
                    <div class="stat-value font-mono text-destructive" id="admin-stat-deleted-tab" style="font-size: 1.5rem; font-weight: 800;">${deletedCount}</div>
                </div>
                <div class="stat-card glass p-5 text-center">
                    <div class="text-muted text-xs text-uppercase font-mono mb-1">Valid API Keys</div>
                    <div class="stat-value font-mono text-accent" id="admin-stat-keys-tab" style="font-size: 1.5rem; font-weight: 800;">${keysCount}</div>
                </div>
            </div>

            <!-- User Accounts Directory Card -->
            <div class="card glass p-6" style="border: 1px solid var(--border-color); border-radius: 1rem;">
                <div class="flex-row justify-between align-center mb-4 flex-wrap gap-4">
                    <h3 class="card-title flex-row align-center gap-2" style="margin-bottom: 0; font-size: 1.15rem; font-weight: 700;">
                        👥 Registered Traders
                    </h3>
                    <div class="flex-row gap-2" style="width: 100%; max-width: 400px;">
                        <input type="text" id="admin-users-search" class="form-control" placeholder="Search by name or email..." value="${this.adminUsers.q || ''}" style="height: 2.25rem; font-size: 0.85rem;">
                        <button class="btn btn-secondary" id="admin-users-search-btn" style="height: 2.25rem; padding: 0 1rem; font-size: 0.8rem;">Search</button>
                        <button class="btn btn-ghost" id="admin-users-clear-btn" style="height: 2.25rem; padding: 0 0.5rem; font-size: 0.8rem;" title="Clear search">Clear</button>
                    </div>
                </div>

                <div class="table-wrapper" style="border: 1px solid var(--border-color); border-radius: 0.5rem; background: rgba(0,0,0,0.2);">
                    <table class="leaderboard-table" style="margin-top: 0;">
                        <thead>
                            <tr>
                                <th>User Details</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Registered Keys</th>
                                <th class="text-right">Lifecycle Actions</th>
                            </tr>
                        </thead>
                        <tbody id="admin-users-tbody">
                            <tr>
                                <td colspan="5" class="text-center py-8 text-muted">Loading user database...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <!-- Users Pagination -->
                <div class="flex-row justify-between align-center mt-4 pt-2 border-top" style="border-top-style: dashed; font-size: 0.85rem; color: var(--text-secondary);">
                    <span id="admin-users-page-info">Showing page ${this.adminUsers.page} of 1</span>
                    <div class="flex-row gap-2">
                        <button class="btn btn-secondary" id="admin-users-prev-btn" style="height: 2rem; padding: 0 0.75rem; font-size: 0.75rem;">Previous</button>
                        <button class="btn btn-secondary" id="admin-users-next-btn" style="height: 2rem; padding: 0 0.75rem; font-size: 0.75rem;">Next</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    renderWhitelistTab() {
        return `
        <div class="flex-column gap-6">
            <!-- Header Banner -->
            <div class="card glass p-6 flex-row justify-between align-center flex-wrap gap-4" style="border: 1px solid var(--border-color); border-radius: 1rem;">
                <div>
                    <div class="flex-row align-center gap-3">
                        <h2 style="font-size: 1.5rem; font-weight: 700;">Referred Users Whitelist</h2>
                        <span class="badge badge-active" style="font-size: 0.68rem; padding: 0.2rem 0.5rem;">ACCESS CONTROL</span>
                    </div>
                    <p class="text-secondary text-sm mt-1">Authorize referred Delta Exchange accounts manually or via bulk Delta CSV export.</p>
                </div>
            </div>

            <!-- Whitelist Ingestion & Addition Controls -->
            <div class="whitelist-controls-grid">
                <!-- Single User Add Card -->
                <div class="whitelist-action-card">
                    <div class="whitelist-action-header">
                        <span class="whitelist-action-icon">➕</span>
                        <span class="whitelist-action-title">Manual Single Add</span>
                    </div>
                    <p class="whitelist-action-desc">Quickly whitelist an individual Delta User ID.</p>
                    <div class="flex-row gap-2">
                        <input type="text" id="admin-whitelist-add-input" class="form-control" placeholder="Enter Delta User ID" style="height: 2.25rem; font-size: 0.85rem;">
                        <button class="btn btn-primary" id="admin-whitelist-add-btn" style="height: 2.25rem; padding: 0 1rem; font-size: 0.8rem; white-space: nowrap;">+ Add</button>
                    </div>
                </div>

                <!-- Bulk CSV Upload Card -->
                <div class="whitelist-action-card">
                    <div class="whitelist-action-header justify-between">
                        <div class="flex-row align-center gap-2">
                            <span class="whitelist-action-icon">📄</span>
                            <span class="whitelist-action-title">Bulk CSV Whitelist Upload</span>
                        </div>
                        <span class="text-muted" style="font-size: 0.72rem;">Delta CSV Export</span>
                    </div>
                    <p class="whitelist-action-desc">Upload a Delta exported CSV (with <code>user_id</code> column) to bulk whitelist users automatically.</p>
                    
                    <div class="csv-upload-dropzone" id="admin-whitelist-dropzone">
                        <input type="file" id="admin-whitelist-file-input" accept=".csv,text/csv" style="display: none;">
                        <div id="admin-whitelist-dropzone-prompt" class="flex-row align-center justify-between gap-3 flex-wrap">
                            <div class="flex-row align-center gap-2">
                                <button type="button" class="btn btn-secondary" id="admin-whitelist-browse-btn" style="height: 2.25rem; padding: 0 1rem; font-size: 0.8rem;">
                                    📁 Choose CSV File
                                </button>
                                <span class="text-muted" style="font-size: 0.78rem;">or drag & drop file here</span>
                            </div>
                            <span class="badge" style="background: rgba(255,255,255,0.06); font-size: 0.7rem; color: var(--text-secondary);">.csv only</span>
                        </div>
                        <div id="admin-whitelist-file-selected" class="flex-row align-center justify-between gap-2 flex-wrap" style="display: none;">
                            <div class="flex-row align-center gap-2">
                                <span class="csv-file-pill">
                                    <span>📊</span>
                                    <span id="admin-whitelist-filename" style="font-weight: 600;">users.csv</span>
                                    <span id="admin-whitelist-filesize" class="text-muted" style="font-size: 0.75rem;">(1.2 KB)</span>
                                </span>
                                <span id="admin-whitelist-detected-badge" class="csv-preview-badge">Detecting...</span>
                            </div>
                            <div class="flex-row align-center gap-2">
                                <button type="button" class="btn btn-primary" id="admin-whitelist-upload-btn" style="height: 2.25rem; padding: 0 1.25rem; font-size: 0.8rem; font-weight: 600;">
                                    🚀 Upload & Whitelist
                                </button>
                                <button type="button" class="btn btn-ghost text-muted" id="admin-whitelist-file-cancel-btn" style="height: 2.25rem; padding: 0 0.5rem; font-size: 0.8rem;" title="Remove file">
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Whitelist Table Card -->
            <div class="card glass p-6" style="border: 1px solid var(--border-color); border-radius: 1rem;">
                <div class="flex-row justify-between align-center mb-4 flex-wrap gap-4">
                    <h3 class="card-title flex-row align-center gap-2" style="margin-bottom: 0; font-size: 1.15rem; font-weight: 700;">
                        👤 Whitelisted Delta User IDs
                    </h3>
                    <div class="flex-row gap-2" style="width: 100%; max-width: 400px;">
                        <input type="text" id="admin-whitelist-search" class="form-control" placeholder="Search by Delta User ID..." value="${this.adminWhitelist.q || ''}" style="height: 2.25rem; font-size: 0.85rem;">
                        <button class="btn btn-secondary" id="admin-whitelist-search-btn" style="height: 2.25rem; padding: 0 1rem; font-size: 0.8rem;">Search</button>
                        <button class="btn btn-ghost" id="admin-whitelist-clear-btn" style="height: 2.25rem; padding: 0 0.5rem; font-size: 0.8rem;" title="Clear search">Clear</button>
                    </div>
                </div>

                <div class="table-wrapper" style="border: 1px solid var(--border-color); border-radius: 0.5rem; background: rgba(0,0,0,0.2);">
                    <table class="leaderboard-table" style="margin-top: 0;">
                        <thead>
                            <tr>
                                <th>Delta User ID</th>
                                <th>Status</th>
                                <th>Added At</th>
                                <th class="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="admin-whitelist-tbody">
                            <tr>
                                <td colspan="4" class="text-center py-8 text-muted">Loading whitelist database...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <!-- Whitelist Pagination -->
                <div class="flex-row justify-between align-center mt-4 pt-2 border-top" style="border-top-style: dashed; font-size: 0.85rem; color: var(--text-secondary);">
                    <span id="admin-whitelist-page-info">Showing page ${this.adminWhitelist.page} of 1</span>
                    <div class="flex-row gap-2">
                        <button class="btn btn-secondary" id="admin-whitelist-prev-btn" style="height: 2rem; padding: 0 0.75rem; font-size: 0.75rem;">Previous</button>
                        <button class="btn btn-secondary" id="admin-whitelist-next-btn" style="height: 2rem; padding: 0 0.75rem; font-size: 0.75rem;">Next</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    async mount(container, user) {
        this.container = container;
        this.currentUser = user;
        this.container.innerHTML = this.render();

        this.bindEvents();
        await this.loadAll();
    }

    bindEvents() {
        // Sidebar tab navigation
        const nav = document.getElementById('admin-sidebar-nav');
        if (nav) {
            nav.addEventListener('click', (e) => {
                const btn = e.target.closest('.sidebar-link');
                if (!btn) return;
                const tab = btn.dataset.tab;
                if (!tab || tab === this.activeTab) return;

                nav.querySelectorAll('.sidebar-link').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeTab = tab;

                const main = document.getElementById('admin-tab-content');
                if (main) {
                    main.innerHTML = this.renderActiveTabContent();
                    this.bindActiveTabEvents();
                    this.updateStatsDisplay();

                    if (tab === 'competitions') {
                        this.loadCompetitions();
                    } else if (tab === 'users') {
                        this.loadUsers();
                    } else if (tab === 'whitelist') {
                        this.loadWhitelist();
                    }
                }
            });
        }

        this.bindActiveTabEvents();
    }

    bindActiveTabEvents() {
        if (this.activeTab === 'competitions') {
            this.bindCompetitionsEvents();
        } else if (this.activeTab === 'users') {
            this.bindUsersEvents();
        } else if (this.activeTab === 'whitelist') {
            this.bindWhitelistEvents();
        }
    }

    bindCompetitionsEvents() {
        // Launch comp button
        const launchBtn = document.getElementById('admin-launch-comp-btn');
        if (launchBtn) {
            launchBtn.addEventListener('click', () => openCreateCompModal());
        }

        // Competitions search & pagination
        const compsSearchInput = document.getElementById('admin-comps-search');
        const compsSearchBtn = document.getElementById('admin-comps-search-btn');
        const compsClearBtn = document.getElementById('admin-comps-clear-btn');
        const compsPrevBtn = document.getElementById('admin-comps-prev-btn');
        const compsNextBtn = document.getElementById('admin-comps-next-btn');

        if (compsSearchBtn) {
            compsSearchBtn.addEventListener('click', () => {
                this.adminComps.q = compsSearchInput?.value.trim() || '';
                this.adminComps.page = 1;
                this.loadCompetitions();
            });
        }
        if (compsSearchInput) {
            compsSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.adminComps.q = compsSearchInput.value.trim();
                    this.adminComps.page = 1;
                    this.loadCompetitions();
                }
            });
        }
        if (compsClearBtn) {
            compsClearBtn.addEventListener('click', () => {
                if (compsSearchInput) compsSearchInput.value = '';
                this.adminComps.q = '';
                this.adminComps.page = 1;
                this.loadCompetitions();
            });
        }
        if (compsPrevBtn) {
            compsPrevBtn.addEventListener('click', () => {
                if (this.adminComps.page > 1) {
                    this.adminComps.page--;
                    this.loadCompetitions();
                }
            });
        }
        if (compsNextBtn) {
            compsNextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.adminComps.total / this.adminComps.limit) || 1;
                if (this.adminComps.page < totalPages) {
                    this.adminComps.page++;
                    this.loadCompetitions();
                }
            });
        }
    }

    bindUsersEvents() {
        // Users search & pagination
        const usersSearchInput = document.getElementById('admin-users-search');
        const usersSearchBtn = document.getElementById('admin-users-search-btn');
        const usersClearBtn = document.getElementById('admin-users-clear-btn');
        const usersPrevBtn = document.getElementById('admin-users-prev-btn');
        const usersNextBtn = document.getElementById('admin-users-next-btn');

        if (usersSearchBtn) {
            usersSearchBtn.addEventListener('click', () => {
                this.adminUsers.q = usersSearchInput?.value.trim() || '';
                this.adminUsers.page = 1;
                this.loadUsers();
            });
        }
        if (usersSearchInput) {
            usersSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.adminUsers.q = usersSearchInput.value.trim();
                    this.adminUsers.page = 1;
                    this.loadUsers();
                }
            });
        }
        if (usersClearBtn) {
            usersClearBtn.addEventListener('click', () => {
                if (usersSearchInput) usersSearchInput.value = '';
                this.adminUsers.q = '';
                this.adminUsers.page = 1;
                this.loadUsers();
            });
        }
        if (usersPrevBtn) {
            usersPrevBtn.addEventListener('click', () => {
                if (this.adminUsers.page > 1) {
                    this.adminUsers.page--;
                    this.loadUsers();
                }
            });
        }
        if (usersNextBtn) {
            usersNextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.adminUsers.total / this.adminUsers.limit) || 1;
                if (this.adminUsers.page < totalPages) {
                    this.adminUsers.page++;
                    this.loadUsers();
                }
            });
        }
    }

    bindWhitelistEvents() {
        // Whitelist search, pagination & add
        const whitelistSearchInput = document.getElementById('admin-whitelist-search');
        const whitelistSearchBtn = document.getElementById('admin-whitelist-search-btn');
        const whitelistClearBtn = document.getElementById('admin-whitelist-clear-btn');
        const whitelistPrevBtn = document.getElementById('admin-whitelist-prev-btn');
        const whitelistNextBtn = document.getElementById('admin-whitelist-next-btn');
        const whitelistAddInput = document.getElementById('admin-whitelist-add-input');
        const whitelistAddBtn = document.getElementById('admin-whitelist-add-btn');

        if (whitelistSearchBtn) {
            whitelistSearchBtn.addEventListener('click', () => {
                this.adminWhitelist.q = whitelistSearchInput?.value.trim() || '';
                this.adminWhitelist.page = 1;
                this.loadWhitelist();
            });
        }
        if (whitelistSearchInput) {
            whitelistSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.adminWhitelist.q = whitelistSearchInput.value.trim();
                    this.adminWhitelist.page = 1;
                    this.loadWhitelist();
                }
            });
        }
        if (whitelistClearBtn) {
            whitelistClearBtn.addEventListener('click', () => {
                if (whitelistSearchInput) whitelistSearchInput.value = '';
                this.adminWhitelist.q = '';
                this.adminWhitelist.page = 1;
                this.loadWhitelist();
            });
        }
        if (whitelistPrevBtn) {
            whitelistPrevBtn.addEventListener('click', () => {
                if (this.adminWhitelist.page > 1) {
                    this.adminWhitelist.page--;
                    this.loadWhitelist();
                }
            });
        }
        if (whitelistNextBtn) {
            whitelistNextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.adminWhitelist.total / this.adminWhitelist.limit) || 1;
                if (this.adminWhitelist.page < totalPages) {
                    this.adminWhitelist.page++;
                    this.loadWhitelist();
                }
            });
        }

        if (whitelistAddBtn) {
            const handleAddSingle = async () => {
                const val = whitelistAddInput ? whitelistAddInput.value.trim() : '';
                if (!val) {
                    showToast('Please enter a Delta User ID.', 'error');
                    return;
                }
                try {
                    whitelistAddBtn.disabled = true;
                    whitelistAddBtn.textContent = 'Adding...';
                    await adminAPI.addWhitelist(val);
                    showToast(`Successfully whitelisted Delta User ID: ${val}`, 'success');
                    if (whitelistAddInput) whitelistAddInput.value = '';
                    this.adminWhitelist.page = 1;
                    await this.loadWhitelist();
                } catch (err) {
                    showToast(err.message, 'error');
                } finally {
                    whitelistAddBtn.disabled = false;
                    whitelistAddBtn.textContent = '+ Add';
                }
            };

            whitelistAddBtn.addEventListener('click', handleAddSingle);
            if (whitelistAddInput) {
                whitelistAddInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') handleAddSingle();
                });
            }
        }

        // Whitelist CSV Bulk Upload handlers
        const whitelistFileInput = document.getElementById('admin-whitelist-file-input');
        const whitelistBrowseBtn = document.getElementById('admin-whitelist-browse-btn');
        const whitelistDropzone = document.getElementById('admin-whitelist-dropzone');
        const whitelistDropPrompt = document.getElementById('admin-whitelist-dropzone-prompt');
        const whitelistFileSelected = document.getElementById('admin-whitelist-file-selected');
        const whitelistFilename = document.getElementById('admin-whitelist-filename');
        const whitelistFilesize = document.getElementById('admin-whitelist-filesize');
        const whitelistDetectedBadge = document.getElementById('admin-whitelist-detected-badge');
        const whitelistUploadBtn = document.getElementById('admin-whitelist-upload-btn');
        const whitelistCancelBtn = document.getElementById('admin-whitelist-file-cancel-btn');

        let selectedCsvFile = null;

        const formatBytes = (bytes) => {
            if (bytes < 1024) return `${bytes} B`;
            return `${(bytes / 1024).toFixed(1)} KB`;
        };

        const resetCsvState = () => {
            selectedCsvFile = null;
            if (whitelistFileInput) whitelistFileInput.value = '';
            if (whitelistFileSelected) whitelistFileSelected.style.display = 'none';
            if (whitelistDropPrompt) whitelistDropPrompt.style.display = 'flex';
            if (whitelistDropzone) whitelistDropzone.classList.remove('dragover');
        };

        const processSelectedFile = (file) => {
            if (!file) return;
            if (!file.name.toLowerCase().endsWith('.csv') && file.type && !file.type.includes('csv')) {
                showToast('Please select a valid .csv file.', 'error');
                return;
            }

            selectedCsvFile = file;
            if (whitelistFilename) whitelistFilename.textContent = file.name;
            if (whitelistFilesize) whitelistFilesize.textContent = `(${formatBytes(file.size)})`;
            if (whitelistDetectedBadge) whitelistDetectedBadge.textContent = 'Analyzing...';

            if (whitelistDropPrompt) whitelistDropPrompt.style.display = 'none';
            if (whitelistFileSelected) whitelistFileSelected.style.display = 'flex';

            // Fast client-side row estimation
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                    if (lines.length === 0) {
                        if (whitelistDetectedBadge) whitelistDetectedBadge.textContent = 'Empty file';
                        return;
                    }
                    const firstLower = lines[0].toLowerCase();
                    const knownHeaders = ['user_id', 'userid', 'user id', 'delta_user_id', 'id', 'uid', 'delta'];
                    const hasHeader = knownHeaders.some(h => firstLower.includes(h));
                    const estCount = hasHeader ? Math.max(0, lines.length - 1) : lines.length;
                    if (whitelistDetectedBadge) {
                        whitelistDetectedBadge.textContent = `${estCount} ID${estCount === 1 ? '' : 's'} detected`;
                    }
                } catch (err) {
                    if (whitelistDetectedBadge) whitelistDetectedBadge.textContent = 'CSV ready';
                }
            };
            reader.readAsText(file.slice(0, 102400));
        };

        if (whitelistBrowseBtn && whitelistFileInput) {
            whitelistBrowseBtn.addEventListener('click', () => whitelistFileInput.click());
            whitelistFileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    processSelectedFile(e.target.files[0]);
                }
            });
        }

        if (whitelistCancelBtn) {
            whitelistCancelBtn.addEventListener('click', resetCsvState);
        }

        if (whitelistDropzone) {
            whitelistDropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                whitelistDropzone.classList.add('dragover');
            });

            whitelistDropzone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                whitelistDropzone.classList.remove('dragover');
            });

            whitelistDropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                whitelistDropzone.classList.remove('dragover');
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    processSelectedFile(e.dataTransfer.files[0]);
                }
            });
        }

        if (whitelistUploadBtn) {
            whitelistUploadBtn.addEventListener('click', async () => {
                if (!selectedCsvFile) {
                    showToast('Please select a CSV file first.', 'error');
                    return;
                }

                try {
                    whitelistUploadBtn.disabled = true;
                    whitelistUploadBtn.textContent = 'Uploading...';
                    const res = await adminAPI.uploadWhitelist(selectedCsvFile);
                    showToast(res.message || 'CSV whitelist processed successfully!', 'success');
                    resetCsvState();
                    this.adminWhitelist.page = 1;
                    await this.loadWhitelist();
                } catch (err) {
                    showToast(err.message, 'error');
                } finally {
                    whitelistUploadBtn.disabled = false;
                    whitelistUploadBtn.textContent = '🚀 Upload & Whitelist';
                }
            });
        }
    }

    async loadAll() {
        await Promise.all([
            this.loadStats(),
            this.activeTab === 'competitions' ? this.loadCompetitions() : Promise.resolve(),
            this.activeTab === 'users' ? this.loadUsers() : Promise.resolve(),
            this.activeTab === 'whitelist' ? this.loadWhitelist() : Promise.resolve()
        ]);
    }

    updateStatsDisplay() {
        if (!this.stats) return;

        const statUsers = document.getElementById('admin-stat-users');
        if (statUsers) statUsers.textContent = this.stats.total_users;

        const statUsersTab = document.getElementById('admin-stat-users-tab');
        if (statUsersTab) statUsersTab.textContent = this.stats.total_users;

        const statDeleted = document.getElementById('admin-stat-deleted');
        if (statDeleted) statDeleted.textContent = this.stats.deleted_users;

        const statDeletedTab = document.getElementById('admin-stat-deleted-tab');
        if (statDeletedTab) statDeletedTab.textContent = this.stats.deleted_users;

        const statKeys = document.getElementById('admin-stat-keys');
        if (statKeys) statKeys.textContent = `${this.stats.valid_api_keys} / ${this.stats.total_api_keys}`;

        const statKeysTab = document.getElementById('admin-stat-keys-tab');
        if (statKeysTab) statKeysTab.textContent = `${this.stats.valid_api_keys} / ${this.stats.total_api_keys}`;

        const statComps = document.getElementById('admin-stat-comps');
        if (statComps) statComps.textContent = this.stats.total_competitions;
    }

    async loadStats() {
        try {
            this.stats = await adminAPI.getStats();
            this.updateStatsDisplay();
        } catch (err) {
            showToast('Failed to load admin stats.', 'error');
        }
    }

    async loadCompetitions() {
        const tbody = document.getElementById('admin-comps-tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-muted">Loading competition database...</td></tr>';

        try {
            const data = await adminAPI.getCompetitions(this.adminComps);
            this.adminComps.total = data.total;
            const comps = data.competitions;

            if (comps.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-muted">No competitions found.</td></tr>';
                const pageInfo = document.getElementById('admin-comps-page-info');
                if (pageInfo) pageInfo.textContent = 'Showing page 1 of 1';
                const prevBtn = document.getElementById('admin-comps-prev-btn');
                const nextBtn = document.getElementById('admin-comps-next-btn');
                if (prevBtn) prevBtn.disabled = true;
                if (nextBtn) nextBtn.disabled = true;
                return;
            }

            tbody.innerHTML = '';
            comps.forEach(c => {
                const row = document.createElement('tr');
                const statusBadgeClass = c.is_active ? 'badge-active' : 'badge-deleted';
                const statusText = c.is_active ? 'Active' : 'Inactive';
                const statusHtml = `<span class="badge ${statusBadgeClass}">${statusText}</span>`;

                const formatIST = (dateStr) => {
                    if (!dateStr) return '-';
                    try {
                        let iso = String(dateStr);
                        if (!iso.endsWith('Z') && !iso.includes('+') && !/[-+]\d{2}:\d{2}$/.test(iso)) {
                            iso += 'Z';
                        }
                        return new Date(iso).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        }) + ' IST';
                    } catch (e) {
                        return dateStr;
                    }
                };

                const formattedStart = formatIST(c.start_time);
                const formattedEnd = formatIST(c.end_time);

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
                        <div class="action-btn-group">
                            <button class="btn btn-secondary sync-comp-btn" data-comp-id="${c.id}" style="height: 1.75rem; font-size: 0.7rem; padding: 0 0.5rem; margin-right: 0.25rem;">Sync Balance</button>
                            <button class="btn btn-secondary toggle-comp-btn" data-comp-id="${c.id}" style="height: 1.75rem; font-size: 0.7rem; padding: 0 0.5rem; margin-right: 0.25rem;">Toggle Status</button>
                            <button class="btn btn-danger delete-comp-btn" data-comp-id="${c.id}" style="height: 1.75rem; font-size: 0.7rem; padding: 0 0.5rem;">Delete</button>
                        </div>
                    </td>
                `;

                row.querySelector('.sync-comp-btn').addEventListener('click', () => this.syncCompetition(c.id));
                row.querySelector('.toggle-comp-btn').addEventListener('click', () => this.toggleCompActive(c.id));
                row.querySelector('.delete-comp-btn').addEventListener('click', () => this.deleteCompetition(c.id));

                tbody.appendChild(row);
            });

            const totalPages = Math.ceil(this.adminComps.total / this.adminComps.limit) || 1;
            const pageInfo = document.getElementById('admin-comps-page-info');
            if (pageInfo) pageInfo.textContent = `Showing page ${this.adminComps.page} of ${totalPages}`;
            const prevBtn = document.getElementById('admin-comps-prev-btn');
            const nextBtn = document.getElementById('admin-comps-next-btn');
            if (prevBtn) prevBtn.disabled = this.adminComps.page <= 1;
            if (nextBtn) nextBtn.disabled = this.adminComps.page >= totalPages;
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-destructive">Failed to load competition database.</td></tr>';
        }
    }

    async toggleCompActive(compId) {
        try {
            const res = await adminAPI.toggleCompActive(compId);
            showToast(res.message, 'success');
            await this.loadCompetitions();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    async deleteCompetition(compId) {
        if (!confirm('Are you sure you want to delete this competition? All registrations and leaderboards will be deleted!')) return;
        try {
            await adminAPI.deleteCompetition(compId);
            showToast('Competition deleted successfully.', 'success');
            await this.loadStats();
            await this.loadCompetitions();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    async syncCompetition(compId) {
        try {
            await competitionsAPI.sync(compId);
            showToast('Leaderboard sync request queued in the background!', 'success');
            setTimeout(async () => {
                await this.loadCompetitions();
            }, 1500);
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    async loadUsers() {
        const tbody = document.getElementById('admin-users-tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-muted">Loading user database...</td></tr>';

        try {
            const data = await adminAPI.getUsers(this.adminUsers);
            this.adminUsers.total = data.total;
            const users = data.users;

            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-muted">No users found.</td></tr>';
                const pageInfo = document.getElementById('admin-users-page-info');
                if (pageInfo) pageInfo.textContent = 'Showing page 1 of 1';
                const prevBtn = document.getElementById('admin-users-prev-btn');
                const nextBtn = document.getElementById('admin-users-next-btn');
                if (prevBtn) prevBtn.disabled = true;
                if (nextBtn) nextBtn.disabled = true;
                return;
            }

            tbody.innerHTML = '';
            users.forEach(u => {
                const row = document.createElement('tr');
                if (u.is_deleted) {
                    row.className = 'soft-deleted-row';
                }

                const roleBadgeClass = u.role === 'admin' ? 'badge-admin' : 'badge-user';
                const roleHtml = `<span class="badge ${roleBadgeClass}">${u.role.toUpperCase()}</span>`;

                const statusBadgeClass = u.is_deleted ? 'badge-deleted' : 'badge-active';
                const statusText = u.is_deleted ? 'Soft Deleted' : 'Active';
                const statusHtml = `<span class="badge ${statusBadgeClass}">${statusText}</span>`;

                let keysHtml = '';
                if (!u.api_keys || u.api_keys.length === 0) {
                    keysHtml = '<span class="text-muted" style="font-size:0.75rem;">None</span>';
                } else {
                    keysHtml = u.api_keys.map(k => {
                        const checkMark = k.is_valid ? '✅' : '❌';
                        return `<div style="font-size:0.75rem;">${checkMark} ${k.api_key} (${k.environment})</div>`;
                    }).join('');
                }

                let actionButtonsHtml = '';
                if (u.id !== this.currentUser?.id) {
                    if (u.is_deleted) {
                        actionButtonsHtml += `<button class="btn btn-secondary restore-user-btn" data-user-id="${u.id}" style="height: 1.75rem; font-size: 0.7rem; padding: 0 0.5rem; margin-right: 0.25rem;">Restore</button>`;
                    } else {
                        actionButtonsHtml += `<button class="btn btn-secondary text-destructive soft-delete-btn" data-user-id="${u.id}" style="height: 1.75rem; font-size: 0.7rem; padding: 0 0.5rem; margin-right: 0.25rem;">Soft Delete</button>`;
                    }

                    actionButtonsHtml += `<button class="btn btn-danger hard-delete-btn" data-user-id="${u.id}" style="height: 1.75rem; font-size: 0.7rem; padding: 0 0.5rem; margin-right: 0.25rem;">Hard Delete</button>`;

                    if (u.role !== 'admin') {
                        actionButtonsHtml += `<button class="btn btn-secondary promote-user-btn" data-user-id="${u.id}" style="height: 1.75rem; font-size: 0.7rem; padding: 0 0.5rem; border-color: rgba(37, 99, 235, 0.3); color:#60a5fa;">Make Admin</button>`;
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

                const restoreBtn = row.querySelector('.restore-user-btn');
                if (restoreBtn) restoreBtn.addEventListener('click', () => this.restoreUser(u.id));

                const softDeleteBtn = row.querySelector('.soft-delete-btn');
                if (softDeleteBtn) softDeleteBtn.addEventListener('click', () => this.softDeleteUser(u.id));

                const hardDeleteBtn = row.querySelector('.hard-delete-btn');
                if (hardDeleteBtn) hardDeleteBtn.addEventListener('click', () => this.hardDeleteUser(u.id));

                const promoteBtn = row.querySelector('.promote-user-btn');
                if (promoteBtn) promoteBtn.addEventListener('click', () => this.promoteUser(u.id));

                tbody.appendChild(row);
            });

            const totalPages = Math.ceil(this.adminUsers.total / this.adminUsers.limit) || 1;
            const pageInfo = document.getElementById('admin-users-page-info');
            if (pageInfo) pageInfo.textContent = `Showing page ${this.adminUsers.page} of ${totalPages}`;
            const prevBtn = document.getElementById('admin-users-prev-btn');
            const nextBtn = document.getElementById('admin-users-next-btn');
            if (prevBtn) prevBtn.disabled = this.adminUsers.page <= 1;
            if (nextBtn) nextBtn.disabled = this.adminUsers.page >= totalPages;
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-destructive">Failed to load user database.</td></tr>';
        }
    }

    async softDeleteUser(userId) {
        if (!confirm('Are you sure you want to soft delete this user? They will be locked out and hidden from public leaderboards.')) return;
        try {
            await adminAPI.softDeleteUser(userId);
            showToast('User account successfully soft-deleted.', 'success');
            await this.loadAll();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    async restoreUser(userId) {
        try {
            await adminAPI.restoreUser(userId);
            showToast('User account restored successfully.', 'success');
            await this.loadAll();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    async hardDeleteUser(userId) {
        if (!confirm('🚨 WARNING: Are you sure you want to PERMANENTLY delete this user? This will completely purge them, all their API Keys, all competition registrations, and leaderboard records from the database. This action is irreversible.')) return;
        try {
            await adminAPI.hardDeleteUser(userId);
            showToast('User permanently purged from the system.', 'success');
            await this.loadAll();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    async promoteUser(userId) {
        if (!confirm('Are you sure you want to promote this user to Administrator?')) return;
        try {
            await adminAPI.promoteUser(userId);
            showToast('User successfully elevated to Admin.', 'success');
            await this.loadAll();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    async loadWhitelist() {
        const tbody = document.getElementById('admin-whitelist-tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-muted">Loading whitelist database...</td></tr>';

        try {
            const data = await adminAPI.getWhitelist(this.adminWhitelist);
            this.adminWhitelist.total = data.total;
            const users = data.referred_users;

            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-muted">No whitelisted user IDs found.</td></tr>';
                const pageInfo = document.getElementById('admin-whitelist-page-info');
                if (pageInfo) pageInfo.textContent = 'Showing page 1 of 1';
                const prevBtn = document.getElementById('admin-whitelist-prev-btn');
                const nextBtn = document.getElementById('admin-whitelist-next-btn');
                if (prevBtn) prevBtn.disabled = true;
                if (nextBtn) nextBtn.disabled = true;
                return;
            }

            tbody.innerHTML = '';
            users.forEach(u => {
                const row = document.createElement('tr');
                const statusBadgeClass = u.is_registered ? 'badge-active' : 'badge-deleted';
                const statusText = u.is_registered ? 'Registered' : 'Unclaimed';

                const idCell = document.createElement('td');
                const strong = document.createElement('strong');
                strong.textContent = u.delta_user_id;
                idCell.appendChild(strong);

                const statusCell = document.createElement('td');
                statusCell.innerHTML = `<span class="badge ${statusBadgeClass}">${statusText}</span>`;

                const dateCell = document.createElement('td');
                dateCell.textContent = new Date(u.added_at).toLocaleString();

                const actionCell = document.createElement('td');
                actionCell.className = 'text-right';
                if (!u.is_registered) {
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-danger delete-whitelist-btn';
                    btn.style.height = '1.75rem';
                    btn.style.fontSize = '0.7rem';
                    btn.style.padding = '0 0.5rem';
                    btn.textContent = 'Remove';
                    btn.addEventListener('click', () => this.deleteWhitelistUser(u.delta_user_id));
                    actionCell.appendChild(btn);
                } else {
                    const span = document.createElement('span');
                    span.className = 'text-muted';
                    span.style.fontSize = '0.75rem';
                    span.textContent = '(Active User)';
                    actionCell.appendChild(span);
                }

                row.appendChild(idCell);
                row.appendChild(statusCell);
                row.appendChild(dateCell);
                row.appendChild(actionCell);

                tbody.appendChild(row);
            });

            const totalPages = Math.ceil(this.adminWhitelist.total / this.adminWhitelist.limit) || 1;
            const pageInfo = document.getElementById('admin-whitelist-page-info');
            if (pageInfo) pageInfo.textContent = `Showing page ${this.adminWhitelist.page} of ${totalPages} (Total: ${this.adminWhitelist.total})`;
            const prevBtn = document.getElementById('admin-whitelist-prev-btn');
            const nextBtn = document.getElementById('admin-whitelist-next-btn');
            if (prevBtn) prevBtn.disabled = this.adminWhitelist.page <= 1;
            if (nextBtn) nextBtn.disabled = this.adminWhitelist.page >= totalPages;
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-destructive">Failed to load whitelisted users.</td></tr>';
        }
    }

    async deleteWhitelistUser(deltaUserId) {
        if (!confirm(`Are you sure you want to remove Delta User ID ${deltaUserId} from the whitelist?`)) return;

        try {
            await adminAPI.deleteWhitelist(deltaUserId);
            showToast(`Successfully removed Delta User ID ${deltaUserId} from whitelist.`, 'success');
            await this.loadWhitelist();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    unmount() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
