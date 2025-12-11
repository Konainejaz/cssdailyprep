import { Subject } from './types';

export const SUBJECTS_LIST = [
  Subject.PAK_AFFAIRS,
  Subject.FOREIGN_AFFAIRS,
  Subject.INT_RELATIONS,
  Subject.CURRENT_AFFAIRS,
  Subject.POLITICAL_SCIENCE,
  Subject.GENDER_STUDIES,
  Subject.ESSAY,
  Subject.ISLAMIAT
];

// Fallback data in case API fails or for initial state
export const MOCK_ARTICLES = [
  {
    id: 'mock-1',
    title: 'The Geopolitical Implications of CPEC Phase II',
    summary: 'An analysis of how the second phase of CPEC impacts Pakistan\'s foreign policy and economic outlook.',
    content: 'Lorem ipsum...',
    subject: Subject.PAK_AFFAIRS,
    source: 'DAWN Analysis',
    date: new Date().toISOString().split('T')[0],
    readTime: '5 min',
    tags: ['CPEC', 'Economy', 'Foreign Policy']
  }
];

export const STUDY_MATERIALS = [
  { id: 'sm-1', title: 'Important Essays', prompt: 'List 10 expected essay topics for CSS 2025 with outlines.', category: 'Essay' },
  { id: 'sm-2', title: 'Vocabulary Builder', prompt: 'Provide 20 high-frequency GRE words with meanings and sentence usage for CSS.', category: 'English' },
  { id: 'sm-3', title: 'Islamiat Verses', prompt: 'Key Quranic verses and Hadiths for Islamiat CSS topics.', category: 'Islamiat' },
  { id: 'sm-4', title: 'Current Affairs Timeline', prompt: 'Create a timeline of major events in Pakistan for the last 12 months.', category: 'Current Affairs' },
];

export const CSS_RESOURCES = [
  { id: 'cr-1', title: 'CSS Syllabus 2025', prompt: 'Detailed breakdown of CSS Syllabus 2025 for compulsory and optional subjects.', category: 'Syllabus' },
  { id: 'cr-2', title: 'Past Papers Analysis', prompt: 'Analyze the trends of CSS Past Papers from 2018-2024 for Essay and Current Affairs.', category: 'Past Papers' },
  { id: 'cr-3', title: 'Interview Tips', prompt: 'Provide expert tips for the CSS Viva Voce/Psychological assessment.', category: 'Guidance' },
  { id: 'cr-4', title: 'Subject Selection Guide', prompt: 'Guide on how to select optional subjects for CSS based on scoring trends.', category: 'Guidance' },
];
