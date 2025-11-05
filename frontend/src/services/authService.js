import api from "../libs/axios";

export const authService = {

    // Đăng ký người dùng mới
    register: async (username, password, email, firstName, lastName) => {
        const res = await api.post(
            '/auth/register', 
            { username, password, email, firstName, lastName },
            { withCredentials: true }
        );

        return res.data;
    },

    // Đăng nhập người dùng
    login: async (
        username, 
        password
    ) => {
        const res = await api.post("auth/login", 
            { username, password }, { withCredentials: true });
        return res.data; // trả về accessToken
    },

    // Đăng xuất người dùng
    logout: async () => {
        return api.post('/auth/logout', {}, { withCredentials: true });
    },

    // Lấy thông tin người dùng hiện tại
    fetchMe: async () => {
        const res =  await api.get('/users/me', { withCredentials: true });
        return res.data.user;
    },

    // Làm mới access token
    refresh: async () => {
        const res = await api.post('/auth/refresh', { withCredentials: true });
        return res.data.accessToken;
    },

    // Lấy danh sách tất cả người dùng (dành cho admin)
    getAllUsers: async (page = 1, limit = 5) => {
        const res = await api.get('/users/list', {
            params: { page, limit }
        });
        
        // Trả về mảng data người dùng
        return res.data;
    }
}