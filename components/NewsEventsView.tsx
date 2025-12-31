import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import { BellIcon, GlobeIcon, CalendarIcon } from './Icons';
import { LinkItem, NEWS_EVENTS } from '../constants';

type Props = {
  searchQuery?: string;
  items?: LinkItem[];
  title?: string;
  subtitle?: string;
};

const NewsEventsView: React.FC<Props> = ({ searchQuery = '', items, title = 'News & Events', subtitle = 'Official portals and trusted resources with direct links' }) => {
  const data = items && Array.isArray(items) ? items : ([...NEWS_EVENTS] as unknown as LinkItem[]);
  const [selected, setSelected] = useState<LinkItem | null>(null);
  const [activeType, setActiveType] = useState<string>('All');

  const types = useMemo(() => {
    const set = new Set<string>();
    for (const item of data) set.add(item.type);
    return ['All', ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.filter(item => {
      if (activeType !== 'All' && item.type !== activeType) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q)
      );
    });
  }, [activeType, data, searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-8 space-y-4 sm:space-y-6">
        <motion.div variants={itemVariants} className="rounded-2xl sm:rounded-3xl border border-gray-200 bg-white overflow-hidden">
          <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur">
                <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-white/70 text-xs sm:text-sm">{subtitle}</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-5 flex flex-wrap gap-1.5 sm:gap-2">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold transition ${
                    activeType === type ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {filtered.map((item, idx) => (
                  <motion.button
                    key={item.id}
                    variants={itemVariants}
                    whileHover={{ rotateX: 6, rotateY: -6, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    style={{ perspective: 1000 }}
                    onClick={() => setSelected(item)}
                    className="text-left rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-lg hover:border-gray-300 transition transform-style-3d"
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-500">{item.source}</span>
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-pakGreen-700 bg-pakGreen-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                            {item.type}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-snug">{item.title}</h3>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                        <GlobeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                      <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{item.date}</span>
                      <span className="text-gray-300">•</span>
                      <span className="truncate">{item.url}</span>
                    </div>

                    <div className="mt-3 sm:mt-4 h-1 sm:h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pakGreen-600 to-emerald-500 progress-bar-${idx % 4}" />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 text-gray-500 text-sm sm:text-base">
                No matching news/resources found.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selected && (
          <Modal
            open={true}
            title={selected.title}
            description={`${selected.source} • ${selected.type}`}
            onClose={() => setSelected(null)}
            primaryAction={{
              label: 'Open link',
              onClick: () => {
                window.open(selected.url, '_blank', 'noopener,noreferrer');
                setSelected(null);
              },
              variant: 'primary',
            }}
            secondaryAction={{
              label: 'Close',
              onClick: () => setSelected(null),
              variant: 'neutral',
            }}
          >
            <div className="space-y-3">
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>{selected.date}</span>
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-2 break-all">
                <GlobeIcon className="w-4 h-4" />
                <span>{selected.url}</span>
              </div>
              <div className="text-sm text-gray-500">
                Tip: Use this as an official reference while preparing notes and essays.
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NewsEventsView;
