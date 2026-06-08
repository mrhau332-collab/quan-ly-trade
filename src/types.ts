/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = "ADMIN",
  TRADER = "TRADER"
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  created_at: string;
}

export enum AccountType {
  FMTO = "FMTO",
  TOPSTEP = "TOPSTEP",
  LIVE = "LIVE"
}

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  FAILED = "FAILED"
}

export interface TradingAccount {
  id: string;
  name: string;
  account_type: AccountType;
  owner_id: string;
  starting_balance: number;
  current_balance: number;
  equity: number;
  daily_drawdown_limit: number;
  max_drawdown_limit: number;
  status: AccountStatus;
  created_at: string;
  currency: string; // e.g. "USD" or "VND"
  purchase_price?: number; // In VND, representing cost paid to buy this account
}

export enum TradeDirection {
  BUY = "BUY",
  SELL = "SELL"
}

export enum TradeEmotion {
  CONFIDENT = "CONFIDENT",
  NEUTRAL = "NEUTRAL",
  FEAR = "FEAR",
  FOMO = "FOMO"
}

export enum TradeResult {
  WIN = "WIN",
  LOSS = "LOSS",
  BE = "BE",
  OPEN = "OPEN"
}

export interface Trade {
  id: string;
  account_id: string;
  user_id: string;
  symbol: string;
  direction: TradeDirection;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  risk_amount: number;
  risk_percent: number;
  rr_ratio: number;
  setup_name: string;
  trade_plan: string;
  entry_reason: string;
  emotion_before_trade: TradeEmotion;
  opened_at: string;
  closed_at: string | null;
  result: TradeResult;
  profit_loss: number;
  profit_loss_percent: number;
  screenshot_before: string;
  screenshot_after: string;
  notes: string;
  created_at: string;
}

export enum MistakeType {
  FOMO = "FOMO",
  REVENGE_TRADE = "REVENGE_TRADE",
  OVERTRADING = "OVERTRADING",
  NO_STOP_LOSS = "NO_STOP_LOSS",
  MOVE_STOP_LOSS = "MOVE_STOP_LOSS",
  EARLY_EXIT = "EARLY_EXIT",
  LATE_EXIT = "LATE_EXIT",
  OVERSIZED_POSITION = "OVERSIZED_POSITION",
  IMPULSIVE_ENTRY = "IMPULSIVE_ENTRY",
  NO_PLAN = "NO_PLAN"
}

export enum MistakeSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

export interface TradeMistake {
  id: string;
  trade_id: string;
  user_id: string;
  mistake_type: MistakeType;
  description: string;
  severity: MistakeSeverity;
  penalty_score: number;
  created_at: string;
}

export enum IncentiveType {
  REWARD = "REWARD",
  PENALTY = "PENALTY"
}

export interface Regulation {
  id: string;
  title: string;
  type: IncentiveType;
  amount: number;
  description: string;
  created_at: string;
}

export interface RewardPenalty {
  id: string;
  user_id: string;
  type: IncentiveType;
  score: number;
  reason: string;
  created_by: string;
  created_at: string;
}

export enum ReviewRating {
  PASS = "PASS",
  WARNING = "WARNING",
  FAIL = "FAIL"
}

export interface AccountabilityReview {
  id: string;
  trade_id: string;
  reviewer_id: string;
  target_user_id: string;
  rating: ReviewRating;
  comment: string;
  created_at: string;
}

export interface DailyJournal {
  id: string;
  user_id: string;
  date: string;
  market_condition: string;
  emotion: string;
  what_went_well: string;
  what_went_wrong: string;
  lessons: string;
  tomorrow_plan: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}

export interface SharedFundTransaction {
  id: string;
  amount: number;
  type: "INFLOW" | "OUTFLOW";
  purpose: string;
  description: string;
  user_id: string;
  created_at: string;
}

export interface SharedFund {
  balance: number;
  currency: string;
  contributed_capital?: number;
  transactions: SharedFundTransaction[];
}

