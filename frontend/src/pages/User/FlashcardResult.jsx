import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Trophy, ArrowRight, RotateCw } from 'lucide-react';

export default function FlashcardResult() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy dữ liệu từ state (được gửi từ Flashcard.jsx)
  // Nhận 'correct' (số câu đúng) và 'totalQuestions'
  const { correct, totalQuestions } = location.state || { correct: 0, totalQuestions: 0 };

  // Tính toán hiển thị
  const correctAnswers = correct;
  const wrongAnswers = totalQuestions - correctAnswers;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // Đánh giá kết quả (giữ nguyên logic)
  let message = "";
  let messageColor = "";
  
  if (percentage === 100) {
    message = "Xuất sắc! Bạn đã thuộc hết 100% 🤩";
    messageColor = "text-green-600";
  } else if (percentage >= 80) {
    message = "Làm tốt lắm! Ghi nhớ rất tốt";
    messageColor = "text-blue-600";
  } else if (percentage >= 50) {
    message = "Tạm ổn, hãy ôn lại các thẻ sai nhé";
    messageColor = "text-yellow-600";
  } else {
    message = "Cần cố gắng nhiều hơn!";
    messageColor = "text-red-600";
  }

  if (totalQuestions === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <button onClick={() => navigate('/vocabulary')}>Quay lại</button>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-fadeIn">
        
        {/* Icon Cúp */}
        <div className="mb-6 relative inline-block">
          <div className="absolute inset-0 bg-yellow-200 rounded-full blur-xl opacity-50"></div>
          <div className="relative bg-yellow-100 p-4 rounded-full text-yellow-600">
            <Trophy size={48} />
          </div>
        </div>

        {/* THAY ĐỔI: Tiêu đề */}
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Kết Quả Ôn Tập</h2>
        <p className={`text-lg font-medium mb-8 ${messageColor}`}>{message}</p>

        {/* Grid thống kê Sai/Đúng (Giữ nguyên) */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle2 className="text-green-600" size={20} />
              <span className="text-green-800 font-semibold">Đã biết</span>
            </div>
            <p className="text-3xl font-bold text-green-700">{correctAnswers}</p>
          </div>

          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center justify-center gap-2 mb-1">
              <XCircle className="text-red-500" size={20} />
              <span className="text-red-800 font-semibold">Chưa biết</span>
            </div>
            <p className="text-3xl font-bold text-red-700">{wrongAnswers}</p>
          </div>
        </div>

        {/* Điểm số % (Giữ nguyên) */}
        <div className="mb-8 p-4 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-sm mb-1">Tỷ lệ thuộc</p>
          <p className="text-4xl font-bold text-gray-800">{percentage}/100</p>
        </div>

        {/* Actions Buttons (Giữ nguyên) */}
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
            Tiếp tục
          </button>
        </div>

      </div>
    </div>
  );
}