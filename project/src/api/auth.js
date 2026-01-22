import client from './client';

const authAPI = {
    // Signup
    signup: async (name, email, password, phone) => {
        const response = await client.post('/auth/signup', {
            name,
            email,
            password,
            phone
        });
        return response.data;
    },

    // Login
    login: async (email, password) => {
        const response = await client.post('/auth/login', {
            email,
            password
        });

        if (response.data.token) {
            client.setAuthToken(response.data.token);
        }

        return response.data;
    },

    // Verify email
    verifyEmail: async (email, code) => {
        const response = await client.post('/auth/verify-email', {
            email,
            code
        });

        if (response.data.token) {
            client.setAuthToken(response.data.token);
        }

        return response.data;
    },

    // Resend verification code
    resendVerification: async (email) => {
        const response = await client.post('/auth/resend-verification', {
            email
        });
        return response;
    },

    // Forgot password
    forgotPassword: async (email) => {
        const response = await client.post('/auth/forgot-password', {
            email
        });
        return response;
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
        const response = await client.post('/auth/reset-password', {
            token,
            newPassword
        });
        return response;
    },

    // Logout
    logout: () => {
        client.removeAuthToken();
    },

    // Get current user profile
    getProfile: async () => {
        const response = await client.get('/users/profile');
        return response.data.user;
    },

    // Update profile
    updateProfile: async (data) => {
        const response = await client.put('/users/profile', data);
        return response.data.user;
    },

    // Change password
    changePassword: async (currentPassword, newPassword) => {
        const response = await client.put('/users/change-password', {
            currentPassword,
            newPassword
        });
        return response;
    }
};

export default authAPI;
