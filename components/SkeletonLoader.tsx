import React from 'react';

export const ArticleSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-4 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
      <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
      
      <div className="space-y-2 flex-1">
        <div className="h-3 w-full bg-gray-100 rounded"></div>
        <div className="h-3 w-full bg-gray-100 rounded"></div>
        <div className="h-3 w-5/6 bg-gray-100 rounded"></div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
        <div className="h-3 w-24 bg-gray-100 rounded"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
};

export const StudyMaterialSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse h-48">
       <div className="flex justify-between items-start mb-4">
          <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
          <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
       </div>
       <div className="h-4 w-3/4 bg-gray-100 rounded mb-2"></div>
       <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
       <div className="mt-auto pt-6 flex gap-2">
          <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
       </div>
    </div>
  );
};

export const ResourceListSkeleton: React.FC = () => {
  return (
    <div className="flex items-center p-4 rounded-xl border border-gray-100 animate-pulse">
      <div className="h-10 w-10 bg-gray-200 rounded-full mr-4"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
        <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
      </div>
      <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
    </div>
  );
};
