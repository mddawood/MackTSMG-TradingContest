// Landing Page Component matching Netlify prototype and Google Doc specifications
import { competitionsAPI } from '../api.js';
import { router } from '../router.js';

export class LandingPage {
    constructor() {
        this.container = null;
        this.competitions = [];
        this.activeCompId = null;
        this.previewTier = 'Trader';
        this.entries = [];
    }

    render() {
        return `
        <div id="landing-view" class="view-section">
            <!-- Hero Section -->
            <section class="hero-section relative text-center py-20">
                <div class="grid-pattern absolute inset-0 opacity-30"></div>
                <div class="glow-orb"></div>
                
                <div class="container py-12 flex-column align-center relative" style="z-index: 10;">
                    <div class="badge-accent mb-4">🏆 Registration open · 2026 Season</div>
                    <h1 class="hero-title" style="font-size: 3rem; font-weight: 800; line-height: 1.15; max-width: 900px;">
                        MWM Trading Championship 2026
                    </h1>
                    <p class="hero-subtitle text-gradient" style="font-size: 1.75rem; margin-top: 0.5rem;">
                        Compete. Trade. Win.
                    </p>
                    <p class="hero-description max-w-xl text-secondary" style="font-size: 1.1rem; margin-top: 1rem; line-height: 1.6;">
                        Trade on Delta Exchange. Climb a verified leaderboard. Win across weekly, monthly and grand rewards over 60 days.
                    </p>
                    
                    <div class="hero-actions flex-row gap-4 mt-8 flex-wrap justify-center">
                        <a href="/join" class="btn btn-primary btn-lg flex-row align-center gap-2" data-link>
                            Join Championship
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                        </a>
                        <a href="/leaderboard" class="btn btn-secondary btn-lg" data-link>View Leaderboard</a>
                    </div>
                </div>
            </section>

            <!-- Key Stats Grid -->
            <section class="stats-section py-10 border-top" style="border-color: rgba(255, 255, 255, 0.08);">
                <div class="container grid-4 gap-6" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
                    <div class="stat-card glass text-center p-6">
                        <div class="icon-wrapper mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                        </div>
                        <div class="stat-value text-gradient" style="font-size: 1.85rem; font-weight: 800;">₹5,00,000</div>
                        <div class="stat-label text-muted text-xs text-uppercase mt-1">Prize Pool</div>
                    </div>

                    <div class="stat-card glass text-center p-6">
                        <div class="icon-wrapper mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path></svg>
                        </div>
                        <div class="stat-value text-gradient" style="font-size: 1.85rem; font-weight: 800;">60 Days</div>
                        <div class="stat-label text-muted text-xs text-uppercase mt-1">Duration</div>
                    </div>

                    <div class="stat-card glass text-center p-6">
                        <div class="icon-wrapper mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div class="stat-value text-gradient" style="font-size: 1.85rem; font-weight: 800;">4 Tiers</div>
                        <div class="stat-label text-muted text-xs text-uppercase mt-1">Capital Brackets</div>
                    </div>

                    <div class="stat-card glass text-center p-6">
                        <div class="icon-wrapper mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
                        </div>
                        <div class="stat-value text-gradient" style="font-size: 1.85rem; font-weight: 800;">Delta Sync</div>
                        <div class="stat-label text-muted text-xs text-uppercase mt-1">Verified Real-Time</div>
                    </div>
                </div>
            </section>

            <!-- How It Works Section -->
            <section id="how" class="how-section py-20 border-top" style="border-color: rgba(255, 255, 255, 0.08);">
                <div class="container">
                    <div class="section-header text-center mb-12">
                        <p class="section-tag text-primary" style="font-weight: 600; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em;">The Path</p>
                        <h2 class="section-title" style="font-size: 2.25rem; font-weight: 700; margin: 0.25rem 0;">How it works</h2>
                        <p class="section-description text-secondary">Six steps from sign-up to your first verified reward.</p>
                    </div>

                    <div class="grid-3 gap-6" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                        <div class="step-card glass flex-row gap-4 p-6" style="border-radius: 0.75rem; border: 1px solid var(--border-color);">
                            <span class="step-num font-mono text-primary" style="font-size: 1.5rem; font-weight: 800;">1</span>
                            <div>
                                <h3 class="step-title" style="font-weight: 700; margin-bottom: 0.25rem;">Register</h3>
                                <p class="step-desc text-secondary text-sm">Create your free MWM account securely in under a minute.</p>
                            </div>
                        </div>

                        <div class="step-card glass flex-row gap-4 p-6" style="border-radius: 0.75rem; border: 1px solid var(--border-color);">
                            <span class="step-num font-mono text-primary" style="font-size: 1.5rem; font-weight: 800;">2</span>
                            <div>
                                <h3 class="step-title" style="font-weight: 700; margin-bottom: 0.25rem;">Setup Profile</h3>
                                <p class="step-desc text-secondary text-sm">Add your profile details and connect your Delta account.</p>
                            </div>
                        </div>

                        <div class="step-card glass flex-row gap-4 p-6" style="border-radius: 0.75rem; border: 1px solid var(--border-color);">
                            <span class="step-num font-mono text-primary" style="font-size: 1.5rem; font-weight: 800;">3</span>
                            <div>
                                <h3 class="step-title" style="font-weight: 700; margin-bottom: 0.25rem;">Submit Delta UID</h3>
                                <p class="step-desc text-secondary text-sm">Share your Delta UID so we can verify referral status.</p>
                            </div>
                        </div>

                        <div class="step-card glass flex-row gap-4 p-6" style="border-radius: 0.75rem; border: 1px solid var(--border-color);">
                            <span class="step-num font-mono text-primary" style="font-size: 1.5rem; font-weight: 800;">4</span>
                            <div>
                                <h3 class="step-title" style="font-weight: 700; margin-bottom: 0.25rem;">Connect Read-Only API</h3>
                                <p class="step-desc text-secondary text-sm">Connect API key with trade & withdrawal OFF for live ROI tracking.</p>
                            </div>
                        </div>

                        <div class="step-card glass flex-row gap-4 p-6" style="border-radius: 0.75rem; border: 1px solid var(--border-color);">
                            <span class="step-num font-mono text-primary" style="font-size: 1.5rem; font-weight: 800;">5</span>
                            <div>
                                <h3 class="step-title" style="font-weight: 700; margin-bottom: 0.25rem;">Trade &amp; Compete</h3>
                                <p class="step-desc text-secondary text-sm">Trade on Delta Exchange across the 60-day window.</p>
                            </div>
                        </div>

                        <div class="step-card glass flex-row gap-4 p-6" style="border-radius: 0.75rem; border: 1px solid var(--border-color);">
                            <span class="step-num font-mono text-primary" style="font-size: 1.5rem; font-weight: 800;">6</span>
                            <div>
                                <h3 class="step-title" style="font-weight: 700; margin-bottom: 0.25rem;">Win Rewards</h3>
                                <p class="step-desc text-secondary text-sm">Top weekly, monthly and grand standings to claim direct cash.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Prizes Section -->
            <section id="prizes" class="prizes-section py-20 border-top" style="border-color: rgba(255, 255, 255, 0.08);">
                <div class="container">
                    <div class="section-header text-center mb-12">
                        <p class="section-tag text-primary" style="font-weight: 600; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em;">Rewards</p>
                        <h2 class="section-title" style="font-size: 2.25rem; font-weight: 700; margin: 0.25rem 0;">₹5,00,000 prize pool</h2>
                        <p class="section-description text-secondary">Win every week, every month, and at the grand finale.</p>
                    </div>

                    <div class="grid-3 gap-6" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                        <div class="prize-card glass text-center p-8" style="border-radius: 1rem; border: 1px solid var(--border-color);">
                            <div class="badge badge-active mb-4">Weekly Rewards</div>
                            <div class="prize-amount text-gradient" style="font-size: 2.25rem; font-weight: 800;">₹10,000 / wk</div>
                            <p class="text-secondary text-sm mt-2 mb-4">Top ROI in each tier every week.</p>
                            <p class="text-muted text-xs">Awarded every Sunday midnight.</p>
                        </div>

                        <div class="prize-card glass text-center p-8" style="border-radius: 1rem; border: 2px solid var(--primary); background: rgba(37, 99, 235, 0.05);">
                            <div class="badge badge-admin mb-4">Monthly Rewards</div>
                            <div class="prize-amount text-gradient" style="font-size: 2.25rem; font-weight: 800;">₹50,000 / mo</div>
                            <p class="text-secondary text-sm mt-2 mb-4">Best cumulative monthly performance.</p>
                            <p class="text-muted text-xs">Awarded at end of 30 days.</p>
                        </div>

                        <div class="prize-card glass text-center p-8" style="border-radius: 1rem; border: 1px solid var(--border-color);">
                            <div class="badge tier-whale mb-4">Grand Championship</div>
                            <div class="prize-amount text-gradient" style="font-size: 2.25rem; font-weight: 800;">₹2,50,000</div>
                            <p class="text-secondary text-sm mt-2 mb-4">Overall champion across full 60 days.</p>
                            <p class="text-muted text-xs">Trophy + direct payout to Delta wallet.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Tiers Section -->
            <section id="tiers" class="tiers-section py-20 border-top" style="border-color: rgba(255, 255, 255, 0.08);">
                <div class="container">
                    <div class="section-header text-center mb-12">
                        <p class="section-tag text-primary" style="font-weight: 600; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em;">Fair Play</p>
                        <h2 class="section-title" style="font-size: 2.25rem; font-weight: 700; margin: 0.25rem 0;">Four competition tiers</h2>
                        <p class="section-description text-secondary">You only compete against traders with capital in your range.</p>
                    </div>

                    <div class="grid-4 gap-6" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
                        <div class="tier-card glass p-6 text-left" style="border-radius: 1rem; border: 1px solid var(--border-color);">
                            <span class="tier-badge tier-rookie mb-3">Rookie</span>
                            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">₹25,000 – ₹50,000</h3>
                            <p class="text-secondary text-sm mt-2">New to the crypto markets. Build a verified track record.</p>
                        </div>

                        <div class="tier-card glass p-6 text-left" style="border-radius: 1rem; border: 1px solid rgba(37, 99, 235, 0.4); background: rgba(37, 99, 235, 0.04);">
                            <span class="tier-badge tier-trader mb-3">Trader</span>
                            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">₹50,000 – ₹1,00,000</h3>
                            <p class="text-secondary text-sm mt-2">Consistent and improving. Prove your edge with discipline.</p>
                        </div>

                        <div class="tier-card glass p-6 text-left" style="border-radius: 1rem; border: 1px solid var(--border-color);">
                            <span class="tier-badge tier-pro mb-3">Pro</span>
                            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">₹1,00,000 – ₹3,00,000</h3>
                            <p class="text-secondary text-sm mt-2">Serious capital, serious discipline and high execution volume.</p>
                        </div>

                        <div class="tier-card glass p-6 text-left" style="border-radius: 1rem; border: 1px solid rgba(234, 179, 8, 0.4); background: rgba(234, 179, 8, 0.04);">
                            <span class="tier-badge tier-whale mb-3">Whale</span>
                            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">₹3,00,000 – ₹10,00,000</h3>
                            <p class="text-secondary text-sm mt-2">Big size. The top tier of the championship with trophy multipliers.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Leaderboard Preview Section -->
            <section id="leaderboard" class="leaderboard-preview-section py-20 border-top" style="border-color: rgba(255, 255, 255, 0.08);">
                <span id="leaderboard-section" style="display:block; position:relative; top:-5rem; visibility:hidden;"></span>
                <div class="container">
                    <div class="flex-row justify-between align-center flex-wrap gap-4 mb-8">
                        <div>
                            <p class="section-tag text-primary" style="font-weight: 600; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em;">Live Standings</p>
                            <h2 class="section-title" style="font-size: 2rem; font-weight: 700; margin: 0.25rem 0;">Leaderboard preview</h2>
                            <p class="section-description text-secondary">Top traders, updated automatically through the championship.</p>
                        </div>

                        <!-- Tier Filter Tabs for Preview -->
                        <div class="tab-group" id="preview-tier-tabs">
                            <button class="tab-btn ${this.previewTier === 'Trader' ? 'active' : ''}" data-tier="Trader">Trader</button>
                            <button class="tab-btn ${this.previewTier === 'Rookie' ? 'active' : ''}" data-tier="Rookie">Rookie</button>
                            <button class="tab-btn ${this.previewTier === 'Pro' ? 'active' : ''}" data-tier="Pro">Pro</button>
                            <button class="tab-btn ${this.previewTier === 'Whale' ? 'active' : ''}" data-tier="Whale">Whale</button>
                        </div>
                    </div>

                    <div class="table-wrapper glass mb-6" style="border-radius: 0.75rem; border: 1px solid var(--border-color);">
                        <table class="leaderboard-table" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border-color); background: rgba(255, 255, 255, 0.02);">
                                    <th style="width: 80px; padding: 0.85rem 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Rank</th>
                                    <th style="padding: 0.85rem 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Trader</th>
                                    <th style="padding: 0.85rem 1rem; text-align: right; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">ROI</th>
                                    <th style="padding: 0.85rem 1rem; text-align: right; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Trades</th>
                                    <th style="padding: 0.85rem 1rem; text-align: right; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Volume (₹)</th>
                                    <th style="padding: 0.85rem 1rem; text-align: right; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Status</th>
                                </tr>
                            </thead>
                            <tbody id="landing-preview-tbody">
                                <tr>
                                    <td colspan="6" class="text-center py-8 text-muted">Loading live standings...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="text-center mt-6">
                        <a href="/leaderboard" class="btn btn-secondary btn-lg" data-link>View Full Leaderboard →</a>
                    </div>
                </div>
            </section>

            <!-- FAQ Section -->
            <section id="faq" class="faq-section py-20 border-top" style="border-color: rgba(255, 255, 255, 0.08);">
                <div class="container" style="max-width: 800px;">
                    <div class="section-header text-center mb-12">
                        <p class="section-tag text-primary" style="font-weight: 600; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em;">Questions</p>
                        <h2 class="section-title" style="font-size: 2.25rem; font-weight: 700; margin: 0.25rem 0;">Frequently asked</h2>
                        <p class="section-description text-secondary">Clear answers about participation, verification and safety.</p>
                    </div>

                    <div class="faq-accordion">
                        <div class="faq-item">
                            <button class="faq-question">
                                <span>Is this real money trading?</span>
                                <span class="faq-icon">+</span>
                            </button>
                            <div class="faq-answer hidden">
                                Yes. Participants trade with their own capital on Delta Exchange (India or Global). Starting capital determines your fair-play tier.
                            </div>
                        </div>

                        <div class="faq-item">
                            <button class="faq-question">
                                <span>How do you verify my trades and ensure safety?</span>
                                <span class="faq-icon">+</span>
                            </button>
                            <div class="faq-answer hidden">
                                We connect solely via read-only API keys generated from your Delta Exchange account. <strong>Trading and Withdrawal permissions remain strictly OFF</strong>. Our server only calculates your deposit-adjusted ROI % and cumulative volume.
                            </div>
                        </div>

                        <div class="faq-item">
                            <button class="faq-question">
                                <span>What does it cost to join the championship?</span>
                                <span class="faq-icon">+</span>
                            </button>
                            <div class="faq-answer hidden">
                                It is 100% free to register and participate. You only need an active Delta Exchange account opened with referral code <strong>EUERQB</strong> and the minimum deposit for your chosen tier.
                            </div>
                        </div>

                        <div class="faq-item">
                            <button class="faq-question">
                                <span>How are tiers decided?</span>
                                <span class="faq-icon">+</span>
                            </button>
                            <div class="faq-answer hidden">
                                Tiers are automatically assigned based on your portfolio equity at registration time: Rookie (₹25k-₹50k), Trader (₹50k-₹1L), Pro (₹1L-₹3L), and Whale (₹3L-₹10L).
                            </div>
                        </div>

                        <div class="faq-item">
                            <button class="faq-question">
                                <span>When does the competition start and how long does it run?</span>
                                <span class="faq-icon">+</span>
                            </button>
                            <div class="faq-answer hidden">
                                The championship runs across a 60-day active competition window, with weekly sprint resets every Sunday midnight and cumulative monthly rewards.
                            </div>
                        </div>

                        <div class="faq-item">
                            <button class="faq-question">
                                <span>How do I claim a reward if I win?</span>
                                <span class="faq-icon">+</span>
                            </button>
                            <div class="faq-answer hidden">
                                Cash rewards from the ₹5,00,000 prize pool are credited directly to your verified Delta Exchange wallet address upon verification of the final leaderboard standings.
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        `;
    }

    async mount(container) {
        this.container = container;
        this.container.innerHTML = this.render();
        this.bindEvents();
        await this.loadInitialLeaderboard();
    }

    bindEvents() {
        // FAQ accordion toggle
        const questions = this.container.querySelectorAll('.faq-question');
        questions.forEach(q => {
            q.addEventListener('click', () => {
                const answer = q.nextElementSibling;
                const icon = q.querySelector('.faq-icon');
                const isHidden = answer.classList.contains('hidden');
                
                // Close other items
                this.container.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
                this.container.querySelectorAll('.faq-icon').forEach(i => i.textContent = '+');

                if (isHidden) {
                    answer.classList.remove('hidden');
                    icon.textContent = '−';
                }
            });
        });

        // Preview Tier Tabs
        const previewTabs = document.getElementById('preview-tier-tabs');
        if (previewTabs) {
            previewTabs.addEventListener('click', (e) => {
                const btn = e.target.closest('.tab-btn');
                if (!btn) return;
                previewTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.previewTier = btn.dataset.tier;
                this.renderPreviewTable();
            });
        }
    }

    async loadInitialLeaderboard() {
        try {
            const comps = await competitionsAPI.getAll();
            this.competitions = comps;
            const activeComp = comps.find(c => c.is_active) || comps[0];
            if (activeComp) {
                this.activeCompId = activeComp.id;
                const data = await competitionsAPI.getLeaderboard(activeComp.id);
                this.entries = data.entries || [];
                this.renderPreviewTable();
            }
        } catch (err) {
            console.error('Failed to load initial leaderboard preview:', err);
        }
    }

    renderPreviewTable() {
        const tbody = document.getElementById('landing-preview-tbody');
        if (!tbody) return;

        // Filter top 10 by current tier
        let filtered = this.entries;
        if (this.previewTier && this.previewTier !== 'All') {
            filtered = filtered.filter(item => (item.tier || '').toLowerCase() === this.previewTier.toLowerCase());
        }
        filtered = filtered.slice(0, 10);

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-muted">No entries found for ${this.previewTier} tier.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map((entry, index) => {
            const rank = index + 1;
            const initials = entry.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const roiFormatted = (entry.roi_percentage >= 0 ? '+' : '') + entry.roi_percentage.toFixed(2) + '%';
            const roiClass = entry.roi_percentage >= 0 ? 'text-accent' : 'text-destructive';
            const volumeINR = '₹' + Math.round(entry.trading_volume).toLocaleString('en-IN');
            const tierLower = (entry.tier || 'trader').toLowerCase();

            let rankHtml = '';
            if (rank === 1) {
                rankHtml = `<span class="avatar-circle rank-trophy-1" style="width: 1.75rem; height: 1.75rem;">🏆</span>`;
            } else if (rank === 2) {
                rankHtml = `<span class="avatar-circle rank-trophy-2" style="width: 1.75rem; height: 1.75rem;">🥈</span>`;
            } else if (rank === 3) {
                rankHtml = `<span class="avatar-circle rank-trophy-3" style="width: 1.75rem; height: 1.75rem;">🥉</span>`;
            } else {
                rankHtml = `<span class="font-mono text-muted" style="width: 1.75rem; text-align: center; font-weight: 700;">${rank}</span>`;
            }

            return `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
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
}
