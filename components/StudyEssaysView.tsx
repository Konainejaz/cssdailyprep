import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { StudyEssayItem } from '../types';
import { ChevronLeftIcon, BookIcon, PlusIcon, CrossIcon } from './Icons';
import { fetchStudyMaterial } from '../services/groqService';

interface Props {
  items: StudyEssayItem[];
  isLoading: boolean;
  onBack: () => void;
  onSaveNote: (title: string, content: string) => void;
  onUpdateItems?: (items: StudyEssayItem[]) => void;
}

const StudyEssaysView: React.FC<Props> = ({ items, isLoading, onBack, onSaveNote, onUpdateItems }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [essayCache, setEssayCache] = useState<Record<string, string>>({});
  const [loadingEssayId, setLoadingEssayId] = useState<string | null>(null);
  const [activeEssay, setActiveEssay] = useState<{title: string, content: string, outline: string[]} | null>(null);
  const [textSize, setTextSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [showOutlineInModal, setShowOutlineInModal] = useState(true);

  const handleGenerateEssay = async (item: StudyEssayItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check local state cache or item content (persistence)
    // Validate content length to ensure it's a full essay and not just an outline (> 1000 chars)
    if (item.content && item.content.length > 1000) {
      setActiveEssay({ title: item.title, content: item.content, outline: item.outline });
      return;
    }
    if (essayCache[item.id] && essayCache[item.id].length > 1000) {
      setActiveEssay({ title: item.title, content: essayCache[item.id], outline: item.outline });
      return;
    }

    setLoadingEssayId(item.id);
    try {
      const prompt = `Title: ${item.title}\n\nOutline:\n${item.outline.map(p => `- ${p}`).join('\n')}`;
      let content = await fetchStudyMaterial('ESSAY_DETAIL', prompt);
      
      // Safety check for malformed JSON response
      if (typeof content === 'object' && content !== null) {
         if (content.content && typeof content.content === 'string') {
             content = content.content;
         } else if (Array.isArray(content)) {
             content = content.join('\n\n');
         } else {
             // If it's a nested object (paragraphs as keys), try to join values
             content = Object.values(content).join('\n\n');
         }
      }

      setEssayCache(prev => ({ ...prev, [item.id]: content }));
      setActiveEssay({ title: item.title, content, outline: item.outline });
      
      // Update parent for persistence
      if (onUpdateItems) {
        const updatedItems = items.map(i => i.id === item.id ? { ...i, content } : i);
        onUpdateItems(updatedItems);
      }
    } catch (err) {
      console.error("Failed to generate essay", err);
    } finally {
      setLoadingEssayId(null);
    }
  };

  const getTextSizeClass = () => {
    switch (textSize) {
      case 'sm': return 'prose-sm';
      case 'lg': return 'prose-lg';
      case 'xl': return 'prose-xl';
      default: return 'prose-base';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      {/* Header */}
      <div className="px-6 py-6 bg-white border-b border-gray-100 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-serif text-gray-900">Important Essays</h1>
          <p className="text-sm text-gray-500">Predicted Topics & Outlines</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-24 bg-white rounded-xl border border-gray-100"></div>
               ))}
            </div>
          ) : (
            items.map((item, index) => (
              <div 
                key={index}
                className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
                  expandedIndex === index 
                    ? 'border-pakGreen-500 ring-1 ring-pakGreen-500 shadow-md' 
                    : 'border-gray-100 shadow-sm hover:border-pakGreen-200'
                }`}
              >
                <div 
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="p-5 flex items-start gap-4 cursor-pointer"
                >
                  <div className={`mt-1 p-2 rounded-lg transition-colors ${expandedIndex === index ? 'bg-pakGreen-100 text-pakGreen-700' : 'bg-gray-100 text-gray-500'}`}>
                    <BookIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg font-serif transition-colors ${expandedIndex === index ? 'text-pakGreen-800' : 'text-gray-900'}`}>
                      {item.title}
                    </h3>
                    {!expandedIndex && (
                       <p className="text-sm text-gray-500 mt-1">Tap to view outline</p>
                    )}
                  </div>
                  <div className={`transition-transform duration-300 text-gray-400 ${expandedIndex === index ? 'rotate-90 text-pakGreen-600' : ''}`}>
                    <ChevronLeftIcon className="w-5 h-5 rotate-180" />
                  </div>
                </div>

                {/* Outline (Expanded) */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    expandedIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-0 ml-[3.5rem]">
                      <div className="h-px bg-gray-100 mb-4" />
                      
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Essay Outline</h4>
                        <button 
                          onClick={(e) => handleGenerateEssay(item, e)}
                          disabled={loadingEssayId === item.id}
                          className="text-xs font-bold text-pakGreen-600 bg-pakGreen-50 px-3 py-1.5 rounded-full hover:bg-pakGreen-100 transition-colors flex items-center gap-2"
                        >
                          {loadingEssayId === item.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-pakGreen-600 border-t-transparent rounded-full animate-spin"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <BookIcon className="w-3 h-3" />
                              Read Full Essay
                            </>
                          )}
                        </button>
                      </div>

                      <ul className="space-y-2 mb-4">
                        {item.outline.map((point, i) => (
                          <li key={i} className="flex gap-3 text-gray-700 text-sm leading-relaxed">
                            <span className="text-pakGreen-500 font-bold">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Full Essay Modal */}
      {activeEssay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full h-full md:max-w-6xl md:h-[90vh] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-start justify-between bg-white z-20 shadow-sm sticky top-0">
               <div className="flex-1 min-w-0 mr-4">
                 <h2 className="text-lg md:text-xl font-bold font-serif text-gray-900 leading-tight break-words">{activeEssay.title}</h2>
                 <p className="text-xs text-gray-500 mt-1">
                   {activeEssay.content.split(/\s+/).length} words • {Math.ceil(activeEssay.content.split(/\s+/).length / 200)} min read
                 </p>
               </div>
               
               <div className="flex items-center gap-2 flex-shrink-0">
                 {/* Text Size Controls (Desktop) */}
                 <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                   <button onClick={() => setTextSize('sm')} className={`p-1.5 rounded-md ${textSize === 'sm' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}><span className="text-xs font-bold">A</span></button>
                   <button onClick={() => setTextSize('base')} className={`p-1.5 rounded-md ${textSize === 'base' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}><span className="text-sm font-bold">A</span></button>
                   <button onClick={() => setTextSize('lg')} className={`p-1.5 rounded-md ${textSize === 'lg' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}><span className="text-lg font-bold">A</span></button>
                 </div>

                 <button 
                   onClick={() => setShowOutlineInModal(!showOutlineInModal)}
                   className={`p-2 rounded-full transition-colors ${showOutlineInModal ? 'bg-pakGreen-50 text-pakGreen-600' : 'hover:bg-gray-100 text-gray-500'}`}
                   title="Toggle Outline"
                 >
                   <BookIcon className="w-5 h-5" />
                 </button>

                 <button 
                   onClick={() => setActiveEssay(null)}
                   className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                 >
                   <CrossIcon className="w-6 h-6 text-gray-500" />
                 </button>
               </div>
            </div>
            
            <div className="flex flex-1 overflow-hidden relative">
              {/* Sidebar Outline (Desktop: Sticky; Mobile: Hidden/Toggle) */}
              {showOutlineInModal && (
                <div className="w-full md:w-80 bg-gray-50 border-r border-gray-100 overflow-y-auto flex-shrink-0 absolute md:static inset-0 z-10 md:z-auto md:block">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Essay Outline</h3>
                      {/* Mobile Close Outline */}
                      <button onClick={() => setShowOutlineInModal(false)} className="md:hidden p-1 text-gray-400">
                        <CrossIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <nav className="space-y-1">
                      {activeEssay.outline.map((point, i) => (
                        <div key={i} className="flex gap-3 text-sm text-gray-600 py-2 border-b border-gray-100 last:border-0">
                          <span className="text-pakGreen-500 font-bold font-serif text-lg leading-none mt-0.5">•</span>
                          <span className="leading-relaxed">{point}</span>
                        </div>
                      ))}
                    </nav>
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto bg-white" onClick={() => window.innerWidth < 768 && setShowOutlineInModal(false)}>
                <div className={`max-w-3xl mx-auto p-6 md:p-12 ${getTextSizeClass()}`}>
                  <div className="prose prose-pakGreen max-w-none font-serif leading-loose text-gray-800 text-justify">
                    <style>{`
                      .prose p { margin-bottom: 1.5em; text-indent: 2rem; }
                      .prose h1, .prose h2, .prose h3 { margin-top: 2em; margin-bottom: 1em; line-height: 1.3; }
                      .prose ul { margin-left: 1.5rem; }
                      .prose blockquote { font-style: italic; border-left-width: 4px; padding-left: 1rem; margin-left: 0; margin-right: 0; }
                    `}</style>
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-3xl md:text-4xl font-bold text-pakGreen-900 mb-8 pb-4 border-b-2 border-pakGreen-100 font-serif" {...props} />,
                        h2: ({node, ...props}) => (
                          <div className="mt-12 mb-6 break-words">
                            <h2 className="text-2xl md:text-3xl font-bold text-pakGreen-800 relative inline-block pl-4 font-serif" {...props}>
                              <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-pakGreen-500 rounded-full"></span>
                              {props.children}
                            </h2>
                          </div>
                        ),
                        h3: ({node, ...props}) => <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 font-serif" {...props} />,
                        p: ({node, ...props}) => <p className="mb-6 text-gray-800 leading-relaxed text-justify indent-8" {...props} />,
                        ul: ({node, ...props}) => <ul className="space-y-3 mb-8 my-4 ml-2 list-none" {...props} />,
                        li: ({node, ...props}) => (
                          <li className="flex gap-3 items-start text-gray-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-pakGreen-400 mt-2.5 flex-shrink-0"></span>
                            <span className="flex-1" {...props} />
                          </li>
                        ),
                        strong: ({node, ...props}) => <strong className="font-bold text-gray-900 bg-yellow-50 px-1 rounded mx-0.5 box-decoration-clone" {...props} />,
                        blockquote: ({node, ...props}) => (
                          <blockquote className="border-l-4 border-pakGreen-500 pl-6 italic text-gray-700 my-8 bg-gray-50 py-6 pr-6 rounded-r-xl relative overflow-hidden shadow-sm" {...props}>
                            <span className="absolute top-0 left-2 text-6xl text-pakGreen-100 font-serif select-none">"</span>
                            <div className="relative z-10">{props.children}</div>
                          </blockquote>
                        ),
                      }}
                    >
                      {activeEssay.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => onSaveNote(activeEssay.title, activeEssay.content)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pakGreen-600 text-white font-bold hover:bg-pakGreen-700 transition-colors shadow-sm"
              >
                <PlusIcon className="w-5 h-5" />
                Add to Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyEssaysView;
