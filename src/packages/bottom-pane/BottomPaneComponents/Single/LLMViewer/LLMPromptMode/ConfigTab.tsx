import React from "react";
import { twMerge } from "tailwind-merge";
import { FiCpu, FiTerminal, FiInfo } from "react-icons/fi";
import { LLMData } from "./types";
import { CopyButton } from "../shared/CopyButton";

interface ConfigTabProps {
  llmData: LLMData;
}

export const ConfigTab: React.FC<ConfigTabProps> = ({ llmData }) => {
  return (
    <div className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-[var(--bg-surface-inset)]/20">
      <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-900/20">
            <FiInfo size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight uppercase italic">Model Parameters</h2>
            <p className="text-[10px] text-[var(--text-muted)] font-mono tracking-widest uppercase">Global configuration for this request</p>
          </div>
        </div>

        <div className="grid grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 gap-4">
          {/* Core Parameters */}
          <ConfigCard label="Model" value={llmData.model} icon={<FiCpu />} color="zinc" />
          <ConfigCard 
            label="Temperature" 
            value={llmData.temperature ?? "Not set"} 
            icon={<div className="text-[10px] font-black italic">T°</div>} 
            color={llmData.temperature !== undefined ? "amber" : "zinc"} 
          />
          <ConfigCard 
            label="Streaming" 
            value={llmData.stream ? "Enabled" : "Disabled"} 
            icon={<div className="w-2 h-2 rounded-full bg-current animate-pulse" />} 
            color={llmData.stream ? "blue" : "zinc"} 
          />
          
          {/* Optional Parameters */}
          {llmData.max_tokens && <ConfigCard label="Max Tokens" value={llmData.max_tokens} icon={<FiTerminal />} color="emerald" />}
          {llmData.top_p !== undefined && <ConfigCard label="Top P" value={llmData.top_p} icon={<div className="text-[10px] font-black">P</div>} color="emerald" />}
          {llmData.frequency_penalty !== undefined && <ConfigCard label="Freq Penalty" value={llmData.frequency_penalty} color="purple" />}
          {llmData.presence_penalty !== undefined && <ConfigCard label="Pres Penalty" value={llmData.presence_penalty} color="purple" />}

          {/* Raw Config Dump */}
          <div className="col-span-full mt-6 group">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Raw JSON Request Configuration</div>
              <CopyButton text={JSON.stringify(llmData.raw_config, null, 2)} />
            </div>
            <div className="bg-[var(--bg-surface-inset)]/40 border border-[var(--border-primary)] rounded-2xl p-6 font-mono text-xs text-[var(--text-tertiary)] overflow-x-auto shadow-inner">
              {JSON.stringify(llmData.raw_config, null, 2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfigCard = ({ label, value, icon = null, color = "zinc" }: { label: string, value: any, icon?: any, color?: string }) => {
  const colorClasses = {
    zinc: "text-[var(--text-tertiary)] bg-[var(--bg-surface-elevated)]/20 border border-[var(--border-primary)]/50",
    amber: "text-amber-400 bg-amber-500/10 border-amber-900/30",
    blue: "text-blue-400 bg-blue-500/10 border-blue-900/30",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-900/30",
    purple: "text-purple-400 bg-purple-500/10 border-purple-900/30"
  }[color] || "text-[var(--text-tertiary)] bg-[var(--bg-surface-elevated)]/20 border border-[var(--border-primary)]/50";

  return (
    <div className={twMerge("rounded-2xl border p-4 flex flex-col gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]", colorClasses)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</span>
        {icon && <div className="opacity-80">{icon}</div>}
      </div>
      <div className="text-lg font-black text-[var(--text-primary)] tracking-tight truncate">{String(value)}</div>
    </div>
  );
};
