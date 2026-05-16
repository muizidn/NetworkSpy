import React from "react";
import { FiLayers, FiActivity, FiZap, FiSearch, FiCode } from "react-icons/fi";
import { useAppProvider } from "@src/packages/app-env";

interface ViewerPlaceholderProps {
    title: string;
    subtext?: string;
    icon?: React.ReactNode;
    type?: "GraphQL" | "JSON" | "Form" | "Generic";
    hint?: string;
}

export const ViewerPlaceholder: React.FC<ViewerPlaceholderProps> = ({ 
    title, 
    subtext, 
    icon, 
    type = "Generic",
    hint
}) => {
    const { openNewWindow } = useAppProvider();

    const handleCreateCustomViewer = async () => {
        try {
            await openNewWindow("viewers", "Custom Viewer Builder");
        } catch (e) {
            console.error("Failed to open custom viewer builder", e);
        }
    };

    const getIcon = () => {
        if (icon) return icon;
        switch (type) {
            case "GraphQL": return <FiActivity size={32} className="text-pink-500" />;
            case "JSON": return <FiCode size={32} className="text-amber-500" />;
            case "Form": return <FiSearch size={32} className="text-blue-500" />;
            default: return <FiZap size={32} className="text-indigo-500" />;
        }
    };

    const getAccentColor = () => {
        switch (type) {
            case "GraphQL": return "bg-pink-500/10 text-pink-500 shadow-pink-900/40";
            case "JSON": return "bg-amber-500/10 text-amber-500 shadow-amber-900/40";
            case "Form": return "bg-blue-500/10 text-blue-500 shadow-blue-900/40";
            default: return "bg-indigo-500/10 text-indigo-500 shadow-indigo-900/40";
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case "GraphQL": return "bg-pink-600 hover:bg-pink-500 shadow-pink-900/40";
            case "JSON": return "bg-amber-600 hover:bg-amber-500 shadow-amber-900/40";
            case "Form": return "bg-blue-600 hover:bg-blue-500 shadow-blue-900/40";
            default: return "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/40";
        }
    };

    return (
        <div className="h-full flex items-center justify-center text-zinc-500 bg-[#0d0d0d] p-6 @sm:p-10 text-center select-none overflow-y-auto no-scrollbar">
            <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
                <div className={`w-20 h-20 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 mx-auto shadow-2xl relative group`}>
                    <div className={`absolute inset-0 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity ${getAccentColor().split(' ')[0]}`} />
                    <div className="relative z-10">
                        {getIcon()}
                    </div>
                </div>

                <h3 className="text-xl font-black text-[var(--text-primary)] mb-3 tracking-tighter uppercase italic tracking-widest">
                    {title}
                </h3>
                <p className="text-zinc-500 text-xs leading-relaxed font-medium mb-10 px-4">
                    {subtext || `This ${type} implementation might use a non-standard structure that NetworkSpy cannot automatically parse.`}
                </p>

                <div className="flex flex-col gap-3 items-center">
                    <button
                        onClick={handleCreateCustomViewer}
                        className={`flex items-center gap-3 px-8 py-4 text-[var(--text-primary)] rounded-2xl font-black text-xs transition-all active:scale-95 shadow-2xl min-w-[280px] ${getButtonColor()}`}
                    >
                        <FiLayers size={18} />
                        <span>Create Custom Viewer</span>
                    </button>

                    <div className="mt-6 flex items-center gap-2 text-zinc-700 text-[10px] font-bold tracking-widest uppercase">
                        <div className="h-px w-8 bg-zinc-900" />
                        <span>Power User Tip</span>
                        <div className="h-px w-8 bg-zinc-900" />
                    </div>
                    <p className="text-zinc-800 text-[9px] font-medium leading-relaxed max-w-[240px]">
                        {hint || `Build a specialized viewer to cater to unique APIs like LinkedIn, Reddit, or X.`}
                    </p>
                </div>
            </div>
        </div>
    );
};
