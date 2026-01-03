import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, CheckCircle2, XCircle, ArrowRight, RotateCw, Star } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { studySessionService } from '../../services/studySessionService';
import { toast } from 'sonner';

export default function SpellResult() {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateUserProgress } = useAuthStore();
    
    const hasSaved = useRef(false);
    const [earnedXP, setEarnedXP] = useState(0);

    // Lấy dữ liệu từ Spell.jsx
    // correctCount là số từ viết đúng chính tả
    const { totalQuestions, correctCount } = location.state || { totalQuestions: 0, correctCount: 0 };

    const correctAnswers = correctCount;
    const wrongAnswers = totalQuestions - correctAnswers;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // --- LOGIC LƯU KẾT QUẢ ---
    useEffect(() => {
        const saveResult = async () => {
            if (totalQuestions === 0 || hasSaved.current) return;
            hasSaved.current = true;

            const sessionData = {
                mode: 'spell',
                totalQuestions: totalQuestions,
                correctAnswers: correctAnswers,
                // score ở backend sẽ tự tính dựa trên correctAnswers * XP_PER_QUESTION
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
                console.error("Lỗi lưu kết quả Spelling:", error);
            }
        };

        saveResult();
    }, [totalQuestions, correctAnswers, updateUserProgress]);

    // Logic hiển thị thông báo
    let message = "";
    let messageColor = "";
    if (percentage === 100) { message = "Hoàn hảo! Trí nhớ tuyệt vời 🧠"; messageColor = "text-green-600"; }
    else if (percentage >= 80) { message = "Rất tốt! Bạn viết rất chính xác"; messageColor = "text-emerald-600"; }
    else if (percentage >= 50) { message = "Tạm ổn, cẩn thận lỗi chính tả nhé"; messageColor = "text-yellow-600"; }
    else { message = "Cần luyện viết nhiều hơn!"; messageColor = "text-red-600"; }

    const handleGoBack = () => {
        navigate('/vocabulary');
    };

    if (totalQuestions === 0) {
        return (
            <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
                <button onClick={handleGoBack} className="text-purple-600 hover:underline">Quay lại</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-fadeIn">

                {/* Icon Cúp & Badge XP */}
                <div className="mb-6 relative inline-block">
                    <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl opacity-50"></div>
                    <div className="relative bg-purple-100 p-4 rounded-full text-purple-600">
                        <Trophy size={48} />
                    </div>
                    {earnedXP > 0 && (
                        <div className="absolute -top-2 -right-8 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-bounce flex items-center gap-1">
                            <Star size={12} fill="currentColor" /> +{earnedXP} XP
                        </div>
                    )}
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-2">Kết Quả Chính Tả</h1>
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
                        onClick={() => navigate('/vocabulary/spell')} 
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200"
                    >
                        <RotateCw size={20} />
                        Luyện tiếp
                    </button>
                </div>

            </div>
        </div>
    );
}