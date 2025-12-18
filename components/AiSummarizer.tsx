import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchSummarization } from '../services/groqService';
import { SparklesIcon, DocumentIcon, CopyIcon } from './Icons';
import Modal from './Modal';

interface Props {
  onBack?: () => void; // Optional if we want to use it as a standalone page or modal
}

const AiSummarizer: React.FC<Props> = ({ onBack }) => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyErrorModalOpen, setCopyErrorModalOpen] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const result = await fetchSummarization(text);
    setSummary(result);
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
    <div className="h-full flex flex-col bg-gray-50 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center justify-center gap-2">
            <span className="bg-pakGreen-100 p-2 rounded-xl text-pakGreen-700">
              <SparklesIcon className="w-6 h-6" />
            </span>
            AI Summarizer
          </h1>
          <p className="text-gray-500">Paste any text, article, or notes to get a concise CSS-focused summary.</p>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <DocumentIcon className="w-4 h-4" /> Source Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here (max 15000 characters)..."
            className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pakGreen-500 focus:border-transparent transition-all resize-none text-gray-700 leading-relaxed"
            maxLength={15000}
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-xs text-gray-400">{text.length}/15000 characters</span>
            <button
              onClick={handleSummarize}
              disabled={loading || !text.trim()}
              className="bg-pakGreen-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-pakGreen-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-pakGreen-600/20 active:scale-95 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" /> Summarize
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Area */}
        {summary && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="bg-pakGreen-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-pakGreen-600" /> Summary
              </h3>
              <button 
                onClick={copyToClipboard}
                className="text-gray-500 hover:text-pakGreen-600 transition-colors p-2 rounded-lg hover:bg-white"
                title="Copy to Clipboard"
              >
                <CopyIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 md:p-8 prose prose-pakGreen max-w-none">
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
