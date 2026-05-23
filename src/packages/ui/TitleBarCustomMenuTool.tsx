import React, { useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import { useAtom } from 'jotai';
import { osAtom } from '@src/utils/trafficAtoms';
import { twMerge } from 'tailwind-merge';
import { WinAppMenu } from './TitleBarMenu';

export const TitleBarCustomMenuTool: React.FC = () => {
  const [os] = useAtom(osAtom);
  const isMac = os === 'macos';
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

  if (isMac) return null;

  return (
    <div
      className="flex items-center h-full group"
      onMouseEnter={() => setIsMenuExpanded(true)}
      onMouseLeave={() => setIsMenuExpanded(false)}
    >
      <button
        className={twMerge(
          "w-8 h-8 flex items-center justify-center transition-colors rounded-md",
          isMenuExpanded ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
        )}
        onClick={() => setIsMenuExpanded(!isMenuExpanded)}
      >
        <FiMenu size={16} />
      </button>

      {isMenuExpanded && (
        <WinAppMenu />
      )}
    </div>
  );
};
