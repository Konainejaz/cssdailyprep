import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; 
import { Subject, Article, Note, ViewState, ResearchResult } from './types';
import { fetchDailyArticles, researchTopic, fetchStudyMaterial } from './services/groqService';
import { getNotes, updateStreak, StreakData } from './services/storageService';
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
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
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
    const savedNotes = getNotes();
    setNotes(savedNotes);

    // Update Streak
    const currentStreak = updateStreak();
    setStreak(currentStreak);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const s = JSON.parse(raw);
        if (s.view) setView(s.view as ViewState);
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

  const refreshNotes = () => { setNotes(getNotes()); };

  // --- Handlers ---
  const handleResearchRequest = async (prompt: string, title: string) => {
    setView('RESEARCH');
    setMobileMenuOpen(false);
    setResearchQueryInput(title);
    setResearchResult(null);
    setIsResearching(true);
    const result = await researchTopic(prompt);
    setResearchResult(result);
    setIsResearching(false);
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
        
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 z-20 shadow-sm transition-all duration-300">
           <button onClick={() => setMobileMenuOpen(true)} className="text-gray-700 p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
             <MenuIcon className="w-6 h-6" />
           </button>
           <span className="font-bold text-xl sm:text-2xl font-serif tracking-tight transition-all duration-300">CSS<span className="text-pakGreen-600">Prep</span></span>
           <div className="w-10"></div> {/* Spacer for alignment */}
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-hidden relative">
          
          {view === 'FEED' && (
            <div className="h-full flex flex-col">
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
            </div>
          )}

          {view === 'ARTICLE_DETAIL' && selectedArticle && (
            <div className="h-full overflow-y-auto bg-white animate-slide-up">
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
            </div>
          )}

          {view === 'QUIZ' && (
            <QuizView 
              onExit={() => setView('FEED')} 
              onSaveNote={(t, c) => {
                 setNoteToEdit({ title: t, content: c, subject: Subject.PAK_AFFAIRS });
                 setView('NOTE_EDIT');
              }}
            />
          )}

          {view === 'STUDY_MATERIAL' && (
            <StudyMaterialView 
              onSelect={handleStudySelect} 
              onOpenSyllabus={() => setView('SYLLABUS')} 
            />
          )}

          {view === 'STUDY_TIMELINE' && (
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
          )}

          {view === 'STUDY_VOCAB' && (
            <StudyVocabView
              items={studyCache[activeStudyId] || []}
              isLoading={loading}
              onBack={() => setView('STUDY_MATERIAL')}
              onSaveNote={(t, c) => {
                setNoteToEdit({ title: t, content: c, subject: Subject.ESSAY }); // Vocab usually falls under Essay/English
                setView('NOTE_EDIT');
              }}
            />
          )}

          {view === 'STUDY_ESSAYS' && (
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
          )}

          {view === 'STUDY_ISLAMIAT' && (
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
          )}

          {view === 'CSS_RESOURCES' && (
            <CssResourcesView 
              onSelect={handleResourceRequest} 
              onOpenInterviewPrep={() => setView('INTERVIEW_PREP')}
              onOpenSubjectSelection={() => setView('SUBJECT_SELECTION')}
            />
          )}

          {view === 'INTERVIEW_PREP' && (
            <InterviewPreparation onBack={() => setView('CSS_RESOURCES')} />
          )}

          {view === 'SUBJECT_SELECTION' && (
            <SubjectSelectionGuide onBack={() => setView('CSS_RESOURCES')} />
          )}

          {view === 'SYLLABUS' && (
            <SyllabusHub 
              onBack={() => setView('STUDY_MATERIAL')} 
              onOpenGenderStudies={() => setView('GENDER_SYLLABUS')} 
            />
          )}

          {view === 'RESOURCE_DETAIL' && resourceDetail && (
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
          )}

          {view === 'GENDER_SYLLABUS' && (
            <GenderStudiesSyllabus
              onBack={() => setView('CSS_RESOURCES')}
              onSaveNote={(t, c) => {
                setNoteToEdit({ title: t, content: c, subject: Subject.GENDER_STUDIES });
                setView('NOTE_EDIT');
              }}
            />
          )}

          {view === 'RESEARCH' && (
            <ResearchCenter
              onSaveNote={(t, c) => {
                setNoteToEdit({ title: t, content: c, subject: Subject.PAK_AFFAIRS });
                setView('NOTE_EDIT');
              }}
            />
          )}

          {view === 'NOTE_LIST' && (
             <div className="h-full flex flex-col bg-gray-50">
               <div className="px-4 md:px-6 py-6 md:py-8 bg-white border-b border-gray-100">
                  <div className="flex justify-between items-center mb-6 max-w-5xl mx-auto">
                     <h1 className="text-2xl md:text-3xl font-bold font-serif text-gray-900">{t('myNotes')}</h1>
                     <button onClick={() => { setNoteToEdit({ title: '', content: '' }); setView('NOTE_EDIT'); }} className="bg-pakGreen-600 text-white flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full font-bold shadow-lg shadow-pakGreen-200 hover:bg-pakGreen-700 transition active:scale-95">
                        <PlusIcon className="w-5 h-5" /> 
                        <span className="text-sm md:text-base">{t('newNote')}</span>
                     </button>
                  </div>
                  <div className="max-w-5xl mx-auto relative">
                     <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                     <input 
                        className="w-full bg-gray-100 border-none rounded-xl py-3 pl-12 pr-4 text-[16px] md:text-base focus:ring-2 focus:ring-pakGreen-500 shadow-sm"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                     />
                  </div>
               </div>
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
             </div>
          )}
          
          {view === 'NOTE_EDIT' && (
             <NoteEditor 
               initialNote={noteToEdit} 
               onClose={() => { setView('NOTE_LIST'); setNoteToEdit(null); }} 
               onSave={() => { refreshNotes(); setNoteToEdit(null); setView('NOTE_LIST'); }} 
             />
          )}

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
      <LanguageProvider>
        <InnerApp />
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;
