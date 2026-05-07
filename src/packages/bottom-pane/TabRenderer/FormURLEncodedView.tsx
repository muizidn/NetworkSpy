import { FiInfo, FiSearch } from "react-icons/fi";
import { TableView } from "../../ui/TableView";
import { KeyValueRenderer } from "../KeyValueRenderer";

export const FormURLEncodedView = ({ params }: { params: { key: string; value: string | string[] }[] }) => {
    if (!params || params.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#0d0d0d] select-none">
                <div className="w-16 h-16 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-6 shadow-2xl">
                    <FiInfo size={32} className="text-zinc-500 animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-white mb-2 tracking-widest uppercase">No Form Data Detected</h3>
                <p className="text-zinc-500 max-w-xs text-xs leading-relaxed font-medium">
                    This request body doesn't appear to be <span className="text-zinc-300 font-bold">application/x-www-form-urlencoded</span>.
                </p>
                
                <div className="mt-8 px-4 py-3 bg-zinc-900/30 rounded-xl border border-zinc-800/50 flex items-center gap-3">
                    <FiSearch className="text-indigo-500" size={14} />
                    <span className="text-[10px] text-zinc-400 font-bold tracking-tight">
                        Try searching for requests with <span className="text-indigo-400 font-mono italic">Content-Type: application/x-www-form-urlencoded</span>
                    </span>
                </div>
            </div>
        );
    }

    // Flatten params if any value is an array
    const flattenedParams = params.flatMap(param => 
      Array.isArray(param.value)
        ? param.value.map(val => ({ key: param.key, value: val }))
        : [{ key: param.key, value: param.value }]
    );
  
    return (
      <TableView
        headers={[
          {
            title: "Key",
            renderer: new KeyValueRenderer("key"),
          },
          {
            title: "Value",
            renderer: new KeyValueRenderer("value"),
          },
        ]}
        data={flattenedParams}
      />
    );
  };