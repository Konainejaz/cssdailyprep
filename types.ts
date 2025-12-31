import React from 'react';

export enum Subject {
  FOREIGN_AFFAIRS = "Foreign Affairs",
  PAK_AFFAIRS = "Pak Affairs",
  INT_RELATIONS = "International Relations",
  GENDER_STUDIES = "Gender Studies",
  POLITICAL_SCIENCE = "Political Science",
  ESSAY = "English Essay",
  ENGLISH_PRECIS = "English (Precis and Composition)",
  GENERAL_SCIENCE_ABILITY = "General Science & Ability",
  CURRENT_AFFAIRS = "Current Affairs",
  ISLAMIAT = "Islamiat",
  COMPARATIVE_RELIGIONS = "Comparative Study of Major Religions",
  ALL = "All Subjects",
  ALL_COMPULSORY = "All Compulsory Subjects",
  ALL_OPTIONAL = "All Optional Subjects"
}

export type Exam = 'CSS' | 'PMS' | 'FPSC' | 'PPSC';

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string; // Markdown or formatted text
  subject: Subject;
  source: string;
  date: string;
  readTime: string;
  tags: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  subject?: Subject; // Optional category for the note
  linkedArticleId?: string; // If created from an article
}

export interface MindMapNode {
  id: string;
  label: string;
  details?: string;
  children?: MindMapNode[];
}

export interface ResearchResult {
  query: string;
  content: string;
  sources: Array<{ title: string; url: string }>;
  mindMap?: MindMapNode;
}

export enum Difficulty {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard"
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  explanation: string;
  subject?: string;
  difficulty?: string;
}

export interface QuizSession {
  subject: Subject;
  difficulty: Difficulty;
  questions: QuizQuestion[];
  score: number;
  timeSpent: number; // seconds
}

export interface StudyTimelineItem {
  id: string; // Added ID for detailed fetching/persistence
  date: string;
  title: string;
  description: string;
  category?: string;
  content?: string; // Full 300+ words
  source?: string;
  tags?: string[];
  imagePrompt?: string; // For generating/finding images
  imageKeyword?: string; // Short keyword for image search
}

export interface StudyVocabItem {
  word: string;
  meaning: string;
  sentence: string;
  type?: string;
}

export interface StudyEssayItem {
  id: string; // Added ID
  title: string;
  outline: string[];
  content?: string; // Full essay
}

export interface StudyIslamiatItem {
  id?: string; // Optional ID for tracking
  arabic: string;
  translation: string;
  reference: string;
  context: string;
  // Detailed fields
  analysis?: string;
  cssRelevance?: string;
  relatedTopics?: string[];
  keyTakeaways?: string[];
}

export type ViewState = 'FEED' | 'NOTE_LIST' | 'NOTE_EDIT' | 'ARTICLE_DETAIL' | 'RESEARCH' | 'QUIZ' | 'QUIZ_SESSION' | 'STUDY_MATERIAL' | 'SYLLABUS' | 'EXAM_SYLLABUS_DETAIL' | 'CSS_RESOURCES' | 'BOOKS' | 'PAST_PAPERS' | 'RESOURCE_DETAIL' | 'GENDER_SYLLABUS' | 'ESSAY_SYLLABUS' | 'ENGLISH_PRECIS_SYLLABUS' | 'GSA_SYLLABUS' | 'CURRENT_AFFAIRS_SYLLABUS' | 'PAK_AFFAIRS_SYLLABUS' | 'ISLAMIAT_SYLLABUS' | 'COMP_RELIGIONS_SYLLABUS' | 'OPTIONAL_SYLLABUS_DETAIL' | 'INTERVIEW_PREP' | 'SUBJECT_SELECTION' | 'STUDY_TIMELINE' | 'STUDY_VOCAB' | 'STUDY_ESSAYS' | 'STUDY_ISLAMIAT' | 'AUTH_LOGIN' | 'AUTH_REGISTER' | 'AUTH_FORGOT' | 'PROFILE' | 'ADMIN_PANEL' | 'HISTORY' | 'AI_SUMMARIZER' | 'FLASHCARDS' | 'AI_LECTURE_NOTES' | 'AI_MIND_MAP' | 'STREAKS' | 'NEWS_EVENTS';

export interface SidebarItem {
  title: string;
  view?: ViewState;
  icon?: React.ReactNode;
  children?: { title: string; prompt: string }[]; // prompt for AI generation
  isOpen?: boolean;
}
