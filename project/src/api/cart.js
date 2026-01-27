import client from './client';

const cartAPI = {
    // Get user's cart
    getCart: async () => {
        const response = await client.get('/cart');
        return response.data.cart;
    },

    // Add item to cart
    // Add item to cart
    addToCart: async (productId, quantity = 1, variant = null) => {
        const payload = { productId, quantity };
        if (variant) payload.variant = variant;

        const response = await client.post('/cart', payload);
        return response.data.cart;
    },

    // Update cart item quantity
    updateCartItem: async (itemId, quantity) => {
        const response = await client.put(`/cart/${itemId}`, {
            quantity
        });
        return response.data.cart;
    },

    // Remove item from cart
    removeFromCart: async (itemId) => {
        const response = await client.delete(`/cart/${itemId}`);
        return response.data.cart;
    },

    // Clear cart
    clearCart: async () => {
        const response = await client.delete('/cart');
        return response.data.cart;
    },

    // Apply promo code
    applyPromoCode: async (code) => {
        const response = await client.post('/cart/promo-code', {
            code
        });
        return response.data.cart;
    }
};

export default cartAPI;
