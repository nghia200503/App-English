import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../libs/axios';
import { toast } from 'sonner';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

export default function AdminHome(){

  const navigate = useNavigate();

  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalWords: 0,
    activeUsers: 0,
    totalTopics: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Gọi API song song để tối ưu hiệu suất
      const [usersResponse, wordsResponse, topicsResponse] = await Promise.all([
        // SỬA ĐỔI: Yêu cầu limit lớn (ví dụ: 1000) để lấy TẤT CẢ user
        // mục đích là để đếm chính xác 'activeUsers'
        api.get('/users/list', { params: { page: 1, limit: 1000 } }), 
        api.get('/words', { params: { page: 1, limit: 1 } }), // Chỉ cần pagination data
        api.get('/topics/list', { params: { page: 1, limit: 1 } }) // Chỉ cần pagination data
      ]);
      
      // --- SỬA LỖI TẠI ĐÂY ---
      
      // const users = usersResponse.data; // LỖI GỐC: users là { data: [], ... }
      
      const usersData = usersResponse.data;     // usersData là object { success, data, pagination }
      const usersList = usersData.data;       // usersList mới là MẢNG: [ {user1}, ... ]
      
      const wordsData = wordsResponse.data;
      const topicsData = topicsResponse.data;
      
      // Tính toán thống kê
      
      // LỖI LOGIC GỐC: users.length trả về undefined
      // const totalUsers = users.length; 
      
      // SỬA: Lấy tổng số user từ pagination
      const totalUsers = usersData.pagination?.totalItems || 0; 
      
      // LỖI CRASH GỐC: users.filter is not a function
      // LỖI LOGIC GỐC: Chỉ đếm user ở trang 1
      // const activeUsers = users.filter(user => user.role === 'user').length;
      
      // SỬA: Lọc trên 'usersList' (đã chứa tất cả user do limit: 1000)
      const activeUsers = usersList.filter(user => user.role === 'user').length;

      const totalWords = wordsData.pagination?.totalItems || 0;
      const totalTopics = topicsData.pagination?.totalItems || 0;
      
      // ---------------------
      
      // Cập nhật state
      setStatistics({
        totalUsers,
        totalWords,
        activeUsers,
        totalTopics
      });
      
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
      toast.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ...Phần JSX giữ nguyên, không cần thay đổi...
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bảng tin</h1>
          <p className="text-gray-600 mt-1">Tổng quan về hệ thống</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Đang tải dữ liệu...</div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Tổng user */}
                <div onClick={() => navigate('/admin/user-list')} className="bg-white cursor-pointer rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">Tổng người dùng</p>
                      <p className="text-3xl font-bold text-gray-900">{statistics.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <img className="w-10 h-10" src={assets.total_user}/>
                    </div>
                  </div>
                </div>

                {/* Tổng chủ đề */}
                <div onClick={() => navigate('/admin/topic-list')} className="bg-white cursor-pointer rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">Tổng chủ đề</p>
                      <p className="text-3xl font-bold text-gray-900">{statistics.totalTopics.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <img className="w-10 h-10" src={assets.total_topic}/>
                    </div>
                  </div>
                </div>

                {/* Tổng từ vựng */}
                <div onClick={() => navigate('/admin/word-list')} className="cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">Tổng từ vựng</p>
                      <p className="text-3xl font-bold text-gray-900">{statistics.totalWords.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <img className="w-10 h-10" src={assets.total_word}/>
                    </div>
                  </div>
                </div>

                {/* Người dùng hoạt động */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">Người dùng hoạt động</p>
                      <p className="text-3xl font-bold text-gray-900">{statistics.activeUsers.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <img className="w-10 h-10" src={assets.user_active}/>
                    </div>
                  </div>
                </div>
              
            </div>
          </>
        )}
      </div>
    </div>
  );
};