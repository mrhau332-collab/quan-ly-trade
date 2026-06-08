/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TradingAccount, Trade, TradeResult } from "../types.js";
import { Wallet, ShieldCheck, Activity, TrendingDown, ArrowUpRight, ArrowDownRight, Edit2, Trash2 } from "lucide-react";

interface AccountCardsProps {
  accounts: TradingAccount[];
  trades: Trade[];
  onEditAccount?: (account: TradingAccount) => void;
  onDeleteAccount?: (accountId: string) => void;
}

export default function AccountCards({ accounts, trades, onEditAccount, onDeleteAccount }: AccountCardsProps) {
  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "VND") {
      return amount.toLocaleString("vi-VN") + " ₫";
    }
    return "$" + amount.toLocaleString("en-US");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="account-cards-container">
      {accounts.map((acct) => {
        // Find active and closed trades for this specific account
        const accountTrades = trades.filter((t) => t.account_id === acct.id);
        const openTrades = accountTrades.filter((t) => t.result === TradeResult.OPEN);
        
        // Sum today's closed profit
        const todayStr = new Date().toISOString().substring(0, 10);
        const todayTrades = accountTrades.filter(
          (t) => t.closed_at && t.closed_at.substring(0, 10) === todayStr
        );
        const dailyPnL = todayTrades.reduce((sum, t) => sum + t.profit_loss, 0);

        // Sum monthly closed profit
        const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
        const monthlyTrades = accountTrades.filter(
          (t) => t.closed_at && t.closed_at.substring(0, 7) === currentMonthStr
        );
        const monthlyPnL = monthlyTrades.reduce((sum, t) => sum + t.profit_loss, 0);

        // Calculate progress to drawdown limits
        const totalProfitSinceStart = acct.current_balance - acct.starting_balance;
        const currentDrawdown = acct.equity < acct.current_balance 
          ? Number((((acct.current_balance - acct.equity) / acct.current_balance) * 100).toFixed(2))
          : 0;

        const isLive = acct.account_type === "LIVE";
        const themeColor = isLive 
          ? "border-emerald-500/20 shadow-emerald-500/5 hover:border-emerald-500/40" 
          : acct.account_type === "FMTO"
            ? "border-indigo-500/20 shadow-indigo-500/5 hover:border-indigo-500/40"
            : "border-amber-500/20 shadow-amber-500/5 hover:border-amber-500/40";

        const badgeColor = isLive
          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          : acct.account_type === "FMTO"
            ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
            : "bg-amber-500/15 text-amber-400 border-amber-500/30";

        return (
          <div
            key={acct.id}
            id={`account-card-${acct.id}`}
            className={`bg-[#121A2B] border rounded-xl p-5 shadow-lg transition-all hover:translate-y-[-2px] duration-300 ${themeColor}`}
          >
            {/* Header */}
            <div className="flex justify-between items-start" id={`acct-hdr-${acct.id}`}>
              <div>
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border ${badgeColor}`} id={`acct-type-${acct.id}`}>
                  {acct.account_type} ACCOUNT
                </span>
                <h3 className="text-base font-bold text-white mt-1.5" id={`acct-name-${acct.id}`}>
                  {acct.name}
                </h3>
                {(acct.purchase_price !== undefined && acct.purchase_price !== null) ? (
                  <div className="text-[10.5px] text-slate-400 mt-1 select-none font-semibold flex items-center gap-1.5 leading-none" id={`acct-pp-${acct.id}`}>
                    <span>Vốn mua:</span>
                    <span className="text-sky-400 font-bold font-mono">{(acct.purchase_price).toLocaleString("vi-VN")} ₫</span>
                  </div>
                ) : (
                  <div className="text-[10.5px] text-slate-500 mt-1 select-none font-semibold flex items-center gap-1.5 leading-none" id={`acct-pp-${acct.id}`}>
                    <span>Vốn mua:</span>
                    <span className="font-mono">Chưa cấu hình</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5" id={`acct-actions-box-${acct.id}`}>
                {onEditAccount && (
                  <button
                    onClick={() => onEditAccount(acct)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all cursor-pointer"
                    title="Chỉnh sửa tài khoản"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDeleteAccount && (
                  <button
                    onClick={() => onDeleteAccount(acct.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
                    title="Xóa tài khoản"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="p-2 bg-slate-800/40 border border-slate-700/60 rounded-xl text-slate-300 ml-1" id={`acct-icon-box-${acct.id}`}>
                  <Wallet className="w-5 h-5" id={`acct-icon-${acct.id}`} />
                </div>
              </div>
            </div>

            {/* Balances */}
            <div className="mt-5 grid grid-cols-2 gap-4 border-b border-slate-800 pb-4" id={`acct-balances-grid-${acct.id}`}>
              <div id={`acct-bal-container-${acct.id}`}>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block" id={`acct-bal-lbl-${acct.id}`}>SỐ DƯ (BALANCE)</span>
                <span className="text-lg font-bold font-mono text-white mt-1 block" id={`acct-bal-val-${acct.id}`}>
                  {formatCurrency(acct.current_balance, acct.currency)}
                </span>
              </div>
              <div id={`acct-eq-container-${acct.id}`}>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block" id={`acct-eq-lbl-${acct.id}`}>TÀI SẢN (EQUITY)</span>
                <span className="text-lg font-bold font-mono text-indigo-400 mt-1 block" id={`acct-eq-val-${acct.id}`}>
                  {formatCurrency(acct.equity, acct.currency)}
                </span>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-4 border-b border-slate-800 pb-4 text-xs" id={`acct-stats-grid-${acct.id}`}>
              <div className="flex justify-between items-center" id={`acct-daily-pnl-row-${acct.id}`}>
                <span className="text-slate-400" id={`acct-daily-pnl-lbl-${acct.id}`}>PnL Hôm nay:</span>
                <span className={`font-mono font-semibold flex items-center gap-0.5 ${
                  dailyPnL > 0 ? "text-emerald-400" : dailyPnL < 0 ? "text-rose-400" : "text-slate-400"
                }`} id={`acct-daily-pnl-val-${acct.id}`}>
                  {dailyPnL > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : dailyPnL < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                  {formatCurrency(dailyPnL, acct.currency)}
                </span>
              </div>

              <div className="flex justify-between items-center" id={`acct-monthly-pnl-row-${acct.id}`}>
                <span className="text-slate-400" id={`acct-monthly-pnl-lbl-${acct.id}`}>PnL Tháng này:</span>
                <span className={`font-mono font-semibold flex items-center gap-0.5 ${
                  monthlyPnL > 0 ? "text-emerald-400" : monthlyPnL < 0 ? "text-rose-400" : "text-slate-400"
                }`} id={`acct-monthly-pnl-val-${acct.id}`}>
                  {monthlyPnL > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : monthlyPnL < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                  {formatCurrency(monthlyPnL, acct.currency)}
                </span>
              </div>

              <div className="flex justify-between items-center" id={`acct-drawdown-row-${acct.id}`}>
                <span className="text-slate-400" id={`acct-drawdown-lbl-${acct.id}`}>Floating DD:</span>
                <span className={`font-mono font-semibold ${currentDrawdown > 0 ? "text-rose-400" : "text-emerald-400"}`} id={`acct-drawdown-val-${acct.id}`}>
                  {currentDrawdown}%
                </span>
              </div>

              <div className="flex justify-between items-center" id={`acct-open-trades-row-${acct.id}`}>
                <span className="text-slate-400" id={`acct-open-trades-lbl-${acct.id}`}>Lệnh đang chạy:</span>
                <span className="font-mono font-semibold bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 flex items-center gap-1.5" id={`acct-open-trades-val-${acct.id}`}>
                  {openTrades.length > 0 && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                  {openTrades.length}
                </span>
              </div>
            </div>

            {/* Risk Control Parameters */}
            <div className="mt-4" id={`acct-risk-params-${acct.id}`}>
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold mb-1" id={`acct-risk-hdr-${acct.id}`}>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> GIỚI HẠN SỤT GIẢM (MAX DD)</span>
                <span className="font-mono">{acct.max_drawdown_limit ? formatCurrency(acct.max_drawdown_limit, acct.currency) : "N/A"}</span>
              </div>
              <div className="w-full bg-[#0B1020] h-1.5 rounded-full overflow-hidden" id={`acct-progress-bar-bg-${acct.id}`}>
                <div
                  id={`acct-progress-bar-inner-${acct.id}`}
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(10, (acct.current_balance / acct.starting_balance) * 100 - 50))}%`
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-2.5" id={`acct-status-row-${acct.id}`}>
                <span className="text-[10px] text-slate-500" id={`acct-status-lbl-${acct.id}`}>Trạng thái:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                  acct.status === "ACTIVE" 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`} id={`acct-status-badge-${acct.id}`}>
                  ● {acct.status}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
