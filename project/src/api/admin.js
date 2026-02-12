import client from './client';

const adminAPI = {
    // Stats & Analytics
    getStats: async (period = 'month') => {
        const response = await client.get('/admin/stats', { params: { period } });
        return response.data.data;
    },

    getAuditLogs: async (params = {}) => {
        const response = await client.get('/admin/audit-logs', { params });
        return response.data.data;
    },

    getRecentOrders: async (limit = 5) => {
        // Using the admin/all endpoint but limiting logic might need to be query based or filtered
        const response = await client.get('/orders/admin/all', { params: { limit, page: 1 } });
        // Backend returns { orders, pagination }
        return response.data.data.orders ? response.data.data.orders.slice(0, limit) : [];
    },

    // Products
    getProducts: async (page = 1, limit = 10, search = '') => {
        const params = { page, limit };
        if (search) params.search = search;
        const response = await client.get('/products', { params });
        // Public endpoint returns { products, pages, page, total } directly in data.data or root
        return response.data.data || response.data;
    },

    createProduct: async (productData) => {
        const response = await client.post('/products', productData, {
            headers: { 'Content-Type': undefined } // Let browser set multipart/form-data with boundary
        });
        return response.data.data;
    },

    updateProduct: async (id, productData) => {
        const response = await client.put(`/products/${id}`, productData, {
            headers: { 'Content-Type': undefined }
        });
        return response.data.data;
    },

    deleteProduct: async (id) => {
        const response = await client.delete(`/products/${id}`);
        return response.data;
    },

    getProductById: async (id) => {
        const response = await client.get(`/products/${id}/admin`);
        return response.data.data;
    },

    // Orders
    getOrders: async (page = 1, limit = 10, status = '', paymentStatus = '') => {
        const params = { page, limit };
        if (status && status !== 'all') params.status = status;
        if (paymentStatus) params.paymentStatus = paymentStatus;

        const response = await client.get('/orders/admin/all', { params });
        return response.data.data;
    },

    getOrderStats: async (days = 30) => {
        const response = await client.get('/orders/admin/stats', { params: { days } });
        return response.data.data;
    },

    updateOrderStatus: async (id, status, message) => {
        const response = await client.patch(`/orders/${id}/status`, { status, message });
        return response.data.data;
    },

    updateEstimatedDelivery: async (id, date) => {
        const response = await client.patch(`/orders/${id}/delivery`, { estimatedDelivery: date });
        return response.data.data;
    },

    // Users
    getUsers: async (page = 1, limit = 10, role = '') => {
        const params = { page, limit };
        if (role) params.role = role;
        const response = await client.get('/users', { params });
        return response.data.data;
    },

    getUserById: async (id) => {
        const response = await client.get(`/users/${id}`);
        return response.data.data;
    },

    updateUser: async (id, userData) => {
        const response = await client.put(`/users/${id}`, userData);
        return response.data.data;
    },

    updateUserRole: async (id, role) => {
        const response = await client.put(`/users/${id}/role`, { role });
        return response.data.data;
    },

    deleteUser: async (id) => {
        const response = await client.delete(`/users/${id}`);
        return response.data;
    },

    bulkUpdateUsers: async (data) => {
        const response = await client.post('/users/bulk', data);
        return response.data;
    },

    // Categories
    getCategories: async (params = {}) => {
        // Public endpoint
        const response = await client.get('/categories', { params });
        return response.data.data.categories;
    },

    createCategory: async (categoryData) => {
        const response = await client.post('/categories', categoryData);
        return response.data.data;
    },

    updateCategory: async (id, categoryData) => {
        const response = await client.put(`/categories/${id}`, categoryData);
        return response.data.data;
    },

    deleteCategory: async (id) => {
        const response = await client.delete(`/categories/${id}`);
        return response.data;
    },

    // Global Settings
    getSettings: async () => {
        const response = await client.get('/admin/settings');
        return response.data.data;
    },

    updateSettings: async (settings) => {
        // Assuming settings is an array or object to be updated one by one or bulk?
        // Backend expects PUT /settings/:key. 
        // Front end might need loop or bulk endpoint if implemented.
        // For now, let's assume specific key updates or leave as placeholder
        console.warn("updateSettings bulk not fully implemented in backend");
        return null;
    }
};

export default adminAPI;
