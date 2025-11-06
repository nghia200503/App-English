import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAuthStore } from "../stores/useAuthStore";

export default function Header() {

    const {user} = useAuthStore();

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto ">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/learn"><img className="w-60" src={assets.logo}/></Link>

                    {/* Navigation */}
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
                        <Link to="/statistics" className="text-gray-600 hover:text-gray-900 transition">
                            Thống kê
                        </Link>
                        <Link to="/dictionary" className="text-gray-600 hover:text-gray-900 transition">
                            Từ điển
                        </Link>
                    </nav>

                    {/* User Menu */}
                    <div className="relative group">
                        <button className="flex items-center space-x-2 focus:outline-none">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                {user?.displayName?.charAt(0) || 'A'}
                            </div>
                            <span className="hidden md:block font-medium text-gray-700">
                                {user?.displayName || 'Alex Nguyen'}
                            </span>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
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
                </div>
            </div>
        </header>
    );
}