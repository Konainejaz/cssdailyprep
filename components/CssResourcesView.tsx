import React, { useState } from 'react';
import { CSS_RESOURCES } from '../constants';
import { SearchIcon, GlobeIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  onSelect: (prompt: string, title: string, context?: string) => void;
  onOpenInterviewPrep: () => void;
  onOpenSubjectSelection: () => void;
}

const CssResourcesView: React.FC<Props> = ({ onSelect, onOpenInterviewPrep, onOpenSubjectSelection }) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filtered = CSS_RESOURCES.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleClick = (item: typeof CSS_RESOURCES[0]) => {
    if (item.id === 'cr-3') {
      onOpenInterviewPrep();
    } else if (item.id === 'cr-4') {
      onOpenSubjectSelection();
    } else {
      onSelect(item.prompt, item.title, item.category);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 md:px-6 py-6 md:py-8 bg-gray-50 border-b border-gray-100">
        <h1 className="text-2xl md:text-3xl font-bold font-serif text-gray-900 mb-4 md:mb-6">{t('cssResources')}</h1>
        <div className="relative max-w-2xl">
           <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
           <input 
              className="w-full bg-white border-gray-200 rounded-xl py-3 pl-12 pr-4 text-[16px] md:text-base focus:ring-2 focus:ring-pakGreen-500 shadow-sm"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
           />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-4xl space-y-4">
          {filtered.map(item => (
            <div 
              key={item.id} 
              onClick={() => handleClick(item)}
              className="flex items-start md:items-center p-4 rounded-xl border border-gray-100 hover:border-pakGreen-200 hover:bg-pakGreen-50/30 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-pakGreen-100 group-hover:text-pakGreen-600 transition-colors shrink-0 mt-1 md:mt-0">
                <GlobeIcon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="ml-3 md:ml-4 flex-1">
                <h3 className="font-bold text-base md:text-lg text-gray-900 group-hover:text-pakGreen-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5 line-clamp-2 md:line-clamp-none">
                  {item.prompt}
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
