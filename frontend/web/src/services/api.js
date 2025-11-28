import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
};

// Vehicle API
export const vehicleAPI = {
    getAll: (params) => api.get('/vehicles', { params }),
    getById: (id) => api.get(`/vehicles/${id}`),
    checkAvailability: (id, params) => api.get(`/vehicles/${id}/availability`, { params }),
    create: (data) => api.post('/vehicles', data),
    update: (id, data) => api.put(`/vehicles/${id}`, data),
    delete: (id) => api.delete(`/vehicles/${id}`),
};

// Category API
export const categoryAPI = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
};

// Reservation API
export const reservationAPI = {
    create: (data) => api.post('/reservations', data),
    getAll: (params) => api.get('/reservations', { params }),
    getById: (id) => api.get(`/reservations/${id}`),
    updateStatus: (id, status) => api.patch(`/reservations/${id}/status`, { status }),
    cancel: (id) => api.post(`/reservations/${id}/cancel`),
};

// Payment API
export const paymentAPI = {
    createIntent: (data) => api.post('/payments/create-intent', data),
    getById: (id) => api.get(`/payments/${id}`),
    getByReservation: (reservationId) => api.get(`/payments/reservation/${reservationId}`),
    getByUser: (userId) => api.get(`/payments/user/${userId}`),
    refund: (id, data) => api.post(`/payments/${id}/refund`, data),
};

// Reports API
export const reportsAPI = {
    getRevenue: (params) => api.get('/reports/revenue', { params }),
    getUtilization: () => api.get('/reports/utilization'),
    getPopularCategories: () => api.get('/reports/popular-categories'),
    getDashboard: () => api.get('/reports/dashboard'),
};

export default api;
