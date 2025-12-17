import React, { useMemo, useState } from 'react';
import { ChevronLeftIcon, PlusIcon, SearchIcon } from './Icons';

interface Props {
  onBack: () => void;
  onSaveNote: (title: string, content: string) => void;
}

const GenderStudiesSyllabus: React.FC<Props & { searchQuery?: string }> = ({ onBack, onSaveNote, searchQuery = '' }) => {
  const sections = useMemo(() => ([
    {
      key: 'intro',
      title: 'I. Introduction to Gender Studies',
      items: [
        'Introduction to Gender Studies',
        'Difference between Gender and Women Studies',
        'Multi-disciplinary nature of Gender Studies',
        'Autonomy vs. Integration Debate in Gender Studies',
        'Status of Gender Studies in Pakistan',
      ],
    },
    {
      key: 'construction',
      title: 'II. Social Construction of Gender',
      items: [
        'Historicizing Constructionism',
        'Problematizing the category of “Sex”: Queer Theory',
        'Is “Sex” socially determined, too?',
        'Masculinities and Femininity',
        'Nature versus Culture: A Debate in Gender Development',
      ],
    },
    {
      key: 'feminist_theories',
      title: 'III. Feminist Theories and Practice',
      items: [
        'What is Feminism',
        'Liberal Feminism',
        'Radical Feminism',
        'Marxist/Socialist Feminism',
        'Psychoanalytical Feminism',
        "Men’s Feminism",
        'Postmodern Feminism',
      ],
    },
    {
      key: 'movements',
      title: 'IV. Feminist Movements',
      items: [
        'Feminist Movements in the West: First Wave, Second Wave, Third Wave',
        'United Nation Conferences on Women',
        'Feminist Movements in Pakistan',
      ],
    },
    {
      key: 'gender_dev',
      title: 'V. Gender and Development',
      items: [
        'Colonial and Capitalistic Perspectives of Gender',
        'Gender Analysis of Development Theories: Modernization Theory, World System Theory, Dependency Theory, Structural Functionalism',
        'Gender Approaches to Development: WID, WAD, GAD; Gender Critique of Structural Adjustment Policies (SAPs)',
        'Globalization and Gender',
      ],
    },
    {
      key: 'status_pk',
      title: 'VI. Status of Women in Pakistan',
      items: [
        "Status of Women’s health in Pakistan",
        'Status of Women in Education',
        'Women and Employment',
        'Women and Law',
      ],
    },
    {
      key: 'governance',
      title: 'VII. Gender and Governance',
      items: [
        'Defining Governance',
        'Suffragist Movement',
        'Gender Issues in Women as Voters',
        'Gender Issues in Women as Candidates',
        'Gender Issues in Women as Representatives',
        'Impact of Political Quota in Pakistan',
      ],
    },
    {
      key: 'violence',
      title: 'VIII. Gender Based Violence',
      items: [
        'Defining Gender Based Violence',
        'Theories of Violence against Women',
        'Structural and Direct Forms of Violence',
        'Strategies to Eliminate Violence against Women',
      ],
    },
    {
      key: 'cases',
      title: 'IX. Case Studies',
      items: [
        'Mukhtaran Mai',
        'Malala Yousafzai',
        'Sharmeen Obaid-Chinoy',
      ],
    },
    {
      key: 'suggest',
      title: 'Suggested Study Approach',
      items: [
        'Build concept map for each section and keep 2–3 local examples',
        'Collect 5 policy reports (UNDP, WB, GoP) and annotate key data points',
        'Practice two 300-word mini-essays per week with feedback loop',
        'Maintain case studies repository with dates, outcomes, and sources',
        'Prepare short notes on theories with one Pakistan-specific application',
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

  const saveAll = () => {
    const md = sections.map(sec => {
      const bullets = sec.items.map(i => `- ${i}`).join('\n');
      return `### ${sec.title}\n${bullets}`;
    }).join('\n\n');
    onSaveNote('Gender Studies Syllabus', md);
  };

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

export default GenderStudiesSyllabus;
