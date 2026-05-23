import React, { useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import { twMerge } from 'tailwind-merge';

const appWindow = getCurrentWindow();

export interface MenuItem {
  label?: string;
  action?: string;
  items?: MenuItem[];
  separator?: boolean;
  disabled?: boolean;
}

const TitleMenuDropdown: React.FC<{ label: string; items: MenuItem[] }> = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = async (item: MenuItem) => {
    if (!item.action) return;

    switch (item.action) {
      case '__undo':
        document.execCommand('undo');
        break;
      case '__redo':
        document.execCommand('redo');
        break;
      case '__cut':
        document.execCommand('cut');
        break;
      case '__copy':
        document.execCommand('copy');
        break;
      case '__paste':
        document.execCommand('paste');
        break;
      case '__select_all':
        document.execCommand('selectAll');
        break;
      case '__fullscreen':
        await appWindow.setFullscreen(true);
        break;
      case '__maximize':
        await appWindow.toggleMaximize();
        break;
      case '__minimize':
        await appWindow.minimize();
        break;
      case '__close':
        await appWindow.close();
        break;
      default:
        await invoke('trigger_menu_action', { action: item.action });
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
          <div className="absolute top-full left-0 mt-1 min-w-[220px] bg-zinc-900 border border-white/10 rounded-lg shadow-2xl z-[1002] py-1 backdrop-blur-xl">
            {items.map((item, idx) => (
              item.separator ? (
                <div key={idx} className="h-px bg-white/5 my-1 mx-2" />
              ) : (
                <button
                  key={idx}
                  onClick={() => handleAction(item)}
                  disabled={item.disabled}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-zinc-300 hover:bg-blue-500 hover:text-white flex items-center justify-between group transition-colors disabled:opacity-30 disabled:cursor-default"
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
        { label: 'New Window', action: 'show' },
        { separator: true },
        { label: 'View Saved Sessions...', action: 'saved_sessions' },
        { separator: true },
        { label: 'Close Window', action: '__close' },
        { label: 'Quit', action: 'quit' }
      ]} />
      <TitleMenuDropdown label="Edit" items={[
        { label: 'Undo', action: '__undo' },
        { label: 'Redo', action: '__redo' },
        { separator: true },
        { label: 'Cut', action: '__cut' },
        { label: 'Copy', action: '__copy' },
        { label: 'Paste', action: '__paste' },
        { label: 'Select All', action: '__select_all' }
      ]} />
      <TitleMenuDropdown label="View" items={[
        { label: 'Reload', action: 'reload' },
        { separator: true },
        { label: 'Fullscreen', action: '__fullscreen' },
        { label: 'Maximize', action: '__maximize' },
        { label: 'Minimize', action: '__minimize' }
      ]} />
      <TitleMenuDropdown label="Traffic" items={[
        { label: 'Pause Capture', action: 'toggle_capture' },
        { separator: true },
        { label: 'Clear All Traffic', action: 'clear_traffic' },
        { separator: true },
        { label: 'Save Capture...', action: 'save_capture' }
      ]} />
      <TitleMenuDropdown label="Tools" items={[
        { label: 'Install Root Certificate', action: 'install_cert' },
        { separator: true },
        { label: 'Tagging Rules', action: 'tools_tag' },
        { separator: true },
        { label: 'Saved Sessions', action: 'saved_sessions' },
        { label: 'Traffic Filters', action: 'traffic_filters' },
        { separator: true },
        { label: 'Traffic Breakpoints', action: 'breakpoints' },
        { label: 'Map Local Rules', action: 'map_local' },
        { label: 'Map Remote Rules', action: 'map_remote' },
        { label: 'Proxy Intercept Rules', action: 'proxylist' },
        { label: 'Custom Scripting', action: 'scripting' }
      ]} />
      <TitleMenuDropdown label="Help" items={[
        { label: 'Check for Updates...', action: 'check_updates' },
        { separator: true },
        { label: 'About Network Spy', action: '__about' }
      ]} />
      <div className="w-px h-4 bg-white/10 mx-2" />
    </div>
  );
};
