import { useTrafficListContext } from "../../../main-content/context/TrafficList";
import { useMemo } from "react";
import { TrafficItemMap } from "../../../main-content/model/TrafficItemMap";

export const WaterfallMode = () => {
    const { selections } = useTrafficListContext();
    const selectedItems = selections.others || [];

    if (selectedItems.length === 0) {
        return <div className="h-full flex items-center justify-center text-[var(--text-muted)] bg-[var(--bg-app)]">Select multiple requests to view network waterfall</div>;
    }

    const itemsWithTiming = useMemo(() => {
        // Sort by ID/Time to simulate chronological order
        const sorted = [...selectedItems].sort((a, b) => Number(a.id) - Number(b.id));

        // Cumulative offset simulation
        let currentOffset = 0;
        return sorted.map((item, i) => {
            const duration = parseInt(String(item.duration).replace('ms', '')) || 50;
            const start = currentOffset;
            currentOffset += duration * 0.2; // Slight overlap simulation
            return {
                ...item,
                startOffset: start,
                width: duration
            } as TrafficItemMap & { startOffset: number; width: number };
        });
    }, [selectedItems]);

    const maxTime = useMemo(() => {
        if (itemsWithTiming.length === 0) return 0;
        const lastItem = itemsWithTiming[itemsWithTiming.length - 1];
        return lastItem.startOffset + lastItem.width;
    }, [itemsWithTiming]);

    return (
        <div className="h-full bg-[var(--bg-app)] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[var(--border-primary)] bg-[var(--bg-surface)]/50 flex flex-col @sm:flex-row justify-between items-start @sm:items-center gap-2">
                <h2 className="text-xs @sm:text-sm font-bold text-[var(--text-secondary)] tracking-widest">Network Waterfall</h2>
                <div className="text-[9px] @sm:text-[10px] text-[var(--text-muted)] font-mono">Total Time: {maxTime.toFixed(0)} ms</div>
            </div>

            <div className="flex-grow overflow-auto p-2 @sm:p-4">
                <div className="space-y-1 @sm:space-y-2 min-w-[300px] @sm:min-w-[600px]">
                    {itemsWithTiming.map((item, i) => {
                        const startPercent = (item.startOffset / maxTime) * 100;
                        const widthPercent = (item.width / maxTime) * 100;

                        return (
                            <div key={i} className="flex items-center group">
                                <div className="w-24 @sm:w-48 shrink-0 flex flex-col pr-2 @sm:pr-4">
                                    <span className="text-[8px] @sm:text-[10px] font-mono text-[var(--text-secondary)] truncate">{String(item.method)} {String(item.url).split('/').pop()}</span>
                                    <span className="text-[7px] @sm:text-[9px] text-[var(--text-muted)] truncate">{String(item.url)}</span>
                                </div>
                                <div className="flex-grow bg-[var(--bg-surface)]/30 h-5 @sm:h-6 rounded flex items-center relative overflow-hidden group-hover:bg-[var(--bg-surface-elevated)]/50 transition-colors">
                                    <div className="absolute inset-0 flex justify-between opacity-10 pointer-events-none">
                                        {[...Array(5)].map((_, j) => <div key={j} className="h-full w-px bg-[var(--text-muted)]"></div>)}
                                    </div>
                                    <div
                                        className={`h-3 rounded-sm shadow-sm transition-all relative group-hover:brightness-110 ${getStatusColor(String(item.code))}`}
                                        style={{
                                            left: `${startPercent}%`,
                                            width: `${Math.max(widthPercent, 1)}%`
                                        }}
                                        title={`${item.width}ms starting at ${item.startOffset.toFixed(0)}ms`}
                                    >
                                        <div className="absolute -top-4 left-0 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] whitespace-nowrap">
                                            {item.width}ms
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const getStatusColor = (code: string) => {
    if (code.startsWith("2")) return "bg-green-500";
    if (code.startsWith("3")) return "bg-blue-500";
    if (code.startsWith("4")) return "bg-orange-500";
    if (code.startsWith("5")) return "bg-red-500";
    return "bg-zinc-700";
};
