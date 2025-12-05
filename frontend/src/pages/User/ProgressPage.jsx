import { useEffect, useState } from 'react';
import { 
    Trophy, Star, Calendar, Activity, 
    TrendingUp, CheckCircle2, XCircle, Clock 
} from 'lucide-react';
import { studySessionService } from '../../services/studySessionService';
import { useAuthStore } from '../../stores/useAuthStore';
import Header from '../../components/Header';
import { toast } from 'sonner';

export default function ProgressPage() {
    const { user } = useAuthStore();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalTime: 0, // Giả sử nếu có tracking time
        accuracy: 0
    });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await studySessionService.getHistory();
                if (response.success) {
                    const data = response.data;
                    setHistory(data);
                    
                    // Tính toán thống kê nhanh
                    const totalCorrect = data.reduce((acc, session) => acc + session.correctAnswers, 0);
                    const totalQuestions = data.reduce((acc, session) => acc + session.totalQuestions, 0);
                    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
                    
                    setStats({
                        totalSessions: data.length,
                        accuracy: accuracy
                    });
                }
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
                toast.error("Không thể tải lịch sử học tập");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // Format ngày giờ
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Helper: Icon và tên chế độ học
    const getModeInfo = (mode) => {
        switch (mode) {
            case 'quiz': return { label: 'Trắc nghiệm', color: 'text-blue-600', bg: 'bg-blue-100', icon: <Activity size={18} /> };
            case 'listen': return { label: 'Luyện nghe', color: 'text-purple-600', bg: 'bg-purple-100', icon: <Activity size={18} /> }; // Có thể thay icon tai nghe
            case 'flashcard': return { label: 'Flashcard', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <Activity size={18} /> };
            case 'spell': return { label: 'Chính tả', color: 'text-green-600', bg: 'bg-green-100', icon: <Activity size={18} /> };
            default: return { label: mode, color: 'text-gray-600', bg: 'bg-gray-100', icon: <Activity size={18} /> };
        }
    };

    // Tính toán Level Progress
    const currentLevel = user?.level || 1;
    const currentXP = user?.experiencePoints || 0;
    const xpToNextLevel = currentLevel * 100;
    const progressPercent = Math.min((currentXP / xpToNextLevel) * 100, 100);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-10">
            <Header />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Thống Kê Học Tập</h1>
                    <p className="text-gray-600 mt-1">Theo dõi tiến độ và thành tích của bạn</p>
                </div>

                {/* 1. Stats Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    
                    {/* Card 1: Level & XP */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full -mr-6 -mt-6"></div>
                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">Cấp độ hiện tại</p>
                                <h2 className="text-3xl font-bold text-gray-800">Level {currentLevel}</h2>
                            </div>
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                <Trophy size={20} />
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="relative z-10">
                            <div className="flex justify-between text-xs mb-1 font-medium text-gray-500">
                                <span>{currentXP} XP</span>
                                <span>{xpToNextLevel} XP</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div 
                                    className="bg-yellow-500 h-2.5 rounded-full transition-all duration-1000" 
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-right">
                                Còn {xpToNextLevel - currentXP} XP để lên cấp
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Total Sessions */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">Số phiên học</p>
                                <h2 className="text-3xl font-bold text-gray-800">{stats.totalSessions}</h2>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <Calendar size={20} />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-green-600 font-medium bg-green-50 w-fit px-2 py-1 rounded-md">
                            <TrendingUp size={14} />
                            <span>Đang hoạt động tốt</span>
                        </div>
                    </div>

                    {/* Card 3: Accuracy */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">Độ chính xác trung bình</p>
                                <h2 className="text-3xl font-bold text-gray-800">{stats.accuracy}%</h2>
                            </div>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle2 size={20} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-400">Dựa trên các bài kiểm tra của bạn</p>
                    </div>
                </div>

                {/* 2. History List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Clock size={20} className="text-blue-600" /> 
                            Lịch sử hoạt động gần đây
                        </h3>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Đang tải lịch sử...</div>
                    ) : history.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <p>Bạn chưa có hoạt động nào.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {history.map((session) => {
                                const modeInfo = getModeInfo(session.mode);
                                const isPerfect = session.correctAnswers === session.totalQuestions && session.totalQuestions > 0;

                                return (
                                    <div key={session._id} className="p-5 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        
                                        {/* Left: Info */}
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${modeInfo.bg} ${modeInfo.color}`}>
                                                {modeInfo.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">{modeInfo.label}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">{formatDate(session.createdAt)}</p>
                                            </div>
                                        </div>

                                        {/* Center: Score/Result */}
                                        <div className="flex items-center gap-6 sm:justify-center flex-1">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs text-gray-400 uppercase font-semibold">Kết quả</span>
                                                <div className="flex items-center gap-1 font-medium text-gray-700">
                                                    <span className="text-green-600">{session.correctAnswers}</span>
                                                    <span className="text-gray-300">/</span>
                                                    <span>{session.totalQuestions}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs text-gray-400 uppercase font-semibold">Điểm XP</span>
                                                <div className="flex items-center gap-1 font-bold text-amber-500">
                                                    <Star size={14} fill="currentColor" />
                                                    <span>+{session.score || 0}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Badge (Optional) */}
                                        <div className="hidden sm:block w-24 text-right">
                                            {isPerfect && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                                                    Hoàn hảo
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}