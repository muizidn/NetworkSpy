import React, { createContext, useContext } from "react";
import { useSettingsContext } from "./SettingsProvider";

export interface PaneState {
  left: boolean;
  bottom: boolean;
  right: boolean;
  centerLayout: "horizontal" | "vertical";
}

interface PaneContextType {
  isDisplayPane: PaneState;
  setIsDisplayPane: React.Dispatch<React.SetStateAction<PaneState>>;
}

const PaneContext = createContext<PaneContextType | undefined>(undefined);

export const usePaneContext = () => {
  const context = useContext(PaneContext);
  if (!context) {
    throw new Error("usePaneContext must be used within a PaneProvider");
  }
  return context;
};

export const PaneProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    paneLeftVisible,
    setPaneLeftVisible,
    paneBottomVisible,
    setPaneBottomVisible,
    paneRightVisible,
    setPaneRightVisible,
    paneCenterLayout,
    setPaneCenterLayout,
  } = useSettingsContext();

  const isDisplayPane: PaneState = {
    left: paneLeftVisible,
    bottom: paneBottomVisible,
    right: paneRightVisible,
    centerLayout: paneCenterLayout,
  };

  const setIsDisplayPane = (action: React.SetStateAction<PaneState>) => {
    const next = typeof action === "function" ? action(isDisplayPane) : action;
    setPaneLeftVisible(next.left);
    setPaneBottomVisible(next.bottom);
    setPaneRightVisible(next.right);
    setPaneCenterLayout(next.centerLayout);
  };

  return (
    <PaneContext.Provider value={{ isDisplayPane, setIsDisplayPane }}>
      {children}
    </PaneContext.Provider>
  );
};
