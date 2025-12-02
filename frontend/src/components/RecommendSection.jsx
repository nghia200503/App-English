import { useEffect, useState } from 'react';
import { aiService } from '../services/aiService'; // Bạn cần thêm hàm getRecommend vào service này
import { Loader2, Lightbulb, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecommendSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi API mới tạo ở backend
        const res = await aiService.getRecommendations(); 
        if (res.success) {
          setData(res);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2"/> Đang phân tích lộ trình...</div>;
  if (!data || data.words.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-blue-100 rounded-2xl p-6 my-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-full shadow-sm text-yellow-500">
          <Lightbulb size={24} fill="currentColor" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Gợi ý hôm nay dành cho bạn</h3>
          <p className="text-gray-600 text-sm italic mb-4">"{data.advice}"</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.words.map((word) => (
              <div key={word._id} className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-blue-600 text-lg">{word.word}</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-500">{word.type}</span>
                </div>
                <p className="text-gray-500 text-sm mb-2">{word.meaning}</p>
                <p className="text-xs text-indigo-500 bg-indigo-50 p-2 rounded mt-2">
                  💡 {word.reason}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 text-right">
            <Link to="/vocabulary" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800">
              Học ngay các từ này <ArrowRight size={16} className="ml-1"/>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}