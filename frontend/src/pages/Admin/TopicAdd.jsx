import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import { topicService } from '../../services/topicService';

export default function TopicAdd() {
  const [nameTopic, setNameTopic] = useState('');
  const [meaning, setMeaning] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh hợp lệ');
        return;
      }

      // Kiểm tra kích thước (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      setImageFile(file);
      
      // Tạo preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!nameTopic.trim()) {
      toast.error('Vui lòng nhập tên chủ đề');
      return;
    }

    if (!meaning.trim()) {
      toast.error('Vui lòng nhập nghĩa');
      return;
    }

    if (!pronunciation.trim()) {
      toast.error('Vui lòng nhập phát âm');
      return;
    }

    if (!imageFile) {
      toast.error('Vui lòng chọn ảnh cho chủ đề');
      return;
    }

    try {
      setLoading(true);
      await topicService.addTopic(nameTopic, meaning, pronunciation, imageFile);
      navigate('/admin/topic-list');
      toast.success('Thêm chủ đề thành công!');
    } catch (error) {
      console.error('Lỗi khi thêm chủ đề:', error);
      toast.error(error.response?.data?.message || 'Không thể thêm chủ đề');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/topics');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="container mx-auto  max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Thêm chủ đề mới</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tên chủ đề */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên chủ đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameTopic}
                  onChange={(e) => setNameTopic(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên chủ đề (ví dụ: Animals, Food...)"
                />
              </div>

              {/* Nghĩa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nghĩa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={meaning}
                  onChange={(e) => setMeaning(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập nghĩa tiếng Việt"
                />
              </div>

              {/* Phát âm */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phát âm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={pronunciation}
                  onChange={(e) => setPronunciation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập phiên âm (ví dụ: /ˈænɪməlz/)"
                />
              </div>

              {/* Hình ảnh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {previewUrl ? (
                      <div className="mb-4">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>{previewUrl ? 'Chọn ảnh khác' : 'Chọn ảnh'}</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">hoặc kéo thả</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Đang thêm...' : 'Thêm chủ đề'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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