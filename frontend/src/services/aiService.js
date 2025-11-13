import api from '../libs/axios'; // Import file axios đã cấu hình

export const aiService = {
  /**
   * Gửi tin nhắn đến AI và nhận phản hồi
   * @param {string} message - Câu hỏi của người dùng
   */
  ask: async (message) => {
    try {
      const response = await api.post('/ai/chat', { message });
      return response.data; // Trả về { success: true, text: "..." }
    } catch (error) {
      console.error('Lỗi khi gọi AI service:', error);
      // Trả về một đối tượng lỗi chuẩn
      return error.response?.data || { 
        success: false, 
        text: 'Lỗi kết nối đến máy chủ AI.' 
      };
    }
  }
};