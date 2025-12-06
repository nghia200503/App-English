import { useState, useEffect } from 'react';
import { X, CheckSquare, AlertCircle } from 'lucide-react';
import { topicService } from '../services/topicService'; 
import { wordService } from '../services/wordService';
import { toast } from 'sonner';

const allTopicsOption = { 
  _id: 'all', 
  nameTopic: 'Tất cả', 
  meaning: 'Bao gồm tất cả chủ đề',
  wordCount: 0 // Sẽ được cập nhật
};

export default function QuizPopup({ isOpen, onClose, onStartQuiz }) {
  const [topics, setTopics] = useState([allTopicsOption]);
  const [selectedTopic, setSelectedTopic] = useState(allTopicsOption);
  const [questionLimit, setQuestionLimit] = useState('10'); // State giờ có thể là SỐ hoặc 'all'
  const [maxWordsInTopic, setMaxWordsInTopic] = useState(0); // State mới
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const themeColor = "green"; // Theme cho Quiz

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [topicsRes, wordsRes] = await Promise.all([
        topicService.getAllTopicsDropdown(),
        wordService.getAllWords(1, 1, 'all')
      ]);
      
      let totalSystemWords = 0;
      let topicsList = [];

      if (wordsRes.success) {
        totalSystemWords = wordsRes.pagination.totalItems;
      }

      if (topicsRes.success && topicsRes.data) {
        topicsList = topicsRes.data;
      }

      const allTopicWithCount = { ...allTopicsOption, wordCount: totalSystemWords };

      setTopics([allTopicWithCount, ...topicsList]);
      setSelectedTopic(allTopicWithCount);
      setMaxWordsInTopic(totalSystemWords);
      
      setQuestionLimit(totalSystemWords > 0 ? Math.min(10, totalSystemWords).toString() : '10');

    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
      setError('Lỗi kết nối đến server.');
      toast.error("Không thể tải dữ liệu học tập");
    } finally {
      setLoading(false);
    }
  };
  
  const handleTopicChange = (e) => {
    const topic = topics.find(t => t._id === e.target.value) || allTopicsOption;
    setSelectedTopic(topic);
    
    const newMax = topic.wordCount || 0;
    setMaxWordsInTopic(newMax);

    if (questionLimit !== 'all' && newMax > 0 && parseInt(questionLimit) > newMax) {
      setQuestionLimit(newMax.toString());
    } else if (newMax === 0 && questionLimit !== 'all') {
      setQuestionLimit('10');
    }
  };

  const handleLimitChange = (e) => {
    let value = e.target.value;
    if (value === '') {
      setQuestionLimit('');
      return;
    }
    let numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1) numValue = 1;
    if (maxWordsInTopic > 0 && numValue > maxWordsInTopic) numValue = maxWordsInTopic;
    setQuestionLimit(numValue.toString());
  };
  
  const handleStartQuiz = () => {
    const finalLimit = (questionLimit === '' || parseInt(questionLimit) === 0) ? '10' : questionLimit;
    
    if (selectedTopic) {
      localStorage.setItem('quizSettings', JSON.stringify({ 
        topic: selectedTopic, 
        limit: finalLimit
      }));
      
      if (onStartQuiz) {
        onStartQuiz();
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg transition">
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-2 text-center">Kiểm tra Trắc nghiệm</h2>
          <p className="text-gray-600 text-center">Chọn danh mục và số lượng câu hỏi</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 bg-${themeColor}-100 rounded-full mb-4`}>
              <CheckSquare className={`text-${themeColor}-600`} size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cài đặt bài kiểm tra</h3>
            <p className="text-gray-600">Tùy chỉnh nội dung kiểm tra</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-800 font-medium">Có lỗi xảy ra</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Dropdown chọn chủ đề (ĐÃ CẬP NHẬT) */}
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
                onChange={handleTopicChange}
                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-${themeColor}-600 transition`}
                disabled={topics.length <= 1}
              >
                {topics.map((topic) => (
                  <option key={topic._id} value={topic._id}>
                    {/* Hiển thị Tên + Nghĩa (nếu không phải All) + Số từ (Luôn hiển thị) */}
                    {topic.nameTopic}
                    {topic._id !== 'all' ? ` - ${topic.meaning}` : ''}
                    {` (${topic.wordCount} từ)`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* --- THAY ĐỔI: Chọn số lượng câu hỏi --- */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng câu hỏi
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={questionLimit === 'all' ? maxWordsInTopic : questionLimit}
                onChange={handleLimitChange}
                onBlur={handleLimitChange}
                min="1"
                max={maxWordsInTopic > 0 ? maxWordsInTopic : undefined}
                disabled={loading || maxWordsInTopic === 0}
                className={`col-span-2 w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-${themeColor}-600 transition disabled:bg-gray-50`}
              />
              <button
                onClick={() => setQuestionLimit('all')}
                disabled={loading || maxWordsInTopic === 0}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                  questionLimit === 'all'
                    ? `bg-${themeColor}-600 text-white border-${themeColor}-600`
                    : `bg-white text-gray-700 border-gray-300 hover:bg-gray-50`
                } disabled:opacity-50`}
              >
                Tất cả
              </button>
            </div>
             {maxWordsInTopic > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Tối đa: {maxWordsInTopic} từ trong chủ đề này.
              </p>
            )}
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
              onClick={handleStartQuiz}
              disabled={!selectedTopic || loading || maxWordsInTopic === 0}
              className={`flex-1 px-6 py-3 bg-${themeColor}-600 text-white font-medium rounded-lg hover:bg-${themeColor}-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed`}
            >
              Bắt đầu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}