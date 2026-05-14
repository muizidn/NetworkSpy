import React, { useState, useRef, useEffect } from "react";
import { FiMinimize, FiMaximize, FiCode, FiTrash2, FiAlertCircle, FiChevronDown, FiPlus, FiMinus } from "react-icons/fi";
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

const CustomDropdown = ({ value, options, onChange, label, isVertical }: { 
    value: any, 
    options: number[], 
    onChange: (val: any) => void, 
    label: string,
    isVertical?: boolean
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-[9px] font-black text-white hover:bg-white/20 transition-colors focus:outline-none focus:border-white/40"
            >
                {!isVertical && <span className="text-white/60 mr-1">{label}</span>}
                {value}
                <FiChevronDown size={10} className={twMerge("transition-transform", isOpen ? "rotate-180" : "")} />
            </button>

            {isOpen && (
                <div className={twMerge(
                    "absolute z-[100] bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 overflow-hidden min-w-[60px]",
                    isVertical ? "left-full top-0 ml-2" : "top-full left-0 mt-1"
                )}>
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                        {options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => {
                                    onChange(opt);
                                    setIsOpen(false);
                                }}
                                className={twMerge(
                                    "w-full text-left px-3 py-1.5 text-[10px] font-bold transition-colors",
                                    value === opt ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                )}
                            >
                                {opt}{!isVertical && label === 'W' ? '/12' : ''}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const NumericInput = ({ value, onChange, label, isVertical }: { 
    value: number, 
    onChange: (val: number) => void, 
    label: string,
    isVertical?: boolean
}) => {
    return (
        <div className="flex items-center gap-1">
            {!isVertical && <span className="text-[9px] font-black text-white/60 uppercase tracking-widest leading-none mr-1">{label}</span>}
            <div className="flex items-center bg-white/10 border border-white/20 rounded overflow-hidden">
                <button 
                    onClick={() => onChange(Math.max(0, value - 4))}
                    className="p-1 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                    <FiMinus size={10} />
                </button>
                <div className="px-1 text-[9px] font-black text-white min-w-[20px] text-center border-x border-white/10">
                    {value}
                </div>
                <button 
                    onClick={() => onChange(value + 4)}
                    className="p-1 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                    <FiPlus size={10} />
                </button>
            </div>
        </div>
    );
};

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
        if (isMaximized) return "relative flex w-full bg-blue-600";
        
        let classes = "absolute hidden group-hover:flex z-[60] transition-all ";
        
        if (outside) {
            if (placement === 'top') classes += "bottom-full left-0 right-0 pb-1 h-9 items-start";
            if (placement === 'bottom') classes += "top-full left-0 right-0 pt-1 h-9 items-end";
            if (placement === 'left') classes += "right-full top-0 bottom-0 pr-1 w-9 flex-col items-start";
            if (placement === 'right') classes += "left-full top-0 bottom-0 pl-1 w-9 flex-col items-end";
        } else {
            if (placement === 'top') classes += "top-0 left-0 right-0 h-8 bg-blue-600";
            if (placement === 'bottom') classes += "bottom-0 left-0 right-0 h-8 bg-blue-600";
            if (placement === 'left') classes += "left-0 top-0 bottom-0 w-8 flex-col bg-blue-600";
            if (placement === 'right') classes += "right-0 top-0 bottom-0 w-8 flex-col bg-blue-600";
        }
        
        return classes;
    };

    return (
        <div className={twMerge(getPlacementClasses())}>
            <div className={twMerge(
                "flex items-center gap-1.5 h-8 px-1 bg-blue-600 shadow-xl",
                isVertical ? "flex-col py-1.5 w-8 h-full" : "flex-row px-1 w-full",
                outside && placement === 'top' ? "rounded-t-lg" : "",
                outside && placement === 'bottom' ? "rounded-b-lg" : "",
                outside && placement === 'left' ? "rounded-l-lg" : "",
                outside && placement === 'right' ? "rounded-r-lg" : ""
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
                            <CustomDropdown 
                                label="W"
                                value={block.colSpan || 12}
                                options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                                onChange={(val) => onUpdate?.({ colSpan: val })}
                                isVertical={isVertical}
                            />
                        </div>

                        <div className={twMerge(
                            "flex items-center gap-2 px-2",
                            isVertical ? "flex-col border-t border-white/20 pt-2 h-auto" : "flex-row border-l border-white/20 h-4"
                        )}>
                            <NumericInput 
                                label="P"
                                value={block.padding ?? 24}
                                onChange={(val) => onUpdate?.({ padding: val })}
                                isVertical={isVertical}
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
