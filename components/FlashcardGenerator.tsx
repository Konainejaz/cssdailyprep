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
    <div className="h-full flex flex-col bg-gray-50 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center justify-center gap-2">
            <span className="bg-blue-100 p-2 rounded-xl text-blue-700">
              <SparklesIcon className="w-6 h-6" />
            </span>
            AI Flashcards
          </h1>
          <p className="text-gray-500">Master any topic with AI-generated interactive flashcards.</p>
        </div>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., 'Indo-Pak History 1947-1958')"
              className="flex-1 border-none focus:ring-0 text-lg px-4 py-2 text-gray-800 placeholder-gray-400 bg-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap"
            >
              {loading ? 'Generating...' : 'Generate Cards'}
            </button>
          </div>
        </div>

        {/* Flashcards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          <AnimatePresence>
            {flashcards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-64 cursor-pointer group"
                style={{ perspective: '1000px' }}
                onClick={() => setFlippedIndex(flippedIndex === index ? null : index)}
              >
                <motion.div
                  className="relative w-full h-full transition-all duration-500 shadow-sm hover:shadow-xl rounded-2xl"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: flippedIndex === index ? 180 : 0 }}
                >
                  {/* Front */}
                  <div 
                    className="absolute inset-0 bg-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-between items-center text-center"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="w-full flex justify-between items-start">
                      <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">Card {index + 1}</span>
                      <span className="text-xs text-gray-400">Tap to flip</span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-gray-800 leading-snug">
                      {card.front}
                    </h3>
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-100 to-transparent"></div>
                  </div>

                  {/* Back */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white flex flex-col justify-center items-center text-center"
                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                  >
                    <p className="text-lg font-medium leading-relaxed">
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
          <div className="text-center py-12 text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 opacity-50" />
            </div>
            <p>Enter a topic above to generate study flashcards.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardGenerator;
