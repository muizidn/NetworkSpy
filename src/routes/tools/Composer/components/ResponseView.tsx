import React from "react";
import { twMerge } from "tailwind-merge";
import { MonacoEditor } from "@src/packages/ui/MonacoEditor";
import { HexView } from "@src/packages/bottom-pane/TabRenderer/HexView";
import { Tabs } from "./Tabs";

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

const ResponseHeadersView: React.FC<{ headers: { key: string; value: string }[] }> = ({ headers }) => (
  <div className="p-3 space-y-1">
    {headers.map((h, i) => (
      <div key={i} className="flex gap-2 text-[11px] font-mono">
        <span className="text-blue-400 whitespace-nowrap">{h.key}:</span>
        <span className="text-zinc-400 break-all">{h.value}</span>
      </div>
    ))}
  </div>
);

const ResponseBodyView: React.FC<{
  isJSON: boolean;
  bodyString: string;
}> = ({ isJSON, bodyString }) => (
  <div className="h-full border-t border-zinc-800" style={{ minHeight: "100px" }}>
    <MonacoEditor
      height="100%"
      language={isJSON ? "json" : "plaintext"}
      theme="vs-dark"
      value={bodyString}
      options={{
        minimap: { enabled: false },
        fontSize: 11,
        lineNumbers: "off",
        scrollBeyondLastLine: false,
        readOnly: true,
              padding: { top: 6, bottom: 12 },
      }}
    />
  </div>
);

const ResponseHexView: React.FC<{ body: number[] }> = ({ body }) => (
  <div className="p-3 h-full">
    <HexView data={new Uint8Array(body)} />
  </div>
);

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
        <div className="flex-shrink-0 mb-2 p-2 bg-red-950/30 border border-red-900/50 rounded-lg">
          <p className="text-red-400 text-[11px] font-mono">{error}</p>
        </div>
      )}

      {response ? (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-2 flex-shrink-0 mb-2">
            <div className={twMerge(
              "px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider",
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
            <span className="text-zinc-500 text-[11px] font-mono">{response.timing_ms}ms</span>
            <span className="text-zinc-500 text-[11px] font-mono">{formatSize(response.size_bytes)}</span>
          </div>

          <Tabs
            tabs={[
              { key: "headers", label: "Headers" },
              { key: "body", label: "Body" },
              { key: "hex", label: "Hex" },
            ]}
            activeKey={activeResponseTab}
            onChange={onResponseTabChange}
          />

          <div className="flex-1 min-h-0 overflow-y-auto">
            {activeResponseTab === "headers" && (
              <ResponseHeadersView headers={response.headers} />
            )}
            {activeResponseTab === "body" && (
              <ResponseBodyView isJSON={isJSONResponse} bodyString={responseBodyString} />
            )}
            {activeResponseTab === "hex" && (
              <ResponseHexView body={response.body} />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-600 text-[11px] font-mono">Send a request to see the response</p>
        </div>
      )}
    </div>
  );
};
