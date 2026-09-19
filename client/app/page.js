'use client';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

let socket;

export default function Home() {
  const [status, setStatus] = useState('idle');
  const [roomId, setRoomId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000');

    socket.on('waiting', () => setStatus('waiting'));
    socket.on('chat_matched', ({ roomId }) => {
      setRoomId(roomId);
      setStatus('matched');
      setMessages([]);
    });

    socket.on('receive_message', ({ message }) => {
      setMessages((prev) => [...prev, { sender: 'Stranger', text: message }]);
    });

    socket.on('partner_disconnected', () => {
      setStatus('disconnected');
    });

    return () => socket.disconnect();
  }, []);

  const handleStart = () => {
    setStatus('searching');
    socket.emit('join_queue');
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || status !== 'matched') return;
    socket.emit('send_message', { roomId, message: input });
    setMessages((prev) => [...prev, { sender: 'You', text: input }]);
    setInput('');
  };

  const handleNext = () => {
    socket.emit('leave_room');
    handleStart();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '16px' }}>
      <h1>Anonymous Random Chat</h1>

      {status === 'idle' && <button onClick={handleStart} style={{ padding: '10px 20px', fontSize: '16px' }}>Start Chatting</button>}
      {status === 'searching' || status === 'waiting' ? <p>Searching for a random partner...</p> : null}

      {(status === 'matched' || status === 'disconnected') && (
        <div>
          <div style={{ height: '350px', border: '1px solid #ccc', overflowY: 'scroll', padding: '10px', marginBottom: '10px' }}>
            {messages.map((m, idx) => (
              <div key={idx}><strong>{m.sender}: </strong>{m.text}</div>
            ))}
            {status === 'disconnected' && <div style={{ color: 'red', marginTop: '10px' }}>Stranger has left the chat.</div>}
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== 'matched'}
              placeholder={status === 'matched' ? 'Type a message...' : 'Chat ended'}
              style={{ flex: 1, padding: '8px' }}
            />
            <button type="submit" disabled={status !== 'matched'}>Send</button>
            <button type="button" onClick={handleNext}>Next Chat</button>
          </form>
        </div>
      )}
    </div>
  );
}
