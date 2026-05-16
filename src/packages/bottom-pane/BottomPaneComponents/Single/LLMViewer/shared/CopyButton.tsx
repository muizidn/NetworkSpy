import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { FiCopy, FiCheck } from "react-icons/fi";

export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={twMerge(
        "flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--bg-surface-elevated)]/50 hover:bg-[var(--bg-surface-elevated)] text-[9px] font-bold transition-all border border-[var(--border-primary)]/50 opacity-0 group-hover:opacity-100",
        copied ? "text-emerald-400 border-emerald-900/50 bg-emerald-950/20" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
      )}
    >
      {copied ? (
        <>
          <FiCheck size={10} />
          COPIED
        </>
      ) : (
        <>
          <FiCopy size={10} />
          COPY
        </>
      )}
    </button>
  );
};
