// Dashboard Page Component
import { apiKeysAPI, competitionsAPI } from '../api.js';
import { showToast } from '../components/Toast.js';

export class DashboardPage {
    constructor() {
        this.container = null;
        this.user = null;
        this.apiKeys = [];
        this.competitions = [];
    }

    render() {
        const userName = this.user?.full_name || 'Trader';
        const userEmail = this.user?.email || 'user@example.com';
        const deltaId = this.user?.delta_user_id || 'N/A';

        return `
        <div id="dashboard-view" class="view-section py-12">
            <div class="container">
                <!-- Dashboard Welcome Banner -->
                <div class="dashboard-banner glass p-8 mb-8 flex-row justify-between align-center flex-wrap gap-4">
                    <div>
                        <h1 class="welcome-title">Welcome back, <span id="dash-user-name">${userName}</span>!</h1>
                        <p class="text-muted mt-1" id="dash-user-email">${userEmail} <span style="margin-left: 0.5rem; opacity: 0.7;">· Delta UID: <strong>${deltaId}</strong></span></p>
                    </div>
                    <div class="flex-row gap-2">
                        <button class="btn btn-primary" id="refresh-dash-btn">
                            <svg class="icon-spin-hover" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                            Refresh Dashboard
                        </button>
                    </div>
                </div>

                <!-- Dashboard Grid -->
                <div class="grid-3 gap-8">
                    <!-- Left: API Keys Manager -->
                    <div class="dashboard-col span-1 flex-column gap-6">
                        <div class="card glass p-6">
                            <h2 class="card-title flex-row align-center gap-2 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                Delta Exchange API Keys
                            </h2>
                            <form id="api-key-form" class="flex-column gap-4">
                                <div class="form-group">
                                    <label for="api-key-input">API Key</label>
                                    <input type="text" id="api-key-input" class="form-control" placeholder="Enter Delta API Key" required>
                                </div>
                                <div class="form-group">
                                    <label for="api-secret-input">API Secret</label>
                                    <input type="password" id="api-secret-input" class="form-control" placeholder="Enter Delta API Secret" required>
                                </div>
                                <div class="form-group">
                                    <label for="api-env-input">Environment</label>
                                    <select id="api-env-input" class="form-control" required>
                                        <option value="testnet_india">India Testnet</option>
                                        <option value="mainnet_india">India Mainnet</option>
                                        <option value="testnet">Global Testnet</option>
                                        <option value="mainnet">Global Mainnet</option>
                                    </select>
                                </div>
                                <button type="submit" class="btn btn-primary w-full" id="api-key-submit-btn">Save & Verify Key</button>
                            </form>

                            <!-- Saved Keys List -->
                            <div class="border-top mt-6 pt-4">
                                <h3 class="list-title mb-3">Registered Keys</h3>
                                <div id="keys-list" class="flex-column gap-3">
                                    <div class="text-center py-4 text-muted text-sm">Loading keys...</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right/Center: Competition & Leaderboard -->
                    <div class="dashboard-col span-2 flex-column gap-6">
                        <!-- Active Contests Card -->
                        <div class="card glass p-6">
                            <h2 class="card-title flex-row align-center gap-2 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                                Available Championships
                            </h2>
                            <div id="dashboard-competitions-list" class="flex-column gap-4">
                                <div class="text-center py-8 text-muted">Loading competitions...</div>
                            </div>
                        </div>

                        <!-- My Registrations Standings Card -->
                        <div class="card glass p-6">
                            <h2 class="card-title flex-row align-center gap-2 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                                My Verified Standings
                            </h2>
                            <div id="my-registrations-list" class="flex-column gap-4">
                                <div class="text-center py-8 text-muted">Register for a championship above to track your stats.</div>
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
        this.user = user;
        this.container.innerHTML = this.render();

        // Bind events
        const refreshBtn = document.getElementById('refresh-dash-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadData());
        }

        const apiKeyForm = document.getElementById('api-key-form');
        if (apiKeyForm) {
            apiKeyForm.addEventListener('submit', (e) => this.handleAddAPIKey(e));
        }

        await this.loadData();
    }

    async loadData() {
        await Promise.all([
            this.loadAPIKeys(),
            this.loadDashboardCompetitions()
        ]);
    }

    async loadAPIKeys() {
        const listContainer = document.getElementById('keys-list');
        if (!listContainer) return;

        try {
            const keys = await apiKeysAPI.getAll();
            this.apiKeys = keys;
            this.renderAPIKeys();
        } catch (err) {
            showToast('Failed to load API keys.', 'error');
        }
    }

    renderAPIKeys() {
        const listContainer = document.getElementById('keys-list');
        if (!listContainer) return;

        if (this.apiKeys.length === 0) {
            listContainer.innerHTML = '<div class="text-center py-4 text-muted text-sm">No API keys registered yet.</div>';
            return;
        }

        listContainer.innerHTML = '';
        this.apiKeys.forEach(key => {
            const keyItem = document.createElement('div');
            keyItem.className = 'key-item flex-column gap-2';

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
                    <button class="btn btn-ghost text-destructive delete-key-btn" data-key-id="${key.id}" style="padding: 0 0.5rem; height: 1.75rem;">Delete</button>
                </div>
            `;

            keyItem.querySelector('.delete-key-btn').addEventListener('click', () => this.deleteAPIKey(key.id));
            listContainer.appendChild(keyItem);
        });
    }

    async handleAddAPIKey(e) {
        e.preventDefault();
        const apiKey = document.getElementById('api-key-input').value.trim();
        const apiSecret = document.getElementById('api-secret-input').value.trim();
        const environment = document.getElementById('api-env-input').value;
        const submitBtn = document.getElementById('api-key-submit-btn');

        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Verifying with Delta...';
        submitBtn.disabled = true;

        try {
            await apiKeysAPI.create({ api_key: apiKey, api_secret: apiSecret, environment });
            showToast('API Key registered and verified successfully!', 'success');
            document.getElementById('api-key-form').reset();
            await this.loadAPIKeys();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async deleteAPIKey(keyId) {
        if (!confirm('Are you sure you want to delete this API Key? Any active registrations using this key will stop updating.')) {
            return;
        }

        try {
            await apiKeysAPI.delete(keyId);
            showToast('API Key deleted.', 'success');
            await this.loadAPIKeys();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    async loadDashboardCompetitions() {
        try {
            const comps = await competitionsAPI.getAll();
            this.competitions = comps;

            const myRegs = await competitionsAPI.getMyRegistrations();
            this.renderMyStandings(myRegs);

            const registeredCompIds = myRegs.map(r => r.competition_id);
            this.renderAvailableCompetitions(registeredCompIds);
        } catch (err) {
            showToast('Failed to load competition data: ' + err.message, 'error');
        }
    }

    renderMyStandings(myRegs) {
        const container = document.getElementById('my-registrations-list');
        if (!container) return;

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
                    <button class="btn btn-secondary sync-btn" data-comp-id="${reg.competition_id}" style="height: 2rem; font-size: 0.75rem; padding: 0 0.75rem;">
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

            item.querySelector('.sync-btn').addEventListener('click', () => this.syncRegistration(reg.competition_id));
            container.appendChild(item);
        });
    }

    renderAvailableCompetitions(registeredCompIds) {
        const container = document.getElementById('dashboard-competitions-list');
        if (!container) return;

        const activeComps = this.competitions.filter(c => c.is_active);
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
                <button class="btn btn-primary register-btn" data-comp-id="${comp.id}">
                    Register Now
                </button>
            `;

            item.querySelector('.register-btn').addEventListener('click', () => this.registerForComp(comp.id));
            container.appendChild(item);
        });
    }

    async registerForComp(compId) {
        try {
            await competitionsAPI.register(compId);
            showToast('Registered for the competition successfully!', 'success');
            await this.loadDashboardCompetitions();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    async syncRegistration(compId) {
        try {
            await competitionsAPI.sync(compId);
            showToast('Leaderboard sync request queued in the background!', 'success');
            setTimeout(async () => {
                await this.loadDashboardCompetitions();
            }, 1500);
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
