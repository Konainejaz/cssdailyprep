import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Note, Subject } from '../types';
import { 
  ChevronLeftIcon, SaveIcon, TrashIcon, BoldIcon, ItalicIcon, ListIcon, CrossIcon,
  CodeIcon, QuoteIcon, LinkIcon, HeadingIcon, UndoIcon, RedoIcon,
  AlignLeftIcon, AlignCenterIcon, AlignRightIcon, AlignJustifyIcon,
  UnderlineIcon, StrikeIcon, OrderedListIcon
} from './Icons';
import { saveNote, deleteNote } from '../services/storageService';
import Modal from './Modal';

interface NoteEditorProps {
  initialNote: Partial<Note> | null;
  onClose: () => void;
  onSave: () => void;
}

const MenuBar = ({ editor, onOpenLink }: { editor: any; onOpenLink: () => void }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-white sticky top-0 z-10 overflow-x-auto">
      <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-1 shrink-0">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
          title="Undo"
        >
          <UndoIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
          title="Redo"
        >
          <RedoIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-1 shrink-0">
        <select
          onChange={(e) => {
            const next = e.target.value;
            if (!next) {
              editor.chain().focus().unsetFontFamily().run();
              return;
            }
            editor.chain().focus().setFontFamily(next).run();
          }}
          className="h-8 text-sm border-gray-200 rounded hover:bg-gray-50 focus:ring-0 cursor-pointer w-32"
          value={editor.getAttributes('textStyle').fontFamily || ''}
        >
          <option value="">Default Font</option>
          <option value="Inter">Inter</option>
          <option value="Comic Sans MS, Comic Sans">Comic Sans</option>
          <option value="serif">Serif</option>
          <option value="monospace">Monospace</option>
          <option value="cursive">Cursive</option>
        </select>
      </div>

      <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-1 shrink-0">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={<BoldIcon className="w-4 h-4" />}
          title="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={<ItalicIcon className="w-4 h-4" />}
          title="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={<UnderlineIcon className="w-4 h-4" />}
          title="Underline"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={<StrikeIcon className="w-4 h-4" />}
          title="Strike"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          icon={<CodeIcon className="w-4 h-4" />}
          title="Inline Code"
        />
      </div>

      <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-1 shrink-0">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          icon={<AlignLeftIcon className="w-4 h-4" />}
          title="Align Left"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={<AlignCenterIcon className="w-4 h-4" />}
          title="Align Center"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          icon={<AlignRightIcon className="w-4 h-4" />}
          title="Align Right"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          icon={<AlignJustifyIcon className="w-4 h-4" />}
          title="Justify"
        />
      </div>

      <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-1 shrink-0">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={<span className="font-bold text-xs">H1</span>}
          title="Heading 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={<span className="font-bold text-xs">H2</span>}
          title="Heading 2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          icon={<span className="font-bold text-xs">H3</span>}
          title="Heading 3"
        />
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={<ListIcon className="w-4 h-4" />}
          title="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={<OrderedListIcon className="w-4 h-4" />}
          title="Ordered List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={<QuoteIcon className="w-4 h-4" />}
          title="Blockquote"
        />
        <ToolbarButton
          onClick={onOpenLink}
          isActive={editor.isActive('link')}
          icon={<LinkIcon className="w-4 h-4" />}
          title="Link"
        />
      </div>
    </div>
  );
};

const ToolbarButton = ({ onClick, isActive, icon, title }: { onClick: () => void, isActive?: boolean, icon: React.ReactNode, title: string }) => (
  <button
    onClick={onClick}
    className={`p-1.5 rounded transition-colors ${
      isActive 
        ? 'bg-pakGreen-100 text-pakGreen-700' 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
    title={title}
  >
    {icon}
  </button>
);

const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject | ''>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
      }),
      TextStyle,
      FontFamily,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: initialNote?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-base sm:prose-lg focus:outline-none max-w-none min-h-[50vh] px-4 sm:px-8 py-5 sm:py-6',
      },
    },
  });

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setSubject(initialNote.subject || '');
      // If content updates from outside (rare in this flow but good practice)
      if (editor && initialNote.content !== editor.getHTML()) {
        // Only set content if it's different to avoid cursor jumps
         // editor.commands.setContent(initialNote.content || '');
      }
    }
  }, [initialNote, editor]);

  // Auto-resize title textarea
  const adjustTitleHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    const content = editor?.getHTML() || '';

    const newNote: Note = {
      id: initialNote?.id || Date.now().toString(),
      title,
      content, // Saving HTML content
      subject: (subject as Subject) || undefined,
      createdAt: initialNote?.createdAt || Date.now(),
      updatedAt: Date.now(),
      linkedArticleId: initialNote?.linkedArticleId
    };

    await saveNote(newNote);
    onSave();
  };

  const handleDelete = () => {
    if (!initialNote?.id) return;
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!initialNote?.id) return;
    setIsDeleting(true);
    try {
      await deleteNote(initialNote.id);
      setConfirmOpen(false);
      onSave();
    } finally {
      setIsDeleting(false);
    }
  };

  const applyLink = () => {
    if (!editor) return;
    const next = linkUrl.trim();
    if (!next) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setLinkModalOpen(false);
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: next }).run();
    setLinkModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50 animate-fade-in">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <div>
             <h1 className="text-lg font-bold text-gray-900 leading-none">
                {initialNote?.id ? 'Edit Note' : 'New Note'}
             </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
           {initialNote?.id && (
             <button 
              onClick={handleDelete}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Note"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
           )}

          <button 
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-pakGreen-600 text-white hover:bg-pakGreen-700 rounded-lg shadow-md shadow-pakGreen-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 ml-2"
          >
            <SaveIcon className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Save</span>
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 flex flex-col overflow-hidden w-full bg-white md:max-w-5xl md:mx-auto md:my-8 md:rounded-xl md:border md:border-gray-200 md:shadow-xl">
        
        {/* Metadata Area */}
        <div className="px-4 sm:px-8 pt-5 sm:pt-8 pb-4">
           <select 
              value={subject} 
              onChange={(e) => setSubject(e.target.value as Subject)}
              className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-md px-3 py-2 sm:py-1.5 text-xs font-semibold text-gray-600 focus:border-pakGreen-500 focus:ring-1 focus:ring-pakGreen-500 outline-none uppercase tracking-wider mb-4 cursor-pointer hover:bg-gray-100 transition-colors"
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
              className="w-full text-2xl sm:text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 px-0 font-serif leading-tight bg-transparent resize-none overflow-hidden"
              style={{ minHeight: '3.5rem' }}
            />
        </div>

        {/* TipTap MenuBar */}
        <MenuBar
          editor={editor}
          onOpenLink={() => {
            const previousUrl = editor?.getAttributes('link').href || '';
            setLinkUrl(previousUrl);
            setLinkModalOpen(true);
          }}
        />

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto bg-white cursor-text" onClick={() => editor?.chain().focus().run()}>
           <EditorContent editor={editor} />
        </div>
        
        {/* Status Bar */}
        <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 text-xs text-gray-500 flex justify-between">
           <span>{editor?.state.doc.textContent.length || 0} characters</span>
           <span>{(editor?.state.doc.textContent.trim().match(/\S+/g) || []).length} words</span>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        title="Delete note?"
        description="This action cannot be undone."
        onClose={() => setConfirmOpen(false)}
        primaryAction={{
          label: isDeleting ? 'Deleting...' : 'Delete',
          onClick: confirmDelete,
          variant: 'danger',
          disabled: isDeleting,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setConfirmOpen(false),
          disabled: isDeleting,
        }}
      />

      <Modal
        open={linkModalOpen}
        title="Add link"
        onClose={() => setLinkModalOpen(false)}
        primaryAction={{ label: 'Apply', onClick: applyLink }}
        secondaryAction={{ label: 'Cancel', onClick: () => setLinkModalOpen(false) }}
      >
        <div className="mt-3">
          <label className="block text-xs font-semibold text-gray-600 mb-2">URL</label>
          <input
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyLink();
              if (e.key === 'Escape') setLinkModalOpen(false);
            }}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-pakGreen-500 focus:ring-2 focus:ring-pakGreen-200 outline-none"
            placeholder="https://example.com"
          />
          <p className="text-[11px] text-gray-500 mt-2">Leave empty to remove the current link.</p>
        </div>
      </Modal>
    </div>
  );
};

export default NoteEditor;
