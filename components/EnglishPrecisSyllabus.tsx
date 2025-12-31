import React, { useMemo, useState } from 'react';

interface Props {
  onBack: () => void;
  onSaveNote: (title: string, content: string) => void;
}

const EnglishPrecisSyllabus: React.FC<Props & { searchQuery?: string }> = ({ onSaveNote, searchQuery = '' }) => {
  const sections = useMemo(() => ([
    {
      key: 'precis',
      title: 'I. Precis Writing',
      items: [
        'Precis writing of a given passage',
        'Title of the precis',
        'Clarity, brevity, coherence and correct grammar',
      ],
    },
    {
      key: 'comprehension',
      title: 'II. Reading Comprehension',
      items: [
        'Comprehension of a given passage',
        'Answering questions with accurate inference and vocabulary',
      ],
    },
    {
      key: 'grammar',
      title: 'III. Grammar and Usage',
      items: [
        'Correction of sentences',
        'Punctuation and capitalization',
        'Sentence structure and common grammatical errors',
      ],
    },
    {
      key: 'vocab',
      title: 'IV. Vocabulary',
      items: [
        'Synonyms and antonyms',
        'Pair of words (correct usage) / idiomatic usage',
        'Words often confused and contextual usage',
      ],
    },
    {
      key: 'translation',
      title: 'V. Translation (Urdu to English)',
      items: [
        'Translation of a short Urdu passage into English',
        'Accuracy, idiomatic rendering, and correct tense/structure',
      ],
    },
    {
      key: 'suggest',
      title: 'Suggested Study Approach',
      items: [
        'Do one precis weekly: 1st draft + final draft with checklist',
        'Revise grammar rules and maintain an error log',
        'Build vocabulary set: pairs, idioms, and common confusions',
        'Practice translation with focus on simple, clear English',
        'Time practice: précis + comprehension in one sitting',
      ],
    },
  ]), []);

  const [open, setOpen] = useState<string[]>(sections.map(s => s.key));

  const toggle = (key: string) => {
    setOpen(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const filteredSections = sections.filter(sec =>
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.items.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const saveSection = (secTitle: string, items: string[]) => {
    const md = items.map(i => `- ${i}`).join('\n');
    onSaveNote(secTitle, `### ${secTitle}\n${md}`);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="px-6 py-2 bg-white border-b border-gray-100 flex justify-end gap-2">
        <button onClick={() => setOpen(sections.map(s => s.key))} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">Expand All</button>
        <button onClick={() => setOpen([])} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">Collapse All</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredSections.map(sec => (
            <div key={sec.key} className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <button onClick={() => toggle(sec.key)} className="w-full flex items-center justify-between px-6 py-4">
                <span className="text-lg md:text-xl font-serif font-bold text-gray-900">{sec.title}</span>
                <span className={`transition-transform ${open.includes(sec.key) ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {open.includes(sec.key) && (
                <div className="px-6 pb-6">
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 font-serif">
                    {sec.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => saveSection(sec.title, sec.items)} className="px-3 py-2 text-xs font-bold rounded-lg bg-pakGreen-600 text-white hover:bg-pakGreen-700">Save Section</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnglishPrecisSyllabus;

