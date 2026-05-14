import React from "react";
import { FiX, FiSearch, FiAlertCircle, FiCheck } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { useVirtualizer } from "@tanstack/react-virtual";

interface SourceDialogProps {
    isOpen: boolean;
    onClose: () => void;
    testSource: 'live' | 'session';
    setTestSource: (source: 'live' | 'session') => void;
    selectedSessionId: string;
    setSelectedSessionId: (id: string) => void;
    selectedTrafficId: string;
    setSelectedTrafficId: (id: string) => void;
    filter: string;
    setFilter: (filter: string) => void;
    filteredTraffic: any[];
    sessions: any[];
    isSessionLoading?: boolean;
}

export const SourceDialog: React.FC<SourceDialogProps> = ({
    isOpen, onClose, testSource, setTestSource,
    selectedSessionId, setSelectedSessionId,
    selectedTrafficId, setSelectedTrafficId,
    filter, setFilter,
    filteredTraffic, sessions,
    isSessionLoading
}) => {
    const parentRef = React.useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: filteredTraffic.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 52, // Reduced height for more compact rows
        overscan: 10,
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black text-white tracking-tight">Set Preview Context</h2>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Select traffic data for viewer testing</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300">
                        <FiX size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col p-5 space-y-4">
                    <div className="flex flex-col gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest pl-1">Source Type</label>
                            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 w-fit">
                                <button
                                    onClick={() => { setTestSource('live'); setSelectedTrafficId(""); }}
                                    className={twMerge(
                                        "px-6 py-1.5 rounded-md text-[11px] font-bold transition-all",
                                        testSource === 'live' ? "bg-zinc-800 text-white shadow-xl shadow-black/50" : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    Live Stream
                                </button>
                                <button
                                    onClick={() => { setTestSource('session'); setSelectedTrafficId(""); }}
                                    className={twMerge(
                                        "px-6 py-1.5 rounded-md text-[11px] font-bold transition-all",
                                        testSource === 'session' ? "bg-zinc-800 text-white shadow-xl shadow-black/50" : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    Saved Session
                                </button>
                            </div>
                        </div>

                        {testSource === 'session' && (
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest pl-1">Select Session</label>
                                <div className="border border-zinc-900 rounded-lg bg-black/40 max-h-[160px] overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-zinc-900 z-10">
                                            <tr>
                                                <th className="px-3 py-1.5 text-[9px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800">Name</th>
                                                <th className="px-3 py-1.5 text-[9px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-900">
                                            {sessions.length === 0 ? (
                                                <tr>
                                                    <td colSpan={2} className="px-3 py-6 text-center text-[11px] text-zinc-700 italic">No saved sessions found</td>
                                                </tr>
                                            ) : (
                                                sessions.map(s => (
                                                    <tr 
                                                        key={s.id}
                                                        onClick={() => { setSelectedSessionId(s.id); setSelectedTrafficId(""); }}
                                                        className={twMerge(
                                                            "cursor-pointer transition-colors group",
                                                            selectedSessionId === s.id ? "bg-blue-600/10" : "hover:bg-zinc-900/50"
                                                        )}
                                                    >
                                                        <td className="px-3 py-2">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className={twMerge(
                                                                    "w-1.5 h-1.5 rounded-full",
                                                                    selectedSessionId === s.id ? "bg-blue-500 animate-pulse" : "bg-zinc-700"
                                                                )} />
                                                                <span className={twMerge(
                                                                    "text-[11px] font-bold transition-colors",
                                                                    selectedSessionId === s.id ? "text-blue-400" : "text-zinc-400 group-hover:text-zinc-200"
                                                                )}>
                                                                    {s.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            {selectedSessionId === s.id && (
                                                                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Active</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col space-y-3">
                        <div className="relative">
                            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                            <input
                                placeholder="Filter traffic by method, URI, or ID..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>

                        <div 
                            ref={parentRef}
                            className="flex-1 overflow-y-auto custom-scrollbar border border-zinc-900 rounded-lg bg-black/40 relative"
                        >
                            {isSessionLoading ? (
                                <div className="h-full flex flex-col items-center justify-center p-8 text-zinc-500">
                                    <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3" />
                                    <p className="text-xs font-medium">Loading session data...</p>
                                </div>
                            ) : filteredTraffic.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-8 text-zinc-700">
                                    <FiAlertCircle size={24} className="mb-2 opacity-20" />
                                    <p className="text-xs font-medium">No results</p>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        height: `${rowVirtualizer.getTotalSize()}px`,
                                        width: '100%',
                                        position: 'relative',
                                    }}
                                >
                                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                        const t = filteredTraffic[virtualRow.index];
                                        return (
                                            <button
                                                key={t.id}
                                                onClick={() => { setSelectedTrafficId(t.id); onClose(); }}
                                                className={twMerge(
                                                    "absolute top-0 left-0 w-full flex items-center justify-between text-left hover:bg-zinc-900/50 transition-all border-b border-zinc-900/50",
                                                    selectedTrafficId === t.id ? "bg-blue-600/5" : ""
                                                )}
                                                style={{
                                                    height: `${virtualRow.size}px`,
                                                    transform: `translateY(${virtualRow.start}px)`,
                                                    paddingLeft: '1rem',
                                                    paddingRight: '1rem'
                                                }}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className={twMerge(
                                                        "w-10 h-5 flex items-center justify-center rounded-[3px] text-[9px] font-black uppercase shrink-0",
                                                        t.method === 'GET' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                                                            t.method === 'POST' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                                                "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                                                    )}>
                                                        {t.method}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <div className="text-[11px] font-medium text-zinc-300 truncate font-mono tracking-tight">{t.uri || t.url}</div>
                                                        <div className="text-[9px] text-zinc-600 truncate uppercase tracking-widest font-black opacity-60">ID: {t.id}</div>
                                                    </div>
                                                </div>
                                                {selectedTrafficId === t.id && (
                                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                        <FiCheck size={12} className="text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
