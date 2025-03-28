import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for handling token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await api.post('/token/refresh/', { refresh: refreshToken });
                localStorage.setItem('access_token', response.data.access);
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return api(originalRequest);
            } catch (err) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const courseApi = {
    getAll: () => api.get('/courses/'),
    getById: (id) => api.get(`/courses/${id}/`),
    create: (data) => api.post('/courses/', data),
    update: (id, data) => api.put(`/courses/${id}/`, data),
    delete: (id) => api.delete(`/courses/${id}/`),
    getBooks: (id) => api.get(`/courses/${id}/books/`),
};

export const bookApi = {
    getAll: () => api.get('/books/'),
    getById: (id) => api.get(`/books/${id}/`),
    create: (data) => api.post('/books/', data),
    update: (id, data) => api.put(`/books/${id}/`, data),
    delete: (id) => api.delete(`/books/${id}/`),
};

export default api; 