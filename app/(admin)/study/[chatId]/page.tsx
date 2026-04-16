"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getSessionHistory, sendSessionMessage } from '@/lib/api';
import { PenLine, Copy, Check, RefreshCcw, Bookmark, Share2, MoreHorizontal, Edit3 } from 'lucide-react'; 
import { ChatInput } from '@/components/study/ChatInput';

// --- LIBRERÍAS DE MARKDOWN Y MATEMÁTICA ---
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

// --- COMPONENTE: BOTÓN DE COPIAR ---
const CopyButton = ({ text, showLabel = false }: { text: string, showLabel?: boolean }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-colors ${showLabel ? 'text-gray-500 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
      {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
      {showLabel && <span className="text-[13px] font-medium hidden sm:inline">Copiar</span>}
    </button>
  );
};

// --- COMPONENTE: RENDERIZADOR DE MARKDOWN ---
const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <div className="text-[15px] leading-relaxed break-words w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            return !inline && match ? (
              <div className="relative group/code my-5 rounded-xl overflow-hidden border border-gray-200 bg-[#1E1E1E] shadow-sm">
                <div className="flex items-center justify-between px-4 py-2 bg-[#2D2D2D] border-b border-gray-700">
                  <span className="text-xs font-mono text-gray-300 uppercase tracking-wider">{match[1]}</span>
                  <CopyButton text={codeString} />
                </div>
                <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, background: 'transparent', padding: '16px', fontSize: '14px' }}>
                  {codeString}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-gray-200" {...props}>{children}</code>
            );
          },
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1.5 text-gray-800">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1.5 text-gray-800">{children}</ol>,
          p: ({ children }) => <p className="mb-4 last:mb-0 text-gray-800">{children}</p>,
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-gray-900 tracking-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5 text-gray-900 tracking-tight">{children}</h2>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// --- COMPONENTE TYPEWRITER (CORREGIDO CON ONUPDATE) ---
const TypewriterText = ({ text, isTyping, onUpdate }: { text: string, isTyping?: boolean, onUpdate?: () => void }) => {
  const [displayedText, setDisplayedText] = useState(isTyping ? '' : text);

  useEffect(() => {
    if (!isTyping) { setDisplayedText(text); return; }
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      // Cada vez que escribimos una letra, avisamos al padre para que scrollee
      if (onUpdate) onUpdate();
      
      if (i >= text.length) clearInterval(interval);
    }, 12); 
    return () => clearInterval(interval);
  }, [text, isTyping, onUpdate]);

  return <MarkdownRenderer content={displayedText} />;
};

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isNew?: boolean; 
}

export default function ChatSessionPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionModel, setSessionModel] = useState('gemini-2.5-flash'); 
  
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref para el fondo del chat
  const scrollContainerRef = useRef<HTMLDivElement>(null); // Ref para el contenedor que scrollea
  const lastScrollY = useRef(0);
  const [isInputVisible, setIsInputVisible] = useState(true);

  // Función para scrollear al fondo
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatId) loadHistory();
  }, [chatId]);

  // Scrollear cuando cambia la lista de mensajes (mensaje nuevo)
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const loadHistory = async () => {
    try {
      const history = await getSessionHistory(chatId as string);
      const formattedHistory = history.map((msg: any) => ({ ...msg, isNew: false }));
      setMessages(formattedHistory);
    } catch (error) {
      console.error("Error cargando el historial:", error);
    }
  };

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return;
    setMessages(prev => [...prev, { role: 'user', content: message, isNew: false }]);
    setIsLoading(true);
    setIsInputVisible(true); 
    try {
      const res = await sendSessionMessage(chatId as string, message, sessionModel);
      setMessages(prev => [...prev, { role: 'model', content: res.content, isNew: true }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', content: '⚠️ Error de conexión.', isNew: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    const scrollHeight = e.currentTarget.scrollHeight;
    const clientHeight = e.currentTarget.clientHeight;

    if (scrollHeight - currentScrollY <= clientHeight + 50) {
      setIsInputVisible(true);
    } else if (lastScrollY.current - currentScrollY > 15) {
      setIsInputVisible(false);
    } else if (currentScrollY - lastScrollY.current > 15) {
      setIsInputVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };

  return (
    <div className="h-full flex flex-col relative bg-white">
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto w-full custom-scrollbar pt-20 md:pt-24 scroll-smooth"
        onScroll={handleScroll}
      >
        <div className="w-full pb-48">
          {messages.map((m, i) => (
            <div key={i} className="w-full border-b border-gray-100/80 hover:bg-gray-50/30 transition-colors">
              <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
                {m.role === 'user' ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-[17px] md:text-[19px] font-semibold text-gray-800 leading-snug whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 w-full">
                    <div className="w-full">
                      {/* PASAMOS LA FUNCIÓN SCROLLTOBOTTOM AL COMPONENTE HIJO */}
                      <TypewriterText 
                        text={m.content} 
                        isTyping={m.isNew} 
                        onUpdate={scrollToBottom} 
                      />
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <CopyButton text={m.content} showLabel={true} />
                      <button className="flex items-center gap-1.5 p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Regenerar">
                        <RefreshCcw size={15} />
                        <span className="text-[13px] font-medium hidden sm:inline">Reintentar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="w-full border-b border-gray-100/80">
              <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
                 <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 rounded-full border border-gray-100 shadow-sm w-fit">
                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                 </div>
              </div>
            </div>
          )}
          {/* Este div es nuestro ancla para el scroll */}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      <button
        onClick={() => setIsInputVisible(true)}
        className={`absolute bottom-4 right-4 md:bottom-6 md:right-8 z-30 p-3.5 bg-gray-900 hover:bg-black text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-95 ${
          !isInputVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        <PenLine size={20} strokeWidth={2.5} />
      </button>

      <footer className={`absolute left-0 w-full px-2 md:px-0 pointer-events-none z-20 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isInputVisible ? 'bottom-2 opacity-100' : '-bottom-48 opacity-0'}`}>
        <div className="max-w-2xl mx-auto pointer-events-auto">
            <ChatInput onSendMessage={handleSend} isLoading={isLoading} model={sessionModel} onModelChange={setSessionModel} />
        </div>
      </footer>
    </div>
  );
}