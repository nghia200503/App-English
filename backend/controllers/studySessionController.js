// import StudySession from '../models/studySessionModel.js';

// export const createStudySession = async (req, res) => {
//   try {
//     const { mode, totalQuestions, correctAnswers, score } = req.body;
//     const userId = req.user.id;

//     const wrongAnswers = totalQuestions - correctAnswers;

//     const newSession = await StudySession.create({
//       user: userId,
//       mode,
//       totalQuestions,
//       correctAnswers,
//       wrongAnswers,
//       score
//     });

//     res.status(201).json({
//       success: true,
//       data: newSession
//     });
//   } catch (error) {
//     console.error('Error creating study session:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi server khi lưu lịch sử học'
//     });
//   }
// };

// export const getUserHistory = async (req, res) => {
//     try {
//         const history = await StudySession.find({ user: req.user.id }).sort({ createdAt: -1 });
//         res.status(200).json({
//             success: true,
//             data: history
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };
// backend/controllers/studySessionController.js
import studySessionModel from '../models/studySessionModel.js';
import userModel from '../models/userModel.js'; // Import User

export const createStudySession = async (req, res) => {
  try {
    const { mode, totalQuestions, correctAnswers, score } = req.body;
    const userId = req.user.id; // Lưu ý: check lại middleware xem dùng req.user.id hay req.user._id

    const wrongAnswers = totalQuestions - correctAnswers;

    // 1. Lưu Session
    const newSession = await studySessionModel.create({
      user: userId,
      mode,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      score
    });

    // 2. Tính toán cộng điểm cho User
    // Giả sử score gửi lên từ FE chính là số XP user nhận được (hoặc bạn tự tính toán lại ở đây)
    const xpEarned = score || (correctAnswers * 10); // Ví dụ fallback: 10 XP mỗi câu đúng

    let levelUp = false;
    let currentUserLevel = 0;
    let currentExp = 0;

    if (xpEarned > 0) {
        const user = await userModel.findById(userId);
        if (user) {
            user.experiencePoints += xpEarned;
            
            // Logic lên cấp (giống controller bên kia)
            // Ngưỡng XP cần để lên cấp tiếp theo = Level hiện tại * 100
            let xpThreshold = user.level * 100;

            while (user.experiencePoints >= xpThreshold) {
                user.experiencePoints -= xpThreshold; // Trừ XP để bắt đầu vòng lặp cấp độ mới
                user.level += 1;
                levelUp = true;
                xpThreshold = user.level * 100; // Cập nhật ngưỡng cho level mới
            }

            await user.save();
            currentUserLevel = user.level;
            currentExp = user.experiencePoints;
        }
    }

    res.status(201).json({
      success: true,
      data: newSession,
      userUpdate: {
          xpEarned,
          levelUp,
          currentLevel: currentUserLevel,
          currentExp
      }
    });
  } catch (error) {
    console.error('Error creating study session:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lưu lịch sử học'
    });
  }
};

export const getUserHistory = async (req, res) => {
    try {
        // Lưu ý: req.user.id hay req.user._id phụ thuộc vào authMiddleware của bạn
        const userId = req.user.id || req.user._id; 
        const history = await studySessionModel.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};