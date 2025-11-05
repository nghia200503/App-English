import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import api from '../../libs/axios';
import { User } from 'lucide-react';
import { assets } from '../../assets/assets';

function UserAdd() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'user',
        bio: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Hàm xử lý khi chọn file
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setAvatarFile(file);
    };

    // Hàm xử lý khi submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.username || !formData.password || !formData.email || 
            !formData.firstName || !formData.lastName) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        try {
            setLoading(true);
            
            // TẠO FORMDATA ĐỂ GỬI FILE VÀ CÁC TRƯỜNG KHÁC
            const payload = new FormData();
            for (const key in formData) {
                payload.append(key, formData[key]);
            }
            if (avatarFile) {
                payload.append('avatar', avatarFile); // 'avatar' phải khớp với tên trường trong multer single('avatar')
            }

            await api.post('/auth/add', payload, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Quan trọng khi gửi file
                }
            });
            toast.success("Thêm người dùng thành công");
            navigate('/admin/user-list');
        } catch (error) {
            console.error("Lỗi khi thêm người dùng:", error);
            toast.error(error.response?.data?.message || "Không thể thêm người dùng");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            
            <div className="flex-1 ml-64">
                <div className="container mx-auto p-6 max-w-2xl">
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-6 text-center">Thêm người dùng mới</h1>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Họ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mật khẩu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    minLength="6"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ảnh đại diện
                                </label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-20 h-17 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                        {avatarFile ? (
                                            <img 
                                                src={URL.createObjectURL(avatarFile)} 
                                                alt="Avatar Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <img src={assets.user_avatar}/>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        name="avatar"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Điện thoại
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vai trò
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tiểu sử
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="3"
                                    maxLength="500"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tối đa 500 ký tự"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                                >
                                    {loading ? 'Đang thêm...' : 'Thêm người dùng'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/user-list')}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserAdd;