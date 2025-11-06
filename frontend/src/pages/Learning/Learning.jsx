import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { assets } from '../../assets/assets';
import Header from '../../components/Header';

function Home() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [showReminder, setShowReminder] = useState(true);

    // Mock data - Bạn có thể thay bằng API call
    const stats = {
        wordsLearned: 245,
        currentTime: '19:00'
    };

    const handleContinueLearning = () => {
        navigate('/learn');
    };

    const handleViewAchievements = () => {
        navigate('/achievements');
    };

    const handleStartLearning = () => {
        navigate('/learn');
    };

    const handleRemindLater = () => {
        // Logic để nhắc lại sau 10 phút
        setShowReminder(false);
        setTimeout(() => {
            setShowReminder(true);
        }, 10 * 60 * 1000); // 10 phút
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="max-w-7xl pt-5 mx-auto">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm overflow-hidden mb-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
                        {/* Left Content */}
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Chào mừng trở lại, {user?.displayName || 'Alex'}! 👋
                            </h2>
                            <p className="text-lg text-gray-600 mb-6">
                                Hôm nay là ngày tuyệt vời để học thêm từ vựng mới.<br />
                                Bạn đã học được <span className="font-bold text-blue-600">{stats.wordsLearned} từ</span> trong tuần này!
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button 
                                    onClick={handleContinueLearning}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2 shadow-md hover:shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Tiếp tục học</span>
                                </button>
                                <button 
                                    onClick={handleViewAchievements}
                                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition border-2 border-blue-200 flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <span>Xem thành tích</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="hidden md:block">
                            <img 
                                src="https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=600&h=400&fit=crop" 
                                alt="Student learning" 
                                className="rounded-2xl shadow-xl w-full h-80 object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Reminder Card */}
                {showReminder && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 relative">
                        <button 
                            onClick={() => setShowReminder(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex items-start space-x-4">
                            {/* Clock Icon */}
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                                    Đã đến giờ học rồi! ⏰
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Bạn đã thiết lập lịch học lúc {stats.currentTime} hàng ngày. Hãy dành 20 phút để học từ vựng mới nhé!
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <button 
                                        onClick={handleStartLearning}
                                        className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center space-x-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Bắt đầu học</span>
                                    </button>
                                    <button 
                                        onClick={handleRemindLater}
                                        className="bg-white text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-50 transition border border-gray-300 flex items-center space-x-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Nhắc lại sau 10 phút</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Stats or Additional Content */}
                {/* <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700">Từ đã học hôm nay</h3>
                            <span className="text-2xl">📚</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-600">15</p>
                        <p className="text-sm text-gray-500 mt-2">Mục tiêu: 20 từ/ngày</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700">Chuỗi ngày học</h3>
                            <span className="text-2xl">🔥</span>
                        </div>
                        <p className="text-3xl font-bold text-orange-600">7 ngày</p>
                        <p className="text-sm text-gray-500 mt-2">Tiếp tục phát huy!</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700">Độ chính xác</h3>
                            <span className="text-2xl">🎯</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">85%</p>
                        <p className="text-sm text-gray-500 mt-2">Tốt lắm!</p>
                    </div>
                </div> */}

                {/* Statistics Grid - Top Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Từ đã học */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <img className='w-5 h-5' src={assets.open_book}/>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Từ đã học</p>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">1,247</p>
                        <p className="text-sm text-green-600 mt-1">+23 tuần này</p>
                    </div>

                    {/* Streak hiện tại */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <img className='w-5 h-5' src={assets.streak}/>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Streak hiện tại</p>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">15 ngày</p>
                        <p className="text-sm text-gray-600 mt-1">Kỷ lục 28 ngày</p>
                    </div>

                    {/* Độ chính xác */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <img className='w-5 h-5' src={assets.check}/>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Độ chính xác</p>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">87%</p>
                        <p className="text-sm text-green-600 mt-1">+5% so với tuần trước</p>
                    </div>

                    {/* Thời gian học */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <img className='w-5 h-5' src={assets.time}/>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Thời gian học</p>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">2h 30p</p>
                        <p className="text-sm text-gray-600 mt-1">Hôm nay</p>
                    </div>
                </div>

                {/* Main Learning Section - Two Columns */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left: Mục tiêu hôm nay */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Mục tiêu hôm nay</h3>
                            <span className="text-sm text-gray-600">18/25 từ</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Tiến độ</span>
                                <span className="text-sm font-semibold text-blue-600">72%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: '72%' }}></div>
                            </div>
                        </div>

                        {/* Remaining Info */}
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4">
                            <span className="text-gray-700">Còn lại <span className="font-bold text-blue-600">7 từ</span> để hoàn thành mục tiêu</span>
                        </div>

                        {/* Continue Learning Button */}
                        <button 
                            onClick={handleContinueLearning}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Học tiếp</span>
                        </button>
                    </div>

                    {/* Right: Tiến độ tuần này */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Tiến độ tuần này</h3>

                        {/* Bar Chart */}
                        <div className="flex items-end justify-between h-48 mb-4">
                            {[
                                { day: 'T2', value: 25, height: '62%' },
                                { day: 'T3', value: 30, height: '75%' },
                                { day: 'T4', value: 20, height: '50%' },
                                { day: 'T5', value: 35, height: '87%' },
                                { day: 'T6', value: 28, height: '70%' },
                                { day: 'T7', value: 15, height: '37%' },
                                { day: 'CN', value: 0, height: '0%' }
                            ].map((item, index) => (
                                <div key={index} className="flex flex-col items-center flex-1">
                                    <div className="w-full px-1 flex flex-col items-center justify-end h-full">
                                        <div 
                                            className={`w-full rounded-t-lg transition-all duration-500 ${
                                                item.value > 0 ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                            style={{ height: item.height }}
                                        ></div>
                                    </div>
                                    <div className="mt-2 text-center">
                                        <p className="text-xs font-semibold text-gray-700">{item.day}</p>
                                        <p className="text-xs text-gray-500">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total Words This Week */}
                        <div className="text-center pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-600">
                                Tổng: <span className="font-bold text-gray-900">153 từ</span> trong tuần này
                            </p>
                        </div>
                    </div>
                </div>

                

                {/* Quick Activities Section */}
                <div className="mb-8 mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Hoạt động nhanh</h3>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Flashcards */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <img className='w-5 h-5' src={assets.flashcard}/>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">Flashcards</h4>
                                    <p className="text-sm text-gray-600 mb-2">Ôn tập từ vựng với thẻ ghi nhớ</p>
                                    <p className="text-xs text-gray-500">45 thẻ mới</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Quiz */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">Quiz nhanh</h4>
                                    <p className="text-sm text-gray-600 mb-2">Kiểm tra kiến thức 5 phút</p>
                                    <p className="text-xs text-gray-500">10 câu hỏi</p>
                                </div>
                            </div>
                        </div>

                        {/* Listening Practice */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">Nghe phát âm</h4>
                                    <p className="text-sm text-gray-600 mb-2">Luyện nghe và phát âm</p>
                                    <p className="text-xs text-gray-500">20 từ mới</p>
                                </div>
                            </div>
                        </div>

                        {/* Word Bank */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">Từ khó</h4>
                                    <p className="text-sm text-gray-600 mb-2">Ôn lại từ bạn hay quên</p>
                                    <p className="text-xs text-gray-500">12 từ</p>
                                </div>
                            </div>
                        </div>

                        {/* Topic Learning */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">Học theo chủ đề</h4>
                                    <p className="text-sm text-gray-600 mb-2">Từ vựng theo chủ đề cụ thể</p>
                                    <p className="text-xs text-gray-500">8 chủ đề</p>
                                </div>
                            </div>
                        </div>

                        {/* Games */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">Trò chơi</h4>
                                    <p className="text-sm text-gray-600 mb-2">Học từ vựng qua game vui nhộn</p>
                                    <p className="text-xs text-gray-500">3 game mới</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </main>
        </div>
    );
}

export default Home;