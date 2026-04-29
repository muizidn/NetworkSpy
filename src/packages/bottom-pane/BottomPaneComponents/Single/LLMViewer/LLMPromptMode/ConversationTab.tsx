import React from "react";
import { twMerge } from "tailwind-merge";
import { FiUser, FiCpu, FiTerminal, FiInfo, FiBox } from "react-icons/fi";
import { Message } from "./types";

interface ConversationTabProps {
  messages: Message[];
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredMessages: Message[];
  collapsedMsgs: Set<number>;
  setCollapsedMsgs: React.Dispatch<React.SetStateAction<Set<number>>>;
  renderContent: (content: any, isCollapsed?: boolean) => React.ReactNode;
}

export const ConversationTab: React.FC<ConversationTabProps> = ({
  messages,
  roleFilter,
  setRoleFilter,
  searchQuery,
  setSearchQuery,
  filteredMessages,
  collapsedMsgs,
  setCollapsedMsgs,
  renderContent
}) => {
  const toggleCollapse = (idx: number) => {
    setCollapsedMsgs(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <>
      {/* Filter / Search Bar */}
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 flex flex-wrap items-center gap-3 shrink-0">
        <div className="flex bg-black/40 rounded-lg p-1 border border-zinc-800">
          {["all", "user", "assistant", "tool", "system"].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={twMerge(
                "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all",
                roleFilter === role ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {role}
            </button>
          ))}
        </div>
        <div className="flex-grow relative group">
          <FiTerminal className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={12} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 @sm:p-6 space-y-6 custom-scrollbar scroll-smooth bg-[#0a0a0a]">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50 py-20">
            <FiInfo size={40} className="mb-4" />
            <p className="text-sm">No messages match your current filters</p>
          </div>
        ) : (
          filteredMessages.map((msg, i) => (
            <div key={i} className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className={twMerge(
                "flex items-center gap-2 px-3 py-1 rounded-full border w-fit",
                msg.role === 'user' ? "bg-blue-900/20 border-blue-800/30 text-blue-400" :
                msg.role === 'assistant' ? "bg-emerald-900/20 border-emerald-800/30 text-emerald-400" :
                msg.role === 'system' ? "bg-zinc-800 border-zinc-700 text-zinc-400" :
                "bg-purple-900/20 border-purple-800/30 text-purple-400"
              )}>
                {msg.role === 'user' ? <FiUser size={10} /> : <FiCpu size={10} />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">{msg.role}</span>
              </div>

              {msg.content && (
                <div 
                  onClick={() => typeof msg.content === 'string' && msg.content.length > 120 && toggleCollapse(i)}
                  className={twMerge(
                    "group relative bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 text-sm leading-relaxed text-zinc-300 shadow-xl transition-all",
                    typeof msg.content === 'string' && msg.content.length > 120 && "cursor-pointer hover:bg-zinc-800/80 hover:border-zinc-700",
                    collapsedMsgs.has(i) && "max-h-16 overflow-hidden"
                  )}
                >
                  {renderContent(msg.content, collapsedMsgs.has(i))}
                  {collapsedMsgs.has(i) && (
                    <div className="mt-1 text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1 group-hover:text-white/60 transition-colors">
                      See More <FiInfo size={8} />
                    </div>
                  )}
                </div>
              )}

              {msg.tool_calls?.map((tc, j) => (
                <div key={j} className="bg-purple-950/20 border border-purple-900/30 rounded-xl p-4 w-full animate-in slide-in-from-right-2 duration-300 shadow-lg text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <FiBox className="text-purple-400" size={14} />
                    <span className="text-[10px] font-bold text-purple-400 tracking-widest">Tool Call Request</span>
                  </div>
                  <div className="flex flex-col gap-1.5 bg-black/40 rounded-lg p-3 border border-purple-900/20">
                    <span className="text-xs font-bold text-white font-mono">{tc.function.name}()</span>
                    <span className="text-[11px] text-purple-300 font-mono opacity-80 break-all whitespace-pre-wrap">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(tc.function.arguments), null, 2);
                        } catch (e) {
                          return tc.function.arguments;
                        }
                      })()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </>
  );
};
