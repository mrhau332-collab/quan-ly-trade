/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import {
  UserRole,
  AccountType,
  AccountStatus,
  TradeDirection,
  TradeEmotion,
  TradeResult,
  MistakeType,
  MistakeSeverity,
  IncentiveType,
  ReviewRating,
  Trade,
  TradingAccount,
  TradeMistake,
  RewardPenalty,
  AccountabilityReview,
  DailyJournal,
  AppNotification
} from "./src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DB_PATH = path.join(process.cwd(), "db.json");

// Middleware to parse large JSON requests (for base64 screenshots)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

function getDefaultRegulations() {
  return [
    {
      id: "reg_1",
      title: "Quên Stop Loss (No SL)",
      type: "PENALTY",
      amount: 50000,
      description: "Mở vị thế giao dịch mà không đặt cắt lỗ Stop Loss bảo vệ tài khoản ngay từ đầu.",
      created_at: new Date().toISOString()
    },
    {
      id: "reg_2",
      title: "Trả thù thị trường (Revenge trade)",
      type: "PENALTY",
      amount: 300000,
      description: "Liên tiếp nhồi thêm lệnh khống lồ ngay sau khi vừa bị dính SL nhằm gỡ lỗ nhanh trong trạng thái mất bình tĩnh.",
      created_at: new Date().toISOString()
    },
    {
      id: "reg_3",
      title: "Tâm lý đuổi đỉnh (FOMO)",
      type: "PENALTY",
      amount: 50000,
      description: "Tham lam rượt đuổi theo giá bất chấp các tín hiệu kỹ thuật hay tín hiệu nến chưa chuẩn chỉ.",
      created_at: new Date().toISOString()
    },
    {
      id: "reg_4",
      title: "Dời vị thế Stop Loss bất quy tắc",
      type: "PENALTY",
      amount: 50000,
      description: "Nới rộng khoảng SL ra xa hơn để gồng khoản lỗ ròng đang gia tăng trái với nguyên tắc quản trị rủi ro lúc lập kế hoạch.",
      created_at: new Date().toISOString()
    },
    {
      id: "reg_5",
      title: "Overtrading (Giao dịch quá tay)",
      type: "PENALTY",
      amount: 50000,
      description: "Giao dịch vượt quá 5 lệnh riêng biệt trong ngày hoặc mở tổng khối lượng lót quá mức quy chuẩn của nhóm.",
      created_at: new Date().toISOString()
    },
    {
      id: "reg_6",
      title: "Trốn viết nhật ký ngày",
      type: "PENALTY",
      amount: 50000,
      description: "Không hoàn thành việc tổng kết nhật ký giao dịch của ngày hôm đó.",
      created_at: new Date().toISOString()
    },
    {
      id: "reg_7",
      title: "Ghi chép Nhật ký ngày đầy đủ",
      type: "REWARD",
      amount: 10000,
      description: "Cập nhật đầy đủ suy nghĩ, bài học và cảm xúc ngày giao dịch.",
      created_at: new Date().toISOString()
    },
    {
      id: "reg_8",
      title: "Tuân thủ đúng tuyệt đối trade plan",
      type: "REWARD",
      amount: 20000,
      description: "Thực thi chuẩn chỉ kế hoạch giao dịch chi tiết đề ra ban sáng.",
      created_at: new Date().toISOString()
    },
    {
      id: "reg_9",
      title: "Một tuần kỷ luật giao dịch tuyệt đối",
      type: "REWARD",
      amount: 100000,
      description: "Không dính bất cứ sai phạm hành vi nào trong suốt tuần giao dịch.",
      created_at: new Date().toISOString()
    },
    {
      id: "reg_10",
      title: "Tuần giao dịch hoàn hảo (Perfect Week)",
      type: "REWARD",
      amount: 200000,
      description: "Đạt chỉ tiêu về mặt lợi nhuận mục tiêu, đồng thời duy trì tỷ lệ tuân thủ kỷ luật và kiểm soát tâm lý ở mức cao nhất.",
      created_at: new Date().toISOString()
    }
  ];
}

// Helper to calculate shared fund balance
function calculateSharedFund(db: any) {
  if (!db.shared_fund) {
    db.shared_fund = { balance: 10000000, currency: "VND", transactions: [] };
  }
  if (db.shared_fund.contributed_capital === undefined) {
    db.shared_fund.contributed_capital = 20000000;
  }

  // Calculate sum of purchase prices of accounts
  const accountsCost = (db.trading_accounts || []).reduce((sum: number, acct: any) => sum + (acct.purchase_price || 0), 0);

  // Calculate other transaction inflows/outflows
  // Exclude tx_1 (Initial contribution) and tx_2 (Initial challenge purchase) to avoid double counting
  let extraBalance = 0;
  const txs = db.shared_fund.transactions || [];
  txs.forEach((tx: any) => {
    if (tx.id !== "tx_1" && tx.id !== "tx_2") {
      if (tx.type === "INFLOW") {
        extraBalance += tx.amount;
      } else {
        extraBalance -= tx.amount;
      }
    }
  });

  db.shared_fund.balance = db.shared_fund.contributed_capital - accountsCost + extraBalance;
}

// Helper to read database
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    const db = JSON.parse(data);
    let modified = false;

    // Ensure regulations array exists
    if (!db.regulations || db.regulations.length === 0) {
      db.regulations = getDefaultRegulations();
      modified = true;
    }

    // Ensure shared_fund exists
    if (!db.shared_fund) {
      db.shared_fund = {
        balance: 10000000,
        currency: "VND",
        contributed_capital: 20000000,
        transactions: [
          {
            id: "tx_1",
            amount: 25000000,
            type: "INFLOW",
            purpose: "Vốn đóng góp ban đầu",
            description: "Hậu đóng góp vốn ban đầu để khởi tạo quỹ chung",
            user_id: "1",
            created_at: "2026-05-01T00:00:00Z"
          },
          {
            id: "tx_2",
            amount: 15000000,
            type: "OUTFLOW",
            purpose: "Chi mua tài khoản thử thách TopStep $50k",
            description: "Mua tài khoản thử thách TopStep $50k cho Đức thi quỹ dưới sự giám sát chéo",
            user_id: "1",
            created_at: "2026-05-02T10:00:00Z"
          }
        ]
      };
      modified = true;
    }

    if (db.shared_fund.contributed_capital === undefined) {
      db.shared_fund.contributed_capital = 20000000;
      modified = true;
    }

    calculateSharedFund(db);

    if (modified) {
      await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    }

    return db;
  } catch (err) {
    console.error("Error reading database file, using fallback key structure", err);
    return {
      users: [],
      trading_accounts: [],
      trades: [],
      trade_mistakes: [],
      rewards_penalties: [],
      accountability_reviews: [],
      daily_journals: [],
      notifications: [],
      regulations: getDefaultRegulations(),
      shared_fund: {
        balance: 10000000,
        currency: "VND",
        transactions: [
          {
            id: "tx_1",
            amount: 25000000,
            type: "INFLOW",
            purpose: "Vốn đóng góp ban đầu",
            description: "Hậu đóng góp vốn ban đầu để khởi tạo quỹ chung",
            user_id: "1",
            created_at: "2026-05-01T00:00:00Z"
          },
          {
            id: "tx_2",
            amount: 15000000,
            type: "OUTFLOW",
            purpose: "Chi mua tài khoản thử thách TopStep $50k",
            description: "Mua tài khoản thử thách TopStep $50k cho Đức thi quỹ dưới sự giám sát chéo",
            user_id: "1",
            created_at: "2026-05-02T10:00:00Z"
          }
        ]
      }
    };
  }
}

// Helper to write database
async function writeDB(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// Helper to generate IDs
function generateUUID() {
  return Math.random().toString(36).substring(2, 9) + "_" + Date.now();
}

/**
 * ----------------- API ENDPOINTS -----------------
 */

// 1. Get database state
app.get("/api/db", async (req, res) => {
  try {
    const db = await readDB();
    res.json(db);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to read database state: " + error.message });
  }
});

// 2. Submit a new trade (Open Trade)
app.post("/api/trades", async (req, res) => {
  try {
    const db = await readDB();
    const {
      account_id,
      user_id,
      symbol,
      direction,
      entry_price,
      stop_loss,
      take_profit,
      risk_amount,
      setup_name,
      trade_plan,
      entry_reason,
      emotion_before_trade,
      screenshot_before,
      notes
    } = req.body;

    // Validation
    if (!account_id || !user_id || !symbol || !direction || !entry_price) {
      return res.status(400).json({ error: "Missing required fields for entering a trade." });
    }

    // Find account to calculate risk percent based on balance
    const account = db.trading_accounts.find((a: any) => a.id === account_id);
    if (!account) {
      return res.status(404).json({ error: "Trading account not found." });
    }

    const calculatedRiskPercent = Number(((risk_amount / account.current_balance) * 100).toFixed(2));
    
    // Calculate R:R Ratio
    const tpDiff = Math.abs(take_profit - entry_price);
    const slDiff = Math.abs(entry_price - stop_loss);
    const rrRatio = slDiff > 0 ? Number((tpDiff / slDiff).toFixed(2)) : 0;

    const newTrade: Trade = {
      id: "trade_" + generateUUID(),
      account_id,
      user_id,
      symbol,
      direction: direction as TradeDirection,
      entry_price: Number(entry_price),
      stop_loss: Number(stop_loss),
      take_profit: Number(take_profit),
      risk_amount: Number(risk_amount),
      risk_percent: calculatedRiskPercent,
      rr_ratio: rrRatio,
      setup_name: setup_name || "General Setup",
      trade_plan: trade_plan || "",
      entry_reason: entry_reason || "",
      emotion_before_trade: (emotion_before_trade || TradeEmotion.NEUTRAL) as TradeEmotion,
      opened_at: new Date().toISOString(),
      closed_at: null,
      result: TradeResult.OPEN,
      profit_loss: 0,
      profit_loss_percent: 0,
      screenshot_before: screenshot_before || "",
      screenshot_after: "",
      notes: notes || "",
      created_at: new Date().toISOString()
    };

    // Rule Check: No Stop Loss Detection
    let automaticMistakes: TradeMistake[] = [];
    let automaticPenalties: RewardPenalty[] = [];

    if (!stop_loss || Number(stop_loss) === 0) {
      // Create mistake
      const mistakeId = "mist_" + generateUUID();
      const noSLMistake: TradeMistake = {
        id: mistakeId,
        trade_id: newTrade.id,
        user_id,
        mistake_type: MistakeType.NO_STOP_LOSS,
        description: `Mở lệnh ${symbol} không cài đặt cắt lỗ (Stop Loss) tự động hóa!`,
        severity: MistakeSeverity.HIGH,
        penalty_score: 20,
        created_at: new Date().toISOString()
      };
      automaticMistakes.push(noSLMistake);

      const penaltyId = "rp_" + generateUUID();
      const noSLPenalty: RewardPenalty = {
        id: penaltyId,
        user_id,
        type: IncentiveType.PENALTY,
        score: 50000,
        reason: `Hệ thống phạt tự động: Mở lệnh ${symbol} không có Stop Loss (-50.000₫ tiền mặt)`,
        created_by: "SYSTEM",
        created_at: new Date().toISOString()
      };
      automaticPenalties.push(noSLPenalty);
    }

    // Rule Check: Over-sizing Account Rule (Max risk 0.5% for safety; check if > 0.5%)
    if (calculatedRiskPercent > 0.5) {
      const mistakeId = "mist_" + generateUUID();
      const overSizeMistake: TradeMistake = {
        id: mistakeId,
        trade_id: newTrade.id,
        user_id,
        mistake_type: MistakeType.OVERSIZED_POSITION,
        description: `Mở lệnh với tỉ lệ rủi ro vượt quá mức quy chuẩn (Rủi ro ${calculatedRiskPercent}% > 0.5%).`,
        severity: MistakeSeverity.MEDIUM,
        penalty_score: 10,
        created_at: new Date().toISOString()
      };
      automaticMistakes.push(overSizeMistake);

      const penaltyId = "rp_" + generateUUID();
      const overSizePenalty: RewardPenalty = {
        id: penaltyId,
        user_id,
        type: IncentiveType.PENALTY,
        score: 30000,
        reason: `Hệ thống phạt tự động: Tỉ lệ rủi ro<sup>(*)</sup> ${calculatedRiskPercent}% vượt quy định đầu tư (-30.000₫ tiền mặt)`,
        created_by: "SYSTEM",
        created_at: new Date().toISOString()
      };
      automaticPenalties.push(overSizePenalty);
    }

    // Find Trader Name
    const traderUser = db.users.find((u: any) => u.id === user_id);
    const traderName = traderUser ? traderUser.name : "Một trader";

    // Create Notification and Append
    const newNotification: AppNotification = {
      id: "not_" + generateUUID(),
      title: "Lệnh trade mới được mở",
      message: `${traderName} vừa mở lệnh ${direction} trên ${symbol} cho tk ${account.name}. Rủi ro: ${calculatedRiskPercent}%, R:R: 1:${rrRatio}`,
      type: "info",
      read: false,
      created_at: new Date().toISOString()
    };

    // Save To Database
    db.trades.push(newTrade);
    if (automaticMistakes.length > 0) {
      db.trade_mistakes.push(...automaticMistakes);
    }
    if (automaticPenalties.length > 0) {
      db.rewards_penalties.push(...automaticPenalties);
    }
    db.notifications.unshift(newNotification);

    // Keep active equity in sync
    account.equity = account.current_balance;

    await writeDB(db);
    res.json({ trade: newTrade, mistakes: automaticMistakes, penalties: automaticPenalties });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to open trade: " + error.message });
  }
});

// 3. Close Trade
app.post("/api/trades/:id/close", async (req, res) => {
  try {
    const db = await readDB();
    const tradeId = req.params.id;
    const { result, profit_loss, screenshot_after, notes, mistakes, follow_plan } = req.body;

    const trade = db.trades.find((t: any) => t.id === tradeId);
    if (!trade) {
      return res.status(404).json({ error: "Trade not found." });
    }

    if (trade.result !== TradeResult.OPEN) {
      return res.status(400).json({ error: "Trade is already closed." });
    }

    // Find account to add/subtract profit
    const account = db.trading_accounts.find((a: any) => a.id === trade.account_id);
    if (!account) {
      return res.status(404).json({ error: "Associated trading account not found." });
    }

    const plNumber = Number(profit_loss);
    
    // Update Trade Details
    trade.result = result as TradeResult;
    trade.profit_loss = plNumber;
    trade.profit_loss_percent = Number(((plNumber / account.current_balance) * 100).toFixed(2));
    trade.closed_at = new Date().toISOString();
    trade.screenshot_after = screenshot_after || "";
    if (notes) {
      trade.notes = `${trade.notes}\n[Closed Info]: ${notes}`;
    }

    // Update Account Balances
    account.current_balance = Number((account.current_balance + plNumber).toFixed(2));
    account.equity = account.current_balance;

    // Check custom manual user entered mistakes during closure
    let manualMistakes: TradeMistake[] = [];
    let manualPenalties: RewardPenalty[] = [];

    if (Array.isArray(mistakes) && mistakes.length > 0) {
      for (const mType of mistakes) {
        // Calculate cash penalty
        let cashPenaltyValue = 30000;
        if (mType === MistakeType.NO_STOP_LOSS) cashPenaltyValue = 50000;
        else if (mType === MistakeType.REVENGE_TRADE) cashPenaltyValue = 100000;
        else if (mType === MistakeType.FOMO) cashPenaltyValue = 30000;
        else if (mType === MistakeType.MOVE_STOP_LOSS) cashPenaltyValue = 50000;
        else if (mType === MistakeType.OVERTRADING) cashPenaltyValue = 50000;

        const mistId = "mist_" + generateUUID();
        const customMistake: TradeMistake = {
          id: mistId,
          trade_id: trade.id,
          user_id: trade.user_id,
          mistake_type: mType as MistakeType,
          description: `Lỗi ghi nhận khi đóng nến: ${mType}`,
          severity: MistakeSeverity.MEDIUM,
          penalty_score: mType === MistakeType.NO_STOP_LOSS ? 20 : 10,
          created_at: new Date().toISOString()
        };
        manualMistakes.push(customMistake);

        const rpenalty: RewardPenalty = {
          id: "rp_" + generateUUID(),
          user_id: trade.user_id,
          type: IncentiveType.PENALTY,
          score: cashPenaltyValue,
          reason: `Phạt hành vi khi đóng lệnh: Lỗi ${mType} (-${cashPenaltyValue.toLocaleString("vi-VN")}₫ tiền mặt)`,
          created_by: "SYSTEM",
          created_at: new Date().toISOString()
        };
        manualPenalties.push(rpenalty);
      }
    }

    // Reward for following plan
    if (follow_plan) {
      const rewardId = "rp_" + generateUUID();
      const planReward: RewardPenalty = {
        id: rewardId,
        user_id: trade.user_id,
        type: IncentiveType.REWARD,
        score: 20000,
        reason: `Thưởng tuân thủ hoàn mỹ kế hoạch đề ra giao dịch ${trade.symbol} (+20.000₫ tiền mặt)`,
        created_by: "SYSTEM",
        created_at: new Date().toISOString()
      };
      manualPenalties.push(planReward);
    }

    // Notifications
    const traderUser = db.users.find((u: any) => u.id === trade.user_id);
    const traderName = traderUser ? traderUser.name : "Một trader";

    const closeNotification: AppNotification = {
      id: "not_" + generateUUID(),
      title: "Lệnh trade đã đóng",
      message: `${traderName} vừa ĐÓNG lệnh ${trade.symbol}. Kết quả: ${result} (P/L: ${plNumber > 0 ? "+" : ""}${plNumber} ${account.currency})`,
      type: result === TradeResult.WIN ? "success" : result === TradeResult.LOSS ? "error" : "warning",
      read: false,
      created_at: new Date().toISOString()
    };

    db.notifications.unshift(closeNotification);
    if (manualMistakes.length > 0) {
      db.trade_mistakes.push(...manualMistakes);
    }
    if (manualPenalties.length > 0) {
      db.rewards_penalties.push(...manualPenalties);
    }

    await writeDB(db);
    res.json({ trade, mistakes: manualMistakes, penalties: manualPenalties });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to close trade: " + error.message });
  }
});

// 4. Create Daily Journal (and award points)
app.post("/api/daily-journals", async (req, res) => {
  try {
    const db = await readDB();
    const {
      user_id,
      date,
      market_condition,
      emotion,
      what_went_well,
      what_went_wrong,
      lessons,
      tomorrow_plan
    } = req.body;

    if (!user_id || !date) {
      return res.status(400).json({ error: "User ID and Date are required." });
    }

    // Check if journal exists for this user and date
    const existingIndex = db.daily_journals.findIndex(
      (j: any) => j.user_id === user_id && j.date === date
    );

    const isNew = existingIndex === -1;

    const journal: DailyJournal = {
      id: isNew ? "jour_" + generateUUID() : db.daily_journals[existingIndex].id,
      user_id,
      date,
      market_condition: market_condition || "",
      emotion: emotion || "",
      what_went_well: what_went_well || "",
      what_went_wrong: what_went_wrong || "",
      lessons: lessons || "",
      tomorrow_plan: tomorrow_plan || "",
      created_at: isNew ? new Date().toISOString() : db.daily_journals[existingIndex].created_at
    };

    if (isNew) {
      db.daily_journals.push(journal);

      // Reward Complete Journal = +10,000đ cash
      const rewardId = "rp_" + generateUUID();
      const journalReward: RewardPenalty = {
        id: rewardId,
        user_id,
        type: IncentiveType.REWARD,
        score: 10000,
        reason: `Thưởng viết nhật ký trading ngày ${date} (+10.000₫ tiền mặt)`,
        created_by: "SYSTEM",
        created_at: new Date().toISOString()
      };
      db.rewards_penalties.push(journalReward);

      // Notify journal added
      const author = db.users.find((u: any) => u.id === user_id);
      db.notifications.unshift({
        id: "not_" + generateUUID(),
        title: "Nhật ký giao dịch mới",
        message: `${author ? author.name : "Trader"} đã hoàn thành nhật ký trading ngày ${date}`,
        type: "success",
        read: false,
        created_at: new Date().toISOString()
      });
    } else {
      db.daily_journals[existingIndex] = journal;
    }

    await writeDB(db);
    res.json({ journal, rewarded: isNew });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to post daily journal: " + error.message });
  }
});

// 5. Add Cross-monitoring (Accountability) Review
app.post("/api/reviews", async (req, res) => {
  try {
    const db = await readDB();
    const { trade_id, reviewer_id, rating, comment } = req.body;

    if (!trade_id || !reviewer_id || !rating) {
      return res.status(400).json({ error: "Trade ID, Reviewer ID and Rating are required." });
    }

    const trade = db.trades.find((t: any) => t.id === trade_id);
    if (!trade) {
      return res.status(404).json({ error: "Trade not found in database." });
    }

    // Assure the reviewer is not the trade owner
    if (trade.user_id === reviewer_id) {
      return res.status(400).json({ error: "Bạn không thể đánh giá chéo chính lệnh giao dịch của mình." });
    }

    const review: AccountabilityReview = {
      id: "rev_" + generateUUID(),
      trade_id,
      reviewer_id,
      target_user_id: trade.user_id,
      rating: rating as ReviewRating,
      comment: comment || "",
      created_at: new Date().toISOString()
    };

    db.accountability_reviews.push(review);

    // Notify target user
    const reviewerUser = db.users.find((u: any) => u.id === reviewer_id);
    const reviewerName = reviewerUser ? reviewerUser.name : "Giám sát viên";
    const targetUser = db.users.find((u: any) => u.id === trade.user_id);
    const targetName = targetUser ? targetUser.name : "Trader";

    const typeMapping = {
      PASS: "success",
      WARNING: "warning",
      FAIL: "error"
    };

    db.notifications.unshift({
      id: "not_" + generateUUID(),
      title: "Đánh giá giám sát chéo",
      message: `${reviewerName} vừa đánh giá [${rating}] cho lệnh trade ${trade.symbol} của bạn. Nhận xét: "${comment}"`,
      type: (typeMapping[rating as ReviewRating] || "info") as any,
      read: false,
      created_at: new Date().toISOString()
    });

    await writeDB(db);
    res.json(review);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to add review: " + error.message });
  }
});

// 6. Admin reward / penalty management
app.post("/api/rewards-penalties", async (req, res) => {
  try {
    const db = await readDB();
    const { user_id, type, score, reason, created_by } = req.body;

    if (!user_id || !type || !score || !reason) {
      return res.status(400).json({ error: "Missing required details to submit reward or penalty." });
    }

    const numericScore = Number(score);
    const item: RewardPenalty = {
      id: "rp_" + generateUUID(),
      user_id,
      type: type as IncentiveType,
      score: numericScore,
      reason,
      created_by: created_by || "1",
      created_at: new Date().toISOString()
    };

    db.rewards_penalties.push(item);

    // Add notification
    const recipient = db.users.find((u: any) => u.id === user_id);
    const sender = db.users.find((u: any) => u.id === created_by);
    const senderName = sender ? sender.name : "Admin";

    const formattedAmount = numericScore < 1000 ? (numericScore * 10000).toLocaleString("vi-VN") + "đ" : numericScore.toLocaleString("vi-VN") + "đ";

    db.notifications.unshift({
      id: "not_" + generateUUID(),
      title: type === IncentiveType.REWARD ? "Thưởng tiền mặt mới! 💸" : "Phạt tiền mặt mới! 🛑",
      message: `${senderName} vừa tặng ${type === IncentiveType.REWARD ? "+" : "-"}${formattedAmount} tiền mặt cho ${recipient?.name || "Trader"}. Lý do: ${reason}`,
      type: type === IncentiveType.REWARD ? "success" : "error",
      read: false,
      created_at: new Date().toISOString()
    });

    await writeDB(db);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to add reward/penalty points: " + error.message });
  }
});

// 6.1 Delete a reward / penalty incident
app.delete("/api/rewards-penalties/:id", async (req, res) => {
  try {
    const db = await readDB();
    const itemId = req.params.id;
    
    db.rewards_penalties = (db.rewards_penalties || []).filter((item: any) => item.id !== itemId);
    await writeDB(db);
    res.json({ success: true, message: "Đã xóa bản ghi thưởng phạt thành công." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete reward/penalty point: " + error.message });
  }
});

// 6.2 Get all Regulations (quy chế do người dùng tự thiết lập)
app.get("/api/regulations", async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.regulations || []);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load regulations: " + error.message });
  }
});

// 6.3 Create or Update a Regulation
app.post("/api/regulations", async (req, res) => {
  try {
    const db = await readDB();
    const { id, title, type, amount, description } = req.body;

    if (!title || !type || amount === undefined) {
      return res.status(400).json({ error: "Missing required fields (title, type, amount) to save regulation." });
    }

    if (id) {
      // Edit mode
      const idx = db.regulations.findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        db.regulations[idx] = {
          ...db.regulations[idx],
          title,
          type,
          amount: Number(amount),
          description: description || ""
        };
        await writeDB(db);
        return res.json(db.regulations[idx]);
      }
    }

    // Add mode
    const newReg = {
      id: "reg_" + generateUUID(),
      title,
      type,
      amount: Number(amount),
      description: description || "",
      created_at: new Date().toISOString()
    };
    db.regulations.push(newReg);
    await writeDB(db);
    res.json(newReg);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save regulation: " + error.message });
  }
});

// 6.4 Delete a Regulation
app.delete("/api/regulations/:id", async (req, res) => {
  try {
    const db = await readDB();
    const regId = req.params.id;
    
    db.regulations = (db.regulations || []).filter((r: any) => r.id !== regId);
    await writeDB(db);
    res.json({ success: true, message: "Đã xóa quy chế thành công." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete regulation: " + error.message });
  }
});

// 7. Clear or Read Notifications
app.post("/api/notifications/read", async (req, res) => {
  try {
    const db = await readDB();
    const { id } = req.body;

    if (id) {
      const notification = db.notifications.find((n: any) => n.id === id);
      if (notification) {
        notification.read = true;
      }
    } else {
      db.notifications.forEach((n: any) => {
        n.read = true;
      });
    }

    await writeDB(db);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update notification read state: " + error.message });
  }
});

// 8. Edit / Delete Trades (Admin power)
app.delete("/api/trades/:id", async (req, res) => {
  try {
    const db = await readDB();
    const tradeId = req.params.id;

    const initialLength = db.trades.length;
    db.trades = db.trades.filter((t: any) => t.id !== tradeId);
    
    // Also cleanup mistakes or reviews associated
    db.trade_mistakes = db.trade_mistakes.filter((m: any) => m.trade_id !== tradeId);
    db.accountability_reviews = db.accountability_reviews.filter((r: any) => r.trade_id !== tradeId);

    if (db.trades.length === initialLength) {
      return res.status(404).json({ error: "Trade not found designed to delete." });
    }

    await writeDB(db);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete trade: " + error.message });
  }
});

// 8a. Edit Trade details
app.put("/api/trades/:id", async (req, res) => {
  try {
    const db = await readDB();
    const tradeId = req.params.id;
    const {
      symbol,
      direction,
      entry_price,
      stop_loss,
      take_profit,
      risk_amount,
      setup_name,
      emotion_before_trade,
      result,
      profit_loss,
      notes,
      trade_plan,
      entry_reason
    } = req.body;

    const tradeIndex = db.trades.findIndex((t: any) => t.id === tradeId);
    if (tradeIndex === -1) {
      return res.status(404).json({ error: "Trade not found designed to edit." });
    }

    const prevTrade = db.trades[tradeIndex];
    const updatedTrade = {
      ...prevTrade,
      symbol: symbol !== undefined ? symbol.toUpperCase() : prevTrade.symbol,
      direction: direction !== undefined ? direction : prevTrade.direction,
      entry_price: entry_price !== undefined ? Number(entry_price) : prevTrade.entry_price,
      stop_loss: stop_loss !== undefined ? Number(stop_loss) : prevTrade.stop_loss,
      take_profit: take_profit !== undefined ? Number(take_profit) : prevTrade.take_profit,
      risk_amount: risk_amount !== undefined ? Number(risk_amount) : prevTrade.risk_amount,
      setup_name: setup_name !== undefined ? setup_name : prevTrade.setup_name,
      emotion_before_trade: emotion_before_trade !== undefined ? emotion_before_trade : prevTrade.emotion_before_trade,
      result: result !== undefined ? result : prevTrade.result,
      profit_loss: profit_loss !== undefined ? Number(profit_loss) : prevTrade.profit_loss,
      notes: notes !== undefined ? notes : prevTrade.notes,
      trade_plan: trade_plan !== undefined ? trade_plan : prevTrade.trade_plan,
      entry_reason: entry_reason !== undefined ? entry_reason : prevTrade.entry_reason,
    };

    // Re-sync risk calculation & ratio
    const account = db.trading_accounts.find((a: any) => a.id === updatedTrade.account_id);
    if (account) {
      updatedTrade.risk_percent = Number(((updatedTrade.risk_amount / account.current_balance) * 100).toFixed(2));
    }
    const tpDiff = Math.abs(updatedTrade.take_profit - updatedTrade.entry_price);
    const slDiff = Math.abs(updatedTrade.entry_price - updatedTrade.stop_loss);
    updatedTrade.rr_ratio = slDiff > 0 ? Number((tpDiff / slDiff).toFixed(2)) : 0;

    // Save
    db.trades[tradeIndex] = updatedTrade;
    await writeDB(db);
    res.json(updatedTrade);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to edit trade: " + error.message });
  }
});

// 8b. Add Trading Account
app.post("/api/accounts", async (req, res) => {
  try {
    const db = await readDB();
    const { name, account_type, owner_id, starting_balance, current_balance, daily_drawdown_limit, max_drawdown_limit, status, currency, purchase_price } = req.body;

    if (!name || !account_type || !owner_id || starting_balance === undefined) {
      return res.status(400).json({ error: "Missing required fields for introducing an account." });
    }

    const newAcct: any = {
      id: "acct_" + generateUUID(),
      name,
      account_type,
      owner_id,
      starting_balance: Number(starting_balance),
      current_balance: Number(current_balance !== undefined ? current_balance : starting_balance),
      equity: Number(current_balance !== undefined ? current_balance : starting_balance),
      daily_drawdown_limit: Number(daily_drawdown_limit || 0),
      max_drawdown_limit: Number(max_drawdown_limit || 0),
      status: status || AccountStatus.ACTIVE,
      currency: currency || "USD",
      purchase_price: Number(purchase_price || 0),
      created_at: new Date().toISOString()
    };

    db.trading_accounts.push(newAcct);
    await writeDB(db);
    res.json(newAcct);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to add account: " + error.message });
  }
});

// 8c. Update Trading Account details (including balance reset)
app.put("/api/accounts/:id", async (req, res) => {
  try {
    const db = await readDB();
    const acctId = req.params.id;
    const { name, account_type, owner_id, starting_balance, current_balance, equity, daily_drawdown_limit, max_drawdown_limit, status, currency, purchase_price } = req.body;

    const idx = db.trading_accounts.findIndex((a: any) => a.id === acctId);
    if (idx === -1) {
      return res.status(404).json({ error: "Trading account not found designed to edit." });
    }

    const prev = db.trading_accounts[idx];
    const updated = {
      ...prev,
      name: name !== undefined ? name : prev.name,
      account_type: account_type !== undefined ? account_type : prev.account_type,
      owner_id: owner_id !== undefined ? owner_id : prev.owner_id,
      starting_balance: starting_balance !== undefined ? Number(starting_balance) : prev.starting_balance,
      current_balance: current_balance !== undefined ? Number(current_balance) : prev.current_balance,
      equity: equity !== undefined ? Number(equity) : prev.equity,
      daily_drawdown_limit: daily_drawdown_limit !== undefined ? Number(daily_drawdown_limit) : prev.daily_drawdown_limit,
      max_drawdown_limit: max_drawdown_limit !== undefined ? Number(max_drawdown_limit) : prev.max_drawdown_limit,
      status: status !== undefined ? status : prev.status,
      currency: currency !== undefined ? currency : prev.currency,
      purchase_price: purchase_price !== undefined ? Number(purchase_price) : (prev.purchase_price !== undefined ? prev.purchase_price : 0)
    };

    db.trading_accounts[idx] = updated;
    await writeDB(db);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to edit account: " + error.message });
  }
});

// 8d. Delete Trading Account
app.delete("/api/accounts/:id", async (req, res) => {
  try {
    const db = await readDB();
    const acctId = req.params.id;

    db.trading_accounts = db.trading_accounts.filter((a: any) => a.id !== acctId);
    // clean trades associated with this account
    db.trades = db.trades.filter((t: any) => t.account_id !== acctId);

    await writeDB(db);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete account: " + error.message });
  }
});

// 8e. Add User profile
app.post("/api/users", async (req, res) => {
  try {
    const db = await readDB();
    const { name, email, avatar, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required to introduce a trader profile." });
    }

    const newUser = {
      id: "usr_" + generateUUID(),
      name,
      email,
      avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      role: role || UserRole.TRADER,
      created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    await writeDB(db);
    res.json(newUser);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create user: " + error.message });
  }
});

// 8f. Update User profile details
app.put("/api/users/:id", async (req, res) => {
  try {
    const db = await readDB();
    const userId = req.params.id;
    const { name, email, avatar, role } = req.body;

    const idx = db.users.findIndex((u: any) => u.id === userId);
    if (idx === -1) {
      return res.status(404).json({ error: "User profile not found designed to edit." });
    }

    const prev = db.users[idx];
    const updated = {
      ...prev,
      name: name !== undefined ? name : prev.name,
      email: email !== undefined ? email : prev.email,
      avatar: avatar !== undefined ? avatar : prev.avatar,
      role: role !== undefined ? role : prev.role
    };

    db.users[idx] = updated;
    await writeDB(db);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to edit user profile: " + error.message });
  }
});

// 8g. Delete User profile
app.delete("/api/users/:id", async (req, res) => {
  try {
    const db = await readDB();
    const userId = req.params.id;

    // Prevent deleting primary Admin Hậu
    if (userId === "1") {
      return res.status(400).json({ error: "Không được phép xóa tài khoản của Quản trị viên tối cao Hậu." });
    }

    db.users = db.users.filter((u: any) => u.id !== userId);
    await writeDB(db);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete user profile: " + error.message });
  }
});

// 8h. Delete Accountability Review
app.delete("/api/reviews/:id", async (req, res) => {
  try {
    const db = await readDB();
    const revId = req.params.id;

    db.accountability_reviews = db.accountability_reviews.filter((r: any) => r.id !== revId);
    await writeDB(db);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete accountability evaluation: " + error.message });
  }
});

// 8i. Edit Accountability Review comments
app.put("/api/reviews/:id", async (req, res) => {
  try {
    const db = await readDB();
    const revId = req.params.id;
    const { rating, comment } = req.body;

    const idx = db.accountability_reviews.findIndex((r: any) => r.id === revId);
    if (idx === -1) {
      return res.status(404).json({ error: "Evaluation review not found designed to edit." });
    }

    const prev = db.accountability_reviews[idx];
    const updated = {
      ...prev,
      rating: rating !== undefined ? rating : prev.rating,
      comment: comment !== undefined ? comment : prev.comment
    };

    db.accountability_reviews[idx] = updated;
    await writeDB(db);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to edit review evaluation: " + error.message });
  }
});

// Delete daily journal entry
app.delete("/api/daily-journals/:id", async (req, res) => {
  try {
    const db = await readDB();
    const journalId = req.params.id;

    db.daily_journals = db.daily_journals.filter((j: any) => j.id !== journalId);
    await writeDB(db);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to wipe daily diary: " + error.message });
  }
});

// Update shared fund config (contributed capital)
app.put("/api/shared-fund/config", async (req, res) => {
  try {
    const db = await readDB();
    const { contributed_capital } = req.body;

    if (contributed_capital === undefined || Number(contributed_capital) < 0) {
      return res.status(400).json({ error: "Số vốn góp không hợp lệ." });
    }

    if (!db.shared_fund) {
      db.shared_fund = { balance: 0, currency: "VND", transactions: [] };
    }

    db.shared_fund.contributed_capital = Number(contributed_capital);
    calculateSharedFund(db);

    await writeDB(db);
    res.json(db.shared_fund);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update contributed capital: " + error.message });
  }
});

// 10a. Add transaction to Quỹ Tiền Chung (Shared Fund)
app.post("/api/shared-fund/transactions", async (req, res) => {
  try {
    const db = await readDB();
    const { amount, type, purpose, description, user_id } = req.body;

    if (!amount || !type || !purpose || !user_id) {
      return res.status(400).json({ error: "Thiếu dữ liệu bắt buộc để khởi tạo giao dịch quỹ." });
    }

    if (!db.shared_fund) {
      db.shared_fund = { balance: 0, currency: "VND", transactions: [] };
    }

    const newTx = {
      id: "tx_" + generateUUID() + "_" + Math.floor(Math.random() * 1000),
      amount: Number(amount),
      type,
      purpose,
      description: description || "",
      user_id,
      created_at: new Date().toISOString()
    };

    db.shared_fund.transactions.push(newTx);

    // Recalculate balance
    db.shared_fund.balance = db.shared_fund.transactions.reduce((acc: number, tx: any) => {
      return tx.type === "INFLOW" ? acc + tx.amount : acc - tx.amount;
    }, 0);

    // Create system notification for fund activity
    const user = db.users.find((u: any) => u.id === user_id);
    const amountFormatted = Number(amount).toLocaleString("vi-VN") + " VNĐ";
    const title = type === "INFLOW" ? "Quỹ chung nhận đóng góp" : "Chi tiêu từ quỹ chung";
    const message = `${user ? user.name : "Thành viên"} vừa ${type === "INFLOW" ? "góp nạp" : "chi"} ${amountFormatted} từ Quỹ Tiền Chung. Mục đích: ${purpose}`;
    
    db.notifications.push({
      id: "not_sf_" + Date.now(),
      title,
      message,
      type: type === "INFLOW" ? "success" : "warning",
      read: false,
      created_at: new Date().toISOString()
    });

    await writeDB(db);
    res.json(db.shared_fund);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to post shared-fund transaction: " + error.message });
  }
});

// 10b. Delete transaction from Quỹ Tiền Chung (Shared Fund)
app.delete("/api/shared-fund/transactions/:id", async (req, res) => {
  try {
    const db = await readDB();
    const txId = req.params.id;

    if (!db.shared_fund || !db.shared_fund.transactions) {
      return res.status(404).json({ error: "Dữ liệu Quỹ Tiền Chung trống." });
    }

    db.shared_fund.transactions = db.shared_fund.transactions.filter((t: any) => t.id !== txId);

    // Recalculate balance
    db.shared_fund.balance = db.shared_fund.transactions.reduce((acc: number, tx: any) => {
      return tx.type === "INFLOW" ? acc + tx.amount : acc - tx.amount;
    }, 0);

    await writeDB(db);
    res.json(db.shared_fund);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete shared-fund transaction: " + error.message });
  }
});

/**
 * ----------------- END OF API -----------------
 */

async function startServer() {
  // Vite Middleware Setup
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite HMR middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode with static static routing...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Trade Guardian server running on http://localhost:${PORT}`);
  });
}

startServer();
