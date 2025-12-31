import React, { useMemo, useState } from 'react';
import { ResourceItem } from '../constants';
import { ChevronLeftIcon, GlobeIcon } from './Icons';

interface Props {
  onSelectItem: (item: ResourceItem) => void;
  onOpenInterviewPrep: () => void;
  onOpenSubjectSelection: () => void;
  onBack?: () => void;
  title?: string;
  enableCategoryNav?: boolean;
  searchQuery?: string;
  items: ResourceItem[];
}

const CssResourcesView: React.FC<Props> = ({
  onSelectItem,
  onOpenInterviewPrep,
  onOpenSubjectSelection,
  onBack,
  title,
  enableCategoryNav = false,
  searchQuery = '',
  items,
}) => {
  const data: ResourceItem[] = items && Array.isArray(items) ? items : [];

  const categories = useMemo(() => {
    if (!enableCategoryNav) return [];
    const set = new Set<string>();
    for (const item of data) {
      if (item.category) set.add(item.category);
    }
    return ['All', ...Array.from(set)];
  }, [data, enableCategoryNav]);

  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return data.filter((m) => {
      const matchesQuery =
        (m.title || '').toLowerCase().includes(q) ||
        (m.category || '').toLowerCase().includes(q);

      if (!matchesQuery) return false;
      if (!enableCategoryNav) return true;
      if (activeCategory === 'All') return true;
      return (m.category || '') === activeCategory;
    });
  }, [data, searchQuery, enableCategoryNav, activeCategory]);

  const handleClick = (item: ResourceItem) => {
    if (item.id === 'cr-3') onOpenInterviewPrep();
    else if (item.id === 'cr-4') onOpenSubjectSelection();
    else onSelectItem(item);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {(title || enableCategoryNav) && (
        <div className="shrink-0 px-4 md:px-6 py-4 border-b border-gray-100 bg-white">
          {title && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:border-pakGreen-200 hover:bg-pakGreen-50/30 transition-colors flex items-center justify-center text-gray-700"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                )}
                <h2 className="text-lg md:text-2xl font-serif font-bold text-gray-900 truncate">{title}</h2>
              </div>
              <div className="text-xs md:text-sm text-gray-500">{filtered.length}</div>
            </div>
          )}
          {enableCategoryNav && categories.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    activeCategory === c
                      ? 'bg-pakGreen-600 text-white border-pakGreen-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-pakGreen-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-4xl space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className="flex items-start md:items-center p-4 rounded-xl border border-gray-100 hover:border-pakGreen-200 hover:bg-pakGreen-50/30 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-pakGreen-100 group-hover:text-pakGreen-600 transition-colors shrink-0 mt-1 md:mt-0">
                <GlobeIcon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="ml-3 md:ml-4 flex-1 min-w-0">
                <h3 className="font-bold text-base md:text-lg text-gray-900 group-hover:text-pakGreen-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5 line-clamp-2 md:line-clamp-none">
                  {item.summary || ''}
                </p>
              </div>
              <span className="hidden md:inline-block text-xs font-medium text-gray-400 border border-gray-200 px-3 py-1 rounded-full ml-2">
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CssResourcesView;
