import React, { useMemo, useState } from 'react';

interface Props {
  onBack: () => void;
  onSaveNote: (title: string, content: string) => void;
}

const ComparativeReligionsSyllabus: React.FC<Props & { searchQuery?: string }> = ({ onSaveNote, searchQuery = '' }) => {
  const sections = useMemo(() => ([
    {
      key: 'intro',
      title: 'I. Introduction to Comparative Religion',
      items: [
        'Meaning, scope and objectives of comparative study',
        'Religion as a social and moral institution',
        'Sources and methodology for studying religions',
      ],
    },
    {
      key: 'major',
      title: 'II. Major World Religions (Core Study)',
      items: [
        'Judaism: origins, beliefs, scripture and practices',
        'Christianity: origins, core doctrines, scripture and practices',
        'Hinduism: key beliefs, scriptures, caste and practices',
        'Buddhism: life of Buddha, key teachings and practices',
      ],
    },
    {
      key: 'comparative',
      title: 'III. Comparative Themes',
      items: [
        'Concept of God and revelation',
        'Prophethood and religious leadership',
        'Concept of human being, ethics and morality',
        'Afterlife, salvation and accountability',
      ],
    },
    {
      key: 'society',
      title: 'IV. Religion and Contemporary Society',
      items: [
        'Religion and modernity',
        'Interfaith harmony and tolerance',
        'Religion, identity and conflict: causes and remedies',
      ],
    },
    {
      key: 'suggest',
      title: 'Suggested Study Approach',
      items: [
        'Make one-page comparison charts for each religion',
        'Prepare theme-based notes (God, scripture, ethics, afterlife)',
        'Use neutral and respectful tone; avoid polemics',
        'Practice short answers with headings and comparisons',
        'Revise key terms and major historical milestones',
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

export default ComparativeReligionsSyllabus;

