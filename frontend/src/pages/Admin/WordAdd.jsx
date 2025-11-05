import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import { wordService } from '../../services/wordService';
import { topicService } from '../../services/topicService';

export default function WordAdd() {
  const [word, setWord] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [translation, setTranslation] = useState('');
  const [example, setExample] = useState('');
  const [topic, setTopic] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [audioName, setAudioName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [allTopics, setAllTopics] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await topicService.getAllTopicsDropdown();
        if (response.success) {
          setAllTopics(response.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách chủ đề:', error);
        toast.error('Không thể tải danh sách chủ đề');
      }
    };

    fetchTopics();
  }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần khi component mount

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

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('audio/')) {
        toast.error('Vui lòng chọn file âm thanh hợp lệ');
        return;
      }

      // Kiểm tra kích thước (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Kích thước file âm thanh không được vượt quá 10MB');
        return;
      }

      setAudioFile(file);
      setAudioName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!word.trim()) {
      toast.error('Vui lòng nhập từ vựng');
      return;
    }

    if (!pronunciation.trim()) {
      toast.error('Vui lòng nhập phát âm');
      return;
    }

    if (!translation.trim()) {
      toast.error('Vui lòng nhập nghĩa');
      return;
    }

    if (!example.trim()) {
      toast.error('Vui lòng nhập ví dụ');
      return;
    }

    if (!topic.trim()) {
      toast.error('Vui lòng chọn chủ đề');
      return;
    }

    if (!imageFile) {
      toast.error('Vui lòng chọn ảnh cho từ vựng');
      return;
    }

    if (!audioFile) {
      toast.error('Vui lòng chọn file âm thanh');
      return;
    }

    try {
      setLoading(true);
      await wordService.addWord(
        word,
        pronunciation,
        translation,
        example,
        topic,
        imageFile,
        audioFile
      );
      navigate('/admin/word-list');
      toast.success('Thêm từ vựng thành công!');
    } catch (error) {
      console.error('Lỗi khi thêm từ vựng:', error);
      toast.error(error.response?.data?.message || 'Không thể thêm từ vựng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/words');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="container mx-auto p-6 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Thêm từ vựng mới</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Từ vựng */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ vựng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập từ vựng (ví dụ: cat, dog...)"
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
                  placeholder="Nhập phiên âm (ví dụ: /kæt/)"
                />
              </div>

              {/* Nghĩa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nghĩa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập nghĩa tiếng Việt"
                />
              </div>

              {/* Ví dụ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ví dụ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập câu ví dụ"
                />
              </div>

              {/* Chủ đề */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chủ đề <span className="text-red-500">*</span>
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" disabled>
                    -- Chọn một chủ đề --
                  </option>
                  {allTopics.length > 0 ? (
                    allTopics.map((topicItem) => (
                      <option key={topicItem._id} value={topicItem.nameTopic}>
                        {topicItem.nameTopic} (Nghĩa: {topicItem.meaning})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Đang tải chủ đề...
                    </option>
                  )}
                </select>
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

              {/* File âm thanh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File âm thanh <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {audioName ? (
                      <div className="mb-4">
                        <div className="flex items-center justify-center space-x-2">
                          <svg
                            className="h-8 w-8 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                            />
                          </svg>
                          <span className="text-sm text-gray-700">{audioName}</span>
                        </div>
                      </div>
                    ) : (
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>{audioName ? 'Chọn file khác' : 'Chọn file âm thanh'}</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="audio/*"
                          onChange={handleAudioChange}
                        />
                      </label>
                      <p className="pl-1">hoặc kéo thả</p>
                    </div>
                    <p className="text-xs text-gray-500">MP3, WAV, OGG tối đa 10MB</p>
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
                  {loading ? 'Đang thêm...' : 'Thêm từ vựng'}
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