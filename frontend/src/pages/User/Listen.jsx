import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../libs/axios';
import { AlertCircle, Volume2, ArrowLeft, Info, Loader2 } from 'lucide-react';
import { studySessionService } from '../../services/studySessionService';

// Hàm helper xáo trộn mảng
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

export default function Listen() {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null); 
  const [isAnswered, setIsAnswered] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [showListenWarning, setShowListenWarning] = useState(false);
  const [score, setScore] = useState(0); // score giờ sẽ đếm số câu đúng (1, 2, 3...) giống Quiz
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    const settingsData = localStorage.getItem('listenSettings');
    if (!settingsData) {
      setError('Không tìm thấy cài đặt. Vui lòng quay lại và chọn chế độ.');
      setLoading(false);
      return;
    }
    const { topic, limit } = JSON.parse(settingsData);
    fetchAndBuildQuiz(topic, limit);
  }, []);

  const fetchAndBuildQuiz = async (topic, limit) => {
    setLoading(true);
    setError(null);
    try {
      const topicName = topic.nameTopic === 'Tất cả' ? 'all' : topic.nameTopic;
      const response = await api.get(`/words?topic=${topicName}&limit=all`);
      const allWords = response.data?.data;

      if (!allWords || allWords.length === 0) {
        setError('Không tìm thấy từ vựng nào cho chủ đề này.');
        setLoading(false);
        return;
      }
      
      // Luôn đảm bảo fetch đủ 4 từ để làm đáp án nhiễu nếu có thể
      const shuffledWords = shuffleArray([...allWords]);
      
      // Số câu hỏi cần tạo
      const userLimit = parseInt(limit);
      const questionsToCreate = limit === 'all' ? shuffledWords.length : Math.min(userLimit, shuffledWords.length);
      
      const correctWords = shuffledWords.slice(0, questionsToCreate);

      const newQuizQuestions = correctWords.map((correctWord) => {
        // Lấy các từ khác làm đáp án nhiễu
        const otherWords = allWords.filter(w => w._id !== correctWord._id);
        const shuffledOthers = shuffleArray([...otherWords]);
        
        // Lấy tối đa 3 đáp án sai
        let distractors = shuffledOthers.slice(0, 3);
        
        // Fallback nếu không đủ từ trong DB (lặp lại từ để giữ layout)
        while (distractors.length < 3 && allWords.length > 1) {
             distractors.push(shuffledOthers[0] || correctWord); 
        }

        const options = shuffleArray([
          correctWord.word,
          ...distractors.map(d => d.word)
        ]);

        return {
          correctWordObject: correctWord, 
          options: options,           
          correctAnswer: correctWord.word, 
        };
      });

      setQuizQuestions(newQuizQuestions);
    } catch (err) {
      console.error('Lỗi khi tải từ vựng:', err);
      setError('Lỗi kết nối hoặc không tìm thấy từ vựng.');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (speed = 1.0) => {
    if (quizQuestions.length === 0) return;
    const audioUrl = quizQuestions[currentQuestionIndex]?.correctWordObject.audio;
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audio.playbackRate = speed;
      audio.play().catch(err => console.error('Lỗi phát âm:', err));
      audioRef.current = audio;
      setHasListened(true);
      setShowListenWarning(false); 
    }
  };

  const handleAnswerSelect = (selectedWord) => {
    if (isAnswered) return;
    if (!hasListened) {
      setShowListenWarning(true); 
      return;
    }
    
    setIsAnswered(true);
    setSelectedAnswer(selectedWord);
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = selectedWord === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1); // Tăng 1 điểm cho mỗi câu đúng (giống Quiz)
    }
  };

  const handleNext = () => {
    if (!isAnswered) return;
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < quizQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setHasListened(false);
      setShowListenWarning(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      handleViewResults();
    }
  };
  
  const handleViewResults = async () => {
    // Lưu vào lịch sử học tập (Database)
    // score ở đây là số câu đúng.
    await studySessionService.saveSession({
        mode: 'listen',
        totalQuestions: quizQuestions.length, 
        correctAnswers: score, 
        score: Math.round((score / quizQuestions.length) * 10) // Quy đổi ra thang điểm 10 để lưu DB
    });
    
    localStorage.removeItem('listenSettings');
    
    // Chuyển trang & Gửi dữ liệu qua state
    navigate('/vocabulary/listen/result', { 
      state: { 
        score: score, // Số câu đúng
        totalQuestions: quizQuestions.length
      } 
    });
  };

  const handleGoBack = () => {
    if (confirm('Bạn có chắc muốn thoát? Tiến trình sẽ không được lưu.')) {
      localStorage.removeItem('listenSettings');
      navigate('/vocabulary');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
          <p className="text-gray-600 text-lg">Đang tạo bài luyện nghe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="text-red-500 w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thông báo</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/vocabulary')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Quay về trang từ vựng
          </button>
        </div>
      </div>
    );
  }
  
  if (quizQuestions.length === 0) return null;
  
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const { correctWordObject, options, correctAnswer } = currentQuestion;
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  const optionLetters = ['A', 'B', 'C', 'D'];

  const getOptionClass = (option) => {
    if (!isAnswered) {
      return 'border-gray-300 hover:bg-gray-50';
    }
    if (option === correctAnswer) {
      return 'border-green-500 bg-green-50 text-green-700 font-medium'; 
    }
    if (option === selectedAnswer) {
      return 'border-red-500 bg-red-50 text-red-700 font-medium';
    }
    return 'border-gray-300 text-gray-500'; 
  };

  return (
    <div className="min-h-screen bg-purple-50 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="absolute top-4 left-4">
           <button onClick={handleGoBack} className="flex items-center gap-2 text-gray-500 hover:text-purple-600">
            <ArrowLeft size={20} />
            Thoát
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Card */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-500">
                Từ {currentQuestionIndex + 1}/{quizQuestions.length}
              </span>
              <span className="text-sm font-medium text-purple-600">
                Đúng: {score}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="p-6 md:p-8 grid md:grid-cols-2 items-start">
            
            {/* CỘT BÊN TRÁI */}
            <div className="flex flex-col items-center md:sticky md:top-24">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Nghe và chọn từ đúng
              </h2>
              
              <button
                onClick={() => playAudio(1.0)}
                className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600 hover:bg-purple-200 transition"
              >
                <Volume2 size={36} />
              </button>
              <p className="text-sm text-gray-500 mb-4">
                {hasListened ? `Đã nghe` : 'Nhấn để nghe từ'}
              </p>
              
              <div className="flex gap-3 mb-6">
                <button onClick={() => playAudio(0.75)} className="px-4 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100">Chậm</button>
                <button onClick={() => playAudio(1.0)} className="px-4 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100">Bình thường</button>
                <button onClick={() => playAudio(1.25)} className="px-4 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100">Nhanh</button>
              </div>
            </div>

            {/* CỘT BÊN PHẢI */}
            <div className="w-full flex flex-col gap-3">
              
              {showListenWarning && (
                <div className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm flex items-center gap-2">
                  <Info size={18} />
                  Vui lòng nghe từ trước khi chọn đáp án
                </div>
              )}
              
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={`w-full flex items-center text-left p-4 border-2 rounded-lg transition-all ${getOptionClass(option)}`}
                >
                  <span className="font-bold w-6 text-sm">{optionLetters[index]}.</span>
                  <span className="ml-2 text-base">{option}</span>
                </button>
              ))}
            </div>

            {/* Thông tin từ (Khi đã trả lời) */}
            {isAnswered && (
              <div className="md:col-span-2 w-full bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-800 mb-2">Thông tin từ:</h4>
                <p><strong>Từ:</strong> {correctWordObject.word}</p>
                <p><strong>Nghĩa:</strong> {correctWordObject.translation}</p>
                <p><strong>Phát âm:</strong> {correctWordObject.pronunciation}</p>
              </div>
            )}
            
            {/* Nút Tiếp theo */}
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className="md:col-span-2 w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition disabled:bg-gray-300 mt-4"
            >
              {currentQuestionIndex === quizQuestions.length - 1 ? 'Xem kết quả' : 'Từ tiếp theo'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}