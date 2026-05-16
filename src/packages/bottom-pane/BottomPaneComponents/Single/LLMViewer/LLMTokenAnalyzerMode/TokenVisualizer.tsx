import React from "react";
import { twMerge } from "tailwind-merge";
import { FiCopy, FiZap, FiDatabase } from "react-icons/fi";
import { ToolCall } from "@src/packages/bottom-pane/utils/bodyUtils";

const TOKEN_COLORS = [
  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "bg-rose-500/20 text-rose-300 border-rose-500/30",
  "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
];

interface TokenVisualizerProps {
  viewMode: string;
  tokens: number[];
  decodedTokens: string[];
  activeToolCalls: ToolCall[];
}

export const TokenVisualizer: React.FC<TokenVisualizerProps> = ({
  viewMode,
  tokens,
  decodedTokens,
  activeToolCalls
}) => {
  return (
    <div className="w-2/3 flex flex-col border-r border-[var(--border-primary)] bg-[var(--bg-surface-inset)]/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-primary)] bg-[var(--bg-surface)]/40 shrink-0">
        <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)]">
          Visual Breakdown - {viewMode.toUpperCase()}
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(tokens.join(", "))}
          className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <FiCopy size={12} /> Copy IDs
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent">
        {activeToolCalls.length > 0 && (
          <div className="mb-8 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-amber-500 tracking-widest flex items-center gap-2">
                <FiZap size={12} /> Structured Tool Calls Detected
              </h3>
              <span className="text-[9px] text-[var(--text-muted)] italic">Excluded from text token count</span>
            </div>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-2">
              {activeToolCalls.map((tc, idx) => (
                <div key={idx} className="p-2 bg-[var(--bg-surface-inset)]/40 rounded border border-[var(--border-primary)] font-mono text-[10px]">
                  <div className="text-amber-400 font-bold truncate">{tc.function?.name}()</div>
                  <div className="text-[var(--text-muted)] text-[8px] truncate mt-1">ID: {tc.id}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tokens.length > 0 ? (
          <div className="flex flex-wrap gap-y-2 leading-relaxed">
            {decodedTokens.map((token, i) => (
              <span
                key={i}
                className={twMerge(
                  "px-1 py-0.5 rounded-sm border ring-1 ring-inset ring-transparent hover:ring-white/20 transition-all cursor-default text-sm",
                  TOKEN_COLORS[i % TOKEN_COLORS.length]
                )}
                title={`Token ID: ${tokens[i]}`}
              >
                {token === " " ? " \u00B7 " : token === "\n" ? " \u21B5 " : token}
              </span>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] italic text-sm gap-2">
            <FiDatabase size={32} className="opacity-20" />
            <span>No textual content to visualize for this {viewMode}</span>
          </div>
        )}
      </div>
    </div>
  );
};
