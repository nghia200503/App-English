import studySessionModel from '../models/studySessionModel.js';

export const createStudySession = async (req, res) => {
  try {
    // Chỉ nhận số liệu thô từ Frontend
    const { mode, totalQuestions, correctAnswers } = req.body;
    const user = req.user; // Lấy từ authMiddleware

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // --- QUY TẮC TÍNH ĐIỂM DUY NHẤT (+5 XP/câu) ---
    const XP_PER_QUESTION = 5;
    const xpEarned = correctAnswers * XP_PER_QUESTION; 
    const wrongAnswers = totalQuestions - correctAnswers;

    // 1. Lưu lịch sử phiên học
    const newSession = await studySessionModel.create({
      user: user._id,
      mode,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      score: xpEarned // Lưu số XP kiếm được vào field score
    });

    // 2. Cập nhật XP và Level cho User
    let levelUp = false;

    if (xpEarned > 0) {
        user.experiencePoints += xpEarned;
        
        // Logic lên cấp: Ngưỡng = Level hiện tại * 100
        let xpThreshold = user.level * 100;

        // Vòng lặp xử lý lên nhiều cấp một lúc
        while (user.experiencePoints >= xpThreshold) {
            user.experiencePoints -= xpThreshold; // Trừ đi số XP đã dùng để lên cấp
            user.level += 1;
            levelUp = true;
            
            // Cập nhật ngưỡng cho level mới
            xpThreshold = user.level * 100; 
        }

        await user.save();
    }

    // 3. Trả về dữ liệu để Frontend cập nhật UI ngay lập tức
    res.status(201).json({
      success: true,
      data: newSession,
      userUpdate: {
          xpEarned,
          levelUp,
          currentLevel: user.level,
          currentExp: user.experiencePoints
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
        const userId = req.user._id;
        const history = await studySessionModel.find({ user: userId }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error getting user history:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};