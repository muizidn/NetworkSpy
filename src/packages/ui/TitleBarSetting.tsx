import React from 'react';
import { useAtom } from 'jotai';
import { osAtom } from '@src/utils/trafficAtoms';
import { TitleBarCustomMenuTool } from './TitleBarCustomMenuTool';
import { TitleBarPlatformControls } from './TitleBarPlatformControls';

const TitleBarSetting: React.FC = () => {
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

      <TitleBarCustomMenuTool />
      <div className="flex-1" data-tauri-drag-region />
      <TitleBarPlatformControls />
    </div>
  );
};

export default TitleBarSetting;
