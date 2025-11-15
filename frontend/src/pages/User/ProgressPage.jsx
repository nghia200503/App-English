// frontend/src/pages/User/ProgressPage.jsx
import React, { useEffect, useState } from 'react';
import { studySessionService } from '../../services/studySessionService'; // Import service mới
import Header from '../../components/Header';
import { 
  History, 
  Calendar, 
  Target, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Trophy,
  BrainCircuit,
  Headphones,
  Zap,
  Book
} from 'lucide-react';

const ProgressPage = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await studySessionService.getHistory();
      if (response && response.success) {
        setHistoryData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm helper để format ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Hàm helper để lấy Icon và Màu theo Mode
  const getModeConfig = (mode) => {
    switch (mode) {
      case 'quiz':
        return { label: 'Trắc nghiệm', icon: <Zap size={18} />, color: 'text-purple-600 bg-purple-100 border-purple-200' };
      case 'flashcard':
        return { label: 'Flashcard', icon: <Book size={18} />, color: 'text-blue-600 bg-blue-100 border-blue-200' };
      case 'listen':
        return { label: 'Luyện nghe', icon: <Headphones size={18} />, color: 'text-orange-600 bg-orange-100 border-orange-200' };
      case 'spell':
        return { label: 'Chính tả', icon: <BrainCircuit size={18} />, color: 'text-emerald-600 bg-emerald-100 border-emerald-200' };
      default:
        return { label: mode, icon: <History size={18} />, color: 'text-gray-600 bg-gray-100 border-gray-200' };
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Đang tải lịch sử học tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header title="Lịch Sử Học Tập" />
      
      <div className="flex-1 overflow-hidden relative">
        <main className="h-full overflow-x-hidden overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="container mx-auto max-w-5xl">
           

            {/* Bảng Lịch Sử */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <History className="text-blue-600" size={24} />
                  Nhật ký hoạt động
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                      <th className="px-6 py-4">Thời gian</th>
                      <th className="px-6 py-4">Hình thức</th>
                      <th className="px-6 py-4 text-center">Số câu hỏi</th>
                      <th className="px-6 py-4">Kết quả chi tiết</th>
                      <th className="px-6 py-4 text-center">Điểm số</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historyData.map((session) => {
                      const config = getModeConfig(session.mode);
                      
                      // Tính toán số câu sai (nếu API không trả về)
                      const wrongAnswers = session.wrongAnswers ?? (session.totalQuestions - session.correctAnswers);
                      
                      return (
                        <tr key={session._id} className="hover:bg-blue-50/50 transition-colors group cursor-default">
                          {/* Cột 1: Thời gian */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar size={16} className="text-gray-400" />
                              <span className="font-medium">{formatDate(session.createdAt)}</span>
                            </div>
                          </td>

                          {/* Cột 2: Hình thức (Mode) */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold ${config.color}`}>
                              {config.icon}
                              {config.label}
                            </span>
                          </td>

                          {/* Cột 3: Số câu hỏi */}
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-gray-700">{session.totalQuestions}</span>
                          </td>

                          {/* Cột 4: Kết quả chi tiết (Đúng/Sai) */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-md border border-green-100">
                                <CheckCircle2 size={16} />
                                <span className="font-bold">{session.correctAnswers}</span>
                                <span className="text-xs opacity-80">Đúng</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-red-500 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                                <XCircle size={16} />
                                <span className="font-bold">{wrongAnswers}</span>
                                <span className="text-xs opacity-80">Sai</span>
                              </div>
                            </div>
                          </td>

                          {/* Cột 5: Điểm số - ĐÃ THAY ĐỔI */}
                          <td className="px-6 py-4 text-center">
                            <div className="inline-block px-3 py-1 rounded-lg font-bold text-sm bg-gray-200">
                              {/* ĐÂY LÀ DÒNG ĐÃ THAY ĐỔI */}
                              {(session.correctAnswers) * 10} / {(session.totalQuestions) * 10}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {historyData.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <div className="bg-gray-100 p-4 rounded-full mb-3">
                                <History className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-base font-medium text-gray-600">Chưa có lịch sử học tập.</p>
                            <p className="text-sm mt-1 text-gray-400">Hãy làm bài kiểm tra để lưu lại kết quả!</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default ProgressPage;