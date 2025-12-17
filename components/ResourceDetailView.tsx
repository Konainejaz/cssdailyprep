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
