import React, { useMemo, useEffect, useState } from 'react';
import { useTrafficListContext } from "../../../main-content/context/TrafficList";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "./SwaggerMode.css";
import { useAppProvider } from "@src/packages/app-env";
import { FiCopy, FiCheck, FiDownload } from "react-icons/fi";

export const SwaggerMode = () => {
    const { selections, trafficSet } = useTrafficListContext();
    const { provider } = useAppProvider();
    const [spec, setSpec] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const selectedItems = useMemo(() => {
        const items = selections.others || [];
        if (items.length === 0 && selections.firstSelected) {
            return [selections.firstSelected];
        }
        return items.map(item => trafficSet[item.id as string] || item);
    }, [selections.others, selections.firstSelected, trafficSet]);

    useEffect(() => {
        if (selectedItems.length === 0) {
            setSpec(null);
            return;
        }

        const generateSpec = async () => {
            const paths: any = {};
            
            for (const item of selectedItems) {
                try {
                    const urlStr = item.url || item.uri;
                    if (!urlStr) continue;

                    const url = new URL(urlStr);
                    const path = url.pathname || "/";
                    const method = (item.method || 'GET').toLowerCase();

                    if (!paths[path]) {
                        paths[path] = {};
                    }

                    // Get request/response data
                    const reqData = await provider.getRequestPairData(item.id as string);
                    const resData = await provider.getResponsePairData(item.id as string);

                    // Infer schema from body example
                    const reqBodyParsed = tryParseJSON(reqData?.body);
                    const resBodyParsed = tryParseJSON(resData?.body);

                    paths[path][method] = {
                        summary: `${item.method} ${path}`,
                        tags: [url.hostname],
                        description: `Traffic captured from ${url.hostname} on ${new Date(item.timestamp || Date.now()).toLocaleString()}`,
                        responses: {
                            [item.status || 200]: {
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
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 bg-[#0c0c0c] p-8 text-center">
                <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/5 shadow-2xl">
                    <FiDownload className="text-3xl text-blue-400 opacity-50" />
                </div>
                <h3 className="text-lg font-bold text-zinc-200 mb-2">Swagger API Viewer</h3>
                <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
                    Select multiple network requests to automatically generate a complete Swagger/OpenAPI specification.
                </p>
                <div className="mt-8 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">Shift + Click</span>
                    <span className="text-[10px] text-zinc-600">to select multiple</span>
                </div>
            </div>
        );
    }

    if (!spec) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#0c0c0c]">
                <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Generating Specification...</div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0c0c0c] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 shrink-0 bg-[#0a0a0a]">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">OpenAPI 3.0</span>
                    </div>
                    <div className="h-4 w-px bg-zinc-800 mx-1" />
                    <span className="text-[10px] text-zinc-500 font-medium">
                        {Object.keys(spec.paths).length} Endpoints
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] font-bold transition-all border border-zinc-800"
                    >
                        <FiDownload />
                        DOWNLOAD
                    </button>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-lg shadow-blue-900/20"
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
