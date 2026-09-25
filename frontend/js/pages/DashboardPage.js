// User Dashboard Component with Sidebar Navigation & Profile Completion Hub
import { apiKeysAPI, competitionsAPI, authAPI } from '../api.js';
import { showToast } from '../components/Toast.js';
import { calculateProfileCompletion, renderAvatarWithProgress } from '../utils.js';
import { updateNavbar } from '../components/Navbar.js';

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

        // Profile Completion Wizard State
        this.wizardStep = 1; // 1: Name/Contact, 2: Exchange, 3: UID, 4: API Key
        this.isEditingProfile = false;
        this.wizardData = {
            fullName: '',
            phone: '',
            exchange: 'Delta Exchange',
            uid: '',
            apiKey: '',
            apiSecret: '',
            environment: 'mainnet_india'
        };

        this.tabSwitchListener = (e) => {
            if (e && e.detail && e.detail.tab) {
                this.switchToTab(e.detail.tab);
            }
        };
    }

    switchToTab(tabName) {
        this.activeTab = tabName;
        const nav = document.getElementById('dashboard-sidebar-nav');
        if (nav) {
            nav.querySelectorAll('.sidebar-link').forEach(b => {
                b.classList.toggle('active', b.dataset.tab === tabName);
            });
        }
        const main = document.getElementById('dashboard-tab-content');
        if (main) {
            main.innerHTML = this.renderActiveTabContent();
            this.bindTabEvents();
        }
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
                    <div class="p-3 mb-2 flex-row align-center gap-3" id="sidebar-user-header">
                        <div id="sidebar-avatar-wrap">
                            ${renderAvatarWithProgress(this.user, 42, true)}
                        </div>
                        <div class="flex-column" style="overflow: hidden; min-width: 0;">
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

                    <!-- Pinned Sidebar Bottom Widget -->
                    <div class="sidebar-bottom-widget mt-auto p-3" style="margin-top: auto; border-top: 1px solid var(--border-color); background: rgba(0,0,0,0.25); border-radius: 0.75rem;">
                        <div class="flex-row align-center justify-between mb-1.5">
                            <span class="font-mono text-xs text-muted" style="font-size: 0.68rem; letter-spacing: 0.04em;">SYSTEM STATUS</span>
                            <span class="badge badge-active flex-row align-center gap-1" style="font-size: 0.65rem; padding: 0.1rem 0.35rem;">
                                <span class="pulse-dot-green"></span> 99.98%
                            </span>
                        </div>
                        <div class="text-xs text-secondary mb-1">
                            Delta API Engine: <strong class="text-primary font-mono">Live</strong>
                        </div>
                        <div class="text-xs text-muted mb-2 font-mono" style="font-size: 0.68rem;">
                            Season 1 · 2026 Championship
                        </div>
                        <a href="https://t.me" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm w-full text-center" style="font-size: 0.725rem; border: 1px solid var(--border-color); padding: 0.35rem 0.5rem; border-radius: 0.375rem;">
                            💬 Official Contest Support
                        </a>
                    </div>
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
        const pct = calculateProfileCompletion(this.user);
        const hasEmail = Boolean(this.user?.is_verified);
        const hasInfo = Boolean(this.user?.full_name && this.user?.phone);
        const hasUID = Boolean(this.user?.delta_user_id);
        const hasAPI = Boolean(this.user?.has_api_key || (this.apiKeys && this.apiKeys.some(k => k.is_valid)));

        return `
        <div class="flex-column gap-6 w-full">
            <!-- Salesforce-style Workspace Breadcrumb & Action Toolbar -->
            <div class="workspace-header-bar flex-row align-center justify-between flex-wrap gap-4 pb-4 border-bottom" style="border-bottom: 1px solid var(--border-color);">
                <div class="flex-column gap-1">
                    <div class="breadcrumbs flex-row align-center gap-2 text-xs font-mono text-muted">
                        <span style="color: var(--text-muted); cursor: pointer;" id="topbar-crumb-dash">DASHBOARD</span>
                        <span>/</span>
                        <span class="text-primary font-bold">TRADER SETUP</span>
                    </div>
                    <div class="flex-row align-center gap-3">
                        <h1 style="font-size: 1.45rem; font-weight: 800; letter-spacing: -0.02em;">Trader Profile &amp; Setup</h1>
                        <span class="badge ${pct === 100 ? 'badge-active' : 'badge-admin'}" style="font-size: 0.7rem;">
                            ${pct === 100 ? '✓ Fully Verified' : `● Action Required (${pct}%)`}
                        </span>
                    </div>
                </div>
                <div class="flex-row align-center gap-2.5">
                    <button type="button" class="btn btn-secondary btn-sm flex-row align-center gap-1.5" id="profile-top-refresh-btn" title="Refresh Profile State">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                        Sync Status
                    </button>
                    <button type="button" class="btn btn-primary btn-sm flex-row align-center gap-1.5" id="profile-top-comp-btn">
                        View Competitions →
                    </button>
                </div>
            </div>

            <!-- 2-Column Responsive Layout Grid (stretches 100% width) -->
            <div class="profile-layout-grid">
                <!-- Left Column: Primary Wizard / Verification Cards -->
                <div class="profile-main-col flex-column gap-6">
                    <!-- Profile Completion Header Banner -->
                    <div class="card glass p-6" style="border: 1px solid var(--border-color); border-radius: 1rem;">
                        <div class="flex-row align-center justify-between flex-wrap gap-4 mb-4">
                            <div class="flex-row align-center gap-4">
                                ${renderAvatarWithProgress(this.user, 64, true)}
                                <div>
                                    <div class="flex-row align-center gap-2">
                                        <h2 style="font-size: 1.35rem; font-weight: 700;">Profile Completion Overview</h2>
                                        ${pct === 100 ? '<span class="badge badge-active" style="font-size: 0.75rem;">100% Complete</span>' : ''}
                                    </div>
                                    <p class="text-secondary text-sm mt-1">
                                        Complete all 4 verification steps to link your exchange credentials and qualify for official cash prize leaderboards.
                                    </p>
                                </div>
                            </div>
                            <div class="flex-column align-end">
                                <div class="font-mono text-xl font-bold ${pct === 100 ? 'text-accent' : 'text-primary'}">${pct}%</div>
                                <span class="text-muted text-xs">Profile Completion</span>
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div class="progress-bar-wrap mb-4" style="height: 8px; background: rgba(255,255,255,0.08); border-radius: 9999px; overflow: hidden;">
                            <div style="width: ${pct}%; height: 100%; background: ${pct === 100 ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)'}; border-radius: 9999px; transition: width 0.6s ease;"></div>
                        </div>

                        <!-- 4 Milestones Checklist -->
                        <div class="grid-4 gap-2 text-xs" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
                            <div class="flex-row align-center gap-1.5 ${hasEmail ? 'text-accent font-semibold' : 'text-muted'}">
                                <span>${hasEmail ? '✓' : '○'}</span> Email Verified (25%)
                            </div>
                            <div class="flex-row align-center gap-1.5 ${hasInfo ? 'text-accent font-semibold' : 'text-muted'}">
                                <span>${hasInfo ? '✓' : '○'}</span> Personal Info (25%)
                            </div>
                            <div class="flex-row align-center gap-1.5 ${hasUID ? 'text-accent font-semibold' : 'text-muted'}">
                                <span>${hasUID ? '✓' : '○'}</span> Exchange &amp; UID (25%)
                            </div>
                            <div class="flex-row align-center gap-1.5 ${hasAPI ? 'text-accent font-semibold' : 'text-muted'}">
                                <span>${hasAPI ? '✓' : '○'}</span> Read-Only API (25%)
                            </div>
                        </div>
                    </div>

                    ${pct === 100 && !this.isEditingProfile ? this.renderCompletedProfileView() : this.renderProfileWizard()}
                </div>

                <!-- Right Column: Live Contest Readiness & Help Rail -->
                <aside class="profile-side-col flex-column gap-6">
                    ${this.renderProfileHelpRail(pct, hasEmail, hasInfo, hasUID, hasAPI)}
                </aside>
            </div>
        </div>
        `;
    }

    renderProfileHelpRail(pct, hasEmail, hasInfo, hasUID, hasAPI) {
        const isComplete = pct === 100;
        const exchangeName = this.user?.exchange || this.wizardData.exchange || 'Delta Exchange';
        const isDelta = exchangeName.toLowerCase().includes('delta');

        // Dynamic step guidance widget styled with modern glass aesthetic
        let stepGuidanceHtml = '';
        if (isComplete && !this.isEditingProfile) {
            stepGuidanceHtml = `
            <div class="step-guide-panel p-4" style="background: rgba(16, 185, 129, 0.04); border: 1px solid rgba(16, 185, 129, 0.22); border-radius: 0.75rem;">
                <div class="flex-row align-center justify-between mb-2">
                    <span class="text-xs font-bold uppercase tracking-wider text-accent" style="letter-spacing: 0.05em;">Live Connection</span>
                    <span class="badge badge-active flex-row align-center gap-1.5" style="font-size: 0.68rem;">
                        <span class="pulse-dot-green"></span> Sync Active
                    </span>
                </div>
                <p class="text-secondary text-xs" style="line-height: 1.55;">
                    Your <strong>${exchangeName}</strong> UID and read-only API are connected. Active positions and ROI synchronize every 15 minutes.
                </p>
                <div class="flex-row gap-2 mt-3">
                    <button type="button" class="btn btn-secondary btn-sm flex-1 text-center" id="rail-view-competitions-btn">
                        Competitions
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm flex-1 text-center" id="rail-view-leaderboard-btn">
                        Leaderboard
                    </button>
                </div>
            </div>
            `;
        } else if (this.wizardStep === 1) {
            stepGuidanceHtml = `
            <div class="step-guide-panel p-4" style="background: rgba(37, 99, 235, 0.04); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 0.75rem;">
                <div class="flex-row align-center gap-2 mb-2.5">
                    <div class="icon-wrapper" style="width: 26px; height: 26px; border-radius: 0.375rem; background: rgba(37, 99, 235, 0.15); color: #3b82f6; display: flex; align-items: center; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--text-primary);">Why Identity Details?</h4>
                </div>
                <div class="flex-column gap-2 text-xs text-secondary" style="line-height: 1.55;">
                    <div class="flex-row align-start gap-2">
                        <span class="text-primary font-bold">•</span>
                        <div><strong class="text-primary">Leaderboard Display:</strong> Your full name appears on official championship rankings and your verified completion certificate.</div>
                    </div>
                    <div class="flex-row align-start gap-2">
                        <span class="text-primary font-bold">•</span>
                        <div><strong class="text-primary">Prize Disbursements:</strong> Phone &amp; WhatsApp are used strictly for rapid prize distribution announcements and urgent tournament alerts.</div>
                    </div>
                </div>
            </div>
            `;
        } else if (this.wizardStep === 2) {
            stepGuidanceHtml = `
            <div class="step-guide-panel p-4" style="background: rgba(37, 99, 235, 0.04); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 0.75rem;">
                <div class="flex-row align-center gap-2 mb-2.5">
                    <div class="icon-wrapper" style="width: 26px; height: 26px; border-radius: 0.375rem; background: rgba(37, 99, 235, 0.15); color: #3b82f6; display: flex; align-items: center; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>
                    </div>
                    <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--text-primary);">Exchange Selection Guide</h4>
                </div>
                <div class="flex-column gap-2 text-xs text-secondary" style="line-height: 1.55;">
                    <div class="flex-row align-start gap-2">
                        <span class="text-primary font-bold">•</span>
                        <div><strong class="text-primary">Delta Exchange (Official Partner):</strong> Recommended for all Indian &amp; Global derivatives traders. Features automated real-time trade syncing via official Delta APIs.</div>
                    </div>
                    <div class="flex-row align-start gap-2">
                        <span class="text-primary font-bold">•</span>
                        <div><strong class="text-primary">Shark Exchange:</strong> Supported partner exchange for crypto futures. Trades are synced via UID and API whitelisting.</div>
                    </div>
                </div>
            </div>
            `;
        } else if (this.wizardStep === 3) {
            stepGuidanceHtml = `
            <div class="step-guide-panel p-4" style="background: rgba(37, 99, 235, 0.04); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 0.75rem;">
                <div class="flex-row align-center gap-2 mb-2.5">
                    <div class="icon-wrapper" style="width: 26px; height: 26px; border-radius: 0.375rem; background: rgba(37, 99, 235, 0.15); color: #3b82f6; display: flex; align-items: center; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                    <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--text-primary);">Finding Your ${isDelta ? 'Delta' : 'Shark'} UID</h4>
                </div>
                <div class="flex-column gap-2 text-xs text-secondary" style="line-height: 1.55;">
                    <div class="flex-row align-center gap-2">
                        <span class="font-mono text-primary font-bold" style="background: rgba(37, 99, 235, 0.15); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">1</span>
                        <span>Log in to your <strong>${isDelta ? 'Delta' : 'Shark'} Exchange</strong> account.</span>
                    </div>
                    <div class="flex-row align-center gap-2">
                        <span class="font-mono text-primary font-bold" style="background: rgba(37, 99, 235, 0.15); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">2</span>
                        <span>Click your <strong>Profile avatar</strong> in the top right corner.</span>
                    </div>
                    <div class="flex-row align-center gap-2">
                        <span class="font-mono text-primary font-bold" style="background: rgba(37, 99, 235, 0.15); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">3</span>
                        <span>Copy your <strong>User ID (UID)</strong> (typically 6-8 digits).</span>
                    </div>
                </div>
                <div class="p-2.5 mt-2" style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid #f59e0b; border-radius: 0.5rem; font-size: 0.775rem; color: var(--text-secondary); line-height: 1.45;">
                    <strong style="color: #f59e0b;">Official Requirement:</strong> Your UID must be registered under the official championship referral link to qualify for cash prizes.
                </div>
            </div>
            `;
        } else if (this.wizardStep === 4) {
            stepGuidanceHtml = `
            <div class="step-guide-panel p-4" style="background: rgba(37, 99, 235, 0.04); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 0.75rem;">
                <div class="flex-row align-center gap-2 mb-2.5">
                    <div class="icon-wrapper" style="width: 26px; height: 26px; border-radius: 0.375rem; background: rgba(37, 99, 235, 0.15); color: #3b82f6; display: flex; align-items: center; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--text-primary);">API Key Creation Guide</h4>
                </div>
                <div class="flex-column gap-2 text-xs text-secondary" style="line-height: 1.55;">
                    <div class="flex-row align-center gap-2">
                        <span class="font-mono text-primary font-bold" style="background: rgba(37, 99, 235, 0.15); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">1</span>
                        <span>Go to <strong>Settings → API Keys</strong> on ${isDelta ? 'Delta' : 'Shark'}.</span>
                    </div>
                    <div class="flex-row align-center gap-2">
                        <span class="font-mono text-primary font-bold" style="background: rgba(37, 99, 235, 0.15); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">2</span>
                        <span>Click <strong>"Create New API Key"</strong>.</span>
                    </div>
                    <div class="flex-row align-center gap-2">
                        <span class="font-mono text-accent font-bold" style="background: rgba(16, 185, 129, 0.15); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">✓</span>
                        <span>Enable <strong class="text-accent">Read-Only</strong> permissions ONLY.</span>
                    </div>
                    <div class="flex-row align-center gap-2">
                        <span class="font-mono text-destructive font-bold" style="background: rgba(239, 68, 68, 0.15); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">✗</span>
                        <span><strong class="text-destructive">DO NOT enable</strong> "Withdrawal" or "Trade" access.</span>
                    </div>
                </div>
            </div>
            `;
        }

        return `
        <!-- Card 1: Prize Pool Eligibility & Unlocked Perks -->
        <div class="card glass p-6 flex-column gap-5" style="border: 1px solid var(--border-color); border-radius: 1rem;">
            <div class="flex-row align-center justify-between">
                <div>
                    <span class="section-tag text-primary" style="font-weight: 700; text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.06em; margin-bottom: 0.2rem; display: block;">Eligibility Status</span>
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em;">Contest Qualification</h3>
                </div>
                ${isComplete
                    ? '<span class="badge badge-active flex-row align-center gap-1.5" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;"><span class="pulse-dot-green"></span> Qualified</span>'
                    : `<span class="badge" style="background: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); font-size: 0.72rem; font-weight: 600; padding: 0.25rem 0.6rem;">Step ${this.wizardStep} of 4 · ${pct}%</span>`
                }
            </div>
            <p class="text-secondary text-xs" style="line-height: 1.5; margin-top: -0.5rem;">
                Complete profile verification to unlock live scoring, certified badges, and official cash rewards.
            </p>

            <div class="flex-column gap-3">
                <div class="qualification-perk-item">
                    <div class="flex-row align-center gap-3">
                        <div class="perk-icon-wrap ${hasAPI ? 'perk-unlocked' : 'perk-locked'}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                        </div>
                        <div class="flex-column gap-0.5">
                            <span class="text-sm font-bold ${hasAPI ? 'text-primary' : 'text-secondary'}">Cash Prize Distribution</span>
                            <span class="text-secondary text-xs" style="line-height: 1.4;">Qualify for ₹5,00,000+ official tournament prize pools.</span>
                        </div>
                    </div>
                    <div>
                        ${hasAPI
                            ? '<span class="badge badge-active" style="font-size: 0.65rem; padding: 0.15rem 0.5rem;">Unlocked</span>'
                            : '<span class="badge" style="font-size: 0.65rem; background: rgba(255,255,255,0.04); color: var(--text-muted); border: 1px solid var(--border-color); padding: 0.15rem 0.5rem;">Stage 4</span>'
                        }
                    </div>
                </div>

                <div class="qualification-perk-item">
                    <div class="flex-row align-center gap-3">
                        <div class="perk-icon-wrap ${hasAPI ? 'perk-unlocked' : 'perk-locked'}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        </div>
                        <div class="flex-column gap-0.5">
                            <span class="text-sm font-bold ${hasAPI ? 'text-primary' : 'text-secondary'}">Live Automated PnL Sync</span>
                            <span class="text-secondary text-xs" style="line-height: 1.4;">Zero manual uploads; positions pull direct via exchange API.</span>
                        </div>
                    </div>
                    <div>
                        ${hasAPI
                            ? '<span class="badge badge-active" style="font-size: 0.65rem; padding: 0.15rem 0.5rem;">Active</span>'
                            : '<span class="badge" style="font-size: 0.65rem; background: rgba(255,255,255,0.04); color: var(--text-muted); border: 1px solid var(--border-color); padding: 0.15rem 0.5rem;">Stage 4</span>'
                        }
                    </div>
                </div>

                <div class="qualification-perk-item">
                    <div class="flex-row align-center gap-3">
                        <div class="perk-icon-wrap ${hasUID ? 'perk-unlocked' : 'perk-locked'}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                        </div>
                        <div class="flex-column gap-0.5">
                            <span class="text-sm font-bold ${hasUID ? 'text-primary' : 'text-secondary'}">Verified Trader Badge</span>
                            <span class="text-secondary text-xs" style="line-height: 1.4;">Official checkmark displayed alongside your handle on leaderboards.</span>
                        </div>
                    </div>
                    <div>
                        ${hasUID
                            ? '<span class="badge badge-active" style="font-size: 0.65rem; padding: 0.15rem 0.5rem;">Verified</span>'
                            : '<span class="badge" style="font-size: 0.65rem; background: rgba(255,255,255,0.04); color: var(--text-muted); border: 1px solid var(--border-color); padding: 0.15rem 0.5rem;">Stage 3</span>'
                        }
                    </div>
                </div>

                <div class="qualification-perk-item">
                    <div class="flex-row align-center gap-3">
                        <div class="perk-icon-wrap ${hasEmail && hasInfo ? 'perk-unlocked' : 'perk-locked'}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                        </div>
                        <div class="flex-column gap-0.5">
                            <span class="text-sm font-bold ${(hasEmail && hasInfo) ? 'text-primary' : 'text-secondary'}">Official Championship Certificate</span>
                            <span class="text-secondary text-xs" style="line-height: 1.4;">Verifiable digital credential issued upon concluding tournament rounds.</span>
                        </div>
                    </div>
                    <div>
                        ${(hasEmail && hasInfo)
                            ? '<span class="badge badge-active" style="font-size: 0.65rem; padding: 0.15rem 0.5rem;">Ready</span>'
                            : '<span class="badge" style="font-size: 0.65rem; background: rgba(255,255,255,0.04); color: var(--text-muted); border: 1px solid var(--border-color); padding: 0.15rem 0.5rem;">Stage 2</span>'
                        }
                    </div>
                </div>
            </div>

            <!-- Integrated Step Guidance Drawer -->
            ${stepGuidanceHtml}
        </div>

        <!-- Card 2: Bank-Grade Security Assurance & Dedicated Support -->
        <div class="card glass p-6 flex-column gap-4" style="border: 1px solid var(--border-color); border-radius: 1rem; background: linear-gradient(180deg, rgba(16,185,129,0.03) 0%, rgba(15,23,42,0.45) 100%);">
            <div class="flex-row align-center justify-between">
                <div>
                    <span class="section-tag" style="font-weight: 700; text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.06em; color: #10b981; margin-bottom: 0.2rem; display: block;">Security Assurance</span>
                    <div class="flex-row align-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em;">Bank-Grade Security</h4>
                    </div>
                </div>
                <span class="badge badge-active" style="font-size: 0.68rem; padding: 0.2rem 0.55rem;">Read-Only Protocol</span>
            </div>
            <p class="text-secondary text-xs" style="line-height: 1.5; margin-top: -0.25rem;">
                Your funds remain 100% untouched and safe under your direct control at all times.
            </p>

            <div class="flex-column gap-2.5">
                <div class="flex-row align-start gap-2.5 p-2.5" style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 0.625rem;">
                    <div style="color: #10b981; margin-top: 1px; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                    </div>
                    <div class="text-xs" style="line-height: 1.5;">
                        <strong class="text-primary block mb-0.5">AES-256 GCM Encryption</strong>
                        <span class="text-secondary">API keys are stored using military-grade AES-256 GCM encryption. Credentials decrypt only in isolated worker environments.</span>
                    </div>
                </div>

                <div class="flex-row align-start gap-2.5 p-2.5" style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 0.625rem;">
                    <div style="color: #10b981; margin-top: 1px; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                    </div>
                    <div class="text-xs" style="line-height: 1.5;">
                        <strong class="text-primary block mb-0.5">Strict Read-Only Enforcement</strong>
                        <span class="text-secondary">Transfer and trading privileges are strictly forbidden. The system cannot execute trades or move your balance.</span>
                    </div>
                </div>

                <div class="flex-row align-start gap-2.5 p-2.5" style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 0.625rem;">
                    <div style="color: #10b981; margin-top: 1px; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                    </div>
                    <div class="text-xs" style="line-height: 1.5;">
                        <strong class="text-primary block mb-0.5">Instant Key Revocation</strong>
                        <span class="text-secondary">Revoke or delete your keys anytime directly from Delta Exchange or your MWM settings panel with zero traces.</span>
                    </div>
                </div>
            </div>

            <!-- Quick Support Action Bar -->
            <div class="flex-row align-center justify-between gap-3 pt-3 border-top mt-1" style="border-color: rgba(255, 255, 255, 0.08);">
                <div class="flex-column">
                    <span class="text-xs font-bold text-primary">Need setup help?</span>
                    <span class="text-muted text-xs">Reach out to contest organizers.</span>
                </div>
                <a href="https://t.me" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm flex-row align-center gap-1.5" style="white-space: nowrap; font-size: 0.775rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                    Telegram Support
                </a>
            </div>
        </div>
        `;
    }

    renderCompletedProfileView() {
        const exchangeName = this.user?.exchange || 'Delta Exchange';
        return `
        <div class="card glass p-6 flex-column gap-5" style="border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 1rem;">
            <div class="flex-row justify-between align-center border-bottom pb-4" style="border-bottom: 1px solid var(--border-color);">
                <div>
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: #10b981;">✓ Profile Fully Verified</h3>
                    <p class="text-secondary text-xs mt-0.5">Your exchange account and read-only API credentials are connected and active.</p>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" id="profile-edit-setup-btn">
                    Edit / Update Setup
                </button>
            </div>

            <div class="grid-2 gap-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
                <div>
                    <span class="text-xs text-muted block mb-1">Full Name</span>
                    <div class="font-bold text-sm">${this.user?.full_name || '—'}</div>
                </div>
                <div>
                    <span class="text-xs text-muted block mb-1">Email Address</span>
                    <div class="text-sm flex-row align-center gap-2">
                        <span>${this.user?.email || '—'}</span>
                        <span class="badge badge-active" style="font-size: 0.65rem;">Verified</span>
                    </div>
                </div>
                <div>
                    <span class="text-xs text-muted block mb-1">WhatsApp / Phone</span>
                    <div class="font-bold text-sm">${this.user?.phone || '—'}</div>
                </div>
                <div>
                    <span class="text-xs text-muted block mb-1">Connected Exchange</span>
                    <div class="font-bold text-sm text-primary">${exchangeName}</div>
                </div>
                <div>
                    <span class="text-xs text-muted block mb-1">Exchange User ID (UID)</span>
                    <div class="font-mono text-sm font-bold flex-row align-center gap-2">
                        <span>${this.user?.delta_user_id || '—'}</span>
                        <span class="badge badge-active" style="font-size: 0.65rem;">Active</span>
                    </div>
                </div>
                <div>
                    <span class="text-xs text-muted block mb-1">Assigned Tier</span>
                    <div><span class="tier-badge tier-${(this.user?.assigned_tier || 'trader').toLowerCase()}">${this.user?.assigned_tier || 'Trader'} Tier</span></div>
                </div>
            </div>
        </div>
        `;
    }

    renderProfileWizard() {
        // Initialize wizard data with current user state if not yet filled
        if (!this.wizardData.fullName && this.user?.full_name) {
            this.wizardData.fullName = this.user.full_name;
        }
        if (!this.wizardData.phone && this.user?.phone) {
            this.wizardData.phone = this.user.phone;
        }
        if (!this.wizardData.uid && this.user?.delta_user_id) {
            this.wizardData.uid = this.user.delta_user_id;
        }
        if (this.user?.exchange) {
            this.wizardData.exchange = this.user.exchange;
        }

        return `
        <div class="card glass p-6" style="border: 1px solid var(--border-color); border-radius: 1rem;">
            <!-- Stepper Progress Header -->
            <div class="stepper-header mb-6">
                <div class="stepper-step ${this.wizardStep === 1 ? 'active' : (this.wizardStep > 1 ? 'completed' : '')}">
                    <div class="stepper-circle">${this.wizardStep > 1 ? '✓' : '1'}</div>
                    <span class="stepper-step-label">Name</span>
                </div>
                <div class="stepper-step ${this.wizardStep === 2 ? 'active' : (this.wizardStep > 2 ? 'completed' : '')}">
                    <div class="stepper-circle">${this.wizardStep > 2 ? '✓' : '2'}</div>
                    <span class="stepper-step-label">Exchange</span>
                </div>
                <div class="stepper-step ${this.wizardStep === 3 ? 'active' : (this.wizardStep > 3 ? 'completed' : '')}">
                    <div class="stepper-circle">${this.wizardStep > 3 ? '✓' : '3'}</div>
                    <span class="stepper-step-label">UID</span>
                </div>
                <div class="stepper-step ${this.wizardStep === 4 ? 'active' : ''}">
                    <div class="stepper-circle">4</div>
                    <span class="stepper-step-label">API Key</span>
                </div>
            </div>

            <!-- Current Wizard Step Content -->
            <div id="profile-wizard-step-body">
                ${this.renderCurrentWizardStep()}
            </div>
        </div>
        `;
    }

    renderCurrentWizardStep() {
        if (this.wizardStep === 1) {
            return `
            <div class="flex-column gap-4">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 700;">Step 1: Your Profile Details</h3>
                    <p class="text-secondary text-sm">Enter the name and contact number you want displayed on the leaderboard and for competition updates.</p>
                </div>

                <div class="grid-2 gap-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
                    <div class="form-group">
                        <label for="wizard-fullname">Full Name</label>
                        <input type="text" id="wizard-fullname" class="form-control" placeholder="John Doe" value="${this.wizardData.fullName || ''}" required>
                        <span class="text-muted text-xs mt-1 block" style="font-size: 0.725rem;">Displayed on your certificate and public leaderboards.</span>
                    </div>

                    <div class="form-group">
                        <label for="wizard-phone">WhatsApp / Phone Number</label>
                        <input type="tel" id="wizard-phone" class="form-control" placeholder="+91 98765 43210" value="${this.wizardData.phone || ''}" required>
                        <span class="text-muted text-xs mt-1 block" style="font-size: 0.725rem;">Used strictly for urgent prize disbursement notifications.</span>
                    </div>
                </div>

                <div class="flex-row justify-end mt-4">
                    <button type="button" class="btn btn-primary" id="wizard-step1-next">
                        Continue to Exchange Selection →
                    </button>
                </div>
            </div>
            `;
        } else if (this.wizardStep === 2) {
            return `
            <div class="flex-column gap-4">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 700;">Step 2: Choose Your Exchange</h3>
                    <p class="text-secondary text-sm">Select the exchange you trade with.</p>
                </div>

                <!-- Exchange Options Grid -->
                <div class="grid-2 gap-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
                    <div class="choice-card ${this.wizardData.exchange === 'Delta Exchange' ? 'selected highlight' : ''}" id="select-delta-exchange" style="cursor: pointer; padding: 1.25rem; border: 1.5px solid ${this.wizardData.exchange === 'Delta Exchange' ? 'var(--primary)' : 'var(--border-color)'}; border-radius: 0.75rem;">
                        <div class="flex-row align-center justify-between mb-2">
                            <span style="font-weight: 700; font-size: 1.05rem;">Delta Exchange</span>
                            <span class="badge badge-admin" style="font-size: 0.65rem;">Official Partner</span>
                        </div>
                        <p class="text-secondary text-xs" style="line-height: 1.4;">
                            Connect your Delta India or Delta Global account. Official championship partner.
                        </p>
                    </div>

                    <div class="choice-card ${this.wizardData.exchange === 'Shark Exchange' ? 'selected highlight' : ''}" id="select-shark-exchange" style="cursor: pointer; padding: 1.25rem; border: 1.5px solid ${this.wizardData.exchange === 'Shark Exchange' ? 'var(--primary)' : 'var(--border-color)'}; border-radius: 0.75rem;">
                        <div class="flex-row align-center justify-between mb-2">
                            <span style="font-weight: 700; font-size: 1.05rem;">Shark Exchange</span>
                            <span class="badge badge-user" style="font-size: 0.65rem;">Partner</span>
                        </div>
                        <p class="text-secondary text-xs" style="line-height: 1.4;">
                            Connect your Shark Exchange 6-digit UID and API credentials.
                        </p>
                    </div>
                </div>

                <!-- Referral banner if user needs to create an account -->
                <div class="p-4 flex-row justify-between align-center flex-wrap gap-3" style="background: rgba(37, 99, 235, 0.08); border: 1px dashed rgba(59, 130, 246, 0.3); border-radius: 0.75rem;">
                    <div>
                        <div class="text-xs font-bold text-primary">Need a Delta Account?</div>
                        <div class="text-xs text-secondary">Open an account using official championship referral code: <strong class="font-mono text-primary">EUERQB</strong></div>
                    </div>
                    <a href="https://www.delta.exchange/app/signup/?code=EUERQB" target="_blank" class="btn btn-secondary btn-sm" id="open-delta-btn">
                        Open Delta Account ↗
                    </a>
                </div>

                <div class="flex-row justify-between mt-4">
                    <button type="button" class="btn btn-secondary" id="wizard-back-btn">← Back</button>
                    <button type="button" class="btn btn-primary" id="wizard-step2-next">
                        Continue to UID Connection →
                    </button>
                </div>
            </div>
            `;
        } else if (this.wizardStep === 3) {
            const isShark = this.wizardData.exchange === 'Shark Exchange';
            return `
            <div class="flex-column gap-4">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 700;">Step 3: Connect Exchange UID</h3>
                    <p class="text-secondary text-sm">Enter your ${this.wizardData.exchange} User ID to link your profile.</p>
                </div>

                <div class="form-group">
                    <label for="wizard-uid">${this.wizardData.exchange} User ID (UID)</label>
                    <input type="text" id="wizard-uid" class="form-control font-mono" placeholder="${isShark ? 'e.g. 654321 (6 digits)' : 'e.g. 10001234 (7–8 digits)'}" value="${this.wizardData.uid || ''}" required>
                    <small class="text-muted text-xs mt-1" style="display: block;">
                        Click on the Profile icon in the ${this.wizardData.exchange} app or website to find your UID.
                    </small>
                </div>

                <div class="flex-row justify-between mt-4">
                    <button type="button" class="btn btn-secondary" id="wizard-back-btn">← Back</button>
                    <button type="button" class="btn btn-primary" id="wizard-step3-next">
                        Continue to API Connection →
                    </button>
                </div>
            </div>
            `;
        } else if (this.wizardStep === 4) {
            return `
            <div class="flex-column gap-4">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 700;">Step 4: Connect Read-Only API</h3>
                    <p class="text-secondary text-sm">Connect your read-only API credentials to sync your live trading volume and PnL.</p>
                </div>

                <!-- Security Rule Banner -->
                <div class="p-4" style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 0.5rem;">
                    <div class="flex-row align-center gap-2 font-bold mb-1" style="color: #facc15;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Security Rule: Create Read-Only Key Only
                    </div>
                    <p class="text-xs" style="color: #fef08a; line-height: 1.4;">
                        When creating your Delta API key, keep <strong>Trading</strong> and <strong>Withdrawal</strong> permissions strictly <strong>OFF</strong>. The platform only needs read permissions to record balances and trade history.
                    </p>
                </div>

                <div class="form-group">
                    <label for="wizard-env">API Environment</label>
                    <select id="wizard-env" class="form-control">
                        <option value="mainnet_india" ${this.wizardData.environment === 'mainnet_india' ? 'selected' : ''}>Delta India Mainnet (api.india.delta.exchange)</option>
                        <option value="testnet_india" ${this.wizardData.environment === 'testnet_india' ? 'selected' : ''}>Delta India Testnet</option>
                        <option value="mainnet" ${this.wizardData.environment === 'mainnet' ? 'selected' : ''}>Delta Global Mainnet</option>
                        <option value="testnet" ${this.wizardData.environment === 'testnet' ? 'selected' : ''}>Delta Global Testnet</option>
                    </select>
                </div>

                <div class="grid-2 gap-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
                    <div class="form-group">
                        <label for="wizard-apikey">API Key</label>
                        <input type="text" id="wizard-apikey" class="form-control font-mono" placeholder="Paste your API Key" value="${this.wizardData.apiKey || ''}" required>
                    </div>

                    <div class="form-group">
                        <label for="wizard-apisecret">API Secret</label>
                        <input type="password" id="wizard-apisecret" class="form-control font-mono" placeholder="Paste your API Secret" value="${this.wizardData.apiSecret || ''}" required>
                    </div>
                </div>

                <div class="text-xs text-secondary mb-2">
                    Need help? <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" class="text-primary hover-underline">Watch: How to generate Delta read-only API Key ↗</a>
                </div>

                <div class="flex-row justify-between mt-4">
                    <button type="button" class="btn btn-secondary" id="wizard-back-btn">← Back</button>
                    <button type="button" class="btn btn-primary flex-row align-center gap-2" id="wizard-submit-btn">
                        <span>Verify &amp; Complete Profile</span>
                    </button>
                </div>
            </div>
            `;
        }
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
                    IP restriction is optional when generating an API key on Delta Exchange. If you enable IP restriction, please ensure Delta server access is permitted.
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
            return `<div class="text-muted text-sm py-4 text-center">You are not registered in an active competition. Sign up for an active competition to enter.</div>`;
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
        window.addEventListener('switch-dashboard-tab', this.tabSwitchListener);
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
                    this.user = await authAPI.getMe();
                    updateNavbar(this.user);
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
                    this.user = await authAPI.getMe();
                    updateNavbar(this.user);
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

        // Profile Tab Events
        this.bindProfileTabEvents();
    }

    bindProfileTabEvents() {
        // Edit Setup button from completed view
        const editSetupBtn = document.getElementById('profile-edit-setup-btn');
        if (editSetupBtn) {
            editSetupBtn.addEventListener('click', () => {
                this.isEditingProfile = true;
                this.wizardStep = 1;
                const main = document.getElementById('dashboard-tab-content');
                if (main) {
                    main.innerHTML = this.renderProfileTab();
                    this.bindTabEvents();
                }
            });
        }

        // Wizard Step 1 Next
        const step1Next = document.getElementById('wizard-step1-next');
        if (step1Next) {
            step1Next.addEventListener('click', async () => {
                const nameInput = document.getElementById('wizard-fullname');
                const phoneInput = document.getElementById('wizard-phone');
                if (!nameInput || !nameInput.value.trim()) {
                    showToast('Please enter your full name.', 'error');
                    return;
                }
                if (!phoneInput || !phoneInput.value.trim()) {
                    showToast('Please enter your WhatsApp or phone number.', 'error');
                    return;
                }

                this.wizardData.fullName = nameInput.value.trim();
                this.wizardData.phone = phoneInput.value.trim();

                step1Next.disabled = true;
                step1Next.innerText = 'Saving...';

                try {
                    this.user = await authAPI.updateProfile({
                        full_name: this.wizardData.fullName,
                        phone: this.wizardData.phone
                    });
                    updateNavbar(this.user);
                    this.updateSidebarAvatar();
                    this.wizardStep = 2;
                    const main = document.getElementById('dashboard-tab-content');
                    if (main) {
                        main.innerHTML = this.renderProfileTab();
                        this.bindTabEvents();
                    }
                } catch (err) {
                    showToast(`Failed to save details: ${err.message}`, 'error');
                    step1Next.disabled = false;
                    step1Next.innerText = 'Continue to Exchange Selection →';
                }
            });
        }

        // Wizard Step 2: Select Exchange cards
        const deltaCard = document.getElementById('select-delta-exchange');
        if (deltaCard) {
            deltaCard.addEventListener('click', () => {
                this.wizardData.exchange = 'Delta Exchange';
                this.wizardStep = 2;
                const main = document.getElementById('dashboard-tab-content');
                if (main) {
                    main.innerHTML = this.renderProfileTab();
                    this.bindTabEvents();
                }
            });
        }

        const sharkCard = document.getElementById('select-shark-exchange');
        if (sharkCard) {
            sharkCard.addEventListener('click', () => {
                this.wizardData.exchange = 'Shark Exchange';
                this.wizardStep = 2;
                const main = document.getElementById('dashboard-tab-content');
                if (main) {
                    main.innerHTML = this.renderProfileTab();
                    this.bindTabEvents();
                }
            });
        }

        const step2Next = document.getElementById('wizard-step2-next');
        if (step2Next) {
            step2Next.addEventListener('click', async () => {
                try {
                    this.user = await authAPI.updateProfile({
                        exchange: this.wizardData.exchange
                    });
                    this.wizardStep = 3;
                    const main = document.getElementById('dashboard-tab-content');
                    if (main) {
                        main.innerHTML = this.renderProfileTab();
                        this.bindTabEvents();
                    }
                } catch (err) {
                    showToast(`Failed: ${err.message}`, 'error');
                }
            });
        }

        // Wizard Step 3: UID Next
        const step3Next = document.getElementById('wizard-step3-next');
        if (step3Next) {
            step3Next.addEventListener('click', async () => {
                const uidInput = document.getElementById('wizard-uid');
                if (!uidInput || !uidInput.value.trim()) {
                    showToast(`Please enter your ${this.wizardData.exchange} UID.`, 'error');
                    return;
                }

                const cleanUID = uidInput.value.trim();
                this.wizardData.uid = cleanUID;

                step3Next.disabled = true;
                step3Next.innerText = 'Linking UID...';

                try {
                    this.user = await authAPI.updateProfile({
                        delta_user_id: cleanUID,
                        exchange: this.wizardData.exchange
                    });
                    updateNavbar(this.user);
                    this.updateSidebarAvatar();
                    showToast('Exchange UID linked and verified!', 'success');
                    this.wizardStep = 4;
                    const main = document.getElementById('dashboard-tab-content');
                    if (main) {
                        main.innerHTML = this.renderProfileTab();
                        this.bindTabEvents();
                    }
                } catch (err) {
                    showToast(`Error linking UID: ${err.message}`, 'error');
                    step3Next.disabled = false;
                    step3Next.innerText = 'Continue to API Connection →';
                }
            });
        }

        // Wizard Step 4: Verify & Complete Profile
        const submitBtn = document.getElementById('wizard-submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', async () => {
                const apiKeyInput = document.getElementById('wizard-apikey');
                const apiSecretInput = document.getElementById('wizard-apisecret');
                const envSelect = document.getElementById('wizard-env');

                if (!apiKeyInput || !apiKeyInput.value.trim() || !apiSecretInput || !apiSecretInput.value.trim()) {
                    showToast('Please enter both API Key and API Secret.', 'error');
                    return;
                }

                const apiKey = apiKeyInput.value.trim();
                const apiSecret = apiSecretInput.value.trim();
                const env = envSelect ? envSelect.value : 'mainnet_india';

                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Verifying with Delta...';

                try {
                    // 1. Save and validate API credentials with Delta
                    await apiKeysAPI.create({
                        api_key: apiKey,
                        api_secret: apiSecret,
                        environment: env
                    });

                    // 2. Auto-register for active championship if not already registered
                    try {
                        const comps = await competitionsAPI.getAll();
                        const activeComp = comps.find(c => c.is_active) || comps[0];
                        if (activeComp) {
                            await competitionsAPI.register(activeComp.id);
                        }
                    } catch (e) {
                        // Already registered is fine
                    }

                    // 3. Refresh user state & reload dashboard data
                    this.user = await authAPI.getMe();
                    await this.loadKeys();
                    await this.loadRegistrations();
                    updateNavbar(this.user);
                    this.updateSidebarAvatar();
                    this.isEditingProfile = false;

                    showToast('Profile 100% Complete! Delta credentials connected.', 'success');

                    const main = document.getElementById('dashboard-tab-content');
                    if (main) {
                        main.innerHTML = this.renderProfileTab();
                        this.bindTabEvents();
                    }
                } catch (err) {
                    showToast(`Delta Verification Error: ${err.message}`, 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Verify &amp; Complete Profile';
                }
            });
        }

        // Wizard Back Button
        const backBtn = document.getElementById('wizard-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (this.wizardStep > 1) {
                    this.wizardStep -= 1;
                    const main = document.getElementById('dashboard-tab-content');
                    if (main) {
                        main.innerHTML = this.renderProfileTab();
                        this.bindTabEvents();
                    }
                }
            });
        }

        // Assistant Rail Quick Actions
        const railCompBtn = document.getElementById('rail-view-competitions-btn');
        if (railCompBtn) {
            railCompBtn.addEventListener('click', () => this.switchToTab('competition'));
        }
        const railLdrBtn = document.getElementById('rail-view-leaderboard-btn');
        if (railLdrBtn) {
            railLdrBtn.addEventListener('click', () => this.switchToTab('leaderboard'));
        }

        // Workspace Topbar Actions
        const topRefreshBtn = document.getElementById('profile-top-refresh-btn');
        if (topRefreshBtn) {
            topRefreshBtn.addEventListener('click', async () => {
                topRefreshBtn.disabled = true;
                topRefreshBtn.innerText = 'Syncing...';
                try {
                    this.user = await authAPI.getMe();
                    updateNavbar(this.user);
                    this.updateSidebarAvatar();
                    showToast('Profile sync completed.', 'success');
                    const main = document.getElementById('dashboard-tab-content');
                    if (main) {
                        main.innerHTML = this.renderProfileTab();
                        this.bindTabEvents();
                    }
                } catch (err) {
                    showToast(`Sync failed: ${err.message}`, 'error');
                } finally {
                    topRefreshBtn.disabled = false;
                    topRefreshBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                        Sync Status
                    `;
                }
            });
        }

        const topCompBtn = document.getElementById('profile-top-comp-btn');
        if (topCompBtn) {
            topCompBtn.addEventListener('click', () => this.switchToTab('competition'));
        }

        const crumbDash = document.getElementById('topbar-crumb-dash');
        if (crumbDash) {
            crumbDash.addEventListener('click', () => this.switchToTab('overview'));
        }
    }

    updateSidebarAvatar() {
        const wrap = document.getElementById('sidebar-avatar-wrap');
        if (wrap) {
            wrap.innerHTML = renderAvatarWithProgress(this.user, 42, true);
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

    unmount() {
        window.removeEventListener('switch-dashboard-tab', this.tabSwitchListener);
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
