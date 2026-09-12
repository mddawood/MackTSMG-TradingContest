// Base Backend API configuration
export let API_URL = 'http://127.0.0.1:8000';

let onUnauthorizedCallback = null;

export function setUnauthorizedHandler(callback) {
    onUnauthorizedCallback = callback;
}

export async function loadConfig() {
    try {
        const response = await fetch('/config.json');
        if (response.ok) {
            const config = await response.json();
            if (config.API_URL) {
                API_URL = config.API_URL;
                console.log('Loaded API URL from config:', API_URL);
            }
        }
    } catch (e) {
        console.log('Using default API URL:', API_URL);
    }
}

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = { ...options.headers };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        // Handle 401 token expiration
        if (response.status === 401 && token) {
            if (onUnauthorizedCallback) {
                onUnauthorizedCallback();
            }
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Request failed with status ${response.status}`);
        }

        if (response.status === 204 || response.status === 244) {
            return null;
        }

        return await response.json();
    } catch (err) {
        console.error(`API Error (${endpoint}):`, err);
        throw err;
    }
}

// ==========================================================================
// Specialized API Services
// ==========================================================================

export const authAPI = {
    async login(email, password) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        return apiRequest('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });
    },

    async register(data) {
        return apiRequest('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    async getMe() {
        return apiRequest('/auth/me');
    },

    async forgotPassword(email) {
        return apiRequest('/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
    },

    async verifyResetToken(token) {
        return apiRequest(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
    },

    async resetPassword(token, newPassword) {
        return apiRequest('/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token,
                new_password: newPassword
            })
        });
    }
};

export const competitionsAPI = {
    async getAll() {
        return apiRequest('/competitions/');
    },

    async getMyRegistrations() {
        return apiRequest('/competitions/my-registrations');
    },

    async getLeaderboard(competitionId, { tier = '', period = '' } = {}) {
        let url = `/competitions/${competitionId}/leaderboard`;
        const params = new URLSearchParams();
        if (tier && tier !== 'All') params.append('tier', tier);
        if (period) params.append('period', period);
        const qs = params.toString();
        if (qs) url += `?${qs}`;
        return apiRequest(url);
    },

    async register(competitionId) {
        return apiRequest(`/competitions/${competitionId}/register`, { method: 'POST' });
    },

    async sync(competitionId) {
        return apiRequest(`/competitions/${competitionId}/sync`, { method: 'POST' });
    }
};

export const apiKeysAPI = {
    async getAll() {
        return apiRequest('/api-keys/');
    },

    async create(keyData) {
        return apiRequest('/api-keys/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(keyData)
        });
    },

    async validateKey(keyData) {
        return apiRequest('/api-keys/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(keyData)
        });
    },

    async getTrades(limit = 50) {
        return apiRequest(`/api-keys/trades?limit=${limit}`);
    },

    async delete(keyId) {
        return apiRequest(`/api-keys/${keyId}`, { method: 'DELETE' });
    }
};

export const adminAPI = {
    async getStats() {
        return apiRequest('/admin/stats');
    },

    async getUsers({ q = '', page = 1, limit = 10 } = {}) {
        return apiRequest(`/admin/users?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`);
    },

    async softDeleteUser(userId) {
        return apiRequest(`/admin/users/${userId}/soft-delete`, { method: 'POST' });
    },

    async restoreUser(userId) {
        return apiRequest(`/admin/users/${userId}/restore`, { method: 'POST' });
    },

    async hardDeleteUser(userId) {
        return apiRequest(`/admin/users/${userId}/hard-delete`, { method: 'DELETE' });
    },

    async promoteUser(userId) {
        return apiRequest(`/admin/users/${userId}/promote`, { method: 'POST' });
    },

    async getCompetitions({ q = '', page = 1, limit = 10 } = {}) {
        return apiRequest(`/admin/competitions?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`);
    },

    async createCompetition(data) {
        return apiRequest('/competitions/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    async toggleCompActive(competitionId) {
        return apiRequest(`/admin/competitions/${competitionId}/toggle-active`, { method: 'POST' });
    },

    async deleteCompetition(competitionId) {
        return apiRequest(`/admin/competitions/${competitionId}/delete`, { method: 'DELETE' });
    },

    async getWhitelist({ q = '', page = 1, limit = 10 } = {}) {
        return apiRequest(`/admin/referred-users?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`);
    },

    async addWhitelist(deltaUserId) {
        return apiRequest(`/admin/referred-users?delta_user_id=${encodeURIComponent(deltaUserId)}`, {
            method: 'POST'
        });
    },

    async deleteWhitelist(deltaUserId) {
        return apiRequest(`/admin/referred-users/${encodeURIComponent(deltaUserId)}`, {
            method: 'DELETE'
        });
    },

    async uploadWhitelist(file) {
        const formData = new FormData();
        formData.append('file', file);
        return apiRequest('/admin/referred-users/upload', {
            method: 'POST',
            body: formData
        });
    }
};
