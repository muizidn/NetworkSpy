import React from "react";
import { twMerge } from "tailwind-merge";
import { FiLock, FiUnlock, FiShield, FiCheckCircle, FiGlobe, FiCpu, FiMonitor, FiSmartphone, FiTablet } from "react-icons/fi";

interface NotInterceptedModeProps {
    domain: string;
    isAdded: boolean;
    isIntercepting: boolean;
    handleIntercept: () => void;
    clientName?: string;
    onInterceptClient: (name: string) => void;
}

const TrafficLightIndicator = () => (
    <div className="flex gap-1 absolute -top-2 -right-2 bg-[var(--bg-surface-inset)]/50 backdrop-blur-sm p-1.5 rounded-full border border-[var(--border-primary)]/50 shadow-xl">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-traffic-red" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/40 shadow-[0_0_8px_rgba(234,179,8,0.4)] animate-traffic-yellow" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-500/40 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-traffic-green" />
    </div>
);

const TrafficFlow = ({ intercepted = false }: { intercepted?: boolean }) => (
    <div className="flex items-center justify-center gap-8 mb-12 relative w-full max-w-lg">
        {/* Source: App/Client */}
        <div className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-16 h-16 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center shadow-2xl relative ${!intercepted ? 'animate-icon-glow' : ''}`}>
                <div className="relative flex items-center justify-center">
                    <FiMonitor 
                        size={24} 
                        className={twMerge(
                            "absolute -translate-x-2 -translate-y-1 transition-all duration-500",
                            intercepted ? 'text-emerald-500/30' : 'text-[var(--text-muted)]'
                        )} 
                    />
                    <FiTablet 
                        size={20} 
                        className={twMerge(
                            "absolute translate-x-2 translate-y-2 transition-all duration-500",
                            intercepted ? 'text-emerald-500/40' : 'text-[var(--text-secondary)]'
                        )} 
                    />
                    <FiSmartphone 
                        size={18} 
                        className={twMerge(
                            "absolute -translate-y-3 translate-x-4 transition-all duration-500",
                            intercepted ? 'text-emerald-500/50' : 'text-[var(--text-secondary)]'
                        )} 
                    />
                </div>
                {!intercepted && <TrafficLightIndicator />}
            </div>
            <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest">Client App</span>
        </div>

        {/* Flow Path */}
        <div className="flex-1 relative h-20 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full h-[2px] bg-[var(--border-primary)]/50 rounded-full relative overflow-hidden">
                    {/* Flowing dots */}
                    {!intercepted && (
                        <>
                            <div className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-flow-1" />
                            <div className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-flow-2" />
                        </>
                    )}
                    {intercepted && (
                        <div className="absolute inset-0 bg-emerald-500/20" />
                    )}
                </div>
            </div>

            <div className={`z-20 bg-[var(--bg-app)] px-4 py-2 border rounded-full shadow-xl transition-all duration-500 ${intercepted ? 'border-emerald-500/50 shadow-emerald-500/10' : 'border-[var(--border-primary)] shadow-black'}`}>
                {intercepted ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                        <FiCheckCircle size={14} />
                        <span className="text-[10px] font-black tracking-tighter">Intercepted</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        <FiLock size={14} />
                        <span className="text-[10px] font-black tracking-tighter">Tunneled</span>
                    </div>
                )}
            </div>
        </div>

        {/* Destination: Server/Globe */}
        <div className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-16 h-16 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center shadow-2xl relative ${!intercepted ? 'animate-icon-glow' : ''}`}>
                <FiGlobe size={32} className={intercepted ? 'text-emerald-500/50' : 'text-[var(--text-secondary)]'} />
                {!intercepted && <TrafficLightIndicator />}
            </div>
            <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest">Server</span>
        </div>

        <style dangerouslySetInnerHTML={{
            __html: `
      @keyframes flow {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(400%); }
      }
      @keyframes icon-glow {
        0%, 100% { border-color: rgba(63, 63, 70, 1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        50% { border-color: rgba(59, 130, 246, 0.3); box-shadow: 0 0 20px rgba(59, 130, 246, 0.1); }
      }
      @keyframes blink {
        0%, 100% { opacity: 0.3; transform: scale(0.8); filter: saturate(0.5); }
        50% { opacity: 1; transform: scale(1.1); filter: saturate(1.5); }
      }
      .animate-flow-1 {
        animation: flow 2s infinite linear;
      }
      .animate-flow-2 {
        animation: flow 2s infinite linear;
        animation-delay: 1s;
      }
      .animate-icon-glow {
        animation: icon-glow 3s infinite ease-in-out;
      }
      .animate-traffic-red {
        animation: blink 1.5s infinite ease-in-out;
      }
      .animate-traffic-yellow {
        animation: blink 1.5s infinite ease-in-out;
        animation-delay: 0.5s;
      }
      .animate-traffic-green {
        animation: blink 1.5s infinite ease-in-out;
        animation-delay: 1s;
      }
    `}} />
    </div>
);

export const NotInterceptedMode: React.FC<NotInterceptedModeProps> = ({
    domain,
    isAdded,
    isIntercepting,
    handleIntercept,
    clientName,
    onInterceptClient
}) => {
    if (isAdded) {
        return (
            <div className="h-full overflow-y-auto bg-[var(--bg-app)] no-scrollbar">
                <div className="flex flex-col items-center justify-center min-h-full p-12 text-center">
                    <TrafficFlow intercepted={true} />
                    <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3 tracking-tight tracking-[0.2em]">Rule Added</h2>
                    <p className="text-[var(--text-muted)] max-w-md text-sm leading-relaxed mb-4">
                        Interception rule has been created for <span className="text-emerald-400 font-mono">{domain}</span>.
                    </p>
                    <div className="flex flex-col items-center gap-4 bg-[var(--bg-surface)]/50 p-6 rounded-2xl max-w-sm">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2">
                            <FiCheckCircle size={24} />
                        </div>
                        <p className="text-[var(--text-secondary)] text-xs font-bold leading-relaxed">
                            Please repeat the request in your app to see the decrypted data.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-[var(--bg-app)] no-scrollbar">
            <div className="flex flex-col items-center justify-center min-h-full p-12 text-center">
                <TrafficFlow />
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3 tracking-tight tracking-[0.2em]">Traffic Not Intercepted</h2>
                <p className="text-[var(--text-muted)] max-w-md text-sm leading-relaxed mb-10">
                    This traffic to <span className="text-[var(--text-secondary)] font-mono font-bold">{domain}</span> is currently being tunneled directly. To decrypt and inspect this traffic, add it to your <span className="text-indigo-400 font-bold tracking-widest text-[10px]">Proxy Intercept List</span>.
                </p>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleIntercept}
                        disabled={isIntercepting}
                        className="flex items-center justify-center gap-3 px-4 py-2 hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] rounded-lg font-black text-xs transition-all active:scale-95 disabled:opacity-50"
                    >
                        <FiUnlock size={18} />
                        {isIntercepting ? "Adding..." : (
                            <span>
                                Add "<span className="text-yellow-500 font-mono">{domain}</span>" to Proxy List
                            </span>
                        )}
                    </button>

                    {clientName && clientName !== "-" && (
                        <button
                            onClick={() => onInterceptClient(clientName)}
                            disabled={isIntercepting}
                            className="flex items-center justify-center gap-3 px-4 py-2 hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] rounded-lg font-black text-xs transition-all active:scale-95 disabled:opacity-50"
                        >
                            <FiShield size={18} />
                            {isIntercepting ? "Adding..." : (
                                <span>
                                    Intercept all from "<span className="text-yellow-400 font-mono">{clientName}</span>"
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
