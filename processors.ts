import { User, UserRole, DepositRequest, RequestStatus, Notification, WithdrawalRequest } from './types';
import { BACKEND_URL } from './constants';

const formatDate = (dateString?: string): string => {
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
      referredBy: userFromApi.referredBy,
      // FIX: Added 'ballence' as a possible field from the API to correctly parse the user's balance.
      walletBalance: userFromApi.ballence ?? userFromApi.balance ?? userFromApi.walletBalance ?? 0,
      totalInvested: userFromApi.totalInvested ?? 0,
      teamSize: userFromApi.teamSize ?? 0,
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

  export const processWithdrawalRequest = (reqFromApi: any): WithdrawalRequest => ({
    id: reqFromApi._id || reqFromApi.id,
    userId: reqFromApi.user || '',
    userEmail: reqFromApi.userEmail || 'N/A',
    amount: reqFromApi.amount ?? 0,
    walletName: reqFromApi.walletName || 'N/A',
    walletAddress: reqFromApi.walletAddress || 'N/A',
    network: reqFromApi.network || 'N/A',
    status: (reqFromApi.status ? reqFromApi.status.toLowerCase() : RequestStatus.PENDING) as RequestStatus,
    date: formatDate(reqFromApi.createdAt),
  });

  export const processNotification = (notifFromApi: any): Notification => ({
    id: notifFromApi._id || notifFromApi.id,
    userId: notifFromApi.user,
    title: notifFromApi.title || '',
    content: notifFromApi.message || notifFromApi.content || '',
    date: formatDate(notifFromApi.createdAt),
  });