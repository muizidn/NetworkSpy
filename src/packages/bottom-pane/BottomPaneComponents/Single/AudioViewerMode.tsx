import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useAppProvider } from "@src/packages/app-env";
import { useTrafficListContext } from "../../../main-content/context/TrafficList";
import { ResponsePairData } from "../../ResponseTab";
import { FiMusic, FiPlay, FiPause, FiChevronDown, FiChevronRight, FiFileText, FiLoader, FiAlertCircle } from "react-icons/fi";

interface AudioMeta {
  duration: number;
  sampleRate: number;
  channels: number;
  bitrate: number;
  fileSize: number;
  format: string;
}

export const AudioViewerMode = () => {
  const { provider } = useAppProvider();
  const { selections } = useTrafficListContext();
  const trafficId = useMemo(() => selections.firstSelected?.id as string, [selections]);
  const [data, setData] = useState<ResponsePairData | null>(null);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<AudioMeta | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [showMeta, setShowMeta] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const blobUrl = useMemo(() => {
    if (!data?.body || data.body.length === 0) return "";
    const ct = data.content_type || "audio/mpeg";
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
    setMetaError(null);
    provider.getResponsePairData(trafficId)
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, [trafficId, provider]);

  const extractMeta = useCallback(async (body: Uint8Array, contentType: string) => {
    setMetaLoading(true);
    setMetaError(null);
    try {
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const audioBuffer = await ctx.decodeAudioData(body.buffer.slice(0));
      const dur = audioBuffer.duration;
      const fileSize = body.byteLength;
      const bitrate = dur > 0 ? Math.round((fileSize * 8) / dur / 1000) : 0;
      setMeta({
        duration: dur,
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels,
        bitrate,
        fileSize,
        format: contentType,
      });
      setDuration(dur);
      ctx.close();
    } catch (err) {
      setMetaError("Could not decode audio metadata");
      setMeta({
        duration: 0,
        sampleRate: 0,
        channels: 0,
        bitrate: 0,
        fileSize: body.byteLength,
        format: contentType,
      });
    } finally {
      setMetaLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!data?.body || data.body.length === 0) return;
    const ct = (data.content_type || "").toLowerCase();
    if (!ct.includes("audio")) return;
    extractMeta(data.body, data.content_type || "audio/mpeg");
  }, [data, extractMeta]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const onTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) setCurrentTime(audio.currentTime);
  }, []);

  const onLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }
  }, []);

  const onPlay = useCallback(() => setPlaying(true), []);
  const onPause = useCallback(() => setPlaying(false), []);
  const onEnded = useCallback(() => setPlaying(false), []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  }, [duration]);

  const toggleSection = useCallback(() => {
    setShowMeta(prev => !prev);
  }, []);

  if (!trafficId) return <Placeholder text="Select a request to play audio" />;
  if (loading) return <Placeholder text="Loading audio stream..." />;

  const isAudio = data?.content_type?.toLowerCase().includes("audio");
  const hasBody = data?.body && data.body.length > 0;

  if (!isAudio) {
    return (
      <div className="bg-[#0a0a0a] flex flex-col items-center justify-center p-12 min-h-full">
        <div className="text-rose-500/80 text-xs font-medium bg-rose-500/5 px-4 py-2 rounded-full border border-rose-500/10">
          Response is not an audio stream ({data?.content_type || "Unknown Type"})
        </div>
      </div>
    );
  }

  if (!hasBody) {
    return (
      <div className="bg-[#0a0a0a] flex flex-col items-center justify-center p-12 min-h-full">
        <div className="text-amber-500/80 text-xs font-medium bg-amber-500/5 px-4 py-2 rounded-full border border-amber-500/10">
          Audio body is empty
        </div>
      </div>
    );
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-[#0a0a0a] flex flex-col min-h-full">
      <div className="flex-grow flex flex-col items-center justify-center p-6 @sm:p-10">
        <div className="max-w-lg w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 @sm:p-8 flex flex-col items-center shadow-2xl">
          <div className="w-16 h-16 @sm:w-20 @sm:h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
            <FiMusic className="text-blue-500" size={32} />
          </div>

          <h3 className="text-sm font-bold text-white mb-1">Audio Stream</h3>
          <p className="text-[10px] text-zinc-500 mb-6 tracking-widest">{data?.content_type || "Unknown Format"}</p>

          <audio
            ref={audioRef}
            src={blobUrl}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
            preload="metadata"
          />

          <div className="w-full flex flex-col gap-3">
            <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-9 h-9 @sm:w-10 @sm:h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40 hover:scale-105 hover:bg-blue-500 transition-all flex-shrink-0"
              >
                {playing ? (
                  <FiPause className="text-white fill-current" size={16} />
                ) : (
                  <FiPlay className="text-white fill-current ml-0.5" size={16} />
                )}
              </button>

              <div className="flex-grow">
                <div
                  className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden cursor-pointer group"
                  onClick={seek}
                >
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-100"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[9px] font-mono text-zinc-500 tracking-tighter">
                    {formatTime(currentTime)}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 tracking-tighter">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[9px] text-zinc-600 text-center italic truncate">
              {selections.firstSelected?.url
                ? new URL(selections.firstSelected.url as string).hostname
                : "Unknown source"}
            </p>

            <CollapseSection
              icon={<FiFileText size={11} />}
              label="Metadata"
              isOpen={showMeta}
              onToggle={toggleSection}
            >
              {metaLoading ? (
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 py-2">
                  <FiLoader size={11} className="animate-spin" />
                  Decoding metadata...
                </div>
              ) : metaError && !meta ? (
                <div className="flex items-center gap-2 text-[10px] text-amber-400 py-2">
                  <FiAlertCircle size={11} />
                  {metaError}
                </div>
              ) : meta ? (
                <>
                  <MetaItem label="Format" value={meta.format} />
                  <MetaItem label="Duration" value={formatTime(meta.duration)} />
                  <MetaItem label="Sample Rate" value={`${(meta.sampleRate / 1000).toFixed(1)} kHz`} />
                  <MetaItem
                    label="Channels"
                    value={meta.channels === 1 ? "Mono" : meta.channels === 2 ? "Stereo" : `${meta.channels} ch`}
                  />
                  {meta.bitrate > 0 && (
                    <MetaItem label="Bitrate" value={`${meta.bitrate} kbps`} />
                  )}
                  <MetaItem label="File Size" value={formatSize(meta.fileSize)} />
                </>
              ) : (
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 py-2">
                  <FiAlertCircle size={11} />
                  No metadata available
                </div>
              )}
            </CollapseSection>
          </div>
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
  <div className="border border-zinc-800/50 rounded-lg overflow-hidden w-full">
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
  <div className="h-full flex items-center justify-center text-zinc-500 bg-[#0a0a0a]">
    <div className="text-center">
      <div className="text-4xl font-black opacity-10 mb-2 italic">AUDIO</div>
      <div className="text-sm">{text}</div>
    </div>
  </div>
);
