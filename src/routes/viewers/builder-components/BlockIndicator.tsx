import React from "react";
import { FiMinimize, FiMaximize, FiCode, FiTrash2, FiAlertCircle } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { ViewerBlock } from "@src/context/ViewerContext";

interface BlockIndicatorProps {
    block: ViewerBlock;
    isEditingCode: boolean;
    isMaximized: boolean;
    isSmall: boolean;
    setIsMaximized: (val: boolean) => void;
    setIsEditingCode: (val: boolean) => void;
    onUpdate?: (updates: Partial<ViewerBlock>) => void;
    onDelete?: () => void;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    outside?: boolean;
}

export const BlockIndicator = ({
    block,
    isEditingCode,
    isMaximized,
    isSmall,
    setIsMaximized,
    setIsEditingCode,
    onUpdate,
    onDelete,
    placement = 'top',
    outside = false,
}: BlockIndicatorProps) => {
    const isVertical = placement === 'left' || placement === 'right';

    const getPlacementClasses = () => {
        if (isMaximized) return "relative flex w-full";
        
        let classes = "absolute hidden group-hover:flex z-[60] bg-blue-600 shadow-xl transition-all ";
        
        if (outside) {
            if (placement === 'top') classes += "bottom-full left-0 right-0 mb-1 h-8 rounded-t-lg";
            if (placement === 'bottom') classes += "top-full left-0 right-0 mt-1 h-8 rounded-b-lg";
            if (placement === 'left') classes += "right-full top-0 bottom-0 mr-1 w-8 rounded-l-lg flex-col";
            if (placement === 'right') classes += "left-full top-0 bottom-0 ml-1 w-8 rounded-r-lg flex-col";
        } else {
            if (placement === 'top') classes += "top-0 left-0 right-0 h-8";
            if (placement === 'bottom') classes += "bottom-0 left-0 right-0 h-8";
            if (placement === 'left') classes += "left-0 top-0 bottom-0 w-8 flex-col";
            if (placement === 'right') classes += "right-0 top-0 bottom-0 w-8 flex-col";
        }
        
        return classes;
    };

    return (
        <div className={twMerge(getPlacementClasses())}>
            <div className={twMerge(
                "flex items-center gap-1.5 h-full px-1",
                isVertical ? "flex-col py-1.5" : "flex-row px-1"
            )}>
                <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-all"
                    title="Focus Mode"
                >
                    {isMaximized ? <FiMinimize size={14} /> : <FiMaximize size={14} />}
                </button>

                {(isMaximized || !isSmall) && (
                    <div className={twMerge(
                        "flex items-center gap-1.5",
                        isVertical ? "flex-col" : "flex-row"
                    )}>
                        <button
                            onClick={() => setIsEditingCode(!isEditingCode)}
                            className={twMerge(
                                "p-1.5 rounded transition-all",
                                isEditingCode
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-white/80 hover:text-white hover:bg-white/10"
                            )}
                            title="Edit Logic Script"
                        >
                            <FiCode size={14} />
                        </button>

                        <div className={twMerge(
                            "flex items-center gap-2 px-2",
                            isVertical ? "flex-col border-t border-white/20 pt-2 h-auto" : "flex-row border-l border-white/20 ml-1 h-4"
                        )}>
                            {!isVertical && <span className="text-[9px] font-black text-white/60 uppercase tracking-widest leading-none">W</span>}
                            <select
                                value={block.colSpan || 12}
                                onChange={(e) => onUpdate?.({ colSpan: parseInt(e.target.value) as any })}
                                className="bg-white/10 border border-white/20 rounded px-1 py-0.5 text-[9px] font-black text-white focus:outline-none focus:border-white/40 cursor-pointer appearance-none hover:bg-white/20"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                                    <option key={n} value={n} className="bg-zinc-900 text-white">
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={twMerge(
                            "flex items-center gap-2 px-2",
                            isVertical ? "flex-col border-t border-white/20 pt-2 h-auto" : "flex-row border-l border-white/20 h-4"
                        )}>
                            {!isVertical && <span className="text-[9px] font-black text-white/60 uppercase tracking-widest leading-none">P</span>}
                            <input
                                type="number"
                                value={block.padding ?? 24}
                                onChange={(e) => onUpdate?.({ padding: parseInt(e.target.value) })}
                                className="w-6 bg-white/10 border border-white/20 rounded px-1 py-0.5 text-[9px] font-black text-white focus:outline-none focus:border-white/40"
                            />
                        </div>

                        {block.type === 'html' && (
                            <div className={twMerge(
                                "flex items-center gap-2 px-2 group/unsafe relative",
                                isVertical ? "flex-col border-t border-white/20 pt-2 h-auto" : "flex-row border-l border-white/20 ml-1 h-4"
                            )}>
                                <input
                                    type="checkbox"
                                    checked={block.unsafeHtml || false}
                                    onChange={(e) => onUpdate?.({ unsafeHtml: e.target.checked })}
                                    className="checkbox checkbox-xs border-white/40 focus:ring-0 checked:bg-red-500 rounded"
                                />
                                {!isVertical && (
                                    <span className="text-[9px] font-black text-white/60 uppercase tracking-widest cursor-default flex items-center gap-1 leading-none">
                                        Host
                                        <FiAlertCircle size={10} className="text-white/40 group-hover/unsafe:text-red-400" />
                                    </span>
                                )}
                                <div className={twMerge(
                                    "absolute w-64 p-2 bg-red-900 border border-red-700 rounded-lg text-[9px] text-red-100 hidden group-hover/unsafe:block z-[70] shadow-2xl leading-relaxed normal-case font-normal tracking-normal",
                                    isVertical ? "left-full top-0 ml-2" : "top-8 left-0"
                                )}>
                                    <span className="font-bold underline mb-1 block">SECURITY WARNING</span>
                                    Bypasses sandboxing. Only enable if you trust the rendered code.
                                </div>
                            </div>
                        )}

                        <button
                            onClick={onDelete}
                            className={twMerge(
                                "p-1.5 text-white/80 hover:text-red-200 hover:bg-red-500/20 rounded transition-all",
                                isVertical ? "" : "ml-auto"
                            )}
                            title="Delete Block"
                        >
                            <FiTrash2 size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
