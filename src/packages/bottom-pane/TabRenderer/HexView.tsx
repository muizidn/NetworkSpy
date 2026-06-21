import React, { useMemo, useRef } from 'react';
import { useVirtualizer } from "@tanstack/react-virtual";

const BYTES_PER_ROW = 16;
const ROW_HEIGHT = 20;

interface HexRow {
  address: string;
  bytes: string[];
  ascii: string;
}

export const HexView = ({ data }: { data: Uint8Array }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const rows: HexRow[] = useMemo(() => {
    if (!data || data.length === 0) return [];
    const result: HexRow[] = [];
    for (let i = 0; i < data.length; i += BYTES_PER_ROW) {
      const chunk = data.slice(i, Math.min(i + BYTES_PER_ROW, data.length));
      const bytes: string[] = [];
      const asciiChars: string[] = [];
      for (let j = 0; j < BYTES_PER_ROW; j++) {
        if (j < chunk.length) {
          const b = chunk[j];
          bytes.push(b.toString(16).padStart(2, "0").toUpperCase());
          asciiChars.push(b >= 32 && b <= 126 ? String.fromCharCode(b) : ".");
        } else {
          bytes.push("");
          asciiChars.push("");
        }
      }
      result.push({
        address: i.toString(16).padStart(8, "0").toUpperCase(),
        bytes,
        ascii: asciiChars.join(""),
      });
    }
    return result;
  }, [data]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  if (!data) return null;

  return (
    <div className="font-mono text-[11px] leading-relaxed select-text h-full">
      <div className="sticky top-0 z-10 bg-[#0a0a0a] flex border-b border-white/5 pb-2 mb-0 text-zinc-600 font-bold uppercase tracking-widest text-[9px]">
        <div className="w-20 flex-shrink-0">Address</div>
        <div className="flex-grow grid gap-1 px-4" style={{ gridTemplateColumns: `repeat(${BYTES_PER_ROW}, minmax(0, 1fr))` }}>
          {Array.from({ length: BYTES_PER_ROW }).map((_, i) => (
            <div key={i} className="text-center">{i.toString(16).toUpperCase()}</div>
          ))}
        </div>
        <div className="w-32 flex-shrink-0 pl-4 border-l border-white/5">ASCII</div>
      </div>

      <div ref={scrollRef} className="overflow-auto" style={{ height: "calc(100% - 24px)" }}>
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                className="flex group hover:bg-white/[0.02] absolute w-full"
                style={{ height: ROW_HEIGHT, transform: `translateY(${virtualRow.start}px)` }}
              >
                <div className="w-20 flex-shrink-0 text-zinc-500 font-bold">{row.address}</div>
                <div
                  className="flex-grow grid gap-1 px-4 text-zinc-300"
                  style={{ gridTemplateColumns: `repeat(${BYTES_PER_ROW}, minmax(0, 1fr))` }}
                >
                  {row.bytes.map((b, i) => (
                    <div key={i} className="text-center hover:text-blue-400 cursor-default">
                      {b || "\u00A0"}
                    </div>
                  ))}
                </div>
                <div className="w-32 flex-shrink-0 pl-4 border-l border-white/5 text-zinc-500 italic truncate">
                  {row.ascii}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
