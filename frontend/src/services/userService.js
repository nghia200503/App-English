import api from "../libs/axios";

export const userService = {
    getLeaderboard: async () => {
        try {
            const response = await api.get('/users/leaderboard');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};