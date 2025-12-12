import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { StudyIslamiatItem } from '../types';
import { ChevronLeftIcon, NoteIcon, PlusIcon } from './Icons';
import { fetchStudyMaterial } from '../services/groqService';

interface Props {
  items: StudyIslamiatItem[];
  isLoading: boolean;
  onBack: () => void;
  onSaveNote?: (title: string, content: string) => void;
  onUpdateItems?: (items: StudyIslamiatItem[]) => void;
}

const StudyIslamiatView: React.FC<Props> = ({ items, isLoading, onBack, onSaveNote, onUpdateItems }) => {
  const [selectedItem, setSelectedItem] = useState<StudyIslamiatItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailsCache, setDetailsCache] = useState<Record<string, StudyIslamiatItem>>({});

  const handleItemClick = async (item: StudyIslamiatItem) => {
    // Generate a temporary ID if missing, based on reference
    const itemId = item.id || item.reference.replace(/\s/g, '_');
    
    // Check if details exist (in item or local cache)
    if (item.analysis) {
      setSelectedItem(item);
      return;
    }
    if (detailsCache[itemId]?.analysis) {
      setSelectedItem(detailsCache[itemId]);
      return;
    }

    setSelectedItem({ ...item, id: itemId }); // Show modal immediately with basic info
    setDetailLoading(true);

    try {
      const details = await fetchStudyMaterial('ISLAMIAT_DETAIL', `Reference: ${item.reference}. Arabic: ${item.arabic}. Translation: ${item.translation}`);
      const updatedItem = { ...item, id: itemId, ...details };
      
      setDetailsCache(prev => ({ ...prev, [itemId]: updatedItem }));
      setSelectedItem(updatedItem);
      
      // Update parent for persistence
      if (onUpdateItems) {
        const newItems = items.map(i => {
           const iId = i.id || i.reference.replace(/\s/g, '_');
           return iId === itemId ? updatedItem : i;
        });
        onUpdateItems(newItems);
      }
    } catch (error) {
      console.error("Failed to fetch details", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleSaveNote = (item: StudyIslamiatItem) => {
    if (onSaveNote) {
      const noteTitle = `Islamiat Reference: ${item.reference}`;
      const noteContent = `
# ${item.reference}

## Arabic
${item.arabic}

## Translation
"${item.translation}"

## Context
${item.context}

## Analysis
${item.analysis || 'Loading...'}

## CSS Relevance
${item.cssRelevance || ''}

## Key Takeaways
${item.keyTakeaways?.map(k => `- ${k}`).join('\n') || ''}
      `.trim();
      onSaveNote(noteTitle, noteContent);
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
          <h1 className="text-xl md:text-2xl font-bold font-serif text-gray-900">Key Quranic Verses & Hadiths</h1>
          <p className="text-sm text-gray-500">For Islamiat CSS Topics</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100"></div>
               ))}
            </div>
          ) : (
            items.map((item, index) => (
              <div 
                key={index}
                onClick={() => handleItemClick(item)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer group active:scale-[0.99]"
              >
                {/* Header / Reference */}
                <div className="bg-pakGreen-50 px-6 py-3 border-b border-pakGreen-100 flex justify-between items-center group-hover:bg-pakGreen-100 transition-colors">
                  <span className="text-sm font-bold text-pakGreen-800 tracking-wide">
                    {item.reference}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-pakGreen-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">View Details</span>
                    <div className="w-2 h-2 rounded-full bg-pakGreen-400"></div>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {/* Arabic */}
                  <div className="text-right font-serif text-2xl md:text-3xl leading-loose text-gray-900" dir="rtl">
                    {item.arabic}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-gray-100 flex-1"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    <div className="h-px bg-gray-100 flex-1"></div>
                  </div>

                  {/* Translation */}
                  <div>
                    <p className="text-lg text-gray-800 font-serif leading-relaxed italic">
                      "{item.translation}"
                    </p>
                  </div>

                  {/* Context */}
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed border border-gray-100">
                    <strong className="text-gray-900 block mb-1">Context for CSS:</strong>
                    {item.context}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl relative z-10 flex flex-col overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-serif">{selectedItem.reference}</h2>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mt-1">Detailed Analysis</p>
              </div>
              <div className="flex gap-2">
                 {onSaveNote && (
                  <button 
                    onClick={() => handleSaveNote(selectedItem)}
                    className="p-2 hover:bg-pakGreen-100 text-pakGreen-700 rounded-full transition-colors"
                    title="Add to Notes"
                  >
                    <NoteIcon className="w-5 h-5" />
                  </button>
                )}
                <button 
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              
              {/* Main Text */}
              <div className="text-center space-y-6 bg-pakGreen-50/50 p-6 rounded-2xl border border-pakGreen-100">
                <p className="text-3xl md:text-4xl font-serif leading-loose text-gray-900" dir="rtl">{selectedItem.arabic}</p>
                <p className="text-lg md:text-xl text-gray-700 italic font-serif">"{selectedItem.translation}"</p>
              </div>

              {detailLoading ? (
                 <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <div className="w-10 h-10 border-4 border-pakGreen-200 border-t-pakGreen-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium animate-pulse">Analyzing for CSS Exams...</p>
                 </div>
              ) : (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* Analysis */}
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-pakGreen-500 rounded-full"></div>
                      Detailed Analysis
                    </h3>
                    <div className="prose prose-pakGreen max-w-none text-gray-700 leading-relaxed">
                      <ReactMarkdown>{selectedItem.analysis || ''}</ReactMarkdown>
                    </div>
                  </section>

                  {/* CSS Relevance */}
                  <section className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
                    <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
                      <TrophyIcon className="w-5 h-5" />
                      Relevance for CSS
                    </h3>
                    <p className="text-gray-800 leading-relaxed">{selectedItem.cssRelevance}</p>
                  </section>

                  {/* Key Takeaways */}
                  {selectedItem.keyTakeaways && (
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Key Points to Memorize</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedItem.keyTakeaways.map((point, i) => (
                          <li key={i} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-pakGreen-600 border border-pakGreen-200">{i+1}</span>
                            <span className="text-sm text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Related Topics */}
                  {selectedItem.relatedTopics && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                      {selectedItem.relatedTopics.map((topic, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Trophy Icon for local use if not imported
const TrophyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> {/* Clock icon actually, but using as placeholder or I should import correct one */}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

export default StudyIslamiatView;