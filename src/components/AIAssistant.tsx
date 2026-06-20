import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, AlertTriangle, RefreshCw, Languages, Landmark } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content: "Habari! Welcome to InkaHealth. I am your AI Clinical Assistant. Feed me patient symptoms to recommend scans or understand diagnostic imaging options. \n\nI can translate medical conditions between English and Swahili dynamically!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue("");

    const newMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      // Build history for API
      const apiMessages = messages.map((m) => ({
        role: m.role,
        content: m.content
      })).concat({ role: "user", content: userText });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!response.ok) {
        throw new Error("Failed to contact clinician cloud");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: "assistant",
          content: "Samahani! There was an issue processing your query through Tanzanian cellular networks. Please speak directly with a licensed MCT clinician.\n\n⚠️ Clinical Decision Support Suggestion: This is a generated triage suggestion which must be verified and prescribed by a licensed MCT practitioner before booking scans.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPresetPrompt = (promptText: string) => {
    setInputValue(promptText);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50" id="ai-activation">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl transition-all hover:bg-emerald-500 hover:scale-105 active:scale-95"
          title="Clinical Triage Support"
        >
          {isOpen ? <X className="h-6 w-6" id="ai-icon-close" /> : <MessageSquare className="h-6 w-6" id="ai-icon-open" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-40 flex h-[580px] w-[400px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
            id="ai-widget-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-emerald-950 px-4 py-3 border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-emerald-600 p-1.5 text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Inka Health Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] text-emerald-300 font-mono uppercase tracking-wider">TMDA/PDPC Compliant</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-emerald-900 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Warning Sticky Banner */}
            <div className="bg-amber-950/40 p-2.5 border-b border-amber-900/60 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-200 leading-tight">
                <strong>TMDA Regulated:</strong> AI suggestions are purely for Clinical Decision Support. All clinical scans require doctor's referral authorization.
              </p>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs custom-scrollbar">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2.5 shadow-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-slate-800 text-slate-100 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.content}</p>
                    <span className={`block text-[8px] mt-1 text-right ${m.role === "user" ? "text-emerald-200" : "text-slate-400"}`}>
                      {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-slate-800 px-3 py-2.5 text-slate-400 flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
                    <span>Analyzing symptoms...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Preset Suggestions */}
            <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 space-y-1.5">
              <div className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">Quick Presets:</div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => loadPresetPrompt("Suggest a scan for lower back pain radiating down left leg")}
                  className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] px-2 py-1 border border-slate-700/60"
                >
                  <Bot className="h-2.5 w-2.5 text-emerald-400" /> Back Pain Scan
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetPrompt("Translate 'Brain MRI scan' and 'Chest CT scan' into Swahili")}
                  className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] px-2 py-1 border border-slate-700/60"
                >
                  <Languages className="h-2.5 w-2.5 text-blue-400" /> translate Swahili
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetPrompt("Which Tanzanian hospitals offer the cheapest MRI services at off-peak hours?")}
                  className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] px-2 py-1 border border-slate-700/60"
                >
                  <Landmark className="h-2.5 w-2.5 text-teal-400" /> Off-Peak Savings
                </button>
              </div>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-850 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Eleza dalili za ugonjwa hapa (Swahili/English)..."
                className="flex-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                id="ai-chat-input"
              />
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white p-2 flex items-center justify-center shrink-0 transition-transform active:scale-95"
                id="ai-send-btn"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
