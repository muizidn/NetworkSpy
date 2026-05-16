import React, { useCallback } from "react";
import { FiFileText, FiZap } from "react-icons/fi";
import { MonacoEditor } from "@src/packages/ui/MonacoEditor";

interface BodyEditorProps {
    editedBody: string;
    setEditedBody: (body: string) => void;
}

export const BreakpointBodyEditor: React.FC<BodyEditorProps> = ({ editedBody, setEditedBody }) => {
    const handleBeautify = useCallback(() => {
        if (!editedBody) return;
        try {
            const obj = JSON.parse(editedBody);
            const beautified = JSON.stringify(obj, null, 2);
            setEditedBody(beautified);
        } catch (e) {
            console.error("Failed to beautify JSON:", e);
        }
    }, [editedBody, setEditedBody]);

    return (
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-surface-inset)] shadow-2xl group transition-all focus-within:border-blue-500/50 min-h-0">
            <div className="px-4 py-2 bg-[var(--bg-surface)]/50 border-b border-[var(--border-primary)] flex items-center justify-between">
                <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                    <FiFileText size={12} />
                    Code Content Editor
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBeautify}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-wider transition-all border border-blue-500/20"
                        title="Beautify JSON"
                    >
                        <FiZap size={10} />
                        Beautify
                    </button>
                    <div className="text-[9px] text-[var(--text-muted)] font-mono italic">
                        UTF-8 Encoded
                    </div>
                </div>
            </div>
            
            <div className="flex-1 min-h-0">
                <MonacoEditor
                    height="100%"
                    defaultLanguage="json"
                    theme="vs-dark"
                    value={editedBody}
                    onChange={(value) => setEditedBody(value || "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 },
                        renderLineHighlight: "all",
                        lineNumbers: "on",
                        glyphMargin: false,
                        folding: true,
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 3,
                        scrollbar: {
                            vertical: "visible",
                            horizontal: "visible",
                            useShadows: false,
                            verticalScrollbarSize: 10,
                            horizontalScrollbarSize: 10
                        }
                    }}
                />
            </div>
        </div>
    );
};
