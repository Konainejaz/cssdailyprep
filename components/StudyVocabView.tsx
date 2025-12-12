import React, { useState } from 'react';
import { StudyVocabItem } from '../types';
import { ChevronLeftIcon } from './Icons';

interface Props {
  items: StudyVocabItem[];
  isLoading: boolean;
  onBack: () => void;
}

const StudyVocabView: React.FC<Props> = ({ items, isLoading, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(c => c + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(c => c - 1);
      setIsFlipped(false);
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
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {isLoading ? (
          <div className="w-full max-w-lg aspect-[4/3] bg-white rounded-3xl shadow-lg animate-pulse border border-gray-100 flex items-center justify-center">
             <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          </div>
        ) : items.length > 0 ? (
          <div className="w-full max-w-2xl flex flex-col items-center gap-8">
            
            {/* Progress */}
            <div className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Card {currentIndex + 1} of {items.length}
            </div>

            {/* Flashcard */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="group perspective-1000 w-full cursor-pointer"
            >
              <div className={`relative w-full aspect-[1.6] transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center justify-center p-8 text-center hover:border-pakGreen-300 transition-colors">
                  <div className="text-xs font-bold text-pakGreen-600 bg-pakGreen-50 px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
                    {currentItem.type || 'Word'}
                  </div>
                  <h2 className="text-4xl md:text-6xl font-bold text-gray-900 font-serif mb-4">
                    {currentItem.word}
                  </h2>
                  <p className="text-gray-400 text-sm mt-8 animate-bounce">Tap to flip</p>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-pakGreen-600 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-white">
                  <h3 className="text-2xl font-bold mb-4 opacity-90">{currentItem.word}</h3>
                  <p className="text-lg md:text-xl font-medium mb-6 leading-relaxed">
                    "{currentItem.meaning}"
                  </p>
                  <div className="w-12 h-1 bg-white/20 rounded-full mb-6"></div>
                  <p className="text-sm md:text-base opacity-80 italic max-w-md">
                    {currentItem.sentence}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-4 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-pakGreen-600 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              
              <button 
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold shadow-lg hover:bg-gray-800 active:scale-95 transition-all"
              >
                {isFlipped ? 'Show Word' : 'Show Meaning'}
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
