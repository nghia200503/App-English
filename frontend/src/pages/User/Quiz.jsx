import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../libs/axios'; // Dùng api (axios) để gọi
import { AlertCircle, ArrowLeft } from 'lucide-react';

// Hàm xáo trộn mảng (Fisher-Yates shuffle)
function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

// Hàm tạo câu hỏi
const generateQuestions = (words) => {
  if (words.length < 4) {
    // Không đủ từ để tạo câu hỏi 4 lựa chọn
    return []; 
  }

  return words.map((word, index) => {
    const correctAnswer = word.translation;
    
    // Lấy 3 câu trả lời sai từ các từ khác
    let incorrectOptions = [];
    while (incorrectOptions.length < 3) {
      const randomIndex = Math.floor(Math.random() * words.length);
      const randomWord = words[randomIndex];
      // Đảm bảo không trùng với từ hiện tại và không trùng lặp
      if (randomWord._id !== word._id && !incorrectOptions.includes(randomWord.translation)) {
        incorrectOptions.push(randomWord.translation);
      }
    }

    const options = shuffleArray([correctAnswer, ...incorrectOptions]);
    const explanation = `"${word.word}" (${word.pronunciation}) có nghĩa là "${word.translation}".`;

    return {
      question: word.word,
      options: options,
      correctAnswer: correctAnswer,
      explanation: explanation
    };
  });
};

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // 'A', 'B', 'C', 'D'
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 1. Lấy cài đặt và fetch từ vựng
  useEffect(() => {
    const settingsData = localStorage.getItem('quizSettings');
    if (!settingsData) {
      setError('Không tìm thấy cài đặt. Vui lòng quay lại và chọn chế độ.');
      setLoading(false);
      return;
    }

    const { topic, limit } = JSON.parse(settingsData);
    fetchWordsAndGenerateQuestions(topic, limit);
  }, []);

  const fetchWordsAndGenerateQuestions = async (topic, limit) => {
    setLoading(true);
    setError(null);
    try {
      const topicName = topic.nameTopic === 'Tất cả' ? 'all' : topic.nameTopic;
      
      // Giống Flashcard, gọi trực tiếp API để lấy 'limit' từ
      // Dùng endpoint '/words' đã có trong wordService
      const response = await api.get(`/words?topic=${topicName}&limit=${limit}`);
      const result = response.data;

      if (result.success && result.data) {
        if (result.data.length < 4) {
          setError(`Không đủ từ vựng (cần ít nhất 4, tìm thấy ${result.data.length}) để tạo bài trắc nghiệm.`);
        } else {
          // 2. Tạo câu hỏi từ danh sách từ vựng
          const generated = generateQuestions(result.data);
          setQuestions(generated);
        }
      } else {
        setError('Không thể tải từ vựng cho bài trắc nghiệm.');
      }
    } catch (err) {
      console.error('Lỗi khi tải từ vựng:', err);
      setError('Lỗi kết nối hoặc không tìm thấy từ vựng.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Xử lý khi chọn câu trả lời
  const handleAnswerSelect = (option) => {
    if (isAnswered) return; // Không cho chọn lại

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    
    setSelectedAnswer(option);
    setIsAnswered(true);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  // 4. Xử lý khi nhấn "Tiếp theo"
  const handleNextQuestion = () => {
    if (!isAnswered) return; // Phải trả lời trước khi next

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      // Reset trạng thái cho câu mới
      setIsAnswered(false);
      setSelectedAnswer(null);
    }
  };

  // 5. Xử lý khi nhấn "Xem kết quả"
  const handleViewResults = () => {
    // Xóa cài đặt khỏi localStorage
    localStorage.removeItem('quizSettings');
    // Chuyển trang qua trang kết quả
    navigate('/vocabulary/quiz/result', { 
      state: { 
        score: score, 
        totalQuestions: questions.length 
      } 
    });
  };

  // 6. Xử lý khi nhấn "Quay lại"
  const handleGoBack = () => {
    if (confirm('Bạn có chắc muốn thoát? Tiến trình sẽ không được lưu.')) {
      localStorage.removeItem('quizSettings');
      navigate('/vocabulary');
    }
  };

  // --- CÁC TRẠNG THÁI RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tạo bài kiểm tra...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="text-red-500 w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/vocabulary')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay về trang từ vựng
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
       <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có câu hỏi</h2>
          <p className="text-gray-600 mb-6">Không thể tạo câu hỏi từ dữ liệu hiện có.</p>
          <button
            onClick={() => navigate('/vocabulary')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay về trang từ vựng
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER BÀI QUIZ ---
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const optionLabels = ['A', 'B', 'C', 'D'];

  // Hàm lấy class cho mỗi lựa chọn
  const getOptionClass = (option) => {
    if (!isAnswered) {
      return 'border-gray-300 hover:bg-gray-50'; // Chưa trả lời
    }
    
    const isCorrect = option === currentQuestion.correctAnswer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) {
      return 'border-green-500 bg-green-50 text-green-700'; // Đáp án đúng
    }
    if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-50 text-red-700'; // Chọn sai
    }
    
    return 'border-gray-300 opacity-60'; // Các đáp án còn lại
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={handleGoBack} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft size={20} />
            Thoát
          </button>
          <span className="text-lg font-bold text-blue-600">
            Câu {currentQuestionIndex + 1}/{questions.length}
          </span>
          {/* <span className="text-xl font-bold text-blue-600">25s</span> */}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
            Từ "{currentQuestion.question}" có nghĩa là gì?
          </h2>

          {/* Options */}
          <div className="space-y-4 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={isAnswered}
                className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-all text-left ${getOptionClass(option)}`}
              >
                <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold ${isAnswered ? 'text-white' : 'text-gray-500'}`}
                  style={{
                    backgroundColor: 
                      (isAnswered && option === currentQuestion.correctAnswer) ? '#10B981' : 
                      (isAnswered && selectedAnswer === option) ? '#EF4444' : '#E5E7EB'
                  }}
                >
                  {optionLabels[index]}
                </span>
                <span className="text-lg font-medium">{option}</span>
              </button>
            ))}
          </div>

          {/* Explanation & Next Button */}
          {isAnswered && (
            <div className="animate-fadeIn">
              {/* Explanation */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-gray-700 mb-1">Giải thích:</h4>
                <p className="text-gray-600">{currentQuestion.explanation}</p>
              </div>

              {/* Button */}
              {currentQuestionIndex < questions.length - 1 ? (
                // Nút "Tiếp theo"
                <button
                  onClick={handleNextQuestion}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Tiếp theo
                </button>
              ) : (
                // Nút "Xem kết quả"
                <button
                  onClick={handleViewResults}
                  className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
                >
                  Xem kết quả
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}