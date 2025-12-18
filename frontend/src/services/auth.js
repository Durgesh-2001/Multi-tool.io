import axios from 'axios';

export const API_BASE = import.meta.env.VITE_BACKEND_URL;
export const defaultJsonHeaders = { 'Content-Type': 'application/json' };

export const post = (path, data, config = {}) => {
    const headers = { ...defaultJsonHeaders, ...(config.headers || {}) };
    return axios.post(`${API_BASE}${path}`, data, { ...config, headers });
};

export const getErrMsg = (err, fallback) =>
    err?.response?.data?.message || err?.response?.data?.error || fallback;

export const setAuth = (token, user) => {
    if (!token) return false;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user || { name: 'User' }));
    window.dispatchEvent(new Event('authChange'));
    return true;
};

export const getToken = () => localStorage.getItem('token') || '';

export const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
        return null;
    }
};

export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
};

export const authHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};
