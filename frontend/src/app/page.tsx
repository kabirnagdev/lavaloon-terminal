"use client";

import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomStatusBar } from "@/components/layout/BottomStatusBar";
import { OverviewDashboard } from "@/components/dashboard/OverviewDashboard";
import { CompanyExplorer } from "@/components/companies/CompanyExplorer";
import { FinancialIntelligenceWorkspace } from "@/components/financials/FinancialIntelligenceWorkspace";
import { CytoscapeGraph } from "@/components/graph/CytoscapeGraph";
import { ResearchWorkspace } from "@/components/research/ResearchWorkspace";
import { DueDiligenceView } from "@/components/diligence/DueDiligenceView";
import { OptionsDesk } from "@/components/quant/OptionsDesk";
import { SettingsView } from "@/components/settings/SettingsView";
import { api } from "@/services/api";
import { HealthStatus, CompanySummary } from "@/types";

export default function TerminalWorkstation() {
  const [activeModule, setActiveModule] = useState<string>("overview");
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("mutual-funds");

  const refreshHealth = () => {
    api.getHealth()
      .then(setHealth)
      .catch((err) => console.warn("API health check:", err.message));
  };

  useEffect(() => {
    refreshHealth();
    api.getCompanies()
      .then((data) => {
        setCompanies(data);
        if (data.length > 0) {
          setSelectedCompanyId(data[0].id);
        }
      })
      .catch((err) => console.warn("API companies fetch:", err.message));

    // Keyboard Hotkey shortcuts (F1 - F8)
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "F1":
          e.preventDefault();
          setActiveModule("overview");
          break;
        case "F2":
          e.preventDefault();
          setActiveModule("companies");
          break;
        case "F3":
          e.preventDefault();
          setActiveModule("financials");
          break;
        case "F4":
          e.preventDefault();
          setActiveModule("graph");
          break;
        case "F5":
          e.preventDefault();
          setActiveModule("research");
          break;
        case "F6":
          e.preventDefault();
          setActiveModule("diligence");
          break;
        case "F7":
          e.preventDefault();
          setActiveModule("quant");
          break;
        case "F8":
          e.preventDefault();
          setActiveModule("settings");
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-terminal-bg font-sans">
      {/* Institutional Top Navigation Bar */}
      <TopNav
        health={health}
        companies={companies}
        selectedCompanyId={selectedCompanyId}
        onSelectCompany={(id) => {
          setSelectedCompanyId(id);
          setActiveModule("companies");
        }}
        activeModule={activeModule}
      />

      {/* Main Terminal Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={(mod) => setActiveModule(mod)}
        />

        {/* Dynamic Center Workstation View */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {activeModule === "overview" && (
            <OverviewDashboard
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onSelectCompany={setSelectedCompanyId}
              onNavigate={(mod) => setActiveModule(mod)}
              health={health}
            />
          )}

          {activeModule === "companies" && (
            <CompanyExplorer
              selectedCompanyId={selectedCompanyId}
              onSelectCompany={setSelectedCompanyId}
              onNavigateToDiligence={(targetId) => {
                setSelectedCompanyId(targetId);
                setActiveModule("diligence");
              }}
            />
          )}

          {activeModule === "financials" && (
            <FinancialIntelligenceWorkspace
              initialCompanyId={selectedCompanyId}
              onNavigateToDiligence={(targetId) => {
                setSelectedCompanyId(targetId);
                setActiveModule("diligence");
              }}
            />
          )}

          {activeModule === "graph" && <CytoscapeGraph />}

          {activeModule === "research" && (
            <ResearchWorkspace initialCompanyId={selectedCompanyId} />
          )}

          {activeModule === "diligence" && (
            <DueDiligenceView initialTargetId={selectedCompanyId} />
          )}

          {activeModule === "quant" && <OptionsDesk />}

          {activeModule === "settings" && (
            <SettingsView health={health} onRefreshHealth={refreshHealth} />
          )}
        </main>
      </div>

      {/* Institutional Bottom Status Bar */}
      <BottomStatusBar
        health={health}
        activeCompany={companies.find((c) => c.id === selectedCompanyId)}
        activeModule={activeModule}
      />
    </div>
  );
}

