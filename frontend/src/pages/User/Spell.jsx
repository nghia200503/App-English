import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../libs/axios'; // Dùng api (axios)
import { AlertCircle, Volume2, ArrowLeft, RefreshCw } from 'lucide-react';

export default function Spell() {
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // 1. Lấy cài đặt và fetch từ vựng
  useEffect(() => {
    const settingsData = localStorage.getItem('spellSettings');
    if (!settingsData) {
      setError('Không tìm thấy cài đặt. Vui lòng quay lại và chọn chế độ.');
      setLoading(false);
      return;
    }
    const { topic, limit } = JSON.parse(settingsData);
    fetchWords(topic, limit);
  }, []);

  const fetchWords = async (topic, limit) => {
    setLoading(true);
    setError(null);
    try {
      const topicName = topic.nameTopic === 'Tất cả' ? 'all' : topic.nameTopic;
      const response = await api.get(`/words?topic=${topicName}&limit=${limit}`);
      const result = response.data;

      if (result.success && result.data && result.data.length > 0) {
        // Xáo trộn từ vựng
        setWords(result.data.sort(() => Math.random() - 0.5));
      } else {
        setError('Không tìm thấy từ vựng nào cho chủ đề này.');
      }
    } catch (err) {
      console.error('Lỗi khi tải từ vựng:', err);
      setError('Lỗi kết nối hoặc không tìm thấy từ vựng.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Phát âm thanh
  const playAudio = () => {
    if (words.length === 0) return;
    const audioUrl = words[currentWordIndex]?.audio;
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => console.error('Lỗi phát âm:', err));
    }
  };

  // Tự động phát âm khi chuyển từ
  useEffect(() => {
    if (words.length > 0 && !loading) {
      playAudio();
      inputRef.current?.focus(); // Tự động focus vào input
    }
  }, [currentWordIndex, words, loading]);

  // 3. Xử lý khi nhấn "Kiểm tra"
  const handleCheck = () => {
    if (isAnswered || !inputValue) return;

    const currentWord = words[currentWordIndex];
    const answer = inputValue.trim().toLowerCase();
    const isMatch = answer === currentWord.word.toLowerCase();

    setIsAnswered(true);
    if (isMatch) {
      setIsCorrect(true);
      setScore(prev => prev + 10);
      setCorrectCount(prev => prev + 1);
    } else {
      setIsCorrect(false);
    }
  };
  
  // Cho phép nhấn Enter để kiểm tra
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (isAnswered) {
        handleNext();
      } else {
        handleCheck();
      }
    }
  };

  // 4. Xử lý "Tiếp theo"
  const handleNext = () => {
    if (!isAnswered) return;

    const nextIndex = currentWordIndex + 1;
    if (nextIndex < words.length) {
      setCurrentWordIndex(nextIndex);
      // Reset
      setIsAnswered(false);
      setIsCorrect(false);
      setInputValue("");
    } else {
      // Hoàn thành
      handleViewResults();
    }
  };

  // 5. Xử lý "Thử lại" (chỉ khi sai)
  const handleRetry = () => {
    setIsAnswered(false);
    setInputValue("");
    inputRef.current?.focus();
  };

  // 6. Xem kết quả
  const handleViewResults = () => {
    localStorage.removeItem('spellSettings');
    navigate('/vocabulary/spell/result', { 
      state: { 
        score: score, 
        totalWords: words.length,
        correctCount: correctCount
      } 
    });
  };

  // 7. Thoát
  const handleGoBack = () => {
    if (confirm('Bạn có chắc muốn thoát? Tiến trình sẽ không được lưu.')) {
      localStorage.removeItem('spellSettings');
      navigate('/vocabulary');
    }
  };

  // --- CÁC TRẠNG THÁI RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải bài luyện tập...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="text-red-500 w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/vocabulary')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Quay về trang từ vựng
          </button>
        </div>
      </div>
    );
  }
  
  if (words.length === 0) return null; // Trạng thái lỗi đã xử lý
  
  const currentWord = words[currentWordIndex];
  const progress = ((currentWordIndex + 1) / words.length) * 100;

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Header (Thoát) */}
        <div className="absolute top-4 left-4">
           <button onClick={handleGoBack} className="flex items-center gap-2 text-gray-500 hover:text-green-600">
            <ArrowLeft size={20} />
            Thoát
          </button>
        </div>

        {/* Card chính */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Card */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-500">
                Từ {currentWordIndex + 1}/{words.length}
              </span>
              <span className="text-sm font-medium text-green-600">
                Điểm: {score}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Nội dung chính */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col items-center">
              <button
                onClick={playAudio}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 hover:bg-green-200 transition"
              >
                <Volume2 size={36} />
              </button>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                Nghe và viết từ bạn nghe được:
              </h2>
              <p className="text-gray-500 mb-6">
                Nghĩa: {currentWord.translation}
              </p>

              {/* Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAnswered}
                placeholder="Nhập từ bạn nghe được..."
                className={`w-full p-4 text-center text-lg border-2 rounded-lg ${
                  isAnswered && isCorrect ? 'border-green-500 bg-green-50' :
                  isAnswered && !isCorrect ? 'border-red-500 bg-red-50' :
                  'border-gray-300 focus:border-green-500'
                } focus:outline-none transition`}
              />

              {/* Phản hồi (Feedback) */}
              {isAnswered && (
                <div 
                  className={`w-full p-4 rounded-lg mt-4 ${
                    isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <h3 className={`font-bold text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? '✓ Chính xác!' : '✕ Sai rồi!'}
                  </h3>
                  <p className="text-gray-700">Đáp án đúng: <span className="font-bold">{currentWord.word}</span></p>
                  <p className="text-gray-500 text-sm">Phát âm: {currentWord.pronunciation}</p>
                </div>
              )}

              {/* Các nút bấm */}
              <div className="w-full mt-6 space-y-3">
                {!isAnswered ? (
                  // Trạng thái chưa trả lời
                  <div className="flex gap-3">
                    <button
                      onClick={playAudio}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition"
                      title="Phát âm lại"
                    >
                      <RefreshCw size={20} className="mx-auto" />
                    </button>
                    <button
                      onClick={handleCheck}
                      disabled={!inputValue}
                      className="flex-[3] px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:bg-gray-300"
                    >
                      Kiểm tra
                    </button>
                  </div>
                ) : (
                  // Trạng thái đã trả lời
                  <div className="flex gap-3">
                    {!isCorrect && (
                      <button
                        onClick={handleRetry}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                      >
                        Thử lại
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className="flex-[2] px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
                    >
                      {currentWordIndex === words.length - 1 ? 'Xem kết quả' : 'Từ tiếp theo'}
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
