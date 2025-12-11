
import React, { useState, useEffect } from 'react';
import { Note, Subject } from '../types';
import { ChevronLeftIcon, SaveIcon, TrashIcon, BoldIcon, ItalicIcon, ListIcon, CrossIcon } from './Icons';
import { saveNote, deleteNote } from '../services/storageService';

interface NoteEditorProps {
  initialNote: Partial<Note> | null;
  onClose: () => void;
  onSave: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState<Subject | ''>('');

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setContent(initialNote.content || '');
      setSubject(initialNote.subject || '');
    }
  }, [initialNote]);

  // Auto-resize title textarea
  const adjustTitleHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const newNote: Note = {
      id: initialNote?.id || Date.now().toString(),
      title,
      content,
      subject: (subject as Subject) || undefined,
      createdAt: initialNote?.createdAt || Date.now(),
      updatedAt: Date.now(),
      linkedArticleId: initialNote?.linkedArticleId
    };

    saveNote(newNote);
    onSave();
  };

  const handleDelete = () => {
    if (initialNote?.id) {
      if (confirm('Are you sure you want to delete this note?')) {
        deleteNote(initialNote.id);
        onSave(); 
      }
    }
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const beforeText = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const afterText = text.substring(end);

    const newText = `${beforeText}${before}${selectedText}${after}${afterText}`;
    setContent(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-0 md:p-6 animate-fade-in">
      <div className="bg-white w-full h-full md:h-auto md:max-h-[85vh] md:max-w-3xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
             <button 
              onClick={onClose}
              className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full md:hidden"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg text-gray-800 font-serif">
              {initialNote?.id ? 'Edit Note' : 'Create New Note'}
            </span>
          </div>
          
          <div className="flex gap-2">
             {initialNote?.id && (
               <button 
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Note"
              >
                <TrashIcon className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Delete</span>
              </button>
             )}
            <button 
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex items-center gap-2 px-4 py-1.5 bg-pakGreen-600 text-white hover:bg-pakGreen-700 rounded-lg shadow-lg shadow-pakGreen-200 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              <SaveIcon className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-bold">Save Note</span>
            </button>
            <button 
              onClick={onClose}
              className="hidden md:block p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full ml-2"
            >
              <CrossIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto bg-white flex flex-col relative">
           {/* Metadata Bar */}
           <div className="px-6 pt-6 pb-2">
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value as Subject)}
                className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-xs font-semibold text-gray-600 focus:border-pakGreen-500 focus:ring-1 focus:ring-pakGreen-500 outline-none uppercase tracking-wider mb-4 w-auto cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="">Uncategorized</option>
                {Object.values(Subject).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>

              <textarea
                placeholder="Note Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  adjustTitleHeight(e.target);
                }}
                rows={1}
                className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 px-0 mb-4 font-serif leading-tight bg-transparent resize-none overflow-hidden"
                style={{ minHeight: '3rem' }}
              />
           </div>

           {/* Toolbar */}
           <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-6 py-2 border-y border-gray-100 flex gap-1 shadow-sm">
              <button onClick={() => insertText('**', '**')} className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Bold">
                <BoldIcon className="w-5 h-5" />
              </button>
              <button onClick={() => insertText('_', '_')} className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Italic">
                <ItalicIcon className="w-5 h-5" />
              </button>
              <button onClick={() => insertText('\n- ')} className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="List">
                <ListIcon className="w-5 h-5" />
              </button>
           </div>

           <div className="flex-1 px-6 py-4">
              <textarea
                ref={textareaRef}
                id="note-content"
                placeholder="Start writing your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full min-h-[400px] resize-none text-base md:text-lg text-gray-700 leading-relaxed placeholder-gray-300 border-none focus:ring-0 px-0 font-serif bg-transparent"
              />
           </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
