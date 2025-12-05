import progressModel from "../models/progressModel.js";
// import userModel from "../models/userModel.js"; // <-- Đã xóa import này vì không dùng nữa

export const updateProgress = async (req, res) => {
    try {
        const { wordId, method, isCorrect } = req.body;
        const userId = req.user._id;

        // 1. Tìm hoặc tạo mới progress cho từ vựng này
        let progress = await progressModel.findOne({ userId, wordId });
        if (!progress) {
            progress = new progressModel({ userId, wordId });
        }

        // 2. Cập nhật thống kê học tập (KHÔNG tính XP ở đây nữa)
        switch (method) {
            case 'flashcard':
                progress.flashcard.viewCount += 1;
                if (progress.flashcard.viewCount >= 5) progress.flashcard.isLearned = true;
                break;
            
            case 'listen':
                progress.listen.totalAttempts += 1;
                if (isCorrect) {
                    progress.listen.correctCount += 1;
                }
                break;

            case 'quiz':
                progress.quiz.totalAttempts += 1;
                if (isCorrect) {
                    progress.quiz.correctCount += 1;
                }
                break;

            case 'spelling':
                progress.spelling.totalAttempts += 1;
                if (isCorrect) {
                    progress.spelling.correctCount += 1;
                }
                break;
                
            default:
                return res.status(400).json({ message: "Phương pháp học không hợp lệ" });
        }

        // 3. Logic kiểm tra "Thành thạo" (Mastered)
        const wasMastered = progress.isMastered;
        if (
            !wasMastered &&
            progress.flashcard.viewCount > 0 &&
            progress.listen.correctCount > 0 &&
            progress.quiz.correctCount > 0 &&
            progress.spelling.correctCount > 0
        ) {
            progress.isMastered = true;
        }

        await progress.save();

        // 4. Trả về kết quả (Không trả về xpEarned hay levelUp nữa)
        res.status(200).json({ 
            success: true, 
            progress
        });

    } catch (error) {
        console.error("Error updating progress:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật tiến độ" });
    }
};

export const getUserProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const progress = await progressModel.find({ userId }).populate('wordId');
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};