/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Trade, TradeResult } from "../types.js";
import { AlertCircle, ToggleLeft, ToggleRight, ShieldAlert, BarChart3, HelpCircle } from "lucide-react";

interface PortfolioHeatmapProps {
  trades: Trade[];
}

export default function PortfolioHeatmap({ trades }: PortfolioHeatmapProps) {
  const [filterMode, setFilterMode] = useState<"open" | "all">("open");

  // Determine active trades matching the selection, with auto-fallback to "all" if "open" is empty
  const { filteredTrades, isFallback, totalRisk } = useMemo(() => {
    let result = trades.filter(
      (t) => (t.result as any) === "OPEN" || (t.result as any) === TradeResult.OPEN || !t.closed_at
    );
    let fallback = false;

    if (filterMode === "all" || result.length === 0) {
      if (filterMode === "open") {
        fallback = true;
      }
      result = trades; // Fallback or active selection of all
    }

    // Measure total risk sum
    const total = result.reduce((acc, t) => acc + (t.risk_amount || 0), 0);

    return {
      filteredTrades: result,
      isFallback: fallback,
      totalRisk: total
    };
  }, [trades, filterMode]);

  // Group by symbol & calculate aggregate risk
  const symbolStats = useMemo(() => {
    if (filteredTrades.length === 0) return [];

    const groups: { [key: string]: { amount: number; count: number } } = {};

    filteredTrades.forEach((t) => {
      const sym = (t.symbol || "UNKNOWN").toUpperCase().replace(/[^A-Z0-9]/g, ""); // Clean formatting e.g. XAU/USD -> XAUUSD
      if (!groups[sym]) {
        groups[sym] = { amount: 0, count: 0 };
      }
      groups[sym].amount += t.risk_amount || 0;
      groups[sym].count += 1;
    });

    const list = Object.entries(groups).map(([symbol, data]) => ({
      symbol,
      amount: data.amount,
      count: data.count,
      percentage: totalRisk > 0 ? (data.amount / totalRisk) * 100 : 0
    }));

    // Sort descending
    list.sort((a, b) => b.amount - a.amount);

    // Limit to top 4 and bundle others if necessary
    if (list.length > 5) {
      const topSymbols = list.slice(0, 4);
      const otherSymbols = list.slice(4);
      const othersAmount = otherSymbols.reduce((sum, item) => sum + item.amount, 0);
      const othersCount = otherSymbols.reduce((sum, item) => sum + item.count, 0);
      const othersPercent = totalRisk > 0 ? (othersAmount / totalRisk) * 100 : 0;

      return [
        ...topSymbols,
        {
          symbol: "OTHERS",
          amount: othersAmount,
          count: othersCount,
          percentage: othersPercent
        }
      ];
    }

    return list;
  }, [filteredTrades, totalRisk]);

  // Generate discrete block bar (e.g. ███████)
  const getBlockBar = (percentage: number) => {
    // 1 block = 10%
    const blockCount = Math.max(1, Math.round(percentage / 10));
    return "█".repeat(blockCount);
  };

  // Color mappings for symbols to make it distinct and stylish
  const getSymbolStyles = (symbol: string, index: number) => {
    const uppercaseSym = symbol.toUpperCase();
    if (uppercaseSym.includes("XAU") || uppercaseSym.includes("GOLD")) {
      return {
        text: "text-amber-400",
        bg: "bg-amber-500/15",
        border: "border-amber-500/30",
        bar: "bg-amber-500"
      };
    }
    if (uppercaseSym.includes("NAS") || uppercaseSym.includes("UST")) {
      return {
        text: "text-sky-400",
        bg: "bg-sky-500/15",
        border: "border-sky-500/30",
        bar: "bg-sky-500"
      };
    }
    if (uppercaseSym.includes("US30") || uppercaseSym.includes("DOW")) {
      return {
        text: "text-indigo-400",
        bg: "bg-indigo-500/15",
        border: "border-indigo-500/30",
        bar: "bg-indigo-500"
      };
    }
    if (uppercaseSym.includes("EUR") || uppercaseSym.includes("GBP")) {
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500/15",
        border: "border-emerald-500/30",
        bar: "bg-emerald-500"
      };
    }
    // Default dynamic loop color
    const colors = [
      { text: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/30", bar: "bg-violet-50" },
      { text: "text-teal-400", bg: "bg-teal-500/15", border: "border-teal-500/30", bar: "bg-teal-500" },
      { text: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30", bar: "bg-orange-500" }
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-[#121A2B] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4" id="portfolio-heatmap-widget">
      
      {/* Header and Control Toggle */}
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-3" id="pm-header-block">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" /> Bản đồ rủi ro danh mục (Heat Map)
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Phân bổ tổng vốn đang gặp nguy cơ (Stop Loss Risk).
          </p>
        </div>

        {/* Toggle Mode button */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800" id="pm-toggle-controls">
          <button
            onClick={() => setFilterMode("open")}
            className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
              filterMode === "open"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Chỉ tính toán các lệnh đang mở (Active SL Risk)"
          >
            Lệnh Mở
          </button>
          <button
            onClick={() => setFilterMode("all")}
            className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
              filterMode === "all"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Tính toán phân bổ rủi ro từ tất cả lịch sử ghi nhận"
          >
            Tất cả
          </button>
        </div>
      </div>

      {/* Fallback notification to avoid blank states if no open trades */}
      {isFallback && (
        <div className="bg-amber-500/10 border-l-2 border-amber-500 px-3 py-2 rounded text-[10px] text-amber-400 flex items-start gap-2 leading-relaxed" id="sf-fallback-alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Không có lệnh mở:</span> Bản đồ tự động lùi về phân tích tỷ lệ rủi ro của <strong>Tất cả giao dịch lịch sử</strong> để trực quan hóa.
          </div>
        </div>
      )}

      {/* Main Heatmap Visualization */}
      <div className="space-y-4 pt-1" id="heatmap-list-container">
        {symbolStats.length > 0 ? (
          <div className="space-y-3.5">
            {symbolStats.map((item, idx) => {
              const styles = getSymbolStyles(item.symbol, idx);
              const roundedPct = Math.round(item.percentage);
              const blockStr = getBlockBar(item.percentage);

              return (
                <div key={item.symbol} className="space-y-1.5" id={`heatmap-row-${item.symbol}`}>
                  {/* Metadata Row */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded ${styles.bg} ${styles.text} border ${styles.border}`}>
                        {item.symbol}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold font-mono">
                        ({item.count} lệnh)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Interactive block bar look requested */}
                      <span className="font-mono text-[10px] text-slate-400 select-none tracking-tighter" title="Độ dài rủi ro định lượng">
                        {blockStr}
                      </span>
                      <span className="font-black text-white font-mono text-xs">
                        {roundedPct}%
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono" title="Tổng số tiền chịu rủi ro">
                        (${Math.round(item.amount).toLocaleString()})
                      </span>
                    </div>
                  </div>

                  {/* Modern progress bar underneath the vintage block indicator to look extremely sleek */}
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-slate-800/50" id="heatmap-empty-state">
            <HelpCircle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Không có dữ liệu giao dịch để phân tích rủi ro.</p>
            <p className="text-[10px] text-slate-600 mt-1">Ghi nhận thông số nến giao dịch để kích hoạt bản đồ nhiệt.</p>
          </div>
        )}
      </div>

      {/* Aggregate Risk Footnote */}
      <div className="bg-slate-900/50 border border-slate-800/30 p-3 rounded-lg flex justify-between items-center text-[11px] font-mono select-none" id="heatmap-footer-note">
        <span className="text-slate-500 uppercase font-semibold">TỔNG VỐN RỦI RO ĐANG QUÉT:</span>
        <span className="text-rose-400 font-black" id="total-risk-cap">
          ${Math.round(totalRisk).toLocaleString("en-US")}
        </span>
      </div>
    </div>
  );
}
