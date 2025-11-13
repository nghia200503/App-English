import { GoogleGenerativeAI } from "@google/generative-ai";

// Khởi tạo GenAI với API Key từ file .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Đây là "hướng dẫn" để AI biết vai trò của nó
const systemInstruction = `
  Bạn là "Trợ lý Từ vựng AI" của một trang web học tiếng Anh. 
  Nhiệm vụ của bạn là chỉ trả lời các câu hỏi liên quan đến tiếng Anh.
  
  Luôn trả lời bằng tiếng Việt.
  
  Nếu người dùng hỏi về chủ đề không liên quan đến tiếng Anh (ví dụ: thời tiết, chính trị, code...), 
  hãy lịch sự từ chối và nhắc họ rằng bạn chỉ là trợ lý từ vựng.
  Quan trọng: Trả lời bằng văn bản thuần túy (plain text), không sử dụng Markdown, dấu hoa thị, hoặc bất kỳ định dạng đặc biệt nào.
`;

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp nội dung tin nhắn.",
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
    });

    const chat = model.startChat();
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      text: text,
    });

  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi kết nối với AI. Vui lòng thử lại sau.",
    });
  }
};