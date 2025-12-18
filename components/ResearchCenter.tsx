import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ResearchResult, MindMapNode } from '../types';
import { researchTopic, researchWithImages } from '../services/groqService';
import { addToHistory } from '../services/historyService';
import { SearchIcon, PlusIcon, CrossIcon, NoteIcon, GlobeIcon, BookIcon } from './Icons';

// --- Icons ---
const ImageIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
  </svg>
);

const QuickPrompts = [
  "Pak-US Relations",
  "Climate Change Policy",
  "CPEC Phase II",
  "Constitutional History",
  "Economic Crisis",
  "Foreign Policy 2024"
];

// --- Mind Map Component ---
const MindMapTree: React.FC<{ node: MindMapNode; depth?: number }> = ({ node, depth = 0 }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`flex flex-col relative ${depth > 0 ? 'ml-6 md:ml-12' : ''} transition-all duration-300`}>
      {/* Connecting Line */}
      {depth > 0 && (
        <div className="absolute -left-6 md:-left-12 top-8 w-6 md:w-12 h-0.5 bg-pakGreen-200/50" />
      )}
      {depth > 0 && (
        <div className="absolute -left-6 md:-left-12 -top-4 h-[calc(100%+2rem)] w-0.5 bg-pakGreen-200/50" />
      )}

      <div className="group relative z-10 my-2">
        <div 
          onClick={() => setExpanded(!expanded)}
          className={`
            cursor-pointer rounded-2xl p-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg
            ${depth === 0 
              ? 'bg-gradient-to-br from-pakGreen-600 to-pakGreen-800 text-white shadow-pakGreen-900/20 shadow-xl border-none' 
              : 'bg-white border border-gray-100 shadow-sm hover:border-pakGreen-300'
            }
          `}
        >
          <div className="flex items-center justify-between gap-3">
            <h4 className={`font-bold font-serif ${depth === 0 ? 'text-xl' : 'text-gray-800 text-lg'}`}>
              {node.label}
            </h4>
            {node.children && node.children.length > 0 && (
               <span className={`text-xs p-1 rounded-full transition-transform duration-300 ${expanded ? 'rotate-180' : ''} ${depth === 0 ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
               </span>
            )}
          </div>
          
          {expanded && node.details && (
            <p className={`text-sm mt-2 leading-relaxed font-serif animate-in fade-in slide-in-from-top-1 duration-300 ${depth === 0 ? 'text-white/90' : 'text-gray-600'}`}>
              {node.details}
            </p>
          )}
        </div>
      </div>

      <div className={`transition-all duration-500 ease-in-out overflow-hidden pl-2 ${expanded ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0'}`}>
        {node.children?.map((child, i) => (
          <div key={child.id} className="relative">
             {/* Vertical line connector fix for last child */}
             {depth === 0 && i !== (node.children?.length || 0) - 1 && (
                <div className="absolute left-6 md:left-12 top-8 bottom-0 w-0.5 bg-pakGreen-200/50 -z-10" />
             )}
             <MindMapTree node={child} depth={depth + 1} />
          </div>
        ))}
      </div>
    </div>
  );
};

interface Props {
  onSaveNote: (title: string, content: string) => void;
  onHistory: () => void;
}

const ResearchCenter: React.FC<Props> = ({ onSaveNote, onHistory }) => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [viewMode, setViewMode] = useState<'ANALYSIS' | 'MINDMAP'>('ANALYSIS');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6)); // Compress to JPEG with 60% quality
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const compressedImages = await Promise.all(
        files.map(file => compressImage(file))
      );
      setImages(prev => [...prev, ...compressedImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleResearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim() && images.length === 0) return;

    setIsResearching(true);
    setResult(null);

    try {
      let res: ResearchResult | null = null;
      if (images.length > 0) {
        res = await researchWithImages(searchQuery || "Analyze these images", images);
      } else {
        res = await researchTopic(searchQuery);
      }
      setResult(res);
      
      if (res) {
        addToHistory(searchQuery || "Image Analysis", 'research', res);
      }

      if (res?.mindMap) {
        setViewMode('MINDMAP');
      }
    } catch (error) {
      console.error("Research failed:", error);
    } finally {
      setIsResearching(false);
    }
  };

  // Auto-scroll to top when new result arrives
  useEffect(() => {
    if (result && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [result]);

  return (
    <div className="h-full flex flex-col bg-gray-50 relative overflow-hidden">
      
      {/* Top Navigation Bar */}
      <div className="bg-white px-4 md:px-8 py-4 shadow-sm border-b border-gray-100 z-20 flex justify-between items-center sticky top-0">
         <h1 className="text-xl font-bold font-serif flex items-center gap-2 text-gray-900">
           <span className="bg-pakGreen-100 p-1.5 rounded-lg text-pakGreen-700"><SparklesIcon className="w-5 h-5"/></span>
           CSS Research Lab
         </h1>
         <div className="flex gap-4 items-center">
            <button 
              onClick={onHistory}
              className="text-sm font-medium text-gray-500 hover:text-pakGreen-600 transition-colors flex items-center gap-1"
            >
              <BookIcon className="w-4 h-4" /> History
            </button>
            {result && (
              <button 
                onClick={() => { setResult(null); setQuery(''); setImages([]); }}
                className="text-sm font-medium text-gray-500 hover:text-pakGreen-600 transition-colors flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4 rotate-45" /> New Search
              </button>
            )}
         </div>
      </div>

      {/* Main Content Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative scroll-smooth">
        
        {/* Background Decorative Elements */}
        {!result && (
           <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
              <div className="absolute top-20 left-10 w-64 h-64 bg-pakGreen-100 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
              <div className="absolute top-20 right-10 w-64 h-64 bg-yellow-50 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-pink-50 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000"></div>
           </div>
        )}

        <div className="relative z-10 flex flex-col items-center justify-start min-h-full px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto w-full">
          
          {/* Hero Section (Visible when no result) */}
          {!result && !isResearching && (
            <div className="text-center mb-6 md:mb-10 w-full animate-fade-in-up">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-3 md:mb-4 tracking-tight">
                Explore Knowledge
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-2xl mx-auto mb-6 md:mb-8 font-light px-2">
                Deep dive into CSS topics with AI-powered analysis, mind maps, and comprehensive study notes.
              </p>
            </div>
          )}

          {/* Search Bar Container */}
          <div className={`w-full transition-all duration-500 ease-in-out ${result ? 'mb-6 md:mb-8' : 'mb-8 md:mb-12 max-w-3xl'}`}>
             <div className="bg-white rounded-2xl shadow-xl shadow-pakGreen-900/5 border border-gray-100 p-2 sm:p-3 md:p-4 flex flex-col gap-2 relative group focus-within:ring-4 focus-within:ring-pakGreen-100 transition-all">
                <div className="flex items-start gap-2 sm:gap-3 p-1">
                   <div className="pt-2.5 sm:pt-3 pl-1 text-gray-400">
                     <SearchIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                   </div>
                   <textarea 
                     className="flex-1 bg-transparent border-none text-base sm:text-lg md:text-xl placeholder-gray-400 focus:ring-0 resize-none min-h-[50px] sm:min-h-[60px] py-2 px-2 focus:outline-none overflow-hidden"
                     placeholder="Ask anything... (e.g., '18th Amendment')"
                     value={query}
                     onChange={e => {
                       setQuery(e.target.value);
                       e.target.style.height = 'auto';
                       e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                       e.target.style.overflowY = e.target.scrollHeight > 200 ? 'auto' : 'hidden';
                     }}
                     onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handleResearch();
                        }
                     }}
                     rows={1}
                     style={{ maxHeight: '200px' }}
                   />
                </div>
                
                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative flex-shrink-0 group/img">
                        <img src={img} alt={`upload-${idx}`} className="h-16 w-16 object-cover rounded-lg border border-gray-200 shadow-sm" />
                        <button 
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1.5 -right-1.5 bg-white text-red-500 rounded-full p-0.5 shadow-md opacity-0 group-hover/img:opacity-100 transition-opacity border border-gray-100"
                        >
                          <CrossIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center px-2 pt-2 border-t border-gray-50">
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="p-1.5 sm:p-2 text-gray-400 hover:text-pakGreen-600 hover:bg-pakGreen-50 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
                   >
                     <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                     <span className="hidden sm:inline">Add Image</span>
                   </button>
                   
                   <button 
                     onClick={() => handleResearch()}
                     disabled={isResearching || (!query && images.length === 0)}
                     className="bg-pakGreen-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-pakGreen-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pakGreen-600/20 transition-all active:scale-95 flex items-center gap-1 sm:gap-2"
                   >
                     {isResearching ? (
                       <>
                         <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                         Researching...
                       </>
                     ) : (
                       <>
                         Research <span className="text-white/60">↵</span>
                       </>
                     )}
                   </button>
                </div>
             </div>
             
             {/* Quick Prompts (Only visible in Hero state) */}
             {!result && !isResearching && (
                <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-3 animate-fade-in-up delay-100">
                   {QuickPrompts.map((prompt, i) => (
                      <button 
                        key={i}
                        onClick={() => { setQuery(prompt); handleResearch(prompt); }}
                        className="bg-white border border-gray-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm text-gray-600 hover:border-pakGreen-500 hover:text-pakGreen-700 hover:shadow-md transition-all active:scale-95"
                      >
                        {prompt}
                      </button>
                   ))}
                </div>
             )}
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            accept="image/*"
            onChange={handleFileSelect}
          />

          {/* Results Display */}
          {result && (
            <div className="w-full animate-fade-in-up">
               {/* Tab Navigation */}
               <div className="flex justify-center mb-6 md:mb-8">
                  <div className="bg-white p-1 sm:p-1.5 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm inline-flex">
                     <button 
                       onClick={() => setViewMode('ANALYSIS')}
                       className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-lg md:rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1 sm:gap-2 ${viewMode === 'ANALYSIS' ? 'bg-pakGreen-50 text-pakGreen-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                     >
                       <BookIcon className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Analysis</span><span className="xs:hidden">A</span>
                     </button>
                     {result.mindMap && (
                       <button 
                         onClick={() => setViewMode('MINDMAP')}
                         className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-lg md:rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1 sm:gap-2 ${viewMode === 'MINDMAP' ? 'bg-pakGreen-50 text-pakGreen-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                       >
                         <GlobeIcon className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Mind Map</span><span className="xs:hidden">Map</span>
                       </button>
                     )}
                  </div>
               </div>

               {/* Content Card */}
               <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[60vh]">
                  
                  {/* Action Bar */}
                  <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 bg-gray-50/50">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Generated Result</span>
                     <button 
                       onClick={() => onSaveNote(result.query, result.content)}
                       className="text-pakGreen-600 hover:bg-pakGreen-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-2"
                     >
                        <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Save to Notes</span><span className="xs:hidden">Save</span>
                     </button>
                  </div>

                  {viewMode === 'ANALYSIS' ? (
                    <div className="p-3 sm:p-4 md:p-12">
                       <article className="prose prose-sm sm:prose-base md:prose-lg prose-pakGreen max-w-none font-serif text-gray-700 leading-relaxed">
                          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 pb-4 sm:pb-6 border-b border-gray-100">{result.query}</h1>
                          <ReactMarkdown 
                             components={{
                               h1: ({node, ...props}) => <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mt-6 sm:mt-8 mb-3 sm:mb-4 text-gray-900" {...props} />,
                               h2: ({node, ...props}) => <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mt-4 sm:mt-6 mb-2 sm:mb-3 text-gray-800" {...props} />,
                               p: ({node, ...props}) => <p className="mb-3 sm:mb-4 text-gray-600 leading-6 sm:leading-7 text-sm sm:text-base md:text-lg" {...props} />,
                               ul: ({node, ...props}) => <ul className="list-disc pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1 sm:space-y-2" {...props} />,
                               li: ({node, ...props}) => <li className="text-gray-600 text-sm sm:text-base md:text-lg" {...props} />,
                               strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                             }}
                          >
                             {result.content}
                          </ReactMarkdown>
                          
                          {result.sources.length > 0 && (
                            <div className="mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 border-t border-gray-100 bg-gray-50/50 -mx-3 sm:-mx-4 md:-mx-12 px-3 sm:px-4 md:px-12 pb-6 sm:pb-8">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 sm:h-6 bg-pakGreen-500 rounded-full"></span>
                                References & Sources
                              </h3>
                              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                {result.sources.map((source, i) => (
                                  <a 
                                    key={i} 
                                    href={source.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pakGreen-200 transition-all group"
                                  >
                                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-pakGreen-50 rounded-full flex items-center justify-center text-xs font-bold text-pakGreen-600 shrink-0 group-hover:bg-pakGreen-600 group-hover:text-white transition-colors">{i + 1}</span>
                                    <span className="text-xs sm:text-sm text-gray-700 font-medium line-clamp-2 group-hover:text-pakGreen-700">{source.title}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                       </article>
                    </div>
                  ) : (
                    <div className="p-4 sm:p-6 md:p-8 lg:p-12 bg-gray-50/30 min-h-[60vh]">
                       {result.mindMap ? (
                         <div className="max-w-4xl mx-auto">
                           <MindMapTree node={result.mindMap} />
                         </div>
                       ) : (
                         <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <GlobeIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-4 opacity-50" />
                            <p className="text-sm sm:text-base">No Mind Map data available for this topic.</p>
                         </div>
                       )}
                    </div>
                  )}
               </div>
            </div>
          )}
          
          {/* Loading State Skeleton */}
          {isResearching && !result && (
             <div className="w-full max-w-4xl animate-pulse space-y-8 mt-12">
                <div className="h-8 bg-gray-200 rounded-full w-3/4 mx-auto"></div>
                <div className="space-y-4">
                   <div className="h-4 bg-gray-100 rounded w-full"></div>
                   <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                   <div className="h-4 bg-gray-100 rounded w-full"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <div className="h-32 bg-gray-100 rounded-2xl"></div>
                   <div className="h-32 bg-gray-100 rounded-2xl"></div>
                   <div className="h-32 bg-gray-100 rounded-2xl"></div>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResearchCenter;
