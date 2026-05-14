import React, { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ViewerBlock } from "@src/context/ViewerContext";
import { createPortal } from "react-dom";
import { BlockIndicator } from "./BlockIndicator";
import { BlockPreview } from "./BlockPreview";
import { BlockEditorView } from "./BlockEditorView";

interface BlockItemProps {
    block: ViewerBlock;
    result?: any;
    isViewerMode?: boolean;
    onDelete?: () => void;
    onUpdate?: (updates: Partial<ViewerBlock>) => void;
    onDebugWithAi?: (blockId: string, error: string) => void;
    index?: number;
    total?: number;
}

export const BlockItem = ({ block, result, onDelete, onUpdate, isViewerMode = false, onDebugWithAi, index = 0, total = 0 }: BlockItemProps) => {
    const [isEditingCode, setIsEditingCode] = useState(false);
    const [activeTab, setActiveTab] = useState<'js' | 'html' | 'css' | 'output'>('js');
    const [isMaximized, setIsMaximized] = useState(false);

    const isSmall = useMemo(() => {
        return block.colSpan < 4;
    }, [block.colSpan]);

    const isSideBySide = isEditingCode && (block.colSpan >= 8 || isMaximized);

    const placement = index === 0 ? 'bottom' : 'top';

    const component = (
        <div className={twMerge(
            `relative group bg-zinc-900/40 transition-all shadow-xl ${["col-span-1", "col-span-2", "col-span-3", "col-span-4", "col-span-5", "col-span-6", "col-span-7", "col-span-8", "col-span-9", "col-span-10", "col-span-11", "col-span-12"][(block.colSpan || 12) - 1]}`,
            isViewerMode ? "" : `border border-zinc-800 hover:border-blue-500`,
            isMaximized ? "h-full w-full" : ""
        )}>
            {/* CONTROL BAR */}
            {!isViewerMode && (
                <BlockIndicator
                    block={block}
                    isEditingCode={isEditingCode}
                    isMaximized={isMaximized}
                    isSmall={isSmall}
                    setIsMaximized={setIsMaximized}
                    setIsEditingCode={setIsEditingCode}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    placement={placement}
                    outside={true}
                />
            )}

            <div className={twMerge(
                "p-0 transition-all overflow-hidden rounded-lg", 
                isSideBySide ? "grid grid-cols-2" : "flex flex-col",
                isMaximized ? "h-full" : ""
            )}>
                <BlockPreview
                    block={block}
                    result={result}
                    isEditingCode={isEditingCode}
                    isMaximized={isMaximized}
                    onDebugWithAi={onDebugWithAi}
                />

                {!isViewerMode && isEditingCode && (
                    <BlockEditorView
                        block={block}
                        result={result}
                        isMaximized={isMaximized}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onUpdate={onUpdate}
                    />
                )}
            </div>
        </div>
    );

    if (isMaximized) {
        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-10">
                <div className="bg-[#111111] border border-zinc-800 rounded-xl shadow-2xl w-[90vw] h-[90vh] overflow-visible animate-in fade-in zoom-in duration-200 flex flex-col"
                    onClick={(e) => e.stopPropagation()}>
                    <div className="flex-1 overflow-hidden relative">
                        {component}
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    return component;
};