import React, { useMemo, useState, useEffect } from "react";
import { FiMessageSquare, FiCpu, FiCheckCircle, FiInfo } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { useTrafficListContext } from "@src/packages/main-content/context/TrafficList";
import { useAppProvider } from "@src/packages/app-env";
import { RequestPairData } from "../../RequestTab";
import { decodeBody, parseBodyAsJson, parseSSE } from "../../utils/bodyUtils";

import { Placeholder } from "./LLMViewer/shared/Placeholder";
import { MetadataSidebar } from "./LLMViewer/LLMResponseMode/MetadataSidebar";
import { ContentPanel } from "./LLMViewer/LLMResponseMode/ContentPanel";

export const LLMResponseMode = () => {
  const { provider } = useAppProvider();
  const { selections } = useTrafficListContext();
  const selected = selections.firstSelected;
  const [data, setData] = useState<RequestPairData | null>(null);
  const [loading, setLoading] = useState(false);
  const [choiceIndex, setChoiceIndex] = useState(0);

  useEffect(() => {
    if (!selected) {
      setData(null);
      return;
    }
    setLoading(true);
    setChoiceIndex(0); // Reset for new traffic
    provider.getResponsePairData(String(selected.id))
      .then(res => setData(res))
      .catch(error => {
        console.error("Failed to fetch response pair data:", error);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [selected, provider]);

  const responseInfo = useMemo(() => {
    const body = data?.body;
    const contentType = data?.content_type || "";
    const headers = data?.headers || [];
    const transferEncoding = headers.find(h => h.key.toLowerCase() === 'transfer-encoding')?.value || "";

    // SSE detection: usually text/event-stream, often chunked
    const isSSE = contentType.toLowerCase().includes("event-stream") ||
      (contentType.toLowerCase().includes("text/") && transferEncoding.toLowerCase().includes("chunked") && decodeBody(body).includes("data: "));

    if (isSSE) {
      const { content, toolCalls, model, finishReason, usage } = parseSSE(body);
      return {
        content,
        toolCalls,
        model: model || "sse-stream",
        usage: usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        finishReason: finishReason || "stop",
        raw: null,
        choiceCount: 1
      };
    }

    const parsed = parseBodyAsJson(body);
    if (!parsed) {
      if (!body) return null;
      return {
        content: decodeBody(body),
        toolCalls: [],
        model: "raw-data",
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        finishReason: "n/a",
        raw: null,
        choiceCount: 0
      };
    }

    try {
      const choices = parsed.choices || [];
      const choice = choices[choiceIndex] || choices[0] || {};

      const content = choice.message?.content || choice.text || parsed.content || "";
      const toolCalls = choice.message?.tool_calls || [];
      const model = parsed.model || "unknown-model";
      const usage = parsed.usage || parsed.usage_metadata || parsed.usageMetadata || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      const finishReason = choice.finish_reason || "unknown";

      return { content, toolCalls, model, usage, finishReason, raw: parsed, choiceCount: choices.length };
    } catch (e) {
      return {
        content: decodeBody(data?.body),
        toolCalls: [],
        model: "raw-data",
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        finishReason: "n/a",
        raw: null,
        choiceCount: 0
      };
    }
  }, [data, choiceIndex]);

  const renderContent = (content: any) => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return (
        <div className="flex flex-col gap-4">
          {content.map((part, idx) => {
            if (part.type === 'text') {
              return <div key={idx} className="whitespace-pre-wrap">{part.text}</div>;
            }
            if (part.type === 'image_url') {
              return (
                <div key={idx} className="relative group overflow-hidden rounded-xl border border-[var(--border-primary)]/10 bg-[var(--bg-surface-inset)]/40 p-2">
                  <img
                    src={part.image_url.url}
                    alt="Response context"
                    className="max-w-full h-auto max-h-96 object-contain rounded-lg"
                  />
                </div>
              );
            }
            return <div key={idx} className="text-[var(--text-muted)] italic text-xs">[{part.type} content block]</div>;
          })}
        </div>
      );
    }
    return String(content || "");
  };

  if (!selected) return <Placeholder text="Select a response to view LLM details" />;
  if (loading) return <Placeholder text="Fetching AI response data..." />;
  if (!responseInfo) return <Placeholder text="No valid LLM response body found" icon={<FiInfo size={32} />} />;

  const { content, toolCalls, model, usage, finishReason, choiceCount } = responseInfo;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] text-[var(--text-secondary)] overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 @sm:px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-sidebar)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
            <FiMessageSquare className="text-blue-500" size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wider">LLM Response Viewer</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 font-mono">
                <FiCpu size={10} />
                {model}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">•</span>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <FiCheckCircle size={10} />
                {finishReason.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {choiceCount > 1 && (
            <div className="flex bg-[var(--bg-surface-inset)]/40 rounded-lg p-1 border border-[var(--border-primary)]">
              {Array.from({ length: choiceCount }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setChoiceIndex(idx)}
                  className={twMerge(
                    "px-4 py-2 rounded text-[11px] font-bold transition-all",
                    choiceIndex === idx ? "bg-blue-600 text-[var(--text-primary)] shadow-lg" : "text-[var(--text-muted)] hover:text-[var(--text-tertiary)]"
                  )}
                >
                  Choice {idx + 1}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col items-end border-l border-[var(--border-primary)] pl-6">
            <span className="text-[9px] font-bold text-[var(--text-muted)] tracking-tighter">Total Usage</span>
            <span className="text-sm font-mono text-blue-400 font-bold">{usage.total_tokens} tokens</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <MetadataSidebar 
          usage={usage}
          model={model}
          finishReason={finishReason}
          choiceCount={choiceCount}
          choiceIndex={choiceIndex}
        />
        <ContentPanel 
          content={content}
          toolCalls={toolCalls}
          choiceIndex={choiceIndex}
          finishReason={finishReason}
          renderContent={renderContent}
        />
      </div>
    </div>
  );
};
