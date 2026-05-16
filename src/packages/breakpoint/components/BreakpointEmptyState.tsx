import React from "react";
import { FiActivity, FiPause, FiCheckCircle } from "react-icons/fi";

interface EmptyStateProps {
    isLoadingData: boolean;
}

export const BreakpointEmptyState: React.FC<EmptyStateProps> = ({ isLoadingData }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-[radial-gradient(circle_at_center,_var(--bg-surface-inset)_0%,_var(--bg-app)_100%)]">
            {isLoadingData ? (
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-4 border-[var(--border-primary)] border-t-blue-500 rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.2)]" />
                    <div className="space-y-1">
                        <p className="text-[var(--text-secondary)] font-black uppercase text-xs tracking-widest">Fetching Intercepted Data</p>
                        <p className="text-[var(--text-muted)] text-[10px] font-bold">Synchronizing with secure container...</p>
                    </div>
                </div>
            ) : (
                <div className="max-w-md animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 rounded-[2rem] bg-[var(--bg-surface-inset)]/50 border border-[var(--border-primary)] text-[var(--text-muted)] mb-8 mx-auto shadow-2xl relative">
                        <FiActivity size={48} />
                        <div className="absolute -inset-4 bg-blue-500/5 blur-3xl rounded-full" />
                    </div>
                    <h2 className="text-2xl font-black text-[var(--text-primary)] mb-4 tracking-tight uppercase">Ready to Review</h2>
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-10 font-medium">
                        Traffic matching your breakpoint rules has been safely intercepted. Select an item from the <span className="text-[var(--text-secondary)]">sidebar</span> to review, edit, and resume its execution.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="p-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)]/20 backdrop-blur-sm">
                            <div className="text-amber-500 mb-2"><FiPause size={16} /></div>
                            <div className="text-[10px] font-black text-[var(--text-primary)] uppercase mb-1">State: Paused</div>
                            <p className="text-[9px] text-[var(--text-muted)] leading-tight">Engine is currently waiting for your permission to proceed.</p>
                        </div>
                        <div className="p-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)]/20 backdrop-blur-sm">
                            <div className="text-emerald-500 mb-2"><FiCheckCircle size={16} /></div>
                            <div className="text-[10px] font-black text-[var(--text-primary)] uppercase mb-1">Live Editing</div>
                            <p className="text-[9px] text-[var(--text-muted)] leading-tight">Modify headers or body content in real-time before resumption.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
