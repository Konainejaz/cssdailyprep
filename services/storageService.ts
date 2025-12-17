import { supabase } from '../lib/supabase';
import { Note, QuizQuestion, Subject, Difficulty } from '../types';

const STORAGE_KEY = 'css_prep_notes_v1';
const QUESTION_BANK_KEY = 'css_prep_question_bank_v1';
const QUESTION_HISTORY_KEY = 'css_prep_question_history_v1';
const STREAK_KEY = 'css_prep_streak_v1';

export interface StreakData {
  count: number;
  lastVisitDate: string;
}

// --- Local Storage Helpers (Legacy/Fallback) ---
export const getNotesLocal = (): Note[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

export const saveNoteLocal = (note: Note): Note[] => {
  const notes = getNotesLocal();
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

export const deleteNoteLocal = (id: string): Note[] => {
  const notes = getNotesLocal().filter(n => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  return notes;
};

const isUuid = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
};

const mapDbRowToNote = (row: any): Note => {
  const createdAt = row?.created_at ? Date.parse(row.created_at) : Date.now();
  const updatedAt = row?.updated_at ? Date.parse(row.updated_at) : createdAt;

  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    content: String(row.content ?? ''),
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
    updatedAt: Number.isFinite(updatedAt) ? updatedAt : Date.now(),
    subject: row.subject ?? undefined,
    linkedArticleId: row.linked_article_id ?? undefined
  };
};

const mapNoteToDbRow = (note: Note, userId: string) => ({
  id: note.id,
  user_id: userId,
  title: note.title,
  content: note.content,
  subject: note.subject ?? null,
  linked_article_id: note.linkedArticleId ?? null,
  created_at: new Date(note.createdAt).toISOString(),
  updated_at: new Date(note.updatedAt).toISOString()
});

export const getNotes = async (): Promise<Note[]> => {
  try {
    const session = await getSession();
    if (!session?.user?.id) return getNotesLocal();

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    if (error || !data) return getNotesLocal();
    return data.map(mapDbRowToNote);
  } catch {
    return getNotesLocal();
  }
};

export const saveNote = async (note: Note): Promise<void> => {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      saveNoteLocal(note);
      return;
    }

    const nextId = isUuid(note.id) ? note.id : crypto.randomUUID();
    const noteToSave: Note = { ...note, id: nextId };

    const { error } = await supabase
      .from('notes')
      .upsert(mapNoteToDbRow(noteToSave, session.user.id), { onConflict: 'id' });

    if (error) {
      saveNoteLocal(note);
    }
  } catch {
    saveNoteLocal(note);
  }
};

export const deleteNote = async (id: string): Promise<void> => {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      deleteNoteLocal(id);
      return;
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      deleteNoteLocal(id);
    }
  } catch {
    deleteNoteLocal(id);
  }
};

export const migrateNotes = async () => {
  const localNotes = getNotesLocal();
  if (localNotes.length === 0) return;

  const session = await getSession();
  if (!session?.user?.id) return;

  const rows = localNotes.map(n => {
    const nextId = isUuid(n.id) ? n.id : crypto.randomUUID();
    return mapNoteToDbRow({ ...n, id: nextId }, session.user.id);
  });

  try {
    const { error } = await supabase.from('notes').upsert(rows, { onConflict: 'id' });
    if (error) return;
  } catch {
    return;
  }
};


// --- Streak & Quiz (Keep Local for now or move to DB later per plan) ---
// Plan Phase 4 mentions history/logs, but Streak is simpler. 
// Plan says "streak in storageService.ts:98-136".
// We can keep it local or move to `user_settings` or `profiles`.
// Let's keep it local for now to respect "Phase 4: History + Logs" priority, 
// and Streak wasn't explicitly in Phase 2 or 3 tasks list in the prompt detail 
// (though it is "Personalized").
// But since I'm here, I'll leave streak as is.

export const updateStreak = (): StreakData => {
  let streak: StreakData = { count: 0, lastVisitDate: '' };
  try {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) streak = JSON.parse(stored);
  } catch {}

  const today = new Date().toISOString().split('T')[0];
  
  if (streak.lastVisitDate === today) {
    return streak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (streak.lastVisitDate === yesterdayStr) {
    streak.count += 1;
  } else {
    streak.count = 1;
  }
  
  streak.lastVisitDate = today;
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  return streak;
};

// --- Question Bank (Keep Local) ---
export const getQuestionBank = (): QuizQuestion[] => {
  try {
    const data = localStorage.getItem(QUESTION_BANK_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

export const saveQuestionsToBank = (questions: QuizQuestion[]) => {
  const bank = getQuestionBank();
  const newBank = [...bank, ...questions];
  // Deduplicate by question text
  const uniqueBank = Array.from(new Map(newBank.map(item => [item.question, item])).values());
  localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(uniqueBank));
};

export const getSeenQuestions = (): string[] => {
  try {
    const data = localStorage.getItem(QUESTION_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

export const markQuestionsAsSeen = (questions: QuizQuestion[]) => {
  const seen = new Set(getSeenQuestions());
  for (const q of questions) {
    if (q?.question) seen.add(q.question);
  }
  localStorage.setItem(QUESTION_HISTORY_KEY, JSON.stringify(Array.from(seen)));
};

export const markQuestionAsSeen = (question: QuizQuestion) => {
  markQuestionsAsSeen([question]);
};
