import { Note, QuizQuestion, Subject, Difficulty } from '../types';

const STORAGE_KEY = 'css_prep_notes_v1';
const QUESTION_BANK_KEY = 'css_prep_question_bank_v1';
const QUESTION_HISTORY_KEY = 'css_prep_question_history_v1';

export const getNotes = (): Note[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load notes", e);
    return [];
  }
};

export const saveNote = (note: Note): Note[] => {
  const notes = getNotes();
  const existingIndex = notes.findIndex(n => n.id === note.id);
  
  let newNotes;
  if (existingIndex >= 0) {
    newNotes = [...notes];
    newNotes[existingIndex] = { ...note, updatedAt: Date.now() };
  } else {
    newNotes = [note, ...notes]; // Add to top
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
  return newNotes;
};

export const deleteNote = (id: string): Note[] => {
  const notes = getNotes().filter(n => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  return notes;
};

// Question Bank & History

export const getQuestionBank = (): QuizQuestion[] => {
  try {
    const data = localStorage.getItem(QUESTION_BANK_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load question bank", e);
    return [];
  }
};

export const saveQuestionsToBank = (questions: QuizQuestion[]) => {
  const bank = getQuestionBank();
  // Avoid duplicates by checking question text
  const newQuestions = questions.filter(q => 
    !bank.some(existing => existing.question === q.question)
  );
  
  if (newQuestions.length > 0) {
    const updatedBank = [...bank, ...newQuestions];
    localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(updatedBank));
  }
};

export const getQuestionHistory = (): string[] => {
  try {
    const data = localStorage.getItem(QUESTION_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const addToQuestionHistory = (questionIds: number[]) => {
  const history = getQuestionHistory();
  // Convert IDs to string to ensure consistency, though logic below might need adjustment if IDs are not unique across sessions
  // Since IDs from LLM might be random or sequential per session, we should probably use a hash or just assume we track by question text hash if IDs aren't global.
  // But wait, generateQuiz assigns IDs.
  // Let's assume for now we track by question text hash or just store the question text as "seen".
  // Actually, let's track by a unique hash of the question text.
  
  // For now, I'll update the signature to accept strings (hashes or texts)
  // But to keep it simple with existing types, let's just store the question text for now as the unique identifier.
  const newHistory = [...new Set([...history, ...questionIds.map(String)])];
  localStorage.setItem(QUESTION_HISTORY_KEY, JSON.stringify(newHistory));
};

export const markQuestionsAsSeen = (questions: QuizQuestion[]) => {
    const history = getQuestionHistory();
    const newSeen = questions.map(q => q.question); // Using question text as ID for history
    const updatedHistory = [...new Set([...history, ...newSeen])];
    localStorage.setItem(QUESTION_HISTORY_KEY, JSON.stringify(updatedHistory));
}

export const getSeenQuestions = (): string[] => {
    return getQuestionHistory();
}
