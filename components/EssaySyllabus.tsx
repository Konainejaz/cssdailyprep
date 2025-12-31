import React, { useMemo, useState } from 'react';

interface Props {
  onBack: () => void;
  onSaveNote: (title: string, content: string) => void;
}

const EssaySyllabus: React.FC<Props & { searchQuery?: string }> = ({ onSaveNote, searchQuery = '' }) => {
  const sections = useMemo(() => ([
    {
      key: 'overview',
      title: 'I. Paper Overview (Essay)',
      items: [
        'Essay in English on one of the given topics',
        'Focus on clarity, coherence, relevance, and logical organization',
        'Correct grammar, vocabulary, and sentence structure',
        'Ability to present an argument with evidence and balanced analysis',
      ],
    },
    {
      key: 'skills',
      title: 'II. Skills Tested',
      items: [
        'Thesis statement and clear stance',
        'Outline, sequencing, and paragraph unity',
        'Critical thinking and counter-argument handling',
        'Transitions, coherence, and readability',
        'Conclusion that answers the thesis',
      ],
    },
    {
      key: 'areas',
      title: 'III. Common Theme Areas (Preparation Scope)',
      items: [
        'Governance, constitutionalism, rule of law, and public policy',
        'Economy, development, inequality, and human capital',
        'Education, health, population, and social issues',
        'Climate change, water, energy, food security, and environment',
        'Foreign policy, geopolitics, and international relations',
        'Media, technology, ethics, and contemporary debates',
      ],
    },
    {
      key: 'approach',
      title: 'Suggested Study Approach',
      items: [
        'Practice outlines weekly and get feedback on coherence',
        'Build 10–12 evergreen outlines with updated examples/data',
        'Maintain a quotes + facts bank (economy, governance, climate, society)',
        'Revise grammar and sentence variety; focus on concise writing',
        'Time yourself for full-length essays and refine structure',
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

export default EssaySyllabus;

