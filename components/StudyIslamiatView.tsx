import React from 'react';
import { StudyIslamiatItem } from '../types';
import { ChevronLeftIcon } from './Icons';

interface Props {
  items: StudyIslamiatItem[];
  isLoading: boolean;
  onBack: () => void;
}

const StudyIslamiatView: React.FC<Props> = ({ items, isLoading, onBack }) => {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 py-6 bg-white border-b border-gray-100 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-serif text-gray-900">Islamiat References</h1>
          <p className="text-sm text-gray-500">Quranic Verses & Hadiths</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100"></div>
               ))}
            </div>
          ) : (
            items.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header / Reference */}
                <div className="bg-pakGreen-50 px-6 py-3 border-b border-pakGreen-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-pakGreen-800 tracking-wide">
                    {item.reference}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-pakGreen-400"></div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {/* Arabic */}
                  <div className="text-right font-serif text-2xl md:text-3xl leading-loose text-gray-900" dir="rtl">
                    {item.arabic}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-gray-100 flex-1"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    <div className="h-px bg-gray-100 flex-1"></div>
                  </div>

                  {/* Translation */}
                  <div>
                    <p className="text-lg text-gray-800 font-serif leading-relaxed italic">
                      "{item.translation}"
                    </p>
                  </div>

                  {/* Context */}
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed border border-gray-100">
                    <strong className="text-gray-900 block mb-1">Context for CSS:</strong>
                    {item.context}
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

export default StudyIslamiatView;
