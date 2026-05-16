import { useTrafficListContext } from "../../../main-content/context/TrafficList";
import { useMemo } from "react";

export const TimelineMode = () => {
  const { selections } = useTrafficListContext();
  const selectedItems = selections.others || [];

  const timelineItems = useMemo(() => {
    return [...selectedItems].sort((a, b) => {
        // Assume ID or time for sorting if time is just a string
        return String(a.time).localeCompare(String(b.time));
    });
  }, [selectedItems]);

  if (timelineItems.length === 0) {
    return <div className="h-full flex items-center justify-center text-[var(--text-muted)]">Select multiple items to view timeline</div>;
  }

  return (
    <div className="h-full bg-[var(--bg-app)] p-4 @sm:p-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-lg font-bold mb-8 text-[var(--text-secondary)] border-l-4 border-red-500 pl-3">Request Timeline</h2>
        
        <div className="relative border-l border-[var(--border-primary)] ml-4 space-y-8 pb-8">
          {timelineItems.map((item, i) => (
            <div key={String(item.id)} className="relative pl-8">
              {/* Dot */}
              <div className="absolute -left-[5px] top-1 w-[9px] h-[9px] rounded-full bg-red-500 border-2 border-[var(--bg-app)]"></div>
              
              <div className="bg-[var(--bg-surface)] rounded-lg p-4 border border-[var(--border-primary)] shadow-sm hover:border-[var(--border-secondary)] transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface-elevated)] px-1.5 rounded">#{item.id}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getMethodColor(String(item.method))}`}>
                      {String(item.method)}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getStatusColor(String(item.code))}`}>
                      {String(item.code)}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">{String(item.time)}</span>
                </div>
                
                <div className="text-xs text-[var(--text-secondary)] truncate mb-2" title={String(item.url || "")}>{String(item.url || "")}</div>
                
                <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
                    <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {String(item.duration)}
                    </div>
                    <div>{String(item.content_type || "no content type")}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case "GET": return "bg-blue-900/40 text-blue-300";
    case "POST": return "bg-green-900/40 text-green-300";
    case "PUT": return "bg-yellow-900/40 text-yellow-300";
    case "DELETE": return "bg-red-900/40 text-red-300";
    default: return "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]";
  }
};

const getStatusColor = (code: string) => {
  if (code.startsWith("2")) return "bg-green-900/40 text-green-400";
  if (code.startsWith("4")) return "bg-red-900/40 text-red-400";
  if (code.startsWith("5")) return "bg-purple-900/40 text-purple-400";
  return "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]";
};
