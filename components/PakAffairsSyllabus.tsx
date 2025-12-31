import React, { useMemo, useState } from 'react';

interface Props {
  onBack: () => void;
  onSaveNote: (title: string, content: string) => void;
}

const PakAffairsSyllabus: React.FC<Props & { searchQuery?: string }> = ({ onSaveNote, searchQuery = '' }) => {
  const sections = useMemo(() => ([
    {
      key: 'ideology',
      title: 'I. Ideology of Pakistan',
      items: [
        'Definition and elucidation of ideology',
        'Historical aspects: Muslim rule in the Sub-continent',
        'Ideological rationale of Pakistan',
        'Ideology in contemporary Pakistan: opportunities and challenges',
      ],
    },
    {
      key: 'movement',
      title: 'II. Pakistan Movement',
      items: [
        'Historical background: decline of the Mughal empire and British rule',
        'Aligarh, Deoband, Nadwah and other educational movements',
        'Role of Muslim leadership and political organizations',
        'Two Nation Theory and the evolution of Muslim nationalism',
      ],
    },
    {
      key: 'constitutional',
      title: 'III. Constitutional and Political Developments',
      items: [
        'Constitution-making: major milestones and debates',
        'Civil–military relations and political stability',
        'Federalism, provincial autonomy, and center–province relations',
        'Political parties and electoral politics',
      ],
    },
    {
      key: 'governance',
      title: 'IV. Governance and Institutions',
      items: [
        'State institutions and governance structure',
        'Public administration and reforms',
        'Accountability, transparency, and rule of law',
        'Local government and devolution',
      ],
    },
    {
      key: 'society',
      title: 'V. Society and Social Issues',
      items: [
        'Demography and population dynamics',
        'Education, health, and human development challenges',
        'Poverty, inequality, and social protection',
        'Extremism, sectarianism, and internal cohesion',
      ],
    },
    {
      key: 'economy',
      title: 'VI. Economy of Pakistan',
      items: [
        'Economic overview: growth, inflation, employment and fiscal issues',
        'Agriculture, industry, services and structural constraints',
        'Trade, balance of payments and external debt',
        'CPEC and regional economic connectivity',
      ],
    },
    {
      key: 'foreign',
      title: 'VII. Foreign Policy and Security',
      items: [
        'Pakistan’s foreign policy objectives and determinants',
        'Relations with major powers and neighboring states',
        'Afghanistan conflict and its impact on Pakistan',
        'National security challenges and internal security',
      ],
    },
    {
      key: 'future',
      title: 'VIII. The Future of Pakistan',
      items: [
        'Governance capacity and institutional strengthening',
        'Economic reforms and development priorities',
        'Social cohesion and inclusive growth',
        'Regional stability and strategic challenges',
      ],
    },
    {
      key: 'suggest',
      title: 'Suggested Study Approach',
      items: [
        'Make timeline notes for constitutional developments and major events',
        'Maintain data points from latest Economic Survey and key reports',
        'Prepare 10–12 evergreen outlines with updated examples',
        'Build maps for foreign policy: interests, tools, and constraints',
        'Revise case studies: energy, water, education, governance reforms',
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

export default PakAffairsSyllabus;

