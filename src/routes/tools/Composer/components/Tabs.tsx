import { twMerge } from "tailwind-merge";

interface Tab<K extends string = string> {
  key: K;
  label: string;
}

interface TabsProps<K extends string = string> {
  tabs: Tab<K>[];
  activeKey: K;
  onChange: (key: K) => void;
  size?: "sm" | "md";
  className?: string;
}

export function Tabs<K extends string = string>({ tabs, activeKey, onChange, size = "sm", className }: TabsProps<K>) {
  return (
    <div className={twMerge("flex items-center gap-1 border-b border-zinc-800 flex-shrink-0", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={twMerge(
            "font-bold uppercase tracking-wider transition-all rounded-t-lg",
            size === "md"
              ? "px-3 py-1.5 text-[11px]"
              : "px-2.5 py-1 text-[11px]",
            activeKey === tab.key
              ? "text-blue-400 border-b-2 border-blue-500 bg-blue-500/5"
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
