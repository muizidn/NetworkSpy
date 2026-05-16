import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PortDialogProps {
  isOpen: boolean;
  currentPort: number;
  onClose: () => void;
  onConfirm: (port: number) => void;
}

export const PortDialog: React.FC<PortDialogProps> = ({ isOpen, currentPort, onClose, onConfirm }) => {
  const [port, setPort] = useState(currentPort.toString());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPort(currentPort.toString());
      setError(null);
    }
  }, [isOpen, currentPort]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1024 || portNum > 65535) {
      setError('Please enter a valid port (1024-65535)');
      return;
    }
    onConfirm(portNum);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-80 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Proxy Port Settings</h2>
          <p className="text-xs text-[var(--text-muted)]">Specify the port for the proxy server to listen on.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest pl-1">Preferred Port</label>
          <input
            autoFocus
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            className="bg-[var(--bg-surface-inset)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
            placeholder="e.g. 9090"
          />
          {error && <p className="text-[10px] text-red-500 pl-1">{error}</p>}
        </div>

        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
          >
            Update Port
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
