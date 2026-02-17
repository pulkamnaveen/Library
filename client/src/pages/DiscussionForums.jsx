import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const categories = ['General', 'Computer Science', 'Physics', 'Mathematics', 'Biology', 'Engineering', 'Economics', 'Other'];

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const avatarColors = [
  'bg-indigo-600', 'bg-violet-600', 'bg-emerald-600', 'bg-amber-600',
  'bg-rose-600', 'bg-cyan-600', 'bg-pink-600', 'bg-teal-600'
];
const getAvatarColor = (name) => avatarColors[Math.abs([...name || ''].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)) % avatarColors.length];

function DiscussionForums() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [newMessage, setNewMessage] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', category: 'General' });
  const chatEndRef = useRef(null);
  const pollRef = useRef(null);

  const fetchDiscussions = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/discussion/all');
      setDiscussions(res.data.payload || []);
    } catch {
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
    pollRef.current = setInterval(fetchDiscussions, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChannel, discussions]);

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/auth'); return; }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:4000/api/discussion/create', {
        ...newThread, authorId: user._id, authorName: user.name,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setNewThread({ title: '', content: '', category: 'General' });
      setShowNewThread(false);
      fetchDiscussions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create thread');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChannel) return;
    if (!user) { navigate('/auth'); return; }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:4000/api/discussion/${activeChannel}/reply`, {
        content: newMessage, authorId: user._id, authorName: user.name,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setNewMessage('');
      fetchDiscussions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  const filteredDiscussions = filterCategory === 'All'
    ? discussions
    : discussions.filter(d => d.category === filterCategory);

  const activeDiscussion = discussions.find(d => d._id === activeChannel);

  return (
    <div className="flex h-[calc(100vh-56px)] bg-[#0a0a0f] text-white overflow-hidden">
      {/* Left Panel - Channels */}
      <div className="w-80 border-r border-gray-800/60 flex flex-col bg-[#0e0e15]">
        <div className="p-4 border-b border-gray-800/60">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold tracking-tight">Channels</h2>
            {user && (
              <button onClick={() => setShowNewThread(!showNewThread)}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 rounded-md transition font-medium">
                {showNewThread ? 'Cancel' : '+ New'}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {['All', ...categories].map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)}
                className={`px-2 py-0.5 rounded text-[11px] transition font-medium ${
                  filterCategory === cat
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* New Thread Form */}
        {showNewThread && (
          <form onSubmit={handleCreateThread} className="p-3 border-b border-gray-800/60 bg-[#12121a]">
            <input type="text" placeholder="Thread title" value={newThread.title}
              onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
              className="w-full p-2 mb-2 bg-[#1a1a25] border border-gray-700/50 rounded-md text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/50" required />
            <select value={newThread.category} onChange={(e) => setNewThread({ ...newThread, category: e.target.value })}
              className="w-full p-2 mb-2 bg-[#1a1a25] border border-gray-700/50 rounded-md text-sm text-gray-300 outline-none">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea placeholder="Start the conversation..." value={newThread.content}
              onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
              className="w-full p-2 mb-2 bg-[#1a1a25] border border-gray-700/50 rounded-md text-sm text-white placeholder-gray-600 outline-none resize-none h-16 focus:border-indigo-500/50" required />
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium py-1.5 rounded-md transition">
              Create Thread
            </button>
          </form>
        )}

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredDiscussions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-gray-600 text-sm">No threads yet</p>
              <p className="text-gray-700 text-xs mt-1">Start a new discussion!</p>
            </div>
          ) : (
            filteredDiscussions.map((disc) => (
              <div key={disc._id} onClick={() => setActiveChannel(disc._id)}
                className={`px-4 py-3 cursor-pointer border-b border-gray-800/30 transition ${
                  activeChannel === disc._id
                    ? 'bg-indigo-600/10 border-l-2 border-l-indigo-500'
                    : 'hover:bg-[#14141e] border-l-2 border-l-transparent'
                }`}>
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-full ${getAvatarColor(disc.authorName)} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5`}>
                    {getInitials(disc.authorName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-medium truncate text-gray-200">{disc.title}</h4>
                      <span className="text-[10px] text-gray-600 flex-shrink-0">{getTimeAgo(disc.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{disc.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800/50 text-gray-500">{disc.category}</span>
                      {disc.replies?.length > 0 && (
                        <span className="text-[10px] text-gray-600">{disc.replies.length} {disc.replies.length === 1 ? 'reply' : 'replies'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col">
        {!activeChannel ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
            <svg className="w-16 h-16 mb-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm font-medium text-gray-500">Select a thread to start chatting</p>
            <p className="text-xs text-gray-700 mt-1">or create a new thread from the sidebar</p>
          </div>
        ) : activeDiscussion ? (
          <>
            {/* Chat Header */}
            <div className="px-5 py-3 border-b border-gray-800/60 bg-[#0e0e15]/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">{activeDiscussion.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-gray-500">Started by {activeDiscussion.authorName}</span>
                    <span className="text-[11px] text-gray-700">·</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">{activeDiscussion.category}</span>
                    <span className="text-[11px] text-gray-700">·</span>
                    <span className="text-[11px] text-gray-600">{(activeDiscussion.replies?.length || 0) + 1} messages</span>
                  </div>
                </div>
                <button onClick={() => setActiveChannel(null)}
                  className="text-gray-600 hover:text-gray-400 transition text-xs px-2 py-1 rounded hover:bg-gray-800/50">
                  Close
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Original Post */}
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full ${getAvatarColor(activeDiscussion.authorName)} flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0`}>
                  {getInitials(activeDiscussion.authorName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{activeDiscussion.authorName}</span>
                    <span className="text-[10px] text-gray-600">{getTimeAgo(activeDiscussion.createdAt)}</span>
                  </div>
                  <div className="bg-[#14141e] rounded-lg rounded-tl-sm px-4 py-3 border border-gray-800/40">
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{activeDiscussion.content}</p>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {activeDiscussion.replies?.map((reply, idx) => {
                const isOwn = user && reply.authorId === user._id;
                return (
                  <div key={idx} className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-9 h-9 rounded-full ${getAvatarColor(reply.authorName)} flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0`}>
                      {getInitials(reply.authorName)}
                    </div>
                    <div className={`flex-1 min-w-0 ${isOwn ? 'flex flex-col items-end' : ''}`}>
                      <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm font-semibold text-white">{reply.authorName}</span>
                        <span className="text-[10px] text-gray-600">{getTimeAgo(reply.createdAt)}</span>
                      </div>
                      <div className={`rounded-lg px-4 py-3 max-w-[80%] ${
                        isOwn
                          ? 'bg-indigo-600/20 border border-indigo-500/20 rounded-tr-sm'
                          : 'bg-[#14141e] border border-gray-800/40 rounded-tl-sm'
                      }`}>
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-5 py-3 border-t border-gray-800/60 bg-[#0e0e15]/80">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
                    {getInitials(user.name)}
                  </div>
                  <input type="text" value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    placeholder="Type your message..."
                    className="flex-1 bg-[#14141e] border border-gray-800/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 transition" />
                  <button onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
                    Send
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <button onClick={() => navigate('/auth')} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition">
                    Sign in to join the conversation
                  </button>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default DiscussionForums;
