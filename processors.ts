import { User, UserRole, DepositRequest, RequestStatus, Notification, WithdrawalRequest, DailyClaim, MonthlyReward, ProfitHistoryItem, ReferredUser } from './types';
import { BACKEND_URL } from './constants';

export const formatDate = (dateString?: string): string => {
  const date = dateString ? new Date(dateString) : new Date();
  // Using en-CA locale provides a YYYY-MM-DD format which is great for sorting and consistency.
  return date.toLocaleDateString('en-CA'); 
};

export const processUser = (userFromApi: any): User => {
    // This function provides defaults and maps API fields (like `_id`, `balance`, `createdAt`)
    // to our frontend User model to prevent undefined errors.
    return {
      id: userFromApi._id || userFromApi.id || '',
      firstName: userFromApi.firstName || '',
      lastName: userFromApi.lastName || '',
      email: userFromApi.email || '',
      phone: userFromApi.phone || '',
      role: userFromApi.role || UserRole.USER,
      referralCode: userFromApi.referralCode || (userFromApi.email ? userFromApi.email.split('@')[0] : ''),
      referralLink: userFromApi.referralLink,
      referredBy: userFromApi.referredBy,
      // FIX: Added 'ballence' as a possible field from the API to correctly parse the user's balance.
      walletBalance: userFromApi.ballence ?? userFromApi.balance ?? userFromApi.walletBalance ?? 0,
      totalInvested: userFromApi.totalInvested ?? 0,
      teamSize: userFromApi.teamCount ?? userFromApi.teamSize ?? 0,
      teamInvested: userFromApi.teamInvested ?? 0,
      totalWithdrawal: userFromApi.totalWithdrawal ?? 0,
      mxgnTokens: userFromApi.mxgnTokens ?? 0,
      dailyProfit: userFromApi.dailyProfit ?? 0,
      totalProfit: userFromApi.totalProfit ?? 0,
      profitHistory: userFromApi.profitHistory || [],
      referredUsers: userFromApi.referredUsers || [],
      commissionHistory: userFromApi.commissionHistory || [],
      team: userFromApi.team || [],
      joinDate: formatDate(userFromApi.createdAt),
    };
  };

  export const processDepositRequest = (reqFromApi: any): DepositRequest => {
    const screenshotPath = reqFromApi.screenshotUrl || reqFromApi.screenshot || '';
    const userId = typeof reqFromApi.user === 'object' && reqFromApi.user !== null ? reqFromApi.user._id : reqFromApi.user;
    const userEmail = typeof reqFromApi.user === 'object' && reqFromApi.user !== null ? reqFromApi.user.email : reqFromApi.userEmail;

    return {
        id: reqFromApi._id || reqFromApi.id,
        userId: userId || '',
        userEmail: userEmail || 'N/A',
        amount: reqFromApi.amount ?? 0,
        transactionId: reqFromApi.transactionId || 'N/A',
        screenshot: screenshotPath ? (screenshotPath.startsWith('http') ? screenshotPath : `${BACKEND_URL}${screenshotPath}`) : '',
        status: (reqFromApi.status ? reqFromApi.status.toLowerCase() : RequestStatus.PENDING) as RequestStatus,
        date: formatDate(reqFromApi.createdAt),
    };
  };

  export const processWithdrawalRequest = (reqFromApi: any): WithdrawalRequest => {
    let userId = '', userEmail = 'N/A', userName: string | undefined = undefined, userWalletBalance: number | undefined = undefined;

    if (typeof reqFromApi.user === 'object' && reqFromApi.user !== null) {
        userId = reqFromApi.user._id || '';
        userEmail = reqFromApi.user.email || 'N/A';
        userName = `${reqFromApi.user.firstName || ''} ${reqFromApi.user.lastName || ''}`.trim() || undefined;
        userWalletBalance = reqFromApi.user.balance ?? undefined;
    } else if (reqFromApi.user) {
        userId = reqFromApi.user;
    }

    return {
      id: reqFromApi._id || reqFromApi.id,
      userId: userId,
      userEmail: userEmail || 'N/A',
      userName,
      userWalletBalance,
      amount: reqFromApi.amount ?? 0,
      receivedAmount: reqFromApi.receivable ?? reqFromApi.recived_amount ?? reqFromApi.receivedAmount ?? 0,
      walletName: reqFromApi.walletName || 'N/A',
      walletAddress: reqFromApi.walletAddress || reqFromApi.destinationAddress || 'N/A',
      network: reqFromApi.network || 'N/A',
      status: (reqFromApi.status ? reqFromApi.status.toLowerCase() : RequestStatus.PENDING) as RequestStatus,
      date: formatDate(reqFromApi.createdAt),
    };
  };

  export const processReferredUser = (userFromApi: any): ReferredUser => ({
    id: userFromApi._id || userFromApi.id,
    name: `${userFromApi.firstName || ''} ${userFromApi.lastName || ''}`.trim(),
    joinDate: formatDate(userFromApi.createdAt),
    status: (userFromApi.balance ?? 0) > 0 ? 'Active' : 'Pending',
    balance: userFromApi.balance ?? 0,
  });

  export const processNotification = (notifFromApi: any): Notification => ({
    id: notifFromApi._id || notifFromApi.id,
    userId: notifFromApi.user,
    title: notifFromApi.title || '',
    content: notifFromApi.message || notifFromApi.content || '',
    date: formatDate(notifFromApi.createdAt),
  });

  export const processDashboardData = (data: any) => {
    const processedUser = processUser({
      ...(data.user || {}),
      referralCode: data.referral?.code,
      referralLink: data.referral?.link,
      dailyProfit: data.earningsSummary?.todaysProfit,
      totalProfit: data.earningsSummary?.totalProfit,
      totalWithdrawal: data.networkStats?.withdrawal,
      teamSize: data.networkStats?.teamSize,
      totalInvested: data.networkStats?.investment,
      teamInvested: data.monthlyReward?.teamInvestment,
      profitHistory: (data.profitHistory || []).map((p: any): ProfitHistoryItem => ({
        amount: p.amount,
        description: p.description,
        type: p.type,
        date: formatDate(p.createdAt),
      })),
    });
  
    const notifications = (data.notifications || []).map(processNotification);
  
    const dailyClaim: DailyClaim = {
      eligible: data.dailyClaim?.eligible ?? false,
      amount: data.dailyClaim?.amount ?? 0,
      nextClaimAt: data.dailyClaim?.nextClaimAt || new Date().toISOString(),
    };
  
    const monthlyReward: MonthlyReward = {
      month: data.monthlyReward?.month || '',
      totalInvestment: data.monthlyReward?.totalInvestment ?? 0,
      teamInvestment: data.monthlyReward?.teamInvestment ?? 0,
      achievedTier: data.monthlyReward?.achievedTier || 'None',
      rewardAmount: data.monthlyReward?.rewardAmount ?? 0,
      isClaimed: data.monthlyReward?.isClaimed ?? false,
      progressSum: data.monthlyReward?.progressSum ?? 0,
    };
  
    return { user: processedUser, notifications, dailyClaim, monthlyReward };
  };