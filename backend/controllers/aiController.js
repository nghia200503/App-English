// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Khởi tạo GenAI với API Key từ file .env
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // Đây là "hướng dẫn" để AI biết vai trò của nó
// const systemInstruction = `
//   Bạn là "Trợ lý Từ vựng AI" của một trang web học tiếng Anh. 
//   Nhiệm vụ của bạn là chỉ trả lời các câu hỏi liên quan đến tiếng Anh.
  
//   Luôn trả lời bằng tiếng Việt.
  
//   Nếu người dùng hỏi về chủ đề không liên quan đến tiếng Anh (ví dụ: thời tiết, chính trị, code...), 
//   hãy lịch sự từ chối và nhắc họ rằng bạn chỉ là trợ lý từ vựng.
//   Quan trọng: Trả lời bằng văn bản thuần túy (plain text), không sử dụng Markdown, dấu hoa thị, hoặc bất kỳ định dạng đặc biệt nào.
// `;

// export const chatWithAI = async (req, res) => {
//   try {
//     const { message } = req.body;

//     if (!message) {
//       return res.status(400).json({
//         success: false,
//         message: "Vui lòng cung cấp nội dung tin nhắn.",
//       });
//     }

//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.5-flash",
//       systemInstruction: systemInstruction,
//     });

//     const chat = model.startChat();
//     const result = await chat.sendMessage(message);
//     const response = await result.response;
//     const text = response.text();

//     res.json({
//       success: true,
//       text: text,
//     });

//   } catch (error) {
//     console.error("Lỗi khi gọi Gemini API:", error);
//     res.status(500).json({
//       success: false,
//       message: "Lỗi máy chủ khi kết nối với AI. Vui lòng thử lại sau.",
//     });
//   }
// };
import { GoogleGenerativeAI } from "@google/generative-ai";
import progressModel from "../models/progressModel.js";
import wordModel from "../models/wordModel.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getRecommendWords = async (req, res) => {
  try {
    const userId = req.user.id; 

    // 1. Lấy danh sách các từ người dùng làm sai (incorrectCount > 0)
    // Sắp xếp giảm dần theo số lần sai để lấy những từ sai nhiều nhất
    const weakProgress = await progressModel.find({ 
        user: userId,
        incorrectCount: { $gt: 0 } // Chỉ lấy từ có số lần sai > 0
      })
      .sort({ incorrectCount: -1 })
      .limit(5) // Lấy tối đa 5 từ sai nhiều nhất để ôn tập
      .populate('word');

    let targetWords = [];

    // Nếu không có từ sai (người dùng mới hoặc học quá giỏi), lấy ngẫu nhiên 3 từ để không bị trống UI
    if (weakProgress.length === 0) {
        targetWords = await wordModel.aggregate([{ $sample: { size: 3 } }]);
    } else {
        // Lấy thông tin chi tiết của từ từ bảng Progress
        targetWords = weakProgress.map(p => p.word);
    }

    // Nếu vẫn không có từ nào (database rỗng), trả về rỗng
    if (!targetWords || targetWords.length === 0) {
        return res.json({ success: true, advice: "Bạn chưa có dữ liệu học tập.", words: [] });
    }

    // Chuẩn bị dữ liệu gửi cho AI
    const listText = targetWords.map(w => `${w.word} (${w.meaning})`).join(", ");
    
    // 2. Gọi Gemini để xin lời khuyên ôn tập
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

    const prompt = `
      Người dùng cần ôn tập lại các từ vựng này vì họ thường làm sai:
      Danh sách: ${listText}.

      Nhiệm vụ của bạn:
      1. Viết một lời khuyên ngắn (bằng tiếng Việt) động viên họ khắc phục các lỗi sai này.
      2. Với TẤT CẢ các từ trong danh sách trên, hãy giải thích ngắn gọn tại sao từ này dễ nhầm lẫn hoặc mẹo để ghi nhớ (field "reason").

      Trả về JSON format chuẩn:
      {
        "advice": "Lời khuyên...",
        "recommendedWords": [
           { "word": "từ tiếng anh", "reason": "Mẹo nhớ hoặc lý do dễ sai" }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiData = JSON.parse(response.text());

    // 3. Map ngược lại để lấy thông tin đầy đủ của từ từ DB (giữ nguyên ID, ảnh, âm thanh...)
    const finalRecommendations = [];
    
    // Duyệt qua danh sách gốc (targetWords) để đảm bảo không bị mất từ nào nếu AI lỡ quên trả về
    for (const dbWord of targetWords) {
        // Tìm reason tương ứng từ AI trả về
        const aiInfo = aiData.recommendedWords.find(aiW => aiW.word.toLowerCase() === dbWord.word.toLowerCase());
        
        finalRecommendations.push({
            ... (dbWord.toObject ? dbWord.toObject() : dbWord), // Xử lý nếu là document mongoose hoặc plain object
            reason: aiInfo ? aiInfo.reason : "Hãy ôn tập kỹ từ này nhé!" // Fallback nếu AI không trả về reason cho từ này
        });
    }

    res.json({
      success: true,
      advice: aiData.advice || "Hãy cố gắng ôn tập các từ này nhé!",
      words: finalRecommendations
    });

  } catch (error) {
    console.error("Recommend Error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi tạo gợi ý." });
  }
};