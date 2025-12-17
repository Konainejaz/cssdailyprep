import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown'; 
import { Subject, Article, Note, ViewState, ResearchResult } from './types';
import { fetchDailyArticles, researchTopic, fetchStudyMaterial } from './services/groqService';
import { getNotes, updateStreak, StreakData, migrateNotes } from './services/storageService';
import ArticleCard from './components/ArticleCard';
import NoteEditor from './components/NoteEditor';
import Sidebar from './components/Sidebar';
import QuizView from './components/QuizView';
import StudyMaterialView from './components/StudyMaterialView';
import StudyTimelineView from './components/StudyTimelineView';
import StudyVocabView from './components/StudyVocabView';
import StudyEssaysView from './components/StudyEssaysView';
import StudyIslamiatView from './components/StudyIslamiatView';
import CssResourcesView from './components/CssResourcesView';
import SyllabusHub from './components/SyllabusHub';
import ResourceDetailView from './components/ResourceDetailView';
import GenderStudiesSyllabus from './components/GenderStudiesSyllabus';
import InterviewPreparation from './components/InterviewPreparation';
import SubjectSelectionGuide from './components/SubjectSelectionGuide';
import ResearchCenter from './components/ResearchCenter';
import { ArticleSkeleton } from './components/SkeletonLoader';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';
import TopBar from './components/TopBar';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ProfileView from './components/ProfileView';
import AdminPanel from './components/AdminPanel';
import HistoryView from './components/HistoryView';
import AiSummarizer from './components/AiSummarizer';
import FlashcardGenerator from './components/FlashcardGenerator';
import { addToHistory, logAction } from './services/historyService';
import { 
  BookIcon, NoteIcon, PlusIcon, ChevronLeftIcon, SearchIcon, ShareIcon, 
  GlobeIcon, TrophyIcon, MenuIcon 
} from './components/Icons';

// --- Static Data ---
const COMPULSORY_SUBJECTS = [Subject.ESSAY, Subject.PAK_AFFAIRS, Subject.CURRENT_AFFAIRS, Subject.ISLAMIAT];
const OPTIONAL_SUBJECTS = [Subject.INT_RELATIONS, Subject.POLITICAL_SCIENCE, Subject.FOREIGN_AFFAIRS, Subject.GENDER_STUDIES];

// --- Inner App Component (inside Provider) ---
const InnerApp: React.FC = () => {
  const { t } = useLanguage();
  const { session, isLoading: authLoading } = useAuth();
  
  // Animation Variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };
  const pageTransition = { duration: 0.2 };

  // --- State ---
  const [view, setView] = useState<ViewState>('FEED');
  const [activeSubject, setActiveSubject] = useState<Subject>(Subject.ALL);
  
  // Content State
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Research State
  const [researchQueryInput, setResearchQueryInput] = useState('');
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [isResearching, setIsResearching] = useState(false);

  // Study Material State
  const [studyCache, setStudyCache] = useState<Record<string, any>>({});
  const [activeStudyId, setActiveStudyId] = useState<string>('');

  // Selection State
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [noteToEdit, setNoteToEdit] = useState<Partial<Note> | null>(null);
  const [resourceDetail, setResourceDetail] = useState<{title: string, content: string} | null>(null);
  const [previousView, setPreviousView] = useState<ViewState>('FEED');

  // Sidebar State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastVisitDate: '' });
  const [showSplash, setShowSplash] = useState(false);

  const STORAGE_KEY = 'cssprep:app_state';

  // --- Effects ---
  useEffect(() => {
    // Check if mobile
    if (window.innerWidth < 768) {
      setShowSplash(true);
    }
  }, []);

  useEffect(() => { 
    // Load notes from storage on mount
    const loadNotes = async () => {
      // Try migration first if user is logged in
      if (session) {
        await migrateNotes();
      }
      const savedNotes = await getNotes();
      setNotes(savedNotes);
    };
    loadNotes();

    // Update Streak
    const currentStreak = updateStreak();
    setStreak(currentStreak);
  }, [session]); // Add session dependency to reload notes on auth change

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const s = JSON.parse(raw);
        // Only restore view if it's not an auth view, or if we are validating auth
        // We'll let the auth effect handle redirection
        if (s.view && !['AUTH_LOGIN', 'AUTH_REGISTER', 'AUTH_FORGOT'].includes(s.view)) {
           setView(s.view as ViewState);
        }
        if (s.activeSubject) setActiveSubject(s.activeSubject as Subject);
        if (s.selectedArticle) setSelectedArticle(s.selectedArticle as Article);
        if (s.resourceDetail) setResourceDetail(s.resourceDetail as { title: string; content: string });
        if (s.previousView) setPreviousView(s.previousView as ViewState);
        if (s.researchQueryInput) setResearchQueryInput(s.researchQueryInput as string);
        if (s.researchResult) setResearchResult(s.researchResult as ResearchResult);
        if (s.studyCache) setStudyCache(s.studyCache as Record<string, any>);
      } catch {}
    }
  }, []);

  useEffect(() => {
    // Reset search query on view change
    setSearchQuery('');
    
    if (!authLoading) {
      if (!session && !['AUTH_LOGIN', 'AUTH_REGISTER', 'AUTH_FORGOT'].includes(view)) {
        setView('AUTH_LOGIN');
      } else if (session && ['AUTH_LOGIN', 'AUTH_REGISTER', 'AUTH_FORGOT'].includes(view)) {
        setView('FEED');
      }
    }
  }, [session, authLoading, view]);

  useEffect(() => {
    let isMounted = true;
    const loadArticles = async () => {
      setLoading(true);
      setArticles([]); 
      try {
        const data = await fetchDailyArticles(activeSubject);
        if (isMounted) {
          setArticles(data);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) setLoading(false);
      }
    };
    if (view === 'FEED') { loadArticles(); }
    
    return () => { isMounted = false; };
  }, [activeSubject, view]);

  useEffect(() => {
    try {
      const s = { view, activeSubject, selectedArticle, resourceDetail, previousView, researchQueryInput, researchResult, studyCache };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {}
  }, [view, activeSubject, selectedArticle, resourceDetail, previousView, researchQueryInput, researchResult, studyCache]);

  const refreshNotes = async () => { setNotes(await getNotes()); };

  // --- Handlers ---
  const handleResearchRequest = async (prompt: string, title: string) => {
    setView('RESEARCH');
    setMobileMenuOpen(false);
    setResearchQueryInput(title);
    setResearchResult(null);
    setIsResearching(true);

    logAction('research_started', 'research', undefined, { query: title });

    const result = await researchTopic(prompt);
    setResearchResult(result);
    setIsResearching(false);

    if (result) {
       addToHistory(title, 'research', result);
       logAction('research_completed', 'research', undefined, { query: title });
    }
  };

  const handleHistorySelect = (item: any) => {
    if (item.type === 'research') {
       setView('RESEARCH');
       setResearchQueryInput(item.query);
       setResearchResult(item.result_snapshot);
    } else {
       // Fallback
       setView('RESEARCH');
       setResearchQueryInput(item.query);
    }
  };

  const handleStudySelect = async (item: any) => {
    const { id, prompt, category } = item;
    
    let nextView: ViewState = 'STUDY_MATERIAL';
    let type: 'TIMELINE' | 'VOCAB' | 'ESSAY' | 'ISLAMIAT' | null = null;

    if (id === 'sm-1') { nextView = 'STUDY_ESSAYS'; type = 'ESSAY'; }
    else if (id === 'sm-2') { nextView = 'STUDY_VOCAB'; type = 'VOCAB'; }
    else if (id === 'sm-3') { nextView = 'STUDY_ISLAMIAT'; type = 'ISLAMIAT'; }
    else if (id === 'sm-4') { nextView = 'STUDY_TIMELINE'; type = 'TIMELINE'; }

    if (!type) {
      // Fallback to generic resource request if not matched
      handleResourceRequest(prompt, item.title, category);
      return;
    }

    setPreviousView(view);
    setView(nextView);
    setActiveStudyId(id);

    // Check Cache
    if (studyCache[id]) {
      return;
    }

    setLoading(true);
    const data = await fetchStudyMaterial(type, prompt);
    // Ensure IDs exist for persistence updates
    const dataWithIds = Array.isArray(data) ? data.map((item: any, idx: number) => ({ 
      ...item, 
      id: item.id || `${type}-${Date.now()}-${idx}` 
    })) : data;
    setStudyCache(prev => ({ ...prev, [id]: dataWithIds }));
    setLoading(false);
  };

  const handleStudyUpdate = (items: any[]) => {
    if (activeStudyId) {
      setStudyCache(prev => ({ ...prev, [activeStudyId]: items }));
    }
  };

  const handleResourceRequest = async (prompt: string, title: string, context?: string) => {
    setPreviousView(view);
    setView('RESOURCE_DETAIL');
    setResourceDetail({ title, content: '' });
    setLoading(true);
    const contextualPrompt = context ? `${prompt}\n\nSubject Context: ${context}` : prompt;
    const result = await researchTopic(contextualPrompt);
    if (result) {
      setResourceDetail({ title, content: result.content });
    } else {
      setResourceDetail({ title, content: 'Failed to load content. Please try again or check your connection.' });
    }
    setLoading(false);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const newArticles = await fetchDailyArticles(activeSubject);
    setArticles(prev => [...prev, ...newArticles]);
    setLoadingMore(false);
  };

  const renderSubjectSelector = () => (
    <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 mb-4">
      {[Subject.ALL, ...COMPULSORY_SUBJECTS, ...OPTIONAL_SUBJECTS].map((subject) => (
        <button
          key={subject}
          onClick={() => setActiveSubject(subject)}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
            activeSubject === subject
              ? 'bg-pakGreen-600 text-white border-pakGreen-600 shadow-md shadow-pakGreen-100'
              : 'bg-white text-gray-600 border-gray-200 hover:border-pakGreen-300 hover:bg-gray-50'
          }`}
        >
          {subject}
        </button>
      ))}
    </div>
  );

  if (authLoading) {
     return <SplashScreen onFinish={() => {}} />;
  }

  if (!session) {
     if (view === 'AUTH_REGISTER') return <Register onNavigate={setView} />;
     if (view === 'AUTH_FORGOT') return <ForgotPassword onNavigate={setView} />;
     // Default to Login for any other state if not logged in
     return <Login onNavigate={setView} />;
  }

  return (
    <div className="flex w-full h-screen supports-[height:100dvh]:h-[100dvh] bg-gray-100 overflow-hidden">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Sidebar 
        view={view} 
        onViewChange={setView} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
        streak={streak}
      />
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Bar */}
        {!['AUTH_LOGIN', 'AUTH_REGISTER', 'AUTH_FORGOT', 'NOTE_EDIT', 'QUIZ', 'ARTICLE_DETAIL'].includes(view) && (
            <TopBar 
                onNavigate={setView} 
                onMenuClick={() => setMobileMenuOpen(true)}
                title={
                    view === 'FEED' ? t('dailyFeed') :
                    view === 'RESEARCH' ? t('researchLab') :
                    view === 'NOTE_LIST' ? t('myNotes') :
                    view === 'CSS_RESOURCES' ? t('cssResources') :
                    view === 'STUDY_MATERIAL' ? t('studyMaterial') :
                    view === 'SYLLABUS' ? t('syllabus') :
                    view === 'PROFILE' ? 'My Profile' :
                    view === 'ADMIN_PANEL' ? 'Admin Panel' :
                    view === 'SUBJECT_SELECTION' ? 'Subject Selection' :
                    view === 'GENDER_SYLLABUS' ? 'Gender Studies' :
                    view === 'INTERVIEW_PREP' ? 'Interview Prep' :
                    view === 'HISTORY' ? 'History' :
                    view === 'STUDY_TIMELINE' ? 'Timeline' :
                    view === 'STUDY_VOCAB' ? 'Vocabulary' :
                    view === 'STUDY_ESSAYS' ? 'Important Essays' :
                    view === 'STUDY_ISLAMIAT' ? 'Islamiat' :
                    view === 'RESOURCE_DETAIL' && resourceDetail ? resourceDetail.title :
                    ''
                }
                searchQuery={['NOTE_LIST', 'STUDY_MATERIAL', 'CSS_RESOURCES', 'GENDER_SYLLABUS', 'HISTORY'].includes(view) ? searchQuery : undefined}
                onSearchChange={['NOTE_LIST', 'STUDY_MATERIAL', 'CSS_RESOURCES', 'GENDER_SYLLABUS', 'HISTORY'].includes(view) ? setSearchQuery : undefined}
                searchPlaceholder={t('searchPlaceholder')}
                onBack={
                   ['RESOURCE_DETAIL', 'STUDY_TIMELINE', 'STUDY_VOCAB', 'STUDY_ESSAYS', 'STUDY_ISLAMIAT', 'SYLLABUS', 'GENDER_SYLLABUS', 'SUBJECT_SELECTION', 'INTERVIEW_PREP', 'HISTORY'].includes(view) 
                   ? () => {
                      if (view === 'SYLLABUS') setView('STUDY_MATERIAL');
                      else if (view === 'GENDER_SYLLABUS') setView('CSS_RESOURCES'); // Usually accessed from CSS Resources or Syllabus? Let's check SyllabusHub. 
                      // SyllabusHub calls onOpenGenderStudies. SyllabusHub is usually entered from StudyMaterial. 
                      // Wait, SyllabusHub is a hub. Let's assume Back goes to StudyMaterial.
                      // But if GenderSyllabus is opened from SyllabusHub, back should go to SyllabusHub.
                      // Let's refine this logic.
                      else if (view === 'SUBJECT_SELECTION') setView('CSS_RESOURCES');
                      else if (view === 'INTERVIEW_PREP') setView('CSS_RESOURCES');
                      else if (view === 'HISTORY') setView('RESEARCH');
                      else if (['STUDY_TIMELINE', 'STUDY_VOCAB', 'STUDY_ESSAYS', 'STUDY_ISLAMIAT'].includes(view)) setView('STUDY_MATERIAL');
                      else if (view === 'RESOURCE_DETAIL') setView(previousView);
                      else setView('FEED');
                   } 
                   : undefined
                }
                actionButton={
                  view === 'NOTE_LIST' ? (
                     <button onClick={() => { setNoteToEdit({ title: '', content: '' }); setView('NOTE_EDIT'); }} className="bg-pakGreen-600 text-white flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold shadow hover:bg-pakGreen-700 transition text-sm">
                        <PlusIcon className="w-4 h-4 md:w-5 md:h-5" /> 
                        <span className="hidden md:inline">{t('newNote')}</span>
                     </button>
                  ) : view === 'STUDY_MATERIAL' ? (
                     <button onClick={() => setView('SYLLABUS')} className="bg-pakGreen-50 text-pakGreen-700 font-bold px-4 py-2 rounded-lg hover:bg-pakGreen-100 transition text-sm">
                        {t('syllabus')}
                     </button>
                  ) : view === 'RESOURCE_DETAIL' ? (
                     <button 
                       onClick={() => {
                          if (resourceDetail) {
                             setNoteToEdit({ title: resourceDetail.title, content: resourceDetail.content, subject: Subject.PAK_AFFAIRS });
                             setView('NOTE_EDIT');
                          }
                       }}
                       className="p-2 text-pakGreen-600 hover:bg-pakGreen-50 rounded-full transition"
                       title={t('saveNote')}
                     >
                       <PlusIcon className="w-6 h-6" />
                     </button>
                  ) : null
                }
            />
        )}

        {/* View Content */}
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {view === 'FEED' && (
              <motion.div
                key="FEED"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
                className="h-full flex flex-col"
              >
                <div className="px-6 pt-4 md:pt-8 pb-2">
                   <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif mb-1">{t('dailyIntelligence')}</h1>
                   <p className="text-gray-500 text-sm md:text-base mb-6">{t('curatedAnalysis')}</p>
                   {renderSubjectSelector()}
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-24 md:pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
                     {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                          <ArticleSkeleton key={i} />
                        ))
                     ) : articles.length > 0 ? (
                        <>
                          {articles.map(article => (
                            <ArticleCard key={article.id} article={article} onClick={(a) => { setSelectedArticle(a); setView('ARTICLE_DETAIL'); }} />
                          ))}
                          <div className="col-span-full flex justify-center py-8">
                             <button 
                               onClick={handleLoadMore}
                               disabled={loadingMore}
                               className="bg-white border border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-pakGreen-50 hover:text-pakGreen-700 hover:border-pakGreen-200 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                             >
                               {loadingMore ? (
                                 <>
                                   <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                   Loading...
                                 </>
                               ) : (
                                 <>
                                   <PlusIcon className="w-5 h-5" /> Load More Articles
                                 </>
                               )}
                             </button>
                          </div>
                        </>
                     ) : (
                        <div className="col-span-full text-center py-20 text-gray-400">No updates available.</div>
                     )}
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'ARTICLE_DETAIL' && selectedArticle && (
              <motion.div
                key="ARTICLE_DETAIL"
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="h-full overflow-y-auto bg-white"
              >
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                   <button onClick={() => setView('FEED')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600">
                      <ChevronLeftIcon className="w-6 h-6" />
                   </button>
                   <div className="flex gap-2">
                     <button onClick={() => {
                        if (navigator.share) navigator.share({ title: selectedArticle.title, text: selectedArticle.summary, url: window.location.href });
                     }} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                        <ShareIcon className="w-5 h-5" />
                     </button>
                     <button onClick={() => {
                        setNoteToEdit({ title: `Notes: ${selectedArticle.title}`, content: `Source: ${selectedArticle.source}\n\n${selectedArticle.content}`, subject: selectedArticle.subject });
                        setView('NOTE_EDIT');
                     }} className="bg-pakGreen-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-pakGreen-700 transition">
                        {t('saveNote')}
                     </button>
                   </div>
                </div>
                <div className="max-w-3xl mx-auto px-6 py-8">
                   <span className="text-pakGreen-600 font-bold uppercase text-xs tracking-wider mb-2 block">{selectedArticle.subject}</span>
                   <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4 leading-tight">{selectedArticle.title}</h1>
                   <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
                      <span>{selectedArticle.source}</span>
                      <span>&bull;</span>
                      <span>{selectedArticle.readTime} {t('readTime')}</span>
                      <span>&bull;</span>
                      <span>{selectedArticle.date}</span>
                   </div>
                   <div className="prose prose-lg prose-pakGreen max-w-none font-serif text-gray-800">
                      <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
                   </div>
                </div>
              </motion.div>
            )}

            {view === 'QUIZ' && (
              <motion.div key="QUIZ" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <QuizView 
                  onExit={() => setView('FEED')} 
                  onSaveNote={(t, c) => {
                     setNoteToEdit({ title: t, content: c, subject: Subject.PAK_AFFAIRS });
                     setView('NOTE_EDIT');
                  }}
                />
              </motion.div>
            )}

            {view === 'STUDY_MATERIAL' && (
              <motion.div key="STUDY_MATERIAL" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <StudyMaterialView 
                  onSelect={handleStudySelect} 
                  searchQuery={searchQuery}
                />
              </motion.div>
            )}

            {view === 'STUDY_TIMELINE' && (
              <motion.div key="STUDY_TIMELINE" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <StudyTimelineView
                  items={studyCache[activeStudyId] || []}
                  isLoading={loading}
                  onBack={() => setView('STUDY_MATERIAL')}
                  onSaveNote={(t, c) => {
                    setNoteToEdit({ title: t, content: c, subject: Subject.CURRENT_AFFAIRS });
                    setView('NOTE_EDIT');
                  }}
                  onUpdateItems={handleStudyUpdate}
                />
              </motion.div>
            )}

            {view === 'STUDY_VOCAB' && (
              <motion.div key="STUDY_VOCAB" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <StudyVocabView
                  items={studyCache[activeStudyId] || []}
                  isLoading={loading}
                  onBack={() => setView('STUDY_MATERIAL')}
                  onSaveNote={(t, c) => {
                    setNoteToEdit({ title: t, content: c, subject: Subject.ESSAY }); 
                    setView('NOTE_EDIT');
                  }}
                />
              </motion.div>
            )}

            {view === 'STUDY_ESSAYS' && (
              <motion.div key="STUDY_ESSAYS" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <StudyEssaysView
                  items={studyCache[activeStudyId] || []}
                  isLoading={loading}
                  onBack={() => setView('STUDY_MATERIAL')}
                  onSaveNote={(t, c) => {
                    setNoteToEdit({ title: t, content: c, subject: Subject.ESSAY });
                    setView('NOTE_EDIT');
                  }}
                  onUpdateItems={handleStudyUpdate}
                />
              </motion.div>
            )}

            {view === 'STUDY_ISLAMIAT' && (
              <motion.div key="STUDY_ISLAMIAT" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <StudyIslamiatView
                  items={studyCache[activeStudyId] || []}
                  isLoading={loading}
                  onBack={() => setView('STUDY_MATERIAL')}
                  onSaveNote={(t, c) => {
                    setNoteToEdit({ title: t, content: c, subject: Subject.ISLAMIAT });
                    setView('NOTE_EDIT');
                  }}
                  onUpdateItems={handleStudyUpdate}
                />
              </motion.div>
            )}

            {view === 'CSS_RESOURCES' && (
              <motion.div key="CSS_RESOURCES" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <CssResourcesView 
                  onSelect={handleResourceRequest} 
                  onOpenInterviewPrep={() => setView('INTERVIEW_PREP')}
                  onOpenSubjectSelection={() => setView('SUBJECT_SELECTION')}
                  searchQuery={searchQuery}
                />
              </motion.div>
            )}

            {view === 'INTERVIEW_PREP' && (
              <motion.div key="INTERVIEW_PREP" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <InterviewPreparation onBack={() => setView('CSS_RESOURCES')} />
              </motion.div>
            )}

            {view === 'SUBJECT_SELECTION' && (
              <motion.div key="SUBJECT_SELECTION" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <SubjectSelectionGuide onBack={() => setView('CSS_RESOURCES')} />
              </motion.div>
            )}

            {view === 'SYLLABUS' && (
              <motion.div key="SYLLABUS" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <SyllabusHub 
                  onBack={() => setView('STUDY_MATERIAL')} 
                  onOpenGenderStudies={() => setView('GENDER_SYLLABUS')} 
                />
              </motion.div>
            )}

            {view === 'RESOURCE_DETAIL' && resourceDetail && (
              <motion.div key="RESOURCE_DETAIL" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <ResourceDetailView
                  title={resourceDetail.title}
                  content={resourceDetail.content}
                  isLoading={loading}
                  onBack={() => setView(previousView)}
                  onSaveNote={(t, c) => {
                     setNoteToEdit({ title: t, content: c, subject: Subject.PAK_AFFAIRS });
                     setView('NOTE_EDIT');
                  }}
                />
              </motion.div>
            )}

            {view === 'GENDER_SYLLABUS' && (
              <motion.div key="GENDER_SYLLABUS" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <GenderStudiesSyllabus
                  onBack={() => setView('CSS_RESOURCES')}
                  onSaveNote={(t, c) => {
                    setNoteToEdit({ title: t, content: c, subject: Subject.GENDER_STUDIES });
                    setView('NOTE_EDIT');
                  }}
                />
              </motion.div>
            )}

            {view === 'RESEARCH' && (
              <motion.div key="RESEARCH" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <ResearchCenter
                  onSaveNote={(t, c) => {
                    setNoteToEdit({ title: t, content: c, subject: Subject.PAK_AFFAIRS });
                    setView('NOTE_EDIT');
                  }}
                  onHistory={() => setView('HISTORY')}
                />
              </motion.div>
            )}

            {view === 'HISTORY' && (
               <motion.div key="HISTORY" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                 <HistoryView 
                   onBack={() => setView('RESEARCH')} 
                   onSelect={handleHistorySelect} 
                   searchQuery={searchQuery}
                 />
               </motion.div>
            )}

            {view === 'PROFILE' && (
              <motion.div key="PROFILE" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <ProfileView onBack={() => setView('FEED')} />
              </motion.div>
            )}

            {view === 'ADMIN_PANEL' && (
               <motion.div key="ADMIN_PANEL" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                 <AdminPanel onBack={() => setView('FEED')} />
               </motion.div>
            )}

            {view === 'AI_SUMMARIZER' && (
              <motion.div key="AI_SUMMARIZER" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <AiSummarizer />
              </motion.div>
            )}

            {view === 'FLASHCARDS' && (
              <motion.div key="FLASHCARDS" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="h-full">
                <FlashcardGenerator />
              </motion.div>
            )}

            {view === 'NOTE_LIST' && (
               <motion.div
                 key="NOTE_LIST"
                 initial="initial"
                 animate="animate"
                 exit="exit"
                 variants={pageVariants}
                 transition={pageTransition}
                 className="h-full flex flex-col bg-gray-50"
               >
                   <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 md:py-8">
                      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                            notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())).map(note => (
                               <div key={note.id} onClick={() => { setNoteToEdit(note); setView('NOTE_EDIT'); }} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group h-60 md:h-64 flex flex-col active:scale-[0.99] transition-transform">
                                  <div className="flex justify-between items-start mb-2">
                                     {note.subject ? <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">{note.subject}</span> : <span></span>}
                                     <span className="text-[10px] md:text-xs text-gray-400">{new Date(note.updatedAt).toLocaleDateString()}</span>
                                  </div>
                                  <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-2 md:mb-3 line-clamp-2 font-serif group-hover:text-pakGreen-700 transition-colors">{note.title}</h3>
                                  <p className="text-sm md:text-base text-gray-500 line-clamp-4 font-serif leading-relaxed flex-1">
                                     {note.content.replace(/[#*`_]/g, '')}
                                  </p>
                               </div>
                            ))
                         ) : (
                            <div className="col-span-full text-center py-20 text-gray-400">{t('noNotes')}</div>
                         )}
                      </div>
                   </div>
               </motion.div>
            )}
            
            {view === 'NOTE_EDIT' && (
               <motion.div 
                 key="NOTE_EDIT"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 transition={{ duration: 0.2 }}
                 className="absolute inset-0 z-50 bg-white"
               >
                 <NoteEditor 
                   initialNote={noteToEdit} 
                   onClose={() => { setView('NOTE_LIST'); setNoteToEdit(null); }} 
                   onSave={() => { refreshNotes(); setNoteToEdit(null); setView('NOTE_LIST'); }} 
                 />
               </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Nav */}
        {!['NOTE_EDIT', 'QUIZ'].includes(view) && (
          <nav className="md:hidden bg-white border-t border-gray-200 flex justify-around items-center px-2 sm:px-6 py-2 pb-[env(safe-area-inset-bottom,20px)] z-20 min-h-[72px] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-all duration-300">
             <button onClick={() => setView('FEED')} className={`flex flex-col items-center p-2 rounded-xl flex-1 active:scale-95 transition-all duration-200 ${view === 'FEED' ? 'text-pakGreen-600 bg-pakGreen-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                <BookIcon className="w-6 h-6 mb-1" />
                <span className="text-[11px] sm:text-xs font-medium">Feed</span>
             </button>
             <button onClick={() => setView('QUIZ')} className={`flex flex-col items-center p-2 rounded-xl flex-1 active:scale-95 transition-all duration-200 ${view === 'QUIZ' ? 'text-pakGreen-600 bg-pakGreen-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                <TrophyIcon className="w-6 h-6 mb-1" />
                <span className="text-[11px] sm:text-xs font-medium">Mock</span>
             </button>
             <button onClick={() => setView('RESEARCH')} className={`flex flex-col items-center p-2 rounded-xl flex-1 active:scale-95 transition-all duration-200 ${view === 'RESEARCH' ? 'text-pakGreen-600 bg-pakGreen-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                 <GlobeIcon className="w-6 h-6 mb-1" />
                 <span className="text-[11px] sm:text-xs font-medium">Lab</span>
               </button>
               <button onClick={() => setView('NOTE_LIST')} className={`flex flex-col items-center p-2 rounded-xl flex-1 active:scale-95 transition-all duration-200 ${view === 'NOTE_LIST' ? 'text-pakGreen-600 bg-pakGreen-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                 <NoteIcon className="w-6 h-6 mb-1" />
                 <span className="text-[11px] sm:text-xs font-medium">Notes</span>
               </button>
          </nav>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <Toaster position="top-right" />
          <InnerApp />
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
