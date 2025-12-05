import { useState, useEffect, useRef } from 'react';
import {
    Pencil, User, Camera, Mail, Phone, Layers,
    CalendarDays, MapPin, Briefcase, Target, LogOut
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { assets } from '../../assets/assets';
import { toast } from 'sonner';
import Header from '../../components/Header';

// Hàm helper để định dạng ngày hiển thị (DD/MM/YYYY)
const formatDate = (dateString) => {
    if (!dateString) return ''; // Trả về rỗng nếu không có ngày
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ''; // Xử lý ngày không hợp lệ
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return '';
    }
};

// Hàm helper để định dạng ngày cho input (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0]; // Cắt lấy YYYY-MM-DD
    } catch (error) {
        return '';
    }
};

export default function Profile() {
    const { user, loading, updateProfile } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);

    // Mỗi level cần 100 * currentLevel XP để lên cấp tiếp theo
    const currentLevel = user?.level || 1;
    const currentXP = user?.experiencePoints || 0;

    // Ngưỡng XP cần đạt để lên cấp tiếp theo
    const xpToNextLevel = currentLevel * 100;

    // Tính phần trăm: (XP Hiện tại / Mục tiêu) * 100
    // Thêm kiểm tra xpToNextLevel > 0 để tránh lỗi
    const progressPercent = xpToNextLevel > 0
        ? Math.min((currentXP / xpToNextLevel) * 100, 100)
        : 0;

    // State cho form
    const [formData, setFormData] = useState({
        displayName: '',
        phone: '',
        bio: '',
        dob: '',
        address: '',
        occupation: '',
        learningGoal: ''
    });

    // State cho file
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Đồng bộ form data khi 'user' thay đổi (lần đầu tải trang)
    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                phone: user.phone || '',
                bio: user.bio || '',
                dob: user.dob ? formatDateForInput(user.dob) : '', // Format cho input[type=date]
                address: user.address || '',
                occupation: user.occupation || '',
                learningGoal: user.learningGoal || ''
            });
        }
    }, [user]);

    // Xử lý khi người dùng chọn file
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Vui lòng chọn file ảnh hợp lệ');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // Giới hạn 5MB
                toast.error('Kích thước ảnh không được vượt quá 5MB');
                return;
            }

            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // Xử lý khi thay đổi input text
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý HỦY
    const handleCancel = () => {
        setIsEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        // Reset form về lại dữ liệu gốc
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                phone: user.phone || '',
                bio: user.bio || '',
                dob: user.dob ? formatDateForInput(user.dob) : '',
                address: user.address || '',
                occupation: user.occupation || '',
                learningGoal: user.learningGoal || ''
            });
        }
    };

    // Xử lý LƯU
    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('displayName', formData.displayName);
        data.append('phone', formData.phone);
        data.append('bio', formData.bio);
        data.append('dob', formData.dob);
        data.append('address', formData.address);
        data.append('occupation', formData.occupation);
        data.append('learningGoal', formData.learningGoal);

        // Chỉ thêm avatar nếu người dùng đã chọn file mới
        if (avatarFile) {
            data.append('avatar', avatarFile);
        }

        try {
            // Gọi action từ useAuthStore
            await updateProfile(data);
            // Tắt chế độ chỉnh sửa sau khi thành công
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null);
        } catch (error) {
            // Lỗi đã được xử lý và hiển thị bởi toast trong store
        }
    };

    // Hàm render input (để tránh lặp code)
    const renderInput = (name, label, icon, placeholder = '', type = 'text', isTextarea = false) => {
        const Icon = icon;
        const commonProps = {
            id: name,
            name: name,
            value: formData[name],
            onChange: handleChange,
            className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            placeholder: placeholder,
            disabled: loading
        };

        return (
            <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    {isTextarea ? (
                        <textarea {...commonProps} rows="4" />
                    ) : (
                        <input type={type} {...commonProps} />
                    )}
                </div>
            </div>
        );
    };

    // Hàm render text (khi không chỉnh sửa)
    const renderInfoText = (label, value, icon, isDate = false) => {
        const Icon = icon;
        let displayValue = value;

        // Format ngày nếu là ngày tháng
        if (isDate) {
            displayValue = formatDate(value);
        }

        return (
            <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                    {label}
                </label>
                <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <p className="w-full pl-10 pr-4 py-2 text-gray-800 bg-gray-50 rounded-lg min-h-[42px] break-words">
                        {displayValue || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                    </p>
                </div>
            </div>
        );
    };

    if (!user) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Đang tải hồ sơ...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="max-w-7xl mx-auto pt-4 pb-4">
                <form onSubmit={handleSubmit}>
                    {/* 1. Banner hồ sơ */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
                        <div className="flex flex-col md:flex-row items-start gap-6">

                            {/* Avatar - Căn giữa trên mobile, trái trên desktop */}
                            <div className="relative flex-shrink-0 mx-auto md:mx-0">
                                <div className="relative">
                                    <img
                                        className='w-32 h-32 rounded-full object-cover border border-gray-200 shadow-sm'
                                        src={avatarPreview || user.avatarUrl || assets.user_avatar}
                                        onError={(e) => { e.target.src = assets.user_avatar; }}
                                        alt="User Avatar"
                                    />

                                    {/* Nút Camera */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        hidden
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current.click()}
                                            className="absolute bottom-1 right-1 w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-600 border border-gray-200 shadow-md hover:bg-blue-50 hover:text-blue-600 transition"
                                            title="Đổi ảnh đại diện"
                                        >
                                            <Camera size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Thông tin cá nhân & Level */}
                            <div className="flex-1 w-full text-center md:text-left">

                                {/* Hàng trên: Tên + Nút bấm */}
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">

                                    {/* Tên và thông tin cơ bản */}
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.displayName}</h1>
                                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-sm text-gray-500 items-center md:items-start justify-center md:justify-start">
                                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                                                <Mail size={14} /> {user.email}
                                            </span>
                                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                                                <CalendarDays size={14} /> Tham gia: {formatDate(user.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Các nút hành động - Đẩy sang phải trên Desktop */}
                                    <div className="flex gap-3 mt-2 md:mt-0 w-full md:w-auto justify-center md:justify-end">
                                        {!isEditing ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditing(true)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm"
                                                >
                                                    <Pencil size={16} />
                                                    <span className="hidden sm:inline">Chỉnh sửa</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => useAuthStore.getState().logout()}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition shadow-sm"
                                                >
                                                    <LogOut size={16} />
                                                    <span className="hidden sm:inline">Đăng xuất</span>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={handleCancel}
                                                    disabled={loading}
                                                    className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition disabled:bg-blue-300"
                                                >
                                                    {loading ? 'Đang lưu...' : 'Lưu'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Thanh Level & XP - Tách biệt ở dưới */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                {currentLevel}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-gray-800 uppercase tracking-wider">Cấp độ hiện tại</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-blue-600">{currentXP}</span>
                                            <span className="text-sm text-gray-400 font-medium"> / {xpToNextLevel} XP</span>
                                        </div>
                                    </div>

                                    {/* Thanh Progress */}
                                    <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${progressPercent}%` }}
                                        ></div>
                                    </div>

                                    <p className="text-xs text-gray-400 mt-2 text-center md:text-right">
                                        Cần thêm <span className="font-semibold text-gray-600">{xpToNextLevel - currentXP} XP</span> để lên cấp {currentLevel + 1}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Thông tin cơ bản */}
                    <div className="mt-6 bg-white rounded-xl shadow-sm p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin cơ bản</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Tên đăng nhập (Read-only) */}
                            {renderInfoText('Tên đăng nhập', user.username, User)}

                            {/* Email (Read-only) */}
                            {renderInfoText('Email', user.email, Mail)}

                            {/* Tên hiển thị (Editable) */}
                            {isEditing ?
                                renderInput('displayName', 'Tên hiển thị', User, 'Nhập tên của bạn') :
                                renderInfoText('Tên hiển thị', user.displayName, User)
                            }

                            {/* Điện thoại (Editable) */}
                            {isEditing ?
                                renderInput('phone', 'Số điện thoại', Phone, 'Nhập số điện thoại') :
                                renderInfoText('Số điện thoại', user.phone, Phone)
                            }

                            {/* NGÀY SINH (MỚI) */}
                            {isEditing ?
                                renderInput('dob', 'Ngày sinh', CalendarDays, '', 'date') :
                                renderInfoText('Ngày sinh', user.dob, CalendarDays, true)
                            }

                            {/* ĐỊA CHỈ (MỚI) */}
                            {isEditing ?
                                renderInput('address', 'Địa chỉ', MapPin, 'Nhập địa chỉ của bạn') :
                                renderInfoText('Địa chỉ', user.address, MapPin)
                            }

                            {isEditing ?
                                renderInput('occupation', 'Nghề nghiệp', Briefcase, 'Nhập nghề nghiệp của bạn') :
                                renderInfoText('Nghề nghiệp', user.occupation, Briefcase)
                            }

                            {isEditing ?
                                renderInput('learningGoal', 'Mục tiêu học tập', Target, 'Mục tiêu của bạn là gì?', 'text', true) :
                                renderInfoText('Mục tiêu học tập', user.learningGoal, Target)
                            }

                        </div>
                    </div>
                </form>

            </div>
        </div>
    );
}