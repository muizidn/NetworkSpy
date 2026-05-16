import React from "react";
import { FiDatabase } from "react-icons/fi";

interface TechnicalDetailsProps {
  viewMode: string;
  inputCount: number;
  outputCount: number;
}

export const TechnicalDetails: React.FC<TechnicalDetailsProps> = ({
  viewMode,
  inputCount,
  outputCount
}) => {
  return (
    <div className="w-1/3 flex flex-col bg-[var(--bg-app)] overflow-hidden">
      <div className="px-4 py-2 border-b border-[var(--border-primary)] bg-[var(--bg-surface)]/40 shrink-0">
        <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)]">Technical Specs</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 @sm:p-6 space-y-8 custom-scrollbar">
        {/* Cost Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-500/20 rounded">
              <FiDatabase className="text-indigo-400" size={14} />
            </div>
            <span className="text-xs font-bold text-[var(--text-primary)] tracking-tighter">Full Transaction Cost</span>
          </div>
          <div className="space-y-3">
            <CostItem
              label="GPT-4o (Combined)"
              rate="In: $5 / Out: $15"
              input={inputCount}
              output={outputCount}
              cost={(0.000005 * inputCount) + (0.000015 * outputCount)}
            />
            <CostItem
              label="GPT-3.5 Turbo"
              rate="In: $0.5 / Out: $1.5"
              input={inputCount}
              output={outputCount}
              cost={(0.0000005 * inputCount) + (0.0000015 * outputCount)}
            />
          </div>
        </div>

        {/* Character Details */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest">{viewMode} Byte Distribution</h3>
          <div className="h-2 w-full bg-[var(--bg-surface-inset)] rounded-full overflow-hidden flex">
            <div className="h-full bg-indigo-500 w-[60%]" />
            <div className="h-full bg-emerald-500 w-[20%]" />
            <div className="h-full bg-amber-500 w-[15%]" />
            <div className="h-full bg-rose-500 w-[5%]" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[var(--text-muted)]">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Alpha</div>
            <div className="flex items-center gap-2 text-right justify-end">Numbers <span className="w-2 h-2 rounded-full bg-emerald-500" /></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Symbols</div>
            <div className="flex items-center gap-2 text-right justify-end">Space <span className="w-2 h-2 rounded-full bg-rose-500" /></div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-surface-inset)]/20 text-[9px] text-[var(--text-muted)] font-black tracking-widest text-center shrink-0">
        Powered by Tiktoken WASM-Free Bridge
      </div>
    </div>
  );
};

const CostItem = ({ label, rate, input, output, cost }: { label: string, rate: string, input: number, output: number, cost: number }) => (
  <div className="flex justify-between items-start group border-b border-[var(--border-primary)]/5 pb-2">
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">{label}</span>
      <span className="text-[8px] text-[var(--text-muted)] mb-1">{rate}</span>
      <div className="flex gap-2 text-[8px] font-mono text-[var(--text-muted)]">
        <span>IN: {input}</span>
        <span>OUT: {output}</span>
      </div>
    </div>
    <span className="text-[10px] font-mono text-emerald-400 font-bold">${cost.toFixed(6)}</span>
  </div>
);
