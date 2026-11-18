import React, { useState, useRef, useEffect } from 'react';
import {
  Code01,
  Link01,
  List,
  Type01,
  Eye,
  Edit01,
} from '@untitledui/icons';

interface WysiwygEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  label = 'Article Body',
  value,
  onChange,
  placeholder = 'Write your clinical insight or patient guidance here...',
  minHeight = '280px',
}) => {
  const [viewMode, setViewMode] = useState<'wysiwyg' | 'markdown'>('wysiwyg');
  const editorRef = useRef<HTMLDivElement>(null);

  // Synchronize internal contentEditable with incoming value when switching or mounting
  useEffect(() => {
    if (editorRef.current && viewMode === 'wysiwyg') {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [viewMode]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter link URL (e.g. https://...):');
    if (url) {
      exec('createLink', url);
    }
  };

  return (
    <div className="space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        {label && <label className="block text-xs font-semibold text-[#17191A]">{label}</label>}

        {/* View mode toggle */}
        <div className="flex items-center rounded-[6px] border border-[#E1E0DD] bg-[#FAF9F6] p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('wysiwyg')}
            className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
              viewMode === 'wysiwyg'
                ? 'bg-white text-[#17645F] font-semibold shadow-xs'
                : 'text-[#5D5E5F] hover:text-[#17191A]'
            }`}
          >
            Visual WYSIWYG
          </button>
          <button
            type="button"
            onClick={() => setViewMode('markdown')}
            className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
              viewMode === 'markdown'
                ? 'bg-white text-[#17645F] font-semibold shadow-xs'
                : 'text-[#5D5E5F] hover:text-[#17191A]'
            }`}
          >
            Source View
          </button>
        </div>
      </div>

      <div className="rounded-[10px] border border-[#E1E0DD] bg-white shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-[#17645F] focus-within:border-[#17645F]">
        {/* WYSIWYG Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-[#FAF9F6] border-b border-[#E1E0DD]">
          <select
            onChange={(e) => {
              if (e.target.value) {
                exec('formatBlock', e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="rounded border border-[#E1E0DD] bg-white px-2 py-1 text-xs text-[#17191A] focus:outline-none cursor-pointer"
          >
            <option value="" disabled>
              Heading Style
            </option>
            <option value="<p>">Paragraph</option>
            <option value="<h1>">Heading 1</option>
            <option value="<h2>">Heading 2</option>
            <option value="<h3>">Heading 3</option>
            <option value="<blockquote>">Quote</option>
          </select>

          <div className="h-4 w-[1px] bg-[#E1E0DD] mx-1" />

          <button
            type="button"
            onClick={() => exec('bold')}
            title="Bold (Ctrl+B)"
            className="p-1.5 rounded hover:bg-[#E1E0DD] text-[#2E3031] font-bold text-xs cursor-pointer min-w-[28px]"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            title="Italic (Ctrl+I)"
            className="p-1.5 rounded hover:bg-[#E1E0DD] text-[#2E3031] italic text-xs cursor-pointer min-w-[28px]"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            title="Underline (Ctrl+U)"
            className="p-1.5 rounded hover:bg-[#E1E0DD] text-[#2E3031] underline text-xs cursor-pointer min-w-[28px]"
          >
            U
          </button>

          <div className="h-4 w-[1px] bg-[#E1E0DD] mx-1" />

          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            title="Bulleted List"
            className="p-1.5 rounded hover:bg-[#E1E0DD] text-[#5D5E5F] cursor-pointer"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            title="Numbered List"
            className="p-1.5 rounded hover:bg-[#E1E0DD] text-[#5D5E5F] text-xs font-mono cursor-pointer"
          >
            1.
          </button>

          <div className="h-4 w-[1px] bg-[#E1E0DD] mx-1" />

          <button
            type="button"
            onClick={handleInsertLink}
            title="Insert Link"
            className="p-1.5 rounded hover:bg-[#E1E0DD] text-[#5D5E5F] cursor-pointer"
          >
            <Link01 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertHorizontalRule')}
            title="Horizontal Divider"
            className="p-1.5 rounded hover:bg-[#E1E0DD] text-[#5D5E5F] text-xs font-mono cursor-pointer"
          >
            ―
          </button>
        </div>

        {/* Editor Body */}
        {viewMode === 'wysiwyg' ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className="p-4 text-sm text-[#17191A] focus:outline-none prose max-w-none prose-sm leading-relaxed"
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ minHeight }}
            className="w-full p-4 font-mono text-xs text-[#17191A] bg-[#FAF9F6] focus:outline-none resize-y"
            placeholder="Raw content / Markdown..."
          />
        )}
      </div>
    </div>
  );
};
