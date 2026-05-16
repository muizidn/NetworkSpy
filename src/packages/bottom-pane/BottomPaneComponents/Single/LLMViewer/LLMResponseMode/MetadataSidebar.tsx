import React from "react";
import { FiBarChart2, FiDollarSign, FiLayers } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

interface MetadataSidebarProps {
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  finishReason: string;
  choiceCount: number;
  choiceIndex: number;
}

export const MetadataSidebar: React.FC<MetadataSidebarProps> = ({
  usage,
  model,
  finishReason,
  choiceCount,
  choiceIndex
}) => {
  return (
    <div className="w-[30%] border-r border-[var(--border-primary)] bg-[var(--bg-surface-inset)]/5 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="p-4 @sm:p-6 space-y-6">
        {/* Usage Stats Card */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest flex items-center gap-2 mb-2">
            <FiBarChart2 size={12} /> Usage Analytics
          </h3>

          <div className="space-y-2">
            <UsageRow label="Prompt" value={usage.prompt_tokens} max={Math.max(usage.total_tokens, 100)} color="bg-blue-500" />
            <UsageRow label="Completion" value={usage.completion_tokens} max={Math.max(usage.total_tokens, 100)} color="bg-indigo-500" />
          </div>

          <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-500/80 font-bold text-[10px]">
              <FiDollarSign size={12} /> Estimated Cost
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              ${((usage.prompt_tokens * 0.01 + usage.completion_tokens * 0.03) / 1000).toFixed(6)}
            </span>
          </div>
        </div>

        {/* Model Details Card */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest flex items-center gap-2 mb-2">
            <FiLayers size={12} /> Model Metadata
          </h3>
          <div className="space-y-1">
            <MetaItem label="Model ID" value={model} />
            <MetaItem label="Finish Reason" value={finishReason} />
            <MetaItem label="Choices" value={choiceCount.toString()} />
            <MetaItem label="Active Choice" value={`Choice ${choiceIndex + 1}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

const UsageRow = ({ label, value, max, color }: { label: string, value: number, max: number, color: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-end">
      <span className="text-[10px] text-[var(--text-muted)] font-bold">{label}</span>
      <span className="text-[11px] font-mono text-[var(--text-tertiary)]">{value} tokens</span>
    </div>
    <div className="h-1.5 w-full bg-[var(--bg-surface-elevated)] rounded-full overflow-hidden">
      <div
        className={twMerge("h-full rounded-full transition-all duration-1000", color)}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  </div>
);

const MetaItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-[var(--border-primary)]/30">
    <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
    <span className="text-[10px] font-mono text-[var(--text-secondary)] truncate ml-4" title={value}>{value}</span>
  </div>
);
