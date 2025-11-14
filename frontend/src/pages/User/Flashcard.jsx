// src/pages/User/Flashcard.jsx

import { useState, useEffect } from 'react';
import { Volume2, ChevronLeft, ChevronRight, Pause, AlertCircle } from 'lucide-react';
import api from '../../libs/axios'; 
import { useNavigate } from 'react-router-dom';
import { updateWordProgress } from '../../services/progressService';

export default function Flashcard() {
  // --- TOÀN BỘ LOGIC VÀ STATE (từ dòng 9 đến 182) ĐƯỢC GIỮ NGUYÊN ---
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [selectedTopic, setSelectedTopic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const settingsData = localStorage.getItem('flashcardSettings');
    if (settingsData) {
      const settings = JSON.parse(settingsData);
      setSelectedTopic(settings.topic);
      fetchWords(settings.topic, settings.limit);
    } else {
      setError('Vui lòng chọn danh mục trước khi học');
      setLoading(false);
    }
  }, []);

  const fetchWords = async (topic, limit) => {
    setLoading(true);
    setError(null);
    try {
      const topicName = topic.nameTopic === 'Tất cả' ? 'all' : topic.nameTopic;
      const response = await api.get(`/words?topic=${topicName}&limit=${limit}`);
      const result = response.data; 
      
      if (result.success && result.data) {
        if (result.data.length === 0) {
          setError('Chưa có từ vựng nào trong danh mục này');
        } else {
          setWords(result.data.sort(() => Math.random() - 0.5));
        }
      } else {
        setError('Không thể tải từ vựng');
      }
    } catch (err) {
      console.error('Lỗi khi tải từ vựng:', err);
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

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }

    if (currentWord && currentWord._id) {
        // Gọi API cập nhật tiến độ cho kỹ năng flashcard
        // isCorrect ở đây chỉ mang tính chất tham khảo cho backend biết user đánh giá thế nào
        updateWordProgress(currentWord._id, 'flashcard');
    }
    
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        handleNext();
      }
    }, 300);
  };

  const handleStopLearning = () => {
    if (confirm('Bạn có chắc muốn dừng học?')) {
      localStorage.removeItem('flashcardSettings'); 
      navigate('/vocabulary'); 
    }
  };

  // --- CÁC TRẠNG THÁI LOADING, ERROR, EMPTY (GIỮ NGUYÊN) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        {/* ... (màn hình loading) ... */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        {/* ... (màn hình lỗi) ... */}
      </div>
    );
  }

  if (words.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
         {/* ... (màn hình rỗng) ... */}
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  // --- PHẦN RENDER BỐ CỤC (ĐÃ THAY ĐỔI) ---
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      
      {/* THAY ĐỔI: Tăng max-w-4xl -> max-w-6xl */}
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col min-h-0">
        
        {/* Header Progress (Giữ nguyên) */}
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

        {/* THAY ĐỔI: Thêm wrapper flex-row cho card và nút */}
        <div className="flex-1 md:flex md:flex-row md:gap-6 lg:gap-8 min-h-0">
          
          {/* CỘT 1: FLASHCARD (md:flex-[3] ~ 60%) */}
          <div
            className="relative md:flex-[3] min-h-[400px] md:min-h-full h-full cursor-pointer" // Bỏ mb-4, Sửa flex-1
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
              {/* === MẶT TRƯỚC (Giữ nguyên) === */}
              <div
                className="absolute w-full h-full bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                {/* ... (Nội dung mặt trước) ... */}
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

              {/* === MẶT SAU (Giữ nguyên) === */}
              <div
                className="absolute w-full h-full bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* ... (Nội dung mặt sau) ... */}
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

          {/* CỘT 2: CÁC NÚT BẤM (md:flex-[2] ~ 40%) */}
          {/* THAY ĐỔI: Chuyển toàn bộ nút bấm vào đây */}
          <div className="flex-shrink-0 md:flex-[2] md:flex md:flex-col md:gap-4 mt-4 md:mt-0">
            
            {/* Nút Phát âm */}
            <div className="flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio();
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition shadow-md"
              >
                <Volume2 size={20} />
                <span className="font-medium">Phát âm</span>
              </button>
            </div>

            {/* Nút Dừng học */}
            <button
              onClick={handleStopLearning}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition mt-4 md:mt-0"
            >
              <Pause size={20} />
              <span className="font-medium">Dừng học</span>
            </button>

            {/* Các nút 'Đã biết'/'Chưa biết' */}
            {isFlipped && (
              <div className="flex flex-col gap-4 mt-4">
                <button
                  onClick={() => handleAnswer(false)}
                  className="w-full px-6 py-4 bg-red-50 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-100 transition font-medium text-lg"
                >
                  ✕ Chưa biết
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="w-full px-6 py-4 bg-green-50 text-green-600 border-2 border-green-200 rounded-lg hover:bg-green-100 transition font-medium text-lg"
                >
                  ✓ Đã biết
                </button>
              </div>
            )}

            {/* Nút điều hướng (Luôn ở dưới cùng) */}
            <div className="flex gap-4 mt-4 md:mt-auto">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
                <span className="font-medium">Trước</span>
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

          </div>

        </div> 
        {/* Kết thúc wrapper flex-row */}

      </div>
    </div>
  );
}