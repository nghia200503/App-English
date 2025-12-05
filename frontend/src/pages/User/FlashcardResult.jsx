// src/pages/User/FlashcardResult.jsx

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Trophy, ArrowRight, RotateCw, Star } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { studySessionService } from '../../services/studySessionService';
import { toast } from 'sonner';

export default function FlashcardResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUserProgress } = useAuthStore();
  
  const hasSaved = useRef(false);
  const [earnedXP, setEarnedXP] = useState(0);

  // Lấy dữ liệu từ state
  // 'correct' ở đây chính là số thẻ đã lật (flippedCount) được truyền từ Flashcard.jsx
  const { correct, totalQuestions } = location.state || { correct: 0, totalQuestions: 0 };

  // Tính toán
  const cardsLearned = correct; // Số thẻ đã học
  const percentage = totalQuestions > 0 ? Math.round((cardsLearned / totalQuestions) * 100) : 0;

  useEffect(() => {
    const saveResult = async () => {
      // Nếu không có thẻ nào hoặc đã lưu rồi thì thôi
      if (totalQuestions === 0 || hasSaved.current) return;
      hasSaved.current = true;

      const sessionData = {
        mode: 'flashcard',
        totalQuestions: totalQuestions,
        correctAnswers: cardsLearned, // Lưu số thẻ đã học vào trường correctAnswers
        // score sẽ được tính ở backend (cardsLearned * 5)
      };

      try {
        const response = await studySessionService.saveSession(sessionData);

        if (response && response.success) {
          const { currentLevel, currentExp, levelUp, xpEarned } = response.userUpdate;
          
          updateUserProgress(currentExp, currentLevel);
          setEarnedXP(xpEarned);

          if (levelUp) {
            toast.success(`🎉 Chúc mừng! Bạn đã lên Level ${currentLevel}!`);
          } else if (xpEarned > 0) {
            toast.success(`Đã lưu kết quả! +${xpEarned} XP`);
          }
        }
      } catch (error) {
        console.error("Lỗi lưu kết quả:", error);
      }
    };

    saveResult();
  }, [totalQuestions, cardsLearned, updateUserProgress]);

  // Logic hiển thị thông báo
  let message = "";
  let messageColor = "";
  
  if (percentage === 100) {
    message = "Tuyệt vời! Bạn đã xem hết tất cả các thẻ 🌟";
    messageColor = "text-green-600";
  } else if (percentage >= 50) {
    message = "Làm tốt lắm! Hãy tiếp tục phát huy";
    messageColor = "text-blue-600";
  } else {
    message = "Hãy cố gắng xem hết các từ vựng nhé!";
    messageColor = "text-yellow-600";
  }

  if (totalQuestions === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <button onClick={() => navigate('/vocabulary')} className="text-blue-600 hover:underline">Quay lại</button>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-fadeIn">
        
        {/* Icon Cúp & Badge XP */}
        <div className="mb-6 relative inline-block">
          <div className="absolute inset-0 bg-yellow-200 rounded-full blur-xl opacity-50"></div>
          <div className="relative bg-yellow-100 p-4 rounded-full text-yellow-600">
            <Trophy size={48} />
          </div>
          
          {/* Badge hiển thị XP */}
          {earnedXP > 0 && (
            <div className="absolute -top-2 -right-8 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-bounce flex items-center gap-1">
                <Star size={12} fill="currentColor" /> +{earnedXP} XP
            </div>
          )}
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">Hoàn Thành Ôn Tập</h2>
        <p className={`text-lg font-medium mb-8 ${messageColor}`}>{message}</p>

        {/* Thống kê đơn giản: Số thẻ đã học */}
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 mb-8">
            <p className="text-gray-600 text-sm mb-2 uppercase tracking-wide font-semibold">Số từ đã học</p>
            <div className="flex items-center justify-center gap-3">
                <CheckCircle2 className="text-green-600" size={32} />
                <span className="text-5xl font-bold text-green-700">{cardsLearned}</span>
                <span className="text-2xl text-gray-400 font-medium">/ {totalQuestions}</span>
            </div>
        </div>

        {/* Actions Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/vocabulary')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
          >
            <ArrowRight size={20} />
            Thoát
          </button>
          
          <button
            onClick={() => navigate('/vocabulary')} 
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            <RotateCw size={20} />
            Học tiếp
          </button>
        </div>

      </div>
    </div>
  );
}