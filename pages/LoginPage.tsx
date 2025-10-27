import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';

interface LoginPageProps {
  onLogin: (credentials: {email: string, password: string}) => Promise<void>;
  onNavigate: (page: 'signup' | 'landing' | 'forgot-password') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = React.useState('user@example.com');
  const [password, setPassword] = React.useState('123456');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onLogin({ email, password });
      // On success, App.tsx will set the user and change the view.
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-4">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Log In to <span className="text-brand-orange">FAEARING</span>
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Email" 
            id="email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            placeholder="user@example.com"
            disabled={isLoading}
          />
          <div>
            <Input 
              label="Password" 
              id="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••"
              disabled={isLoading}
            />
             <div className="text-right mt-2">
                <button 
                    onClick={() => onNavigate('forgot-password')} 
                    type="button"
                    className="text-sm font-semibold text-brand-orange hover:underline focus:outline-none"
                >
                    Forgot Password?
                </button>
            </div>
          </div>
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <Button type="submit" variant="success" className="w-full !mt-8" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Log In'}
          </Button>
        </form>
        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{' '}
          <button onClick={() => onNavigate('signup')} className="font-semibold text-brand-orange hover:underline">
            Sign Up
          </button>
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;