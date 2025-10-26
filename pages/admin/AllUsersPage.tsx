import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import Card from '../../components/Card';

interface AllUsersPageProps {
  users: User[];
  initialFilter?: 'all' | 'active' | 'inactive';
}

type UserFilter = 'all' | 'active' | 'inactive';

const AllUsersPage: React.FC<AllUsersPageProps> = ({ users, initialFilter = 'all' }) => {
  const [filter, setFilter] = useState<UserFilter>(initialFilter);
  /**
   * Calculates a user's level based on their total investment.
   * This provides a simple progression metric for the admin view.
   */
  const getUserLevel = (totalInvested: number): number => {
    if (totalInvested >= 30000) return 4;
    if (totalInvested >= 10000) return 3;
    if (totalInvested >= 5000) return 2;
    return 1;
  };

  const filteredUsers = useMemo(() => {
    switch(filter) {
        case 'active':
            return users.filter(u => u.walletBalance > 0);
        case 'inactive':
            return users.filter(u => u.walletBalance <= 0);
        default:
            return users;
    }
  }, [users, filter]);

  const filterTabs: { label: string; value: UserFilter }[] = [
    { label: 'All Users', value: 'all' },
    { label: 'Active Users', value: 'active' },
    { label: 'Inactive Users', value: 'inactive' },
  ];
  
  const pageTitle = filterTabs.find(tab => tab.value === filter)?.label || 'All Users';

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">{pageTitle}</h1>
      <Card>
        <div className="border-b border-gray-700 mb-4">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {filterTabs.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`${
                            filter === tab.value
                            ? 'border-brand-orange text-brand-orange'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-4 text-sm font-semibold text-gray-400">Name</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Email</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-center">Level</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-center">Team Members</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Total in Wallet</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="p-4">{user.firstName} {user.lastName}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 text-center font-medium">{getUserLevel(user.totalInvested)}</td>
                  <td className="p-4 text-center">{user.teamSize.toLocaleString()}</td>
                  <td className="p-4 font-semibold text-brand-orange">${user.walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                        No {filter !== 'all' ? filter : ''} users found.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AllUsersPage;