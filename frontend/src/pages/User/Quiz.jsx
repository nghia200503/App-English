import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../libs/axios';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { updateWordProgress } from '../../services/progressService';
// ĐÃ XÓA: import studySessionService để tránh lưu 2 lần

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

const generateQuestions = (words) => {
  if (words.length < 4) return []; 

  return words.map((word) => {
    const correctAnswer = word.translation;
    let incorrectOptions = [];
    while (incorrectOptions.length < 3) {
      const randomIndex = Math.floor(Math.random() * words.length);
      const randomWord = words[randomIndex];
      if (randomWord._id !== word._id && !incorrectOptions.includes(randomWord.translation)) {
        incorrectOptions.push(randomWord.translation);
      }
    }

    const options = shuffleArray([correctAnswer, ...incorrectOptions]);
    const explanation = `"${word.word}" (${word.pronunciation}) có nghĩa là "${word.translation}".`;

    return {
      wordId: word._id,
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
  const [selectedAnswer, setSelectedAnswer] = useState(null); 
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
      
      const response = await api.get(`/words?topic=${topicName}&limit=${limit}`);
      const result = response.data;

      if (result.success && result.data) {
        if (result.data.length < 1) {
          setError(`Không đủ từ vựng (cần ít nhất 1, tìm thấy ${result.data.length}) để tạo bài trắc nghiệm.`);
        } else {
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

  const handleAnswerSelect = (option) => {
    if (isAnswered) return; 
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    setSelectedAnswer(option);
    setIsAnswered(true);
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    if (currentQuestion.wordId) {
        updateWordProgress(currentQuestion.wordId, 'quiz', isCorrect);
    }
  };

  const handleNextQuestion = () => {
    if (!isAnswered) return;
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setIsAnswered(false);
      setSelectedAnswer(null);
    }
  };

  const handleViewResults = () => {
    // --- SỬA: KHÔNG GỌI API SAVE SESSION Ở ĐÂY NỮA ---
    localStorage.removeItem('quizSettings');
    
    // Chuyển trang và để QuizResult lưu kết quả
    navigate('/vocabulary/quiz/result', { 
      state: { 
        score: score, 
        totalQuestions: questions.length 
      } 
    });
  };

  const handleGoBack = () => {
    if (confirm('Bạn có chắc muốn thoát? Tiến trình sẽ không được lưu.')) {
      localStorage.removeItem('quizSettings');
      navigate('/vocabulary');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Đang tải...</div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">{error}</div>;
  }
  if (questions.length === 0) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">Không có câu hỏi.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const optionLabels = ['A', 'B', 'C', 'D'];

  const getOptionClass = (option) => {
    if (!isAnswered) {
      return 'border-gray-300 hover:bg-gray-50';
    }
    const isCorrect = option === currentQuestion.correctAnswer;
    const isSelected = option === selectedAnswer;
    if (isCorrect) {
      return 'border-green-500 bg-green-50 text-green-700';
    }
    if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-50 text-red-700';
    }
    return 'border-gray-300 opacity-60';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-4">
          <button onClick={handleGoBack} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft size={20} />
            Thoát
          </button>
          <span className="text-lg font-bold text-blue-600">
            Câu {currentQuestionIndex + 1}/{questions.length}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="grid md:grid-cols-2 md:gap-8 items-start">
            
            <div className="md:sticky md:top-24">
              <p className="text-base text-gray-500 mb-2">Từ này có nghĩa là gì?</p>
              <div className="bg-blue-50 p-6 rounded-lg text-center flex items-center justify-center min-h-[150px]">
                <h2 className="text-4xl font-bold text-blue-700">
                  {currentQuestion.question}
                </h2>
              </div>
            </div>

            <div className="space-y-4 mt-6 md:mt-0">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-all text-left ${getOptionClass(option)}`}
                >
                  <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                    (isAnswered && (option === currentQuestion.correctAnswer || selectedAnswer === option))
                    ? 'text-white' 
                    : 'text-gray-500'
                  }`}
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
          </div>

          {isAnswered && (
            <div className="animate-fadeIn mt-6 border-t pt-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-gray-700 mb-1">Giải thích:</h4>
                <p className="text-gray-600">{currentQuestion.explanation}</p>
              </div>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Tiếp theo
                </button>
              ) : (
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