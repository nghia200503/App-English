// frontend/src/pages/User/ProgressPage.jsx
import React, { useEffect, useState } from 'react';
import { getMyProgress } from '../../services/progressService';
import Header from '../../components/Header';
import { 
  BookOpen, 
  BadgeCheck, 
  Zap, 
  Headphones, 
  CheckCircle2, 
  Loader2,
  Activity
} from 'lucide-react';

const ProgressPage = () => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const data = await getMyProgress();
      setProgressData(data);
    } catch (error) {
      console.error("Failed to fetch progress", error);
    } finally {
      setLoading(false);
    }
  };

  // Tính toán thống kê
  const totalWordsInteracted = progressData.length;
  const masteredWords = progressData.filter(p => p.isMastered).length;
  const totalQuizCorrect = progressData.reduce((sum, p) => sum + (p.quiz?.correctCount || 0), 0);
  const totalListenCorrect = progressData.reduce((sum, p) => sum + (p.listen?.correctCount || 0), 0);

  // Component hiển thị Badge kỹ năng
  const SkillBadge = ({ active, count, label, color }) => {
    const colorClasses = {
      blue: active ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-400 border-gray-200",
      purple: active ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-gray-50 text-gray-400 border-gray-200",
      indigo: active ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-gray-50 text-gray-400 border-gray-200",
      emerald: active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200",
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]} transition-colors duration-200`}>
        {label}
        {count > 0 && <span className="ml-1.5 opacity-75">| {count}</span>}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Đang tải dữ liệu học tập...</p>
        </div>
      </div>
    );
  }

  return (
    // Layout thay đổi: Flex cột để Header ở trên, Main ở dưới full chiều rộng
    <div className="flex flex-col h-screen bg-gray-50">
      <Header title="Tiến Độ Học Tập Của Tôi" />
      
      <div className="flex-1 overflow-hidden relative">
        <main className="h-full overflow-x-hidden overflow-y-auto p-6 scroll-smooth">
          <div className="container mx-auto max-w-6xl">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Card 1 */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Đang học</span>
                </div>
                <div className="text-3xl font-bold text-gray-800">{totalWordsInteracted}</div>
                <p className="text-sm text-gray-500 mt-1">Từ vựng đã xem</p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <BadgeCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Thành thạo</span>
                </div>
                <div className="text-3xl font-bold text-gray-800">{masteredWords}</div>
                <p className="text-sm text-gray-500 mt-1">Từ đã thuộc lòng</p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quiz Point</span>
                </div>
                <div className="text-3xl font-bold text-gray-800">{totalQuizCorrect}</div>
                <p className="text-sm text-gray-500 mt-1">Câu trả lời đúng</p>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <Headphones className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Listening</span>
                </div>
                <div className="text-3xl font-bold text-gray-800">{totalListenCorrect}</div>
                <p className="text-sm text-gray-500 mt-1">Bài nghe đúng</p>
              </div>
            </div>

            {/* Details Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-bold text-gray-800">Chi tiết từ vựng</h3>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  Tổng: {progressData.length} từ
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                      <th className="px-6 py-4">Từ vựng</th>
                      <th className="px-6 py-4">Nghĩa</th>
                      <th className="px-6 py-4 text-center">Trạng thái</th>
                      <th className="px-6 py-4">Kỹ năng luyện tập</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {progressData.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-base font-bold text-indigo-900 block">
                            {item.wordId?.word || <span className="text-gray-400 italic">Đã xóa</span>}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">
                          {item.wordId?.translation}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.isMastered ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5" /> <span>Mastered</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
                              Learning
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <SkillBadge 
                              active={item.flashcard?.viewCount > 0} 
                              count={item.flashcard?.viewCount} 
                              label="Flashcard" 
                              color="blue" 
                            />
                            <SkillBadge 
                              active={item.listen?.correctCount > 0} 
                              count={item.listen?.correctCount} 
                              label="Listen" 
                              color="indigo" 
                            />
                            <SkillBadge 
                              active={item.quiz?.correctCount > 0} 
                              count={item.quiz?.correctCount} 
                              label="Quiz" 
                              color="purple" 
                            />
                            <SkillBadge 
                              active={item.spelling?.correctCount > 0} 
                              count={item.spelling?.correctCount} 
                              label="Spell" 
                              color="emerald" 
                            />
                          </div>
                        </td>
                      </tr>
                    ))}

                    {progressData.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <div className="bg-gray-100 p-4 rounded-full mb-3">
                                <BookOpen className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-base font-medium text-gray-600">Bạn chưa có dữ liệu học tập nào.</p>
                            <p className="text-sm mt-1 text-gray-400">Hãy bắt đầu học ngay để thấy tiến độ của bạn tại đây!</p>
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