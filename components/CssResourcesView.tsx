import React, { useState } from 'react';
import { CSS_RESOURCES } from '../constants';
import { SearchIcon, GlobeIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  onSelect: (prompt: string, title: string, context?: string) => void;
}

const CssResourcesView: React.FC<Props> = ({ onSelect }) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filtered = CSS_RESOURCES.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-6 py-8 bg-gray-50 border-b border-gray-100">
        <h1 className="text-3xl font-bold font-serif text-gray-900 mb-6">{t('cssResources')}</h1>
        <div className="relative max-w-2xl">
           <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
           <input 
              className="w-full bg-white border-gray-200 rounded-xl py-3 pl-12 pr-4 text-base focus:ring-2 focus:ring-pakGreen-500 shadow-sm"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
           />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl space-y-4">
          {filtered.map(item => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item.prompt, item.title, item.category)}
              className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-pakGreen-200 hover:bg-pakGreen-50/30 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-pakGreen-100 group-hover:text-pakGreen-600 transition-colors shrink-0">
                <GlobeIcon className="w-6 h-6" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-pakGreen-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {item.prompt}
                </p>
              </div>
              <span className="text-xs font-medium text-gray-400 border border-gray-200 px-3 py-1 rounded-full">
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
