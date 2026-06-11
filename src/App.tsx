/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  UserRole,
  AccountType,
  TradingAccount,
  Trade,
  TradeResult,
  TradeDirection,
  TradeEmotion,
  MistakeType,
  MistakeSeverity,
  IncentiveType,
  ReviewRating,
  DailyJournal,
  AppNotification,
  RewardPenalty,
  AccountabilityReview,
  TradeMistake,
  Regulation,
  SharedFund,
  SharedFundTransaction,
  MarketNews
} from "./types.js";
import UserPicker from "./components/UserPicker.tsx";
import KPICards from "./components/KPICards.tsx";
import AccountCards from "./components/AccountCards.tsx";
import Charts from "./components/Charts.tsx";
import PortfolioHeatmap from "./components/PortfolioHeatmap.tsx";
import MarketNewsSection from "./components/MarketNewsSection.tsx";
import {
  Activity,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Cpu,
  FileCheck2,
  Image as ImageIcon,
  LogOut,
  Moon,
  Plus,
  RefreshCw,
  RotateCcw,
  Scale,
  ShieldAlert,
  Sliders,
  TrendingUp,
  User as UserIcon,
  Users,
  X,
  Bell,
  Trash2,
  Lock,
  ArrowRight,
  Palette,
  Edit2,
  Settings,
  UserPlus,
  Wallet,
  Coins,
  Landmark,
  PiggyBank,
  Save
} from "lucide-react";

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<"dark" | "cyber" | "light" | "cosmic">(() => {
    return (localStorage.getItem("tg-theme") as any) || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tg-theme", theme);
  }, [theme]);

  // DB States
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [mistakes, setMistakes] = useState<TradeMistake[]>([]);
  const [rewardsPenalties, setRewardsPenalties] = useState<RewardPenalty[]>([]);
  const [reviews, setReviews] = useState<AccountabilityReview[]>([]);
  const [journals, setJournals] = useState<DailyJournal[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [sharedFund, setSharedFund] = useState<SharedFund | null>(null);
  const [marketNews, setMarketNews] = useState<MarketNews[]>([]);
  
  // Auth simulation state
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const activeUserRef = useRef<User | null>(null);
  activeUserRef.current = activeUser;
  const journalLastLoadedKeyRef = useRef<string>("");

  // Custom visual confirm and alert states
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [alertDialog, setAlertDialog] = useState<{
    title: string;
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showCustomConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(null);
      }
    });
  };

  const showCustomAlert = (title: string, message: string, type: "success" | "error" | "info" = "success") => {
    setAlertDialog({
      title,
      message,
      type
    });
  };

  // App loading & processing states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "trade-journal" | "daily-journal" | "accountability" | "leaderboard" | "notifications">("dashboard");
  const [isEditingCapital, setIsEditingCapital] = useState(false);
  const [tempCapital, setTempCapital] = useState("");

  // Notifications toggler
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  // Form states & Modals
  const [showOpenTradeModal, setShowOpenTradeModal] = useState(false);
  const [showCloseTradeModal, setShowCloseTradeModal] = useState(false);
  const [selectedTradeToClose, setSelectedTradeToClose] = useState<Trade | null>(null);

  // Shared Fund state
  const [showAddFundTxModal, setShowAddFundTxModal] = useState(false);
  const [fundTxForm, setFundTxForm] = useState({
    amount: "2000000",
    type: "OUTFLOW" as "INFLOW" | "OUTFLOW",
    purpose: "Chi mua thử thách quỹ",
    description: "",
    user_id: ""
  });

  // New interactive states & Modals
  const [showEditTradeModal, setShowEditTradeModal] = useState(false);
  const [selectedTradeToEdit, setSelectedTradeToEdit] = useState<Trade | null>(null);
  const [editTradeForm, setEditTradeForm] = useState({
    symbol: "",
    direction: "BUY",
    entry_price: "",
    stop_loss: "",
    take_profit: "",
    risk_amount: "",
    setup_name: "",
    emotion_before_trade: "CONFIDENT" as TradeEmotion,
    result: "OPEN" as TradeResult,
    profit_loss: "",
    notes: "",
    trade_plan: ""
  });

  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [selectedAccountToEdit, setSelectedAccountToEdit] = useState<TradingAccount | null>(null);
  
  const [addAccountCategory, setAddAccountCategory] = useState<"FUND" | "LIVE">("FUND");
  const [addFundName, setAddFundName] = useState<string>("FMTO");

  const [editAccountCategory, setEditAccountCategory] = useState<"FUND" | "LIVE">("FUND");
  const [editFundName, setEditFundName] = useState<string>("FMTO");

  const [accountForm, setAccountForm] = useState({
    name: "",
    account_type: "FMTO",
    owner_id: "",
    starting_balance: "10000",
    current_balance: "10000",
    daily_drawdown_limit: "5",
    max_drawdown_limit: "10",
    status: "ACTIVE" as any,
    currency: "USD",
    purchase_price: "2300000"
  });

  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    avatar: "",
    role: "TRADER" as any,
    discipline_score: "100"
  });

  const [showEditReviewModal, setShowEditReviewModal] = useState(false);
  const [selectedReviewToEdit, setSelectedReviewToEdit] = useState<AccountabilityReview | null>(null);
  const [editReviewForm, setEditReviewForm] = useState({
    rating: "PASS" as ReviewRating,
    comment: ""
  });

  // 1. Open Trade Form
  const [openTradeForm, setOpenTradeForm] = useState({
    account_id: "",
    symbol: "XAUUSD",
    direction: "BUY",
    entry_price: "",
    stop_loss: "",
    take_profit: "",
    risk_amount: "500",
    setup_name: "Quasimodo Pattern",
    trade_plan: "",
    entry_reason: "",
    emotion_before_trade: "CONFIDENT" as TradeEmotion,
    screenshot_before: "",
    notes: ""
  });

  // 2. Close Trade Form
  const [closeTradeForm, setCloseTradeForm] = useState({
    result: "WIN" as TradeResult,
    profit_loss: "",
    screenshot_after: "",
    notes: "",
    follow_plan: true,
    selectedMistakes: [] as MistakeType[]
  });

  // 3. Daily Journal Form
  const [dailyJournalForm, setDailyJournalForm] = useState({
    date: new Date().toISOString().substring(0, 10),
    market_condition: "",
    emotion: "",
    what_went_well: "",
    what_went_wrong: "",
    lessons: "",
    tomorrow_plan: ""
  });

  // 4. Accountability Review Form
  const [reviewForm, setReviewForm] = useState({
    trade_id: "",
    rating: "PASS" as ReviewRating,
    comment: ""
  });

  // 5. Leaderboard custom penalty/reward form
  const [incentiveForm, setIncentiveForm] = useState({
    user_id: "",
    type: "REWARD" as IncentiveType,
    score: "50000",
    reason: ""
  });

  const [showAddRegModal, setShowAddRegModal] = useState(false);
  const [showAddNewsModal, setShowAddNewsModal] = useState(false);
  const [showEditNewsModal, setShowEditNewsModal] = useState(false);
  const [showImportTradesModal, setShowImportTradesModal] = useState(false);
  const [selectedNewsToEdit, setSelectedNewsToEdit] = useState<MarketNews | null>(null);
  
  const [newsForm, setNewsForm] = useState({
    title: "",
    impact: "HIGH" as "HIGH" | "MEDIUM" | "LOW",
    datetime: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    forecast: "",
    actual: "",
    previous: "",
    gold_impact_direction: "VOLATILE" as "UP" | "DOWN" | "VOLATILE" | "NEUTRAL",
    description: ""
  });
  const [quickApplyState, setQuickApplyState] = useState<{
    isOpen: boolean;
    reg: Regulation | null;
    selectedUserId: string;
    reason: string;
  }>({
    isOpen: false,
    reg: null,
    selectedUserId: "",
    reason: ""
  });
  const [regForm, setRegForm] = useState({
    id: "",
    title: "",
    type: "REWARD" as IncentiveType,
    amount: 50000,
    description: ""
  });

  // CSV Import States
  const [csvFileText, setCsvFileText] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    symbol: "",
    direction: "",
    entry_price: "",
    stop_loss: "",
    take_profit: "",
    profit_loss: "",
    opened_at: "",
    closed_at: "",
    risk_amount: ""
  });
  const [importAccountId, setImportAccountId] = useState("");
  const [importSelectedRows, setImportSelectedRows] = useState<boolean[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // CSV Parsing helper functions
  const parseCSVData = (text: string) => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return null;

    let delimiter = ",";
    const firstLine = lines[0];
    if (firstLine.includes(";")) delimiter = ";";
    else if (firstLine.includes("\t")) delimiter = "\t";

    const parseLine = (line: string) => {
      const result = [];
      let curVal = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(curVal.trim().replace(/^"|"$/g, ""));
          curVal = "";
        } else {
          curVal += char;
        }
      }
      result.push(curVal.trim().replace(/^"|"$/g, ""));
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.trim());
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = parseLine(line);
      if (values.length < headers.length) continue;

      const rowObj: any = {};
      headers.forEach((header, index) => {
        rowObj[header] = values[index];
      });
      rows.push(rowObj);
    }

    return { headers, rows };
  };

  const autoDetectColumns = (headers: string[]) => {
    const mapping = {
      symbol: "",
      direction: "",
      entry_price: "",
      stop_loss: "",
      take_profit: "",
      profit_loss: "",
      opened_at: "",
      closed_at: "",
      risk_amount: ""
    };

    const findMatch = (keys: string[]) => {
      for (const header of headers) {
        const lower = header.toLowerCase().replace(/[\s_\/-]/g, "");
        for (const key of keys) {
          if (lower.includes(key.toLowerCase().replace(/[\s_\/-]/g, ""))) {
            return header;
          }
        }
      }
      return "";
    };

    mapping.symbol = findMatch(["symbol", "pair", "item", "ticker", "asset", "instrument", "mã", "cặp"]);
    mapping.direction = findMatch(["type", "dir", "direction", "action", "side", "loại", "hướng"]);
    mapping.entry_price = findMatch(["entry", "openprice", "giávào", "giámở", "open_price", "entry_price"]);
    mapping.stop_loss = findMatch(["stoploss", "sl", "stop_loss", "cắtlỗ"]);
    mapping.take_profit = findMatch(["takeprofit", "tp", "take_profit", "chốtlời"]);
    mapping.profit_loss = findMatch(["profit", "loss", "pl", "pnl", "lợinhuận", "kếtquả"]);
    mapping.opened_at = findMatch(["opentime", "opened", "date", "time", "ngàyvào", "open_time"]);
    mapping.closed_at = findMatch(["closetime", "closed", "ngàyđóng", "close_time"]);
    mapping.risk_amount = findMatch(["risk", "riskamount", "rủiro", "risk_amount"]);

    // Set fallback index-based defaults if not matched
    if (!mapping.symbol && headers.length > 4) mapping.symbol = headers[4]; // Item
    if (!mapping.direction && headers.length > 2) mapping.direction = headers[2]; // Type
    if (!mapping.entry_price && headers.length > 5) mapping.entry_price = headers[5]; // Price (open)
    if (!mapping.stop_loss && headers.length > 6) mapping.stop_loss = headers[6]; // S/L
    if (!mapping.take_profit && headers.length > 7) mapping.take_profit = headers[7]; // T/P
    if (!mapping.profit_loss && headers.length > 13) mapping.profit_loss = headers[13]; // Profit

    return mapping;
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvFileText(text);

      const parsed = parseCSVData(text);
      if (parsed) {
        setCsvHeaders(parsed.headers);
        setRawRows(parsed.rows);
        
        // Auto-detect columns
        const detected = autoDetectColumns(parsed.headers);
        setColumnMapping(detected);

        // Pre-select all rows
        setImportSelectedRows(new Array(parsed.rows.length).fill(true));
      }
    };
    reader.readAsText(file);
  };

  // Load active DB state from fullstack API
  const fetchDB = async (showProgress = false) => {
    if (showProgress) setRefreshing(true);
    try {
      const resp = await fetch("/api/db");
      if (!resp.ok) throw new Error("Can't fetch server database state.");
      const data = await resp.json();
      
      setUsers(data.users || []);
      setAccounts(data.trading_accounts || []);
      setTrades(data.trades || []);
      setMistakes(data.trade_mistakes || []);
      setRewardsPenalties(data.rewards_penalties || []);
      setReviews(data.accountability_reviews || []);
      setJournals(data.daily_journals || []);
      setNotifications(data.notifications || []);
      setRegulations(data.regulations || []);
      setSharedFund(data.shared_fund || null);
      setMarketNews(data.market_news || []);

      // Auto assign and sync active user details
      const savedUserId = localStorage.getItem("tg-active-user-id");
      const currentActiveUser = activeUserRef.current;
      if (data.users && data.users.length > 0) {
        if (currentActiveUser) {
          const freshUser = data.users.find((u: any) => u.id === currentActiveUser.id);
          if (freshUser) {
            setActiveUser(freshUser);
          }
        } else {
          const matchedUser = savedUserId ? data.users.find((u: any) => u.id === savedUserId) : null;
          setActiveUser(matchedUser || data.users.find((u: any) => u.id === "1") || data.users[0]);
        }
      }
    } catch (err) {
      console.error("Fetch DB Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDB();

    // Auto-poll every 10 seconds for real-time synchronization between Hậu & Đức
    const interval = setInterval(() => {
      fetchDB();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Sync journal formulation for date change
  const handleJournalDateChange = (dateVal: string) => {
    if (!activeUser) return;
    
    const currentKey = `${activeUser.id}_${dateVal}`;
    journalLastLoadedKeyRef.current = currentKey;

    // Check draft first
    const draftKey = `tg_draft_journal_${activeUser.id}_${dateVal}`;
    const draftStr = localStorage.getItem(draftKey);
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        setDailyJournalForm(draft);
        return;
      } catch (e) {
        console.error("Error parsing journal draft:", e);
      }
    }

    const existing = journals.find(
      (j) => j.user_id === activeUser?.id && j.date === dateVal
    );
    if (existing) {
      setDailyJournalForm({
        date: dateVal,
        market_condition: existing.market_condition,
        emotion: existing.emotion,
        what_went_well: existing.what_went_well,
        what_went_wrong: existing.what_went_wrong,
        lessons: existing.lessons,
        tomorrow_plan: existing.tomorrow_plan
      });
    } else {
      setDailyJournalForm({
        date: dateVal,
        market_condition: "",
        emotion: "",
        what_went_well: "",
        what_went_wrong: "",
        lessons: "",
        tomorrow_plan: ""
      });
    }
  };

  const handleSaveJournalDraft = () => {
    if (!activeUser) return;
    const draftKey = `tg_draft_journal_${activeUser.id}_${dailyJournalForm.date}`;
    localStorage.setItem(draftKey, JSON.stringify(dailyJournalForm));
    showCustomAlert("Thành công", "Đã lưu bản nháp nhật ký ngày vào trình duyệt!", "success");
  };

  useEffect(() => {
    if (activeUser) {
      const currentKey = `${activeUser.id}_${dailyJournalForm.date}`;
      if (currentKey !== journalLastLoadedKeyRef.current) {
        handleJournalDateChange(dailyJournalForm.date);
      }
    }
  }, [activeUser, dailyJournalForm.date]);

  // Load draft values for all forms on mount
  useEffect(() => {
    const loadDraft = (key: string, setter: (val: any) => void) => {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setter(JSON.parse(saved));
        } catch (e) {
          console.error("Error loading draft for " + key, e);
        }
      }
    };
    loadDraft("tg_draft_openTradeForm", setOpenTradeForm);
    loadDraft("tg_draft_closeTradeForm", setCloseTradeForm);
    loadDraft("tg_draft_editTradeForm", setEditTradeForm);
    loadDraft("tg_draft_accountForm", setAccountForm);
    loadDraft("tg_draft_userForm", setUserForm);
    loadDraft("tg_draft_reviewForm", setReviewForm);
    loadDraft("tg_draft_newsForm", setNewsForm);
    loadDraft("tg_draft_regForm", setRegForm);
    loadDraft("tg_draft_incentiveForm", setIncentiveForm);
    loadDraft("tg_draft_fundTxForm", setFundTxForm);
  }, []);

  // Auto-save form drafts to localStorage on changes
  useEffect(() => {
    localStorage.setItem("tg_draft_openTradeForm", JSON.stringify(openTradeForm));
  }, [openTradeForm]);

  useEffect(() => {
    localStorage.setItem("tg_draft_closeTradeForm", JSON.stringify(closeTradeForm));
  }, [closeTradeForm]);

  useEffect(() => {
    localStorage.setItem("tg_draft_editTradeForm", JSON.stringify(editTradeForm));
  }, [editTradeForm]);

  useEffect(() => {
    localStorage.setItem("tg_draft_accountForm", JSON.stringify(accountForm));
  }, [accountForm]);

  useEffect(() => {
    localStorage.setItem("tg_draft_userForm", JSON.stringify(userForm));
  }, [userForm]);

  useEffect(() => {
    localStorage.setItem("tg_draft_reviewForm", JSON.stringify(reviewForm));
  }, [reviewForm]);

  useEffect(() => {
    localStorage.setItem("tg_draft_newsForm", JSON.stringify(newsForm));
  }, [newsForm]);

  useEffect(() => {
    localStorage.setItem("tg_draft_regForm", JSON.stringify(regForm));
  }, [regForm]);

  useEffect(() => {
    localStorage.setItem("tg_draft_incentiveForm", JSON.stringify(incentiveForm));
  }, [incentiveForm]);

  useEffect(() => {
    localStorage.setItem("tg_draft_fundTxForm", JSON.stringify(fundTxForm));
  }, [fundTxForm]);

  const handleSaveAllDrafts = () => {
    localStorage.setItem("tg_draft_openTradeForm", JSON.stringify(openTradeForm));
    localStorage.setItem("tg_draft_closeTradeForm", JSON.stringify(closeTradeForm));
    localStorage.setItem("tg_draft_editTradeForm", JSON.stringify(editTradeForm));
    localStorage.setItem("tg_draft_accountForm", JSON.stringify(accountForm));
    localStorage.setItem("tg_draft_userForm", JSON.stringify(userForm));
    localStorage.setItem("tg_draft_reviewForm", JSON.stringify(reviewForm));
    localStorage.setItem("tg_draft_dailyJournalForm", JSON.stringify(dailyJournalForm));
    localStorage.setItem("tg_draft_newsForm", JSON.stringify(newsForm));
    localStorage.setItem("tg_draft_regForm", JSON.stringify(regForm));
    localStorage.setItem("tg_draft_incentiveForm", JSON.stringify(incentiveForm));
    localStorage.setItem("tg_draft_fundTxForm", JSON.stringify(fundTxForm));
    
    showCustomAlert("Thành công", "Đã lưu lại toàn bộ dữ liệu bản nháp của các biểu mẫu vào trình duyệt!", "success");
  };

  // Handle open trade submit
  const handleOpenTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    try {
      // Auto pre-populate accounts for owner
      const targetAcct = openTradeForm.account_id || accounts.filter(a => a.owner_id === activeUser.id)[0]?.id || accounts[0]?.id;
      
      const payload = {
        ...openTradeForm,
        account_id: targetAcct,
        user_id: activeUser.id
      };

      const resp = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Cannot create new trade order");
      }

      // Refresh database
      await fetchDB();
      setShowOpenTradeModal(false);
      // Reset form
      setOpenTradeForm({
        account_id: "",
        symbol: "XAUUSD",
        direction: "BUY",
        entry_price: "",
        stop_loss: "",
        take_profit: "",
        risk_amount: "500",
        setup_name: "Quasimodo Pattern",
        trade_plan: "",
        entry_reason: "",
        emotion_before_trade: "CONFIDENT",
        screenshot_before: "",
        notes: ""
      });
      showCustomAlert("Thành công", "Đã mở vị thế giao dịch mới hoàn tất!", "success");
    } catch (err: any) {
      showCustomAlert("Thất bại", "Lỗi mở lệnh: " + err.message, "error");
    }
  };

  // Handle close trade submit
  const handleCloseTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTradeToClose) return;

    try {
      const payload = {
        result: closeTradeForm.result,
        profit_loss: parseFloat(closeTradeForm.profit_loss) || 0,
        screenshot_after: closeTradeForm.screenshot_after,
        notes: closeTradeForm.notes,
        follow_plan: closeTradeForm.follow_plan,
        mistakes: closeTradeForm.selectedMistakes
      };

      const resp = await fetch(`/api/trades/${selectedTradeToClose.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Cannot close trade");
      }

      await fetchDB();
      setShowCloseTradeModal(false);
      setSelectedTradeToClose(null);
      // Reset close form
      setCloseTradeForm({
        result: "WIN",
        profit_loss: "",
        screenshot_after: "",
        notes: "",
        follow_plan: true,
        selectedMistakes: []
      });
      showCustomAlert("Thành công", "Đóng và lưu trữ vị thế giao dịch thành công!", "success");
    } catch (err: any) {
      showCustomAlert("Thất bại", "Lỗi đóng lệnh: " + err.message, "error");
    }
  };

  // Market News Actions
  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isoDatetime = new Date(newsForm.datetime).toISOString();

      const payload = {
        id: selectedNewsToEdit ? selectedNewsToEdit.id : undefined,
        title: newsForm.title,
        impact: newsForm.impact,
        datetime: isoDatetime,
        forecast: newsForm.forecast,
        actual: newsForm.actual,
        previous: newsForm.previous,
        gold_impact_direction: newsForm.gold_impact_direction,
        description: newsForm.description
      };

      const resp = await fetch("/api/market-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Không thể lưu tin tức.");
      }

      await fetchDB();
      setShowAddNewsModal(false);
      setShowEditNewsModal(false);
      setNewsForm({
        title: "",
        impact: "HIGH",
        datetime: new Date().toISOString().slice(0, 16),
        forecast: "",
        actual: "",
        previous: "",
        gold_impact_direction: "VOLATILE",
        description: ""
      });
      setSelectedNewsToEdit(null);
      showCustomAlert("Thành công", "Lưu tin tức thị trường thành công!", "success");
    } catch (err: any) {
      showCustomAlert("Thất bại", "Lỗi lưu tin tức: " + err.message, "error");
    }
  };

  const handleDeleteNews = async (id: string) => {
    showCustomConfirm(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa tin tức thị trường này khỏi lịch?",
      async () => {
        try {
          const resp = await fetch(`/api/market-news/${id}`, {
            method: "DELETE"
          });

          if (!resp.ok) {
            const errData = await resp.json();
            throw new Error(errData.error || "Không thể xóa tin tức.");
          }

          await fetchDB();
          showCustomAlert("Thành công", "Đã xóa tin tức thị trường.", "success");
        } catch (err: any) {
          showCustomAlert("Thất bại", "Lỗi xóa tin tức: " + err.message, "error");
        }
      }
    );
  };

  const handleQuickUpdateActual = async (id: string, actualValue: string) => {
    try {
      const resp = await fetch(`/api/market-news/${id}/actual`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actual: actualValue })
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Không thể cập nhật chỉ số thực tế.");
      }

      await fetchDB();
      showCustomAlert("Thành công", "Đã cập nhật chỉ số thực tế.", "success");
    } catch (err: any) {
      showCustomAlert("Thất bại", "Lỗi cập nhật: " + err.message, "error");
    }
  };

  const handleSyncNews = async () => {
    setIsSyncing(true);
    try {
      const resp = await fetch("/api/market-news/sync", {
        method: "POST"
      });
      if (!resp.ok) {
        throw new Error("Không thể đồng bộ tin tức.");
      }
      const data = await resp.json();
      if (data.throttled) {
        showCustomAlert("Thông báo", data.message || "Bạn đang thao tác quá nhanh, vui lòng thử lại sau.", "info");
      } else {
        await fetchDB();
        showCustomAlert(
          "Thành công",
          `Đã đồng bộ tin tức Forex Factory! Thêm mới: ${data.added || 0}, Cập nhật: ${data.updated || 0}`,
          "success"
        );
      }
    } catch (err: any) {
      showCustomAlert("Thất bại", "Lỗi đồng bộ: " + err.message, "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCSVImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    if (!importAccountId) {
      showCustomAlert("Chưa chọn tài khoản", "Vui lòng chọn tài khoản giao dịch để nhận lệnh.", "info");
      return;
    }

    const selectedTrades = rawRows.filter((_, idx) => importSelectedRows[idx]).map(row => {
      // Map columns
      const symbol = row[columnMapping.symbol] || "UNKNOWN";
      const directionRaw = (row[columnMapping.direction] || "BUY").toUpperCase();
      const direction = (directionRaw.includes("SELL") || directionRaw.includes("SHORT")) ? "SELL" : "BUY";
      
      const entry_price = parseFloat(row[columnMapping.entry_price]) || 0;
      const stop_loss = parseFloat(row[columnMapping.stop_loss]) || 0;
      const take_profit = parseFloat(row[columnMapping.take_profit]) || 0;
      const profit_loss = parseFloat(row[columnMapping.profit_loss]) || 0;
      const risk_amount = parseFloat(row[columnMapping.risk_amount]) || 0;

      const opened_at = row[columnMapping.opened_at] || new Date().toISOString();
      const closed_at = row[columnMapping.closed_at] || new Date().toISOString();

      return {
        symbol,
        direction,
        entry_price,
        stop_loss,
        take_profit,
        profit_loss,
        risk_amount: risk_amount || undefined,
        opened_at,
        closed_at
      };
    });

    if (selectedTrades.length === 0) {
      showCustomAlert("Không có lệnh nào được chọn", "Vui lòng tích chọn ít nhất một lệnh giao dịch để nhập.", "info");
      return;
    }

    setIsImporting(true);
    try {
      const resp = await fetch("/api/trades/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: importAccountId,
          user_id: activeUser.id,
          trades: selectedTrades
        })
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Không thể nhập lịch sử giao dịch.");
      }

      const data = await resp.json();
      await fetchDB();
      setShowImportTradesModal(false);
      
      // Reset states
      setCsvFileText("");
      setCsvFileName("");
      setCsvHeaders([]);
      setRawRows([]);
      setImportSelectedRows([]);
      
      showCustomAlert(
        "Thành công",
        `Đã nhập thành công ${data.imported} lệnh! Ghi nhận thêm ${data.mistakes} lỗi kỷ luật và phạt ${data.penalties} lần.`,
        "success"
      );
    } catch (err: any) {
      showCustomAlert("Thất bại", "Lỗi nhập file: " + err.message, "error");
    } finally {
      setIsImporting(false);
    }
  };

  // Handle write daily journal submit
  const handleDailyJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    try {
      const payload = {
        ...dailyJournalForm,
        user_id: activeUser.id
      };

      const resp = await fetch("/api/daily-journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Can't post journal");
      }

      // Clear draft from localStorage
      const draftKey = `tg_draft_journal_${activeUser.id}_${dailyJournalForm.date}`;
      localStorage.removeItem(draftKey);

      await fetchDB();
      showCustomAlert("Thành công", "Đã lưu trữ nhật ký ngày và tích hóa điểm kỷ luật cho hôm nay!", "success");
    } catch (err: any) {
      showCustomAlert("Thất bại", "Lỗi ghi nhật ký: " + err.message, "error");
    }
  };

  // Handle write peer review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    try {
      const payload = {
        ...reviewForm,
        reviewer_id: activeUser.id
      };

      const resp = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Can't submit review comments");
      }

      await fetchDB();
      // Reset
      setReviewForm({
        trade_id: "",
        rating: "PASS",
        comment: ""
      });
      showCustomAlert("Đã gửi đánh giá", "Đã gửi ý kiến giám sát chéo cho đồng đội thành công!", "success");
    } catch (err: any) {
      showCustomAlert("Thất bại", "Lỗi đánh giá chéo: " + err.message, "error");
    }
  };

  // Admin submit reward/penalty cash
  const handleIncentiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser || activeUser.role !== UserRole.ADMIN) {
      showCustomAlert("Hạn chế quyền lực", "Chỉ quản trị viên Hậu mới có quyền thưởng phạt tiền mặt.", "error");
      return;
    }

    try {
      const payload = {
        ...incentiveForm,
        score: parseInt(incentiveForm.score) || 0,
        created_by: activeUser.id
      };

      const resp = await fetch("/api/rewards-penalties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        throw new Error("Không thể thực hiện thưởng phạt");
      }

      await fetchDB();
      setIncentiveForm({
        user_id: "",
        type: "REWARD",
        score: "50000",
        reason: ""
      });
      showCustomAlert("ThÀNH CÔNG", "Đã ghi nhận điều chỉnh thưởng phạt tiền mặt đồng đội thành công!", "success");
    } catch (err: any) {
      showCustomAlert("Gặp lỗi", "Lỗi điều chỉnh thưởng phạt: " + err.message, "error");
    }
  };

  const handleQuickApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser || activeUser.role !== UserRole.ADMIN) {
      showCustomAlert("Hạn chế quyền lực", "Chỉ quản trị viên Hậu mới có quyền thưởng phạt tiền mặt.", "error");
      return;
    }
    const { reg, selectedUserId, reason } = quickApplyState;
    if (!selectedUserId) {
      showCustomAlert("Chưa chọn đối tượng", "Vui lòng chọn thành viên áp dụng quy chế.", "info");
      return;
    }
    if (!reg) return;

    try {
      const payload = {
        user_id: selectedUserId,
        type: reg.type,
        score: reg.amount,
        reason: reason || reg.title,
        created_by: activeUser.id
      };

      const resp = await fetch("/api/rewards-penalties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        throw new Error("Không thể thực hiện thưởng phạt");
      }

      await fetchDB();
      setQuickApplyState({
        isOpen: false,
        reg: null,
        selectedUserId: "",
        reason: ""
      });
      showCustomAlert("THÀNH CÔNG", "Đã quy đổi áp dụng quy chế và thưởng/phạt cho thành viên thành công!", "success");
    } catch (err: any) {
      showCustomAlert("Gặp lỗi", "Lỗi điều chỉnh thưởng phạt: " + err.message, "error");
    }
  };

  const handleDeleteRewardPenalty = async (id: string) => {
    try {
      const resp = await fetch(`/api/rewards-penalties/${id}`, {
        method: "DELETE"
      });

      if (!resp.ok) {
        throw new Error("Không thể xóa bản ghi thưởng phạt");
      }

      await fetchDB();
      showCustomAlert("Thành công", "Đã xóa bản ghi thưởng phạt thành công!", "success");
    } catch (err: any) {
      showCustomAlert("Gặp lỗi", "Lỗi xóa bản ghi thưởng phạt: " + err.message, "error");
    }
  };

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch("/api/regulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm)
      });
      if (!resp.ok) throw new Error("Không thể lưu quy chế");
      await fetchDB();
      setShowAddRegModal(false);
      setRegForm({
        id: "",
        title: "",
        type: "REWARD" as IncentiveType,
        amount: 50000,
        description: ""
      });
      showCustomAlert("Thành công", "Đã lưu quy chế mới vào hệ thống kỷ luật!", "success");
    } catch (err: any) {
      showCustomAlert("Lỗi", err.message, "error");
    }
  };

  const handleDeleteReg = async (regId: string) => {
    showCustomConfirm(
      "Xác nhận xóa quy chế?",
      "Bạn có chắc muốn xóa vĩnh viễn quy chế này khỏi danh mục chính?",
      async () => {
        try {
          const resp = await fetch(`/api/regulations/${regId}`, {
            method: "DELETE"
          });
          if (!resp.ok) throw new Error("Xóa quy chế thất bại");
          await fetchDB();
          showCustomAlert("Đã xóa", "Quy chế cũ đã bị gỡ bỏ thành công.", "info");
        } catch (err: any) {
          showCustomAlert("Lỗi", err.message, "error");
        }
      }
    );
  };

  // Mark all notifications as read
  const handleMarkNotificationsRead = async () => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      fetchDB();
    } catch (err) {
      console.error(err);
    }
  };

  // Admin delete or Owner delete a trade
  const handleDeleteTrade = (tradeId: string) => {
    const tradeObj = trades.find(t => t.id === tradeId);
    if (!tradeObj) return;

    const isOwner = tradeObj.user_id === activeUser?.id;
    const isAdmin = activeUser?.role === UserRole.ADMIN;

    if (!isAdmin && !isOwner) {
      showCustomAlert("Từ chối quyền hạn", "Bạn không có quyền xóa lịch sử giao dịch của thành viên khác.", "error");
      return;
    }

    showCustomConfirm(
      "Xác nhận xóa giao dịch",
      `Bạn có chắc chắn muốn xóa vĩnh viễn lệnh giao dịch ${tradeObj.symbol} (${tradeObj.direction}) cùng toàn bộ phân tích sai lầm liên đới?`,
      async () => {
        try {
          const resp = await fetch(`/api/trades/${tradeId}`, {
            method: "DELETE"
          });
          if (!resp.ok) throw new Error("Thành phần máy chủ từ chối yêu cầu xóa.");
          await fetchDB();
          showCustomAlert("Đã xóa lệnh", "Giao dịch lịch sử đã được xóa khỏi bản ghi hồ sơ.", "success");
        } catch (err: any) {
          showCustomAlert("Gặp lỗi", "Lỗi xóa giao dịch: " + err.message, "error");
        }
      }
    );
  };

  // Edit trade submit handler
  const handleEditTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTradeToEdit) return;

    try {
      const payload = {
        ...editTradeForm,
        entry_price: parseFloat(editTradeForm.entry_price) || 0,
        stop_loss: parseFloat(editTradeForm.stop_loss) || 0,
        take_profit: parseFloat(editTradeForm.take_profit) || 0,
        risk_amount: parseFloat(editTradeForm.risk_amount) || 0,
        profit_loss: parseFloat(editTradeForm.profit_loss) || 0
      };

      const resp = await fetch(`/api/trades/${selectedTradeToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error("Thất bại khi cập nhật lệnh");
      await fetchDB();
      setShowEditTradeModal(false);
      setSelectedTradeToEdit(null);
      showCustomAlert("Đã cập nhật", "Đã cập nhật chi tiết lệnh giao dịch thành công!", "success");
    } catch (err: any) {
      showCustomAlert("Thất bại", "Lỗi cập nhật lệnh: " + err.message, "error");
    }
  };

  // Add account submit handler
  const handleAddAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resolvedType = addAccountCategory === "LIVE" ? "LIVE" : (addFundName.trim() || "FMTO");
      const payload = {
        ...accountForm,
        account_type: resolvedType as any,
        starting_balance: parseFloat(accountForm.starting_balance) || 10000,
        current_balance: parseFloat(accountForm.current_balance) || 10000,
        daily_drawdown_limit: parseFloat(accountForm.daily_drawdown_limit) || 5,
        max_drawdown_limit: parseFloat(accountForm.max_drawdown_limit) || 10,
        owner_id: accountForm.owner_id || (activeUser ? activeUser.id : "1"),
        purchase_price: parseFloat(accountForm.purchase_price) || 0
      };

      const resp = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error("Lỗi khi thêm tài khoản mới");
      await fetchDB();
      setShowAddAccountModal(false);
      setAccountForm({
        name: "",
        account_type: "FMTO",
        owner_id: activeUser ? activeUser.id : "1",
        starting_balance: "10000",
        current_balance: "10000",
        daily_drawdown_limit: "5",
        max_drawdown_limit: "10",
        status: "ACTIVE",
        currency: "USD",
        purchase_price: "2300000"
      });
      setAddAccountCategory("FUND");
      setAddFundName("FMTO");
      showCustomAlert("Tạo tài khoản", "Đăng ký tài khoản giao dịch quỹ/live mới thành công!", "success");
    } catch (err: any) {
      showCustomAlert("Lỗi", "Lỗi tạo tài khoản: " + err.message, "error");
    }
  };

  // Edit account submit handler
  const handleEditAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountToEdit) return;

    try {
      const resolvedType = editAccountCategory === "LIVE" ? "LIVE" : (editFundName.trim() || "FMTO");
      const payload = {
        ...accountForm,
        account_type: resolvedType as any,
        starting_balance: parseFloat(accountForm.starting_balance) || 0,
        current_balance: parseFloat(accountForm.current_balance) || 0,
        daily_drawdown_limit: parseFloat(accountForm.daily_drawdown_limit) || 0,
        max_drawdown_limit: parseFloat(accountForm.max_drawdown_limit) || 0,
        purchase_price: parseFloat(accountForm.purchase_price) || 0
      };

      const resp = await fetch(`/api/accounts/${selectedAccountToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error("Không thể cập nhật cấu hình tài khoản");
      await fetchDB();
      setShowEditAccountModal(false);
      setSelectedAccountToEdit(null);
      showCustomAlert("Cập nhật", "Đã lưu trữ chi tiết thay đổi cấu hình tài khoản!", "success");
    } catch (err: any) {
      showCustomAlert("Thất bại", "Lỗi cập nhật: " + err.message, "error");
    }
  };

  // Delete account handler
  const handleDeleteAccount = (accountId: string) => {
    const acct = accounts.find(a => a.id === accountId);
    if (!acct) return;

    const isOwner = acct.owner_id === activeUser?.id;
    const isAdmin = activeUser?.role === UserRole.ADMIN;

    if (!isAdmin && !isOwner) {
      showCustomAlert("Từ chối quyền hạn", "Bạn không sở hữu tài khoản này để tiến hành xóa.", "error");
      return;
    }

    showCustomConfirm(
      "Xác nhận xóa tài khoản",
      `Bạn có chắc chắn muốn xóa tài khoản "${acct.name}"? Toàn bộ lịch sử các lệnh trade liên kết với tài khoản này cũng sẽ bị xóa vĩnh viễn.`,
      async () => {
        try {
          const resp = await fetch(`/api/accounts/${accountId}`, {
            method: "DELETE"
          });

          if (!resp.ok) throw new Error("Thất bại khi xóa tài khoản");
          await fetchDB();
          showCustomAlert("Thành công", "Đã xóa tài khoản và giải tỏa dữ liệu liên quan thành công!", "success");
        } catch (err: any) {
          showCustomAlert("Lỗi", "Lỗi xóa tài khoản: " + err.message, "error");
        }
      }
    );
  };

  // Add User profile submit handler
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...userForm,
        avatar: userForm.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(userForm.name)}`,
        discipline_score: parseInt(userForm.discipline_score) || 100
      };

      const resp = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error("Không thể thêm thành viên");
      await fetchDB();
      setShowAddUserForm(false);
      setUserForm({
        name: "",
        email: "",
        avatar: "",
        role: "TRADER",
        discipline_score: "100"
      });
      showCustomAlert("Chào mừng", "Đã thêm thành viên mới xuất sắc gia nhập gia đình Trade Guardian!", "success");
    } catch (err: any) {
      showCustomAlert("Lỗi", "Lỗi thêm thành viên: " + err.message, "error");
    }
  };

  // Edit user profile handler
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToEdit) return;

    try {
      const payload = {
        ...userForm,
        discipline_score: parseInt(userForm.discipline_score) || 100
      };

      const resp = await fetch(`/api/users/${selectedUserToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error("Cập nhật thành viên thất bại");
      await fetchDB();
      setSelectedUserToEdit(null);
      showCustomAlert("Đồng bộ", "Cập nhật thông tin thành viên thành công!", "success");
    } catch (err: any) {
      showCustomAlert("Thất bại", "Lỗi cập nhật: " + err.message, "error");
    }
  };

  // Delete User handler
  const handleDeleteUser = (userId: string) => {
    if (activeUser?.role !== UserRole.ADMIN) {
      showCustomAlert("Hạn chế quyền hạn", "Chỉ có Admin tối cao mới được quyền loại bỏ Trader.", "error");
      return;
    }
    if (userId === "1" || userId === "2") {
      showCustomAlert("Bảo vệ hệ thống", "Không được phép xóa 2 Trader trụ cột gia đình Đức & Hậu!", "error");
      return;
    }

    showCustomConfirm(
      "Loại bỏ thành viên",
      "Bạn có chắc chắn muốn xóa thành viên này vĩnh viễn khỏi Trade Guardian?",
      async () => {
        try {
          const resp = await fetch(`/api/users/${userId}`, {
            method: "DELETE"
          });

          if (!resp.ok) throw new Error("Xóa thành viên thất bại");
          await fetchDB();
          showCustomAlert("Đã xóa", "Đã xóa thành viên khỏi hồ sơ Trade Guardian!", "success");
        } catch (err: any) {
          showCustomAlert("Lỗi", "Lỗi xóa thành viên: " + err.message, "error");
        }
      }
    );
  };

  // Edit accountability review submit handler
  const handleEditReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewToEdit) return;

    try {
      const resp = await fetch(`/api/reviews/${selectedReviewToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editReviewForm)
      });

      if (!resp.ok) throw new Error("Không thể cập nhật đánh giá chéo");
      await fetchDB();
      setShowEditReviewModal(false);
      setSelectedReviewToEdit(null);
      showCustomAlert("Xác thực", "Cập nhật phản hồi đánh giá giám sát chéo thành công!", "success");
    } catch (err: any) {
      showCustomAlert("Thất bại", "Lỗi khi cập nhật đánh giá: " + err.message, "error");
    }
  };

  // Delete accountability review handler
  const handleDeleteReview = (reviewId: string) => {
    const rev = reviews.find(r => r.id === reviewId);
    if (!rev) return;

    const isReviewer = rev.reviewer_id === activeUser?.id;
    const isAdmin = activeUser?.role === UserRole.ADMIN;

    if (!isAdmin && !isReviewer) {
      showCustomAlert("Từ chối quyền hạn", "Bạn không có quyền xóa biên bản giám sát của đồng đội khác.", "error");
      return;
    }

    showCustomConfirm(
      "Xóa biên bản đánh giá",
      "Bạn có muốn xóa vĩnh viễn biên bản đánh giá chéo này không?",
      async () => {
        try {
          const resp = await fetch(`/api/reviews/${reviewId}`, {
            method: "DELETE"
          });

          if (!resp.ok) throw new Error("Thất bại khi xóa đánh giá");
          await fetchDB();
          showCustomAlert("Thành công", "Đã xóa biên bản đánh giá chéo thành công!", "success");
        } catch (err: any) {
          showCustomAlert("Lỗi", "Lỗi xóa đánh giá: " + err.message, "error");
        }
      }
    );
  };

  // Delete daily journal entry handler
  const handleDeleteDailyJournal = (journalId: string) => {
    const j = journals.find(jo => jo.id === journalId);
    if (!j) return;

    const isOwner = j.user_id === activeUser?.id;
    const isAdmin = activeUser?.role === UserRole.ADMIN;

    if (!isAdmin && !isOwner) {
      showCustomAlert("Từ chối quyền hạn", "Bạn không thể xóa nhật ký ngày của người khác.", "error");
      return;
    }

    showCustomConfirm(
      "Xóa nhật ký ngày",
      "Bạn có chắc chắn muốn xóa bản ghi nhật ký ngày này vĩnh viễn khỏi cơ sở dữ liệu?",
      async () => {
        try {
          const resp = await fetch(`/api/daily-journals/${journalId}`, {
            method: "DELETE"
          });

          if (!resp.ok) throw new Error("Không thể xóa nhật ký ngày");
          await fetchDB();
          showCustomAlert("Đã xóa", "Đã xóa nhật ký ngày khỏi hệ thống dữ liệu!", "success");
        } catch (err: any) {
          showCustomAlert("Lỗi", "Lỗi xóa nhật ký: " + err.message, "error");
        }
      }
    );
  };

  // 10a. Add shared fund transaction handler
  const handleAddFundTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) {
      showCustomAlert("Chưa đăng nhập", "Vui lòng chọn tài khoản thành viên trước.", "error");
      return;
    }

    if (!fundTxForm.amount || Number(fundTxForm.amount) <= 0) {
      showCustomAlert("Số tiền không hợp lệ", "Vui lòng nhập số tiền lớn hơn 0.", "error");
      return;
    }

    if (!fundTxForm.purpose.trim()) {
      showCustomAlert("Thiếu mục đích", "Vui lòng nhập mục đích hoặc tên giao dịch.", "error");
      return;
    }

    try {
      const payload = {
        amount: Number(fundTxForm.amount),
        type: fundTxForm.type,
        purpose: fundTxForm.purpose.trim(),
        description: fundTxForm.description.trim(),
        user_id: activeUser.id
      };

      const resp = await fetch("/api/shared-fund/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || "Không thể thực hiện giao dịch.");
      }

      await fetchDB();
      setShowAddFundTxModal(false);
      
      // Reset form (leaving defaults)
      setFundTxForm({
        amount: "2000000",
        type: "OUTFLOW",
        purpose: "Chi mua thử thách quỹ",
        description: "",
        user_id: activeUser.id
      });

      showCustomAlert(
        "Giao dịch thành công",
        `Đã tạo giao dịch tài chính ${payload.type === "INFLOW" ? "gộp nạp" : "chi tiêu"} thành công từ Quỹ Tiền Chung!`,
        "success"
      );
    } catch (err: any) {
      showCustomAlert("Lỗi giao dịch", err.message, "error");
    }
  };

  // 10b. Delete shared fund transaction handler
  const handleDeleteFundTx = async (txId: string) => {
    const isAdmin = activeUser?.role === UserRole.ADMIN;
    if (!isAdmin) {
      showCustomAlert("Từ chối quyền hạn", "Chỉ Quản trị viên (Hậu) mới có quyền xóa giao dịch tài chính từ sổ quỹ.", "error");
      return;
    }

    showCustomConfirm(
      "Xóa giao dịch",
      "Bạn có chắc chắn muốn xóa bản ghi giao dịch này khỏi sổ quỹ của Quỹ Tiền Chung? Thao tác này sẽ cập nhật lại số dư quỹ tương ứng.",
      async () => {
        try {
          const resp = await fetch(`/api/shared-fund/transactions/${txId}`, {
            method: "DELETE"
          });

          if (!resp.ok) {
            const data = await resp.json();
            throw new Error(data.error || "Lỗi xóa giao dịch quỹ");
          }

          await fetchDB();
          showCustomAlert("Đã xóa", "Đã xóa bản ghi giao dịch và điều chỉnh số dư quỹ chung thành công!", "success");
        } catch (err: any) {
          showCustomAlert("Lỗi", err.message, "error");
        }
      }
    );
  };

  // 10c. Update contributed capital handler
  const handleUpdateContributedCapital = async (cap: number) => {
    try {
      const resp = await fetch("/api/shared-fund/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contributed_capital: cap })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Lỗi khi kết nối đến máy chủ");
      }
      await fetchDB();
    } catch (err: any) {
      showCustomAlert("Cập nhật thất bại", "Lỗi: " + err.message, "error");
    }
  };

  // Simple clean markdown parser to avoid external markup rendering crashes
  const renderSimpleMarkdown = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      if (line.startsWith("###")) {
        return <h4 key={i} className="text-base font-bold text-white mt-5 mb-2 flex items-center gap-2 border-b border-slate-800 pb-1.5">{line.replace("###", "").trim()}</h4>;
      }
      if (line.startsWith("####")) {
        return <h5 key={i} className="text-sm font-bold text-[#6366F1] mt-4 mb-1.5">{line.replace("####", "").trim()}</h5>;
      }
      if (line.startsWith("##")) {
        return <h3 key={i} className="text-lg font-bold text-white mt-6 mb-3">{line.replace("##", "").trim()}</h3>;
      }
      if (line.startsWith("* **") || line.startsWith("- **")) {
        // format bullet lists with bold terms
        const cleanStr = line.replace(/^\*|\-/, "").trim();
        const parts = cleanStr.split("**");
        if (parts.length >= 3) {
          return (
            <div key={i} className="text-xs text-slate-300 ml-4 py-1 leading-relaxed">
              ● <strong className="text-indigo-400 font-semibold">{parts[1]}</strong>
              {parts.slice(2).join("")}
            </div>
          );
        }
      }
      if (line.startsWith("*") || line.startsWith("-")) {
        return <div key={i} className="text-xs text-slate-300 ml-4 py-1">● {line.replace(/^\*|\-/, "").trim()}</div>;
      }
      if (line.trim().startsWith("💡")) {
        return (
          <div key={i} className="my-2 bg-[#1E293B]/60 border-l-4 border-emerald-500 p-3 rounded-r text-xs text-slate-200">
            {line}
          </div>
        );
      }
      if (line.trim() === "---") {
        return <hr key={i} className="border-slate-800 my-4" />;
      }
      return <p key={i} className="text-xs text-slate-400 my-1 leading-relaxed">{line}</p>;
    });
  };

  // Helper file upload handler
  const handleBase64File = (e: React.ChangeEvent<HTMLInputElement>, isBefore: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isBefore) {
        setOpenTradeForm(prev => ({ ...prev, screenshot_before: base64String }));
      } else {
        setCloseTradeForm(prev => ({ ...prev, screenshot_after: base64String }));
      }
    };
    reader.readAsDataURL(file);
  };

  const formatVND = (value: number) => {
    return value.toLocaleString("vi-VN") + " ₫";
  };

  const getUserCashBalance = (userId: string) => {
    const userRP = rewardsPenalties.filter(rp => rp.user_id === userId);
    const rewards = userRP.filter(rp => rp.type === IncentiveType.REWARD).reduce((acc, rp) => {
      const val = rp.score < 1000 ? rp.score * 10000 : rp.score;
      return acc + val;
    }, 0);
    const penalties = userRP.filter(rp => rp.type === IncentiveType.PENALTY).reduce((acc, rp) => {
      const val = rp.score < 1000 ? rp.score * 10000 : rp.score;
      return acc + val;
    }, 0);
    return {
      rewards,
      penalties,
      net: rewards - penalties
    };
  };

  const getDisciplineScore = (userId: string) => {
    const userRP = rewardsPenalties.filter(rp => rp.user_id === userId);
    const score = userRP.filter(rp => rp.type === IncentiveType.REWARD).reduce((a, b) => a + b.score, 0)
                  - userRP.filter(rp => rp.type === IncentiveType.PENALTY).reduce((a, b) => a + b.score, 0);
    return Math.max(0, Math.min(100, 100 + score));
  };

  const getPnlOfUser = (userId: string) => {
    const userTrades = trades.filter(t => t.user_id === userId && t.result !== TradeResult.OPEN);
    return userTrades.reduce((acc, t) => {
      let profit = t.profit_loss;
      if (t.account_id === "acct_3") profit = profit / 25000; // normalized for view
      return acc + profit;
    }, 0);
  };

  const getWinRateOfUser = (userId: string) => {
    const closed = trades.filter(t => t.user_id === userId && t.result !== TradeResult.OPEN);
    const wins = closed.filter(t => t.result === TradeResult.WIN).length;
    return closed.length > 0 ? Math.round((wins / closed.length) * 100) : 0;
  };

  const getMistakeCountOfUser = (userId: string) => {
    return mistakes.filter(m => m.user_id === userId).length;
  };

  // Notifications filtering
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1020] text-slate-200 flex flex-col items-center justify-center font-sans" id="loading-fallback">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-12 h-12 text-indigo-500 animate-pulse" />
          <h2 className="text-xl font-bold tracking-wider text-white">TRADE GUARDIAN SECURE LINK</h2>
          <p className="text-xs text-slate-500 font-mono">Loading dynamic system registries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white" id="main-application-container">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#0B1020]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3.5" id="header-bar">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg text-white shadow-lg shadow-indigo-500/20" id="brand-logo-glow">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                TRADE GUARDIAN <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">v1.1</span>
              </h1>
              <p className="text-[11px] text-slate-400">Hệ thống giám sát vĩ mô & Kỷ luật Trader</p>
            </div>
          </div>

          {/* Core Controls */}
          <div className="flex items-center gap-3 justify-between sm:justify-end">
            {/* User Profile Selector (Cross-monitoring capability) */}
            <div className="flex items-center gap-1.5 bg-[#121A2B] border border-slate-800 rounded-lg p-1 shadow-sm" id="user-picker-wrapper">
              <UserPicker
                users={users}
                activeUser={activeUser}
                onSelectUser={(u) => {
                  setActiveUser(u);
                  localStorage.setItem("tg-active-user-id", u.id);
                  // Also assign default for peer review trades
                  const remainingUser = users.find(user => user.id !== u.id);
                  if (remainingUser) {
                    // Preload first open trade of other trader for faster review
                    const otherOpen = trades.find(t => t.user_id === remainingUser.id && t.result === TradeResult.OPEN);
                    setReviewForm(prev => ({ ...prev, trade_id: otherOpen ? otherOpen.id : "" }));
                  }
                }}
              />
              <button
                onClick={() => {
                  setShowUsersModal(true);
                  setShowAddUserForm(false);
                  setSelectedUserToEdit(null);
                }}
                className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-[#0B1020] rounded-md transition-all cursor-pointer"
                title="Quản lý thành viên (Traders list)"
                id="manage-members-btn"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Theme Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#121A2B] border border-slate-800 rounded-lg px-2.5 py-1.5 shadow-sm" id="theme-selector-container">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <select
                id="layout-theme-switcher"
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="bg-transparent border-none text-[11px] font-semibold text-slate-300 focus:outline-none cursor-pointer pr-1"
                title="Chọn giao diện ứng dụng"
              >
                <option value="dark" className="bg-[#121A2B] text-slate-200">🌌 Pro Dark</option>
                <option value="cyber" className="bg-[#121A2B] text-slate-200">📟 Cyber Terminal</option>
                <option value="light" className="bg-white text-slate-800">☀️ Classic Light</option>
                <option value="cosmic" className="bg-[#140D24] text-purple-200">🔮 Cosmic Nebula</option>
              </select>
            </div>

            {/* Notification Center Trigger */}
            <div className="relative">
              <button
                id="notification-center-trigger-btn"
                onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
                className="p-2.5 bg-[#121A2B] border border-slate-800 rounded-lg hover:border-slate-700/80 text-slate-300 transition-all cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-[#121A2B] rounded-full animate-bounce" id="unread-pill" />
                )}
              </button>

              {/* Notification Box */}
              {showNotificationsMenu && (
                <div className="absolute right-0 mt-3.5 w-80 bg-[#121A2B] border border-slate-800/80 rounded-xl shadow-2xl z-50 p-4" id="notifications-menu-panel">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 mb-2.5">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Thông báo ({unreadNotificationsCount})</h4>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={handleMarkNotificationsRead}
                        className="text-[10px] text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        Đánh dấu đã xem
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 divider-y pr-1">
                    {notifications.length > 0 ? (
                      notifications.map((not) => {
                        const borderAndColor = not.type === "success" 
                          ? "border-emerald-500/10 bg-emerald-500/5 text-emerald-400"
                          : not.type === "warning"
                            ? "border-amber-500/10 bg-amber-500/5 text-amber-400"
                            : not.type === "error"
                              ? "border-rose-500/10 bg-rose-500/5 text-rose-400"
                              : "border-slate-800/50 bg-slate-900/30 text-slate-300";

                        return (
                          <div
                            key={not.id}
                            className={`p-2.5 rounded-lg border text-[11px] ${borderAndColor} ${not.read ? "opacity-60" : "font-semibold"}`}
                          >
                            <div className="flex justify-between font-bold mb-1">
                              <span>{not.title}</span>
                              <span className="text-[9px] text-slate-500">{new Date(not.created_at).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-slate-300 text-[10.5px] leading-relaxed">{not.message}</p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-6">Chưa có thông báo nào mới</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Save All Drafts button */}
            <button
              onClick={handleSaveAllDrafts}
              className="p-2.5 bg-[#121A2B] border border-slate-800 rounded-lg hover:border-slate-700 text-slate-400 hover:text-emerald-400 transition-all cursor-pointer flex items-center gap-1.5"
              title="Lưu tất cả bản nháp đang nhập dở"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-300 font-semibold hidden md:inline">Lưu dữ liệu</span>
            </button>

            {/* Refresh Database button */}
            <button
              onClick={() => fetchDB(true)}
              className="p-2.5 bg-[#121A2B] border border-slate-800 rounded-lg hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Đồng bộ dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Secondary Tab Bar Nav */}
      <nav className="bg-[#0B1020] border-b border-slate-900 px-4 py-2" id="tab-nav-bar">
        <div className="max-w-7xl mx-auto flex items-center justify-start overflow-x-auto gap-1 sm:gap-2 pr-4 scrollbar-none">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "dashboard" ? "bg-[#121A2B] text-white border border-slate-800/80" : "text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Tổng quan (Dashboard)
          </button>
          <button
            onClick={() => setActiveTab("trade-journal")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "trade-journal" ? "bg-[#121A2B] text-white border border-slate-800/80" : "text-slate-400 hover:text-white"
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Nhật ký giao dịch
          </button>
          <button
            onClick={() => setActiveTab("daily-journal")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "daily-journal" ? "bg-[#121A2B] text-white border border-slate-800/80" : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Nhật ký ngày
          </button>
          <button
            onClick={() => setActiveTab("accountability")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "accountability" ? "bg-[#121A2B] text-white border border-slate-800/80" : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" /> Giám sát chéo
          </button>
          <button
            onClick={() => setActiveTab("shared-fund")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "shared-fund" ? "bg-[#121A2B] text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:text-emerald-400"
            }`}
          >
            <Landmark className="w-4 h-4" /> Quỹ tiền chung (Fund)
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "leaderboard" ? "bg-[#121A2B] text-amber-400 border border-amber-500/20" : "text-slate-400 hover:text-amber-400"
            }`}
          >
            <Award className="w-4 h-4" /> Thử thách & Thể lệ
          </button>
        </div>
      </nav>

      {/* 3. Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-6" id="primary-content-viewport">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
        
        {/* VIEW 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6" id="dashboard-tab-view">
            {/* Market News Section */}
            <MarketNewsSection
              news={marketNews}
              activeUser={activeUser}
              onAddClick={() => {
                setNewsForm({
                  title: "",
                  impact: "HIGH",
                  datetime: new Date().toISOString().slice(0, 16),
                  forecast: "",
                  actual: "",
                  previous: "",
                  gold_impact_direction: "VOLATILE",
                  description: ""
                });
                setSelectedNewsToEdit(null);
                setShowAddNewsModal(true);
              }}
              onEditClick={(item) => {
                setSelectedNewsToEdit(item);
                setNewsForm({
                  title: item.title,
                  impact: item.impact,
                  datetime: new Date(item.datetime).toISOString().slice(0, 16),
                  forecast: item.forecast || "",
                  actual: item.actual || "",
                  previous: item.previous || "",
                  gold_impact_direction: item.gold_impact_direction,
                  description: item.description || ""
                });
                setShowEditNewsModal(true);
              }}
              onDeleteClick={handleDeleteNews}
              onQuickUpdateActual={handleQuickUpdateActual}
              onSyncClick={handleSyncNews}
              isSyncing={isSyncing}
            />

            {/* KPI Cards Component */}
            {activeUser && (
              <KPICards
                trades={trades}
                accounts={accounts}
                rewardsPenalties={rewardsPenalties}
                activeUserId={activeUser.id}
                sharedFund={sharedFund}
                onUpdateCapital={handleUpdateContributedCapital}
              />
            )}

            {/* Trading Account Cards Component */}
            <div className="space-y-3">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#6366F1] flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5" /> Trạng thái tài khoản quỹ & Live
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    id="add-account-card-btn"
                    onClick={() => {
                      setAccountForm({
                        name: "",
                        account_type: "FMTO",
                        owner_id: activeUser ? activeUser.id : "user_1",
                        starting_balance: "10000",
                        current_balance: "10000",
                        daily_drawdown_limit: "5",
                        max_drawdown_limit: "10",
                        status: "ACTIVE",
                        currency: "USD",
                        purchase_price: "2300000"
                      });
                      setAddAccountCategory("FUND");
                      setAddFundName("FMTO");
                      setShowAddAccountModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white font-semibold text-xs text-slate-300 rounded-lg flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-400" /> Tạo tài khoản mới
                  </button>
                  <button
                    id="open-trade-card-btn"
                    onClick={() => setShowOpenTradeModal(true)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs text-white rounded-lg flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ghi nhận nến trade mới
                  </button>
                </div>
              </div>
              <AccountCards 
                accounts={accounts} 
                trades={trades} 
                onEditAccount={(acct) => {
                  setSelectedAccountToEdit(acct);
                  const isLiveType = acct.account_type === "LIVE";
                  setEditAccountCategory(isLiveType ? "LIVE" : "FUND");
                  setEditFundName(isLiveType ? "FMTO" : acct.account_type);
                  setAccountForm({
                    name: acct.name,
                    account_type: acct.account_type,
                    owner_id: acct.owner_id,
                    starting_balance: acct.starting_balance.toString(),
                    current_balance: acct.current_balance.toString(),
                    daily_drawdown_limit: acct.daily_drawdown_limit.toString(),
                    max_drawdown_limit: acct.max_drawdown_limit.toString(),
                    status: acct.status,
                    currency: acct.currency,
                    purchase_price: (acct.purchase_price ?? 0).toString()
                  });
                  setShowEditAccountModal(true);
                }}
                onDeleteAccount={handleDeleteAccount}
              />
            </div>

            {/* Recharts Analytics & Heat Map Bento Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-analytics-bento">
              {/* Left Column: Recharts Analytics Components */}
              <div className="lg:col-span-2 space-y-3" id="dashboard-performance-charts">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#10B981] flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 animate-pulse" /> Đồ thị phân tích hiệu suất vĩ mô
                </h2>
                <Charts trades={trades} accounts={accounts} />
              </div>

              {/* Right Column: Portfolio Heat Map */}
              <div className="lg:col-span-1 space-y-3" id="dashboard-portfolio-heatmap">
                <PortfolioHeatmap trades={trades} />
              </div>
            </div>


          </div>
        )}

        {/* VIEW 2: TRADE JOURNAL */}
        {activeTab === "trade-journal" && (
          <div className="space-y-6" id="trade-journal-tab-view">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ClipboardList className="text-indigo-400 w-5 h-5" /> Nhật ký chi tiết giao dịch
                </h3>
                <p className="text-xs text-slate-400 mt-1">Danh sách đầy đủ các lệnh trade, trạng thái và tỷ lệ rủi ro.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap self-start">
                <button
                  id="import-trade-btn-journal"
                  onClick={() => setShowImportTradesModal(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700/60 rounded-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Nhập lịch sử bằng CSV
                </button>
                <button
                  id="create-trade-btn-journal"
                  onClick={() => setShowOpenTradeModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white rounded-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Mở nến giao dịch mới
                </button>
              </div>
            </div>

            {/* Trade Records List Grid */}
            <div className="bg-[#121A2B] border border-slate-800 rounded-xl overflow-hidden shadow-lg" id="trades-list-table">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B1020] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Trader</th>
                      <th className="p-3.5">TK / Mã</th>
                      <th className="p-3.5">Hướng / Giá vào</th>
                      <th className="p-3.5">Mục tiêu (SL/TP)</th>
                      <th className="p-3.5">Rủi ro (Amt/%)</th>
                      <th className="p-3.5">Hành vi / Setup</th>
                      <th className="p-3.5">Kết Quả (P/L)</th>
                      <th className="p-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {trades.length > 0 ? (
                      trades.map((trade) => {
                        const owner = users.find((u) => u.id === trade.user_id);
                        const acct = accounts.find((a) => a.id === trade.account_id);
                        const isWin = trade.result === TradeResult.WIN;
                        const isLoss = trade.result === TradeResult.LOSS;
                        const isOpen = trade.result === TradeResult.OPEN;

                        // Check currency
                        const currency = acct?.currency || "USD";

                        return (
                          <tr key={trade.id} className="hover:bg-slate-800/20 transition-all" id={`trade-row-${trade.id}`}>
                            {/* Trader Owner */}
                            <td className="p-3.5 flex items-center gap-2">
                              <img src={owner?.avatar} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                              <span className="font-semibold text-slate-200">{owner?.name || "Trader"}</span>
                            </td>

                            {/* Account & Symbol */}
                            <td className="p-3.5">
                              <span className="font-semibold text-indigo-400 font-mono text-[11px] block">{acct?.name || "Funded"}</span>
                              <span className="text-white font-bold tracking-wide mt-0.5 block">{trade.symbol}</span>
                            </td>

                            {/* Direction & Base Entry */}
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase font-mono ${
                                trade.direction === TradeDirection.BUY 
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                                  : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                              }`}>
                                {trade.direction}
                              </span>
                              <span className="text-slate-300 font-mono mt-1.5 block">@{trade.entry_price.toLocaleString("en-US")}</span>
                            </td>

                            {/* SL / TP */}
                            <td className="p-3.5 font-mono text-[10.5px]">
                              <div className="text-rose-400">SL: {trade.stop_loss ? trade.stop_loss.toLocaleString("en-US") : "Không cài đặt ⚠️"}</div>
                              <div className="text-emerald-400 mt-0.5">TP: {trade.take_profit ? trade.take_profit.toLocaleString("en-US") : "Chưa cài"}</div>
                              <div className="text-slate-400 mt-1 font-semibold text-[10px]">Ratio R:R: 1:{trade.rr_ratio}</div>
                            </td>

                            {/* Risk calculations */}
                            <td className="p-3.5 font-mono">
                              <span className="text-slate-200 block">
                                {currency === "VND" ? `${trade.risk_amount.toLocaleString("vi-VN")} ₫` : `$${trade.risk_amount}`}
                              </span>
                              <span className={`text-[10px] block mt-0.5 font-semibold ${trade.risk_percent > 0.5 ? "text-rose-400" : "text-slate-400"}`}>
                                {trade.risk_percent}% {trade.risk_percent > 0.5 ? "⚠️ OVERSIZED" : ""}
                              </span>
                            </td>

                            {/* Setup & Mindset */}
                            <td className="p-3.5">
                              <span className="text-indigo-300 font-semibold text-[11.5px] block">{trade.setup_name}</span>
                              <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded italic inline-block mt-1">
                                Trạng thái: {trade.emotion_before_trade}
                              </span>
                            </td>

                            {/* Status and Profit/loss */}
                            <td className="p-3.5">
                              {isOpen ? (
                                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold px-2.5 py-0.5 rounded text-[10px] tracking-wider animate-pulse inline-block">
                                  RUNNING
                                </span>
                              ) : (
                                <div className="space-y-1">
                                  <span className={`font-bold px-2.5 py-0.5 rounded text-[10px] border tracking-wider inline-block ${
                                    isWin 
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                      : isLoss
                                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                        : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                  }`}>
                                    {trade.result}
                                  </span>
                                  <div className={`font-mono font-bold text-[11.5px] ${isWin ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-slate-400"}`}>
                                    {trade.profit_loss > 0 ? "+" : ""}
                                    {currency === "VND" ? `${trade.profit_loss.toLocaleString("vi-VN")} ₫` : `$${trade.profit_loss}`}
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Options controls */}
                            <td className="p-3.5 text-right space-y-1">
                              {isOpen && trade.user_id === activeUser?.id && (
                                <button
                                  id={`close-btn-${trade.id}`}
                                  onClick={() => {
                                    setSelectedTradeToClose(trade);
                                    setShowCloseTradeModal(true);
                                  }}
                                  className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded cursor-pointer transition-all block w-full text-center"
                                >
                                  Đóng nến (Close)
                                </button>
                              )}
                              
                              {/* Edit Trade Trigger */}
                              {(activeUser?.role === UserRole.ADMIN || trade.user_id === activeUser?.id) && (
                                <button
                                  id={`edit-trade-btn-${trade.id}`}
                                  onClick={() => {
                                    setSelectedTradeToEdit(trade);
                                    setEditTradeForm({
                                      symbol: trade.symbol,
                                      direction: trade.direction,
                                      entry_price: trade.entry_price.toString(),
                                      stop_loss: trade.stop_loss ? trade.stop_loss.toString() : "",
                                      take_profit: trade.take_profit ? trade.take_profit.toString() : "",
                                      risk_amount: trade.risk_amount.toString(),
                                      setup_name: trade.setup_name,
                                      emotion_before_trade: trade.emotion_before_trade,
                                      result: trade.result,
                                      profit_loss: trade.profit_loss.toString(),
                                      notes: trade.notes || "",
                                      trade_plan: trade.trade_plan || ""
                                    });
                                    setShowEditTradeModal(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-indigo-400 cursor-pointer transition-all inline-block mr-1"
                                  title="Chỉnh sửa chi tiết lệnh"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Deletion power: admin or owner */}
                              {(activeUser?.role === UserRole.ADMIN || trade.user_id === activeUser?.id) && (
                                <button
                                  id={`delete-btn-${trade.id}`}
                                  onClick={() => handleDeleteTrade(trade.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer transition-all inline-block"
                                  title="Xóa vĩnh viễn"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-10 text-center text-slate-500 text-xs font-mono">
                          Chưa có nhật ký lệnh nào được khởi tạo hoặc nhập vào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: DAILY JOURNAL */}
        {activeTab === "daily-journal" && (
          <div className="space-y-6" id="daily-journal-tab-view">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="text-indigo-400 w-5 h-5" /> Nhật ký cảm xúc và thị trường hằng ngày
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Kỷ luật cốt lõi: Mỗi ngày trader Đức và Hậu bắt buộc phải đúc rút kinh nghiệm để được cộng **+2 điểm thưởng**.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="daily-journal-layout-grid">
              {/* Form to enter today's journal */}
              <div className="lg:col-span-1 bg-[#121A2B] border border-slate-800 rounded-xl p-5" id="write-journal-card">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Calendar className="w-4 h-4 text-indigo-400" /> Ghi chép nhật ký
                </h4>
                <form onSubmit={handleDailyJournalSubmit} className="space-y-4" id="daily-journal-form-elem">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Ngày lập nhật ký</label>
                    <input
                      type="date"
                      value={dailyJournalForm.date}
                      onChange={(e) => handleJournalDateChange(e.target.value)}
                      className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-xs font-mono text-white focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Bối cảnh thị trường</label>
                    <textarea
                      placeholder="Thị trường phiên Âu đi như thế nào? Tin FOMC có tác động mạnh không?..."
                      value={dailyJournalForm.market_condition}
                      onChange={(e) => setDailyJournalForm({ ...dailyJournalForm, market_condition: e.target.value })}
                      className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none h-16"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Tâm lý giao dịch hôm nay</label>
                    <input
                      type="text"
                      placeholder="Bình tĩnh / Lo ngại gỡ lệnh / Rất tự tin..."
                      value={dailyJournalForm.emotion}
                      onChange={(e) => setDailyJournalForm({ ...dailyJournalForm, emotion: e.target.value })}
                      className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Đã làm tốt điều gì?</label>
                    <textarea
                      placeholder="Tuân thủ SL tuyệt đối / Chờ quét đỉnh Á / Tắt máy sớm..."
                      value={dailyJournalForm.what_went_well}
                      onChange={(e) => setDailyJournalForm({ ...dailyJournalForm, what_went_well: e.target.value })}
                      className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none h-16"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Chưa tốt / Sai lầm?</label>
                    <textarea
                      placeholder="Vào lệnh đuổi đỉnh / Rời SL bộc phát..."
                      value={dailyJournalForm.what_went_wrong}
                      onChange={(e) => setDailyJournalForm({ ...dailyJournalForm, what_went_wrong: e.target.value })}
                      className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none h-16"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Bài học rút ra</label>
                    <textarea
                      placeholder="Khi có tin Nonfarm không thò tay vào đáy..."
                      value={dailyJournalForm.lessons}
                      onChange={(e) => setDailyJournalForm({ ...dailyJournalForm, lessons: e.target.value })}
                      className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none h-16"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Kế hoạch dứt điểm ngày mai</label>
                    <textarea
                      placeholder="Chờ lệnh phiên Á chín muồi, mốc rủi ro 0.4%..."
                      value={dailyJournalForm.tomorrow_plan}
                      onChange={(e) => setDailyJournalForm({ ...dailyJournalForm, tomorrow_plan: e.target.value })}
                      className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none h-16"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveJournalDraft}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-lg transition-all border border-slate-700 cursor-pointer text-center"
                    >
                      Lưu nháp 💾
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-lg transition-all cursor-pointer text-center"
                    >
                      Ghi nhật ký (+2đ)
                    </button>
                  </div>
                </form>
              </div>

              {/* List of past journals */}
              <div className="lg:col-span-2 space-y-4" id="view-journals-list">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  Lịch sử nhật ký giao dịch tuần qua
                </h4>
                {journals.length > 0 ? (
                  journals.map((j) => {
                    const author = users.find((u) => u.id === j.user_id);
                    return (
                      <div key={j.id} className="bg-[#121A2B] border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg" id={`journal-card-${j.id}`}>
                        <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                          <div className="flex items-center gap-2">
                            <img src={author?.avatar} alt="" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                            <span className="font-bold text-slate-200 text-xs">{author?.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">lập lúc {new Date(j.created_at).toLocaleDateString("vi-VN")}</span>
                          </div>
                          <div className="flex items-center gap-2" id={`journal-badge-actions-${j.id}`}>
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 font-mono text-[10.5px] border border-indigo-500/20 rounded-full font-semibold">
                              Ngày {j.date}
                            </span>
                            {(activeUser?.role === UserRole.ADMIN || j.user_id === activeUser?.id) && (
                              <button
                                onClick={() => handleDeleteDailyJournal(j.id)}
                                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-[#0B1020] rounded transition-all cursor-pointer"
                                title="Xóa nhật ký ngày"
                                id={`delete-journal-btn-${j.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" id={`journal-bento-${j.id}`}>
                          <div className="bg-[#0B1020] border border-slate-800/45 p-3 rounded-lg" id={`journal-sec-mkt-${j.id}`}>
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase block mb-1">BỐI CẢNH THỊ TRƯỜNG</span>
                            <p className="text-slate-300 leading-relaxed">{j.market_condition}</p>
                          </div>
                          <div className="bg-[#0B1020] border border-slate-800/45 p-3 rounded-lg" id={`journal-sec-emo-${j.id}`}>
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase block mb-1">CẢM XÚC GIAO DỊCH</span>
                            <p className="text-slate-300 leading-relaxed">{j.emotion}</p>
                          </div>
                          <div className="bg-[#0B1020] border border-slate-800/45 p-3 rounded-lg" id={`journal-sec-well-${j.id}`}>
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase block mb-1">ƯU ĐIỂM / LÀM TỐT</span>
                            <p className="text-emerald-400 leading-relaxed">{j.what_went_well || "N/A"}</p>
                          </div>
                          <div className="bg-[#0B1020] border border-slate-800/45 p-3 rounded-lg" id={`journal-sec-bad-${j.id}`}>
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase block mb-1">KHUYẾT ĐIỂM / SAI LẦM</span>
                            <p className="text-rose-400 leading-relaxed">{j.what_went_wrong || "Không phát hiện"}</p>
                          </div>
                          <div className="col-span-1 md:col-span-2 bg-slate-900/40 border border-slate-800 p-3.5 rounded-lg text-xs" id={`journal-sec-lessons-${j.id}`}>
                            <span className="text-[10px] text-indigo-400 font-extrabold uppercase block mb-1">💡 BÀI HỌC VÀ KẾ HOẠCH NGÀY MAI</span>
                            <div className="text-slate-300 space-y-1.5 leading-relaxed mt-2">
                              <p><strong>Bài học:</strong> {j.lessons}</p>
                              <p><strong>Kế hoạch:</strong> {j.tomorrow_plan}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 font-mono py-10 bg-[#121A2B] border border-slate-800 rounded-xl text-center">
                    Chưa có lịch sử nhật ký ngày nào được ghi nhận.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: ACCOUNTABILITY CROSS REVIEW */}
        {activeTab === "accountability" && (
          <div className="space-y-6" id="accountability-tab-view">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-indigo-400 w-5 h-5" /> Giám sát chéo quan hệ đồng đội (Cross-monitoring)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Khi Đức mở vị thế mới, Hậu lập tức nhận tín hiệu và tiến hành xem xét phê duyệt chéo. Ngược lại, Đức cũng có thể phê duyệt cho Hậu!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="accountability-layout-grid">
              {/* Form to submit review on other member's trade */}
              <div className="lg:col-span-1 bg-[#121A2B] border border-slate-800 p-5 rounded-xl" id="add-peer-review-panel">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                  Đánh giá lệnh đang chạy của đồng đội
                </h4>
                
                {/* Find candidate trades of key partners */}
                {(() => {
                  const candidateTrades = trades.filter(t => t.user_id !== activeUser?.id);
                  
                  if (candidateTrades.length === 0) {
                    return (
                      <p className="text-xs text-slate-500 font-mono py-6">
                        Đồng đội của bạn hiện chưa có bất cứ lệnh trade open hoặc lịch sử nào để tiến hành đánh giá.
                      </p>
                    );
                  }

                  return (
                    <form onSubmit={handleReviewSubmit} className="space-y-4" id="review-cross-form">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Chọn lệnh giao dịch</label>
                        <select
                          value={reviewForm.trade_id}
                          onChange={(e) => setReviewForm({ ...reviewForm, trade_id: e.target.value })}
                          className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-xs text-white focus:border-indigo-500 outline-none"
                          required
                        >
                          <option value="">-- Chọn một lệnh cần đánh giá --</option>
                          {candidateTrades.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.symbol} - {t.direction} (P/L: {t.profit_loss > 0 ? "+" : ""}{t.profit_loss}) [{t.result}]
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Xếp loại kỷ luật</label>
                        <div className="grid grid-cols-3 gap-2" id="rating-buttons-grid">
                          {["PASS", "WARNING", "FAIL"].map((r) => {
                            const isSel = reviewForm.rating === r;
                            const color = r === "PASS"
                              ? isSel ? "bg-emerald-600 text-white border-emerald-500" : "bg-emerald-500/10 text-emerald-400 border-slate-800"
                              : r === "WARNING"
                                ? isSel ? "bg-amber-600 text-white border-amber-500" : "bg-amber-500/10 text-amber-400 border-slate-800"
                                : isSel ? "bg-rose-600 text-white border-rose-500" : "bg-rose-500/10 text-rose-400 border-slate-800";

                            return (
                              <button
                                key={r}
                                type="button"
                                id={`review-rating-btn-${r}`}
                                onClick={() => setReviewForm({ ...reviewForm, rating: r as ReviewRating })}
                                className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all uppercase cursor-pointer text-center ${color}`}
                              >
                                {r}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Ý kiến / Lời phê bình</label>
                        <textarea
                          placeholder="Tại sao bạn lại xếp loại như vậy? Volume có lố không? Đúng setup Quasimodo chưa?..."
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-xs text-slate-200 focus:border-indigo-500 outline-none h-24"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-lg transition-all cursor-pointer"
                      >
                        Gửi nhận xét chéo
                      </button>
                    </form>
                  );
                })()}
              </div>

              {/* Display of Peer review historical logs */}
              <div className="lg:col-span-2 space-y-4" id="view-reviews-panel">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Biên bản đánh giá chéo đã ghi nhận
                </h4>

                {reviews.length > 0 ? (
                  reviews.map((rev) => {
                    const reviewer = users.find(u => u.id === rev.reviewer_id);
                    const target = users.find(u => u.id === rev.target_user_id);
                    const trade = trades.find(t => t.id === rev.trade_id);

                    const badgeAndStyle = rev.rating === "PASS"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : rev.rating === "WARNING"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20";

                    return (
                      <div key={rev.id} className="bg-[#121A2B] border border-slate-800 p-4 rounded-xl shadow-lg flex items-start gap-4" id={`review-card-${rev.id}`}>
                        <div className={`p-2.5 rounded-xl border font-black text-xs h-10 w-14 flex items-center justify-center uppercase ${badgeAndStyle}`} id={`review-card-rating-${rev.id}`}>
                          {rev.rating}
                        </div>
                        <div className="flex-1 space-y-1.5" id={`review-card-details-${rev.id}`}>
                          <div className="flex justify-between items-start" id={`review-card-hdr-${rev.id}`}>
                            <div className="text-xs" id={`review-card-users-${rev.id}`}>
                              <strong className="text-white font-semibold">{reviewer?.name}</strong> đánh giá{" "}
                              <strong className="text-indigo-400 font-semibold">{target?.name}</strong> on{" "}
                              <span className="font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {trade ? `${trade.symbol} ${trade.direction}` : "Lệnh trade"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5" id={`review-card-time-actions-${rev.id}`}>
                              <span className="text-[10px] text-slate-500 font-mono" id={`review-card-time-${rev.id}`}>
                                {new Date(rev.created_at).toLocaleDateString("vi-VN")}
                              </span>
                              {(activeUser?.role === UserRole.ADMIN || rev.reviewer_id === activeUser?.id) && (
                                <div className="flex items-center gap-0.5 ml-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedReviewToEdit(rev);
                                      setEditReviewForm({
                                        rating: rev.rating,
                                        comment: rev.comment
                                      });
                                      setShowEditReviewModal(true);
                                    }}
                                    className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
                                    title="Sửa đánh giá"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(rev.id)}
                                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
                                    title="Xóa đánh giá"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed italic" id={`review-card-comment-${rev.id}`}>
                            "{rev.comment}"
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 font-mono py-10 bg-[#121A2B] border border-slate-800 rounded-xl text-center">
                    Chưa có giám sát chéo nào được phản hồi.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5b: SHARED POOL FUND */}
        {activeTab === "shared-fund" && (
          <div className="space-y-6 animate-fadeIn" id="shared-fund-tab-view">
            <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Landmark className="text-emerald-400 w-5 h-5" /> Quỹ Tiền Chung Phòng Giao Dịch
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Vốn sở hữu chung phục vụ chi tiêu giao dịch, đăng ký các tài khoản thử thách quỹ (Prop Firm), tài khoản LIVE cũng như trang bị phí VPS/Tools.
                </p>
              </div>
            </div>

            {/* Fund statistics cards */}
            {(() => {
              const txs = sharedFund?.transactions || [];
              const contributedCapital = sharedFund?.contributed_capital ?? 20000000;
              const accountsCost = accounts.reduce((sum, a) => sum + (a.purchase_price ?? 0), 0);

              // Calculate other transactions, excluding tx_1 and tx_2 to avoid double counting
              const otherInflows = txs.filter(t => t.type === "INFLOW" && t.id !== "tx_1").reduce((sum, t) => sum + t.amount, 0);
              const otherOutflows = txs.filter(t => t.type === "OUTFLOW" && t.id !== "tx_2").reduce((sum, t) => sum + t.amount, 0);

              const balance = contributedCapital - accountsCost + otherInflows - otherOutflows;
              const currencySymbol = "VNĐ";

              const handleSaveCapital = async () => {
                try {
                  const cap = parseFloat(tempCapital);
                  if (isNaN(cap) || cap < 0) {
                    showCustomAlert("Cập nhật thất bại", "Vui lòng điền số tiền vốn hợp lệ.", "error");
                    return;
                  }

                  const resp = await fetch("/api/shared-fund/config", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contributed_capital: cap })
                  });

                  if (!resp.ok) throw new Error("Lỗi khi kết nối đến máy chủ");
                  await fetchDB();
                  setIsEditingCapital(false);
                  showCustomAlert("Cập nhật thành công", `Vốn góp quản lý được đặt lại thành ${cap.toLocaleString("vi-VN")} VNĐ.`, "success");
                } catch (err: any) {
                  showCustomAlert("Cập nhật thất bại", "Lỗi: " + err.message, "error");
                }
              };

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="shared-fund-stats-cards">
                  {/* Card 1: Balance */}
                  <div className="bg-[#121A2B] border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden" id="sf-balance-card">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Wallet className="w-24 h-24 text-emerald-400" />
                    </div>
                    <p className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Khả dụng hiện tại</p>
                    <h4 className="text-2xl font-black text-white mt-1.5 font-mono" id="sf-balance-val">
                      {balance.toLocaleString("vi-VN")} <span className="text-xs text-slate-400">{currencySymbol}</span>
                    </h4>
                    <div className="flex items-center gap-1.5 mt-3">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Sổ Quỹ Sẵn Sàng Chi Tiêu</span>
                    </div>
                  </div>

                  {/* Card 2: Total Contributed Capital (Editable) */}
                  <div className="bg-[#121A2B] border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden text-sky-400" id="sf-inflow-card">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Coins className="w-24 h-24 text-sky-400" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                      <p className="text-[10px] font-bold text-sky-400 tracking-wider uppercase">Tổng vốn góp quản lý</p>
                      {activeUser?.role === UserRole.ADMIN && (
                        <button
                          onClick={() => {
                            if (isEditingCapital) {
                              setIsEditingCapital(false);
                            } else {
                              setTempCapital(contributedCapital.toString());
                              setIsEditingCapital(true);
                            }
                          }}
                          className="text-[10px] text-slate-400 hover:text-sky-400 font-bold underline cursor-pointer select-none"
                        >
                          {isEditingCapital ? "Hủy" : "✏️ Sửa Vốn Góp"}
                        </button>
                      )}
                    </div>

                    {isEditingCapital ? (
                      <div className="mt-2 flex gap-1.5 items-center relative z-10" id="capital-edit-box">
                        <input
                          type="number"
                          value={tempCapital}
                          onChange={(e) => setTempCapital(e.target.value)}
                          className="min-w-0 flex-1 bg-[#0B1020] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono font-bold"
                          placeholder="Nhập số tiền góp..."
                        />
                        <button
                          onClick={handleSaveCapital}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-[10px] font-black text-white rounded cursor-pointer"
                        >
                          Lưu
                        </button>
                      </div>
                    ) : (
                      <h4 className="text-2xl font-black text-sky-400 mt-1.5 font-mono" id="sf-inflow-val">
                        {contributedCapital.toLocaleString("vi-VN")} <span className="text-xs text-slate-400">{currencySymbol}</span>
                      </h4>
                    )}

                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-semibold col-span-2">
                      <p>Vốn đóng góp quản lý điều lệ chung.</p>
                      {otherInflows > 0 && (
                        <span className="text-emerald-400 font-mono">+{otherInflows.toLocaleString("vi-VN")} ₫</span>
                      )}
                    </div>
                  </div>

                  {/* Card 3: Total Expense Expense */}
                  <div className="bg-[#121A2B] border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden" id="sf-outflow-card">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <PiggyBank className="w-24 h-24 text-rose-400" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Vốn đã chi mua tài khoản & VPS</p>
                    <h4 className="text-2xl font-black text-rose-400 mt-1.5 font-mono" id="sf-outflow-val">
                      {(accountsCost + otherOutflows).toLocaleString("vi-VN")} <span className="text-xs text-slate-400">{currencySymbol}</span>
                    </h4>
                    <div className="mt-3 flex justify-between items-center text-[10px] text-slate-500 font-semibold font-mono">
                      <span>Mua sắm TK: {accountsCost.toLocaleString("vi-VN")} ₫</span>
                      {otherOutflows > 0 && <span className="text-rose-400">Chi khác: {otherOutflows.toLocaleString("vi-VN")} ₫</span>}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bento Inner Row: Accounts list centered */}
            <div className="max-w-4xl mx-auto" id="shared-fund-bento-grid">
              
              {/* Box 1: Accounts Sponsored by Quỹ Chung */}
              <div className="bg-[#121A2B] border border-slate-800 p-5 rounded-xl shadow-lg space-y-4" id="sponsored-accounts-widget">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-400" /> Tài khoản liên đới quỹ chung
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Danh sách tài khoản giao dịch hiện hữu được tài trợ chi phí từ dòng vốn chung.
                  </p>
                </div>

                <div className="space-y-3" id="sponsored-accounts-list">
                  {accounts.map(acct => {
                    const owner = users.find(u => u.id === acct.owner_id);
                    return (
                      <div key={acct.id} className="border border-slate-800 bg-[#0B1020] rounded-xl p-3 flex flex-col justify-between" id={`sponsored-acct-${acct.id}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-slate-200">{acct.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">Loại: {acct.account_type} • Chủ: {owner?.name}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase text-center ${
                            acct.status === "ACTIVE" 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : acct.status === "PAUSED" 
                                ? "bg-amber-500/10 text-amber-400" 
                                : "bg-rose-500/10 text-rose-400"
                          }`}>
                            {acct.status}
                          </span>
                        </div>
                        <div className="border-t border-slate-800/60 mt-2 pt-2 flex flex-col gap-1 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Giá mua (Vốn chi):</span>
                            <span className="font-bold text-sky-400 font-mono">
                              {(acct.purchase_price ?? 0).toLocaleString("vi-VN")} ₫
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300">Số dư hiện hữu:</span>
                            <span className="font-black text-white font-mono">
                              {acct.current_balance.toLocaleString("vi-VN")} {acct.currency}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {accounts.length === 0 && (
                    <p className="text-xs text-slate-500 italic py-4 text-center">
                      Chưa cấu hình tài khoản liên kết nào.
                    </p>
                  )}
                </div>

                {/* Info guidance */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3.5 text-[11px] text-slate-400 leading-relaxed italic" id="sponsored-info-tip">
                  🛡️ <strong>Lưu ý giám sát:</strong> Toàn bộ vốn mua quỹ hoặc bù lỗ tài khoản live sẽ được xuất trực tiếp từ sổ quỹ chung này. Lợi nhuận rút từ quỹ (Payout) hoặc lãi bồi hoàn của Đức & Hậu sau này sẽ được tái nạp ngược trở lại bằng loại giao dịch <strong>"Nạp Vốn (INFLOW)"</strong> để gia tăng quy mô quỹ tiền chung.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 6: LEADERBOARD & INCIDENTS RULES */}
        {activeTab === "leaderboard" && (
          <div className="space-y-6 animate-fadeIn" id="leaderboard-tab-view">
            <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="text-amber-400 w-5 h-5" /> Sổ Cái Quỹ Thưởng Phạt và Quy Chế Tiền Mặt
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Chuyển đổi hoàn toàn từ điểm thưởng sang tiền mặt thực góp. Ghi chép minh bạch, bổ sung quy chế tự định nghĩa linh hoạt!
                </p>
              </div>
              <button
                onClick={() => setShowAddRegModal(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-[#090D1A] font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10 cursor-pointer text-slate-900"
              >
                <Plus className="w-4 h-4 text-slate-900 stroke-[3]" /> Thêm Quy Chế Mới
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="leaderboard-grid">
              
              {/* Left & Middle Column (2 cols): Leaderboard + Logs */}
              <div className="lg:col-span-2 space-y-6" id="leaderboard-standings">
                {/* 1. Leaderboard Table Standings */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    👑 Bảng Tổng Sắp Quỹ Thưởng Phạt Tiền Mặt
                  </h4>
                  
                  <div className="bg-[#121A2B] border border-slate-800 rounded-xl overflow-hidden shadow-lg" id="leaderboard-table">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0B1020] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="p-4">Hạng</th>
                          <th className="p-4">Thành viên</th>
                          <th className="p-4 text-emerald-400">Tổng thưởng</th>
                          <th className="p-4 text-rose-400">Tổng phạt</th>
                          <th className="p-4">Thực nhận / Số dư ròng</th>
                          <th className="p-4 font-mono">PnL ($ eq)</th>
                          <th className="p-4">Win Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {users.map((u, i) => {
                          const cash = getUserCashBalance(u.id);
                          const pnl = getPnlOfUser(u.id);
                          const wr = getWinRateOfUser(u.id);
                          
                          return (
                            <tr key={u.id} className="hover:bg-slate-800/10 transition-all font-semibold" id={`leader-row-${u.id}`}>
                              <td className="p-4">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono text-xs ${
                                  i === 0 ? "bg-amber-400/20 text-amber-300 border border-amber-400/40" : "bg-slate-800 text-slate-400"
                                }`} id={`leader-rank-${u.id}`}>
                                  {i + 1}
                                </span>
                              </td>
                              <td className="p-4 flex items-center gap-2">
                                <img src={u.avatar} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
                                <div id={`leader-name-box-${u.id}`}>
                                  <span className="text-white font-bold block" id={`leader-name-${u.id}`}>{u.name}</span>
                                  <span className="text-[10px] text-slate-500 font-mono uppercase" id={`leader-role-${u.id}`}>{u.role}</span>
                                </div>
                              </td>
                              <td className="p-4 text-emerald-400 font-mono text-xs font-bold">
                                +{formatVND(cash.rewards)}
                              </td>
                              <td className="p-4 text-rose-400 font-mono text-xs font-bold">
                                -{formatVND(cash.penalties)}
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold font-mono inline-flex items-center gap-1 ${
                                  cash.net > 0 
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                                    : cash.net < 0 
                                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/20" 
                                      : "bg-slate-800 text-slate-400 border border-slate-700/50"
                                }`} id={`leader-score-${u.id}`}>
                                  {cash.net > 0 ? "+" : ""}{formatVND(cash.net)}
                                </span>
                              </td>
                              <td className="p-4 font-mono font-bold" id={`leader-pnl-${u.id}`}>
                                <span className={pnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                                  {pnl >= 0 ? "+" : ""}{Math.round(pnl).toLocaleString()} $
                                </span>
                              </td>
                              <td className="p-4 font-mono select-none" id={`leader-winrate-${u.id}`}>{wr}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. List of custom rules (Sách Quy Chế) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-amber-500" /> Sổ tay Quy Chế và Điều Lệ Nhóm
                    </h4>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">
                      {regulations.length} quy chế khả dụng
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-semibold">
                    {regulations.map((reg) => {
                      const isReward = reg.type === "REWARD" || reg.type === IncentiveType.REWARD;
                      return (
                        <div 
                          key={reg.id} 
                          className="bg-[#121A2B] border border-slate-800 p-3.5 rounded-xl hover:border-slate-700 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase inline-block mb-2 ${
                                isReward 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}>
                                {isReward ? "Thưởng nhận 💰" : "Phạt nộp 🛑"}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {activeUser?.role === UserRole.ADMIN && (
                                  <button
                                    onClick={() => {
                                      setQuickApplyState({
                                        isOpen: true,
                                        reg: reg,
                                        selectedUserId: "",
                                        reason: reg.title
                                      });
                                    }}
                                    className="px-2 py-0.5 hover:bg-amber-400/20 text-amber-400 rounded text-[9px] font-bold border border-amber-500/20 transition-all cursor-pointer inline-flex items-center gap-0.5"
                                    title="Áp dụng quy chế nhanh cho thành viên"
                                  >
                                    Áp dụng nhanh
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteReg(reg.id)}
                                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800/50 rounded transition-all cursor-pointer inline-flex items-center"
                                  title="Xóa quy chế"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <h5 className="font-bold text-white text-xs">{reg.title}</h5>
                            <p className="text-[11px] text-slate-400 mt-1 min-h-[32px] line-clamp-2 leading-relaxed">
                              {reg.description || "Chưa có mô tả bổ sung cho điều khoản quy định này."}
                            </p>
                          </div>

                          <div className="border-t border-slate-900/50 mt-3 pt-2.5 flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 font-mono">Định mức:</span>
                            <span className={`text-xs font-black font-mono ${isReward ? "text-emerald-400" : "text-rose-400"}`}>
                              {isReward ? "+" : "-"}{formatVND(reg.amount)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Reward and Penalty incident logs stream */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    📜 Nhật ký thưởng phạt
                  </h4>
                  <div className="bg-[#121A2B] border border-slate-800 rounded-xl max-h-80 overflow-y-auto space-y-2.5 p-4" id="incident-points-log">
                    {rewardsPenalties.length > 0 ? (
                      [...rewardsPenalties].reverse().map((rp) => {
                        const user = users.find(u => u.id === rp.user_id);
                        const isReward = rp.type === IncentiveType.REWARD;
                        const borderLeft = isReward ? "border-l-4 border-emerald-500" : "border-l-4 border-rose-500";
                        const amount = rp.score < 1000 ? rp.score * 10000 : rp.score;
                        
                        return (
                          <div key={rp.id} className={`bg-[#0B1020]/80 p-3 rounded-r-lg border border-slate-900 flex justify-between items-center text-xs ${borderLeft}`} id={`rp-log-card-${rp.id}`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5" id={`rp-log-usr-${rp.id}`}>
                                <span className="font-bold text-white">{user?.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{new Date(rp.created_at).toLocaleDateString("vi-VN")} {new Date(rp.created_at).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-slate-300 text-[11px] mt-1" id={`rp-log-reason-${rp.id}`} dangerouslySetInnerHTML={{ __html: rp.reason }}></p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 pl-4">
                              <span className={`text-xs font-black font-mono ${isReward ? "text-emerald-400" : "text-rose-400"}`} id={`rp-log-points-${rp.id}`}>
                                {isReward ? "+" : "-"}{formatVND(amount)}
                              </span>
                              <button
                                onClick={() => handleDeleteRewardPenalty(rp.id)}
                                className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800/50 transition-colors cursor-pointer"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-500 font-mono py-10 text-center">Chưa có sự kiện cộng trừ tiền thưởng phạt nào được ghi lại.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Guide & Admin Power Control (1 col) */}
              <div className="lg:col-span-1 space-y-6" id="rulebook-and-admin-controls">
                
                {/* Rules guidelines summary */}
                <div className="bg-[#121A2B] border border-slate-800 p-5 rounded-xl text-xs space-y-4" id="rulebook-panel">
                  <h4 className="font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2 mb-2">
                    💡 Tổng kết quy chế nhóm
                  </h4>
                  <div className="text-slate-400 leading-relaxed text-[11px] space-y-4">
                    <p className="font-medium text-slate-200">
                      Hệ thống áp dụng tự động các khoản phạt khi mở/đóng vị thế phạm luật (ví dụ mở không Stop Loss, Rủi ro vượt quy chuẩn), đồng thời cho phép Admin Hậu thưởng phạt thủ công cho các hành vi kỷ luật khác.
                    </p>
                    
                    <div className="space-y-3 border-t border-slate-800/60 pt-3">
                      <span className="font-bold text-rose-400 block text-[10px] uppercase tracking-wider flex items-center gap-1">
                        🚨 Hành Vi Kỷ Luật & Mức Phạt (Penalties)
                      </span>
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                        <div className="border-b border-slate-800/40 pb-2 last:border-0 last:pb-0">
                          <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-slate-300">Quên Stop Loss (No SL)</span>
                            <span className="text-rose-400 font-semibold font-mono whitespace-nowrap">50.000 VNĐ</span>
                          </div>
                          <span className="text-slate-500 block text-[10px] mt-0.5 leading-normal">Mở vị thế giao dịch mà không đặt cắt lỗ Stop Loss bảo vệ tài khoản ngay từ đầu.</span>
                        </div>

                        <div className="border-b border-slate-800/40 pb-2 last:border-0 last:pb-0">
                          <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-slate-300">Trả thù thị trường (Revenge trade)</span>
                            <span className="text-rose-400 font-semibold font-mono whitespace-nowrap">300.000 VNĐ</span>
                          </div>
                          <span className="text-slate-500 block text-[10px] mt-0.5 leading-normal">Liên tiếp nhồi thêm lệnh khống lồ ngay sau khi vừa bị dính SL nhằm gỡ lỗ nhanh trong trạng thái mất bình tĩnh.</span>
                        </div>

                        <div className="border-b border-slate-800/40 pb-2 last:border-0 last:pb-0">
                          <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-slate-300">Tâm lý đuổi đỉnh (FOMO)</span>
                            <span className="text-rose-400 font-semibold font-mono whitespace-nowrap">50.000 VNĐ</span>
                          </div>
                          <span className="text-slate-500 block text-[10px] mt-0.5 leading-normal">Tham lam rượt đuổi theo giá bất chấp các tín hiệu kỹ thuật hay tín hiệu nến chưa chuẩn chỉ.</span>
                        </div>

                        <div className="border-b border-slate-800/40 pb-2 last:border-0 last:pb-0">
                          <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-slate-300">Dời Stop Loss bất quy tắc</span>
                            <span className="text-rose-400 font-semibold font-mono whitespace-nowrap">50.000 VNĐ</span>
                          </div>
                          <span className="text-slate-500 block text-[10px] mt-0.5 leading-normal">Nới rộng khoảng SL ra xa hơn để gồng khoản lỗ ròng đang gia tăng trái với nguyên tắc quản trị rủi ro lúc lập kế hoạch.</span>
                        </div>

                        <div className="border-b border-slate-800/40 pb-2 last:border-0 last:pb-0">
                          <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-slate-300">Overtrading (Giao dịch quá tay)</span>
                            <span className="text-rose-400 font-semibold font-mono whitespace-nowrap">50.000 VNĐ</span>
                          </div>
                          <span className="text-slate-500 block text-[10px] mt-0.5 leading-normal">Giao dịch vượt quá 5 lệnh riêng biệt trong ngày hoặc mở tổng khối lượng lót quá mức quy chuẩn của nhóm.</span>
                        </div>

                        <div className="border-b border-slate-800/40 pb-2 last:border-0 last:pb-0">
                          <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-slate-300">Trốn viết nhật ký ngày</span>
                            <span className="text-rose-400 font-semibold font-mono whitespace-nowrap">50.000 VNĐ</span>
                          </div>
                          <span className="text-slate-500 block text-[10px] mt-0.5 leading-normal">Không hoàn thành việc tổng kết nhật ký giao dịch của ngày hôm đó.</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-800/60 pt-3">
                      <span className="font-bold text-emerald-400 block text-[10px] uppercase tracking-wider flex items-center gap-1">
                        🎁 Hành Vi Kỷ Luật & Mức Thưởng (Rewards)
                      </span>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-slate-300">Tuần hoàn hảo (Perfect Week)</span>
                            <span className="text-emerald-400 font-semibold font-mono whitespace-nowrap">+200.000 VNĐ</span>
                          </div>
                          <span className="text-slate-500 block text-[10px] mt-0.5 leading-normal">Đạt chỉ tiêu về mặt lợi nhuận mục tiêu, đồng thời duy trì tỷ lệ tuân thủ kỷ luật và kiểm soát tâm lý ở mức cao nhất.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border border-slate-800 rounded-lg p-3 bg-indigo-950/20">
                    <p className="text-slate-300 leading-relaxed font-semibold text-[11px] text-indigo-400 flex items-center gap-1">
                      ℹ️ Gợi ý vận hành
                    </p>
                    <p className="text-slate-400 text-[10px] mt-1 leading-relaxed">
                      Nhấn nút <strong className="text-amber-400">Áp dụng nhanh</strong> ở các thẻ quy chế bên cạnh để tự nạp mẫu thưởng/phạt trực tiếp vào bảng Chấp pháp Admin mà không cần gõ phím.
                    </p>
                  </div>
                </div>

                {/* Admin adjust user score control panel (RBAC power of Hậu) */}
                <div className="bg-[#121A2B] border border-slate-800 p-5 rounded-xl text-xs" id="admin-adjustment-panel">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-rose-500" /> Bảng điều chỉnh của ADMIN (Hậu)
                  </h4>
                  {activeUser?.role !== UserRole.ADMIN ? (
                    <div className="text-slate-500 font-mono leading-relaxed" id="admin-restricted-notice">
                      🔒 Chỉ tài khoản quản lý <strong>Hậu (ADMIN)</strong> mới được mở khóa bảng điều khiển để tùy ý thưởng phạt thực tế thành viên.
                    </div>
                  ) : (
                    <form onSubmit={handleIncentiveSubmit} className="space-y-3" id="admin-adjust-points-form">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">Đối tượng chấp pháp</label>
                        <select
                          value={incentiveForm.user_id}
                          onChange={(e) => setIncentiveForm({ ...incentiveForm, user_id: e.target.value })}
                          className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white outline-none focus:border-indigo-500"
                          required
                        >
                          <option value="">-- Chọn một thành viên --</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2" id="admin-incentive-type">
                        <button
                          type="button"
                          id="admin-incentive-type-reward"
                          onClick={() => setIncentiveForm({ ...incentiveForm, type: IncentiveType.REWARD })}
                          className={`py-1.5 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                            incentiveForm.type === IncentiveType.REWARD 
                              ? "bg-emerald-600 text-white border-emerald-500" 
                              : "bg-[#0B1020] text-emerald-400 border-slate-800"
                          }`}
                        >
                          CỘNG TIỀN
                        </button>
                        <button
                          type="button"
                          id="admin-incentive-type-penalty"
                          onClick={() => setIncentiveForm({ ...incentiveForm, type: IncentiveType.PENALTY })}
                          className={`py-1.5 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                            incentiveForm.type === IncentiveType.PENALTY 
                              ? "bg-rose-600 text-white border-rose-500" 
                              : "bg-[#0B1020] text-rose-400 border-slate-800"
                          }`}
                        >
                          PHẠT TIỀN
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 block mb-1 uppercase">Định mức Tiền Mặt (VNĐ)</label>
                        <input
                          type="number"
                          placeholder="Nhập số tiền VNĐ..."
                          value={incentiveForm.score}
                          onChange={(e) => setIncentiveForm({ ...incentiveForm, score: e.target.value })}
                          className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white outline-none focus:border-indigo-500 font-mono"
                          required
                          min="1"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block text-right font-mono">
                          Mức thực tế quy đổi: {formatVND(Number(incentiveForm.score) || 0)}
                        </span>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 block mb-1 uppercase">Nhận xét & Lý do</label>
                        <input
                          type="text"
                          placeholder="Nhập lý do thưởng/phạt chi tiết..."
                          value={incentiveForm.reason}
                          onChange={(e) => setIncentiveForm({ ...incentiveForm, reason: e.target.value })}
                          className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white outline-none focus:border-indigo-500"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className={`w-full py-2 bg-gradient-to-r text-white font-bold rounded-lg transition-all cursor-pointer shadow-lg mt-2 ${
                          incentiveForm.type === IncentiveType.REWARD
                            ? "from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-emerald-600/10"
                            : "from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-rose-600/10"
                        }`}
                      >
                        Chấp pháp Thưởng Phạt
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0B1020] border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500" id="brand-footer-text">
        <p>© 2026 Trade Guardian Group. Designed with desktop precision and dark mode aesthetics.</p>
        <p className="mt-1">Servicing 2 Active Members: Hậu (Admin) • Đức (Trader). All rights reserved.</p>
      </footer>

      {/* 4. MODAL A: CREATE / OPEN NEW TRADE */}
      {showOpenTradeModal && (
        <div className="fixed inset-0 bg-[#0B1020]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" id="open-trade-modal-wrapper">
          <div className="bg-[#121A2B] border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" id="open-trade-modal">
            <button
              onClick={() => setShowOpenTradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2.5">
              Ghi nhận nến giao dịch mầm mống (Mở lệnh mới)
            </h3>

            <form onSubmit={handleOpenTradeSubmit} className="space-y-4 text-xs" id="open-trade-form-el">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Tài khoản thụ hưởng</label>
                  <select
                    value={openTradeForm.account_id}
                    onChange={(e) => setOpenTradeForm({ ...openTradeForm, account_id: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white"
                    required
                  >
                    <option value="">-- Chọn tài khoản --</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Mã sản phẩm (Symbol)</label>
                  <input
                    type="text"
                    value={openTradeForm.symbol}
                    onChange={(e) => setOpenTradeForm({ ...openTradeForm, symbol: e.target.value.toUpperCase() })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-bold"
                    placeholder="XAUUSD / EURUSD / BTCUSD..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Hướng giao dịch (Direction)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      id="direction-buy-btn"
                      onClick={() => setOpenTradeForm({ ...openTradeForm, direction: "BUY" })}
                      className={`py-2 rounded-lg font-bold border ${openTradeForm.direction === "BUY" ? "bg-emerald-600 text-white border-emerald-500" : "bg-transparent text-emerald-400 border-slate-800"}`}
                    >
                      BUY (MUA)
                    </button>
                    <button
                      type="button"
                      id="direction-sell-btn"
                      onClick={() => setOpenTradeForm({ ...openTradeForm, direction: "SELL" })}
                      className={`py-2 rounded-lg font-bold border ${openTradeForm.direction === "SELL" ? "bg-rose-600 text-white border-rose-500" : "bg-transparent text-rose-400 border-slate-800"}`}
                    >
                      SELL (BÁN)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Giá vào lệnh (Entry)</label>
                  <input
                    type="number"
                    step="any"
                    value={openTradeForm.entry_price}
                    onChange={(e) => setOpenTradeForm({ ...openTradeForm, entry_price: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                    placeholder="e.g. 2350.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Cắt lỗ (Stop Loss) <span className="text-rose-400 font-bold">*</span></label>
                  <input
                    type="number"
                    step="any"
                    value={openTradeForm.stop_loss}
                    onChange={(e) => setOpenTradeForm({ ...openTradeForm, stop_loss: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                    placeholder="0 = Không cài SL ⚠️"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Chốt lời (Take Profit)</label>
                  <input
                    type="number"
                    step="any"
                    value={openTradeForm.take_profit}
                    onChange={(e) => setOpenTradeForm({ ...openTradeForm, take_profit: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                    placeholder="Chốt lời mục tiêu"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Số tiền rủi ro tối đa</label>
                  <input
                    type="number"
                    value={openTradeForm.risk_amount}
                    onChange={(e) => setOpenTradeForm({ ...openTradeForm, risk_amount: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-2.5 py-2 rounded-lg text-white font-mono"
                    placeholder="e.g. 500 USD / 100000 VND"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Mẫu hình vào lệnh (Setup)</label>
                  <select
                    value={openTradeForm.setup_name}
                    onChange={(e) => setOpenTradeForm({ ...openTradeForm, setup_name: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white"
                  >
                    <option value="Quasimodo Pattern">Quasimodo Pattern</option>
                    <option value="Liquidity Sweep">Liquidity Sweep</option>
                    <option value="Order Block M15">Order Block M15</option>
                    <option value="BREAKOUT SÓNG">BREAKOUT SÓNG</option>
                    <option value="FOMO Impulsive">FOMO Impulsive (Bột phát)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Tâm thế trước lệnh</label>
                  <select
                    value={openTradeForm.emotion_before_trade}
                    onChange={(e) => setOpenTradeForm({ ...openTradeForm, emotion_before_trade: e.target.value as TradeEmotion })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white"
                  >
                    <option value="CONFIDENT">🚀 CONFIDENT (Tự tin)</option>
                    <option value="NEUTRAL">😐 NEUTRAL (Bình thường)</option>
                    <option value="FEAR">😰 FEAR (Lo sợ / Áp lực gỡ gạc)</option>
                    <option value="FOMO">🔥 FOMO (Đuổi giá nhanh)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Kế hoạch giao dịch của hệ thống (Trade plan)</label>
                <textarea
                  placeholder="Kế hoạch chi tiết trước khi thò tay vào thị trường..."
                  value={openTradeForm.trade_plan}
                  onChange={(e) => setOpenTradeForm({ ...openTradeForm, trade_plan: e.target.value })}
                  className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-xs leading-relaxed"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Ảnh chụp đồ thị lúc mở lệnh (Screenshot Before)</label>
                <div className="flex gap-2 items-center" id="screenshot-before-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBase64File(e, true)}
                    className="hidden"
                    id="screenshot-before-input"
                  />
                  <label
                    htmlFor="screenshot-before-input"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <ImageIcon className="w-4 h-4" /> Chọn tệp thiết bị
                  </label>
                  {openTradeForm.screenshot_before ? (
                    <span className="text-[10px] text-emerald-400 font-bold truncate flex-1">✓ Đã chuyển hóa hình ảnh Base64</span>
                  ) : (
                    <span className="text-[10px] text-slate-500 truncate flex-1">Hỗ trợ định dạng PNG / JPG / URL ảnh lướt</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Ghi chú bổ trợ</label>
                <input
                  type="text"
                  placeholder="Bổ sung ghi chú bất kỳ..."
                  value={openTradeForm.notes}
                  onChange={(e) => setOpenTradeForm({ ...openTradeForm, notes: e.target.value })}
                  className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOpenTradeModal(false)}
                  className="flex-1 py-2 border border-slate-800 hover:border-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Kích hoạt vào lệnh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL B: CLOSE TRADE FLOW */}
      {showCloseTradeModal && selectedTradeToClose && (
        <div className="fixed inset-0 bg-[#0B1020]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" id="close-trade-modal-wrapper">
          <div className="bg-[#121A2B] border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" id="close-trade-modal">
            <button
              onClick={() => {
                setShowCloseTradeModal(false);
                setSelectedTradeToClose(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2.5 border-b border-slate-800 pb-2">
              Khép vị thế nới lỏng giao dịch (Đóng lệnh {selectedTradeToClose.symbol})
            </h3>
            <p className="text-xs text-slate-400 mb-4 bg-slate-900/60 p-3 rounded-lg leading-relaxed">
              Vào lệnh lúc @{selectedTradeToClose.entry_price} với khối lượng rủi ro {selectedTradeToClose.risk_percent}%. Giờ đây, hãy thống kê trung thực kết quả thực để chấm điểm kỷ luật!
            </p>

            <form onSubmit={handleCloseTradeSubmit} className="space-y-4 text-xs" id="close-trade-form-el">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Kết quả khớp (Result)</label>
                  <select
                    value={closeTradeForm.result}
                    onChange={(e) => setCloseTradeForm({ ...closeTradeForm, result: e.target.value as TradeResult })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white"
                    required
                  >
                    <option value="WIN">WIN (Thắng đậm đà)</option>
                    <option value="LOSS">LOSS (Thất thoát / Dính SL)</option>
                    <option value="BE">BE (Hòa vốn / Đóng tay bằng hòa)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Tổng Lợi nhuận / Thâm hụt (VND / USD ròng)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ví dụ: 1500 (USD) hoặc -500000 (VND)"
                    value={closeTradeForm.profit_loss}
                    onChange={(e) => setCloseTradeForm({ ...closeTradeForm, profit_loss: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                    required
                  />
                </div>
              </div>

              {/* Follow plan check box */}
              <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg flex items-center justify-between" id="follow-plan-chk-container">
                <div>
                  <span className="font-bold text-slate-200 block text-xs">A. Tuân thủ tuyệt đối quy định của Trade Plan?</span>
                  <span className="text-[10px] text-slate-400 inline-block mt-0.5">Tích chọn để nhận thưởng ngay <strong className="text-emerald-400">+3 điểm</strong> kỷ luật</span>
                </div>
                <input
                  type="checkbox"
                  checked={closeTradeForm.follow_plan}
                  onChange={(e) => setCloseTradeForm({ ...closeTradeForm, follow_plan: e.target.checked })}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer shrink-0"
                />
              </div>

              {/* Behavior mistakes Multi-select checkboxes */}
              <div>
                <label className="text-[11px] font-semibold text-[#F43F5E] uppercase block mb-2">B. Khai báo trung thực sai lầm mắc phải (Nếu có)</label>
                <div className="grid grid-cols-2 gap-2 bg-[#0B1020] border border-slate-800/60 p-3 rounded-lg" id="behavior-checkboxes">
                  {[
                    { type: MistakeType.FOMO, label: "FOMO bám đỉnh (-10)" },
                    { type: MistakeType.REVENGE_TRADE, label: "Revenge trả thù (-15)" },
                    { type: MistakeType.OVERTRADING, label: "Overtrading quá tải (-10)" },
                    { type: MistakeType.MOVE_STOP_LOSS, label: "Dời SL sai luật (-10)" }
                  ].map((m) => {
                    const exists = closeTradeForm.selectedMistakes.includes(m.type);
                    return (
                      <label key={m.type} className="flex items-center gap-2 text-slate-300 font-medium cursor-pointer py-1 select-none">
                        <input
                          type="checkbox"
                          checked={exists}
                          onChange={() => {
                            if (exists) {
                              setCloseTradeForm({
                                ...closeTradeForm,
                                selectedMistakes: closeTradeForm.selectedMistakes.filter(x => x !== m.type)
                              });
                            } else {
                              setCloseTradeForm({
                                ...closeTradeForm,
                                selectedMistakes: [...closeTradeForm.selectedMistakes, m.type]
                              });
                            }
                          }}
                          className="w-3.5 h-3.5 accent-rose-500"
                        />
                        <span>{m.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Ảnh chụp đồ thị lúc đóng lệnh (Screenshot After)</label>
                <div className="flex gap-2 items-center" id="screenshot-after-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBase64File(e, false)}
                    className="hidden"
                    id="screenshot-after-input"
                  />
                  <label
                    htmlFor="screenshot-after-input"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all w-fit"
                  >
                    <ImageIcon className="w-4 h-4" /> Tải đồ thị đóng nến
                  </label>
                  {closeTradeForm.screenshot_after ? (
                    <span className="text-[10px] text-emerald-400 font-bold truncate flex-1">✓ Đã chuyển hóa hình ảnh Base64</span>
                  ) : (
                    <span className="text-[10px] text-slate-500 truncate flex-1">Hỗ trợ định dạng PNG / JPG / URL ảnh lướt</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Bài học thấm đẫm rút ra (Lessons learned)</label>
                <textarea
                  placeholder="Ví dụ: Do hưng phấn quá đà dời SL bừa bãi nên thua đậm hơn, từ sau chỉ buy râu nến..."
                  value={closeTradeForm.notes}
                  onChange={(e) => setCloseTradeForm({ ...closeTradeForm, notes: e.target.value })}
                  className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-xs leading-relaxed"
                  rows={2.5}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCloseTradeModal(false);
                    setSelectedTradeToClose(null);
                  }}
                  className="flex-1 py-1.5 border border-slate-800 hover:border-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Xác nhận đóng nến
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL C: EDIT TRADE FLOW */}
      {showEditTradeModal && selectedTradeToEdit && (
        <div className="fixed inset-0 bg-[#0B1020]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" id="edit-trade-modal-wrapper">
          <div className="bg-[#121A2B] border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" id="edit-trade-modal">
            <button
              onClick={() => {
                setShowEditTradeModal(false);
                setSelectedTradeToEdit(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2.5 border-b border-slate-800 pb-2 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-400" /> Cập nhật chi tiết lệnh giao dịch
            </h3>
            
            <form onSubmit={handleEditTradeSubmit} className="space-y-4 text-xs" id="edit-trade-form-el">
              <div className="grid grid-cols-2 gap-4 font-sans">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Mã sản phẩm / Cặp tiền (Symbol)</label>
                  <input
                    type="text"
                    required
                    value={editTradeForm.symbol}
                    onChange={(e) => setEditTradeForm({ ...editTradeForm, symbol: e.target.value.toUpperCase() })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Xu hướng (Direction)</label>
                  <select
                    value={editTradeForm.direction}
                    onChange={(e) => setEditTradeForm({ ...editTradeForm, direction: e.target.value as TradeDirection })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-bold"
                  >
                    <option value="BUY">BUY (Mua lên)</option>
                    <option value="SELL">SELL (Bán xuống)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 font-sans">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Giá vào lệnh (Entry)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editTradeForm.entry_price}
                    onChange={(e) => setEditTradeForm({ ...editTradeForm, entry_price: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Stop Loss (Cắt lỗ)</label>
                  <input
                    type="number"
                    step="any"
                    value={editTradeForm.stop_loss}
                    onChange={(e) => setEditTradeForm({ ...editTradeForm, stop_loss: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                    placeholder="Không cắt lỗ"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Take Profit (Chốt lời)</label>
                  <input
                    type="number"
                    step="any"
                    value={editTradeForm.take_profit}
                    onChange={(e) => setEditTradeForm({ ...editTradeForm, take_profit: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                    placeholder="Chưa cài"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 font-sans max-w-full">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Kế hoạch rủi ro tài chính</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editTradeForm.risk_amount}
                    onChange={(e) => setEditTradeForm({ ...editTradeForm, risk_amount: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                    placeholder="Số tiền rủi ro chấp nhận"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Setup / Mô hình áp dụng</label>
                  <input
                    type="text"
                    required
                    value={editTradeForm.setup_name}
                    onChange={(e) => setEditTradeForm({ ...editTradeForm, setup_name: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 font-sans">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Kết quả trạng thái lệnh</label>
                  <select
                    value={editTradeForm.result}
                    onChange={(e) => setEditTradeForm({ ...editTradeForm, result: e.target.value as TradeResult })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-bold"
                  >
                    <option value="OPEN">RUNNING (Đang chạy)</option>
                    <option value="WIN">WIN (Thắng đậm đà)</option>
                    <option value="LOSS">LOSS (Thua cuộc/Hit SL)</option>
                    <option value="BE">BE (Hòa vốn)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Tổng Lợi nhuận / Lỗ ròng</label>
                  <input
                    type="number"
                    step="any"
                    value={editTradeForm.profit_loss}
                    onChange={(e) => setEditTradeForm({ ...editTradeForm, profit_loss: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Tâm thế giao dịch (Emotion)</label>
                <input
                  type="text"
                  value={editTradeForm.emotion_before_trade}
                  onChange={(e) => setEditTradeForm({ ...editTradeForm, emotion_before_trade: e.target.value })}
                  className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Kế hoạch trade sơ khởi</label>
                  <textarea
                    value={editTradeForm.trade_plan}
                    onChange={(e) => setEditTradeForm({ ...editTradeForm, trade_plan: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white text-xs"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Bài học thấm nhuần chi tiết</label>
                  <textarea
                    value={editTradeForm.notes}
                    onChange={(e) => setEditTradeForm({ ...editTradeForm, notes: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white text-xs"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditTradeModal(false);
                    setSelectedTradeToEdit(null);
                  }}
                  className="flex-1 py-1.5 border border-slate-800 hover:border-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL D: ADD ACCOUNT FLOW */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-[#0B1020]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" id="add-account-modal-wrapper">
          <div className="bg-[#121A2B] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative" id="add-account-modal">
            <button
              onClick={() => setShowAddAccountModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2.5 border-b border-slate-800 pb-2">
              Đăng ký tài khoản giao dịch mới
            </h3>
            
            <form onSubmit={handleAddAccountSubmit} className="space-y-4 text-xs" id="add-account-form-el">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Tên tài khoản (Account Name)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: TopStep Funded $150K"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Giá tiền mua tài khoản (VND)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    placeholder="Ví dụ: 2300000"
                    value={accountForm.purchase_price}
                    onChange={(e) => setAccountForm({ ...accountForm, purchase_price: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 pl-3 pr-12 py-2 rounded-lg text-white font-mono font-bold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold select-none">VND</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Số tiền góp vốn chung bỏ ra để mua tài khoản này (Ví dụ: tài khoản 50k giá 2.3 triệu).</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Loại tài khoản</label>
                  <select
                    value={addAccountCategory}
                    onChange={(e) => setAddAccountCategory(e.target.value as "FUND" | "LIVE")}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-bold"
                  >
                    <option value="FUND">Tài khoản Quỹ (Prop/Funded)</option>
                    <option value="LIVE">Tài khoản Live (Cá nhân)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Người quản lý sở hữu</label>
                  <select
                    value={accountForm.owner_id}
                    onChange={(e) => setAccountForm({ ...accountForm, owner_id: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-semibold"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              {addAccountCategory === "FUND" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Nhập tên quỹ</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: TopStep, FMTO, MyFundedFX..."
                    value={addFundName}
                    onChange={(e) => setAddFundName(e.target.value)}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-bold"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Số dư khởi tạo ($ / Đ)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={accountForm.starting_balance}
                    onChange={(e) => setAccountForm({ ...accountForm, starting_balance: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Số dư hiện tại ($ / Đ)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={accountForm.current_balance}
                    onChange={(e) => setAccountForm({ ...accountForm, current_balance: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Giới hạn sụt giảm ngày %</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={accountForm.daily_drawdown_limit}
                    onChange={(e) => setAccountForm({ ...accountForm, daily_drawdown_limit: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Sụt giảm tối đa %</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={accountForm.max_drawdown_limit}
                    onChange={(e) => setAccountForm({ ...accountForm, max_drawdown_limit: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Đơn vị tiền tệ</label>
                  <select
                    value={accountForm.currency}
                    onChange={(e) => setAccountForm({ ...accountForm, currency: e.target.value as "USD" | "VND" })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="VND">VND (₫)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Trạng thái tài khoản</label>
                  <select
                    value={accountForm.status}
                    onChange={(e) => setAccountForm({ ...accountForm, status: e.target.value as "ACTIVE" | "BROKEN" | "PASSED" })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-bold"
                  >
                    <option value="ACTIVE" className="text-emerald-400">🔥 ĐANG HOẠT ĐỘNG</option>
                    <option value="BROKEN" className="text-rose-400">💀 VI PHẠM (CHÁY)</option>
                    <option value="PASSED" className="text-indigo-400">🏆 ĐÃ ĐẠT CHỈ TIÊU (PASSED)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="flex-1 py-1.5 border border-slate-800 hover:border-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer animate-pulse"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL E: EDIT ACCOUNT FLOW */}
      {showEditAccountModal && selectedAccountToEdit && (
        <div className="fixed inset-0 bg-[#0B1020]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" id="edit-account-modal-wrapper">
          <div className="bg-[#121A2B] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative" id="edit-account-modal">
            <button
              onClick={() => {
                setShowEditAccountModal(false);
                setSelectedAccountToEdit(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2.5 border-b border-slate-800 pb-2">
              Hiệu chỉnh tài khoản: {selectedAccountToEdit.name}
            </h3>
            
            <form onSubmit={handleEditAccountSubmit} className="space-y-4 text-xs" id="edit-account-form-el">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Tên tài khoản (Account Name)</label>
                <input
                  type="text"
                  required
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Giá tiền mua tài khoản (VND)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    placeholder="Ví dụ: 2300000"
                    value={accountForm.purchase_price}
                    onChange={(e) => setAccountForm({ ...accountForm, purchase_price: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 pl-3 pr-12 py-2 rounded-lg text-white font-mono font-bold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold select-none">VND</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Hiệu chỉnh số vốn chung đã bỏ ra để mua tài khoản này.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Loại tài khoản</label>
                  <select
                    value={editAccountCategory}
                    onChange={(e) => setEditAccountCategory(e.target.value as "FUND" | "LIVE")}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-bold"
                  >
                    <option value="FUND">Tài khoản Quỹ (Prop/Funded)</option>
                    <option value="LIVE">Tài khoản Live (Cá nhân)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Người sở hữu</label>
                  <select
                    value={accountForm.owner_id}
                    onChange={(e) => setAccountForm({ ...accountForm, owner_id: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              {editAccountCategory === "FUND" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Nhập tên quỹ</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: TopStep, FMTO, MyFundedFX..."
                    value={editFundName}
                    onChange={(e) => setEditFundName(e.target.value)}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-bold"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Số dư khởi tạo ($ / Đ)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={accountForm.starting_balance}
                    onChange={(e) => setAccountForm({ ...accountForm, starting_balance: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Số dư lúc này ($ / Đ)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={accountForm.current_balance}
                    onChange={(e) => setAccountForm({ ...accountForm, current_balance: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Hạn sụt giảm ngày (%)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={accountForm.daily_drawdown_limit}
                    onChange={(e) => setAccountForm({ ...accountForm, daily_drawdown_limit: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Hạn sụt giảm tối đa (%)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={accountForm.max_drawdown_limit}
                    onChange={(e) => setAccountForm({ ...accountForm, max_drawdown_limit: e.target.value })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Tiền tệ</label>
                  <select
                    value={accountForm.currency}
                    onChange={(e) => setAccountForm({ ...accountForm, currency: e.target.value as "USD" | "VND" })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="VND">VND (₫)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Trạng thái hiện tại</label>
                  <select
                    value={accountForm.status}
                    onChange={(e) => setAccountForm({ ...accountForm, status: e.target.value as "ACTIVE" | "BROKEN" | "PASSED" })}
                    className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-semibold"
                  >
                    <option value="ACTIVE" className="text-emerald-400">🔥 ĐANG HOẠT ĐỘNG</option>
                    <option value="BROKEN" className="text-rose-400">💀 VI PHẠM (CHÁY)</option>
                    <option value="PASSED" className="text-indigo-400">🏆 ĐÃ ĐẠT CHỈ TIÊU (PASSED)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditAccountModal(false);
                    setSelectedAccountToEdit(null);
                  }}
                  className="flex-1 py-1.5 border border-slate-800 hover:border-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Lưu cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL F: USER MANAGEMENT PANEL */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-[#0B1020]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" id="users-modal-wrapper">
          <div className="bg-[#121A2B] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative font-sans text-xs" id="users-modal">
            <button
              onClick={() => setShowUsersModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2.5 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400 animate-pulse" /> Quản trị đội ngũ Trade Guardian
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Users List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-900/40 p-2 border border-slate-800/60 rounded">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10.5px]">Đại gia đình (Traders list)</span>
                  {!showAddUserForm && !selectedUserToEdit && (
                    <button
                      onClick={() => {
                        setShowAddUserForm(true);
                        setUserForm({
                          name: "",
                          email: "",
                          avatar: "",
                          role: "TRADER",
                          discipline_score: "100"
                        });
                      }}
                      className="px-2 py-1 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 rounded font-bold text-[10px] cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <UserPlus className="w-3 h-3" /> Thêm Trader mới
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {users.map((u) => (
                    <div key={u.id} className="p-3 bg-[#0B1020] border border-slate-800 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar} alt="" className="w-8 h-8 rounded-full border border-slate-700 shadow-sm" referrerPolicy="no-referrer" />
                        <div>
                          <strong className="text-white block font-semibold">{u.name}</strong>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            Vai trò: {u.role === UserRole.ADMIN ? "Admin Hậu 👑" : "Trader 📊"} | Điểm kỷ luật: <strong className="text-emerald-400">{u.discipline_score}đ</strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUserToEdit(u);
                            setShowAddUserForm(false);
                            setUserForm({
                              name: u.name,
                              email: u.email,
                              avatar: u.avatar,
                              role: u.role,
                              discipline_score: u.discipline_score.toString()
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded cursor-pointer transition-all"
                          title="Sửa thành viên"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded cursor-pointer transition-all"
                          title="Xóa thành viên"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Dynamic Form */}
              <div className="bg-[#0B1020] border border-slate-800 p-4 rounded-xl">
                {showAddUserForm ? (
                  <form onSubmit={handleAddUserSubmit} className="space-y-3">
                    <span className="font-bold text-white uppercase tracking-wider block border-b border-slate-800 pb-1.5 mb-2.5">Đăng ký thành viên mới</span>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Tình danh vị thế (Tên Trader)</label>
                      <input
                        type="text"
                        required
                        value={userForm.name}
                        placeholder="Ví dụ: Hoàng Hải"
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        className="w-full bg-[#121A2B] border border-slate-800 px-3 py-1.5 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Địa chỉ Email</label>
                      <input
                        type="email"
                        required
                        value={userForm.email}
                        placeholder="hai@trade-guardian.vn"
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        className="w-full bg-[#121A2B] border border-slate-800 px-3 py-1.5 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Vai trò</label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                        className="w-full bg-[#121A2B] border border-slate-800 px-3 py-1.5 rounded-lg text-white"
                      >
                        <option value="TRADER">Trader thông thường</option>
                        <option value="ADMIN">Quản trị viên (Admin)</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddUserForm(false)}
                        className="flex-1 py-1 bg-slate-800 hover:bg-slate-705 rounded font-semibold text-slate-300 cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold cursor-pointer"
                      >
                        Lưu Trader
                      </button>
                    </div>
                  </form>
                ) : selectedUserToEdit ? (
                  <form onSubmit={handleEditUserSubmit} className="space-y-3">
                    <span className="font-bold text-white uppercase tracking-wider block border-b border-slate-800 pb-1.5 mb-2.5">Cấu hình thông tin</span>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Tên hiển thị</label>
                      <input
                        type="text"
                        required
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        className="w-full bg-[#121A2B] border border-slate-800 px-3 py-1.5 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Email liên hệ</label>
                      <input
                        type="email"
                        required
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        className="w-full bg-[#121A2B] border border-slate-800 px-3 py-1.5 text-white rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Điểm uy tín kỷ luật (Mặc định 100đ)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={userForm.discipline_score}
                        onChange={(e) => setUserForm({ ...userForm, discipline_score: e.target.value })}
                        className="w-full bg-[#121A2B] border border-slate-800 px-3 py-1.5 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Vai trò trong nhóm</label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                        className="w-full bg-[#121A2B] border border-slate-800 px-3 py-1.5 rounded-lg text-white"
                      >
                        <option value="TRADER">Trader thông thường</option>
                        <option value="ADMIN">Quản trị viên (Admin)</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUserToEdit(null)}
                        className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 rounded font-semibold text-slate-300 cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold cursor-pointer"
                      >
                        Cập nhật
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-20 text-slate-500 font-mono">
                    <UserPlus className="w-8 h-8 text-slate-700 mx-auto mb-2 animate-bounce" />
                    Bấm chọn cây viết bên cạnh Trader hiển thị ở danh mục bên trái để tùy chọn chỉnh sửa, hoặc bấm "Thêm Trader mới".
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. MODAL G: PEER REVIEW EDIT */}
      {showEditReviewModal && selectedReviewToEdit && (
        <div className="fixed inset-0 bg-[#0B1020]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" id="edit-review-modal-wrapper">
          <div className="bg-[#121A2B] border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative" id="edit-review-modal">
            <button
              onClick={() => {
                setShowEditReviewModal(false);
                setSelectedReviewToEdit(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2.5 border-b border-slate-800 pb-2">
              Chỉnh sửa biên bản giám sát chéo
            </h3>

            <form onSubmit={handleEditReviewSubmit} className="space-y-4 text-xs" id="edit-review-form-el">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Xếp loại kỷ luật mới</label>
                <select
                  value={editReviewForm.rating}
                  onChange={(e) => setEditReviewForm({ ...editReviewForm, rating: e.target.value as ReviewRating })}
                  className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-semibold"
                >
                  <option value="PASS" className="text-emerald-400">PASS (Tuân thủ tốt lý tưởng)</option>
                  <option value="WARNING" className="text-amber-400">WARNING (Cảnh cáo mức nhẹ/Chưa tối ưu)</option>
                  <option value="FAIL" className="text-rose-400">FAIL (Kỷ luật tồi tệ)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Nhận xét chi tiết điều chỉnh</label>
                <textarea
                  required
                  value={editReviewForm.comment}
                  onChange={(e) => setEditReviewForm({ ...editReviewForm, comment: e.target.value })}
                  className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-xs"
                  rows={4}
                />
              </div>

              <div className="flex gap-2.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditReviewModal(false);
                    setSelectedReviewToEdit(null);
                  }}
                  className="flex-1 py-1.5 border border-slate-800 hover:border-slate-700 rounded font-semibold text-slate-300 cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded font-bold text-white cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7b. MODAL: ADD FUND TRANSACTION */}
      {showAddFundTxModal && (
        <div className="fixed inset-0 bg-[#0B1020]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" id="add-fund-tx-modal-wrapper">
          <div className="bg-[#121A2B] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative" id="add-fund-tx-modal">
            <button
              onClick={() => setShowAddFundTxModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2.5 border-b border-slate-800 pb-2 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-400" /> Ghi nhận Phát sinh Quỹ Chung
            </h3>
            
            <form onSubmit={handleAddFundTx} className="space-y-4 text-xs" id="add-fund-tx-form-el">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Loại giao dịch (Transaction Type)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFundTxForm({ ...fundTxForm, type: "INFLOW" })}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                      fundTxForm.type === "INFLOW"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    📈 Nạp / Góp Vốn (INFLOW)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFundTxForm({ ...fundTxForm, type: "OUTFLOW" })}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                      fundTxForm.type === "OUTFLOW"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : "bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    📉 Chi Tiêu Quỹ (OUTFLOW)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Số tiền (Amount - VNĐ)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  placeholder="Ví dụ: 15000000"
                  value={fundTxForm.amount}
                  onChange={(e) => setFundTxForm({ ...fundTxForm, amount: e.target.value })}
                  className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono text-xs focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Mục đích / Tên giao dịch (Purpose)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đăng ký challenge TopStep $50k Đức"
                  value={fundTxForm.purpose}
                  onChange={(e) => setFundTxForm({ ...fundTxForm, purpose: e.target.value })}
                  className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white text-xs focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Chi tiết phát sinh (Mô tả thêm - Không bắt buộc)</label>
                <textarea
                  placeholder="Hóa đơn VPS hằng tháng, nạp bù âm tài khoản live, hoặc thông tin chi tiết chuyển khoản..."
                  value={fundTxForm.description}
                  onChange={(e) => setFundTxForm({ ...fundTxForm, description: e.target.value })}
                  className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white text-xs focus:border-indigo-500 outline-none h-20"
                />
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-2.5 text-[10px] text-slate-500 leading-relaxed">
                ℹ️ <strong>Xử lý dòng tiền:</strong> Giao dịch sẽ được ghi chép và tự động cộng dồn / trừ chiết khấu trực tiếp vào Sổ dư Quỹ Tiền Chung phòng trade. Mọi thành viên đều được nạp/chi tiêu ghi chép, nhưng chỉ <strong>Hậu (Admin)</strong> được phân quyền xóa giao dịch lỗi.
              </div>

              <div className="flex gap-2.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddFundTxModal(false)}
                  className="flex-1 py-1.5 border border-slate-800 hover:border-slate-700 rounded-xl font-semibold text-slate-300 cursor-pointer text-center text-xs"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold text-white cursor-pointer text-center text-xs shadow-lg shadow-emerald-950/20"
                >
                  Ghi nhận Sổ Sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


            {/* POPUP MODAL FOR IMPORTING TRADES FROM CSV */}
            {showImportTradesModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#121A2B] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scaleIn">
                  {/* Modal Header */}
                  <div className="bg-[#0B1020] px-6 py-4 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-white font-extrabold text-sm flex items-center gap-1.5">
                      <RefreshCw className="text-indigo-500 w-4.5 h-4.5" />
                      Nhập lịch sử giao dịch hàng loạt từ tệp CSV
                    </h3>
                    <button 
                      onClick={() => {
                        setShowImportTradesModal(false);
                        setCsvFileText("");
                        setCsvFileName("");
                        setCsvHeaders([]);
                        setRawRows([]);
                      }}
                      className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <form onSubmit={handleCSVImportSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs flex flex-col">
                    {/* Setup step 1: File upload & Account select */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Account selection */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">Chọn tài khoản nhận dữ liệu</label>
                        <select
                          value={importAccountId}
                          onChange={(e) => setImportAccountId(e.target.value)}
                          className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2.5 rounded-lg text-white outline-none focus:border-indigo-500 font-semibold"
                          required
                        >
                          <option value="">-- Chọn tài khoản nhận lịch sử --</option>
                          {accounts.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.name} ({a.account_type}) - Số dư: {a.currency === "VND" ? `${a.current_balance.toLocaleString("vi-VN")}₫` : `$${a.current_balance}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* File upload box */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">Tải lên tệp CSV lịch sử (.csv)</label>
                        <div className="relative border border-dashed border-slate-800 hover:border-indigo-500/60 rounded-lg px-4 py-2.5 bg-[#0B1020] flex items-center gap-3 cursor-pointer group transition-all">
                          <input
                            type="file"
                            accept=".csv"
                            onChange={handleCSVUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <span className="p-1.5 bg-indigo-500/10 rounded-md text-indigo-400 group-hover:bg-indigo-500/20 transition-all font-sans">
                            📁
                          </span>
                          <span className="text-[11px] text-slate-300 font-medium truncate">
                            {csvFileName || "Chọn tệp CSV từ máy tính của bạn..."}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Setup step 2: Column mapping */}
                    {csvHeaders.length > 0 && (
                      <div className="bg-[#0B1020] border border-slate-800 rounded-xl p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                          <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">Thiết lập ánh xạ cột (Column Mapping)</h4>
                          <span className="text-[10px] text-slate-500 italic">Hệ thống đã tự động quét và khớp các cột tương thích. Bạn có thể chỉnh sửa lại.</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {[
                            { key: "symbol", label: "Cột Symbol (Cặp tiền/Vàng)" },
                            { key: "direction", label: "Cột Hướng (BUY/SELL)" },
                            { key: "entry_price", label: "Cột Giá vào (Entry Price)" },
                            { key: "stop_loss", label: "Cột Stop Loss (S/L)" },
                            { key: "take_profit", label: "Cột Take Profit (T/P)" },
                            { key: "profit_loss", label: "Cột Lợi Nhuận (Profit)" },
                            { key: "opened_at", label: "Cột Ngày mở (Open Time)" },
                            { key: "closed_at", label: "Cột Ngày đóng (Close Time)" }
                          ].map(col => (
                            <div key={col.key}>
                              <label className="text-[9.5px] font-bold text-slate-400 block mb-1 truncate">{col.label}</label>
                              <select
                                value={(columnMapping as any)[col.key]}
                                onChange={(e) => setColumnMapping({ ...columnMapping, [col.key]: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 px-2 py-1.5 rounded text-slate-200 outline-none text-[11px] focus:border-indigo-500 font-sans"
                              >
                                <option value="">-- Không ánh xạ --</option>
                                {csvHeaders.map(h => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Setup step 3: Preview Table */}
                    {rawRows.length > 0 && (
                      <div className="flex-1 flex flex-col min-h-[250px] bg-[#0B1020] border border-slate-800 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/40 flex justify-between items-center flex-shrink-0">
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                            Xem trước dữ liệu phân tích ({rawRows.filter((_, i) => importSelectedRows[i]).length} / {rawRows.length} lệnh được chọn)
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setImportSelectedRows(new Array(rawRows.length).fill(true))}
                              className="text-[10px] text-indigo-400 hover:text-white font-semibold cursor-pointer"
                            >
                              Chọn tất cả
                            </button>
                            <span className="text-slate-700">|</span>
                            <button
                              type="button"
                              onClick={() => setImportSelectedRows(new Array(rawRows.length).fill(false))}
                              className="text-[10px] text-slate-400 hover:text-white font-semibold cursor-pointer"
                            >
                              Bỏ chọn tất cả
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 overflow-auto max-h-[300px]">
                          <table className="w-full text-left text-[11px] font-mono">
                            <thead className="bg-[#0B1020] text-slate-500 uppercase text-[9.5px] border-b border-slate-800 sticky top-0 z-10">
                              <tr>
                                <th className="p-2.5 text-center w-10">Chọn</th>
                                <th className="p-2.5">Cặp</th>
                                <th className="p-2.5">Mua/Bán</th>
                                <th className="p-2.5">Giá vào</th>
                                <th className="p-2.5">SL / TP</th>
                                <th className="p-2.5">Lợi nhuận</th>
                                <th className="p-2.5">Thời gian mở / đóng</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 bg-[#121A2B]/20">
                              {rawRows.map((row, idx) => {
                                const symbol = row[columnMapping.symbol] || "Chưa khớp";
                                const dirRaw = (row[columnMapping.direction] || "BUY").toUpperCase();
                                const direction = (dirRaw.includes("SELL") || dirRaw.includes("SHORT")) ? "SELL" : "BUY";
                                const entry = row[columnMapping.entry_price] || "0";
                                const sl = row[columnMapping.stop_loss] || "0";
                                const tp = row[columnMapping.take_profit] || "0";
                                const profit = parseFloat(row[columnMapping.profit_loss]) || 0;
                                const openTime = row[columnMapping.opened_at] || "-";
                                const closeTime = row[columnMapping.closed_at] || "-";

                                return (
                                  <tr key={idx} className={`hover:bg-slate-800/10 transition-all ${importSelectedRows[idx] ? "" : "opacity-45 bg-[#0B1020]/20"}`}>
                                    <td className="p-2.5 text-center">
                                      <input
                                        type="checkbox"
                                        checked={importSelectedRows[idx] || false}
                                        onChange={() => {
                                          const copy = [...importSelectedRows];
                                          copy[idx] = !copy[idx];
                                          setImportSelectedRows(copy);
                                        }}
                                        className="cursor-pointer"
                                      />
                                    </td>
                                    <td className="p-2.5 font-bold text-slate-200">{symbol}</td>
                                    <td className="p-2.5">
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${direction === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                        {direction}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-slate-300">@{entry}</td>
                                    <td className="p-2.5 text-slate-400">
                                      <div className="text-[10px]">SL: {sl || "Không cài ⚠️"}</div>
                                      <div className="text-[10px]">TP: {tp || "Chưa cài"}</div>
                                    </td>
                                    <td className={`p-2.5 font-bold ${profit > 0 ? "text-emerald-400" : profit < 0 ? "text-rose-400" : "text-slate-400"}`}>
                                      {profit > 0 ? "+" : ""}{profit.toLocaleString("en-US")}
                                    </td>
                                    <td className="p-2.5 text-slate-400 text-[10px] leading-relaxed">
                                      <div>Mở: {openTime}</div>
                                      <div>Đóng: {closeTime}</div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Modal Footer buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-850 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setShowImportTradesModal(false);
                          setCsvFileText("");
                          setCsvFileName("");
                          setCsvHeaders([]);
                          setRawRows([]);
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg cursor-pointer"
                      >
                        Đóng
                      </button>
                      <button
                        type="submit"
                        disabled={isImporting || rawRows.length === 0 || !importAccountId}
                        className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-40 text-white font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-indigo-950/20"
                      >
                        {isImporting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Đang xử lý nhập...
                          </>
                        ) : (
                          <>
                            <span>Nhập dữ liệu lịch sử</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* POPUP MODAL FOR ADDING/EDITING MARKET NEWS */}
            {(showAddNewsModal || showEditNewsModal) && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#121A2B] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleIn">
                  <div className="bg-[#0B1020] px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-white font-extrabold text-sm flex items-center gap-1.5">
                      <Calendar className="text-rose-500 w-4.5 h-4.5" /> 
                      {showEditNewsModal ? "Cập nhật sự kiện vĩ mô" : "Tạo sự kiện vĩ mô mới"}
                    </h3>
                    <button 
                      onClick={() => {
                        setShowAddNewsModal(false);
                        setShowEditNewsModal(false);
                        setSelectedNewsToEdit(null);
                      }}
                      className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleNewsSubmit} className="p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Tên sự kiện / Tin tức</label>
                        <input 
                          type="text" 
                          placeholder="Ví dụ: Chỉ số CPI lõi hàng tháng (Mỹ)..."
                          value={newsForm.title}
                          onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                          className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white outline-none focus:border-indigo-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Thời gian công bố (Ngày & Giờ)</label>
                        <input 
                          type="datetime-local" 
                          value={newsForm.datetime}
                          onChange={(e) => setNewsForm({ ...newsForm, datetime: e.target.value })}
                          className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white outline-none focus:border-indigo-500 font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Mức độ ảnh hưởng</label>
                        <select
                          value={newsForm.impact}
                          onChange={(e) => setNewsForm({ ...newsForm, impact: e.target.value as any })}
                          className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white outline-none focus:border-indigo-500 font-semibold"
                        >
                          <option value="HIGH">🔴 Tác động mạnh (HIGH)</option>
                          <option value="MEDIUM">🟡 Tác động vừa (MEDIUM)</option>
                          <option value="LOW">⚪ Tác động yếu (LOW)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Hướng ảnh hưởng giá Vàng</label>
                        <select
                          value={newsForm.gold_impact_direction}
                          onChange={(e) => setNewsForm({ ...newsForm, gold_impact_direction: e.target.value as any })}
                          className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white outline-none focus:border-indigo-500 font-semibold"
                        >
                          <option value="VOLATILE">⚡ Biến động hai chiều mạnh</option>
                          <option value="UP">📈 Vàng tăng giá (USD giảm)</option>
                          <option value="DOWN">📉 Vàng giảm giá (USD tăng)</option>
                          <option value="NEUTRAL">⚪ Ít tác động trực tiếp</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Kỳ trước</label>
                        <input 
                          type="text" 
                          placeholder="3.5%"
                          value={newsForm.previous}
                          onChange={(e) => setNewsForm({ ...newsForm, previous: e.target.value })}
                          className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white outline-none focus:border-indigo-500 font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Dự báo</label>
                        <input 
                          type="text" 
                          placeholder="3.4%"
                          value={newsForm.forecast}
                          onChange={(e) => setNewsForm({ ...newsForm, forecast: e.target.value })}
                          className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white outline-none focus:border-indigo-500 font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Thực tế</label>
                        <input 
                          type="text" 
                          placeholder="Bỏ trống nếu chờ..."
                          value={newsForm.actual}
                          onChange={(e) => setNewsForm({ ...newsForm, actual: e.target.value })}
                          className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white outline-none focus:border-indigo-500 font-mono text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Phân tích & Nhận định ảnh hưởng giá Vàng</label>
                      <textarea
                        placeholder="Nếu CPI cao hơn dự báo (USD tăng) -> Giá vàng sẽ giảm. Nếu thấp hơn dự báo -> Vàng bay cao..."
                        value={newsForm.description}
                        onChange={(e) => setNewsForm({ ...newsForm, description: e.target.value })}
                        className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white outline-none focus:border-indigo-500 h-20 leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddNewsModal(false);
                          setShowEditNewsModal(false);
                          setSelectedNewsToEdit(null);
                        }}
                        className="px-4 py-2 border border-slate-800 text-slate-300 rounded-lg hover:bg-slate-800 cursor-pointer"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-600/10 cursor-pointer"
                      >
                        {showEditNewsModal ? "Cập nhật sự kiện" : "Tạo sự kiện"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* POPUP MODAL FOR ADDING USER-DEFINED REGULATIONS */}
            {showAddRegModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#121A2B] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn">
                  <div className="bg-[#0B1020] px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-white font-extrabold text-sm flex items-center gap-1.5">
                      <Scale className="text-amber-500 w-4.5 h-4.5" /> Thiết lập quy chế mới
                    </h3>
                    <button 
                      onClick={() => setShowAddRegModal(false)}
                      className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleRegSubmit} className="p-6 space-y-4 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Tên quy chế / Hành quy phạm</label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: FOMO do đuổi theo sóng..."
                        value={regForm.title}
                        onChange={(e) => setRegForm({ ...regForm, title: e.target.value })}
                        className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Phân loại</label>
                        <select
                          value={regForm.type}
                          onChange={(e) => setRegForm({ ...regForm, type: e.target.value as IncentiveType })}
                          className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white"
                        >
                          <option value="REWARD">Thưởng (REWARD)</option>
                          <option value="PENALTY">Phạt (PENALTY)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase font-mono">Định mức quy đổi (VNĐ)</label>
                        <input 
                          type="number" 
                          placeholder="50000"
                          value={regForm.amount}
                          onChange={(e) => setRegForm({ ...regForm, amount: Number(e.target.value) || 0 })}
                          className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-mono"
                          required
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Mô tả và cách thức áp dụng</label>
                      <textarea 
                        rows={3}
                        placeholder="Quy chuẩn hoạt động cụ thể..."
                        value={regForm.description}
                        onChange={(e) => setRegForm({ ...regForm, description: e.target.value })}
                        className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white resize-none"
                        required
                      />
                    </div>

                    <div className="border-t border-slate-800/80 pt-4 flex gap-2 justify-end">
                      <button 
                        type="button"
                        onClick={() => setShowAddRegModal(false)}
                        className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-lg cursor-pointer hover:bg-slate-700/80"
                      >
                        Hủy
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-500 hover:from-amber-600 hover:to-indigo-600 text-[#090D1A] font-extrabold rounded-lg cursor-pointer shadow-lg"
                      >
                        Lưu quy chế
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* POPUP MODAL FOR QUICK APPLY REGULATION */}
            {quickApplyState.isOpen && quickApplyState.reg && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#121A2B] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn">
                  <div className="bg-[#0B1020] px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-white font-extrabold text-sm flex items-center gap-1.5">
                      <Scale className="text-amber-500 w-4.5 h-4.5" /> Áp dụng Quy Chế & Thưởng Phạt
                    </h3>
                    <button 
                      onClick={() => setQuickApplyState({ ...quickApplyState, isOpen: false, reg: null })}
                      className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleQuickApplySubmit} className="p-6 space-y-4 text-xs">
                    <div className="bg-[#0B1020]/60 p-3.5 rounded-lg border border-slate-800/80 space-y-1.5">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-200 text-sm">{quickApplyState.reg.title}</span>
                        <span className={`font-mono font-bold text-xs ${quickApplyState.reg.type === "REWARD" ? "text-emerald-400" : "text-rose-400"}`}>
                          {quickApplyState.reg.type === "REWARD" ? "+" : "-"}{formatVND(quickApplyState.reg.amount)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{quickApplyState.reg.description}</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">Đối tượng áp dụng (Chọn một thành viên)</label>
                      <select
                        value={quickApplyState.selectedUserId}
                        onChange={(e) => setQuickApplyState({ ...quickApplyState, selectedUserId: e.target.value })}
                        className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white font-semibold focus:outline-none focus:border-indigo-500 text-xs"
                        required
                      >
                        <option value="">-- Chọn thành viên nhận thưởng/phạt --</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Lý do & Nội dung chấp pháp</label>
                      <input 
                        type="text" 
                        value={quickApplyState.reason}
                        onChange={(e) => setQuickApplyState({ ...quickApplyState, reason: e.target.value })}
                        className="w-full bg-[#0B1020] border border-slate-800 px-3 py-2 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="border-t border-slate-800/80 pt-4 flex gap-2 justify-end">
                      <button 
                        type="button"
                        onClick={() => setQuickApplyState({ ...quickApplyState, isOpen: false, reg: null })}
                        className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-lg cursor-pointer hover:bg-slate-700/80"
                      >
                        Hủy
                      </button>
                      <button 
                        type="submit"
                        className={`px-4 py-2 bg-gradient-to-r text-white font-extrabold rounded-lg cursor-pointer shadow-lg ${
                          quickApplyState.reg.type === "REWARD"
                            ? "from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                            : "from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
                        }`}
                      >
                        Áp Dụng Thưởng Phạt
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

      {/* 11. CUSTOM CONFIRMATION & ALERT DIALOGS (SANDBOX WORKAROUND) */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 bg-[#070b19]/85 backdrop-blur-md z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-[#121A2B] border border-slate-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-center"
            >
              <div className="mx-auto w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mb-4 text-amber-400">
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                {confirmDialog.title}
              </h3>
              <p className="text-slate-400 text-xs mb-6 px-1 leading-relaxed">
                {confirmDialog.message}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-2 px-4 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800/40 font-semibold text-xs cursor-pointer transition-all duration-200"
                >
                  Bỏ qua
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs cursor-pointer shadow-red-900/40 shadow-lg group transition-all duration-200"
                >
                  Đồng ý Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alertDialog && (
          <div className="fixed inset-0 bg-[#070b19]/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#121A2B] border border-slate-800/80 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center"
            >
              {alertDialog.type === "success" && (
                <div className="mx-auto w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-4 text-emerald-400">
                  <CheckCircle2 className="w-8 h-8 flex items-center justify-center mx-auto" />
                </div>
              )}
              {alertDialog.type === "error" && (
                <div className="mx-auto w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mb-4 text-rose-400">
                  <ShieldAlert className="w-8 h-8 flex items-center justify-center mx-auto" />
                </div>
              )}
              {alertDialog.type === "info" && (
                <div className="mx-auto w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 rounded-full flex items-center justify-center mb-4 text-indigo-400">
                  <Activity className="w-8 h-8 flex items-center justify-center mx-auto" />
                </div>
              )}
              <h3 className="text-base font-bold text-white mb-2 leading-tight">
                {alertDialog.title}
              </h3>
              <p className="text-slate-400 text-xs mb-5 px-1 leading-relaxed">
                {alertDialog.message}
              </p>
              <button
                type="button"
                onClick={() => setAlertDialog(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-all duration-150"
              >
                Xác nhận
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
