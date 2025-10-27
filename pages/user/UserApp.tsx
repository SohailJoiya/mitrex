import React from 'react';
import { User, Notification, DailyClaim, MonthlyReward } from '../../types';
import Button from '../../components/Button';
import UserDashboard from './UserDashboard';
import DepositPage from './DepositPage';
import WithdrawPage from './WithdrawPage';
import TeamPage from './TeamPage';
import RanksAndRewardsPage from './RanksAndRewardsPage';
import AboutUsPage from './AboutUsPage'; // Changed from RoadmapPage
import ProfilePage from './ProfilePage';
import ReferralsPage from './ReferralsPage';
import InvestmentPage from './InvestmentPage';
import NotificationModal from '../../components/NotificationModal';
import api from '../../services/api';
import Icon from '../../components/Icon';
import TeamLevelsPage from './TeamLevelsPage';

interface UserAppProps {
  user: User;
  onLogout: () => void;
  // FIX: Updated onUpdateUser to return a Promise<void> to match the async handler.
  onUpdateUser: (updatedData: Pick<User, 'firstName' | 'lastName' | 'email' | 'phone'>) => Promise<void>;
  notifications: Notification[];
  onAddWithdrawalRequest: (data: { amount: number; walletAddress: string; walletName: string; network: string; }) => Promise<void>;
  onNotificationRead: (notificationId: string) => void;
  dailyClaim: DailyClaim | null;
  monthlyReward: MonthlyReward | null;
  onRefetchData: () => Promise<void>;
}

type UserPage = 'dashboard' | 'deposit' | 'withdraw' | 'investment' | 'team' | 'team-levels' | 'referrals' | 'ranks' | 'about-us' | 'profile';

const UserApp: React.FC<UserAppProps> = ({ user, onLogout, onUpdateUser, notifications, onAddWithdrawalRequest, onNotificationRead, dailyClaim, monthlyReward, onRefetchData }) => {
  const [currentPage, setCurrentPage] = React.useState<UserPage>('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null);
  const notificationButtonRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        // Fix: Corrected the ref name from `notificationButton` to `notificationButtonRef`.
        if (notificationButtonRef.current && !notificationButtonRef.current.contains(event.target as Node)) {
            setIsNotificationsOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    setIsNotificationsOpen(false); // Close dropdown when modal opens

    // Only attempt to mark as read if it's a user-specific notification.
    // Global notifications (without a userId) are just dismissed from the view.
    if (notification.userId) {
      try {
        // FIX: Changed from PATCH to POST to align with the expected API endpoint.
        await api.post(`/api/notifications/${notification.id}/read`, {});
        onNotificationRead(notification.id);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    } else {
      // For global notifications, just remove them from the UI for this session.
      onNotificationRead(notification.id);
    }
  };

  const navItems: { id: UserPage; label: string; mobileLabel: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', mobileLabel: 'Dashboard', icon: <Icon path="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> },
    { id: 'deposit', label: 'Deposit', mobileLabel: 'Deposit', icon: <Icon path="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /> },
    { id: 'withdraw', label: 'Withdraw', mobileLabel: 'Withdraw', icon: <Icon path="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /> },
    { id: 'investment', label: 'Invest', mobileLabel: 'Invest', icon: <Icon path="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125-1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125h.375m18 3.75h.75a.75.75 0 00.75-.75v-.75m0 0h-.75a.75.75 0 00-.75.75v.75m-7.5-3v4.5m-4.5-4.5v4.5m1.5.75h1.5m-1.5-1.5h1.5m-1.5-1.5h1.5m3-3h1.5m-1.5-1.5h1.5m-1.5-1.5h1.5" /> },
    { id: 'team', label: 'My Team', mobileLabel: 'Team', icon: <Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1-3.72a4 4 0 00-3-3.72m-3 3.72a4 4 0 00-3 3.72M3 21v-1a6 6 0 016-6m-6 6h12M15 21a6 6 0 00-6-6m6 6v-1a6 6 0 01-6-6" /> },
    { id: 'team-levels', label: 'Team Levels', mobileLabel: 'Levels', icon: <Icon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
    { id: 'referrals', label: 'My Referrals', mobileLabel: 'Referrals', icon: <Icon path="M11 15a4 4 0 100-8 4 4 0 000 8zM11 21a9 9 0 100-18 9 9 0 000 18zM21 21v-2a4 4 0 00-4-4H13" /> },
    { id: 'ranks', label: 'Monthly Rewards', mobileLabel: 'Rewards', icon: <Icon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
    { id: 'about-us', label: 'About Us', mobileLabel: 'About', icon: <Icon path="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> }, // Changed from roadmap
    { id: 'profile', label: 'My Profile', mobileLabel: 'Profile', icon: <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <UserDashboard user={user} onNavigate={setCurrentPage} dailyClaim={dailyClaim} onClaimSuccess={onRefetchData} />;
      case 'deposit':
        return <DepositPage onNavigate={setCurrentPage} />;
      case 'withdraw':
        return <WithdrawPage onAddRequest={onAddWithdrawalRequest} walletBalance={user.walletBalance} onNavigate={setCurrentPage} />;
      case 'investment':
        return <InvestmentPage />;
      case 'team':
        return <TeamPage user={user} />;
      case 'team-levels':
        return <TeamLevelsPage />;
      case 'referrals':
        return <ReferralsPage user={user} />;
      case 'ranks':
        return <RanksAndRewardsPage user={user} />;
      case 'about-us': // Changed from roadmap
        return <AboutUsPage />;
      case 'profile':
        return <ProfilePage user={user} onUpdate={onUpdateUser} />;
      default:
        return <UserDashboard user={user} onNavigate={setCurrentPage} dailyClaim={dailyClaim} onClaimSuccess={onRefetchData} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark pb-20 md:pb-0">
      <header className="bg-brand-surface/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <button onClick={() => setCurrentPage('dashboard')} className="font-bold text-2xl text-white focus:outline-none transition-opacity hover:opacity-80">FAEARING</button>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        currentPage === item.id
                          ? 'bg-brand-orange text-white'
                          : 'text-brand-gray hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={notificationButtonRef}>
                <button 
                  onClick={() => setIsNotificationsOpen(prev => !prev)}
                  className="p-2 rounded-full text-brand-gray hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-orange"
                  aria-label="View notifications"
                >
                  <Icon path="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-brand-orange ring-2 ring-brand-surface"></span>
                  )}
                </button>
                {isNotificationsOpen && (
                  <div className="origin-top-right absolute right-4 md:right-0 mt-2 w-80 rounded-xl shadow-lg bg-brand-surface ring-1 ring-white/10 focus:outline-none z-10 border border-white/10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-semibold text-white">Notifications</p>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(notif => (
                           <button 
                            key={notif.id} 
                            onClick={() => handleNotificationClick(notif)}
                            className="w-full text-left block px-4 py-3 text-sm text-brand-gray border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <p className="font-bold text-white">{notif.title}</p>
                            <p className="mt-1 truncate">{notif.content}</p>
                            <p className="text-xs text-gray-500 mt-2">{notif.date}</p>
                          </button>
                        )) : (
                          <div className="px-4 py-5 text-center text-sm text-gray-500">
                            No new notifications.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
                <span className="text-brand-gray hidden sm:block">Welcome, {user.firstName}</span>
                <Button onClick={onLogout} variant="secondary">Logout</Button>
            </div>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-brand-surface/80 backdrop-blur-lg border-t border-white/10 overflow-x-auto">
        <div className="flex h-full mx-auto">
            {navItems.map(item => (
                <button 
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)} 
                    type="button" 
                    className="flex-shrink-0 inline-flex flex-col items-center justify-center font-medium w-20 group focus:outline-none"
                    aria-current={currentPage === item.id ? 'page' : undefined}
                >
                    <div className={`${currentPage === item.id ? 'text-brand-orange' : 'text-gray-400 group-hover:text-white'}`}>
                        {item.icon}
                    </div>
                    <span className={`text-xs text-center ${currentPage === item.id ? 'text-brand-orange' : 'text-gray-400 group-hover:text-white'}`}>
                        {item.mobileLabel}
                    </span>
                </button>
            ))}
        </div>
      </nav>
      
      {selectedNotification && (
        <NotificationModal 
            notification={selectedNotification} 
            onClose={() => setSelectedNotification(null)} 
        />
      )}
    </div>
  );
};


export default UserApp;