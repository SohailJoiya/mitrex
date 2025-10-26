import React, { useState, useMemo } from 'react';
import { WithdrawalRequest, RequestStatus, User } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import DeclineRequestModal from '../../components/DeclineRequestModal';

interface WithdrawRequestsPageProps {
  requests: WithdrawalRequest[];
  users: User[];
  // FIX: Updated to expect a Promise<void> to handle async operations correctly.
  onUpdateRequestStatus: (id: string, status: 'approved' | 'declined', data?: { reason: string }) => Promise<void>;
  onAddNotification: (data: { title: string; content: string; userId?: string }) => void;
  initialFilter?: FilterStatus;
}

type FilterStatus = 'all' | RequestStatus;

const WalletInfoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  walletName: string;
  walletAddress: string;
  network: string;
}> = ({ isOpen, onClose, walletName, walletAddress, network }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-4">Wallet Details</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Wallet Name</label>
            <p className="w-full bg-gray-800 border border-gray-600 rounded-md p-2.5 text-white">
              {walletName}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Network</label>
            <p className="w-full bg-gray-800 border border-gray-600 rounded-md p-2.5 text-white">
              {network}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Wallet Address</label>
            <div className="flex items-center space-x-2 w-full bg-gray-800 border border-gray-600 rounded-md p-2.5 text-white">
              <span className="break-all">{walletAddress}</span>
              <button onClick={handleCopy} className="ml-auto flex-shrink-0 px-3 py-1 bg-brand-orange text-white rounded text-sm">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} variant="secondary">Close</Button>
        </div>
      </Card>
    </div>
  );
};

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

const WithdrawRequestsPage: React.FC<WithdrawRequestsPageProps> = ({ requests, users, onUpdateRequestStatus, onAddNotification, initialFilter = 'all' }) => {
  const [filter, setFilter] = useState<FilterStatus>(initialFilter);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [isWalletInfoModalOpen, setIsWalletInfoModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  
  const truncateAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const filteredRequests = useMemo(() => {
    if (filter === 'all') {
      return requests;
    }
    return requests.filter(req => req.status === filter);
  }, [requests, filter]);

  const handleDeclineClick = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setIsDeclineModalOpen(true);
  };
  
  const handleWalletInfoClick = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setIsWalletInfoModalOpen(true);
  };

  // FIX: Made function async to await the status update.
  const handleDeclineSubmit = async ({ title, reason }: { title: string; reason: string }) => {
    if (!selectedRequest) return;

    onAddNotification({
      title,
      content: reason,
      userId: selectedRequest.userId,
    });

    await onUpdateRequestStatus(selectedRequest.id, 'declined', { reason });

    setIsDeclineModalOpen(false);
    setSelectedRequest(null);
  };
  
  // FIX: Made function async to await the status update.
  const handleApproveClick = async (id: string) => {
    await onUpdateRequestStatus(id, 'approved');
  }

  const filterTabs: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: RequestStatus.PENDING },
    { label: 'Approved', value: RequestStatus.APPROVED },
    { label: 'Declined', value: RequestStatus.DECLINED },
  ];

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Withdrawal Requests</h1>
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
                  <th className="p-4 text-sm font-semibold text-gray-400">Date</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">User Name</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Wallet Balance</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Amount</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Wallet Name</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Network</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Wallet Address</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => {
                   const user = users.find(u => u.id === req.userId);
                   return(
                    <tr key={req.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="p-4 text-sm text-gray-300 whitespace-nowrap">{req.date}</td>
                      <td className="p-4">{user ? `${user.firstName} ${user.lastName}` : req.userEmail}</td>
                      <td className="p-4 font-semibold text-brand-orange">
                        {user ? `$${user.walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                      </td>
                      <td className="p-4 font-semibold">${req.amount.toLocaleString()}</td>
                      <td className="p-4">{req.walletName}</td>
                      <td className="p-4 font-semibold">{req.network}</td>
                      <td 
                        className="p-4 font-mono text-xs cursor-pointer group"
                        title="Click to view details"
                        onClick={() => handleWalletInfoClick(req)}
                      >
                         <div className="flex items-center gap-2">
                            <span className="truncate group-hover:text-brand-orange">{truncateAddress(req.walletAddress)}</span>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </div>
                      </td>
                      <td className="p-4"><StatusBadge status={req.status} /></td>
                      <td className="p-4">
                        {req.status === RequestStatus.PENDING ? (
                          <div className="flex space-x-2">
                            <Button onClick={() => handleApproveClick(req.id)} className="!px-3 !py-1 text-sm">Approve</Button>
                            <Button onClick={() => handleDeclineClick(req)} variant="secondary" className="!px-3 !py-1 text-sm">Decline</Button>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic text-sm">Handled</span>
                        )}
                      </td>
                    </tr>
                   );
                })}
                {filteredRequests.length === 0 && (
                  <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-500">
                          No {filter !== 'all' ? filter : ''} requests found.
                      </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <DeclineRequestModal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        onSubmit={handleDeclineSubmit}
        requestType="Withdrawal"
        userEmail={selectedRequest?.userEmail || ''}
      />
      <WalletInfoModal
        isOpen={isWalletInfoModalOpen}
        onClose={() => setIsWalletInfoModalOpen(false)}
        walletName={selectedRequest?.walletName || ''}
        walletAddress={selectedRequest?.walletAddress || ''}
        network={selectedRequest?.network || ''}
      />
    </>
  );
};

export default WithdrawRequestsPage;
