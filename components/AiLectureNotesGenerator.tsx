import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  BookIcon, SparklesIcon, CopyIcon, GlobeIcon, 
  DocumentIcon, PlayIcon, CheckIcon 
} from './Icons';
import { fetchLectureNotes, fetchYouTubeNotes, fetchUrlNotes } from '../services/groqService';
import { addToHistory, logAction } from '../services/historyService';

type InputMode = 'TEXT' | 'YOUTUBE' | 'PDF';

interface Props {
  initialMode?: InputMode;
  initialInput?: string;
  initialNotes?: string;
}

const AiLectureNotesGenerator: React.FC<Props> = ({ initialMode, initialInput, initialNotes }) => {
  const [mode, setMode] = useState<InputMode>('TEXT');
  const [textInput, setTextInput] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
    if (typeof initialInput === 'string') setTextInput(initialInput);
    if (typeof initialNotes === 'string') setNotes(initialNotes);
  }, [initialMode, initialInput, initialNotes]);

  const handleGenerateNotes = async () => {
    if (!textInput.trim()) {
      setError('Please enter some content to generate notes.');
      return;
    }

    setLoading(true);
    setError(null);
    setNotes('');

    try {
      let generatedNotes = '';
      logAction('lecture_notes_started', 'ai_lecture_notes', undefined, { mode, preview: textInput.slice(0, 160) });
      if (mode === 'TEXT') {
        generatedNotes = await fetchLectureNotes(textInput);
      } else if (mode === 'YOUTUBE') {
        generatedNotes = await fetchYouTubeNotes(textInput);
      } else if (mode === 'PDF') {
        generatedNotes = await fetchUrlNotes(textInput);
      }
      setNotes(generatedNotes);
      addToHistory(
        (textInput.trim().split('\n')[0] || textInput.trim()).slice(0, 120),
        'ai_lecture_notes',
        { mode, input: textInput.slice(0, 5000), notes: generatedNotes }
      );
      logAction('lecture_notes_completed', 'ai_lecture_notes', undefined, { mode, length: generatedNotes?.length ?? 0 });
    } catch (err) {
      setError('Failed to generate notes. Please check your input and try again.');
      console.error('Error generating lecture notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyNotes = () => {
    if (notes) {
      navigator.clipboard.writeText(notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-2 sm:p-3 md:p-4 lg:p-8 bg-gray-50 min-h-screen"
    >
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-3 sm:space-y-4 px-2 sm:px-0">
          <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
            <div className="p-1.5 sm:p-2 md:p-3 bg-blue-100 rounded-xl sm:rounded-2xl flex-shrink-0">
              <BookIcon className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-600" />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold text-gray-900 tracking-tight flex-1 min-w-0">
              AI Lecture Notes
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm md:text-base lg:text-lg px-2 sm:px-4">
            Transform your study materials into structured, exam-ready notes in seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 px-2 sm:px-4">
            <span className="bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wide">
              New Feature
            </span>
            <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wide">
              Free Preview
            </span>
          </div>
        </motion.div>

        {/* Input Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 mx-2 sm:mx-0"
        >
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row border-b border-gray-100 bg-gray-50/50">
            <button
              onClick={() => { setMode('TEXT'); setTextInput(''); setError(null); }}
              className={`flex-1 py-2.5 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all min-w-0 ${
                mode === 'TEXT' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <DocumentIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" /> <span className="truncate">Text / Transcript</span>
            </button>
            <button
              onClick={() => { setMode('YOUTUBE'); setTextInput(''); setError(null); }}
              className={`flex-1 py-2.5 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all min-w-0 ${
                mode === 'YOUTUBE' 
                  ? 'bg-white text-red-600 border-b-2 border-red-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <PlayIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" /> <span className="truncate">YouTube URL</span>
            </button>
            <button
              onClick={() => { setMode('PDF'); setTextInput(''); setError(null); }}
              className={`flex-1 py-2.5 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all min-w-0 ${
                mode === 'PDF' 
                  ? 'bg-white text-orange-600 border-b-2 border-orange-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <GlobeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" /> <span className="truncate">Web / PDF URL</span>
            </button>
          </div>

          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <label htmlFor="input" className="block text-gray-700 font-semibold mb-2 sm:mb-3 text-xs sm:text-sm md:text-base">
                  {mode === 'TEXT' && 'Paste your lecture text, transcript, or rough notes:'}
                  {mode === 'YOUTUBE' && 'Paste YouTube Video URL:'}
                  {mode === 'PDF' && 'Paste Article or Web PDF URL:'}
                </label>
                
                <textarea
                  id="input"
                  className="w-full h-28 sm:h-32 md:h-40 lg:h-48 p-2 sm:p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-700 placeholder-gray-400 font-mono text-[10px] sm:text-xs md:text-sm"
                  placeholder={
                    mode === 'TEXT' ? "Paste content here (max 15,000 chars)..." :
                    mode === 'YOUTUBE' ? "https://www.youtube.com/watch?v=..." :
                    "https://example.com/article"
                  }
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
                
                {mode === 'YOUTUBE' && (
                  <p className="mt-1.5 sm:mt-2 text-[9px] sm:text-xs text-gray-500 px-1">
                    * Supports public YouTube videos. Extracts metadata to generate study guides.
                  </p>
                )}
                {mode === 'PDF' && (
                  <p className="mt-1.5 sm:mt-2 text-[9px] sm:text-xs text-gray-500 px-1">
                    * Supports public URLs. For local PDFs, copy and paste text into the "Text" tab.
                  </p>
                )}

                <div className="mt-3 sm:mt-4 md:mt-6 flex justify-center sm:justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateNotes}
                    disabled={loading}
                    className={`
                      px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-bold text-white flex items-center gap-1.5 sm:gap-2 shadow-lg transition-all text-xs sm:text-sm md:text-base w-full sm:w-auto
                      ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}
                    `}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="hidden sm:inline">Analyzing...</span><span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        <span className="hidden sm:inline">Generate Notes</span><span className="sm:hidden">Generate</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 text-red-600 rounded-lg sm:rounded-xl border border-red-100 flex items-start gap-2 sm:gap-3"
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 mt-1.5 sm:mt-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-[10px] sm:text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Results Area */}
        <AnimatePresence>
          {notes && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 mx-2 sm:mx-0"
            >
              <div className="p-2.5 sm:p-3 md:p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                <h3 className="font-bold text-gray-700 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base">
                  <DocumentIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-500" />
                  Generated Notes
                </h3>
                <button
                  onClick={handleCopyNotes}
                  className={`
                    flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold transition-all
                    ${copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  {copied ? <CheckIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" /> : <CopyIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-3 sm:p-4 md:p-6 lg:p-8 prose prose-blue max-w-none prose-xs sm:prose-sm md:prose-base">
                <ReactMarkdown>{notes}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AiLectureNotesGenerator;
