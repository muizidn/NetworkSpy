import React, { useState, useEffect } from "react";
import { FiX, FiFolder, FiSave } from "react-icons/fi";
import { open } from "@tauri-apps/plugin-dialog";

export interface MapLocalModel {
  id: string;
  enabled: boolean;
  name: string;
  method: string;
  matching_rule: string;
  local_path: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: MapLocalModel) => void;
  initialData?: MapLocalModel | null;
}

export const MapLocalDialog: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState("");
  const [method, setMethod] = useState("ALL");
  const [matchingRule, setMatchingRule] = useState("");
  const [localPath, setLocalPath] = useState("");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setMethod(initialData.method);
      setMatchingRule(initialData.matching_rule);
      setLocalPath(initialData.local_path);
      setEnabled(initialData.enabled);
    } else {
      setName("");
      setMethod("ALL");
      setMatchingRule("");
      setLocalPath("");
      setEnabled(true);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handlePickFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        directory: false,
      });
      if (selected && typeof selected === 'string') {
        setLocalPath(selected);
        if (!name) {
            const fileName = selected.split(/[/\\]/).pop();
            if (fileName) setName(fileName);
        }
      }
    } catch (e) {
      console.error("Failed to pick file:", e);
    }
  };

  const handleSave = () => {
    onSave({
      id: initialData?.id || "",
      enabled,
      name: name || "New Map Local Rule",
      method,
      matching_rule: matchingRule,
      local_path: localPath,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 flex items-center justify-between border-b border-zinc-900 bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <FiFolder size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tighter">
                {initialData ? "Edit Map Local Rule" : "New Map Local Rule"}
              </h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Redirect response to local file</p>
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
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mock API Response"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-700"
            />
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
              <input 
                type="text"
                value={matchingRule}
                onChange={(e) => setMatchingRule(e.target.value)}
                placeholder="e.g. api.example.com/v1/*"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Local File Path</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                placeholder="/path/to/local/file.json"
                className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700 font-mono"
              />
              <button 
                onClick={handlePickFile}
                className="px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl transition-all flex items-center justify-center shrink-0"
              >
                <FiFolder size={18} />
              </button>
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
