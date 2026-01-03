import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, CheckCircle2, XCircle, ArrowRight, RotateCw, Star } from 'lucide-react';
import QuizPopup from '../../components/QuizPopup';
import { useAuthStore } from '../../stores/useAuthStore';
import { studySessionService } from '../../services/studySessionService';
import { toast } from 'sonner';

export default function QuizResult() {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateUserProgress } = useAuthStore();
    
    const hasSaved = useRef(false);
    const [earnedXP, setEarnedXP] = useState(0);
    const [isQuizPopupOpen, setIsQuizPopupOpen] = useState(false);

    // Đọc state được truyền từ trang Quiz
    const { score, totalQuestions } = location.state || { score: 0, totalQuestions: 0 };

    const correctAnswers = score;
    const wrongAnswers = totalQuestions - correctAnswers;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // --- LOGIC LƯU KẾT QUẢ ---
    useEffect(() => {
        const saveResult = async () => {
            if (totalQuestions === 0 || hasSaved.current) return;
            hasSaved.current = true;

            const sessionData = {
                mode: 'quiz',
                totalQuestions: totalQuestions,
                correctAnswers: correctAnswers,
            };

            try {
                const response = await studySessionService.saveSession(sessionData);

                if (response && response.success) {
                    const { currentLevel, currentExp, levelUp, xpEarned } = response.userUpdate;
                    
                    updateUserProgress(currentExp, currentLevel);
                    setEarnedXP(xpEarned);

                    if (levelUp) {
                        toast.success(`🎉 Chúc mừng! Bạn đã lên Level ${currentLevel}!`);
                    } else if (xpEarned > 0) {
                        toast.success(`Đã lưu kết quả! +${xpEarned} XP`);
                    }
                }
            } catch (error) {
                console.error("Lỗi lưu kết quả Quiz:", error);
            }
        };

        saveResult();
    }, [totalQuestions, correctAnswers, updateUserProgress]);

    // Logic hiển thị thông báo
    let message = "";
    let messageColor = "";
    if (percentage === 100) { message = "Tuyệt đối! Bạn là bậc thầy từ vựng 🏆"; messageColor = "text-green-600"; }
    else if (percentage >= 80) { message = "Rất tốt! Kiến thức vững vàng"; messageColor = "text-blue-600"; }
    else if (percentage >= 50) { message = "Khá tốt, cố gắng thêm chút nữa"; messageColor = "text-yellow-600"; }
    else { message = "Cần ôn tập thêm nhé!"; messageColor = "text-red-600"; }

    const handleRetry = () => {
        setIsQuizPopupOpen(false);
        navigate('/vocabulary/quiz');
    };

    const handleGoBack = () => {
        navigate('/vocabulary');
    };

    if (totalQuestions === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Không có dữ liệu kết quả.</p>
                    <button onClick={handleGoBack} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        Về trang từ vựng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-fadeIn">

                {/* Icon Cúp & Badge XP */}
                <div className="mb-6 relative inline-block">
                    <div className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-50"></div>
                    <div className="relative bg-green-100 p-4 rounded-full text-green-600">
                        <Trophy size={48} />
                    </div>
                    {earnedXP > 0 && (
                        <div className="absolute -top-2 -right-8 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-bounce flex items-center gap-1">
                            <Star size={12} fill="currentColor" /> +{earnedXP} XP
                        </div>
                    )}
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-2">Kết Quả Trắc Nghiệm</h1>
                <p className={`text-lg font-medium mb-8 ${messageColor}`}>{message}</p>

                {/* Thống kê Đúng / Sai */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <CheckCircle2 className="text-green-600" size={20} />
                            <span className="text-green-800 font-semibold">Đúng</span>
                        </div>
                        <p className="text-3xl font-bold text-green-700">{correctAnswers}</p>
                    </div>

                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <XCircle className="text-red-500" size={20} />
                            <span className="text-red-800 font-semibold">Sai</span>
                        </div>
                        <p className="text-3xl font-bold text-red-700">{wrongAnswers}</p>
                    </div>
                </div>

                {/* Điểm số */}
                {/* <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 text-sm mb-1">Điểm số</p>
                    <p className="text-4xl font-bold text-gray-800">{percentage}/100</p>
                </div> */}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleGoBack}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
                    >
                        <ArrowRight size={20} />
                        Thoát
                    </button>
                    <button
                        onClick={() => setIsQuizPopupOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200"
                    >
                        <RotateCw size={20} />
                        Làm lại
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