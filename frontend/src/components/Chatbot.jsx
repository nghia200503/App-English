// src/components/Chatbot.jsx

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { aiService } from '../services/aiService'; 
import { toast } from 'sonner';


export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Chào bạn! Bạn muốn hỏi gì về từ vựng hôm nay?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    const userMessage = inputValue.trim();
    if (userMessage === '') return;

    // 1. Thêm tin nhắn của người dùng
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    // 2. Gọi API AI thật
    try {
      const aiResponse = await aiService.ask(userMessage);

      if (aiResponse.success) {
        const cleanedText = aiResponse.text.replace(/\*\*(.*?)\*\*/g, '$1');
        
        setMessages(prev => [...prev, { sender: 'ai', text: cleanedText }]);
      } else {
        // Nếu API trả về lỗi (ví dụ: lỗi 500 từ backend)
        setMessages(prev => [...prev, { sender: 'ai', text: aiResponse.message || 'Xin lỗi, mình gặp chút lỗi.' }]);
        toast.error(aiResponse.message || 'Lỗi từ AI');
      }

    } catch (error) {
      // Lỗi mạng hoặc lỗi hệ thống
      const errorMsg = 'Lỗi kết nối. Không thể liên lạc với AI.';
      setMessages(prev => [...prev, { sender: 'ai', text: errorMsg }]);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="w-[350px] h-[500px] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 ">
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white rounded-t-xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-bold text-lg">Trợ lý Từ vựng AI</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-blue-700 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nội dung Chat */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar */}
                {msg.sender === 'ai' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    <Bot size={20} />
                  </div>
                )}
                
                {/* Tin nhắn */}
                <div
                  className={`max-w-[75%] p-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
                
                {/* Avatar */}
                {msg.sender === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center">
                    <User size={20} />
                  </div>
                )}
              </div>
            ))}
            
            {/* AI đang gõ... */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div className="max-w-[75%] p-3 rounded-lg bg-white border border-gray-200 text-gray-800 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>AI đang gõ...</span>
                </div>
              </div>
            )}
            
            {/* Div rỗng để cuộn */}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Hỏi AI về từ vựng..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-10 h-10 flex-shrink-0 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition disabled:bg-gray-400"
              disabled={isLoading || inputValue.trim() === ''}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}

      {/* Nút Mở/Đóng Chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition transform hover:scale-110"
        >
          <MessageSquare size={32} />
        </button>
      )}
    </div>
  );
}