import React from "react";
import { twMerge } from "tailwind-merge";
import { FiTerminal } from "react-icons/fi";

import { SSEChunk } from "./types";

interface ChunkListProps {
  chunks: SSEChunk[];
  isBeautified: boolean;
  setIsBeautified: (val: boolean) => void;
  hoveredChunkId: string | null;
  setHoveredChunkId: (id: string | null) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const ChunkList: React.FC<ChunkListProps> = ({
  chunks,
  isBeautified,
  setIsBeautified,
  hoveredChunkId,
  setHoveredChunkId,
  scrollRef
}) => {
  return (
    <div className="w-1/2 border-r border-zinc-900 flex flex-col bg-black/10">
      <div className="px-4 py-2 bg-zinc-900/40 border-b border-zinc-800 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiTerminal size={12} className="text-zinc-500" />
          <span className="text-[10px] font-bold text-zinc-400 tracking-widest">Raw Chunks</span>
        </div>
        <button
          onClick={() => setIsBeautified(!isBeautified)}
          className={twMerge(
            "px-2 py-0.5 rounded text-[9px] font-black tracking-widest transition-all",
            isBeautified ? "bg-amber-600 text-white shadow-lg" : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
          )}
        >
          {isBeautified ? "Raw" : "Beautify"}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar scroll-smooth">
        {chunks.map((chunk, i) => (
          <div
            id={`chunk-${chunk.id}`}
            key={chunk.id}
            onMouseEnter={() => {
              setHoveredChunkId(chunk.id);
              document.getElementById(`text-${chunk.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }}
            onMouseLeave={() => setHoveredChunkId(null)}
            className={twMerge(
              "group p-3 rounded-lg border flex flex-col gap-1 transition-all animate-in slide-in-from-left-2 duration-200",
              chunk.event === 'control'
                ? "bg-amber-950/20 border-amber-900/30"
                : hoveredChunkId === chunk.id
                  ? "bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02]"
                  : "bg-[#1e1e1e] border-zinc-800/50 hover:border-zinc-700"
            )}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={twMerge(
                  "text-[9px] px-1.5 py-0.5 rounded font-bold",
                  chunk.event === 'control' ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/20 text-blue-400"
                )}>
                  {chunk.event}
                </span>
                <span className="text-[9px] font-mono text-zinc-600">+{chunk.elapsedMs}ms</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-600 opacity-0 group-hover:opacity-100 italic transition-opacity">
                {chunk.timestamp}
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-300 break-all bg-black/20 p-2 rounded border border-white/5 overflow-x-auto">
              {(() => {
                if (!isBeautified) return chunk.data;
                try {
                  const raw = chunk.data.replace(/^data:\s*/, '').trim();
                  if (raw === '[DONE]') return chunk.data;
                  return (
                    <pre className="whitespace-pre">
                      {JSON.stringify(JSON.parse(raw), null, 2)}
                    </pre>
                  );
                } catch (e) {
                  return chunk.data;
                }
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
