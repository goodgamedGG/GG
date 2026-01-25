import client from './client';

const adminAPI = {
    // Dashboard Stats
    getStats: async () => {
        const response = await client.get('/admin/stats');
        return response.data;
    },
    getAnalytics: async (period = 30) => {
        const response = await client.get(`/admin/analytics?period=${period}`);
        return response.data;
    },
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
    getUsers: async (page = 1, limit = 10, role = '') => {
        let url = `/users?page=${page}&limit=${limit}`;
        if (role) url += `&role=${role}`;
        const response = await client.get(url);
        return response.data;
    },
    getUserById: async (userId) => {
        const response = await client.get(`/users/${userId}`);
        return response.data;
    },
    updateUser: async (userId, data) => {
        const response = await client.put(`/users/${userId}`, data);
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
    bulkUpdateUsers: async (userIds, updates) => {
        const response = await client.post('/users/bulk', { userIds, updates });
        return response.data;
    },

    // Products
    getProducts: async (page = 1, limit = 20) => {
        const response = await client.get(`/products?page=${page}&limit=${limit}`);
        return response.data;
    },
    getAdminProducts: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });
        const response = await client.get(`/admin/products?${params.toString()}`);
        return response.data;
    },
    getProductById: async (productId) => {
        const response = await client.get(`/products/${productId}/admin`);
        return response.data;
    },
    getProductStats: async () => {
        const response = await client.get('/admin/products/stats');
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
    toggleFeatured: async (productId) => {
        const response = await client.patch(`/admin/products/${productId}/feature`);
        return response.data;
    },
    updateProductTags: async (productId, tags) => {
        const response = await client.patch(`/admin/products/${productId}/tags`, { tags });
        return response.data;
    },
    bulkUpdateProducts: async (productIds, updates) => {
        const response = await client.post('/admin/products/bulk', { productIds, updates });
        return response.data;
    },
    bulkDeleteProducts: async (productIds) => {
        const response = await client.delete('/admin/products/bulk', { productIds });
        return response.data;
    },

    // Orders
    getOrders: async (page = 1, limit = 10, status = '', paymentStatus = '') => {
        let url = `/orders/admin/all?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        if (paymentStatus) url += `&paymentStatus=${paymentStatus}`;
        const response = await client.get(url);
        return response.data;
    },
    getOrderStats: async (period = 30) => {
        const response = await client.get(`/orders/admin/stats?period=${period}`);
        return response.data;
    },
    updateOrderStatus: async (orderId, status, message = '') => {
        const response = await client.patch(`/orders/${orderId}/status`, { status, message });
        return response.data;
    },
    updateEstimatedDelivery: async (orderId, estimatedDelivery) => {
        const response = await client.patch(`/orders/${orderId}/delivery`, { estimatedDelivery });
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
    getCategoryStats: async () => {
        const response = await client.get('/admin/categories/stats');
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
    bulkUpdateCategories: async (categoryIds, updates) => {
        const response = await client.post('/admin/categories/bulk', { categoryIds, updates });
        return response.data;
    },

    // Promo Codes
    getPromoCodes: async () => {
        const response = await client.get('/promo-codes');
        return response.data;
    },
    getPromoCodeStats: async (promoId = null) => {
        const url = promoId ? `/admin/promo-codes/stats/${promoId}` : '/admin/promo-codes/stats';
        const response = await client.get(url);
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
    },

    // Reviews
    getReviews: async (page = 1, limit = 50, approved = '', rating = '') => {
        let url = `/admin/reviews?page=${page}&limit=${limit}`;
        if (approved !== '') url += `&approved=${approved}`;
        if (rating) url += `&rating=${rating}`;
        const response = await client.get(url);
        return response.data;
    },
    moderateReview: async (reviewId, isApproved) => {
        const response = await client.patch(`/admin/reviews/${reviewId}`, { isApproved });
        return response.data;
    },

    // Content Management
    getBanners: async () => {
        const response = await client.get('/content/banners');
        return response.data;
    },
    getAllBannersAdmin: async () => {
        const response = await client.get('/admin/content/banners');
        return response.data;
    },
    createBanner: async (formData) => {
        const response = await client.post('/content/banners', formData, true);
        return response.data;
    },
    updateBanner: async (bannerId, formData) => {
        const response = await client.put(`/content/banners/${bannerId}`, formData, true);
        return response.data;
    },
    deleteBanner: async (bannerId) => {
        const response = await client.delete(`/content/banners/${bannerId}`);
        return response.data;
    },
    reorderBanners: async (bannerOrders) => {
        const response = await client.patch('/admin/content/banners/reorder', { bannerOrders });
        return response.data;
    },
    getFeaturedProducts: async (section = '') => {
        let url = '/content/featured';
        if (section) url += `?section=${section}`;
        const response = await client.get(url);
        return response.data;
    },
    getAllFeaturedAdmin: async (section = '') => {
        let url = '/admin/content/featured';
        if (section) url += `?section=${section}`;
        const response = await client.get(url);
        return response.data;
    },
    addFeaturedProduct: async (data) => {
        const response = await client.post('/content/featured', data);
        return response.data;
    },
    updateFeaturedProduct: async (featuredId, data) => {
        const response = await client.put(`/content/featured/${featuredId}`, data);
        return response.data;
    },
    removeFeaturedProduct: async (featuredId) => {
        const response = await client.delete(`/content/featured/${featuredId}`);
        return response.data;
    },
    reorderFeatured: async (featuredOrders) => {
        const response = await client.patch('/admin/content/featured/reorder', { featuredOrders });
        return response.data;
    },

    // Flash Sales
    getFlashSales: async () => {
        const response = await client.get('/flash-sales');
        return response.data;
    },
    createFlashSale: async (data) => {
        const response = await client.post('/flash-sales', data);
        return response.data;
    },
    endFlashSale: async (productId) => {
        const response = await client.delete(`/flash-sales/${productId}`);
        return response.data;
    },

    // Price Alerts
    getPriceAlerts: async (page = 1, limit = 50, status = '') => {
        let url = `/admin/price-alerts?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        const response = await client.get(url);
        return response.data;
    },
    checkPriceDrops: async () => {
        const response = await client.post('/price-alerts/check');
        return response.data;
    },

    // Loyalty Points
    getLoyaltyPoints: async (page = 1, limit = 50, tier = '', minPoints = '') => {
        let url = `/admin/loyalty?page=${page}&limit=${limit}`;
        if (tier) url += `&tier=${tier}`;
        if (minPoints) url += `&minPoints=${minPoints}`;
        const response = await client.get(url);
        return response.data;
    },
    adjustLoyaltyPoints: async (userId, points, reason = '') => {
        const response = await client.patch(`/admin/loyalty/${userId}`, { points, reason });
        return response.data;
    },
    getLeaderboard: async (limit = 10) => {
        const response = await client.get(`/loyalty/leaderboard?limit=${limit}`);
        return response.data;
    },

    // Settings
    getSettings: async (category = '') => {
        let url = '/admin/settings';
        if (category) url += `?category=${category}`;
        const response = await client.get(url);
        return response.data;
    },
    updateSetting: async (key, value, description = '', isPublic = false) => {
        const response = await client.put(`/admin/settings/${key}`, { value, description, isPublic });
        return response.data;
    },

    // Email Queue
    getEmailQueue: async (page = 1, limit = 50, status = '') => {
        let url = `/admin/emails?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        const response = await client.get(url);
        return response.data;
    },
    retryEmails: async () => {
        const response = await client.post('/admin/emails/retry');
        return response.data;
    },
    deleteEmailFromQueue: async (emailId) => {
        const response = await client.delete(`/admin/emails/${emailId}`);
        return response.data;
    },

    // Audit Logs
    getAuditLogs: async (page = 1, limit = 50, filters = {}) => {
        const params = new URLSearchParams({ page, limit });
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });
        const response = await client.get(`/audit-logs?${params.toString()}`);
        return response.data;
    },
    getAuditLogById: async (logId) => {
        const response = await client.get(`/audit-logs/${logId}`);
        return response.data;
    },

    // Wishlists & Recently Viewed
    getWishlists: async (page = 1, limit = 50) => {
        const response = await client.get(`/admin/wishlists?page=${page}&limit=${limit}`);
        return response.data;
    },
    getRecentlyViewed: async (page = 1, limit = 50) => {
        const response = await client.get(`/admin/recently-viewed?page=${page}&limit=${limit}`);
        return response.data;
    }
};

export default adminAPI;
