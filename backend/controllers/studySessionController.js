import StudySession from '../models/studySessionModel.js';

export const createStudySession = async (req, res) => {
  try {
    const { mode, totalQuestions, correctAnswers, score } = req.body;
    const userId = req.user.id;

    const wrongAnswers = totalQuestions - correctAnswers;

    const newSession = await StudySession.create({
      user: userId,
      mode,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      score
    });

    res.status(201).json({
      success: true,
      data: newSession
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
        const history = await StudySession.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};