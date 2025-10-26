import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import Input from './Input';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { oldPass: string; newPass: string }) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setError('New passwords do not match.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
        await onSubmit({ oldPass, newPass });
        onClose(); // Close modal on success
    } catch (err: any) {
        setError(err.message || 'Failed to update password. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    if (isLoading) return;
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
    setError('');
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <Card className="w-full max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Old Password"
            id="oldPass"
            type="password"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            required
            placeholder="••••••••"
            disabled={isLoading}
          />
          <Input
            label="New Password"
            id="newPass"
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            required
            placeholder="••••••••"
            disabled={isLoading}
          />
          <Input
            label="Confirm New Password"
            id="confirmPass"
            type="password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            required
            placeholder="••••••••"
            disabled={isLoading}
          />

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          
          <div className="flex justify-end space-x-4 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="success" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ChangePasswordModal;
