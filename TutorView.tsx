
import React, { useState, useRef, useEffect } from 'react';
import { getTutorResponse } from './gemini';
import { View } from './types';

interface Message { role: 'user' | 'model'; text: string; }

const TutorView: React.FC<{setView: (view: View) => void}> = ({ setView }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Chào con! Thầy là Pi 🤖. Con cần hỏi gì về hằng đẳng thức không? Thầy trả lời siêu nhanh luôn! 🥧' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if ((window as any).MathJax) {
      (window as any).MathJax.typesetPromise();
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim(); 
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    // Chuyển đổi message sang format của Gemini API
    const history = messages.map(m => ({ 
      role: m.role, 
      parts: [{ text: m.text }] 
    }));
    
    const response = await getTutorResponse(msg, history);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  return (
    <div className="p-4 flex flex-col h-[calc(100vh-180px)] max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl neo-card flex-1 flex flex-col overflow-hidden border-4 border-black">
        <div className="bg-pink-500 p-4 border-b-4 border-black flex items-center">
           <span className="text-2xl mr-3">🤖</span>
           <h3 className="font-black text-white uppercase italic tracking-tight">Gia sư Thầy Pi</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fffdfa]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] p-3 px-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                m.role === 'user' ? 'bg-cyan-200 font-bold' : 'bg-white'
              }`}>
                <div className="whitespace-pre-wrap text-base md:text-lg">{m.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-white p-2 px-4 rounded-xl border-2 border-black italic text-xs font-bold animate-pulse">Thầy Pi đang trả lời...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t-4 border-black bg-white">
          <div className="flex space-x-2">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyPress={e => e.key === 'Enter' && handleSend()} 
              className="flex-1 p-3 border-4 border-black rounded-xl font-bold focus:outline-none focus:bg-yellow-50" 
              placeholder="Nhập câu hỏi..." 
            />
            <button 
              onClick={handleSend} 
              disabled={loading} 
              className="bg-pink-500 p-3 px-5 rounded-xl border-4 border-black neo-btn text-white font-black"
            >
              GỬI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorView;
