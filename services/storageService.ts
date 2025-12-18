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

const getStreakLocal = (): StreakData => {
  let streak: StreakData = { count: 0, lastVisitDate: '' };
  try {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) streak = JSON.parse(stored);
  } catch {}
  return streak;
};

const saveStreakLocal = (streak: StreakData) => {
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
};

const normalizeDate = (date: Date) => date.toISOString().split('T')[0];

const computeNextStreak = (current: StreakData): StreakData => {
  const today = normalizeDate(new Date());
  if (current.lastVisitDate === today) return current;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = normalizeDate(yesterday);

  const nextCount = current.lastVisitDate === yesterdayStr ? current.count + 1 : 1;
  return { count: nextCount, lastVisitDate: today };
};

export const updateStreak = async (): Promise<StreakData> => {
  const local = getStreakLocal();

  try {
    const session = await getSession();
    if (!session?.user?.id) {
      const nextLocal = computeNextStreak(local);
      saveStreakLocal(nextLocal);
      return nextLocal;
    }

    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('preferences')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error) throw error;

    const prefs = (settings?.preferences ?? {}) as any;
    const dbStreak: StreakData | null =
      prefs?.streak && typeof prefs.streak === 'object'
        ? { count: Number(prefs.streak.count ?? 0), lastVisitDate: String(prefs.streak.lastVisitDate ?? '') }
        : null;

    const base =
      dbStreak && dbStreak.lastVisitDate && dbStreak.lastVisitDate >= local.lastVisitDate
        ? dbStreak
        : local;

    const next = computeNextStreak(base);
    saveStreakLocal(next);

    const nextPrefs = { ...prefs, streak: next };
    await supabase.from('user_settings').upsert(
      {
        user_id: session.user.id,
        preferences: nextPrefs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    return next;
  } catch {
    const nextLocal = computeNextStreak(local);
    saveStreakLocal(nextLocal);
    return nextLocal;
  }
};

export const fetchRecentLogs = async (days: number = 14) => {
  const session = await getSession();
  if (!session?.user?.id) return [];

  const since = new Date();
  since.setDate(since.getDate() - Math.max(1, days));

  const { data, error } = await supabase
    .from('user_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error || !data) return [];
  return data;
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
