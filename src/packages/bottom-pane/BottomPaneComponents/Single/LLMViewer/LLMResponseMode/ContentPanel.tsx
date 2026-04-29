import React from "react";
import { FiCode } from "react-icons/fi";
import { ToolCall } from "@src/packages/bottom-pane/utils/bodyUtils";

interface ContentPanelProps {
  content: any;
  toolCalls: ToolCall[];
  choiceIndex: number;
  finishReason: string;
  renderContent: (content: any) => React.ReactNode;
}

export const ContentPanel: React.FC<ContentPanelProps> = ({
  content,
  toolCalls,
  choiceIndex,
  finishReason,
  renderContent
}) => {
  return (
    <div className="w-[70%] bg-[#111314] flex flex-col overflow-hidden">
      <div className="px-6 py-3 bg-zinc-900/30 border-b border-zinc-800 text-[10px] font-bold text-zinc-500 tracking-[0.2em] flex items-center justify-between shrink-0">
        <span>Result Content</span>
        <span className="font-normal normal-case text-zinc-700 italic">assistant message • choice: {choiceIndex + 1} • {finishReason}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-8 @sm:p-12 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Tool Calls Rendering */}
          {toolCalls && toolCalls.length > 0 && (
            <div className="space-y-4 mt-8 pt-8 border-t border-zinc-800">
              <h3 className="text-[10px] font-bold text-zinc-500 tracking-widest flex items-center gap-2">
                <FiCode size={12} className="text-blue-500" /> Tool Invitations
              </h3>
              <div className="space-y-3">
                {toolCalls.map((tc: ToolCall, idx: number) => (
                  <div key={idx} className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 overflow-hidden">
                    <div className="px-4 py-2 bg-zinc-800/30 border-b border-zinc-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500 bg-black/30 px-1.5 py-0.5 rounded italic">#{tc.id || idx}</span>
                        <span className="text-xs font-bold text-blue-400 font-mono tracking-tight">{tc.function?.name}()</span>
                      </div>
                      <span className="text-[9px] font-bold text-zinc-600 tracking-tighter">{tc.type}</span>
                    </div>
                    <div className="p-4 bg-[#0a0a0a]">
                      <pre className="text-[11px] font-mono text-zinc-400 leading-relaxed overflow-x-auto custom-scrollbar">
                        {(() => {
                          try {
                            return JSON.stringify(JSON.parse(tc.function?.arguments || "{}"), null, 2);
                          } catch (e) {
                            return tc.function?.arguments || "{}";
                          }
                        })()}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Rendering */}
          <div className="text-lg leading-relaxed text-zinc-200 font-serif">
            {renderContent(content)}
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="px-6 py-3 border-t border-zinc-900 bg-black/20 flex gap-4 shrink-0">
        <div className="flex items-center gap-2 text-[10px] text-zinc-600 italic">
          <span className="block w-2 h-2 rounded-full bg-blue-500/40" />
          Rendered in Markdown Pro
        </div>
      </div>
    </div>
  );
};
