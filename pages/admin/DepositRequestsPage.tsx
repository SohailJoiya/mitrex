import React, { useState, useEffect, useCallback } from 'react';
import { DepositRequest, RequestStatus, User } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import DeclineRequestModal from '../../components/DeclineRequestModal';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import api from '../../services/api';
import { processDepositRequest } from '../../processors';

interface DepositRequestsPageProps {
  users: User[];
  onUpdateRequestStatus: (id: string, status: 'approved' | 'declined', data?: { reason: string }) => Promise<void>;
  onAddNotification: (data: { title: string; content: string; userId?: string }) => void;
  initialFilter?: FilterStatus;
}

type FilterStatus = 'all' | RequestStatus;

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

const ITEMS_PER_PAGE = 10;

const DepositRequestsPage: React.FC<DepositRequestsPageProps> = ({ users, onUpdateRequestStatus, onAddNotification, initialFilter = 'all' }) => {
  const [filter, setFilter] = useState<FilterStatus>(initialFilter);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, dateRange]);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      let statusParam = '';
      if (filter !== 'all') {
        const apiStatus = filter.charAt(0).toUpperCase() + filter.slice(1);
        statusParam = `&status=${apiStatus}`;
      }
      
      let dateParams = '';
      if (dateRange.start) dateParams += `&startDate=${dateRange.start}`;
      if (dateRange.end) dateParams += `&endDate=${dateRange.end}`;
      
      const endpoint = `/api/admin/deposits?page=${currentPage}&limit=${ITEMS_PER_PAGE}${statusParam}${dateParams}`;
      const response: any = await api.get(endpoint);
      
      setRequests((response.results || []).map(processDepositRequest));
      setTotalPages(response.pages || 0);
      if (currentPage > response.pages && response.pages > 0) {
        setCurrentPage(response.pages);
      }
    } catch (error) {
      console.error("Failed to fetch deposit requests:", error);
      setRequests([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filter, dateRange]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearDates = () => {
    setDateRange({ start: '', end: '' });
  };

  const handleDeclineClick = (request: DepositRequest) => {
    setSelectedRequest(request);
    setIsDeclineModalOpen(true);
  };

  const handleDeclineSubmit = async ({ title, reason }: { title: string; reason: string }) => {
    if (!selectedRequest) return;

    onAddNotification({
      title,
      content: reason,
      userId: selectedRequest.userId,
    });

    await onUpdateRequestStatus(selectedRequest.id, 'declined', { reason });
    fetchRequests();

    setIsDeclineModalOpen(false);
    setSelectedRequest(null);
  };

  const handlePreviewClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsPreviewOpen(true);
  };
  
  const handleApproveClick = async (id: string) => {
    await onUpdateRequestStatus(id, 'approved');
    fetchRequests();
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
        <h1 className="text-3xl font-bold text-white">Deposit Requests</h1>
        <Card>
          <div className="flex flex-col gap-4 mb-4">
            <div className="border-b border-gray-700">
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
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-auto">
                <label htmlFor="start" className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                <input type="date" name="start" value={dateRange.start} onChange={handleDateChange} className="w-full bg-brand-dark/50 border border-gray-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-brand-orange" />
              </div>
              <div className="w-full sm:w-auto">
                <label htmlFor="end" className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                <input type="date" name="end" value={dateRange.end} onChange={handleDateChange} className="w-full bg-brand-dark/50 border border-gray-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-brand-orange" />
              </div>
              <div className="w-full sm:w-auto self-end">
                <Button onClick={clearDates} variant="secondary" className="w-full !py-2">Clear</Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-4 text-sm font-semibold text-gray-400">Date</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">User ID</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">User Name</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Amount</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">TID</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Wallet Name</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Screenshot</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center p-8 text-gray-500">Loading requests...</td>
                  </tr>
                ) : requests.length > 0 ? (
                  requests.map((req) => {
                    const user = users.find(u => u.id === req.userId);
                    return (
                      <tr key={req.id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="p-4 text-sm text-gray-300 whitespace-nowrap">{req.date}</td>
                        <td className="p-4 font-mono text-xs">{req.userId}</td>
                        <td className="p-4">{user ? `${user.firstName} ${user.lastName}` : req.userEmail}</td>
                        <td className="p-4 font-semibold">${req.amount.toLocaleString()}</td>
                        <td className="p-4 font-mono text-xs">{req.transactionId}</td>
                        <td className="p-4 text-sm text-gray-300">Binance</td>
                        <td className="p-4">
                          {req.screenshot ? (
                            <Button onClick={() => handlePreviewClick(req.screenshot)} variant="secondary" className="!px-3 !py-1 text-sm">
                              View
                            </Button>
                          ) : (
                            <span className="text-gray-500 text-sm">N/A</span>
                          )}
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
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center p-8 text-gray-500">
                      No {filter !== 'all' ? filter : ''} requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 0 && (
            <div className="flex justify-between items-center mt-6">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                variant="secondary"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
                variant="secondary"
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      </div>
      <DeclineRequestModal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        onSubmit={handleDeclineSubmit}
        requestType="Deposit"
        userEmail={selectedRequest?.userEmail || ''}
      />
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageUrl={selectedImage}
      />
    </>
  );
};

export default DepositRequestsPage;