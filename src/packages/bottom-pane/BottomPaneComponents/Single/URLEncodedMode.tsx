import React, { useMemo, useState, useEffect } from "react";
import { FiFilter, FiCopy, FiLayers, FiSearch, FiCode, FiGrid, FiHash } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { useTrafficListContext } from "@src/packages/main-content/context/TrafficList";
import { useAppProvider } from "@src/packages/app-env";
import { RequestPairData } from "../../RequestTab";

import { ViewerPlaceholder } from "../../ViewerPlaceholder";

const FormPlaceholder = ({ text, subtext }: { text: string; subtext?: string }) => (
  <ViewerPlaceholder
    title={text}
    subtext={subtext}
    type="Form"
    hint="URL-encoded data can sometimes be non-standard or heavily nested. Building a custom viewer allows you to parse it exactly how you need."
  />
);

export const URLEncodedMode = () => {
  const { selections } = useTrafficListContext();
  const { provider } = useAppProvider();
  const trafficId = useMemo(() => selections.firstSelected?.id as string, [selections]);

  const [data, setData] = useState<RequestPairData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!trafficId) return;
    setLoading(true);
    provider.getRequestPairData(trafficId)
      .then(res => setData(res))
      .finally(() => setLoading(false));
  }, [trafficId, provider]);

  const formParams = useMemo(() => {
    if (!data?.body) return [];
    try {
      const text = new TextDecoder().decode(data.body);
      const params: { key: string; value: string; id: string }[] = [];
      const searchParams = new URLSearchParams(text);

      searchParams.forEach((value, key) => {
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
  }, [data]);

  const filteredParams = useMemo(() => {
    if (!filter) return formParams;
    const lowFilter = filter.toLowerCase();
    return formParams.filter(p =>
      p.key.toLowerCase().includes(lowFilter) ||
      p.value.toLowerCase().includes(lowFilter)
    );
  }, [formParams, filter]);

  const stats = useMemo(() => ({
    count: formParams.length,
    filteredCount: filteredParams.length
  }), [formParams, filteredParams]);

  const [beautifiedFields, setBeautifiedFields] = useState<Set<string>>(new Set());

  const toggleBeautify = (id: string) => {
    setBeautifiedFields(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isJson = (str: string) => {
    if (!str || !str.startsWith('{') && !str.startsWith('[')) return false;
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!trafficId) return <FormPlaceholder text="No Request Selected" subtext="Select a request from the list to view and analyze form data." />;
  if (loading) return <FormPlaceholder text="Decoding Form..." subtext="Analyzing request body and extracting URL-encoded parameters..." />;
  if (formParams.length === 0) return (
    <FormPlaceholder
      text="No Form Data"
      subtext="No URL-encoded form data was found in this request body. If this is a custom encoding, you can build a viewer for it."
    />
  );

    return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] text-[var(--text-secondary)] font-sans overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 @sm:px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-sidebar)] shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-amber-600/10 rounded-xl border border-amber-500/20 shadow-lg shadow-amber-500/5">
            <FiLayers className="text-amber-500" size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wider">Form Data Inspector</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-1">
                <FiGrid size={10} />
                {stats.count} fields detected
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-amber-500 transition-colors" size={12} />
            <input
              type="text"
              placeholder="Filter fields..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[var(--bg-surface-inset)]/40 border border-[var(--border-primary)] rounded-lg pl-9 pr-4 py-1.5 text-[11px] w-48 focus:w-64 focus:border-amber-500/50 outline-none transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 @sm:p-6">
        <div className="max-w-5xl mx-auto space-y-4">

          {/* Info Ribbon */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--bg-surface)] to-[var(--bg-app)] border border-[var(--border-primary)] flex items-start gap-4 shadow-xl border-l-4 border-l-amber-600">
            <div className="mt-1 p-1 bg-amber-500/10 rounded text-amber-400">
              <FiHash size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-[var(--text-muted)] tracking-widest block mb-1">Content Type</span>
              <p className="text-xs font-mono text-[var(--text-tertiary)] break-all leading-relaxed font-bold">
                application/x-www-form-urlencoded
              </p>
            </div>
          </div>

          {/* Parameters Table/Grid */}
          <div className="rounded-xl border border-[var(--border-primary)] bg-black/20 overflow-hidden shadow-2xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--bg-surface)]/50 text-[10px] font-black text-[var(--text-muted)] tracking-widest border-b border-[var(--border-primary)]">
                  <th className="px-6 py-3 text-left w-[30%] font-black">Field</th>
                  <th className="px-6 py-3 text-left font-black">Value</th>
                  <th className="px-6 py-3 text-right w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {filteredParams.map((param) => {
                  const isBeautified = beautifiedFields.has(param.id);
                  const canBeBeautified = isJson(param.value);

                  return (
                    <tr key={param.id} className="group hover:bg-[var(--bg-surface-elevated)]/30 transition-colors">
                      <td className="px-4 @sm:px-6 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[11px] font-bold border border-amber-500/20">
                            {param.key}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 @sm:px-6 py-4 align-top">
                        <div className="space-y-2">
                          <div className="relative">
                            {isBeautified ? (
                              <div className="bg-[var(--bg-surface-inset)]/50 rounded-lg p-3 border border-[var(--border-primary)]/50 font-mono text-[11px] text-[var(--text-secondary)] overflow-x-auto">
                                <pre className="whitespace-pre">
                                  {JSON.stringify(JSON.parse(param.value), null, 2)}
                                </pre>
                              </div>
                            ) : (
                              <p className="text-[11px] font-mono text-[var(--text-secondary)] break-all leading-relaxed pr-8">
                                {param.value}
                              </p>
                            )}
                            <div className="mt-2 flex gap-3">
                              <button
                                onClick={() => copyToClipboard(param.value)}
                                className="text-[9px] font-bold text-[var(--text-muted)] hover:text-amber-400 flex items-center gap-1 transition-colors"
                              >
                                <FiCopy size={10} /> COPY VALUE
                              </button>
                              {canBeBeautified && (
                                <button
                                  onClick={() => toggleBeautify(param.id)}
                                  className={twMerge(
                                    "text-[9px] font-bold flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded",
                                    isBeautified ? "bg-amber-600 text-white" : "text-[var(--text-muted)] hover:text-amber-400 bg-[var(--bg-surface-elevated)]"
                                  )}
                                >
                                  <FiCode size={10} /> {isBeautified ? "ORIGINAL" : "BEAUTIFY"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 @sm:px-6 py-4 text-right align-top">
                        <button
                          onClick={() => copyToClipboard(`${param.key}=${param.value}`)}
                          className="p-1.5 bg-[var(--bg-surface-elevated)] rounded border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-amber-400 hover:border-amber-500/30 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                        >
                          <FiCopy size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredParams.length === 0 && (
              <div className="py-20 text-center space-y-2">
                <FiFilter size={40} className="mx-auto text-[var(--text-muted)] mb-4" />
                <p className="text-[var(--text-muted)] font-bold text-xs tracking-widest">No matching fields</p>
                <p className="text-[var(--text-muted)] text-[11px] italic">Try a different search term or clear the filter</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="px-6 py-3 border-t border-[var(--border-primary)] bg-[var(--bg-sidebar)] flex gap-4 @sm:p-6 shrink-0">
        <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-bold tracking-widest">
          <span className="w-2 h-2 rounded-full bg-amber-500/40" />
          POST/PUT Form Decoder
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-bold tracking-widest border-l border-[var(--border-primary)] pl-6">
          Showing {stats.filteredCount} of {stats.count} fields
        </div>
      </div>
    </div>
  );
};


export default URLEncodedMode;
