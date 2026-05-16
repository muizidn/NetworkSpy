import React, { useState, useMemo, useEffect } from "react";
import { getEncoding } from "js-tiktoken";
import { FiHash, FiPieChart, FiInfo, FiLayers, FiArrowRight, FiArrowLeft, FiActivity, FiZap } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { useTrafficListContext } from "@src/packages/main-content/context/TrafficList";
import { useAppProvider } from "@src/packages/app-env";
import { RequestPairData } from "../../RequestTab";
import { decodeBody, parseBodyAsJson, parseSSE, ToolCall } from "../../utils/bodyUtils";

import { Placeholder } from "./LLMViewer/shared/Placeholder";
import { TokenVisualizer } from "./LLMViewer/LLMTokenAnalyzerMode/TokenVisualizer";
import { TechnicalDetails } from "./LLMViewer/LLMTokenAnalyzerMode/TechnicalDetails";

export const LLMTokenAnalyzerMode = () => {
  const { provider } = useAppProvider();
  const { selections } = useTrafficListContext();
  const selected = selections.firstSelected;

  const [inputData, setInputData] = useState<RequestPairData | null>(null);
  const [outputData, setOutputData] = useState<RequestPairData | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"input" | "output">("output");
  const [encodingName, setEncodingName] = useState<"cl100k_base" | "p50k_base" | "r50k_base">("cl100k_base");
  const [inputChoiceIndex, setInputChoiceIndex] = useState(0);
  const [outputChoiceIndex, setOutputChoiceIndex] = useState(0);

  useEffect(() => {
    if (!selected) {
      setInputData(null);
      setOutputData(null);
      return;
    }
    setLoading(true);
    setInputChoiceIndex(0);
    setOutputChoiceIndex(0);

    Promise.all([
      provider.getRequestPairData(String(selected.id)).catch(() => null),
      provider.getResponsePairData(String(selected.id)).catch(() => null)
    ]).then(([req, res]) => {
      setInputData(req);
      setOutputData(res);
      // Default to whichever has content, prefer output if available
      if (res?.body) setViewMode("output");
      else if (req?.body) setViewMode("input");
    }).finally(() => setLoading(false));
  }, [selected, provider]);

  const extractData = (data: RequestPairData | null, type: 'input' | 'output'): { text: string; toolCalls: ToolCall[] } => {
    if (!data?.body) return { text: "", toolCalls: [] };

    const contentType = data.content_type || "";
    const headers = data.headers || [];
    const transferEncoding = headers.find(h => h.key.toLowerCase() === 'transfer-encoding')?.value || "";

    // SSE detection: usually text/event-stream, often chunked
    const isSSE = contentType.toLowerCase().includes("event-stream") ||
      (contentType.toLowerCase().includes("text/") && transferEncoding.toLowerCase().includes("chunked") && decodeBody(data.body).includes("data: "));

    if (isSSE && type === 'output') {
      const { content, toolCalls } = parseSSE(data.body);
      return { text: content, toolCalls };
    }

    const parsed = parseBodyAsJson(data.body);
    if (!parsed) {
      return { text: decodeBody(data.body), toolCalls: [] };
    }

    try {
      const index = type === 'input' ? inputChoiceIndex : outputChoiceIndex;

      // Response patterns
      if (type === 'output') {
        const choices = parsed.choices || [];
        const choice = choices[index] || choices[0];
        const content = choice?.message?.content || choice?.text || parsed.content || "";
        const toolCalls = choice?.message?.tool_calls || [];

        if (Array.isArray(content)) {
          return { text: content.map((p: any) => p.text || "").join("\n"), toolCalls };
        }
        return { text: String(content || ""), toolCalls };
      }

      // Request patterns (Prompt)
      if (type === 'input') {
        let toolCalls: ToolCall[] = [];
        let text = "";

        if (parsed.messages && Array.isArray(parsed.messages)) {
          text = parsed.messages.map((m: any) => {
            let contentStr = "";
            if (typeof m.content === 'string') {
              contentStr = m.content;
            } else if (Array.isArray(m.content)) {
              contentStr = m.content.map((p: any) => p.text || "").join("\n");
            }
            if (m.tool_calls) toolCalls = [...toolCalls, ...m.tool_calls];
            return `${m.role.toUpperCase()}:\n${contentStr}`;
          }).join("\n\n");
        } else if (parsed.prompt) {
          text = parsed.prompt;
        }
        return { text, toolCalls };
      }
    } catch (e) { }
    return { text: decodeBody(data.body), toolCalls: [] };
  };

  const inputInfo = useMemo(() => extractData(inputData, 'input'), [inputData, inputChoiceIndex]);
  const outputInfo = useMemo(() => extractData(outputData, 'output'), [outputData, outputChoiceIndex]);

  const inputText = inputInfo.text;
  const outputText = outputInfo.text;

  const enc = useMemo(() => getEncoding(encodingName), [encodingName]);

  const analyze = (text: string) => {
    if (!text) return { tokens: [], decodedTokens: [], count: 0, charCount: 0 };
    const tokens = enc.encode(text);
    const decodedTokens = tokens.map(t => enc.decode([t]));
    return {
      tokens,
      decodedTokens,
      count: tokens.length,
      charCount: text.length,
    };
  };

  const inputAnalysis = useMemo(() => analyze(inputText), [inputText, enc]);
  const outputAnalysis = useMemo(() => analyze(outputText), [outputText, enc]);

  const activeAnalysis = viewMode === "input" ? inputAnalysis : outputAnalysis;
  const activeToolCalls = viewMode === "input" ? inputInfo.toolCalls : outputInfo.toolCalls;

  if (!selected) return <Placeholder text="Select a traffic item to analyze tokens" />;
  if (loading) return <Placeholder text="Analyzing full transaction..." icon={<FiLayers className="animate-spin" size={32} />} />;
  if (!inputText && !outputText) return <Placeholder text="No inspectable text found in either request or response" icon={<FiInfo size={32} />} />;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] text-[var(--text-secondary)] overflow-hidden select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 @sm:px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-sidebar)] shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-lg border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
              <FiHash className="text-indigo-500" size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wider">Token Intelligence</h2>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-[10px] text-[var(--text-muted)]">Encoding:</span>
                <select
                  value={encodingName}
                  onChange={(e) => setEncodingName(e.target.value as any)}
                  className="bg-[var(--bg-surface-inset)] text-[10px] text-[var(--text-secondary)] border-none rounded px-2 py-0.5 outline-none cursor-pointer hover:bg-[var(--bg-surface-elevated)] transition-colors"
                >
                  <option value="cl100k_base">cl100k_base (GPT-4 / 3.5)</option>
                  <option value="p50k_base">p50k_base (Codex)</option>
                  <option value="r50k_base">r50k_base (GPT-2)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Input/Output Selector */}
          <div className="flex bg-[var(--bg-surface-inset)]/40 rounded-lg p-1 border border-[var(--border-primary)]">
            <button
              onClick={() => setViewMode("input")}
              className={twMerge(
                "px-4 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-2",
                viewMode === "input" ? "bg-indigo-600 text-[var(--text-primary)] shadow-lg" : "text-[var(--text-muted)] hover:text-[var(--text-tertiary)]"
              )}
            >
              <FiArrowRight size={12} className={viewMode === "input" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"} />
              Input ({inputAnalysis.count})
            </button>
            <button
              onClick={() => setViewMode("output")}
              className={twMerge(
                "px-4 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-2",
                viewMode === "output" ? "bg-indigo-600 text-[var(--text-primary)] shadow-lg" : "text-[var(--text-muted)] hover:text-[var(--text-tertiary)]"
              )}
            >
              <FiArrowLeft size={12} className={viewMode === "output" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"} />
              Output ({outputAnalysis.count})
            </button>
          </div>

          {viewMode === "output" && (
            <div className="flex bg-[var(--bg-surface)] rounded-lg p-1 border border-[var(--border-primary)]">
              {(() => {
                const choiceCount = (() => {
                  if (!outputData?.body) return 1;
                  try {
                    const parsed = parseBodyAsJson(outputData.body);
                    return parsed.choices?.length || 1;
                  } catch (e) { return 1; }
                })();

                if (choiceCount <= 1) return null;

                return Array.from({ length: choiceCount }).map((_, n) => (
                  <button
                    key={n}
                    onClick={() => setOutputChoiceIndex(n)}
                    className={twMerge(
                      "px-4 py-2 rounded text-[11px] font-bold transition-all",
                      outputChoiceIndex === n ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] shadow-md" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    )}
                  >
                    Choice {n + 1}
                  </button>
                ));
              })()}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <StatBox label="Total Transaction" value={inputAnalysis.count + outputAnalysis.count} icon={<FiActivity size={10} />} color="text-amber-400" />
          <StatBox label="Active Tokens" value={activeAnalysis.count} icon={<FiZap size={10} />} color="text-indigo-400" />
          <StatBox label="Active T/C" value={activeAnalysis.charCount > 0 ? (activeAnalysis.count / activeAnalysis.charCount).toFixed(2) : "0.00"} icon={<FiPieChart size={10} />} color="text-emerald-400" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <TokenVisualizer 
          viewMode={viewMode}
          tokens={activeAnalysis.tokens}
          decodedTokens={activeAnalysis.decodedTokens}
          activeToolCalls={activeToolCalls}
        />
        <TechnicalDetails 
          viewMode={viewMode}
          inputCount={inputAnalysis.count}
          outputCount={outputAnalysis.count}
        />
      </div>
    </div>
  );
};

const StatBox = ({ label, value, icon, color }: { label: string, value: any, icon: any, color: string }) => (
  <div className="flex flex-col items-end">
    <span className="text-[8px] font-bold text-[var(--text-muted)] tracking-tighter flex items-center gap-1">
      {icon} {label}
    </span>
    <span className={twMerge("text-sm font-mono font-bold leading-none mt-1", color)}>{value}</span>
  </div>
);
