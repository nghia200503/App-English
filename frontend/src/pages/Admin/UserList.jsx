import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import api from '../../libs/axios';
import { assets } from '../../assets/assets';
import { authService } from '../../services/authService';

export default function UserList() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ show: false, userId: null, username: '' });
    const [deleting, setDeleting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 4, // Đặt số này khớp với limit ở backend
        hasNextPage: false,
        hasPrevPage: false
    });

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const fetchUsers = async (page) => {
        try {
            setLoading(true);
            // Sử dụng authService thay vì api.get
            const response = await authService.getAllUsers(page, pagination.itemsPerPage);
            
            if (response.success) {
                setUsers(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách người dùng:", error);
            toast.error(error.response?.data?.message || "Không thể tải danh sách người dùng.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        try {
            setDeleting(true); // Bắt đầu xóa
            await api.delete(`/auth/users/${userId}`); // Vẫn dùng api trực tiếp vì authService không có
            toast.success("Xóa người dùng thành công");
            
            // Logic tải lại danh sách sau khi xóa
            if (users.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchUsers(currentPage);
            }

            setDeleteModal({ show: false, userId: null, username: '' });
        } catch (error) {
            console.error("Lỗi khi xóa người dùng:", error);
            toast.error(error.response?.data?.message || "Không thể xóa người dùng");
        } finally {
            setDeleting(false); // Kết thúc xóa
        }
    };

    const confirmDelete = (userId, username) => {
        setDeleteModal({ show: true, userId, username });
    };

    // Hàm hiển thị badge vai trò
    const getRoleBadge = (role) => {
        if (role === 'admin') {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Admin</span>;
        }
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">User</span>;
    };

    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToPreviousPage = () => {
        if (pagination.hasPrevPage) {
            goToPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (pagination.hasNextPage) {
            goToPage(currentPage + 1);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        const { totalPages } = pagination;
        
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    
    const startIndex = (currentPage - 1) * pagination.itemsPerPage;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 ml-64">
                <div className="container mx-auto p-6">
                    {loading ? (
                        // Spinner Loading
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                                <p className="mt-4 text-gray-600">Đang tải danh sách người dùng...</p>
                            </div>
                        </div>
                    ) : pagination.totalItems === 0 ? (
                        // Trạng thái Rỗng
                        <div className="flex flex-col items-center justify-center h-64">
                            <p className="text-gray-600 mb-4">Không tìm thấy người dùng nào.</p>
                            <button 
                                onClick={() => navigate('/admin/user-add')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Thêm người dùng đầu tiên
                            </button>
                        </div>
                    ) : (
                        // Hiển thị danh sách
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Danh sách người dùng ({pagination.totalItems})
                                </h1>
                                <button
                                    onClick={() => navigate('/admin/user-add')}
                                    className="cursor-pointer flex items-center gap-2 border-2 bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition"
                                >
                                    {/* Icon user_add cần màu trắng */}
                                    <img 
                                        className="w-6 h-6" 
                                        src={assets.user_add} 
                                        alt="Add User"
                                    />
                                    Thêm người dùng
                                </button>
                            </div>

                            {/* Phân trang (phía trên) */}
                            {pagination.totalPages > 1 && (
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
                                        <span className="font-medium">{startIndex + users.length}</span> trong tổng số{' '}
                                        <span className="font-medium">{pagination.totalItems}</span> người dùng
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Nút Lùi */}
                                        <button
                                            onClick={goToPreviousPage}
                                            disabled={!pagination.hasPrevPage}
                                            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>

                                        {/* Các nút số trang */}
                                        <div className="flex items-center gap-1">
                                            {getPageNumbers().map((page, index) => (
                                                page === '...' ? (
                                                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">...</span>
                                                ) : (
                                                    <button
                                                        key={page}
                                                        onClick={() => goToPage(page)}
                                                        className={`px-4 py-2 rounded-lg border transition-colors ${
                                                        currentPage === page
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            ))}
                                        </div>

                                        {/* Nút Tiến */}
                                        <button
                                            onClick={goToNextPage}
                                            disabled={!pagination.hasNextPage}
                                            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Bảng Dữ liệu */}
                            <div className="overflow-x-auto shadow-md rounded-lg">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-800 text-white">
                                        <tr>
                                            <th className="py-3 px-4 text-left w-20">STT</th> 
                                            <th className="py-3 px-4 text-left">Avatar</th>
                                            <th className="py-3 px-4 text-left">Username</th>
                                            <th className="py-3 px-4 text-left">Tên hiển thị</th>
                                            <th className="py-3 px-4 text-left">Email</th>
                                            <th className="py-3 px-4 text-left">Điện thoại</th>
                                            <th className="py-3 px-4 text-left">Vai trò</th>
                                            <th className="py-3 px-4 text-center">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700">
                                        {users.map((user, index) => (
                                            <tr key={user._id} className="border-b hover:bg-gray-50 transition-colors">
                                                {/* Cập nhật STT theo trang */}
                                                <td className="py-3 px-4">{startIndex + index + 1}</td>
                                                <td className="py-3 px-4">
                                                    <img 
                                                        src={user.avatarUrl || assets.user_avatar} 
                                                        alt={user.username}
                                                        className="w-10 h-10 rounded-full object-contain"
                                                        onError={(e) => { e.target.src = assets.user_avatar; }}
                                                    />
                                                </td>
                                                <td className="py-3 px-4 font-medium">{user.username}</td>
                                                <td className="py-3 px-4">{user.displayName}</td>
                                                <td className="py-3 px-4">{user.email}</td>
                                                <td className="py-3 px-4">{user.phone || 'Chưa cập nhật'}</td>
                                                <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex justify-center gap-2">
                                                        {/* Nút Sửa */}
                                                        <button
                                                            onClick={() => navigate(`/admin/user-update/${user._id}`)}
                                                            className="p-2 border-2 border-yellow-500 cursor-pointer hover:bg-yellow-200 rounded-lg"
                                                            title="Sửa"
                                                        >
                                                            <img className='w-5 h-5' src={assets.update} alt="Edit"/>
                                                        </button>
                                                        {/* Nút Xóa */}
                                                        <button
                                                            onClick={() => confirmDelete(user._id, user.username)}
                                                            className="p-2 border-2 border-red-500 cursor-pointer hover:bg-red-200 rounded-lg"
                                                            title="Xóa"
                                                        >
                                                            <img className='w-5 h-5' src={assets.trash} alt="Delete"/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal xác nhận xóa */}
            {deleteModal.show && (
                <div className="fixed inset-0  bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
                        <p className="mb-6">
                            Bạn có chắc chắn muốn xóa người dùng <strong>{deleteModal.username}</strong>?
                            <br />
                            <span className="text-red-600 text-sm">Hành động này không thể hoàn tác!</span>
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteModal({ show: false, userId: null, username: '' })}
                                disabled={deleting} // Thêm disabled khi đang xóa
                                className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleDelete(deleteModal.userId)}
                                disabled={deleting} // Thêm disabled khi đang xóa
                                className="cursor-pointer px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:bg-gray-400"
                            >
                                {deleting ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}