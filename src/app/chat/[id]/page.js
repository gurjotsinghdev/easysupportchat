'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

let socket;

export default function ChatRoom() {
  const { id } = useParams();
  const [username, setUsername] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem(`chat-username-${id}`);
    if (saved) {
      setUsername(saved);
      setNameSubmitted(true);
    }

    if (!socket) {
      socket = io({
        path: '/api/socket_io',
      });

      socket.on('connect', () => {
        if (saved) {
          socket.emit('join-room', { roomId: id, name: saved });
        }
      });

      socket.on('message-history', (msgs) => {
        setMessages(msgs);
        localStorage.setItem(`chat-messages-${id}`, JSON.stringify(msgs));
      });

      socket.on('chat-message', (msg) => {
        setMessages((prev) => {
          const updated = [...prev, msg];
          localStorage.setItem(`chat-messages-${id}`, JSON.stringify(updated));
          return updated;
        });
      });
    }
  }, [id]);

  const handleJoin = () => {
    if (username.trim()) {
      setNameSubmitted(true);
      localStorage.setItem(`chat-username-${id}`, username);
      socket.emit('join-room', { roomId: id, name: username });
    }
  };

  const sendMessage = () => {
    if (input.trim() || file) {
      const message = {
        name: username,
        text: input,
        file: file ? URL.createObjectURL(file) : null,
        fileName: file?.name || null,
      };
      setMessages((prev) => {
        const updated = [...prev, message];
        localStorage.setItem(`chat-messages-${id}`, JSON.stringify(updated));
        return updated;
      });
      socket.emit('chat-message', { roomId: id, message });
      setInput('');
      setFile(null);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  if (!nameSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your name"
          className="border border-gray-300 rounded px-4 py-2 mb-4 w-64"
        />
        <button
          onClick={handleJoin}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
        >
          Join Chat
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-screen-md mx-auto">
      <div className="flex-1 border border-gray-300 rounded p-4 mb-4 overflow-y-auto bg-white max-h-[60vh] min-h-[30vh] space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.name === username ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-xl max-w-xs ${
                msg.name === username
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-200 text-slate-900 rounded-bl-none'
              }`}
            >
              <p className="text-sm font-semibold mb-1">{msg.name}</p>
              {msg.text && <p>{msg.text}</p>}
              {msg.file && (
                <div className="mt-2">
                  <a
                    href={msg.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    📎 {msg.fileName || 'View Attachment'}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          placeholder="Type your message..."
        />
        <button
          onClick={handleFileClick}
          className="text-2xl px-2 py-2 hover:text-indigo-600"
          title="Attach file"
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
