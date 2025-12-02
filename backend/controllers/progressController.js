// // backend/controllers/progressController.js
// import Progress from "../models/progressModel.js";

// export const updateProgress = async (req, res) => {
//     try {
//         const { wordId, method, isCorrect } = req.body;
//         const userId = req.user._id;

//         // Tìm hoặc tạo mới progress
//         let progress = await Progress.findOne({ userId, wordId });
//         if (!progress) {
//             progress = new Progress({ userId, wordId });
//         }

//         // Cập nhật theo phương pháp học
//         switch (method) {
//             case 'flashcard':
//                 progress.flashcard.viewCount += 1;
//                 // Ví dụ: Nếu xem > 5 lần thì tạm coi là đã học
//                 if (progress.flashcard.viewCount >= 5) progress.flashcard.isLearned = true;
//                 break;
            
//             case 'listen':
//                 progress.listen.totalAttempts += 1;
//                 if (isCorrect) progress.listen.correctCount += 1;
//                 break;

//             case 'quiz':
//                 progress.quiz.totalAttempts += 1;
//                 if (isCorrect) progress.quiz.correctCount += 1;
//                 break;

//             case 'spelling':
//                 progress.spelling.totalAttempts += 1;
//                 if (isCorrect) progress.spelling.correctCount += 1;
//                 break;
                
//             default:
//                 return res.status(400).json({ message: "Phương pháp học không hợp lệ" });
//         }

//         // Logic kiểm tra "Thành thạo" (Mastered)
//         // Ví dụ: Đúng ít nhất 1 lần ở cả 3 bài test và đã xem flashcard
//         if (
//             progress.flashcard.viewCount > 0 &&
//             progress.listen.correctCount > 0 &&
//             progress.quiz.correctCount > 0 &&
//             progress.spelling.correctCount > 0
//         ) {
//             progress.isMastered = true;
//         }

//         await progress.save();
//         res.status(200).json({ success: true, progress });

//     } catch (error) {
//         console.error("Error updating progress:", error);
//         res.status(500).json({ message: "Lỗi server khi cập nhật tiến độ" });
//     }
// };

// export const getUserProgress = async (req, res) => {
//     try {
//         const userId = req.user._id;
//         const progress = await Progress.find({ userId }).populate('wordId');
//         res.status(200).json(progress);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
// backend/controllers/progressController.js
import progressModel from "../models/progressModel.js";
import userModel from "../models/userModel.js"; // Cần import User để update

export const updateProgress = async (req, res) => {
    try {
        const { wordId, method, isCorrect } = req.body;
        const userId = req.user._id;

        // 1. Tìm hoặc tạo mới progress
        let progress = await progressModel.findOne({ userId, wordId });
        if (!progress) {
            progress = new progressModel({ userId, wordId });
        }

        let xpEarned = 0; // Biến lưu số điểm kiếm được trong request này

        // 2. Cập nhật theo phương pháp học và tính điểm
        switch (method) {
            case 'flashcard':
                progress.flashcard.viewCount += 1;
                if (progress.flashcard.viewCount >= 5) progress.flashcard.isLearned = true;
                
                // Cộng 1 XP cho mỗi lần xem flashcard (có thể giới hạn logic spam ở đây nếu cần)
                xpEarned += 1; 
                break;
            
            case 'listen':
                progress.listen.totalAttempts += 1;
                if (isCorrect) {
                    progress.listen.correctCount += 1;
                    xpEarned += 5; // Trả lời đúng nghe +5 XP
                }
                break;

            case 'quiz':
                progress.quiz.totalAttempts += 1;
                if (isCorrect) {
                    progress.quiz.correctCount += 1;
                    xpEarned += 5; // Trả lời đúng trắc nghiệm +5 XP
                }
                break;

            case 'spelling':
                progress.spelling.totalAttempts += 1;
                if (isCorrect) {
                    progress.spelling.correctCount += 1;
                    xpEarned += 5; // Trả lời đúng chính tả +5 XP
                }
                break;
                
            default:
                return res.status(400).json({ message: "Phương pháp học không hợp lệ" });
        }

        // 3. Logic kiểm tra "Thành thạo" (Mastered)
        // Kiểm tra xem trước đó đã master chưa để tránh cộng điểm master nhiều lần
        const wasMastered = progress.isMastered;

        if (
            !wasMastered && // Chỉ xử lý nếu chưa master
            progress.flashcard.viewCount > 0 &&
            progress.listen.correctCount > 0 &&
            progress.quiz.correctCount > 0 &&
            progress.spelling.correctCount > 0
        ) {
            progress.isMastered = true;
            xpEarned += 50; // Thưởng lớn khi Master từ vựng
        }

        await progress.save();

        // 4. Cập nhật XP và Level cho User
        let levelUp = false;
        if (xpEarned > 0) {
            const user = await userModel.findById(userId);
            if (user) {
                user.experiencePoints += xpEarned;

                // Logic tính Level: Giả sử Level N cần (N * 100) XP để lên N+1
                // Ví dụ: Level 1 có 150 XP -> Lên Level 2 (dư 50 XP hoặc giữ nguyên tùy hiển thị)
                // Ở đây dùng cách: XP cứ tăng, ngưỡng lên cấp là công thức: 100 * currentLevel
                
                const xpThreshold = user.level * 100; 
                
                // Dùng vòng lặp while để xử lý trường hợp cộng nhiều điểm lên nhiều cấp 1 lúc
                while (user.experiencePoints >= xpThreshold) {
                    user.experiencePoints -= xpThreshold; // Reset XP về số dư (hoặc comment dòng này nếu muốn XP tích lũy mãi mãi)
                    user.level += 1;
                    levelUp = true;
                    // Cập nhật lại threshold cho level mới (nếu muốn giữ XP tích lũy thì cần công thức khác)
                    // Với logic "trừ đi XP", threshold luôn là level * 100
                }
                
                await user.save();
            }
        }

        res.status(200).json({ 
            success: true, 
            progress, 
            xpEarned,
            levelUp 
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