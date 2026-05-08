import { Renderer, TableView } from "@src/packages/ui/TableView";
import React, { useState, useEffect } from "react";
import { ToolBaseHeader } from "@src/packages/ui/ToolBaseHeader";
import { MapRemoteDialog, MapRemoteModel as IMapRemoteModel } from "./components/MapRemoteDialog";
import { FiGlobe, FiCheck, FiTrash2, FiEdit3 } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { invoke } from "@tauri-apps/api/core";
import { useSearchParams } from "react-router-dom";

export class MapRemoteCellRenderer implements Renderer<IMapRemoteModel> {
  type: keyof IMapRemoteModel;
  onToggle?: (id: any, field: "enabled") => void;
  onDelete?: (id: any) => void;
  onEdit?: (item: IMapRemoteModel) => void;

  constructor(
      type: keyof IMapRemoteModel | "actions", 
      onToggle?: (id: any, field: "enabled") => void, 
      onDelete?: (id: any) => void,
      onEdit?: (item: IMapRemoteModel) => void
  ) {
    this.type = type as any;
    this.onToggle = onToggle;
    this.onDelete = onDelete;
    this.onEdit = onEdit;
  }

  render({ input }: { input: IMapRemoteModel }): React.ReactNode {
    let content: React.ReactNode;

    switch (this.type as string) {
      case "enabled":
        const isChecked = input.enabled;
        content = (
          <button
            onClick={() => this.onToggle?.(input.id, "enabled")}
            className={twMerge(
                "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                isChecked 
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40" 
                    : "bg-zinc-900 border-zinc-800 text-transparent hover:border-zinc-700"
            )}
          >
            <FiCheck size={12} />
          </button>
        );
        break;
      case "name":
        content = <span className="font-bold text-zinc-200">{input.name}</span>;
        break;
      case "method":
        content = (
            <span className={twMerge(
                "px-2 py-0.5 rounded text-[10px] font-black tracking-widest border",
                input.method === 'GET' ? 'bg-blue-950/30 text-blue-400 border-blue-900/50' : 
                input.method === 'POST' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' :
                'bg-zinc-900/30 text-zinc-400 border-zinc-800/50'
            )}>
                {input.method || 'ALL'}
            </span>
        );
        break;
      case "matching_rule":
        content = <code className="text-[10px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-500 font-mono shadow-inner group-hover:border-zinc-700 transition-colors uppercase tracking-widest truncate max-w-[280px]">{input.matching_rule}</code>;
        break;
      case "remote_url":
        content = <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[300px]">{input.remote_url}</span>;
        break;
      case "actions":
        content = (
            <div className="flex items-center gap-1">
                <button 
                    onClick={() => this.onEdit?.(input)}
                    className="text-zinc-600 hover:text-blue-500 transition-all p-1.5 rounded-md hover:bg-blue-500/10 active:scale-90"
                >
                    <FiEdit3 size={14} />
                </button>
                <button 
                    onClick={() => this.onDelete?.(input.id)}
                    className="text-zinc-600 hover:text-red-500 transition-all p-1.5 rounded-md hover:bg-red-500/10 active:scale-90 h-6 w-6"
                >
                    <FiTrash2 size={14} />
                </button>
            </div>
        )
        break;
      default:
        content = null;
        break;
    }

    return (
      <div className="flex items-center h-full">
        {content}
      </div>
    );
  }
}

export const MapRemote: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<IMapRemoteModel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IMapRemoteModel | null>(null);
  const [isGlobalEnabled, setIsGlobalEnabled] = useState(false);
  const [searchParams] = useSearchParams();

  const fetchRules = async () => {
    try {
        const rules = await invoke<IMapRemoteModel[]>("get_map_remote_rules");
        setData(rules);
        const enabled = await invoke<boolean>("get_map_remote_enabled");
        setIsGlobalEnabled(enabled);
    } catch (e) {
        console.error("Failed to fetch map remote state:", e);
    }
  };

  useEffect(() => {
    fetchRules();

    const trafficId = searchParams.get("id");
    if (trafficId) {
        handleOpenFromTraffic(trafficId);
    }
  }, []);

  const handleOpenFromTraffic = async (id: string) => {
    try {
        const traffic = await invoke<any>("get_all_metadata", { limit: 1000 });
        const item = traffic.find((t: any) => t.id === id);
        if (item) {
            setEditingItem({
                id: null,
                enabled: true,
                name: `Map Remote: ${new URL(item.uri).hostname}`,
                method: item.method,
                matching_rule: item.uri,
                remote_url: ""
            });
            setIsDialogOpen(true);
        }
    } catch (e) {
        console.error("Failed to fetch traffic metadata for map remote:", e);
    }
  };

  const toggleGlobal = async () => {
    const newState = !isGlobalEnabled;
    try {
        await invoke("set_map_remote_enabled", { enabled: newState });
        setIsGlobalEnabled(newState);
    } catch (e) {
        console.error("Failed to toggle global map remote:", e);
    }
  };

  const handleToggle = async (id: any, field: "enabled") => {
    const item = data.find(d => d.id === id);
    if (!item) return;

    const updatedItem = { ...item, [field]: !item[field] };
    try {
        await invoke("save_map_remote_rule", { rule: updatedItem });
        setData(prev => prev.map(d => d.id === id ? updatedItem : d));
    } catch (e) {
        console.error("Failed to update map remote rule:", e);
    }
  };

  const handleDelete = async (id: any) => {
    try {
        await invoke("delete_map_remote_rule", { id });
        setData(prev => prev.filter(d => d.id !== id));
    } catch (e) {
        console.error("Failed to delete map remote rule:", e);
    }
  };

  const handleSave = async (rule: IMapRemoteModel) => {
    try {
        await invoke("save_map_remote_rule", { rule });
        fetchRules();
        setIsDialogOpen(false);
        setEditingItem(null);
    } catch (e) {
        console.error("Failed to save map remote rule:", e);
    }
  };

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.matching_rule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.remote_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#050505] relative overflow-hidden">
      <ToolBaseHeader
        title="Map Remote"
        description="Redirect API requests to different remote endpoints"
        icon={<FiGlobe size={22} />}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAdd={() => {
            setEditingItem(null);
            setIsDialogOpen(true);
        }}
        onClear={async () => {
             for (const item of data) {
                 await handleDelete(item.id);
             }
        }}
        actions={
            <div 
                onClick={toggleGlobal}
                className={twMerge(
                    "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all cursor-pointer select-none",
                    isGlobalEnabled 
                        ? "bg-blue-950/20 border-blue-500/50 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                        : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
                )}
            >
                <div className={twMerge(
                    "w-2 h-2 rounded-full",
                    isGlobalEnabled ? "bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse" : "bg-zinc-700"
                )} />
                <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
                    {isGlobalEnabled ? "Map Remote Active" : "Map Remote Paused"}
                </span>
                <div className={twMerge(
                    "w-8 h-4 rounded-full relative transition-all bg-zinc-800/50",
                    isGlobalEnabled ? "bg-blue-500/30" : "bg-zinc-800"
                )}>
                    <div className={twMerge(
                        "absolute top-1 w-2 h-2 rounded-full transition-all duration-300",
                        isGlobalEnabled ? "right-1 bg-blue-400" : "left-1 bg-zinc-600"
                    )} />
                </div>
            </div>
        }
      />
      
      <div className="flex-grow min-h-0">
        <TableView
            headers={[
            {
                title: "Status",
                minWidth: 80,
                renderer: new MapRemoteCellRenderer("enabled", handleToggle),
            },
            {
                title: "Name",
                minWidth: 200,
                renderer: new MapRemoteCellRenderer("name"),
            },
            {
                title: "Method",
                minWidth: 100,
                renderer: new MapRemoteCellRenderer("method"),
            },
            {
                title: "Pattern",
                minWidth: 300,
                renderer: new MapRemoteCellRenderer("matching_rule"),
            },
            {
                title: "Remote URL",
                minWidth: 300,
                renderer: new MapRemoteCellRenderer("remote_url"),
            },
            {
                title: "",
                minWidth: 80,
                renderer: new MapRemoteCellRenderer("actions", undefined, handleDelete, (item) => {
                    setEditingItem(item);
                    setIsDialogOpen(true);
                }),
            },
            ]}
            data={filteredData}
        />
      </div>

      <MapRemoteDialog 
        isOpen={isDialogOpen} 
        onClose={() => {
            setIsDialogOpen(false);
            setEditingItem(null);
        }} 
        onSave={handleSave}
        initialData={editingItem}
      />
    </div>
  );
};
export default MapRemote;
