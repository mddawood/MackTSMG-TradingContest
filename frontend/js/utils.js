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
