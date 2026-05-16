import { useState } from "react";
import { useTrafficListContext } from "./context/TrafficList";
import { twMerge } from "tailwind-merge";
import { FiExternalLink, FiGlobe, FiClock, FiBox, FiShield, FiLock, FiChevronRight, FiChevronDown } from "react-icons/fi";
import { useTagContext } from "@src/context/TagContext";
import { getHttpStatusInfo } from "@src/utils/httpStatusCodes";
import { useSetAtom } from "jotai";
import { statusInfoDialogAtom } from "@src/utils/trafficAtoms";



const CustomTag = ({ tagName }: { tagName: string }) => {
  const { tags } = useTagContext();
  const tagModel = tags.find(t => t.tag === tagName);

  return (
    <div
      className='px-2 py-0.5 rounded-full border border-current text-[10px] font-bold leading-none transition-colors cursor-default opacity-90'
      style={{
        color: tagModel?.color || '#60a5fa',
        backgroundColor: tagModel?.bgColor || '#3b82f61a',
        borderColor: `${tagModel?.color || '#60a5fa'}33`
      }}
    >
      {tagName}
    </div>
  );
};

const UrlColorizer = ({ url, intercepted }: { url: string; intercepted?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!url) return null;

  const isLong = url.length > 100;

  try {
    const urlObj = new URL(url);
    const params = Array.from(urlObj.searchParams.entries());
    const displayParams = isLong && !isExpanded ? params.slice(0, 3) : params;

    // Determine if protocol should be red (not SSL)
    const isInsecure = urlObj.protocol === 'http:' || urlObj.protocol === 'ws:';
    
    // Determine if port should be hidden
    const isDefaultPort = 
      (urlObj.port === '443' && (urlObj.protocol === 'https:' || urlObj.protocol === 'wss:')) ||
      (urlObj.port === '80' && (urlObj.protocol === 'http:' || urlObj.protocol === 'ws:'));

    return (
      <div className="font-mono text-[13px] leading-relaxed break-words select-text">
        {isLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={twMerge(
              "inline-flex items-center justify-center w-5 h-5 mr-1 bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-inset)] rounded transition-colors align-middle text-[var(--text-secondary)] group relative",
              !isExpanded && "animate-button-pulse border border-purple-500/30"
            )}
            title={isExpanded ? "Collapse URL" : "Expand URL"}
          >
            {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
          </button>
        )}

        {intercepted && (
          <FiShield
            size={12}
            className="inline mr-1 text-purple-400 align-middle"
            title="Intercepted (Decrypted)"
          />
        )}

        <span className={twMerge(
          "font-bold",
          isInsecure ? "text-red-500" : "text-[var(--text-muted)]"
        )}>
          {urlObj.protocol}//
        </span>

        <button
          onClick={() => window.open(url, "_blank")}
          className="inline items-center gap-1 text-blue-400 font-bold hover:underline hover:text-blue-300 transition-colors group"
          title="Open in Browser"
        >
          {urlObj.hostname}

          {urlObj.port && !isDefaultPort && (
            <span className="text-[var(--text-muted)]">:{urlObj.port}</span>
          )}

          <FiExternalLink
            size={10}
            className="inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </button>

        <span className="text-[var(--text-secondary)]">
          {isLong && !isExpanded ? urlObj.pathname.substring(0, 30) + (urlObj.pathname.length > 30 ? "..." : "") : urlObj.pathname}
        </span>

        {displayParams.length > 0 && (
          <>
            <span className="text-[var(--text-muted)]">?</span>

            {displayParams.map(([key, value], i) => (
              <span key={i}>
                <span className="text-orange-400">{key}</span>
                <span className="text-[var(--text-muted)]">=</span>
                <span className="text-green-400">
                  {isLong && !isExpanded ? value.substring(0, 20) + (value.length > 20 ? "..." : "") : value}
                </span>

                {i < displayParams.length - 1 && (
                  <span className="text-[var(--text-muted)]">&</span>
                )}
              </span>
            ))}
            
            {isLong && !isExpanded && params.length > 3 && (
              <span className="text-[var(--text-muted)] ml-1">...(+{params.length - 3} more)</span>
            )}
          </>
        )}
      </div>
    );
  } catch {
    // Fallback for non-standard URLs (like CONNECT host:port)
    let processedUrl = url;
    
    // Remove :443 or :80 from the end or before a slash
    processedUrl = processedUrl.replace(/:443(\/|$)/, '$1');
    processedUrl = processedUrl.replace(/:80(\/|$)/, '$1');

    const isLongProcessed = processedUrl.length > 100;
    const displayUrl = isLongProcessed && !isExpanded ? `${processedUrl.substring(0, 100)}...` : processedUrl;
    
    // Check if it starts with http:// or ws:// for red coloring
    const isInsecure = processedUrl.startsWith('http://') || processedUrl.startsWith('ws://');
    const protocolMatch = processedUrl.match(/^(http:\/\/|ws:\/\/)/);
    const restOfUrl = protocolMatch ? processedUrl.substring(protocolMatch[0].length) : processedUrl;

    return (
      <div className="font-mono text-[13px] leading-relaxed break-words select-text flex items-start group">
        {isLongProcessed && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={twMerge(
              "flex-shrink-0 inline-flex items-center justify-center w-5 h-5 mr-1 bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-inset)] rounded transition-colors align-middle text-[var(--text-secondary)] mt-0.5",
              !isExpanded && "animate-button-pulse border border-purple-500/30"
            )}
            title={isExpanded ? "Collapse URL" : "Expand URL"}
          >
            {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
          </button>
        )}
        <div className="text-[var(--text-secondary)]">
          {protocolMatch && (
            <span className={twMerge("font-bold", isInsecure ? "text-red-500" : "text-[var(--text-muted)]")}>
              {protocolMatch[0]}
            </span>
          )}
          {isLongProcessed && !isExpanded ? restOfUrl.substring(0, 100) + (restOfUrl.length > 100 ? "..." : "") : restOfUrl}
        </div>
      </div>
    );
  }
};

const InfoTag = ({ icon: Icon, label, value, className }: { icon?: any, label?: string, value: string | number, className?: string }) => (
  <div className={twMerge("flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[var(--border-primary)] bg-[var(--bg-surface-inset)]/50 text-[10px] whitespace-nowrap", className)}>
    {Icon && <Icon size={10} className="text-[var(--text-muted)]" />}
    {label && <span className="text-[var(--text-muted)] font-medium">{label}:</span>}
    <span className="text-[var(--text-secondary)] font-bold uppercase tracking-wide">{value}</span>
  </div>
);

export const SelectionViewer = () => {
  const { selections, trafficList, setTrafficList } = useTrafficListContext();
  const setStatusDialog = useSetAtom(statusInfoDialogAtom);
  const selected = selections.firstSelected;

  if (!selected) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-muted)] italic text-[12px] p-4 bg-[var(--bg-app)] border-t border-[var(--border-primary)]">
        Select a request to view details
      </div>
    );
  }

  const tags = selected.tags as string[] || [];
  const url = selected.url as string || '';
  const method = selected.method as string || '';
  const code = selected.code as string || '';
  const status = selected.status as string || '';
  const time = selected.time as string || '';
  const duration = selected.duration as string || '';

  const statusInfo = getHttpStatusInfo(code);


  const getCodeColor = (code: string) => {
    if (code.startsWith('2')) return 'bg-green-500/10 border-green-500/20 text-green-400';
    if (code.startsWith('3')) return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    if (code.startsWith('4')) return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
    if (code.startsWith('5')) return 'bg-red-500/10 border-red-500/20 text-red-400';
    return 'bg-[var(--bg-surface-elevated)] border-[var(--border-primary)] text-[var(--text-secondary)]';
  };

  const breakpointRule = tags.find(t => t.startsWith('BREAKPOINT: '))?.replace('BREAKPOINT: ', '');
  const modificationTags = tags.filter(t => t.startsWith('BREAKPOINT_'));
  const isModified = modificationTags.length > 0;

  return (
    <div className='flex flex-col border-t border-[var(--border-primary)] w-full bg-[var(--bg-app)] shadow-2xl'>
      {/* Modification Banner */}
      {isModified && (
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-blue-500/30 px-3 py-2 flex items-center justify-between group overflow-hidden relative">
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
              <FiShield size={10} />
              Modified
            </div>
            <div className="flex flex-col">
              <div className="text-[10px] text-blue-100 font-bold flex items-center gap-1.5">
                Rule: <span className="text-white bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-500/30">{breakpointRule || "Manual"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 relative z-10 overflow-x-auto no-scrollbar max-w-[50%]">
            {modificationTags.map((tag) => (
              <span key={tag} className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded border border-blue-400/20 bg-blue-500/10 text-blue-300 whitespace-nowrap">
                {tag.replace('BREAKPOINT_', '').replace('_CHANGED', '').replace('REQ_', '').replace('RES_', '')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* URL Section */}
      <div id='url-viewer' className='border-b border-[var(--border-primary)]/50 w-full p-3 bg-[var(--bg-surface-inset)]/40'>
        <UrlColorizer url={url} intercepted={selected.intercepted as boolean} />
      </div>

      {/* Tags Section */}
      <div className='flex flex-wrap items-center gap-2 p-2 bg-[var(--bg-surface)] min-h-[36px] px-3'>
        {/* Method Tag */}
        <div className={twMerge(
          "px-2 py-0.5 rounded text-[10px] font-black tracking-tighter border",
          method === 'GET' ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' :
            method === 'POST' ? 'bg-green-600/10 border-green-500/20 text-green-400' :
              method === 'PUT' ? 'bg-orange-600/10 border-orange-500/20 text-orange-400' :
                method === 'DELETE' ? 'bg-red-600/10 border-red-500/20 text-red-400' :
                  'bg-[var(--bg-surface-elevated)] border-[var(--border-primary)] text-[var(--text-secondary)]'
        )}>
          {method}
        </div>

        {/* Status Code Tag */}
        {code && (
          <div 
            className={twMerge(
              "px-2 py-0.5 rounded text-[10px] font-bold border cursor-help transition-all hover:brightness-110 flex items-center gap-1.5 active:scale-95 select-none", 
              getCodeColor(code)
            )}
            title={statusInfo?.description || status}
            onClick={() => setStatusDialog({ isOpen: true, code })}
          >
            <span className="font-black">{code}</span>
            <span className="opacity-70 font-medium">{statusInfo?.message || status}</span>
          </div>
        )}



        {/* Latency & Size Tags */}
        <div className="flex items-center gap-2 border-l border-[var(--border-primary)] ml-1 pl-3">
          {time && <InfoTag icon={FiClock} value={time} />}
          {duration && <InfoTag icon={FiBox} value={duration} />}
        </div>

        {/* Divider */}
        {tags.length > 0 && <div className="h-3 w-[1px] bg-[var(--border-primary)] mx-1" />}

        {/* Custom Tags */}
        {tags.map((e, i) => (
          <CustomTag key={i} tagName={e} />
        ))}
      </div>
    </div>
  );
};
