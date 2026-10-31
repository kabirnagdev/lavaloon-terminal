"use client";

import React, { useState, useEffect } from "react";
import {
  Calculator,
  TrendingUp,
  Activity,
  Layers,
  HelpCircle,
  RotateCcw
} from "lucide-react";
import { api } from "@/services/api";
import { BlackScholesResponse, OptionsChainItem } from "@/types";

export const OptionsDesk: React.FC = () => {
  const [spot, setSpot] = useState<number>(100.0);
  const [strike, setStrike] = useState<number>(100.0);
  const [days, setDays] = useState<number>(30.0);
  const [rate, setRate] = useState<number>(0.05);
  const [vol, setVol] = useState<number>(0.25);
  const [optionType, setOptionType] = useState<"call" | "put">("call");

  const [calcResult, setCalcResult] = useState<BlackScholesResponse | null>(null);
  const [chain, setChain] = useState<OptionsChainItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const calculate = async () => {
    try {
      setLoading(true);
      const res = await api.calculateBlackScholes({
        S: spot,
        K: strike,
        T_days: days,
        r: rate,
        sigma: vol,
        option_type: optionType
      });
      setCalcResult(res);

      // Generate multi-strike chain around spot
      const strikes = [
        Math.round(spot * 0.85),
        Math.round(spot * 0.9),
        Math.round(spot * 0.95),
        Math.round(spot),
        Math.round(spot * 1.05),
        Math.round(spot * 1.1),
        Math.round(spot * 1.15)
      ];
      const chainRes = await api.getOptionsChain({
        S: spot,
        strikes,
        T_days: days,
        r: rate,
        sigma: vol
      });
      setChain(chainRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [spot, strike, days, rate, vol, optionType]);

  return (
    <div className="flex flex-col h-full w-full bg-terminal-bg select-text overflow-y-auto">
      {/* Top Desk Header */}
      <div className="h-11 bg-terminal-surface terminal-border-b px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <Calculator className="w-4 h-4 text-sky-400" />
          <span>Quantitative Derivatives Desk</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-sky-400">
            Black-Scholes-Merton
          </span>
        </div>
        <div className="text-xs text-slate-400">
          Continuous Pricing Engine & Analytical Greeks
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 max-w-6xl mx-auto w-full">
        {/* Input Parameters Form */}
        <div className="p-4 bg-terminal-surface terminal-border rounded-lg space-y-3 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Option Pricing Parameters
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div>
              <label className="text-[10px] text-terminal-muted block mb-1">SPOT PRICE (S)</label>
              <input
                type="number"
                value={spot}
                onChange={(e) => setSpot(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-terminal-bg terminal-border rounded text-xs text-terminal-text focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-terminal-muted block mb-1">STRIKE (K)</label>
              <input
                type="number"
                value={strike}
                onChange={(e) => setStrike(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-terminal-bg terminal-border rounded text-xs text-terminal-text focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-terminal-muted block mb-1">DAYS TO EXP (T)</label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(parseFloat(e.target.value) || 1)}
                className="w-full px-2 py-1 bg-terminal-bg terminal-border rounded text-xs text-terminal-text focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-terminal-muted block mb-1">RISK-FREE (r)</label>
              <input
                type="number"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-terminal-bg terminal-border rounded text-xs text-terminal-text focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-terminal-muted block mb-1">VOLATILITY (&sigma;)</label>
              <input
                type="number"
                step="0.01"
                value={vol}
                onChange={(e) => setVol(parseFloat(e.target.value) || 0.01)}
                className="w-full px-2 py-1 bg-terminal-bg terminal-border rounded text-xs text-terminal-text focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-terminal-muted block mb-1">TYPE</label>
              <div className="flex rounded terminal-border overflow-hidden">
                <button
                  onClick={() => setOptionType("call")}
                  className={`flex-1 py-1 text-xs uppercase ${
                    optionType === "call"
                      ? "bg-terminal-cyan text-black font-bold"
                      : "bg-terminal-bg text-terminal-muted"
                  }`}
                >
                  CALL
                </button>
                <button
                  onClick={() => setOptionType("put")}
                  className={`flex-1 py-1 text-xs uppercase ${
                    optionType === "put"
                      ? "bg-terminal-amber text-black font-bold"
                      : "bg-terminal-bg text-terminal-muted"
                  }`}
                >
                  PUT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Results & Greeks Card */}
        {calcResult && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            {/* Price Card */}
            <div className="p-4 bg-terminal-surface terminal-border rounded space-y-3">
              <div className="text-[10px] text-terminal-dim uppercase font-bold">
                THEORETICAL OPTION VALUATION
              </div>
              <div className="text-3xl font-bold text-terminal-cyan">
                ${calcResult.price.toFixed(4)}
              </div>
              <div className="space-y-1.5 text-xs text-terminal-muted pt-2 border-t border-terminal-border">
                <div className="flex justify-between">
                  <span>INTRINSIC VALUE:</span>
                  <span className="text-terminal-text">${calcResult.intrinsic_value.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>TIME VALUE:</span>
                  <span className="text-terminal-text">${calcResult.time_value.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>MONEYNESS:</span>
                  <span className="text-terminal-amber font-bold">
                    {spot > strike ? "ITM (In the Money)" : spot === strike ? "ATM (At the Money)" : "OTM (Out of the Money)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Greeks Panel */}
            <div className="p-4 bg-terminal-surface terminal-border rounded space-y-2 col-span-2">
              <div className="text-[10px] text-terminal-dim uppercase font-bold">
                FIRST & SECOND ORDER ANALYTICAL GREEKS
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-terminal-panel terminal-border rounded">
                  <div className="text-terminal-dim text-[10px]">&Delta; DELTA (CALL)</div>
                  <div className="text-base font-bold text-terminal-cyan mt-1">
                    {calcResult.greeks.delta_call.toFixed(4)}
                  </div>
                </div>
                <div className="p-2.5 bg-terminal-panel terminal-border rounded">
                  <div className="text-terminal-dim text-[10px]">&Gamma; GAMMA</div>
                  <div className="text-base font-bold text-terminal-amber mt-1">
                    {calcResult.greeks.gamma.toFixed(6)}
                  </div>
                </div>
                <div className="p-2.5 bg-terminal-panel terminal-border rounded">
                  <div className="text-terminal-dim text-[10px]">&nu; VEGA (1% VOL)</div>
                  <div className="text-base font-bold text-terminal-green mt-1">
                    {calcResult.greeks.vega.toFixed(4)}
                  </div>
                </div>
                <div className="p-2.5 bg-terminal-panel terminal-border rounded">
                  <div className="text-terminal-dim text-[10px]">&Theta; THETA (DAILY)</div>
                  <div className="text-base font-bold text-terminal-red mt-1">
                    {calcResult.greeks.theta_call.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Options Chain Table */}
        <div className="bg-terminal-surface terminal-border rounded p-4 font-mono space-y-3">
          <div className="text-xs font-bold text-terminal-dim uppercase tracking-wider flex items-center justify-between">
            <span>OPTIONS CHAIN MATRIX (S=${spot}, T={days}d, &sigma;={(vol * 100).toFixed(0)}%)</span>
            <span className="text-[10px] text-terminal-muted">MODEL: EUROPEAN BLACK-SCHOLES</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-terminal-border text-terminal-dim text-[10px] uppercase">
                  <th className="py-2 px-3">CALL BID/ASK</th>
                  <th className="py-2 px-3">DELTA (C)</th>
                  <th className="py-2 px-3 text-center text-terminal-cyan">STRIKE (K)</th>
                  <th className="py-2 px-3">DELTA (P)</th>
                  <th className="py-2 px-3">PUT BID/ASK</th>
                  <th className="py-2 px-3">GAMMA</th>
                  <th className="py-2 px-3">VEGA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-border/40">
                {chain.map((row) => {
                  const isAtm = Math.abs(row.strike - spot) < 3;
                  return (
                    <tr
                      key={row.strike}
                      className={`hover:bg-terminal-hover transition-colors ${
                        isAtm ? "bg-terminal-panel/60 font-bold" : ""
                      }`}
                    >
                      <td className="py-2 px-3 text-terminal-green">${row.call_price.toFixed(2)}</td>
                      <td className="py-2 px-3 text-terminal-muted">{row.delta_call.toFixed(2)}</td>
                      <td className="py-2 px-3 text-center font-bold text-terminal-cyan">
                        ${row.strike.toFixed(2)} {isAtm ? "★ ATM" : ""}
                      </td>
                      <td className="py-2 px-3 text-terminal-muted">{row.delta_put.toFixed(2)}</td>
                      <td className="py-2 px-3 text-terminal-amber">${row.put_price.toFixed(2)}</td>
                      <td className="py-2 px-3 text-terminal-dim">{row.gamma.toFixed(4)}</td>
                      <td className="py-2 px-3 text-terminal-dim">{row.vega.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

