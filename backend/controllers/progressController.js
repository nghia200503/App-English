// backend/controllers/progressController.js
import Progress from "../models/progressModel.js";

export const updateProgress = async (req, res) => {
    try {
        const { wordId, method, isCorrect } = req.body;
        const userId = req.user._id;

        // Tìm hoặc tạo mới progress
        let progress = await Progress.findOne({ userId, wordId });
        if (!progress) {
            progress = new Progress({ userId, wordId });
        }

        // Cập nhật theo phương pháp học
        switch (method) {
            case 'flashcard':
                progress.flashcard.viewCount += 1;
                // Ví dụ: Nếu xem > 5 lần thì tạm coi là đã học
                if (progress.flashcard.viewCount >= 5) progress.flashcard.isLearned = true;
                break;
            
            case 'listen':
                progress.listen.totalAttempts += 1;
                if (isCorrect) progress.listen.correctCount += 1;
                break;

            case 'quiz':
                progress.quiz.totalAttempts += 1;
                if (isCorrect) progress.quiz.correctCount += 1;
                break;

            case 'spelling':
                progress.spelling.totalAttempts += 1;
                if (isCorrect) progress.spelling.correctCount += 1;
                break;
                
            default:
                return res.status(400).json({ message: "Phương pháp học không hợp lệ" });
        }

        // Logic kiểm tra "Thành thạo" (Mastered)
        // Ví dụ: Đúng ít nhất 1 lần ở cả 3 bài test và đã xem flashcard
        if (
            progress.flashcard.viewCount > 0 &&
            progress.listen.correctCount > 0 &&
            progress.quiz.correctCount > 0 &&
            progress.spelling.correctCount > 0
        ) {
            progress.isMastered = true;
        }

        await progress.save();
        res.status(200).json({ success: true, progress });

    } catch (error) {
        console.error("Error updating progress:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật tiến độ" });
    }
};

export const getUserProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const progress = await Progress.find({ userId }).populate('wordId');
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};