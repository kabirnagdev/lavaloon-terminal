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
import { DataIngestionModal } from "@/components/ingestion/DataIngestionModal";
import { api } from "@/services/api";
import { HealthStatus, CompanySummary } from "@/types";

export default function TerminalWorkstation() {
  const [activeModule, setActiveModule] = useState<string>("overview");
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("aapl");
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);

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
          const found = data.find((c) => c.ticker === "AAPL") || data[0];
          setSelectedCompanyId(found.id);
        }
      })
      .catch((err) => console.warn("API companies fetch:", err.message));
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden metallic-canvas font-sans">
      {/* Top Navigation */}
      <TopNav
        health={health}
        companies={companies}
        selectedCompanyId={selectedCompanyId}
        onSelectCompany={(id) => {
          setSelectedCompanyId(id);
          setActiveModule("companies");
        }}
        activeModule={activeModule}
        onOpenIngestion={() => setIsIngestionOpen(true)}
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
              onOpenIngestion={() => setIsIngestionOpen(true)}
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
        </main>
      </div>

      {/* Bottom Status Bar */}
      <BottomStatusBar
        health={health}
        activeCompany={companies.find((c) => c.id === selectedCompanyId)}
        activeModule={activeModule}
      />

      {/* Data Ingestion Modal */}
      <DataIngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
        onNavigateToCopilot={() => setActiveModule("research")}
        onNavigateToGraph={() => setActiveModule("graph")}
      />
    </div>
  );
}
