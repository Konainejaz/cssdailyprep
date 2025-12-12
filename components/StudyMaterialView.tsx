import React, { useState, useEffect } from 'react';
import { STUDY_MATERIALS } from '../constants';
import { SearchIcon, CheckIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  onSelect: (prompt: string, title: string, context?: string) => void;
  onOpenSyllabus?: () => void;
}

const StudyMaterialView: React.FC<Props> = ({ onSelect, onOpenSyllabus }) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('study-completed');
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newCompleted = completed.includes(id) 
      ? completed.filter(c => c !== id)
      : [...completed, id];
    setCompleted(newCompleted);
    localStorage.setItem('study-completed', JSON.stringify(newCompleted));
  };

  const filtered = STUDY_MATERIALS.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="px-6 py-8 bg-white border-b border-gray-100">
        <h1 className="text-3xl font-bold font-serif text-gray-900 mb-6">{t('studyMaterial')}</h1>
        <div className="relative max-w-2xl">
           <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
           <input 
              className="w-full bg-gray-100 border-none rounded-xl py-3 pl-12 pr-4 text-base focus:ring-2 focus:ring-pakGreen-500"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
           />
        </div>
        {onOpenSyllabus && (
          <div className="mt-4">
            <button 
              onClick={onOpenSyllabus}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pakGreen-600 text-white text-sm font-bold shadow hover:bg-pakGreen-700"
            >
              {t('syllabus')}
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item.prompt, item.title, item.category)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-pakGreen-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pakGreen-600 bg-pakGreen-50 px-2 py-1 rounded-full">
                  {item.category}
                </span>
                <button 
                  onClick={(e) => toggleComplete(item.id, e)}
                  className={`p-1 rounded-full ${completed.includes(item.id) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'}`}
                >
                  <CheckIcon className="w-5 h-5" />
                </button>
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2 font-serif group-hover:text-pakGreen-700 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                {item.prompt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyMaterialView;
