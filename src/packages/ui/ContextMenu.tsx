import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { FiChevronRight } from "react-icons/fi";

export interface ContextMenuItem {
  id?: string;
  text?: string;
  icon?: React.ReactNode;
  enabled?: boolean;
  checked?: boolean;
  action?: () => void;
  items?: ContextMenuItem[];
  item?: "Separator";
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  x: number;
  y: number;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ items, x, y, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState({ x, y });

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      let newX = x;
      let newY = y;

      if (x + rect.width > screenWidth) {
        newX = screenWidth - rect.width - 10;
      }
      if (y + rect.height > screenHeight) {
        newY = screenHeight - rect.height - 10;
      }

      setAdjustedPos({ x: newX, y: newY });
    }
  }, [x, y, items]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[220px] bg-[var(--bg-surface)]/90 backdrop-blur-xl border border-[var(--border-primary)]/50 rounded-xl py-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-150"
      style={{ left: adjustedPos.x, top: adjustedPos.y }}
    >
      <MenuList items={items} onClose={onClose} />
    </div>
  );
};

const MenuList: React.FC<{ items: ContextMenuItem[]; onClose: () => void }> = ({ items, onClose }) => {
  return (
    <div className="flex flex-col">
      {items.map((item, index) => {
        if (item.item === "Separator") {
          return <div key={`sep-${index}`} className="h-px bg-[var(--border-primary)]/50 my-1 mx-2" />;
        }

        return <MenuItem key={item.id || index} item={item} onClose={onClose} />;
      })}
    </div>
  );
};

const MenuItem: React.FC<{ item: ContextMenuItem; onClose: () => void }> = ({ item, onClose }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  const hasSubmenu = item.items && item.items.length > 0;
  const isEnabled = item.enabled !== false;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowSubmenu(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowSubmenu(false);
    }, 100);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isEnabled || hasSubmenu) {
      e.stopPropagation();
      return;
    }
    if (item.action) {
      item.action();
    }
    onClose();
  };

  return (
    <div
      ref={itemRef}
      className={twMerge(
        "relative px-3 py-1.5 flex items-center justify-between text-[11px] transition-all duration-150 mx-1 rounded-lg cursor-default group",
        isEnabled ? "text-[var(--text-secondary)] hover:bg-blue-600 hover:text-white" : "text-[var(--text-muted)] opacity-50",
        showSubmenu && isEnabled && "bg-[var(--bg-surface-elevated)]/50"
      )}
      onMouseEnter={isEnabled ? handleMouseEnter : undefined}
      onMouseLeave={isEnabled ? handleMouseLeave : undefined}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-4 h-4 flex items-center justify-center shrink-0 opacity-70 group-hover:opacity-100">
          {item.icon}
        </div>
        <span className="font-medium">{item.text}</span>
      </div>

      {hasSubmenu && (
        <FiChevronRight size={12} className="opacity-40" />
      )}

      {showSubmenu && hasSubmenu && isEnabled && (
        <div 
          className="absolute left-full top-0 ml-1 min-w-[200px] bg-[var(--bg-surface)]/95 backdrop-blur-xl border border-[var(--border-primary)]/50 rounded-xl py-1.5 shadow-2xl animate-in fade-in slide-in-from-left-1 duration-150"
          style={{ top: -6 }}
        >
          <MenuList items={item.items!} onClose={onClose} />
        </div>
      )}
    </div>
  );
};
