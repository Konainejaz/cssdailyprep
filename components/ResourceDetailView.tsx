import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  title: string;
  content: string;
  imageUrl?: string;
  category?: string;
  summary?: string;
  isLoading: boolean;
  onBack: () => void;
  onSaveNote: (title: string, content: string) => void;
}

const createSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const getNodeText = (node: any): string => {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (typeof node === 'object' && node.props && 'children' in node.props) return getNodeText(node.props.children);
  return '';
};

const normalizeComparable = (value: string) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const stripTopTitleAndCover = (raw: string, title: string, imageUrl?: string) => {
  const lines = String(raw || '').split('\n');
  const t = normalizeComparable(title);
  let start = 0;

  if (lines.length > 0) {
    const m = /^#\s+(.+?)\s*$/.exec(lines[0] ?? '');
    if (m && normalizeComparable(m[1]) === t) {
      start = 1;
      while (start < lines.length && lines[start].trim() === '') start += 1;
    }
  }

  if (imageUrl && start < lines.length) {
    const m = /^!\[[^\]]*\]\(([^)]+)\)\s*$/.exec(lines[start] ?? '');
    if (m && String(m[1] || '').trim() === String(imageUrl).trim()) {
      start += 1;
      while (start < lines.length && lines[start].trim() === '') start += 1;
    }
  }

  return lines.slice(start).join('\n').trimStart();
};

const ResourceDetailView: React.FC<Props> = ({ title, content, imageUrl, category, summary, isLoading, onBack, onSaveNote }) => {
  const [coverSrc, setCoverSrc] = useState<string | undefined>(imageUrl);

  const displayContent = useMemo(() => stripTopTitleAndCover(content, title, imageUrl), [content, title, imageUrl]);

  const showCover = Boolean(coverSrc);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-gray-50 animate-fade-in">
        <div className="flex-1 p-8 flex justify-center">
             <div className="max-w-3xl w-full space-y-4">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-32 w-full bg-gray-100 rounded animate-pulse mt-8"></div>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 animate-slide-up">
          {showCover && (
            <div className="w-full mb-6">
              <img
                src={coverSrc}
                alt={title}
                className="w-full max-h-[420px] object-cover rounded-xl border border-gray-100"
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.onerror = null;
                  setCoverSrc(`https://placehold.co/1200x600/png?text=${encodeURIComponent(title)}`);
                }}
              />
            </div>
          )}
          {summary && <div className="text-sm text-gray-600 font-serif mb-6">{summary}</div>}
          <div
            className="prose prose-pakGreen prose-lg max-w-none text-gray-700 font-serif leading-relaxed"
          >
            <ReactMarkdown
              components={{
                h1: ({ children, ...props }) => {
                  const text = getNodeText(children).trim();
                  const id = createSlug(text);
                  return (
                    <h1 id={id} className="scroll-mt-24" {...props}>
                      {children}
                    </h1>
                  );
                },
                h2: ({ children, ...props }) => {
                  const text = getNodeText(children).trim();
                  const id = createSlug(text);
                  return (
                    <h2 id={id} className="scroll-mt-24" {...props}>
                      {children}
                    </h2>
                  );
                },
                h3: ({ children, ...props }) => {
                  const text = getNodeText(children).trim();
                  const id = createSlug(text);
                  return (
                    <h3 id={id} className="scroll-mt-24" {...props}>
                      {children}
                    </h3>
                  );
                },
              }}
            >
              {displayContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailView;
