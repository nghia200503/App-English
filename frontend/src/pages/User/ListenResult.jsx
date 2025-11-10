import { useLocation, useNavigate } from 'react-router-dom';
import { Headphones } from 'lucide-react'; // Đổi icon

export default function ListenResult() {
  const navigate = useNavigate();
  const location = useLocation();

  // Đọc state
  const { score, totalWords, correctCount } = location.state || { score: 0, totalWords: 0, correctCount: 0 };

  if (totalWords === 0) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
        {/* ... (phần xử lý lỗi vào thẳng trang) ... */}
      </div>
    );
  }

  // Đổi tên biến cho khớp hình
  const accuracy = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;

  const handleRetry = () => {
    // "Làm lại" sẽ quay về trang Vocabulary để chọn bài mới
    navigate('/vocabulary'); 
  };

  const handleGoBack = () => {
    navigate('/vocabulary');
  };

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Headphones className="text-purple-600" size={32} />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Hoàn thành!</h1>
        <p className="text-gray-600 mb-8">Bạn đã hoàn thành bài luyện nghe</p>

        {/* Stats */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Tổng từ</p>
              <p className="text-3xl font-bold text-purple-600">{totalWords}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Điểm số</p>
              <p className="text-3xl font-bold text-purple-600">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Độ chính xác</p>
              <p className="text-3xl font-bold text-purple-600">{accuracy}%</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGoBack}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Quay lại
          </button>
          <button
            onClick={handleRetry} // "Làm lại"
            className="flex-1 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
          >
            Làm lại
          </button>
        </div>

      </div>
    </div>
  );
}