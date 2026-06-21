import { SiLinux } from "react-icons/si";
import Guide, { GuideStep } from "../Guide";

export function LinuxInstaller() {
  const linuxSteps: GuideStep[] = [
    {
      title: "What This Does",
      description: (
        <div className="space-y-3">
          <p>
            NetworkSpy intercepts HTTPS traffic by acting as a <b>man-in-the-middle proxy</b>.
            To decrypt TLS-encrypted connections without browser warnings, it generates a
            <b> root Certificate Authority (CA)</b> and uses it to sign temporary certificates
            for every domain you visit.
          </p>
          <p>
            On Linux, the CA must be trusted in <b>three places</b> for full coverage:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-[12px] text-zinc-400 ml-2">
            <li>
              <b>System-wide</b> — copied to{" "}
              <code className="text-blue-400 text-[11px]">/usr/local/share/ca-certificates/</code>{" "}
              and registered via <code className="text-blue-400 text-[11px]">update-ca-certificates</code>.
              Used by <code className="text-zinc-400">curl</code>, <code className="text-zinc-400">wget</code>, and most CLI tools.
            </li>
            <li>
              <b>Chromium-based browsers</b> (Chrome, Brave, Edge, Opera) — installed into the
              shared NSS database at{" "}
              <code className="text-blue-400 text-[11px]">~/.pki/nssdb</code>{" "}
              using <code className="text-blue-400 text-[11px]">certutil</code>.
            </li>
            <li>
              <b>Firefox</b> — installed into each Firefox profile's NSS database
              (<code className="text-blue-400 text-[11px]">cert9.db</code>{" "}
              or <code className="text-blue-400 text-[11px]">cert8.db</code>).
            </li>
          </ol>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 mt-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Certificate Location</p>
            <code className="text-[11px] text-blue-400 break-all">
              ~/.network-spy/ca/network-spy.crt
            </code>
          </div>
          <p className="text-[11px] text-zinc-500">
            The private key never leaves your machine. The CA is unique — generated from your
            hostname, username, and a random ID.
          </p>
        </div>
      ),
    },
    {
      title: "Prerequisites",
      description: (
        <div className="space-y-3">
          <p>
            For browser support, the <code className="text-blue-400">certutil</code> tool is required.
            Install it if you haven't already:
          </p>
          <div className="bg-[#0c0c0c] border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Ubuntu / Debian</span>
            </div>
            <pre className="p-4 text-[11px] font-mono text-green-400/80 overflow-x-auto">
              <code>sudo apt install libnss3-tools</code>
            </pre>
          </div>
          <div className="bg-[#0c0c0c] border border-zinc-800 rounded-xl overflow-hidden mt-2">
            <div className="flex items-center px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Fedora / RHEL</span>
            </div>
            <pre className="p-4 text-[11px] font-mono text-green-400/80 overflow-x-auto">
              <code>sudo dnf install nss-tools</code>
            </pre>
          </div>
          <div className="bg-[#0c0c0c] border border-zinc-800 rounded-xl overflow-hidden mt-2">
            <div className="flex items-center px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Arch</span>
            </div>
            <pre className="p-4 text-[11px] font-mono text-green-400/80 overflow-x-auto">
              <code>sudo pacman -S nss</code>
            </pre>
          </div>
          <p className="text-[11px] text-zinc-500">
            Without <code className="text-zinc-400">certutil</code>, the one-click install can
            still install the system-wide certificate, but browser trust must be configured
            manually (see the Manual Install section below).
          </p>
        </div>
      ),
    },
    {
      title: "One-Click Install (Recommended)",
      description: (
        <div className="space-y-3">
          <p>
            Click the <b>"One-Click Install CA"</b> button above. The script performs three steps:
          </p>

          <div className="space-y-3 mt-3">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Step 1 — System-wide</p>
              <p className="text-[11px] text-zinc-400">
                Copies the certificate to{" "}
                <code className="text-emerald-400/80 text-[10px]">/usr/local/share/ca-certificates/network-spy.crt</code>{" "}
                and runs <code className="text-emerald-400/80 text-[10px]">update-ca-certificates</code>.
                Requires admin — <code className="text-emerald-400/80 text-[10px]">pkexec</code> will
                prompt for your password.
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Step 2 — Chromium browsers</p>
              <p className="text-[11px] text-zinc-400">
                Creates the NSS database at{" "}
                <code className="text-emerald-400/80 text-[10px]">~/.pki/nssdb</code>{" "}
                and imports the certificate with trust flags{" "}
                <code className="text-emerald-400/80 text-[10px]">CT,c,c</code>{" "}
                (trusted for signing TLS server certificates).
                Covers Chrome, Chromium, Brave, Edge, and Opera.
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Step 3 — Firefox profiles</p>
              <p className="text-[11px] text-zinc-400">
                Scans <code className="text-emerald-400/80 text-[10px]">~/.mozilla/firefox/</code>{" "}
                for all profiles and imports the certificate into each one's NSS database.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 mt-2">
            Click <b>"View Logs"</b> after installation to see detailed output from each step.
          </p>
        </div>
      ),
    },
    {
      title: "Manual Install (Alternative)",
      description: (
        <div className="space-y-4">
          <p>
            If the one-click install fails or you prefer to do it manually:
          </p>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">System-wide</p>
            <div className="bg-[#0c0c0c] border border-zinc-800 rounded-xl overflow-hidden">
              <pre className="p-4 text-[11px] font-mono text-green-400/80 overflow-x-auto">
                <code>sudo cp ~/.network-spy/ca/network-spy.crt \{"\n"}  /usr/local/share/ca-certificates/\{"\n"}sudo update-ca-certificates</code>
              </pre>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Chromium-based browsers (Chrome, Brave, Edge)</p>
            <div className="bg-[#0c0c0c] border border-zinc-800 rounded-xl overflow-hidden">
              <pre className="p-4 text-[11px] font-mono text-green-400/80 overflow-x-auto">
                <code>mkdir -p ~/.pki/nssdb\{"\n"}certutil -d "sql:$HOME/.pki/nssdb" \{"\n"}  -A -t "CT,c,c" -n "NetworkSpy CA" \{"\n"}  -i ~/.network-spy/ca/network-spy.crt</code>
              </pre>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Firefox (GUI method)</p>
            <ol className="list-decimal list-inside space-y-1 text-[12px] text-zinc-400">
              <li>Open Firefox → <b>Settings</b> (or <b>Preferences</b>)</li>
              <li>Search for <b>"Certificates"</b> → click <b>"View Certificates"</b></li>
              <li>Go to the <b>"Authorities"</b> tab → click <b>"Import"</b></li>
              <li>Select <code className="text-blue-400 text-[11px]">~/.network-spy/ca/network-spy.crt</code></li>
              <li>Check <b>"Trust this CA to identify websites"</b> → OK</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      title: "Verify Installation",
      description: (
        <div className="space-y-4">
          <p>Confirm the certificate is installed at each level:</p>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">System-wide</p>
            <div className="bg-[#0c0c0c] border border-zinc-800 rounded-xl overflow-hidden">
              <pre className="p-4 text-[11px] font-mono text-green-400/80 overflow-x-auto">
                <code>ls -la /usr/local/share/ca-certificates/network-spy.crt</code>
              </pre>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              Should show the file with a recent timestamp and size &gt; 0.
              Also verify with{" "}
              <code className="text-blue-400 text-[11px]">curl -v https://example.com 2&gt;&amp;1 | grep -i "NetworkSpy"</code>
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Chromium browsers</p>
            <div className="bg-[#0c0c0c] border border-zinc-800 rounded-xl overflow-hidden">
              <pre className="p-4 text-[11px] font-mono text-green-400/80 overflow-x-auto">
                <code>certutil -d "sql:$HOME/.pki/nssdb" -L | grep NetworkSpy</code>
              </pre>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              Should list <b>"NetworkSpy CA"</b> with trust attributes <b>CT,c,c</b>.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Browser Test</p>
            <p className="text-[12px] text-zinc-400">
              Visit <b>any HTTPS website</b> (e.g. <code className="text-blue-400">https://example.com</code>).
              If the certificate is trusted, the page loads normally with no security warning.
              Click the padlock in the address bar — you should see the certificate chain includes
              <b> "NetworkSpy CA"</b> as the root.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Uninstalling",
      description: (
        <div className="space-y-3">
          <p>
            Use the <b>"Uninstall CA"</b> button above, or run these commands manually:
          </p>
          <div className="bg-[#0c0c0c] border border-zinc-800 rounded-xl overflow-hidden">
            <pre className="p-4 text-[11px] font-mono text-green-400/80 overflow-x-auto">
              <code># System-wide\{"\n"}sudo rm /usr/local/share/ca-certificates/network-spy.crt\{"\n"}sudo update-ca-certificates\{"\n"}\{"\n"}# Chromium browsers\{"\n"}certutil -d "sql:$HOME/.pki/nssdb" \{"\n"}  -D -n "NetworkSpy CA"\{"\n"}\{"\n"}# Firefox (per profile)\{"\n"}for d in ~/.mozilla/firefox/*.*/; do\{"\n"}  certutil -d "sql:$d" -D \{"\n"}    -n "NetworkSpy CA" 2&gt;/dev/null\{"\n"}done</code>
            </pre>
          </div>
          <p className="text-[11px] text-zinc-500 mt-3">
            The cert file at <code className="text-zinc-400">~/.network-spy/ca/network-spy.crt</code>
            remains — delete it manually if you no longer need NetworkSpy.
          </p>
        </div>
      ),
    },
  ];

  return (
    <Guide
      platform="Linux"
      icon={<SiLinux size={32} />}
      steps={linuxSteps}
    />
  );
}
