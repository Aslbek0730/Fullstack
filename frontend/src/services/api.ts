import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token is invalid, logout the user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/token/', {
      email,
      password,
    });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    return response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    username: string;
  }) => {
    const response = await api.post('/users/register/', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },
};

// Course service
export const courseService = {
  getAllCourses: async () => {
    const response = await api.get('/courses/');
    return response.data;
  },

  getCourseById: async (id: number) => {
    const response = await api.get(`/courses/${id}/`);
    return response.data;
  },

  enrollInCourse: async (courseId: number) => {
    const response = await api.post(`/courses/${courseId}/enroll/`);
    return response.data;
  },
};

// AI service
export const aiService = {
  startChat: async (courseId?: number) => {
    const response = await api.post('/ai/chatbot/start_conversation/', {
      course_id: courseId,
    });
    return response.data;
  },

  sendMessage: async (conversationId: number, message: string) => {
    const response = await api.post(`/ai/chatbot/${conversationId}/send_message/`, {
      message,
    });
    return response.data;
  },

  getChatHistory: async (conversationId: number) => {
    const response = await api.get(`/ai/chatbot/${conversationId}/get_history/`);
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get('/ai/recommendations/get_recommendations/');
    return response.data;
  },

  textToSpeech: async (text: string, voice: string = 'alloy') => {
    const response = await api.post('/ai/voice/text_to_speech/', {
      text,
      voice,
    });
    return response.data;
  },
};

// Test service
export const testService = {
  submitAnswer: async (questionId: number, answer: string) => {
    const response = await api.post(`/ai/assessment/${questionId}/grade_answer/`, {
      answer,
    });
    return response.data;
  },
}; 