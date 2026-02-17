import React, { useState } from "react";

const faqData = [
  { q: "How do I search for resources?", a: "Use the search bar in the navigation or go to the Advanced Search page for detailed filtering options." },
  { q: "How do I request new materials?", a: "Go to the Request Materials page from the sidebar and fill out the request form with the material details." },
  { q: "What types of resources are available?", a: "We offer research papers, books, textbooks, theses, and conference papers across multiple categories." },
  { q: "How do I access restricted resources?", a: "Some resources are restricted to students or faculty. Make sure you are logged in with the appropriate account." },
  { q: "How do I join the discussion forums?", a: "Navigate to the Discussion Forums page from the sidebar. You need to be logged in to post messages." },
];

const ChatBox = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I can help you navigate the library. Choose a question below or type your own." },
  ]);
  const [input, setInput] = useState("");

  const handleFaq = (item) => {
    setMessages((prev) => [...prev, { from: "user", text: item.q }, { from: "bot", text: item.a }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { from: "user", text: q }]);
    const match = faqData.find((f) => q.toLowerCase().includes(f.q.toLowerCase().split(" ").slice(0, 3).join(" ")));
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: match ? match.a : "I'm not sure about that. Try browsing the FAQ questions or contact admin for help." },
      ]);
    }, 500);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center justify-center transition z-50">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-80 bg-[#12121a] border border-gray-800/40 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden" style={{ height: 420 }}>
      <div className="px-4 py-3 border-b border-gray-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Library Assistant</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
              <span className="text-[10px] text-gray-500">Online</span>
            </div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
              msg.from === "user"
                ? "bg-indigo-600 text-white rounded-br-sm"
                : "bg-[#1a1a25] text-gray-300 rounded-bl-sm"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="px-3 pb-2">
        <div className="flex flex-wrap gap-1 mb-2">
          {faqData.slice(0, 3).map((f, i) => (
            <button key={i} onClick={() => handleFaq(f)}
              className="text-[9px] px-2 py-1 rounded-full border border-gray-800/60 text-gray-500 hover:text-indigo-400 hover:border-indigo-500/30 transition">
              {f.q.slice(0, 30)}...
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-xs text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 transition" />
          <button onClick={handleSend}
            className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
