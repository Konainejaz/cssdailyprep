import React from 'react';
import { ViewState } from '../types';
import { StreakData } from '../services/storageService';
import { 
  BookIcon, TrophyIcon, GlobeIcon, NoteIcon, CrossIcon, 
  ListIcon
} from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  view: ViewState;
  onViewChange: (view: ViewState) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  streak: StreakData;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  view, onViewChange, mobileMenuOpen, setMobileMenuOpen, streak
}) => {
  const { t, language, setLanguage } = useLanguage();

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
        <h1 className="text-2xl font-bold text-white font-serif tracking-tight transition-all duration-300">CSS<span className="text-pakGreen-500">Prep</span></h1>
        <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white transition-colors">
          <CrossIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
      </div>
      
      <div className="p-4 border-t border-gray-800 space-y-4">
         {/* Language Selector */}
         <div>
            <p className="text-xs text-gray-400 mb-2">Language / زبان</p>
            <div className="flex bg-gray-800 rounded-lg p-1">
                <button 
                    onClick={() => setLanguage('en')}
                    className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${language === 'en' ? 'bg-pakGreen-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    English
                </button>
                <button 
                    onClick={() => setLanguage('ur')}
                    className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${language === 'ur' ? 'bg-pakGreen-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    Urdu
                </button>
            </div>
         </div>

         <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">Study Streak</p>
            <div className="flex items-center gap-2">
               <div className="h-2 flex-1 bg-gray-700 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-pakGreen-500 transition-all duration-1000 ease-out" 
                   style={{ width: `${Math.min((streak.count / 7) * 100, 100)}%` }}
                 ></div>
               </div>
               <span className="text-xs font-bold text-white">{streak.count} Day{streak.count !== 1 ? 's' : ''}</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;
