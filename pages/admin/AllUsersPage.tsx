import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import Card from '../../components/Card';
import api from '../../services/api';
import { processUser } from '../../processors';
import Button from '../../components/Button';

interface AllUsersPageProps {
  initialFilter?: 'all' | 'active' | 'inactive';
}

type UserFilter = 'all' | 'active' | 'inactive';
const ITEMS_PER_PAGE = 5;

const AllUsersPage: React.FC<AllUsersPageProps> = ({ initialFilter = 'all' }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<UserFilter>(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, debouncedSearchTerm]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }
      if (filter === 'active') {
        params.append('status', 'active');
      } else if (filter === 'inactive') {
        params.append('status', 'inactive');
      }
      
      const response: any = await api.get(`/api/admin/users?${params.toString()}`);
      
      setUsers((response.results || []).map(processUser));
      setTotalPages(response.pages || 0);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filter, debouncedSearchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getUserLevel = (totalInvested: number): number => {
    if (totalInvested >= 30000) return 4;
    if (totalInvested >= 10000) return 3;
    if (totalInvested >= 5000) return 2;
    return 1;
  };

  const filterTabs: { label: string; value: UserFilter }[] = [
    { label: 'All Users', value: 'all' },
    { label: 'Active Users', value: 'active' },
    { label: 'Inactive Users', value: 'inactive' },
  ];
  
  const pageTitle = filterTabs.find(tab => tab.value === filter)?.label || 'All Users';
  
  const renderPagination = () => {
    if (totalPages <= 1) {
      return null;
    }
  
    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage: number, endPage: number;
  
    if (totalPages <= maxPageButtons) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxPageButtons / 2);
      const maxPagesAfterCurrent = Math.ceil(maxPageButtons / 2) - 1;
      if (currentPage <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxPageButtons;
      } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
        startPage = totalPages - maxPageButtons + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrent;
        endPage = currentPage + maxPagesAfterCurrent;
      }
    }
  
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  
    return (
      <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
        <span className="text-sm text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <nav aria-label="Pagination">
          <ul className="flex items-center space-x-1">
            <li>
              <Button onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || isLoading} variant="secondary" className="!px-2 !py-1 text-sm">First</Button>
            </li>
            <li>
              <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1 || isLoading} variant="secondary" className="!px-2 !py-1 text-sm">Prev</Button>
            </li>
            
            {startPage > 1 && <li className="px-2 py-1 text-gray-400">...</li>}
            
            {pageNumbers.map(number => (
              <li key={number}>
                <Button
                  onClick={() => setCurrentPage(number)}
                  className="!px-3 !py-1 text-sm"
                  variant={currentPage === number ? 'primary' : 'secondary'}
                  aria-current={currentPage === number ? 'page' : undefined}
                >
                  {number}
                </Button>
              </li>
            ))}
  
            {endPage < totalPages && <li className="px-2 py-1 text-gray-400">...</li>}
            
            <li>
              <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages || isLoading} variant="secondary" className="!px-2 !py-1 text-sm">Next</Button>
            </li>
            <li>
              <Button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || isLoading} variant="secondary" className="!px-2 !py-1 text-sm">Last</Button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">{pageTitle}</h1>
      <Card>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
            <div className="flex-grow md:max-w-sm">
                <label htmlFor="search" className="block text-sm font-medium text-brand-gray mb-2">
                    Search by Name, Email, or ID
                </label>
                <div className="relative">
                    <input
                        id="search"
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-brand-surface border border-gray-700 rounded-lg p-2.5 pl-10 text-white focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all duration-200 shadow-inner shadow-black/20"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            <nav className="flex space-x-6 border-b border-gray-700 md:border-b-0">
                {filterTabs.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`${
                            filter === tab.value
                            ? 'border-brand-orange text-brand-orange'
                            : 'border-transparent text-gray-400 hover:text-white'
                        } whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
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
                <th className="p-4 text-sm font-semibold text-gray-400">User ID</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Name</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Email</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Join Date</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-center">Level</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-center">Team Count</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Total in Wallet</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center p-8 text-gray-500">Loading users...</td></tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="p-4 font-mono text-xs truncate max-w-[150px]">{user.id}</td>
                    <td className="p-4">{user.firstName} {user.lastName}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4 text-sm text-gray-300 whitespace-nowrap">{user.joinDate}</td>
                    <td className="p-4 text-center font-medium">{getUserLevel(user.totalInvested)}</td>
                    <td className="p-4 text-center">{user.teamSize.toLocaleString()}</td>
                    <td className="p-4 font-semibold text-brand-orange">${user.walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-500">
                        No {filter !== 'all' ? filter : ''} users found.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </Card>
    </div>
  );
};

export default AllUsersPage;