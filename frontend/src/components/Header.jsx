import { useState } from "react"; 
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAuthStore } from "../stores/useAuthStore";
import { Menu, X } from "lucide-react"; 

export default function Header() {
    const { user } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
    // Hàm để đóng menu khi nhấn vào link (trên mobile)
    const handleMobileLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/learn" onClick={handleMobileLinkClick}>
                        <img className="w-30 md:w-60" src={assets.logo} alt="Logo" />
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex space-x-8">
                        <Link to="/learn" className="text-gray-600 hover:text-gray-900 transition">
                            Trang chủ
                        </Link>
                        <Link to="/vocabulary" className="text-gray-600 hover:text-gray-900 transition">
                            Học từ vựng
                        </Link>
                        <Link to="/practice" className="text-gray-600 hover:text-gray-900 transition">
                            Luyện tập
                        </Link>
                        <Link to="/progress" className="text-gray-600 hover:text-gray-900 transition">
                            Thống kê
                        </Link>
                        <Link to="/dictionary" className="text-gray-600 hover:text-gray-900 transition">
                            Từ điển
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <button className="flex items-center space-x-2 focus:outline-none">
                                <img
                                    src={user.avatarUrl || assets.user_avatar}
                                    alt={user.username}
                                    className="w-10 h-10 rounded-full object-contain"
                                    onError={(e) => { e.target.src = assets.user_avatar; }}
                                />
                                <span className="hidden md:block font-medium text-gray-700">
                                    {user?.displayName || 'Alex Nguyen'}
                                </span>
                                <svg className="hidden md:block w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                                <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                    Hồ sơ cá nhân
                                </Link>
                                <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                    Cài đặt
                                </Link>
                                <button
                                    onClick={() => useAuthStore.getState().logout()}
                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </div>

                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden absolute w-full bg-white shadow-lg z-40">

                    <nav className="flex flex-col p-4 space-y-4">
                        <Link to="/learn" className="text-gray-600 hover:text-gray-900 transition" onClick={handleMobileLinkClick}>
                            Trang chủ
                        </Link>
                        <Link to="/vocabulary" className="text-gray-600 hover:text-gray-900 transition" onClick={handleMobileLinkClick}>
                            Học từ vựng
                        </Link>
                        <Link to="/practice" className="text-gray-600 hover:text-gray-900 transition" onClick={handleMobileLinkClick}>
                            Luyện tập
                        </Link>
                        <Link to="/progress" className="text-gray-600 hover:text-gray-900 transition" onClick={handleMobileLinkClick}>
                            Thống kê
                        </Link>
                        <Link to="/dictionary" className="text-gray-600 hover:text-gray-900 transition" onClick={handleMobileLinkClick}>
                            Từ điển
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}