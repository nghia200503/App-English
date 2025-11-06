import React, { useState } from 'react';
import { ChevronDown, BarChart3, ShoppingBag, Inbox, User, Settings, LogOut, WholeWord, TouchpadIcon, LucideWholeWord, WholeWordIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { assets } from '../assets/assets';

const Sidebar = () => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isEcommerceOpen, setIsEcommerceOpen] = useState(false);

  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error(error); 
    }
  }

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            JD
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">john@example.com</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div>
          <button
            onClick={() => setIsDashboardOpen(!isDashboardOpen)}
            className="w-full"
          >
            <Link to="/admin" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <img className='w-5 h-5' src={assets.dashboard}/>
              <span className="text-sm font-medium">Bảng tin</span>
            </Link>
          </button>
        </div>

        <div>
          <button
            onClick={() => setIsEcommerceOpen(!isEcommerceOpen)}
            className="w-full"
          >
            <Link to="/admin/user-list" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <img className="w-5 h-5" src={assets.user_manage}/>
              <span className="text-sm font-medium">Quản lý người dùng</span>
            </Link>
          </button>
        </div>

        <button className="w-full">
          <Link to="/admin/topic-list" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <img className="w-5 h-5" src={assets.topic_manage}/>
            <span className="text-sm font-medium">Quản lý chủ đề</span>
          </Link>
        </button>

        {/* Profile */}
        <button className="w-full">
          <Link to="/admin/word-list" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <img className="w-5 h-5" src={assets.word_manage}/>
            <span className="text-sm font-medium">Quản lý từ vựng</span>
          </Link>
        </button>

        {/* Settings */}
        <button className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <img className="w-5 h-5" src={assets.settings}/>
          <span className="text-sm font-medium">Cài đặt</span>
        </button>

        {/* Log Out */}
        <button onClick={handleLogout} className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <img className="w-5 h-5" src={assets.logout}/>
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;