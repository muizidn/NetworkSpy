import React, { useCallback, useMemo, useEffect } from "react";
import {
  TableView,
  TableViewContextMenuRenderer,
  TableViewHeader,
} from "../ui/TableView";
import { ClientRenderer, ImageRenderer, TagsRenderer, TextRenderer, UrlRenderer } from "./Renderers";
import { useTrafficListContext } from "./context/TrafficList";
import { useFilterContext } from "@src/context/FilterContext";
import { TrafficItemMap } from "./model/TrafficItemMap";
import { invoke } from "@tauri-apps/api/core";
import { useAppProvider } from "../app-env";
import { listen, emit } from "@tauri-apps/api/event";
import { save } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { FiLock, FiUnlock, FiZap } from "react-icons/fi";
import { Menu, MenuItem, Submenu } from "@tauri-apps/api/menu";

type TauriInvokeFn = <T>(cmd: string, args?: any) => Promise<T>;

export const TrafficList: React.FC = () => {
  const { selections, setSelections, setTrafficList, setTrafficSet } = useTrafficListContext();
  const { filteredTraffic } = useFilterContext();
  const { isRun } = useAppProvider();

  useEffect(() => {
    const unlistenExport = listen<{ ids: string[] }>("export_selected", async (event) => {
      try {
        const ids = event.payload.ids;
        if (!ids || ids.length === 0) return;

        const path = await save({
          filters: [
            {
              name: "HAR Capture",
              extensions: ["har"],
            },
          ],
        });

        if (path) {
          await invoke("export_selected_session", { path, ids });
        }
      } catch (err) {
        console.error("Failed to export selected items", err);
      }
    });

    const unlistenDelete = listen<{ ids: string[] }>("delete_selected", (event) => {
      const idsToDelete = new Set(event.payload.ids);

      setTrafficList(prev => prev.filter((item: TrafficItemMap) => !idsToDelete.has(String(item.id))));
      setTrafficSet(prev => {
        const next = { ...prev };
        event.payload.ids.forEach((id: string) => delete next[id]);
        return next;
      });
      setSelections({ firstSelected: null, others: null });
    });

    return () => {
      unlistenExport.then((f) => f());
      unlistenDelete.then((f) => f());
    };
  }, [setTrafficList, setTrafficSet, setSelections]);

  const headers: TableViewHeader<TrafficItemMap>[] = useMemo(() => [
    {
      title: "ID",
      renderer: {
        render: ({ input }: { input: TrafficItemMap }) => {
          const getStatusColor = (code: string, method: string) => {
            if (method === 'CONNECT') return 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.3)]';
            const c = parseInt(code);
            if (isNaN(c)) return 'bg-zinc-600'; // Pending
            if (c >= 500) return 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]';
            if (c >= 400) return 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.3)]';
            if (c >= 300) return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]';
            if (c >= 200) return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]';
            if (c >= 100) return 'bg-zinc-400 shadow-[0_0_8px_rgba(161,161,170,0.3)]';
            return 'bg-zinc-600';
          };

          return (
            <div className="flex items-center gap-2 px-1">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusColor(String(input.code), String(input.method))}`} />
              <span className="truncate opacity-80 font-mono text-[10px]">{input.id as string}</span>
            </div>
          );
        }
      },
      minWidth: 70,
      sortable: true,
      compareValue: (a: any, b: any) => (Number(a) < Number(b) ? -1 : 1),
    },
    {
      title: "SSL",
      renderer: {
        render: ({ input }: { input: TrafficItemMap }) => {
          const intercepted = input.intercepted as boolean;
          const tags = input.tags as string[] || [];
          const isModified = tags.some(t => t.startsWith('BREAKPOINT_'));

          return (
            <div className="flex items-center justify-center gap-1.5 h-full">
              <div className={`${intercepted ? 'text-purple-400' : 'text-zinc-500'}`} title={intercepted ? 'Intercepted (Decrypted)' : 'Tunneled (Encrypted)'}>
                {intercepted ? <FiUnlock size={14} /> : <FiLock size={14} />}
              </div>
              {isModified && (
                <div className="text-blue-400 animate-pulse" title="Modified via Breakpoint">
                  <FiZap size={12} />
                </div>
              )}
            </div>
          );
        }
      },
      minWidth: 50,
    },
    { title: "Tags", renderer: new TagsRenderer("tags"), minWidth: 100 },
    { title: "URL", renderer: new UrlRenderer(), minWidth: 400 },
    { title: "Client", renderer: new ClientRenderer("client"), minWidth: 200 },
    { title: "Method", renderer: new TextRenderer("method") },
    { title: "Code", renderer: new TextRenderer("code") },
    {
      title: "Time",
      renderer: new TextRenderer("time"),
      sortable: true,
      compareValue: (a: any, b: any) => (a.timestamp < b.timestamp ? -1 : 1),
    },
    { title: "Duration", renderer: new TextRenderer("duration") },
    { title: "Request", renderer: new TextRenderer("request") },
    { title: "Response", renderer: new TextRenderer("response") },
  ], []);

  const contextMenuRenderer = useMemo(() => new TrafficListContextMenuRenderer(invoke), []);

  const handleSelectedRowChanged = useCallback((first: TrafficItemMap | null, items: TrafficItemMap[] | null) => {
    setSelections({ firstSelected: first, others: items });
  }, [setSelections]);

  return (
    <TableView
      headers={headers}
      data={filteredTraffic}
      selectedItems={selections.others}
      contextMenuRenderer={contextMenuRenderer}
      onSelectedRowChanged={handleSelectedRowChanged}
      isAllowAutoScroll={true}
      isAutoScroll={isRun}
    />
  );
};


class TrafficListContextMenuRenderer
  implements TableViewContextMenuRenderer<TrafficItemMap> {
  invoke: TauriInvokeFn;
  constructor(invoke: TauriInvokeFn) {
    this.invoke = invoke;
  }

  private async getRequestData(id: string) {
    const data = await this.invoke<any>("get_request_pair_data", { trafficId: id });
    if (data.body_path) {
      try {
        data.body = await readFile(data.body_path);
      } catch (e) {
        console.error("Failed to read body", e);
      }
    }
    return data;
  }

  private async getResponseData(id: string) {
    const data = await this.invoke<any>("get_response_pair_data", { trafficId: id });
    if (data.body_path) {
      try {
        data.body = await readFile(data.body_path);
      } catch (e) {
        console.error("Failed to read body", e);
      }
    }
    return data;
  }

  private decodeBody(body: any): string {
    if (!body) return "";
    if (body instanceof Uint8Array || Array.isArray(body)) {
      return new TextDecoder().decode(new Uint8Array(body));
    }
    return String(body);
  }

  async render(items: TrafficItemMap[], columnIndex?: number): Promise<void> {
    try {
      const ids = items.map((i) => i.id);
      const firstItem = items[0];

      const menuItems: any[] = [
        {
          id: "copy_url",
          text: "🔗 Copy URL",
          enabled: items.length === 1,
          action: () => {
            if (firstItem?.url) navigator.clipboard.writeText(String(firstItem.url));
          }
        },
        {
          id: "copy_curl",
          text: "🐚 Copy as cURL",
          enabled: items.length === 1,
          action: async () => {
            const data = await this.getRequestData(String(firstItem.id));
            const escapeShellArg = (arg: string): string => `'${arg.replace(/'/g, "'\\''")}'`;
            let command = `curl -X ${firstItem.method} ${escapeShellArg(String(firstItem.url))}`;
            data.headers.forEach((h: any) => {
              command += ` \\\n  -H ${escapeShellArg(`${h.key}: ${h.value}`)}`;
            });
            const body = this.decodeBody(data.body);
            if (body) command += ` \\\n  -d ${escapeShellArg(body)}`;
            navigator.clipboard.writeText(command);
          }
        },
        {
          id: "copy_cell",
          text: "📋 Copy Cell Value",
          enabled: items.length === 1 && columnIndex !== undefined && columnIndex !== -1,
          action: () => {
            const columns = ["id", "intercepted", "tags", "url", "client", "method", "code", "time", "duration", "request", "response"];
            const key = columns[columnIndex!];
            if (key && firstItem[key] !== undefined) {
              const val = firstItem[key];
              navigator.clipboard.writeText(Array.isArray(val) ? val.join(", ") : String(val));
            }
          }
        },
        {
          id: "copy_as",
          text: "📂 Copy as...",
          items: [
            {
              id: "copy_req_header",
              text: "📥 Request Headers",
              enabled: items.length === 1,
              action: async () => {
                const data = await this.getRequestData(String(firstItem.id));
                navigator.clipboard.writeText(data.headers.map((h: any) => `${h.key}: ${h.value}`).join("\n"));
              }
            },
            {
              id: "copy_req_cookie",
              text: "🍪 Request Cookies",
              enabled: items.length === 1,
              action: async () => {
                const data = await this.getRequestData(String(firstItem.id));
                const cookie = data.headers.find((h: any) => h.key.toLowerCase() === "cookie");
                if (cookie) navigator.clipboard.writeText(cookie.value);
              }
            },
            {
              id: "copy_req_body",
              text: "📄 Request Body",
              enabled: items.length === 1,
              action: async () => {
                const data = await this.getRequestData(String(firstItem.id));
                navigator.clipboard.writeText(this.decodeBody(data.body));
              }
            },
            { item: "Separator" },
            {
              id: "copy_res_header",
              text: "📤 Response Headers",
              enabled: items.length === 1,
              action: async () => {
                const data = await this.getResponseData(String(firstItem.id));
                navigator.clipboard.writeText(data.headers.map((h: any) => `${h.key}: ${h.value}`).join("\n"));
              }
            },
            {
              id: "copy_res_cookie",
              text: "🍪 Response Cookies",
              enabled: items.length === 1,
              action: async () => {
                const data = await this.getResponseData(String(firstItem.id));
                const cookie = data.headers.find((h: any) => h.key.toLowerCase() === "set-cookie");
                if (cookie) navigator.clipboard.writeText(cookie.value);
              }
            },
            {
              id: "copy_res_body",
              text: "📄 Response Body",
              enabled: items.length === 1,
              action: async () => {
                const data = await this.getResponseData(String(firstItem.id));
                navigator.clipboard.writeText(this.decodeBody(data.body));
              }
            },
            { item: "Separator" },
            {
              id: "copy_markdown",
              text: "📊 Markdown Table",
              enabled: items.length > 0,
              action: () => {
                const headers = ["ID", "Method", "Code", "URL", "Time"];
                const rows = items.map(i => `| ${i.id} | ${i.method} | ${i.code} | ${i.url} | ${i.time} |`);
                const table = `| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |\n${rows.join("\n")}`;
                navigator.clipboard.writeText(table);
              }
            },
            {
              id: "copy_csv",
              text: "📁 CSV",
              enabled: items.length > 0,
              action: () => {
                const headers = ["ID", "Method", "Code", "URL", "Time"];
                const rows = items.map(i => `"${i.id}","${i.method}","${i.code}","${i.url}","${i.time}"`);
                const csv = `${headers.map(h => `"${h}"`).join(",")}\n${rows.join("\n")}`;
                navigator.clipboard.writeText(csv);
              }
            }
          ]
        },
        { item: "Separator" },
        {
          id: "repeat",
          text: "🔄 Repeat",
          enabled: items.length === 1,
          action: async () => {
            await this.invoke("repeat_request", { trafficId: String(firstItem.id) });
          }
        },
        {
          id: "edit_repeat",
          text: "📝 Edit & Repeat",
          enabled: items.length === 1,
          action: async () => {
            await this.invoke("open_new_window", { context: `repeat:${firstItem.id}`, title: "Edit & Repeat" });
          }
        },
        { item: "Separator" },
        {
          id: "tools_menu",
          text: "🛠️ Tools",
          items: [
            {
              id: "tool_breakpoint",
              text: "🛑 Breakpoint",
              enabled: items.length === 1,
              action: async () => {
                await this.invoke("open_new_window", { context: `breakpoint:${firstItem.id}`, title: "Breakpoint Editor" });
              }
            }
          ]
        },
        { item: "Separator" },
        {
          id: "export_selected",
          text: `📦 Export ${items.length} items to HAR`,
          enabled: items.length > 0,
          action: () => {
            emit("export_selected", { ids });
          },
        },
        {
          id: "add_to_proxy_domain",
          text: "🌐 Add to Proxy List (Domain)",
          enabled: items.length === 1,
          action: async () => {
            const item = items[0];
            let domain = "";
            try {
              domain = new URL(item.url as string).hostname;
            } catch {
              domain = String(item.url);
            }
            await this.invoke("save_proxy_rule", {
              rule: {
                id: "",
                enabled: true,
                name: `Intercept ${domain}`,
                pattern: domain,
                action: "INTERCEPT"
              }
            });
          }
        },
        (() => {
          const item = items[0];
          if (!item || !item.client) return { id: "add_to_proxy_client", text: "📱 Add to Proxy List (Client)", enabled: false };

          try {
            const clientInfo = JSON.parse(item.client as string);
            const client = clientInfo.name || "-";

            return {
              id: "add_to_proxy_client",
              text: `📱 Add to Proxy List (Client: ${client})`,
              enabled: items.length === 1 && client !== "-",
              action: async () => {
                await this.invoke("save_proxy_rule", {
                  rule: {
                    id: "",
                    enabled: true,
                    name: `Intercept ${client}`,
                    pattern: `client:${client}`,
                    action: "INTERCEPT"
                  }
                });
              }
            };
          } catch {
            return { id: "add_to_proxy_client", text: "📱 Add to Proxy List (Client)", enabled: false };
          }
        })(),
        {
          id: "delete_selected",
          text: `🗑️ Delete ${items.length === 1 ? 'item' : `${items.length} items`}`,
          enabled: items.length > 0,
          action: () => {
            emit("delete_selected", { ids });
          },
        },
      ];

      const menu = await Menu.new({ items: menuItems });
      await menu.popup();
    } catch (e) {
      console.warn("Context menu is only available natively in Tauri", e);
    }
  }
}
