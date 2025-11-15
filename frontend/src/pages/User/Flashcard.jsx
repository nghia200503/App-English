// src/pages/User/Flashcard.jsx

import { useState, useEffect } from 'react';
import { Volume2, ChevronLeft, AlertCircle } from 'lucide-react';
import api from '../../libs/axios';
import { useNavigate } from 'react-router-dom';
import { updateWordProgress } from '../../services/progressService';
// THÊM DÒNG NÀY: Import service giống như Listen.jsx
import { studySessionService } from '../../services/studySessionService';

export default function Flashcard() {
  // --- STATE VÀ LOGIC GIỮ NGUYÊN ---
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 }); 
  const [selectedTopic, setSelectedTopic] = useState(null);
  const navigate = useNavigate();
  
  const [isTransitioning, setIsTransitioning] = useState(false);

  // --- useEffect VÀ fetchWords GIỮ NGUYÊN ---
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
    // ... (logic fetch giữ nguyên)
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
      // ... (xử lý lỗi giữ nguyên)
      if (err.response && err.response.status === 401) {
        setError('Phiên đăng nhập hết hạn. Vui lòng tải lại trang.');
      } else {
        setError('Lỗi kết nối đến server');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- CÁC HÀM playAudio, handleCardClick, handleNext (GIỮ NGUYÊN) ---
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
      setIsFlipped(false); // Đảm bảo thẻ mới luôn ở mặt úp
    }
  };

  // *** THAY ĐỔI HÀM NÀY ***
  // Thêm 'async' và logic lưu session
  const handleAnswer = async (isCorrect) => {
    // 1. Tính toán stats mới
    const newCorrect = isCorrect ? stats.correct + 1 : stats.correct;
    const newWrong = !isCorrect ? stats.wrong + 1 : stats.wrong;
    
    // 2. Lên lịch cập nhật state
    setStats({ correct: newCorrect, wrong: newWrong });

    // 3. Cập nhật progress (giữ nguyên)
    const currentWord = words[currentIndex];
    if (currentWord && currentWord._id) {
      updateWordProgress(currentWord._id, 'flashcard');
    }

    // 4. KIỂM TRA ĐIỀU KIỆN CHUYỂN TRANG
    if (currentIndex === words.length - 1) {
      // Đây là thẻ cuối cùng
      
      // *** THÊM VÀO: Lưu vào lịch sử học tập (Database) ***
      // Logic này được sao chép từ Listen.jsx
      try {
        await studySessionService.saveSession({
          mode: 'flashcard',
          totalQuestions: words.length,
          correctAnswers: newCorrect, // 'newCorrect' là số câu đúng (đã biết)
          score: Math.round((newCorrect / words.length) * 10) // Quy đổi ra thang điểm 10
        });
      } catch (err) {
        console.error('Lỗi khi lưu lịch sử học Flashcard:', err);
        // Có thể bỏ qua lỗi và vẫn cho xem kết quả
      }
      
      localStorage.removeItem('flashcardSettings');
      
      // Chuyển sang trang kết quả (giữ nguyên)
      navigate('/vocabulary/flashcard/result', {
        state: {
          correct: newCorrect, 
          totalQuestions: words.length
        }
      });

    } else {
      // Chưa phải thẻ cuối cùng, chuyển thẻ tiếp theo (logic cũ)
      setIsTransitioning(true); 
      handleNext();
    }
  };

  const handleStopLearning = () => {
    // ... (logic giữ nguyên)
    if (confirm('Bạn có chắc muốn thoát?')) {
      localStorage.removeItem('flashcardSettings');
      navigate('/vocabulary');
    }
  };

  // --- CÁC TRẠNG THÁI LOADING, ERROR, EMPTY (GIỮ NGUYÊN) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 rounded-lg shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Lỗi</h3>
          <div className="mt-2 text-sm text-gray-600">
            <p>{error}</p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/vocabulary')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Quay về trang từ vựng
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (words.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 rounded-lg shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-blue-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Không có từ vựng</h3>
          <div className="mt-2 text-sm text-gray-600">
            <p>Không tìm thấy từ vựng nào cho chủ đề này.</p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/vocabulary')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Quay về trang từ vựng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  // --- PHẦN RENDER BỐ CỤC (GIỮ NGUYÊN) ---
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col min-h-0">

        {/* Header Progress (Giữ nguyên) */}
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
              Câu {currentIndex + 1}/{words.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Wrapper flex-row cho card và nút (Giữ nguyên) */}
        <div className="flex-1 md:flex md:flex-row md:gap-6 lg:gap-8 min-h-0">

          {/* CỘT 1: FLASHCARD (Giữ nguyên) */}
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
              {/* === MẶT TRƯỚC (Giữ nguyên) === */}
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

                {currentWord.topic && (
                  <div className="flex gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {currentWord.topic}
                    </span>
                  </div>
                )}
                
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

          {/* CỘT 2: CÁC NÚT BẤM (Giữ nguyên) */}
          <div className="flex-shrink-0 md:flex-[2] md:flex md:flex-col md:gap-4 mt-4 md:mt-0">
            {/* Nút Phát âm (Giữ nguyên) */}
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

            {/* Các nút 'Đã biết'/'Chưa biết' (Giữ nguyên) */}
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
            <div className="md:mt-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}