import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiMinimize, FiMaximize, FiCode, FiTrash2, FiAlertCircle, FiChevronDown, FiPlus, FiMinus } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { ColSpanRange, ViewerBlock } from "@src/context/ViewerContext";

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

const CustomDropdown = ({ value, options, onChange, label, isVertical, onOpenChange }: {
    value: any,
    options: number[],
    onChange: (val: any) => void,
    label: string,
    isVertical?: boolean,
    onOpenChange?: (open: boolean) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    useEffect(() => {
        onOpenChange?.(isOpen);
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOpen = () => {
        if (!isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            if (isVertical) {
                setCoords({ top: rect.top, left: rect.right + 8 });
            } else {
                setCoords({ top: rect.bottom + 4, left: rect.left });
            }
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={toggleOpen}
                className="flex items-center gap-1 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-[9px] font-black text-white hover:bg-white/20 transition-colors focus:outline-none focus:border-white/40"
            >
                {!isVertical && <span className="text-white/60 mr-1">{label}</span>}
                {value}
                <FiChevronDown size={10} className={twMerge("transition-transform", isOpen ? "rotate-180" : "")} />
            </button>

            {isOpen && createPortal(
                <div
                    className="fixed z-[99999] bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 overflow-hidden min-w-[60px]"
                    style={{ top: coords.top, left: coords.left }}
                >
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
                </div>,
                document.body
            )}
        </div>
    );
};

const NumericInput = ({ value, onChange, label, isVertical, min = 0, max = 100, step = 4 }: {
    value: number,
    onChange: (val: number) => void,
    label: string,
    isVertical?: boolean,
    min?: number,
    max?: number,
    step?: number
}) => {
    return (
        <div className="flex items-center gap-1">
            {!isVertical && <span className="text-[9px] font-black text-white/60 uppercase tracking-widest leading-none mr-1">{label}</span>}
            <div className="flex items-center bg-white/10 border border-white/20 rounded overflow-hidden">
                <button
                    onClick={() => onChange(Math.max(min, value - step))}
                    disabled={value <= min}
                    className="p-1 hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-20"
                >
                    <FiMinus size={10} />
                </button>
                <div className="px-1 text-[9px] font-black text-white min-w-[20px] text-center border-x border-white/10">
                    {value}
                </div>
                <button
                    onClick={() => onChange(Math.min(max, value + step))}
                    disabled={value >= max}
                    className="p-1 hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-20"
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
    const [hasOpenDropdown, setHasOpenDropdown] = useState(false);

    const getPlacementClasses = () => {
        if (isMaximized) return "relative flex w-full bg-blue-600";

        let classes = twMerge(
            "absolute z-[60] transition-all",
            hasOpenDropdown ? "flex" : "hidden group-hover:flex"
        );

        if (outside) {
            if (placement === 'top') classes += " bottom-full left-[-1px] right-[-1px] mb-[-2px] h-8 items-start";
            if (placement === 'bottom') classes += " top-full left-[-1px] right-[-1px] mt-[-2px] h-8 items-end";
            if (placement === 'left') classes += " right-full top-[-1px] bottom-[-1px] mr-[-2px] w-8 flex-col items-start";
            if (placement === 'right') classes += " left-full top-[-1px] bottom-[-1px] ml-[-2px] w-8 flex-col items-end";
        } else {
            if (placement === 'top') classes += " top-0 left-0 right-0 h-8 bg-blue-600";
            if (placement === 'bottom') classes += " bottom-0 left-0 right-0 h-8 bg-blue-600";
            if (placement === 'left') classes += " left-0 top-0 bottom-0 w-8 flex-col bg-blue-600";
            if (placement === 'right') classes += " right-0 top-0 bottom-0 w-8 flex-col bg-blue-600";
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

                <div className={twMerge(
                    "flex-1 flex gap-1.5 min-w-0 items-center",
                    isVertical ? "flex-col overflow-y-auto no-scrollbar py-1" : "flex-row overflow-x-auto no-scrollbar px-1"
                )}>
                    {(isMaximized || (block.colSpan || 12) >= 6) && (
                        <button
                            onClick={() => setIsEditingCode(!isEditingCode)}
                            className={twMerge(
                                "p-1.5 rounded transition-all shrink-0",
                                isEditingCode
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-white/80 hover:text-white hover:bg-white/10"
                            )}
                            title="Edit Logic Script"
                        >
                            <FiCode size={14} />
                        </button>
                    )}

                    <div className={twMerge(
                        "flex items-center gap-2 px-2 shrink-0",
                        isVertical ? "flex-col border-t border-white/20 pt-2 h-auto" : "flex-row border-l border-white/20 ml-1 h-4"
                    )}>
                        <NumericInput
                            label="W"
                            value={block.colSpan || 12}
                            min={1}
                            max={12}
                            step={1}
                            onChange={(val) => onUpdate?.({ colSpan: val as ColSpanRange })}
                            isVertical={isVertical}
                        />
                    </div>

                    <div className={twMerge(
                        "flex items-center gap-2 px-2 shrink-0",
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
                            "flex items-center gap-2 px-2 group/unsafe relative shrink-0",
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
                </div>

                <button
                    onClick={onDelete}
                    className={twMerge(
                        "p-1.5 text-white/80 hover:text-red-200 hover:bg-red-500/20 rounded transition-all shrink-0",
                        isVertical ? "" : "ml-auto"
                    )}
                    title="Delete Block"
                >
                    <FiTrash2 size={14} />
                </button>
            </div>
        </div>
    );
};
