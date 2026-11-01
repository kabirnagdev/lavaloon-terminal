"use client";

import React, { useState, useEffect } from "react";
import { HealthStatus, CompanySummary } from "@/types";
import { ShieldCheck, Database, Cpu, Activity, Clock } from "lucide-react";

interface BottomStatusBarProps {
  health: HealthStatus | null;
  activeCompany?: CompanySummary;
  activeModule: string;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  health,
  activeCompany,
  activeModule
}) => {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }) + " UTC"
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const graphEngineLabel = health?.neo4j_connected ? "NEO4J" : "NETWORKX/RDF";
  const llmStatus = health?.llm_connected ? "GROQ (CONNECTED)" : "OFFLINE GROUNDED";

  return (
    <footer className="h-6 bg-terminal-surface terminal-border-t px-3 flex items-center justify-between text-[10px] select-none text-slate-400 z-30">
      {/* Left: Core Engine Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
          <span className="text-slate-300 font-semibold">CORE:ONLINE</span>
        </div>
        <span className="text-slate-600">|</span>
        <div>
          <span className="text-slate-500">GRAPH:</span>{" "}
          <span className="text-slate-300">
            {graphEngineLabel} ({health?.graph_nodes ?? 147}N / {health?.graph_edges ?? 1144}E)
          </span>
        </div>
        <span className="text-slate-600 hidden md:inline">|</span>
        <div className="hidden md:block">
          <span className="text-slate-500">EMBED:</span>{" "}
          <span className="text-slate-300">{health?.embedding_backend || "all-MiniLM-L6-v2"}</span>
        </div>
      </div>

      {/* Center: Ingestion & Focus Telemetry */}
      <div className="hidden lg:flex items-center gap-3">
        <div>
          <span className="text-slate-500">REGULATORY:</span>{" "}
          <span className="text-slate-300">SEC EDGAR / BSE AUDITED (134 FACTS)</span>
        </div>
        {activeCompany && (
          <>
            <span className="text-slate-600">|</span>
            <div>
              <span className="text-slate-500">FOCUS:</span>{" "}
              <span className="text-slate-200 font-semibold">{activeCompany.ticker}</span>{" "}
              <span className="text-slate-500">({activeCompany.coverage_type === "corporate_equity" ? "CORPORATE" : "SURVEY"})</span>
            </div>
          </>
        )}
      </div>

      {/* Right: LLM & System Time */}
      <div className="flex items-center gap-3">
        <div>
          <span className="text-slate-500">LLM:</span>{" "}
          <span className="text-slate-300">{llmStatus}</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="text-slate-300 tabular-nums">
          {timeStr || "00:00:00 UTC"}
        </div>
      </div>
    </footer>
  );
};
