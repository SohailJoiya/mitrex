import React, { useState, useEffect } from 'react';
import { User, ReferredUser, CommissionHistoryItem } from '../../types';
import Card from '../../components/Card';
import api from '../../services/api';

const revenueStructure = [
  { level: 1, reward: '10%', description: 'Direct team earning' },
  { level: 2, reward: '5%', description: 'Second-line income' },
  { level: 3, reward: '3%', description: 'Third-line income' },
  { level: 4, reward: '2%', description: 'Deep network support' },
  { level: 5, reward: '1%', description: 'Long-term passive growth' },
];

const ReferralsPage: React.FC<{ user: User }> = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const [commissionCurrentPage, setCommissionCurrentPage] = useState(1);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>(user.referredUsers);
  const [commissionHistory, setCommissionHistory] = useState<CommissionHistoryItem[]>(user.commissionHistory);

  const commissionItemsPerPage = 5;
  
  const referralLink = `https://FIN2X.earn/ref/${user.referralCode}`;

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [referralsResponse, commissionsResponse]: any[] = await Promise.all([
                api.get('/api/referral/directs'),
                api.get('/api/referral/commissions')
            ]);
            setReferredUsers(referralsResponse.results || referralsResponse || []);
            setCommissionHistory(commissionsResponse.results || commissionsResponse || []);
        } catch (error) {
            console.error("Failed to fetch referral data:", error);
        }
    };
    fetchData();
  }, []);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalReferralIncome = commissionHistory.reduce((acc, item) => acc + (item.amount || 0), 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayReferralIncome = commissionHistory
    .filter(item => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0,0,0,0);
        return itemDate.getTime() === today.getTime();
    })
    .reduce((acc, item) => acc + (item.amount || 0), 0);
    
  const indexOfLastCommission = commissionCurrentPage * commissionItemsPerPage;
  const indexOfFirstCommission = indexOfLastCommission - commissionItemsPerPage;
  const currentCommissionItems = commissionHistory.slice(indexOfFirstCommission, indexOfLastCommission);
  const totalCommissionPages = Math.ceil(commissionHistory.length / commissionItemsPerPage);

  const paginateCommission = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalCommissionPages) {
        setCommissionCurrentPage(pageNumber);
    }
  };


  return (
    <div className="space-y-8">
      {/* Header & Referral Link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">My Referrals</h1>
          <p className="text-gray-400 mt-2">
            Invite others to join FIN2X and earn commissions from their investments.
          </p>
        </div>
        <Card>
          <h2 className="text-xl font-bold text-white mb-2">Your Unique Referral Link</h2>
          <div className="flex items-center bg-gray-800 rounded-md p-2 border border-gray-600">
            <input type="text" readOnly value={referralLink} className="bg-transparent text-sm text-gray-300 w-full focus:outline-none"/>
            <button onClick={copyReferralLink} className="ml-2 px-3 py-1 bg-brand-orange text-white rounded text-sm whitespace-nowrap">
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </Card>
      </div>

      {/* Commission Summary */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-gray-400">Today's Referral Income</h3>
            <p className="text-3xl font-bold text-brand-orange">${todayReferralIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </Card>
          <Card>
            <h3 className="text-gray-400">Total Referral Income</h3>
            <p className="text-3xl font-bold text-white">${totalReferralIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </Card>
          <Card>
            <h3 className="text-gray-400">Total Team Network</h3>
            <p className="text-3xl font-bold text-white">{user.teamSize.toLocaleString()}</p>
          </Card>
        </div>
      </div>

      {/* Team Revenue Structure */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4">Team Revenue Structure</h2>
        <Card>
            <div className="flex flex-col sm:flex-row sm:justify-around text-center gap-4 mb-6 p-4 bg-brand-dark/30 rounded-lg border border-gray-700">
                <div className="flex-1">
                    <p className="text-sm text-gray-400 uppercase tracking-wider">💫 Direct Reward</p>
                    <p className="text-3xl font-bold text-brand-orange mt-1">10%</p>
                </div>
                <div className="border-r border-gray-700 hidden sm:block"></div>
                <div className="flex-1">
                    <p className="text-sm text-gray-400 uppercase tracking-wider">💫 Team Income</p>
                    <p className="text-3xl font-bold text-white mt-1">5-Level Depth</p>
                </div>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                <tr className="border-b border-gray-700">
                    <th className="p-4 text-sm font-semibold text-gray-400">Level</th>
                    <th className="p-4 text-sm font-semibold text-gray-400">Reward (%)</th>
                    <th className="p-4 text-sm font-semibold text-gray-400">Description</th>
                </tr>
                </thead>
                <tbody>
                {revenueStructure.map((item) => (
                    <tr key={item.level} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="p-4 font-mono text-brand-orange">Level {item.level}</td>
                    <td className="p-4 font-semibold">{item.reward}</td>
                    <td className="p-4 text-gray-300">{item.description}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </Card>
      </div>

      {/* Referred Users Table */}
      <Card>
        <h2 className="text-2xl font-semibold text-white mb-4">Referred Users ({referredUsers.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-4 text-sm font-semibold text-gray-400">User</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Join Date</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Investment</th>
              </tr>
            </thead>
            <tbody>
              {referredUsers.map((refUser) => (
                <tr key={refUser.id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="p-4 font-medium">{refUser.name}</td>
                  <td className="p-4 text-gray-300">{refUser.joinDate}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      refUser.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {refUser.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold">${(refUser.investment || 0).toLocaleString()}</td>
                </tr>
              ))}
               {referredUsers.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center p-8 text-gray-500">
                        No referred users yet.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Commission History Table */}
      <Card>
        <h2 className="text-2xl font-semibold text-white mb-4">Commission History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-4 text-sm font-semibold text-gray-400">Date</th>
                <th className="p-4 text-sm font-semibold text-gray-400">From User</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Level</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentCommissionItems.map((item, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="p-4 text-gray-300">{item.date}</td>
                  <td className="p-4">{item.fromUser}</td>
                  <td className="p-4">
                    <span className="font-mono text-brand-orange">Level {item.level}</span>
                  </td>
                  <td className="p-4 text-right font-semibold text-green-400">+${(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
              {commissionHistory.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center p-8 text-gray-500">
                        No commission history yet.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalCommissionPages > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => paginateCommission(commissionCurrentPage - 1)}
              disabled={commissionCurrentPage === 1}
              className="px-3 py-1 rounded-md bg-brand-surface disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              aria-label="Go to previous page"
            >
              &laquo;
            </button>
            {Array.from({ length: totalCommissionPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginateCommission(number)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  commissionCurrentPage === number ? 'bg-brand-orange text-white' : 'bg-brand-surface hover:bg-white/10'
                }`}
                aria-current={commissionCurrentPage === number ? 'page' : undefined}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => paginateCommission(commissionCurrentPage + 1)}
              disabled={commissionCurrentPage === totalCommissionPages}
              className="px-3 py-1 rounded-md bg-brand-surface disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              aria-label="Go to next page"
            >
              &raquo;
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReferralsPage;
