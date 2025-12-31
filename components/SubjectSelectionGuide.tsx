import React, { useState } from 'react';
import { 
  ChevronLeftIcon, 
  BookIcon,
  CheckIcon,
  TrophyIcon,
  GlobeIcon
} from './Icons';
import './SubjectSelectionGuide.css';

interface Props {
  onBack: () => void;
}

const SubjectSelectionGuide: React.FC<Props> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'strategy' | 'trends'>('groups');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-100 overflow-x-auto flex-shrink-0">
        <div className="flex px-2 sm:px-4 md:px-6 gap-2 sm:gap-4 md:gap-6 min-w-max">
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-3 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'groups' ? 'border-pakGreen-600 text-pakGreen-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Subject Groups
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={`py-3 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'strategy' ? 'border-pakGreen-600 text-pakGreen-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Selection Strategy
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`py-3 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'trends' ? 'border-pakGreen-600 text-pakGreen-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Scoring Trends
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8 subject-selection-guide-content">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 pb-12">
          
          {activeTab === 'groups' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-3 sm:p-4 rounded-xl flex items-start gap-2 sm:gap-3">
                <BookIcon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 shrink-0 mt-0.5 sm:mt-1" />
                <div>
                  <h3 className="font-bold text-blue-800 text-sm sm:text-base">Rule of Selection</h3>
                  <p className="text-xs sm:text-sm text-blue-700 mt-1">
                    You must select optional subjects totaling <strong>600 Marks</strong>. 
                    Be careful: some groups allow only one subject, while others allow multiple.
                  </p>
                </div>
              </div>

              {/* Group 1 */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Group I (200 Marks)</h3>
                  <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 text-gray-600 rounded">Select One</span>
                </div>
                <div className="p-3 sm:p-4 md:p-6 grid gap-2 sm:gap-3">
                  {['Accountancy & Auditing', 'Economics', 'Computer Science', 'Political Science', 'International Relations'].map(s => (
                    <div key={s} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                      <span className="font-serif text-gray-700 text-xs sm:text-sm break-words flex-1">{s}</span>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 shrink-0 ml-2">200 Marks</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 2 */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Group II (200 Marks Total)</h3>
                  <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 text-gray-600 rounded">Select Subject(s)</span>
                </div>
                <div className="p-3 sm:p-4 md:p-6 grid gap-2 sm:gap-3">
                  {['Physics (200)', 'Chemistry (200)', 'Applied Mathematics (100)', 'Pure Mathematics (100)', 'Statistics (100)', 'Geology (100)'].map(s => (
                    <div key={s} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                      <span className="font-serif text-gray-700 text-xs sm:text-sm break-words flex-1">{s.split('(')[0]}</span>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 shrink-0 ml-2">{s.split('(')[1].replace(')', '')} Marks</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 3 */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Group III (100 Marks)</h3>
                  <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 text-gray-600 rounded">Select One</span>
                </div>
                <div className="p-3 sm:p-4 md:p-6 grid gap-2 sm:gap-3">
                  {['Business Administration', 'Public Administration', 'Governance & Public Policies', 'Town Planning & Urban Management'].map(s => (
                    <div key={s} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                      <span className="font-serif text-gray-700 text-xs sm:text-sm break-words flex-1">{s}</span>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 shrink-0 ml-2">100 Marks</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Group 4 */}
               <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Group IV (100 Marks)</h3>
                  <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 text-gray-600 rounded">Select One</span>
                </div>
                <div className="p-3 sm:p-4 md:p-6 grid gap-2 sm:gap-3">
                  {['History of Pakistan & India', 'Islamic History & Culture', 'British History', 'European History', 'History of USA'].map(s => (
                    <div key={s} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                      <span className="font-serif text-gray-700 text-xs sm:text-sm break-words flex-1">{s}</span>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 shrink-0 ml-2">100 Marks</span>
                    </div>
                  ))}
                </div>
              </div>

               {/* Group 5 */}
               <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Group V (100 Marks)</h3>
                  <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 text-gray-600 rounded">Select One</span>
                </div>
                <div className="p-3 sm:p-4 md:p-6 grid gap-2 sm:gap-3">
                  {['Gender Studies', 'Environmental Sciences', 'Agriculture & Forestry', 'Botany', 'Zoology', 'English Literature', 'Urdu Literature'].map(s => (
                    <div key={s} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                      <span className="font-serif text-gray-700 text-xs sm:text-sm break-words flex-1">{s}</span>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 shrink-0 ml-2">100 Marks</span>
                    </div>
                  ))}
                </div>
              </div>
              
               {/* Group 6 */}
               <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Group VI (100 Marks)</h3>
                  <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 text-gray-600 rounded">Select One</span>
                </div>
                <div className="p-3 sm:p-4 md:p-6 grid gap-2 sm:gap-3">
                  {['Law', 'Constitutional Law', 'International Law', 'Muslim Law & Jurisprudence', 'Mercantile Law', 'Criminology', 'Philosophy'].map(s => (
                    <div key={s} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                      <span className="font-serif text-gray-700 text-xs sm:text-sm break-words flex-1">{s}</span>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 shrink-0 ml-2">100 Marks</span>
                    </div>
                  ))}
                </div>
              </div>

               {/* Group 7 */}
               <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Group VII (100 Marks)</h3>
                  <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 text-gray-600 rounded">Select One</span>
                </div>
                <div className="p-3 sm:p-4 md:p-6 grid gap-2 sm:gap-3">
                  {['Journalism & Mass Comm', 'Psychology', 'Geography', 'Sociology', 'Anthropology', 'Punjabi', 'Sindhi', 'Pashto', 'Balochi', 'Persian', 'Arabic'].map(s => (
                    <div key={s} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                      <span className="font-serif text-gray-700 text-xs sm:text-sm break-words flex-1">{s}</span>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 shrink-0 ml-2">100 Marks</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-4 sm:space-y-6">
               <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-gray-900 mb-4 sm:mb-6">The "Golden Triangle" of Selection</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  <div className="p-3 sm:p-4 bg-pakGreen-50 rounded-xl border border-pakGreen-100">
                    <h3 className="font-bold text-pakGreen-800 mb-2 text-sm sm:text-base">1. Interest</h3>
                    <p className="text-xs sm:text-sm text-pakGreen-700">Do you enjoy reading about it? You will study this subject for hundreds of hours. Boredom leads to failure.</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-800 mb-2 text-sm sm:text-base">2. Background</h3>
                    <p className="text-xs sm:text-sm text-blue-700">Does your degree help? A BS in Physics makes Physics (200) an easy target, saving months of prep time.</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <h3 className="font-bold text-purple-800 mb-2 text-sm sm:text-base">3. Overlap</h3>
                    <p className="text-xs sm:text-sm text-purple-700">Does it help in compulsory subjects? IR helps in Current Affairs. Pol Science helps in Pak Affairs.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Popular Combinations</h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 border border-gray-200 rounded-xl">
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">The "IR" Combo</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">International Relations + Gender Studies + History of USA + Criminology</p>
                    <div className="mt-2 flex gap-2">
                       <span className="text-[8px] sm:text-[10px] uppercase font-bold bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">High Overlap</span>
                    </div>
                  </div>
                   <div className="p-3 sm:p-4 border border-gray-200 rounded-xl">
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">The "Pol Science" Combo</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Political Science + Punjabi/Sindhi + Sociology + Environmental Science</p>
                    <div className="mt-2 flex gap-2">
                       <span className="text-[8px] sm:text-[10px] uppercase font-bold bg-yellow-100 text-yellow-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">Consistent Scoring</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-4 sm:space-y-6">
               <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-gray-900 mb-3 sm:mb-4">Scoring Trends (2020-2024)</h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                  "Scoring trend" refers to how leniently or strictly a subject is marked in a specific year. While unpredictable, some patterns exist.
                </p>

                <div className="space-y-4 sm:space-y-6">
                   <div>
                     <h3 className="flex items-center gap-1.5 sm:gap-2 font-bold text-green-700 mb-2 text-sm sm:text-base">
                        <TrophyIcon className="w-3 h-3 sm:w-5 sm:h-5" /> High Scoring (Generally)
                     </h3>
                     <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 text-gray-700 text-xs sm:text-sm">
                        <li><strong>Regional Languages:</strong> Punjabi, Sindhi, Pashto often yield 70-80+ marks.</li>
                        <li><strong>Hard Sciences:</strong> Computer Science, Math, Physics (if you are an expert).</li>
                        <li><strong>Criminology:</strong> Short syllabus, objective nature.</li>
                     </ul>
                   </div>

                   <div>
                     <h3 className="flex items-center gap-1.5 sm:gap-2 font-bold text-orange-700 mb-2 text-sm sm:text-base">
                        <GlobeIcon className="w-3 h-3 sm:w-5 sm:h-5" /> Average / Safe
                     </h3>
                     <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 text-gray-700 text-xs sm:text-sm">
                        <li><strong>International Relations:</strong> Highly popular, but marking can be strict due to competition.</li>
                        <li><strong>US History:</strong> Interesting but sometimes targeted.</li>
                        <li><strong>Gender Studies:</strong> Easy to pass, hard to score 80+.</li>
                     </ul>
                   </div>

                   <div>
                     <h3 className="flex items-center gap-1.5 sm:gap-2 font-bold text-red-700 mb-2 text-sm sm:text-base">
                        <BookIcon className="w-3 h-3 sm:w-5 sm:h-5" /> Risky / "Hit or Miss"
                     </h3>
                     <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 text-gray-700 text-xs sm:text-sm">
                        <li><strong>Indo-Pak History:</strong> Vast syllabus, unpredictable marking.</li>
                        <li><strong>English Literature:</strong> Requires expert-level critical analysis.</li>
                     </ul>
                   </div>
                </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SubjectSelectionGuide;
