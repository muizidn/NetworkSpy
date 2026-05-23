import React from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { FiX, FiMinus, FiSquare } from 'react-icons/fi';
import { useAtom } from 'jotai';
import { osAtom } from '@src/utils/trafficAtoms';

const appWindow = getCurrentWindow();

const TitleBarViewerList: React.FC = () => {
  const [os] = useAtom(osAtom);
  const isMac = os === 'macos';

  return (
    <div
      data-tauri-drag-region
      className="flex items-center h-8 bg-black border-b border-white/5 select-none shrink-0 z-[1000] px-2 gap-2"
    >
      {isMac && (
        <div className="w-20 shrink-0 h-full" data-tauri-drag-region />
      )}

      {!isMac && (
        <div className="flex items-center h-full ml-auto">
          <button className="h-8 w-10 flex items-center justify-center hover:bg-white/5 text-zinc-500 transition-colors" onClick={() => appWindow.minimize()}><FiMinus size={14} /></button>
          <button className="h-8 w-10 flex items-center justify-center hover:bg-white/5 text-zinc-500 transition-colors" onClick={() => appWindow.toggleMaximize()}><FiSquare size={14} /></button>
          <button className="h-8 w-10 flex items-center justify-center hover:bg-red-500 hover:text-white text-zinc-500 transition-colors" onClick={() => appWindow.close()}><FiX size={14} /></button>
        </div>
      )}
    </div>
  );
};

export default TitleBarViewerList;
