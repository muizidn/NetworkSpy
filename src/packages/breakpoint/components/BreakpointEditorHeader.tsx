import React from "react";
import { FiGlobe, FiCheckCircle } from "react-icons/fi";
import { BreakpointData } from "@src/packages/app-env/AppProvider";

interface EditorHeaderProps {
    selectedHitId: string;
    selectedData: BreakpointData;
    resumingIds: Set<string>;
    handleResume: (withModifications: boolean) => void;
}

export const BreakpointEditorHeader: React.FC<EditorHeaderProps> = ({
    selectedHitId,
    selectedData,
    resumingIds,
    handleResume
}) => {
    return (
        <div className="h-20 bg-[var(--bg-surface)] border-b border-[var(--border-primary)] px-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">Review Interception</h1>
                        <div className="text-[9px] text-[var(--text-muted)] font-mono bg-[var(--bg-surface-inset)] border border-[var(--border-primary)] px-1.5 py-0.5 rounded">
                            {selectedHitId}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1 opacity-70">
                        <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] font-bold uppercase">
                            <FiGlobe size={12} className="text-[var(--text-muted)]" />
                            <span className="truncate max-w-[300px]">{selectedData.uri || "N/A"}</span>
                        </div>
                        {selectedData.status_code && (
                            <div className="text-[10px] text-emerald-400 font-black px-1.5 bg-emerald-500/10 rounded">
                                {selectedData.status_code}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => handleResume(false)}
                    disabled={resumingIds.has(selectedHitId)}
                    className="px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] bg-[var(--bg-surface-inset)]/50 flex items-center gap-2"
                >
                    Cancel & Resume
                </button>
                <button
                    onClick={() => handleResume(true)}
                    disabled={resumingIds.has(selectedHitId)}
                    className="px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 flex items-center gap-2 border border-emerald-500/30"
                >
                    {resumingIds.has(selectedHitId) ? (
                        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <FiCheckCircle size={14} />
                    )}
                    Resume with Changes
                </button>
            </div>
        </div>
    );
};
