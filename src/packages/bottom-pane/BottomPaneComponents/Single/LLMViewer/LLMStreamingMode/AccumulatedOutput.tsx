import React from "react";
import { twMerge } from "tailwind-merge";
import { FiDatabase, FiZap } from "react-icons/fi";

import { SSEChunk } from "./types";
import { ToolCall } from "@src/packages/bottom-pane/utils/bodyUtils";

interface AccumulatedOutputProps {
  chunks: SSEChunk[];
  accumulatedText: string;
  toolCalls: (ToolCall | null)[];
  isStreaming: boolean;
  hoveredChunkId: string | null;
  setHoveredChunkId: (id: string | null) => void;
}

export const AccumulatedOutput: React.FC<AccumulatedOutputProps> = ({
  chunks,
  accumulatedText,
  toolCalls,
  isStreaming,
  hoveredChunkId,
  setHoveredChunkId
}) => {
  return (
    <div className="w-1/2 flex flex-col bg-[#111314]">
      <div className="px-4 py-2 bg-zinc-900/40 border-b border-zinc-800 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiDatabase size={12} className="text-zinc-500" />
          <span className="text-[10px] font-bold text-zinc-400 tracking-widest">Accumulated Output</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-600">{accumulatedText.length} bytes</span>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
        <div className="max-w-prose mx-auto">
          <div className="text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap font-sans transition-all">
            {chunks.map(chunk => (
              <span
                id={`text-${chunk.id}`}
                key={chunk.id}
                onMouseEnter={() => {
                  setHoveredChunkId(chunk.id);
                  document.getElementById(`chunk-${chunk.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
                onMouseLeave={() => setHoveredChunkId(null)}
                className={twMerge(
                  "transition-all duration-150 rounded-sm px-0.5 -mx-0.5",
                  hoveredChunkId === chunk.id ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400" : "hover:bg-zinc-800"
                )}
              >
                {chunk.content}
              </span>
            ))}

            {toolCalls.length > 0 && (
              <div className="mt-8 space-y-4 border-t border-zinc-800 pt-6">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 tracking-widest">
                  <FiZap size={12} className="text-amber-500" /> Tool Calls
                </div>
                {toolCalls.map((tc, idx) => {
                  if (!tc) return null;
                  return (
                    <div key={idx} className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-3 font-mono">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-amber-500">{tc.function?.name || "unnamed"}()</span>
                        <span className="text-[9px] text-zinc-600">ID: {tc.id || idx}</span>
                      </div>
                      <pre className="text-[10px] text-zinc-400 overflow-x-auto bg-black/30 p-2 rounded">
                        {(() => {
                          try {
                            return JSON.stringify(JSON.parse(tc.function?.arguments || "{}"), null, 2);
                          } catch (e) {
                            return tc.function?.arguments || "{}";
                          }
                        })()}
                      </pre>
                    </div>
                  );
                })}
              </div>
            )}

            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse rounded-sm align-middle" />
            )}
          </div>
        </div>
        {!accumulatedText && !isStreaming && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600">
            <p className="text-xs tracking-widest font-bold">No output generated</p>
          </div>
        )}
      </div>

      {/* Prompt / Details Footer */}
      <div className="p-4 bg-black/20 border-t border-zinc-800">
        <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
          <div className="flex gap-4">
            <span>TOKENS: {accumulatedText.split(/\s+/).filter(x => x.length > 0).length}</span>
            <span>CHAR: {accumulatedText.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={twMerge(
              "w-2 h-2 rounded-full",
              isStreaming ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
            )} />
            <span>{isStreaming ? "LIVE STREAM" : "COMPLETED"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
