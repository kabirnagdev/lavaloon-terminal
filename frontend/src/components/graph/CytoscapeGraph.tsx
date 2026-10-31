"use client";

import React, { useEffect, useRef, useState } from "react";
import cytoscape, { Core } from "cytoscape";
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
  Layers,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { api } from "@/services/api";
import { CytoscapePayload, CytoscapeNodeData, ShortestPathResponse } from "@/types";

// Cytoscape Prototype Guard: Protects against internal Cytoscape race condition
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
  const [selectedLayout, setSelectedLayout] = useState<string>("cose");
  const [selectedNode, setSelectedNode] = useState<CytoscapeNodeData | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<any | null>(null);

  // Debounce slider adjustments
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
        maxNodes: 140,
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

  const applyLayout = (cyInstance: Core, layoutName: string) => {
    if (!cyInstance) return;
    if (layoutRef.current) {
      try {
        layoutRef.current.stop();
      } catch (e) {}
    }

    let layoutConfig: any = { name: layoutName };
    if (layoutName === "cose") {
      layoutConfig = {
        name: "cose",
        animate: true,
        animationDuration: 400,
        idealEdgeLength: () => 80,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 35,
        randomize: false,
        componentSpacing: 80,
        nodeRepulsion: () => 350000,
        edgeElasticity: () => 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 400
      };
    } else if (layoutName === "concentric") {
      layoutConfig = {
        name: "concentric",
        fit: true,
        padding: 35,
        concentric: (node: any) => node.data("degree") || 1,
        levelWidth: () => 3
      };
    } else if (layoutName === "breadthfirst") {
      layoutConfig = {
        name: "breadthfirst",
        directed: true,
        fit: true,
        padding: 35,
        spacingFactor: 1.2
      };
    } else if (layoutName === "circle") {
      layoutConfig = {
        name: "circle",
        fit: true,
        padding: 35
      };
    }

    const layout = cyInstance.layout(layoutConfig);
    layoutRef.current = layout;
    layout.run();
  };

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
                color: "#94a3b8",
                "font-size": "9px",
                "font-family": "Inter, -apple-system, sans-serif",
                "text-valign": "bottom",
                "text-margin-y": 4,
                "text-background-color": "#080b11",
                "text-background-opacity": 0.85,
                "text-background-padding": "2px",
                width: "mapData(degree, 1, 30, 14, 32)",
                height: "mapData(degree, 1, 30, 14, 32)",
                "border-width": 1.5,
                "border-color": "#1e293b"
              }
            },
            {
              selector: "node:selected",
              style: {
                "border-color": "#38bdf8",
                "border-width": 2.5,
                color: "#f8fafc",
                "text-background-color": "#0284c7"
              }
            },
            {
              selector: "edge",
              style: {
                width: "mapData(lift, 1.5, 5, 1, 2.5)",
                "line-color": "#334155",
                "target-arrow-color": "#334155",
                "target-arrow-shape": "triangle",
                "curve-style": "bezier",
                "arrow-scale": 0.7,
                opacity: 0.55
              }
            },
            {
              selector: "edge:selected",
              style: {
                "line-color": "#38bdf8",
                "target-arrow-color": "#38bdf8",
                width: 3,
                opacity: 1
              }
            },
            {
              selector: ".highlighted",
              style: {
                "background-color": "#38bdf8",
                "line-color": "#38bdf8",
                "target-arrow-color": "#38bdf8",
                "border-color": "#f8fafc",
                "border-width": 2,
                opacity: 1,
                "z-index": 999
              }
            },
            {
              selector: ".faded",
              style: {
                opacity: 0.12
              }
            }
          ]
        });

        cyRef.current = cy;

        // Node click handler
        cy.on("tap", "node", (evt: any) => {
          const node = evt.target;
          setSelectedNode(node.data());
          setSelectedEdge(null);

          // Focus neighborhood
          cy?.elements().removeClass("highlighted faded");
          const neighborhood = node.neighborhood().add(node);
          cy?.elements().not(neighborhood).addClass("faded");
          neighborhood.addClass("highlighted");
        });

        // Edge click handler
        cy.on("tap", "edge", (evt: any) => {
          const edge = evt.target;
          setSelectedEdge(edge.data());
          setSelectedNode(null);

          cy?.elements().removeClass("highlighted faded");
          const connected = edge.connectedNodes().add(edge);
          cy?.elements().not(connected).addClass("faded");
          connected.addClass("highlighted");
        });

        // Background click
        cy.on("tap", (evt: any) => {
          if (evt.target === cy) {
            cy?.elements().removeClass("highlighted faded");
            setSelectedNode(null);
            setSelectedEdge(null);
          }
        });
      } else {
        cy.elements().remove();
        cy.add(elements);
      }

      applyLayout(cy, selectedLayout);
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

  // Controls
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

  const handleLayoutChange = (newLayout: string) => {
    setSelectedLayout(newLayout);
    if (cyRef.current) {
      applyLayout(cyRef.current, newLayout);
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
    <div className="flex h-full w-full bg-[#080b11] select-none text-slate-200">
      {/* Central Visual Graph Canvas */}
      <div className="flex-1 flex flex-col h-full border-r border-[#1a2234]">
        {/* Graph Toolbar */}
        <div className="h-10 bg-[#0c1017] border-b border-[#1a2234] px-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100 uppercase tracking-wider">
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Ontology Relationship Explorer</span>
            </div>

            {/* Filter by Category */}
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Filter className="w-3 h-3 text-slate-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#111622] border border-[#1a2234] text-slate-300 px-2 py-0.5 rounded text-[11px] focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Ontology Categories</option>
                {graphData?.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Layout Selector */}
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Layers className="w-3 h-3 text-slate-500" />
              <select
                value={selectedLayout}
                onChange={(e) => handleLayoutChange(e.target.value)}
                className="bg-[#111622] border border-[#1a2234] text-slate-300 px-2 py-0.5 rounded text-[11px] focus:outline-none focus:border-sky-500"
              >
                <option value="cose">Force-Directed (CoSE)</option>
                <option value="concentric">Concentric (Degree)</option>
                <option value="breadthfirst">Breadth-First (Hierarchical)</option>
                <option value="circle">Circular Topology</option>
              </select>
            </div>

            {/* Min Lift Slider */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <SlidersHorizontal className="w-3 h-3 text-slate-500" />
              <span className="text-[11px]">Lift:</span>
              <input
                type="range"
                min="1.5"
                max="4.0"
                step="0.1"
                value={minLift}
                onChange={(e) => setMinLift(parseFloat(e.target.value))}
                className="w-14 accent-sky-400 cursor-pointer"
              />
              <span className="text-slate-200 text-[11px] font-medium tabular-nums">
                {minLift.toFixed(1)}x
              </span>
            </div>
          </div>

          {/* Node Search & Canvas Controls */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center px-2 py-0.5 bg-[#111622] border border-[#1a2234] rounded">
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

            <div className="h-4 w-px bg-[#1a2234] mx-0.5" />

            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 hover:bg-[#111622] rounded text-slate-400 hover:text-slate-200 border border-[#1a2234]"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 hover:bg-[#111622] rounded text-slate-400 hover:text-slate-200 border border-[#1a2234]"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFit}
              title="Fit to Screen"
              className="p-1 hover:bg-[#111622] rounded text-slate-400 hover:text-slate-200 border border-[#1a2234]"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              title="Reset View"
              className="p-1 hover:bg-[#111622] rounded text-slate-400 hover:text-slate-200 border border-[#1a2234]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cytoscape Container */}
        <div className="relative flex-1 w-full bg-[#070a10]">
          {loading && (
            <div className="absolute inset-0 bg-[#080b11]/85 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-300">Computing ontology layout...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-[#0c1017] border border-rose-900/50 p-4 rounded max-w-md text-center">
                <span className="text-rose-400 text-xs font-semibold">Error Loading Graph</span>
                <p className="text-xs text-slate-400 mt-1">{error}</p>
                <button
                  onClick={fetchGraph}
                  className="mt-3 px-3 py-1 bg-[#111622] hover:bg-slate-800 border border-[#1a2234] rounded text-xs text-sky-400"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <div ref={containerRef} className="w-full h-full" />

          {/* Graph Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-[#0c1017]/95 border border-[#1a2234] p-2.5 rounded text-[11px] space-y-1.5 z-10 shadow-sm">
            <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Ontology Legend</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-sky-400" />
                <span className="text-slate-300">Corporate Filer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-teal-400" />
                <span className="text-slate-300">Business Segment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-slate-400" />
                <span className="text-slate-300">Financial Metric</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-amber-400" />
                <span className="text-slate-300">Risk Disclosure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-indigo-400" />
                <span className="text-slate-300">Survey Avenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-rose-400" />
                <span className="text-slate-300">Regulatory Filing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Contextual Intelligence Panel */}
      <div className="w-80 bg-[#0c1017] flex flex-col h-full overflow-y-auto shrink-0 select-text border-l border-[#1a2234]">
        {/* Panel Header */}
        <div className="h-10 bg-[#0c1017] border-b border-[#1a2234] px-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Entity & Tie Inspector</span>
          </div>
        </div>

        {/* Selected Node Details */}
        {selectedNode ? (
          <div className="p-3.5 space-y-3">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Selected Ontology Node</div>
              <div className="text-sm font-semibold text-slate-100 mt-0.5">
                {selectedNode.label}
              </div>
              <div className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] uppercase bg-[#111622] border border-[#1a2234] text-sky-400">
                {selectedNode.category}
              </div>
            </div>

            <div className="bg-[#111622] border border-[#1a2234] rounded p-2.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Node Type:</span>
                <span className="text-slate-300">{selectedNode.ntype}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Association Degree:</span>
                <span className="text-slate-200 font-semibold tabular-nums">{selectedNode.degree} Edges</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Supporting Records:</span>
                <span className="text-slate-200 font-semibold tabular-nums">{selectedNode.records_count}</span>
              </div>
              {selectedNode.value && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Raw Attribute:</span>
                  <span className="text-slate-300">{selectedNode.value}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Provenance & Integrity</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Indexed in in-memory RDF knowledge graph. Verified with statistical lift measurements
                (&ge; 1.5). Systematically grounded in audited financial disclosures.
              </p>
            </div>
          </div>
        ) : selectedEdge ? (
          <div className="p-3.5 space-y-3">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Selected Association Tie</div>
              <div className="text-xs font-semibold text-sky-400 mt-1">
                {selectedEdge.source} ↔ {selectedEdge.target}
              </div>
            </div>

            <div className="bg-[#111622] border border-[#1a2234] rounded p-2.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Predicate:</span>
                <span className="text-slate-300">{selectedEdge.predicate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Statistical Lift:</span>
                <span className="text-sky-400 font-semibold tabular-nums">{selectedEdge.lift}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Co-Occurrence Count:</span>
                <span className="text-slate-200 tabular-nums">{selectedEdge.count} Pairs</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-slate-500 flex flex-col items-center justify-center flex-1">
            <Share2 className="w-8 h-8 text-slate-700 mb-2" />
            <span className="text-[11px]">Select any node or edge to inspect attributes</span>
          </div>
        )}

        {/* Shortest Path Finder Section */}
        <div className="mt-auto border-t border-[#1a2234] p-3 bg-[#0c1017] space-y-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 uppercase tracking-wider">
            <Route className="w-3.5 h-3.5 text-sky-400" />
            <span>Dijkstra Weighted Path</span>
          </div>
          <div className="space-y-1.5">
            <input
              type="text"
              placeholder="Source entity [e.g. Mutual Funds]"
              value={sourceNode}
              onChange={(e) => setSourceNode(e.target.value)}
              className="w-full px-2 py-1 bg-[#111622] border border-[#1a2234] rounded text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
            />
            <input
              type="text"
              placeholder="Target entity [e.g. Safe Investment]"
              value={targetNode}
              onChange={(e) => setTargetNode(e.target.value)}
              className="w-full px-2 py-1 bg-[#111622] border border-[#1a2234] rounded text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleFindPath}
              disabled={pathLoading || !sourceNode || !targetNode}
              className="w-full py-1 bg-[#111622] hover:bg-slate-800 border border-[#1a2234] rounded text-[11px] font-medium text-sky-400 transition-colors disabled:opacity-50"
            >
              {pathLoading ? "Calculating Path..." : "Find Shortest Path (1/Lift)"}
            </button>
          </div>

          {pathResult && (
            <div className="mt-2 p-2 bg-[#111622] border border-[#1a2234] rounded text-xs">
              {pathResult.found ? (
                <div className="space-y-1">
                  <div className="text-sky-400 font-medium text-[11px]">
                    Path Verified ({pathResult.path.length - 1} hops):
                  </div>
                  <div className="text-slate-300 text-[10px] leading-relaxed">
                    {pathResult.path.join(" → ")}
                  </div>
                </div>
              ) : (
                <div className="text-rose-400 text-[11px]">No path found within 3 hops</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
