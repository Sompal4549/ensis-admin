import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link as LinkIcon } from 'lucide-react';

interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  justifyLeft: boolean;
  justifyCenter: boolean;
  justifyRight: boolean;
  insertUnorderedList: boolean;
  insertOrderedList: boolean;
  formatBlock: string;
  link: boolean;
  color: string;
}

interface RichTextEditorProps {
  value: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  isCodeEditor?: boolean;
  showColorPicker?: boolean;
  fontSize?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  minHeight = "300px",
  isCodeEditor = false,
  showColorPicker = true,
  fontSize,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>({
    bold: false,
    italic: false,
    underline: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    formatBlock: 'p',
    link: false,
    color: '#333333',
  });

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const updateActiveFormats = useCallback(() => {
    if (!isCodeEditor && editorRef.current) {
      const formatBlockValue = document.queryCommandValue("formatBlock");

      const selection = window.getSelection();
      let isLink = false;
      if (selection && selection.rangeCount > 0) {
        let container: Node | null = selection.getRangeAt(0).startContainer;
        if (container.nodeType === Node.TEXT_NODE) container = container.parentNode;

        let temp = container as HTMLElement | null;
        while (temp && temp !== editorRef.current) {
          if (temp.tagName === 'A') {
            isLink = true;
            break;
          }
          temp = temp.parentNode as HTMLElement | null;
        }
      }

      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        formatBlock: formatBlockValue || 'p',
        link: isLink,
        color: document.queryCommandValue("foreColor"),
      });
    }
  }, [isCodeEditor]);

  const execCommand = (command: string, val: string | null = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, val ?? undefined);
      handleInput();
      updateActiveFormats();
    }
  };

  const handleInput = () => {
    if (onChange) {
      onChange(editorRef.current?.innerHTML || "");
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isCodeEditor) {
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    } else {
      const html = e.clipboardData.getData('text/html');
      const text = e.clipboardData.getData('text/plain');
      if (html) {
        document.execCommand('insertHTML', false, html);
      } else {
        document.execCommand('insertText', false, text);
      }
    }
  };

  const insertLink = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const selection = window.getSelection();
    let currentLink: HTMLElement | null = null;

    if (selection && selection.rangeCount > 0) {
      let container: Node | null = selection.getRangeAt(0).startContainer;
      if (container.nodeType === Node.TEXT_NODE) container = container.parentNode;

      let temp = container as HTMLElement | null;
      while (temp && temp !== editorRef.current) {
        if (temp.tagName === 'A') {
          currentLink = temp;
          break;
        }
        temp = temp.parentNode as HTMLElement | null;
      }
    }

    if (currentLink) {
      execCommand("unlink");
    } else {
      const url = prompt("Enter URL:");
      if (url) {
        execCommand("createLink", url);
      }
    }
  };

  const handleAction = (e: React.MouseEvent<HTMLButtonElement>, command: string, val: string | null = null) => {
    e.preventDefault();
    execCommand(command, val);
  };

  const getActiveStyle = (isActive: boolean) =>
    isActive
      ? "bg-blue-100 border-blue-400 text-blue-700 active:bg-blue-200"
      : "bg-white border-gray-300 active:bg-gray-100";

  return (
    <div className="border-2 border-gray-200 rounded overflow-hidden shadow-inner bg-white">
      {!isCodeEditor && (
        <div className="bg-gray-50 p-2 border-b-2 border-gray-200 flex flex-wrap gap-1 items-center">
          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "bold")}
            className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded font-bold border-2 text-sm shadow-sm transition-colors ${getActiveStyle(activeFormats.bold)}`}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "italic")}
            className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded italic border-2 text-sm shadow-sm transition-colors ${getActiveStyle(activeFormats.italic)}`}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "underline")}
            className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded underline border-2 text-sm shadow-sm transition-colors ${getActiveStyle(activeFormats.underline)}`}
            title="Underline"
          >
            U
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "justifyLeft")}
            className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-lg shadow-sm transition-colors ${getActiveStyle(activeFormats.justifyLeft)}`}
            title="Align Left"
          >
            ≡
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "justifyCenter")}
            className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-lg shadow-sm transition-colors ${getActiveStyle(activeFormats.justifyCenter)}`}
            title="Align Center"
          >
            ≡
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "justifyRight")}
            className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-lg shadow-sm transition-colors ${getActiveStyle(activeFormats.justifyRight)}`}
            title="Align Right"
          >
            ≡
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "insertUnorderedList")}
            className={`px-3 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-[11px] font-bold shadow-sm gap-1 transition-colors ${getActiveStyle(activeFormats.insertUnorderedList)}`}
            title="Bullet List"
          >
            <span className="text-lg">●</span> List
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleAction(e, "insertOrderedList")}
            className={`px-3 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-[11px] font-bold shadow-sm gap-1 transition-colors ${getActiveStyle(activeFormats.insertOrderedList)}`}
            title="Numbered List"
          >
            1. List
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <select
            onChange={(e) => execCommand("formatBlock", e.target.value)}
            value={activeFormats.formatBlock}
            className={`h-9 border-2 text-[11px] font-bold px-2 rounded shadow-sm focus:outline-none min-w-[100px] transition-colors ${activeFormats.formatBlock !== 'p' ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'}`}
          >
            <option value="p">Body Text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>

          <button
            type="button"
            onMouseDown={insertLink}
            className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-sm shadow-sm transition-colors ${getActiveStyle(activeFormats.link)} text-blue-600`}
            title="Insert/Remove Link"
          >
            <LinkIcon size={16} />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {showColorPicker && (
            <div className="relative group/color flex items-center gap-1 border-2 border-gray-300 rounded px-1 h-9 bg-white shadow-sm hover:border-blue-400 transition-colors">
              <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Color</label>
              <input
                type="color"
                value={activeFormats.color || "#333333"}
                onChange={(e) => execCommand("foreColor", e.target.value)}
                className="w-8 h-6 p-0 border-0 bg-transparent cursor-pointer"
                title="Text Color"
              />
            </div>
          )}
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onMouseUp={updateActiveFormats}
        onKeyUp={updateActiveFormats}
        onFocus={updateActiveFormats}
        className={`p-6 focus:outline-none max-w-none text-gray-700 bg-white overflow-y-auto leading-relaxed ${isCodeEditor ? 'font-mono text-sm' : 'prose'}`}
        style={{ minHeight, fontSize: fontSize ? `${fontSize}px` : undefined }}
        data-placeholder={placeholder}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          [contenteditable] {
            outline: none;
            color: #333333 !important;
            text-align: justify !important;
            line-height: 1.6 !important;
          }
          [contenteditable] p, [contenteditable] li, [contenteditable] span { color: #333333 !important; }
          [contenteditable] a { color: #2563eb !important; text-decoration: underline !important; cursor: pointer; font-weight: 600 !important; }
          [contenteditable]:empty:before { content: attr(data-placeholder); color: #9ca3af; font-style: italic; pointer-events: none; font-size: 16px !important; }
          [contenteditable] ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 1rem 0 !important; }
          [contenteditable] ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 1rem 0 !important; }
          [contenteditable] b, [contenteditable] strong { font-weight: 800 !important; color: #000000 !important; }
          [contenteditable] i, [contenteditable] em { font-style: italic !important; color: #333333 !important; }
          [contenteditable] h1, [contenteditable] h2, [contenteditable] h3, [contenteditable] h4, [contenteditable] h5, [contenteditable] h6 { color: #000000 !important; font-weight: 800 !important; margin-top: 1rem !important; margin-bottom: 0.5rem !important; }
          [contenteditable] h2 { font-size: 1.5rem !important; }
          [contenteditable] h3 { font-size: 1.25rem !important; }
        `
      }} />
    </div>
  );
};

export default RichTextEditor;