import React, { useState, useMemo } from 'react';
import { DepositRequest, WithdrawalRequest, RequestStatus, User } from '../../types';
import Card from '../../components/Card';

// --- START: UTILITY & CHART COMPONENTS (Defined within the same file for simplicity) ---

// Date Helpers
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const subDays = (date: Date, days: number) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - days);
  return newDate;
};
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

interface ChartData {
  labels: string[];
  data: number[];
}

interface BarChartProps {
  chartData: ChartData;
  title: string;
  barColor?: string;
}

const BarChart: React.FC<BarChartProps> = ({ chartData, title, barColor = 'text-brand-orange' }) => {
  const { labels, data } = chartData;
  const maxValue = Math.max(...data, 1); // Avoid division by zero
  const gridLines = 5;

  return (
    <Card className="flex flex-col h-full">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="flex-grow flex flex-col justify-end">
        {data.length > 0 ? (
          <div className="relative h-64">
            {/* Grid lines and Y-axis labels */}
            {[...Array(gridLines)].map((_, i) => (
              <div key={i} className="absolute w-full flex items-center" style={{ bottom: `${(i / gridLines) * 100}%` }}>
                <span className="text-xs text-gray-500 pr-2">{(maxValue / gridLines * i).toFixed(0)}</span>
                <div className="flex-1 border-t border-gray-700 border-dashed"></div>
              </div>
            ))}
            <div className="absolute w-full flex items-center" style={{ bottom: '100%' }}>
                <span className="text-xs text-gray-500 pr-2">{maxValue.toFixed(0)}</span>
                <div className="flex-1 border-t border-gray-700 border-dashed"></div>
            </div>

            {/* Bars */}
            <div className="absolute bottom-0 left-8 right-0 h-full flex justify-around items-end gap-2">
              {data.map((value, index) => (
                <div key={labels[index]} className="flex-1 h-full flex flex-col justify-end items-center group">
                   <div
                    className={`w-full rounded-t-sm transition-all duration-300 ${barColor.replace('text-','bg-')}`}
                    style={{ height: `${(value / maxValue) * 100}%` }}
                    title={`${labels[index]}: ${value}`}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-brand-dark text-white text-xs rounded py-1 px-2 absolute -top-8 left-1/2 -translate-x-1/2">
                       ${value.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-500">No data for this period</div>
        )}
        {/* X-axis labels */}
        <div className="flex justify-around mt-2 ml-8">
          {labels.map(label => (
            <span key={label} className="text-xs text-gray-400 text-center flex-1">{label}</span>
          ))}
        </div>
      </div>
    </Card>
  );
};

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, title }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let cumulative = 0;

  return (
    <Card className="flex flex-col h-full">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="flex-grow flex items-center justify-center space-x-8">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 36 36" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -cumulative;
              cumulative += percentage;

              return (
                <circle
                  key={index}
                  className={item.color}
                  strokeWidth="4"
                  fill="none"
                  cx="18"
                  cy="18"
                  r="16"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
          </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{total}</span>
                <span className="text-xs text-gray-400">Total Users</span>
            </div>
        </div>
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.label} className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${item.color.replace('stroke-', 'bg-')}`}></span>
              <span className="text-sm text-gray-300">{item.label}: <span className="font-semibold">{item.value}</span></span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};


// --- END: UTILITY & CHART COMPONENTS ---

interface AdminDashboardProps {
  requests: DepositRequest[];
  withdrawalRequests: WithdrawalRequest[];
  users: User[];
  onNavigate: (page: 'deposits' | 'withdrawals' | 'users', filter?: any) => void;
}
type Period = 'daily' | 'weekly' | 'monthly' | 'custom';


const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests, withdrawalRequests, users, onNavigate }) => {
    const [period, setPeriod] = useState<Period>('monthly');
    const [customRange, setCustomRange] = useState({ 
        start: formatDate(subDays(new Date(), 30)), 
        end: formatDate(new Date()) 
    });

    const totalDeposits = requests.filter(r => r.status === RequestStatus.APPROVED).reduce((sum, r) => sum + r.amount, 0);
    const pendingDeposits = requests.filter(r => r.status === RequestStatus.PENDING).length;
    const totalWithdrawn = withdrawalRequests.filter(r => r.status === RequestStatus.APPROVED).reduce((sum, r) => sum + r.amount, 0);
    const pendingWithdrawals = withdrawalRequests.filter(r => r.status === RequestStatus.PENDING).length;
    
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.walletBalance > 0).length;
    const inactiveUsers = users.filter(u => u.walletBalance <= 0).length;

    const chartData = useMemo(() => {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = now;
        let labels: string[] = [];
        let interval: 'day' | 'week' | 'month' = 'day';

        switch (period) {
            case 'daily':
                startDate = subDays(now, 6);
                interval = 'day';
                for (let i = 0; i < 7; i++) {
                    labels.push(subDays(now, 6 - i).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                }
                break;
            case 'weekly':
                startDate = subDays(now, 27);
                interval = 'week';
                labels = ['3 Weeks Ago', '2 Weeks Ago', 'Last Week', 'This Week'];
                break;
            case 'monthly':
                startDate = startOfMonth(subDays(startOfMonth(now), 150)); // Approx 6 months ago
                interval = 'month';
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
                }
                break;
            case 'custom':
                startDate = new Date(customRange.start + 'T00:00:00');
                endDate = new Date(customRange.end + 'T00:00:00');
                const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
                if (diffDays <= 14) {
                    interval = 'day';
                    for (let i = 0; i <= diffDays; i++) {
                         labels.push(subDays(endDate, diffDays - i).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                    }
                } else {
                    interval = 'week'; // Default to weeks for larger ranges
                    const startOfWeek = (d: Date) => subDays(d, d.getDay());
                    let current = startOfWeek(startDate);
                    while (current <= endDate) {
                        const weekEnd = subDays(new Date(current), -6);
                        labels.push(`${current.toLocaleDateString('en-US',{month:'short',day:'numeric'})}-${weekEnd.toLocaleDateString('en-US',{day:'numeric'})}`);
                        current = subDays(current, -7);
                    }
                }
                break;
        }

        const dataPoints = new Array(labels.length).fill(0);
        
        const processData = (items: (DepositRequest | WithdrawalRequest | User)[]) => {
            const aggregatedData = [...dataPoints];
            items.forEach(item => {
                const dateSource = 'joinDate' in item ? item.joinDate : item.date;
                const itemDate = new Date(dateSource + 'T00:00:00');
                if (itemDate >= startDate && itemDate <= endDate) {
                    let index = -1;
                    if (interval === 'day') index = Math.floor((itemDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
                    else if (interval === 'week') index = Math.floor((itemDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24 * 7));
                    else if (interval === 'month') index = (itemDate.getFullYear() - startDate.getFullYear()) * 12 + itemDate.getMonth() - startDate.getMonth();
                    
                    if (index >= 0 && index < aggregatedData.length) {
                       aggregatedData[index] += 'amount' in item ? item.amount : 1;
                    }
                }
            });
            return { labels, data: aggregatedData };
        };

        const approvedDeposits = requests.filter(r => r.status === 'approved');
        const approvedWithdrawals = withdrawalRequests.filter(r => r.status === 'approved');

        return {
            deposits: processData(approvedDeposits),
            withdrawals: processData(approvedWithdrawals),
            newUsers: processData(users.map(u => ({...u, date: u.joinDate }))),
        };
    }, [period, customRange, requests, withdrawalRequests, users]);
    
    const userStatusData = useMemo(() => {
        const activeUsersCount = users.filter(u => u.walletBalance > 0).length;
        const inactiveUsersCount = users.filter(u => u.walletBalance <= 0).length;
        return {
            title: 'User Status Overview',
            data: [
                { label: 'Active', value: activeUsersCount, color: 'stroke-green-400' },
                { label: 'Inactive', value: inactiveUsersCount, color: 'stroke-red-400' },
            ],
        }
    }, [users]);
    

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">Admin Overview</h1>
        <div className="space-y-6">
            {/* Row 1: Approved Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-gray-400">Total Approved Deposits</h3>
                    <p className="text-3xl font-bold text-white">${totalDeposits.toLocaleString()}</p>
                </Card>
                <Card>
                    <h3 className="text-gray-400">Total Approved Withdrawals</h3>
                    <p className="text-3xl font-bold text-white">${totalWithdrawn.toLocaleString()}</p>
                </Card>
            </div>

            {/* Row 2: Pending Requests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => onNavigate('deposits', RequestStatus.PENDING)} className="cursor-pointer transition-transform duration-200 hover:-translate-y-1">
                    <Card>
                    <h3 className="text-gray-400">Pending Deposits</h3>
                    <p className="text-3xl font-bold text-brand-orange">{pendingDeposits}</p>
                    </Card>
                </div>
                <div onClick={() => onNavigate('withdrawals', RequestStatus.PENDING)} className="cursor-pointer transition-transform duration-200 hover:-translate-y-1">
                    <Card>
                    <h3 className="text-gray-400">Pending Withdrawals</h3>
                    <p className="text-3xl font-bold text-brand-orange">{pendingWithdrawals}</p>
                    </Card>
                </div>
            </div>

            {/* Row 3: User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => onNavigate('users', 'all')} className="cursor-pointer transition-transform duration-200 hover:-translate-y-1">
                    <Card>
                    <h3 className="text-gray-400">Total Users</h3>
                    <p className="text-3xl font-bold text-white">{totalUsers}</p>
                    </Card>
                </div>
                <div onClick={() => onNavigate('users', 'active')} className="cursor-pointer transition-transform duration-200 hover:-translate-y-1">
                    <Card>
                    <h3 className="text-gray-400">Active Users</h3>
                    <p className="text-3xl font-bold text-green-400">{activeUsers}</p>
                    </Card>
                </div>
                <div onClick={() => onNavigate('users', 'inactive')} className="cursor-pointer transition-transform duration-200 hover:-translate-y-1">
                    <Card>
                    <h3 className="text-gray-400">Inactive Users</h3>
                    <p className="text-3xl font-bold text-red-400">{inactiveUsers}</p>
                    </Card>
                </div>
            </div>
        </div>
      </div>
        
      {/* Charts Section */}
       <div className="space-y-6">
          <Card>
              <div className="flex flex-wrap items-center gap-4">
                  <span className="font-semibold text-white">Filter Data By:</span>
                  <div className="flex space-x-2 rounded-lg bg-brand-surface p-1">
                      {(['daily', 'weekly', 'monthly', 'custom'] as Period[]).map(p => (
                          <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${period === p ? 'bg-brand-orange text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                              {p.charAt(0).toUpperCase() + p.slice(1)}
                          </button>
                      ))}
                  </div>
                  {period === 'custom' && (
                      <div className="flex items-center gap-2">
                          <input type="date" value={customRange.start} onChange={e => setCustomRange(prev => ({...prev, start: e.target.value}))} className="bg-gray-800 border border-gray-600 rounded-md p-1.5 text-sm" />
                          <span>to</span>
                          <input type="date" value={customRange.end} onChange={e => setCustomRange(prev => ({...prev, end: e.target.value}))} className="bg-gray-800 border border-gray-600 rounded-md p-1.5 text-sm" />
                      </div>
                  )}
              </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DonutChart {...userStatusData} />
            <BarChart chartData={chartData.newUsers} title="New User Registrations" barColor="text-blue-500" />
            <BarChart chartData={chartData.deposits} title="Approved Deposits" barColor="text-green-500" />
            <BarChart chartData={chartData.withdrawals} title="Approved Withdrawals" barColor="text-brand-orange" />
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;