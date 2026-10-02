import React, { useState } from 'react';
import { X, Send, Bot, Sparkles, User, RefreshCw } from 'lucide-react';
import { Currency } from '../types';

interface CoPilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioType: string;
  currentPlan: any;
  currency: Currency;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const CoPilotDrawer: React.FC<CoPilotDrawerProps> = ({
  isOpen,
  onClose,
  scenarioType,
  currentPlan,
  currency,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Hello! I'm your PocketSmart Co-Pilot for **${scenarioType}**. I have analyzed your current budget plan. Would you like to adjust budget weights, find lower-cost alternatives on Amazon/IKEA/Swiggy, or swap out specific items?`,
      time: 'Just now',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!inputVal.trim() || loading) return;

    const userText = inputVal.trim();
    const newMsg: Message = {
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const res = await fetch('/api/recommendations/tune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioType,
          currentPlan,
          userPrompt: userText,
          currency,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I couldn't reach the server right now. Try tweaking individual parameters on the left!",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputVal(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">PocketSmart Co-Pilot</h3>
              <p className="text-[11px] text-slate-400">Tuning {scenarioType} in real-time</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {m.text}
                <div
                  className={`text-[9px] mt-1 ${
                    m.sender === 'user' ? 'text-emerald-200' : 'text-slate-500'
                  }`}
                >
                  {m.time}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Co-Pilot is optimizing budget trade-offs...</span>
            </div>
          )}
        </div>

        {/* Quick prompt suggestions */}
        <div className="p-2.5 bg-slate-950/80 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto">
          {[
            'Cut 15% budget',
            'Find cheaper Amazon alternatives',
            'Maximize aesthetics under cap',
            'Swap items for modular picks',
          ].map((txt) => (
            <button
              key={txt}
              onClick={() => handleQuickPrompt(txt)}
              className="text-[10px] px-2 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-300 whitespace-nowrap shrink-0 transition-colors"
            >
              {txt}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask to adjust prices, platforms, items..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            onClick={handleSend}
            disabled={loading || !inputVal.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
