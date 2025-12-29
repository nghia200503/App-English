import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import { wordService } from '../../services/wordService';
import { topicService } from '../../services/topicService';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Download, X, Music, Image as ImageIcon } from 'lucide-react';

// Cấu trúc khởi tạo cho một từ
const initialWordState = {
  id: Date.now(),
  word: '',
  pronunciation: '',
  translation: '',
  example: '',
  topic: '',
  imageFile: null,
  audioFile: null,
  previewUrl: '', // Để xem trước ảnh
  audioName: '',  // Để hiển thị tên file audio
};

export default function WordAddBulk() {
  const [words, setWords] = useState([initialWordState]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [allTopics, setAllTopics] = useState([]);

  // 1. Lấy danh sách chủ đề để hiển thị dropdown
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

  // 2. Xử lý đọc file Excel
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
            toast.error("File Excel rỗng!");
            return;
        }

        // Map dữ liệu từ Excel vào state
        const importedWords = data.map((row, index) => ({
            id: Date.now() + index,
            word: row['Từ vựng'] || row['Word'] || '',
            pronunciation: row['Phát âm'] || row['Pronunciation'] || '',
            translation: row['Nghĩa'] || row['Meaning'] || '',
            example: row['Ví dụ'] || row['Example'] || '',
            topic: row['Chủ đề'] || row['Topic'] || '', 
            // File media phải để trống để user upload thủ công sau
            imageFile: null,
            audioFile: null,
            previewUrl: '',
            audioName: ''
        }));

        setWords(importedWords);
        toast.success(`Đã nhập ${importedWords.length} dòng text. Vui lòng thêm ảnh/audio thủ công!`);
        e.target.value = null; // Reset input

      } catch (error) {
        console.error("Lỗi đọc Excel:", error);
        toast.error("File Excel không đúng định dạng.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // 3. Tải file mẫu
  const downloadSample = () => {
    const ws = XLSX.utils.json_to_sheet([
        { "Từ vựng": "Apple", "Phát âm": "/ˈæp.l/", "Nghĩa": "Quả táo", "Ví dụ": "I eat an apple", "Chủ đề": "Fruits" },
        { "Từ vựng": "Dog", "Phát âm": "/dɒɡ/", "Nghĩa": "Con chó", "Ví dụ": "The dog barks", "Chủ đề": "Animals" }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mau_Nhap_Tu");
    XLSX.writeFile(wb, "Mau_Tu_Vung.xlsx");
  };

  // 4. Xử lý thay đổi input text
  const handleInputChange = (index, field, value) => {
    const newWords = [...words];
    newWords[index][field] = value;
    setWords(newWords);
  };

  // 5. Xử lý chọn File (Ảnh/Audio)
  const handleFileChange = (index, type, file) => {
    const newWords = [...words];
    
    if (type === 'image') {
      if (file) {
        if (!file.type.startsWith('image/')) {
            toast.error("Vui lòng chọn file ảnh hợp lệ!");
            return;
        }
        newWords[index].imageFile = file;
        // Tạo preview ảnh
        const reader = new FileReader();
        reader.onloadend = () => {
          newWords[index].previewUrl = reader.result;
          setWords([...newWords]); 
        };
        reader.readAsDataURL(file);
      }
    } else if (type === 'audio') {
      if (file) {
        if (!file.type.startsWith('audio/')) {
            toast.error("Vui lòng chọn file âm thanh hợp lệ!");
            return;
        }
        newWords[index].audioFile = file;
        newWords[index].audioName = file.name;
        setWords(newWords);
      }
    }
  };

  // Thêm/Xóa dòng
  const addWordForm = () => {
    setWords([...words, { ...initialWordState, id: Date.now() }]);
  };

  const removeWordForm = (index) => {
    if (words.length > 1) {
      const newWords = words.filter((_, i) => i !== index);
      setWords(newWords);
    } else {
        toast.warning("Cần ít nhất 1 từ vựng!");
    }
  };

  // 6. Xử lý Submit (Validation kỹ càng)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    for (let i = 0; i < words.length; i++) {
        const item = words[i];
        const rowNum = i + 1;
        
        // Check Text
        if (!item.word || !item.translation || !item.topic) {
            toast.error(`Hàng ${rowNum}: Thiếu Từ, Nghĩa hoặc Chủ đề!`);
            setLoading(false);
            return;
        }

        // Check Files (BẮT BUỘC)
        if (!item.imageFile) {
            toast.error(`Hàng ${rowNum} (${item.word || 'Chưa nhập tên'}): Thiếu file ẢNH!`);
            setLoading(false);
            // Cuộn tới phần tử bị lỗi (Logic nâng cao, ở đây alert là đủ)
            return;
        }

        if (!item.audioFile) {
            toast.error(`Hàng ${rowNum} (${item.word || 'Chưa nhập tên'}): Thiếu file ÂM THANH!`);
            setLoading(false);
            return;
        }
    }

    try {
      // Gửi dữ liệu sang Service
      const response = await wordService.addWordBulk(words);
      if (response.success) {
        toast.success(response.message);
        navigate('/admin/word-list');
      }
    } catch (error) {
      console.error('Lỗi thêm từ:', error);
      toast.error(error.response?.data?.error || 'Lỗi hệ thống khi thêm từ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Thêm từ vựng hàng loạt</h2>
                  <p className="text-gray-500 mt-1">
                    Nhập Excel cho nhanh, nhưng <span className="text-red-600 font-bold">bắt buộc</span> phải upload Ảnh & Audio thủ công.
                  </p>
                </div>
                
                {/* Excel Actions */}
                <div className="flex gap-3">
                    <button 
                        onClick={downloadSample}
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 transition"
                    >
                        <Download size={18} /> Tải mẫu Excel
                    </button>
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm font-medium">
                        <FileSpreadsheet size={18} />
                        <span>Nhập từ Excel</span>
                        <input 
                            type="file" 
                            accept=".xlsx, .xls" 
                            className="hidden" 
                            onChange={handleExcelUpload}
                        />
                    </label>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                {words.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`p-6 rounded-xl border transition-all duration-200 ${
                        (!item.imageFile || !item.audioFile) ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                            #{index + 1}
                        </span>
                        {(!item.imageFile || !item.audioFile) && (
                            <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                                <AlertCircleIcon /> Thiếu file media
                            </span>
                        )}
                      </div>
                      
                      {words.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWordForm(index)}
                          className="text-gray-400 hover:text-red-500 hover:bg-white p-2 rounded-full transition"
                          title="Xóa dòng này"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Cột trái: TEXT INPUTS (Chiếm 7 phần) */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Từ vựng <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={item.word}
                                    onChange={(e) => handleInputChange(index, 'word', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ex: Apple"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phiên âm</label>
                                <input
                                    type="text"
                                    value={item.pronunciation}
                                    onChange={(e) => handleInputChange(index, 'pronunciation', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ex: /ˈæp.l/"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nghĩa tiếng Việt <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={item.translation}
                                onChange={(e) => handleInputChange(index, 'translation', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Ví dụ: Quả táo"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ví dụ câu</label>
                            <textarea
                                value={item.example}
                                onChange={(e) => handleInputChange(index, 'example', e.target.value)}
                                rows="2"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Ex: I eat an apple."
                            />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề <span className="text-red-500">*</span></label>
                          <select
                            value={item.topic}
                            onChange={(e) => handleInputChange(index, 'topic', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            required
                          >
                            <option value="">-- Chọn chủ đề --</option>
                            {allTopics.map((t) => (
                              <option key={t._id} value={t.nameTopic}>
                                {t.nameTopic} ({t.wordCount || 0} từ)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Cột phải: MEDIA UPLOAD (Chiếm 5 phần) */}
                      <div className="lg:col-span-5 space-y-4">
                        
                        {/* Ảnh Upload */}
                        <div className={`p-4 rounded-lg border-2 border-dashed relative group transition-colors ${!item.imageFile ? 'border-red-300 bg-red-50/50' : 'border-blue-200 bg-blue-50/30'}`}>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Ảnh minh họa <span className="text-red-500">*</span>
                            </label>
                            
                            {item.previewUrl ? (
                                <div className="relative h-32 w-full">
                                    <img src={item.previewUrl} alt="Preview" className="h-full w-full object-contain mx-auto rounded-md" />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const newWords = [...words];
                                            newWords[index].imageFile = null;
                                            newWords[index].previewUrl = '';
                                            setWords(newWords);
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 z-10"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center justify-center h-32 w-full">
                                    <ImageIcon className={`w-8 h-8 mb-2 ${!item.imageFile ? 'text-red-400' : 'text-blue-400'}`} />
                                    <span className={`text-sm font-medium ${!item.imageFile ? 'text-red-500' : 'text-blue-600'}`}>
                                        Chọn file Ảnh
                                    </span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(index, 'image', e.target.files[0])} />
                                </label>
                            )}
                        </div>

                        {/* Audio Upload */}
                        <div className={`p-4 rounded-lg border relative transition-colors ${!item.audioFile ? 'border-red-300 bg-red-50/50' : 'border-green-200 bg-green-50/30'}`}>
                           <label className="block text-sm font-bold text-gray-700 mb-2">
                                Âm thanh phát âm <span className="text-red-500">*</span>
                           </label>
                           
                           <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className={`p-2 rounded-full ${item.audioFile ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                        <Music size={20} />
                                    </div>
                                    <span className="text-sm text-gray-600 truncate max-w-[150px]">
                                        {item.audioName || "Chưa có file"}
                                    </span>
                                </div>
                                <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 transition shadow-sm">
                                    Browse
                                    <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileChange(index, 'audio', e.target.files[0])} />
                                </label>
                           </div>
                        </div>

                      </div>
                    </div>
                  </div>
                ))}
                </div>

                {/* Add More Button */}
                <button
                  type="button"
                  onClick={addWordForm}
                  disabled={loading}
                  className="mt-6 w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <Upload size={20} /> Thêm một từ vựng khác
                </button>

                {/* Footer Action Buttons */}
                <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200 sticky bottom-0 bg-white z-20 shadow-[0_-10px_20px_rgba(255,255,255,0.8)]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 disabled:bg-gray-400 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                        <>Loading...</>
                    ) : (
                        <>Lưu {words.length} từ vựng</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/word-list')}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon helper nhỏ (nếu bạn chưa có icon AlertCircle)
function AlertCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    )
}