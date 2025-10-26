import React from 'react';
import { User, DepositRequest, Notification, WithdrawalRequest, RequestStatus } from '../../types';
import Button from '../../components/Button';
import AdminDashboard from './AdminDashboard';
import AllUsersPage from './AllUsersPage';
import DepositRequestsPage from './DepositRequestsPage';
import NotificationsPage from './NotificationsPage';
import WithdrawRequestsPage from './WithdrawRequestsPage';

interface AdminAppProps {
  user: User;
  users: User[];
  requests: DepositRequest[];
  withdrawalRequests: WithdrawalRequest[];
  notifications: Notification[];
  // FIX: Updated function signatures to return Promise<void> to match async handlers.
  onUpdateRequestStatus: (id: string, status: 'approved' | 'declined', data?: { reason: string }) => Promise<void>;
  onUpdateWithdrawalRequestStatus: (id: string, status: 'approved' | 'declined', data?: { reason: string }) => Promise<void>;
  onAddNotification: (data: { title: string; content: string; userId?: string }) => void;
  onUpdateNotification: (notification: Notification) => void;
  onDeleteNotification: (id: string) => void;
  onLogout: () => void;
}

type AdminPage = 'dashboard' | 'users' | 'deposits' | 'withdrawals' | 'notifications';
type UserFilter = 'all' | 'active' | 'inactive';
type RequestFilter = 'all' | RequestStatus;

const Icon = ({ path, className }: { path: string, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

const AdminApp: React.FC<AdminAppProps> = ({ 
    user, 
    users, 
    requests, 
    withdrawalRequests,
    onUpdateRequestStatus, 
    onUpdateWithdrawalRequestStatus,
    onLogout,
    notifications,
    onAddNotification,
    onUpdateNotification,
    onDeleteNotification,
}) => {
  const [currentPage, setCurrentPage] = React.useState<AdminPage>('dashboard');
  const [initialUserFilter, setInitialUserFilter] = React.useState<UserFilter>('all');
  const [initialDepositFilter, setInitialDepositFilter] = React.useState<RequestFilter>('all');
  const [initialWithdrawalFilter, setInitialWithdrawalFilter] = React.useState<RequestFilter>('all');

  const handleNavigation = (page: AdminPage, filter?: UserFilter | RequestFilter) => {
    switch (page) {
      case 'users':
        setInitialUserFilter(filter as UserFilter || 'all');
        break;
      case 'deposits':
        setInitialDepositFilter(filter as RequestFilter || 'all');
        break;
      case 'withdrawals':
        setInitialWithdrawalFilter(filter as RequestFilter || 'all');
        break;
    }
    setCurrentPage(page);
  };

  const navItems: { id: AdminPage; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Icon path="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> },
    { id: 'users', label: 'All Users', icon: <Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1-3.72a4 4 0 00-3-3.72m-3 3.72a4 4 0 00-3 3.72M3 21v-1a6 6 0 016-6m-6 6h12M15 21a6 6 0 00-6-6m6 6v-1a6 6 0 01-6-6" /> },
    { id: 'deposits', label: 'Deposits', icon: <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
    { id: 'withdrawals', label: 'Withdrawals', icon: <Icon path="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /> },
    { id: 'notifications', label: 'Notifications', icon: <Icon path="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard requests={requests} withdrawalRequests={withdrawalRequests} users={users} onNavigate={handleNavigation} />;
      case 'users':
        return <AllUsersPage users={users} initialFilter={initialUserFilter} />;
      case 'deposits':
        return <DepositRequestsPage users={users} onUpdateRequestStatus={onUpdateRequestStatus} onAddNotification={onAddNotification} initialFilter={initialDepositFilter} />;
      case 'withdrawals':
        return <WithdrawRequestsPage requests={withdrawalRequests} users={users} onUpdateRequestStatus={onUpdateWithdrawalRequestStatus} onAddNotification={onAddNotification} initialFilter={initialWithdrawalFilter} />;
      case 'notifications':
        return <NotificationsPage 
            notifications={notifications}
            onAdd={onAddNotification}
            onUpdate={onUpdateNotification}
            onDelete={onDeleteNotification}
        />
      default:
        return <AdminDashboard requests={requests} withdrawalRequests={withdrawalRequests} users={users} onNavigate={handleNavigation} />;
    }
  };


  return (
    <div className="min-h-screen bg-brand-dark pb-20 md:pb-0">
      <header className="bg-brand-surface border-b border-gray-700">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-xl text-white">FIN2X <span className="text-brand-orange">Admin</span></span>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        currentPage === item.id
                          ? 'bg-brand-orange text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-300 mr-4">Welcome, {user.firstName}</span>
              <Button onClick={onLogout} variant="secondary">Logout</Button>
            </div>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-brand-surface border-t border-gray-700">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
            {navItems.map(item => (
                <button 
                    key={item.id}
                    onClick={() => handleNavigation(item.id)} 
                    type="button" 
                    className="inline-flex flex-col items-center justify-center font-medium px-2 group focus:outline-none"
                    aria-current={currentPage === item.id ? 'page' : undefined}
                >
                    <div className={`${currentPage === item.id ? 'text-brand-orange' : 'text-gray-400 group-hover:text-white'}`}>
                        {item.icon}
                    </div>
                    <span className={`text-xs ${currentPage === item.id ? 'text-brand-orange' : 'text-gray-400 group-hover:text-white'}`}>
                        {item.label}
                    </span>
                </button>
            ))}
        </div>
      </nav>
    </div>
  );
};

export default AdminApp;
