import React from 'react';
import { StudyTimelineItem } from '../types';
import { ChevronLeftIcon } from './Icons';

interface Props {
  items: StudyTimelineItem[];
  isLoading: boolean;
  onBack: () => void;
}

const StudyTimelineView: React.FC<Props> = ({ items, isLoading, onBack }) => {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 py-6 bg-white border-b border-gray-100 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-serif text-gray-900">Current Affairs Timeline</h1>
          <p className="text-sm text-gray-500">Major Events & Milestones</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-24 h-6 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-24 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative border-l-2 border-pakGreen-200 ml-4 md:ml-6 space-y-8 md:space-y-12 pl-6 md:pl-10 py-4">
              {items.map((item, index) => (
                <div key={index} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-[33px] md:-left-[49px] top-1 w-4 h-4 rounded-full border-2 border-pakGreen-500 bg-white group-hover:bg-pakGreen-500 transition-colors z-10" />
                  
                  {/* Date Badge */}
                  <span className="inline-block px-3 py-1 bg-pakGreen-50 text-pakGreen-700 text-xs font-bold rounded-full mb-2 border border-pakGreen-100">
                    {item.date}
                  </span>

                  {/* Card */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-pakGreen-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                    {item.category && (
                      <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400 font-medium uppercase tracking-wider">
                        {item.category}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyTimelineView;
