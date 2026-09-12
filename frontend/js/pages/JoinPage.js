// Join / Onboarding Flow Page Component
import { authAPI, apiKeysAPI, competitionsAPI } from '../api.js';
import { router } from '../router.js';
import { showToast } from '../components/Toast.js';

export class JoinPage {
    constructor({ onLoginSuccess } = {}) {
        this.container = null;
        this.onLoginSuccess = onLoginSuccess;
        this.mode = 'new'; // Directly open the flow for new member
        this.step = 1; // 1 to 4 for existing member wizard
        this.existingData = {
            fullName: '',
            exchange: 'Delta Exchange',
            uid: '',
            apiKey: '',
            apiSecret: '',
            environment: 'mainnet_india'
        };
        this.newMemberPhase = 1; // 1: Register, 2: Open Exchange & Checklist
        this.newMemberData = {
            fullName: '',
            email: '',
            phone: '',
            password: ''
        };
        this.checklist = {
            accountCreated: false,
            exchangeOpened: false,
            depositCompleted: false,
            uidConnected: false,
            apiVerified: false
        };
    }

    resetToNewMember() {
        this.mode = 'new';
        this.newMemberPhase = 1;
        this.step = 1;
    }

    render() {
        return `
        <div id="join-page-view" class="view-section py-12">
            <div class="container" style="max-width: 720px;">
                ${this.renderContent()}
            </div>
        </div>
        `;
    }

    renderContent() {
        if (this.mode === 'choice') {
            return this.renderChoiceScreen();
        } else if (this.mode === 'existing') {
            return this.renderExistingWizard();
        } else if (this.mode === 'new') {
            return this.renderNewMemberFlow();
        }
    }

    renderChoiceScreen() {
        return `
        <div class="text-center mb-8">
            <h1 class="hero-title" style="font-size: 2.25rem; margin-bottom: 0.5rem;">Join The Championship</h1>
            <p class="text-secondary" style="font-size: 1rem;">
                Do you already have a Delta Exchange account, or are you a new member?
            </p>
        </div>

        <div class="grid-2 gap-6 mb-8" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
            <!-- Existing Member Card -->
            <div class="choice-card" id="choose-existing-btn">
                <div class="flex-row align-center justify-center avatar-circle mb-4" style="width: 3rem; height: 3rem; background: rgba(37, 99, 235, 0.15); color: #60a5fa;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
                </div>
                <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Existing Member</h3>
                <p class="text-secondary" style="font-size: 0.875rem; line-height: 1.5;">
                    Already have a Delta Exchange account? Verify your UID and API key to join the championship immediately.
                </p>
                <div class="mt-4 flex-row align-center gap-2 text-primary" style="font-weight: 600; font-size: 0.875rem;">
                    Continue with Existing Account →
                </div>
            </div>

            <!-- New Member Card -->
            <div class="choice-card highlight" id="choose-new-btn">
                <div class="flex-row align-center justify-center avatar-circle mb-4" style="width: 3rem; height: 3rem; background: rgba(16, 185, 129, 0.15); color: #10b981;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
                </div>
                <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">New Member</h3>
                <p class="text-secondary" style="font-size: 0.875rem; line-height: 1.5;">
                    New here? Register your account, open a Delta account with official referral code <strong>EUERQB</strong>, complete setup steps, and start competing.
                </p>
                <div class="mt-4 flex-row align-center gap-2 text-accent" style="font-weight: 600; font-size: 0.875rem;">
                    Create Account &amp; Get Started →
                </div>
            </div>
        </div>

        <p class="text-center text-muted" style="font-size: 0.875rem;">
            Already have an MWM account? <a href="/login" class="text-primary hover-underline" data-link>Log in here</a>
        </p>
        `;
    }

    renderExistingWizard() {
        return `
        <div class="mb-6">
            <button class="btn btn-ghost flex-row align-center gap-2 mb-4" id="wizard-back-to-signup-btn" style="padding-left: 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back to Sign Up
            </button>
            <h1 class="hero-title" style="font-size: 1.85rem; margin-bottom: 0.25rem;">Connect Delta Account</h1>
            <p class="text-secondary" style="font-size: 0.875rem;">Complete 4 quick steps to connect your read-only API credentials.</p>
        </div>

        <!-- Stepper Progress Bar -->
        <div class="stepper-header mb-8">
            <div class="stepper-step ${this.step === 1 ? 'active' : (this.step > 1 ? 'completed' : '')}">
                <div class="stepper-circle">${this.step > 1 ? '✓' : '1'}</div>
                <span class="stepper-step-label">Name</span>
            </div>
            <div class="stepper-step ${this.step === 2 ? 'active' : (this.step > 2 ? 'completed' : '')}">
                <div class="stepper-circle">${this.step > 2 ? '✓' : '2'}</div>
                <span class="stepper-step-label">Exchange</span>
            </div>
            <div class="stepper-step ${this.step === 3 ? 'active' : (this.step > 3 ? 'completed' : '')}">
                <div class="stepper-circle">${this.step > 3 ? '✓' : '3'}</div>
                <span class="stepper-step-label">UID</span>
            </div>
            <div class="stepper-step ${this.step === 4 ? 'active' : ''}">
                <div class="stepper-circle">4</div>
                <span class="stepper-step-label">API Key</span>
            </div>
        </div>

        <!-- Wizard Step Card -->
        <div class="card glass p-8" style="border: 1px solid var(--border-color); border-radius: 1rem;">
            ${this.renderWizardCurrentStep()}
        </div>
        `;
    }

    renderWizardCurrentStep() {
        if (this.step === 1) {
            return `
            <div class="flex-column gap-4">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 700;">Step 1: Your Full Name</h3>
                    <p class="text-secondary text-sm">Enter the full name you want displayed on the leaderboard.</p>
                </div>
                <div class="form-group">
                    <label for="wizard-fullname">Full Name</label>
                    <input type="text" id="wizard-fullname" class="form-control" placeholder="e.g. Rahul Sharma" value="${this.existingData.fullName}" required>
                </div>
                <div class="flex-row justify-end mt-4">
                    <button class="btn btn-primary" id="wizard-step-1-next">Continue to Exchange Selection →</button>
                </div>
            </div>
            `;
        } else if (this.step === 2) {
            return `
            <div class="flex-column gap-4">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 700;">Step 2: Exchange Selection</h3>
                    <p class="text-secondary text-sm">The championship is hosted on Delta Exchange's verified API.</p>
                </div>
                
                <div class="card p-6" style="border: 2px solid var(--primary); background: rgba(37, 99, 235, 0.08); border-radius: 0.75rem;">
                    <div class="flex-row justify-between align-center">
                        <div class="flex-row align-center gap-3">
                            <span class="avatar-circle" style="background: #2563eb; color: #fff;">Δ</span>
                            <div>
                                <h4 style="font-weight: 700;">Delta Exchange</h4>
                                <p class="text-secondary text-xs">Official Partner · India & Global API Supported</p>
                            </div>
                        </div>
                        <span class="badge badge-active">Active</span>
                    </div>
                </div>

                <div class="flex-row justify-between mt-4">
                    <button class="btn btn-secondary" id="wizard-prev-btn">← Back</button>
                    <button class="btn btn-primary" id="wizard-step-2-next">Confirm Delta Exchange →</button>
                </div>
            </div>
            `;
        } else if (this.step === 3) {
            return `
            <div class="flex-column gap-4">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 700;">Step 3: Exchange UID</h3>
                    <p class="text-secondary text-sm">Enter your Delta Exchange User ID (UID).</p>
                </div>
                
                <div class="form-group">
                    <label for="wizard-uid">Delta User ID (UID)</label>
                    <input type="text" id="wizard-uid" class="form-control" placeholder="e.g. 10045" value="${this.existingData.uid}" required>
                    <small class="text-muted text-xs mt-1" style="display: block;">
                        Click on the Profile icon in the Delta App or Website to find your 5–7 digit UID.
                    </small>
                </div>

                <div class="flex-row justify-between mt-4">
                    <button class="btn btn-secondary" id="wizard-prev-btn">← Back</button>
                    <button class="btn btn-primary" id="wizard-step-3-next">Continue to API Connection →</button>
                </div>
            </div>
            `;
        } else if (this.step === 4) {
            return `
            <div class="flex-column gap-4">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 700;">Step 4: Connect Read-Only API</h3>
                    <p class="text-secondary text-sm">Connect your Delta Exchange read-only API credentials.</p>
                </div>

                <!-- Security Warning Box -->
                <div class="p-4" style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 0.5rem;">
                    <div class="flex-row align-center gap-2" style="color: #facc15; font-weight: 700; margin-bottom: 0.25rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Security Rule: Create Read-Only Key Only
                    </div>
                    <p class="text-xs" style="color: #fef08a; line-height: 1.4;">
                        When creating your Delta API key, keep <strong>Trading</strong> and <strong>Withdrawal</strong> permissions strictly <strong>OFF</strong>. The platform will only read your portfolio balances and trade history.
                    </p>
                </div>

                <!-- Form Fields -->
                <div class="form-group">
                    <label for="wizard-env">API Environment</label>
                    <select id="wizard-env" class="form-control">
                        <option value="mainnet_india" selected>Delta India Mainnet (api.india.delta.exchange)</option>
                        <option value="testnet_india">Delta India Testnet</option>
                        <option value="mainnet">Delta Global Mainnet</option>
                        <option value="testnet">Delta Global Testnet</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="wizard-apikey">API Key</label>
                    <input type="text" id="wizard-apikey" class="form-control font-mono" placeholder="Paste your Delta API Key" value="${this.existingData.apiKey}" required>
                </div>

                <div class="form-group">
                    <label for="wizard-apisecret">API Secret</label>
                    <input type="password" id="wizard-apisecret" class="form-control font-mono" placeholder="Paste your Delta API Secret" value="${this.existingData.apiSecret}" required>
                </div>

                <div class="text-xs text-secondary mb-2">
                    Need help? <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" class="text-primary hover-underline">Watch: How to generate Delta read-only API Key ↗</a>
                </div>

                <div class="flex-row justify-between mt-4">
                    <button class="btn btn-secondary" id="wizard-prev-btn">← Back</button>
                    <button class="btn btn-primary flex-row align-center gap-2" id="wizard-verify-btn">
                        <span>Verify &amp; Join Championship</span>
                    </button>
                </div>
            </div>
            `;
        }
    }

    renderNewMemberFlow() {
        if (this.newMemberPhase === 1) {
            return `
            <div class="mb-6">
                <button class="btn btn-ghost flex-row align-center gap-2 mb-4" id="new-back-to-home-btn" style="padding-left: 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Back to Home
                </button>
                <h1 class="hero-title" style="font-size: 1.85rem; margin-bottom: 0.25rem;">Create Your MWM Account</h1>
                <p class="text-secondary" style="font-size: 0.875rem;">Phase 1: Register your championship profile.</p>
            </div>

            <div class="card glass p-8" style="border: 1px solid var(--border-color); border-radius: 1rem;">
                <form id="new-member-reg-form" class="flex-column gap-4">
                    <div class="form-group">
                        <label for="new-fullname">Full Name</label>
                        <input type="text" id="new-fullname" class="form-control" placeholder="John Doe" required value="${this.newMemberData.fullName}">
                    </div>

                    <div class="form-group">
                        <label for="new-email">Email Address</label>
                        <input type="email" id="new-email" class="form-control" placeholder="you@example.com" required value="${this.newMemberData.email}">
                    </div>

                    <div class="form-group">
                        <label for="new-phone">WhatsApp Number</label>
                        <input type="tel" id="new-phone" class="form-control" placeholder="+91 98765 43210" required value="${this.newMemberData.phone}">
                    </div>

                    <div class="form-group">
                        <label for="new-password">Password (Min. 6 characters)</label>
                        <input type="password" id="new-password" class="form-control" placeholder="••••••••" minlength="6" required>
                    </div>

                    <div class="form-group">
                        <label for="new-confirm-password">Confirm Password</label>
                        <input type="password" id="new-confirm-password" class="form-control" placeholder="••••••••" minlength="6" required>
                    </div>

                    <button type="submit" class="btn btn-primary btn-lg w-full mt-4" id="new-reg-submit-btn">
                        Create Account &amp; Proceed to Exchange →
                    </button>
                    
                    <p class="text-center text-secondary text-xs mt-4">
                        Already have a Delta Exchange account? <a href="#" id="switch-to-existing-btn" class="text-primary hover-underline">Connect existing account</a>
                    </p>
                    <p class="text-center text-muted text-xs mt-2">
                        Already have an MWM account? <a href="/login" class="text-primary hover-underline" data-link>Log in here</a>
                    </p>
                </form>
            </div>
            `;
        } else {
            return `
            <div class="mb-6 text-center">
                <div class="badge badge-active mb-2">Registration Complete</div>
                <h1 class="hero-title" style="font-size: 1.85rem; margin-bottom: 0.25rem;">Next: Open Delta Exchange Account</h1>
                <p class="text-secondary" style="font-size: 0.875rem;">
                    Championship track record and prizes are linked to Delta Exchange referral accounts.
                </p>
            </div>

            <!-- Referral Card -->
            <div class="card glass p-6 mb-6" style="border: 2px solid var(--primary); background: rgba(37, 99, 235, 0.05); border-radius: 1rem;">
                <div class="flex-row justify-between align-center flex-wrap gap-4">
                    <div>
                        <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.25rem;">Open Delta Account with Code</h3>
                        <p class="text-secondary text-sm">Official Championship Referral Code: <strong class="text-primary font-mono" style="font-size: 1rem;">EUERQB</strong></p>
                    </div>
                    <a href="https://www.delta.exchange/app/signup/?code=EUERQB" target="_blank" class="btn btn-primary flex-row align-center gap-2" id="open-delta-referral-btn">
                        Open Delta Exchange ↗
                    </a>
                </div>
            </div>

            <!-- Onboarding Checklist -->
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Championship Setup Checklist:</h3>
            <div class="flex-column gap-3 mb-8">
                <div class="checklist-card">
                    <div class="checklist-icon done">✓</div>
                    <div>
                        <div style="font-weight: 600;">MWM Account Created</div>
                        <div class="text-muted text-xs">Your profile has been saved.</div>
                    </div>
                </div>

                <div class="checklist-card">
                    <div class="checklist-icon done">✓</div>
                    <div>
                        <div style="font-weight: 600;">Delta Exchange Sign-up with EUERQB</div>
                        <div class="text-muted text-xs">Create your Delta account and note your UID.</div>
                    </div>
                </div>

                <div class="checklist-card">
                    <div class="checklist-icon pending">3</div>
                    <div>
                        <div style="font-weight: 600;">Complete Deposit</div>
                        <div class="text-muted text-xs">Deposit starting capital (₹25,000+ for Rookie tier, up to Whale).</div>
                    </div>
                </div>

                <div class="checklist-card">
                    <div class="checklist-icon pending">4</div>
                    <div>
                        <div style="font-weight: 600;">Connect Read-Only API Key</div>
                        <div class="text-muted text-xs">Connect your read-only key to start live ROI tracking.</div>
                    </div>
                </div>
            </div>

            <div class="flex-row justify-center">
                <button class="btn btn-primary btn-lg" id="continue-to-connect-api-btn">
                    Continue to Connect API Key →
                </button>
            </div>
            `;
        }
    }

    async mount(container) {
        this.container = container;
        this.container.innerHTML = this.render();
        this.bindEvents();
    }

    bindEvents() {
        // Choice selection
        const existingBtn = document.getElementById('choose-existing-btn');
        if (existingBtn) {
            existingBtn.addEventListener('click', () => {
                this.mode = 'existing';
                this.step = 1;
                this.container.innerHTML = this.render();
                this.bindEvents();
            });
        }

        const newBtn = document.getElementById('choose-new-btn');
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                this.mode = 'new';
                this.newMemberPhase = 1;
                this.container.innerHTML = this.render();
                this.bindEvents();
            });
        }

        // Back to home from new member flow
        const backHomeBtn = document.getElementById('new-back-to-home-btn');
        if (backHomeBtn) {
            backHomeBtn.addEventListener('click', () => {
                router.navigate('/');
            });
        }

        // Switch to existing Delta account
        const switchToExisting = document.getElementById('switch-to-existing-btn');
        if (switchToExisting) {
            switchToExisting.addEventListener('click', (e) => {
                e.preventDefault();
                this.mode = 'existing';
                this.step = 1;
                this.container.innerHTML = this.render();
                this.bindEvents();
            });
        }

        // Back to sign up from existing member wizard
        const backToSignupBtn = document.getElementById('wizard-back-to-signup-btn');
        if (backToSignupBtn) {
            backToSignupBtn.addEventListener('click', () => {
                this.mode = 'new';
                this.newMemberPhase = 1;
                this.container.innerHTML = this.render();
                this.bindEvents();
            });
        }

        // Back to choice if present
        const backChoiceBtn = document.getElementById('wizard-back-to-choice-btn') || document.getElementById('new-back-to-choice-btn');
        if (backChoiceBtn) {
            backChoiceBtn.addEventListener('click', () => {
                this.mode = 'new';
                this.container.innerHTML = this.render();
                this.bindEvents();
            });
        }

        // Wizard Next / Prev buttons
        const step1Next = document.getElementById('wizard-step-1-next');
        if (step1Next) {
            step1Next.addEventListener('click', () => {
                const nameInput = document.getElementById('wizard-fullname');
                if (!nameInput.value.trim()) {
                    showToast('Please enter your full name.', 'error');
                    return;
                }
                this.existingData.fullName = nameInput.value.trim();
                this.step = 2;
                this.container.innerHTML = this.render();
                this.bindEvents();
            });
        }

        const step2Next = document.getElementById('wizard-step-2-next');
        if (step2Next) {
            step2Next.addEventListener('click', () => {
                this.step = 3;
                this.container.innerHTML = this.render();
                this.bindEvents();
            });
        }

        const step3Next = document.getElementById('wizard-step-3-next');
        if (step3Next) {
            step3Next.addEventListener('click', () => {
                const uidInput = document.getElementById('wizard-uid');
                if (!uidInput.value.trim()) {
                    showToast('Please enter your Delta User ID.', 'error');
                    return;
                }
                this.existingData.uid = uidInput.value.trim();
                this.step = 4;
                this.container.innerHTML = this.render();
                this.bindEvents();
            });
        }

        const prevBtn = document.getElementById('wizard-prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.step > 1) {
                    this.step -= 1;
                    this.container.innerHTML = this.render();
                    this.bindEvents();
                }
            });
        }

        // Step 4: Verify & Save API Key
        const verifyBtn = document.getElementById('wizard-verify-btn');
        if (verifyBtn) {
            verifyBtn.addEventListener('click', async () => {
                const apiKeyInput = document.getElementById('wizard-apikey');
                const apiSecretInput = document.getElementById('wizard-apisecret');
                const envSelect = document.getElementById('wizard-env');

                if (!apiKeyInput.value.trim() || !apiSecretInput.value.trim()) {
                    showToast('Please provide both API Key and API Secret.', 'error');
                    return;
                }

                this.existingData.apiKey = apiKeyInput.value.trim();
                this.existingData.apiSecret = apiSecretInput.value.trim();
                this.existingData.environment = envSelect.value;

                verifyBtn.disabled = true;
                verifyBtn.innerHTML = 'Verifying with Delta...';

                try {
                    // Check if user is logged in, or register/login on the fly
                    if (!localStorage.getItem('token')) {
                        // Create user account with UID
                        const tempEmail = `${this.existingData.uid}@championship.delta`;
                        const tempPassword = `Delta_${this.existingData.uid}_2026`;
                        
                        try {
                            await authAPI.register({
                                full_name: this.existingData.fullName,
                                email: tempEmail,
                                password: tempPassword,
                                delta_user_id: this.existingData.uid
                            });
                            const loginRes = await authAPI.login(tempEmail, tempPassword);
                            if (typeof this.onLoginSuccess === 'function') {
                                await this.onLoginSuccess(loginRes.access_token, false);
                            } else {
                                localStorage.setItem('token', loginRes.access_token);
                            }
                        } catch (err) {
                            // If email exists, prompt login
                            showToast('An account for this UID exists. Please log in first.', 'error');
                            router.navigate('/login');
                            return;
                        }
                    }

                    // Save API Key
                    await apiKeysAPI.create({
                        api_key: this.existingData.apiKey,
                        api_secret: this.existingData.apiSecret,
                        environment: this.existingData.environment
                    });

                    // Auto-register for active competition
                    const comps = await competitionsAPI.getAll();
                    const activeComp = comps.find(c => c.is_active) || comps[0];
                    if (activeComp) {
                        try {
                            await competitionsAPI.register(activeComp.id);
                        } catch (e) {
                            // Already registered is fine
                        }
                    }

                    showToast('Delta API Key verified & linked! Welcome to Championship.', 'success');
                    router.navigate('/dashboard');
                } catch (err) {
                    showToast(`Delta Verification Error: ${err.message}`, 'error');
                    verifyBtn.disabled = false;
                    verifyBtn.innerHTML = 'Verify &amp; Join Championship';
                }
            });
        }

        // New Member Registration
        const newRegForm = document.getElementById('new-member-reg-form');
        if (newRegForm) {
            newRegForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('new-fullname').value.trim();
                const email = document.getElementById('new-email').value.trim();
                const phone = document.getElementById('new-phone').value.trim();
                const password = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('new-confirm-password').value;

                if (password !== confirmPassword) {
                    showToast('Passwords do not match. Please verify and try again.', 'error');
                    const confirmInput = document.getElementById('new-confirm-password');
                    if (confirmInput) confirmInput.focus();
                    return;
                }

                const submitBtn = document.getElementById('new-reg-submit-btn');
                submitBtn.disabled = true;
                submitBtn.innerText = 'Creating account...';

                try {
                    await authAPI.register({
                        full_name: name,
                        email: email,
                        phone: phone,
                        password: password
                    });

                    // Login automatically
                    const loginRes = await authAPI.login(email, password);
                    if (typeof this.onLoginSuccess === 'function') {
                        await this.onLoginSuccess(loginRes.access_token, false);
                    } else {
                        localStorage.setItem('token', loginRes.access_token);
                    }

                    this.newMemberPhase = 2;
                    this.container.innerHTML = this.render();
                    this.bindEvents();
                    showToast('Account created successfully!', 'success');
                } catch (err) {
                    if (err.message && err.message.includes('Email already registered')) {
                        showToast('This email is already registered. Please log in instead.', 'error');
                    } else {
                        showToast(`Registration failed: ${err.message}`, 'error');
                    }
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Create Account & Proceed to Exchange →';
                }
            });
        }

        // Continue to API connect from Phase 2
        const continueToApiBtn = document.getElementById('continue-to-connect-api-btn');
        if (continueToApiBtn) {
            continueToApiBtn.addEventListener('click', () => {
                this.mode = 'existing';
                this.step = 3; // Go directly to UID and API step
                this.container.innerHTML = this.render();
                this.bindEvents();
            });
        }
    }
}
