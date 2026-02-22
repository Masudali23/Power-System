import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Settings, Loader2 } from 'lucide-react';

const SYSTEM_PROMPT = `You are a Power Systems Engineering tutor specializing in Static Modeling and Load Flow analysis. You help students understand:
- Y-Bus and Z-Bus matrix formulation
- Gauss-Seidel, Newton-Raphson, and Fast Decoupled Load Flow methods
- DC Load Flow and sensitivity analysis (PTDF, LODF)
- Tap-changing transformers and their effect on network matrices
- Bus classifications (Slack, PV, PQ)
- Numerical methods for solving non-linear algebraic equations

When answering:
- Use clear mathematical notation
- Provide step-by-step derivations when asked
- Include numerical examples where helpful
- Be concise but thorough
- Use per-unit system conventions`;

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

const GeminiChat: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const saveKey = (key: string) => {
        setApiKey(key);
        localStorage.setItem('gemini_api_key', key);
        setShowSettings(false);
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        if (!apiKey) {
            setShowSettings(true);
            return;
        }

        const userMsg: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const contents = [
                { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
                { role: 'model', parts: [{ text: 'I understand. I am a Power Systems tutor ready to help with load flow analysis and static modeling.' }] },
                ...messages.map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                })),
                { role: 'user', parts: [{ text: input }] }
            ];

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents })
                }
            );

            const data = await res.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
            setMessages(prev => [...prev, { role: 'model', text: reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'model', text: 'Error: Could not reach the Gemini API. Please check your API key and network connection.' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
                title="Ask a doubt"
            >
                <MessageCircle className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[32rem] bg-white dark:bg-zinc-900 border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-sm">Power Systems AI Tutor</h3>
                    <p className="text-[10px] opacity-80">Powered by Gemini</p>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 rounded hover:bg-white/20 transition">
                        <Settings className="w-4 h-4" />
                    </button>
                    <button onClick={() => setOpen(false)} className="p-1.5 rounded hover:bg-white/20 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Settings panel */}
            {showSettings && (
                <div className="p-3 bg-slate-50 dark:bg-zinc-800 border-b">
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">Gemini API Key</label>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                            placeholder="Enter your API key..."
                            className="flex-1 text-xs border rounded px-2 py-1.5 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                        />
                        <button onClick={() => saveKey(apiKey)} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700">
                            Save
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Get your key at ai.google.dev</p>
                </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 dark:text-slate-500 mt-8">
                        <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">Ask any doubt!</p>
                        <p className="text-xs mt-1">Y-Bus, Z-Bus, Load Flow, Transformers...</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-zinc-800 px-4 py-2 rounded-xl rounded-bl-sm">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-t dark:border-zinc-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask about load flow, Y-Bus..."
                        className="flex-1 text-sm border rounded-lg px-3 py-2 dark:bg-zinc-800 dark:border-zinc-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeminiChat;
