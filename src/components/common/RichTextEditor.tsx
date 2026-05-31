import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link as LinkIcon, Type } from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder, minHeight = "300px", isCodeEditor = false, showColorPicker = true, fontSize }) => {
    const editorRef = useRef(null);
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        justifyLeft: false,
        justifyCenter: false,
        justifyRight: false,
        insertUnorderedList: false,
        insertOrderedList: false,
        formatBlock: 'p',
        fontSize: '3',
        link: false,
        color: '#333333'
    });

    // Sync from parent to editor (initial load or external updates)
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || "";
        }
    }, [value]);

    const updateActiveFormats = useCallback(() => {
        if (!isCodeEditor && editorRef.current) {
            const selection = window.getSelection();
            const formatBlockValue = document.queryCommandValue("formatBlock");
            
            // Get computed font size of selection
            let computedFontSize = "16";
            let isLink = false;
            
            if (selection.rangeCount > 0) {
                let container = selection.getRangeAt(0).startContainer;
                if (container.nodeType === 3) container = container.parentNode;
                
                // Traverse up to find a span with font-size if any
                let current = container;
                while (current && current !== editorRef.current) {
                    if (current.tagName === 'SPAN' && current.style.fontSize) {
                        computedFontSize = current.style.fontSize.replace('px', '');
                        break;
                    }
                    if (current.tagName === 'A') {
                        isLink = true;
                    }
                    current = current.parentNode;
                }
                
                // Fallback to computed style if no span found
                if (computedFontSize === "16") {
                    const style = window.getComputedStyle(container);
                    computedFontSize = Math.round(parseFloat(style.fontSize)).toString();
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
                fontSize: computedFontSize,
                link: isLink,
                color: document.queryCommandValue("foreColor")
            });
        }
    }, [isCodeEditor]);

    const execCommand = (command, val = null) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, val);
            handleInput();
            updateActiveFormats();
        }
    };

    const handleInput = () => {
        if (onChange) {
            onChange(editorRef.current?.innerHTML || "");
        }
    };

    const handlePaste = (e) => {
        if (isCodeEditor) {
            // For code editor, paste as plain text
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        } else {
            // Standard paste behavior
            e.preventDefault();
            const html = e.clipboardData.getData('text/html');
            const text = e.clipboardData.getData('text/plain');
            if (html) {
                document.execCommand('insertHTML', false, html);
            } else {
                document.execCommand('insertText', false, text);
            }
        }
    };

    const insertLink = (e) => {
        e.preventDefault();
        
        // Check if already in a link
        const selection = window.getSelection();
        let currentLink = null;
        
        if (selection.rangeCount > 0) {
            let container = selection.getRangeAt(0).startContainer;
            if (container.nodeType === 3) container = container.parentNode;
            
            while (container && container !== editorRef.current) {
                if (container.tagName === 'A') {
                    currentLink = container;
                    break;
                }
                container = container.parentNode;
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

    // Helper to handle toolbar actions without losing focus
    const handleAction = (e, command, val = null) => {
        e.preventDefault(); // CRITICAL: Prevents focus loss
        execCommand(command, val);
    };

    useEffect(() => {
        // Force browser to use <span> with styles instead of <font> tags for standard commands
        document.execCommand('styleWithCSS', false, true);
    }, []);

    // Custom Font Size Applier
    const applyPixelFontSize = (size) => {
        if (!size) return;
        
        const selection = window.getSelection();
        if (!selection.rangeCount || selection.isCollapsed) {
            setActiveFormats(prev => ({ ...prev, fontSize: size }));
            return;
        }

        // We use a dummy command to let the browser handle the selection/wrapping logic
        // then we immediately convert the browser's tags to our custom pixel spans
        const dummyColor = "#000001";
        document.execCommand('foreColor', false, dummyColor);
        
        // Find all spans with our dummy color
        const coloredSpans = editorRef.current.querySelectorAll(`span[style*="color: rgb(0, 0, 1)"], span[style*="color: #000001"]`);
        
        coloredSpans.forEach(span => {
            // Apply the font size
            span.style.fontSize = `${size}px`;
            // Remove the dummy color (restoring original or letting it be inherited)
            span.style.color = "";
            if (span.getAttribute('style') === "") span.removeAttribute('style');
        });

        handleInput();
        setActiveFormats(prev => ({ ...prev, fontSize: size }));
        
        // Final cleanup of any empty styles
        const allSpans = editorRef.current.querySelectorAll('span');
        allSpans.forEach(s => {
            if (!s.getAttribute('style') && s.childNodes.length > 0) {
                // Keep the content but remove the useless span
                const parent = s.parentNode;
                while (s.firstChild) parent.insertBefore(s.firstChild, s);
                parent.removeChild(s);
            }
        });
    };

    // Styling for active state
    const getActiveStyle = (isActive) => isActive 
        ? "bg-blue-100 border-blue-400 text-blue-700 active:bg-blue-200" 
        : "bg-white border-gray-300 active:bg-gray-100";

    return (
        <div className="border-2 border-gray-200 rounded overflow-hidden shadow-inner bg-white font-inter">
            {/* Standardized Toolbar - Hidden in code mode or customized if needed */}
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

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

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

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

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

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

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

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    {/* Arbitrary Font Size Input with +/- */}
                    <div className="flex items-center gap-0.5 border-2 border-gray-300 rounded px-0.5 h-9 bg-white shadow-sm hover:border-blue-400 transition-colors">
                        <Type size={14} className="text-gray-400 mx-1" />
                        <button
                            type="button"
                            onClick={() => applyPixelFontSize(Math.max(1, parseInt(activeFormats.fontSize || 16) - 1))}
                            className="w-5 h-7 flex items-center justify-center bg-gray-50 hover:bg-gray-200 rounded text-xs font-bold transition-colors"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            value={activeFormats.fontSize}
                            onChange={(e) => applyPixelFontSize(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-10 h-full border-0 text-[11px] font-bold text-center focus:outline-none bg-transparent"
                            placeholder="px"
                        />
                        <button
                            type="button"
                            onClick={() => applyPixelFontSize(parseInt(activeFormats.fontSize || 16) + 1)}
                            className="w-5 h-7 flex items-center justify-center bg-gray-50 hover:bg-gray-200 rounded text-xs font-bold transition-colors"
                        >
                            +
                        </button>
                        <span className="text-[9px] font-bold text-gray-400 mx-1">PX</span>
                    </div>

                    <button
                        type="button"
                        onMouseDown={insertLink}
                        className={`w-9 h-9 flex items-center justify-center hover:bg-white rounded border-2 text-sm shadow-sm transition-colors ${getActiveStyle(activeFormats.link)} text-blue-600`}
                        title="Insert/Remove Link"
                    >
                        <LinkIcon size={16} />
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

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

            {/* Editable Content Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                onMouseUp={updateActiveFormats}
                onKeyUp={updateActiveFormats}
                onFocus={updateActiveFormats}
                className={`p-6 focus:outline-none max-w-none text-gray-700 bg-white overflow-y-auto leading-relaxed ${isCodeEditor ? 'font-mono text-sm' : 'prose'} ${fontSize ? 'has-custom-font-master' : ''}`}
                style={{
                    minHeight: minHeight,
                    fontSize: fontSize ? `${fontSize}px` : undefined,
                    '--master-font-size': fontSize ? `${fontSize}px` : 'inherit'
                }}
                placeholder={placeholder}
            ></div>

            {/* In-component styling for common elements */}
            <style dangerouslySetInnerHTML={{
                __html: `
                [contenteditable] {
                    outline: none;
                    text-align: justify !important;
                    line-height: 1.6 !important;
                }
                [contenteditable] p {
                    margin: 0.5rem 0 !important;
                }
                [contenteditable] a {
                    color: #2563eb !important;
                    text-decoration: underline !important;
                    cursor: pointer;
                    font-weight: 600 !important;
                }
                [contenteditable]:empty:before {
                    content: attr(placeholder);
                    color: #9ca3af;
                    font-style: italic;
                    pointer-events: none;
                    font-size: 16px !important;
                }
                [contenteditable] ul {
                    list-style-type: disc !important;
                    padding-left: 1.5rem !important;
                    margin: 1rem 0 !important;
                }
                [contenteditable] ol {
                    list-style-type: decimal !important;
                    padding-left: 1.5rem !important;
                    margin: 1rem 0 !important;
                }
                [contenteditable] b, [contenteditable] strong {
                    font-weight: 800 !important;
                }
                [contenteditable] i, [contenteditable] em {
                    font-style: italic !important;
                }
                [contenteditable] h1, [contenteditable] h2, [contenteditable] h3, [contenteditable] h4, [contenteditable] h5, [contenteditable] h6 {
                    font-weight: 800 !important;
                    margin-top: 1rem !important;
                    margin-bottom: 0.5rem !important;
                }
                [contenteditable] h1 {
                    font-size: 2rem !important;
                }
                [contenteditable] h2 {
                    font-size: 1.5rem !important;
                }
                [contenteditable] h3 {
                    font-size: 1.25rem !important;
                }
                [contenteditable] h4 {
                    font-size: 1.1rem !important;
                }
                [contenteditable] h5 {
                    font-size: 1rem !important;
                }
                [contenteditable] h6 {
                    font-size: 0.9rem !important;
                }
                /* No more master overrides, editor content is the absolute truth */
                [contenteditable].has-custom-font-master {
                    font-size: var(--master-font-size);
                }
                
                /* AGGRESSIVE SHADOW REMOVAL */
                [contenteditable], 
                [contenteditable] *,
                .prose,
                .prose * {
                    text-shadow: none !important;
                    filter: none !important;
                    -webkit-filter: none !important;
                    box-shadow: none !important;
                }
            ` }} />
        </div>
    );
};

export default RichTextEditor;