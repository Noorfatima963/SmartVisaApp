/**
 * services/storage.js
 * ────────────────────
 * Central AsyncStorage helper for SmartVisa.
 * All AsyncStorage reads/writes go through here.
 *
 * Keys used:
 *   'auth_token'         — JWT access token
 *   'auth_refresh'       — JWT refresh token
 *   'auth_user'          — { id, name, email }
 *   'onboarding_draft'   — partial onboarding data saved per step
 *   'profile_complete'   — 'true' | 'false'
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Key Constants ──────────────────────────────────────────────────────────────
const KEYS = {
    AUTH_TOKEN: 'auth_token',
    AUTH_REFRESH: 'auth_refresh',
    AUTH_USER: 'auth_user',
    ONBOARDING_DRAFT: 'onboarding_draft',
    PROFILE_COMPLETE: 'profile_complete',
};

// ── Auth ───────────────────────────────────────────────────────────────────────

/** Save token + user after login/register */
export async function saveAuth(accessToken, refreshToken, user) {
    await AsyncStorage.multiSet([
        [KEYS.AUTH_TOKEN, accessToken],
        [KEYS.AUTH_REFRESH, refreshToken],
        [KEYS.AUTH_USER, JSON.stringify(user)],
    ]);
}

/** Get the JWT access token */
export async function getToken() {
    return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
}

/** Get the refresh token */
export async function getRefreshToken() {
    return await AsyncStorage.getItem(KEYS.AUTH_REFRESH);
}

/** Get saved user object { id, name, email } */
export async function getUser() {
    const raw = await AsyncStorage.getItem(KEYS.AUTH_USER);
    return raw ? JSON.parse(raw) : null;
}

/** Clear all auth data (logout) */
export async function clearAuth() {
    await AsyncStorage.multiRemove([
        KEYS.AUTH_TOKEN,
        KEYS.AUTH_REFRESH,
        KEYS.AUTH_USER,
    ]);
}

// ── Onboarding Draft ──────────────────────────────────────────────────────────

/**
 * Save a partial step to the onboarding draft.
 * Merges with existing draft so previous steps are preserved.
 *
 * Usage:
 *   await saveOnboardingStep(1, { target_country: 'USA' });
 *   await saveOnboardingStep(3, { gpa: 82, backlogs: 0, degree: 'BS CS' });
 */
export async function saveOnboardingStep(stepNumber, stepData) {
    const existing = await getOnboardingDraft();
    const updated = {
        ...existing,
        ...stepData,
        step_reached: Math.max(stepNumber, existing?.step_reached || 0),
    };
    await AsyncStorage.setItem(KEYS.ONBOARDING_DRAFT, JSON.stringify(updated));
}

/** Get the full onboarding draft object */
export async function getOnboardingDraft() {
    const raw = await AsyncStorage.getItem(KEYS.ONBOARDING_DRAFT);
    return raw ? JSON.parse(raw) : null;
}

/** Clear the onboarding draft (keeps only target preferences for Dashboard) */
export async function clearOnboardingDraft() {
    const existing = await getOnboardingDraft();
    if (existing) {
        // Keep only target_country and target_degree_type for the Dashboard and assessments
        const cleanDraft = {
            target_country: existing.target_country,
            target_degree_type: existing.target_degree_type,
            step_reached: 5 // Optional: so we know they finished but we still have these fields
        };
        await AsyncStorage.setItem(KEYS.ONBOARDING_DRAFT, JSON.stringify(cleanDraft));
    } else {
        await AsyncStorage.removeItem(KEYS.ONBOARDING_DRAFT);
    }
}

// ── Profile Completion ─────────────────────────────────────────────────────────

/** Mark profile as complete */
export async function setProfileComplete(isComplete = true) {
    await AsyncStorage.setItem(KEYS.PROFILE_COMPLETE, isComplete ? 'true' : 'false');
}

/** Check if profile is complete */
export async function isProfileComplete() {
    const val = await AsyncStorage.getItem(KEYS.PROFILE_COMPLETE);
    return val === 'true';
}

// ── App State Check ────────────────────────────────────────────────────────────

/**
 * Master check on app open.
 * Returns one of:
 *   'dashboard'   — has token + profile complete
 *   'onboarding'  — has token + profile incomplete (resume from step_reached)
 *   'signin'      — has onboarding draft but no token
 *   'start'       — fresh install, nothing saved
 */
export async function getAppState() {
    try {
        const [token, profileComplete, draft] = await AsyncStorage.multiGet([
            KEYS.AUTH_TOKEN,
            KEYS.PROFILE_COMPLETE,
            KEYS.ONBOARDING_DRAFT,
        ]);

        const hasToken = !!token[1];
        const profileDone = profileComplete[1] === 'true';
        const hasDraft = !!draft[1];

        if (hasToken && profileDone) return { route: 'dashboard' };
        if (hasToken && !profileDone) return { route: 'onboarding', step: JSON.parse(draft[1] || '{}')?.step_reached || 1 };
        if (!hasToken && hasDraft) return { route: 'signin' };
        return { route: 'start' };

    } catch {
        return { route: 'start' };
    }
}

/** Full wipe — used on logout */
export async function clearAll() {
    await AsyncStorage.clear();
}