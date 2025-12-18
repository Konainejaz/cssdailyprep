import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Transition, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Subject, Difficulty, QuizQuestion } from '../types';
import { generateQuiz } from '../services/groqService';
import { markQuestionsAsSeen } from '../services/storageService';
import { SUBJECTS_LIST } from '../constants';
import { 
  TrophyIcon, ClockIcon, CheckIcon, CrossIcon, PlusIcon, 
  CrossIcon as CloseIcon, ShareIcon, PauseIcon, PlayIcon 
} from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface QuizViewProps {
  onExit: () => void;
  onSaveNote: (title: string, content: string) => void;
}

const TiltCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXFromCenter = e.clientX - rect.left - width / 2;
        const mouseYFromCenter = e.clientY - rect.top - height / 2;
        x.set(mouseXFromCenter / width);
        y.set(mouseYFromCenter / height);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={`relative transition-all duration-200 ease-out ${className}`}
        >
            {children}
        </motion.div>
    );
};

const QuizView: React.FC<QuizViewProps> = ({ onExit, onSaveNote }) => {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = useState<'SETUP' | 'QUIZ' | 'RESULT'>('SETUP');
  const [subject, setSubject] = useState<Subject>(Subject.PAK_AFFAIRS);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);

  // Load preferences
  useEffect(() => {
    const savedCount = localStorage.getItem('quiz-pref-count');
    if (savedCount) setQuestionCount(parseInt(savedCount));
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (step === 'QUIZ' && !isPaused) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, isPaused]);

  const handleStartQuiz = async () => {
    setLoading(true);
    // Save preference
    localStorage.setItem('quiz-pref-count', questionCount.toString());

    setTimer(0);
    setCurrentQIndex(0);
    setIsPaused(false);
    setScore(0);
    
    const generatedQuestions = await generateQuiz(subject, difficulty, questionCount);
    setQuestions(generatedQuestions);
    setUserAnswers(new Array(generatedQuestions.length).fill(-1));
    setLoading(false);
    if (generatedQuestions.length > 0) setStep('QUIZ');
  };

  const handleAnswer = (optionIndex: number) => {
    if (userAnswers[currentQIndex] !== -1) return; // Prevent changing answer
    const newAnswers = [...userAnswers];
    newAnswers[currentQIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) calculatedScore++;
    });
    setScore(calculatedScore);
    setStep('RESULT');

    // Mark questions as seen to avoid repetition in future
    markQuestionsAsSeen(questions);

    // Save analytics
    const result = {
      date: new Date().toISOString(),
      subject,
      score: calculatedScore,
      total: questions.length,
      time: timer
    };
    const history = JSON.parse(localStorage.getItem('quiz-history') || '[]');
    history.push(result);
    localStorage.setItem('quiz-history', JSON.stringify(history));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const shareResult = () => {
    if (navigator.share) {
      navigator.share({
        title: 'CSS Prep Quiz Result',
        text: `I scored ${score}/${questions.length} in ${subject} (${difficulty}) on CSS Prep!`,
        url: window.location.href
      });
    }
  };

  const springTransition = { type: "spring", stiffness: 300, damping: 30 };

  return (
    <div
      className="w-full h-full relative bg-[#f0f2f5] font-sans selection:bg-pakGreen-200 selection:text-pakGreen-900 overflow-y-auto overscroll-y-contain"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pakGreen-200/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-200/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <AnimatePresence mode="wait">
        {step === 'SETUP' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full min-h-full flex items-start md:items-center justify-center p-2 md:p-6 pb-24 md:pb-8"
          >
            <TiltCard className="w-full max-w-7xl bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col md:flex-row my-auto">
                
                {/* Left Side: Hero/Info */}
                <div className="w-full md:w-2/5 p-6 md:p-10 bg-gradient-to-br from-pakGreen-600 to-pakGreen-800 text-white relative overflow-hidden flex flex-col justify-between min-h-[250px] md:min-h-[300px]">
                    {/* Mobile Close Button */}
                    <button 
                        onClick={onExit}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors text-white md:hidden z-50"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>

                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-pakGreen-400/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] md:text-xs font-bold tracking-wider uppercase mb-4 md:mb-6"
                        >
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            Mock Exam Mode
                        </motion.div>
                        <motion.h1 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl md:text-5xl font-bold leading-tight mb-3 md:mb-4"
                        >
                            Master Your <br/> <span className="text-pakGreen-200">Preparation</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-pakGreen-100 text-base md:text-lg leading-relaxed"
                        >
                            Challenge yourself with adaptive quizzes tailored to CSS subjects. Track progress and improve daily.
                        </motion.p>
                    </div>

                    <div className="relative z-10 mt-6 md:mt-8 grid grid-cols-2 gap-3 md:gap-4">
                        {[
                            { label: "Adaptive", val: "AI-Powered" },
                            { label: "Subjects", val: SUBJECTS_LIST.length + "+" },
                            { label: "Review", val: "Instant" },
                            { label: "Analytics", val: "Detailed" }
                        ].map((stat, i) => (
                            <motion.div 
                                key={stat.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 md:p-3 border border-white/10"
                            >
                                <div className="text-[10px] md:text-xs text-pakGreen-200 font-medium uppercase">{stat.label}</div>
                                <div className="text-base md:text-lg font-bold text-white">{stat.val}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Controls */}
                <div className="w-full md:w-3/5 p-6 md:p-10 flex flex-col justify-center relative bg-white/40">
                    <button 
                        onClick={onExit}
                        className="hidden md:block absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>

                    <div className="space-y-6 md:space-y-8 mt-4 md:mt-0">
                        {/* Subject Selection */}
                        <div className="space-y-2 md:space-y-3">
                            <label className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Select Subject</label>
                            <div className="relative">
                                <select 
                                    value={subject} 
                                    onChange={(e) => setSubject(e.target.value as Subject)}
                                    className="w-full p-3 md:p-4 bg-gray-50 hover:bg-white border border-gray-200 rounded-2xl text-base md:text-lg font-semibold text-gray-800 focus:ring-4 focus:ring-pakGreen-500/10 focus:border-pakGreen-500 transition-all outline-none appearance-none cursor-pointer shadow-sm"
                                >
                                    {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                </div>
                            </div>
                        </div>

                        {/* Difficulty & Count Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                             {/* Difficulty */}
                             <div className="space-y-2 md:space-y-3">
                                <label className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Difficulty</label>
                                <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                                    {Object.values(Difficulty).map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setDifficulty(d)}
                                            className={`flex-1 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 ${difficulty === d ? 'bg-white text-pakGreen-600 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Question Count */}
                             <div className="space-y-2 md:space-y-3">
                                <label className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Questions</label>
                                <div className="flex flex-nowrap gap-2 bg-gray-100 p-2 rounded-2xl overflow-x-auto">
                                    {[10, 20, 30, 50, 100, 200].map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setQuestionCount(c)}
                                            className={`shrink-0 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 ${questionCount === c ? 'bg-white text-pakGreen-600 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Start Button */}
                        <motion.button
                            onClick={handleStartQuiz}
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 md:py-5 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold text-base md:text-lg shadow-xl shadow-gray-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden"
                        >
                             {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             ) : (
                                 <>
                                    <span className="relative z-10">{t('startQuiz')}</span>
                                    <PlayIcon className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-pakGreen-600 to-pakGreen-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                 </>
                             )}
                        </motion.button>
                    </div>
                </div>
            </TiltCard>
          </motion.div>
        )}

        {step === 'QUIZ' && (
             <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative z-10 w-full min-h-full flex flex-col pb-10"
             >
                 {/* Top Bar */}
                 <div className="w-full px-4 md:px-6 py-4 flex flex-wrap items-center justify-between z-20 gap-4">
                    <button onClick={onExit} className="p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm hover:bg-white transition-colors text-gray-600">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm border border-white/50">
                        <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timer > questionCount * 60 ? 'text-red-500' : 'text-gray-700'}`}>
                            <ClockIcon className="w-5 h-5 text-gray-400" />
                            {formatTime(timer)}
                        </div>
                        <div className="h-4 w-px bg-gray-300" />
                        <button onClick={() => setIsPaused(!isPaused)} className="text-gray-500 hover:text-gray-800">
                            {isPaused ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="px-4 py-2 bg-pakGreen-100/50 backdrop-blur-md text-pakGreen-700 font-bold rounded-xl text-sm border border-pakGreen-200 hidden md:block">
                        {subject}
                    </div>
                 </div>

                 {/* Progress Bar */}
                 <div className="w-full max-w-4xl mx-auto px-6 mb-8 mt-2">
                     <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                         <motion.div 
                            className="h-full bg-pakGreen-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                         />
                     </div>
                     <div className="flex justify-between mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                         <span>Start</span>
                         <span>Question {currentQIndex + 1} of {questions.length}</span>
                         <span>Finish</span>
                     </div>
                 </div>

                 {/* Question Container */}
                 <div className="flex-1 w-full max-w-5xl mx-auto px-4 flex items-start justify-center relative perspective-1000">
                     <AnimatePresence mode="wait">
                         {!isPaused ? (
                             <motion.div
                                key={currentQIndex}
                                initial={{ opacity: 0, rotateX: -10, y: 50 }}
                                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                                exit={{ opacity: 0, rotateX: 10, y: -50 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="w-full bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 p-4 md:p-10 relative overflow-hidden"
                            >
                                {/* Question Text */}
                                <div className="mb-4 md:mb-10">
                                    <h2 className="text-xl md:text-3xl font-bold text-gray-800 leading-snug">
                                        {questions[currentQIndex].question}
                                    </h2>
                                </div>

                                {/* Options Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    {questions[currentQIndex].options.map((option, idx) => {
                                        const isSelected = userAnswers[currentQIndex] === idx;
                                        const isAnswered = userAnswers[currentQIndex] !== -1;
                                        
                                        // If answered, show correct/incorrect
                                        let statusClass = "border-transparent bg-white/60 hover:bg-white/90";
                                        if (isAnswered) {
                                            if (idx === questions[currentQIndex].correctAnswerIndex) {
                                                statusClass = "border-green-500 bg-green-50 text-green-800 shadow-[0_0_20px_rgba(34,197,94,0.2)]";
                                            } else if (isSelected) {
                                                statusClass = "border-red-500 bg-red-50 text-red-800";
                                            } else {
                                                statusClass = "opacity-50 grayscale";
                                            }
                                        } else if (isSelected) {
                                            statusClass = "border-pakGreen-500 bg-pakGreen-50 text-pakGreen-800";
                                        }

                                        return (
                                            <motion.button
                                               key={idx}
                                               onClick={() => handleAnswer(idx)}
                                               disabled={isAnswered}
                                               whileHover={!isAnswered ? { scale: 1.02, y: -2 } : {}}
                                               whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                               className={`relative p-3 md:p-6 rounded-2xl text-left border-2 transition-all duration-300 shadow-sm ${statusClass}`}
                                            >
                                                <div className="flex items-start gap-3 md:gap-4">
                                                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border-2 shrink-0 transition-colors ${
                                                        isAnswered && idx === questions[currentQIndex].correctAnswerIndex ? 'border-green-500 bg-green-500 text-white' :
                                                        isAnswered && isSelected && idx !== questions[currentQIndex].correctAnswerIndex ? 'border-red-500 bg-red-500 text-white' :
                                                        'border-gray-200 text-gray-400 bg-white'
                                                    }`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <span className="text-base md:text-lg font-medium">{option}</span>
                                                </div>
                                                
                                                {/* Status Icon */}
                                                {isAnswered && (
                                                    <div className="absolute top-4 right-4">
                                                        {idx === questions[currentQIndex].correctAnswerIndex && <CheckIcon className="w-5 h-5 md:w-6 md:h-6 text-green-600" />}
                                                        {isSelected && idx !== questions[currentQIndex].correctAnswerIndex && <CrossIcon className="w-5 h-5 md:w-6 md:h-6 text-red-600" />}
                                                     </div>
                                                 )}
                                             </motion.button>
                                         );
                                     })}
                                 </div>

                                 {/* Bottom Action Bar */}
                                 <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                                     <button 
                                        onClick={() => onSaveNote(`Quiz Question: ${subject}`, `${questions[currentQIndex].question}\n\nCorrect Answer: ${questions[currentQIndex].options[questions[currentQIndex].correctAnswerIndex]}`)}
                                        className="flex items-center gap-2 text-gray-500 hover:text-pakGreen-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors w-full md:w-auto justify-center"
                                     >
                                         <PlusIcon className="w-4 h-4" />
                                         Save to Notes
                                     </button>

                                     <motion.button
                                        onClick={handleNext}
                                        disabled={userAnswers[currentQIndex] === -1}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all w-full md:w-auto ${
                                            userAnswers[currentQIndex] === -1 
                                            ? 'bg-gray-300 cursor-not-allowed opacity-50' 
                                            : 'bg-gray-900 hover:bg-black shadow-gray-900/20'
                                        }`}
                                     >
                                         {currentQIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                                     </motion.button>
                                 </div>
                             </motion.div>
                         ) : (
                             <motion.div
                                key="paused"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl text-center shadow-2xl"
                             >
                                 <h3 className="text-2xl font-bold text-gray-800 mb-2">Quiz Paused</h3>
                                 <p className="text-gray-500 mb-6">Take a breather. We'll wait.</p>
                                 <button onClick={() => setIsPaused(false)} className="px-8 py-3 bg-pakGreen-600 text-white rounded-xl font-bold hover:bg-pakGreen-700 transition-colors">
                                     Resume Quiz
                                 </button>
                             </motion.div>
                         )}
                     </AnimatePresence>
                 </div>
             </motion.div>
        )}

        {step === 'RESULT' && (
             <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full min-h-full flex flex-col items-center justify-start p-4 md:p-8"
             >
                 <div className="w-full max-w-4xl space-y-6 pb-20">
                     {/* Summary Card */}
                     <TiltCard className="w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/60 p-6 md:p-10 text-center relative overflow-hidden">
                         {/* Confetti / Decor Background */}
                         <div className="absolute inset-0 overflow-hidden pointer-events-none">
                             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1),transparent_70%)]" />
                         </div>

                         <motion.div 
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg mb-6 relative z-10"
                         >
                             <TrophyIcon className="w-12 h-12 text-white drop-shadow-md" />
                         </motion.div>

                         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 relative z-10">Quiz Completed!</h2>
                         <p className="text-gray-500 mb-8 relative z-10">You've mastered this session.</p>

                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 relative z-10">
                             <div className="p-3 md:p-4 bg-white/60 rounded-2xl border border-white/50 shadow-sm">
                                 <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Score</div>
                                 <div className="text-xl md:text-2xl font-black text-gray-900">{score}/{questions.length}</div>
                             </div>
                             <div className="p-3 md:p-4 bg-white/60 rounded-2xl border border-white/50 shadow-sm">
                                 <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Accuracy</div>
                                 <div className="text-xl md:text-2xl font-black text-gray-900">{Math.round((score / questions.length) * 100)}%</div>
                             </div>
                             <div className="p-3 md:p-4 bg-white/60 rounded-2xl border border-white/50 shadow-sm">
                                 <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Time</div>
                                 <div className="text-xl md:text-2xl font-black text-gray-900">{formatTime(timer)}</div>
                             </div>
                         </div>

                         <div className="flex flex-col gap-3 relative z-10">
                             <button 
                                onClick={handleStartQuiz}
                                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black hover:shadow-xl transition-all hover:-translate-y-1"
                             >
                                 Try Another Quiz
                             </button>
                             <div className="grid grid-cols-2 gap-3">
                                 <button 
                                    onClick={shareResult}
                                    className="py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                 >
                                     <ShareIcon className="w-4 h-4" /> Share
                                 </button>
                                 <button 
                                    onClick={onExit}
                                    className="py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                                 >
                                     Back to Dashboard
                                 </button>
                             </div>
                         </div>
                     </TiltCard>

                     {/* Detailed Review Section */}
                     <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-bold text-gray-800">Review Questions</h3>
                        <span className="text-sm font-semibold text-gray-500">
                             {questions.length} items
                        </span>
                     </div>

                     <div className="space-y-4">
                        {questions.map((q, i) => {
                             const isCorrect = userAnswers[i] === q.correctAnswerIndex;
                             const isSkipped = userAnswers[i] === -1;
                             
                             return (
                                 <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm hover:shadow-md transition-all"
                                 >
                                     <div className="flex items-start gap-4 mb-4">
                                         <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                                             isCorrect ? 'bg-green-100 text-green-700' : 
                                             isSkipped ? 'bg-gray-100 text-gray-500' : 
                                             'bg-red-100 text-red-700'
                                         }`}>
                                             {i + 1}
                                         </div>
                                         <div className="flex-1">
                                             <p className="text-gray-900 font-semibold leading-relaxed mb-3">
                                                 {q.question}
                                             </p>
                                             
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                 <div className={`p-3 rounded-xl border ${
                                                     isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 
                                                     isSkipped ? 'bg-gray-50 border-gray-200 text-gray-500' : 
                                                     'bg-red-50 border-red-200 text-red-800'
                                                 }`}>
                                                     <div className="text-xs font-bold uppercase opacity-70 mb-1">Your Answer</div>
                                                     {isSkipped ? 'Skipped' : q.options[userAnswers[i]]}
                                                 </div>
                                                 
                                                 {!isCorrect && (
                                                    <div className="p-3 rounded-xl border bg-green-50 border-green-200 text-green-800">
                                                        <div className="text-xs font-bold uppercase opacity-70 mb-1">Correct Answer</div>
                                                        {q.options[q.correctAnswerIndex]}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Explanation */}
                                            {q.explanation && (
                                                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-bold uppercase opacity-70">Explanation</span>
                                                    </div>
                                                    <p className="leading-relaxed opacity-90">{q.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-3 border-t border-gray-100">
                                         <button 
                                            onClick={() => onSaveNote(`Review: ${subject}`, `${q.question}\n\nMy Answer: ${isSkipped ? 'Skipped' : q.options[userAnswers[i]]}\nCorrect Answer: ${q.options[q.correctAnswerIndex]}`)}
                                            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-pakGreen-600 transition-colors"
                                         >
                                             <PlusIcon className="w-3.5 h-3.5" />
                                             Add to Notes
                                         </button>
                                     </div>
                                 </motion.div>
                             );
                        })}
                     </div>
                 </div>
             </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizView;
