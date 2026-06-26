import React, { useState, useRef, useEffect, useMemo } from "react";
import { FiPlus, FiTrash2, FiSend, FiSearch } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import type { HttpMethod } from "./UrlBar";

export interface SavedRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: { key: string; value: string }[];
  body: string | null;
  bodyType: "none" | "text" | "json";
  timestamp: number;
}

interface RequestListProps {
  requests: SavedRequest[];
  activeRequestId: string | null;
  onSelect: (request: SavedRequest) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onNewRequest: () => void;
  isCompact: boolean;
}

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  PATCH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
  HEAD: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  OPTIONS: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const EditableTitle: React.FC<{
  value: string;
  onSave: (name: string) => void;
}> = ({ value, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== value) {
      onSave(draft.trim());
    }
  };

  return editing ? (
    <input
      ref={inputRef}
      type="text"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onKeyDown={e => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") { setEditing(false); setDraft(value); }
      }}
      onBlur={commit}
      onClick={e => e.stopPropagation()}
      className="bg-transparent border-none rounded px-1.5 py-0.5 text-[11px] text-zinc-200 outline-none font-mono w-full"
    />
  ) : (
    <span
      className="text-[11px] font-mono truncate cursor-text"
      onClick={e => { e.stopPropagation(); setEditing(true); setDraft(value); }}
      title="Click to edit"
    >
      {value || "Untitled"}
    </span>
  );
};

const RequestList: React.FC<RequestListProps> = ({
  requests,
  activeRequestId,
  onSelect,
  onDelete,
  onRename,
  onNewRequest,
  isCompact,
}) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.toLowerCase();
    return requests.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.url.toLowerCase().includes(q) ||
      r.method.toLowerCase().includes(q)
    );
  }, [requests, search]);

  return (
    <div className="flex flex-col h-full select-none">
      <div className="px-4 py-4 border-b border-zinc-900 flex flex-col gap-3 bg-zinc-900/10">
        <div className="flex items-center justify-between">
          {!isCompact && (
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Requests</h2>
          )}
          <button
            onClick={onNewRequest}
            className={twMerge(
              "flex items-center gap-1 rounded-md border transition-all active:scale-95",
              isCompact
                ? "p-1.5 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                : "px-2.5 py-1.5 bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
            )}
            title="New request"
          >
            <FiPlus size={12} />
            {!isCompact && <span className="text-[10px] font-bold">New</span>}
          </button>
        </div>
        {!isCompact && (
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" size={12} />
            <input
              type="text"
              placeholder="Search requests..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-8 pr-3 py-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
        {filtered.map((req) => (
          <div
            key={req.id}
            onClick={() => onSelect(req)}
            className={twMerge(
              "group flex items-center rounded-md cursor-pointer transition-all",
              isCompact ? "px-0 py-2 justify-center" : "px-3 py-2 justify-between",
              activeRequestId === req.id
                ? "bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30"
                : "hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
            )}
          >
            <div className={twMerge("flex items-center gap-2 truncate flex-1 min-w-0", isCompact && "justify-center overflow-visible")}>
              <span
                className={twMerge(
                  "text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded border shrink-0",
                  methodColors[req.method] || "bg-zinc-800/50 text-zinc-500 border-zinc-700/50"
                )}
              >
                {isCompact ? req.method.charAt(0) : req.method}
              </span>
              {!isCompact && (
                <div className="truncate flex-1 min-w-0">
                  <EditableTitle
                    value={req.name}
                    onSave={(name) => onRename(req.id, name)}
                  />
                </div>
              )}
            </div>

            {!isCompact && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(req.id); }}
                className="p-1 hover:bg-rose-500/10 text-zinc-700 hover:text-rose-500 rounded transition-all opacity-0 group-hover:opacity-100 shrink-0"
              >
                <FiTrash2 size={12} />
              </button>
            )}
          </div>
        ))}

        {filtered.length === 0 && !isCompact && (
          <div className="px-3 py-8 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-600">
              {search ? <FiSearch size={16} /> : <FiSend size={16} />}
            </div>
            <p className="text-[10px] text-zinc-600">
              {search ? `No requests matching "${search}"` : "No requests yet. Start composing!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestList;
