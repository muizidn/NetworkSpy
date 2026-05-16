import { useTrafficListContext } from "../../../main-content/context/TrafficList";
import { useMemo } from "react";

export const CompareMode = () => {
  const { selections } = useTrafficListContext();
  const selectedItems = selections.others || [];

  if (selectedItems.length < 2) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] bg-[var(--bg-app)]">
        <div className="text-4xl opacity-10 mb-4 font-bold">COMPARE</div>
        <div className="text-sm">Select at least 2 requests to compare</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--bg-app)] overflow-auto p-4">
      <div className="inline-block min-w-full">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--bg-surface)]">
              <th className="border border-[var(--border-primary)] p-2 text-left text-[var(--text-muted)] sticky left-0 z-10 bg-[var(--bg-surface)]">Property</th>
              {selectedItems.map((item) => (
                <th key={String(item.id)} className="border border-[var(--border-primary)] p-2 text-left min-w-[250px]">
                  <div className="flex items-center gap-2">
                    <span className="bg-[var(--bg-surface-elevated)] px-1.5 rounded text-[var(--text-secondary)]">#{item.id}</span>
                    <span className="font-mono text-[var(--text-secondary)]">{String(item.method)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <CompareRow label="URL" property="url" items={selectedItems} />
            <CompareRow label="Status" property="status" items={selectedItems} highlight />
            <CompareRow label="Content Type" property="content_type" items={selectedItems} />
            <CompareRow label="Duration" property="duration" items={selectedItems} />
            <CompareRow label="Time" property="time" items={selectedItems} />
            <CompareRow label="Size" property="size" items={selectedItems} />
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CompareRow = ({ label, property, items, highlight = false }: { label: string; property: string; items: any[]; highlight?: boolean }) => {
  const values = items.map(item => String(item[property] || "N/A"));
  const allSame = values.every(v => v === values[0]);

  return (
    <tr className={`${highlight ? 'bg-[var(--bg-surface)]/30' : ''} hover:bg-[var(--bg-surface-elevated)]/50 transition-colors`}>
      <td className="border border-[var(--border-primary)] p-2 font-semibold text-[var(--text-secondary)] sticky left-0 z-10 bg-[var(--bg-app)] whitespace-nowrap">{label}</td>
      {values.map((val, i) => (
        <td key={i} className={`border border-[var(--border-primary)] p-2 font-mono ${!allSame && i > 0 ? 'text-orange-400' : 'text-[var(--text-secondary)]'}`}>
          <div className="max-h-20 overflow-auto break-all">
            {val}
          </div>
        </td>
      ))}
    </tr>
  );
};
