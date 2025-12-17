import React from 'react';
import { ViewState } from '../types';
import { StreakData } from '../services/storageService';
import { 
  BookIcon, TrophyIcon, GlobeIcon, NoteIcon, CrossIcon, 
  ListIcon, FireIcon, CalendarIcon, BellIcon, SparklesIcon
} from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  view: ViewState;
  onViewChange: (view: ViewState) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  streak: StreakData;
}

const CSS_NEWS = [
  { title: "CSS 2025 Written Exams", date: "Feb 15, 2025", type: "Exam" },
  { title: "MPT 2025 Result Announced", date: "Nov 20, 2024", type: "Result" },
  { title: "PMS 2024 Final Result", date: "Jan 10, 2025", type: "Result" },
  { title: "CSS 2026 Applications Open", date: "Oct 01, 2025", type: "Apply" },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  view, onViewChange, mobileMenuOpen, setMobileMenuOpen, streak
}) => {
  const { t, language, setLanguage } = useLanguage();
  const { profile, signOut } = useAuth();

  const handleNav = (v: ViewState) => {
    onViewChange(v);
    setMobileMenuOpen(false);
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 md:static md:inset-auto transition-transform duration-200 ease-in-out
      w-72 bg-gray-900 text-gray-300 z-40 flex flex-col border-r border-gray-800 h-full
    `}>
      <div className="p-6 flex items-center justify-between border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white font-serif tracking-tight transition-all duration-300">CSS<span className="text-pakGreen-500">Prep</span></h1>
          {/* Streak Display */}
          <div className="flex items-center gap-2 mt-2 bg-gray-800/50 px-3 py-1 rounded-full w-fit border border-gray-700">
            <FireIcon className={`w-4 h-4 ${streak.count > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-500'}`} />
            <span className="text-xs font-bold text-gray-200">{streak.count} Day Streak</span>
          </div>
        </div>
        <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white transition-colors">
          <CrossIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {/* Main Nav */}
        <div className="space-y-1 mb-8">
           <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">Main Menu</p>
           <button onClick={() => handleNav('FEED')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-all duration-200 ${view === 'FEED' ? 'bg-pakGreen-600 text-white shadow-lg shadow-pakGreen-900/20' : 'hover:bg-gray-800 text-gray-300'}`}>
              <BookIcon className="w-5 h-5" /> {t('dailyFeed')}
           </button>
           <button onClick={() => handleNav('QUIZ')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-all duration-200 ${view === 'QUIZ' ? 'bg-pakGreen-600 text-white shadow-lg shadow-pakGreen-900/20' : 'hover:bg-gray-800 text-gray-300'}`}>
              <TrophyIcon className="w-5 h-5" /> {t('mockExams')}
           </button>
           <button onClick={() => handleNav('RESEARCH')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-all duration-200 ${view === 'RESEARCH' ? 'bg-pakGreen-600 text-white shadow-lg shadow-pakGreen-900/20' : 'hover:bg-gray-800 text-gray-300'}`}>
              <GlobeIcon className="w-5 h-5" /> {t('researchLab')}
           </button>
           <button onClick={() => handleNav('NOTE_LIST')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-all duration-200 ${view === 'NOTE_LIST' ? 'bg-pakGreen-600 text-white shadow-lg shadow-pakGreen-900/20' : 'hover:bg-gray-800 text-gray-300'}`}>
              <NoteIcon className="w-5 h-5" /> {t('myNotes')}
           </button>
        </div>

        {/* AI Tools */}
        <div className="space-y-1 mb-8">
           <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2 flex items-center gap-2">
             <SparklesIcon className="w-3 h-3" /> AI Tools
           </p>
           <button onClick={() => handleNav('AI_SUMMARIZER')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-all duration-200 ${view === 'AI_SUMMARIZER' ? 'bg-pakGreen-600 text-white shadow-lg shadow-pakGreen-900/20' : 'hover:bg-gray-800 text-gray-300'}`}>
              <SparklesIcon className="w-5 h-5" /> AI Summarizer
           </button>
           <button onClick={() => handleNav('FLASHCARDS')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-all duration-200 ${view === 'FLASHCARDS' ? 'bg-pakGreen-600 text-white shadow-lg shadow-pakGreen-900/20' : 'hover:bg-gray-800 text-gray-300'}`}>
              <TrophyIcon className="w-5 h-5" /> AI Flashcards
           </button>
        </div>

        {/* Resources */}
        <div className="space-y-1 mb-8">
           <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">Resources</p>
           <button onClick={() => handleNav('CSS_RESOURCES')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-all duration-200 ${view === 'CSS_RESOURCES' ? 'bg-pakGreen-600 text-white shadow-lg shadow-pakGreen-900/20' : 'hover:bg-gray-800 text-gray-300'}`}>
              <ListIcon className="w-5 h-5" /> {t('cssResources')}
           </button>
           <button onClick={() => handleNav('STUDY_MATERIAL')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-all duration-200 ${view === 'STUDY_MATERIAL' ? 'bg-pakGreen-600 text-white shadow-lg shadow-pakGreen-900/20' : 'hover:bg-gray-800 text-gray-300'}`}>
              <BookIcon className="w-5 h-5" /> {t('studyMaterial')}
           </button>
           <button onClick={() => handleNav('SYLLABUS')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-all duration-200 ${view === 'SYLLABUS' ? 'bg-pakGreen-600 text-white shadow-lg shadow-pakGreen-900/20' : 'hover:bg-gray-800 text-gray-300'}`}>
              <BookIcon className="w-5 h-5" /> {t('syllabus')}
           </button>
        </div>

        {/* News & Updates */}
        <div className="space-y-1 mb-8">
           <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2 flex items-center gap-2">
             <BellIcon className="w-3 h-3" /> News & Events
           </p>
           <div className="bg-gray-800/50 rounded-xl p-3 space-y-3 border border-gray-800">
             {CSS_NEWS.map((news, idx) => (
               <div key={idx} className="flex gap-3 items-start group">
                 <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                   news.type === 'Exam' ? 'bg-red-500' : 
                   news.type === 'Result' ? 'bg-green-500' : 'bg-blue-500'
                 } group-hover:scale-125 transition-transform`} />
                 <div>
                   <h4 className="text-xs font-bold text-gray-200 leading-tight group-hover:text-pakGreen-400 transition-colors">{news.title}</h4>
                   <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                     <CalendarIcon className="w-3 h-3" /> {news.date}
                   </p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-800 space-y-4">
         {/* Footer / Meta */}
         <div className="text-xs text-gray-600 text-center">
            &copy; 2025 CSS Daily Prep
         </div>
      </div>
    </div>
  );
};

export default Sidebar;
