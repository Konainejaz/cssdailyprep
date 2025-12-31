import React, { useState } from 'react';
import { BookIcon } from './Icons';
import { EXAM_INTERACTIVE_SYLLABI, OPTIONAL_SYLLABUS_GROUPS } from '../constants';
import { Exam } from '../types';

interface Props {
  onBack: () => void;
  onOpenGenderStudies: () => void;
  onOpenOptional: (key: string) => void;
  onOpenExamPaper?: (key: string) => void;
  onOpenEssay: () => void;
  onOpenEnglishPrecis: () => void;
  onOpenGsa: () => void;
  onOpenCurrentAffairs: () => void;
  onOpenPakAffairs: () => void;
  onOpenIslamiat: () => void;
  onOpenComparativeReligions: () => void;
  exam?: Exam;
}

const SyllabusHub: React.FC<Props> = ({ 
  onBack, 
  onOpenGenderStudies,
  onOpenOptional,
  onOpenExamPaper,
  onOpenEssay,
  onOpenEnglishPrecis,
  onOpenGsa,
  onOpenCurrentAffairs,
  onOpenPakAffairs,
  onOpenIslamiat,
  onOpenComparativeReligions,
  exam = 'CSS'
}) => {
  const [open, setOpen] = useState<'opt' | 'comp' | null>('opt');
  const [openOptGroups, setOpenOptGroups] = useState<string[]>(OPTIONAL_SYLLABUS_GROUPS.map(g => g.key));
  const examSyllabus = EXAM_INTERACTIVE_SYLLABI[exam];

  const toggleOptGroup = (key: string) => {
    setOpenOptGroups(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {exam !== 'CSS' && (
            <>
              {(!examSyllabus || (examSyllabus.compulsory.length === 0 && examSyllabus.optional.length === 0)) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-700 font-serif">
                  Syllabus data not available.
                </div>
              )}

              {examSyllabus && examSyllabus.optional.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <button onClick={() => setOpen(o => o === 'opt' ? null : 'opt')} className="w-full flex items-center justify-between px-6 py-4">
                    <span className="text-lg md:text-xl font-serif font-bold text-gray-900">Optional Syllabus</span>
                    <span className={`transition-transform ${open === 'opt' ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                  {open === 'opt' && (
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {examSyllabus.optional.map(paper => (
                          <button
                            key={paper.key}
                            onClick={() => onOpenExamPaper?.(paper.key)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-pakGreen-200 hover:bg-pakGreen-50/30 transition-all text-left"
                          >
                            <BookIcon className="w-5 h-5 text-pakGreen-600" />
                            <div className="min-w-0">
                              <div className="font-bold text-gray-900 truncate">{paper.title}</div>
                              <div className="text-xs text-gray-500">Code {paper.code} • {paper.marks} Marks</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {examSyllabus && examSyllabus.compulsory.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <button onClick={() => setOpen(o => o === 'comp' ? null : 'comp')} className="w-full flex items-center justify-between px-6 py-4">
                    <span className="text-lg md:text-xl font-serif font-bold text-gray-900">Compulsory Syllabus</span>
                    <span className={`transition-transform ${open === 'comp' ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                  {open === 'comp' && (
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {examSyllabus.compulsory.map(paper => (
                          <button
                            key={paper.key}
                            onClick={() => onOpenExamPaper?.(paper.key)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-pakGreen-200 hover:bg-pakGreen-50/30 transition-all text-left"
                          >
                            <BookIcon className="w-5 h-5 text-pakGreen-600" />
                            <div className="min-w-0">
                              <div className="font-bold text-gray-900 truncate">{paper.title}</div>
                              <div className="text-xs text-gray-500">Code {paper.code} • {paper.marks} Marks</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {exam === 'CSS' && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <button onClick={() => setOpen(o => o === 'opt' ? null : 'opt')} className="w-full flex items-center justify-between px-6 py-4">
                  <span className="text-lg md:text-xl font-serif font-bold text-gray-900">Optional Syllabus</span>
                  <span className={`transition-transform ${open === 'opt' ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {open === 'opt' && (
                  <div className="px-6 pb-6">
                    <div className="space-y-4">
                      {OPTIONAL_SYLLABUS_GROUPS.map(group => (
                        <div key={group.key} className="bg-white rounded-2xl border border-gray-100">
                          <button onClick={() => toggleOptGroup(group.key)} className="w-full flex items-center justify-between px-4 py-3">
                            <span className="text-sm md:text-base font-serif font-bold text-gray-900">{group.title}</span>
                            <span className={`transition-transform ${openOptGroups.includes(group.key) ? 'rotate-180' : ''}`}>▾</span>
                          </button>
                          {openOptGroups.includes(group.key) && (
                            <div className="px-4 pb-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {group.items.map(item => (
                                  <button
                                    key={item.key}
                                    onClick={item.key === 'gender_studies' ? onOpenGenderStudies : () => onOpenOptional(item.key)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-pakGreen-200 hover:bg-pakGreen-50/30 transition-all text-left"
                                  >
                                    <BookIcon className="w-5 h-5 text-pakGreen-600" />
                                    <div className="min-w-0">
                                      <div className="font-bold text-gray-900 truncate">{item.title}</div>
                                      <div className="text-xs text-gray-500">Code {item.code} • {item.marks} Marks</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <button onClick={() => setOpen(o => o === 'comp' ? null : 'comp')} className="w-full flex items-center justify-between px-6 py-4">
                  <span className="text-lg md:text-xl font-serif font-bold text-gray-900">Compulsory Syllabus</span>
                  <span className={`transition-transform ${open === 'comp' ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {open === 'comp' && (
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={onOpenEssay}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-pakGreen-200 hover:bg-pakGreen-50/30 transition-all text-left"
                  >
                    <BookIcon className="w-5 h-5 text-pakGreen-600" />
                    <div>
                      <div className="font-bold text-gray-900">English Essay</div>
                      <div className="text-xs text-gray-500">Code 1 • 100 Marks</div>
                    </div>
                  </button>

                  <button
                    onClick={onOpenEnglishPrecis}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-pakGreen-200 hover:bg-pakGreen-50/30 transition-all text-left"
                  >
                    <BookIcon className="w-5 h-5 text-pakGreen-600" />
                    <div>
                      <div className="font-bold text-gray-900">English (Precis & Composition)</div>
                      <div className="text-xs text-gray-500">Code 2 • 100 Marks</div>
                    </div>
                  </button>

                  <button
                    onClick={onOpenGsa}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-pakGreen-200 hover:bg-pakGreen-50/30 transition-all text-left"
                  >
                    <BookIcon className="w-5 h-5 text-pakGreen-600" />
                    <div>
                      <div className="font-bold text-gray-900">General Science & Ability</div>
                      <div className="text-xs text-gray-500">Code 3 • 100 Marks</div>
                    </div>
                  </button>

                  <button
                    onClick={onOpenCurrentAffairs}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-pakGreen-200 hover:bg-pakGreen-50/30 transition-all text-left"
                  >
                    <BookIcon className="w-5 h-5 text-pakGreen-600" />
                    <div>
                      <div className="font-bold text-gray-900">Current Affairs</div>
                      <div className="text-xs text-gray-500">Code 4 • 100 Marks</div>
                    </div>
                  </button>

                  <button
                    onClick={onOpenPakAffairs}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-pakGreen-200 hover:bg-pakGreen-50/30 transition-all text-left"
                  >
                    <BookIcon className="w-5 h-5 text-pakGreen-600" />
                    <div>
                      <div className="font-bold text-gray-900">Pakistan Affairs</div>
                      <div className="text-xs text-gray-500">Code 5 • 100 Marks</div>
                    </div>
                  </button>

                  <button
                    onClick={onOpenIslamiat}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-pakGreen-200 hover:bg-pakGreen-50/30 transition-all text-left"
                  >
                    <BookIcon className="w-5 h-5 text-pakGreen-600" />
                    <div>
                      <div className="font-bold text-gray-900">Islamic Studies</div>
                      <div className="text-xs text-gray-500">Code 6 • 100 Marks</div>
                    </div>
                  </button>

                  <button
                    onClick={onOpenComparativeReligions}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-pakGreen-200 hover:bg-pakGreen-50/30 transition-all text-left"
                  >
                    <BookIcon className="w-5 h-5 text-pakGreen-600" />
                    <div>
                      <div className="font-bold text-gray-900">Comparative Religions</div>
                      <div className="text-xs text-gray-500">Code 7 • 100 Marks</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusHub;
