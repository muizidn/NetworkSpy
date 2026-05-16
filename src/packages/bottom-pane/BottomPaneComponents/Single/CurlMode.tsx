import { useAppProvider } from "@src/packages/app-env";
import { useTrafficListContext } from "../../../main-content/context/TrafficList";
import { RequestPairData } from "../../RequestTab";
import { decodeBody } from "../../utils/bodyUtils";
import { MonacoEditor } from "@src/packages/ui/MonacoEditor";
import { useMemo, useState, useEffect } from "react";

const escapeShellArg = (arg: string): string => {
  return `'${arg.replace(/'/g, "'\\''")}'`;
};

export const CurlMode = () => {
  const { provider } = useAppProvider();
  const { selections } = useTrafficListContext();
  const trafficId = useMemo(() => selections.firstSelected?.id as string, [selections]);
  const [data, setData] = useState<RequestPairData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trafficId) return;
    setLoading(true);
    provider.getRequestPairData(trafficId)
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, [trafficId, provider]);

  const curlCommand = useMemo(() => {
    if (!data || !selections.firstSelected) return "";
    const item = selections.firstSelected;
    let command = `curl -X ${item.method} ${escapeShellArg(item.url as string)}`;

    data.headers.forEach(h => {
      command += ` \\\n  -H ${escapeShellArg(`${h.key}: ${h.value}`)}`;
    });

    const body = decodeBody(data.body);
    if (body) {
      command += ` \\\n  -d ${escapeShellArg(body)}`;
    }

    return command;
  }, [data, selections.firstSelected]);

  if (!trafficId) return <Placeholder text="Select a request to generate cURL" />;
  if (loading) return <Placeholder text="Generating..." />;

  return (
    <div className="h-full bg-[var(--bg-app)] flex flex-col">
      <div className="flex-grow relative">
        <MonacoEditor
          height="100%"
          defaultLanguage="shell"
          theme="vs-dark"
          value={curlCommand}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12,
            scrollBeyondLastLine: false,
            lineNumbers: "off",
            wordWrap: "on",
          }}
        />
      </div>
      <div className="p-2 bg-[var(--bg-surface)] border-t border-[var(--border-primary)] text-right">
        <button
          onClick={() => navigator.clipboard.writeText(curlCommand)}
          className="text-[10px] font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
};

const Placeholder = ({ text }: { text: string }) => (
  <div className="h-full flex items-center justify-center text-zinc-500 bg-[var(--bg-app)]">
    <div className="text-center">
      <div className="text-4xl font-bold opacity-10 mb-2">cURL</div>
      <div className="text-sm">{text}</div>
    </div>
  </div>
);
