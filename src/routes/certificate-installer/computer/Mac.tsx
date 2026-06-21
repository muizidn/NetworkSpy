import { SiApple } from "react-icons/si";
import Guide, { GuideStep } from "../Guide";

export function MacOSInstaller() {
  const macOSSteps: GuideStep[] = [
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
            This step installs that CA into your macOS <b>Login Keychain</b> and marks it
            as trusted, so your system and browsers accept these temporary certificates
            without showing security errors.
          </p>
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
      title: "One-Click Install (Recommended)",
      description: (
        <div className="space-y-3">
          <p>
            Click the <b>"One-Click Install CA"</b> button above. It runs this command:
          </p>
          <div className="bg-[#0c0c0c] border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Terminal equivalent</span>
            </div>
            <pre className="p-4 text-[11px] font-mono text-green-400/80 overflow-x-auto">
              <code>security add-trusted-cert -d -r trustRoot \{"\n"}  -k ~/Library/Keychains/login.keychain-db \{"\n"}  ~/.network-spy/ca/network-spy.crt</code>
            </pre>
          </div>
          <p className="text-[11px] text-zinc-500">
            macOS may prompt for your login password or ask you to confirm "Always Trust"
            — this is normal. The <code className="text-zinc-400">-d</code> flag adds the cert
            to the default keychain, and <code className="text-zinc-400">-r trustRoot</code>
            marks it as a trusted root CA.
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
            If the one-click install fails (e.g., due to permissions), install manually:
          </p>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Option A: Finder + Keychain Access</p>
            <ol className="list-decimal list-inside space-y-2 text-[12px] text-zinc-400">
              <li>
                In Finder, press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">⌘⇧G</kbd> and
                go to <code className="text-blue-400 text-[11px]">~/.network-spy/ca/</code>
              </li>
              <li>Double-click <code className="text-blue-400 text-[11px]">network-spy.crt</code></li>
              <li>Keychain Access opens — the cert appears under <b>"login"</b> or <b>"System"</b></li>
              <li>Double-click the <b>"NetworkSpy CA"</b> entry</li>
              <li>Expand <b>Trust</b> → set <b>"When using this certificate"</b> to <b>"Always Trust"</b></li>
              <li>Close the window and enter your password to confirm</li>
            </ol>
          </div>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Option B: Terminal</p>
            <div className="bg-[#0c0c0c] border border-zinc-800 rounded-xl overflow-hidden">
              <pre className="p-4 text-[11px] font-mono text-green-400/80 overflow-x-auto">
                <code>security add-trusted-cert -d -r trustRoot \{"\n"}  ~/.network-spy/ca/network-spy.crt</code>
              </pre>
            </div>
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
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Method 1: Keychain Access (GUI)</p>
            <ol className="list-decimal list-inside space-y-1 text-[12px] text-zinc-400">
              <li>Open <b>Keychain Access</b> (from Spotlight: <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">⌘Space</kbd> → "Keychain")</li>
              <li>Select <b>"login"</b> keychain and <b>"Certificates"</b> category</li>
              <li>Search for <b>"NetworkSpy CA"</b></li>
              <li>You should see it with a blue <b>+</b> icon and <b>"This certificate is marked as trusted"</b></li>
            </ol>
          </div>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Method 2: Terminal</p>
            <div className="bg-[#0c0c0c] border border-zinc-800 rounded-xl overflow-hidden">
              <pre className="p-4 text-[11px] font-mono text-green-400/80 overflow-x-auto">
                <code>security find-certificate -c "NetworkSpy CA"</code>
              </pre>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              If installed, this prints the certificate details. If not found, it shows nothing.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Method 3: Browser Test</p>
            <p className="text-[12px] text-zinc-400">
              Visit <b>any HTTPS website</b> (e.g. <code className="text-blue-400">https://example.com</code>).
              If the certificate is trusted, the page loads normally with no security warning.
              Open the padlock in the address bar — you should see the certificate chain includes
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
            Use the <b>"Uninstall CA"</b> button above, or run:
          </p>
          <div className="bg-[#0c0c0c] border border-zinc-800 rounded-xl overflow-hidden">
            <pre className="p-4 text-[11px] font-mono text-green-400/80 overflow-x-auto">
              <code>security delete-certificate -c "NetworkSpy CA"</code>
            </pre>
          </div>
          <p className="text-[11px] text-zinc-500">
            This removes the cert from both your login keychain and the system keychain
            (if present). The cert file at <code className="text-zinc-400">~/.network-spy/ca/network-spy.crt</code>
            remains — delete it manually if you no longer need NetworkSpy.
          </p>
        </div>
      ),
    },
  ];

  return (
    <Guide
      platform="macOS"
      icon={<SiApple size={32} />}
      steps={macOSSteps}
    />
  );
}
