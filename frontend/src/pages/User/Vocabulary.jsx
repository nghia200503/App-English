import { useState, useEffect } from 'react';
import { Volume2, Search } from 'lucide-react';
import { wordService } from '../../services/wordService';
import { topicService } from '../../services/topicService';
import Header from '../../components/Header';

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

  // Load learned words from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('learnedWords');
    if (saved) {
      setLearnedWords(new Set(JSON.parse(saved)));
    }
  }, []);

  // Fetch words from MongoDB via API
  useEffect(() => {
    fetchWords();
  }, [pagination.currentPage]);

  // Fetch topics once on mount
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const response = await wordService.getAllWords(pagination.currentPage, 9);
      
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
      const response = await topicService.getAllTopics(1, 100); // Get all topics
      
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
      // Save to localStorage
      localStorage.setItem('learnedWords', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const filteredWords = words.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         word.translation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === 'all' || word.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  const learnedCount = Array.from(learnedWords).filter(id => 
    words.some(w => w._id === id)
  ).length;
  const notLearnedCount = filteredWords.length - learnedCount;

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <Header />
      
      <div className="max-w-7xl pt-5 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Học từ vựng</h1>
          <p className="text-gray-600">Khám phá và học các từ vựng tiếng Anh mới</p>
        </div>

        {/* Learning Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Flashcard</h3>
            <p className="text-blue-100 text-sm">Học từ vựng qua thẻ ghi nhớ</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Trắc nghiệm</h3>
            <p className="text-green-100 text-sm">Kiểm tra kiến thức</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Chính tả</h3>
            <p className="text-purple-100 text-sm">Luyện viết từ vựng</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Nghe phát âm</h3>
            <p className="text-orange-100 text-sm">Luyện nghe và phát âm</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm từ vựng
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Nhập từ khóa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Topic Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả ({pagination.totalItems})</option>
                {topics.map(topic => (
                  <option key={topic._id} value={topic.nameTopic}>
                    {topic.nameTopic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{learnedCount} đã học</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{notLearnedCount} chưa học</span>
            </div>
          </div>
        </div>

        {/* Words Display */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Hiển thị {filteredWords.length} từ vựng
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Đang tải từ vựng...</p>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500 text-lg">Không tìm thấy từ vựng nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map((word) => (
              <div
                key={word._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Image */}
                <div className="h-48 overflow-hidden bg-gray-200">
                  <img
                    src={word.image}
                    alt={word.word}
                    className="w-full h-full object-contain transform hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Word and Audio */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-gray-800">{word.word}</h3>
                    <button
                      onClick={() => playAudio(word.audio)}
                      className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                      title="Phát âm thanh"
                    >
                      <Volume2 className="w-5 h-5 text-blue-500" />
                    </button>
                  </div>

                  {/* Pronunciation */}
                  <p className="text-gray-500 text-sm mb-3">{word.pronunciation}</p>

                  {/* Topic Badge */}
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full mb-3">
                    {word.topic}
                  </span>

                  {/* Translation */}
                  <p className="text-gray-800 font-medium mb-3">{word.translation}</p>

                  {/* Example */}
                  {word.example && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-600 italic">{word.example}</p>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => toggleLearned(word._id)}
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      learnedWords.has(word._id)
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    {learnedWords.has(word._id) ? '✓ Đã học' : '+ Đánh dấu đã học'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && !loading && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>
            
            <div className="flex gap-2">
              {[...Array(pagination.totalPages)].map((_, index) => {
                const pageNum = index + 1;
                // Show only nearby pages
                if (
                  pageNum === 1 ||
                  pageNum === pagination.totalPages ||
                  (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        pageNum === pagination.currentPage
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === pagination.currentPage - 2 ||
                  pageNum === pagination.currentPage + 2
                ) {
                  return <span key={pageNum} className="px-2">...</span>;
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};