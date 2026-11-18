import React, { useState, useRef, useEffect } from 'react';
import {
  Code01,
  Link01,
  List,
  Type01,
  Eye,
  Edit01,
  Trash01,
  XClose,
  Check,
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
  const savedRangeRef = useRef<Range | null>(null);

  // Link Popover State
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

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

  const handleOpenLinkPopover = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      savedRangeRef.current = range.cloneRange();

      let node: Node | null = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
      const existingAnchor = (node as HTMLElement)?.closest?.('a');

      if (existingAnchor) {
        setLinkUrl(existingAnchor.getAttribute('href') || '');
        setLinkText(existingAnchor.textContent || '');
        setOpenInNewTab(existingAnchor.getAttribute('target') === '_blank');
        setIsEditingExisting(true);
      } else {
        setLinkUrl('');
        setLinkText(selection.toString());
        setOpenInNewTab(true);
        setIsEditingExisting(false);
      }
    } else {
      savedRangeRef.current = null;
      setLinkUrl('');
      setLinkText('');
      setOpenInNewTab(true);
      setIsEditingExisting(false);
    }

    setShowLinkPopover(true);
    setTimeout(() => {
      urlInputRef.current?.focus();
    }, 50);
  };

  const handleApplyLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!linkUrl.trim()) return;

    let formattedUrl = linkUrl.trim();
    if (!/^https?:\/\/|^\/|^mailto:|^tel:/i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (editorRef.current) {
      editorRef.current.focus();
    }

    const selection = window.getSelection();
    if (savedRangeRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }

    // If text was selected or collapsed
    if (savedRangeRef.current && savedRangeRef.current.collapsed && linkText.trim()) {
      const a = document.createElement('a');
      a.href = formattedUrl;
      a.textContent = linkText.trim();
      a.className = 'text-[#17645F] underline font-medium hover:text-[#155A56]';
      if (openInNewTab) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      savedRangeRef.current.insertNode(a);
      savedRangeRef.current.setStartAfter(a);
      savedRangeRef.current.setEndAfter(a);
      selection?.removeAllRanges();
      selection?.addRange(savedRangeRef.current);
    } else {
      document.execCommand('createLink', false, formattedUrl);
      if (selection && selection.anchorNode) {
        let parent: Node | null = selection.anchorNode;
        if (parent.nodeType === Node.TEXT_NODE) parent = parent.parentNode;
        const anchor = (parent as HTMLElement)?.closest?.('a');
        if (anchor) {
          anchor.className = 'text-[#17645F] underline font-medium hover:text-[#155A56]';
          if (openInNewTab) {
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
          } else {
            anchor.removeAttribute('target');
            anchor.removeAttribute('rel');
          }
        }
      }
    }

    handleInput();
    setShowLinkPopover(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleRemoveLink = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const selection = window.getSelection();
    if (savedRangeRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
    document.execCommand('unlink', false);
    handleInput();
    setShowLinkPopover(false);
    setLinkUrl('');
    setLinkText('');
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
            onClick={handleOpenLinkPopover}
            title="Insert or Edit Link"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              showLinkPopover ? 'bg-[#17645F] text-white' : 'hover:bg-[#E1E0DD] text-[#5D5E5F]'
            }`}
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

        {/* Untitled UI Inline Hyperlink Popover Card */}
        {showLinkPopover && (
          <div className="p-3.5 bg-white border-b border-[#E1E0DD] shadow-sm animate-in fade-in duration-150">
            <form onSubmit={handleApplyLink} className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#E1E0DD]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#E2ECEB] text-[#17645F] flex items-center justify-center">
                    <Link01 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-[#17191A]">
                    {isEditingExisting ? 'Edit Hyperlink' : 'Insert Hyperlink'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLinkPopover(false)}
                  className="p-1 rounded text-[#5D5E5F] hover:text-[#17191A] hover:bg-[#F0EFEC] transition-colors"
                  aria-label="Close link popover"
                >
                  <XClose className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#5D5E5F]">
                    Link Target URL *
                  </label>
                  <input
                    ref={urlInputRef}
                    type="text"
                    required
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com/guide"
                    className="w-full rounded-[6px] border border-[#E1E0DD] bg-white px-2.5 py-1.5 text-xs text-[#17191A] placeholder-[#969594] focus:outline-none focus:ring-1 focus:ring-[#17645F] focus:border-[#17645F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#5D5E5F]">
                    Display Text
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Link text..."
                    className="w-full rounded-[6px] border border-[#E1E0DD] bg-white px-2.5 py-1.5 text-xs text-[#17191A] placeholder-[#969594] focus:outline-none focus:ring-1 focus:ring-[#17645F] focus:border-[#17645F]"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[#5D5E5F] select-none">
                  <input
                    type="checkbox"
                    checked={openInNewTab}
                    onChange={(e) => setOpenInNewTab(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#17645F] rounded border-[#E1E0DD]"
                  />
                  <span>Open in new window (target=&quot;_blank&quot;)</span>
                </label>

                <div className="flex items-center justify-end gap-2">
                  {isEditingExisting && (
                    <button
                      type="button"
                      onClick={handleRemoveLink}
                      className="px-2.5 py-1 text-xs font-semibold text-[#D92D20] hover:bg-[#FDF2F2] rounded-[6px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash01 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowLinkPopover(false)}
                    className="px-2.5 py-1 text-xs font-medium text-[#5D5E5F] hover:bg-[#F0EFEC] rounded-[6px] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-semibold text-white bg-[#17645F] hover:bg-[#155A56] rounded-[6px] transition-colors shadow-xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Apply Link</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

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
