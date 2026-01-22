import client from './client';

const categoriesAPI = {
    // Get all categories
    getCategories: async (activeOnly = false) => {
        const endpoint = activeOnly ? '/categories?active=true' : '/categories';
        const response = await client.get(endpoint);
        return response.data.categories;
    },

    // Get category by ID
    getCategoryById: async (id) => {
        const response = await client.get(`/categories/${id}`);
        return response.data.category;
    },

    // Create category (Admin)
    createCategory: async (categoryData) => {
        const formData = new FormData();

        formData.append('name', categoryData.name);
        if (categoryData.description) {
            formData.append('description', categoryData.description);
        }
        if (categoryData.image) {
            formData.append('categoryImage', categoryData.image);
        }

        const response = await client.post('/categories', formData, true);
        return response.data.category;
    },

    // Update category (Admin)
    updateCategory: async (id, categoryData) => {
        const formData = new FormData();

        if (categoryData.name) {
            formData.append('name', categoryData.name);
        }
        if (categoryData.description !== undefined) {
            formData.append('description', categoryData.description);
        }
        if (categoryData.image instanceof File) {
            formData.append('categoryImage', categoryData.image);
        }

        const response = await client.put(`/categories/${id}`, formData, true);
        return response.data.category;
    },

    // Delete category (Admin)
    deleteCategory: async (id) => {
        const response = await client.delete(`/categories/${id}`);
        return response;
    },

    // Toggle category status (Admin)
    toggleCategoryStatus: async (id) => {
        const response = await client.patch(`/categories/${id}/toggle`);
        return response.data.category;
    }
};

export default categoriesAPI;
