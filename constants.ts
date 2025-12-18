import { Subject } from './types';

export const COMPULSORY_SUBJECTS = [
  Subject.ESSAY,
  Subject.PAK_AFFAIRS,
  Subject.CURRENT_AFFAIRS,
  Subject.ISLAMIAT
];

export const OPTIONAL_SUBJECTS = [
  Subject.INT_RELATIONS,
  Subject.POLITICAL_SCIENCE,
  Subject.GENDER_STUDIES,
  Subject.FOREIGN_AFFAIRS
];

export const SUBJECTS_LIST = [
  ...COMPULSORY_SUBJECTS,
  ...OPTIONAL_SUBJECTS,
  Subject.ALL_COMPULSORY,
  Subject.ALL_OPTIONAL
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
  { id: 'sm-4', title: 'Current Affairs Timeline', prompt: 'Create a timeline of at least 20 major events in Pakistan and the world for the last 12 months.', category: 'Current Affairs' },
];

export const CSS_RESOURCES = [
  { id: 'cr-2', title: 'Past Papers Analysis', prompt: 'Analyze the trends of CSS Past Papers from 2018-2024 for Essay and Current Affairs.', category: 'Past Papers' },
  { id: 'cr-3', title: 'Interview Tips', prompt: 'Provide expert tips for the CSS Viva Voce/Psychological assessment.', category: 'Guidance' },
  { id: 'cr-4', title: 'Subject Selection Guide', prompt: 'Guide on how to select optional subjects for CSS based on scoring trends.', category: 'Guidance' },
];

export const NEWS_EVENTS = [
  {
    id: 'ne-1',
    title: 'FPSC CSS Official Announcements',
    date: 'Official',
    type: 'Portal',
    url: 'https://www.fpsc.gov.pk/',
    source: 'FPSC',
  },
  {
    id: 'ne-2',
    title: 'CSS Rules, Syllabus, and Downloads',
    date: 'Official',
    type: 'Resources',
    url: 'https://www.fpsc.gov.pk/examination/css',
    source: 'FPSC',
  },
  {
    id: 'ne-3',
    title: 'Federal Government Gazette & Notifications',
    date: 'Updates',
    type: 'Govt',
    url: 'https://www.gazette.gov.pk/',
    source: 'Govt of Pakistan',
  },
  {
    id: 'ne-4',
    title: 'PBS Key Indicators',
    date: 'Data',
    type: 'Stats',
    url: 'https://www.pbs.gov.pk/',
    source: 'Pakistan Bureau of Statistics',
  },
  {
    id: 'ne-5',
    title: 'State Bank of Pakistan: Press Releases',
    date: 'Updates',
    type: 'Economy',
    url: 'https://www.sbp.org.pk/press_rel/index.asp',
    source: 'SBP',
  },
  {
    id: 'ne-6',
    title: 'Pakistan Economic Survey (Latest)',
    date: 'Report',
    type: 'Economy',
    url: 'https://www.finance.gov.pk/survey/',
    source: 'Ministry of Finance',
  },
] as const;
