import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Trophy, ArrowRight, RotateCw, Star } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { studySessionService } from '../../services/studySessionService';
import { toast } from 'sonner';

export default function ListenResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUserProgress } = useAuthStore();
  
  const hasSaved = useRef(false);
  const [earnedXP, setEarnedXP] = useState(0);

  // Lấy dữ liệu từ trang làm bài
  const { score, totalQuestions } = location.state || { score: 0, totalQuestions: 0 };
  
  // score ở đây là số câu đúng (được truyền từ component trước)
  const correctAnswers = score; 
  const wrongAnswers = totalQuestions - correctAnswers;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  useEffect(() => {
    const saveResult = async () => {
      if (totalQuestions === 0 || hasSaved.current) return;
      hasSaved.current = true;

      // Chuẩn bị dữ liệu gửi lên (KHÔNG gửi score/xp tự tính)
      const sessionData = {
        mode: 'listen',
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
      };

      try {
        // Gọi API lưu kết quả
        const response = await studySessionService.saveSession(sessionData);

        if (response && response.success) {
          // Lấy dữ liệu mới nhất từ Server trả về
          const { currentLevel, currentExp, levelUp, xpEarned } = response.userUpdate;
          
          // 1. Cập nhật vào Store (để Profile.jsx tự update)
          updateUserProgress(currentExp, currentLevel);
          
          // 2. Cập nhật state nội bộ để hiển thị badge XP
          setEarnedXP(xpEarned);

          // 3. Thông báo Toast
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
  }, [totalQuestions, correctAnswers, updateUserProgress]);

  // Logic hiển thị text đánh giá
  let message = "";
  let messageColor = "";
  if (percentage === 100) { message = "Xuất sắc! Tai nghe siêu phàm 🎧"; messageColor = "text-green-600"; }
  else if (percentage >= 80) { message = "Làm tốt lắm! Kỹ năng nghe rất tốt"; messageColor = "text-blue-600"; }
  else if (percentage >= 50) { message = "Tạm ổn, hãy luyện nghe thêm nhé"; messageColor = "text-yellow-600"; }
  else { message = "Cần cố gắng nhiều hơn!"; messageColor = "text-red-600"; }

  if (totalQuestions === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <button onClick={() => navigate('/vocabulary')} className="text-blue-600 hover:underline">Quay lại</button>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-fadeIn">
        
        {/* Khu vực Icon Cúp & Badge XP */}
        <div className="mb-6 relative inline-block">
          <div className="absolute inset-0 bg-yellow-200 rounded-full blur-xl opacity-50"></div>
          <div className="relative bg-yellow-100 p-4 rounded-full text-yellow-600">
            <Trophy size={48} />
          </div>
          
          {/* Badge hiển thị XP nhận được */}
          {earnedXP > 0 && (
            <div className="absolute -top-2 -right-8 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-bounce flex items-center gap-1">
                <Star size={12} fill="currentColor" /> +{earnedXP} XP
            </div>
          )}
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">Kết Quả Luyện Nghe</h2>
        <p className={`text-lg font-medium mb-8 ${messageColor}`}>{message}</p>

        {/* Thống kê Đúng / Sai */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle2 className="text-green-600" size={20} />
              <span className="text-green-800 font-semibold">Đúng</span>
            </div>
            <p className="text-3xl font-bold text-green-700">{correctAnswers}</p>
             {/* Hiển thị số điểm tương ứng (chỉ để xem, không gửi lên server) */}
             {/* <p className="text-xs text-green-600 mt-1">+{correctAnswers * 5} XP</p> */}
          </div>

          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center justify-center gap-2 mb-1">
              <XCircle className="text-red-500" size={20} />
              <span className="text-red-800 font-semibold">Sai</span>
            </div>
            <p className="text-3xl font-bold text-red-700">{wrongAnswers}</p>
          </div>
        </div>

        {/* <div className="mb-8 p-4 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-sm mb-1">Điểm số đạt được</p>
          <p className="text-4xl font-bold text-gray-800">{percentage}/100</p>
        </div> */}

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
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200"
          >
            <RotateCw size={20} />
            Tiếp tục
          </button>
        </div>

      </div>
    </div>
  );
}