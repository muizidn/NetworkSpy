import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiZap, FiSettings, FiActivity } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { useTrafficListContext } from "@src/packages/main-content/context/TrafficList";
import { useAppProvider } from "@src/packages/app-env";
import { parseSSE, parseSSEChunks, ToolCall } from "../../utils/bodyUtils";

import { Placeholder } from "./LLMViewer/shared/Placeholder";
import { ChunkList } from "./LLMViewer/LLMStreamingMode/ChunkList";
import { AccumulatedOutput } from "./LLMViewer/LLMStreamingMode/AccumulatedOutput";

import { SSEChunk } from "./LLMViewer/LLMStreamingMode/types";

export const LLMStreamingMode = () => {
  const { provider } = useAppProvider();
  const { selections } = useTrafficListContext();
  const selected = selections.firstSelected;
  const [chunks, setChunks] = useState<SSEChunk[]>([]);
  const [accumulatedText, setAccumulatedText] = useState("");
  const [toolCalls, setToolCalls] = useState<(ToolCall | null)[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hoveredChunkId, setHoveredChunkId] = useState<string | null>(null);
  const [targetChoiceIndex, setTargetChoiceIndex] = useState(0);
  const [isBeautified, setIsBeautified] = useState(false);
  const [isSSE, setIsSSE] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!selected) return;

    // Reset state for new selection
    setChunks([]);
    setAccumulatedText("");
    setIsStreaming(true);
    startTimeRef.current = Date.now();

    // 1. Pre-populate from existing response body if any
    provider.getResponsePairData(String(selected.id)).then((res: any) => {
      const contentType = (res?.content_type || "").toLowerCase();
      const isActuallySSE = contentType.includes('text/event-stream') || 
                          contentType.includes('stream') ||
                          (res?.headers || []).some((h: any) => h.key.toLowerCase() === 'content-type' && h.value.toLowerCase().includes('text/event-stream'));
      setIsSSE(isActuallySSE);

      if (res?.body) {
        const { content, toolCalls: sseToolCalls } = parseSSE(res.body);
        const storedChunks = parseSSEChunks(res.body).map(c => ({
          ...c,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: "Captured",
          elapsedMs: 0
        }));

        if (storedChunks.length > 0) {
          setIsSSE(true); // If we found chunks, it's definitely SSE
          setChunks(storedChunks);
          setAccumulatedText(content);
          setToolCalls(sseToolCalls);

          // If the last stored chunk is [DONE], we can stop streaming status
          const hasDone = storedChunks.some(c => c.event === 'control' && c.data.includes('[DONE]'));
          if (hasDone) setIsStreaming(false);
        } else if (!isActuallySSE) {
          setIsStreaming(false);
        }
      } else if (!isActuallySSE) {
        setIsStreaming(false);
      }
    }).catch(() => { 
      setIsSSE(false);
    });

    // 2. Listen for live updates
    const cleanup = provider.listenSSE(String(selected.id), (rawData) => {
      let content = "";
      let eventType = "message";

      const cleanData = rawData.replace(/^data:\s*/, '').trim();

      if (cleanData === '[DONE]') {
        eventType = "control";
        setIsStreaming(false);
      } else {
        try {
          const parsed = JSON.parse(cleanData);
          const choices = parsed.choices || [];
          const choice = choices[targetChoiceIndex] || choices[0];
          const delta = choice?.delta;

          if (delta) {
            if (typeof delta.content === 'string') {
              content = delta.content;
            } else if (Array.isArray(delta.content)) {
              content = delta.content.map((p: any) => p.text || "").join("");
            }

            if (delta.tool_calls) {
              setToolCalls(prev => {
                const newTCs = [...prev];
                delta.tool_calls.forEach((tc: ToolCall) => {
                  const idx = tc.index;
                  if (!newTCs[idx]) {
                    newTCs[idx] = { ...tc };
                  } else {
                    const existing = newTCs[idx]!;
                    if (tc.id) existing.id = tc.id;
                    if (tc.function) {
                      if (!existing.function) existing.function = {};
                      if (tc.function.name) existing.function.name = tc.function.name;
                      if (tc.function.arguments) {
                        existing.function.arguments = (existing.function.arguments || "") + tc.function.arguments;
                      }
                    }
                  }
                });
                return newTCs;
              });
            }
          } else if (choice?.text) {
            content = choice.text;
          }
        } catch (e) { }
      }

      const newChunk: SSEChunk = {
        id: Math.random().toString(36).substr(2, 9),
        event: eventType,
        data: rawData,
        content: content,
        timestamp: new Date().toLocaleTimeString(),
        elapsedMs: Date.now() - startTimeRef.current
      };

      setChunks(prev => {
        // Prevent obvious duplicates if the listener replays chunks that were just loaded from the static body
        if (prev.some(p => p.data === rawData && p.timestamp === "Captured")) {
          return prev;
        }
        return [...prev, newChunk];
      });

      if (content) {
        setAccumulatedText(prev => {
          // Deduplicate logic for content if needed (optional, safer to rely on chunks for rendering)
          return prev + content;
        });
      }

      // Auto-scroll
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    });

    return () => {
      cleanup();
      setIsStreaming(false);
    };
  }, [selected, provider, targetChoiceIndex]);

  const choiceCount = useMemo(() => {
    let max = 1;
    chunks.forEach(c => {
      try {
        const clean = c.data.replace(/^data:\s*/, '').trim();
        if (clean !== '[DONE]') {
          const parsed = JSON.parse(clean);
          if (parsed.choices) {
            parsed.choices.forEach((ch: any) => {
              if (ch.index + 1 > max) max = ch.index + 1;
            });
          }
        }
      } catch (e) { }
    });
    return max;
  }, [chunks]);

  if (!selected) return <Placeholder text="Select a request to inspect streaming data" icon={<FiActivity size={32} />} />;

  if (!isSSE && chunks.length === 0) {
    return (
      <Placeholder 
        icon={<FiZap size={48} className="text-[var(--text-muted)]" />}
        text="No Server-Sent Events (SSE) detected in this request. This tab is designed for live LLM streaming data."
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] text-[var(--text-secondary)] font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 @sm:px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-sidebar)]">
        <div className="flex items-center gap-3">
          <div className={twMerge(
            "p-2 rounded-lg",
            isStreaming ? "bg-amber-500/10" : "bg-emerald-500/10"
          )}>
            <FiZap className={isStreaming ? "text-amber-500 animate-pulse" : "text-emerald-500"} size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wider">LLM Stream Viewer</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                <FiActivity size={10} />
                {isStreaming ? "STREAMING..." : "COMPLETED"}
              </span>
              <span className="text-[10px] text-zinc-700">•</span>
              <span className="text-[10px] text-zinc-500 font-mono">ID: {selected.id}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {choiceCount > 1 && (
            <div className="flex bg-[var(--bg-surface-inset)]/40 rounded-lg p-1 border border-[var(--border-primary)] mr-2">
              {Array.from({ length: choiceCount }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTargetChoiceIndex(idx);
                  }}
                  className={twMerge(
                    "px-4 py-2 rounded text-[11px] font-bold transition-all",
                    targetChoiceIndex === idx ? "bg-amber-600 text-[var(--text-primary)] shadow-lg" : "text-[var(--text-muted)] hover:text-[var(--text-tertiary)]"
                  )}
                >
                  Choice {idx + 1}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col items-end px-3 py-1 bg-[var(--bg-surface-inset)]/20 rounded-md border border-[var(--border-primary)]/50">
            <span className="text-[8px] font-bold text-[var(--text-muted)] tracking-tighter">Event Count</span>
            <span className="text-xs font-mono text-blue-400 font-bold">{chunks.length}</span>
          </div>
          <button className="p-2 hover:bg-[var(--bg-surface-elevated)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <FiSettings size={16} />
          </button>
        </div>
      </div>

      {/* Main Container: Split View */}
      <div className="flex-1 flex overflow-hidden">
        <ChunkList 
          chunks={chunks}
          isBeautified={isBeautified}
          setIsBeautified={setIsBeautified}
          hoveredChunkId={hoveredChunkId}
          setHoveredChunkId={setHoveredChunkId}
          scrollRef={scrollRef}
        />
        <AccumulatedOutput 
          chunks={chunks}
          accumulatedText={accumulatedText}
          toolCalls={toolCalls}
          isStreaming={isStreaming}
          hoveredChunkId={hoveredChunkId}
          setHoveredChunkId={setHoveredChunkId}
        />
      </div>
    </div>
  );
};
