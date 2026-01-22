import client from './client';

export const gamesApi = {
    getAll: async () => {
        return client.get('/games');
    },

    getOne: async (id) => {
        return client.get(`/games/${id}`);
    },

    create: async (gameData) => {
        return client.post('/games', gameData);
    },

    update: async (id, gameData) => {
        return client.put(`/games/${id}`, gameData);
    },

    delete: async (id) => {
        return client.delete(`/games/${id}`);
    }
};
