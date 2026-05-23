import React from 'react';
import { useAtom } from 'jotai';
import { titleBarContentAtom, osAtom } from '@src/utils/trafficAtoms';
import { TitleBarPlatformControls } from './TitleBarPlatformControls';

const TitleBarViewerBuilder: React.FC = () => {
  const [os] = useAtom(osAtom);
  const isMac = os === 'macos';
  const [customContent] = useAtom(titleBarContentAtom);

  if (!customContent) return null;

  return (
    <div
      id="title-bar-viewer-builder"
      data-tauri-drag-region
      className="flex items-center h-8 bg-black border-b border-white/5 select-none shrink-0 z-[1000] px-2 gap-2"
    >
      {isMac && (
        <div className="w-20 shrink-0 h-full" data-tauri-drag-region />
      )}
      <div className="flex-1 h-full" data-tauri-drag-region>
        {customContent}
      </div>

      <TitleBarPlatformControls />
    </div>
  );
};

export default TitleBarViewerBuilder;
