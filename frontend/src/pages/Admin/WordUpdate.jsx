import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import { wordService } from '../../services/wordService';
import { topicService } from '../../services/topicService'; // Cần để lấy danh sách chủ đề

export default function WordUpdate() {
    const { id } = useParams();
    const [word, setWord] = useState('');
    const [pronunciation, setPronunciation] = useState('');
    const [translation, setTranslation] = useState('');
    const [example, setExample] = useState('');
    const [topic, setTopic] = useState(''); // Chủ đề được chọn (string)
    const [topics, setTopics] = useState([]); // Danh sách chủ đề (array)
    const [imageFile, setImageFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [currentAudioUrl, setCurrentAudioUrl] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [audioPreviewUrl, setAudioPreviewUrl] = useState(''); // <-- State mới cho audio preview
    const [loading, setLoading] = useState(false); // Đang gửi form
    const [fetching, setFetching] = useState(true); // Đang tải dữ liệu ban đầu
    const navigate = useNavigate();

    // Lấy dữ liệu từ vựng và danh sách chủ đề khi component mount
    useEffect(() => {
        // 1. Tạo hàm fetch thông tin từ vựng
        const fetchWord = async () => {
            try {
                const wordResponse = await wordService.getWordById(id);
                if (wordResponse.success) {
                    const w = wordResponse.data;
                    setWord(w.word || '');
                    setPronunciation(w.pronunciation || '');
                    setTranslation(w.translation || '');
                    setExample(w.example || '');
                    setTopic(w.topic || '');
                    setCurrentImageUrl(w.image || '');
                    setImagePreview(w.image || '');
                    setCurrentAudioUrl(w.audio || '');
                } else {
                    toast.error(wordResponse.message || 'Không tìm thấy từ vựng');
                    navigate('/admin/word-list');
                }
            } catch (error) {
                console.error('Lỗi khi tải từ vựng:', error);
                toast.error('Lỗi khi tải thông tin từ vựng');
                navigate('/admin/word-list');
            }
        };

        // 2. Tạo hàm fetch danh sách chủ đề
        const fetchTopics = async () => {
            try {
                const topicsResponse = await topicService.getAllTopicsDropdown();
                if (topicsResponse.success && Array.isArray(topicsResponse.data)) {
                    setTopics(topicsResponse.data);
                } else {
                    toast.error(topicsResponse.message || 'Không thể tải danh sách chủ đề');
                    setTopics([]);
                }
            } catch (error) {
                console.error('Lỗi khi tải chủ đề:', error);
                toast.error('Lỗi khi tải danh sách chủ đề. Kiểm tra route /topics/topicdropdown');
            }
        };

        // 3. Chạy cả hai hàm
        const loadAllData = async () => {
            setFetching(true);
            await fetchWord();  // Chạy fetch từ vựng trước (quan trọng hơn)
            await fetchTopics(); // Sau đó chạy fetch chủ đề
            setFetching(false);
        };

        loadAllData();
    }, [id, navigate]);

    // *** THÊM MỚI: useEffect để dọn dẹp audio preview URL ***
    useEffect(() => {
        // Hàm cleanup này sẽ chạy khi component unmount
        // hoặc khi audioPreviewUrl thay đổi
        return () => {
            if (audioPreviewUrl) {
                URL.revokeObjectURL(audioPreviewUrl);
            }
        };
    }, [audioPreviewUrl]);

    // Xử lý thay đổi ảnh
    const handleImageChange = (e) => {
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
            setImageFile(file);
            // Tạo preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // *** CẬP NHẬT: Xử lý thay đổi audio ***
    const handleAudioChange = (e) => {
        const file = e.target.files[0];

        // Hủy URL xem trước cũ (nếu có) để tránh rò rỉ bộ nhớ
        if (audioPreviewUrl) {
            URL.revokeObjectURL(audioPreviewUrl);
        }

        if (file) {
            if (!file.type.startsWith('audio/')) {
                toast.error('Vui lòng chọn file âm thanh hợp lệ (mp3, wav,...)');
                setAudioFile(null);
                setAudioPreviewUrl(''); // Xóa preview nếu file lỗi
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // Giới hạn 10MB
                toast.error('Kích thước file âm thanh không được vượt quá 10MB');
                setAudioFile(null);
                setAudioPreviewUrl(''); // Xóa preview nếu file lỗi
                return;
            }
            setAudioFile(file);

            // Tạo URL xem trước cho file audio mới
            const newAudioUrl = URL.createObjectURL(file);
            setAudioPreviewUrl(newAudioUrl);
        } else {
            // Nếu người dùng hủy chọn file
            setAudioFile(null);
            setAudioPreviewUrl('');
        }
    };

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        if (!word.trim() || !translation.trim() || !topic) {
            toast.error('Từ vựng, Nghĩa, và Chủ đề là bắt buộc');
            return;
        }

        try {
            setLoading(true);
            // Gọi service updateWord
            // wordService.js đã xử lý việc tạo FormData bên trong
            await wordService.updateWord(
                id,
                word,
                pronunciation,
                translation,
                example,
                topic,
                imageFile, // Sẽ là null nếu không thay đổi
                audioFile  // Sẽ là null nếu không thay đổi
            );

            toast.success('Cập nhật từ vựng thành công!');
            navigate('/admin/word-list');
        } catch (error) {
            console.error('Lỗi khi cập nhật từ vựng:', error);
            toast.error(error.response?.data?.message || 'Không thể cập nhật từ vựng');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/word-list');
    };

    // Hiển thị loading spinner khi đang fetch data
    if (fetching) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 ml-64 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        <p className="mt-4 text-gray-600">Đang tải thông tin từ vựng...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Giao diện form
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 ml-64">
                <div className="container mx-auto p-6 max-w-3xl">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">Cập nhật Từ vựng</h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Cột trái */}
                                <div className="space-y-6">
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
                                            placeholder="Nhập từ vựng (ví dụ: Apple)"
                                        />
                                    </div>

                                    {/* Phát âm */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phát âm
                                        </label>
                                        <input
                                            type="text"
                                            value={pronunciation}
                                            onChange={(e) => setPronunciation(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Nhập phiên âm (ví dụ: /ˈæpəl/)"
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
                                            <option value="" disabled>-- Chọn chủ đề --</option>
                                            {topics.map((t) => (
                                                <option key={t._id} value={t.nameTopic}>
                                                    {t.nameTopic}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Cột phải */}
                                <div className="space-y-6">
                                    {/* Ví dụ */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ví dụ
                                        </label>
                                        <textarea
                                            value={example}
                                            onChange={(e) => setExample(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows={4}
                                            placeholder="Nhập câu ví dụ (ví dụ: An apple a day keeps the doctor away.)"
                                        />
                                    </div>

                                    {/* Âm thanh (Audio) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Âm thanh {audioFile ? <span className="text-green-600">(Đã chọn file mới)</span> : <span className="text-gray-500">(Giữ nguyên file cũ)</span>}
                                        </label>
                                        
                                        {/* *** CẬP NHẬT: Hiển thị audio player *** */}
                                        {audioPreviewUrl ? (
                                            <audio controls src={audioPreviewUrl} className="w-full mb-2">
                                                Your browser does not support the audio element.
                                            </audio>
                                        ) : currentAudioUrl ? (
                                            <audio controls src={currentAudioUrl} className="w-full mb-2">
                                                Your browser does not support the audio element.
                                            </audio>
                                        ) : null}

                                        {/* {audioFile && (
                                            <p className='text-sm text-gray-600 mb-2'>File mới đã chọn: {audioFile.name}</p>
                                        )} */}
                                        
                                        <input
                                            type="file"
                                            accept="audio/*"
                                            onChange={handleAudioChange}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Hình ảnh (Toàn chiều rộng) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hình ảnh {imageFile ? <span className="text-green-600">(Đã chọn ảnh mới)</span> : <span className="text-gray-500">(Giữ nguyên ảnh cũ)</span>}
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                                    <div className="space-y-1 text-center">
                                        {imagePreview ? (
                                            <div className="mb-4">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="mx-auto h-32 w-auto object-contain rounded-lg"
                                                />
                                            </div>
                                        ) : (
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                <span>{imageFile ? 'Chọn ảnh khác' : (imagePreview ? 'Thay đổi ảnh' : 'Chọn ảnh')}</span>
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
                                    {loading ? 'Đang cập nhật...' : 'Cập nhật Từ vựng'}
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