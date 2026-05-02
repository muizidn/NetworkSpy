import React, { useMemo, useEffect, useState } from 'react';
import { useTrafficListContext } from "../../../main-content/context/TrafficList";
import { useAppProvider } from "@src/packages/app-env";
import { Traffic } from "@src/models/Traffic";
import { graphqlParsers } from "../Single/GraphQLMode/parsers";
import { ParsedGraphQLItem } from "../Single/GraphQLMode/types";
import { FiBook, FiHash, FiCode, FiLayers, FiActivity, FiCopy, FiCheck, FiChevronRight, FiChevronDown } from "react-icons/fi";
import "./GraphQLDocMode.css";

export const GraphQLDocMode = () => {
    const { selections, trafficSet } = useTrafficListContext();
    const { provider } = useAppProvider();
    const [docs, setDocs] = useState<ParsedGraphQLItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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
            setDocs([]);
            setExpandedIds(new Set());
            return;
        }

        const parseGraphQL = async () => {
            setLoading(true);
            const allDocs: ParsedGraphQLItem[] = [];
            
            for (const item of selectedItems) {
                try {
                    const reqData = await provider.getRequestPairData(item.id);
                    if (!reqData?.body) continue;

                    let bodyJson;
                    const decoder = new TextDecoder();
                    const bodyText = typeof reqData.body === 'string' ? reqData.body : decoder.decode(new Uint8Array(reqData.body));
                    
                    try {
                        bodyJson = JSON.parse(bodyText);
                    } catch {
                        continue;
                    }

                    // Try each parser
                    for (const parser of Object.values(graphqlParsers)) {
                        if (parser.match(item.uri, bodyJson)) {
                            const results = parser.parse(item.uri, bodyJson);
                            results.forEach(res => {
                                allDocs.push({
                                    ...res,
                                    id: `${item.id}-${res.operationName}-${res.type}`
                                } as any);
                            });
                            break; 
                        }
                    }
                } catch (e) {
                    console.error("Error parsing GraphQL for item", item.id, e);
                }
            }

            // De-duplicate by operation name + query content hash or just operation name
            const uniqueDocs = Array.from(new Map(allDocs.map(doc => [doc.operationName + doc.query, doc])).values());
            setDocs(uniqueDocs as any);
            setLoading(false);
        };

        parseGraphQL();
    }, [selectedItems, provider]);

    const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleExpand = (id: string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedIds(next);
    };

    if (selectedItems.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 bg-[#0c0c0c] p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="relative z-10 animate-premium-fade-in max-w-md w-full">
                    <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-10 shadow-2xl shadow-black/50">
                        <div className="w-20 h-20 mb-8 mx-auto rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 flex items-center justify-center border border-white/10 shadow-lg group hover:scale-110 transition-transform duration-500">
                            <FiBook className="text-3xl text-pink-400 group-hover:rotate-12 transition-transform duration-500" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-3 tracking-tight uppercase italic">GraphQL Documentation</h3>
                        <p className="text-[12px] text-zinc-400 leading-relaxed font-medium mb-8">
                            Select multiple network packets to generate a live GraphQL documentation.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <div className="px-4 py-3 rounded-xl bg-black/40 border border-zinc-800/50 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                                <span>Multi-Select</span>
                                <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300">Shift + Click</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#0c0c0c]">
                <div className="w-12 h-12 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mb-4" />
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Analyzing Operations...</div>
            </div>
        );
    }

    if (docs.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 bg-[#0c0c0c] p-8 text-center">
                <FiActivity className="text-4xl mb-4 opacity-20" />
                <p className="text-[11px] font-medium opacity-40">No GraphQL operations detected in selection.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0c0c0c] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 shrink-0 bg-[#0a0a0a]">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.4)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">GraphQL Documentation</span>
                    </div>
                    <div className="h-4 w-px bg-zinc-800 mx-1" />
                    <span className="text-[10px] text-zinc-500 font-medium">
                        {docs.length} Operations Discovered
                    </span>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-grid-pattern">
                <div className="max-w-4xl mx-auto space-y-4">
                    {docs.map((doc: any, idx) => {
                        const id = doc.id || String(idx);
                        const isExpanded = expandedIds.has(id);

                        return (
                            <div key={id} className="bg-zinc-900/40 rounded-xl border border-zinc-800/50 overflow-hidden backdrop-blur-sm group hover:border-pink-500/30 transition-all duration-300 shadow-xl shadow-black/20">
                                {/* Header (Clickable) */}
                                <div 
                                    onClick={() => toggleExpand(id)}
                                    className="flex items-center justify-between px-4 py-3 bg-zinc-900/60 border-b border-zinc-800/20 cursor-pointer hover:bg-zinc-800/40 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {isExpanded ? <FiChevronDown className="text-zinc-500" /> : <FiChevronRight className="text-zinc-500" />}
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                                            doc.type === 'MUTATION' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        }`}>
                                            {doc.type}
                                        </span>
                                        <h4 className="text-xs font-bold text-zinc-100 font-mono tracking-tight">{doc.operationName}</h4>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px]">
                                        <div className="flex items-center gap-1 text-zinc-500">
                                            <FiLayers size={10} />
                                            <span>Depth {doc.depth}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content (Conditional) */}
                                {isExpanded && (
                                    <div className="p-4 space-y-4 animate-premium-fade-in">
                                        {/* Query */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                                    <FiCode className="text-pink-400" />
                                                    Operation
                                                </div>
                                                <button 
                                                    onClick={(e) => handleCopy(doc.query, id + '-q', e)}
                                                    className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-zinc-100"
                                                >
                                                    {copiedId === id + '-q' ? <FiCheck className="text-green-500" /> : <FiCopy size={12} />}
                                                </button>
                                            </div>
                                            <pre className="bg-black/40 p-4 rounded-lg border border-zinc-800/50 text-[11px] text-zinc-300 font-mono leading-relaxed overflow-x-auto">
                                                {doc.query}
                                            </pre>
                                        </div>

                                        {/* Variables Example */}
                                        {doc.variables && doc.variables !== "{}" && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                                        <FiActivity className="text-blue-400" />
                                                        Example Variables
                                                    </div>
                                                    <button 
                                                        onClick={(e) => handleCopy(doc.variables, id + '-v', e)}
                                                        className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-zinc-100"
                                                    >
                                                        {copiedId === id + '-v' ? <FiCheck className="text-green-500" /> : <FiCopy size={12} />}
                                                    </button>
                                                </div>
                                                <pre className="bg-black/40 p-4 rounded-lg border border-zinc-800/50 text-[11px] text-zinc-400 font-mono leading-relaxed overflow-x-auto">
                                                    {doc.variables}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
