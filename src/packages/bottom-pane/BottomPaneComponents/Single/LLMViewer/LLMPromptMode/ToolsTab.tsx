import React from "react";
import { twMerge } from "tailwind-merge";
import { FiBox, FiTerminal } from "react-icons/fi";
import { Tool } from "./types";
import { CopyButton } from "../shared/CopyButton";

interface ToolsTabProps {
  tools: Tool[];
  selectedTool: Tool | null;
  setSelectedTool: (tool: Tool | null) => void;
  toolUsageMap: Record<string, number>;
}

export const ToolsTab: React.FC<ToolsTabProps> = ({
  tools,
  selectedTool,
  setSelectedTool,
  toolUsageMap
}) => {
  return (
    <div className="flex-grow flex overflow-hidden">
      {/* Tool List Sidebar */}
      <div className="w-64 border-r border-[var(--border-primary)] overflow-y-auto custom-scrollbar shrink-0 bg-[var(--bg-surface-inset)]/20">
        {tools.map((tool, idx) => {
          const usageCount = toolUsageMap[tool.function.name] || 0;
          const isUsed = usageCount > 0;
          
          return (
            <button
              key={idx}
              onClick={() => setSelectedTool(tool)}
              className={twMerge(
                "w-full px-4 py-3 text-left border-b border-[var(--border-primary)]/50 transition-all group",
                selectedTool?.function.name === tool.function.name ? "bg-purple-600/10 border-r-2 border-r-purple-500" : "hover:bg-[var(--bg-surface-elevated)]/50"
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className={twMerge(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    selectedTool?.function.name === tool.function.name ? "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]" 
                      : isUsed ? "bg-emerald-500/80" : "bg-[var(--bg-surface-elevated)]"
                  )} />
                  <span className={twMerge(
                    "text-[11px] font-bold truncate",
                    selectedTool?.function.name === tool.function.name ? "text-purple-300" 
                      : isUsed ? "text-[var(--text-secondary)]" : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]"
                  )}>
                    {tool.function.name}
                  </span>
                </div>
                {isUsed && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-900/30 text-purple-400 font-black border border-purple-900/50 shrink-0">
                    {usageCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tool Detail Pane */}
      <div className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-[var(--bg-surface-inset)]/40">
        {selectedTool ? (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight uppercase italic">{selectedTool.function.name}</h2>
                <span className="text-[10px] text-[var(--text-muted)] font-mono tracking-widest uppercase">TYPE: {selectedTool.type}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-xl shadow-purple-900/20">
                <FiBox size={20} />
              </div>
            </div>

            {selectedTool.function.description && (
              <div className="mb-8 group relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Description</div>
                  <CopyButton text={selectedTool.function.description!} />
                </div>
                <div className="bg-[var(--bg-surface)]/50 rounded-2xl p-5 text-sm text-[var(--text-secondary)] leading-relaxed italic">
                  {selectedTool.function.description}
                </div>
              </div>
            )}

            <div className="group relative">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Parameter Schema</div>
                <CopyButton text={JSON.stringify(selectedTool.function.parameters, null, 2)} />
              </div>
              <div className="bg-[var(--bg-surface-inset)] rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center px-4 py-2 bg-[var(--bg-surface)]/50">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/20" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/20" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
                  </div>
                  <span className="text-[9px] text-[var(--text-muted)] font-mono ml-4 uppercase tracking-widest">JSON SCHEMA</span>
                </div>
                <pre className="p-6 font-mono text-xs text-purple-300 leading-relaxed overflow-x-auto custom-scrollbar">
                  {JSON.stringify(selectedTool.function.parameters, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50">
            <FiBox size={48} className="mb-4" />
            <p className="text-sm">Select a tool to view its full definition</p>
          </div>
        )}
      </div>
    </div>
  );
};
