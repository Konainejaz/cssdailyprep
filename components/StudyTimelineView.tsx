import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { StudyTimelineItem } from '../types';
import { ChevronLeftIcon, NoteIcon, ShareIcon, PlusIcon, CrossIcon } from './Icons';
import { fetchStudyMaterial } from '../services/groqService';

interface Props {
  items: StudyTimelineItem[];
  isLoading: boolean;
  onBack: () => void;
  onSaveNote: (title: string, content: string) => void;
  onUpdateItems?: (items: StudyTimelineItem[]) => void;
}

const StudyTimelineView: React.FC<Props> = ({ items, isLoading, onBack, onSaveNote, onUpdateItems }) => {
  const [selectedItem, setSelectedItem] = useState<StudyTimelineItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailsCache, setDetailsCache] = useState<Record<string, StudyTimelineItem>>({});

  const handleItemClick = async (item: StudyTimelineItem) => {
    // If we already have full content, just show it
    if (item.content) {
      setSelectedItem(item);
      return;
    }
    if (detailsCache[item.id]?.content) {
      setSelectedItem(detailsCache[item.id]);
      return;
    }

    // Otherwise fetch details
    setSelectedItem(item); // Show modal with loading state
    setDetailLoading(true);
    
    try {
      const details = await fetchStudyMaterial('TIMELINE_DETAIL', `Event: ${item.title}. Date: ${item.date}. Context: ${item.description}`);
      const updatedItem = { ...item, ...details };
      setDetailsCache(prev => ({ ...prev, [item.id]: updatedItem }));
      setSelectedItem(updatedItem);

      // Update parent for persistence
      if (onUpdateItems) {
        const newItems = items.map(i => i.id === item.id ? updatedItem : i);
        onUpdateItems(newItems);
      }
    } catch (e) {
      console.error("Failed to load details", e);
    } finally {
      setDetailLoading(false);
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
          <h1 className="text-xl md:text-2xl font-bold font-serif text-gray-900">Current Affairs Timeline</h1>
          <p className="text-sm text-gray-500">Major Events & Milestones</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-24 h-6 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-24 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative border-l-2 border-pakGreen-200 ml-4 md:ml-6 space-y-8 md:space-y-12 pl-6 md:pl-10 py-4">
              {items.map((item, index) => (
                <div key={index} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-[33px] md:-left-[49px] top-1 w-4 h-4 rounded-full border-2 border-pakGreen-500 bg-white group-hover:bg-pakGreen-500 transition-colors z-10" />
                  
                  {/* Date Badge */}
                  <span className="inline-block px-3 py-1 bg-pakGreen-50 text-pakGreen-700 text-xs font-bold rounded-full mb-2 border border-pakGreen-100">
                    {item.date}
                  </span>

                  {/* Card */}
                  <div 
                    onClick={() => handleItemClick(item)}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-pakGreen-200 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-pakGreen-700 transition-colors">{item.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.description}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        {item.category || 'General'}
                      </span>
                      <span className="text-sm text-pakGreen-600 font-bold hover:underline">Read Analysis &rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
               <div>
                 <div className="text-xs font-bold text-pakGreen-600 uppercase tracking-wider mb-1">{selectedItem.date}</div>
                 <h2 className="text-xl font-bold font-serif text-gray-900 line-clamp-1">{selectedItem.title}</h2>
               </div>
               <button 
                 onClick={() => setSelectedItem(null)}
                 className="p-2 hover:bg-gray-200 rounded-full transition-colors"
               >
                 <CrossIcon className="w-6 h-6 text-gray-500" />
               </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {detailLoading && !selectedItem.content ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-48 bg-gray-100 rounded-xl mb-6"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                </div>
              ) : (
                <div className="prose prose-pakGreen max-w-none">
                  {/* Image */}
                  {(selectedItem.imageKeyword || selectedItem.imagePrompt) && (
                    <div className="mb-8 rounded-xl overflow-hidden shadow-lg bg-gray-100">
                      <img 
                        src={selectedItem.imageKeyword 
                          ? `https://image.pollinations.ai/prompt/news%20photo%20of%20${encodeURIComponent(selectedItem.imageKeyword)}` 
                          : `https://placehold.co/800x400?text=${encodeURIComponent(selectedItem.title.slice(0, 20))}`
                        }
                        alt={selectedItem.title}
                        className="w-full h-auto object-cover max-h-[400px] transition-opacity duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {selectedItem.imagePrompt && (
                        <p className="text-xs text-gray-500 mt-2 text-center px-4">
                          Image context: {selectedItem.imagePrompt}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="font-serif text-gray-800 leading-relaxed">
                    <ReactMarkdown>{selectedItem.content || ''}</ReactMarkdown>
                  </div>

                  {/* Sources & Tags */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    {selectedItem.source && (
                      <p className="text-sm text-gray-500 mb-2">
                        <strong>Source:</strong> {selectedItem.source}
                      </p>
                    )}
                    {selectedItem.tags && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {selectedItem.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => onSaveNote(selectedItem.title, selectedItem.content || selectedItem.description)}
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

export default StudyTimelineView;
