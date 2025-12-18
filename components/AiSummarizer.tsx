import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchSummarization } from '../services/groqService';
import { SparklesIcon, DocumentIcon, CopyIcon } from './Icons';
import Modal from './Modal';
import { addToHistory, logAction } from '../services/historyService';

interface Props {
  onBack?: () => void; // Optional if we want to use it as a standalone page or modal
  initialText?: string;
  initialSummary?: string;
}

const AiSummarizer: React.FC<Props> = ({ onBack, initialText, initialSummary }) => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyErrorModalOpen, setCopyErrorModalOpen] = useState(false);

  useEffect(() => {
    if (typeof initialText === 'string') setText(initialText);
    if (typeof initialSummary === 'string') setSummary(initialSummary);
  }, [initialText, initialSummary]);

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    logAction('ai_summarizer_started', 'ai_summarizer', undefined, { preview: text.slice(0, 160) });
    const result = await fetchSummarization(text);
    setSummary(result);
    addToHistory(
      (text.trim().split('\n')[0] || text.trim()).slice(0, 120),
      'ai_summarizer',
      { input: text.slice(0, 5000), summary: result }
    );
    logAction('ai_summarizer_completed', 'ai_summarizer', undefined, { length: result?.length ?? 0 });
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(summary)
      .then(() => {
        setCopyModalOpen(true);
        window.setTimeout(() => setCopyModalOpen(false), 1200);
      })
      .catch(() => {
        setCopyErrorModalOpen(true);
      });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-3 sm:space-y-4 md:space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1.5 sm:space-y-2 px-2 sm:px-0">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-bold text-gray-900 flex items-center justify-center gap-2 flex-wrap">
            <span className="bg-pakGreen-100 p-1 sm:p-1.5 md:p-2 rounded-lg sm:rounded-xl text-pakGreen-700 flex-shrink-0">
              <SparklesIcon className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </span>
            <span className="flex-1 min-w-0">AI Summarizer</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 px-2">Paste any text, article, or notes to get a concise CSS-focused summary.</p>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-2 sm:p-3 md:p-4 lg:p-6 mx-2 sm:mx-0">
          <label className="block text-xs sm:text-sm md:text-base font-bold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
            <DocumentIcon className="w-3 h-3 sm:w-4 sm:h-4" /> Source Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here (max 15000 characters)..."
            className="w-full h-32 sm:h-36 md:h-48 p-2 sm:p-3 md:p-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-1 sm:focus:ring-2 focus:ring-pakGreen-500 focus:border-transparent transition-all resize-none text-gray-700 leading-relaxed text-xs sm:text-sm md:text-base"
            maxLength={15000}
          />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mt-2 sm:mt-3 md:mt-4">
            <span className="text-[10px] sm:text-xs text-gray-400">{text.length}/15000 characters</span>
            <button
              onClick={handleSummarize}
              disabled={loading || !text.trim()}
              className="w-full sm:w-auto bg-pakGreen-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-bold hover:bg-pakGreen-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-pakGreen-600/20 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Summarizing...</span><span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Summarize</span><span className="sm:hidden">Go</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Area */}
        {summary && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up mx-2 sm:mx-0">
            <div className="bg-pakGreen-50/50 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base">
                <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-pakGreen-600" /> Summary
              </h3>
              <button 
                onClick={copyToClipboard}
                className="text-gray-500 hover:text-pakGreen-600 transition-colors p-1 sm:p-1.5 md:p-2 rounded-lg hover:bg-white"
                title="Copy to Clipboard"
              >
                <CopyIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 prose prose-xs sm:prose-sm md:prose-base prose-pakGreen max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={copyModalOpen}
        title="Copied"
        description="Summary copied to clipboard."
        onClose={() => setCopyModalOpen(false)}
        primaryAction={{ label: 'OK', onClick: () => setCopyModalOpen(false) }}
      />

      <Modal
        open={copyErrorModalOpen}
        title="Copy failed"
        description="Your browser blocked clipboard access. Please copy manually."
        onClose={() => setCopyErrorModalOpen(false)}
        primaryAction={{ label: 'OK', onClick: () => setCopyErrorModalOpen(false) }}
      />
    </div>
  );
};

export default AiSummarizer;
