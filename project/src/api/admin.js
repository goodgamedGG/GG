import client from './client';

const adminAPI = {
    // Dashboard Stats
    getDashboardStats: async () => {
        const [products, users, orders] = await Promise.all([
            client.get('/products').catch(() => ({ data: { products: [] } })),
            client.get('/users').catch(() => ({ data: { users: [] } })),
            client.get('/orders/admin/all').catch(() => ({ data: { orders: [] } }))
        ]);
        return {
            products: products.data?.products || [],
            users: users.data?.users || [],
            orders: orders.data?.orders || []
        };
    },

    // Users
    getUsers: async (page = 1, limit = 10) => {
        const response = await client.get(`/users?page=${page}&limit=${limit}`);
        return response.data;
    },
    updateUserRole: async (userId, role) => {
        const response = await client.put(`/users/${userId}/role`, { role });
        return response.data;
    },
    deleteUser: async (userId) => {
        const response = await client.delete(`/users/${userId}`);
        return response;
    },

    // Products
    getProducts: async (page = 1, limit = 20) => {
        const response = await client.get(`/products?page=${page}&limit=${limit}`);
        return response.data;
    },
    createProduct: async (formData) => {
        const response = await client.post('/products', formData, true);
        return response.data;
    },
    updateProduct: async (productId, formData) => {
        const response = await client.put(`/products/${productId}`, formData, true);
        return response.data;
    },
    deleteProduct: async (productId) => {
        const response = await client.delete(`/products/${productId}`);
        return response;
    },
    toggleProduct: async (productId) => {
        const response = await client.patch(`/products/${productId}/toggle`);
        return response.data;
    },

    // Orders
    getOrders: async (page = 1, limit = 10, status = '') => {
        let url = `/orders/admin/all?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        const response = await client.get(url);
        return response.data;
    },
    updateOrderStatus: async (orderId, status) => {
        const response = await client.patch(`/orders/${orderId}/status`, { status });
        return response.data;
    },

    // Payments
    getPayments: async (page = 1, limit = 10, status = '') => {
        let url = `/payments?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        const response = await client.get(url);
        return response.data;
    },
    confirmPayment: async (paymentId) => {
        const response = await client.patch(`/payments/${paymentId}/confirm`);
        return response.data;
    },
    rejectPayment: async (paymentId, reason) => {
        const response = await client.patch(`/payments/${paymentId}/reject`, { rejectionReason: reason });
        return response.data;
    },

    // Categories
    getCategories: async () => {
        const response = await client.get('/categories');
        return response.data;
    },
    createCategory: async (formData) => {
        const response = await client.post('/categories', formData, true);
        return response.data;
    },
    updateCategory: async (categoryId, formData) => {
        const response = await client.put(`/categories/${categoryId}`, formData, true);
        return response.data;
    },
    deleteCategory: async (categoryId) => {
        const response = await client.delete(`/categories/${categoryId}`);
        return response;
    },
    toggleCategory: async (categoryId) => {
        const response = await client.patch(`/categories/${categoryId}/toggle`);
        return response.data;
    },

    // Promo Codes
    getPromoCodes: async () => {
        const response = await client.get('/promo-codes');
        return response.data;
    },
    createPromoCode: async (data) => {
        const response = await client.post('/promo-codes', data);
        return response.data;
    },
    updatePromoCode: async (promoId, data) => {
        const response = await client.put(`/promo-codes/${promoId}`, data);
        return response.data;
    },
    deletePromoCode: async (promoId) => {
        const response = await client.delete(`/promo-codes/${promoId}`);
        return response;
    },
    togglePromoCode: async (promoId) => {
        const response = await client.patch(`/promo-codes/${promoId}/toggle`);
        return response.data;
    }
};

export default adminAPI;
