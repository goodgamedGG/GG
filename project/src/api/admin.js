import client from './client';

const adminAPI = {
    // Get stats
    getStats: async (period = 'month') => {
        const response = await client.get('/admin/stats', { params: { period } });
        return response.data.data;
    },

    // Get recent activity/audit logs
    getAuditLogs: async (params = {}) => {
        const response = await client.get('/admin/audit-logs', { params });
        return response.data.data;
    },

    // Get recent orders
    getRecentOrders: async (limit = 5) => {
        const response = await client.get('/admin/orders', { params: { limit } });
        return response.data.data;
    },

    // Update settings
    updateSettings: async (settings) => {
        const response = await client.put('/admin/settings', settings);
        return response.data.data;
    },

    // Get settings
    getSettings: async () => {
        const response = await client.get('/admin/settings');
        return response.data.data;
    }
};

export default adminAPI;
