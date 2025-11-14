// backend/models/progressModel.js
import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    wordId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'word', // Tên model trong wordModel.js là 'word'
        required: true 
    },
    // Tiến độ cho Flashcard
    flashcard: {
        viewCount: { type: Number, default: 0 },
        isLearned: { type: Boolean, default: false } // Người dùng đánh dấu đã thuộc
    },
    // Tiến độ cho Listen (Nghe)
    listen: {
        correctCount: { type: Number, default: 0 },
        totalAttempts: { type: Number, default: 0 }
    },
    // Tiến độ cho Quiz (Trắc nghiệm)
    quiz: {
        correctCount: { type: Number, default: 0 },
        totalAttempts: { type: Number, default: 0 }
    },
    // Tiến độ cho Spelling (Chính tả)
    spelling: {
        correctCount: { type: Number, default: 0 },
        totalAttempts: { type: Number, default: 0 }
    },
    // Trạng thái tổng thể của từ này
    isMastered: { type: Boolean, default: false }
}, { 
    timestamps: true 
});

// Đảm bảo mỗi user chỉ có 1 record progress cho 1 từ
progressSchema.index({ userId: 1, wordId: 1 }, { unique: true });

export default mongoose.model("Progress", progressSchema);