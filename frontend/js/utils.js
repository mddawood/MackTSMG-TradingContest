// Shared utility functions for Profile Completion & UI Components

/**
 * Calculates user profile completion percentage (0 - 100%) across 4 milestones:
 * 1. Email Verified (25%)
 * 2. Basic Details / Full Name & Phone (25%)
 * 3. Exchange & UID Connected (25%)
 * 4. Read-Only API Key Connected (25%)
 */
export function calculateProfileCompletion(user) {
    if (!user) return 0;
    let score = 0;

    // Milestone 1: Email verified
    if (user.is_verified) {
        score += 25;
    }

    // Milestone 2: Basic profile info (Full Name & WhatsApp/Phone)
    if (user.full_name && user.phone) {
        score += 25;
    }

    // Milestone 3: Exchange & UID connected
    if (user.delta_user_id) {
        score += 25;
    }

    // Milestone 4: Active API Key connected
    if (user.has_api_key) {
        score += 25;
    }

    return score;
}

/**
 * Renders an avatar circle wrapped with an SVG circular progress ring indicating
 * the user's profile completion percentage.
 */
export function renderAvatarWithProgress(user, size = 36, showBadge = true) {
    const pct = calculateProfileCompletion(user);
    const strokeWidth = size > 50 ? 4 : 3;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (pct / 100) * circumference;
    const initials = user?.full_name 
        ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
        : 'TR';

    // Color gradient based on milestone completion
    let progressColor = '#3b82f6';
    if (pct === 100) {
        progressColor = '#10b981';
    } else if (pct >= 50) {
        progressColor = '#8b5cf6';
    }

    return `
    <div class="avatar-progress-container" style="width: ${size}px; height: ${size}px; position: relative; display: inline-flex; align-items: center; justify-content: center;">
        <svg class="avatar-progress-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg); position: absolute; inset: 0;">
            <!-- Background circle track -->
            <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="rgba(255, 255, 255, 0.12)" stroke-width="${strokeWidth}" />
            <!-- Animated progress bar circle -->
            <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="${progressColor}" stroke-width="${strokeWidth}" 
                stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="round" 
                style="transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease;" />
        </svg>
        <div class="avatar-inner-circle" style="width: ${size - strokeWidth * 2.6}px; height: ${size - strokeWidth * 2.6}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #131b2e; font-weight: 700; font-size: ${Math.max(10, Math.floor(size * 0.36))}px; color: #f8fafc; border: 1px solid rgba(255, 255, 255, 0.08);">
            ${initials}
        </div>
        ${showBadge ? `
        <span class="avatar-pct-badge" title="${pct}% Profile Completed" style="position: absolute; bottom: -2px; right: -4px; background: ${progressColor}; color: #ffffff; font-size: 8.5px; font-weight: 800; padding: 1px 4px; border-radius: 9999px; line-height: 1.1; border: 1.5px solid #0f172a; box-shadow: 0 2px 4px rgba(0,0,0,0.4);">
            ${pct}%
        </span>` : ''}
    </div>
    `;
}

/**
 * Checks if a user is verified and whitelisted with an exchange UID.
 */
export function isUserVerified(user) {
    return Boolean(user && user.delta_user_id && (user.uid_status === 'verified' || !user.uid_status));
}

/**
 * Renders the Twitter-style verified blue tick badge.
 */
export function renderVerifiedBadge(size = 16, title = "Whitelisted Trader") {
    return `
    <span class="verified-badge-wrap" title="${title}" aria-label="${title}" style="display: inline-flex; align-items: center; justify-content: center; vertical-align: middle; flex-shrink: 0; line-height: 1;">
        <svg class="verified-tick-icon" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" style="display: inline-block; vertical-align: middle; flex-shrink: 0;">
            <path fill="#1d9bf0" d="m22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"/>
            <path fill="#ffffff" d="m9.97 15.65-3.32-3.32 1.41-1.41 1.91 1.91 5.91-5.91 1.41 1.41-7.32 7.32z"/>
        </svg>
    </span>
    `;
}
