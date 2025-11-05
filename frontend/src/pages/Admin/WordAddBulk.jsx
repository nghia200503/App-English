import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import { wordService } from '../../services/wordService';
import { topicService } from '../../services/topicService';

// Định nghĩa cấu trúc cho một form từ vựng rỗng
const initialWordState = {
  id: Date.now(), // ID tạm thời để React render list
  word: '',
  pronunciation: '',
  translation: '',
  example: '',
  topic: '',
  imageFile: null,
  audioFile: null,
  previewUrl: '', // Dùng cho ảnh
  audioName: '',  // Dùng cho audio
};

export default function WordAddBulk() {
  // 1. State chính là một mảng, bắt đầu với 1 form rỗng
  const [words, setWords] = useState([initialWordState]);
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [allTopics, setAllTopics] = useState([]);

  // 2. Lấy danh sách chủ đề (giống như file WordAdd.jsx)
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
  }, []);

  // 3. Hàm cập nhật dữ liệu text/select cho một từ
  const handleWordChange = (id, field, value) => {
    setWords(prevWords => 
      prevWords.map(word => 
        word.id === id ? { ...word, [field]: value } : word
      )
    );
  };

  // 4. Hàm cập nhật file (ảnh/audio) cho một từ
  const handleFileChange = (id, fileType, file) => {
    if (!file) return;

    if (fileType === 'image') {
      // Validate ảnh (giống code cũ)
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh hợp lệ');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      
      // Tạo preview và cập nhật state
      const reader = new FileReader();
      reader.onloadend = () => {
        setWords(prevWords => 
          prevWords.map(word => 
            word.id === id ? { ...word, imageFile: file, previewUrl: reader.result } : word
          )
        );
      };
      reader.readAsDataURL(file);

    } else if (fileType === 'audio') {
      // Validate audio (giống code cũ)
      if (!file.type.startsWith('audio/')) {
        toast.error('Vui lòng chọn file âm thanh hợp lệ');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Kích thước file âm thanh không được vượt quá 10MB');
        return;
      }

      // Cập nhật state
      setWords(prevWords => 
        prevWords.map(word => 
          word.id === id ? { ...word, audioFile: file, audioName: file.name } : word
        )
      );
    }
  };

  // 5. Hàm thêm một form từ vựng mới
  const addWordForm = () => {
    setWords(prevWords => [
      ...prevWords,
      { ...initialWordState, id: Date.now() } // Thêm form rỗng mới
    ]);
  };

  // 6. Hàm xóa một form
  const removeWordForm = (id) => {
    if (words.length > 1) {
      setWords(prevWords => prevWords.filter(word => word.id !== id));
    } else {
      toast.error('Phải có ít nhất một từ vựng');
    }
  };

  // 7. Hàm Submit (gửi tất cả)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate cho TẤT CẢ các từ trong mảng
    for (const [index, wordData] of words.entries()) {
      if (!wordData.word.trim()) {
        toast.error(`Từ vựng #${index + 1}: Vui lòng nhập từ vựng`); return;
      }
      if (!wordData.pronunciation.trim()) {
        toast.error(`Từ vựng #${index + 1}: Vui lòng nhập phát âm`); return;
      }
      if (!wordData.translation.trim()) {
        toast.error(`Từ vựng #${index + 1}: Vui lòng nhập nghĩa`); return;
      }
      if (!wordData.example.trim()) {
        toast.error(`Từ vựng #${index + 1}: Vui lòng nhập ví dụ`); return;
      }
      if (!wordData.topic.trim()) {
        toast.error(`Từ vựng #${index + 1}: Vui lòng chọn chủ đề`); return;
      }
      if (!wordData.imageFile) {
        toast.error(`Từ vựng #${index + 1}: Vui lòng chọn ảnh`); return;
      }
      if (!wordData.audioFile) {
        toast.error(`Từ vựng #${index + 1}: Vui lòng chọn file âm thanh`); return;
      }
    }

    try {
      setLoading(true);
      // Gọi service addMultipleWords (đã định nghĩa ở backend bước trước)
      await wordService.addMultipleWords(words); 
      
      navigate('/admin/word-list');
      toast.success(`Thêm ${words.length} từ vựng thành công!`);
    } catch (error) {
      console.error('Lỗi khi thêm hàng loạt:', error);
      toast.error(error.response?.data?.message || 'Không thể thêm từ vựng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/word-list'); // Hoặc '/words' tùy route của bạn
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="container mx-auto p-6 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Thêm nhiều từ vựng</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 8. Dùng .map() để render các form */}
              {words.map((wordData, index) => (
                <div key={wordData.id} className="border-2 border-dashed border-gray-300 p-6 rounded-lg relative space-y-6">
                  
                  {/* Nút xóa form (chỉ hiển thị nếu > 1 form) */}
                  {words.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWordForm(wordData.id)}
                      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg hover:bg-red-600 transition-colors"
                    >
                      &times;
                    </button>
                  )}

                  <h3 className="font-semibold text-lg text-gray-800">Từ vựng #{index + 1}</h3>

                  {/* Từ vựng */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Từ vựng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={wordData.word}
                      onChange={(e) => handleWordChange(wordData.id, 'word', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập từ vựng"
                    />
                  </div>

                  {/* Phát âm */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phát âm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={wordData.pronunciation}
                      onChange={(e) => handleWordChange(wordData.id, 'pronunciation', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập phiên âm"
                    />
                  </div>

                  {/* Nghĩa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nghĩa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={wordData.translation}
                      onChange={(e) => handleWordChange(wordData.id, 'translation', e.target.value)}
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
                      value={wordData.example}
                      onChange={(e) => handleWordChange(wordData.id, 'example', e.target.value)}
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
                      value={wordData.topic}
                      onChange={(e) => handleWordChange(wordData.id, 'topic', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" disabled>-- Chọn một chủ đề --</option>
                      {allTopics.length > 0 ? (
                        allTopics.map((topicItem) => (
                          <option key={topicItem._id} value={topicItem.nameTopic}>
                            {topicItem.nameTopic} (Nghĩa: {topicItem.meaning})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Đang tải chủ đề...</option>
                      )}
                    </select>
                  </div>

                  {/* Hình ảnh */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        {wordData.previewUrl ? (
                          <img src={wordData.previewUrl} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-lg"/>
                        ) : (
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                        )}
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>{wordData.previewUrl ? 'Chọn ảnh khác' : 'Chọn ảnh'}</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={(e) => handleFileChange(wordData.id, 'image', e.target.files[0])}
                            />
                          </label>
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
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        {wordData.audioName ? (
                          <div className="flex items-center justify-center space-x-2"><svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg><span className="text-sm text-gray-700">{wordData.audioName}</span></div>
                        ) : (
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                        )}
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>{wordData.audioName ? 'Chọn file khác' : 'Chọn file âm thanh'}</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="audio/*"
                              onChange={(e) => handleFileChange(wordData.id, 'audio', e.target.files[0])}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">MP3, WAV, OGG tối đa 10MB</p>
                      </div>
                    </div>
                  </div>

                </div>
              ))}

              {/* 9. Nút thêm form mới */}
              <button
                type="button"
                onClick={addWordForm}
                disabled={loading}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
              >
                + Thêm một từ vựng khác
              </button>

              {/* 10. Buttons Submit/Cancel chung */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang thêm...' : `Thêm ${words.length} từ vựng`}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
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