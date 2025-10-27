export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
}

export interface ProfitHistoryItem {
  date: string;
  amount: number;
  type: 'Daily Profit' | 'Referral Bonus' | 'Rank Bonus';
  description: string;
}

export interface ReferredUser {
  id: string;
  name: string;
  joinDate: string;
  status: 'Active' | 'Pending';
  balance: number;
}

export interface CommissionHistoryItem {
  date: string;
  fromUser: string;
  level: number;
  amount: number;
}

export interface TeamMember {
  id: string;
  name: string;
  joinDate: string;
  status: 'Active' | 'Pending';
  investment: number;
  level?: number;
  directCount?: number;
  indirectCount?: number;
}

export interface User {
  id:string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  referralCode: string;
  referralLink?: string;
  referredBy?: string;
  walletBalance: number;
  totalInvested: number;
  teamSize: number;
  teamInvested: number;
  totalWithdrawal: number;
  mxgnTokens: number;
  dailyProfit: number;
  totalProfit: number;
  profitHistory: ProfitHistoryItem[];
  referredUsers: ReferredUser[];
  commissionHistory: CommissionHistoryItem[];
  team: TeamMember[];
  joinDate: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  transactionId: string;
  screenshot: string; // URL or base64 string
  status: RequestStatus;
  date: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  userWalletBalance?: number;
  amount: number;
  receivedAmount: number;
  walletName: string;
  walletAddress: string;
  network: string;
  status: RequestStatus;
  date: string;
}

export interface TeamLevel {
  level: number;
  totalMembers: number;
  activeMembers: number;
  investedAmount: number;
}

export interface Rank {
  name: string;
  directBusiness: number;
  teamBusiness: number;
  reward: number;
}

export interface Notification {
  id: string;
  userId?: string;
  title: string;
  content: string;
  date: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface DailyClaim {
  eligible: boolean;
  amount: number;
  nextClaimAt: string;
}

export interface MonthlyReward {
  month: string;
  totalInvestment: number;
  teamInvestment: number;
  achievedTier: string;
  rewardAmount: number;
  isClaimed: boolean;
  progressSum: number;
}