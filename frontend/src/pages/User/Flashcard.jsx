// src/pages/User/Flashcard.jsx

import { useState, useEffect } from 'react';
import { Volume2, ChevronLeft, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../libs/axios';
import { useNavigate } from 'react-router-dom';
import { updateWordProgress } from '../../services/progressService';
// ĐÃ XÓA: import studySessionService để tránh lưu 2 lần

export default function Flashcard() {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Thay đổi: Chỉ đếm số thẻ đã xem/lật (tương đương điểm)
  const [flippedCount, setFlippedCount] = useState(0); 
  // Set để theo dõi những thẻ đã được tính điểm (tránh lật đi lật lại 1 thẻ)
  const [viewedCards, setViewedCards] = useState(new Set());

  const [selectedTopic, setSelectedTopic] = useState(null);
  const navigate = useNavigate();
  
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  useEffect(() => {
    if (isTransitioning) {
      setTimeout(() => setIsTransitioning(false), 0);
    }
  }, [isTransitioning]);

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

  // SỬA: Logic khi click vào thẻ
  const handleCardClick = () => {
    // Nếu đang úp (mặt sau) thì lật lại (mặt trước) -> không tính điểm
    // Nếu đang ngửa (mặt trước) thì lật (mặt sau) -> TÍNH ĐIỂM +1
    if (!isFlipped) {
        // Hành động: Lật ra mặt sau
        const currentWordId = words[currentIndex]._id;
        
        // Nếu thẻ này chưa từng được xem (tính điểm)
        if (!viewedCards.has(currentWordId)) {
            setFlippedCount(prev => prev + 1);
            setViewedCards(prev => new Set(prev).add(currentWordId));
            
            // Cập nhật progress (đã học)
            updateWordProgress(currentWordId, 'flashcard');
        }
    }
    
    setIsFlipped(!isFlipped);
  };

  // SỬA: Logic chuyển thẻ tiếp theo (Thay thế cho handleAnswer)
  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setIsTransitioning(true);
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false); // Reset về mặt trước
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    // --- SỬA: KHÔNG GỌI API SAVE SESSION Ở ĐÂY ---
    localStorage.removeItem('flashcardSettings');
    
    // Chuyển sang trang kết quả
    // Truyền 'correct' là số thẻ đã lật
    navigate('/vocabulary/flashcard/result', {
      state: {
        correct: flippedCount, 
        totalQuestions: words.length
      }
    });
  };

  const handleStopLearning = () => {
    if (confirm('Bạn có chắc muốn thoát?')) {
      localStorage.removeItem('flashcardSettings');
      navigate('/vocabulary');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center"><p>Đang tải...</p></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 rounded-lg shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Lỗi</h3>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <button onClick={() => navigate('/vocabulary')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">Quay về trang từ vựng</button>
        </div>
      </div>
    );
  }

  if (words.length === 0 && !loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <p>Không có từ vựng.</p>
        </div>
    )
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col min-h-0">

        {/* Header Progress */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={handleStopLearning} 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
            >
              <ChevronLeft size={20} />
              <span className="font-medium">Thoát</span>
            </button>
            <span className="text-lg font-bold text-blue-600">
              Thẻ {currentIndex + 1}/{words.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Wrapper flex-row cho card và nút */}
        <div className="flex-1 md:flex md:flex-row md:gap-6 lg:gap-8 min-h-0">

          {/* CỘT 1: FLASHCARD */}
          <div
            className="relative md:flex-[3] min-h-[400px] md:min-h-full h-full cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={handleCardClick}
          >
            <div
              className={`relative w-full h-full ${!isTransitioning ? 'transition-transform duration-600' : ''}`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* === MẶT TRƯỚC === */}
              <div
                className="absolute w-full h-full bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <div className="w-40 h-40 mb-4 rounded-2xl overflow-hidden bg-amber-50 flex items-center justify-center">
                  {currentWord.image ? (
                    <img src={currentWord.image} alt={currentWord.word} className="w-full h-full object-cover" />
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
                {currentWord.topic && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full mb-3">{currentWord.topic}</span>
                )}
                <p className="text-gray-600 text-center animate-pulse mt-4">Nhấn để lật thẻ</p>
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
                    <img src={currentWord.image} alt={currentWord.word} className="w-full h-full object-cover" />
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

          {/* CỘT 2: CÁC NÚT BẤM */}
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

            {/* Nút Chuyển Tiếp (Thay thế cho Đã biết/Chưa biết) */}
            <div className="flex flex-col gap-4 mt-4 md:mt-auto">
              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-lg shadow-lg"
              >
                {currentIndex === words.length - 1 ? 'Hoàn thành' : 'Từ tiếp theo'}
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}