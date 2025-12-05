import { useState, useEffect } from 'react';
import { Plus, FolderPlus, Book, Trash2, X, ArrowLeft, FolderOpen, Search, Library, Grid, List } from 'lucide-react';
import api from '../../libs/axios';
import Header from '../../components/Header';
import { toast } from 'sonner';

export default function PersonalDictionary() {
    const [activeTab, setActiveTab] = useState('topics');
    const [myTopics, setMyTopics] = useState([]);
    const [myWords, setMyWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState(null);

    // Modal & Form states
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [showWordModal, setShowWordModal] = useState(false);
    const [newTopic, setNewTopic] = useState({ nameTopic: '', meaning: '' });
    const [newWord, setNewWord] = useState({ word: '', translation: '', topic: '', example: '' });

    useEffect(() => {
        setSelectedTopic(null);
        fetchData();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'topics' && selectedTopic) {
            fetchWordsByTopic(selectedTopic.nameTopic);
        }
    }, [selectedTopic]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'topics') {
                const res = await api.get('/topics/user/my-topics');
                setMyTopics(res.data.data);
            } else {
                const res = await api.get('/words/user/my-words?topic=all');
                setMyWords(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const fetchWordsByTopic = async (topicName) => {
        setLoading(true);
        try {
            const res = await api.get(`/words/user/my-words?topic=${topicName}`);
            setMyWords(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải từ vựng");
        } finally {
            setLoading(false);
        }
    };

    const openAddWordModal = () => {
        if (myTopics.length === 0 && !selectedTopic) {
             api.get('/topics/user/my-topics').then(res => setMyTopics(res.data.data));
        }
        if (selectedTopic) {
            setNewWord(prev => ({ ...prev, topic: selectedTopic.nameTopic }));
        } else {
            setNewWord(prev => ({ ...prev, topic: '' }));
        }
        setShowWordModal(true);
    }

    const handleCreateTopic = async (e) => {
        e.preventDefault();
        try {
            await api.post('/topics/user/create', newTopic);
            toast.success("Tạo chủ đề thành công!");
            setShowTopicModal(false);
            setNewTopic({ nameTopic: '', meaning: '' });
            if (activeTab === 'topics' && !selectedTopic) fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi tạo chủ đề");
        }
    };

    const handleCreateWord = async (e) => {
        e.preventDefault();
        if(!newWord.topic) {
            toast.error("Vui lòng chọn chủ đề");
            return;
        }
        try {
            await api.post('/words/user/create', newWord);
            toast.success("Thêm từ mới thành công!");
            setShowWordModal(false);
            setNewWord({ word: '', translation: '', topic: '', example: '' });
            
            if (selectedTopic) {
                fetchWordsByTopic(selectedTopic.nameTopic);
            } else {
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi thêm từ");
        }
    };

    // Component hiển thị danh sách từ
    const WordTable = ({ words }) => (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fadeIn">
            {words.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="p-5 w-1/4">Từ vựng</th>
                                <th className="p-5 w-1/4">Nghĩa</th>
                                {!selectedTopic && <th className="p-5 w-1/6">Chủ đề</th>}
                                <th className="p-5 w-1/3">Ví dụ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {words.map(word => (
                                <tr key={word._id} className="hover:bg-blue-50/40 transition-colors group">
                                    <td className="p-5">
                                        <span className="font-bold text-gray-800 block text-lg group-hover:text-blue-600 transition">{word.word}</span>
                                        <span className="text-sm text-gray-400 font-mono">{word.pronunciation}</span>
                                    </td>
                                    <td className="p-5 text-gray-600 font-medium">{word.translation}</td>
                                    {!selectedTopic && (
                                        <td className="p-5">
                                            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium border border-gray-200">
                                                <FolderOpen size={12} />
                                                {word.topic}
                                            </span>
                                        </td>
                                    )}
                                    <td className="p-5 text-gray-500 text-sm italic border-l border-transparent group-hover:border-blue-100 pl-6">
                                        {word.example ? `"${word.example}"` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50/30">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-200 rounded-full mb-4">
                        <Book size={32} />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">Chưa có từ vựng nào.</p>
                    <p className="text-gray-400 text-sm mb-4">Bắt đầu thêm từ để học nhé!</p>
                    <button onClick={openAddWordModal} className="px-5 py-2 bg-white border border-gray-200 text-blue-600 font-medium rounded-lg hover:border-blue-200 hover:shadow-sm transition text-sm">
                        Thêm từ ngay
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Header />
            
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* 1. Header Section & Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Library size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Từ Điển Của Tôi</h1>
                            <p className="text-gray-500 mt-1 text-sm">Quản lý kho từ vựng cá nhân của bạn</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowTopicModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition shadow-sm font-medium text-sm group"
                        >
                            <FolderPlus size={18} className="text-gray-400 group-hover:text-blue-500 transition" /> 
                            Tạo Chủ Đề
                        </button>
                        <button 
                            onClick={openAddWordModal}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200 font-medium text-sm active:scale-95 transform duration-150"
                        >
                            <Plus size={18} /> 
                            Thêm Từ Mới
                        </button>
                    </div>
                </div>

                {/* 2. Navigation Tabs (Chỉ hiện khi không ở trong chi tiết topic) */}
                {!selectedTopic && (
                    <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm w-fit mx-auto md:mx-0">
                        <button
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                activeTab === 'topics' 
                                ? 'bg-blue-50 text-blue-700 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={() => setActiveTab('topics')}
                        >
                            <Grid size={16} />
                            Bộ sưu tập ({myTopics.length})
                        </button>
                        <button
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                activeTab === 'words' 
                                ? 'bg-blue-50 text-blue-700 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={() => setActiveTab('words')}
                        >
                            <List size={16} />
                            Tất cả từ vựng
                        </button>
                    </div>
                )}

                {/* 3. Breadcrumb Navigation (Khi xem chi tiết) */}
                {selectedTopic && (
                    <div className="mb-6 flex items-center justify-between">
                        <button 
                            onClick={() => setSelectedTopic(null)}
                            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm font-medium text-sm hover:border-blue-200"
                        >
                            <ArrowLeft size={18} /> Quay lại
                        </button>
                        
                        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                            <FolderOpen className="text-blue-600" size={20} />
                            <span className="font-bold text-blue-900">{selectedTopic.nameTopic}</span>
                            <span className="w-px h-4 bg-blue-200"></span>
                            <span className="text-blue-600 text-sm">{selectedTopic.wordCount} từ</span>
                        </div>
                    </div>
                )}

                {/* 4. Content Area */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                        <p className="text-gray-400 text-sm">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <>
                        {/* VIEW: Grid Topics */}
                        {activeTab === 'topics' && !selectedTopic && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {myTopics.length > 0 ? myTopics.map((topic) => (
                                    <div 
                                        key={topic._id} 
                                        onClick={() => setSelectedTopic(topic)}
                                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform"></div>
                                        
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                                <Book size={22} />
                                            </div>
                                            <span className="bg-gray-50 text-gray-500 text-xs px-2.5 py-1 rounded-full font-bold border border-gray-100 group-hover:border-blue-100 transition">
                                                {topic.wordCount} từ
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition relative z-10">
                                            {topic.nameTopic}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed relative z-10">
                                            {topic.meaning}
                                        </p>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                                            <FolderPlus size={32} className="text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có chủ đề nào</h3>
                                        <p className="text-gray-500 mb-4">Tạo chủ đề đầu tiên để bắt đầu thêm từ vựng</p>
                                        <button onClick={() => setShowTopicModal(true)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium">
                                            Tạo ngay
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* VIEW: Word List */}
                        {(activeTab === 'words' || selectedTopic) && (
                            <WordTable words={myWords} />
                        )}
                    </>
                )}
            </div>

            {/* --- MODALS (Giữ nguyên logic form, chỉ tút lại CSS chút xíu) --- */}
            
            {showTopicModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Tạo Chủ Đề</h2>
                            <button onClick={() => setShowTopicModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTopic} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên chủ đề</label>
                                <input 
                                    type="text" required
                                    value={newTopic.nameTopic}
                                    onChange={e => setNewTopic({...newTopic, nameTopic: e.target.value})}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition"
                                    placeholder="Ví dụ: My Favorite Foods"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả ngắn</label>
                                <input 
                                    type="text" required
                                    value={newTopic.meaning}
                                    onChange={e => setNewTopic({...newTopic, meaning: e.target.value})}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition"
                                    placeholder="Ví dụ: Đồ ăn yêu thích"
                                />
                            </div>
                            <div className="pt-2 flex gap-3 justify-end">
                                <button type="button" onClick={() => setShowTopicModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition">Hủy</button>
                                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition shadow-lg shadow-blue-200">Hoàn tất</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showWordModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Thêm Từ Mới</h2>
                            <button onClick={() => setShowWordModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateWord} className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Từ vựng (Anh)</label>
                                    <input 
                                        type="text" required
                                        value={newWord.word}
                                        onChange={e => setNewWord({...newWord, word: e.target.value})}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
                                        placeholder="Apple"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nghĩa (Việt)</label>
                                    <input 
                                        type="text" required
                                        value={newWord.translation}
                                        onChange={e => setNewWord({...newWord, translation: e.target.value})}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
                                        placeholder="Quả táo"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Thuộc chủ đề</label>
                                <select 
                                    required
                                    value={newWord.topic}
                                    onChange={e => setNewWord({...newWord, topic: e.target.value})}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition bg-white"
                                >
                                    <option value="">-- Chọn chủ đề --</option>
                                    {myTopics.map(t => (
                                        <option key={t._id} value={t.nameTopic}>{t.nameTopic}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ví dụ (Tùy chọn)</label>
                                <textarea 
                                    rows="3"
                                    value={newWord.example}
                                    onChange={e => setNewWord({...newWord, example: e.target.value})}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition resize-none"
                                    placeholder="I eat an apple everyday."
                                ></textarea>
                            </div>

                            <div className="pt-2 flex gap-3 justify-end">
                                <button type="button" onClick={() => setShowWordModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition">Hủy</button>
                                <button 
                                    type="submit" 
                                    disabled={myTopics.length === 0}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition shadow-lg shadow-blue-200 disabled:bg-gray-300 disabled:shadow-none"
                                >
                                    Lưu từ vựng
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}