// Admin Page Component with Dashboard-matched Sidebar Layout
import { adminAPI, competitionsAPI } from '../api.js';
import { showToast } from '../components/Toast.js';
import { openCreateCompModal } from '../components/CreateCompModal.js';

export class AdminPage {
    constructor() {
        this.container = null;
        this.currentUser = null;
        this.activeTab = 'users'; // 'users' (default), 'competitions', 'whitelist'
        this.stats = null;

        this.adminUsers = { q: '', page: 1, limit: 10, total: 0 };
        this.adminComps = { q: '', page: 1, limit: 10, total: 0 };
        this.adminWhitelist = { q: '', exchange: 'All', page: 1, limit: 10, total: 0 };

        this.currentFilter = 'all';
        this.currentSort = { field: null, order: 'asc' };
        this.loadedUsers = [];

        this._onDocClickForGear = null;
        this._onKeyForGear = null;
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
            <div class="card glass p-6 flex-row justify-between align-center flex-wrap gap-4" style="border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1rem; background: linear-gradient(180deg, rgba(30, 41, 59, 0.35) 0%, rgba(15, 23, 42, 0.6) 100%);">
                <div>
                    <div class="flex-row align-center gap-3">
                        <h2 style="font-size: 1.5rem; font-weight: 700; color: #f8fafc;">User Accounts Directory</h2>
                        <span class="badge badge-user" style="font-size: 0.68rem; padding: 0.2rem 0.5rem; letter-spacing: 0.04em;">TRADERS DIRECTORY</span>
                    </div>
                    <p class="text-secondary text-sm mt-1">Directory and management tools for all traders, credentials, and access control.</p>
                </div>
            </div>

            <!-- Quick User Metrics Grid with Hierarchy Icons -->
            <div class="grid-3 gap-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
                <div class="metric-card-redesign">
                    <div class="metric-card-icon-wrap metric-icon-blue">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <div class="text-muted text-xs text-uppercase font-mono mb-2" style="letter-spacing: 0.05em;">Total Traders</div>
                    <div class="stat-value font-mono text-primary" id="admin-stat-users-tab" style="font-size: 1.75rem; font-weight: 800;">${usersCount}</div>
                </div>
                <div class="metric-card-redesign">
                    <div class="metric-card-icon-wrap metric-icon-amber">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <div class="text-muted text-xs text-uppercase font-mono mb-2" style="letter-spacing: 0.05em;">Inactive / Soft-Deleted</div>
                    <div class="stat-value font-mono text-destructive" id="admin-stat-deleted-tab" style="font-size: 1.75rem; font-weight: 800;">${deletedCount}</div>
                </div>
                <div class="metric-card-redesign">
                    <div class="metric-card-icon-wrap metric-icon-green">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5 4 4"/><path d="M13 7 8.7 11.3a2 2 0 0 0-.58 1.23l-.18 3.53a1 1 0 0 0 1.05 1.05l3.53-.18a2 2 0 0 0 1.23-.58L18 12"/><path d="m18 10 2-2a2.83 2.83 0 1 0-4-4l-2 2"/></svg>
                    </div>
                    <div class="text-muted text-xs text-uppercase font-mono mb-2" style="letter-spacing: 0.05em;">Valid API Keys</div>
                    <div class="stat-value font-mono text-accent" id="admin-stat-keys-tab" style="font-size: 1.75rem; font-weight: 800;">${keysCount}</div>
                </div>
            </div>

            <!-- User Accounts Directory Card -->
            <div class="card glass p-6" style="border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1rem; background: linear-gradient(180deg, rgba(20, 27, 45, 0.5) 0%, rgba(11, 17, 32, 0.75) 100%); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);">
                <div class="flex-row justify-between align-center mb-5 flex-wrap gap-4">
                    <div class="flex-row align-center gap-3">
                        <h3 class="card-title flex-row align-center gap-2" style="margin-bottom: 0; font-size: 1.15rem; font-weight: 700; color: #f8fafc;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #60a5fa;"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            Registered Traders
                        </h3>
                        <span class="badge" id="admin-users-count-badge" style="background: rgba(255,255,255,0.06); font-size: 0.72rem; color: #94a3b8; font-weight: 500;">...</span>
                    </div>

                    <!-- Enhanced Search Bar & Filter Chips -->
                    <div class="flex-row align-center gap-3 flex-wrap">
                        <div class="admin-search-bar-wrap">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #64748b;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            <input type="text" id="admin-users-search" class="admin-search-input" placeholder="Search by name, handle, or email..." value="${this.adminUsers.q || ''}">
                            <span id="admin-users-clear-btn" class="search-clear-icon" title="Clear search" style="${this.adminUsers.q ? '' : 'display:none;'}">✕</span>
                        </div>
                        <div class="admin-filter-chips" id="admin-user-filter-chips">
                            <button type="button" class="filter-chip ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
                            <button type="button" class="filter-chip ${this.currentFilter === 'active' ? 'active' : ''}" data-filter="active">Active</button>
                            <button type="button" class="filter-chip ${this.currentFilter === 'admin' ? 'active' : ''}" data-filter="admin">Admin</button>
                            <button type="button" class="filter-chip ${this.currentFilter === 'has-key' ? 'active' : ''}" data-filter="has-key">Has API Key</button>
                            <button type="button" class="filter-chip ${this.currentFilter === 'has-uid' ? 'active' : ''}" data-filter="has-uid">Has UID</button>
                            <button type="button" class="filter-chip ${this.currentFilter === 'inactive' ? 'active' : ''}" data-filter="inactive">Inactive</button>
                        </div>
                    </div>
                </div>

                <div class="table-wrapper" style="border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0.75rem; background: rgba(11, 17, 32, 0.4); overflow: visible;">
                    <table class="admin-table-enhanced" style="margin-top: 0;">
                        <thead>
                            <tr>
                                <th class="sortable-th" data-sort="name">
                                    USER DETAILS <span class="sort-indicator" id="sort-icon-name">⇅</span>
                                </th>
                                <th class="sortable-th" data-sort="role">
                                    ROLE <span class="sort-indicator" id="sort-icon-role">⇅</span>
                                </th>
                                <th class="sortable-th" data-sort="status">
                                    STATUS <span class="sort-indicator" id="sort-icon-status">⇅</span>
                                </th>
                                <th style="width: 130px;">REGISTERED KEYS</th>
                                <th class="sortable-th" data-sort="uid" style="width: 140px;">
                                    UID <span class="sort-indicator" id="sort-icon-uid">⇅</span>
                                </th>
                                <th class="text-right" style="text-align: right; width: 80px;">LIFECYCLE ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody id="admin-users-tbody">
                            <tr>
                                <td colspan="6" class="text-center py-8 text-muted">Loading user database...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <!-- Users Pagination -->
                <div class="flex-row justify-between align-center mt-4 pt-2 border-top" style="border-top: 1px dashed rgba(255,255,255,0.08); font-size: 0.85rem; color: var(--text-secondary);">
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
                    <p class="text-secondary text-sm mt-1">Authorize referred accounts from Delta Exchange (8 digits) and Shark Exchange (6 digits) manually or via bulk CSV export.</p>
                </div>
            </div>

            <!-- Whitelist Ingestion & Addition Controls -->
            <div class="whitelist-controls-grid">
                <!-- Single User Add Card -->
                <div class="whitelist-action-card">
                    <div class="whitelist-action-header justify-between">
                        <div class="flex-row align-center gap-2">
                            <span class="whitelist-action-icon">➕</span>
                            <span class="whitelist-action-title">Manual Single Add</span>
                        </div>
                        <span id="admin-whitelist-detected-exchange" class="exchange-live-pill neutral">Auto-detecting...</span>
                    </div>
                    <p class="whitelist-action-desc">Enter 8 digits for <strong>Delta Exchange</strong> or 6 digits for <strong>Shark Exchange</strong>.</p>
                    <div class="flex-row gap-2">
                        <input type="text" id="admin-whitelist-add-input" class="form-control" placeholder="Enter User ID (8-digit Delta / 6-digit Shark)" style="height: 2.25rem; font-size: 0.85rem;">
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
                        <span class="text-muted" style="font-size: 0.72rem;">Delta & Shark CSV</span>
                    </div>
                    <p class="whitelist-action-desc">Upload a CSV (with <code>user_id</code> and optional <code>exchange</code> column) to bulk whitelist users automatically.</p>
                    
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
                        👤 Whitelisted Accounts (Delta & Shark)
                    </h3>
                    <div class="flex-row gap-2 flex-wrap" style="width: 100%; max-width: 520px; justify-content: flex-end;">
                        <select id="admin-whitelist-exchange-filter" class="form-control" style="height: 2.25rem; font-size: 0.85rem; width: auto; min-width: 140px; background: rgba(0,0,0,0.3);">
                            <option value="All" ${this.adminWhitelist.exchange === 'All' ? 'selected' : ''}>All Exchanges</option>
                            <option value="Delta" ${this.adminWhitelist.exchange === 'Delta' ? 'selected' : ''}>🔺 Delta (8-digit)</option>
                            <option value="Shark" ${this.adminWhitelist.exchange === 'Shark' ? 'selected' : ''}>🦈 Shark (6-digit)</option>
                        </select>
                        <input type="text" id="admin-whitelist-search" class="form-control" placeholder="Search by User ID..." value="${this.adminWhitelist.q || ''}" style="height: 2.25rem; font-size: 0.85rem; flex: 1; min-width: 150px;">
                        <button class="btn btn-secondary" id="admin-whitelist-search-btn" style="height: 2.25rem; padding: 0 1rem; font-size: 0.8rem;">Search</button>
                        <button class="btn btn-ghost" id="admin-whitelist-clear-btn" style="height: 2.25rem; padding: 0 0.5rem; font-size: 0.8rem;" title="Clear search">Clear</button>
                    </div>
                </div>

                <div class="table-wrapper" style="border: 1px solid var(--border-color); border-radius: 0.5rem; background: rgba(0,0,0,0.2);">
                    <table class="leaderboard-table" style="margin-top: 0;">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Exchange</th>
                                <th>Status</th>
                                <th>Added At</th>
                                <th class="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="admin-whitelist-tbody">
                            <tr>
                                <td colspan="5" class="text-center py-8 text-muted">Loading whitelist database...</td>
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
        const usersSearchInput = document.getElementById('admin-users-search');
        const usersClearBtn = document.getElementById('admin-users-clear-btn');
        const filterChips = document.getElementById('admin-user-filter-chips');
        const prevBtn = document.getElementById('admin-users-prev-btn');
        const nextBtn = document.getElementById('admin-users-next-btn');

        let searchDebounce = null;
        if (usersSearchInput) {
            usersSearchInput.addEventListener('input', (e) => {
                const val = e.target.value.trim();
                if (usersClearBtn) {
                    usersClearBtn.style.display = val ? 'inline-block' : 'none';
                }
                clearTimeout(searchDebounce);
                searchDebounce = setTimeout(() => {
                    this.adminUsers.q = val;
                    this.adminUsers.page = 1;
                    this.loadUsers();
                }, 300);
            });

            usersSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    clearTimeout(searchDebounce);
                    this.adminUsers.q = usersSearchInput.value.trim();
                    this.adminUsers.page = 1;
                    this.loadUsers();
                }
            });
        }

        if (usersClearBtn) {
            usersClearBtn.addEventListener('click', () => {
                if (usersSearchInput) usersSearchInput.value = '';
                usersClearBtn.style.display = 'none';
                this.adminUsers.q = '';
                this.adminUsers.page = 1;
                this.loadUsers();
            });
        }

        if (filterChips) {
            filterChips.addEventListener('click', (e) => {
                const chip = e.target.closest('.filter-chip');
                if (!chip) return;
                const filter = chip.dataset.filter;
                if (!filter || filter === this.currentFilter) return;

                filterChips.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.currentFilter = filter;
                this.renderFilteredUserRows();
            });
        }

        // Column Sorting for Role, Status, and User Details
        const tabContent = document.getElementById('admin-tab-content');
        if (tabContent) {
            tabContent.querySelectorAll('.sortable-th').forEach(th => {
                th.addEventListener('click', () => {
                    const sortKey = th.dataset.sort;
                    if (!sortKey) return;

                    if (this.currentSort.field === sortKey) {
                        this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
                    } else {
                        this.currentSort.field = sortKey;
                        this.currentSort.order = 'asc';
                    }

                    // Update header indicators
                    ['name', 'role', 'status', 'uid'].forEach(f => {
                        const icon = document.getElementById(`sort-icon-${f}`);
                        const header = th.parentElement.querySelector(`[data-sort="${f}"]`);
                        if (icon && header) {
                            if (f === this.currentSort.field) {
                                icon.textContent = this.currentSort.order === 'asc' ? '▲' : '▼';
                                header.className = `sortable-th sorted-${this.currentSort.order}`;
                            } else {
                                icon.textContent = '⇅';
                                header.className = 'sortable-th';
                            }
                        }
                    });

                    this.renderFilteredUserRows();
                });
            });
        }

        // Global dismiss for gear dropdowns
        if (this._onDocClickForGear) {
            document.removeEventListener('click', this._onDocClickForGear);
        }
        this._onDocClickForGear = (e) => {
            if (!e.target.closest('.action-gear-wrapper')) {
                document.querySelectorAll('.action-dropdown-menu.show').forEach(m => m.classList.remove('show'));
                document.querySelectorAll('.btn-gear-action.active').forEach(b => b.classList.remove('active'));
            }
        };
        document.addEventListener('click', this._onDocClickForGear);

        // Escape key dismiss
        if (this._onKeyForGear) {
            document.removeEventListener('keydown', this._onKeyForGear);
        }
        this._onKeyForGear = (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.action-dropdown-menu.show').forEach(m => m.classList.remove('show'));
                document.querySelectorAll('.btn-gear-action.active').forEach(b => b.classList.remove('active'));
                const modal = document.getElementById('user-details-modal');
                if (modal) modal.remove();
            }
        };
        document.addEventListener('keydown', this._onKeyForGear);

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.adminUsers.page > 1) {
                    this.adminUsers.page--;
                    this.loadUsers();
                }
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.adminUsers.total / this.adminUsers.limit) || 1;
                if (this.adminUsers.page < totalPages) {
                    this.adminUsers.page++;
                    this.loadUsers();
                }
            });
        }
    }

    bindWhitelistEvents() {
        // Whitelist search, filter, pagination & add
        const whitelistSearchInput = document.getElementById('admin-whitelist-search');
        const whitelistSearchBtn = document.getElementById('admin-whitelist-search-btn');
        const whitelistClearBtn = document.getElementById('admin-whitelist-clear-btn');
        const whitelistExchangeFilter = document.getElementById('admin-whitelist-exchange-filter');
        const whitelistPrevBtn = document.getElementById('admin-whitelist-prev-btn');
        const whitelistNextBtn = document.getElementById('admin-whitelist-next-btn');
        const whitelistAddInput = document.getElementById('admin-whitelist-add-input');
        const whitelistAddBtn = document.getElementById('admin-whitelist-add-btn');
        const whitelistDetectedExchange = document.getElementById('admin-whitelist-detected-exchange');

        if (whitelistExchangeFilter) {
            whitelistExchangeFilter.addEventListener('change', (e) => {
                this.adminWhitelist.exchange = e.target.value;
                this.adminWhitelist.page = 1;
                this.loadWhitelist();
            });
        }

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
                if (whitelistExchangeFilter) whitelistExchangeFilter.value = 'All';
                this.adminWhitelist.q = '';
                this.adminWhitelist.exchange = 'All';
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

        // Live Exchange Detection on Single Add input
        const updateLiveExchangeDetection = () => {
            if (!whitelistAddInput || !whitelistDetectedExchange) return;
            const val = whitelistAddInput.value.trim();
            if (!val) {
                whitelistDetectedExchange.className = 'exchange-live-pill neutral';
                whitelistDetectedExchange.textContent = 'Auto-detecting...';
            } else if (val.length === 6) {
                whitelistDetectedExchange.className = 'exchange-live-pill shark';
                whitelistDetectedExchange.innerHTML = '🦈 Shark Exchange (6-digit)';
            } else if (val.length === 8) {
                whitelistDetectedExchange.className = 'exchange-live-pill delta';
                whitelistDetectedExchange.innerHTML = '🔺 Delta Exchange (8-digit)';
            } else {
                whitelistDetectedExchange.className = 'exchange-live-pill neutral';
                whitelistDetectedExchange.innerHTML = `Auto (${val.length} digits)`;
            }
        };

        if (whitelistAddInput) {
            whitelistAddInput.addEventListener('input', updateLiveExchangeDetection);
        }

        if (whitelistAddBtn) {
            const handleAddSingle = async () => {
                const val = whitelistAddInput ? whitelistAddInput.value.trim() : '';
                if (!val) {
                    showToast('Please enter a User ID.', 'error');
                    return;
                }
                try {
                    whitelistAddBtn.disabled = true;
                    whitelistAddBtn.textContent = 'Adding...';
                    const res = await adminAPI.addWhitelist(val);
                    const exName = res.exchange || (val.length === 6 ? 'Shark' : 'Delta');
                    showToast(`Successfully whitelisted ${exName} User ID: ${val}`, 'success');
                    if (whitelistAddInput) {
                        whitelistAddInput.value = '';
                        updateLiveExchangeDetection();
                    }
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

        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-muted">Loading user database...</td></tr>';

        try {
            const data = await adminAPI.getUsers(this.adminUsers);
            this.adminUsers.total = data.total;
            this.loadedUsers = data.users || [];

            this.renderFilteredUserRows();

            const totalPages = Math.ceil(this.adminUsers.total / this.adminUsers.limit) || 1;
            const pageInfo = document.getElementById('admin-users-page-info');
            if (pageInfo) pageInfo.textContent = `Showing page ${this.adminUsers.page} of ${totalPages} (${this.adminUsers.total} total)`;
            const prevBtn = document.getElementById('admin-users-prev-btn');
            const nextBtn = document.getElementById('admin-users-next-btn');
            if (prevBtn) prevBtn.disabled = this.adminUsers.page <= 1;
            if (nextBtn) nextBtn.disabled = this.adminUsers.page >= totalPages;
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-destructive">Failed to load user database.</td></tr>';
        }
    }

    renderFilteredUserRows() {
        const tbody = document.getElementById('admin-users-tbody');
        if (!tbody) return;

        let list = [...(this.loadedUsers || [])];

        // Apply Filter Chip
        if (this.currentFilter === 'active') {
            list = list.filter(u => !u.is_deleted);
        } else if (this.currentFilter === 'admin') {
            list = list.filter(u => u.role === 'admin');
        } else if (this.currentFilter === 'has-key') {
            list = list.filter(u => u.api_keys && u.api_keys.length > 0);
        } else if (this.currentFilter === 'has-uid') {
            list = list.filter(u => Boolean(u.delta_user_id));
        } else if (this.currentFilter === 'inactive') {
            list = list.filter(u => u.is_deleted);
        }

        // Apply Column Sorting
        if (this.currentSort.field === 'role') {
            list.sort((a, b) => {
                const cmp = (a.role || '').localeCompare(b.role || '');
                return this.currentSort.order === 'asc' ? cmp : -cmp;
            });
        } else if (this.currentSort.field === 'status') {
            list.sort((a, b) => {
                const cmp = (a.is_deleted ? 1 : 0) - (b.is_deleted ? 1 : 0);
                return this.currentSort.order === 'asc' ? cmp : -cmp;
            });
        } else if (this.currentSort.field === 'name') {
            list.sort((a, b) => {
                const nameA = a.full_name || a.username || '';
                const nameB = b.full_name || b.username || '';
                const cmp = nameA.localeCompare(nameB);
                return this.currentSort.order === 'asc' ? cmp : -cmp;
            });
        } else if (this.currentSort.field === 'uid') {
            list.sort((a, b) => {
                const uidA = a.delta_user_id || '';
                const uidB = b.delta_user_id || '';
                if (!uidA && !uidB) return 0;
                if (!uidA) return 1;
                if (!uidB) return -1;
                const cmp = uidA.localeCompare(uidB, undefined, { numeric: true });
                return this.currentSort.order === 'asc' ? cmp : -cmp;
            });
        }

        // Update count badge
        const countBadge = document.getElementById('admin-users-count-badge');
        if (countBadge) {
            countBadge.textContent = `${list.length} trader${list.length === 1 ? '' : 's'}`;
        }

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-muted">No traders found matching filter criteria.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        list.forEach(u => {
            const row = document.createElement('tr');
            if (u.is_deleted) {
                row.className = 'soft-deleted-row';
            }

            // Initials & Avatar
            let initials = 'TR';
            if (u.full_name && u.full_name.trim()) {
                const parts = u.full_name.trim().split(/\s+/);
                initials = parts.length >= 2 
                    ? (parts[0][0] + parts[1][0]).toUpperCase() 
                    : parts[0].substring(0, 2).toUpperCase();
            } else if (u.username) {
                initials = u.username.substring(0, 2).toUpperCase();
            }

            // User details cell
            const userCellHtml = `
                <div class="user-cell-wrap">
                    <div class="user-avatar-sm" style="background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);">
                        ${initials}
                    </div>
                    <div>
                        <div class="user-full-name">
                            <span>${u.full_name || 'Trader'}</span>
                            ${u.username ? `<span class="user-username-tag">(@${u.username})</span>` : ''}
                        </div>
                        <div class="user-email-text">${u.email}</div>
                    </div>
                </div>
            `;

            // Role badge
            const isAdm = u.role === 'admin';
            const roleBadgeClass = isAdm ? 'badge-admin' : 'badge-user';
            const roleHtml = `<span class="badge ${roleBadgeClass}" style="font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em;">${u.role.toUpperCase()}</span>`;

            // Status badge with tooltip
            const registeredDateStr = u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown';
            let statusHtml = '';
            if (u.is_deleted) {
                statusHtml = `
                    <div class="tooltip-container">
                        <span class="badge badge-status-inactive">Inactive</span>
                        <span class="tooltip-content">Soft-deleted / Inactive trader</span>
                    </div>
                `;
            } else {
                statusHtml = `
                    <div class="tooltip-container">
                        <span class="badge badge-status-active">
                            <span class="status-pulse-dot"></span>
                            Active
                        </span>
                        <span class="tooltip-content">Registered: ${registeredDateStr} • Active</span>
                    </div>
                `;
            }

            // Keys pill - compact connection status
            let keysHtml = '';
            if (!u.api_keys || u.api_keys.length === 0) {
                keysHtml = '<span class="text-muted" style="font-size:0.75rem;">None</span>';
            } else {
                keysHtml = u.api_keys.map(k => {
                    const isValid = k.is_valid !== false;
                    const isTestnet = k.environment && k.environment.toLowerCase().includes('test');
                    const envTag = isTestnet ? 'test' : '';
                    return `
                        <span class="key-conn-pill ${isValid ? 'connected' : 'failed'}" title="${isValid ? 'Connected' : 'Connection Failed'} • ${k.environment || 'mainnet'} (${k.api_key})">
                            <span class="conn-dot"></span>
                            <span class="conn-text">${isValid ? 'Connected' : 'Failed'}</span>
                            ${envTag ? `<span class="conn-env-tag">${envTag}</span>` : ''}
                        </span>
                    `;
                }).join('');
            }

            // Claimed UID from whitelist
            let uidHtml = '';
            if (u.delta_user_id) {
                const isShark = u.exchange === 'Shark' || (u.delta_user_id && u.delta_user_id.length === 6);
                const exName = u.exchange || (isShark ? 'Shark' : 'Delta');
                const badgeClass = isShark ? 'badge-shark' : 'badge-delta';
                uidHtml = `
                    <div class="user-uid-cell" title="Claimed Whitelist UID: ${u.delta_user_id} (${exName})">
                        <span class="user-uid-value">${u.delta_user_id}</span>
                        <span class="badge ${badgeClass} user-uid-badge">${exName}</span>
                    </div>
                `;
            } else {
                uidHtml = '<span class="text-muted" style="font-size:0.75rem;">—</span>';
            }

            // Action gear & popover menu
            let actionHtml = '';
            if (u.id === this.currentUser?.id) {
                actionHtml = `<span class="badge" style="background: rgba(255,255,255,0.06); color: var(--text-secondary); font-size: 0.72rem;">Current Admin</span>`;
            } else {
                actionHtml = `
                    <div class="action-gear-wrapper">
                        <button type="button" class="btn-gear-action" data-user-id="${u.id}" title="Actions for ${u.full_name || u.email}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                        <div class="action-dropdown-menu" id="gear-menu-${u.id}">
                            <button type="button" class="dropdown-item view-details-action" data-user-id="${u.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                View Details
                            </button>
                            <div class="dropdown-divider"></div>
                            ${u.is_deleted ? `
                                <button type="button" class="dropdown-item restore-user-action" data-user-id="${u.id}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                    Restore Account
                                </button>
                            ` : `
                                <button type="button" class="dropdown-item item-soft-delete soft-delete-action" data-user-id="${u.id}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                    Soft Delete
                                </button>
                            `}
                            <button type="button" class="dropdown-item item-hard-delete hard-delete-action" data-user-id="${u.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                Hard Delete
                            </button>
                            ${!isAdm ? `
                                <div class="dropdown-divider"></div>
                                <button type="button" class="dropdown-item item-admin promote-user-action" data-user-id="${u.id}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                    Make Admin
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }

            row.innerHTML = `
                <td>${userCellHtml}</td>
                <td>${roleHtml}</td>
                <td>${statusHtml}</td>
                <td>${keysHtml}</td>
                <td>${uidHtml}</td>
                <td class="text-right" style="text-align: right;">${actionHtml}</td>
            `;

            // Wire up gear button toggle
            const gearBtn = row.querySelector('.btn-gear-action');
            const gearMenu = row.querySelector('.action-dropdown-menu');
            if (gearBtn && gearMenu) {
                gearBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isShown = gearMenu.classList.contains('show');
                    document.querySelectorAll('.action-dropdown-menu.show').forEach(m => m.classList.remove('show'));
                    document.querySelectorAll('.btn-gear-action.active').forEach(b => b.classList.remove('active'));

                    if (!isShown) {
                        gearMenu.classList.add('show');
                        gearBtn.classList.add('active');
                    }
                });
            }

            // Wire up action items
            const viewBtn = row.querySelector('.view-details-action');
            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (gearMenu) gearMenu.classList.remove('show');
                    if (gearBtn) gearBtn.classList.remove('active');
                    this.showUserDetailsModal(u);
                });
            }

            const restoreBtn = row.querySelector('.restore-user-action');
            if (restoreBtn) {
                restoreBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (gearMenu) gearMenu.classList.remove('show');
                    this.restoreUser(u.id);
                });
            }

            const softDelBtn = row.querySelector('.soft-delete-action');
            if (softDelBtn) {
                softDelBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (gearMenu) gearMenu.classList.remove('show');
                    this.softDeleteUser(u.id);
                });
            }

            const hardDelBtn = row.querySelector('.hard-delete-action');
            if (hardDelBtn) {
                hardDelBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (gearMenu) gearMenu.classList.remove('show');
                    this.hardDeleteUser(u.id);
                });
            }

            const promoteBtn = row.querySelector('.promote-user-action');
            if (promoteBtn) {
                promoteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (gearMenu) gearMenu.classList.remove('show');
                    this.promoteUser(u.id);
                });
            }

            tbody.appendChild(row);
        });
    }

    showUserDetailsModal(u) {
        const existing = document.getElementById('user-details-modal');
        if (existing) existing.remove();

        let initials = 'TR';
        if (u.full_name && u.full_name.trim()) {
            const parts = u.full_name.trim().split(/\s+/);
            initials = parts.length >= 2 
                ? (parts[0][0] + parts[1][0]).toUpperCase() 
                : parts[0].substring(0, 2).toUpperCase();
        } else if (u.username) {
            initials = u.username.substring(0, 2).toUpperCase();
        }

        const isAdm = u.role === 'admin';
        const roleBadgeClass = isAdm ? 'badge-admin' : 'badge-user';
        const registeredDate = u.created_at ? new Date(u.created_at).toLocaleString() : 'N/A';

        let keysContent = '<span class="text-muted" style="font-size: 0.8rem;">No API keys configured</span>';
        if (u.api_keys && u.api_keys.length > 0) {
            keysContent = u.api_keys.map(k => `
                <div class="key-badge-item ${k.is_valid !== false ? 'valid' : 'invalid'}" style="margin-bottom: 0.4rem; padding: 0.35rem 0.6rem; font-size: 0.78rem;">
                    <span>${k.is_valid !== false ? '✅' : '❌'}</span>
                    <span style="font-weight: 600;">${k.api_key}</span>
                    <span class="key-env-tag">${k.environment || 'mainnet'}</span>
                </div>
            `).join('');
        }

        const modalDiv = document.createElement('div');
        modalDiv.id = 'user-details-modal';
        modalDiv.style.position = 'fixed';
        modalDiv.style.inset = '0';
        modalDiv.style.background = 'rgba(0, 0, 0, 0.75)';
        modalDiv.style.backdropFilter = 'blur(6px)';
        modalDiv.style.zIndex = '1200';
        modalDiv.style.display = 'flex';
        modalDiv.style.alignItems = 'center';
        modalDiv.style.justifyContent = 'center';
        modalDiv.style.padding = '1rem';

        modalDiv.innerHTML = `
            <div class="card glass p-6" style="width: 100%; max-width: 480px; background: #0b1120; border: 1px solid rgba(255,255,255,0.12); border-radius: 1rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85); animation: actionMenuFadeIn 0.2s ease;">
                <div class="flex-row justify-between align-center mb-4">
                    <h3 style="font-size: 1.15rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin: 0; color: #f8fafc;">
                        <span>👤</span> Trader Profile Details
                    </h3>
                    <button type="button" class="btn btn-ghost" id="modal-close-x-btn" style="padding: 0.2rem 0.5rem; font-size: 1.1rem; line-height: 1;">✕</button>
                </div>

                <div class="flex-row align-center gap-3 p-3 mb-4" style="background: rgba(255,255,255,0.03); border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.06);">
                    <div class="avatar-circle" style="width: 3rem; height: 3rem; font-size: 1.1rem; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);">
                        ${initials}
                    </div>
                    <div>
                        <div style="font-weight: 700; font-size: 1.05rem; color: #f8fafc;">${u.full_name || 'Trader'}</div>
                        <div class="text-muted" style="font-size: 0.8rem;">${u.email}</div>
                        ${u.username ? `<div class="font-mono text-primary" style="font-size: 0.75rem;">@${u.username}</div>` : ''}
                    </div>
                </div>

                <div class="flex-column gap-3 mb-5" style="font-size: 0.825rem;">
                    <div class="flex-row justify-between" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.4rem;">
                        <span class="text-muted">User ID</span>
                        <span class="font-mono" style="font-weight: 600;">#${u.id}</span>
                    </div>
                    <div class="flex-row justify-between" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.4rem;">
                        <span class="text-muted">Exchange UID</span>
                        <span class="font-mono text-primary" style="font-weight: 600;">
                            ${u.delta_user_id ? `${u.delta_user_id} <span class="badge ${u.exchange === 'Shark' || (u.delta_user_id && u.delta_user_id.length === 6) ? 'badge-shark' : 'badge-delta'}" style="font-size: 0.62rem; padding: 0.05rem 0.35rem; margin-left: 0.3rem;">${u.exchange || (u.delta_user_id.length === 6 ? 'Shark' : 'Delta')}</span>` : '<span class="text-muted font-normal">Not claimed</span>'}
                        </span>
                    </div>
                    <div class="flex-row justify-between" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.4rem;">
                        <span class="text-muted">Role</span>
                        <span class="badge ${roleBadgeClass}">${u.role.toUpperCase()}</span>
                    </div>
                    <div class="flex-row justify-between" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.4rem;">
                        <span class="text-muted">Status</span>
                        <span class="badge ${u.is_deleted ? 'badge-status-inactive' : 'badge-status-active'}">${u.is_deleted ? 'Inactive / Soft Deleted' : 'Active'}</span>
                    </div>
                    <div class="flex-row justify-between" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.4rem;">
                        <span class="text-muted">Registration Date</span>
                        <span style="font-size: 0.78rem;">${registeredDate}</span>
                    </div>
                    <div class="flex-column gap-1 pt-1">
                        <span class="text-muted" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Registered API Keys</span>
                        <div class="flex-column gap-1 mt-1">
                            ${keysContent}
                        </div>
                    </div>
                </div>

                <div class="flex-row justify-end gap-2">
                    <button type="button" class="btn btn-secondary" id="modal-close-btn" style="height: 2.25rem; padding: 0 1.25rem; font-size: 0.85rem;">Close</button>
                </div>
            </div>
        `;

        modalDiv.addEventListener('click', (e) => {
            if (e.target === modalDiv) modalDiv.remove();
        });

        document.body.appendChild(modalDiv);

        const closeX = modalDiv.querySelector('#modal-close-x-btn');
        if (closeX) closeX.addEventListener('click', () => modalDiv.remove());

        const closeBtn = modalDiv.querySelector('#modal-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', () => modalDiv.remove());
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

        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-muted">Loading whitelist database...</td></tr>';

        try {
            const data = await adminAPI.getWhitelist(this.adminWhitelist);
            this.adminWhitelist.total = data.total;
            const users = data.referred_users;

            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-muted">No whitelisted user IDs found.</td></tr>';
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

                // User ID cell
                const idCell = document.createElement('td');
                const strong = document.createElement('strong');
                strong.textContent = u.delta_user_id;
                idCell.appendChild(strong);

                // Exchange cell
                const exName = u.exchange || ((u.delta_user_id && u.delta_user_id.length === 6) ? 'Shark' : 'Delta');
                const isShark = exName.toLowerCase() === 'shark';
                const exBadgeClass = isShark ? 'badge-shark' : 'badge-delta';
                const exIcon = isShark ? '🦈' : '🔺';

                const exchangeCell = document.createElement('td');
                exchangeCell.innerHTML = `<span class="badge ${exBadgeClass}">${exIcon} ${exName}</span>`;

                // Status cell
                const statusCell = document.createElement('td');
                statusCell.innerHTML = `<span class="badge ${statusBadgeClass}">${statusText}</span>`;

                // Added date cell
                const dateCell = document.createElement('td');
                dateCell.textContent = new Date(u.added_at).toLocaleString();

                // Actions cell
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
                row.appendChild(exchangeCell);
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
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-destructive">Failed to load whitelisted users.</td></tr>';
        }
    }

    async deleteWhitelistUser(deltaUserId) {
        if (!confirm(`Are you sure you want to remove User ID ${deltaUserId} from the whitelist?`)) return;

        try {
            await adminAPI.deleteWhitelist(deltaUserId);
            showToast(`Successfully removed User ID ${deltaUserId} from whitelist.`, 'success');
            await this.loadWhitelist();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    unmount() {
        if (this._onDocClickForGear) {
            document.removeEventListener('click', this._onDocClickForGear);
        }
        if (this._onKeyForGear) {
            document.removeEventListener('keydown', this._onKeyForGear);
        }
        const modal = document.getElementById('user-details-modal');
        if (modal) modal.remove();

        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
