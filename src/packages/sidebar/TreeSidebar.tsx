import { useEffect, useMemo, useState } from "react";
import { BsPinAngleFill } from "react-icons/bs";
import { GrStorage } from "react-icons/gr";
import { LuAppWindow } from "react-icons/lu";
import { GoGlobe, GoSearch } from "react-icons/go";
import { VscListFlat, VscListTree } from "react-icons/vsc";
import { FiStar, FiLayers } from "react-icons/fi";

import { filterNode, SidebarTreeView, TreeNode } from "./TreeView";
import { twMerge } from "tailwind-merge";
import { useTrafficListContext } from "../main-content/context/TrafficList";
import {
  groupUrlsInTree,
  kTreeNodeIdPrefixSeparator,
} from "./parseUrlToTreeNode";

type FilterDisplayMode = "tree" | "flat";

export const TreeSidebar = () => {
  const { trafficList } = useTrafficListContext();

  const [query, setQuery] = useState("");
  const [filterDisplayMode, setFilterDisplayMode] =
    useState<FilterDisplayMode>("flat");
  const [filteredNodes, setFilteredNodes] = useState<
    {
      name: string;
      icon: React.ReactNode;
      nodes: TreeNode[];
    }[]
  >([]);

  const [filteredNodesCount, setFilteredNodesCount] = useState(0);

  const groupedTraffic = useMemo(() => {
    return {
      app: trafficList,
      domain: trafficList,
    };
  }, [trafficList]);

  const app = useMemo(() => {
    return {
      name: "App",
      icon: <LuAppWindow />,
      nodes: groupUrlsInTree("app", groupedTraffic.app, "app"),
    };
  }, [groupedTraffic]);

  const domain = useMemo(() => {
    return {
      name: "Domain",
      icon: <GoGlobe />,
      nodes: groupUrlsInTree("domain", groupedTraffic.domain, "domain"),
    };
  }, [groupedTraffic]);

  async function onClickNode(id: string) {
    const uuidAndUrl = id.split(kTreeNodeIdPrefixSeparator);
    const url = uuidAndUrl[1];
    console.log("Selected URL from sidebar:", url);
    // TODO: Implement a way to communicate with the active tab's FilterContext if needed
  }

  function flatMapNode(e: TreeNode | null, path: string = ""): TreeNode[] {
    if (!e) {
      return [];
    }

    const currentPath = path ? `${path}/${e.name}` : e.name;

    const selfWithoutChildren = {
      ...e,
      name: currentPath,
      children: undefined,
    } as TreeNode;

    if (e.children && e.children.length > 0) {
      const flatmappedChildren = e.children.flatMap((child) =>
        flatMapNode(child, currentPath)
      );
      return [selfWithoutChildren, ...flatmappedChildren];
    }

    return [selfWithoutChildren];
  }

  async function filterNodes(query: string) {
    let nodeFound = 0;

    const trees = [app, domain];
    const filtered = trees.map((tree) => ({
      ...tree,
      nodes: tree.nodes
        .map((e) => filterNode(query, e, () => (nodeFound += 1)))
        .filter((e) => e !== null),
    }));
    setFilteredNodesCount(nodeFound);
    switch (filterDisplayMode) {
      case "tree":
        //@ts-ignore
        setFilteredNodes(filtered);
        break;
      case "flat":
        const flatMapped = filtered
          .flatMap((e) => e.nodes)
          .flatMap((e) => flatMapNode(e));
        setFilteredNodes([
          {
            name: "Flattened",
            icon: <VscListFlat />,
            nodes: flatMapped,
          },
        ]);
        break;
    }
  }

  useEffect(() => {
    filterNodes(query);
  }, [filterDisplayMode, query]);

  const allTrees = [app, domain];

  return (
    <div className="bg-[var(--bg-surface)] border-r border-[var(--border-primary)] h-full w-full flex flex-col space-y-2">
      <div className="flex items-center space-x-2 w-full px-2 h-8 border-b border-[var(--border-primary)] bg-[var(--bg-surface-inset)]/20 shrink-0">
        <GoSearch className="text-[var(--text-muted)] shrink-0" size={12} />
        <input
          type="text"
          className="bg-transparent text-[11px] text-[var(--text-primary)] focus:outline-none w-full placeholder:text-[var(--text-muted)]"
          placeholder="Search endpoints..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div
        className={twMerge(
          "p-2 flex flex-col space-y-2 h-full w-full items-start overflow-scroll",
          query !== "" && "hidden"
        )}
      >
        <div className="flex flex-col space-y-2 items-start w-full">
          <div className="flex items-center space-x-1.5 px-1 shrink-0">
            <FiLayers className="text-[var(--text-muted)]" size={12} />
            <h2 className="font-bold text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">All Nodes</h2>
          </div>
          <div className="w-full space-y-1">
            {allTrees.map((e) => (
              <SidebarTreeView
                key={e.name}
                icon={e.icon}
                name={e.name}
                childrenNodes={e.nodes}
                onClick={(id) => onClickNode(id)}
              />
            ))}
          </div>
        </div>
      </div>
      <div
        className={twMerge(
          "flex flex-col space-y-2 items-start w-full max-h-full p-1",
          query === "" && "hidden"
        )}
      >
        <div className="flex flex-col w-full p-2 border-b border-[var(--border-primary)] bg-[var(--bg-surface-inset)]/10 shrink-0">
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col">
              <h2 className="text-[9px] uppercase tracking-wider font-bold text-[var(--text-muted)]">
                Search Results
              </h2>
              <span className="text-blue-400 text-[10px] font-mono">{filteredNodesCount} matches</span>
            </div>

            <div className="flex bg-[var(--bg-surface-inset)]/40 p-0.5 rounded-lg border border-[var(--border-primary)]">
              <button
                onClick={() => setFilterDisplayMode("tree")}
                className={twMerge(
                  "p-1 rounded-md transition-all flex items-center space-x-1",
                  filterDisplayMode === "tree" ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
                title="Tree View"
              >
                <VscListTree size={12} />
                <span className="text-[9px] font-bold uppercase px-1">Tree</span>
              </button>
              <button
                onClick={() => setFilterDisplayMode("flat")}
                className={twMerge(
                  "p-1 rounded-md transition-all flex items-center space-x-1",
                  filterDisplayMode === "flat" ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
                title="Flat View"
              >
                <VscListFlat size={12} />
                <span className="text-[9px] font-bold uppercase px-1">Flat</span>
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-scroll w-full">
          {filteredNodes.map((node) => (
            <SidebarTreeView
              key={node.name}
              name={node.name}
              icon={node.icon}
              childrenNodes={node.nodes}
              onClick={(id) => onClickNode(id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
