// UID Whitelist Verification Modals & Celebration Animations

import { renderVerifiedBadge } from '../utils.js';

/**
 * Displays a sleek dark-themed pop-up modal when UID is not found in database.
 * 
 * @param {Object} options
 * @param {string} options.message - The error message to display
 * @param {Function} [options.onDismiss] - Callback when modal is dismissed
 */
export function showUidNotFoundModal({ message = "Your user ID does not exist in our database.", onDismiss } = {}) {
    const existingModal = document.getElementById('uid-error-modal');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'uid-error-modal';
    overlay.className = 'uid-modal-backdrop';
    overlay.innerHTML = `
        <div class="uid-modal-card uid-error-card" role="dialog" aria-modal="true" aria-labelledby="uid-error-title">
            <div class="uid-modal-icon-wrap uid-error-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            </div>
            
            <h3 id="uid-error-title" class="uid-modal-title">UID Verification Failed</h3>
            <p class="uid-modal-message">${message}</p>
            <p class="uid-modal-subtext">
                Only whitelisted exchange accounts are eligible to participate in trading contests. Please verify your UID or reach out to contest organizers to get whitelisted.
            </p>

            <button type="button" class="btn btn-primary w-full uid-modal-btn uid-error-btn" id="uid-error-close-btn">
                Understood / Try Again
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    const close = () => {
        overlay.classList.add('closing');
        setTimeout(() => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            if (onDismiss) onDismiss();
        }, 200);
    };

    const closeBtn = overlay.querySelector('#uid-error-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', close);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });

    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            document.removeEventListener('keydown', handleKeydown);
            close();
        }
    };
    document.addEventListener('keydown', handleKeydown);
}

/**
 * Displays a celebratory temporary UI animation with a Hurray message
 * and Twitter-style verified badge when UID is whitelisted.
 * 
 * @param {Object} options
 * @param {string} options.uid - Verified UID
 * @param {string} [options.exchange] - Exchange Name (Delta / Shark)
 * @param {Function} [options.onComplete] - Callback after celebration ends
 */
export function showUidSuccessCelebration({ uid = '', exchange = 'Exchange', onComplete } = {}) {
    const existing = document.getElementById('uid-success-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'uid-success-modal';
    overlay.className = 'uid-modal-backdrop uid-celebration-backdrop';

    // Generate confetti particles
    let confettiHTML = '';
    const colors = ['#1d9bf0', '#38bdf8', '#facc15', '#10b981', '#a855f7', '#ec4899'];
    for (let i = 0; i < 28; i++) {
        const left = Math.floor(Math.random() * 96) + 2;
        const delay = (Math.random() * 0.6).toFixed(2);
        const duration = (1.4 + Math.random() * 1.2).toFixed(2);
        const size = Math.floor(Math.random() * 8) + 6;
        const color = colors[i % colors.length];
        const rot = Math.floor(Math.random() * 360);
        confettiHTML += `<span class="celebration-confetti-dot" style="left: ${left}%; width: ${size}px; height: ${size}px; background: ${color}; animation-delay: ${delay}s; animation-duration: ${duration}s; --rot: ${rot}deg;"></span>`;
    }

    overlay.innerHTML = `
        <div class="celebration-confetti-container">
            ${confettiHTML}
        </div>
        <div class="uid-modal-card uid-celebration-card" role="dialog" aria-modal="true" aria-labelledby="uid-success-title">
            <div class="uid-celebration-badge-wrap">
                <div class="uid-badge-pulse-ring"></div>
                <div class="uid-large-verified-icon">
                    <svg viewBox="0 0 24 24" width="60" height="60" aria-hidden="true" style="display: block;">
                        <path fill="#1d9bf0" d="m22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"/>
                        <path fill="#ffffff" d="m9.97 15.65-3.32-3.32 1.41-1.41 1.91 1.91 5.91-5.91 1.41 1.41-7.32 7.32z"/>
                    </svg>
                </div>
            </div>

            <h2 id="uid-success-title" class="uid-celebration-title">🎉 Hurray! Whitelist Verified!</h2>
            
            <div class="uid-celebration-pill">
                ${renderVerifiedBadge(16)}
                <span>Official Whitelisted Trader</span>
            </div>

            <p class="uid-celebration-desc">
                Your ${exchange} UID (<strong>${uid}</strong>) has been verified against our database. A verified blue tick is now active on your profile!
            </p>

            <div class="uid-celebration-progress-bar">
                <div class="uid-celebration-progress-fill"></div>
            </div>

            <button type="button" class="btn btn-primary w-full uid-celebration-btn" id="uid-celebration-continue-btn">
                Continue to API Connection →
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        overlay.classList.add('closing');
        setTimeout(() => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            if (onComplete) onComplete();
        }, 250);
    };

    const continueBtn = overlay.querySelector('#uid-celebration-continue-btn');
    if (continueBtn) continueBtn.addEventListener('click', finish);

    // Auto-advance after temporary animation (2.6 seconds)
    const autoTimer = setTimeout(() => {
        finish();
    }, 2600);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            clearTimeout(autoTimer);
            finish();
        }
    });
}

/**
 * Displays an animated Hurray celebratory modal when Exchange API Key
 * credentials are authenticated and live wallet balance is fetched.
 * 
 * @param {Object} options
 * @param {string} [options.exchange] - Exchange name
 * @param {string} [options.uid] - User ID
 * @param {number} [options.balance] - Retrieved wallet balance
 * @param {Function} [options.onComplete] - Callback after dismissal
 */
export function showExchangeConnectedCelebration({ exchange = 'Delta Exchange', uid = '', balance = 0, onComplete } = {}) {
    const existing = document.getElementById('exchange-connected-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'exchange-connected-modal';
    overlay.className = 'uid-modal-backdrop uid-celebration-backdrop';

    // Generate colorful confetti particles
    let confettiHTML = '';
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    for (let i = 0; i < 32; i++) {
        const left = Math.floor(Math.random() * 96) + 2;
        const delay = (Math.random() * 0.7).toFixed(2);
        const duration = (1.5 + Math.random() * 1.2).toFixed(2);
        const size = Math.floor(Math.random() * 9) + 6;
        const color = colors[i % colors.length];
        const rot = Math.floor(Math.random() * 360);
        confettiHTML += `<span class="celebration-confetti-dot" style="left: ${left}%; width: ${size}px; height: ${size}px; background: ${color}; animation-delay: ${delay}s; animation-duration: ${duration}s; --rot: ${rot}deg;"></span>`;
    }

    const formattedBal = Number(balance || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    overlay.innerHTML = `
        <div class="celebration-confetti-container">
            ${confettiHTML}
        </div>
        <div class="uid-modal-card uid-celebration-card" role="dialog" aria-modal="true" aria-labelledby="exchange-conn-title" style="max-width: 440px;">
            <div class="uid-celebration-badge-wrap">
                <div class="uid-badge-pulse-ring" style="border-color: rgba(16, 185, 129, 0.4);"></div>
                <div class="uid-large-verified-icon" style="background: rgba(16, 185, 129, 0.15); border-radius: 50%; padding: 12px;">
                    <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                </div>
            </div>

            <h2 id="exchange-conn-title" class="uid-celebration-title" style="color: #ffffff; font-size: 1.45rem;">
                🎉 Hurray! Exchange Connected!
            </h2>
            
            <div class="uid-celebration-pill" style="background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.35); color: #34d399;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>${exchange} · Verified &amp; Active</span>
            </div>

            <p class="uid-celebration-desc" style="margin-bottom: 1.25rem;">
                Your <strong>${exchange}</strong> account ${uid ? `(UID: <strong>${uid}</strong>)` : ''} has been successfully authenticated. Live trading sync and cash prize leaderboards are now unlocked!
            </p>

            <!-- Wallet Balance Inspiration Box -->
            <div class="p-3 mb-4 flex-row align-center justify-between" style="background: rgba(18, 20, 29, 0.9); border: 1.5px solid rgba(255, 255, 255, 0.15); border-radius: 10px; width: 100%; box-sizing: border-box;">
                <div class="flex-row align-center gap-2">
                    <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
                        </svg>
                    </div>
                    <div class="flex-column text-left">
                        <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Wallet Balance</span>
                        <span style="font-size: 0.75rem; color: #10b981; font-weight: 600;">Synced from Delta</span>
                    </div>
                </div>
                <div style="font-size: 1.25rem; font-weight: 800; color: #ffffff; font-family: 'Inter', sans-serif;">
                    ₹${formattedBal}
                </div>
            </div>

            <div class="uid-celebration-progress-bar">
                <div class="uid-celebration-progress-fill" style="background: linear-gradient(90deg, #10b981, #3b82f6);"></div>
            </div>

            <button type="button" class="btn btn-primary w-full uid-celebration-btn" id="exchange-conn-continue-btn" style="background: #10b981; border-color: #10b981;">
                Go to Dashboard →
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        overlay.classList.add('closing');
        setTimeout(() => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            if (onComplete) onComplete();
        }, 250);
    };

    const continueBtn = overlay.querySelector('#exchange-conn-continue-btn');
    if (continueBtn) continueBtn.addEventListener('click', finish);

    // Auto-advance after 3.2 seconds
    const autoTimer = setTimeout(() => {
        finish();
    }, 3200);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            clearTimeout(autoTimer);
            finish();
        }
    });
}
