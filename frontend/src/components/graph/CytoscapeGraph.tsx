"use client";

import React, { useEffect, useRef, useState } from "react";
import cytoscape, { Core, EventObject } from "cytoscape";
import {
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Filter,
  Search,
  Route,
  Info,
  Maximize2,
  SlidersHorizontal,
  ExternalLink
} from "lucide-react";
import { api } from "@/services/api";
import { CytoscapePayload, CytoscapeNodeData, ShortestPathResponse } from "@/types";

// Cytoscape Prototype Guard: Protects against internal Cytoscape race condition
// where endBatch() or headless() is called during/after cy.destroy()
if (typeof window !== "undefined") {
  try {
    const dummy = (cytoscape as any)({ headless: true });
    const proto = Object.getPrototypeOf(dummy);
    if (proto && !proto._safePatched) {
      const origHeadless = proto.headless;
      proto.headless = function () {
        if (!this._private || !this._private.renderer) return true;
        return origHeadless.apply(this, arguments);
      };

      const origEndBatch = proto.endBatch;
      proto.endBatch = function () {
        if (this._private && (this._private.destroyed || !this.renderer())) {
          this._private.batchCount = Math.max(0, (this._private.batchCount || 1) - 1);
          return this;
        }
        return origEndBatch.apply(this, arguments);
      };

      proto._safePatched = true;
    }
    dummy.destroy();
  } catch (e) {
    // ignore
  }
}

export const CytoscapeGraph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const layoutRef = useRef<any>(null);

  const [graphData, setGraphData] = useState<CytoscapePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minLift, setMinLift] = useState<number>(1.5);
  const [debouncedMinLift, setDebouncedMinLift] = useState<number>(1.5);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<CytoscapeNodeData | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<any | null>(null);

  // Debounce slider adjustments to avoid spamming the backend & graph renderer
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinLift(minLift);
    }, 200);
    return () => clearTimeout(timer);
  }, [minLift]);

  // Path Finder
  const [sourceNode, setSourceNode] = useState<string>("");
  const [targetNode, setTargetNode] = useState<string>("");
  const [pathResult, setPathResult] = useState<ShortestPathResponse | null>(null);
  const [pathLoading, setPathLoading] = useState<boolean>(false);

  // Fetch graph elements
  const fetchGraph = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCytoscapeGraph({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        minLift: debouncedMinLift,
        maxNodes: 120,
        search: searchQuery.trim() || undefined
      });
      setGraphData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load graph data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [selectedCategory, debouncedMinLift]);

  // Initialize and update Cytoscape instance
  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    const elements = [
      ...graphData.elements.nodes.map((n) => ({
        data: n.data
      })),
      ...graphData.elements.edges.map((e) => ({
        data: e.data
      }))
    ];

    try {
      let cy = cyRef.current;

      if (!cy || cy.destroyed()) {
        cy = cytoscape({
          container: containerRef.current,
          elements: elements,
          style: [
            {
              selector: "node",
              style: {
                "background-color": "data(color)",
                label: "data(label)",
                color: "#e2e8f0",
                "font-size": "9px",
                "font-family": "JetBrains Mono, monospace",
                "text-valign": "bottom",
                "text-margin-y": 4,
                "text-background-color": "#070b12",
                "text-background-opacity": 0.8,
                "text-background-padding": "2px",
                width: "mapData(degree, 1, 30, 16, 36)",
                height: "mapData(degree, 1, 30, 16, 36)",
                "border-width": 1.5,
                "border-color": "#1e2c42"
              }
            },
            {
              selector: "node:selected",
              style: {
                "border-color": "#00e5ff",
                "border-width": 3,
                "overlay-color": "#00e5ff",
                "overlay-opacity": 0.2,
                "overlay-padding": 6
              }
            },
            {
              selector: "edge",
              style: {
                width: "mapData(lift, 1.5, 6.0, 1, 3.5)",
                "line-color": "#2a3d5c",
                "curve-style": "bezier",
                opacity: 0.7,
                label: "data(predicate)",
                "font-size": "7px",
                "font-family": "JetBrains Mono, monospace",
                color: "#64748b",
                "text-background-color": "#070b12",
                "text-background-opacity": 0.8,
                "text-rotation": "autorotate"
              }
            },
            {
              selector: "edge:selected",
              style: {
                "line-color": "#00e5ff",
                width: 3,
                opacity: 1
              }
            },
            {
              selector: ".highlighted",
              style: {
                "border-color": "#00e5ff",
                "border-width": 3,
                "line-color": "#00e5ff",
                width: 3.5,
                opacity: 1
              }
            },
            {
              selector: ".faded",
              style: {
                opacity: 0.15
              }
            }
          ]
        });

        cy.on("tap", "node", (evt: EventObject) => {
          const node = evt.target;
          setSelectedNode(node.data());
          setSelectedEdge(null);

          // Highlight direct neighbors
          cy.elements().removeClass("highlighted faded");
          const neighborhood = node.neighborhood().add(node);
          cy.elements().not(neighborhood).addClass("faded");
          neighborhood.addClass("highlighted");
        });

        cy.on("tap", "edge", (evt: EventObject) => {
          const edge = evt.target;
          setSelectedEdge(edge.data());
          setSelectedNode(null);
        });

        cy.on("tap", (evt: EventObject) => {
          if (evt.target === cy) {
            cy.elements().removeClass("highlighted faded");
            setSelectedNode(null);
            setSelectedEdge(null);
          }
        });

        cyRef.current = cy;
      } else {
        // Reuse existing canvas and elements pool
        if (layoutRef.current) {
          try {
            layoutRef.current.stop();
          } catch (e) {}
          layoutRef.current = null;
        }

        cy.batch(() => {
          cy.elements().remove();
          cy.add(elements);
        });
      }

      if (layoutRef.current) {
        try {
          layoutRef.current.stop();
        } catch (e) {}
        layoutRef.current = null;
      }

      const layout = cy.layout({
        name: "cose",
        animate: false,
        idealEdgeLength: () => 90,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: () => 400000,
        edgeElasticity: () => 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 500,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      });

      layoutRef.current = layout;
      layout.run();
    } catch (err) {
      console.warn("Cytoscape init/update error:", err);
    }
  }, [graphData]);

  // Teardown once on component unmount
  useEffect(() => {
    return () => {
      if (layoutRef.current) {
        try {
          layoutRef.current.stop();
        } catch (e) {}
        layoutRef.current = null;
      }
      if (cyRef.current) {
        try {
          cyRef.current.removeAllListeners();
          cyRef.current.stop();
          cyRef.current.elements().stop();
          cyRef.current.elements().remove();
          if (!cyRef.current.destroyed()) {
            cyRef.current.destroy();
          }
        } catch (e) {
          console.warn("Cytoscape unmount error:", e);
        }
        cyRef.current = null;
      }
    };
  }, []);

  // Graph Action Controls
  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit();
  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.elements().removeClass("highlighted faded");
      cyRef.current.fit();
      setSelectedNode(null);
      setSelectedEdge(null);
      setPathResult(null);
    }
  };

  const handleSearchNodes = () => {
    fetchGraph();
  };

  const handleFindPath = async () => {
    if (!sourceNode || !targetNode) return;
    try {
      setPathLoading(true);
      const res = await api.findPath(sourceNode, targetNode, 3);
      setPathResult(res);

      if (res.found && cyRef.current) {
        cyRef.current.elements().removeClass("highlighted faded");
        const pathLabels = new Set(res.path);
        const matchedNodes = cyRef.current.nodes().filter((n) => pathLabels.has(n.data("label")));
        const matchedEdges = cyRef.current.edges().filter((e) => {
          return pathLabels.has(e.source().data("label")) && pathLabels.has(e.target().data("label"));
        });

        const activeElements = matchedNodes.add(matchedEdges);
        cyRef.current.elements().not(activeElements).addClass("faded");
        activeElements.addClass("highlighted");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPathLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-terminal-bg select-none">
      {/* Central Visual Graph Canvas */}
      <div className="flex-1 flex flex-col h-full terminal-border-r">
        {/* Graph Toolbar */}
        <div className="h-11 bg-terminal-surface terminal-border-b px-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Ontology Relationship Explorer</span>
            </div>

            {/* Filter by Category */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3 h-3 text-slate-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 text-slate-200 px-2 py-0.5 rounded text-[11px] focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Categories</option>
                {graphData?.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Lift Slider */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <SlidersHorizontal className="w-3 h-3 text-slate-500" />
              <span className="text-[11px]">Min Lift:</span>
              <input
                type="range"
                min="1.5"
                max="4.0"
                step="0.1"
                value={minLift}
                onChange={(e) => setMinLift(parseFloat(e.target.value))}
                className="w-16 accent-sky-400 cursor-pointer"
              />
              <span className="text-amber-400 font-mono text-[11px] font-semibold tabular-nums">
                {minLift.toFixed(1)}x
              </span>
            </div>
          </div>

          {/* Node Search & Canvas Controls */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center px-2 py-0.5 bg-slate-900 border border-slate-700/80 rounded">
              <input
                type="text"
                placeholder="Find entity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchNodes()}
                className="bg-transparent text-[11px] text-slate-200 placeholder:text-slate-500 focus:outline-none w-28"
              />
              <button onClick={handleSearchNodes} className="text-slate-500 hover:text-sky-400">
                <Search className="w-3 h-3" />
              </button>
            </div>

            <div className="h-4 w-px bg-terminal-border mx-1" />

            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-sky-400 border border-slate-700/60"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-sky-400 border border-slate-700/60"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFit}
              title="Fit to Screen"
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-sky-400 border border-slate-700/60"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              title="Reset View"
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-sky-400 border border-slate-700/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cytoscape Container */}
        <div className="relative flex-1 w-full bg-[#070a10]">
          {loading && (
            <div className="absolute inset-0 bg-terminal-bg/80 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <span className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-sky-400 font-medium">Computing graph layout...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-terminal-panel terminal-border p-4 rounded-lg max-w-md text-center shadow-lg">
                <span className="text-red-400 text-xs font-semibold">Error Loading Graph</span>
                <p className="text-xs text-slate-400 mt-1">{error}</p>
                <button
                  onClick={fetchGraph}
                  className="mt-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-sky-400"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <div ref={containerRef} className="w-full h-full" />

          {/* Graph Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800/80 p-2.5 rounded-lg backdrop-blur text-[11px] space-y-1.5 z-10 shadow-lg">
            <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Ontology Palette</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                <span className="text-slate-300">Avenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                <span className="text-slate-300">Mutual Funds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#eab308]" />
                <span className="text-slate-300">Equity Market</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
                <span className="text-slate-300">Sovereign Bonds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f97316]" />
                <span className="text-slate-300">Fixed Deposits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ffd700]" />
                <span className="text-slate-300">Gold / Bullion</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Contextual Intelligence Panel */}
      <div className="w-80 bg-terminal-surface flex flex-col h-full overflow-y-auto shrink-0 select-text">
        {/* Panel Header */}
        <div className="h-11 bg-terminal-panel terminal-border-b px-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
            <Info className="w-3.5 h-3.5" />
            <span>Contextual Intelligence</span>
          </div>
        </div>

        {/* Selected Node Details */}
        {selectedNode ? (
          <div className="p-3.5 space-y-4">
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Selected Node</div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {selectedNode.label}
              </div>
              <div className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 border border-slate-700 text-amber-400">
                Category: {selectedNode.category}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Node Type:</span>
                <span className="text-slate-200 font-mono">{selectedNode.ntype}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Association Degree:</span>
                <span className="text-amber-400 font-mono font-semibold tabular-nums">{selectedNode.degree} Edges</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Survey Observations:</span>
                <span className="text-emerald-400 font-mono font-semibold tabular-nums">{selectedNode.records_count} Records</span>
              </div>
              {selectedNode.value && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Raw Attribute:</span>
                  <span className="text-slate-300">{selectedNode.value}</span>
                </div>
              )}
            </div>

            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Empirical Provenance</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extracted from empirical survey responses. Inter-connected by statistical lift
                measurements (&ge; 1.5). Systematically co-occurs with linked investor objectives.
              </p>
            </div>
          </div>
        ) : selectedEdge ? (
          <div className="p-3.5 space-y-4">
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Selected Association Tie</div>
              <div className="text-xs font-semibold text-sky-400 mt-1">
                {selectedEdge.source} ↔ {selectedEdge.target}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Predicate:</span>
                <span className="text-slate-200 font-mono">{selectedEdge.predicate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Statistical Lift:</span>
                <span className="text-amber-400 font-mono font-semibold tabular-nums">{selectedEdge.lift}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Co-Occurrence Count:</span>
                <span className="text-emerald-400 font-mono font-semibold tabular-nums">{selectedEdge.count} Pairs</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-slate-500 flex flex-col items-center justify-center flex-1">
            <Share2 className="w-8 h-8 text-slate-700 mb-2" />
            <span>Click any node or edge to inspect ontology attributes</span>
          </div>
        )}

        {/* Shortest Path Finder Section */}
        <div className="mt-auto terminal-border-t p-3 bg-slate-900/40 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <Route className="w-3.5 h-3.5" />
            <span>Dijkstra Weighted Pathfinder</span>
          </div>
          <div className="space-y-1.5">
            <input
              type="text"
              placeholder="Source entity [e.g. Mutual Funds]"
              value={sourceNode}
              onChange={(e) => setSourceNode(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-terminal-bg terminal-border rounded text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <input
              type="text"
              placeholder="Target entity [e.g. Safe Investment]"
              value={targetNode}
              onChange={(e) => setTargetNode(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-terminal-bg terminal-border rounded text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleFindPath}
              disabled={pathLoading || !sourceNode || !targetNode}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded text-xs font-medium text-sky-400 transition-colors disabled:opacity-50"
            >
              {pathLoading ? "Calculating Shortest Path..." : "Find Shortest Path (1/Lift)"}
            </button>
          </div>

          {pathResult && (
            <div className="mt-2 p-2.5 bg-slate-900 border border-slate-800 rounded text-xs">
              {pathResult.found ? (
                <div className="space-y-1">
                  <div className="text-emerald-400 font-medium">Path Found ({pathResult.path.length - 1} hops):</div>
                  <div className="text-slate-300 font-mono text-[11px] leading-relaxed">
                    {pathResult.path.join(" → ")}
                  </div>
                </div>
              ) : (
                <div className="text-red-400">No path found within 3 hops</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
