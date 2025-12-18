import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
  index?: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick, index = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);

  // 3D Tilt Configuration
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for tilt to prevent jitter
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Enhanced tilt range for "nice 3D effect"
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.05,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(article)}
      className="relative group perspective-1000 cursor-pointer h-full"
    >
      {/* Moving Gradient Border - Sharp and Distinct */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] bg-[conic-gradient(from_90deg,transparent_0deg,transparent_180deg,#16a34a_240deg,#22c55e_360deg)] animate-spin-slow" />
      </div>

      {/* Content Card */}
      <div 
        className={`
          relative h-full bg-white rounded-xl p-5 md:p-6 
          transition-all duration-300 ease-out
          border border-gray-100
          shadow-md group-hover:shadow-xl
          group-hover:border-transparent
          z-10
          m-[2px] 
        `}
        style={{ 
          transform: "translateZ(20px)", 
          backfaceVisibility: 'hidden', // Fixes text blurriness during 3D transform
          WebkitFontSmoothing: 'subpixel-antialiased',
        }} 
      >
        {/* Header: Source & Date */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <span 
            className="text-[10px] md:text-xs font-bold text-pakGreen-700 bg-pakGreen-50 border border-pakGreen-100 px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm transition-transform group-hover:scale-105"
          >
            {article.source}
          </span>
          <span className="text-[10px] md:text-xs font-medium text-gray-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            {article.date}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 leading-snug font-serif group-hover:text-pakGreen-700 transition-colors duration-200">
          {article.title}
        </h3>
        
        {/* Summary */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-5 leading-relaxed relative z-10">
          {article.summary}
        </p>
        
        {/* Footer: Tags & Read Time */}
        <div className="flex items-end justify-between text-xs mt-auto pt-4 border-t border-gray-50 relative z-10">
          <div className="flex gap-2 flex-wrap">
            {article.tags.slice(0, 2).map(tag => (
              <span key={tag} className="bg-gray-50 text-gray-500 px-2.5 py-1 rounded-md font-medium border border-gray-100 group-hover:border-pakGreen-100 group-hover:text-pakGreen-600 transition-colors">
                #{tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 font-medium">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             {article.readTime}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticleCard;
