import { useState, ReactNode, useMemo, useCallback, useEffect, useRef, Suspense } from "react";
import { Icon } from "./Icon";
import { twMerge } from "tailwind-merge";
import Tab from "@src/stories/app/atoms/Tab";
import { ErrorBoundary } from "./ErrorBoundary";

export interface Tab {
  id: string;
  title: string;
  content: ReactNode;
}

interface TabPanelProps {
  tag: string;
  current: string;
  children: ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = ({ tag, current, children }) => {
  return (
    <div className="absolute w-full h-full" hidden={current !== tag}>
      <ErrorBoundary>
        <Suspense fallback={
          <div className="flex items-center justify-center h-full text-[var(--text-muted)] italic text-xs animate-pulse bg-[var(--bg-app)]">
            Loading...
          </div>
        }>
          {children}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

interface NSTabsProps {
  title?: ReactNode;
  tabs: Tab[];
  onClose?: (id: string) => void;
  onAdd?: () => void;
  onRename?: (id: string, newTitle: string) => void;
  onReorder?: (dragIndex: number, hoverIndex: number) => void;
  onTabChange?: (id: string) => void;
  initialTab?: string;
  designStyle?: "chrome" | "opera" | "basic";
  extraRightContent?: ReactNode;
  extraLeftContent?: ReactNode;
  integratedTitlebar?: boolean;
  hideTabs?: boolean;
}


import { FiPlus } from "react-icons/fi";

export const NSTabs: React.FC<NSTabsProps> = ({
  title,
  tabs,
  initialTab,
  onClose,
  onAdd,
  onRename,
  onReorder,
  onTabChange,
  designStyle = "chrome",
  extraRightContent,
  extraLeftContent,
  integratedTitlebar = false,
  hideTabs = false,
}) => {

  const [currentTab, setCurrentTabInternal] = useState(initialTab || tabs[0]?.id || "");

  useEffect(() => {
    if (initialTab && initialTab !== currentTab) {
      setCurrentTabInternal(initialTab);
    }
  }, [initialTab]);

  const setCurrentTab = useCallback((id: string) => {
    setCurrentTabInternal(id);
    onTabChange?.(id);
  }, [onTabChange]);
  const prevTabsLength = useRef(tabs.length);

  useEffect(() => {
    // If a tab was added, switch to it
    if (tabs.length > prevTabsLength.current) {
      const lastTab = tabs[tabs.length - 1];
      if (lastTab) {
        setCurrentTab(lastTab.id);
      }
    } else if (tabs.length > 0 && !tabs.find(t => t.id === currentTab)) {
      // If the current tab was removed or invalid, switch to the first tab
      setCurrentTab(tabs[0].id);
    }
    prevTabsLength.current = tabs.length;
  }, [tabs, currentTab, setCurrentTab]);

  // Memoize tabs to avoid unnecessary re-renders
  const memoizedTabs = useMemo(() => tabs, [tabs]);

  const handleTabClose = useCallback(
    (tabId: string) => {
      if (onClose) {
        onClose(tabId);
      }

      const tabIndex = memoizedTabs.findIndex((tab) => tab.id === tabId);

      if (tabIndex === -1) return; // Tab not found

      const previousTab = memoizedTabs[tabIndex - 1]?.id;
      const nextTab = memoizedTabs[tabIndex + 1]?.id;

      if (nextTab) {
        setCurrentTab(nextTab);
      } else if (previousTab) {
        setCurrentTab(previousTab);
      } else {
        setCurrentTab(memoizedTabs[0]?.id || "");
      }
    },
    [memoizedTabs, onClose]
  );

  return (
    <div
      id={`tabs-for-${title}`}
      className="flex flex-col h-full bg-[var(--bg-app)] text-[var(--text-primary)] w-full relative overflow-hidden"
    >
      {!hideTabs && (
        <div
          data-tauri-drag-region={integratedTitlebar ? "" : undefined}
          className={twMerge(
            "flex flex-nowrap z-10 shrink-0 relative items-end overflow-y-hidden h-10",
            designStyle === "chrome" && "bg-[var(--bg-surface-inset)] pt-1.5 px-2",
            designStyle === "opera" && "bg-[var(--bg-surface)] pt-1 px-1 border-b border-[var(--border-primary)]",
            designStyle === "basic" && "bg-transparent border-b border-[var(--border-primary)]/80 px-1 h-7",
            integratedTitlebar && "pl-20"
          )}
        >
          {designStyle === "chrome" && <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border-primary)] z-0" />}

          {/* Fixed Left Section */}
          <div className="flex items-center shrink-0 z-20 h-full">
            {extraLeftContent && (
              <div className="flex items-center">
                {extraLeftContent}
              </div>
            )}
            {title && (
              <div className="px-3 text-xs flex items-center uppercase tracking-wider text-[var(--text-muted)] font-bold">
                {title}
              </div>
            )}
          </div>

          {/* Scrollable Tabs Section */}
          <div className="flex-1 flex flex-nowrap overflow-x-auto no-scrollbar items-end h-full relative">
            {memoizedTabs.map((tab, index) => (
              <Tab
                key={tab.id}
                id={tab.id}
                index={index}
                title={tab.title}
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                onClose={handleTabClose}
                allowClose={designStyle !== "basic"}
                onRename={onRename}
                moveTab={(dragIndex, hoverIndex) => onReorder?.(dragIndex, hoverIndex)}
                designStyle={designStyle}
              />
            ))}
            {onAdd && (
              <div className="flex justify-end sticky right-0 z-20 shrink-0">
                <button
                  onClick={onAdd}
                  className="flex items-center justify-center h-[28px] w-8 mb-[2px] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-inset)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md mx-1"
                  title="Open new tab"
                >
                  <FiPlus size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Fixed Right Section */}
          {extraRightContent && (
            <div className="flex items-center shrink-0 z-20 h-full pb-1.5 px-2">
              {extraRightContent}
            </div>
          )}
        </div>
      )}
      <div className="relative w-full h-full bg-[var(--bg-app)] z-0">

        {memoizedTabs.map((tab) => (
          <TabPanel key={tab.id} current={currentTab} tag={tab.id}>
            {tab.content}
          </TabPanel>
        ))}
      </div>
    </div>
  );
};
