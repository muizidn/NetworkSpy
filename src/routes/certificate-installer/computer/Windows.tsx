import { SiWindows } from "react-icons/si";
import Guide, { GuideStep } from "../Guide";

export function WindowsInstaller() {
  const windowsSteps: GuideStep[] = [
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
            This step imports that CA into the Windows <b>Trusted Root Certification Authorities</b>
            store for the current user. Once trusted, your system and browsers accept these
            temporary certificates without showing security errors.
          </p>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 mt-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Certificate Location</p>
            <code className="text-[11px] text-blue-400 break-all">
              %USERPROFILE%\.network-spy\ca\network-spy.crt
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
      title: "One-Click Install (Recommended)",
      description: (
        <div className="space-y-3">
          <p>
            Click the <b>"One-Click Install CA"</b> button above. It opens the certificate and imports it into:
          </p>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 mt-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Target Store</p>
            <code className="text-[11px] text-blue-400">
              Cert:\CurrentUser\Root (Trusted Root Certification Authorities)
            </code>
          </div>
          <p className="text-[11px] text-zinc-500">
            This runs under your user account — no administrator elevation required.
            Windows may show a security dialog asking you to confirm the certificate import.
            Click <b>"Yes"</b> to proceed.
          </p>
          <p className="text-[11px] text-zinc-500">
            Click <b>"View Logs"</b> after installation to see exactly what happened.
          </p>
        </div>
      ),
    },
    {
      title: "Manual Install (Alternative)",
      description: (
        <div className="space-y-4">
          <p>
            If the one-click install fails, install manually:
          </p>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Option A: Certificate Import Wizard (GUI)</p>
            <ol className="list-decimal list-inside space-y-2 text-[12px] text-zinc-400">
              <li>
                Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">Win+R</kbd>, type
                <code className="text-blue-400 text-[11px]"> %USERPROFILE%\.network-spy\ca</code>, press Enter
              </li>
              <li>Double-click <code className="text-blue-400 text-[11px]">network-spy.crt</code></li>
              <li>Click <b>"Install Certificate"</b></li>
              <li>Select <b>"Current User"</b> → Next</li>
              <li>Choose <b>"Place all certificates in the following store"</b> → Browse</li>
              <li>Select <b>"Trusted Root Certification Authorities"</b> → OK → Next → Finish</li>
              <li>Click <b>"Yes"</b> on the security warning to confirm</li>
            </ol>
          </div>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Option B: PowerShell</p>
            <div className="bg-[#0c0c0c] border border-zinc-800 rounded-xl overflow-hidden">
              <pre className="p-4 text-[11px] font-mono text-green-400/80 overflow-x-auto">
                <code>$cert = New-Object \{"\n"}  System.Security.Cryptography.X509Certificates.X509Certificate2\{"\n"}$cert.Import("$env:USERPROFILE\.network-spy\ca\network-spy.crt")\{"\n"}$store = New-Object \{"\n"}  System.Security.Cryptography.X509Certificates.X509Store(\{"\n"}    "Root", "CurrentUser")\{"\n"}$store.Open("ReadWrite")\{"\n"}$store.Add($cert)\{"\n"}$store.Close()</code>
              </pre>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-3">
            <p className="text-[11px] text-amber-300 font-bold mb-1">Firefox Users</p>
            <p className="text-[11px] text-amber-300/80">
              Firefox uses its own certificate store (NSS), not the Windows system store.
              After installing the cert above, open Firefox and go to
              <b> Settings → Privacy & Security → Certificates → View Certificates → Authorities → Import</b>.
              Select <code className="text-amber-400/80">network-spy.crt</code> and check
              <b> "Trust this CA to identify websites"</b>.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Verify Installation",
      description: (
        <div className="space-y-4">
          <p>Confirm the certificate is installed and trusted:</p>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Method 1: Certificate Manager (GUI)</p>
            <ol className="list-decimal list-inside space-y-1 text-[12px] text-zinc-400">
              <li>Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">Win+R</kbd>, type <b>certmgr.msc</b>, press Enter</li>
              <li>Navigate to <b>Trusted Root Certification Authorities → Certificates</b></li>
              <li>Look for <b>"NetworkSpy CA"</b> in the list</li>
            </ol>
          </div>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Method 2: PowerShell</p>
            <div className="bg-[#0c0c0c] border border-zinc-800 rounded-xl overflow-hidden">
              <pre className="p-4 text-[11px] font-mono text-green-400/80 overflow-x-auto">
                <code>Get-ChildItem Cert:\CurrentUser\Root | \{"\n"}  Where-Object {"{$"}_.Subject -like "*NetworkSpy*"{"}"}</code>
              </pre>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              If installed, this prints the certificate details including thumbprint and expiration.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Method 3: Browser Test</p>
            <p className="text-[12px] text-zinc-400">
              Visit <b>any HTTPS website</b> (e.g. <code className="text-blue-400">https://example.com</code>).
              If the certificate is trusted, the page loads normally with no security warning.
              Click the padlock in the address bar → <b>Connection is secure</b> → <b>Certificate</b>
              — you should see <b>"NetworkSpy CA"</b> in the certification path.
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
            Use the <b>"Uninstall CA"</b> button above, or remove manually:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[12px] text-zinc-400">
            <li>Open <b>certmgr.msc</b></li>
            <li>Navigate to <b>Trusted Root Certification Authorities → Certificates</b></li>
            <li>Right-click <b>"NetworkSpy CA"</b> → Delete</li>
          </ol>
          <p className="text-[11px] text-zinc-500 mt-3">
            The cert file at <code className="text-zinc-400">%USERPROFILE%\.network-spy\ca\network-spy.crt</code>
            remains — delete it manually if you no longer need NetworkSpy.
          </p>
        </div>
      ),
    },
  ];

  return (
    <Guide
      platform="Windows"
      icon={<SiWindows size={32} />}
      steps={windowsSteps}
    />
  );
}
