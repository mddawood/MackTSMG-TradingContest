// Standalone Full Leaderboard Page Component
import { competitionsAPI } from '../api.js';

export class LeaderboardPage {
    constructor() {
        this.container = null;
        this.competitions = [];
        this.selectedCompId = null;
        this.currentTier = 'Trader';
        this.currentPeriod = 'Grand';
        this.searchQuery = '';
        this.entries = [];
        this.loading = false;
    }

    render() {
        return `
        <div id="leaderboard-page-view" class="view-section py-12">
            <div class="container">
                <!-- Page Header -->
                <div class="mb-8">
                    <h1 class="hero-title" style="font-size: 2.25rem; margin-bottom: 0.5rem;">Championship Leaderboard</h1>
                    <p class="text-secondary" style="font-size: 1rem;">
                        Verified ROI across Rookie, Trader, Pro and Whale tiers. Filter by weekly, monthly or grand standings.
                    </p>
                </div>

                <!-- Filters Bar -->
                <div class="flex-row justify-between align-center flex-wrap gap-4 mb-6">
                    <!-- Tier Filter Tabs -->
                    <div class="tab-group" id="leaderboard-tier-tabs">
                        <button class="tab-btn ${this.currentTier === 'All' ? 'active' : ''}" data-tier="All">All</button>
                        <button class="tab-btn ${this.currentTier === 'Rookie' ? 'active' : ''}" data-tier="Rookie">Rookie</button>
                        <button class="tab-btn ${this.currentTier === 'Trader' ? 'active' : ''}" data-tier="Trader">Trader</button>
                        <button class="tab-btn ${this.currentTier === 'Pro' ? 'active' : ''}" data-tier="Pro">Pro</button>
                        <button class="tab-btn ${this.currentTier === 'Whale' ? 'active' : ''}" data-tier="Whale">Whale</button>
                    </div>

                    <div class="flex-row align-center flex-wrap gap-3" style="width: 100%; max-width: 600px;">
                        <!-- Search Filter -->
                        <div class="form-group" style="margin: 0; flex: 1; min-width: 180px;">
                            <input type="text" id="leaderboard-search-input" class="form-control" placeholder="Search trader..." value="${this.searchQuery}" style="padding: 0.45rem 0.85rem; font-size: 0.875rem;">
                        </div>

                        <!-- Period Tabs -->
                        <div class="tab-group" id="leaderboard-period-tabs">
                            <button class="tab-btn ${this.currentPeriod === 'Weekly' ? 'active' : ''}" data-period="Weekly">Weekly</button>
                            <button class="tab-btn ${this.currentPeriod === 'Monthly' ? 'active' : ''}" data-period="Monthly">Monthly</button>
                            <button class="tab-btn ${this.currentPeriod === 'Grand' ? 'active' : ''}" data-period="Grand">Grand</button>
                        </div>

                        <!-- Refresh Button -->
                        <button class="btn btn-secondary flex-row align-center gap-2" id="leaderboard-refresh-btn" style="padding: 0.45rem 0.75rem;" title="Refresh Standings">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                        </button>
                    </div>
                </div>

                <!-- Leaderboard Table Card -->
                <div class="table-wrapper glass" style="border-radius: 0.75rem; border: 1px solid var(--border-color);">
                    <table class="leaderboard-table" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border-color); background: rgba(255, 255, 255, 0.02);">
                                <th style="width: 80px; padding: 0.85rem 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Rank</th>
                                <th style="padding: 0.85rem 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Trader</th>
                                <th style="padding: 0.85rem 1rem; text-align: right; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">ROI</th>
                                <th style="padding: 0.85rem 1rem; text-align: right; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">PnL (₹)</th>
                                <th style="padding: 0.85rem 1rem; text-align: right; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Trades</th>
                                <th style="padding: 0.85rem 1rem; text-align: right; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Volume (₹)</th>
                                <th style="padding: 0.85rem 1rem; text-align: right; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Status</th>
                            </tr>
                        </thead>
                        <tbody id="leaderboard-full-tbody">
                            ${this.renderLoadingRow()}
                        </tbody>
                    </table>
                </div>

                <!-- Footer Note -->
                <div class="mt-4 flex-row justify-between align-center text-muted" style="font-size: 0.8rem;">
                    <span>Updated via Delta Exchange read-only API snapshots</span>
                    <span>Tiers automatically assigned by starting capital size</span>
                </div>
            </div>
        </div>
        `;
    }

    renderLoadingRow() {
        return `
        <tr>
            <td colspan="7" class="text-center py-12 text-muted">
                <div class="flex-column align-center justify-center gap-3">
                    <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary); animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    <span>Fetching verified Delta standings...</span>
                </div>
            </td>
        </tr>
        `;
    }

    async mount(container) {
        this.container = container;
        this.container.innerHTML = this.render();
        this.bindEvents();

        // Load active competition
        await this.loadInitialData();
    }

    bindEvents() {
        // Tier Tabs
        const tierTabs = document.getElementById('leaderboard-tier-tabs');
        if (tierTabs) {
            tierTabs.addEventListener('click', (e) => {
                const btn = e.target.closest('.tab-btn');
                if (!btn) return;
                tierTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTier = btn.dataset.tier;
                this.loadLeaderboard();
            });
        }

        // Period Tabs
        const periodTabs = document.getElementById('leaderboard-period-tabs');
        if (periodTabs) {
            periodTabs.addEventListener('click', (e) => {
                const btn = e.target.closest('.tab-btn');
                if (!btn) return;
                periodTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentPeriod = btn.dataset.period;
                this.loadLeaderboard();
            });
        }

        // Search Input
        const searchInput = document.getElementById('leaderboard-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.renderEntriesTable();
            });
        }

        // Refresh Button
        const refreshBtn = document.getElementById('leaderboard-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadLeaderboard();
            });
        }
    }

    async loadInitialData() {
        try {
            const comps = await competitionsAPI.getAll();
            this.competitions = comps;
            const activeComp = comps.find(c => c.is_active) || comps[0];
            if (activeComp) {
                this.selectedCompId = activeComp.id;
                await this.loadLeaderboard();
            }
        } catch (err) {
            console.error('Failed to load competitions for leaderboard:', err);
        }
    }

    async loadLeaderboard() {
        if (!this.selectedCompId) return;
        const tbody = document.getElementById('leaderboard-full-tbody');
        if (tbody) tbody.innerHTML = this.renderLoadingRow();

        try {
            const data = await competitionsAPI.getLeaderboard(this.selectedCompId, {
                tier: this.currentTier,
                period: this.currentPeriod
            });
            this.entries = data.entries || [];
            this.renderEntriesTable();
        } catch (err) {
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-destructive">Failed to load standings: ${err.message}</td></tr>`;
            }
        }
    }

    renderEntriesTable() {
        const tbody = document.getElementById('leaderboard-full-tbody');
        if (!tbody) return;

        let filtered = this.entries;
        if (this.searchQuery) {
            filtered = filtered.filter(item => item.full_name.toLowerCase().includes(this.searchQuery));
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-10 text-muted">
                    No verified traders found for the selected tier and criteria.
                </td>
            </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map((entry, index) => {
            const rank = entry.rank || (index + 1);
            const initials = entry.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const roiFormatted = (entry.roi_percentage >= 0 ? '+' : '') + entry.roi_percentage.toFixed(2) + '%';
            const roiClass = entry.roi_percentage >= 0 ? 'text-accent' : 'text-destructive';
            const volumeINR = '₹' + Math.round(entry.trading_volume).toLocaleString('en-IN');
            const pnlINR = '₹' + Math.round(entry.absolute_pnl).toLocaleString('en-IN');
            const tierLower = (entry.tier || 'trader').toLowerCase();

            // Rank Badge or Trophy
            let rankHtml = '';
            if (rank === 1) {
                rankHtml = `
                <div class="flex-row align-center gap-2">
                    <span class="avatar-circle rank-trophy-1" style="width: 1.75rem; height: 1.75rem;">🏆</span>
                    ${this.renderRankChange(entry.rank_change)}
                </div>`;
            } else if (rank === 2) {
                rankHtml = `
                <div class="flex-row align-center gap-2">
                    <span class="avatar-circle rank-trophy-2" style="width: 1.75rem; height: 1.75rem;">🥈</span>
                    ${this.renderRankChange(entry.rank_change)}
                </div>`;
            } else if (rank === 3) {
                rankHtml = `
                <div class="flex-row align-center gap-2">
                    <span class="avatar-circle rank-trophy-3" style="width: 1.75rem; height: 1.75rem;">🥉</span>
                    ${this.renderRankChange(entry.rank_change)}
                </div>`;
            } else {
                rankHtml = `
                <div class="flex-row align-center gap-2">
                    <span class="font-mono text-muted" style="width: 1.75rem; text-align: center; font-weight: 700;">${rank}</span>
                    ${this.renderRankChange(entry.rank_change)}
                </div>`;
            }

            return `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); transition: background 0.15s ease;">
                <td style="padding: 0.85rem 1rem;">${rankHtml}</td>
                <td style="padding: 0.85rem 1rem;">
                    <div class="flex-row align-center gap-3">
                        <span class="avatar-circle">${initials}</span>
                        <div class="flex-column">
                            <span style="font-weight: 600;">${entry.full_name}</span>
                            <span class="tier-badge tier-${tierLower}" style="width: fit-content; margin-top: 0.2rem; font-size: 0.65rem; padding: 0.1rem 0.45rem;">${entry.tier || 'Trader'}</span>
                        </div>
                    </div>
                </td>
                <td style="padding: 0.85rem 1rem; text-align: right;" class="font-mono ${roiClass}" style="font-weight: 700;">${roiFormatted}</td>
                <td style="padding: 0.85rem 1rem; text-align: right;" class="font-mono text-secondary">${pnlINR}</td>
                <td style="padding: 0.85rem 1rem; text-align: right;" class="font-mono text-secondary">${entry.trade_count || '—'}</td>
                <td style="padding: 0.85rem 1rem; text-align: right;" class="font-mono text-secondary">${volumeINR}</td>
                <td style="padding: 0.85rem 1rem; text-align: right;">
                    <span class="verified-tag">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Verified
                    </span>
                </td>
            </tr>
            `;
        }).join('');
    }

    renderRankChange(change) {
        if (!change || change === 0) {
            return `<span class="rank-indicator rank-same" title="No rank change">—</span>`;
        } else if (change > 0) {
            return `<span class="rank-indicator rank-up" title="Rose ${change} spots">▲${change}</span>`;
        } else {
            return `<span class="rank-indicator rank-down" title="Fell ${Math.abs(change)} spots">▼${Math.abs(change)}</span>`;
        }
    }
}
