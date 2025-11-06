import React from 'react';
import { Link } from 'react-router-dom';

export default function VocabMasterHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">VocabMaster</div>
          <div className="flex gap-4">
            <Link to="/login"><button oncl className="cursor-pointer px-6 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition">
              Đăng nhập
            </button></Link>
            <Link to="/register"><button className="cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              Đăng ký miễn phí
            </button></Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-200 to-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-2">
                Học từ vựng
              </h1>
              <h2 className="text-5xl font-bold text-blue-600 mb-6">
                thông minh hơn
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Nâng cao vốn từ vựng của bạn với phương pháp học tập khoa học, theo dõi tiến độ chi tiết và hệ thống ôn tập thông minh.
              </p>
              <div className="flex gap-4">
                <button className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  Bắt đầu học ngay
                </button>
                <button className="px-8 py-3 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop" 
                alt="Learning" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">Tại sao chọn VocabMaster?</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Chúng tôi cung cấp những công cụ học tập hiện đại nhất để giúp bạn nắm vững từ vựng một cách hiệu quả và bền vững.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-blue-50 p-8 rounded-lg">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Học thông minh</h3>
              <p className="text-gray-600">
                Hệ thống AI phân tích khả năng học tập và đề xuất từ vựng phù hợp với trình độ của bạn.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-green-50 p-8 rounded-lg">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Theo dõi tiến độ</h3>
              <p className="text-gray-600">
                Thống kê chi tiết và trực quan về tiến trình học tập, số từ đã thuộc và đã ôn chính xác trong các bài kiểm tra.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-purple-50 p-8 rounded-lg">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Ôn tập định kỳ</h3>
              <p className="text-gray-600">
                Hệ thống nhắc nhở thông minh giúp bạn ôn tập đúng thời điểm để ghi nhớ lâu dài.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-orange-50 p-8 rounded-lg">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Phát âm chuẩn</h3>
              <p className="text-gray-600">
                Học phát âm chuẩn với âm thanh từ người bản ngữ và công nghệ nhận diện giọng nói.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-red-50 p-8 rounded-lg">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Học qua trò chơi</h3>
              <p className="text-gray-600">
                Các mini-game thú vị giúp việc học từ vựng trở nên vui nhộn và không nhàm chán.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-teal-50 p-8 rounded-lg">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Đồng bộ đa thiết bị</h3>
              <p className="text-gray-600">
                Học mọi lúc mọi nơi với dữ liệu được đồng bộ tất cả thiết bị.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Được tin tưởng bởi hàng nghìn học viên</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Học viên đang học</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50,000+</div>
              <div className="text-blue-100">Từ vựng đã học</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Độ hài lòng</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Hỗ trợ học tập</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">Cách thức hoạt động</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Chỉ với 3 bước đơn giản, bạn có thể bắt đầu hành trình học từ vựng hiệu quả
          </p>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4">Đăng ký tài khoản</h3>
              <p className="text-gray-600">
                Tạo tài khoản miễn phí chỉ trong vài giây và bắt đầu hành trình học tập của bạn.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4">Chọn mục đích</h3>
              <p className="text-gray-600">
                Làm bài kiểm tra đầu vào để hệ thống đánh giá trình độ và đề xuất lộ trình phù hợp.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4">Bắt đầu học</h3>
              <p className="text-gray-600">
                Học từ vựng mỗi ngày, ôn tập định kỳ và theo dõi tiến độ của bạn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Sẵn sàng nâng cao vốn từ vựng của bạn?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Tham gia cùng hàng nghìn học viên đã cải thiện khả năng ngôn ngữ với VocabMaster
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register"><button className="cursor-pointer px-8 py-4 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition font-bold text-lg">
              Đăng ký ngay
            </button></Link>
            <Link to="/login"><button className="cursor-pointer px-8 py-4 border-2 border-white text-white rounded-md hover:bg-white/10 transition font-bold text-lg">
              Đăng nhập
            </button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">VocabMaster</div>
              <p className="text-gray-400">
                Ứng dụng học từ vựng thông minh giúp bạn nâng cao khả năng ngôn ngữ một cách hiệu quả.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Sản phẩm</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-white">Học từ vựng</Link></li>
                <li><Link to="#" className="hover:text-white">Ôn tập</Link></li>
                <li><Link to="#" className="hover:text-white">Kiểm tra</Link></li>
                <li><Link to="#" className="hover:text-white">Thống kê</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-white">Trung tâm trợ giúp</Link></li>
                <li><Link to="#" className="hover:text-white">Liên hệ</Link></li>
                <li><Link to="#" className="hover:text-white">FAQ</Link></li>
                <li><Link to="#" className="hover:text-white">Bảo mật</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Kết nối</h4>
              <div className="flex gap-4">
                <Link to="#" className="hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </Link>
                <Link to="#" className="hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </Link>
                <Link to="#" className="hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342V9.658z"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 VocabMaster. Tất cả quyền được bảo lưu.</p>
            <p className="mt-2 text-sm">Website Builder</p>
          </div>
        </div>
      </footer>
    </div>
  );
}