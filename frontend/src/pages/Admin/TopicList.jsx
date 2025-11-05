import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import { topicService } from '../../services/topicService';

export default function TopicList() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 8,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, topic: null });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // Fetch topics từ server với phân trang
  const fetchTopics = async (page) => {
    try {
      setLoading(true);
      const response = await topicService.getAllTopics(page, 8);
      
      if (response.success) {
        setTopics(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách chủ đề:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách chủ đề.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics(currentPage);
  }, [currentPage]);

  // Hàm chuyển trang
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

  const handleAddClick = () => {
    navigate('/admin/topic-add');
  };

  const handleEditClick = (topicId) => {
    navigate(`/admin/topic-update/${topicId}`);
  };

  const handleDeleteClick = (topic) => {
    setDeleteModal({ show: true, topic });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.topic) return;

    try {
      setDeleting(true);
      await topicService.deleteTopic(deleteModal.topic._id);
      toast.success('Xóa chủ đề thành công!');
      
      // Refresh danh sách
      // Nếu trang hiện tại chỉ có 1 item và không phải trang 1, quay về trang trước
      if (topics.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchTopics(currentPage);
      }
      
      setDeleteModal({ show: false, topic: null });
    } catch (error) {
      console.error('Lỗi khi xóa chủ đề:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa chủ đề');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ show: false, topic: null });
  };

  // Tạo array số trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const { totalPages } = pagination;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
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
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <p className="mt-4 text-gray-600">Đang tải danh sách chủ đề...</p>
              </div>
            </div>
          ) : pagination.totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-600 mb-4">Không tìm thấy chủ đề nào.</p>
              <button 
                onClick={handleAddClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thêm chủ đề đầu tiên
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Danh sách chủ đề ({pagination.totalItems})
                </h1>
                <button 
                  onClick={handleAddClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm chủ đề mới
                </button>
              </div>

              {/* Phân trang trên */}
              {pagination.totalPages > 1 && (
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
                    <span className="font-medium">{startIndex + topics.length}</span> trong tổng số{' '}
                    <span className="font-medium">{pagination.totalItems}</span> chủ đề
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={!pagination.hasPrevPage}
                      className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

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

                    <button
                      onClick={goToNextPage}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Bảng danh sách */}
              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="py-3 px-4 text-left w-20">STT</th>
                      <th className="py-3 px-4 text-left w-32">Hình ảnh</th>
                      <th className="py-3 px-4 text-left">Tên chủ đề</th>
                      <th className="py-3 px-4 text-left">Nghĩa</th>
                      <th className="py-3 px-4 text-left">Phát âm</th>
                      <th className="py-3 px-4 text-center w-40">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {topics.map((topic, index) => (
                      <tr 
                        key={topic._id} 
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">{startIndex + index + 1}</td>
                        <td className="py-3 px-4">
                          {topic.image ? (
                            <img
                              src={topic.image}
                              alt={topic.nameTopic}
                              className="w-20 h-20 rounded-lg object-contain"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-500">Không có ảnh</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium">{topic.nameTopic}</td>
                        <td className="py-3 px-4">{topic.meaning || 'Chưa có nghĩa'}</td>
                        <td className="py-3 px-4">{topic.pronunciation || 'Chưa có phát âm'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Nút Sửa */}
                            <button
                              onClick={() => handleEditClick(topic._id)}
                              className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-1"
                              title="Sửa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Sửa
                            </button>

                            {/* Nút Xóa */}
                            <button
                              onClick={() => handleDeleteClick(topic)}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                              title="Xóa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Xóa
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa chủ đề <span className="font-semibold">"{deleteModal.topic?.nameTopic}"</span>?
              <br />
              <span className="text-red-600 text-sm">Hành động này không thể hoàn tác!</span>
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
              <button
                onClick={handleCancelDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}