import React from 'react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  return (
    <div 
      onClick={() => onClick(article)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4 active:scale-[0.98] transition-transform duration-200 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold text-pakGreen-600 bg-pakGreen-50 px-2 py-1 rounded-full uppercase tracking-wider">
          {article.source}
        </span>
        <span className="text-xs text-gray-400">{article.date}</span>
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight font-serif">
        {article.title}
      </h3>
      
      <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
        {article.summary}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex gap-2">
          {article.tags.slice(0, 2).map(tag => (
            <span key={tag} className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
              #{tag}
            </span>
          ))}
        </div>
        <span>{article.readTime} read</span>
      </div>
    </div>
  );
};

export default ArticleCard;
