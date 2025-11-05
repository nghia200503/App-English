import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import api from '../../libs/axios';
import { assets } from '../../assets/assets';

function UserUpdate() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    // State cho avatar
    const [avatarFile, setAvatarFile] = useState(null); // File mới (nếu có)
    const [avatarPreview, setAvatarPreview] = useState(null); // Preview file mới

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        displayName: '',
        phone: '',
        role: 'user',
        bio: '',
        avatarUrl: '',
        password: ''
    });

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setFetchLoading(true);
            const response = await api.get(`/users/users/${id}`);
            const user = response.data;

            setFormData({
                username: user.username || '',
                email: user.email || '',
                displayName: user.displayName || '',
                phone: user.phone || '',
                role: user.role || 'user',
                bio: user.bio || '',
                avatarUrl: user.avatarUrl || '',
                password: ''
            });
        } catch (error) {
            console.error("Lỗi khi tải thông tin người dùng:", error);
            toast.error("Không thể tải thông tin người dùng");
            navigate('/user-list');
        } finally {
            setFetchLoading(false);
        }
    };

    // Hàm xử lý text input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Hàm xử lý file input
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        } else {
            setAvatarFile(null);
            setAvatarPreview(null);
        }
    };

    // Hàm Submit (SỬ DỤNG FORMDATA)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.email || !formData.displayName) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        try {
            setLoading(true);

            // 1. Tạo FormData
            const data = new FormData();

            // 2. Thêm các trường text vào FormData
            data.append('username', formData.username);
            data.append('email', formData.email);
            data.append('displayName', formData.displayName);
            data.append('phone', formData.phone);
            data.append('role', formData.role);
            data.append('bio', formData.bio);

            // 3. Chỉ thêm password nếu có nhập
            if (formData.password) {
                data.append('password', formData.password);
            }

            // 4. Chỉ thêm file avatar nếu người dùng đã chọn file mới
            if (avatarFile) {
                data.append('avatar', avatarFile);
            }

            // 5. Gọi API với FormData
            await api.put(`/users/users/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                    // Axios sẽ tự động set header này khi data là FormData
                }
            });

            toast.success("Cập nhật người dùng thành công");
            navigate('/admin/user-list');
        } catch (error) {
            console.error("Lỗi khi cập nhật người dùng:", error);
            toast.error(error.response?.data?.message || "Không thể cập nhật người dùng");
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex">
                <Sidebar />
                <div className="flex-1 ml-64">
                    <div className="container mx-auto p-6">
                        <div className="text-center">Đang tải thông tin...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-64">
                <div className="container mx-auto p-6 max-w-2xl">
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-6 text-center">Chỉnh sửa người dùng</h1>

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    Tên hiển thị <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
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

                            {/* --- PHẦN AVATAR MỚI --- */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Avatar
                                </label>
                                <div className="flex items-center gap-4">
                                    <img
                                        // Ưu tiên 1: Ảnh preview mới
                                        // Ưu tiên 2: Ảnh avatar hiện tại từ DB
                                        // Ưu tiên 3: Ảnh user default
                                        src={avatarPreview || formData.avatarUrl || assets.user_avatar}
                                        alt="Avatar"
                                        className="w-20 h-20 rounded-full object-cover"
                                    />
                                    <input
                                        type="file"
                                        id="avatar"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500
                                                   file:mr-4 file:py-2 file:px-4
                                                   file:rounded-full file:border-0
                                                   file:text-sm file:font-semibold
                                                   file:bg-blue-50 file:text-blue-700
                                                   hover:file:bg-blue-100 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    minLength="6"
                                    placeholder="Để trống nếu không muốn đổi mật khẩu"
                                />
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
                                    {loading ? 'Đang cập nhật...' : 'Cập nhật'}
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

export default UserUpdate;