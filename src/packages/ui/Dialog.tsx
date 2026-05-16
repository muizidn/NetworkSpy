import React from 'react';
import { FiX, FiInfo, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { Button } from './Button';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'error' | 'success';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <FiAlertCircle size={40} className="text-red-500" />;
      case 'success':
        return <FiCheckCircle size={40} className="text-green-500" />;
      default:
        return <FiInfo size={40} className="text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      {/* backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[var(--bg-app)]/80 backdrop-blur-sm"
      />

      {/* dialog */}
      <div className="relative w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="p-8 flex flex-col items-center text-center">

          <div className="mb-6 p-4 rounded-3xl bg-[var(--bg-surface-elevated)]/5 border border-[var(--border-primary)]/10">
            {getIcon()}
          </div>

          <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
            {title}
          </h3>

          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8">
            {message}
          </p>

          <Button
            title="GOT IT"
            onClick={onClose}
            className="w-full py-3 h-auto text-[11px] font-black tracking-widest bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-[var(--bg-app)] border-none rounded-xl"
          />
        </div>
      </div>

    </div>
  );
};