import React, { useState } from 'react';
import { StudyEssayItem } from '../types';
import { ChevronLeftIcon, BookIcon } from './Icons';

interface Props {
  items: StudyEssayItem[];
  isLoading: boolean;
  onBack: () => void;
}

const StudyEssaysView: React.FC<Props> = ({ items, isLoading, onBack }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 py-6 bg-white border-b border-gray-100 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-serif text-gray-900">Important Essays</h1>
          <p className="text-sm text-gray-500">Predicted Topics & Outlines</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-24 bg-white rounded-xl border border-gray-100"></div>
               ))}
            </div>
          ) : (
            items.map((item, index) => (
              <div 
                key={index}
                className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
                  expandedIndex === index 
                    ? 'border-pakGreen-500 ring-1 ring-pakGreen-500 shadow-md' 
                    : 'border-gray-100 shadow-sm hover:border-pakGreen-200'
                }`}
              >
                <div 
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="p-5 flex items-start gap-4 cursor-pointer"
                >
                  <div className={`mt-1 p-2 rounded-lg transition-colors ${expandedIndex === index ? 'bg-pakGreen-100 text-pakGreen-700' : 'bg-gray-100 text-gray-500'}`}>
                    <BookIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg font-serif transition-colors ${expandedIndex === index ? 'text-pakGreen-800' : 'text-gray-900'}`}>
                      {item.title}
                    </h3>
                    {!expandedIndex && (
                       <p className="text-sm text-gray-500 mt-1">Tap to view outline</p>
                    )}
                  </div>
                  <div className={`transition-transform duration-300 text-gray-400 ${expandedIndex === index ? 'rotate-90 text-pakGreen-600' : ''}`}>
                    <ChevronLeftIcon className="w-5 h-5 rotate-180" />
                  </div>
                </div>

                {/* Outline (Expanded) */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    expandedIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-0 ml-[3.5rem]">
                      <div className="h-px bg-gray-100 mb-4" />
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Essay Outline</h4>
                      <ul className="space-y-2">
                        {item.outline.map((point, i) => (
                          <li key={i} className="flex gap-3 text-gray-700 text-sm leading-relaxed">
                            <span className="text-pakGreen-500 font-bold">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyEssaysView;
