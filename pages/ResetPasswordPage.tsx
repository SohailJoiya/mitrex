import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';

interface ResetPasswordPageProps {
  onReset: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onReset }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReset();
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-4">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Reset Your Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="New Password" id="newPassword" type="password" required placeholder="••••••••" />
          <Input label="Confirm New Password" id="confirmPassword" type="password" required placeholder="••••••••" />
          <Button type="submit" variant="success" className="w-full">
            Reset Password
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
