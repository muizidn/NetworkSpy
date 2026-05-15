import React, { useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { twMerge } from 'tailwind-merge';

const appWindow = getCurrentWindow();

export interface MenuItem {
  label?: string;
  action?: string;
  items?: MenuItem[];
  separator?: boolean;
}

const TitleMenuDropdown: React.FC<{ label: string; items: MenuItem[] }> = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = async (item: MenuItem) => {
    if (item.action) {
      await appWindow.emit('tauri://menu', { id: item.action });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative h-full flex items-center">
      <button
        onMouseDown={() => setIsOpen(!isOpen)}
        className={twMerge(
          "px-2 h-6 flex items-center text-[11px] font-medium transition-colors rounded-md",
          isOpen ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
        )}
      >
        {label}
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[1001]" onMouseDown={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 min-w-[200px] bg-zinc-900 border border-white/10 rounded-lg shadow-2xl z-[1002] py-1 backdrop-blur-xl">
            {items.map((item, idx) => (
              item.separator ? (
                <div key={idx} className="h-px bg-white/5 my-1 mx-2" />
              ) : (
                <button
                  key={idx}
                  onClick={() => handleAction(item)}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-zinc-300 hover:bg-blue-500 hover:text-white flex items-center justify-between group transition-colors"
                >
                  <span>{item.label}</span>
                </button>
              )
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const WinAppMenu: React.FC = () => {
  return (
    <div className="flex items-center gap-0.5 h-full ml-1 animate-in slide-in-from-left-2 duration-200">
      <TitleMenuDropdown label="File" items={[
        { label: 'Save Current Session', action: 'save_capture' },
        { separator: true },
        { label: 'Quit', action: 'quit' }
      ]} />
      <TitleMenuDropdown label="Edit" items={[
        { label: 'Clear All Traffic', action: 'clear_traffic' },
        { label: 'Find...', action: 'find' }
      ]} />
      <TitleMenuDropdown label="View" items={[
        { label: 'Reload', action: 'reload' },
        { separator: true },
        { label: 'Toggle Sidebar', action: 'toggle_sidebar' },
        { label: 'Toggle Inspector', action: 'toggle_inspector' }
      ]} />
      <TitleMenuDropdown label="Traffic" items={[
        { label: 'Start/Stop Capture', action: 'toggle_capture' },
        { label: 'Traffic Filters', action: 'traffic_filters' },
        { label: 'Intercept Rules', action: 'proxylist' }
      ]} />
      <TitleMenuDropdown label="Tools" items={[
        { label: 'Certificate Installer', action: 'install_cert' },
        { label: 'Breakpoints', action: 'breakpoints' },
        { label: 'Map Local', action: 'map_local' },
        { label: 'Map Remote', action: 'map_remote' },
        { label: 'Scripting', action: 'scripting' }
      ]} />
      <TitleMenuDropdown label="Help" items={[
        { label: 'Check for Updates', action: 'check_updates' },
        { label: 'About Network Spy', action: 'about' }
      ]} />
      <div className="w-px h-4 bg-white/10 mx-2" />
    </div>
  );
};
