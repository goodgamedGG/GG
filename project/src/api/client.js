const API_URL = 'http://localhost:5000/api';

// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// Create headers with auth token
const createHeaders = (isFormData = false) => {
    const headers = {};
    const token = getToken();

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

// Handle API errors
const handleResponse = async (res) => {
    const data = await res.json();

    if (!res.ok) {
        // Handle unauthorized errors
        if (res.status === 401) {
            removeToken();
            window.location.href = '/login';
        }

        throw new Error(data.error || data.message || 'API Error');
    }

    return data;
};

const client = {
    // GET request
    get: async (endpoint) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: createHeaders()
        });
        return handleResponse(res);
    },

    // POST request
    post: async (endpoint, data, isFormData = false) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: createHeaders(isFormData),
            body: isFormData ? data : JSON.stringify(data)
        });
        return handleResponse(res);
    },

    // PUT request
    put: async (endpoint, data, isFormData = false) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: createHeaders(isFormData),
            body: isFormData ? data : JSON.stringify(data)
        });
        return handleResponse(res);
    },

    // PATCH request
    patch: async (endpoint, data) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: createHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    // DELETE request
    delete: async (endpoint) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: createHeaders()
        });
        return handleResponse(res);
    },

    // Token management helpers
    setAuthToken: setToken,
    getAuthToken: getToken,
    removeAuthToken: removeToken
};

export default client;
