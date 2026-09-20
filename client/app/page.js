'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Icons
const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const UserGroupIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const SkipIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
  </svg>
);

const StopIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

let socket;

export default function Home() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'searching' | 'waiting' | 'matched' | 'disconnected'
  const [roomId, setRoomId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [onlineCount, setOnlineCount] = useState(128);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  useEffect(() => {
    // Connect to backend URL or default to current window hostname
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    socket = io(backendUrl);

    socket.on('waiting', () => setStatus('waiting'));
    
    socket.on('chat_matched', ({ roomId }) => {
      setRoomId(roomId);
      setStatus('matched');
      setMessages([]);
    });

    socket.on('receive_message', ({ message }) => {
      setMessages((prev) => [...prev, { sender: 'Stranger', text: message, time: getCurrentTime() }]);
    });

    socket.on('partner_disconnected', () => {
      setStatus('disconnected');
    });

    // Random slight fluctuation for online count display
    const interval = setInterval(() => {
      setOnlineCount((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 5000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const getCurrentTime = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleStart = () => {
    setStatus('searching');
    socket.emit('join_queue');
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || status !== 'matched') return;

    socket.emit('send_message', { roomId, message: input });
    setMessages((prev) => [...prev, { sender: 'You', text: input, time: getCurrentTime() }]);
    setInput('');
  };

  const handleNext = () => {
    socket.emit('leave_room');
    handleStart();
  };

  const handleStop = () => {
    socket.emit('leave_room');
    setStatus('idle');
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-300 text-sm tracking-wider">TWR</span>
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Talk with randoms
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">100% Anonymous 1-on-1 Chat</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span>{onlineCount} Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-4 flex flex-col">
        {status === 'idle' ? (
          /* Landing Screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6 animate-pulse">
              <ZapIcon /> Instant Matchmaking Enabled
            </div>

            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 mb-4 max-w-3xl leading-tight">
              Talk to strangers instantly, <span className="bg-gradient-to-r from-indigo-400 via-teal-300 to-teal-400 bg-clip-text text-transparent">completely anonymously.</span>
            </h2>

            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed">
              No registration, no accounts, and no history. Jump straight into private 1-on-1 text conversations with random people around the globe.
            </p>

            <button
              onClick={handleStart}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-teal-500 rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Chatting Now
                <ZapIcon />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Features list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl w-full text-left">
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <div className="p-2 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 mb-3">
                  <ShieldCheckIcon />
                </div>
                <h3 className="font-semibold text-slate-200 text-sm mb-1">Fully Anonymous</h3>
                <p className="text-xs text-slate-400">No profile pictures or personal data stored. Complete privacy guaranteed.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <div className="p-2 w-fit rounded-xl bg-teal-500/10 text-teal-400 mb-3">
                  <ZapIcon />
                </div>
                <h3 className="font-semibold text-slate-200 text-sm mb-1">Lightning Fast</h3>
                <p className="text-xs text-slate-400">Powered by WebSockets for zero latency, instant real-time delivery.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <div className="p-2 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 mb-3">
                  <UserGroupIcon />
                </div>
                <h3 className="font-semibold text-slate-200 text-sm mb-1">Global Queue</h3>
                <p className="text-xs text-slate-400">Instantly match with random online users looking for conversations.</p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Chat Window */
          <div className="flex-1 flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden min-h-[500px]">
            {/* Chat Top Bar */}
            <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                    {status === 'matched' ? 'S' : '?'}
                  </div>
                  {status === 'matched' && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-teal-500 border-2 border-slate-900 rounded-full"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">
                    {status === 'matched' ? 'Stranger' : 'Searching for stranger...'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {status === 'matched'
                      ? 'Connected'
                      : status === 'disconnected'
                      ? 'Disconnected'
                      : 'Looking for available partner...'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all active:scale-95 shadow-md shadow-indigo-600/20"
                >
                  <SkipIcon /> Skip / Next
                </button>
                <button
                  onClick={handleStop}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all active:scale-95"
                >
                  <StopIcon /> End
                </button>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 min-h-[300px]">
              {status === 'searching' || status === 'waiting' ? (
                <div className="h-full flex flex-col items-center justify-center my-auto text-slate-400 space-y-3">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-sm font-medium animate-pulse">Matching you with a random stranger...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  You are now connected with a stranger. Say hi!
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isYou = msg.sender === 'You';
                  return (
                    <div key={index} className={`flex flex-col ${isYou ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          isYou
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-lg shadow-indigo-600/10'
                            : 'bg-slate-800 border border-slate-700/60 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                    </div>
                  );
                })
              )}

              {status === 'disconnected' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-red-400 text-xs font-medium my-4">
                  Stranger has disconnected from the chat. Click "Next" to match again.
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={status !== 'matched'}
                placeholder={status === 'matched' ? 'Type your message here...' : 'Waiting for connection...'}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-sm rounded-xl px-4 py-3 outline-none transition-all disabled:opacity-50 placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={status !== 'matched' || !input.trim()}
                className="p-3 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95"
              >
                <SendIcon />
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 px-4 py-4 text-center text-xs text-slate-600">
        Talk with randoms (TWR) &copy; {new Date().getFullYear()} &bull; Anonymous 1-on-1 Chat Platform
      </footer>
    </div>
  );
}
