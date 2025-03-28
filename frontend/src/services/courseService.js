import api from './api';

const courseService = {
    getAll: async () => {
        const response = await api.get('/courses/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/courses/${id}/`);
        return response.data;
    },

    create: async (courseData) => {
        const response = await api.post('/courses/', courseData);
        return response.data;
    },

    update: async (id, courseData) => {
        const response = await api.put(`/courses/${id}/`, courseData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/courses/${id}/`);
        return id;
    },

    getRecommendations: async () => {
        const response = await api.get('/courses/recommendations/');
        return response.data;
    }
};

export default courseService; 