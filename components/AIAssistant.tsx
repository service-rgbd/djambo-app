import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, ShieldCheck } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';

const djambaAssistantLogo = new URL('../assets/icone-DJAMBA.webp', import.meta.url).href;

const quickPrompts = [
  'Comment ajouter un client rapidement ?',
  'Comment preparer un contrat proprement ?',
  'Quels contrats demandent mon attention ?',
  'Comment reduire les couts IA du chatbot ?',
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      text: 'Bonjour. Je suis Djamba. Je peux vous aider sur les contrats, les clients, les vehicules et les actions prioritaires de votre espace Djambo.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasConversationStarted = messages.some((message) => message.role === 'user');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const submitPrompt = async (prompt: string) => {
    if (!prompt.trim() || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversation = [...messages, userMessage].slice(-8).map(({ role, text }) => ({ role, text }));
      const responseText = await sendMessageToGemini(conversation);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: responseText,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "Le conseiller IA n'est pas disponible pour le moment. Reessayez dans un instant.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    await submitPrompt(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 flex h-[min(82vh,620px)] min-h-0 w-[min(94vw,25rem)] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.16)] animate-fade-in-up">
          <div className="shrink-0 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#38bdf8_100%)] p-4 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/15 p-1.5 backdrop-blur">
                <img src={djambaAssistantLogo} alt="Djamba" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">Djamba</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-sky-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse"></span>
                  Assistant operationnel pour clients, contrats et flotte
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 transition-colors hover:bg-white/15"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sky-50">
                Reponses courtes
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sky-50">
                Contrats et flotte
              </div>
            </div>
          </div>

          <div className="shrink-0 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Djamba repond localement aux questions simples et n'interroge OpenRouter que lorsque c'est utile.
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,#eff6ff_0%,#f8fafc_28%,#f8fafc_100%)] p-4">
            <div className="space-y-4">
            {!hasConversationStarted && (
              <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">Questions rapides</p>
                <p className="mt-2 text-sm text-slate-500">Choisissez une question pour demarrer rapidement, puis la conversation prendra toute la place.</p>
                <div className="mt-4 grid gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void submitPrompt(prompt)}
                      disabled={isLoading}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </section>
            )}
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[84%] rounded-[22px] p-3 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'rounded-br-md bg-slate-950 text-white' 
                      : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-[22px] rounded-bl-md border border-slate-200 bg-white p-3 shadow-sm">
                  <Sparkles size={16} className="animate-spin text-sky-500" />
                  <span className="text-xs text-slate-500">Analyse utile en cours...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-100 bg-white p-3">
            <div className="mb-2 flex items-center gap-2 px-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              <ShieldCheck size={12} />
              Cle protegee cote backend
            </div>
            <div className="flex items-end gap-2 rounded-[22px] border border-slate-200 bg-slate-100 px-3 py-2 transition-all focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Question sur vos contrats, clients ou vehicules..."
                className="min-w-0 flex-1 bg-transparent border-none px-1 py-1 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_70%,#38bdf8_100%)] p-4 text-white shadow-[0_18px_40px_rgba(29,78,216,0.32)] transition-all hover:scale-105 active:scale-95"
        >
          <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white/15 p-1">
            <img src={djambaAssistantLogo} alt="Djamba" className="h-full w-full object-contain" />
          </span>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium text-sm">
            Djamba
          </span>
        </button>
      )}
    </div>
  );
};