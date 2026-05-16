import { useTrafficListContext } from "../../../main-content/context/TrafficList";
import { useMemo } from "react";

export const EndpointSummaryMode = () => {
    const { selections } = useTrafficListContext();
    const selectedItems = selections.others || [];

    const summaries = useMemo(() => {
        const groups: Record<string, { count: number, avgTime: number, totalTime: number }> = {};
        selectedItems.forEach(item => {
            try {
                const url = new URL(String(item.url));
                const key = `${item.method} ${url.pathname}`;
                const duration = parseInt(String(item.duration).replace('ms', '')) || 0;

                if (!groups[key]) {
                    groups[key] = { count: 0, avgTime: 0, totalTime: 0 };
                }
                groups[key].count++;
                groups[key].totalTime += duration;
                groups[key].avgTime = groups[key].totalTime / groups[key].count;
            } catch (e) { }
        });
        return groups;
    }, [selectedItems]);

    if (selectedItems.length === 0) {
        return <div className="h-full flex items-center justify-center text-[var(--text-muted)] bg-[var(--bg-app)]">Select requests to view endpoint summary</div>;
    }

    return (
        <div className="h-full bg-[var(--bg-app)] p-4 @sm:p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-xl font-bold mb-8 text-blue-400">Endpoint Usage Summary</h2>

                <table className="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr className="text-[var(--text-muted)] font-black tracking-widest text-[10px]">
                            <th className="pb-4">Endpoint</th>
                            <th className="pb-4 text-center">Calls</th>
                            <th className="pb-4 text-right">Avg Duration</th>
                        </tr>
                    </thead>
                    <tbody className="text-[var(--text-secondary)]">
                        {Object.entries(summaries).sort((a, b) => b[1].count - a[1].count).map(([key, data]) => (
                            <tr key={key} className="border-t border-[var(--border-primary)] hover:bg-[var(--bg-surface)]/50 transition-colors">
                                <td className="py-3 font-mono">{key}</td>
                                <td className="py-3 text-center">
                                    <span className="bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] px-2 py-1 rounded-full font-bold">{data.count}</span>
                                </td>
                                <td className="py-3 text-right font-bold text-[var(--text-secondary)]">{data.avgTime.toFixed(1)}ms</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
