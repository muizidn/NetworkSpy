import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useAppProvider } from "@src/packages/app-env";
import { useTrafficListContext } from "../../../main-content/context/TrafficList";
import { ResponsePairData } from "../../ResponseTab";
import { FiVideo, FiFileText, FiChevronDown, FiChevronRight, FiMaximize, FiMinimize, FiLoader, FiAlertCircle } from "react-icons/fi";

interface VideoMeta {
  duration: number;
  width: number;
  height: number;
  bitrate: number;
  fileSize: number;
  format: string;
}

export const VideoViewerMode = () => {
  const { provider } = useAppProvider();
  const { selections } = useTrafficListContext();
  const trafficId = useMemo(() => selections.firstSelected?.id as string, [selections]);
  const [data, setData] = useState<ResponsePairData | null>(null);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [showMeta, setShowMeta] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const blobUrl = useMemo(() => {
    if (!data?.body || data.body.length === 0) return "";
    const ct = data.content_type || "video/mp4";
    const blob = new Blob([data.body], { type: ct });
    return URL.createObjectURL(blob);
  }, [data]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  useEffect(() => {
    if (!trafficId) return;
    setLoading(true);
    setMeta(null);
    provider.getResponsePairData(trafficId)
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, [trafficId, provider]);

  const onLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video || !data?.body) return;
    const dur = video.duration && isFinite(video.duration) ? video.duration : 0;
    const w = video.videoWidth || 0;
    const h = video.videoHeight || 0;
    const fileSize = data.body.byteLength;
    const bitrate = dur > 0 ? Math.round((fileSize * 8) / dur / 1000) : 0;
    setMeta({
      duration: dur,
      width: w,
      height: h,
      bitrate,
      fileSize,
      format: data.content_type || "video/mp4",
    });
  }, [data]);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      await container.requestFullscreen();
      setIsFullscreen(true);
    }
  }, []);

  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  const toggleMeta = useCallback(() => {
    setShowMeta(prev => !prev);
  }, []);

  if (!trafficId) return <Placeholder text="Select a request to view video" />;
  if (loading) return <Placeholder text="Loading video..." />;

  const isVideo =
    data?.content_type?.toLowerCase().includes("video") ||
    data?.content_type?.toLowerCase().includes("mpegurl");

  const hasBody = data?.body && data.body.length > 0;

  if (!isVideo) {
    return (
      <div className="bg-[#050505] flex flex-col items-center justify-center p-12 min-h-full">
        <div className="text-rose-500/80 text-xs font-medium bg-rose-500/5 px-4 py-2 rounded-full border border-rose-500/10">
          Response is not a video stream ({data?.content_type || "Unknown Type"})
        </div>
      </div>
    );
  }

  if (!hasBody) {
    return (
      <div className="bg-[#050505] flex flex-col items-center justify-center p-12 min-h-full">
        <div className="text-amber-500/80 text-xs font-medium bg-amber-500/5 px-4 py-2 rounded-full border border-amber-500/10">
          Video body is empty
        </div>
      </div>
    );
  }

  const codec = inferCodec(data?.content_type || "");

  return (
    <div className="bg-[#050505] flex flex-col p-4 @sm:p-6 min-h-full">
      <div className="flex-grow flex flex-col max-w-4xl mx-auto w-full">
        <div
          ref={containerRef}
          className="aspect-video bg-black rounded-2xl border border-white/5 relative overflow-hidden group shadow-2xl"
        >
          <video
            ref={videoRef}
            src={blobUrl}
            className="absolute inset-0 w-full h-full object-contain"
            controls
            preload="metadata"
            onLoadedMetadata={onLoadedMetadata}
            playsInline
          />

          <button
            onClick={toggleFullscreen}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-md border bg-black/40 border-zinc-700/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-all opacity-0 group-hover:opacity-100"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <FiMinimize size={14} /> : <FiMaximize size={14} />}
          </button>
        </div>

        <div className="mt-4">
          <CollapseSection
            icon={<FiFileText size={11} />}
            label="Video Info"
            isOpen={showMeta}
            onToggle={toggleMeta}
          >
            {meta ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <MetaItem label="Format" value={meta.format} />
                <MetaItem label="Codec" value={codec} />
                {meta.width > 0 && meta.height > 0 && (
                  <MetaItem label="Resolution" value={`${meta.width} × ${meta.height}`} />
                )}
                <MetaItem label="Duration" value={formatTime(meta.duration)} />
                {meta.bitrate > 0 && (
                  <MetaItem label="Bitrate" value={`${meta.bitrate} kbps`} />
                )}
                <MetaItem label="File Size" value={formatSize(meta.fileSize)} />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 py-2">
                <FiLoader size={11} className="animate-spin" />
                Waiting for metadata...
              </div>
            )}
          </CollapseSection>
        </div>
      </div>
    </div>
  );
};

const CollapseSection = ({
  icon,
  label,
  isOpen,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-zinc-400 tracking-widest hover:text-zinc-200 transition-colors bg-zinc-900/50"
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {isOpen ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
    </button>
    {isOpen && (
      <div className="px-3 py-2 space-y-1 border-t border-zinc-800/30">
        {children}
      </div>
    )}
  </div>
);

const MetaItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between items-center py-0.5">
    <span className="text-[10px] text-zinc-600">{label}</span>
    <span className="text-[10px] font-mono text-zinc-300 truncate ml-3 max-w-[160px]" title={String(value)}>
      {String(value)}
    </span>
  </div>
);

function inferCodec(contentType: string): string {
  const ct = contentType.toLowerCase();
  if (ct.includes("mp4") || ct.includes("mpeg")) return "H.264 / AAC";
  if (ct.includes("webm")) return "VP8 / VP9";
  if (ct.includes("ogg") || ct.includes("ogv")) return "Theora / Vorbis";
  if (ct.includes("quicktime") || ct.includes("mov")) return "H.264 / ProRes";
  if (ct.includes("x-msvideo") || ct.includes("avi")) return "MPEG-4 / MJPEG";
  if (ct.includes("x-matroska") || ct.includes("mkv")) return "H.264 / HEVC";
  if (ct.includes("mpegurl") || ct.includes("m3u8")) return "HLS (m3u8)";
  if (ct.includes("mp2t") || ct.includes("ts")) return "MPEG-TS";
  return "Unknown";
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const Placeholder = ({ text }: { text: string }) => (
  <div className="h-full flex items-center justify-center text-zinc-500 bg-[#050505]">
    <div className="text-center">
      <div className="text-4xl font-black opacity-10 mb-2 italic tracking-tighter">CINEMA</div>
      <div className="text-sm">{text}</div>
    </div>
  </div>
);
