"use client";

import React, { useState, useEffect } from "react";
import {
  Calculator,
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

      // Generate multi-strike ladder around spot
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
    <div className="flex flex-col h-full w-full bg-[#080b11] select-text text-slate-200 overflow-y-auto">
      {/* Top Desk Header */}
      <div className="h-10 bg-[#0c1017] border-b border-[#1a2234] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-100 uppercase tracking-wider">
          <Calculator className="w-3.5 h-3.5 text-sky-400" />
          <span>Quantitative Derivatives Desk</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#111622] border border-[#1a2234] text-sky-400">
            Black-Scholes-Merton
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          Continuous Pricing Engine & Analytical Greeks
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3.5 max-w-6xl mx-auto w-full">
        {/* Input Parameters Form */}
        <div className="p-3 bg-[#0c1017] border border-[#1a2234] rounded space-y-2.5">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            DERIVATIVES PRICING INPUTS
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 text-xs">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">SPOT PRICE (S)</label>
              <input
                type="number"
                value={spot}
                onChange={(e) => setSpot(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-[#111622] border border-[#1a2234] rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">STRIKE (K)</label>
              <input
                type="number"
                value={strike}
                onChange={(e) => setStrike(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-[#111622] border border-[#1a2234] rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">EXPIRY DTE (T)</label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(parseFloat(e.target.value) || 1)}
                className="w-full px-2 py-1 bg-[#111622] border border-[#1a2234] rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">RISK-FREE (r)</label>
              <input
                type="number"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-[#111622] border border-[#1a2234] rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">VOLATILITY (&sigma;)</label>
              <input
                type="number"
                step="0.01"
                value={vol}
                onChange={(e) => setVol(parseFloat(e.target.value) || 0.01)}
                className="w-full px-2 py-1 bg-[#111622] border border-[#1a2234] rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">CONTRACT</label>
              <div className="flex rounded border border-[#1a2234] overflow-hidden">
                <button
                  onClick={() => setOptionType("call")}
                  className={`flex-1 py-1 text-xs font-semibold ${
                    optionType === "call"
                      ? "bg-[#1a2234] text-sky-400"
                      : "bg-[#111622] text-slate-500"
                  }`}
                >
                  CALL
                </button>
                <button
                  onClick={() => setOptionType("put")}
                  className={`flex-1 py-1 text-xs font-semibold ${
                    optionType === "put"
                      ? "bg-[#1a2234] text-sky-400"
                      : "bg-[#111622] text-slate-500"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Price Card */}
            <div className="p-3.5 bg-[#0c1017] border border-[#1a2234] rounded space-y-2">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                THEORETICAL VALUATION
              </div>
              <div className="text-2xl font-bold text-sky-400 tabular-nums">
                ${calcResult.price.toFixed(4)}
              </div>
              <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-[#1a2234]">
                <div className="flex justify-between">
                  <span className="text-slate-500">INTRINSIC VALUE:</span>
                  <span className="text-slate-200 tabular-nums">${calcResult.intrinsic_value.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TIME VALUE:</span>
                  <span className="text-slate-200 tabular-nums">${calcResult.time_value.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MONEYNESS:</span>
                  <span className="text-slate-300 font-semibold">
                    {spot > strike ? "ITM (In the Money)" : spot === strike ? "ATM (At the Money)" : "OTM (Out of the Money)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Greeks Panel */}
            <div className="p-3.5 bg-[#0c1017] border border-[#1a2234] rounded space-y-2 col-span-2">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                FIRST & SECOND ORDER ANALYTICAL GREEKS
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-[#111622] border border-[#1a2234] rounded">
                  <div className="text-slate-500 text-[10px]">&Delta; DELTA (CALL)</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5 tabular-nums">
                    {calcResult.greeks.delta_call.toFixed(4)}
                  </div>
                </div>
                <div className="p-2 bg-[#111622] border border-[#1a2234] rounded">
                  <div className="text-slate-500 text-[10px]">&Gamma; GAMMA</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5 tabular-nums">
                    {calcResult.greeks.gamma.toFixed(6)}
                  </div>
                </div>
                <div className="p-2 bg-[#111622] border border-[#1a2234] rounded">
                  <div className="text-slate-500 text-[10px]">&nu; VEGA (1% VOL)</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5 tabular-nums">
                    {calcResult.greeks.vega.toFixed(4)}
                  </div>
                </div>
                <div className="p-2 bg-[#111622] border border-[#1a2234] rounded">
                  <div className="text-slate-500 text-[10px]">&Theta; THETA (DAILY)</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5 tabular-nums">
                    {calcResult.greeks.theta_call.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Options Chain Table */}
        <div className="bg-[#0c1017] border border-[#1a2234] rounded p-3 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>VOLATILITY CHAIN MATRIX (S=${spot}, T={days}d, &sigma;={(vol * 100).toFixed(0)}%)</span>
            <span className="text-[10px] text-slate-500">MODEL: EUROPEAN BSM</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1a2234] text-slate-500 text-[10px] uppercase">
                  <th className="py-1.5 px-3">CALL VALUE</th>
                  <th className="py-1.5 px-3">DELTA (C)</th>
                  <th className="py-1.5 px-3 text-center text-sky-400">STRIKE (K)</th>
                  <th className="py-1.5 px-3">DELTA (P)</th>
                  <th className="py-1.5 px-3">PUT VALUE</th>
                  <th className="py-1.5 px-3">GAMMA</th>
                  <th className="py-1.5 px-3">VEGA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2234]">
                {chain.map((row) => {
                  const isAtm = Math.abs(row.strike - spot) < 3;
                  return (
                    <tr
                      key={row.strike}
                      className={`hover:bg-[#111622] transition-colors ${
                        isAtm ? "bg-[#111622]/80 font-semibold" : ""
                      }`}
                    >
                      <td className="py-1.5 px-3 text-teal-400 tabular-nums">${row.call_price.toFixed(2)}</td>
                      <td className="py-1.5 px-3 text-slate-400 tabular-nums">{row.delta_call.toFixed(2)}</td>
                      <td className="py-1.5 px-3 text-center font-semibold text-slate-100 tabular-nums">
                        ${row.strike.toFixed(2)} {isAtm ? "★ ATM" : ""}
                      </td>
                      <td className="py-1.5 px-3 text-slate-400 tabular-nums">{row.delta_put.toFixed(2)}</td>
                      <td className="py-1.5 px-3 text-sky-400 tabular-nums">${row.put_price.toFixed(2)}</td>
                      <td className="py-1.5 px-3 text-slate-500 tabular-nums">{row.gamma.toFixed(4)}</td>
                      <td className="py-1.5 px-3 text-slate-500 tabular-nums">{row.vega.toFixed(2)}</td>
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
