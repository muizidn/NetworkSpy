import React from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { FiX, FiMinus, FiSquare } from 'react-icons/fi';
import { useAtom } from 'jotai';
import { osAtom } from '@src/utils/trafficAtoms';

const appWindow = getCurrentWindow();

export const TitleBarPlatformControls: React.FC = () => {
  const [os] = useAtom(osAtom);

  if (os === 'macos') return null;

  return (
    <div className="flex items-center h-full ml-2">
      <button className="h-8 w-10 flex items-center justify-center hover:bg-white/5 text-zinc-500 transition-colors" onClick={() => appWindow.minimize()}><FiMinus size={14} /></button>
      <button className="h-8 w-10 flex items-center justify-center hover:bg-white/5 text-zinc-500 transition-colors" onClick={() => appWindow.toggleMaximize()}><FiSquare size={14} /></button>
      <button className="h-8 w-10 flex items-center justify-center hover:bg-red-500 hover:text-white text-zinc-500 transition-colors" onClick={() => appWindow.close()}><FiX size={14} /></button>
    </div>
  );
};
