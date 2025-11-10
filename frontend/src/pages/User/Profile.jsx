import { useState, useEffect, useRef } from 'react';
import {
    Pencil, User, Camera, Mail, Phone, Layers,
    CalendarDays, MapPin, Briefcase, Target
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
                    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <img
                                    className='w-24 h-24 rounded-full object-cover'
                                    // 1. Preview file mới
                                    // 2. Avatar hiện tại
                                    // 3. Fallback
                                    src={avatarPreview || user.avatarUrl || assets.user_avatar}
                                    onError={(e) => { e.target.src = assets.user_avatar; }}
                                />
                                {/* Nút Camera (Yêu cầu 3) */}
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
                                        className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 border border-gray-200 shadow-sm hover:bg-gray-100 transition"
                                    >
                                        <Camera size={16} />
                                    </button>
                                )}
                            </div>
                            {/* Thông tin */}
                            <div className="ml-6">
                                <h1 className="text-3xl font-bold text-gray-900">{user.displayName}</h1>
                                <p className="text-gray-500 mt-1 flex items-center gap-1">
                                    <Mail size={20} />{user.email}
                                </p>
                                {/* Yêu cầu 2: Hiển thị Ngày tham gia */}

                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                    <span><CalendarDays size={20} /></span>Ngày tham gia: {formatDate(user.createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* Yêu cầu 1: Nút Chỉnh sửa / Lưu / Hủy */}
                        <div className="flex-shrink-0 flex gap-3">
                            {!isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
                                    >
                                        <Pencil size={14} />
                                        Chỉnh sửa
                                    </button>
                                    <button
                                        type="button" // Thêm type="button"
                                        onClick={() => useAuthStore.getState().logout()}
                                        // Copy các class từ nút "Chỉnh sửa"
                                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
                                    >
                                        <Layers className='text-primary-blue' />
                                        Đăng xuất
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm disabled:opacity-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm disabled:bg-blue-300"
                                    >
                                        {loading ? 'Đang lưu...' : 'Lưu'}
                                    </button>
                                    <button
                                        type="button" // Thêm type="button"
                                        onClick={() => useAuthStore.getState().logout()}
                                        // Copy các class từ nút "Chỉnh sửa"
                                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
                                    >
                                        <Layers className='text-primary-blue' />
                                        Đăng xuất
                                    </button>
                                </>
                            )}
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