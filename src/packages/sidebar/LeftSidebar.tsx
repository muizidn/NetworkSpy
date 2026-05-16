import { FiActivity, FiBox, FiSettings, FiGrid, FiClock, FiEye, FiFilter } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { Tooltip } from "../ui/Tooltip";
import { useSettingsContext } from "../../context/SettingsProvider";

interface LeftSidebarProps {
}

export const LeftSidebar: React.FC<LeftSidebarProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname === "/" ? "traffic" : 
                    location.pathname === "/workspace" ? "workspace" : 
                    location.pathname === "/sessions" ? "sessions" :
                    location.pathname === "/viewers" ? "viewers" :
                    location.pathname === "/extensions" ? "extensions" : 
                    location.pathname === "/filters" ? "filters" : 
                    location.pathname === "/settings" ? "settings" : 
                    location.pathname === "/account" ? "account" : "";

  return (
    <div className="w-[40px] shrink-0 bg-[var(--bg-sidebar)] border-r border-[var(--border-sidebar)] flex flex-col items-center py-4 h-full z-[100]">
      <div className="flex-1 flex flex-col items-center gap-3 w-full px-1.5">
        <Tooltip text="Traffic Interceptor">
          <NavButton
            icon={<FiActivity size={18} />}
            isActive={activeTab === "traffic"}
            onClick={() => navigate("/")}
          />
        </Tooltip>
        
        <Tooltip text="Custom Viewers">
          <NavButton
            icon={<FiEye size={18} />}
            isActive={activeTab === "viewers"}
            onClick={() => navigate("/viewers")}
          />
        </Tooltip>


      </div>

      <div className="flex flex-col items-center gap-4 w-full mb-2 px-1.5">
        <Tooltip text="Account Settings">
          <div 
            onClick={() => navigate("/account")}
            className={twMerge(
                "w-7 h-7 rounded-full bg-gradient-to-tr border flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer",
                activeTab === "account" 
                    ? "from-blue-600 to-indigo-600 border-blue-400 text-white shadow-lg shadow-blue-500/20" 
                    : "from-[var(--bg-surface-elevated)] to-[var(--bg-surface)] border-[var(--border-primary)]/5 text-[var(--text-secondary)] hover:border-blue-500/50 hover:text-[var(--text-primary)]"
            )}
          >
            M
          </div>
        </Tooltip>

        <Tooltip text="Settings">
          <NavButton
            icon={<FiSettings size={18} />}
            isActive={activeTab === "settings"}
            onClick={() => navigate("/settings")}
          />
        </Tooltip>
      </div>
    </div>
  );
};

const NavButton = ({
  icon,
  isActive,
  onClick
}: {
  icon: React.ReactNode,
  isActive: boolean,
  onClick: () => void
}) => {
  return (
    <button
      onClick={onClick}
      className={twMerge(
        "relative p-1.5 w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center group",
        isActive
          ? "bg-blue-600 shadow-lg shadow-blue-500/20 text-white"
          : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]/80"
      )}
    >
      {icon}
      {!isActive && (
        <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-500 rounded-r-md transition-all duration-200 group-hover:h-1/2 opacity-0 group-hover:opacity-100" />
      )}
    </button>
  );
};
