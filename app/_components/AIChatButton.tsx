"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Cat, Loader2, MessageCircleHeart } from "lucide-react";
import { askChatbot } from "@/actions/chatbot";
import { toast } from "sonner";

export default function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Meow! Chào bạn 👋 Cần mình giúp gì hông? ✨",
    },
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await askChatbot(userMessage, messages);

      if (result.error) {
        toast.error(result.error);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "😿 Huhu lỗi rồi sen ơi." },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.text },
        ]);
      }
    } catch (error) {
      toast.error("Lỗi kết nối.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. CỬA SỔ CHAT (Phiên bản Compact) */}
      <div
        className={`fixed bottom-20 right-5 w-[320px] bg-white rounded-3xl shadow-2xl border-2 border-indigo-50 z-[9999] transition-all duration-300 transform origin-bottom-right flex flex-col overflow-hidden font-sans
        ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-50 opacity-0 translate-y-10 pointer-events-none"
        }`}
        // 👇 GIẢM CHIỀU CAO: Từ 550px xuống 450px. Thêm max-height để không bị tràn màn hình nhỏ
        style={{ height: "450px", maxHeight: "80vh" }}
      >
        {/* Header Nhỏ gọn hơn */}
        <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 flex items-center justify-between text-white relative">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-md text-white">
              <Cat size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Trợ lý Mèo OneOne</h3>
              <p className="text-[10px] text-indigo-100 opacity-90 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span>
                Sẵn sàng
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-1.5 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Chat */}
        <div
          className="flex-1 p-3 overflow-y-auto bg-indigo-50/30 space-y-3 scroll-smooth text-[13px]"
          ref={scrollRef}
        >
          {messages.map((msg, idx) => {
            const isBot = msg.role === "assistant";
            return (
              <div
                key={idx}
                className={`flex items-end gap-2 ${
                  isBot ? "justify-start" : "justify-end"
                }`}
              >
                {isBot && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white shadow-sm mb-1 flex-shrink-0">
                    <Cat size={12} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] px-3 py-2 shadow-sm relative leading-relaxed
                  ${
                    isBot
                      ? "bg-white text-slate-700 rounded-2xl rounded-bl-none border border-indigo-100"
                      : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl rounded-br-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}

          {/* Loading Animation */}
          {isLoading && (
            <div className="flex items-end gap-2">
              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center mb-1">
                <Cat size={12} className="text-violet-400" />
              </div>
              <div className="bg-white px-3 py-2 rounded-2xl rounded-bl-none shadow-sm border border-indigo-50">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Input */}
        <div className="p-2 bg-white border-t border-indigo-50">
          <form
            onSubmit={handleSend}
            className="bg-slate-50 border border-slate-200 rounded-full p-1 pl-3 flex items-center gap-2 focus-within:ring-2 focus-within:ring-violet-200 transition-all"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi mình đi..."
              className="flex-1 bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 outline-none min-w-0"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-8 h-8 bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-sm flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} className="ml-0.5" />
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 2. NÚT KÍCH HOẠT (Nhỏ lại xíu) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-5 right-5 w-12 h-12 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 z-[9999] hover:scale-110 active:scale-90
          ${
            isOpen
              ? "bg-slate-800 rotate-90"
              : "bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-indigo-500 animate-[bounce_3s_infinite]"
          }
        `}
      >
        {isOpen ? (
          <X size={20} />
        ) : (
          <div className="relative">
            <MessageCircleHeart size={24} />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-300"></span>
            </span>
          </div>
        )}
      </button>
    </>
  );
}
