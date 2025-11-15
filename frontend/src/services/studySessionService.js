// frontend/src/services/studySessionService.js
import api from '../libs/axios';

export const studySessionService = {
  saveSession: async (data) => {
    try {
      // Gọi đúng endpoint mới là /study-sessions
      const response = await api.post('/study-sessions', data);
      return response.data;
    } catch (error) {
      console.error("Lỗi lưu lịch sử:", error);
      return null;
    }
  },
  
  getHistory: async () => {
      try {
          const response = await api.get('/study-sessions');
          return response.data;
      } catch (error) {
          return null;
      }
  }
};