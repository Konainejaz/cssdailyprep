import React, { useEffect, useState } from 'react';
import { fetchSearchHistory, SearchHistoryItem, clearHistory } from '../services/historyService';
import { ChevronLeftIcon, TrashIcon, SearchIcon, BookIcon, GlobeIcon, ClockIcon } from './Icons';
import Modal from './Modal';

interface HistoryViewProps {
  onBack: () => void;
  onSelect: (item: SearchHistoryItem) => void;
  searchQuery?: string;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onBack, onSelect, searchQuery = '' }) => {
  const [items, setItems] = useState<SearchHistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    loadHistory();
    setAnimating(true);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => 
        item.query.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    }
  }, [searchQuery, items]);

  const loadHistory = async () => {
    setLoading(true);
    const data = await fetchSearchHistory();
    setItems(data);
    setFilteredItems(data);
    setLoading(false);
  };

  const handleClear = async () => {
    setClearModalOpen(true);
  };

  const confirmClear = async () => {
    setIsClearing(true);
    try {
      await clearHistory();
      setItems([]);
      setFilteredItems([]);
      setClearModalOpen(false);
    } finally {
      setIsClearing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
      if (diff < 60 * 60 * 1000) {
        const mins = Math.floor(diff / (60 * 1000));
        return `${mins} min${mins !== 1 ? 's' : ''} ago`;
      }
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Yesterday
    if (date.getDate() === now.getDate() - 1) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50/50 relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pakGreen-100/50 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-72 h-72 bg-blue-50/50 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-5xl mx-auto w-full px-3 sm:px-4 md:px-8 py-4 sm:py-6">
        
        {/* Actions Bar */}
        {items.length > 0 && (
          <div className="flex justify-end mb-3 sm:mb-4 animate-fade-in-down">
             <button 
               onClick={handleClear}
               className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors border border-red-100 hover:border-red-200 text-xs sm:text-sm font-bold shadow-sm bg-white"
               title="Clear All History"
             >
               <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Clear History</span><span className="xs:hidden">Clear</span>
             </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 -mr-1 sm:-mr-2 pb-8 sm:pb-10 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-64 space-y-3 sm:space-y-4">
               <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-pakGreen-100 border-t-pakGreen-600 rounded-full animate-spin"></div>
               <p className="text-gray-400 font-medium text-sm sm:text-base">Loading your journey...</p>
             </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {filteredItems.map((item, index) => (
                <div 
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className={`
                    group bg-white p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-pakGreen-200 
                    transition-all duration-300 cursor-pointer flex flex-col gap-2 sm:gap-3 relative overflow-hidden
                    ${animating ? `animate-fade-in-up animation-delay-${Math.min(index, 19)}` : ''}
                  `}
                >
                  <div className="absolute top-0 right-0 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full -mr-6 sm:-mr-8 md:-mr-10 -mt-6 sm:-mt-8 md:-mt-10 transition-colors group-hover:from-pakGreen-50/50"></div>

                  <div className="flex justify-between items-start relative z-10">
                    <div className="bg-gray-50 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl group-hover:bg-pakGreen-50 group-hover:text-pakGreen-600 transition-colors text-gray-400">
                      {item.type === 'research' ? <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <BookIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full group-hover:bg-white group-hover:shadow-sm transition-all">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base md:text-lg line-clamp-2 group-hover:text-pakGreen-700 transition-colors mb-1">
                      {item.query}
                    </h3>
                    <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-400">
                      <span className="uppercase tracking-wider font-semibold">{item.type}</span>
                      {item.result_snapshot?.mindMap && (
                        <span className="flex items-center gap-0.5 sm:gap-1 text-blue-500 bg-blue-50 px-1 sm:px-1.5 py-0.5 rounded">
                          <GlobeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden xs:inline">Mind Map</span><span className="xs:hidden">Map</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 sm:py-16 md:py-20">
              <div className="bg-white p-4 sm:p-6 rounded-full shadow-lg shadow-gray-100 mb-4 sm:mb-6">
                <ClockIcon className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No history found</h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto px-4">
                {searchQuery ? `No results for "${searchQuery}"` : "Your research journey starts here. Search for any topic to see it appear in your history."}
              </p>
              {searchQuery && (
                <div className="mt-4 sm:mt-6 text-pakGreen-600 font-bold text-sm sm:text-base">
                   Try a different search query
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={clearModalOpen}
        title="Clear history?"
        description="This will remove your entire history from your account."
        onClose={() => setClearModalOpen(false)}
        primaryAction={{
          label: isClearing ? 'Clearing...' : 'Clear',
          onClick: confirmClear,
          variant: 'danger',
          disabled: isClearing,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setClearModalOpen(false),
          disabled: isClearing,
        }}
      />
    </div>
  );
};

export default HistoryView;
