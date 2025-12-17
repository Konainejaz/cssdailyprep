import React, { useState, useRef, useEffect } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { Toolbar } from 'markmap-toolbar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, CheckIcon, SaveIcon, 
  DocumentIcon, ShareIcon, CrossIcon,
  MaximizeIcon, MinimizeIcon
} from './Icons';
import { generateMindMap, fetchNodeDetails } from '../services/groqService';
import ReactMarkdown from 'react-markdown';
import * as d3 from 'd3';
import { createPortal } from 'react-dom';
import 'markmap-toolbar/dist/style.css';

interface MindMapViewerProps {
  markdown: string;
  transformer: Transformer;
  onNodeClick: (text: string) => void;
  className?: string;
}

const MindMapViewer: React.FC<MindMapViewerProps> = ({ markdown, transformer, onNodeClick, className }) => {
  const ref = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onNodeClickRef = useRef(onNodeClick);

  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const ro = new ResizeObserver(() => {
      try {
        mmRef.current?.fit();
      } catch {}
    });

    ro.observe(container);

    return () => {
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (ref.current && markdown && transformer) {
      ref.current.innerHTML = '';
      if (mmRef.current) {
        mmRef.current = null; 
      }
      
      let isMounted = true;
      let timeoutId: NodeJS.Timeout;

      try {
        const { root } = transformer.transform(markdown);
        
        timeoutId = setTimeout(() => {
            if (!isMounted || !ref.current) return;
            
            ref.current.innerHTML = '';
            
            mmRef.current = Markmap.create(ref.current, {
              autoFit: true,
              fitRatio: 0.95,
              duration: 500,
            }, root);

            requestAnimationFrame(() => {
              try {
                mmRef.current?.fit();
              } catch {}
            });
            
            if (containerRef.current && mmRef.current) {
                const existingToolbar = containerRef.current.querySelector('.markmap-toolbar');
                if (existingToolbar) existingToolbar.remove();

                const { el } = Toolbar.create(mmRef.current);
                el.style.position = 'absolute';
                el.style.bottom = '1rem';
                el.style.right = '1rem';
                el.style.zIndex = '10';
                containerRef.current.appendChild(el);
            }

            if (ref.current) {
                const svg = d3.select(ref.current);
                svg.on('click', null);

                svg.on('click', (event) => {
                    const target = event.target as Element;
                    let nodeText = '';
                    if (target.tagName === 'tspan' || target.tagName === 'text') {
                        nodeText = target.textContent || '';
                    } else if (target.tagName === 'circle') {
                         const parent = target.parentElement;
                         if (parent) {
                             const textEl = parent.querySelector('text');
                             if (textEl) nodeText = textEl.textContent || '';
                         }
                    }

                    if (nodeText && nodeText.trim()) {
                        if (nodeText !== '+' && nodeText !== '-') {
                            onNodeClickRef.current(nodeText);
                        }
                    }
                });
            }

        }, 100);

      } catch (e) {
        console.error("Markmap Render Error:", e);
      }

      return () => {
          isMounted = false;
          clearTimeout(timeoutId);
          if (containerRef.current) {
              const existingToolbar = containerRef.current.querySelector('.markmap-toolbar');
              if (existingToolbar) existingToolbar.remove();
          }
          if (mmRef.current) {
             mmRef.current.destroy();
             mmRef.current = null;
          }
          if (ref.current) {
             ref.current.innerHTML = '';
          }
      };
    }
  }, [markdown, transformer]);

  return (
    <div ref={containerRef} className={`relative w-full border border-gray-200 rounded-xl overflow-hidden bg-gray-50 ${className || 'h-[600px]'}`}>
      <svg ref={ref} className="w-full h-full block" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

const AiMindMapGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const resultsDockRef = useRef<HTMLDivElement>(null);
  const [dockRect, setDockRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  
  // Node Detail State
  const [selectedNode, setSelectedNode] = useState<{ text: string, details: string | null, loading: boolean } | null>(null);

  // Lazy init transformer
  const transformerRef = useRef<Transformer | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
        if (!transformerRef.current) {
            transformerRef.current = new Transformer();
            setIsReady(true);
        }
    } catch (e) {
        console.error("Transformer Init Error:", e);
        setError("Failed to initialize Mind Map engine.");
    }
  }, []);

  useEffect(() => {
    if (!markdown) return;

    const updateDockRect = () => {
      const el = resultsDockRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setDockRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    };

    updateDockRect();

    window.addEventListener('resize', updateDockRect);
    window.addEventListener('scroll', updateDockRect, true);

    const ro = new ResizeObserver(updateDockRect);
    if (resultsDockRef.current) ro.observe(resultsDockRef.current);

    return () => {
      window.removeEventListener('resize', updateDockRect);
      window.removeEventListener('scroll', updateDockRect, true);
      ro.disconnect();
    };
  }, [markdown, isFullScreen]);

  useEffect(() => {
    if (!isFullScreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isFullScreen]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or text to generate a mind map.');
      return;
    }

    setLoading(true);
    setError(null);
    setMarkdown('');
    setSelectedNode(null);

    try {
      const result = await generateMindMap(topic);
      setMarkdown(result);
    } catch (err) {
      setError('Failed to generate mind map. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = async (text: string) => {
      console.log("Node clicked:", text);
      setSelectedNode({ text, details: null, loading: true });
      
      try {
          const details = await fetchNodeDetails(text, topic);
          setSelectedNode(prev => prev && prev.text === text ? { ...prev, details, loading: false } : prev);
      } catch (e) {
          console.error(e);
          setSelectedNode(prev => prev && prev.text === text ? { ...prev, details: "Failed to load details.", loading: false } : prev);
      }
  };

  const closePopup = () => setSelectedNode(null);

  const handleCopyMarkdown = () => {
    if (markdown) {
      navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  // Simplified variants - ensure visible by default
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
    <div className="p-4 md:p-8 bg-gray-50 min-h-full">
      <motion.div
        initial="visible" 
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-2xl">
              <ShareIcon className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Mind Map Generator
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Visualize complex topics instantly. Enter a subject, and let AI structure it for you.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 md:p-8 border border-gray-100"
        >
          <label htmlFor="topic" className="block text-gray-700 font-semibold mb-3">
            What do you want to visualize?
          </label>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              id="topic"
              type="text"
              className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400 font-medium"
              placeholder="e.g. History of Pakistan, Photosynthesis, CSS Exam Syllabus..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={loading || !isReady}
              className={`
                px-8 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all whitespace-nowrap
                ${(loading || !isReady) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'}
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  <span>Generate Map</span>
                </>
              )}
            </motion.button>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Results Section */}
        {markdown && isReady && (
          <>
            <div
              ref={resultsDockRef}
              className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100"
            >
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <DocumentIcon className="w-5 h-5 text-purple-500" />
                  Mind Map
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-white border border-gray-200 text-gray-400"
                    title="Full Screen"
                    disabled
                  >
                    <MaximizeIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-white border border-gray-200 text-gray-400"
                    title="Copy Markdown"
                    disabled
                  >
                    <DocumentIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white p-4">
                <div className="h-[600px]" />
              </div>

              <div className="p-4 bg-gray-50 text-xs text-gray-500 text-center border-t border-gray-100">
                Tip: Click on any node to see detailed explanation. Use toolbar to zoom/pan.
              </div>
            </div>

            {(dockRect || isFullScreen) &&
              createPortal(
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={
                    isFullScreen
                      ? { top: 0, left: 0, width: '100vw', height: '100vh' }
                      : dockRect
                        ? { top: dockRect.top, left: dockRect.left, width: dockRect.width, height: dockRect.height }
                        : { display: 'none' }
                  }
                  className={`fixed bg-white flex flex-col ${isFullScreen ? 'z-[100]' : 'z-[20] rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100'}`}
                >
                  <div className={`p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center ${isFullScreen ? 'shadow-sm z-10' : ''}`}>
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                      <DocumentIcon className="w-5 h-5 text-purple-500" />
                      {isFullScreen ? 'Mind Map (Full Screen)' : 'Mind Map'}
                    </h3>
                    <div className="flex gap-2">
                      {isFullScreen ? (
                        <button
                          onClick={() => setIsFullScreen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                          title="Exit Full Screen"
                        >
                          <MinimizeIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">Exit</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsFullScreen(true)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                          title="Full Screen"
                        >
                          <MaximizeIcon className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={handleCopyMarkdown}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                        title="Copy Markdown"
                      >
                        {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <DocumentIcon className="w-4 h-4" />}
                        {copied ? 'Copied' : <span className="hidden sm:inline">Copy Text</span>}
                      </button>
                    </div>
                  </div>

                  <div className={isFullScreen ? 'flex-1 relative overflow-hidden bg-white' : 'bg-white p-4'}>
                    {transformerRef.current && (
                      <MindMapViewer
                        markdown={markdown}
                        transformer={transformerRef.current}
                        onNodeClick={handleNodeClick}
                        className={isFullScreen ? 'h-full border-none rounded-none' : undefined}
                      />
                    )}
                  </div>

                  {!isFullScreen && (
                    <div className="p-4 bg-gray-50 text-xs text-gray-500 text-center border-t border-gray-100">
                      Tip: Click on any node to see detailed explanation. Use toolbar to zoom/pan.
                    </div>
                  )}
                </motion.div>,
                document.body
              )}
          </>
        )}

        {/* Node Detail Popup */}
        {createPortal(
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={closePopup}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[80vh] flex flex-col"
                        >
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{selectedNode.text}</h3>
                                <button onClick={closePopup} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                    <CrossIcon className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto">
                                {selectedNode.loading ? (
                                    <div className="flex flex-col items-center justify-center py-8 space-y-3">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                        <p className="text-sm text-gray-500 animate-pulse">Consulting AI Tutor...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-sm prose-purple max-w-none">
                                        <ReactMarkdown>{selectedNode.details || "No details available."}</ReactMarkdown>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                                 <button 
                                    onClick={closePopup}
                                    className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
                                 >
                                    Close
                                 </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>,
            document.body
        )}
      </motion.div>
    </div>
  );
};

export default AiMindMapGenerator;
