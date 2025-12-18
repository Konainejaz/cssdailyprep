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
import { addToHistory, logAction } from '../services/historyService';

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
    <div ref={containerRef} className={`relative w-full border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden bg-gray-50 ${className || 'h-[400px] sm:h-[500px] md:h-[600px]'}`}>
      <svg ref={ref} className="w-full h-full block" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

interface Props {
  initialTopic?: string;
  initialMarkdown?: string;
}

const AiMindMapGenerator: React.FC<Props> = ({ initialTopic, initialMarkdown }) => {
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
    if (typeof initialTopic === 'string') setTopic(initialTopic);
    if (typeof initialMarkdown === 'string') setMarkdown(initialMarkdown);
  }, [initialTopic, initialMarkdown]);

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
      logAction('mind_map_started', 'ai_mind_map', undefined, { topic });
      const result = await generateMindMap(topic);
      setMarkdown(result);
      addToHistory(topic.trim().slice(0, 120), 'ai_mind_map', { topic: topic.trim(), markdown: result });
      logAction('mind_map_completed', 'ai_mind_map', undefined, { topic, length: result?.length ?? 0 });
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
          logAction('mind_map_node_opened', 'ai_mind_map', undefined, { topic, node: text });
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
    <div className="p-2 sm:p-3 md:p-4 lg:p-8 bg-gray-50 min-h-screen">
      <motion.div
        initial="visible" 
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto space-y-4 sm:space-y-6 md:space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-2 sm:space-y-3 md:space-y-4 px-2 sm:px-0">
          <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
            <div className="p-1 sm:p-1.5 md:p-2 lg:p-3 bg-purple-100 rounded-xl sm:rounded-2xl flex-shrink-0">
              <ShareIcon className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-purple-600" />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold text-gray-900 tracking-tight flex-1 min-w-0">
              Mind Map Generator
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4">
            Visualize complex topics instantly. Enter a subject, and let AI structure it for you.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl shadow-gray-200/50 p-2 sm:p-3 md:p-4 lg:p-6 lg:p-8 border border-gray-100 mx-2 sm:mx-0"
        >
          <label htmlFor="topic" className="block text-gray-700 font-semibold mb-1.5 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-base">
            What do you want to visualize?
          </label>
          <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 lg:flex-row lg:items-center lg:gap-4">
            <input
              id="topic"
              type="text"
              className="flex-1 p-2 sm:p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-1 sm:focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400 font-medium text-xs sm:text-sm md:text-base min-h-[44px] sm:min-h-[48px] md:min-h-[56px]"
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
                px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-bold text-white flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg transition-all whitespace-nowrap text-xs sm:text-sm md:text-base min-h-[44px] sm:min-h-[48px] md:min-h-[56px] lg:w-auto lg:flex-shrink-0
                ${(loading || !isReady) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'}
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Generating...</span><span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Generate Map</span><span className="sm:hidden">Generate</span>
                </>
              )}
            </motion.button>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 sm:mt-4 p-2 sm:p-3 md:p-4 bg-red-50 text-red-600 rounded-lg sm:rounded-xl border border-red-100 flex items-center gap-2 sm:gap-3"
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 shrink-0" />
              <p className="text-[10px] sm:text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Results Section */}
        {markdown && isReady && (
          <>
            <div
              ref={resultsDockRef}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 mx-2 sm:mx-0"
            >
              <div className="p-1.5 sm:p-2 md:p-3 lg:p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 flex items-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base">
                  <DocumentIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-purple-500" />
                  <span className="truncate">Mind Map</span>
                </h3>
                <div className="flex gap-1 sm:gap-1.5 md:gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-1 sm:px-1.5 md:px-2 lg:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold bg-white border border-gray-200 text-gray-400 min-h-[32px] sm:min-h-[36px] md:min-h-[40px]"
                    title="Full Screen"
                    disabled
                  >
                    <MaximizeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-1 sm:px-1.5 md:px-2 lg:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold bg-white border border-gray-200 text-gray-400 min-h-[32px] sm:min-h-[36px] md:min-h-[40px]"
                    title="Copy Markdown"
                    disabled
                  >
                    <DocumentIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white p-1 sm:p-1.5 md:p-2 lg:p-4">
                <div className="h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px]" />
              </div>

              <div className="p-1.5 sm:p-2 md:p-3 lg:p-4 bg-gray-50 text-[9px] sm:text-xs text-gray-500 text-center border-t border-gray-100">
                <span className="hidden sm:inline">Tip: Click on any node to see detailed explanation. Use toolbar to zoom/pan.</span>
                <span className="sm:hidden">Tap nodes • Toolbar to zoom</span>
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
                  className={`fixed bg-white flex flex-col ${isFullScreen ? 'z-[100]' : 'z-[20] rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100'}`}
                >
                  <div className={`p-1.5 sm:p-2 md:p-3 lg:p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center ${isFullScreen ? 'shadow-sm z-10' : ''}`}>
                    <h3 className="font-bold text-gray-700 flex items-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base">
                      <DocumentIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-purple-500" />
                      <span className="truncate">{isFullScreen ? 'Mind Map (Full Screen)' : 'Mind Map'}</span>
                    </h3>
                    <div className="flex gap-1 sm:gap-1.5 md:gap-2">
                      {isFullScreen ? (
                        <button
                          onClick={() => setIsFullScreen(false)}
                          className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-1 sm:px-1.5 md:px-2 lg:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all min-h-[32px] sm:min-h-[36px] md:min-h-[40px]"
                          title="Exit Full Screen"
                        >
                          <MinimizeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                          <span className="hidden sm:inline">Exit</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsFullScreen(true)}
                          className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-1 sm:px-1.5 md:px-2 lg:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all min-h-[32px] sm:min-h-[36px] md:min-h-[40px]"
                          title="Full Screen"
                        >
                          <MaximizeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                        </button>
                      )}

                      <button
                        onClick={handleCopyMarkdown}
                        className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-1 sm:px-1.5 md:px-2 lg:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all min-h-[32px] sm:min-h-[36px] md:min-h-[40px]"
                        title="Copy Markdown"
                      >
                        {copied ? <CheckIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-green-600" /> : <DocumentIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />}
                        {copied ? <span className="hidden sm:inline">Copied</span> : <span className="hidden sm:inline">Copy Text</span>}
                      </button>
                    </div>
                  </div>

                  <div className={isFullScreen ? 'flex-1 relative overflow-hidden bg-white' : 'bg-white p-2 sm:p-3 md:p-4'}>
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
                    <div className="p-1.5 sm:p-2 md:p-3 lg:p-4 bg-gray-50 text-[9px] sm:text-xs text-gray-500 text-center border-t border-gray-100">
                      <span className="hidden sm:inline">Tip: Click on any node to see detailed explanation. Use toolbar to zoom/pan.</span>
                      <span className="sm:hidden">Tap nodes • Toolbar to zoom</span>
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
                        className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm"
                        onClick={closePopup}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[85vh] sm:max-h-[80vh] flex flex-col"
                        >
                            <div className="p-3 sm:p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-800 line-clamp-1">{selectedNode.text}</h3>
                                <button onClick={closePopup} className="p-1 sm:p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                                    <CrossIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                </button>
                            </div>
                            
                            <div className="p-3 sm:p-4 md:p-6 overflow-y-auto">
                                {selectedNode.loading ? (
                                    <div className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-2 sm:space-y-3">
                                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600"></div>
                                        <p className="text-xs sm:text-sm text-gray-500 animate-pulse">Consulting AI Tutor...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-xs sm:prose-sm prose-purple max-w-none">
                                        <ReactMarkdown>{selectedNode.details || "No details available."}</ReactMarkdown>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50 text-right">
                                 <button 
                                    onClick={closePopup}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
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
