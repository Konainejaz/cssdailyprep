import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  BookIcon, SparklesIcon, CopyIcon, GlobeIcon, 
  DocumentIcon, PlayIcon, CheckIcon 
} from './Icons';
import { fetchLectureNotes, fetchYouTubeNotes, fetchUrlNotes } from '../services/groqService';

type InputMode = 'TEXT' | 'YOUTUBE' | 'PDF';

const AiLectureNotesGenerator: React.FC = () => {
  const [mode, setMode] = useState<InputMode>('TEXT');
  const [textInput, setTextInput] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
      if (mode === 'TEXT') {
        generatedNotes = await fetchLectureNotes(textInput);
      } else if (mode === 'YOUTUBE') {
        generatedNotes = await fetchYouTubeNotes(textInput);
      } else if (mode === 'PDF') {
        generatedNotes = await fetchUrlNotes(textInput);
      }
      setNotes(generatedNotes);
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
      className="p-4 md:p-8 bg-gray-50 min-h-full"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <BookIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              AI Lecture Notes
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Transform your study materials into structured, exam-ready notes in seconds.
          </p>
          <div className="flex justify-center gap-2">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              New Feature
            </span>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Free Preview
            </span>
          </div>
        </motion.div>

        {/* Input Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100"
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button
              onClick={() => { setMode('TEXT'); setTextInput(''); setError(null); }}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'TEXT' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <DocumentIcon className="w-4 h-4" /> Text / Transcript
            </button>
            <button
              onClick={() => { setMode('YOUTUBE'); setTextInput(''); setError(null); }}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'YOUTUBE' 
                  ? 'bg-white text-red-600 border-b-2 border-red-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <PlayIcon className="w-4 h-4" /> YouTube URL
            </button>
            <button
              onClick={() => { setMode('PDF'); setTextInput(''); setError(null); }}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'PDF' 
                  ? 'bg-white text-orange-600 border-b-2 border-orange-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <GlobeIcon className="w-4 h-4" /> Web / PDF URL
            </button>
          </div>

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <label htmlFor="input" className="block text-gray-700 font-semibold mb-3">
                  {mode === 'TEXT' && 'Paste your lecture text, transcript, or rough notes:'}
                  {mode === 'YOUTUBE' && 'Paste YouTube Video URL:'}
                  {mode === 'PDF' && 'Paste Article or Web PDF URL:'}
                </label>
                
                <textarea
                  id="input"
                  className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-700 placeholder-gray-400 font-mono text-sm"
                  placeholder={
                    mode === 'TEXT' ? "Paste content here (max 15,000 chars)..." :
                    mode === 'YOUTUBE' ? "https://www.youtube.com/watch?v=..." :
                    "https://example.com/article"
                  }
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
                
                {mode === 'YOUTUBE' && (
                  <p className="mt-2 text-xs text-gray-500">
                    * Supports public YouTube videos. Extracts metadata to generate study guides.
                  </p>
                )}
                {mode === 'PDF' && (
                  <p className="mt-2 text-xs text-gray-500">
                    * Supports public URLs. For local PDFs, copy and paste text into the "Text" tab.
                  </p>
                )}

                <div className="mt-6 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateNotes}
                    disabled={loading}
                    className={`
                      px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition-all
                      ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}
                    `}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-5 h-5" />
                        <span>Generate Notes</span>
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
                className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-3"
              >
                <div className="w-2 h-2 mt-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
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
              className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100"
            >
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <DocumentIcon className="w-5 h-5 text-blue-500" />
                  Generated Notes
                </h3>
                <button
                  onClick={handleCopyNotes}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all
                    ${copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-8 prose prose-blue max-w-none">
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
