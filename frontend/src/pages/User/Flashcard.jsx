// src/pages/User/Flashcard.jsx

import { useState, useEffect } from 'react';
import { Volume2, ChevronLeft, ChevronRight, Pause, AlertCircle } from 'lucide-react';
// SỬA LỖI 401: Import 'api' (axios)
import api from '../../libs/axios'; 
import { useNavigate } from 'react-router-dom';

export default function Flashcard() {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [selectedTopic, setSelectedTopic] = useState(null);
  const navigate = useNavigate(); // Hook để điều hướng

  useEffect(() => {
    // --- CẬP NHẬT: Đọc đối tượng 'flashcardSettings' ---
    const settingsData = localStorage.getItem('flashcardSettings');
    if (settingsData) {
      const settings = JSON.parse(settingsData);
      setSelectedTopic(settings.topic);
      
      // Truyền cả topic (name) và limit vào hàm fetch
      fetchWords(settings.topic.nameTopic, settings.limit);
    } else {
      setError('Vui lòng chọn danh mục trước khi học');
      setLoading(false);
    }
  }, []);

  // --- CẬP NHẬT: Thêm tham số 'limit' ---
  const fetchWords = async (topicName, limit) => {
    setLoading(true);
    setError(null);
    try {
      // SỬA LỖI 401: Dùng 'api.get' và gửi 'limit'
      const response = await api.get(`/words?topic=${topicName}&limit=${limit}`);
      const result = response.data; 
      
      console.log('API Response:', result); 
      
      if (result.success && result.data) {
        if (result.data.length === 0) {
          setError('Chưa có từ vựng nào trong danh mục này');
        } else {
          // Xáo trộn mảng từ vựng để học ngẫu nhiên
          setWords(result.data.sort(() => Math.random() - 0.5));
        }
      } else {
        setError('Không thể tải từ vựng');
      }
    } catch (err) {
      console.error('Lỗi khi tải từ vựng:', err);
      // Xử lý lỗi từ Axios
      if (err.response && err.response.status === 401) {
          setError('Phiên đăng nhập hết hạn. Vui lòng tải lại trang.');
      } else {
          setError('Lỗi kết nối đến server');
      }
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (words[currentIndex]?.audio) {
      const audio = new Audio(words[currentIndex].audio);
      audio.play().catch(err => console.error('Lỗi phát âm:', err));
    }
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  // Xử lý khi người dùng chọn 'Đã biết' hoặc 'Chưa biết'
  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }
    
    // Tự động chuyển sang từ tiếp theo sau 300ms
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        handleNext();
      }
    }, 300);
  };

  // Xử lý khi người dùng dừng học
  const handleStopLearning = () => {
    if (confirm('Bạn có chắc muốn dừng học?')) {
      // Xóa settings khỏi localStorage
      localStorage.removeItem('flashcardSettings'); 
      navigate('/vocabulary'); // Quay về trang Vocabulary
    }
  };

  // --- CÁC TRẠNG THÁI LOADING, ERROR, EMPTY ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải từ vựng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/vocabulary')} // Quay về trang Vocabulary
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (words.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có từ vựng</h2>
          <p className="text-gray-600 mb-6">Danh mục này chưa có từ vựng nào. Vui lòng thêm từ vựng trước.</p>
          <button
            onClick={() => navigate('/vocabulary')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }
  // ---------------------------------------------

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  return (
    // SỬA LAYOUT: Dùng h-screen, flex-col để vừa 1 màn hình
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col min-h-0">
        
        {/* Header Progress (Không co lại) */}
        <div className="mb-4 flex-shrink-0"> 
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Tiến độ: {currentIndex + 1}/{words.length}
            </span>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 font-medium">Đúng: {stats.correct}</span>
              <span className="text-red-600 font-medium">Sai: {stats.wrong}</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* SỬA LAYOUT: Thẻ Flashcard co giãn (flex-1) */}
        <div className="relative flex-1 mb-4 min-h-0">
          <div
            className="absolute inset-0 cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={handleCardClick}
          >
            <div
              className={`relative w-full h-full transition-transform duration-600`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* === MẶT TRƯỚC === */}
              <div
                className="absolute w-full h-full bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                <div className="w-40 h-40 mb-4 rounded-2xl overflow-hidden bg-amber-50 flex items-center justify-center">
                  {currentWord.image ? (
                    <img
                      src={currentWord.image}
                      alt={currentWord.word}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl text-amber-600">.word</span> 
                  )}
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                    <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{currentWord.word}</h2>
                <p className="text-lg md:text-xl text-gray-500 mb-3">{currentWord.pronunciation}</p>
                <div className="flex gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {currentWord.topic}
                  </span>
                </div>
                <p className="text-gray-600 text-center">Nhấn để xem nghĩa</p>
              </div>

              {/* === MẶT SAU === */}
              <div
                className="absolute w-full h-full bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="w-32 h-32 mb-4 rounded-xl overflow-hidden bg-amber-50 flex items-center justify-center">
                  {currentWord.image ? (
                    <img
                      src={currentWord.image}
                      alt={currentWord.word}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-amber-600">.word</span>
                  )}
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{currentWord.word}</h2>
                <p className="text-xl md:text-2xl text-gray-700 font-medium mb-4">{currentWord.translation}</p>
                <div className="max-w-xl text-center">
                  <p className="text-sm text-gray-500 mb-1">Ví dụ:</p>
                  <p className="text-base italic text-gray-600 mb-2">"{currentWord.example}"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SỬA LAYOUT: Nhóm các nút bấm vào 1 div (Không co lại) */}
        <div className="flex-shrink-0">
          <div className="flex justify-center mb-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                playAudio();
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition shadow-md"
            >
              <Volume2 size={20} />
              <span className="font-medium">Phát âm</span>
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
              <span className="font-medium">Trước</span>
            </button>
            <button
              onClick={handleStopLearning}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Pause size={20} />
              <span className="font-medium">Dừng học</span>
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === words.length - 1}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-medium">Tiếp theo</span>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Các nút 'Đã biết'/'Chưa biết' */}
          {isFlipped && (
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => handleAnswer(false)}
                className="flex-1 px-6 py-4 bg-red-50 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-100 transition font-medium"
              >
                ✕ Chưa biết
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="flex-1 px-6 py-4 bg-green-50 text-green-600 border-2 border-green-200 rounded-lg hover:bg-green-100 transition font-medium"
              >
                ✓ Đã biết
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}