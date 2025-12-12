import React, { useState, useEffect } from 'react';
import { Subject, Difficulty, QuizQuestion } from '../types';
import { generateQuiz } from '../services/groqService';
import { 
  TrophyIcon, ClockIcon, CheckIcon, CrossIcon, PlusIcon, 
  CrossIcon as CloseIcon, ShareIcon, PauseIcon, PlayIcon 
} from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface QuizViewProps {
  onExit: () => void;
  onSaveNote: (title: string, content: string) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ onExit, onSaveNote }) => {
  const { t } = useLanguage();
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
    
    const generatedQuestions = await generateQuiz(subject, difficulty, questionCount);
    setQuestions(generatedQuestions);
    setUserAnswers(new Array(generatedQuestions.length).fill(-1));
    setLoading(false);
    if (generatedQuestions.length > 0) setStep('QUIZ');
  };

  const handleAnswer = (optionIndex: number) => {
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

  if (step === 'SETUP') {
    return (
      <div className="flex flex-col h-full w-full min-w-0 md:block bg-white md:bg-transparent">
        <div className="flex-1 p-4 md:p-6 w-full md:max-w-xl md:mx-auto md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:mt-10 animate-fade-in">
          <h2 className="text-xl md:text-2xl font-bold font-serif mb-6 text-center text-gray-900">{t('startMockExam')}</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('selectSubject')}</label>
            <select 
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-pakGreen-500 focus:border-pakGreen-500 text-base"
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
            >
              {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('selectQuestions')}</label>
            <div className="grid grid-cols-5 gap-2">
              {[10, 20, 50, 100, 200].map(count => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`py-3 md:py-2 rounded-lg text-sm font-medium border transition-all ${
                    questionCount === count
                      ? 'bg-pakGreen-50 border-pakGreen-500 text-pakGreen-700'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Est. time: {questionCount} mins
            </p>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('difficultyLevel')}</label>
            <div className="flex gap-2">
              {Object.values(Difficulty).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-3 rounded-xl border text-base font-medium transition-all ${
                    difficulty === d 
                      ? 'bg-pakGreen-50 border-pakGreen-500 text-pakGreen-700' 
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleStartQuiz}
            disabled={loading}
            className="w-full py-4 bg-pakGreen-600 text-white font-bold rounded-xl shadow-lg shadow-pakGreen-200 hover:bg-pakGreen-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2 text-base"
          >
            {loading ? (
               <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : t('startQuiz')}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'QUIZ') {
    if (isPaused) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50/90 backdrop-blur z-50 p-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Paused</h2>
                <button 
                    onClick={() => setIsPaused(false)}
                    className="w-full md:w-auto px-8 py-3 bg-pakGreen-600 text-white rounded-xl font-bold shadow-lg hover:bg-pakGreen-700 flex items-center justify-center gap-2"
                >
                    <PlayIcon className="w-5 h-5" /> {t('resume')}
                </button>
            </div>
        );
    }

    const question = questions[currentQIndex];
    const isAnswered = userAnswers[currentQIndex] !== -1;

    return (
      <div className="flex flex-col h-full bg-gray-50 md:p-8">
        <div className="bg-white md:rounded-2xl shadow-sm border-b md:border border-gray-100 flex-1 flex flex-col max-w-3xl mx-auto w-full overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
               <button onClick={onExit} className="text-gray-400 hover:text-gray-600 p-1 -ml-1">
                 <CloseIcon className="w-5 h-5 md:w-6 md:h-6" />
               </button>
               <div>
                 <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider block">{t('question')} {currentQIndex + 1}/{questions.length}</span>
                 <span className="text-[10px] md:text-xs font-semibold text-pakGreen-600 truncate max-w-[150px] md:max-w-none block">{subject} &bull; {difficulty}</span>
               </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setIsPaused(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                >
                    <PauseIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1.5 md:gap-2 bg-gray-100 px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-gray-600 font-mono text-xs md:text-sm">
                  <ClockIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  {formatTime(timer)}
                </div>
            </div>
          </div>

          {/* Question Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <h3 className="text-lg md:text-2xl font-bold text-gray-800 font-serif leading-relaxed mb-6 md:mb-8 break-words">
              {question.question}
            </h3>

            <div className="space-y-2 md:space-y-3">
              {question.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left p-3 md:p-4 rounded-xl border-2 transition-all text-sm md:text-base ${
                    userAnswers[currentQIndex] === idx
                      ? 'border-pakGreen-500 bg-pakGreen-50 text-pakGreen-900 shadow-sm'
                      : 'border-gray-100 hover:border-pakGreen-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-semibold mr-2 md:mr-3 text-gray-400">{String.fromCharCode(65 + idx)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className="w-full md:w-auto px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
            >
              {currentQIndex === questions.length - 1 ? t('finishExam') : t('nextQuestion')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 md:p-8 animate-fade-in">
       <div className="bg-white md:rounded-2xl shadow-lg max-w-2xl mx-auto w-full overflow-hidden flex flex-col h-full md:h-auto">
          <div className="p-8 text-center border-b border-gray-100 bg-pakGreen-50">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <TrophyIcon className="w-10 h-10 text-pakGreen-600" />
             </div>
             <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">{t('examComplete')}</h2>
             <p className="text-gray-600">{t('youScored')} <span className="font-bold text-pakGreen-700 text-xl">{score}/{questions.length}</span> in {formatTime(timer)}</p>
             <div className="mt-4 flex justify-center">
                <button onClick={shareResult} className="text-pakGreen-700 hover:underline text-sm font-bold flex items-center gap-1">
                    <ShareIcon className="w-4 h-4" /> {t('shareResult')}
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4">{t('detailedAnalysis')}</h3>
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const isCorrect = userAnswers[idx] === q.correctAnswerIndex;
                return (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex gap-3 items-start mb-2">
                      {isCorrect ? <CheckIcon className="w-5 h-5 text-pakGreen-500 mt-0.5 shrink-0" /> : <CrossIcon className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />}
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{q.question}</p>
                        <p className={`text-xs mt-1 font-medium ${isCorrect ? 'text-pakGreen-600' : 'text-red-500'}`}>
                          {t('youChose')}: {q.options[userAnswers[idx]]}
                        </p>
                        {!isCorrect && (
                           <p className="text-xs text-pakGreen-600 mt-1">{t('correct')}: {q.options[q.correctAnswerIndex]}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pl-8 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="font-bold text-gray-700 block mb-1">{t('explanation')}:</span>
                      {q.explanation}
                    </div>
                    <button 
                      onClick={() => onSaveNote(`MCQ Review: ${q.question.substring(0, 30)}...`, `Question: ${q.question}\n\nMy Answer: ${q.options[userAnswers[idx]]}\nCorrect Answer: ${q.options[q.correctAnswerIndex]}\n\nExplanation: ${q.explanation}`)}
                      className="mt-2 pl-8 text-[10px] text-pakGreen-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <PlusIcon className="w-3 h-3" /> {t('saveNote')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-100 bg-white">
            <button onClick={onExit} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
              {t('returnToDashboard')}
            </button>
          </div>
       </div>
    </div>
  );
};

export default QuizView;
