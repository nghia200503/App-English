import { useState, useEffect } from 'react';
import { X, Pencil, AlertCircle } from 'lucide-react';
import { topicService } from '../services/topicService'; 
import { toast } from 'sonner';

// Tạo một đối tượng 'Tất cả'
const allTopicsOption = { 
  _id: 'all', 
  nameTopic: 'Tất cả', 
  meaning: 'Bao gồm tất cả chủ đề' 
};

export default function SpellPopup({ isOpen, onClose, onStartSpell }) {
  const [topics, setTopics] = useState([allTopicsOption]);
  const [selectedTopic, setSelectedTopic] = useState(allTopicsOption);
  const [wordLimit, setWordLimit] = useState(5); // Mặc định là 5 từ
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchTopics();
      setSelectedTopic(allTopicsOption);
      setWordLimit(5); // Bắt đầu với 5 từ
    }
  }, [isOpen]);

  const fetchTopics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await topicService.getAllTopicsDropdown();
      if (response.success && response.data) {
        setTopics([allTopicsOption, ...response.data]);
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

  const handleStartSpell = () => {
    if (selectedTopic) {
      // Lưu cài đặt vào localStorage
      localStorage.setItem('spellSettings', JSON.stringify({ 
        topic: selectedTopic, 
        limit: wordLimit 
      }));
      
      if (onStartSpell) {
        onStartSpell(); // Chuyển trang
      }
      onClose(); // Đóng popup
    }
  };

  if (!isOpen) return null;

  // Dùng theme màu xanh lá (green) như hình ảnh
  const themeColor = "green"; 

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
          <h2 className="text-2xl font-bold mb-2 text-center">Luyện tập Chính tả</h2>
          <p className="text-gray-600 text-center">Luyện tập chính tả từ vựng tiếng Anh</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 bg-${themeColor}-100 rounded-full mb-4`}>
              <Pencil className={`text-${themeColor}-600`} size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cài đặt luyện tập</h3>
            <p className="text-gray-600">Chọn danh mục và số lượng từ</p>
          </div>

          {/* Lỗi (nếu có) */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-800 font-medium">Có lỗi xảy ra</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Chọn chủ đề */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            {loading ? (
              <div className="text-center py-8">
                <div className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-${themeColor}-600 mb-2`}></div>
                <p className="text-gray-600 text-sm">Đang tải danh mục...</p>
              </div>
            ) : (
              <select
                value={selectedTopic?._id || 'all'}
                onChange={(e) => {
                  const topic = topics.find(t => t._id === e.target.value);
                  setSelectedTopic(topic || allTopicsOption); 
                }}
                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-${themeColor}-600 transition`}
                disabled={topics.length <= 1}
              >
                {topics.map((topic) => (
                  <option key={topic._id} value={topic._id}>
                    {topic.nameTopic} {topic._id !== 'all' ? `- ${topic.meaning}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Chọn số lượng từ */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng từ
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 'all'].map((count) => (
                <button
                  key={count}
                  onClick={() => setWordLimit(count)}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                    wordLimit === count
                      ? `bg-${themeColor}-600 text-white border-${themeColor}-600`
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {count === 'all' ? 'Tất cả' : count}
                </button>
              ))}
            </div>
          </div>

          {/* Nút bấm */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Quay lại
            </button>
            <button
              onClick={handleStartSpell}
              disabled={!selectedTopic || loading}
              className={`flex-1 px-6 py-3 bg-${themeColor}-600 text-white font-medium rounded-lg hover:bg-${themeColor}-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed`}
            >
              Bắt đầu luyện tập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}