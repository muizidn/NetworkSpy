import { useEffect, useState, useMemo } from "react";
import { useAppProvider } from "@src/packages/app-env";
import { useTrafficListContext } from "../../../main-content/context/TrafficList";
import { ResponsePairData } from "../../ResponseTab";
import { FiVideo, FiMaximize, FiSettings, FiActivity } from "react-icons/fi";

export const VideoViewerMode = () => {
    const { provider } = useAppProvider();
    const { selections } = useTrafficListContext();
    const trafficId = useMemo(() => selections.firstSelected?.id as string, [selections]);
    const [data, setData] = useState<ResponsePairData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!trafficId) return;
        setLoading(true);
        provider.getResponsePairData(trafficId)
            .then((res) => setData(res))
            .finally(() => setLoading(false));
    }, [trafficId, provider]);

    if (!trafficId) return <Placeholder text="Select a request to view video" />;
    if (loading) return <Placeholder text="Syncing video segments..." />;

    const isVideo = data?.content_type?.toLowerCase().includes('video') || data?.content_type?.toLowerCase().includes('mpegurl')

    return (
        <div className="bg-[var(--bg-app)] flex flex-col p-4 @sm:p-6 min-h-full">
            <div className="flex-grow flex flex-col max-w-4xl mx-auto w-full">
                {/* Video Stage */}
                <div className="aspect-video bg-[var(--bg-surface-inset)] rounded-2xl border border-[var(--border-primary)]/5 relative overflow-hidden group shadow-2xl">
                    {isVideo ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-surface)]/40">
                            <FiActivity className="text-blue-500 animate-pulse" size={48} />
                            <div className="absolute bottom-0 left-0 right-0 p-4 @sm:p-6 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                        <span className="text-xs font-black text-[var(--text-primary)] tracking-widest">Live Stream</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[var(--text-tertiary)]">
                                        <FiSettings size={14} className="hover:text-[var(--text-primary)] cursor-pointer" />
                                        <FiMaximize size={14} className="hover:text-[var(--text-primary)] cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <FiVideo className="text-[var(--text-muted)] mb-4" size={48} />
                            <span className="text-[var(--text-muted)] text-xs font-medium">Valid video stream not found</span>
                        </div>
                    )}
                </div>

                {/* Metadata & Stats */}
                <div className="mt-6 flex gap-4">
                    <div className="flex-grow bg-[var(--bg-surface)]/40 border border-[var(--border-primary)]/50 rounded-xl p-4">
                        <h3 className="text-[10px] font-bold text-[var(--text-muted)] mb-2 tracking-widest">Stream Info</h3>
                        <div className="grid grid-cols-2 gap-y-2">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-[var(--text-muted)] font-bold">Format</span>
                                <span className="text-[11px] text-[var(--text-secondary)]">{data?.content_type || 'HLS (m3u8)'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-[var(--text-muted)] font-bold">Bitrate</span>
                                <span className="text-[11px] text-[var(--text-secondary)]">4.2 Mbps (Simulated)</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-56 bg-[var(--bg-surface)]/40 border border-[var(--border-primary)]/50 rounded-xl p-4 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            BUFFER HEALTHY
                        </span>
                        <div className="h-1 w-full bg-[var(--bg-surface-inset)] rounded-full overflow-hidden">
                            <div className="h-full w-4/5 bg-emerald-500/50" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Placeholder = ({ text }: { text: string }) => (
    <div className="h-full flex items-center justify-center text-[var(--text-muted)] bg-[var(--bg-app)]">
        <div className="text-center">
            <div className="text-4xl font-black opacity-10 mb-2 italic tracking-tighter">CINEMA</div>
            <div className="text-sm">{text}</div>
        </div>
    </div>
);
