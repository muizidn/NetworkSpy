import { useEffect, useState, useMemo } from "react";
import { useAppProvider } from "@src/packages/app-env";
import { useTrafficListContext } from "../../../main-content/context/TrafficList";
import { ResponsePairData } from "../../ResponseTab";
import { CodeView } from "../../TabRenderer/CodeView";
import { FiFilter, FiZap, FiCopy, FiCheck, FiCpu, FiTerminal, FiChevronDown } from "react-icons/fi";
import jmespath from "jmespath";
import { parseBodyAsJson } from "../../utils/bodyUtils";

export const JSONTransformerMode = () => {
    const { provider } = useAppProvider();
    const { selections } = useTrafficListContext();
    const trafficId = useMemo(() => selections.firstSelected?.id as string, [selections]);
    const [data, setData] = useState<ResponsePairData | null>(null);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [copied, setCopied] = useState(false);
    const [engine, setEngine] = useState<"jmespath" | "dot">("jmespath");

    useEffect(() => {
        if (!trafficId) return;
        setLoading(true);
        provider.getResponsePairData(trafficId)
            .then((res) => setData(res))
            .finally(() => setLoading(false));
    }, [trafficId, provider]);

    const transformedData = useMemo(() => {
        const json = parseBodyAsJson(data?.body);
        if (!json) return "";
        try {
            if (!query.trim()) return JSON.stringify(json, null, 2);

            if (engine === "jmespath") {
                const result = jmespath.search(json, query);
                return JSON.stringify(result, null, 2);
            }

            // Fallback Dot notation
            const path = query.startsWith('.') ? query.substring(1).split('.') : query.split('.');
            let current = json;
            for (const part of path) {
                if (part && current) {
                    current = current[part];
                }
            }
            return JSON.stringify(current, null, 2);
        } catch (e) {
            return `// Error: ${(e as Error).message}\n// Ensure your query is valid for ${engine.toUpperCase()}`;
        }
    }, [data, query, engine]);

    const handleCopy = () => {
        navigator.clipboard.writeText(transformedData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!trafficId) return <Placeholder text="Select a request to transform JSON" />;
    if (loading) return <Placeholder text="Initializing Transformer..." />;

    return (
        <div className="bg-[var(--bg-app)] flex flex-col min-h-full h-full font-sans">
            {/* Transformer Toolbar */}
            <div className="px-4 @sm:px-6 py-4 bg-[var(--bg-sidebar)] border-b border-[var(--border-primary)] space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                        <span className="text-[10px] font-black tracking-[0.2em] text-[var(--text-tertiary)]">JSON Transformer</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-[var(--bg-surface-inset)]/40 rounded-lg p-1 border border-[var(--border-primary)]/5 mr-2">
                            <button
                                onClick={() => setEngine("jmespath")}
                                className={`px-2 py-1 text-[9px] font-bold rounded transition-all ${engine === 'jmespath' ? 'bg-purple-500 text-[var(--text-primary)] shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-tertiary)]'}`}
                            >
                                JMESPath
                            </button>
                            <button
                                onClick={() => setEngine("dot")}
                                className={`px-2 py-1 text-[9px] font-bold rounded transition-all ${engine === 'dot' ? 'bg-purple-500 text-[var(--text-primary)] shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-tertiary)]'}`}
                            >
                                Dot
                            </button>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-surface-elevated)]/50 border border-[var(--border-primary)]/5 text-[10px] font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-300"
                        >
                            {copied ? <FiCheck className="text-emerald-500" size={12} /> : <FiCopy size={12} />}
                            {copied ? 'COPIED' : 'COPY RESULT'}
                        </button>
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 group-focus-within:text-purple-400 transition-colors">
                        <FiFilter size={14} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={engine === 'jmespath' ? "JMESPath Expression (e.g. locations[?state == 'WA'].name)" : "Dot Path (e.g. .data.users.0.name)"}
                        className="w-full bg-[var(--bg-surface-inset)]/40 border border-[var(--border-primary)]/10 rounded-xl py-2.5 pl-11 pr-4 text-xs font-mono text-[var(--text-secondary)] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                        <span className="text-[9px] font-bold text-[var(--text-muted)] bg-[var(--bg-surface-elevated)] px-1.5 py-0.5 rounded border border-[var(--border-primary)]/5">{engine}</span>
                    </div>
                </div>
            </div>

            <div className="flex-grow relative h-full">
                <CodeView data={transformedData} language="json" />
            </div>
        </div>
    );
};

const Placeholder = ({ text }: { text: string }) => (
    <div className="h-full flex items-center justify-center text-zinc-500 bg-[var(--bg-app)] font-sans">
        <div className="text-center">
            <div className="text-5xl font-black opacity-5 mb-3 italic tracking-tighter">TRANSFORM</div>
            <div className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] mb-2">Query Engine Standby</div>
            <div className="text-xs italic">{text}</div>
        </div>
    </div>
);
