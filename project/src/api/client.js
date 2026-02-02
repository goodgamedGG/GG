import axios from 'axios';

// Create axios instance
const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Important for cookies (refreshToken)
});

// Helper to set auth token
const setAuthToken = (token) => {
    if (token) {
        client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
    } else {
        delete client.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
    }
};

// Helper to get auth token
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Helper to remove auth token
const removeAuthToken = () => {
    delete client.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
};

// Initialize token from storage
const token = getAuthToken();
if (token) {
    setAuthToken(token);
}

// Request interceptor
client.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
client.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized (Token expired)
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                // Note: This endpoint should set the new cookie and return the new access token
                const response = await client.post('/auth/refresh-token');

                if (response.data && response.data.accessToken) {
                    const { accessToken } = response.data;
                    setAuthToken(accessToken);
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                    return client(originalRequest);
                }
            } catch (err) {
                // Refresh failed - logout user
                removeAuthToken();
                // Optional: Redirect to login or emit logout event
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

// Attach helpers to client instance
client.setAuthToken = setAuthToken;
client.getAuthToken = getAuthToken;
client.removeAuthToken = removeAuthToken;

export default client;
