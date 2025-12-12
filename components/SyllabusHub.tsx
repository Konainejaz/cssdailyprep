import React, { useState } from 'react';
import { ChevronLeftIcon, BookIcon } from './Icons';

interface Props {
  onBack: () => void;
  onOpenGenderStudies: () => void;
}

const SyllabusHub: React.FC<Props> = ({ onBack, onOpenGenderStudies }) => {
  const [open, setOpen] = useState<'opt' | 'comp' | null>('opt');
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="px-6 py-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold font-serif text-gray-900 truncate">Syllabus</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Optional Syllabus */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setOpen(o => o === 'opt' ? null : 'opt')} className="w-full flex items-center justify-between px-6 py-4">
              <span className="text-lg md:text-xl font-serif font-bold text-gray-900">Optional Syllabus</span>
              <span className={`transition-transform ${open === 'opt' ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {open === 'opt' && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button 
                    onClick={onOpenGenderStudies}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-pakGreen-200 hover:bg-pakGreen-50/30 transition-all text-left"
                  >
                    <BookIcon className="w-5 h-5 text-pakGreen-600" />
                    <div>
                      <div className="font-bold text-gray-900">Gender Studies</div>
                      <div className="text-xs text-gray-500">Complete syllabus (interactive)</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Compulsory Syllabus */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setOpen(o => o === 'comp' ? null : 'comp')} className="w-full flex items-center justify-between px-6 py-4">
              <span className="text-lg md:text-xl font-serif font-bold text-gray-900">Compulsory Syllabus</span>
              <span className={`transition-transform ${open === 'comp' ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {open === 'comp' && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400">
                    <BookIcon className="w-5 h-5" />
                    <div>
                      <div className="font-bold">Essay</div>
                      <div className="text-xs">Coming soon</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400">
                    <BookIcon className="w-5 h-5" />
                    <div>
                      <div className="font-bold">Pak Affairs</div>
                      <div className="text-xs">Coming soon</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyllabusHub;
