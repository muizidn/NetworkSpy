import React, { useState, useEffect } from "react";
import { FiX, FiLink, FiSave, FiGlobe, FiTarget } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

export interface MapRemoteModel {
  id: any;
  enabled: boolean;
  name: string;
  method: string;
  matching_rule: string;
  remote_url: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: MapRemoteModel) => void;
  initialData?: MapRemoteModel | null;
}

export const MapRemoteDialog: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState("");
  const [method, setMethod] = useState("ALL");
  const [matchingRule, setMatchingRule] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setMethod(initialData.method);
      setMatchingRule(initialData.matching_rule);
      setRemoteUrl(initialData.remote_url);
      setEnabled(initialData.enabled);
    } else {
      setName("");
      setMethod("ALL");
      setMatchingRule("");
      setRemoteUrl("");
      setEnabled(true);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      id: initialData?.id || null,
      enabled,
      name: name || "New Map Remote Rule",
      method,
      matching_rule: matchingRule,
      remote_url: remoteUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 flex items-center justify-between border-b border-zinc-900 bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <FiGlobe size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tighter">
                {initialData ? "Edit Map Remote Rule" : "New Map Remote Rule"}
              </h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Redirect traffic to another endpoint</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white hover:bg-zinc-800 p-2 rounded-xl transition-all"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Rule Name</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors">
                    <FiTarget size={14} />
                </div>
                <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Redirect Production to Staging"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-700"
                />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Method</label>
              <select 
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">ALL</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">URL Match Pattern</label>
              <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors">
                      <FiGlobe size={14} />
                  </div>
                  <input 
                    type="text"
                    value={matchingRule}
                    onChange={(e) => setMatchingRule(e.target.value)}
                    placeholder="e.g. api.production.com/*"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700 font-mono"
                  />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Map To (Remote URL)</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors">
                    <FiLink size={14} />
                </div>
                <input 
                    type="text"
                    value={remoteUrl}
                    onChange={(e) => setRemoteUrl(e.target.value)}
                    placeholder="https://api.staging.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700 font-mono"
                />
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-900/20 border-t border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3 ml-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
              <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Enabled</span>
            </label>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
            >
              <FiSave size={16} />
              <span>{initialData ? "Update Rule" : "Save Rule"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
