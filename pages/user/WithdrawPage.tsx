import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { WithdrawalRequest, RequestStatus } from '../../types';
import api from '../../services/api';
import { processWithdrawalRequest } from '../../processors';

interface WithdrawPageProps {
  onAddRequest: (data: { amount: number; walletAddress: string; walletName: string; network: string; }) => Promise<void>;
  walletBalance: number;
  onNavigate: (page: 'dashboard') => void;
}

const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
  const styles = {
    [RequestStatus.PENDING]: 'bg-yellow-500/20 text-yellow-400',
    [RequestStatus.APPROVED]: 'bg-green-500/20 text-green-400',
    [RequestStatus.DECLINED]: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

interface WithdrawalConfig {
  standardFeePercentage: number;
  highBalanceFeePercentage: number;
  highBalanceThreshold: number;
  minimumWithdrawal: number;
}

const ITEMS_PER_PAGE = 5;

const WithdrawPage: React.FC<WithdrawPageProps> = ({ onAddRequest, walletBalance, onNavigate }) => {
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletName, setWalletName] = useState('');
  const [network, setNetwork] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [fee, setFee] = useState(0);
  const [feePercentage, setFeePercentage] = useState(0);
  const [netWithdrawal, setNetWithdrawal] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(walletBalance);
  const [config, setConfig] = useState<WithdrawalConfig | null>(null);

  // State for withdrawal history list
  const [allWithdrawals, setAllWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isListLoading, setIsListLoading] = useState(true);
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get<WithdrawalConfig>('/api/system/public/withdrawal-config', true);
        setConfig(response);
      } catch (e) {
        console.error("Failed to fetch withdrawal config:", e);
        setConfig({
          standardFeePercentage: 6,
          highBalanceFeePercentage: 20,
          highBalanceThreshold: 0.8,
          minimumWithdrawal: 35,
        });
      }
    };
    fetchConfig();
  }, []);

  const fetchWithdrawals = useCallback(async () => {
    setIsListLoading(true);
    try {
      const response: any = await api.get('/api/withdrawals');
      const responseData = response.results || response || [];
      const processedWithdrawals = (Array.isArray(responseData) ? responseData : []).map(processWithdrawalRequest);
      // Sort by date descending (YYYY-MM-DD string sort works)
      setAllWithdrawals(processedWithdrawals.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (error) {
      console.error("Failed to fetch withdrawal history:", error);
      setAllWithdrawals([]);
    } finally {
      setIsListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  // Client-side pagination calculations
  const totalPages = Math.ceil(allWithdrawals.length / ITEMS_PER_PAGE);
  const withdrawals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return allWithdrawals.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allWithdrawals, currentPage]);

  const pendingWithdrawalsAmount = useMemo(() => {
    return allWithdrawals
      .filter(w => w.status === RequestStatus.PENDING)
      .reduce((sum, w) => sum + w.amount, 0);
  }, [allWithdrawals]);

  const availableBalance = useMemo(() => Math.max(0, walletBalance - pendingWithdrawalsAmount), [walletBalance, pendingWithdrawalsAmount]);


  useEffect(() => {
    const numericAmount = parseFloat(amount);

    if (!config || isNaN(numericAmount) || numericAmount <= 0) {
        setFee(0);
        setNetWithdrawal(0);
        setFeePercentage(config?.standardFeePercentage || 0);
        setRemainingBalance(availableBalance);
        return;
    }

    const calculatedRemaining = availableBalance - numericAmount;
    setRemainingBalance(calculatedRemaining >= 0 ? calculatedRemaining : 0);

    if (numericAmount > availableBalance) {
        setFee(0);
        setNetWithdrawal(numericAmount);
        setFeePercentage(config.standardFeePercentage);
        return;
    }

    let currentFeePercentage = config.standardFeePercentage;
    if (numericAmount > availableBalance * config.highBalanceThreshold && numericAmount > 0) {
        currentFeePercentage = config.highBalanceFeePercentage;
    }

    const calculatedFee = (numericAmount * currentFeePercentage) / 100;
    const calculatedNet = numericAmount - calculatedFee;

    setFeePercentage(currentFeePercentage);
    setFee(calculatedFee);
    setNetWithdrawal(calculatedNet > 0 ? calculatedNet : 0);
  }, [amount, availableBalance, config]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (numericAmount < (config?.minimumWithdrawal || 35)) {
        setError(`Minimum withdrawal amount is $${config?.minimumWithdrawal || 35}.`);
        return;
    }
    if (numericAmount > availableBalance) {
        setError('Withdrawal amount cannot exceed your available balance.');
        return;
    }
    if (!walletName.trim()) {
      setError('Please enter a wallet name.');
      return;
    }
    if (!network.trim()) {
        setError('Please enter the network.');
        return;
    }
    if (!walletAddress.trim()) {
        setError('Please enter a valid wallet address.');
        return;
    }
    
    setError('');
    setIsLoading(true);
    try {
        await onAddRequest({ amount: numericAmount, walletAddress, walletName, network });
        setSubmitted(true);
        setAmount('');
        setWalletName('');
        setWalletAddress('');
        setNetwork('');
        setTimeout(() => setSubmitted(false), 5000);
        
        setCurrentPage(1);
        await fetchWithdrawals();
    } catch (err: any) {
        setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const tooltipText = config 
    ? `A ${config.standardFeePercentage}% fee is applied for international transactions. Withdrawals over ${config.highBalanceThreshold * 100}% of your balance incur a ${config.highBalanceFeePercentage}% fee.`
    : "Loading fee details...";

  return (
    <div className="space-y-12">
        <div className="max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-white">Request Withdrawal</h1>
                <p className="text-gray-400 mt-2">
                Withdraw funds from your wallet. Requests are processed manually for security.
                </p>
            </div>

            <Card className="mt-8">
                <div className="mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">{amount ? 'Remaining Balance' : 'Available for Withdrawal'}</span>
                        <span className="text-2xl font-bold text-brand-orange">${(amount ? remainingBalance : availableBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {pendingWithdrawalsAmount > 0 && (
                        <div className="text-right text-xs text-yellow-500 mt-1">
                            Total Balance: ${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br />
                            Pending Withdrawals: -${pendingWithdrawalsAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input 
                        label="Amount (USD)" 
                        id="amount" 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        placeholder="e.g., 100"
                        step="0.01"
                        min={config?.minimumWithdrawal || 35}
                        disabled={isLoading}
                    />
                    
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Withdrawal Amount</span>
                            <span className="font-medium text-white">${!isNaN(parseFloat(amount)) && parseFloat(amount) > 0 ? parseFloat(amount).toFixed(2) : '0.00'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="relative group flex items-center gap-1">
                              <span className="text-gray-400">International Fee ({feePercentage}%)</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div className="absolute bottom-full mb-2 w-max px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none left-1/2 -translate-x-1/2 border border-gray-600 shadow-lg z-10">
                                {tooltipText}
                              </div>
                            </div>
                            <span className="font-medium text-red-400">-${fee.toFixed(2)}</span>
                        </div>
                        <hr className="border-gray-700" />
                        <div className="flex justify-between items-center text-base">
                            <span className="font-semibold text-gray-300">You Will Receive</span>
                            <span className="font-bold text-green-400">${netWithdrawal.toFixed(2)}</span>
                        </div>
                    </div>

                    <Input
                        label="Wallet Name"
                        id="walletName"
                        type="text"
                        value={walletName}
                        onChange={(e) => setWalletName(e.target.value)}
                        required
                        placeholder="e.g., My Binance Wallet"
                        disabled={isLoading}
                    />

                    <Input
                        label="Network"
                        id="network"
                        type="text"
                        value={network}
                        onChange={(e) => setNetwork(e.target.value)}
                        required
                        placeholder="e.g., BEP20, ERC20, TRC20"
                        disabled={isLoading}
                    />

                    <Input 
                        label="Your Wallet Address" 
                        id="walletAddress" 
                        type="text" 
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        required
                        placeholder="0x..."
                        disabled={isLoading}
                    />

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    {submitted && <p className="text-green-400 text-sm text-center">Your withdrawal request was submitted successfully!</p>}
                    
                    <Button type="submit" variant="primary" className="w-full" disabled={isLoading || !config}>
                        {isLoading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </form>
            </Card>
        </div>

        <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Withdrawal History</h2>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-700">
                        <th className="p-4 text-sm font-semibold text-gray-400">Date</th>
                        <th className="p-4 text-sm font-semibold text-gray-400">Request Amount</th>
                        <th className="p-4 text-sm font-semibold text-gray-400">You Received</th>
                        <th className="p-4 text-sm font-semibold text-gray-400">Wallet Name</th>
                        <th className="p-4 text-sm font-semibold text-gray-400">Network</th>
                        <th className="p-4 text-sm font-semibold text-gray-400">Address</th>
                        <th className="p-4 text-sm font-semibold text-gray-400 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isListLoading ? (
                        <tr>
                            <td colSpan={7} className="text-center p-8 text-gray-500">Loading history...</td>
                        </tr>
                        ) : withdrawals.length > 0 ? (
                        withdrawals.map((req) => (
                            <tr key={req.id} className="border-b border-gray-800 hover:bg-gray-800">
                                <td className="p-4 text-sm text-gray-300 whitespace-nowrap">{req.date}</td>
                                <td className="p-4 font-semibold">${req.amount.toLocaleString()}</td>
                                <td className="p-4 font-semibold text-green-400">${req.receivedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="p-4">{req.walletName}</td>
                                <td className="p-4">{req.network}</td>
                                <td className="p-4 font-mono text-xs truncate max-w-[150px]">{req.walletAddress}</td>
                                <td className="p-4 text-right"><StatusBadge status={req.status} /></td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan={7} className="text-center p-8 text-gray-500">
                            No withdrawal history found.
                            </td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                    <Button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || isListLoading}
                        variant="secondary"
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-gray-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || isListLoading}
                        variant="secondary"
                    >
                        Next
                    </Button>
                    </div>
                )}
            </Card>
        </div>
    </div>
  );
};

export default WithdrawPage;
