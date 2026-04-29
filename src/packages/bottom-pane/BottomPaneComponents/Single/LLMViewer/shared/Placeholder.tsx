import React from "react";

export const Placeholder = ({ text, icon = null }: { text: string, icon?: any }) => (
  <div className="h-full flex items-center justify-center text-zinc-500 bg-[#0d0d0d] p-6 @sm:p-10 text-center animate-in fade-in duration-500">
    <div className="flex flex-col items-center gap-6 max-w-sm">
      <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center text-zinc-700 shadow-2xl border border-white/5">
        {icon || <div className="text-4xl text-green-900 font-bold opacity-30">AI</div>}
      </div>
      <div className="space-y-2">
        <h3 className="text-white font-bold text-base tracking-tight italic uppercase">LLM Analytics</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">{text}</p>
      </div>
    </div>
  </div>
);
