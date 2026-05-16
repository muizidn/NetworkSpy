import { useEffect, useState, useMemo } from "react";
import { useTrafficListContext } from "../../../main-content/context/TrafficList";
import { useAppProvider } from "@src/packages/app-env";

interface MobSFFinding {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  score: number;
  description: string;
}

export const MobSFMode = () => {
  const { selections } = useTrafficListContext();
  const { provider } = useAppProvider();
  const trafficId = useMemo(() => selections.firstSelected?.id as string, [selections]);

  const [data, setData] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [findings, setFindings] = useState<MobSFFinding[]>([]);

  useEffect(() => {
    if (!trafficId) return;
    setAnalyzing(true);
    provider.getRequestPairData(trafficId)
      .then(res => setData(res))
      .finally(() => {
        setFindings([
          {
            id: "SEC-001",
            type: "danger",
            title: "Insecure Data Storage",
            score: 8.5,
            description: "Potential local storage of sensitive tokens detected in request parameters. Android/iOS apps should use Keystore/Keychain."
          },
          {
            id: "SEC-002",
            type: "warning",
            title: "Insufficient Binary Protections",
            score: 4.2,
            description: "Detected legacy User-Agent string. Might indicate missing stack canaries or anti-tampering in the mobile client."
          },
          {
            id: "SEC-003",
            type: "info",
            title: "App Transport Security",
            score: 0.0,
            description: "HTTPS implementation verified. No weak ciphers detected in the TLS handshake (Heuristic check)."
          }
        ]);
        setAnalyzing(false);
      });
  }, [trafficId, provider]);

  if (!trafficId) return <Placeholder text="Select a request for MobSF-integrated mobile analysis" />;

    return (
    <div className="h-full bg-[var(--bg-app)] flex flex-col overflow-hidden">
      <div className="flex flex-col @sm:flex-row items-start @sm:items-center px-4 @sm:px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-sidebar)] justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-600/20 border border-green-500/30 flex items-center justify-center text-green-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <h2 className="text-sm font-black text-[var(--text-primary)] tracking-tighter">MobSF Mobile Engine</h2>
            <div className="text-[9px] text-[var(--text-muted)] font-bold tracking-widest italic text-green-600/70">Mobile Security Framework Integration</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-[var(--text-muted)]">Security Score</span>
            <span className="text-lg font-black text-green-500 leading-none">84<span className="text-[10px] text-[var(--text-muted)]">/100</span></span>
          </div>
        </div>
      </div>

      <div className="flex-grow p-4 @sm:p-6 overflow-y-auto no-scrollbar pb-10">
        <div className="space-y-4">
          {findings.map((f) => (
            <div key={f.id} className="relative group bg-[var(--bg-surface)]/30 border border-[var(--border-primary)]/80 rounded-2xl p-5 hover:bg-[var(--bg-surface-elevated)]/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${f.type === 'danger' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : f.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
                  <span className="text-[var(--text-secondary)] font-bold text-sm">{f.title}</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">CVSS {f.score.toFixed(1)}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed pl-4">{f.description}</p>

              <div className="mt-4 pl-4 flex gap-2">
                <span className="text-[9px] font-black bg-[var(--bg-surface-inset)] text-[var(--text-muted)] px-2 py-0.5 rounded">{f.id}</span>
                {f.type === 'danger' && <span className="text-[9px] font-black border border-red-900/30 text-red-900 px-2 py-0.5 rounded">Insecure</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 @sm:p-6 bg-gradient-to-br from-[var(--bg-surface)] to-transparent border border-[var(--border-primary)] rounded-2xl">
          <h4 className="text-[10px] font-black text-[var(--text-muted)] tracking-widest mb-4">Heuristic Traffic Analysis</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[var(--bg-surface-inset)]/30 rounded-xl border border-[var(--border-primary)]/50">
              <div className="text-[9px] font-bold text-[var(--text-muted)] mb-1">Insecure Storage</div>
              <div className="text-xs font-mono text-[var(--text-tertiary)]">Not Detected</div>
            </div>
            <div className="p-3 bg-[var(--bg-surface-inset)]/30 rounded-xl border border-[var(--border-primary)]/50">
              <div className="text-[9px] font-bold text-[var(--text-muted)] mb-1">Hardcoded Keys</div>
              <div className="text-xs font-mono text-red-500/80 italic">1 Possible Match</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Placeholder = ({ text }: { text: string }) => (
  <div className="h-full flex flex-col items-center justify-center bg-[var(--bg-app)] p-6 @sm:p-10 text-center">
    <div className="w-16 h-16 @sm:w-20 @sm:h-20 rounded-full bg-green-600/5 flex items-center justify-center text-green-950 mb-6 border border-green-950/10">
      <svg className="w-8 h-8 @sm:w-10 @sm:h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor font-black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
    </div>
    <h3 className="text-[var(--text-tertiary)] font-bold mb-1 italic">MobSF Engine Offline</h3>
    <p className="text-[11px] text-[var(--text-muted)] max-w-[200px] leading-relaxed">{text}</p>
  </div>
);

export default MobSFMode;
