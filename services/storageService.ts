import { Note } from '../types';

const STORAGE_KEY = 'css_prep_notes_v1';

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
