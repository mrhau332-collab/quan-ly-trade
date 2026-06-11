/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MarketNews, User, UserRole } from "../types.js";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Minus,
  MessageSquareCode,
  FlameKindling,
  RotateCw
} from "lucide-react";

interface MarketNewsSectionProps {
  news: MarketNews[];
  activeUser: User | null;
  onAddClick: () => void;
  onEditClick: (item: MarketNews) => void;
  onDeleteClick: (id: string) => void;
  onQuickUpdateActual: (id: string, actualValue: string) => Promise<void>;
  onSyncClick: () => Promise<void>;
  isSyncing: boolean;
}

export default function MarketNewsSection({
  news,
  activeUser,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onQuickUpdateActual,
  onSyncClick,
  isSyncing
}: MarketNewsSectionProps) {
  const [filter, setFilter] = useState<"all" | "high">("all");
  const [editingActualId, setEditingActualId] = useState<string | null>(null);
  const [quickActualVal, setQuickActualVal] = useState("");

  const isAdmin = activeUser?.role === UserRole.ADMIN;

  // Formatting helpers
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch {
      return "00:00";
    }
  };

  const formatDateLabel = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      if (date.toDateString() === today.toDateString()) {
        return "Hôm nay, " + date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return "Ngày mai, " + date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      }
      return date.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" });
    } catch {
      return "Chưa rõ ngày";
    }
  };

  // Quick Actual inline submission
  const handleQuickSubmit = async (id: string) => {
    await onQuickUpdateActual(id, quickActualVal);
    setEditingActualId(null);
    setQuickActualVal("");
  };

  // Filtering Logic
  const filteredNews = news.filter((item) => {
    const itemDate = new Date(item.datetime);
    const today = new Date();
    
    // Only show news of the current day (local timezone)
    if (itemDate.toDateString() !== today.toDateString()) {
      return false;
    }

    if (filter === "high") {
      return item.impact === "HIGH";
    }

    return true; // "all"
  });

  // Group by Date
  const groupNewsByDate = () => {
    // Sort news chronologically
    const sorted = [...filteredNews].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    
    const groups: { [key: string]: MarketNews[] } = {};
    sorted.forEach((item) => {
      try {
        const dateKey = new Date(item.datetime).toDateString();
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(item);
      } catch (e) {
        if (!groups["Invalid Date"]) {
          groups["Invalid Date"] = [];
        }
        groups["Invalid Date"].push(item);
      }
    });
    return groups;
  };

  const newsGroups = groupNewsByDate();

  // Render gold price impact helper
  const renderGoldImpactBadge = (direction: MarketNews["gold_impact_direction"]) => {
    switch (direction) {
      case "UP":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Vàng Tăng 📈
          </span>
        );
      case "DOWN":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> Vàng Giảm 📉
          </span>
        );
      case "VOLATILE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Biến động mạnh ⚡
          </span>
        );
      case "NEUTRAL":
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-400 border border-slate-700/60 flex items-center gap-1">
            <Minus className="w-3.5 h-3.5" /> Ít ảnh hưởng ⚪
          </span>
        );
    }
  };

  const getImpactColor = (impact: MarketNews["impact"]) => {
    switch (impact) {
      case "HIGH":
        return "bg-rose-500/15 text-rose-400 border-rose-500/35 shadow-rose-950/20";
      case "MEDIUM":
        return "bg-amber-500/15 text-amber-400 border-amber-500/35 shadow-amber-950/20";
      case "LOW":
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-700 shadow-slate-950/20";
    }
  };

  return (
    <div className="space-y-4" id="market-news-dashboard-widget">
      {/* Widget Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
            <FlameKindling className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#f43f5e] flex items-center gap-1.5">
              Lịch Sự kiện Vĩ mô & Nhận định Giá Vàng
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Các thông tin kinh tế lớn theo ngày/giờ có thể làm rung lắc giá XAU/USD.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Quick Filters */}
          <div className="flex items-center bg-[#121A2B] border border-slate-800 rounded-lg p-0.5 text-[11px]">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                filter === "all" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tất cả hôm nay
            </button>
            <button
              onClick={() => setFilter("high")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                filter === "high" ? "bg-slate-800 text-rose-400 font-bold" : "text-slate-400 hover:text-rose-500/80"
              }`}
            >
              Tác động mạnh 🔥
            </button>
          </div>

          {/* Sync News Button */}
          <button
            onClick={onSyncClick}
            disabled={isSyncing}
            className={`px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:opacity-50 text-white font-semibold text-xs rounded-lg flex items-center gap-1 border border-slate-700/60 shadow-md transition-all cursor-pointer ${
              isSyncing ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Đang đồng bộ..." : "Đồng bộ Forex Factory"}
          </button>

          {/* Add News Button */}
          <button
            onClick={onAddClick}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1 border border-indigo-500/20 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Tạo tin
          </button>
        </div>
      </div>

      {/* Main List Timeline */}
      {Object.keys(newsGroups).length > 0 ? (
        <div className="space-y-6">
          {Object.keys(newsGroups).map((dateKey) => {
            const dayEvents = newsGroups[dateKey];
            const dateLabel = formatDateLabel(dayEvents[0].datetime);

            return (
              <div key={dateKey} className="space-y-3">
                {/* Date Header separator */}
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-[#121A2B] border border-slate-800 rounded text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-black text-slate-200 tracking-wide">{dateLabel}</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent"></div>
                </div>

                {/* Day events grid/list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dayEvents.map((item) => {
                    const impactStyle = getImpactColor(item.impact);
                    const timeStr = formatTime(item.datetime);

                    return (
                      <div
                        key={item.id}
                        className="bg-[#121A2B] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg hover:border-slate-700/80 transition-all group"
                      >
                        {/* Event Meta Line */}
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-indigo-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {timeStr}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${impactStyle}`}>
                              {item.impact === "HIGH" ? "MẠNH" : item.impact === "MEDIUM" ? "T.BÌNH" : "YẾU"}
                            </span>
                          </div>

                          {/* Controls (Admin / Collaborate tools) */}
                          <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => onEditClick(item)}
                              className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-[#0B1020] rounded transition-all cursor-pointer"
                              title="Chỉnh sửa chi tiết tin"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteClick(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-[#0B1020] rounded transition-all cursor-pointer"
                              title="Xóa tin tức"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Title and Gold impact */}
                        <div className="space-y-1.5 mb-3">
                          <h4 className="text-xs font-bold text-white leading-snug">{item.title}</h4>
                          <div className="flex flex-wrap gap-2 items-center">
                            {renderGoldImpactBadge(item.gold_impact_direction)}
                          </div>
                        </div>

                        {/* Economics Grid */}
                        <div className="bg-[#0B1020] border border-slate-800/60 rounded-lg p-2.5 grid grid-cols-3 gap-2 text-center text-[10.5px] font-mono mb-3.5">
                          <div className="border-r border-slate-800/80">
                            <span className="text-[9px] text-slate-500 font-sans block mb-0.5">KỲ TRƯỚC</span>
                            <span className="text-slate-300 font-bold">{item.previous || "-"}</span>
                          </div>
                          <div className="border-r border-slate-800/80">
                            <span className="text-[9px] text-slate-500 font-sans block mb-0.5">DỰ BÁO</span>
                            <span className="text-slate-300 font-bold">{item.forecast || "-"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 font-sans block mb-0.5">THỰC TẾ</span>
                            {editingActualId === item.id ? (
                              <div className="flex items-center justify-center gap-1 mt-0.5">
                                <input
                                  type="text"
                                  value={quickActualVal}
                                  onChange={(e) => setQuickActualVal(e.target.value)}
                                  className="w-12 bg-black border border-indigo-500 rounded text-[10px] text-center font-bold px-0.5 py-0.5 text-white"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleQuickSubmit(item.id);
                                    if (e.key === "Escape") setEditingActualId(null);
                                  }}
                                />
                                <button
                                  onClick={() => handleQuickSubmit(item.id)}
                                  className="p-0.5 bg-emerald-600 rounded text-white cursor-pointer"
                                >
                                  <Check className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={() => setEditingActualId(null)}
                                  className="p-0.5 bg-slate-800 rounded text-slate-400 cursor-pointer"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                <span className={`font-black ${item.actual ? "text-amber-400" : "text-slate-500 italic"}`}>
                                  {item.actual || "Chờ tin..."}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingActualId(item.id);
                                    setQuickActualVal(item.actual || "");
                                  }}
                                  className="text-[9px] text-indigo-400 hover:text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  title="Cập nhật nhanh Actual"
                                >
                                  📝
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Description / Analysis */}
                        {item.description && (
                          <div className="border-t border-slate-800/80 pt-2 flex items-start gap-1.5">
                            <span className="text-slate-500 mt-0.5 flex-shrink-0">
                              <MessageSquareCode className="w-3 h-3 text-rose-400/85" />
                            </span>
                            <p className="text-[10px] text-slate-400 leading-relaxed italic">
                              {item.description}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#121A2B] border border-slate-800 p-8 rounded-xl text-center text-slate-500 text-xs font-mono">
          Không tìm thấy sự kiện tin tức vĩ mô nào khớp với điều kiện lọc.
        </div>
      )}
    </div>
  );
}
