import React, { useState, useEffect } from 'react';
import { Dialog } from '@src/packages/ui/Dialog';
import { FiLink, FiGlobe, FiTarget } from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';

export interface MapRemoteModel {
    id: any;
    name: string;
    matching_rule: string;
    method: string;
    remote_url: string;
    enabled: boolean;
}

interface MapRemoteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rule: MapRemoteModel) => void;
    initialData?: MapRemoteModel | null;
}

export const MapRemoteDialog: React.FC<MapRemoteDialogProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData
}) => {
    const [name, setName] = useState('');
    const [matchingRule, setMatchingRule] = useState('');
    const [method, setMethod] = useState('ALL');
    const [remoteUrl, setRemoteUrl] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setMatchingRule(initialData.matching_rule);
            setMethod(initialData.method);
            setRemoteUrl(initialData.remote_url);
        } else {
            setName('');
            setMatchingRule('');
            setMethod('ALL');
            setRemoteUrl('');
        }
    }, [initialData, isOpen]);

    const handleSave = () => {
        onSave({
            id: initialData?.id || null,
            name,
            matching_rule: matchingRule,
            method,
            remote_url: remoteUrl,
            enabled: initialData ? initialData.enabled : true
        });
    };

    return (
        <Dialog 
            isOpen={isOpen} 
            onClose={onClose} 
            title={initialData ? "Edit Map Remote Rule" : "New Map Remote Rule"}
            className="max-w-2xl"
        >
            <div className="space-y-6 py-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Rule Name</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors">
                            <FiTarget size={14} />
                        </div>
                        <input 
                            type="text" 
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                            placeholder="e.g. Redirect Production to Staging"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Method</label>
                        <select 
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium appearance-none"
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
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
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Matching Rule (URL/Glob)</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors">
                                <FiGlobe size={14} />
                            </div>
                            <input 
                                type="text" 
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                placeholder="e.g. api.production.com/*"
                                value={matchingRule}
                                onChange={(e) => setMatchingRule(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Map To (Remote URL)</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors">
                            <FiLink size={14} />
                        </div>
                        <input 
                            type="text" 
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                            placeholder="e.g. https://api.staging.com"
                            value={remoteUrl}
                            onChange={(e) => setRemoteUrl(e.target.value)}
                        />
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-2 px-1">
                        Requests matching the rule above will be redirected to this URL.
                    </p>
                </div>

                <div className="flex gap-3 pt-6">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-black text-[11px] uppercase tracking-widest hover:bg-zinc-800 hover:text-zinc-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-blue-500 shadow-xl shadow-blue-900/20 transition-all active:scale-95"
                    >
                        {initialData ? "Update Rule" : "Save Rule"}
                    </button>
                </div>
            </div>
        </Dialog>
    );
};
