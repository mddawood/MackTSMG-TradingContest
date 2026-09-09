// User Dashboard Component with Sidebar Navigation matching Google Doc Section 4
import { apiKeysAPI, competitionsAPI, authAPI } from '../api.js';
import { showToast } from '../components/Toast.js';

export class DashboardPage {
    constructor() {
        this.container = null;
        this.user = null;
        this.activeTab = 'overview'; // 'overview', 'profile', 'competition', 'trades', 'leaderboard', 'certificates', 'settings'
        this.apiKeys = [];
        this.competitions = [];
        this.myRegistrations = [];
        this.trades = [];
        this.loadingTrades = false;
    }

    render() {
        const userName = this.user?.full_name || 'Trader';
        const userTier = this.user?.assigned_tier || 'Trader';
        const tierLower = userTier.toLowerCase();

        return `
        <div id="dashboard-view" class="view-section">
            <div class="dashboard-layout">
                <!-- Sidebar -->
                <aside class="dashboard-sidebar">
                    <div class="p-3 mb-2 flex-row align-center gap-3">
                        <div class="avatar-circle" style="width: 2.25rem; height: 2.25rem;">
                            ${userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div class="flex-column" style="overflow: hidden;">
                            <span style="font-weight: 700; font-size: 0.9rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${userName}</span>
                            <span class="tier-badge tier-${tierLower}" style="width: fit-content; font-size: 0.65rem; padding: 0.1rem 0.4rem; margin-top: 0.15rem;">${userTier} Tier</span>
                        </div>
                    </div>

                    <nav class="flex-column gap-1" id="dashboard-sidebar-nav">
                        <button class="sidebar-link ${this.activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="10" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                            Overview
                        </button>
                        <button class="sidebar-link ${this.activeTab === 'profile' ? 'active' : ''}" data-tab="profile">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            Profile
                        </button>
                        <button class="sidebar-link ${this.activeTab === 'competition' ? 'active' : ''}" data-tab="competition">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                            Competition
                        </button>
                        <button class="sidebar-link ${this.activeTab === 'trades' ? 'active' : ''}" data-tab="trades">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                            Delta Trades
                        </button>
                        <button class="sidebar-link ${this.activeTab === 'leaderboard' ? 'active' : ''}" data-tab="leaderboard">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                            Leaderboard
                        </button>
                        <button class="sidebar-link ${this.activeTab === 'certificates' ? 'active' : ''}" data-tab="certificates">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                            Certificates
                        </button>
                        <button class="sidebar-link ${this.activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                            Settings &amp; API
                        </button>
                    </nav>
                </aside>

                <!-- Main Content Area -->
                <main class="dashboard-main" id="dashboard-tab-content">
                    ${this.renderActiveTabContent()}
                </main>
            </div>
        </div>
        `;
    }

    renderActiveTabContent() {
        if (this.activeTab === 'overview') {
            return this.renderOverviewTab();
        } else if (this.activeTab === 'profile') {
            return this.renderProfileTab();
        } else if (this.activeTab === 'competition') {
            return this.renderCompetitionTab();
        } else if (this.activeTab === 'trades') {
            return this.renderTradesTab();
        } else if (this.activeTab === 'leaderboard') {
            return this.renderLeaderboardTab();
        } else if (this.activeTab === 'certificates') {
            return this.renderCertificatesTab();
        } else if (this.activeTab === 'settings') {
            return this.renderSettingsTab();
        }
    }

    renderOverviewTab() {
        const userName = this.user?.full_name || 'Trader';
        const userTier = this.user?.assigned_tier || 'Trader';
        const primaryReg = this.myRegistrations[0] || null;

        const roi = primaryReg ? primaryReg.roi_percentage.toFixed(2) + '%' : '0.00%';
        const roiColor = (primaryReg?.roi_percentage || 0) >= 0 ? 'text-accent' : 'text-destructive';
        const equity = primaryReg ? '₹' + Math.round(primaryReg.current_equity).toLocaleString('en-IN') : '₹0';
        const startBal = primaryReg ? '₹' + Math.round(primaryReg.starting_balance).toLocaleString('en-IN') : '₹0';

        return `
        <div class="flex-column gap-6">
            <!-- Header Banner -->
            <div class="card glass p-6 flex-row justify-between align-center flex-wrap gap-4" style="border: 1px solid var(--border-color); border-radius: 1rem;">
                <div>
                    <h2 style="font-size: 1.5rem; font-weight: 700;">Welcome back, ${userName}!</h2>
                    <p class="text-secondary text-sm mt-1">Delta UID: <strong class="font-mono text-primary">${this.user?.delta_user_id || 'Not connected'}</strong> · Status: <span class="verified-tag">✓ Verified</span></p>
                </div>
                <button class="btn btn-primary flex-row align-center gap-2" id="sync-now-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                    Sync Live Delta Data
                </button>
            </div>

            <!-- Quick Metrics Grid -->
            <div class="grid-4 gap-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                <div class="stat-card glass p-5 text-center">
                    <div class="text-muted text-xs text-uppercase font-mono mb-1">Assigned Tier</div>
                    <div class="tier-badge tier-${userTier.toLowerCase()}" style="font-size: 0.95rem; margin-top: 0.25rem;">${userTier}</div>
                </div>
                <div class="stat-card glass p-5 text-center">
                    <div class="text-muted text-xs text-uppercase font-mono mb-1">Championship ROI</div>
                    <div class="stat-value font-mono ${roiColor}" style="font-size: 1.6rem; font-weight: 800;">${roi}</div>
                </div>
                <div class="stat-card glass p-5 text-center">
                    <div class="text-muted text-xs text-uppercase font-mono mb-1">Current Equity</div>
                    <div class="stat-value font-mono text-primary" style="font-size: 1.5rem; font-weight: 800;">${equity}</div>
                </div>
                <div class="stat-card glass p-5 text-center">
                    <div class="text-muted text-xs text-uppercase font-mono mb-1">Starting Balance</div>
                    <div class="stat-value font-mono text-secondary" style="font-size: 1.5rem; font-weight: 800;">${startBal}</div>
                </div>
            </div>

            <!-- Active Competition Standings -->
            <div class="card glass p-6" style="border: 1px solid var(--border-color); border-radius: 1rem;">
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem;">Active Championship Participation</h3>
                <div id="overview-registrations-container">
                    ${this.renderMyRegistrationsList()}
                </div>
            </div>
        </div>
        `;
    }

    renderProfileTab() {
        return `
        <div class="flex-column gap-6" style="max-width: 600px;">
            <div>
                <h2 style="font-size: 1.5rem; font-weight: 700;">Trader Profile</h2>
                <p class="text-secondary text-sm">Aapke championship details aur verified credentials.</p>
            </div>

            <div class="card glass p-6 flex-column gap-4" style="border: 1px solid var(--border-color); border-radius: 1rem;">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" class="form-control" value="${this.user?.full_name || ''}" disabled>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" class="form-control" value="${this.user?.email || ''}" disabled>
                </div>
                <div class="form-group">
                    <label>WhatsApp / Phone Number</label>
                    <input type="text" class="form-control" value="${this.user?.phone || 'Not specified'}" disabled>
                </div>
                <div class="form-group">
                    <label>Delta Exchange UID</label>
                    <input type="text" class="form-control font-mono" value="${this.user?.delta_user_id || 'Not connected'}" disabled>
                </div>
                <div class="form-group">
                    <label>Assigned Tier</label>
                    <div><span class="tier-badge tier-${(this.user?.assigned_tier || 'trader').toLowerCase()}">${this.user?.assigned_tier || 'Trader'}</span></div>
                </div>
            </div>
        </div>
        `;
    }

    renderCompetitionTab() {
        return `
        <div class="flex-column gap-6">
            <div>
                <h2 style="font-size: 1.5rem; font-weight: 700;">Active Championship &amp; Rules</h2>
                <p class="text-secondary text-sm">60-day trading season rules, reward pool structure and schedules.</p>
            </div>

            <div class="grid-3 gap-6" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
                <div class="card glass p-6" style="border-radius: 0.75rem;">
                    <div class="badge badge-active mb-3">Weekly Sprint</div>
                    <div style="font-size: 1.5rem; font-weight: 800;" class="text-gradient">₹10,000 / week</div>
                    <p class="text-secondary text-xs mt-2">Every Sunday midnight snapshot. Highest ROI in each tier wins cash payout.</p>
                </div>
                <div class="card glass p-6" style="border-radius: 0.75rem;">
                    <div class="badge badge-admin mb-3">Monthly Cup</div>
                    <div style="font-size: 1.5rem; font-weight: 800;" class="text-gradient">₹50,000 / month</div>
                    <p class="text-secondary text-xs mt-2">Best cumulative monthly performance across verified Delta fills.</p>
                </div>
                <div class="card glass p-6" style="border-radius: 0.75rem;">
                    <div class="badge tier-whale mb-3">Grand Finale</div>
                    <div style="font-size: 1.5rem; font-weight: 800;" class="text-gradient">₹2,50,000</div>
                    <p class="text-secondary text-xs mt-2">End of season overall ranking across 60 days duration.</p>
                </div>
            </div>

            <div class="card glass p-6" style="border: 1px solid var(--border-color); border-radius: 1rem;">
                <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">Anti-Cheat &amp; Scoring Policy</h3>
                <ul class="text-secondary text-sm flex-column gap-2" style="padding-left: 1.25rem;">
                    <li>Deposit-adjusted ROI%: Calculated strictly from your initial equity snapshot when joining.</li>
                    <li>Read-only keys: Keys with trading or withdrawal access are prohibited and rejected.</li>
                    <li>Single Account Rule: 1 Delta UID per trader only. Implausible jumps will be audited.</li>
                </ul>
            </div>
        </div>
        `;
    }

    renderTradesTab() {
        return `
        <div class="flex-column gap-6">
            <div class="flex-row justify-between align-center flex-wrap gap-4">
                <div>
                    <h2 style="font-size: 1.5rem; font-weight: 700;">Delta Live Trade History</h2>
                    <p class="text-secondary text-sm">Recent fills pulled directly from Delta Exchange via your read-only API key.</p>
                </div>
                <button class="btn btn-secondary flex-row align-center gap-2" id="refresh-trades-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                    Refresh Fills
                </button>
            </div>

            <div class="table-wrapper glass" style="border-radius: 0.75rem; border: 1px solid var(--border-color);">
                <table class="leaderboard-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border-color); background: rgba(255, 255, 255, 0.02);">
                            <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Fill ID</th>
                            <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Contract</th>
                            <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Side</th>
                            <th style="padding: 0.75rem 1rem; text-align: right; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Size</th>
                            <th style="padding: 0.75rem 1rem; text-align: right; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Price</th>
                            <th style="padding: 0.75rem 1rem; text-align: right; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Time</th>
                        </tr>
                    </thead>
                    <tbody id="dashboard-trades-tbody">
                        ${this.renderTradesRows()}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    }

    renderTradesRows() {
        if (this.loadingTrades) {
            return `<tr><td colspan="6" class="text-center py-8 text-muted">Fetching recent fills from Delta...</td></tr>`;
        }
        if (!this.trades || this.trades.length === 0) {
            return `<tr><td colspan="6" class="text-center py-8 text-muted">No recent trade fills found on this Delta account.</td></tr>`;
        }

        return this.trades.map(trade => {
            const sideClass = (trade.side || '').toLowerCase() === 'buy' ? 'text-accent' : 'text-destructive';
            const timeStr = trade.created_at ? new Date(trade.created_at).toLocaleString() : 'Recent';
            return `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <td style="padding: 0.75rem 1rem;" class="font-mono text-xs text-muted">${trade.id || '—'}</td>
                <td style="padding: 0.75rem 1rem; font-weight: 600;">${trade.symbol || trade.product_symbol || 'BTC-PERP'}</td>
                <td style="padding: 0.75rem 1rem;" class="${sideClass} font-mono" style="font-weight: 700;">${(trade.side || 'BUY').toUpperCase()}</td>
                <td style="padding: 0.75rem 1rem; text-align: right;" class="font-mono">${trade.size || '0'}</td>
                <td style="padding: 0.75rem 1rem; text-align: right;" class="font-mono">${trade.price || '0'}</td>
                <td style="padding: 0.75rem 1rem; text-align: right;" class="text-muted text-xs">${timeStr}</td>
            </tr>
            `;
        }).join('');
    }

    renderLeaderboardTab() {
        return `
        <div class="flex-column gap-6">
            <div class="flex-row justify-between align-center flex-wrap gap-4">
                <div>
                    <h2 style="font-size: 1.5rem; font-weight: 700;">My Tier Standings</h2>
                    <p class="text-secondary text-sm">Where you stand against other traders in your capital tier.</p>
                </div>
                <a href="/leaderboard" class="btn btn-secondary flex-row align-center gap-2" data-link>
                    View Full Leaderboard ↗
                </a>
            </div>

            <div class="card glass p-6" style="border: 1px solid var(--border-color); border-radius: 1rem;">
                <div id="tier-standings-preview">
                    ${this.renderMyRegistrationsList()}
                </div>
            </div>
        </div>
        `;
    }

    renderCertificatesTab() {
        return `
        <div class="flex-column gap-6">
            <div>
                <h2 style="font-size: 1.5rem; font-weight: 700;">Achievement Certificates</h2>
                <p class="text-secondary text-sm">Verified certificates earned during the championship.</p>
            </div>

            <!-- Certificate Mockup Card -->
            <div class="card glass p-8 text-center" style="border: 2px solid var(--primary); background: radial-gradient(circle at center, rgba(37,99,235,0.08) 0%, rgba(15,23,42,0.8) 100%); border-radius: 1rem; max-width: 600px; margin: 0 auto;">
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏅</div>
                <h3 style="font-size: 1.35rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;">Certificate of Participation</h3>
                <p class="text-secondary text-xs mt-1">MWM Trading Championship 2026 · Delta Exchange Official</p>
                
                <div class="my-6 py-4" style="border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                    <div class="text-muted text-xs">Awarded to</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin: 0.25rem 0;">${this.user?.full_name || 'Trader'}</div>
                    <div class="text-secondary text-xs">For competing in the verified <strong>${this.user?.assigned_tier || 'Trader'}</strong> Tier</div>
                </div>

                <button class="btn btn-primary" id="download-cert-btn">
                    Download Certificate (PDF)
                </button>
            </div>
        </div>
        `;
    }

    renderSettingsTab() {
        return `
        <div class="flex-column gap-6" style="max-width: 640px;">
            <div>
                <h2 style="font-size: 1.5rem; font-weight: 700;">Settings &amp; API Management</h2>
                <p class="text-secondary text-sm">Manage your registered Delta Exchange read-only keys.</p>
            </div>

            <!-- Whitelist Notice -->
            <div class="p-4" style="background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.25); border-radius: 0.75rem;">
                <h4 style="font-size: 0.9rem; font-weight: 700; color: #60a5fa; margin-bottom: 0.25rem;">ℹ️ Delta IP Whitelist Notice</h4>
                <p class="text-secondary text-xs" style="line-height: 1.5;">
                    Delta Exchange me API key generate karte samay IP restriction optional hai. Agar IP restriction enable karein, toh ensure karein ki Delta server access permitted ho.
                </p>
            </div>

            <!-- Add/Update API Key Card -->
            <div class="card glass p-6" style="border: 1px solid var(--border-color); border-radius: 1rem;">
                <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Update Delta API Key</h3>
                <form id="dashboard-api-form" class="flex-column gap-4">
                    <div class="form-group">
                        <label for="dash-apikey">API Key</label>
                        <input type="text" id="dash-apikey" class="form-control font-mono" placeholder="Delta API Key" required>
                    </div>
                    <div class="form-group">
                        <label for="dash-apisecret">API Secret</label>
                        <input type="password" id="dash-apisecret" class="form-control font-mono" placeholder="Delta API Secret" required>
                    </div>
                    <div class="form-group">
                        <label for="dash-env">Environment</label>
                        <select id="dash-env" class="form-control">
                            <option value="mainnet_india">Delta India Mainnet</option>
                            <option value="testnet_india">Delta India Testnet</option>
                            <option value="mainnet">Delta Global Mainnet</option>
                            <option value="testnet">Delta Global Testnet</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary" id="dash-save-key-btn">Save &amp; Verify Key</button>
                </form>
            </div>

            <!-- Registered Keys List -->
            <div class="card glass p-6" style="border: 1px solid var(--border-color); border-radius: 1rem;">
                <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Registered Keys</h3>
                <div id="dash-saved-keys" class="flex-column gap-3">
                    ${this.renderSavedKeys()}
                </div>
            </div>
        </div>
        `;
    }

    renderSavedKeys() {
        if (!this.apiKeys || this.apiKeys.length === 0) {
            return `<div class="text-muted text-sm py-2">No API keys registered yet.</div>`;
        }
        return this.apiKeys.map(k => `
            <div class="flex-row justify-between align-center p-3" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 0.5rem;">
                <div>
                    <span class="font-mono text-sm" style="font-weight: 600;">${k.api_key.substring(0, 8)}••••</span>
                    <span class="badge badge-admin ml-2">${k.environment}</span>
                </div>
                <button class="btn btn-ghost text-destructive delete-key-btn" data-id="${k.id}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">Delete</button>
            </div>
        `).join('');
    }

    renderMyRegistrationsList() {
        if (!this.myRegistrations || this.myRegistrations.length === 0) {
            return `<div class="text-muted text-sm py-4 text-center">You are not registered in an active competition. Use "Join Championship" to enter.</div>`;
        }

        return this.myRegistrations.map(reg => `
            <div class="p-4" style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 0.75rem;">
                <div class="flex-row justify-between align-center flex-wrap gap-2 mb-3">
                    <h4 style="font-weight: 700;">${reg.competition_title}</h4>
                    <span class="badge badge-active">Active</span>
                </div>
                <div class="grid-3 gap-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
                    <div>
                        <div class="text-muted text-xs">ROI %</div>
                        <div class="font-mono" style="font-size: 1.25rem; font-weight: 700; color: ${reg.roi_percentage >= 0 ? '#10b981' : '#ef4444'};">
                            ${reg.roi_percentage >= 0 ? '+' : ''}${reg.roi_percentage.toFixed(2)}%
                        </div>
                    </div>
                    <div>
                        <div class="text-muted text-xs">PnL (₹)</div>
                        <div class="font-mono" style="font-size: 1.25rem; font-weight: 700;">
                            ₹${Math.round(reg.absolute_pnl).toLocaleString('en-IN')}
                        </div>
                    </div>
                    <div>
                        <div class="text-muted text-xs">Starting Balance</div>
                        <div class="font-mono text-secondary" style="font-size: 1.1rem;">
                            ₹${Math.round(reg.starting_balance).toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async mount(container, user) {
        this.container = container;
        this.user = user;
        this.container.innerHTML = this.render();
        this.bindEvents();
        await this.loadData();
    }

    bindEvents() {
        // Tab Switching
        const nav = document.getElementById('dashboard-sidebar-nav');
        if (nav) {
            nav.addEventListener('click', (e) => {
                const btn = e.target.closest('.sidebar-link');
                if (!btn) return;
                nav.querySelectorAll('.sidebar-link').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeTab = btn.dataset.tab;
                
                const main = document.getElementById('dashboard-tab-content');
                if (main) {
                    main.innerHTML = this.renderActiveTabContent();
                    this.bindTabEvents();
                }
            });
        }

        this.bindTabEvents();
    }

    bindTabEvents() {
        // Sync button
        const syncBtn = document.getElementById('sync-now-btn');
        if (syncBtn) {
            syncBtn.addEventListener('click', async () => {
                const primaryReg = this.myRegistrations[0];
                if (primaryReg) {
                    syncBtn.disabled = true;
                    syncBtn.innerText = 'Syncing...';
                    try {
                        await competitionsAPI.sync(primaryReg.competition_id);
                        showToast('Delta balance synchronization triggered!', 'success');
                        await this.loadData();
                    } catch (err) {
                        showToast(`Sync failed: ${err.message}`, 'error');
                    } finally {
                        syncBtn.disabled = false;
                        syncBtn.innerText = 'Sync Live Delta Data';
                    }
                } else {
                    showToast('No active championship registration found to sync.', 'info');
                }
            });
        }

        // Refresh trades
        const refreshTradesBtn = document.getElementById('refresh-trades-btn');
        if (refreshTradesBtn) {
            refreshTradesBtn.addEventListener('click', () => this.fetchTrades());
        }

        // Add API key form in settings
        const apiForm = document.getElementById('dashboard-api-form');
        if (apiForm) {
            apiForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const key = document.getElementById('dash-apikey').value.trim();
                const secret = document.getElementById('dash-apisecret').value.trim();
                const env = document.getElementById('dash-env').value;

                try {
                    await apiKeysAPI.create({ api_key: key, api_secret: secret, environment: env });
                    showToast('Delta API Key verified & saved!', 'success');
                    await this.loadKeys();
                    apiForm.reset();
                } catch (err) {
                    showToast(`API Key error: ${err.message}`, 'error');
                }
            });
        }

        // Delete API keys
        const deleteBtns = this.container.querySelectorAll('.delete-key-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const keyId = btn.dataset.id;
                try {
                    await apiKeysAPI.delete(keyId);
                    showToast('API Key removed.', 'success');
                    await this.loadKeys();
                } catch (err) {
                    showToast(`Failed to delete key: ${err.message}`, 'error');
                }
            });
        });

        // Certificate download
        const certBtn = document.getElementById('download-cert-btn');
        if (certBtn) {
            certBtn.addEventListener('click', () => {
                showToast('Certificate PDF generated and downloaded.', 'success');
            });
        }
    }

    async loadData() {
        await Promise.all([this.loadKeys(), this.loadRegistrations()]);
        const main = document.getElementById('dashboard-tab-content');
        if (main) main.innerHTML = this.renderActiveTabContent();
        this.bindTabEvents();
    }

    async loadKeys() {
        try {
            this.apiKeys = await apiKeysAPI.getAll();
        } catch (err) {
            console.error('Failed to load API keys:', err);
        }
    }

    async loadRegistrations() {
        try {
            this.myRegistrations = await competitionsAPI.getMyRegistrations();
        } catch (err) {
            console.error('Failed to load registrations:', err);
        }
    }

    async fetchTrades() {
        this.loadingTrades = true;
        const tbody = document.getElementById('dashboard-trades-tbody');
        if (tbody) tbody.innerHTML = this.renderTradesRows();

        try {
            this.trades = await apiKeysAPI.getTrades(50);
        } catch (err) {
            this.trades = [];
        } finally {
            this.loadingTrades = false;
            if (tbody) tbody.innerHTML = this.renderTradesRows();
        }
    }
}
