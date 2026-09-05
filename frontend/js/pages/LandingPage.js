// Landing Page Component
import { competitionsAPI } from '../api.js';
import { openAuthModal } from '../components/AuthModal.js';

export class LandingPage {
    constructor() {
        this.container = null;
        this.competitions = [];
    }

    render() {
        return `
        <div id="landing-view" class="view-section">
            <!-- Hero Section -->
            <section class="hero-section relative text-center">
                <div class="background-grid"></div>
                <div class="glow-orb"></div>
                <div class="container py-20 flex-column align-center">
                    <div class="badge-accent mb-4">🏆 Registration open · 2026 Season</div>
                    <h1 class="hero-title">MWM Trading Championship 2026</h1>
                    <p class="hero-subtitle text-gradient">Compete. Trade. Win.</p>
                    <p class="hero-description max-w-xl">
                        Trade on Delta Exchange. Climb the verified leaderboard. Win across weekly, monthly and grand rewards over a 60-day window.
                    </p>
                    <div class="hero-actions flex-row gap-4 mt-8">
                        <button class="btn btn-primary btn-lg flex-row align-center gap-2" id="hero-join-btn">
                            Join Championship
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                        </button>
                        <a href="#leaderboard-section" class="btn btn-secondary btn-lg">View Leaderboard</a>
                    </div>
                </div>
            </section>

            <!-- Stats Grid -->
            <section class="stats-section py-10 border-top">
                <div class="container grid-4 gap-6">
                    <div class="stat-card glass text-center">
                        <div class="icon-wrapper mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                        </div>
                        <div class="stat-value">₹5,00,000</div>
                        <div class="stat-label">Prize Pool</div>
                    </div>
                    <div class="stat-card glass text-center">
                        <div class="icon-wrapper mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path></svg>
                        </div>
                        <div class="stat-value">60 Days</div>
                        <div class="stat-label">Competition Period</div>
                    </div>
                    <div class="stat-card glass text-center">
                        <div class="icon-wrapper mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div class="stat-value">4 Levels</div>
                        <div class="stat-label">Competition Tiers</div>
                    </div>
                    <div class="stat-card glass text-center">
                        <div class="icon-wrapper mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
                        </div>
                        <div class="stat-value">Weekly + Monthly</div>
                        <div class="stat-label">Reward Standings</div>
                    </div>
                </div>
            </section>

            <!-- How It Works -->
            <section id="how" class="how-section py-20 border-top">
                <div class="container">
                    <div class="section-header text-center mb-12">
                        <p class="section-tag">The Path</p>
                        <h2 class="section-title">How it works</h2>
                        <p class="section-description">Six simple steps from sign-up to your first reward.</p>
                    </div>
                    <div class="grid-3 gap-6">
                        <div class="step-card glass flex-row gap-4 p-6">
                            <span class="step-num">1</span>
                            <div>
                                <h3 class="step-title">Register</h3>
                                <p class="step-desc">Create your free MWM account securely in under a minute.</p>
                            </div>
                        </div>
                        <div class="step-card glass flex-row gap-4 p-6">
                            <span class="step-num">2</span>
                            <div>
                                <h3 class="step-title">Setup Profile</h3>
                                <p class="step-desc">Provide your full name and update your account details.</p>
                            </div>
                        </div>
                        <div class="step-card glass flex-row gap-4 p-6">
                            <span class="step-num">3</span>
                            <div>
                                <h3 class="step-title">Add Delta API Key</h3>
                                <p class="step-desc">Register your API credentials so we can securely pull your data.</p>
                            </div>
                        </div>
                        <div class="step-card glass flex-row gap-4 p-6">
                            <span class="step-num">4</span>
                            <div>
                                <h3 class="step-title">Join Competition</h3>
                                <p class="step-desc">Register for the active championship to lock in your starting balance.</p>
                            </div>
                        </div>
                        <div class="step-card glass flex-row gap-4 p-6">
                            <span class="step-num">5</span>
                            <div>
                                <h3 class="step-title">Trade & Compete</h3>
                                <p class="step-desc">Trade on Delta Exchange (Testnet or Mainnet) during the active window.</p>
                            </div>
                        </div>
                        <div class="step-card glass flex-row gap-4 p-6">
                            <span class="step-num">6</span>
                            <div>
                                <h3 class="step-title">Win Prizes</h3>
                                <p class="step-desc">Top standings across ROI brackets to claim weekly and grand rewards.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Prizes Section -->
            <section id="prizes" class="prizes-section py-20 border-top">
                <div class="container">
                    <div class="section-header text-center mb-12">
                        <p class="section-tag">Rewards Pool</p>
                        <h2 class="section-title">Prizes &amp; Rewards</h2>
                        <p class="section-description">Total prize pool of ₹5,00,000 across multiple reward categories.</p>
                    </div>
                    <div class="grid-3 gap-6">
                        <div class="prize-card glass text-center p-8">
                            <div class="prize-badge mb-4">Weekly Sprint</div>
                            <div class="prize-amount text-gradient">₹50,000</div>
                            <div class="prize-frequency text-muted mb-4">Every Sunday</div>
                            <ul class="prize-breakdown flex-column gap-2 text-left">
                                <li class="flex-row justify-between"><span>1st Place</span><strong class="text-primary">₹25,000</strong></li>
                                <li class="flex-row justify-between"><span>2nd Place</span><strong>₹15,000</strong></li>
                                <li class="flex-row justify-between"><span>3rd Place</span><strong>₹10,000</strong></li>
                            </ul>
                        </div>
                        <div class="prize-card glass highlight text-center p-8">
                            <div class="prize-badge gold mb-4">Grand Championship</div>
                            <div class="prize-amount text-gradient">₹3,00,000</div>
                            <div class="prize-frequency text-muted mb-4">End of Season</div>
                            <ul class="prize-breakdown flex-column gap-2 text-left">
                                <li class="flex-row justify-between"><span>Champion</span><strong class="text-primary">₹1,50,000</strong></li>
                                <li class="flex-row justify-between"><span>Runner-up</span><strong>₹1,00,000</strong></li>
                                <li class="flex-row justify-between"><span>3rd Place</span><strong>₹50,000</strong></li>
                            </ul>
                        </div>
                        <div class="prize-card glass text-center p-8">
                            <div class="prize-badge mb-4">Tier Milestone</div>
                            <div class="prize-amount text-gradient">₹1,50,000</div>
                            <div class="prize-frequency text-muted mb-4">Across Tiers</div>
                            <ul class="prize-breakdown flex-column gap-2 text-left">
                                <li class="flex-row justify-between"><span>Diamond Tier</span><strong class="text-primary">₹75,000</strong></li>
                                <li class="flex-row justify-between"><span>Platinum Tier</span><strong>₹45,000</strong></li>
                                <li class="flex-row justify-between"><span>Gold Tier</span><strong>₹30,000</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Tiers Section -->
            <section id="tiers" class="tiers-section py-20 border-top">
                <div class="container">
                    <div class="section-header text-center mb-12">
                        <p class="section-tag">Tier Progression</p>
                        <h2 class="section-title">Competition Tiers</h2>
                        <p class="section-description">Earn tier badges based on capital size and performance.</p>
                    </div>
                    <div class="grid-4 gap-6">
                        <div class="tier-card glass p-6 text-center">
                            <div class="tier-icon mb-3">🥉</div>
                            <h3 class="tier-name">Silver</h3>
                            <p class="tier-req text-muted text-sm mb-4">Starting balance: ₹1,000+</p>
                            <p class="tier-perk text-xs">Standard weekly sprint access &amp; public rank tracking.</p>
                        </div>
                        <div class="tier-card glass p-6 text-center">
                            <div class="tier-icon mb-3">🥈</div>
                            <h3 class="tier-name">Gold</h3>
                            <p class="tier-req text-muted text-sm mb-4">Starting balance: ₹10,000+</p>
                            <p class="tier-perk text-xs">Gold prize pool pool-in &amp; performance certificate.</p>
                        </div>
                        <div class="tier-card glass p-6 text-center">
                            <div class="tier-icon mb-3">🥇</div>
                            <h3 class="tier-name">Platinum</h3>
                            <p class="tier-req text-muted text-sm mb-4">Starting balance: ₹50,000+</p>
                            <p class="tier-perk text-xs">Platinum prize pool pool-in &amp; VIP Telegram access.</p>
                        </div>
                        <div class="tier-card glass p-6 text-center highlight">
                            <div class="tier-icon mb-3">💎</div>
                            <h3 class="tier-name">Diamond</h3>
                            <p class="tier-req text-muted text-sm mb-4">Starting balance: ₹1,00,000+</p>
                            <p class="tier-perk text-xs">Exclusive grand pool multiplier &amp; physical trophy.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Leaderboard Section -->
            <section id="leaderboard-section" class="leaderboard-section py-20 border-top">
                <div class="container">
                    <div class="section-header text-center mb-8">
                        <p class="section-tag">Real-Time Delta Sync</p>
                        <h2 class="section-title">Championship Leaderboard</h2>
                        <p class="section-description">Rankings calculated strictly by ROI % over active competition periods.</p>
                    </div>

                    <!-- Competition Selector -->
                    <div class="flex-row justify-center mb-8">
                        <div class="form-group" style="max-width: 400px; width: 100%;">
                            <select id="leaderboard-comp-select" class="form-control" style="background: rgba(0,0,0,0.5); border-color: var(--primary);">
                                <option value="">-- Loading Active Competitions... --</option>
                            </select>
                        </div>
                    </div>

                    <!-- Leaderboard Table Container -->
                    <div class="table-wrapper glass">
                        <table class="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Trader</th>
                                    <th class="text-right">ROI (%)</th>
                                    <th class="text-right">PnL (USD)</th>
                                    <th class="text-right">Volume</th>
                                    <th class="text-right">Last Updated</th>
                                </tr>
                            </thead>
                            <tbody id="leaderboard-tbody">
                                <tr>
                                    <td colspan="6" class="text-center py-8 text-muted">Select an active competition to load standings.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
        `;
    }

    async mount(container) {
        this.container = container;
        this.container.innerHTML = this.render();

        // Bind hero join CTA
        const heroJoinBtn = document.getElementById('hero-join-btn');
        if (heroJoinBtn) {
            heroJoinBtn.addEventListener('click', () => openAuthModal('register'));
        }

        // Bind competition selector
        const compSelect = document.getElementById('leaderboard-comp-select');
        if (compSelect) {
            compSelect.addEventListener('change', (e) => {
                const compId = e.target.value;
                if (compId) {
                    this.loadLeaderboard(compId);
                } else {
                    this.clearLeaderboard();
                }
            });
        }

        // Fetch competitions
        await this.loadPublicCompetitions();
    }

    async loadPublicCompetitions() {
        try {
            const comps = await competitionsAPI.getAll();
            this.competitions = comps;

            const compSelect = document.getElementById('leaderboard-comp-select');
            if (!compSelect) return;

            compSelect.innerHTML = '<option value="">-- Select Active Competition --</option>';

            const activeComps = comps.filter(c => c.is_active);
            activeComps.forEach(comp => {
                const opt = document.createElement('option');
                opt.value = comp.id;
                opt.textContent = `${comp.title} (Active)`;
                compSelect.appendChild(opt);
            });

            // Auto-select first active competition
            if (activeComps.length > 0) {
                compSelect.value = activeComps[0].id;
                await this.loadLeaderboard(activeComps[0].id);
            }
        } catch (err) {
            console.error('Failed to load public competitions:', err);
        }
    }

    async loadLeaderboard(compId) {
        const tbody = document.getElementById('leaderboard-tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-muted">Loading standings...</td></tr>';

        try {
            const leaderboard = await competitionsAPI.getLeaderboard(compId);

            if (!leaderboard.entries || leaderboard.entries.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-muted">No participants registered in this competition yet.</td></tr>';
                return;
            }

            tbody.innerHTML = '';
            leaderboard.entries.forEach(entry => {
                const row = document.createElement('tr');

                let rankHtml = `<span class="rank-badge">${entry.rank}</span>`;
                if (entry.rank === 1) rankHtml = `<span class="rank-badge rank-1">1</span>`;
                else if (entry.rank === 2) rankHtml = `<span class="rank-badge rank-2">2</span>`;
                else if (entry.rank === 3) rankHtml = `<span class="rank-badge rank-3">3</span>`;

                const roiClass = entry.roi_percentage >= 0 ? 'roi-positive' : 'roi-negative';
                const roiPrefix = entry.roi_percentage >= 0 ? '+' : '';
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
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-destructive">Failed to load leaderboard data.</td></tr>';
            }
        }
    }

    clearLeaderboard() {
        const tbody = document.getElementById('leaderboard-tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-muted">Select a competition above to load the leaderboard.</td></tr>';
        }
    }

    unmount() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
