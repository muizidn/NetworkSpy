import { BreakpointHit } from "@src/packages/app-env/AppProvider";
import React from "react";
import { FiPause, FiPlay, FiActivity, FiRotateCw } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

interface SidebarProps {
    pausedBreakpoints: BreakpointHit[];
    selectedHitId: string | null;
    setSelectedHitId: (id: string) => void;
    handleResumeAll: () => void;
    handleRefresh: () => void;
    isRefreshing: boolean;
}

export const BreakpointSidebar: React.FC<SidebarProps> = ({
    pausedBreakpoints,
    selectedHitId,
    setSelectedHitId,
    handleResumeAll,
    handleRefresh,
    isRefreshing
}) => {
    return (
        <div className="w-80 flex flex-col border-r border-[var(--border-primary)] bg-[var(--bg-app)] shadow-2xl relative z-10">
            <div className="p-6 border-b border-[var(--border-primary)] bg-[var(--bg-surface)]/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                        <FiPause size={16} />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest">Paused Traffic</h2>
                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase mt-0.5">{pausedBreakpoints.length} Hits waiting</p>
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <button
                        onClick={handleResumeAll}
                        disabled={pausedBreakpoints.length === 0}
                        className={twMerge(
                            "flex-1 py-2 rounded-lg bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-inset)] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-[var(--border-primary)] flex items-center justify-center gap-2",
                            pausedBreakpoints.length === 0 ? "opacity-50 cursor-not-allowed border-[var(--border-primary)]" : ""
                        )}
                    >
                        <FiPlay size={10} fill="currentColor" />
                        Resume All
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="px-3 py-2 rounded-lg bg-[var(--bg-surface-inset)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] transition-all active:scale-95 flex items-center justify-center overflow-hidden"
                        title="Force Refresh"
                        disabled={isRefreshing}
                    >
                        <FiRotateCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {pausedBreakpoints.map((hit) => {
                    const isSelected = selectedHitId === hit.id;
                    const isRequest = hit.id.endsWith("_req");
                    return (
                        <button
                            key={hit.id}
                            onClick={() => setSelectedHitId(hit.id)}
                            className={twMerge(
                                "w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1.5 group relative overflow-hidden",
                                isSelected
                                    ? "bg-blue-600/10 border border-blue-500/30 text-blue-400"
                                    : "hover:bg-[var(--bg-surface-elevated)]/50 text-[var(--text-secondary)] border border-transparent"
                            )}
                        >
                            <div className="flex items-center justify-between pointer-events-none">
                                <span className={twMerge(
                                    "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                                    isRequest ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                )}>
                                    {isRequest ? "REQ" : "RES"}
                                </span>
                                <span className="text-[9px] font-mono opacity-40">#{hit.id.split('_').pop()?.substring(0, 6)}</span>
                            </div>
                            <div className="text-[11px] font-bold truncate pr-2 group-hover:text-[var(--text-primary)] transition-colors">
                                {hit.name || "Untitled Breakpoint"}
                            </div>
                            {isSelected && <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                        </button>
                    );
                })}

                {pausedBreakpoints.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-[var(--text-muted)] px-6 text-center opacity-40">
                        <FiActivity size={32} className="mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Traffic Caught</p>
                    </div>
                )}
            </div>

            <div className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border-primary)] text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest flex items-center justify-between">
                <span>v1.2.0</span>
                <span className="flex items-center gap-1.5 text-emerald-500/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sync
                </span>
            </div>
        </div>
    );
};
