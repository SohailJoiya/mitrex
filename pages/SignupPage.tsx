import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';

interface SignupPageProps {
  onSignup: (data: object) => Promise<void>;
  onNavigate: (page: 'login' | 'landing') => void;
  referralCode?: string | null;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onNavigate, referralCode }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    referredBy: referralCode || '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (referralCode) {
      setFormData(prev => ({...prev, referredBy: referralCode}));
    }
  }, [referralCode]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onSignup(formData);
      // App.tsx handles navigation to login on success
    } catch (err: any) {
        setError(err.message || 'Failed to create account. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-4">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Create Your <span className="text-brand-orange">Account</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <Input label="First Name" id="firstName" type="text" value={formData.firstName} onChange={handleChange} required disabled={isLoading} />
            <Input label="Last Name" id="lastName" type="text" value={formData.lastName} onChange={handleChange} required disabled={isLoading} />
          </div>
          <Input label="Email" id="email" type="email" value={formData.email} onChange={handleChange} required disabled={isLoading} />
          <Input label="Phone" id="phone" type="tel" value={formData.phone} onChange={handleChange} required disabled={isLoading} />
          <Input label="Password" id="password" type="password" value={formData.password} onChange={handleChange} required disabled={isLoading} />
          <div>
            <Input
              label="Referral Code (Optional)"
              id="referredBy"
              type="text"
              value={formData.referredBy}
              onChange={handleChange}
              readOnly={!!referralCode}
              disabled={isLoading}
              className={!!referralCode ? 'bg-gray-800/60 cursor-not-allowed' : ''}
            />
            {referralCode && (
                <p className="mt-2 text-sm text-green-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Referral code <strong className="font-semibold mx-1 text-green-300 truncate">{referralCode}</strong> applied.
                </p>
            )}
          </div>
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <Button type="submit" variant="success" className="w-full !mt-6" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} className="font-semibold text-brand-orange hover:underline">
            Log In
          </button>
        </p>
      </Card>
    </div>
  );
};

export default SignupPage;
