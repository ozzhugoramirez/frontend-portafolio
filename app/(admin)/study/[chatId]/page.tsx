"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getSessionHistory, sendSessionMessage } from '@/lib/api';
import { Copy, Check, RefreshCcw, Settings, Info, Hash, BookOpen, Sparkles } from 'lucide-react'; 
import { ChatInput } from '@/components/study/ChatInput';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

const CopyButton = ({ text, showLabel = false }: { text: string, showLabel?: boolean }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={handleCopy} className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-colors ${showLabel ? 'text-gray-400 hover:text-gray-800 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      {showLabel && <span className="text-[12px] font-semibold hidden sm:inline">Copiar</span>}
    </button>
  );
};

const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <div className="text-[15px] leading-relaxed break-words w-full text-gray-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            return !inline && match ? (
              <div className="relative group/code my-6 rounded-2xl overflow-hidden border border-gray-200/60 bg-[#1c1c1e] shadow-sm">
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#2c2c2e] border-b border-gray-700">
                  <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">{match[1]}</span>
                  <CopyButton text={codeString} />
                </div>
                <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, background: 'transparent', padding: '20px', fontSize: '13px', lineHeight: '1.5' }}>{codeString}</SyntaxHighlighter>
              </div>
            ) : (<code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-gray-200/60" {...props}>{children}</code>);
          },
          ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-2 marker:text-gray-400">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-2 marker:text-gray-400">{children}</ol>,
          p: ({ children }) => <p className="mb-4 last:mb-0 leading-[1.7]">{children}</p>,
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-8 text-gray-900 tracking-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-6 text-gray-900 tracking-tight">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-medium mb-2 mt-5 text-gray-900">{children}</h3>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// --- TYPEWRITER MEJORADO CON EVENTO onComplete ---
const TypewriterText = ({ text, isTyping, onUpdate, onComplete }: { text: string, isTyping?: boolean, onUpdate?: () => void, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState(isTyping ? '' : text);
  const onUpdateRef = useRef(onUpdate);
  const onCompleteRef = useRef(onComplete);
  
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (!isTyping) { setDisplayedText(text); return; }
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1)); i++;
      if (onUpdateRef.current) onUpdateRef.current();
      
      // Si terminó de escribir, avisa arriba para liberar el estado 'isNew'
      if (i >= text.length) {
        clearInterval(interval);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, 8); // Un poco más veloz para que no tarde tanto
    return () => clearInterval(interval);
  }, [text, isTyping]);

  return <MarkdownRenderer content={displayedText} />;
};

const parseMessageData = (rawContent: string) => {
  let cleanContent = rawContent.replace(/\*\*\[/g, '[').replace(/\]\*\*/g, ']');
  let suggestions: string[] = [];
  let youtubeId: string | null = null;

  const sugMatch = cleanContent.match(/\[SUGERENCIAS:\s*([\s\S]*?)\]/i);
  if (sugMatch) {
    suggestions = sugMatch[1].split('|').map(s => s.replace(/\*/g, '').trim()).filter(s => s.length > 0);
    cleanContent = cleanContent.replace(/\[SUGERENCIAS:\s*([\s\S]*?)\]/i, '');
  }

  const ytMatch = cleanContent.match(/\[YOUTUBE:\s*(https?:\/\/[^\s\]]+)\]/i);
  if (ytMatch) {
    const url = ytMatch[1];
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    if (match && match[2].length === 11) youtubeId = match[2];
    cleanContent = cleanContent.replace(/\[YOUTUBE:\s*(https?:\/\/[^\s\]]+)\]/i, '');
  }

  return { cleanContent: cleanContent.trim(), suggestions, youtubeId };
};

interface ChatMessage { role: 'user' | 'model'; content: string; isNew?: boolean; }

export default function ChatSessionPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionModel, setSessionModel] = useState('gemini-2.5-flash'); 
  
  const [messageCount, setMessageCount] = useState(0);
  const [messageLimit, setMessageLimit] = useState(40);
  const [notebookName, setNotebookName] = useState<string | undefined>(undefined);
  const [activePrompt, setActivePrompt] = useState<string | undefined>(undefined);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); 
  const lastScrollY = useRef(0);
  const [isInputVisible, setIsInputVisible] = useState(true);

  const scrollToBottom = (force = false) => {
    if (!scrollContainerRef.current || !messagesEndRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    if (force || isNearBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: force ? 'smooth' : 'auto' });
    }
  };

  useEffect(() => { if (chatId) loadHistory(); }, [chatId]);
  useEffect(() => { scrollToBottom(true); }, [messages, isLoading]);

  const loadHistory = async () => {
    try {
      const data = await getSessionHistory(chatId as string);
      const formattedHistory = data.messages.map((msg: any) => ({ ...msg, isNew: false }));
      setMessages(formattedHistory);
      if (data.meta) {
        setMessageCount(data.meta.message_count);
        setMessageLimit(data.meta.limit);
        setNotebookName(data.meta.notebook_name);
        setActivePrompt(data.meta.prompt_name);
      }
    } catch (error) { console.error("Error cargando:", error); }
  };

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return;
    setMessages(prev => {
      const resetPrev = prev.map(m => ({ ...m, isNew: false }));
      return [...resetPrev, { role: 'user', content: message, isNew: false }];
    });
    setIsLoading(true); setIsInputVisible(true); 
    
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const res = await sendSessionMessage(chatId as string, message, sessionModel);
      setMessages(prev => {
        const resetPrev = prev.map(m => ({ ...m, isNew: false }));
        return [...resetPrev, { role: 'model', content: res.content, isNew: true }];
      });
      if (res.meta) {
        setMessageCount(res.meta.message_count);
        setMessageLimit(res.meta.limit);
        setNotebookName(res.meta.notebook_name);
        setActivePrompt(res.meta.prompt_name);
      }
    } catch (e) {
      setMessages(prev => [...prev.map(m => ({...m, isNew: false})), { role: 'model', content: '⚠️ Error de conexión.', isNew: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNCIÓN QUE MARCA EL MENSAJE COMO TERMINADO ---
  const handleTypingComplete = (index: number) => {
    setMessages(prev => {
      const newMsgs = [...prev];
      if (newMsgs[index]) newMsgs[index].isNew = false;
      return newMsgs;
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    const scrollHeight = e.currentTarget.scrollHeight;
    const clientHeight = e.currentTarget.clientHeight;
    if (scrollHeight - currentScrollY <= clientHeight + 50) setIsInputVisible(true);
    else if (lastScrollY.current - currentScrollY > 15) setIsInputVisible(false);
    else if (currentScrollY - lastScrollY.current > 15) setIsInputVisible(true);
    lastScrollY.current = currentScrollY;
  };

  const lastMessage = messages[messages.length - 1];
  let latestSuggestions: string[] = [];
  
  // Como 'isNew' ahora pasa a false apenas termina de escribir, las sugerencias van a aparecer al instante
  if (lastMessage && lastMessage.role === 'model' && !lastMessage.isNew) {
    latestSuggestions = parseMessageData(lastMessage.content).suggestions;
  }

  return (
    <div className="h-full flex relative bg-[#fbfbfd] overflow-hidden">
      
      <div className="flex-1 flex flex-col relative h-full bg-white md:m-3 md:rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden z-20">
        
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto w-full custom-scrollbar pt-8 md:pt-12 scroll-smooth" onScroll={handleScroll}>
          <div className="w-full pb-40"> {/* Reducido de 56 a 40 para que no sobre tanto espacio */}
            {messages.map((m, i) => {
              
              let displayContent = m.content;
              if (m.role === 'user') {
                displayContent = displayContent.replace(/\[INSTRUCCIÓN PARA ESTE MENSAJE:.*?\]/g, '').trim();
              }

              const { cleanContent, youtubeId } = parseMessageData(displayContent);

              return (
                <div key={i} className="w-full group">
                  <div className="max-w-3xl mx-auto px-6 md:px-12 py-6">
                    {m.role === 'user' ? (
                      <div className="flex flex-col items-end w-full">
                        <div className="bg-[#f4f4f5] px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[85%] text-[15px] font-medium text-gray-800 leading-snug whitespace-pre-wrap shadow-sm">
                          {cleanContent}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 w-full mt-2">
                        <div className="w-full">
                          {/* Le pasamos el onComplete al typewriter */}
                          <TypewriterText text={cleanContent} isTyping={m.isNew} onUpdate={() => scrollToBottom(false)} onComplete={() => handleTypingComplete(i)} />
                        </div>

                        {!m.isNew && youtubeId && (
                          <div className="mt-4 w-full max-w-xl rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm bg-gray-50">
                            <iframe 
                              width="100%" height="315" src={`https://www.youtube.com/embed/${youtubeId}`} 
                              title="YouTube video player" frameBorder="0" 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              allowFullScreen className="w-full"
                            ></iframe>
                          </div>
                        )}

                        <div className="flex items-center gap-1 mt-2 opacity-50 hover:opacity-100 transition-opacity">
                          <CopyButton text={cleanContent} showLabel={true} />
                          <button className="flex items-center gap-1.5 p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                            <RefreshCcw size={14} />
                            <span className="text-[12px] font-semibold hidden sm:inline">Reintentar</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="w-full">
                <div className="max-w-3xl mx-auto px-6 md:px-12 py-8">
                   <div className="flex items-center gap-1.5 px-4 py-2 bg-[#f4f4f5] rounded-full w-fit">
                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                   </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* INPUT FOOTER: Pegado al margen (bottom-2/4) */}
        <footer className={`absolute left-0 w-full px-4 md:px-8 pointer-events-none z-20 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isInputVisible ? 'bottom-2 md:bottom-4 opacity-100' : '-bottom-48 opacity-0'}`}>
          <div className="max-w-3xl mx-auto pointer-events-auto flex flex-col items-start w-full">
              
              {/* SUGERENCIAS: SCROLLBAR OCULTA */}
              {latestSuggestions.length > 0 && !isLoading && (
                <div className="w-full flex gap-2.5 pb-3 px-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] animate-in slide-in-from-bottom-2 fade-in duration-300">
                  {latestSuggestions.map((sug, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSend(sug)}
                      className="shrink-0 px-4 py-2.5 bg-white/95 backdrop-blur-md border border-gray-200/80 text-gray-700 hover:bg-gray-50 hover:text-blue-600 text-[13px] font-semibold rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-blue-200 transition-all flex items-center gap-2 group"
                    >
                      <Sparkles size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              <div className="w-full bg-white/80 backdrop-blur-xl p-2 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100/50">
                <ChatInput 
                  onSendMessage={handleSend} isLoading={isLoading} model={sessionModel} 
                  onModelChange={setSessionModel} notebookName={notebookName} activePrompt={activePrompt} 
                />
              </div>

              {messageCount > 0 && (
                <div className="w-full flex justify-end px-4 pt-1 pointer-events-none">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${messageCount >= messageLimit ? 'bg-red-50 text-red-600' : messageCount >= messageLimit * 0.8 ? 'bg-orange-50 text-orange-600' : 'text-gray-400'}`}>
                    Memoria: {messageCount}/{messageLimit}
                  </span>
                </div>
              )}
          </div>
        </footer>
      </div>

      {/* PANEL DERECHO */}
      <div className="hidden lg:flex w-[320px] xl:w-[340px] bg-transparent flex-col relative z-10 py-3 pr-3">
        <div className="flex-1 bg-[#f0f0f4] rounded-3xl p-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar border border-gray-200/50 shadow-inner">
          <div className="flex items-center justify-between pb-2">
            <span className="font-semibold text-gray-800 text-[16px] tracking-tight">Detalles</span>
            <button className="p-2 text-gray-400 hover:text-gray-700 bg-white/60 hover:bg-white rounded-full transition-all shadow-sm"><Settings size={16} /></button>
          </div>

          <div className="space-y-2">
            <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Entorno Activo</h4>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/50 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={18} /></div>
                <div>
                  <span className="block text-[11px] font-medium text-gray-400 mb-0.5">Ubicación</span>
                  <span className="text-[14px] font-semibold text-gray-800 leading-tight">{notebookName || 'Espacio General'}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Sparkles size={18} /></div>
                <div>
                  <span className="block text-[11px] font-medium text-gray-400 mb-0.5">Instrucción Base</span>
                  <span className="text-[13px] font-medium text-gray-700 leading-tight">{activePrompt ? activePrompt : 'Sin instrucción específica'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
             <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Rendimiento</h4>
             <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/50 flex flex-col justify-between">
                  <span className="text-[12px] font-medium text-gray-500">Mensajes</span>
                  <span className="text-2xl font-bold text-gray-800 tracking-tight mt-1">{messageCount}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/50 flex flex-col justify-between">
                  <span className="text-[12px] font-medium text-gray-500">Motor IA</span>
                  <span className="text-[14px] font-bold text-gray-800 mt-1 truncate tracking-tight">{sessionModel.split('-').slice(0,2).join(' ')}</span>
                </div>
             </div>
          </div>

          <div className="mt-auto bg-white/60 p-4 rounded-2xl border border-gray-200/50 flex items-start gap-3 backdrop-blur-md">
            <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
            <p className="text-[13px] font-medium text-gray-500 leading-relaxed">Tus notas y el contexto seleccionado alimentan la memoria de este espacio.</p>
          </div>
        </div>
      </div>
    </div>
  );
}