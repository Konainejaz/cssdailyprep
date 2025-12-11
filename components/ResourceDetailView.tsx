import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronLeftIcon, PlusIcon } from './Icons';

interface Props {
  title: string;
  content: string;
  isLoading: boolean;
  onBack: () => void;
  onSaveNote: (title: string, content: string) => void;
}

const ResourceDetailView: React.FC<Props> = ({ title, content, isLoading, onBack, onSaveNote }) => {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-gray-50 animate-fade-in">
        <div className="px-6 py-6 bg-white border-b border-gray-100 flex items-center justify-between">
            <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeftIcon className="w-6 h-6" />
            </button>
             <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
             <div className="w-10"></div>
        </div>
        <div className="flex-1 p-8 flex justify-center">
             <div className="max-w-3xl w-full space-y-4">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-32 w-full bg-gray-100 rounded animate-pulse mt-8"></div>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="px-6 py-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4 flex-1 min-w-0">
            <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
            <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold font-serif text-gray-900 truncate">{title}</h1>
        </div>
        <button 
          onClick={() => onSaveNote(title, content)}
          className="p-2 text-pakGreen-600 hover:bg-pakGreen-50 rounded-full transition-colors flex-shrink-0 ml-2"
          title="Save as Note"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 animate-slide-up">
          <div className="prose prose-pakGreen prose-lg max-w-none text-gray-700 font-serif leading-relaxed">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailView;
