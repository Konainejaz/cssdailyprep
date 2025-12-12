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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 py-6 bg-white border-b border-gray-100 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-serif text-gray-900">Vocabulary Builder</h1>
          <p className="text-sm text-gray-500">Master High-Frequency Words</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        {isLoading ? (
          <div className="w-full max-w-lg aspect-[4/3] bg-white rounded-3xl shadow-lg animate-pulse border border-gray-100 flex items-center justify-center">
             <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          </div>
        ) : items.length > 0 ? (
          <div className="w-full max-w-2xl flex flex-col items-center gap-6 pb-6">
            
            {/* Progress */}
            <div className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Card {currentIndex + 1} of {items.length}
            </div>

            {/* Word Card (Top) */}
             <div className="w-full bg-white rounded-3xl shadow-md border border-gray-100 p-8 text-center relative overflow-hidden animate-slide-up">
                <div className="absolute top-0 left-0 w-full h-1 bg-pakGreen-500"></div>
                <span className="inline-block px-3 py-1 bg-pakGreen-50 text-pakGreen-600 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                  {currentItem.type || 'Word'}
                </span>
                <h2 className="text-4xl md:text-6xl font-bold text-gray-900 font-serif mb-2">
                  {currentItem.word}
                </h2>
             </div>

            {/* Meaning Card (Bottom) */}
            <div className="w-full bg-white rounded-3xl shadow-md border border-gray-100 p-8 flex flex-col items-center text-center relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
               <div className="mb-6">
                 <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Definition</h3>
                 <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed">
                   "{currentItem.meaning}"
                 </p>
               </div>
               
               <div className="w-12 h-1 bg-gray-100 rounded-full mb-6"></div>

               <div className="mb-8">
                 <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Context</h3>
                 <p className="text-gray-600 italic leading-relaxed text-lg">
                   {currentItem.sentence}
                 </p>
               </div>

               {onSaveNote && (
                 <button 
                   onClick={() => onSaveNote(`Vocab: ${currentItem.word}`, `**Word:** ${currentItem.word}\n**Type:** ${currentItem.type}\n**Meaning:** ${currentItem.meaning}\n**Sentence:** ${currentItem.sentence}`)}
                   className="flex items-center gap-2 px-6 py-3 bg-pakGreen-600 text-white rounded-xl font-bold hover:bg-pakGreen-700 transition-colors shadow-sm active:scale-95"
                 >
                   <PlusIcon className="w-5 h-5" />
                   Add to Notes
                 </button>
               )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 mt-2">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-4 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-pakGreen-600 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
               <button 
                onClick={handleNext}
                disabled={currentIndex === items.length - 1}
                className="p-4 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-pakGreen-600 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all rotate-180"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
            </div>

          </div>
        ) : (
          <div className="text-center text-gray-500">No items found.</div>
        )}
      </div>
    </div>
  );
};

export default StudyVocabView;
