import React, { useMemo, useState } from 'react';

interface Props {
  onBack: () => void;
  onSaveNote: (title: string, content: string) => void;
}

const CurrentAffairsSyllabus: React.FC<Props & { searchQuery?: string }> = ({ onSaveNote, searchQuery = '' }) => {
  const sections = useMemo(() => ([
    {
      key: 'overview',
      title: 'I. Paper Overview (Current Affairs)',
      items: [
        'Ability to interpret current issues with background knowledge',
        'Link domestic developments with regional and global dynamics',
        'Use facts, data, and examples in structured answers',
      ],
    },
    {
      key: 'domestic',
      title: 'II. Pakistan’s Domestic Affairs',
      items: [
        'Political developments and governance challenges',
        'Economy: fiscal constraints, inflation, growth and employment',
        'Energy, water, food security and climate risks',
        'Education, health, population and social cohesion',
        'Media, information, and contemporary societal debates',
      ],
    },
    {
      key: 'external',
      title: 'III. Pakistan’s External Affairs',
      items: [
        'Pakistan’s foreign policy: objectives and constraints',
        'Relations with neighbors and major powers',
        'Afghanistan, border security and regional stability',
        'Kashmir and regional peace challenges',
        'Geo-economics, trade diplomacy and connectivity initiatives',
      ],
    },
    {
      key: 'international',
      title: 'IV. International Affairs',
      items: [
        'UN system, international law and global governance',
        'Major international conflicts and peace initiatives',
        'Global economy, debt, trade wars and supply chain issues',
        'Terrorism, extremism, cyber security and hybrid warfare',
        'Climate change, migration, and humanitarian crises',
      ],
    },
    {
      key: 'suggest',
      title: 'Suggested Study Approach',
      items: [
        'Follow 2–3 quality newspapers + one monthly magazine consistently',
        'Maintain issue briefs: background, stakeholders, options, way forward',
        'Keep Pakistan-specific data points and global indices updated',
        'Practice 2 answers weekly with intro–body–way forward format',
        'Make a map of Pakistan’s key bilateral relations and interests',
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

export default CurrentAffairsSyllabus;

