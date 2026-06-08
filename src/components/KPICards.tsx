/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Trade, TradingAccount, RewardPenalty, TradeResult, IncentiveType, AccountType, AccountStatus } from "../types.js";
import { TrendingUp, Award, Percent, DollarSign, Activity, AlertTriangle, Edit2, Check, X } from "lucide-react";

interface KPICardsProps {
  trades: Trade[];
  accounts: TradingAccount[];
  rewardsPenalties: RewardPenalty[];
  activeUserId: string;
  sharedFund?: any;
  onUpdateCapital?: (newCapital: number) => Promise<void>;
}

export default function KPICards({ trades, accounts, rewardsPenalties, activeUserId, sharedFund, onUpdateCapital }: KPICardsProps) {
  // Conversions for aggregate display: $1 = 25,000 VND
  const USD_TO_VND = 25000;

  // Inline edit state for capital
  const [isEditingCap, setIsEditingCap] = useState(false);
  const [inputCapVal, setInputCapVal] = useState("");

  const contributedCapital = sharedFund?.contributed_capital ?? 20000000;
  const accountsCost = accounts.reduce((sum, a) => sum + (a.purchase_price ?? 0), 0);
  const otherInflows = (sharedFund?.transactions || []).filter((t: any) => t.type === "INFLOW" && t.id !== "tx_1").reduce((sum: number, t: any) => sum + t.amount, 0);
  const otherOutflows = (sharedFund?.transactions || []).filter((t: any) => t.type === "OUTFLOW" && t.id !== "tx_2").reduce((sum: number, t: any) => sum + t.amount, 0);
  const remainingFundBalance = contributedCapital - accountsCost + otherInflows - otherOutflows;

  // Real-time calculations
  const totalBalanceVND = accounts.reduce((acc, current) => {
    if (current.currency === "USD") {
      return acc + current.current_balance * USD_TO_VND;
    }
    return acc + current.current_balance;
  }, 0);

  const totalStartingVND = accounts.reduce((acc, current) => {
    if (current.currency === "USD") {
      return acc + current.starting_balance * USD_TO_VND;
    }
    return acc + current.starting_balance;
  }, 0);

  const totalPnLVND = accounts.reduce((acc, current) => {
    const isLive = current.account_type === AccountType.LIVE;
    const rawPnL = current.current_balance - current.starting_balance;
    const pnlInVND = current.currency === "USD" ? rawPnL * USD_TO_VND : rawPnL;

    if (isLive) {
      // Tài khoản LIVE: âm hay dương đều tính đầy đủ vào lợi nhuận chung
      return acc + pnlInVND;
    } else {
      // Tài khoản QUỸ (FMTO, TOPSTEP,...)
      if (current.status === AccountStatus.FAILED) {
        // Nếu bị Rớt (FAILED): lấy âm giá tiền sắm quỹ làm số âm lỗ thực tế
        const purchasePrice = current.purchase_price ?? 2300000;
        return acc - purchasePrice;
      } else {
        // Đang hoạt động/paused: Số âm không tính (bỏ qua), chỉ tính số dương
        return acc + (pnlInVND > 0 ? pnlInVND : 0);
      }
    }
  }, 0);

  const totalPnLUSD = accounts.reduce((acc, current) => {
    const isLive = current.account_type === AccountType.LIVE;
    const rawPnL = current.current_balance - current.starting_balance;
    const pnlInUSD = current.currency === "USD" ? rawPnL : rawPnL / USD_TO_VND;

    if (isLive) {
      // Tài khoản LIVE: Tính đủ âm dương
      return acc + pnlInUSD;
    } else {
      // Tài khoản QUỸ
      if (current.status === AccountStatus.FAILED) {
        // Nếu bị Rớt: tính âm giá sắm quỹ quy đổi ra USD
        const purchasePriceVND = current.purchase_price ?? 2300000;
        const purchasePriceUSD = purchasePriceVND / USD_TO_VND;
        return acc - purchasePriceUSD;
      } else {
        // Đang hoạt động: Chỉ tính lời dương, bỏ qua số âm gồng lỗ
        return acc + (pnlInUSD > 0 ? pnlInUSD : 0);
      }
    }
  }, 0);

  const handleStartEdit = () => {
    setInputCapVal(contributedCapital.toString());
    setIsEditingCap(true);
  };

  const handleSave = async () => {
    const val = parseFloat(inputCapVal);
    if (isNaN(val) || val < 0) return;
    if (onUpdateCapital) {
      await onUpdateCapital(val);
    }
    setIsEditingCap(false);
  };

  const handleCancel = () => {
    setIsEditingCap(false);
  };

  // Closed trades calculations
  const closedTrades = trades.filter(t => t.result !== TradeResult.OPEN);
  const totalClosed = closedTrades.length;
  const wins = closedTrades.filter(t => t.result === TradeResult.WIN);
  const winRate = totalClosed > 0 ? Math.round((wins.length / totalClosed) * 100) : 0;

  // Profit factor
  const grossProfit = closedTrades.reduce((acc, t) => {
    // If trade belongs to VND account, covert to USD or calculate in virtual USD for factor
    const pl = t.profit_loss;
    return pl > 0 ? acc + pl : acc;
  }, 0);
  
  const grossLoss = closedTrades.reduce((acc, t) => {
    const pl = t.profit_loss;
    return pl < 0 ? acc + Math.abs(pl) : acc;
  }, 0);

  const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : totalClosed > 0 && grossProfit > 0 ? "∞" : "1.00";

  // Average R:R
  const rrs = closedTrades.map(t => t.rr_ratio).filter(rr => rr > 0);
  const averageRR = rrs.length > 0 ? Number((rrs.reduce((a, b) => a + b, 0) / rrs.length).toFixed(1)) : 2.5;

  // Calculate discipline score for active user (starting score: 100)
  const userRP = rewardsPenalties.filter(rp => rp.user_id === activeUserId);
  const rewardsPoint = userRP.filter(rp => rp.type === IncentiveType.REWARD).reduce((a, b) => a + b.score, 0);
  const penaltiesPoint = userRP.filter(rp => rp.type === IncentiveType.PENALTY).reduce((a, b) => a + b.score, 0);
  const disciplineScore = Math.max(0, Math.min(100, 100 + rewardsPoint - penaltiesPoint));

  // Determine indicator color
  const getDisciplineColor = (score: number) => {
    if (score >= 85) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 70) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "VND") {
      return amount.toLocaleString("vi-VN") + " ₫";
    }
    return "$" + amount.toLocaleString("en-US");
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4" id="kpi-cards-grid">
      {/* Total Capital */}
      <div className="bg-[#121A2B] border border-slate-800 p-4 rounded-xl flex flex-col justify-between" id="kpi-total-capital">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider">TỔNG VỐN QUẢN LÝ</span>
            {!isEditingCap && onUpdateCapital && (
              <button
                onClick={handleStartEdit}
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                title="Thay đổi tổng vốn góp"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="p-1.5 bg-slate-800/40 border border-slate-700/50 rounded-lg text-sky-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          {isEditingCap ? (
            <div className="flex items-center gap-1" id="kpi-cap-input-box">
              <input
                type="number"
                value={inputCapVal}
                onChange={(e) => setInputCapVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
                autoFocus
                className="w-full bg-[#0B1020] border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white font-mono font-bold"
              />
              <button onClick={handleSave} className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={handleCancel} className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="text-lg font-bold tracking-tight text-white font-mono leading-none">
              {formatCurrency(contributedCapital, "VND")}
            </div>
          )}
          <span className="text-[9px] text-slate-400 mt-2 block font-semibold hover:text-indigo-400 transition-colors" title="Số vốn nhàn rỗi khả dụng sau khi trừ đi vốn đã chi mua tài khoản">
            Quỹ tiền dư: <strong className="text-emerald-400 font-mono">{formatCurrency(remainingFundBalance, "VND")}</strong>
          </span>
        </div>
      </div>

      {/* Net P&L */}
      <div className="bg-[#121A2B] border border-slate-800 p-4 rounded-xl flex flex-col justify-between" id="kpi-net-pnl">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">TỔNG LỢI NHUẬN (PnL)</span>
          <div className={`p-1.5 rounded-lg border text-xs ${
            totalPnLVND >= 0 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className={`text-xl font-bold tracking-tight font-mono leading-none ${
            totalPnLVND >= 0 ? "text-emerald-400" : "text-rose-400"
          }`}>
            {totalPnLVND >= 0 ? "+" : ""}
            {formatCurrency(totalPnLVND, "VND")}
          </div>
          <span className="text-[10px] text-slate-300 mt-1 block font-semibold font-mono">
            {totalPnLUSD >= 0 ? "+" : ""}{totalPnLUSD.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
          </span>
          <span className="text-[9px] text-slate-500 mt-0.5 block leading-tight">
            Hiệu suất: {((totalPnLVND / totalStartingVND) * 100).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Win Rate */}
      <div className="bg-[#121A2B] border border-slate-800 p-4 rounded-xl flex flex-col justify-between" id="kpi-winrate">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">TỶ LỆ THẮNG</span>
          <div className="p-1.5 bg-[#0B1020] border border-slate-800 rounded-lg text-slate-400">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold font-mono tracking-tight text-white leading-none">
            {winRate}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {wins.length} Win / {totalClosed} Trade đã đóng
          </span>
        </div>
      </div>

      {/* Profit Factor */}
      <div className="bg-[#121A2B] border border-slate-800 p-4 rounded-xl flex flex-col justify-between" id="kpi-profit-factor">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">PROFIT FACTOR</span>
          <div className="p-1.5 bg-[#0B1020] border border-slate-800 rounded-lg text-slate-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold font-mono tracking-tight text-white leading-none">
            {profitFactor}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Tổng Lời / Tổng Lỗ gộp
          </span>
        </div>
      </div>

      {/* Average R:R */}
      <div className="bg-[#121A2B] border border-slate-800 p-4 rounded-xl flex flex-col justify-between" id="kpi-avg-rr">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">R:R TRUNG BÌNH</span>
          <div className="p-1.5 bg-[#0B1020] border border-slate-800 rounded-lg text-slate-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold font-mono tracking-tight text-white leading-none">
            1:{averageRR}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Tỉ lệ Rủi ro : Lợi nhuận
          </span>
        </div>
      </div>

      {/* Discipline Score */}
      <div className="bg-[#121A2B] border border-slate-800 p-4 rounded-xl flex flex-col justify-between" id="kpi-discipline">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">ĐIỂM KỶ LUẬT THÁNG</span>
          <div className="p-1.5 bg-[#0B1020] border border-slate-800 rounded-lg text-indigo-400">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className={`text-2xl font-extrabold font-mono tracking-tight leading-none ${getDisciplineColor(disciplineScore).split(" ")[0]}`}>
            {disciplineScore}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {rewardsPoint} thưởng / {penaltiesPoint} phạt
          </span>
        </div>
      </div>
    </div>
  );
}
