import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import QuizPopup from '../../components/QuizPopup';
import { useState } from 'react';

export default function QuizResult() {
    const navigate = useNavigate();
    const location = useLocation();

    const [isQuizPopupOpen, setIsQuizPopupOpen] = useState(false);

    // Đọc state được truyền từ trang Quiz
    const { score, totalQuestions } = location.state || { score: 0, totalQuestions: 0 };

    if (totalQuestions === 0) {
        // Xử lý trường hợp người dùng vào thẳng trang này
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Không có dữ liệu kết quả.</p>
                    <button
                        onClick={() => navigate('/vocabulary')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Về trang từ vựng
                    </button>
                </div>
            </div>
        );
    }

    const percentage = Math.round((score / totalQuestions) * 100);

    const handleRetry = () => {
        // Quay lại trang Vocabulary để người dùng có thể chọn lại Quiz
        // (Vì quizSettings đã bị xóa, quay lại /quiz sẽ bị lỗi)
        setIsQuizPopupOpen(false);
        navigate('/vocabulary/quiz');
        // Nếu bạn muốn làm lại ngay, bạn cần giữ lại quizSettings
        // và navigate('/quiz')
    };


    const handleGoBack = () => {
        navigate('/vocabulary');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">

                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="text-blue-600" size={32} />
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-2">Hoàn thành!</h1>
                <p className="text-gray-600 mb-8">Bạn đã hoàn thành bài trắc nghiệm</p>

                {/* Stats */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Tổng câu hỏi</p>
                            <p className="text-3xl font-bold text-blue-600">{totalQuestions}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Câu đúng</p>
                            <p className="text-3xl font-bold text-green-600">{score}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Điểm số</p>
                            <p className="text-3xl font-bold text-blue-600">{percentage}%</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleGoBack}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                    >
                        Quay lại
                    </button>
                    <button
                        onClick={() => setIsQuizPopupOpen(true)}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                        Làm bài khác
                    </button>
                </div>

                <QuizPopup
                    isOpen={isQuizPopupOpen}
                    onClose={() => setIsQuizPopupOpen(false)}
                    onStartQuiz={handleRetry}
                />

            </div>
        </div>
    );
}