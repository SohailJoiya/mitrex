import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';

interface ForgotPasswordPageProps {
  onSendOtp: () => void;
  onNavigate: (page: 'login') => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onSendOtp, onNavigate }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendOtp();
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-4">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Forgot Password
        </h2>
        <p className="text-center text-gray-400 mb-6">
          Enter your email address and we'll send you an OTP to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Email" id="email" type="email" required placeholder="user@example.com" />
          <Button type="submit" variant="success" className="w-full">
            Send OTP
          </Button>
        </form>
        <p className="text-center text-gray-400 mt-6">
          Remembered your password?{' '}
          <button onClick={() => onNavigate('login')} className="font-semibold text-brand-orange hover:underline">
            Log In
          </button>
        </p>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
