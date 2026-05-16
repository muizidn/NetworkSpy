import { useEffect, useState, useMemo } from "react";
import { useAppProvider } from "@src/packages/app-env";
import { useTrafficListContext } from "../../../main-content/context/TrafficList";
import { RequestPairData } from "../../RequestTab";
import { twMerge } from "tailwind-merge";
import { FiCpu, FiTerminal } from "react-icons/fi";
import { decodeBody, parseBodyAsJson } from "../../utils/bodyUtils";

import { LLMData, Tool } from "./LLMViewer/LLMPromptMode/types";
import { Placeholder } from "./LLMViewer/shared/Placeholder";
import { ConversationTab } from "./LLMViewer/LLMPromptMode/ConversationTab";
import { ToolsTab } from "./LLMViewer/LLMPromptMode/ToolsTab";
import { ConfigTab } from "./LLMViewer/LLMPromptMode/ConfigTab";

export const LLMPromptMode = () => {
  const { provider } = useAppProvider();
  const { selections } = useTrafficListContext();
  const selected = selections.firstSelected;
  const [data, setData] = useState<RequestPairData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) {
      setData(null);
      return;
    }
    setLoading(true);
    provider.getRequestPairData(String(selected.id))
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selected, provider]);

  const llmData = useMemo<LLMData | null>(() => {
    const body = data?.body;
    const parsed = parseBodyAsJson(body);
    if (!parsed) {
      if (!body) return null;
      return {
        prompt: decodeBody(body),
        model: "raw-text"
      };
    }

    try {
      if (parsed.messages && Array.isArray(parsed.messages)) {
        return {
          messages: parsed.messages,
          model: parsed.model || "unknown",
          temperature: parsed.temperature,
          stream: parsed.stream,
          tools: parsed.tools,
          top_p: parsed.top_p,
          max_tokens: parsed.max_tokens,
          presence_penalty: parsed.presence_penalty,
          frequency_penalty: parsed.frequency_penalty,
          raw_config: Object.keys(parsed).reduce((acc, key) => {
            if (!['messages', 'tools', 'prompt'].includes(key)) {
              acc[key] = parsed[key];
            }
            return acc;
          }, {} as Record<string, any>)
        };
      }

      if (parsed.prompt) {
        return {
          prompt: parsed.prompt,
          model: parsed.model || "unknown"
        };
      }
    } catch (e) { }

    return null;
  }, [data]);

  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [collapsedMsgs, setCollapsedMsgs] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<"messages" | "tools" | "config">("messages");

  // Reset selected tool when switching tabs or when tools change
  useEffect(() => {
    if (activeTab !== "tools") setSelectedTool(null);
  }, [activeTab]);

  useEffect(() => {
    if (llmData?.tools && llmData.tools.length > 0 && !selectedTool) {
      setSelectedTool(llmData.tools[0]);
    }
  }, [llmData?.tools]);

  const filteredMessages = useMemo(() => {
    if (!llmData?.messages) return [];
    return llmData.messages.filter(msg => {
      const matchesRole = roleFilter === "all" || msg.role === roleFilter;
      const matchesSearch = !searchQuery || 
        (typeof msg.content === 'string' && msg.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (Array.isArray(msg.content) && JSON.stringify(msg.content).toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesRole && matchesSearch;
    });
  }, [llmData, roleFilter, searchQuery]);

  const toolUsageMap = useMemo(() => {
    const usage: Record<string, number> = {};
    if (!llmData?.messages) return usage;
    
    llmData.messages.forEach(msg => {
      if (msg.tool_calls) {
        msg.tool_calls.forEach(tc => {
          const name = tc.function.name;
          usage[name] = (usage[name] || 0) + 1;
        });
      }
    });
    return usage;
  }, [llmData?.messages]);

  const renderContent = (content: any, isCollapsed = false) => {
    if (typeof content === 'string') {
      if (isCollapsed) return content.length > 120 ? content.substring(0, 120) + "..." : content;
      return content;
    }
    if (Array.isArray(content)) {
      if (isCollapsed) return "[Complex Content Block]";
      return (
        <div className="flex flex-col gap-3">
          {content.map((part, idx) => {
            if (part.type === 'text') {
              return <div key={idx} className="whitespace-pre-wrap">{part.text}</div>;
            }
            if (part.type === 'image_url') {
              return (
                <div key={idx} className="relative group overflow-hidden rounded-lg border border-[var(--border-primary)]/10 bg-[var(--bg-surface-inset)]/40">
                  <img
                    src={part.image_url.url}
                    alt="Prompt context"
                    className="max-w-full h-auto max-h-64 object-contain transition-transform group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-[var(--bg-surface-inset)]/60 px-2 py-1 text-[8px] font-mono text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    IMAGE: {part.image_url.url.substring(0, 50)}...
                  </div>
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

  if (!selected) return <Placeholder text="Select a request to view LLM details" />;
  if (loading) return <Placeholder text="Analyzing prompt data..." />;
  
  const hasContent = (llmData?.messages && llmData.messages.length > 0) || llmData?.prompt;
  
  if (!llmData || !hasContent) {
    const isStream = (data as any)?.responseHeaders?.['content-type']?.includes('text/event-stream') || 
                   (data as any)?.requestHeaders?.['content-type']?.includes('text/event-stream');

    return (
      <Placeholder 
        icon={<FiTerminal size={32} className="text-[var(--text-muted)]" />}
        text={isStream 
          ? "This is an active LLM stream. Switch to the 'Events' or 'Response' tab to see the live data chunks."
          : "No valid LLM prompt pattern or messages detected in this request."
        } 
      />
    );
  }

  return (
    <div className="h-full bg-[var(--bg-app)] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-sidebar)] justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-[var(--text-primary)] font-bold shadow-lg shadow-emerald-900/20">AI</div>
          <div>
            <div className="text-sm font-bold text-[var(--text-secondary)]">{llmData.model}</div>
            <div className="text-[10px] text-[var(--text-muted)] tracking-widest font-black">LLM PROMPT CONFIG</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-elevated)] flex items-center justify-center text-[var(--text-tertiary)]">
            <FiCpu size={16} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center px-4 bg-[var(--bg-surface)]/50 border-b border-[var(--border-primary)] shrink-0">
        <button 
          onClick={() => setActiveTab("messages")}
          className={twMerge(
            "px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
            activeTab === "messages" ? "text-emerald-400" : "text-[var(--text-muted)] hover:text-[var(--text-tertiary)]"
          )}
        >
          Conversation
          {activeTab === "messages" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
        </button>
        {llmData?.tools && llmData.tools.length > 0 && (
          <button 
            onClick={() => setActiveTab("tools")}
            className={twMerge(
              "px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
              activeTab === "tools" ? "text-purple-400" : "text-[var(--text-muted)] hover:text-[var(--text-tertiary)]"
            )}
          >
            Tools
            {activeTab === "tools" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />}
          </button>
        )}
        <button 
          onClick={() => setActiveTab("config")}
          className={twMerge(
            "px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
            activeTab === "config" ? "text-amber-400" : "text-[var(--text-muted)] hover:text-[var(--text-tertiary)]"
          )}
        >
          Configuration
          {activeTab === "config" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />}
        </button>
      </div>

      {activeTab === "messages" ? (
        <ConversationTab 
          messages={llmData.messages || []}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredMessages={filteredMessages}
          collapsedMsgs={collapsedMsgs}
          setCollapsedMsgs={setCollapsedMsgs}
          renderContent={renderContent}
        />
      ) : activeTab === "tools" ? (
        <ToolsTab 
          tools={llmData.tools || []}
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
          toolUsageMap={toolUsageMap}
        />
      ) : (
        <ConfigTab llmData={llmData} />
      )}
    </div>
  );
};
