import { twMerge } from "tailwind-merge";
import { FiLayers } from "react-icons/fi";
import { MonacoEditor } from "@src/packages/ui/MonacoEditor";
import { ParsedGraphQLItem } from "../types";

interface GraphQLVariablesProps {
  activeData: ParsedGraphQLItem;
  layoutMode: "grid" | "tabbed";
  activeTab: string;
}

export const GraphQLVariables = ({ activeData, layoutMode, activeTab }: GraphQLVariablesProps) => {
  return (
    <div className={twMerge(
      "flex flex-col transition-all",
      layoutMode === 'grid' ? "border-b border-[var(--border-primary)]" : "",
      activeTab === "response" && (layoutMode === 'grid' ? "hidden @5xl:flex" : "hidden"),
      activeTab === "extensions" && (layoutMode === 'grid' ? "hidden @5xl:flex" : "hidden"),
      activeTab === "variables" ? "flex-grow" : (layoutMode === 'grid' ? "h-1/3" : "hidden")
    )}>
      <div className={twMerge(
        "hidden items-center gap-2 px-4 py-2 border-b border-[var(--border-primary)]/50 bg-[var(--bg-surface)]/30",
        layoutMode === 'grid' && "@5xl:flex"
      )}>
        <FiLayers className="text-blue-500" size={14} />
        <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider">Variables</span>
      </div>
      <div className="flex-grow bg-[var(--bg-surface-inset)]/30">
        <MonacoEditor
          height="100%"
          defaultLanguage="json"
          theme="vs-dark"
          value={activeData.variables}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 11,
            fontFamily: "JetBrains Mono, Menlo, monospace",
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            padding: { top: 12 },
          }}
        />
      </div>
    </div>
  );
};
