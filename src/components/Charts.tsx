/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { Trade, TradeResult, MistakeType, TradingAccount } from "../types.js";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface ChartsProps {
  trades: Trade[];
  accounts: TradingAccount[];
}

export default function Charts({ trades, accounts }: ChartsProps) {
  // 1. Prepare Equity Curve Data
  const equityCurveData = useMemo(() => {
    // Sort closed trades by closed date
    const sortedClosed = [...trades]
      .filter((t) => t.result !== TradeResult.OPEN && t.closed_at)
      .sort((a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime());

    let balanceUSD = 150000; // Starting virtual cumulative target (100k FMTO + 50k TopStep)
    const points = [{ name: "Start", Equity: balanceUSD }];

    sortedClosed.forEach((t, i) => {
      // Direct sum
      let profit = t.profit_loss;
      if (t.account_id === "acct_3") {
        // Live account is in VND, convert to USD virtual for cumulative curve (~1$ = 25k VND)
        profit = profit / 25000;
      }
      balanceUSD += profit;
      points.push({
        name: `Trade #${i + 1}`,
        Equity: Math.round(balanceUSD)
      });
    });

    return points;
  }, [trades]);

  // 2. Prepare PnL By Month Data
  const pnlByMonthData = useMemo(() => {
    const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const stats: { [key: string]: number } = { "May": 0, "Jun": 0 }; // Initialize with seeded data months

    trades.forEach((t) => {
      if (t.result !== TradeResult.OPEN && t.closed_at) {
        const d = new Date(t.closed_at);
        const mName = d.toLocaleString("en-US", { month: "short" });
        let profit = t.profit_loss;
        if (t.account_id === "acct_3") {
          profit = profit / 25000; // normalized to USD for comparison
        }
        stats[mName] = (stats[mName] || 0) + profit;
      }
    });

    return months.map((m) => ({
      name: m,
      "Lợi nhuận ($)": Math.round(stats[m] || 0)
    }));
  }, [trades]);

  // 3. Prepare Win Rate Pie Data
  const winRateData = useMemo(() => {
    const closed = trades.filter((t) => t.result !== TradeResult.OPEN);
    const wins = closed.filter((t) => t.result === TradeResult.WIN).length;
    const losses = closed.filter((t) => t.result === TradeResult.LOSS).length;
    const be = closed.filter((t) => t.result === TradeResult.BE).length;

    return [
      { name: "Lệnh Thắng (WIN)", value: wins, color: "#10B981" },
      { name: "Lệnh Thua (LOSS)", value: losses, color: "#F43F5E" },
      { name: "Hòa (BE)", value: be, color: "#64748B" }
    ].filter(item => item.value > 0);
  }, [trades]);

  // 4. Prepare Mistake Distribution
  const mistakeData = useMemo(() => {
    const counts: { [key: string]: number } = {
      FOMO: 1,
      REVENGE_TRADE: 1,
      OVERTRADING: 0,
      NO_STOP_LOSS: 1,
      MOVE_STOP_LOSS: 0,
      OVERSIZED_POSITION: 1,
      NO_PLAN: 1
    };

    // Parse notes / logs or manual inputs for counts
    trades.forEach((t) => {
      if (t.notes?.toLowerCase().includes("fomo") || t.emotion_before_trade === "FOMO") {
        counts.FOMO++;
      }
      if (t.notes?.toLowerCase().includes("revenge") || t.notes?.toLowerCase().includes("cay cú")) {
        counts.REVENGE_TRADE++;
      }
      if (t.risk_percent > 0.5) {
        counts.OVERSIZED_POSITION++;
      }
      if (t.stop_loss === 0) {
        counts.NO_STOP_LOSS++;
      }
    });

    return Object.keys(counts).map((key) => ({
      name: key.replace("_", " "),
      "Số lần": counts[key]
    })).filter(item => item["Số lần"] > 0);
  }, [trades]);

  // 5. Discipline Score Trend (Simulated moving average by trade plan matching)
  const disciplineTrendData = useMemo(() => {
    const sortedTrades = [...trades]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    let baseScore = 80;
    return sortedTrades.map((t, index) => {
      if (t.stop_loss > 0) baseScore = Math.min(100, baseScore + 2);
      if (t.risk_percent > 0.5) baseScore = Math.max(30, baseScore - 7);
      if (t.emotion_before_trade === "FOMO") baseScore = Math.max(30, baseScore - 5);
      if (t.result === TradeResult.WIN && t.stop_loss > 0) baseScore = Math.min(100, baseScore + 1);

      return {
        name: `Lệnh #${index + 1}`,
        "Điểm kỷ luật": baseScore
      };
    });
  }, [trades]);

  // 6. Account Comparison Data (Balances vs starting)
  const accountComparisonData = useMemo(() => {
    if (!accounts || accounts.length === 0) {
      return [
        { name: "Không có tài khoản", "Vốn ban đầu": 0, "Số dư hiện tại": 0 }
      ];
    }
    return accounts.map(acct => {
      const isVnd = acct.currency === "VND";
      const start = isVnd ? Math.round(acct.starting_balance / 25000) : acct.starting_balance;
      const current = isVnd ? Math.round(acct.current_balance / 25000) : acct.current_balance;
      const suffix = isVnd ? " (eq $)" : "";
      return {
        name: `${acct.name}${suffix}`,
        "Vốn ban đầu": start,
        "Số dư hiện tại": current
      };
    });
  }, [accounts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="dashboard-charts-grid">
      {/* 1. Equity Curve */}
      <div className="bg-[#121A2B] border border-slate-800 rounded-xl p-5" id="chart-equity-curve">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Biểu đồ tăng trưởng tài sản (USD Equivalent)
        </h3>
        <div className="h-[260px] w-full" id="equity-curve-canvas">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityCurveData}>
              <defs>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={10} tickLine={false} domain={["dataMin - 1000", "dataMax + 1000"]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "#1E293B", borderRadius: "8px" }}
                labelStyle={{ color: "#94A3B8", fontWeight: "600" }}
              />
              <Area type="monotone" dataKey="Equity" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. PnL By Month */}
      <div className="bg-[#121A2B] border border-slate-800 rounded-xl p-5" id="chart-monthly-pnl">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
          Lợi nhuận ròng theo tháng (USD Normalized)
        </h3>
        <div className="h-[260px] w-full" id="monthly-pnl-canvas">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pnlByMonthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "#1E293B", borderRadius: "8px" }}
                labelStyle={{ color: "#94A3B8" }}
              />
              <Bar dataKey="Lợi nhuận ($)" fill="#10B981" radius={[4, 4, 0, 0]}>
                {pnlByMonthData.map((entry, index) => {
                  const val = entry["Lợi nhuận ($)"];
                  return <Cell key={`cell-${index}`} fill={val >= 0 ? "#10B981" : "#F43F5E"} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Win Rate Pie */}
      <div className="bg-[#121A2B] border border-slate-800 rounded-xl p-5" id="chart-winrate-pie">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
          Phân bổ tỷ lệ kết quả lệnh (Win Rate)
        </h3>
        <div className="h-[260px] w-full flex flex-col justify-between" id="winrate-pie-canvas">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winRateData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {winRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#1E293B", borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs font-medium pb-2 text-slate-300">
            {winRateData.map((entry, index) => (
              <span key={index} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}: {entry.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Mistake Distribution */}
      <div className="bg-[#121A2B] border border-slate-800 rounded-xl p-5" id="chart-mistakes">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
          Tần suất mắc sai lầm giao dịch
        </h3>
        <div className="h-[260px] w-full" id="mistakes-canvas">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mistakeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
              <XAxis type="number" stroke="#64748B" fontSize={10} tickLine={false} />
              <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "#1E293B", borderRadius: "8px" }}
              />
              <Bar dataKey="Số lần" fill="#F43F5E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Discipline Score Trend */}
      <div className="bg-[#121A2B] border border-slate-800 rounded-xl p-5" id="chart-discipline-trend">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
          Xu Hướng Điểm Số Kỷ Luật Giao Dịch
        </h3>
        <div className="h-[260px] w-full" id="discipline-trend-canvas">
          {disciplineTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={disciplineTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} domain={[20, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#1E293B", borderRadius: "8px" }}
                />
                <Line type="monotone" dataKey="Điểm kỷ luật" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Chưa có đủ lệnh giao dịch để vẽ biểu đồ
            </div>
          )}
        </div>
      </div>

      {/* 6. Account Comparison */}
      <div className="bg-[#121A2B] border border-slate-800 rounded-xl p-5" id="chart-accounts-comparison">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
          So sánh quy mô tài khoản hiện tại
        </h3>
        <div className="h-[260px] w-full" id="accounts-comparison-canvas">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={accountComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={9} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "#1E293B", borderRadius: "8px" }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "10px", color: "#94A3B8" }} />
              <Bar dataKey="Vốn ban đầu" fill="#1E293B" stroke="#334155" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Số dư hiện tại" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
