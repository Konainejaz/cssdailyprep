import React, { useState } from "react";
import { ViewState } from "../types";
import { StreakData } from "../services/storageService";
import {
  BookIcon,
  TrophyIcon,
  GlobeIcon,
  NoteIcon,
  CrossIcon,
  ListIcon,
  FireIcon,
  CalendarIcon,
  BellIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "./Icons";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

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
  view,
  onViewChange,
  mobileMenuOpen,
  setMobileMenuOpen,
  streak,
}) => {
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNav = (v: ViewState) => {
    onViewChange(v);
    setMobileMenuOpen(false);
  };

  const NavItem = ({
    viewState,
    icon: Icon,
    label,
    isNew = false,
  }: {
    viewState: ViewState;
    icon: any;
    label: string;
    isNew?: boolean;
  }) => {
    const isActive = view === viewState;
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <motion.button
        onClick={() => handleNav(viewState)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          w-full flex items-center gap-3 px-3 py-3 rounded-xl text-base relative group overflow-hidden transform-style-3d
          ${isCollapsed ? "justify-center" : ""}
          ${isActive ? "text-white" : "text-gray-400 hover:text-white"}
        `}
        whileHover={{ 
          scale: 1.05, 
          rotateX: 10, 
          rotateY: -5, 
          z: 50,
          transition: { type: "spring", stiffness: 400, damping: 10 }
        }}
        whileTap={{ scale: 0.95, rotateX: 0, rotateY: 0, z: 0 }}
        title={isCollapsed ? label : undefined}
      >
        {/* Neon Lightning Frame Effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          {/* Top Border Lightning */}
          {(isActive || isHovered) && (
            <motion.div 
              className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-purple-600"
              initial={{ opacity: 0, x: '-100%' }}
              animate={{ 
                x: ['-100%', '100%'],
                opacity: isActive ? [0.3, 1, 0.3] : [0, 0.8, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: isActive ? 1.5 : 2, 
                ease: "linear",
                repeatDelay: isActive ? 0.5 : 1
              }}
              style={{ filter: 'blur(1px)' }}
            />
          )}
          
          {/* Bottom Border Lightning */}
          {(isActive || isHovered) && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600 to-cyan-400"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ 
                x: ['100%', '-100%'],
                opacity: isActive ? [0.3, 1, 0.3] : [0, 0.8, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: isActive ? 1.5 : 2, 
                ease: "linear",
                repeatDelay: isActive ? 0.5 : 1
              }}
              style={{ filter: 'blur(1px)' }}
            />
          )}
          
          {/* Left Border Lightning */}
          {(isActive || isHovered) && (
            <motion.div 
              className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-cyan-400 via-purple-600 to-transparent"
              initial={{ opacity: 0, y: '-100%' }}
              animate={{ 
                y: ['-100%', '100%'],
                opacity: isActive ? [0.3, 1, 0.3] : [0, 0.8, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: isActive ? 1.8 : 2.5, 
                ease: "linear",
                repeatDelay: isActive ? 0.3 : 1.2
              }}
              style={{ filter: 'blur(1px)' }}
            />
          )}
          
          {/* Right Border Lightning */}
          {(isActive || isHovered) && (
            <motion.div 
              className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-purple-600 to-cyan-400"
              initial={{ opacity: 0, y: '100%' }}
              animate={{ 
                y: ['100%', '-100%'],
                opacity: isActive ? [0.3, 1, 0.3] : [0, 0.8, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: isActive ? 1.8 : 2.5, 
                ease: "linear",
                repeatDelay: isActive ? 0.3 : 1.2
              }}
              style={{ filter: 'blur(1px)' }}
            />
          )}
          
          {/* Corner Lightning Bolts */}
          {isActive && (
            <>
              <motion.div
                className="absolute top-0 left-0 w-3 h-3"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.5]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  delay: 1.0 // Delay corner lightning to prevent initial blinking
                }}
              >
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-transparent" />
                <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-cyan-400 to-transparent" />
              </motion.div>
              
              <motion.div
                className="absolute top-0 right-0 w-3 h-3"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.5]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  delay: 1.5 // Delay corner lightning to prevent initial blinking
                }}
              >
                <div className="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l from-purple-600 to-transparent" />
                <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-purple-600 to-transparent" />
              </motion.div>
              
              <motion.div
                className="absolute bottom-0 left-0 w-3 h-3"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.5]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  delay: 2.0 // Delay corner lightning to prevent initial blinking
                }}
              >
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-transparent" />
                <div className="absolute bottom-0 left-0 w-0.5 h-full bg-gradient-to-t from-purple-600 to-transparent" />
              </motion.div>
              
              <motion.div
                className="absolute bottom-0 right-0 w-3 h-3"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.5]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  delay: 2.5 // Delay corner lightning to prevent initial blinking
                }}
              >
                <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-cyan-400 to-transparent" />
                <div className="absolute bottom-0 right-0 w-0.5 h-full bg-gradient-to-t from-cyan-400 to-transparent" />
              </motion.div>
            </>
          )}
        </div>
        {/* Active Background & Glow Effect */}
        {isActive && (
          <motion.div
            layoutId="active-nav-bg"
            className="absolute inset-0 bg-gradient-to-r from-pakGreen-600 to-emerald-600 rounded-xl z-0"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Inner glow */}
            <div className="absolute inset-0 bg-white/10 rounded-xl" />
            
            {/* Animated "Lightning" Border Effect */}
            <motion.div 
              className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent"
              animate={{ 
                x: ['-100%', '100%'],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2, 
                ease: "linear",
                repeatDelay: 1 
              }}
            />
          </motion.div>
        )}

        {/* Hover Background (Non-active) */}
        {!isActive && (
          <div className="absolute inset-0 bg-gray-800/0 group-hover:bg-gray-800/50 rounded-xl transition-colors duration-200 z-0" />
        )}

        {/* Icon & Label Content */}
        <div className="relative z-10 flex items-center gap-3 w-full">
          <motion.div
            animate={isActive ? { scale: 1.1, rotate: [0, -10, 10, 0] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
          </motion.div>
          
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="truncate font-medium"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* New Badge */}
          {isNew && !isCollapsed && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg shadow-blue-500/30"
            >
              NEW
            </motion.span>
          )}
          {isNew && isCollapsed && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-gray-900 animate-pulse"></span>
          )}
        </div>
        
        {/* Tooltip for Collapsed State */}
        {isCollapsed && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-700 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
            {label}
            {/* Tooltip Arrow */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] border-8 border-transparent border-r-gray-900" />
          </div>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={false}
      animate={{ 
        width: isCollapsed ? 80 : 288,
        transition: { type: "spring", stiffness: 300, damping: 30 }
      }}
      className={`
        fixed inset-y-0 left-0 bg-[#0F1115] text-gray-300 z-40 flex flex-col border-r border-gray-800/50 h-full shrink-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:relative md:inset-auto
        group/sidebar
      `}
    >
      {/* Sidebar Border Glow (Right Side) */}
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-pakGreen-500/30 to-transparent opacity-50" />
      
      {/* Animated Lightning Border Effect on the Sidebar Edge */}
      <motion.div 
        className="absolute top-0 right-[-1px] w-[2px] h-[100px] bg-gradient-to-b from-transparent via-pakGreen-400 to-transparent blur-[1px]"
        animate={{ 
          top: ['-10%', '110%'],
          opacity: [0, 1, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 8, 
          ease: "linear",
          repeatDelay: 2
        }}
      />

      {/* Collapse Toggle Button - Positioned on Edge */}
      <motion.button
        initial={false}
        animate={{ rotate: isCollapsed ? 180 : 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          hidden md:flex absolute -right-3 top-9 z-50
          w-6 h-6 items-center justify-center rounded-full
          bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-pakGreen-500 hover:bg-gray-800
          shadow-lg shadow-black/50 transition-colors duration-200
        `}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </motion.button>

      {/* Header */}
      <div className={`p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} border-b border-gray-800/50 h-20 relative overflow-hidden`}>
        {/* Header Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-pakGreen-500/5 to-transparent pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h1 className="text-2xl font-bold text-white font-serif tracking-tight flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-pakGreen-500 to-emerald-700 rounded-lg flex items-center justify-center text-white text-sm shadow-lg shadow-pakGreen-500/20">CP</span>
                <span>CSS<span className="text-transparent bg-clip-text bg-gradient-to-r from-pakGreen-400 to-emerald-400">Prep</span></span>
              </h1>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-pakGreen-500 to-emerald-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-pakGreen-500/20 text-lg">
                CP
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-gray-400 hover:text-white transition-colors"
        >
          <CrossIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent perspective-1000">
        {/* Main Nav */}
        <div className="space-y-1">
          {!isCollapsed && (
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2"
            >
              Main Menu
            </motion.p>
          )}
          <NavItem viewState="FEED" icon={BookIcon} label={t("dailyFeed")} />
          <NavItem viewState="QUIZ" icon={TrophyIcon} label={t("mockExams")} />
          <NavItem viewState="RESEARCH" icon={GlobeIcon} label={t("researchLab")} />
          <NavItem viewState="NOTE_LIST" icon={NoteIcon} label={t("myNotes")} />
        </div>

        {/* AI Tools */}
        <div className="space-y-1">
          {!isCollapsed && (
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2 flex items-center gap-2"
            >
              <SparklesIcon className="w-3 h-3 text-purple-400" /> AI Tools
            </motion.p>
          )}
          {isCollapsed && <div className="h-px bg-gray-800 my-2 mx-2"></div>}
          <NavItem viewState="AI_SUMMARIZER" icon={SparklesIcon} label="AI Summarizer" />
          <NavItem viewState="FLASHCARDS" icon={TrophyIcon} label="AI Flashcards" />
          <NavItem viewState="AI_LECTURE_NOTES" icon={NoteIcon} label="AI Lecture Notes" isNew />
          <NavItem viewState="AI_MIND_MAP" icon={SparklesIcon} label="Mind Map" />
        </div>

        {/* Resources */}
        <div className="space-y-1">
          {!isCollapsed && (
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2"
            >
              Resources
            </motion.p>
          )}
          {isCollapsed && <div className="h-px bg-gray-800 my-2 mx-2"></div>}
          <NavItem viewState="CSS_RESOURCES" icon={ListIcon} label={t("cssResources")} />
          <NavItem viewState="STUDY_MATERIAL" icon={BookIcon} label={t("studyMaterial")} />
          <NavItem viewState="SYLLABUS" icon={BookIcon} label={t("syllabus")} />
        </div>

        {/* News & Updates - Only visible when expanded */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1 mb-8 overflow-hidden"
            >
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2 flex items-center gap-2">
                <BellIcon className="w-3 h-3 text-red-400" /> News & Events
              </p>
              <div className="bg-gray-800/30 rounded-xl p-3 space-y-3 border border-gray-800/50 backdrop-blur-sm">
                {CSS_NEWS.map((news, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-3 items-start group cursor-pointer"
                  >
                    <div
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                        news.type === "Exam" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                        news.type === "Result" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" :
                        "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      } group-hover:scale-150 transition-transform duration-300`}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-gray-300 leading-tight group-hover:text-white transition-colors">
                        {news.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <CalendarIcon className="w-3 h-3" /> {news.date}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Meta - Beautified */}
      <div className="p-4 border-t border-gray-800/50 space-y-4 bg-gray-900/80 backdrop-blur-md">
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div 
              key="full-streak"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
               {/* Streak Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 p-4 group">
                 <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Daily Streak</span>
                    <FireIcon className={`w-4 h-4 ${streak.count > 0 ? "text-orange-500 animate-pulse" : "text-gray-600"}`} />
                 </div>
                 
                 <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-white leading-none">{streak.count}</span>
                    <span className="text-xs text-gray-500 font-medium mb-1">Days</span>
                 </div>
                 
                 {/* Progress bar simulation */}
                 <div className="mt-3 h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-[70%]" />
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
               key="mini-streak"
               initial={{ opacity: 0, scale: 0 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0 }}
               className="flex flex-col items-center justify-center py-2"
               title={`Daily Streak: ${streak.count} Days`}
             >
                <div className="relative group cursor-help">
                  <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <FireIcon className={`w-6 h-6 relative z-10 ${streak.count > 0 ? "text-orange-500" : "text-gray-600"}`} />
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-gray-900 z-20">
                    {streak.count}
                  </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Sidebar;
