import { useTrafficListContext } from "@src/packages/main-content/context/TrafficList";
import { useMemo, useState } from "react";
import { FiCode, FiCopy, FiExternalLink, FiFilter, FiGrid, FiSearch } from "react-icons/fi";

import { ViewerPlaceholder } from "../../ViewerPlaceholder";

const QueryPlaceholder = ({ text, subtext }: { text: string; subtext?: string }) => (
  <ViewerPlaceholder
    title={text}
    subtext={subtext}
    type="Form"
    hint="You can create a custom viewer to automate complex URL parameter parsing or to highlight specific tracking IDs."
  />
);

export const QueryParamsMode = () => {
  const { selections } = useTrafficListContext();
  const selected = selections.firstSelected;
  const [filter, setFilter] = useState("");

  const urlParams = useMemo(() => {
    if (!selected?.url) return [];
    try {
      const url = new URL(String(selected.url));
      const params: { key: string; value: string; id: string }[] = [];
      url.searchParams.forEach((value, key) => {
        params.push({
          key,
          value,
          id: `${key}-${value}-${Math.random().toString(36).substr(2, 9)}`
        });
      });
      return params;
    } catch (e) {
      return [];
    }
  }, [selected]);

  const filteredParams = useMemo(() => {
    if (!filter) return urlParams;
    const lowFilter = filter.toLowerCase();
    return urlParams.filter(p =>
      p.key.toLowerCase().includes(lowFilter) ||
      p.value.toLowerCase().includes(lowFilter)
    );
  }, [urlParams, filter]);

  const stats = useMemo(() => ({
    count: urlParams.length,
    filteredCount: filteredParams.length
  }), [urlParams, filteredParams]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!selected) return <QueryPlaceholder text="No Request Selected" subtext="Select a request from the traffic list to analyze its query parameters." />;
  if (urlParams.length === 0) return (
    <QueryPlaceholder
      text="No Parameters Found"
      subtext="This URL does not contain any query parameters. If it uses a custom parameter format, you can build a viewer for it."
    />
  );

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] text-[var(--text-secondary)] font-sans overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 @sm:px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-sidebar)] shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-orange-600/10 rounded-xl border border-orange-500/20 shadow-lg shadow-orange-500/5">
            <FiFilter className="text-orange-500" size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wider">Query Inspector</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-1">
                <FiGrid size={10} />
                {stats.count} parameters detected
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-500 transition-colors" size={12} />
            <input
              type="text"
              placeholder="Filter parameters..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[var(--bg-surface-inset)]/40 border border-[var(--border-primary)] rounded-lg pl-9 pr-4 py-1.5 text-[11px] w-48 focus:w-64 focus:border-orange-500/50 outline-none transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>
          <button
            onClick={() => copyToClipboard(String(selected.url || ""))}
            className="p-2 hover:bg-[var(--bg-surface-elevated)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all active:scale-95"
            title="Copy Full URL"
          >
            <FiCopy size={16} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 @sm:p-6">
        <div className="max-w-5xl mx-auto space-y-4">

          {/* URL Ribbon */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--bg-surface)] to-[var(--bg-app)] border border-[var(--border-primary)] flex items-start gap-3 shadow-xl">
            <div className="mt-1 p-1 bg-blue-500/10 rounded text-blue-400">
              <FiExternalLink size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-[var(--text-muted)] tracking-widest block mb-1">Source Endpoint</span>
              <p className="text-xs font-mono text-[var(--text-tertiary)] break-all leading-relaxed">
                {selected.url}
              </p>
            </div>
          </div>

          {/* Parameters Table/Grid */}
          <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)]/20 overflow-hidden shadow-2xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--bg-surface-inset)]/50 text-[10px] font-black text-[var(--text-muted)] tracking-widest border-b border-[var(--border-primary)]">
                  <th className="px-6 py-3 text-left w-[30%] font-black">Key</th>
                  <th className="px-6 py-3 text-left font-black">Value</th>
                  <th className="px-6 py-3 text-right w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {filteredParams.map((param) => (
                  <tr key={param.id} className="group hover:bg-[var(--bg-surface-elevated)]/30 transition-colors">
                    <td className="px-4 @sm:px-6 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 font-mono text-[11px] font-bold border border-orange-500/20">
                          {param.key}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 @sm:px-6 py-4 align-top">
                      <div className="space-y-2">
                        {/* Multi-value detection (comma separated as requested in example) */}
                        {param.value.includes(',') ? (
                          <div className="flex flex-wrap gap-1.5">
                            {param.value.split(',').map((val, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] font-mono text-[11px] border border-[var(--border-primary)] hover:border-zinc-500 transition-colors cursor-pointer" onClick={() => copyToClipboard(val)}>
                                {val}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="relative">
                            <p className="text-[11px] font-mono text-[var(--text-secondary)] break-all leading-relaxed pr-8">
                              {param.value}
                            </p>
                            {param.value.length > 50 && (
                              <div className="mt-2 flex gap-2">
                                <button
                                  onClick={() => copyToClipboard(param.value)}
                                  className="text-[9px] font-bold text-[var(--text-muted)] hover:text-orange-400 flex items-center gap-1 transition-colors"
                                >
                                  <FiCopy size={10} /> COPY RAW
                                </button>
                                <button
                                  className="text-[9px] font-bold text-[var(--text-muted)] hover:text-blue-400 flex items-center gap-1 transition-colors"
                                >
                                  <FiCode size={10} /> DECODE
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 @sm:px-6 py-4 text-right align-top">
                      <button
                        onClick={() => copyToClipboard(`${param.key}=${param.value}`)}
                        className="p-1.5 bg-[var(--bg-surface-elevated)] rounded border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-orange-400 hover:border-orange-500/30 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                      >
                        <FiCopy size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredParams.length === 0 && (
              <div className="py-20 text-center space-y-2">
                <FiFilter size={40} className="mx-auto text-zinc-800 mb-4" />
                <p className="text-zinc-600 font-bold text-xs tracking-widest">No matching parameters</p>
                <p className="text-zinc-700 text-[11px] italic">Try a different search term or clear the filter</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="px-6 py-3 border-t border-[var(--border-primary)] bg-[var(--bg-sidebar)] flex gap-4 @sm:p-6 shrink-0">
        <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-bold tracking-widest">
          <span className="w-2 h-2 rounded-full bg-orange-500/40" />
          Active Analyzer V1
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-bold tracking-widest border-l border-[var(--border-primary)] pl-6">
          Showing {stats.filteredCount} of {stats.count} parameters
        </div>
      </div>
    </div>
  );
};


export default QueryParamsMode;
