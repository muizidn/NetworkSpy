import React from "react";
import { twMerge } from "tailwind-merge";
import MonacoEditor from "@monaco-editor/react";

export interface ComposerResponse {
  status: number;
  status_text: string;
  headers: { key: string; value: string }[];
  body: number[];
  content_type: string;
  timing_ms: number;
  size_bytes: number;
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
};

const vscToHex = (v: number) => {
  const h = v.toString(16);
  return h.length === 1 ? "0" + h : h;
};

const bodyToHexString = (body: number[]): string => {
  let hex = "";
  for (let i = 0; i < body.length; i++) {
    if (i > 0 && i % 16 === 0) hex += "\n";
    else if (i > 0) hex += " ";
    hex += vscToHex(body[i]);
  }
  return hex;
};

interface ResponseViewProps {
  response: ComposerResponse | null;
  error: string | null;
  activeResponseTab: "headers" | "body" | "hex";
  onResponseTabChange: (tab: "headers" | "body" | "hex") => void;
  responseBodyString: string;
  isJSONResponse: boolean;
}

export const ResponseView: React.FC<ResponseViewProps> = ({
  response,
  error,
  activeResponseTab,
  onResponseTabChange,
  responseBodyString,
  isJSONResponse,
}) => {
  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="flex-shrink-0 mb-3 p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
          <p className="text-red-400 text-xs font-mono">{error}</p>
        </div>
      )}

      {response ? (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-3 flex-shrink-0 mb-3">
            <div className={twMerge(
              "px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider",
              response.status >= 200 && response.status < 300
                ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/50"
                : response.status >= 300 && response.status < 400
                ? "bg-blue-950/30 text-blue-400 border border-blue-900/50"
                : response.status >= 400 && response.status < 500
                ? "bg-amber-950/30 text-amber-400 border border-amber-900/50"
                : "bg-red-950/30 text-red-400 border border-red-900/50"
            )}>
              {response.status} {response.status_text}
            </div>
            <span className="text-zinc-500 text-xs font-mono">{response.timing_ms}ms</span>
            <span className="text-zinc-500 text-xs font-mono">{formatSize(response.size_bytes)}</span>
          </div>

          <div className="flex items-center gap-1 border-b border-zinc-800 flex-shrink-0">
            {(["headers", "body", "hex"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onResponseTabChange(tab)}
                className={twMerge(
                  "px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all rounded-t-lg",
                  activeResponseTab === tab
                    ? "text-blue-400 border-b-2 border-blue-500 bg-blue-500/5"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {activeResponseTab === "headers" && (
              <div className="p-4 space-y-1">
                {response.headers.map((h, i) => (
                  <div key={i} className="flex gap-2 text-xs font-mono">
                    <span className="text-blue-400 whitespace-nowrap">{h.key}:</span>
                    <span className="text-zinc-400 break-all">{h.value}</span>
                  </div>
                ))}
              </div>
            )}
            {activeResponseTab === "body" && (
              <div className="h-full border-t border-zinc-800" style={{ minHeight: "150px" }}>
                <MonacoEditor
                  height="100%"
                  language={isJSONResponse ? "json" : "plaintext"}
                  theme="vs-dark"
                  value={responseBodyString}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineNumbers: "off",
                    scrollBeyondLastLine: false,
                    readOnly: true,
                    padding: { top: 8 },
                  }}
                />
              </div>
            )}
            {activeResponseTab === "hex" && (
              <div className="p-4">
                <pre className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                  {bodyToHexString(response.body)}
                </pre>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-600 text-xs font-mono">Send a request to see the response</p>
        </div>
      )}
    </div>
  );
};
