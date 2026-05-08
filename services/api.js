/**
 * services/api.js
 * ───────────────
 * Central API service for SmartVisa.
 * All fetch calls go through here — never write fetch() directly in screens.
 *
 * Usage:
 *   import api from '../services/api';
 *   const data = await api.auth.login(email, password);
 */

import { getToken } from './storage';

// ── Base Config ────────────────────────────────────────────────────────────────
// For physical device on same WiFi, replace with your machine's local IP
// e.g. http://192.168.1.5:8000
const BASE_URL = 'http://10.0.2.2:8000';   // Android emulator
// const BASE_URL = 'http://localhost:8000'; // iOS simulator

// ── Core Request Helper ────────────────────────────────────────────────────────
async function request(method, endpoint, body = null, requiresAuth = true) {
    const headers = {};
    const isFormData = body instanceof FormData;

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (requiresAuth) {
        const token = await getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { method, headers };
    if (body) {
        config.body = isFormData ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            // Return a structured error so screens can handle it cleanly
            throw {
                status: response.status,
                message: data?.detail || data?.error || JSON.stringify(data) || 'Something went wrong',
                data,
            };
        }

        return data;
    } catch (error) {
        // Network error (no connection, server down etc.)
        if (!error.status) {
            throw { status: 0, message: 'Cannot connect to server. Check your connection.' };
        }
        throw error;
    }
}

// ── Auth ───────────────────────────────────────────────────────────────────────
const auth = {
    /**
     * Register a new user.
     * POST /api/users/register/
     * Returns: { access, refresh, user: { id, email, name } }
     */
    register: (first_name, last_name, email, phone_number, password) =>
        request('POST', '/api/users/register/', { first_name, last_name, email, phone_number, password }, false),

    /**
     * Login existing user.
     * POST /api/users/login/
     * Returns: { access, refresh, user: { id, email, name } }
     */
    login: (email, password) =>
        request('POST', '/api/users/login/', { email, password }, false),

    /**
     * Refresh access token using refresh token.
     * POST /api/users/token/refresh/
     */
    refreshToken: (refreshToken) =>
        request('POST', '/api/users/token/refresh/', { refresh: refreshToken }, false),
};

// ── Student Profile ────────────────────────────────────────────────────────────
const profile = {
    /**
     * Get the logged-in student's full profile.
     * GET /api/profile/
     */
    get: () =>
        request('GET', '/api/profile/'),

    /**
     * Update basic profile info (name, phone etc).
     * PATCH /api/profile/update/
     */
    update: (data) =>
        request('PUT', '/api/profile/', data),

    /**
     * Save/update education record.
     * POST /api/profile/education/
     * Body: { degree_level, field_of_study, institution, gpa_percentage, backlogs }
     */
    saveEducation: (data) =>
        request('POST', '/api/profile/education/', data),

    /**
     * Save/update language test.
     * POST /api/profile/language/
     * Body: { test_type, overall_score, test_date }
     *   test_type: 'IELTS' | 'TOEFL' | 'PTE' | 'Duolingo'
     */
    saveLanguage: (data) =>
        request('POST', '/api/profile/language-tests/', data),

    /**
     * Save/update financial profile.
     * POST /api/profile/financial/
     * Body: { approx_savings, has_sponsor, sponsor_relationship }
     */
    saveFinancial: (data) =>
        request('PUT', '/api/profile/financial/', data),
};

// ── Universities ───────────────────────────────────────────────────────────────
const universities = {
    /**
     * List/search universities with optional filters.
     * GET /api/universities/?country=USA&search=MIT&page=1
     */
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request('GET', `/api/universities/?${query}`);
    },

    /**
     * Get single university detail.
     * GET /api/universities/<id>/
     */
    detail: (id) =>
        request('GET', `/api/universities/${id}/`),

    /**
     * Get all programs for a university.
     * GET /api/universities/<id>/programs/
     */
    programs: (universityId) =>
        request('GET', `/api/universities/${universityId}/programs/`),

    /**
     * Search programs across all universities.
     * GET /api/universities/programs/search/?country=USA&degree_type=Masters&field=Computer+Science
     */
    searchPrograms: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request('GET', `/api/universities/programs/search/?${query}`);
    },
};

// ── Assessments ───────────────────────────────────────────────────────────────
const assessments = {
    /**
     * Run a full assessment (eligibility + probability + cost).
     * POST /api/assessments/run/
     * Body: { target_country, target_degree_type, target_field?, max_results? }
     */
    run: (data) =>
        request('POST', '/api/assessments/run/', data),

    /**
     * List all past assessments.
     * GET /api/assessments/
     */
    list: () =>
        request('GET', '/api/assessments/'),

    /**
     * Get full detail of one assessment.
     * GET /api/assessments/<id>/
     */
    detail: (id) =>
        request('GET', `/api/assessments/${id}/`),

    /**
     * Delete an assessment.
     * DELETE /api/assessments/<id>/delete/
     */
    delete: (id) =>
        request('DELETE', `/api/assessments/${id}/delete/`),

    /**
     * Get standalone cost estimate for one program.
     * GET /api/assessments/cost/<programId>/?country=USA
     */
    programCost: (programId, country) =>
        request('GET', `/api/assessments/cost/${programId}/?country=${country}`),

    /**
     * Get fixed visa + insurance info for a country.
     * GET /api/assessments/cost-info/<country>/
     */
    countryInfo: (country) =>
        request('GET', `/api/assessments/cost-info/${country}/`),

    /**
     * Compare two programs head-to-head against the student's profile.
     * POST /api/assessments/compare/
     * Returns: { university_a, university_b, comparison, verdict }
     */
    compare: (programAId, programBId) =>
        request('POST', '/api/assessments/compare/', {
            program_a_id: programAId,
            program_b_id: programBId,
        }),

    /**
     * Search programs across all universities (used by Uni Compare screen).
     * GET /api/assessments/programs/search/
     * Params: { q, country, degree_type, field, university, page, page_size }
     */
    searchPrograms: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request('GET', `/api/assessments/programs/search/?${query}`);
    },
};

// ── Documents ──────────────────────────────────────────────────────────────────
const documents = {
    /**
     * List all document definitions.
     * GET /api/documents/definitions/?country=USA&phase=VISA
     */
    getDefinitions: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request('GET', `/api/documents/definitions/?${query}`);
    },

    /**
     * List user's uploaded documents.
     * GET /api/documents/
     */
    list: () =>
        request('GET', '/api/documents/'),

    /**
     * Upload a new document.
     * POST /api/documents/
     * Body: { definition_slug, file (base64 or multipart) }
     */
    upload: (data) =>
        request('POST', '/api/documents/', data),
};

// ── Chatbot ────────────────────────────────────────────────────────────────
const chatbot = {
    /**
     * Send a message to the AI chatbot.
     * POST /api/chatbot/message/
     * Body: { message, history: [{ role, content }] }
     */
    message: (message, history = []) =>
        request('POST', '/api/chatbot/message/', { message, history }),

    /**
     * Get smart suggested questions based on the student's profile.
     * GET /api/chatbot/suggestions/
     */
    suggestions: () =>
        request('GET', '/api/chatbot/suggestions/'),
};

export default { auth, profile, universities, assessments, documents, chatbot };