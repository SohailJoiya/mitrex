import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, DepositRequest, RequestStatus, Notification, WithdrawalRequest, LoginResponse, DailyClaim, MonthlyReward } from '../../types';
import LandingPage from '../LandingPage';
import LoginPage from '../LoginPage';
import SignupPage from '../SignupPage';
import UserApp from '../user/UserApp';
import AdminApp from './AdminApp';
import ForgotPasswordPage from '../ForgotPasswordPage';
import OtpVerificationPage from '../OtpVerificationPage';
import ResetPasswordPage from '../ResetPasswordPage';
import api from '../../services/api';
import { processUser, processDepositRequest, processWithdrawalRequest, processNotification, processDashboardData } from '../../processors';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appIsLoading, setAppIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'signup' | 'otp-verification' | 'forgot-password' | 'reset-password'>('landing');
  const [otpPurpose, setOtpPurpose] = useState<'signup' | 'reset-password'>('signup');
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [referralCodeFromUrl, setReferralCodeFromUrl] = useState<string | null>(null);
  const [dailyClaim, setDailyClaim] = useState<DailyClaim | null>(null);
  const [monthlyReward, setMonthlyReward] = useState<MonthlyReward | null>(null);

  const refetchDashboardData = async () => {
    try {
        const dashboardData: any = await api.get('/api/dashboard');
        const { user, notifications, dailyClaim, monthlyReward } = processDashboardData(dashboardData);
        setCurrentUser(user);
        setNotifications(notifications);
        setDailyClaim(dailyClaim);
        setMonthlyReward(monthlyReward);
    } catch (error) {
         console.error("Failed to refetch dashboard data:", error);
    }
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userProfile = await api.get<any>('/api/users/me');
          setCurrentUser(processUser(userProfile));
        } catch (error) {
          console.error("Session check failed:", error);
          localStorage.removeItem('authToken');
        }
      }
      setAppIsLoading(false);
    };

    checkUserStatus();

    const pathParts = window.location.pathname.split('/');
    if (pathParts[1] === 'ref' && pathParts[2]) {
      const code = decodeURIComponent(pathParts[2]);
      setReferralCodeFromUrl(code);
      setCurrentPage(prev => (prev === 'landing' ? 'signup' : prev));
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
        if (currentUser.role === UserRole.ADMIN) {
            try {
                const [usersResponse, depositsResponse, withdrawalsResponse, notificationsResponse]: any[] = await Promise.all([
                    api.get('/api/admin/users'),
                    api.get('/api/admin/deposits'),
                    api.get('/api/admin/withdrawals'),
                    api.get('/api/admin/notifications'),
                ]);
                const processedUsers = (usersResponse.results || []).map(processUser);
                setUsers(processedUsers);
                setDepositRequests((depositsResponse.results || []).map(processDepositRequest));
                setWithdrawalRequests((withdrawalsResponse.results || []).map(processWithdrawalRequest));
                setNotifications((notificationsResponse.results || []).map(processNotification));
            } catch (error) {
                console.error("Failed to fetch admin data:", error);
                setUsers([]);
                setDepositRequests([]);
                setWithdrawalRequests([]);
                setNotifications([]);
            }
        } else if (currentUser.role === UserRole.USER) {
          await refetchDashboardData();
        }
    };
    
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);


  const userNotifications = useMemo(() => {
    if (currentUser && currentUser.role === UserRole.USER) {
      return notifications.filter(n => !n.userId || n.userId === currentUser.id);
    }
    return [];
  }, [notifications, currentUser]);
  
  const handleLogin = async (credentials: {email: string, password: string}) => {
    const response = await api.post<LoginResponse>('/api/auth/login', credentials, true);
    localStorage.setItem('authToken', response.token);
    setCurrentUser(processUser(response.user));
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setCurrentPage('landing');
  };
  
  const handleSignup = async (signupData: object) => {
    const { phone, referredBy, ...rest }: any = signupData;
    const payload = { ...rest, referralCode: referredBy || '' };
    await api.post('/api/users/register', payload, true);
    setCurrentPage('login');
  };

  const handleSendOtp = () => {
    setOtpPurpose('reset-password');
    setCurrentPage('otp-verification');
  };

  const handleOtpVerification = () => {
    if (otpPurpose === 'signup') {
      setCurrentPage('login');
    } else {
      setCurrentPage('reset-password');
    }
  };

  const handlePasswordReset = () => {
    setCurrentPage('login');
  };

  const updateRequestStatus = async (id: string, status: 'approved' | 'declined', data?: { reason: string }) => {
    try {
        if (status === 'approved') {
            await api.put(`/api/admin/transactions/deposits/${id}/approve`);
        } else {
            await api.put(`/api/admin/transactions/deposits/${id}/decline`, { reason: data?.reason });
        }
        setDepositRequests(prev => 
            prev.map(req => 
                req.id === id ? { ...req, status: status === 'approved' ? RequestStatus.APPROVED : RequestStatus.DECLINED } : req
            )
        );
    } catch (error) {
        console.error(`Failed to update deposit status for ${id}`, error);
        // Consider showing an error toast to the admin
    }
  };

  const addWithdrawalRequest = async (data: { amount: number; walletAddress: string; walletName: string; network: string; }) => {
    if (!currentUser) return;
    const payload = { 
      amount: data.amount, 
      destinationAddress: data.walletAddress, 
      walletName: data.walletName, 
      network: data.network 
    };
    await api.post<any>('/api/withdrawals', payload);
  };

  const updateWithdrawalRequestStatus = async (id: string, status: 'approved' | 'declined', data?: { reason: string }) => {
    try {
        if (status === 'approved') {
            await api.put(`/api/admin/transactions/withdrawals/${id}/approve`);
        } else {
            await api.put(`/api/admin/transactions/withdrawals/${id}/decline`, { reason: data?.reason });
        }
        setWithdrawalRequests(prev =>
            prev.map(req =>
                req.id === id ? { ...req, status: status === 'approved' ? RequestStatus.APPROVED : RequestStatus.DECLINED } : req
            )
        );
    } catch (error) {
        console.error(`Failed to update withdrawal status for ${id}`, error);
    }
  };

  const handleUpdateUser = async (updatedData: Pick<User, 'firstName' | 'lastName' | 'email' | 'phone'>) => {
    const { email, ...payload } = updatedData;
    const updatedUserFromApi = await api.put<any>('/api/users/me', payload);
    // Merging with previous state is safer in case the API returns a partial object.
    // processUser ensures the final object is clean and has all required fields.
    setCurrentUser(prev => prev ? processUser({ ...prev, ...updatedUserFromApi }) : null);
  };
  
  const addNotification = async (data: { title: string; content: string; userId?: string }) => {
    const payload = { title: data.title, message: data.content, userId: data.userId };
    let newNotificationFromApi: any;

    if (payload.userId) {
        newNotificationFromApi = await api.post('/api/notifications/admin/user', payload);
    } else {
        newNotificationFromApi = await api.post('/api/notifications/admin/global', { title: payload.title, message: payload.message });
    }
    setNotifications(prev => [processNotification(newNotificationFromApi), ...prev]);
  };

  const updateNotification = async (updatedNotification: Notification) => {
    const payload = { title: updatedNotification.title, message: updatedNotification.content };
    await api.put(`/api/admin/notifications/${updatedNotification.id}`, payload);
    setNotifications(prev => 
      prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
    );
  };

  const deleteNotification = async (id: string) => {
    await api.delete(`/api/admin/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const handleNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  if (appIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigate={setCurrentPage} />;
      case 'signup':
        return <SignupPage onSignup={handleSignup} onNavigate={setCurrentPage} referralCode={referralCodeFromUrl} />;
      case 'forgot-password':
        return <ForgotPasswordPage onSendOtp={handleSendOtp} onNavigate={setCurrentPage} />;
      case 'otp-verification':
        return <OtpVerificationPage onVerify={handleOtpVerification} purpose={otpPurpose} />;
      case 'reset-password':
        return <ResetPasswordPage onReset={handlePasswordReset} />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  }

  if (currentUser.role === UserRole.ADMIN) {
    return <AdminApp 
        user={currentUser} 
        users={users} 
        requests={depositRequests} 
        withdrawalRequests={withdrawalRequests}
        onUpdateRequestStatus={updateRequestStatus} 
        onUpdateWithdrawalRequestStatus={updateWithdrawalRequestStatus}
        onLogout={handleLogout}
        notifications={notifications}
        onAddNotification={addNotification}
        onUpdateNotification={updateNotification}
        onDeleteNotification={deleteNotification} 
    />;
  }

  return <UserApp 
    user={currentUser} 
    onLogout={handleLogout} 
    onUpdateUser={handleUpdateUser}
    notifications={userNotifications}
    onAddWithdrawalRequest={addWithdrawalRequest}
    onNotificationRead={handleNotificationRead}
    dailyClaim={dailyClaim}
    monthlyReward={monthlyReward}
    onRefetchData={refetchDashboardData}
  />;
};

export default App;
