import React, { useEffect, useState } from 'react';
import { fetchFlashcards } from '../services/groqService';
import { SparklesIcon, PlusIcon, ChevronLeftIcon, CheckIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { addToHistory, logAction } from '../services/historyService';

interface Props {
  initialTopic?: string;
  initialFlashcards?: Array<{ front: string; back: string }>;
}

const FlashcardGenerator: React.FC<Props> = ({ initialTopic, initialFlashcards }) => {
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState<Array<{ front: string, back: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof initialTopic === 'string') setTopic(initialTopic);
    if (Array.isArray(initialFlashcards)) setFlashcards(initialFlashcards);
  }, [initialTopic, initialFlashcards]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setFlashcards([]);
    setFlippedIndex(null);
    logAction('flashcards_started', 'flashcards', undefined, { topic });
    const cards = await fetchFlashcards(topic);
    setFlashcards(cards);
    addToHistory(topic.trim().slice(0, 120), 'flashcards', { topic: topic.trim(), flashcards: cards });
    logAction('flashcards_completed', 'flashcards', undefined, { topic, count: cards?.length ?? 0 });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-4 sm:space-y-6 md:space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-3 px-2 sm:px-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-gray-900 flex items-center justify-center gap-2 flex-wrap">
            <span className="bg-blue-100 p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-blue-700 flex-shrink-0">
              <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-6 md:w-6 md:h-6" />
            </span>
            <span className="flex-1 min-w-0">AI Flashcards</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 px-2">Master any topic with AI-generated interactive flashcards.</p>
        </div>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto w-full px-2 sm:px-0">
          <div className="bg-white p-2 sm:p-1.5 md:p-2 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 focus-within:ring-2 sm:focus-within:ring-4 focus-within:ring-blue-100 transition-all">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., 'Indo-Pak History 1947-1958')"
              className="flex-1 border-none focus:ring-0 text-sm sm:text-base md:text-lg px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-gray-800 placeholder-gray-400 bg-transparent min-w-0"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="bg-blue-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap text-xs sm:text-sm md:text-base flex-shrink-0 min-w-fit"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline ml-1 sm:ml-2">Generating...</span><span className="sm:hidden ml-1">...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Generate Cards</span><span className="sm:hidden">Go</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Flashcards Grid */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 pb-6 sm:pb-8 md:pb-12 px-2 sm:px-0">
          <AnimatePresence>
            {flashcards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-40 sm:h-48 md:h-56 lg:h-64 cursor-pointer group card-perspective"
                onClick={() => setFlippedIndex(flippedIndex === index ? null : index)}
              >
                <motion.div
                  className="relative w-full h-full transition-all duration-500 shadow-sm hover:shadow-xl rounded-lg sm:rounded-xl md:rounded-2xl"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: flippedIndex === index ? 180 : 0 }}
                >
                  {/* Front */}
                  <div 
                    className="absolute inset-0 bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-100 flex flex-col justify-between items-center text-center card-backface-hidden"
                  >
                    <div className="w-full flex justify-between items-start">
                      <span className="text-[8px] sm:text-[10px] md:text-xs font-bold text-blue-500 bg-blue-50 px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-0.5 md:py-1 rounded-full">Card {index + 1}</span>
                      <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-400">Tap to flip</span>
                    </div>
                    <h3 className="text-sm sm:text-base md:text-xl font-serif font-bold text-gray-800 leading-snug break-words">
                      {card.front}
                    </h3>
                    <div className="w-full h-0.5 sm:h-0.5 md:h-1 bg-gradient-to-r from-transparent via-blue-100 to-transparent"></div>
                  </div>

                  {/* Back */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl text-white flex flex-col justify-center items-center text-center card-backface-hidden"
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    <p className="text-xs sm:text-sm md:text-lg font-medium leading-relaxed break-words">
                      {card.back}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {!loading && flashcards.length === 0 && (
          <div className="text-center py-6 sm:py-8 md:py-12 text-gray-400 px-2 sm:px-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-100 rounded-full mx-auto mb-2 sm:mb-3 md:mb-4 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 opacity-50" />
            </div>
            <p className="text-xs sm:text-sm md:text-base">Enter a topic above to generate study flashcards.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardGenerator;
