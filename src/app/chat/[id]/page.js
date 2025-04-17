'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function ChatRoom() {
  const { id } = useParams();
  const [username, setUsername] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [chatUrl, setChatUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [users, setUsers] = useState([]);
  const channelRef = useRef(null);
  const fileInputRef = useRef(null);
  const sharedMessages = useRef([]);
  const sharedUsers = useRef([]);

  useEffect(() => {
    const savedName = localStorage.getItem(`chat-username-${id}`);
    if (savedName) {
      setUsername(savedName);
      setNameSubmitted(true);

      const savedMessages = localStorage.getItem(`chat-messages-${id}`);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        sharedMessages.current = parsed;
        setMessages(parsed);
      }

      setTimeout(() => {
        const channel = new BroadcastChannel(`chat-${id}`);
        channel.postMessage({ type: 'JOIN', payload: savedName });
        channel.close();
      }, 500);
    }
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      setChatUrl(`${window.location.origin}/chat/${id}`);

      const channel = new BroadcastChannel(`chat-${id}`);
      channelRef.current = channel;

      const handleUnload = () => {
        if (username) {
          channel.postMessage({ type: 'LEAVE', payload: username });
        }
      };

      window.addEventListener('beforeunload', handleUnload);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          handleUnload();
        }
      });

      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};

        if (type === 'JOIN') {
          if (!sharedUsers.current.find((u) => u.name === payload)) {
            sharedUsers.current.push({ name: payload, status: 'online' });
          } else {
            sharedUsers.current = sharedUsers.current.map((u) =>
              u.name === payload ? { ...u, status: 'online' } : u
            );
          }
          setUsers([...sharedUsers.current]);

          if (payload !== username) {
            channel.postMessage({ type: 'SYNC_STATE', payload: { users: sharedUsers.current, messages: sharedMessages.current } });
          }
        } else if (type === 'LEAVE') {
          sharedUsers.current = sharedUsers.current.map((u) =>
            u.name === payload ? { ...u, status: 'offline' } : u
          );
          setUsers([...sharedUsers.current]);
        } else if (type === 'MESSAGE') {
          sharedMessages.current.push(payload);
          const updatedMessages = [...sharedMessages.current];
          setMessages(updatedMessages);
          localStorage.setItem(`chat-messages-${id}`, JSON.stringify(updatedMessages));
        } else if (type === 'SYNC_STATE') {
          sharedUsers.current = payload.users;
          sharedMessages.current = payload.messages;
          setUsers([...sharedUsers.current]);
          setMessages([...sharedMessages.current]);
        }
      };

      return () => {
        handleUnload();
        channel.close();
        window.removeEventListener('beforeunload', handleUnload);
        document.removeEventListener('visibilitychange', handleUnload);
      };
    }
  }, [id, username]);

  const handleJoin = () => {
    if (username.trim()) {
      setNameSubmitted(true);
      localStorage.setItem(`chat-username-${id}`, username);
      const newUser = { name: username, status: 'online' };
      sharedUsers.current.push(newUser);
      setUsers([...sharedUsers.current]);
      channelRef.current?.postMessage({ type: 'JOIN', payload: username });
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
      sharedMessages.current.push(message);
      const updatedMessages = [...sharedMessages.current];
      setMessages(updatedMessages);
      localStorage.setItem(`chat-messages-${id}`, JSON.stringify(updatedMessages));
      channelRef.current?.postMessage({ type: 'MESSAGE', payload: message });
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-slate-800 font-sans">
        <div className="text-center mb-4">
          <h2 className="text-4xl font-bold mb-4">Your support chat link</h2>
          <div className="mt-2 text-sm flex items-center justify-center gap-2">
            <code className="bg-white px-3 py-1 rounded border border-slate-300 text-sm text-slate-700">{chatUrl}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(chatUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-xl hover:text-indigo-600"
              title="Copy link"
            >
              📋
            </button>
          </div>
          {copied && (
            <div className="mt-2 text-green-600 text-sm transition-opacity duration-300">
              ✅ Link copied!
            </div>
          )}
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          placeholder="Enter your name"
          className="border border-slate-300 rounded px-4 py-2 mb-4 w-64"
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
    <div className="min-h-screen flex flex-col p-4 bg-slate-50 text-slate-800 font-sans items-center">
      <div className="w-full max-w-screen-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Support Chat by {username}: {id}</h2>
          <button
            onClick={() => {
              localStorage.removeItem(`chat-username-${id}`);
              window.location.reload();
            }}
            className="text-sm text-slate-500 hover:text-red-600 px-3 py-1"
          >
            Leave
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">Participants</h3>
          <ul className="flex flex-wrap gap-4">
            {users.map((user) => (
              <li key={user.name} className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full inline-block ${user.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`${user.status === 'offline' ? 'text-slate-400 line-through' : ''}`}>{user.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 border border-slate-300 rounded p-4 mb-4 overflow-y-auto bg-white max-h-[60vh] min-h-[30vh] space-y-2">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.name === username ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`px-4 py-2 rounded-xl max-w-xs ${msg.name === username ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-200 text-slate-900 rounded-bl-none'}`}>
                <p className="text-sm font-semibold mb-1">{msg.name}</p>
                {msg.text && <p>{msg.text}</p>}
                {msg.file && (
                  <div className="mt-2">
                    <a
                      href={msg.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-500 underline"
                    >
                      📎 {msg.fileName || 'View Attachment'}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 border border-slate-300 rounded px-3 py-2"
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
    </div>
  );
}
