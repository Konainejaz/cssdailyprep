import React, { useState, useEffect } from 'react';
import { STUDY_MATERIALS } from '../constants';
import { CheckIcon } from './Icons';

interface Props {
  onSelect: (item: typeof STUDY_MATERIALS[0]) => void;
  searchQuery?: string;
}

const StudyMaterialView: React.FC<Props> = ({ onSelect, searchQuery = '' }) => {
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
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item)}
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
