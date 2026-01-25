const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token management - use sessionStorage instead of localStorage for better security
// Access token is short-lived, refresh token is in httpOnly cookie
const getToken = () => sessionStorage.getItem('accessToken');
const setToken = (token) => sessionStorage.setItem('accessToken', token);
const removeToken = () => sessionStorage.removeItem('accessToken');

// Get CSRF token from cookie
const getCSRFToken = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrf-token') {
            return decodeURIComponent(value);
        }
    }
    return null;
};

// Refresh access token using refresh token from cookie
const refreshAccessToken = async () => {
    try {
        const response = await fetch(`${API_URL}/auth/refresh-token`, {
            method: 'POST',
            credentials: 'include', // Include cookies
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.data?.token) {
                setToken(data.data.token);
                return data.data.token;
            }
        }
        
        // Refresh failed, clear token and redirect to login
        removeToken();
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        return null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        removeToken();
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        return null;
    }
};

// Create headers with auth token and CSRF token
const createHeaders = (isFormData = false) => {
    const headers = {};
    const token = getToken();
    const csrfToken = getCSRFToken();

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
    }

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

// Handle API errors with automatic token refresh
const handleResponse = async (res, endpoint, options = {}) => {
    const data = await res.json();

    if (!res.ok) {
        // Handle unauthorized errors - try to refresh token
        if (res.status === 401 && !options.skipRefresh) {
            const newToken = await refreshAccessToken();
            
            if (newToken && options.retry) {
                // Retry the original request with new token
                const retryOptions = {
                    ...options,
                    skipRefresh: true, // Prevent infinite loop
                    retry: false
                };
                return makeRequest(endpoint, retryOptions);
            }
            
            // If refresh failed or no retry, redirect to login
            if (!newToken) {
                removeToken();
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }

        throw new Error(data.error || data.message || 'API Error');
    }

    return data;
};

// Make request with automatic retry on 401
const makeRequest = async (endpoint, options = {}) => {
    const { method = 'GET', body, isFormData = false, skipRefresh = false, retry = true } = options;
    
    const fetchOptions = {
        method,
        credentials: 'include', // Include cookies for refresh token
        headers: createHeaders(isFormData),
        body: isFormData ? body : (body ? JSON.stringify(body) : undefined)
    };

    const res = await fetch(`${API_URL}${endpoint}`, fetchOptions);
    return handleResponse(res, endpoint, { skipRefresh, retry, method, body, isFormData });
};

const client = {
    // GET request
    get: async (endpoint) => {
        return makeRequest(endpoint, { method: 'GET' });
    },

    // POST request
    post: async (endpoint, data, isFormData = false) => {
        return makeRequest(endpoint, { method: 'POST', body: data, isFormData });
    },

    // PUT request
    put: async (endpoint, data, isFormData = false) => {
        return makeRequest(endpoint, { method: 'PUT', body: data, isFormData });
    },

    // PATCH request
    patch: async (endpoint, data) => {
        return makeRequest(endpoint, { method: 'PATCH', body: data });
    },

    // DELETE request
    delete: async (endpoint, data = null) => {
        return makeRequest(endpoint, { method: 'DELETE', body: data });
    },

    // Token management helpers
    setAuthToken: setToken,
    getAuthToken: getToken,
    removeAuthToken: removeToken,
    
    // Logout - clear token and call logout endpoint
    logout: async () => {
        try {
            await makeRequest('/auth/logout', { method: 'POST', skipRefresh: true });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            removeToken();
        }
    }
};

export default client;
