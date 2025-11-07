// src/components/FlashcardPopup.jsx

import { useState, useEffect } from 'react';
import { X, Layers, AlertCircle } from 'lucide-react';
// Đảm bảo đường dẫn này trỏ đúng đến file topicService.js
import { topicService } from '../services/topicService'; 
import { toast } from 'sonner';

export default function FlashcardPopup({ isOpen, onClose, onStartLearn }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null); // Bắt đầu là null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- THÊM MỚI: State cho số lượng từ vựng ---
  const [wordLimit, setWordLimit] = useState(10); // Mặc định là 10 từ
  // ------------------------------------------

  useEffect(() => {
    // Chỉ fetch khi popup được mở
    if (isOpen) {
      // Reset về mặc định mỗi khi mở
      fetchTopics();
      setSelectedTopic(null);
      setWordLimit(10);
    }
  }, [isOpen]);

  const fetchTopics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Gọi service để lấy danh sách chủ đề
      const response = await topicService.getAllTopicsDropdown();
      
      if (response.success && response.data) {
        setTopics(response.data);
        if (response.data.length === 0) {
          setError('Chưa có danh mục nào. Vui lòng thêm danh mục trước.');
        }
      } else {
        setError('Không thể tải danh sách danh mục');
      }
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
      setError('Lỗi kết nối đến server.');
      toast.error("Không thể tải danh sách chủ đề");
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearn = () => {
    if (selectedTopic) {
      // --- CẬP NHẬT: Lưu cả topic VÀ limit vào localStorage ---
      localStorage.setItem('flashcardSettings', JSON.stringify({ 
        topic: selectedTopic, 
        limit: wordLimit // Lưu số lượng đã chọn
      }));
      // ----------------------------------------------------
      
      // Gọi callback (từ Vocabulary.jsx) để chuyển trang
      if (onStartLearn) {
        onStartLearn(selectedTopic);
      }
      onClose(); // Đóng popup
    }
  };

  // Nếu không mở, không render gì cả
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg transition"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-2 text-center">Học từ vựng bằng Flashcard</h2>
          <p className="text-gray-600 text-center">Chọn danh mục và số lượng từ</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Layers className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cài đặt học tập</h3>
            <p className="text-gray-600">Tùy chỉnh nội dung học</p>
          </div>

          {/* Hiển thị lỗi (nếu có) */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-800 font-medium">Có lỗi xảy ra</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Dropdown chọn chủ đề */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục từ vựng
            </label>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-600 text-sm">Đang tải danh mục...</p>
              </div>
            ) : (
              <select
                value={selectedTopic?._id || ''}
                onChange={(e) => {
                  const topic = topics.find(t => t._id === e.target.value);
                  // Sửa lỗi TypeError: Cannot read 'image' of undefined
                  setSelectedTopic(topic || null); 
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
                disabled={topics.length === 0}
              >
                <option value="">
                  {topics.length === 0 ? 'Không có danh mục nào' : 'Chọn danh mục'}
                </option>
                {topics.map((topic) => (
                  <option key={topic._id} value={topic._id}>
                    {topic.nameTopic} - {topic.meaning}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* --- THÊM MỚI: Chọn số lượng từ --- */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng từ vựng
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 'all'].map((count) => (
                <button
                  key={count}
                  onClick={() => setWordLimit(count)}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                    wordLimit === count
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {count === 'all' ? 'Tất cả' : count}
                </button>
              ))}
            </div>
          </div>
          {/* ---------------------------------- */}

          {/* Nút bấm */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Quay lại
            </button>
            <button
              onClick={handleStartLearn}
              disabled={!selectedTopic || loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Bắt đầu học
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}