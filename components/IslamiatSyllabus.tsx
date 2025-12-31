import React, { useMemo, useState } from 'react';

interface Props {
  onBack: () => void;
  onSaveNote: (title: string, content: string) => void;
}

const IslamiatSyllabus: React.FC<Props & { searchQuery?: string }> = ({ onSaveNote, searchQuery = '' }) => {
  const sections = useMemo(() => ([
    {
      key: 'beliefs',
      title: 'I. Fundamentals of Islam',
      items: [
        'Concept of Tauheed, Risalat and Akhirat',
        'Ibadat and Muamalat',
        'Sources of Shariah: Quran and Sunnah',
        'Ijtihad: concept, scope and contemporary relevance',
      ],
    },
    {
      key: 'quran',
      title: 'II. Quran and Sunnah (Core Themes)',
      items: [
        'Quran as guidance: major themes and moral framework',
        'Seerah of the Prophet (ﷺ) and practical implementation',
        'Hadith as source of law and ethics',
        'Contemporary issues in the light of Quran and Sunnah',
      ],
    },
    {
      key: 'system',
      title: 'III. Islamic Social, Political and Economic System',
      items: [
        'Social justice, equality and welfare responsibilities',
        'Political system: shura, accountability and governance ethics',
        'Human rights: life, dignity, freedom and responsibilities',
        'Economic principles: prohibition of riba, zakat and social welfare',
      ],
    },
    {
      key: 'society',
      title: 'IV. Islam and Contemporary Society',
      items: [
        'Status and rights of women in Islam',
        'Minorities and interfaith coexistence',
        'Extremism, terrorism and Islam’s stance on violence',
        'Islam in modern world: challenges and responses',
      ],
    },
    {
      key: 'pakistan',
      title: 'V. Islam in Pakistan',
      items: [
        'Islamic provisions in the Constitution of Pakistan',
        'Islamization debate: opportunities and challenges',
        'Role of religion in national integration and ethics',
      ],
    },
    {
      key: 'suggest',
      title: 'Suggested Study Approach',
      items: [
        'Prepare short notes with Quranic references and key ahadith',
        'Write answers with headings: concept, evidences, applications, conclusion',
        'Keep contemporary examples: governance, economy, society, ethics',
        'Revise constitutional Islamic provisions and landmark debates',
        'Practice 2 answers weekly with balanced and non-sectarian tone',
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

export default IslamiatSyllabus;

