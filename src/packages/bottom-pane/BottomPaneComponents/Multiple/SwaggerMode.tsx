import React, { useMemo, useEffect, useState } from 'react';
import { useTrafficListContext } from "../../../main-content/context/TrafficList";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "./SwaggerMode.css";
import { useAppProvider } from "@src/packages/app-env";
import { FiCopy, FiCheck, FiDownload } from "react-icons/fi";
import { Traffic } from "@src/models/Traffic";

export const SwaggerMode = () => {
    const { selections, trafficSet } = useTrafficListContext();
    const { provider } = useAppProvider();
    const [spec, setSpec] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const selectedIdsStr = useMemo(() => {
        const items = selections.others || [];
        const firstId = selections.firstSelected?.id;
        if (items.length === 0 && firstId) return String(firstId);
        return items.map(item => String(item.id)).sort().join(',');
    }, [selections.others, selections.firstSelected]);

    const selectedItems = useMemo<Traffic[]>(() => {
        if (!selectedIdsStr) return [];
        const ids = selectedIdsStr.split(',');
        return ids.map(id => {
            const latest = trafficSet[id];
            if (latest) return latest;
            if (selections.firstSelected && String(selections.firstSelected.id) === id) return selections.firstSelected;
            return selections.others?.find(o => String(o.id) === id);
        }).filter((item): item is Traffic => !!item);
    }, [selectedIdsStr]);

    useEffect(() => {
        if (selectedItems.length === 0) {
            setSpec(null);
            return;
        }

        const generateSpec = async () => {
            const paths: any = {};

            for (const item of selectedItems) {
                try {
                    const urlStr = item.uri;
                    if (!urlStr) continue;

                    const url = new URL(urlStr);
                    const path = url.pathname || "/";
                    const method = (item.method || 'GET').toLowerCase();

                    if (!paths[path]) {
                        paths[path] = {};
                    }

                    // Get request/response data
                    const reqData = await provider.getRequestPairData(item.id);
                    const resData = await provider.getResponsePairData(item.id);

                    // Infer schema from body example
                    const reqBodyParsed = tryParseJSON(reqData?.body);
                    const resBodyParsed = tryParseJSON(resData?.body);

                    paths[path][method] = {
                        summary: `${item.method} ${path}`,
                        tags: [url.hostname],
                        description: `Traffic captured from ${url.hostname} on ${new Date(item.timestamp || Date.now()).toLocaleString()}`,
                        responses: {
                            [item.response?.status_code || 200]: {
                                description: "Successful response",
                                content: resBodyParsed ? {
                                    "application/json": {
                                        example: resBodyParsed
                                    }
                                } : undefined
                            }
                        },
                        parameters: url.searchParams.toString() ? Array.from(url.searchParams.entries()).map(([name, value]) => ({
                            name,
                            in: 'query',
                            schema: { type: 'string' },
                            example: value
                        })) : undefined,
                        requestBody: reqBodyParsed ? {
                            content: {
                                "application/json": {
                                    example: reqBodyParsed
                                }
                            }
                        } : undefined
                    };
                } catch (e) {
                    console.error("Error generating spec for item", item?.id, e);
                }
            }

            setSpec({
                openapi: "3.0.0",
                info: {
                    title: "Captured Traffic API",
                    version: "1.0.0",
                    description: "API specification generated from captured network traffic."
                },
                paths
            });
        };

        generateSpec();
    }, [selectedItems, provider]);

    const handleCopy = () => {
        if (!spec) return;
        navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!spec) return;
        const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `api-spec-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (selectedItems.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 bg-[var(--bg-app)] p-8 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="relative z-10 animate-premium-fade-in max-w-md w-full">
                    <div className="bg-[var(--bg-surface)]/40 backdrop-blur-xl border border-[var(--border-primary)]/50 rounded-3xl p-10 shadow-2xl shadow-black/50">
                        <div className="w-20 h-20 mb-8 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-indigo-500/20 flex items-center justify-center border border-white/10 shadow-lg group hover:scale-110 transition-transform duration-500">
                            <FiDownload className="text-3xl text-blue-400 group-hover:-translate-y-1 transition-transform duration-500" />
                        </div>
                        <h3 className="text-xl font-black text-[var(--text-primary)] mb-3 tracking-tight uppercase italic">Swagger API Viewer</h3>
                        <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed font-medium mb-8">
                            Automatically generate OpenAPI 3.0 specifications from captured traffic.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <div className="px-4 py-3 rounded-xl bg-[var(--bg-surface-inset)]/40 border border-[var(--border-primary)]/50 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center justify-between">
                                <span>Multi-Select</span>
                                <span className="px-2 py-1 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]">Shift + Click</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!spec) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[var(--bg-app)]">
                <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Generating Specification...</div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[var(--bg-app)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)] shrink-0 bg-[var(--bg-sidebar)]">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">OpenAPI 3.0</span>
                    </div>
                    <div className="h-4 w-px bg-[var(--border-primary)] mx-1" />
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        {Object.keys(spec.paths).length} Endpoints
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface-inset)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-lg text-[10px] font-bold transition-all border border-[var(--border-primary)]"
                    >
                        <FiDownload />
                        DOWNLOAD
                    </button>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] rounded-lg text-[10px] font-bold transition-all shadow-lg shadow-blue-900/20"
                    >
                        {copied ? <FiCheck /> : <FiCopy />}
                        {copied ? "COPIED" : "COPY JSON"}
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-auto swagger-dark-theme custom-scrollbar">
                <SwaggerUI spec={spec} />
            </div>
        </div>
    );
};

const tryParseJSON = (body: any) => {
    if (!body) return undefined;
    let text = "";
    if (typeof body !== 'string') {
        const decoder = new TextDecoder();
        try {
            text = decoder.decode(new Uint8Array(body));
        } catch {
            return undefined;
        }
    } else {
        text = body;
    }
    try {
        return JSON.parse(text);
    } catch {
        return undefined;
    }
};
