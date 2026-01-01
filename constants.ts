import { Exam, Subject } from './types';

export const COMPULSORY_SUBJECTS = [
  Subject.ESSAY,
  Subject.ENGLISH_PRECIS,
  Subject.GENERAL_SCIENCE_ABILITY,
  Subject.PAK_AFFAIRS,
  Subject.CURRENT_AFFAIRS,
  Subject.ISLAMIAT,
  Subject.COMPARATIVE_RELIGIONS
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

export type PlanId = 'basic' | 'premium';

export const PLANS: Array<{
  id: PlanId;
  name: string;
  pricePkr: number;
  features: string[];
  restrictions?: string[];
}> = [
  {
    id: 'basic',
    name: 'Basic',
    pricePkr: 1000,
    features: [
      'Daily feed, notes, quiz, resources, syllabus, streaks',
      'Research (text)'
    ],
    restrictions: ['No access to AI tools', 'No image search in Research']
  },
  {
    id: 'premium',
    name: 'Premium',
    pricePkr: 1600,
    features: ['Full access (AI tools + research features)']
  }
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

export type LinkItem = {
  id: string;
  title: string;
  date: string;
  type: string;
  url: string;
  source: string;
};

export type ExamOption = { key: Exam; label: string };

export const EXAM_OPTIONS: ExamOption[] = [
  { key: 'CSS', label: 'CSS (FPSC)' },
  { key: 'FPSC', label: 'FPSC (General Recruitment)' },
  { key: 'PPSC', label: 'PPSC (Punjab)' },
  { key: 'PMS', label: 'PMS (Provincial)' },
];

export const EXAM_NEWS_EVENTS: Record<Exam, LinkItem[]> = {
  CSS: [...NEWS_EVENTS] as unknown as LinkItem[],
  FPSC: [
    { id: 'fpsc-1', title: 'FPSC Official Website', date: 'Official', type: 'Portal', url: 'https://www.fpsc.gov.pk/', source: 'FPSC' },
    { id: 'fpsc-2', title: 'General Recruitment Syllabi', date: 'Official', type: 'Syllabus', url: 'https://www.fpsc.gov.pk/category/gr-syllabi', source: 'FPSC' },
    { id: 'fpsc-3', title: 'Previous Question Papers', date: 'Official', type: 'Past Papers', url: 'https://www.fpsc.gov.pk/category/previous-question-papers', source: 'FPSC' },
  ],
  PPSC: [
    { id: 'ppsc-1', title: 'Punjab Public Service Commission', date: 'Official', type: 'Portal', url: 'https://www.ppsc.gop.pk/', source: 'PPSC' },
    { id: 'ppsc-2', title: 'PPSC Jobs / Advertisements', date: 'Official', type: 'Jobs', url: 'https://www.ppsc.gop.pk/', source: 'PPSC' },
    { id: 'ppsc-3', title: 'PPSC Results', date: 'Official', type: 'Results', url: 'https://www.ppsc.gop.pk/', source: 'PPSC' },
    { id: 'ppsc-4', title: 'PMSC / PMS Syllabus & Past Papers (Downloads)', date: 'Official', type: 'Syllabus', url: 'https://ppsc.gop.pk/Downloads.aspx', source: 'PPSC' },
    { id: 'ppsc-5', title: 'PMS Past Papers', date: 'Official', type: 'Past Papers', url: 'https://ppsc.gop.pk/PMSPastPapers.aspx', source: 'PPSC' },
  ],
  PMS: [
    { id: 'pms-1', title: 'Punjab PMS (via PPSC)', date: 'Official', type: 'Portal', url: 'https://www.ppsc.gop.pk/', source: 'PPSC' },
    { id: 'pms-2', title: 'KP PMS & Competitive (KPPSC)', date: 'Official', type: 'Portal', url: 'https://www.kppsc.gov.pk/', source: 'KPPSC' },
    { id: 'pms-3', title: 'KP PMS Previous Papers', date: 'Official', type: 'Past Papers', url: 'https://www.kppsc.gov.pk/pms/pms_2013', source: 'KPPSC' },
    { id: 'pms-4', title: 'Sindh Public Service Commission', date: 'Official', type: 'Portal', url: 'https://spsc.gos.pk/', source: 'SPSC' },
    { id: 'pms-5', title: 'Balochistan Public Service Commission', date: 'Official', type: 'Portal', url: 'http://bpsc.gob.pk/', source: 'BPSC' },
    { id: 'pms-6', title: 'Punjab PMS Syllabus & Past Papers (Downloads)', date: 'Official', type: 'Syllabus', url: 'https://ppsc.gop.pk/Downloads.aspx', source: 'PPSC' },
    { id: 'pms-7', title: 'Punjab PMS Past Papers (PPSC)', date: 'Official', type: 'Past Papers', url: 'https://ppsc.gop.pk/PMSPastPapers.aspx', source: 'PPSC' },
  ],
};

export type ResourceItem = {
  id: string;
  title: string;
  category: string;
  summary?: string;
  prompt?: string;
  url?: string;
  imageUrl?: string;
  author?: string;
  mode?: 'ai' | 'static';
};

export const EXAM_RESOURCES: Record<Exam, ResourceItem[]> = {
  CSS: (CSS_RESOURCES as unknown as ResourceItem[]).map((i) => ({
    ...i,
    mode: 'ai',
    summary:
      i.id === 'cr-2'
        ? 'Trend analysis to identify high-yield areas'
        : i.id === 'cr-3'
          ? 'Practical tips for viva and psychological assessment'
          : i.id === 'cr-4'
            ? 'Optional selection strategy and scoring trends'
            : undefined,
  })),
  FPSC: [
    {
      id: 'fpsc-r-1',
      title: 'GR Syllabi (Official)',
      category: 'Syllabus',
      mode: 'static',
      summary: 'Official syllabi for General Recruitment posts',
      prompt: `# FPSC GR Syllabi (Official)\n\n## What is this page for?\nFPSC General Recruitment (GR) posts can have different syllabi. The official website provides **post-wise syllabi**.\n\n## How to use it (best workflow)\n- Confirm your advertisement (post + case no.)\n- Download/verify the syllabus for that post\n- Check the paper pattern (MCQs vs subjective) and weightage\n- Build a topic-wise checklist and start preparation\n\n## Quick checklist\n- English: comprehension, grammar, vocabulary\n- Quant/Math: arithmetic, ratios, percentages, time & work\n- GK: Pak Affairs, Current Affairs, Everyday Science\n- Post-specific: exact domain topics (as per the advertisement)\n\n## Official source\n- https://www.fpsc.gov.pk/category/gr-syllabi\n`,
    },
    {
      id: 'fpsc-r-2',
      title: 'Previous Question Papers (Official)',
      category: 'Past Papers',
      mode: 'static',
      summary: 'Official previous papers and PDFs uploaded by FPSC',
      prompt: `# FPSC Previous Question Papers (Official)\n\n## What do you get?\nFPSC uploads **previous question papers** (multiple categories) on their website.\n\n## How to use them\n- Select your post / exam category\n- Collect the last 3–5 years papers\n- Highlight recurring topics\n- Do timed practice for time management\n\n## Official source\n- https://www.fpsc.gov.pk/category/previous-question-papers\n`,
    },
    {
      id: 'fpsc-r-3',
      title: 'Apply Online (FPSC) – Quick Guide',
      category: 'Guide',
      mode: 'static',
      summary: 'Account, profile, challan/fee, apply steps',
      prompt: `# FPSC Apply Online – Quick Guide\n\n## Step-by-step\n1) Create an account / login on the FPSC website\n2) Complete your profile: personal, education, experience\n3) Select the post (advertisement + case no.)\n4) Fee process: challan/online deposit (as per the advertisement)\n5) Verify documents: CNIC, photo, degrees, experience letters\n6) Submit the form and print/save your application\n\n## Common mistakes\n- Selecting the wrong case number\n- Incomplete education/experience dates\n- Photo format/size issues\n- Fee deposit slip details mismatch\n\n## Official portal\n- https://www.fpsc.gov.pk/\n`,
    },
  ],
  PPSC: [
    {
      id: 'ppsc-r-1',
      title: 'PPSC Portal (Official)',
      category: 'Portal',
      mode: 'static',
      summary: 'Advertisements, results, downloads, apply info',
      prompt: `# PPSC Official Portal\n\n## What can you verify here?\n- New advertisements / jobs\n- Written test schedules\n- Results / final recommendations\n- Downloads (PMS syllabus, past papers, forms)\n\n## Official portal (copy/paste)\n- https://www.ppsc.gop.pk/\n`,
    },
    {
      id: 'ppsc-r-2',
      title: 'PMS Syllabus (Compulsory) – Official Download',
      category: 'Syllabus',
      mode: 'static',
      summary: 'Official syllabus for Punjab PMS compulsory papers',
      prompt: `# PMS Syllabus (Compulsory) – Official\n\n## What is covered?\nThe official downloads contain the detailed syllabus for Punjab PMS compulsory papers.\n\n## How to use it\n- Turn each paper outline into a topic checklist\n- Map the syllabus to past papers: syllabus → repeated questions\n- Create a weekly revision plan\n\n## Official downloads page (copy/paste)\n- https://ppsc.gop.pk/Downloads.aspx\n`,
    },
    {
      id: 'ppsc-r-3',
      title: 'PMS Syllabus (Optional) – Official Download',
      category: 'Syllabus',
      mode: 'static',
      summary: 'Official syllabus for PMS optional papers',
      prompt: `# PMS Syllabus (Optional) – Official\n\n## Notes\nChoose optional papers based on **your strengths and background**, not only on scoring trends.\n\n## Official downloads page (copy/paste)\n- https://ppsc.gop.pk/Downloads.aspx\n`,
    },
    {
      id: 'ppsc-r-4',
      title: 'PMS Optional Subject Groups (Official)',
      category: 'Guide',
      mode: 'static',
      summary: 'Official optional grouping rules and subject list',
      prompt: `# PMS Optional Subject Groups (Official)\n\n## What is this?\nIn Punjab PMS, optional subjects are selected group-wise. The official downloads include the group list.\n\n## Selection tips\n- Overlap with your background subjects\n- Resource availability + past paper history\n- Time-to-prepare realistically\n\n## Official downloads page (copy/paste)\n- https://ppsc.gop.pk/Downloads.aspx\n`,
    },
    {
      id: 'ppsc-r-5',
      title: 'PMS Past Papers (Official)',
      category: 'Past Papers',
      mode: 'static',
      summary: 'Year-wise subject-wise PMS papers list',
      prompt: `# PMS Past Papers (Official)\n\n## How to use\n- Choose your compulsory + optional subject papers\n- Solve the last 3–5 years papers\n- Note repeated themes and examiner preferences\n\n## Official page (copy/paste)\n- https://www.ppsc.gop.pk/PMSPastPapers.aspx\n`,
    },
    {
      id: 'ppsc-r-6',
      title: 'E-Pay & Forms (PPSC) – Downloads',
      category: 'Guide',
      mode: 'static',
      summary: 'Fee deposit, manuals, proformas, letters',
      prompt: `# PPSC Downloads – E-Pay & Forms\n\n## Useful items\n- E-Pay user manual\n- Departmental permission letter (specimen)\n- Experience letter (specimen)\n- Other exam-related proformas\n\n## Official downloads page (copy/paste)\n- https://ppsc.gop.pk/Downloads.aspx\n`,
    },
  ],
  PMS: [
    {
      id: 'pms-r-1',
      title: 'PMS Overview (All Provinces) – Quick Guide',
      category: 'Guide',
      mode: 'static',
      summary: 'Punjab/KP/Sindh/Balochistan portals and resources',
      prompt: `# PMS Overview (All Provinces)\n\n## What is PMS?\nPMS is a provincial civil services competitive exam. Rules, papers, and schedules can differ **by province**.\n\n## Province-wise official portals (copy/paste)\n- Punjab (PPSC): https://www.ppsc.gop.pk/\n- KP (KPPSC): https://www.kppsc.gov.pk/\n- Sindh (SPSC): https://spsc.gos.pk/\n- Balochistan (BPSC): http://bpsc.gob.pk/\n\n## Best practice\n- Verify the latest advertisement + syllabus for your province\n- Map the syllabus to past papers\n- Build an answer-writing + time-allocation routine\n`,
    },
    {
      id: 'pms-r-2',
      title: 'Punjab PMS Downloads (Syllabus)',
      category: 'Syllabus',
      mode: 'static',
      summary: 'Punjab PMS compulsory/optional syllabus downloads',
      prompt: `# Punjab PMS Syllabus (Official Downloads)\n\n## Official downloads page (copy/paste)\n- https://ppsc.gop.pk/Downloads.aspx\n`,
    },
    {
      id: 'pms-r-3',
      title: 'Punjab PMS Past Papers (PPSC)',
      category: 'Past Papers',
      mode: 'static',
      summary: 'Subject-wise/year-wise PMS papers',
      prompt: `# Punjab PMS Past Papers (Official)\n\n## Official page (copy/paste)\n- https://www.ppsc.gop.pk/PMSPastPapers.aspx\n`,
    },
    {
      id: 'pms-r-4',
      title: 'KP PMS Previous Papers (KPPSC)',
      category: 'Past Papers',
      mode: 'static',
      summary: 'PMS 2010/2013/2016/2018/2022 papers listing',
      prompt: `# KP PMS Previous Papers (Official)\n\nThe KPPSC website provides PMS previous papers year-wise.\n\n## Official page (copy/paste)\n- https://www.kppsc.gov.pk/pms\n- https://www.kppsc.gov.pk/pms/pms_2013\n`,
    },
  ],
};

export const EXAM_BOOKS: Record<Exam, ResourceItem[]> = {
  CSS: [
    {
      id: 'css-b-1',
      title: 'Exploring the World of English (Saeed Ahmad)',
      category: 'English',
      mode: 'static',
      summary: 'Grammar, usage, comprehension, and writing fundamentals',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9789693502356-L.jpg',
      author: 'Saeed Ahmad',
      prompt: `# Exploring the World of English (Saeed Ahmad)\n\n![Cover](https://covers.openlibrary.org/b/isbn/9789693502356-L.jpg)\n\n## Best for\n- Precis & composition basics\n- Sentence correction, grammar rules, error spotting\n\n## How to use\n- Daily 30–45 min: one topic + exercises\n- Make an “error notebook” (rules + examples)\n- Weekly 2 comprehension passages + 1 précis\n\n## Outcome\nStrong base for English papers + MCQs/grammar sections.\n`,
    },
    {
      id: 'css-b-2',
      title: 'High School English Grammar & Composition (Wren & Martin)',
      category: 'English',
      mode: 'static',
      summary: 'Classic grammar drills for accuracy and sentence control',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9788121900096-L.jpg',
      author: 'P. C. Wren, H. Martin',
      prompt: `# Wren & Martin (Grammar & Composition)\n\n![Cover](https://covers.openlibrary.org/b/isbn/9788121900096-L.jpg)\n\n## Best for\n- Grammar accuracy and sentence structure\n- Common error patterns\n\n## How to use\n- Focus on rules + selected exercises (don’t try to finish everything)\n- Pair with daily writing practice: 150–250 words\n\n## Tip\nWrite your own examples for every rule you learn.\n`,
    },
    {
      id: 'css-b-3',
      title: 'Caravan General Knowledge / Pakistan Affairs (Latest Edition)',
      category: 'General Knowledge',
      mode: 'static',
      summary: 'Quick coverage for GK/PA concepts + facts (revise-friendly)',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9789695741661-L.jpg',
      prompt: `# Caravan (GK / Pakistan Affairs)\n\n![Cover](https://covers.openlibrary.org/b/isbn/9789695741661-L.jpg)\n\n## Best for\n- Quick revision + facts consolidation\n- MCQs support\n\n## How to use\n- Build your own one-page sheets: dates, maps, institutions\n- After each chapter: 30–50 MCQs practice\n\n## Tip\nAlways update stats with latest Economic Survey / SBP.\n`,
    },
    {
      id: 'css-b-4',
      title: 'Pakistan Affairs by Ikram Rabbani',
      category: 'Pakistan Affairs',
      mode: 'static',
      summary: 'Structured Pakistan Affairs coverage with historical continuity',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9789690005324-L.jpg',
      author: 'Ikram Rabbani',
      prompt: `# Pakistan Affairs (Ikram Rabbani)\n\n![Cover](https://covers.openlibrary.org/b/isbn/9789690005324-L.jpg)\n\n## Best for\n- Background + timeline clarity\n- Constitutional and political evolution basics\n\n## How to use\n- Make “timeline + causes + impacts” tables\n- Link every topic with current affairs examples\n\n## Tip\nAdd headings, subheadings, and maps/diagrams to your answers.\n`,
    },
    {
      id: 'css-b-5',
      title: 'Current Affairs (Jahangir World Times / Monthly + Annual)',
      category: 'Current Affairs',
      mode: 'static',
      summary: 'Updated issues, global events, Pakistan policy debates',
      imageUrl: 'https://placehold.co/600x900/png?text=JWT+Current+Affairs',
      prompt: `# Current Affairs (JWT Monthly + Annual)\n\n![Cover](https://placehold.co/600x900/png?text=JWT+Current+Affairs)\n\n## Best for\n- Updated arguments, case studies, figures\n- Essay/CA answer enrichment\n\n## How to use\n- Monthly: pick 6–8 key issues\n- Write a 1-page brief per issue: background → stakeholders → options → way forward\n\n## Tip\nUse credible sources: SBP, PBS, UN, World Bank, IMF.\n`,
    },
    {
      id: 'css-b-6',
      title: 'Islamiat (Hafiz Karim Dad Chughtai / equivalent)',
      category: 'Islamiat',
      mode: 'static',
      summary: 'Conceptual Islamiat coverage + modern issues linkage',
      imageUrl: 'https://placehold.co/600x900/png?text=Islamiat',
      prompt: `# Islamiat (Conceptual)\n\n![Cover](https://placehold.co/600x900/png?text=Islamiat)\n\n## Best for\n- Core concepts + contemporary application\n- Structured answer writing\n\n## How to use\n- Topics: belief, ibadah, social system, governance, economy\n- Add Quran/Hadith references where needed (short + relevant)\n\n## Tip\nModern issues: human rights, women rights, extremism, economy, environment.\n`,
    },
    {
      id: 'css-b-7',
      title: 'Everyday Science by Kashmiri / equivalent',
      category: 'Everyday Science',
      mode: 'static',
      summary: 'General science fundamentals for MCQs + short questions',
      imageUrl: 'https://placehold.co/600x900/png?text=Everyday+Science',
      prompt: `# Everyday Science (EDS)\n\n![Cover](https://placehold.co/600x900/png?text=Everyday+Science)\n\n## Best for\n- Basic physics/chemistry/biology\n- Common science MCQs\n\n## How to use\n- Build “definitions + examples” notes\n- Practice MCQs daily (20–30)\n\n## Tip\nFocus on concepts; avoid memorizing without understanding.\n`,
    },
    {
      id: 'css-b-8',
      title: 'Global Politics (Andrew Heywood)',
      category: 'International Relations',
      mode: 'static',
      summary: 'Covers IR concepts and issues in an exam-friendly structure',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9781137604454-L.jpg',
      author: 'Andrew Heywood',
      prompt: `# Global Politics (Andrew Heywood)\n\n![Cover](https://covers.openlibrary.org/b/isbn/9781137604454-L.jpg)\n\n## Best for\n- IR basics: theories, actors, institutions\n- Major themes: security, power, globalization\n\n## CSS approach\n- From each chapter, create one “issue brief”: definition → debate → examples → Pakistan linkage\n- Diagrams: levels of analysis, balance of power, security dilemma\n\n## Output\nBetter conceptual answers + headings + examples.\n`,
    },
    {
      id: 'css-b-9',
      title: 'Diplomacy (Henry Kissinger)',
      category: 'Foreign Affairs',
      mode: 'static',
      summary: 'Historical evolution of diplomacy and global order (example-rich)',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780671510992-L.jpg',
      author: 'Henry Kissinger',
      prompt: `# Diplomacy (Henry Kissinger)\n\n![Cover](https://covers.openlibrary.org/b/isbn/9780671510992-L.jpg)\n\n## Best for\n- Foreign policy evolution and case studies\n- Great powers, alliances, negotiation patterns\n\n## CSS approach\n- Selected chapters: Europe balance, Cold War, post-Cold War order\n- Write each case as: “Lesson + relevance for Pakistan”\n\n## Tip\nUse this as “core reading + notes”; focus on arguments, not rote memorization.\n`,
    },
    {
      id: 'css-b-10',
      title: 'Political Ideologies: An Introduction (Andrew Heywood)',
      category: 'Political Science',
      mode: 'static',
      summary: 'Clear comparative framework for ideologies (CSS optional-friendly)',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9781137606045-L.jpg',
      author: 'Andrew Heywood',
      prompt: `# Political Ideologies (Andrew Heywood)\n\n![Cover](https://covers.openlibrary.org/b/isbn/9781137606045-L.jpg)\n\n## Best for\n- Liberalism, conservatism, socialism, feminism, nationalism\n- Comparison tables for quick revision\n\n## CSS approach\n- Use a template per ideology: core values → thinkers → critiques → contemporary examples\n- Answer writing: headings + 1-2 thinkers + examples\n\n## Output\nScoring answers because structure is naturally comparative.\n`,
    },
    {
      id: 'css-b-11',
      title: 'Feminism Is for Everybody (bell hooks)',
      category: 'Gender Studies',
      mode: 'static',
      summary: 'Accessible conceptual base and terminology for Gender Studies',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780896086286-L.jpg',
      author: 'bell hooks',
      prompt: `# Feminism Is for Everybody (bell hooks)\n\n![Cover](https://covers.openlibrary.org/b/isbn/9780896086286-L.jpg)\n\n## Best for\n- Gender basics: patriarchy, equality, intersectionality (foundation level)\n- Conceptual clarity for debate-oriented answers\n\n## CSS approach\n- Create a glossary of key terms (1–2 lines each)\n- Add Pakistan context examples: education, labor, laws, representation\n\n## Output\nConceptual answers + balanced “way forward”.\n`,
    },
    {
      id: 'css-b-12',
      title: 'The Tragedy of Great Power Politics (John J. Mearsheimer)',
      category: 'International Relations',
      mode: 'static',
      summary: 'Realism, power competition, and case studies for IR answers',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780393020259-L.jpg',
      author: 'John J. Mearsheimer',
      prompt: `# The Tragedy of Great Power Politics (Mearsheimer)\n\n![Cover](https://covers.openlibrary.org/b/isbn/9780393020259-L.jpg)\n\n## Best for\n- A strong framework for offensive realism\n- Great power competition (US-China, alliances, strategy)\n\n## CSS approach\n- Make 1-page notes from the theory section\n- Link case studies with current affairs (Indo-Pacific, BRI, NATO)\n\n## Tip\nKeep this as “selected reading”; balance with Heywood/standard IR texts.\n`,
    },
  ],
  FPSC: [
    {
      id: 'fpsc-b-1',
      title: 'Dogar / Caravan General Recruitment (GK + English + IQ)',
      category: 'Screening',
      mode: 'static',
      summary: 'Generic screening test coverage for many FPSC posts',
      imageUrl: 'https://placehold.co/600x900/png?text=FPSC+Screening',
      prompt: `# FPSC GR (Dogar/Caravan) – Screening Pack\n\n## Best for\n- English + GK + IQ/Quant basics\n- Quick practice MCQs\n\n## How to use\n- Match your advertisement syllabus first\n- Daily routine: 40% MCQs + 60% weak areas\n\n## Tip\nPost-specific subject knowledge is still critical; this is only the base.\n`,
    },
    {
      id: 'fpsc-b-2',
      title: 'Wren & Martin + Vocabulary (Any reliable GRE/High-frequency list)',
      category: 'English',
      mode: 'static',
      summary: 'English accuracy + vocabulary build for screening',
      imageUrl: 'https://placehold.co/600x900/png?text=English+Stack',
      prompt: `# English for FPSC Screening\n\n## Stack\n- Wren & Martin (core grammar)\n- High-frequency vocabulary list (daily)\n\n## Daily plan (30–40 min)\n- 10–15 words + revision\n- 10 sentence correction questions\n- 1 short passage comprehension\n`,
    },
    {
      id: 'fpsc-b-3',
      title: 'Basic Quant / Arithmetic (Any standard entry-test book)',
      category: 'Quant',
      mode: 'static',
      summary: 'Percentages, ratios, averages, time & work, series',
      imageUrl: 'https://placehold.co/600x900/png?text=Quant+Basics',
      prompt: `# Quant for FPSC\n\n## Best for\n- Arithmetic speed + accuracy\n\n## Must-cover topics\n- Percentages, ratios, averages\n- Time & work, time & distance\n- Series, basic algebra\n\n## Tip\nSolve timed sets (15–20 questions / 20 minutes).\n`,
    },
  ],
  PPSC: [
    {
      id: 'ppsc-b-1',
      title: 'PPSC One-Paper (Dogar / Caravan) – General Pack',
      category: 'One Paper',
      mode: 'static',
      summary: 'GK, Pakistan Studies, Islamiyat, English, Maths basics',
      imageUrl: 'https://placehold.co/600x900/png?text=PPSC+One+Paper',
      prompt: `# PPSC One-Paper Preparation Book\n\n## Best for\n- General screening pattern posts\n- Quick revision + MCQs\n\n## How to use\n- Always align with your advertisement syllabus\n- Make short notes for repeated MCQ themes\n\n## Tip\nPast papers for your exact post are the best predictor.\n`,
    },
    {
      id: 'ppsc-b-2',
      title: 'Pakistan Studies + Islamiat (Conceptual) – any standard text',
      category: 'Core',
      mode: 'static',
      summary: 'Conceptual grip for recurring areas in PPSC tests',
      imageUrl: 'https://placehold.co/600x900/png?text=Pak+Studies',
      prompt: `# Pakistan Studies + Islamiat (PPSC)\n\n## Focus areas\n- Constitution, institutions, important events\n- Islamic concepts + modern issues\n\n## Strategy\n- Concept → 30–50 MCQs practice\n- Revise frequently (spaced repetition)\n`,
    },
    {
      id: 'ppsc-b-3',
      title: 'English Grammar & Vocabulary (Wren & Martin + word lists)',
      category: 'English',
      mode: 'static',
      summary: 'Sentence correction, synonyms/antonyms, comprehension',
      imageUrl: 'https://placehold.co/600x900/png?text=English',
      prompt: `# English for PPSC\n\n## Daily\n- 10 vocab words\n- 10 grammar questions\n- 1 passage comprehension\n\n## Tip\nMake your own “confusing words” list.\n`,
    },
  ],
  PMS: [
    {
      id: 'pms-b-1',
      title: 'PMS Punjab Compulsory Papers (JWT/Caravan guides)',
      category: 'Compulsory',
      mode: 'static',
      summary: 'Essay, English, Urdu, Islamiat/Ethics, Pak Studies, GK',
      imageUrl: 'https://placehold.co/600x900/png?text=PMS+Compulsory',
      prompt: `# PMS Compulsory Papers – Prep Guides\n\n## Best for\n- Paper-wise structure and past paper trends\n\n## How to use\n- Past papers mapping: topic → repeated questions\n- Weekly answer writing practice\n\n## Tip\nPresentation matters in compulsory papers: headings, flow, examples.\n`,
    },
    {
      id: 'pms-b-2',
      title: 'PMS Optional Subject (Standard university text per subject)',
      category: 'Optional',
      mode: 'static',
      summary: 'Core textbooks + notes combo for optional subjects',
      imageUrl: 'https://placehold.co/600x900/png?text=PMS+Optional',
      prompt: `# PMS Optional Subjects – Book Selection\n\n## Rule\nBuild your optional preparation from **standard textbooks**, not only from guidebooks.\n\n## Selection framework\n- Background match\n- Resource availability\n- Time-to-prepare\n\n## Tip\nOne core book + one revision guide + past papers.\n`,
    },
    {
      id: 'pms-b-3',
      title: 'Current Affairs (JWT Monthly/Annual + reports)',
      category: 'Current Affairs',
      mode: 'static',
      summary: 'Updated arguments + facts for essay/CA papers',
      imageUrl: 'https://placehold.co/600x900/png?text=Current+Affairs',
      prompt: `# PMS Current Affairs Stack\n\n## Must sources\n- JWT Monthly/Annual\n- Economic Survey, SBP, UN reports\n\n## Output\n- 1-page issue briefs + “way forward” points\n`,
    },
  ],
};

export const EXAM_SYLLABUS_LINKS: Record<Exam, LinkItem[]> = {
  CSS: [],
  FPSC: [
    { id: 'fpsc-s-1', title: 'General Recruitment Syllabi', date: 'Official', type: 'Syllabus', url: 'https://www.fpsc.gov.pk/category/gr-syllabi', source: 'FPSC' },
  ],
  PPSC: [
    { id: 'ppsc-s-1', title: 'PPSC Downloads (Syllabus & Past Papers)', date: 'Official', type: 'Syllabus', url: 'https://ppsc.gop.pk/Downloads.aspx', source: 'PPSC' },
  ],
  PMS: [
    { id: 'pms-s-1', title: 'KP PMS/Competitive Notices & Syllabus', date: 'Official', type: 'Syllabus', url: 'https://www.kppsc.gov.pk/', source: 'KPPSC' },
    { id: 'pms-s-2', title: 'Punjab PMS (via PPSC)', date: 'Official', type: 'Syllabus', url: 'https://www.ppsc.gop.pk/', source: 'PPSC' },
    { id: 'pms-s-3', title: 'Punjab PMS Downloads (Syllabus & Past Papers)', date: 'Official', type: 'Syllabus', url: 'https://ppsc.gop.pk/Downloads.aspx', source: 'PPSC' },
  ],
};

export type SyllabusSection = {
  key: string;
  title: string;
  items: string[];
};

export type ExamSyllabusPaper = {
  key: string;
  code: number;
  title: string;
  marks: number;
  sections: SyllabusSection[];
};

export const EXAM_INTERACTIVE_SYLLABI: Record<
  Exam,
  { compulsory: ExamSyllabusPaper[]; optional: ExamSyllabusPaper[] }
> = {
  CSS: { compulsory: [], optional: [] },
  FPSC: {
    compulsory: [
      {
        key: 'fpsc_general_test',
        code: 1,
        title: 'General Recruitment (Screening Test)',
        marks: 100,
        sections: [
          { key: 'overview', title: 'Overview', items: ['Syllabus varies by post and advertisement', 'This outline covers common screening test areas', 'Use the exact ad/paper pattern for final prep'] },
          { key: 'english', title: 'English', items: ['Vocabulary and synonyms/antonyms', 'Sentence correction and grammar', 'Comprehension and basic writing'] },
          { key: 'iq_math', title: 'IQ / Quantitative', items: ['Basic arithmetic and percentages', 'Ratios, averages, time & work', 'Series and analytical reasoning'] },
          { key: 'gk', title: 'General Knowledge', items: ['Pakistan Affairs basics', 'Current Affairs (last 12 months)', 'Everyday science basics', 'Geography and world facts'] },
          { key: 'islamic', title: 'Islamic Studies / Ethics', items: ['Basic concepts and important topics', 'Ethics for non-Muslims (where applicable)'] },
        ],
      },
    ],
    optional: [],
  },
  PPSC: {
    compulsory: [
      {
        key: 'ppsc_written_template',
        code: 1,
        title: 'PPSC Written Exam (General Outline)',
        marks: 100,
        sections: [
          { key: 'overview', title: 'Overview', items: ['Syllabus varies by post and advertisement', 'Use this as a generic checklist for preparation'] },
          { key: 'english', title: 'English', items: ['Comprehension', 'Sentence correction and grammar', 'Vocabulary'] },
          { key: 'gk', title: 'General Knowledge', items: ['Pakistan Studies', 'Current Affairs', 'Everyday science', 'Basic math'] },
          { key: 'subject', title: 'Subject Paper (Post-specific)', items: ['Subject knowledge is defined in each advertisement', 'Collect past papers for your exact post'] },
        ],
      },
    ],
    optional: [],
  },
  PMS: {
    compulsory: [
      {
        key: 'pms_english_essay',
        code: 1,
        title: 'English Essay',
        marks: 100,
        sections: [
          { key: 'topics', title: 'Core Areas', items: ['National and international issues', 'Economy, governance and society', 'Science, technology and environment', 'Education, culture and media'] },
          { key: 'skills', title: 'Skills', items: ['Thesis and outline building', 'Argumentation and coherence', 'Introductions and conclusions', 'Quotations and references'] },
          { key: 'practice', title: 'Practice', items: ['Write timed essays weekly', 'Prepare 15–20 ready outlines', 'Revise grammar and transitions'] },
        ],
      },
      {
        key: 'pms_english_precis',
        code: 2,
        title: 'English (Precis, Comprehension & Composition)',
        marks: 100,
        sections: [
          { key: 'precis', title: 'Precis & Comprehension', items: ['Precis writing', 'Comprehension', 'Summary and paraphrase'] },
          { key: 'grammar', title: 'Grammar & Usage', items: ['Sentence correction', 'Tenses, narration, active/passive', 'Punctuation and common errors'] },
          { key: 'composition', title: 'Composition', items: ['Pair of words', 'Idioms and phrases', 'Vocabulary and usage'] },
        ],
      },
      {
        key: 'pms_urdu_essay',
        code: 3,
        title: 'Urdu Essay & Composition',
        marks: 100,
        sections: [
          { key: 'essay', title: 'Essay', items: ['National issues and society', 'Culture, education and media', 'Islamic and moral topics', 'Contemporary affairs'] },
          { key: 'lang', title: 'Language & Expression', items: ['Grammar basics', 'Idioms and proverbs', 'Translation (as per pattern)', 'Comprehension (as per pattern)'] },
        ],
      },
      {
        key: 'pms_islamic_ethics',
        code: 4,
        title: 'Islamic Studies / Ethics',
        marks: 100,
        sections: [
          { key: 'beliefs', title: 'Beliefs & Worship', items: ['Articles of faith', 'Pillars of Islam', 'Moral and social teachings'] },
          { key: 'sources', title: 'Sources', items: ['Quran and Sunnah', 'Seerah basics', 'Islamic civilization highlights'] },
          { key: 'ethics', title: 'Ethics (Alternative)', items: ['Ethical theories basics', 'Applied ethics in society', 'Civic and professional ethics'] },
        ],
      },
      {
        key: 'pms_pakistan_studies',
        code: 5,
        title: 'Pakistan Studies',
        marks: 100,
        sections: [
          { key: 'ideology', title: 'Ideology & Movement', items: ['Pakistan Movement overview', 'Constitutional developments', 'Ideology and identity debates'] },
          { key: 'governance', title: 'Governance', items: ['Constitution and institutions', 'Federalism and provinces', 'Civil-military relations basics'] },
          { key: 'issues', title: 'Contemporary Issues', items: ['Economy and development challenges', 'Social issues and reforms', 'Foreign relations overview'] },
        ],
      },
      {
        key: 'pms_general_knowledge',
        code: 6,
        title: 'General Knowledge (MCQs)',
        marks: 100,
        sections: [
          { key: 'everyday', title: 'Everyday Science', items: ['Basic physics/chemistry/biology concepts', 'Human body and health basics', 'Environment and climate basics'] },
          { key: 'ca', title: 'Current Affairs', items: ['Pakistan and world events (last 12 months)', 'International organizations basics', 'Key treaties and conflicts basics'] },
          { key: 'pak', title: 'Pakistan Affairs', items: ['History timeline basics', 'Geography and demography', 'Economy indicators basics'] },
          { key: 'world', title: 'World & Geography', items: ['Maps and important locations', 'Countries, capitals and currencies', 'International days and abbreviations'] },
        ],
      },
    ],
    optional: [
      {
        key: 'pms_optional_ir',
        code: 21,
        title: 'International Relations',
        marks: 200,
        sections: [
          { key: 'theory', title: 'Core Theory', items: ['IR theories and concepts', 'Power, security and diplomacy', 'Foreign policy analysis'] },
          { key: 'global', title: 'Global Politics', items: ['International organizations', 'Conflict and cooperation', 'Contemporary global issues'] },
        ],
      },
      {
        key: 'pms_optional_ps',
        code: 22,
        title: 'Political Science',
        marks: 200,
        sections: [
          { key: 'political_thought', title: 'Political Thought', items: ['Western political thought overview', 'Muslim political thought basics'] },
          { key: 'comparative', title: 'Comparative Politics', items: ['Political systems and constitutions', 'Governance models and institutions'] },
        ],
      },
      {
        key: 'pms_optional_economics',
        code: 23,
        title: 'Economics',
        marks: 200,
        sections: [
          { key: 'micro', title: 'Microeconomics', items: ['Demand/supply and elasticity', 'Market structures', 'Welfare and market failures'] },
          { key: 'macro', title: 'Macroeconomics', items: ['National income', 'Inflation and unemployment', 'Fiscal and monetary policy'] },
          { key: 'pak', title: 'Pakistan Economy', items: ['Growth and development issues', 'Trade and BoP basics', 'Key reforms and challenges'] },
        ],
      },
      {
        key: 'pms_optional_sociology',
        code: 24,
        title: 'Sociology',
        marks: 200,
        sections: [
          { key: 'intro', title: 'Foundations', items: ['Sociological concepts', 'Culture and socialization', 'Social stratification'] },
          { key: 'pak', title: 'Pakistan Society', items: ['Social problems and solutions', 'Urbanization and population', 'Institutions and change'] },
        ],
      },
      {
        key: 'pms_optional_public_admin',
        code: 25,
        title: 'Public Administration',
        marks: 200,
        sections: [
          { key: 'theory', title: 'Administration Theory', items: ['Bureaucracy and organization', 'HR and public management', 'Policy making and implementation'] },
          { key: 'pak', title: 'Public Administration in Pakistan', items: ['Civil services structure', 'Local government basics', 'Reforms and challenges'] },
        ],
      },
      {
        key: 'pms_optional_geography',
        code: 26,
        title: 'Geography',
        marks: 200,
        sections: [
          { key: 'physical', title: 'Physical Geography', items: ['Landforms and climate', 'Resources and environment', 'Maps and interpretation'] },
          { key: 'human', title: 'Human & Economic Geography', items: ['Population and urbanization', 'Industry and agriculture', 'Regional geography basics'] },
        ],
      },
    ],
  },
};

export type OptionalSyllabusItem = {
  key: string;
  code: number;
  title: string;
  marks: number;
};

export const OPTIONAL_SYLLABUS_GROUPS: Array<{
  key: string;
  title: string;
  items: OptionalSyllabusItem[];
}> = [
  {
    key: 'group-1',
    title: 'Group-I (Select 1 subject of 200 marks)',
    items: [
      { key: 'acc_aud', code: 11, title: 'Accountancy & Auditing', marks: 200 },
      { key: 'economics', code: 12, title: 'Economics', marks: 200 },
      { key: 'computer_science', code: 13, title: 'Computer Science', marks: 200 },
      { key: 'political_science', code: 14, title: 'Political Science', marks: 200 },
      { key: 'international_relations', code: 15, title: 'International Relations', marks: 200 },
    ],
  },
  {
    key: 'group-2',
    title: 'Group-II (Select subject(s) of 200 marks)',
    items: [
      { key: 'physics', code: 16, title: 'Physics', marks: 200 },
      { key: 'chemistry', code: 17, title: 'Chemistry', marks: 200 },
      { key: 'applied_mathematics', code: 18, title: 'Applied Mathematics', marks: 100 },
      { key: 'pure_mathematics', code: 19, title: 'Pure Mathematics', marks: 100 },
      { key: 'statistics', code: 20, title: 'Statistics', marks: 100 },
      { key: 'geology', code: 21, title: 'Geology', marks: 100 },
    ],
  },
  {
    key: 'group-3',
    title: 'Group-III (Select 1 subject of 100 marks)',
    items: [
      { key: 'business_administration', code: 22, title: 'Business Administration', marks: 100 },
      { key: 'public_administration', code: 23, title: 'Public Administration', marks: 100 },
      { key: 'governance_public_policies', code: 24, title: 'Governance & Public Policies', marks: 100 },
      { key: 'town_planning_urban_management', code: 25, title: 'Town Planning & Urban Management', marks: 100 },
    ],
  },
  {
    key: 'group-4',
    title: 'Group-IV (Select 1 subject of 100 marks)',
    items: [
      { key: 'history_pak_ind', code: 26, title: 'History of Pakistan & India', marks: 100 },
      { key: 'islamic_history_culture', code: 27, title: 'Islamic History & Culture', marks: 100 },
      { key: 'british_history', code: 28, title: 'British History', marks: 100 },
      { key: 'european_history', code: 29, title: 'European History', marks: 100 },
      { key: 'history_usa', code: 30, title: 'History of USA', marks: 100 },
    ],
  },
  {
    key: 'group-5',
    title: 'Group-V (Select 1 subject of 100 marks)',
    items: [
      { key: 'gender_studies', code: 31, title: 'Gender Studies', marks: 100 },
      { key: 'environmental_sciences', code: 32, title: 'Environmental Sciences', marks: 100 },
      { key: 'agriculture_forestry', code: 33, title: 'Agriculture & Forestry', marks: 100 },
      { key: 'botany', code: 34, title: 'Botany', marks: 100 },
      { key: 'zoology', code: 35, title: 'Zoology', marks: 100 },
      { key: 'english_literature', code: 36, title: 'English Literature', marks: 100 },
      { key: 'urdu_literature', code: 37, title: 'Urdu Literature', marks: 100 },
    ],
  },
  {
    key: 'group-6',
    title: 'Group-VI (Select 1 subject of 100 marks)',
    items: [
      { key: 'law', code: 38, title: 'Law', marks: 100 },
      { key: 'constitutional_law', code: 39, title: 'Constitutional Law', marks: 100 },
      { key: 'international_law', code: 40, title: 'International Law', marks: 100 },
      { key: 'muslim_law_jurisprudence', code: 41, title: 'Muslim Law & Jurisprudence', marks: 100 },
      { key: 'mercantile_law', code: 42, title: 'Mercantile Law', marks: 100 },
      { key: 'criminology', code: 43, title: 'Criminology', marks: 100 },
      { key: 'philosophy', code: 44, title: 'Philosophy', marks: 100 },
    ],
  },
  {
    key: 'group-7',
    title: 'Group-VII (Select 1 subject of 100 marks)',
    items: [
      { key: 'journalism_mass_communication', code: 45, title: 'Journalism & Mass Communication', marks: 100 },
      { key: 'psychology', code: 46, title: 'Psychology', marks: 100 },
      { key: 'geography', code: 47, title: 'Geography', marks: 100 },
      { key: 'sociology', code: 48, title: 'Sociology', marks: 100 },
      { key: 'anthropology', code: 49, title: 'Anthropology', marks: 100 },
      { key: 'punjabi', code: 50, title: 'Punjabi', marks: 100 },
      { key: 'sindhi', code: 51, title: 'Sindhi', marks: 100 },
      { key: 'pashto', code: 52, title: 'Pashto', marks: 100 },
      { key: 'balochi', code: 53, title: 'Balochi', marks: 100 },
      { key: 'persian', code: 54, title: 'Persian', marks: 100 },
      { key: 'arabic', code: 55, title: 'Arabic', marks: 100 },
    ],
  },
];

export const OPTIONAL_SYLLABI: Record<
  string,
  { title: string; sections: SyllabusSection[]; noteSubject?: Subject }
> = {
  acc_aud: {
    title: 'Accountancy & Auditing',
    sections: [
      { key: 'fa', title: 'Financial Accounting', items: ['Accounting concepts and standards', 'Final accounts and adjustments', 'Cash flow statement basics', 'Depreciation and valuation concepts'] },
      { key: 'cost', title: 'Cost & Management Accounting', items: ['Cost concepts and classification', 'Budgeting and variance basics', 'Marginal costing and CVP analysis', 'Standard costing and decision making'] },
      { key: 'audit', title: 'Auditing', items: ['Audit principles and types', 'Audit planning and evidence', 'Internal control and risk assessment', 'Audit report and professional ethics'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Solve numericals regularly and maintain formula/format sheets', 'Practice past papers for presentation and time management', 'Revise standards and key definitions weekly', 'Make short notes for audit procedures and reports'] },
    ],
  },
  economics: {
    title: 'Economics',
    sections: [
      { key: 'micro', title: 'Microeconomics', items: ['Demand, supply and elasticity', 'Consumer and producer theory', 'Market structures and pricing', 'Welfare and market failures'] },
      { key: 'macro', title: 'Macroeconomics', items: ['National income and GDP concepts', 'Inflation, unemployment and growth', 'Fiscal and monetary policy', 'Business cycles and stabilization'] },
      { key: 'dev', title: 'Development & Pakistan Economy', items: ['Development indicators and challenges', 'Poverty, inequality and human capital', 'Trade, BoP and external debt', 'Pakistan economic issues and reforms'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use diagrams and concise definitions in answers', 'Keep Pakistan data points updated (SBP, Economic Survey)', 'Practice numerical problems for elasticity, multipliers etc.', 'Prepare topic-wise past paper questions'] },
    ],
  },
  computer_science: {
    title: 'Computer Science',
    sections: [
      { key: 'fund', title: 'Computing Fundamentals', items: ['Number systems and data representation', 'Computer organization and architecture basics', 'Operating systems fundamentals', 'Networks and internet basics'] },
      { key: 'prog', title: 'Programming & Data Structures', items: ['Programming concepts and problem solving', 'Arrays, stacks, queues, linked lists', 'Trees and graphs basics', 'Algorithm basics and complexity overview'] },
      { key: 'db', title: 'Databases & Software Engineering', items: ['Relational model and SQL basics', 'Normalization concepts', 'Software development lifecycle', 'Testing and quality concepts'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Practice short algorithms/pseudocode for common problems', 'Revise OS + DBMS key terms with examples', 'Solve MCQs for quick revision', 'Write answers with diagrams and clear steps'] },
    ],
  },
  political_science: {
    title: 'Political Science',
    noteSubject: Subject.POLITICAL_SCIENCE,
    sections: [
      { key: 'theory', title: 'Political Theory', items: ['State, sovereignty, law and liberty', 'Democracy and representation', 'Political ideologies: liberalism, socialism, conservatism', 'Political culture and socialization'] },
      { key: 'thinkers', title: 'Western Political Thought', items: ['Plato and Aristotle basics', 'Machiavelli and Hobbes', 'Locke, Rousseau and Mill', 'Modern political thought overview'] },
      { key: 'comparative', title: 'Comparative Politics', items: ['Political systems and institutions', 'Constitutions and forms of government', 'Political parties and pressure groups', 'Public policy and governance basics'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Make one-page notes per thinker with core ideas', 'Use headings and comparisons in answers', 'Link theory with Pakistan examples where relevant', 'Practice past papers for structuring arguments'] },
    ],
  },
  international_relations: {
    title: 'International Relations',
    noteSubject: Subject.INT_RELATIONS,
    sections: [
      { key: 'intro', title: 'IR Foundations', items: ['Nature and scope of IR', 'Approaches and levels of analysis', 'National interest, power and diplomacy', 'Balance of power and security dilemma'] },
      { key: 'theories', title: 'Theories of IR', items: ['Realism and neo-realism', 'Liberalism and neo-liberalism', 'Constructivism', 'Marxism and critical approaches'] },
      { key: 'orgs', title: 'International Organizations', items: ['UN system and functions', 'Collective security and peacekeeping', 'Regional organizations and integration', 'International law basics and regimes'] },
      { key: 'pak', title: 'Pakistan and World Politics', items: ['Foreign policy determinants', 'Major bilateral relations', 'Regional dynamics: South Asia, Middle East, Central Asia', 'Global issues: terrorism, climate, trade, cyber'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Maintain issue briefs with stakeholders and way forward', 'Use maps and timelines for conflicts and alliances', 'Add relevant theories to analytical answers', 'Update with current events and official statements'] },
    ],
  },
  physics: {
    title: 'Physics',
    sections: [
      { key: 'mech', title: 'Mechanics', items: ['Vectors, kinematics and dynamics', 'Work, energy and momentum', 'Rotational motion basics', 'Simple harmonic motion'] },
      { key: 'em', title: 'Electricity & Magnetism', items: ['Electrostatics and circuits', 'Magnetic field and forces', 'Electromagnetic induction', 'AC basics'] },
      { key: 'modern', title: 'Modern Physics', items: ['Quantum basics and atomic structure', 'Nuclear physics basics', 'Semiconductors overview', 'Lasers and applications overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Revise formulas and units consistently', 'Solve numericals and past paper problems', 'Use diagrams and clear steps', 'Practice MCQs for quick review'] },
    ],
  },
  chemistry: {
    title: 'Chemistry',
    sections: [
      { key: 'physical', title: 'Physical Chemistry', items: ['Atomic structure and bonding', 'Thermodynamics basics', 'Chemical kinetics and equilibrium', 'Solutions and electrochemistry'] },
      { key: 'organic', title: 'Organic Chemistry', items: ['Functional groups and reactions', 'Stereochemistry basics', 'Polymers and biomolecules overview', 'Reaction mechanisms overview'] },
      { key: 'inorganic', title: 'Inorganic Chemistry', items: ['Periodic trends', 'Coordination compounds basics', 'Industrial inorganic chemistry overview', 'Environmental chemistry basics'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Make reaction summary sheets and named reactions list', 'Revise concepts with short examples', 'Solve MCQs and practice mechanisms', 'Use balanced equations and clear reasoning'] },
    ],
  },
  applied_mathematics: {
    title: 'Applied Mathematics',
    sections: [
      { key: 'calculus', title: 'Calculus', items: ['Differentiation and integration basics', 'Multiple integrals overview', 'Series and approximations overview'] },
      { key: 'ode', title: 'Differential Equations', items: ['First order ODE techniques', 'Second order linear ODE basics', 'Applications overview'] },
      { key: 'stats', title: 'Probability & Statistics Basics', items: ['Probability basics', 'Random variables overview', 'Basic distributions overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Practice problem sets daily', 'Maintain formula book', 'Solve past papers for pattern recognition', 'Write steps neatly and justify results'] },
    ],
  },
  pure_mathematics: {
    title: 'Pure Mathematics',
    sections: [
      { key: 'algebra', title: 'Algebra', items: ['Sets, functions and relations', 'Matrices and determinants', 'Complex numbers basics'] },
      { key: 'analysis', title: 'Real Analysis Basics', items: ['Limits and continuity', 'Differentiation and integration theory overview', 'Sequences and series overview'] },
      { key: 'geometry', title: 'Geometry Basics', items: ['Coordinate geometry basics', 'Conic sections overview', 'Vectors basics'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Practice proofs and standard results', 'Solve past paper problems with clean steps', 'Revise definitions and theorems frequently', 'Manage time: attempt easier parts first'] },
    ],
  },
  statistics: {
    title: 'Statistics',
    sections: [
      { key: 'descriptive', title: 'Descriptive Statistics', items: ['Data types and presentation', 'Measures of central tendency', 'Dispersion and skewness', 'Correlation and regression basics'] },
      { key: 'prob', title: 'Probability', items: ['Probability rules and Bayes theorem', 'Random variables and expectation', 'Common distributions overview'] },
      { key: 'infer', title: 'Inference', items: ['Sampling and estimation', 'Hypothesis testing basics', 'Chi-square and t-test overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Solve numericals with clear formula substitution', 'Revise distribution properties', 'Practice data interpretation questions', 'Keep a one-page cheat sheet for tests'] },
    ],
  },
  geology: {
    title: 'Geology',
    sections: [
      { key: 'intro', title: 'Physical Geology', items: ['Earth structure and minerals', 'Rocks and rock cycle', 'Plate tectonics and earthquakes', 'Weathering and erosion'] },
      { key: 'hist', title: 'Historical Geology', items: ['Geological time scale', 'Fossils and stratigraphy basics', 'Evolution of continents and oceans'] },
      { key: 'pak', title: 'Geology of Pakistan', items: ['Major geological features of Pakistan', 'Mineral and energy resources overview', 'Engineering geology basics'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use diagrams/maps in answers', 'Revise definitions and processes', 'Make Pakistan-specific notes for resources', 'Practice MCQs for quick retention'] },
    ],
  },
  business_administration: {
    title: 'Business Administration',
    sections: [
      { key: 'mgmt', title: 'Management', items: ['Planning, organizing, leading, controlling', 'Decision making and leadership', 'Motivation and communication', 'Organizational structure and culture'] },
      { key: 'marketing', title: 'Marketing', items: ['Marketing mix and strategy', 'Consumer behavior basics', 'Segmentation and positioning', 'Branding and pricing basics'] },
      { key: 'finance', title: 'Finance', items: ['Time value of money basics', 'Financial statements overview', 'Capital budgeting basics', 'Working capital management overview'] },
      { key: 'hrm', title: 'HRM', items: ['Recruitment and selection', 'Training and development', 'Performance management', 'Compensation overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use frameworks and short models in answers', 'Prepare definitions + applications examples', 'Practice case-style questions', 'Revise key formulas for finance'] },
    ],
  },
  public_administration: {
    title: 'Public Administration',
    sections: [
      { key: 'theory', title: 'Public Administration Foundations', items: ['Nature and scope of public administration', 'Public policy process', 'Bureaucracy and governance', 'Accountability and transparency'] },
      { key: 'org', title: 'Organization & Management', items: ['Administrative behavior', 'Leadership and decision making', 'Budgeting and financial administration', 'Human resource management in public sector'] },
      { key: 'pak', title: 'Public Administration in Pakistan', items: ['Administrative structure', 'Civil service reforms', 'Local governance and devolution', 'Public sector challenges and improvements'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use headings and examples from Pakistan', 'Prepare reforms and governance case studies', 'Revise key theorists and concepts', 'Practice past papers for structure'] },
    ],
  },
  governance_public_policies: {
    title: 'Governance & Public Policies',
    sections: [
      { key: 'gov', title: 'Governance Concepts', items: ['Good governance principles', 'Institutions and public accountability', 'Rule of law and service delivery', 'Corruption and anti-corruption measures'] },
      { key: 'policy', title: 'Public Policy', items: ['Policy cycle and stakeholders', 'Policy instruments and implementation', 'Monitoring and evaluation basics', 'Evidence-based policy and data'] },
      { key: 'pak', title: 'Governance in Pakistan', items: ['Governance challenges and reforms', 'Local government and decentralization', 'Public sector performance', 'Policy issues: education, health, energy, economy'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Prepare issue briefs with problem/causes/solutions', 'Use Pakistan examples and recent reforms', 'Keep governance indices and key data updated', 'Practice answers with way forward'] },
    ],
  },
  town_planning_urban_management: {
    title: 'Town Planning & Urban Management',
    sections: [
      { key: 'urban', title: 'Urban Planning Basics', items: ['Concepts of urbanization and city growth', 'Land use planning', 'Urban governance and institutions', 'Transport and infrastructure planning'] },
      { key: 'housing', title: 'Housing and Environment', items: ['Housing policies and informal settlements', 'Urban environment and waste management', 'Disaster risk reduction and resilience'] },
      { key: 'pak', title: 'Urban Issues in Pakistan', items: ['Urban growth patterns', 'Mega city challenges', 'Smart cities and reforms overview', 'Public-private models overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use diagrams/maps in answers', 'Prepare Pakistan city case studies', 'Revise planning instruments and policies', 'Practice past papers for structured responses'] },
    ],
  },
  history_pak_ind: {
    title: 'History of Pakistan & India',
    sections: [
      { key: 'early', title: 'Early History', items: ['Indus civilization overview', 'Early Muslim rule overview', 'Political and social developments overview'] },
      { key: 'mughal', title: 'Mughal Period', items: ['Administrative and cultural features', 'Key rulers and reforms overview', 'Decline factors overview'] },
      { key: 'colonial', title: 'Colonial and Freedom Movement', items: ['British expansion and policies', 'Socio-religious movements overview', 'Pakistan movement milestones overview'] },
      { key: 'post', title: 'Post-1947 Developments', items: ['Nation building challenges', 'Major political milestones overview', 'Regional issues and relations overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Create timelines for major events', 'Use cause–effect framing in answers', 'Prepare key personalities notes', 'Revise maps and regions for clarity'] },
    ],
  },
  islamic_history_culture: {
    title: 'Islamic History & Culture',
    sections: [
      { key: 'foundations', title: 'Foundations', items: ['Arabia before Islam overview', 'Seerah and early Islamic society overview', 'Rashidun period overview'] },
      { key: 'caliphates', title: 'Umayyads and Abbasids', items: ['Administration and expansion overview', 'Intellectual and cultural developments', 'Decline factors overview'] },
      { key: 'regions', title: 'Muslim Rule in Regions', items: ['Andalusia overview', 'Ottomans overview', 'Central Asia and other regions overview'] },
      { key: 'culture', title: 'Islamic Civilization', items: ['Science and learning contributions', 'Art, architecture and literature', 'Institutions and social structure'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use timelines and dynasties maps', 'Prepare short notes on institutions and reforms', 'Practice comparative questions', 'Add cultural contributions examples'] },
    ],
  },
  british_history: {
    title: 'British History',
    sections: [
      { key: 'early', title: 'Early Modern to Industrial Britain', items: ['Political evolution overview', 'Industrial revolution overview', 'Social and economic changes overview'] },
      { key: 'empire', title: 'Empire and Global Role', items: ['Imperial expansion overview', 'Colonial administration overview', 'Britain and world politics overview'] },
      { key: 'wars', title: '20th Century Britain', items: ['World wars and aftermath overview', 'Welfare state and reforms overview', 'Post-war foreign policy overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Prepare timelines and key acts', 'Use causes/consequences framing', 'Revise key leaders and reforms', 'Practice past papers for structure'] },
    ],
  },
  european_history: {
    title: 'European History',
    sections: [
      { key: 'renaissance', title: 'Renaissance to Enlightenment', items: ['Renaissance and Reformation overview', 'Scientific revolution overview', 'Enlightenment ideas overview'] },
      { key: 'revolution', title: 'Revolutions and Nationalism', items: ['French revolution overview', 'Industrial revolution overview', 'Nationalism and unification overview'] },
      { key: 'wars', title: 'World Wars and Europe', items: ['WWI causes and outcomes overview', 'Inter-war period overview', 'WWII and post-war order overview'] },
      { key: 'integration', title: 'European Integration', items: ['Cold war and Europe overview', 'EU evolution overview', 'Contemporary European challenges overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Make maps for alliances and conflicts', 'Use timelines and thematic headings', 'Link ideas to events (ideology → policy)', 'Practice analytical answers'] },
    ],
  },
  history_usa: {
    title: 'History of USA',
    sections: [
      { key: 'founding', title: 'Foundations', items: ['Colonial period overview', 'American revolution overview', 'Constitution and federalism overview'] },
      { key: 'civilwar', title: 'Civil War and Reconstruction', items: ['Causes and phases overview', 'Reconstruction overview', 'Industrial growth overview'] },
      { key: 'foreign', title: 'US as a Global Power', items: ['World wars and US role overview', 'Cold war overview', 'Post-cold war foreign policy overview'] },
      { key: 'society', title: 'Society and Economy', items: ['Civil rights movement overview', 'Economic transformations overview', 'Contemporary challenges overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Prepare timelines of administrations', 'Use policy themes: economy, race, foreign policy', 'Add key acts/cases short notes', 'Practice past papers'] },
    ],
  },
  gender_studies: {
    title: 'Gender Studies',
    noteSubject: Subject.GENDER_STUDIES,
    sections: [],
  },
  environmental_sciences: {
    title: 'Environmental Sciences',
    sections: [
      { key: 'eco', title: 'Ecology and Environment', items: ['Ecosystems and biodiversity', 'Biogeochemical cycles overview', 'Population and communities overview', 'Environmental impact overview'] },
      { key: 'pollution', title: 'Pollution and Control', items: ['Air, water and soil pollution', 'Waste management overview', 'Environmental standards and control measures'] },
      { key: 'climate', title: 'Climate and Sustainability', items: ['Climate change basics', 'Renewable energy overview', 'Sustainable development goals overview'] },
      { key: 'pak', title: 'Pakistan Environment', items: ['Pakistan environmental challenges', 'Water and energy issues overview', 'Policies and institutions overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Maintain Pakistan examples and statistics', 'Revise definitions and processes', 'Practice diagrams and short notes', 'Solve MCQs regularly'] },
    ],
  },
  agriculture_forestry: {
    title: 'Agriculture & Forestry',
    sections: [
      { key: 'agri', title: 'Agriculture', items: ['Agriculture in Pakistan overview', 'Crops and agronomy basics', 'Soil and water management overview', 'Plant protection basics'] },
      { key: 'livestock', title: 'Livestock and Fisheries', items: ['Livestock management overview', 'Dairy and poultry overview', 'Fisheries basics overview'] },
      { key: 'forestry', title: 'Forestry', items: ['Forest types and significance', 'Forest management and utilization overview', 'Wildlife and eco-tourism overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Prepare Pakistan agriculture data and policy notes', 'Use diagrams for cycles and management', 'Revise key terms and definitions', 'Practice MCQs and short answers'] },
    ],
  },
  botany: {
    title: 'Botany',
    sections: [
      { key: 'plant', title: 'Plant Diversity and Structure', items: ['Plant cell and tissues', 'Morphology and anatomy basics', 'Plant classification overview'] },
      { key: 'phys', title: 'Plant Physiology', items: ['Photosynthesis and respiration', 'Transpiration and transport', 'Growth and hormones'] },
      { key: 'gen', title: 'Genetics and Ecology', items: ['Genetics basics', 'Ecology overview', 'Plant breeding overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use labeled diagrams in answers', 'Revise definitions and processes', 'Practice MCQs for quick revision', 'Make short notes per topic'] },
    ],
  },
  zoology: {
    title: 'Zoology',
    sections: [
      { key: 'cell', title: 'Animal Diversity and Cell Biology', items: ['Cell structure and function basics', 'Animal classification overview', 'Evolution basics overview'] },
      { key: 'phys', title: 'Animal Physiology', items: ['Digestive and circulatory systems', 'Nervous and endocrine systems', 'Reproduction basics overview'] },
      { key: 'eco', title: 'Ecology and Genetics', items: ['Ecology basics overview', 'Genetics basics overview', 'Conservation biology overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use diagrams and clear headings', 'Revise key definitions', 'Practice MCQs regularly', 'Prepare short notes per system'] },
    ],
  },
  english_literature: {
    title: 'English Literature',
    sections: [
      { key: 'poetry', title: 'Poetry', items: ['Major poets and movements overview', 'Literary terms and devices', 'Poetry analysis practice'] },
      { key: 'drama', title: 'Drama', items: ['Major dramatists overview', 'Plot, character and themes', 'Critical appreciation skills'] },
      { key: 'novel', title: 'Novel and Prose', items: ['Major novelists overview', 'Prose themes and styles', 'Contextual and critical reading'] },
      { key: 'crit', title: 'Literary Criticism', items: ['Basics of criticism and theory', 'Schools of thought overview', 'Application in answers'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Practice critical appreciation with quotes', 'Prepare author-wise summaries', 'Revise literary terms and examples', 'Write structured analytical answers'] },
    ],
  },
  urdu_literature: {
    title: 'Urdu Literature',
    sections: [
      { key: 'history', title: 'History of Urdu Literature', items: ['Evolution and major periods overview', 'Key genres and movements overview', 'Major personalities overview'] },
      { key: 'poetry', title: 'Poetry', items: ['Ghazal, nazm and major poets overview', 'Literary devices and style', 'Themes and critical appreciation'] },
      { key: 'prose', title: 'Prose', items: ['Novel, afsana and drama overview', 'Major writers and works overview', 'Critical reading and analysis'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Answer in Urdu with clear headings', 'Use references/quotes appropriately', 'Prepare short notes on movements', 'Practice past papers for structure'] },
    ],
  },
  law: {
    title: 'Law',
    sections: [
      { key: 'intro', title: 'Introduction to Law', items: ['Meaning, nature and sources of law', 'Civil and criminal law basics', 'Court system overview'] },
      { key: 'contracts', title: 'Law of Contract & Torts', items: ['Essentials of valid contract', 'Breach and remedies', 'Torts basics and defences'] },
      { key: 'procedure', title: 'Legal Procedure Basics', items: ['Evidence basics overview', 'Criminal procedure basics overview', 'Legal drafting awareness'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use case references where possible', 'Write answers with issue–rule–application', 'Revise definitions and maxims', 'Practice past papers'] },
    ],
  },
  constitutional_law: {
    title: 'Constitutional Law',
    sections: [
      { key: 'theory', title: 'Constitutional Concepts', items: ['Constitution and constitutionalism', 'Separation of powers', 'Federalism and fundamental rights'] },
      { key: 'pak', title: 'Constitution of Pakistan', items: ['Salient features', 'Parliament, executive, judiciary', 'Islamic provisions and amendments overview'] },
      { key: 'judicial', title: 'Judicial Review and Case Law', items: ['Judicial review concept', 'Constitutional interpretation basics', 'Key constitutional issues overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use article references and headings', 'Prepare amendment-wise short notes', 'Add key cases as examples', 'Practice past paper answers'] },
    ],
  },
  international_law: {
    title: 'International Law',
    sections: [
      { key: 'sources', title: 'Sources and Subjects', items: ['Sources of international law', 'Statehood and recognition', 'Jurisdiction and sovereignty'] },
      { key: 'orgs', title: 'International Organizations', items: ['UN charter overview', 'Peace and security mechanisms', 'International courts overview'] },
      { key: 'law', title: 'Key Regimes', items: ['Law of treaties overview', 'Law of the sea basics', 'International humanitarian law basics'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use definitions + examples', 'Quote key articles/conventions where relevant', 'Practice problem-style questions', 'Revise current developments'] },
    ],
  },
  muslim_law_jurisprudence: {
    title: 'Muslim Law & Jurisprudence',
    sections: [
      { key: 'sources', title: 'Sources of Muslim Law', items: ['Quran, Sunnah, Ijma, Qiyas', 'Ijtihad and schools of thought overview', 'Modern sources overview'] },
      { key: 'family', title: 'Family Law', items: ['Marriage and dower basics', 'Divorce and dissolution basics', 'Maintenance and guardianship basics'] },
      { key: 'inheritance', title: 'Inheritance', items: ['Principles of inheritance', 'Shares and categories overview', 'Practical scenarios overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use headings and Arabic terms carefully', 'Practice inheritance problems', 'Keep references concise', 'Practice past papers'] },
    ],
  },
  mercantile_law: {
    title: 'Mercantile Law',
    sections: [
      { key: 'contract', title: 'Contract and Business Law', items: ['Essentials of contract', 'Agency basics', 'Sale of goods basics'] },
      { key: 'companies', title: 'Company and Partnership', items: ['Partnership basics', 'Company formation basics', 'Corporate governance overview'] },
      { key: 'neg', title: 'Negotiable Instruments', items: ['Bills, cheques and promissory notes', 'Endorsement and liabilities overview', 'Banking basics overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use issue–rule–application approach', 'Memorize key definitions', 'Practice short case scenarios', 'Revise past papers'] },
    ],
  },
  criminology: {
    title: 'Criminology',
    sections: [
      { key: 'intro', title: 'Foundations', items: ['Nature and scope of criminology', 'Crime definitions and types', 'Measurement of crime basics'] },
      { key: 'theories', title: 'Theories of Crime', items: ['Classical and positivist approaches', 'Sociological theories overview', 'Psychological theories overview'] },
      { key: 'system', title: 'Criminal Justice System', items: ['Policing and investigation overview', 'Courts and corrections overview', 'Rehabilitation and prevention strategies'] },
      { key: 'pak', title: 'Crime in Pakistan', items: ['Contemporary crime issues overview', 'Reforms and policy responses overview', 'Victimology basics overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use examples and case references', 'Write structured answers with theory + application', 'Revise key terms', 'Practice past paper questions'] },
    ],
  },
  philosophy: {
    title: 'Philosophy',
    sections: [
      { key: 'logic', title: 'Logic', items: ['Arguments and fallacies', 'Deductive and inductive reasoning', 'Basics of critical thinking'] },
      { key: 'metaphysics', title: 'Metaphysics and Epistemology', items: ['Knowledge and truth', 'Mind and body problem overview', 'Causation and reality overview'] },
      { key: 'ethics', title: 'Ethics', items: ['Ethical theories overview', 'Applied ethics overview', 'Political philosophy basics overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use definitions and examples', 'Compare thinkers and schools', 'Write answers with structured arguments', 'Revise key terms frequently'] },
    ],
  },
  journalism_mass_communication: {
    title: 'Journalism & Mass Communication',
    sections: [
      { key: 'intro', title: 'Foundations', items: ['Communication process and models', 'Media types and functions', 'News values and reporting basics'] },
      { key: 'theory', title: 'Media Theories', items: ['Agenda setting and framing basics', 'Public opinion and propaganda basics', 'Development communication overview'] },
      { key: 'ethics', title: 'Media Law and Ethics', items: ['Press laws overview', 'Ethical principles', 'Freedom of expression and responsibilities'] },
      { key: 'pak', title: 'Media in Pakistan', items: ['Media evolution overview', 'Contemporary issues and challenges', 'Digital media and trends'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Practice short note + analytical answers', 'Use Pakistan examples and recent cases', 'Revise key theories with one-line application', 'Practice past papers'] },
    ],
  },
  psychology: {
    title: 'Psychology',
    sections: [
      { key: 'intro', title: 'Introduction', items: ['Schools of psychology overview', 'Research methods basics', 'Biological basis of behavior overview'] },
      { key: 'learning', title: 'Learning and Cognition', items: ['Learning theories overview', 'Memory and cognition basics', 'Intelligence and testing overview'] },
      { key: 'personality', title: 'Personality and Social Psychology', items: ['Personality theories overview', 'Attitudes and behavior', 'Group dynamics overview'] },
      { key: 'abnormal', title: 'Abnormal and Clinical', items: ['Common disorders overview', 'Stress and coping', 'Therapies overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use definitions and examples', 'Write answers with experiments/case references', 'Revise key theorists', 'Practice MCQs and short notes'] },
    ],
  },
  geography: {
    title: 'Geography',
    sections: [
      { key: 'physical', title: 'Physical Geography', items: ['Geomorphology basics', 'Climatology basics', 'Oceanography basics', 'Biogeography basics'] },
      { key: 'human', title: 'Human Geography', items: ['Population and settlements', 'Economic geography basics', 'Urbanization and planning basics'] },
      { key: 'pak', title: 'Geography of Pakistan', items: ['Physical features', 'Resources and industries overview', 'Agriculture and water issues overview', 'Environmental issues overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use maps and diagrams', 'Revise definitions and processes', 'Prepare Pakistan case studies', 'Practice past papers'] },
    ],
  },
  sociology: {
    title: 'Sociology',
    sections: [
      { key: 'intro', title: 'Sociological Foundations', items: ['Culture, society and socialization', 'Social structure and institutions', 'Social stratification and mobility'] },
      { key: 'theories', title: 'Sociological Theories', items: ['Functionalism, conflict theory, interactionism', 'Social change and modernization', 'Development and dependency overview'] },
      { key: 'pak', title: 'Society in Pakistan', items: ['Family and kinship', 'Urbanization and social issues', 'Education, media and social change'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use local examples and data', 'Write answers with concepts + application', 'Revise key terms', 'Practice past papers'] },
    ],
  },
  anthropology: {
    title: 'Anthropology',
    sections: [
      { key: 'intro', title: 'Foundations', items: ['Nature and scope of anthropology', 'Culture and cultural variation', 'Research methods basics'] },
      { key: 'social', title: 'Social/Cultural Anthropology', items: ['Kinship and marriage', 'Religion and social organization', 'Political and economic systems overview'] },
      { key: 'physical', title: 'Physical Anthropology', items: ['Human evolution overview', 'Race and genetics basics', 'Primatology overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Use examples from Pakistani society', 'Prepare short case studies', 'Revise key terms and concepts', 'Practice past papers'] },
    ],
  },
  punjabi: {
    title: 'Punjabi',
    sections: [
      { key: 'lang', title: 'Language and Grammar', items: ['History and evolution overview', 'Grammar and linguistic basics', 'Translation and composition practice'] },
      { key: 'lit', title: 'Literature', items: ['Major poets and writers overview', 'Classical and modern works overview', 'Themes and criticism basics'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Answer in Punjabi as required', 'Prepare author-wise short notes', 'Practice translation both ways', 'Revise past papers'] },
    ],
  },
  sindhi: {
    title: 'Sindhi',
    sections: [
      { key: 'lang', title: 'Language and Grammar', items: ['History and evolution overview', 'Grammar basics', 'Translation and composition practice'] },
      { key: 'lit', title: 'Literature', items: ['Major writers and poets overview', 'Classical and modern trends overview', 'Critical appreciation'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Answer in Sindhi as required', 'Practice translation and short essays', 'Prepare author notes', 'Revise past papers'] },
    ],
  },
  pashto: {
    title: 'Pashto',
    sections: [
      { key: 'lang', title: 'Language and Grammar', items: ['History and evolution overview', 'Grammar basics', 'Translation and composition practice'] },
      { key: 'lit', title: 'Literature', items: ['Major poets and writers overview', 'Classical and modern works overview', 'Critical appreciation'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Answer in Pashto as required', 'Practice translation and comprehension', 'Prepare author notes', 'Revise past papers'] },
    ],
  },
  balochi: {
    title: 'Balochi',
    sections: [
      { key: 'lang', title: 'Language and Grammar', items: ['History and evolution overview', 'Grammar basics', 'Translation and composition practice'] },
      { key: 'lit', title: 'Literature', items: ['Major poets and writers overview', 'Folklore and modern works overview', 'Critical appreciation'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Answer in Balochi as required', 'Practice translation', 'Prepare key terms notes', 'Revise past papers'] },
    ],
  },
  persian: {
    title: 'Persian',
    sections: [
      { key: 'lang', title: 'Language and Grammar', items: ['Grammar basics', 'Translation and composition practice', 'Vocabulary and idiom practice'] },
      { key: 'lit', title: 'Literature', items: ['Classical poets overview', 'Major prose works overview', 'Themes and criticism basics'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Answer in Persian as required', 'Practice translation both ways', 'Prepare author and text summaries', 'Revise past papers'] },
    ],
  },
  arabic: {
    title: 'Arabic',
    sections: [
      { key: 'lang', title: 'Language and Grammar', items: ['Nahw and sarf basics', 'Translation and composition practice', 'Vocabulary and comprehension'] },
      { key: 'lit', title: 'Literature', items: ['Classical literature overview', 'Modern literature overview', 'Rhetoric basics overview'] },
      { key: 'practice', title: 'Suggested Study Approach', items: ['Answer in Arabic as required', 'Practice translation and comprehension', 'Revise grammar rules with examples', 'Revise past papers'] },
    ],
  },
};
