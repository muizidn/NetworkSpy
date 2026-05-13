import React from "react";
import { Renderer } from "../../ui/TableView";
import { TrafficItemMap } from "../model/TrafficItemMap";
import { getHttpStatusInfo } from "@src/utils/httpStatusCodes";
import { twMerge } from "tailwind-merge";
import { useSetAtom } from "jotai";
import { statusInfoDialogAtom } from "@src/utils/trafficAtoms";


export class StatusCodeRenderer implements Renderer<TrafficItemMap> {
  render({ input }: { input: TrafficItemMap }): React.ReactNode {
    return <StatusCodeComponent input={input} />;
  }
}

const StatusCodeComponent = ({ input }: { input: TrafficItemMap }) => {
  const code = String(input.code || "");
  const info = getHttpStatusInfo(code);
  const setStatusDialog = useSetAtom(statusInfoDialogAtom);
  
  const getCodeColor = (code: string) => {
    if (code.startsWith('2')) return 'text-green-400';
    if (code.startsWith('3')) return 'text-blue-400';
    if (code.startsWith('4')) return 'text-yellow-400';
    if (code.startsWith('5')) return 'text-red-400';
    return 'text-zinc-400';
  };

  return (
    <div 
      className={twMerge('select-none text-xs font-mono px-2 truncate h-full flex items-center gap-1.5 cursor-help group active:scale-95 transition-transform', getCodeColor(code))}
      title={info?.description || code}
      onClick={(e) => {
        e.stopPropagation();
        setStatusDialog({ isOpen: true, code });
      }}
    >
      <span className="font-bold">{code}</span>
      {info && <span className="opacity-50 group-hover:opacity-100 transition-opacity text-[10px] font-sans font-bold uppercase tracking-tight">{info.message}</span>}
    </div>
  );
};

