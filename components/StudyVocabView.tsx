import React, { useState } from 'react';
import { StudyVocabItem } from '../types';
import { ChevronLeftIcon, PlusIcon } from './Icons';

interface Props {
  items: StudyVocabItem[];
  isLoading: boolean;
  onBack: () => void;
  onSaveNote?: (title: string, content: string) => void;
}

const StudyVocabView: React.FC<Props> = ({ items, isLoading, onBack, onSaveNote }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(c => c + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(c => c - 1);
    }
  };

  const currentItem = items[currentIndex];

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center gap-4 shadow-sm z-10 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold font-serif text-gray-900">Vocabulary</h1>
          <p className="text-xs text-gray-500">High-Frequency Words</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 relative">
        {isLoading ? (
          <div className="w-full max-w-md aspect-[3/4] bg-white rounded-3xl shadow-lg animate-pulse border border-gray-100 flex items-center justify-center">
             <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          </div>
        ) : items.length > 0 ? (
          <div className="w-full max-w-md h-full max-h-[600px] bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-300">
             
             {/* Card Decor */}
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pakGreen-400 to-pakGreen-600"></div>
             
             {/* Scrollable Card Content */}
             <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center text-center custom-scrollbar">
                
                {/* Type Badge */}
                <span className="inline-block px-3 py-1 bg-pakGreen-50 text-pakGreen-700 text-[10px] font-bold rounded-full uppercase tracking-wider mb-6">
                  {currentItem.type || 'Word'}
                </span>

                {/* Word */}
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-serif mb-6 break-words leading-tight">
                  {currentItem.word}
                </h2>

                {/* Divider */}
                <div className="w-12 h-1 bg-gray-100 rounded-full mb-6 shrink-0"></div>

                {/* Meaning */}
                <div className="mb-6">
                  <p className="text-lg md:text-xl font-medium text-gray-800 leading-relaxed">
                    "{currentItem.meaning}"
                  </p>
                </div>

                {/* Context Sentence */}
                <div className="bg-gray-50 p-4 rounded-xl w-full mt-auto">
                   <p className="text-gray-600 italic text-sm md:text-base leading-relaxed">
                     {currentItem.sentence}
                   </p>
                </div>
             </div>

             {/* Card Actions (Inside Card Footer) */}
             <div className="p-4 border-t border-gray-50 bg-white flex justify-between items-center gap-4 shrink-0">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">
                   {currentIndex + 1} / {items.length}
                </div>
                
                {onSaveNote && (
                   <button 
                     onClick={() => onSaveNote(`Vocab: ${currentItem.word}`, `**Word:** ${currentItem.word}\n**Type:** ${currentItem.type}\n**Meaning:** ${currentItem.meaning}\n**Sentence:** ${currentItem.sentence}`)}
                     className="p-2.5 text-pakGreen-600 hover:bg-pakGreen-50 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold"
                     title="Save to Notes"
                   >
                     <PlusIcon className="w-5 h-5" />
                     <span className="hidden sm:inline">Save Note</span>
                   </button>
                )}
             </div>

          </div>
        ) : (
          <div className="text-center text-gray-500">No items found.</div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-white border-t border-gray-100 p-4 pb-6 md:pb-4 shrink-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
           <button 
             onClick={handlePrev}
             disabled={currentIndex === 0}
             className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
           >
             <ChevronLeftIcon className="w-5 h-5" /> Prev
           </button>
           
           <button 
             onClick={handleNext}
             disabled={currentIndex === items.length - 1}
             className="flex-[2] py-3 px-4 rounded-xl bg-pakGreen-600 text-white font-bold shadow-lg shadow-pakGreen-600/20 hover:bg-pakGreen-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
           >
             Next <ChevronLeftIcon className="w-5 h-5 rotate-180" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default StudyVocabView;
