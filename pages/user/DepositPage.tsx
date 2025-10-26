import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import api from '../../services/api';
import { DepositRequest, RequestStatus } from '../../types';
import { processDepositRequest } from '../../processors';

interface DepositPageProps {
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

const ITEMS_PER_PAGE = 5;

const DepositPage: React.FC<DepositPageProps> = ({ onNavigate }) => {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [wallets, setWallets] = useState<{ binance?: string; trust?: string }>({});
  const [copiedAddress, setCopiedAddress] = useState<'binance' | 'trust' | null>(null);

  // State for deposit history list
  const [allDeposits, setAllDeposits] = useState<DepositRequest[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isListLoading, setIsListLoading] = useState(true);

  const fetchDeposits = useCallback(async () => {
    setIsListLoading(true);
    try {
      const response: any = await api.get('/api/deposits');
      const processedDeposits = (Array.isArray(response) ? response : []).map(processDepositRequest);
      // Sort by date descending (YYYY-MM-DD string sort works)
      setAllDeposits(processedDeposits.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (error) {
      console.error("Failed to fetch deposit history:", error);
      setAllDeposits([]);
    } finally {
      setIsListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);
  
  // Client-side pagination calculations
  const totalPages = Math.ceil(allDeposits.length / ITEMS_PER_PAGE);
  const deposits = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return allDeposits.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allDeposits, currentPage]);

  useEffect(() => {
    const fetchWallets = async () => {
        try {
            const data = await api.get<{ binance: string, trust: string }>('/api/system/public/wallets', true);
            setWallets(data);
        } catch (error) {
            console.error("Failed to fetch deposit wallets", error);
            setError('Could not load deposit addresses. Please try again later.');
        }
    };
    fetchWallets();
  }, []);

  const handleCopy = (address: string, type: 'binance' | 'trust') => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(type);
    setTimeout(() => setCopiedAddress(null), 2000);
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) {
      setError('Please upload a transaction screenshot.');
      return;
    }
    setError('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('transactionId', transactionId);
    formData.append('screenshot', screenshot);

    try {
        await api.postFormData('/api/deposits', formData);
        setSubmitted(true);
        setAmount('');
        setTransactionId('');
        setScreenshot(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setTimeout(() => setSubmitted(false), 5000);
        
        // Refresh list and go to first page
        setCurrentPage(1);
        await fetchDeposits();
    } catch (err: any) {
        setError(err.message || 'Failed to submit deposit. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const binanceAddress = wallets.binance || 'Loading address...';
  const trustAddress = wallets.trust || 'Loading address...';

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Deposit Funds</h1>
            <p className="text-gray-400 mt-2">
              To add funds to your wallet, please follow the steps below. Deposits are sent directly to our official accounts and are manually verified for security.
            </p>
          </div>
          {error && !wallets.binance && <p className="text-red-500">{error}</p>}
          <Card>
              <h2 className="text-xl font-semibold text-brand-orange mb-3">Official Binance Account</h2>
              <p className="text-sm text-gray-300">Wallet Address:</p>
              <div 
                  className="flex items-center justify-between font-mono bg-gray-900/50 p-3 rounded-md my-1 border border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-colors break-all"
                  onClick={() => handleCopy(binanceAddress, 'binance')}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleCopy(binanceAddress, 'binance')}
              >
                  <span>{binanceAddress}</span>
                  <span className="ml-4 text-sm font-sans font-semibold text-brand-orange flex-shrink-0">
                      {copiedAddress === 'binance' ? 'Copied!' : 'Copy'}
                  </span>
              </div>
              <p className="text-sm text-gray-300 mt-2">Network:</p>
              <p className="font-mono bg-gray-900 p-2 rounded my-1">BEP20</p>
          </Card>
          <Card>
              <h2 className="text-xl font-semibold text-brand-orange mb-3">Official Trust Wallet</h2>
              <p className="text-sm text-gray-300">Wallet Address:</p>
               <div 
                  className="flex items-center justify-between font-mono bg-gray-900/50 p-3 rounded-md my-1 border border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-colors break-all"
                  onClick={() => handleCopy(trustAddress, 'trust')}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleCopy(trustAddress, 'trust')}
              >
                  <span>{trustAddress}</span>
                  <span className="ml-4 text-sm font-sans font-semibold text-brand-orange flex-shrink-0">
                      {copiedAddress === 'trust' ? 'Copied!' : 'Copy'}
                  </span>
              </div>
              <p className="text-sm text-gray-300 mt-2">Network:</p>
              <p className="font-mono bg-gray-900 p-2 rounded my-1">ERC20</p>
          </Card>
        </div>
        <Card>
          <h2 className="text-2xl font-bold text-white mb-6">Submit Your Payment</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Amount (USD)" 
              id="amount" 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="e.g., 500"
              disabled={isLoading}
            />
            <Input 
              label="Transaction ID (TID)" 
              id="tid" 
              type="text" 
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
              placeholder="0x..."
              disabled={isLoading}
            />
            <div>
              <label htmlFor="screenshot" className="block text-sm font-medium text-gray-300 mb-1">
                Transaction Screenshot
              </label>
              <input 
                id="screenshot"
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                required
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-orange file:text-white hover:file:bg-orange-600"
                disabled={isLoading}
                accept="image/png, image/jpeg, image/gif"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {submitted && <p className="text-green-400 text-sm text-center">Your deposit request was submitted successfully!</p>}
            <Button type="submit" variant="success" className="w-full" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </form>
        </Card>
      </div>
      
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Deposit History</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-4 text-sm font-semibold text-gray-400">Date</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Amount</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">TID</th>
                  <th className="p-4 text-sm font-semibold text-gray-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {isListLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-gray-500">Loading history...</td>
                  </tr>
                ) : deposits.length > 0 ? (
                  deposits.map((req) => (
                    <tr key={req.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="p-4 text-sm text-gray-300 whitespace-nowrap">{req.date}</td>
                      <td className="p-4 font-semibold">${req.amount.toLocaleString()}</td>
                      <td className="p-4 font-mono text-xs truncate max-w-[200px] sm:max-w-xs">{req.transactionId}</td>
                      <td className="p-4 text-right"><StatusBadge status={req.status} /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-gray-500">
                      No deposit history found.
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

export default DepositPage;