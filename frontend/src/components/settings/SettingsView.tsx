"use client";

import React, { useState } from "react";
import {
  Sliders,
  Database,
  Cpu,
  Key,
  CheckCircle2,
  AlertTriangle,
  Server,
  RefreshCw
} from "lucide-react";
import { HealthStatus } from "@/types";

interface SettingsViewProps {
  health: HealthStatus | null;
  onRefreshHealth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ health, onRefreshHealth }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-terminal-bg overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6 select-text">
      {/* Settings Header */}
      <div className="p-4 bg-terminal-surface terminal-border rounded-lg flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-sm font-semibold text-white tracking-tight">
            System Architecture & Connectivity
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Operational status of AI pipelines, vector indexers, and database engines.
          </p>
        </div>

        <button
          onClick={onRefreshHealth}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-md text-xs text-sky-400 font-medium flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ping API</span>
        </button>
      </div>

      {/* Connectivity Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Backend API */}
        <div className="p-4 bg-terminal-surface terminal-border rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-white flex items-center gap-1.5">
              <Server className="w-4 h-4 text-sky-400" />
              <span>FastAPI Gateway</span>
            </span>
            <span className="text-emerald-400 font-mono text-[11px] font-medium">Port 8000</span>
          </div>
          <div className="text-xs text-slate-400">
            Status: {health?.status || "Connecting..."} (v{health?.version || "2.0.0"})
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Base Endpoint: http://localhost:8000/api/v1
          </div>
        </div>

        {/* Vector Embeddings */}
        <div className="p-4 bg-terminal-surface terminal-border rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-terminal-text flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-terminal-green" />
              <span>EMBEDDING ENGINE</span>
            </span>
            <span className="text-terminal-green font-bold">READY</span>
          </div>
          <div className="text-[11px] text-terminal-muted">
            Model: {health?.embedding_backend || "all-MiniLM-L6-v2"}
          </div>
          <div className="text-[10px] text-terminal-dim">
            Fallback: Character n-gram hashing vectorizer (4096-dim)
          </div>
        </div>

        {/* LLM Engine */}
        <div className="p-4 bg-terminal-surface terminal-border rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-terminal-text flex items-center gap-1.5">
              <Key className="w-4 h-4 text-terminal-amber" />
              <span>GROQ LLM CLIENT</span>
            </span>
            <span
              className={`font-bold ${
                health?.llm_connected ? "text-terminal-green" : "text-terminal-amber"
              }`}
            >
              {health?.llm_connected ? "KEY ACTIVE" : "EVIDENCE MODE"}
            </span>
          </div>
          <div className="text-[11px] text-terminal-muted">
            Rotates: llama-3.3-70b-versatile, openai/gpt-oss-120b, qwen3.8
          </div>
          <div className="text-[10px] text-terminal-dim">
            Rate Governor: 6,500 Tokens/Min Sliding Pacing Window
          </div>
        </div>

        {/* Neo4j Enterprise */}
        <div className="p-4 bg-terminal-surface terminal-border rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-terminal-text flex items-center gap-1.5">
              <Database className="w-4 h-4 text-terminal-cyan" />
              <span>GRAPH STORAGE</span>
            </span>
            <span
              className={`font-bold ${
                health?.neo4j_connected ? "text-terminal-green" : "text-terminal-cyan"
              }`}
            >
              {health?.neo4j_connected ? "NEO4J CONNECTED" : "NETWORKX ACTIVE"}
            </span>
          </div>
          <div className="text-[11px] text-terminal-muted">
            In-Memory NetworkX DiGraph + Co-occurrence Lift Layer
          </div>
          <div className="text-[10px] text-terminal-dim">
            Optional Neo4j Sync via NEO4J_URI environment variables
          </div>
        </div>
      </div>

      {/* Dataset & Provenance Section */}
      <div className="p-4 bg-terminal-surface terminal-border rounded space-y-2 text-xs">
        <div className="font-bold text-terminal-dim uppercase">
          DATASET & REPOSITORY ATTRIBUTION
        </div>
        <p className="text-[11px] text-terminal-muted leading-relaxed">
          This system processes structured empirical survey data from <code className="text-terminal-cyan">Finance_data.csv</code> (Kaggle: nitindatta/finance-data),
          originally created by Kabir Nagdev under the MIT License.
        </p>
        <div className="pt-2 text-[10px] text-terminal-dim border-t border-terminal-border">
          Copyright (c) 2026 Kabir Nagdev. Transformed into an Institutional Terminal Workstation.
        </div>
      </div>
    </div>
  );
};

