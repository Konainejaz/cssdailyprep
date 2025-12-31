import React, { useMemo, useState } from 'react';
import { SyllabusSection } from '../constants';

interface Props {
  title: string;
  sections: SyllabusSection[];
  onSaveNote: (title: string, content: string) => void;
  searchQuery?: string;
}

const OptionalSyllabusDetail: React.FC<Props> = ({ title, sections, onSaveNote, searchQuery = '' }) => {
  const normalizedSections = useMemo(() => {
    const safe = Array.isArray(sections) ? sections : [];
    return safe.filter(s => s && s.key && s.title && Array.isArray(s.items));
  }, [sections]);

  const [open, setOpen] = useState<string[]>(normalizedSections.map(s => s.key));

  const toggle = (key: string) => {
    setOpen(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const filteredSections = normalizedSections.filter(sec =>
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.items.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const saveSection = (secTitle: string, items: string[]) => {
    const md = items.map(i => `- ${i}`).join('\n');
    onSaveNote(secTitle, `### ${secTitle}\n${md}`);
  };

  const saveAll = () => {
    const md = normalizedSections.map(sec => {
      const bullets = sec.items.map(i => `- ${i}`).join('\n');
      return `### ${sec.title}\n${bullets}`;
    }).join('\n\n');
    onSaveNote(`${title} Syllabus`, md);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="px-6 py-2 bg-white border-b border-gray-100 flex justify-end gap-2">
        <button onClick={() => setOpen(normalizedSections.map(s => s.key))} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">Expand All</button>
        <button onClick={() => setOpen([])} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">Collapse All</button>
        <button onClick={saveAll} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-pakGreen-600 text-white hover:bg-pakGreen-700 transition-colors">Save All</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredSections.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-600 font-serif">
              No syllabus items found.
            </div>
          ) : (
            filteredSections.map(sec => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionalSyllabusDetail;

