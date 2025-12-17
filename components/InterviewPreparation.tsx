import React, { useState } from 'react';
import { 
  ChevronLeftIcon, 
  CheckIcon, 
  CrossIcon, 
  TrophyIcon, 
  BookIcon,
  GlobeIcon
} from './Icons';

interface Props {
  onBack: () => void;
}

const InterviewPreparation: React.FC<Props> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'psych' | 'viva' | 'questions' | 'dress'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'psych', label: 'Psychological' },
    { id: 'viva', label: 'Viva Voce' },
    { id: 'questions', label: 'Questions' },
    { id: 'dress', label: 'Dress Code' },
  ] as const;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-100 overflow-x-auto no-scrollbar">
        <div className="flex px-6 gap-6 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 text-sm md:text-base font-bold border-b-2 transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'border-pakGreen-600 text-pakGreen-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">The Final Frontier</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The CSS interview process consists of two distinct phases: the <strong>Psychological Assessment</strong> and the <strong>Viva Voce</strong>. Together, they carry <strong>300 Marks</strong>. Unlike the written exam which tests your knowledge, this phase tests your personality, suitability for the civil service, and leadership potential.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600 mb-1">300</div>
                    <div className="text-sm text-blue-800 font-medium">Total Marks</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600 mb-1">2 Days</div>
                    <div className="text-sm text-purple-800 font-medium">Psychological</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="text-2xl font-bold text-orange-600 mb-1">30 Min</div>
                    <div className="text-sm text-orange-800 font-medium">Viva Voce</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-pakGreen-600 to-pakGreen-800 p-6 rounded-2xl text-white shadow-lg">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6" /> Golden Rule
                </h3>
                <p className="text-pakGreen-50 leading-relaxed">
                  "The interview is not a test of your knowledge; that has already been tested. It is a test of your personality, confidence, honesty, and analytical ability."
                </p>
              </div>
            </div>
          )}

          {activeTab === 'psych' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Psychological Assessment</h2>
                <p className="text-gray-700 mb-6">
                  Conducted over 2 days, this assessment evaluates your mental aptitude, behavioral traits, and group dynamics. It is non-graded but heavily influences the Viva panel's decision.
                </p>

                <div className="space-y-4">
                  <div className="border-l-4 border-indigo-500 pl-4 py-1">
                    <h3 className="font-bold text-lg text-gray-900">Written Tests</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Includes Sentence Completion, Word Association, Picture Story Writing (Thematic Apperception), and autobiographical questionnaires.
                    </p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md font-medium">Be Positive</span>
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md font-medium">Be Consistent</span>
                    </div>
                  </div>

                  <div className="border-l-4 border-pink-500 pl-4 py-1">
                    <h3 className="font-bold text-lg text-gray-900">Group Activities</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Command Tasks (leading a group to solve a problem) and Group Discussions on current topics. Evaluates leadership, cooperation, and communication.
                    </p>
                  </div>

                  <div className="border-l-4 border-teal-500 pl-4 py-1">
                    <h3 className="font-bold text-lg text-gray-900">Psych Interview</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      A one-on-one session with a psychologist to probe into your personality traits and cross-check your written responses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'viva' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">The Viva Voce Panel</h2>
                
                <div className="grid gap-6">
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <CheckIcon className="w-6 h-6 text-pakGreen-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">The Panelists</h3>
                      <p className="text-gray-600 mt-1">Usually 4-5 members, including the FPSC Chairman and subject matter experts. They are seasoned bureaucrats and scholars.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <CrossIcon className="w-6 h-6 text-red-500 transform rotate-45" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Don'ts (Red Flags)</h3>
                      <ul className="mt-2 space-y-2 text-gray-600 list-disc pl-4">
                        <li>Do not bluff. If you don't know, say "I don't know, Sir/Madam".</li>
                        <li>Do not get aggressive or emotional on controversial topics.</li>
                        <li>Do not sit before being asked.</li>
                        <li>Do not fidget or avoid eye contact.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <CheckIcon className="w-6 h-6 text-pakGreen-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Do's (Green Flags)</h3>
                      <ul className="mt-2 space-y-2 text-gray-600 list-disc pl-4">
                        <li>Dress impeccably.</li>
                        <li>Maintain a composed, pleasant demeanor (a slight smile).</li>
                        <li>Listen to the question fully before answering.</li>
                        <li>Defend your opinion logically, but concede politely if proven wrong.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Common Questions</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-pakGreen-700 mb-2">1. Introduction</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      "Please introduce yourself." <br/>
                      <span className="text-sm text-gray-500 mt-1 block">Tip: Keep it 2-3 minutes. Cover education, family background (briefly), hobbies, and achievements. This sets the direction of the interview.</span>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-pakGreen-700 mb-2">2. Motivation</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      "Why do you want to join the Civil Service?" <br/>
                      <span className="text-sm text-gray-500 mt-1 block">Tip: Avoid clichés like "I want to serve the nation" (everyone says that). Be specific: impact, policy-making, career diversity.</span>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-pakGreen-700 mb-2">3. Optional Subjects</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      Expect deep technical questions from your degree subject and CSS optionals. <br/>
                      <span className="text-sm text-gray-500 mt-1 block">Example: "Relate the theory of realism with current Pakistan-India relations." (IR)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dress' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Dress Code</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Gentlemen</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-center gap-2">
                        <CheckIcon className="w-5 h-5 text-pakGreen-600" />
                        <span>Two-piece Lounge Suit (Navy Blue, Charcoal Grey, or Black).</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckIcon className="w-5 h-5 text-pakGreen-600" />
                        <span>White or light blue formal shirt.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckIcon className="w-5 h-5 text-pakGreen-600" />
                        <span>Conservative tie (Silk, simple pattern).</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckIcon className="w-5 h-5 text-pakGreen-600" />
                        <span>Black formal shoes (Oxfords), polished.</span>
                      </li>
                      <li className="mt-4 pt-4 border-t border-gray-200 font-medium">
                        Alternative: Sherwani with Shalwar Kameez (White/Off-white) and Jinnah Cap.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Ladies</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-center gap-2">
                        <CheckIcon className="w-5 h-5 text-pakGreen-600" />
                        <span>Decent, modest Shalwar Kameez.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckIcon className="w-5 h-5 text-pakGreen-600" />
                        <span>Sober colors (Pastels, White, Blue, Beige). Avoid flashy prints.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckIcon className="w-5 h-5 text-pakGreen-600" />
                        <span>Properly draped Dupatta.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckIcon className="w-5 h-5 text-pakGreen-600" />
                        <span>Minimal jewelry and light makeup.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckIcon className="w-5 h-5 text-pakGreen-600" />
                        <span>Comfortable formal sandals or shoes (no loud heels).</span>
                      </li>
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

export default InterviewPreparation;
