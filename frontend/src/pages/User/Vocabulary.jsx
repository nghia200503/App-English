import { useState, useEffect } from 'react';
import { Volume2, Search, Layers, CheckSquare, Edit3, Headphones, BookOpen, Filter } from 'lucide-react';
// Import service
import { wordService } from '../../services/wordService';
import { topicService } from '../../services/topicService';
// Import components
import Header from '../../components/Header';
import FlashcardPopup from '../../components/FlashcardPopup';
import QuizPopup from '../../components/QuizPopup';
import SpellPopup from '../../components/SpellPopup';
import ListenPopup from '../../components/ListenPopup';
// Import assets
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';

export default function Vocabulary(){
  const [words, setWords] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [learnedWords, setLearnedWords] = useState(new Set());
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 9,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isQuizPopupOpen, setIsQuizPopupOpen] = useState(false);
  const [isSpellPopupOpen, setIsSpellPopupOpen] = useState(false);
  const [isListenPopupOpen, setIsListenPopupOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('learnedWords');
    if (saved) {
      setLearnedWords(new Set(JSON.parse(saved)));
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    fetchWords();
  }, [pagination.currentPage, selectedTopic, searchTerm]);
  // -------------------------

  const fetchWords = async () => {
    try {
      setLoading(true);
      const response = await wordService.getAllWords(
        pagination.currentPage, 
        pagination.itemsPerPage,
        selectedTopic,
        searchTerm
      );
      
      if (response.success) {
        setWords(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching words:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await topicService.getAllTopicsDropdown(); 
      
      if (response.success) {
        setTopics(response.data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const playAudio = (audioUrl) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => console.error('Error playing audio:', err));
    }
  };

  const toggleLearned = (wordId) => {
    setLearnedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      localStorage.setItem('learnedWords', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  // Tính toán số từ đã học/chưa học
  const learnedCount = words.filter(w => learnedWords.has(w._id)).length;
  const notLearnedCount = words.length - learnedCount;

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    // Khi đổi filter, quay về trang 1
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Khi đổi filter, quay về trang 1
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  // -----------------------------------------

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartLearn = (selectedTopic) => {
    setIsPopupOpen(false);
    navigate('/vocabulary/flashcard');
  };

  const handleStartQuiz = () => {
    setIsQuizPopupOpen(false);
    navigate('/vocabulary/quiz');
  };

  const handleStartSpell = () => {
    setIsSpellPopupOpen(false);
    navigate('/vocabulary/spell');
  };

  const handleStartListen = () => {
    setIsListenPopupOpen(false);
    navigate('/vocabulary/listen');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Section */}

        {/* Learning Modes Grid  */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Flashcard */}
          <div 
            onClick={() => setIsPopupOpen(true)} 
            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
          >
            {/* Background Gradient trang trí */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Layers size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Flashcard</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Lật thẻ để ghi nhớ từ vựng và định nghĩa một cách trực quan.
              </p>
            </div>
          </div>

          {/* Trắc nghiệm */}
          <div 
            onClick={() => setIsQuizPopupOpen(true)} 
            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <CheckSquare size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">Trắc nghiệm</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Kiểm tra phản xạ và mức độ ghi nhớ qua các câu hỏi đa lựa chọn.
              </p>
            </div>
          </div>

          {/* Nghe và viết */}
          <div 
            onClick={() => setIsSpellPopupOpen(true)} 
            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Edit3 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">Nghe & Viết</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Luyện kỹ năng nghe và chính tả bằng cách viết lại từ bạn nghe được.
              </p>
            </div>
          </div>

          {/* Nghe và chọn */}
          <div 
            onClick={() => setIsListenPopupOpen(true)} 
            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Headphones size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">Nghe & Chọn</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Cải thiện khả năng nghe hiểu và chọn từ vựng.
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Stats Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Inputs */}
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm từ vựng..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm outline-none"
                />
              </div>

              {/* Topic Dropdown */}
              <div className="relative min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  value={selectedTopic}
                  onChange={handleTopicChange}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm outline-none appearance-none cursor-pointer"
                >
                  <option value="all">Tất cả danh mục ({pagination.totalItems})</option>
                  {topics.map(topic => (
                    <option key={topic._id} value={topic.nameTopic}>
                      {topic.nameTopic}
                    </option>
                  ))}
                </select>
                {/* Custom Arrow */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right: Stats Pills */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">{learnedCount} đã thuộc</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <span className="text-sm font-medium">{notLearnedCount} đang học</span>
              </div>
            </div>
          </div>
        </div>

        {/* Words List Header */}
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-slate-800">
            Danh sách từ vựng
            <span className="ml-2 text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {words.length}
            </span>
          </h2>
        </div>

        {/* Words Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500">Đang tải dữ liệu...</p>
          </div>
        ) : words.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-lg font-medium">Không tìm thấy từ vựng nào</p>
            <p className="text-slate-400 text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {words.map((word) => (
              <div
                key={word._id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                {/* Top: Image & Audio */}
                <div className="flex gap-4 mb-4">
                  <div className="w-24 h-24 flex-shrink-0 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                    <img
                      src={word.image}
                      alt={word.word}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-slate-800 truncate pr-2" title={word.word}>{word.word}</h3>
                      <button
                        onClick={() => playAudio(word.audio)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors flex-shrink-0"
                        title="Phát âm thanh"
                      >
                        <Volume2 size={18} />
                      </button>
                    </div>
                    <p className="text-slate-500 text-sm font-mono mt-1">{word.pronunciation}</p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-medium border border-slate-200 truncate max-w-full">
                      {word.topic}
                    </span>
                  </div>
                </div>

                {/* Middle: Meaning & Example */}
                <div className="mb-4">
                  <p className="text-lg font-semibold text-slate-700 mb-2">{word.translation}</p>
                  {word.example && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <p className="text-sm text-slate-600 italic leading-relaxed">"{word.example}"</p>
                    </div>
                  )}
                </div>

                {/* Bottom: Action */}
                <button
                  onClick={() => toggleLearned(word._id)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    learnedWords.has(word._id)
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {learnedWords.has(word._id) ? (
                    <><CheckSquare size={16} /> Đã thuộc</>
                  ) : (
                    <>Đánh dấu đã thuộc</>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && !loading && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-600 bg-slate-50"
            >
              Trước
            </button>
            
            <div className="flex gap-1">
              {[...Array(pagination.totalPages)].map((_, index) => {
                const pageNum = index + 1;
                if (
                  pageNum === 1 ||
                  pageNum === pagination.totalPages ||
                  (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        pageNum === pagination.currentPage
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                          : 'text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === pagination.currentPage - 2 ||
                  pageNum === pagination.currentPage + 2
                ) {
                  return <span key={pageNum} className="px-2 text-slate-400 self-end mb-2">...</span>;
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-600 bg-slate-50"
            >
              Sau
            </button>
          </div>
        )}

        {/* Popups */}
        <FlashcardPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} onStartLearn={handleStartLearn} />
        <QuizPopup isOpen={isQuizPopupOpen} onClose={() => setIsQuizPopupOpen(false)} onStartQuiz={handleStartQuiz} />
        <SpellPopup isOpen={isSpellPopupOpen} onClose={() => setIsSpellPopupOpen(false)} onStartSpell={handleStartSpell} />
        <ListenPopup isOpen={isListenPopupOpen} onClose={() => setIsListenPopupOpen(false)} onStartListen={handleStartListen} />
      </div>
    </div>
  );
}