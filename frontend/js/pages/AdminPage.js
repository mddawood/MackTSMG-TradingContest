// Admin Page Component
import { adminAPI, competitionsAPI } from '../api.js';
import { showToast } from '../components/Toast.js';
import { openCreateCompModal } from '../components/CreateCompModal.js';

export class AdminPage {
    constructor() {
        this.container = null;
        this.currentUser = null;

        this.adminUsers = { q: '', page: 1, limit: 10, total: 0 };
        this.adminComps = { q: '', page: 1, limit: 10, total: 0 };
        this.adminWhitelist = { q: '', page: 1, limit: 10, total: 0 };
    }

    render() {
        return `
        <div id="admin-view" class="view-section py-12">
            <div class="container">
                <!-- Admin Header -->
                <div class="admin-header glass p-8 mb-8 flex-row justify-between align-center flex-wrap gap-4">
                    <div>
                        <div class="flex-row align-center gap-3">
                            <h1 class="welcome-title">Admin Command Center</h1>
                            <span class="badge" style="background: rgba(37, 99, 235, 0.2); color: #60a5fa; border: 1px solid rgba(37, 99, 235, 0.4);">RESTRICTED</span>
                        </div>
                        <p class="text-muted mt-1">Manage competitions, user lifecycles, and view live exchange sync operations.</p>
                    </div>
                    <div class="flex-row gap-3">
                        <button class="btn btn-primary flex-row align-center gap-2" id="admin-launch-comp-btn" style="background: linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
                            Launch New Competition
                        </button>
                    </div>
                </div>

                <!-- Admin Quick Stats -->
                <div class="grid-4 gap-6 mb-8">
                    <div class="stat-card glass text-center">
                        <div class="stat-value" id="admin-stat-users">-</div>
                        <div class="stat-label">Total Registered Traders</div>
                    </div>
                    <div class="stat-card glass text-center">
                        <div class="stat-value text-destructive" id="admin-stat-deleted">-</div>
                        <div class="stat-label">Inactive / Soft-Deleted</div>
                    </div>
                    <div class="stat-card glass text-center">
                        <div class="stat-value" id="admin-stat-keys">-</div>
                        <div class="stat-label">Valid API Keys</div>
                    </div>
                    <div class="stat-card glass text-center">
                        <div class="stat-value" id="admin-stat-comps">-</div>
                        <div class="stat-label">Active Competitions</div>
                    </div>
                </div>

                <!-- Admin Tabs / Tables Area -->
                <div class="flex-column gap-8">
                    <!-- Competitions Management Section -->
                    <div class="card glass p-6">
                        <div class="flex-row justify-between align-center mb-4 flex-wrap gap-4">
                            <h2 class="card-title flex-row align-center gap-2" style="margin-bottom: 0;">
                                🏆
                                Competitions Management
                            </h2>
                            <div class="flex-row gap-2" style="width: 100%; max-width: 400px;">
                                <input type="text" id="admin-comps-search" class="form-control" placeholder="Search competitions..." style="height: 2.25rem; font-size: 0.85rem;">
                                <button class="btn btn-secondary" id="admin-comps-search-btn" style="height: 2.25rem; padding: 0 1rem; font-size: 0.8rem;">Search</button>
                                <button class="btn btn-ghost" id="admin-comps-clear-btn" style="height: 2.25rem; padding: 0 0.5rem; font-size: 0.8rem;" title="Clear search">Clear</button>
                            </div>
                        </div>

                        <div class="table-wrapper overflow-hidden" style="border: 1px solid var(--border-color); border-radius: 0.5rem; background: rgba(0,0,0,0.2);">
                            <table class="leaderboard-table" style="margin-top: 0;">
                                <thead>
                                    <tr>
                                        <th>Competition</th>
                                        <th>Start Time (UTC)</th>
                                        <th>End Time (UTC)</th>
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
                            <span id="admin-comps-page-info">Showing page 1 of 1</span>
                            <div class="flex-row gap-2">
                                <button class="btn btn-secondary" id="admin-comps-prev-btn" style="height: 2rem; padding: 0 0.75rem; font-size: 0.75rem;">Previous</button>
                                <button class="btn btn-secondary" id="admin-comps-next-btn" style="height: 2rem; padding: 0 0.75rem; font-size: 0.75rem;">Next</button>
                            </div>
                        </div>
                    </div>

                    <!-- User Accounts Directory -->
                    <div class="card glass p-6">
                        <div class="flex-row justify-between align-center mb-4 flex-wrap gap-4">
                            <h2 class="card-title flex-row align-center gap-2" style="margin-bottom: 0;">
                                👥
                                User Accounts Directory
                            </h2>
                            <div class="flex-row gap-2" style="width: 100%; max-width: 400px;">
                                <input type="text" id="admin-users-search" class="form-control" placeholder="Search by name or email..." style="height: 2.25rem; font-size: 0.85rem;">
                                <button class="btn btn-secondary" id="admin-users-search-btn" style="height: 2.25rem; padding: 0 1rem; font-size: 0.8rem;">Search</button>
                                <button class="btn btn-ghost" id="admin-users-clear-btn" style="height: 2.25rem; padding: 0 0.5rem; font-size: 0.8rem;" title="Clear search">Clear</button>
                            </div>
                        </div>

                        <div class="table-wrapper overflow-hidden" style="border: 1px solid var(--border-color); border-radius: 0.5rem; background: rgba(0,0,0,0.2);">
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
                            <span id="admin-users-page-info">Showing page 1 of 1</span>
                            <div class="flex-row gap-2">
                                <button class="btn btn-secondary" id="admin-users-prev-btn" style="height: 2rem; padding: 0 0.75rem; font-size: 0.75rem;">Previous</button>
                                <button class="btn btn-secondary" id="admin-users-next-btn" style="height: 2rem; padding: 0 0.75rem; font-size: 0.75rem;">Next</button>
                            </div>
                        </div>
                    </div>

                    <!-- Referred Users Whitelist -->
                    <div class="card glass p-6">
                        <div class="flex-row justify-between align-center mb-4 flex-wrap gap-4">
                            <h2 class="card-title flex-row align-center gap-2" style="margin-bottom: 0;">
                                👤
                                Referred Users Whitelist
                            </h2>
                            <div class="flex-row gap-2" style="width: 100%; max-width: 400px;">
                                <input type="text" id="admin-whitelist-search" class="form-control" placeholder="Search by Delta User ID..." style="height: 2.25rem; font-size: 0.85rem;">
                                <button class="btn btn-secondary" id="admin-whitelist-search-btn" style="height: 2.25rem; padding: 0 1rem; font-size: 0.8rem;">Search</button>
                                <button class="btn btn-ghost" id="admin-whitelist-clear-btn" style="height: 2.25rem; padding: 0 0.5rem; font-size: 0.8rem;" title="Clear search">Clear</button>
                            </div>
                        </div>

                        <!-- Add to Whitelist Form -->
                        <div class="flex-row gap-2 mb-6 p-4 rounded-lg" style="background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); max-width: 500px;">
                            <input type="text" id="admin-whitelist-add-input" class="form-control" placeholder="Enter Delta User ID to Whitelist" style="height: 2.25rem; font-size: 0.85rem;">
                            <button class="btn btn-primary" id="admin-whitelist-add-btn" style="height: 2.25rem; padding: 0 1.25rem; font-size: 0.8rem; white-space: nowrap;">+ Add User</button>
                        </div>

                        <div class="table-wrapper overflow-hidden" style="border: 1px solid var(--border-color); border-radius: 0.5rem; background: rgba(0,0,0,0.2);">
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
                            <span id="admin-whitelist-page-info">Showing page 1 of 1</span>
                            <div class="flex-row gap-2">
                                <button class="btn btn-secondary" id="admin-whitelist-prev-btn" style="height: 2rem; padding: 0 0.75rem; font-size: 0.75rem;">Previous</button>
                                <button class="btn btn-secondary" id="admin-whitelist-next-btn" style="height: 2rem; padding: 0 0.75rem; font-size: 0.75rem;">Next</button>
                            </div>
                        </div>
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
                this.adminComps.q = compsSearchInput.value.trim();
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
                compsSearchInput.value = '';
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

        // Users search & pagination
        const usersSearchInput = document.getElementById('admin-users-search');
        const usersSearchBtn = document.getElementById('admin-users-search-btn');
        const usersClearBtn = document.getElementById('admin-users-clear-btn');
        const usersPrevBtn = document.getElementById('admin-users-prev-btn');
        const usersNextBtn = document.getElementById('admin-users-next-btn');

        if (usersSearchBtn) {
            usersSearchBtn.addEventListener('click', () => {
                this.adminUsers.q = usersSearchInput.value.trim();
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
                usersSearchInput.value = '';
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
                this.adminWhitelist.q = whitelistSearchInput.value.trim();
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
                whitelistSearchInput.value = '';
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
            whitelistAddBtn.addEventListener('click', async () => {
                const val = whitelistAddInput.value.trim();
                if (!val) {
                    showToast('Please enter a Delta User ID.', 'error');
                    return;
                }
                try {
                    whitelistAddBtn.disabled = true;
                    whitelistAddBtn.textContent = 'Adding...';
                    await adminAPI.addWhitelist(val);
                    showToast(`Successfully whitelisted Delta User ID: ${val}`, 'success');
                    whitelistAddInput.value = '';
                    this.adminWhitelist.page = 1;
                    await this.loadWhitelist();
                } catch (err) {
                    showToast(err.message, 'error');
                } finally {
                    whitelistAddBtn.disabled = false;
                    whitelistAddBtn.textContent = '+ Add User';
                }
            });
        }
    }

    async loadAll() {
        await Promise.all([
            this.loadStats(),
            this.loadCompetitions(),
            this.loadUsers(),
            this.loadWhitelist()
        ]);
    }

    async loadStats() {
        try {
            const stats = await adminAPI.getStats();
            document.getElementById('admin-stat-users').textContent = stats.total_users;
            document.getElementById('admin-stat-deleted').textContent = stats.deleted_users;
            document.getElementById('admin-stat-keys').textContent = `${stats.valid_api_keys} / ${stats.total_api_keys}`;
            document.getElementById('admin-stat-comps').textContent = stats.total_competitions;
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
                document.getElementById('admin-comps-page-info').textContent = 'Showing page 1 of 1';
                document.getElementById('admin-comps-prev-btn').disabled = true;
                document.getElementById('admin-comps-next-btn').disabled = true;
                return;
            }

            tbody.innerHTML = '';
            comps.forEach(c => {
                const row = document.createElement('tr');
                const statusBadgeClass = c.is_active ? 'badge-active' : 'badge-deleted';
                const statusText = c.is_active ? 'Active' : 'Inactive';
                const statusHtml = `<span class="badge ${statusBadgeClass}">${statusText}</span>`;

                const formattedStart = new Date(c.start_time).toLocaleString();
                const formattedEnd = new Date(c.end_time).toLocaleString();

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
            document.getElementById('admin-comps-page-info').textContent = `Showing page ${this.adminComps.page} of ${totalPages}`;
            document.getElementById('admin-comps-prev-btn').disabled = this.adminComps.page <= 1;
            document.getElementById('admin-comps-next-btn').disabled = this.adminComps.page >= totalPages;
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
                document.getElementById('admin-users-page-info').textContent = 'Showing page 1 of 1';
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
            document.getElementById('admin-users-page-info').textContent = `Showing page ${this.adminUsers.page} of ${totalPages}`;
            document.getElementById('admin-users-prev-btn').disabled = this.adminUsers.page <= 1;
            document.getElementById('admin-users-next-btn').disabled = this.adminUsers.page >= totalPages;
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
                document.getElementById('admin-whitelist-page-info').textContent = 'Showing page 1 of 1';
                document.getElementById('admin-whitelist-prev-btn').disabled = true;
                document.getElementById('admin-whitelist-next-btn').disabled = true;
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
            document.getElementById('admin-whitelist-page-info').textContent = `Showing page ${this.adminWhitelist.page} of ${totalPages} (Total: ${this.adminWhitelist.total})`;
            document.getElementById('admin-whitelist-prev-btn').disabled = this.adminWhitelist.page <= 1;
            document.getElementById('admin-whitelist-next-btn').disabled = this.adminWhitelist.page >= totalPages;
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
