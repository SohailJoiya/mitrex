import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import Input from './Input';

interface DeclineRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; reason: string }) => void;
  requestType: 'Deposit' | 'Withdrawal';
  userEmail: string;
}

const DeclineRequestModal: React.FC<DeclineRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  requestType,
  userEmail,
}) => {
  const [title, setTitle] = useState(`${requestType} Request Declined`);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(`${requestType} Request Declined`);
      setReason('');
    }
  }, [isOpen, requestType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit({ title, reason });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <Card className="w-full max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-2">Decline Request</h2>
        <p className="text-sm text-gray-400 mb-6">
          Send a notification to <span className="font-semibold text-brand-orange">{userEmail}</span> with the reason for declining.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Notification Title"
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-1">
              Reason for Decline
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
              placeholder={`e.g., The transaction ID provided was invalid.`}
              className="w-full bg-gray-800 border border-gray-600 rounded-md p-2.5 text-white focus:ring-brand-orange focus:border-brand-orange transition"
            />
          </div>
          <div className="flex justify-end space-x-4 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Decline & Send
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DeclineRequestModal;