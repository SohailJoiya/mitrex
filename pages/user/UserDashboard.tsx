import React, { useState, useEffect, useRef } from 'react';
import { User, ProfitHistoryItem, DailyClaim } from '../../types';
import Button from '../../components/Button';
import Card from '../../components/Card';
import api from '../../services/api';

const AnimatedNumber: React.FC<{
  value: number;
  prefix?: string;
  decimals?: number;
}> = ({ value, prefix = '', decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const startValue = prevValueRef.current;
    prevValueRef.current = value;
    let startTime: number | null = null;
    const duration = 1200; // ms

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const newDisplayValue = startValue + (value - startValue) * progress;
      
      setDisplayValue(newDisplayValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);

  }, [value]);

  return (
    <span>
      {prefix}{displayValue.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; icon?: React.ReactNode }> = ({ title, value, icon }) => {
  const isCurrency = title.toLowerCase().includes('profit') ||
                     title.toLowerCase().includes('investment') ||
                     title.toLowerCase().includes('withdrawal') ||
                     title.toLowerCase().includes('balance');
  
  const hasDecimals = isCurrency || title === 'FIN2X Rate' || (typeof value === 'number' && value % 1 !== 0);

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-400">{title}</h3>
        {icon}
      </div>
      <div className="text-3xl font-bold text-white mt-2">
      {typeof value === 'number' ? (
        <AnimatedNumber 
          value={value}
          prefix={isCurrency || title === 'FIN2X Rate' ? '$' : ''}
          decimals={hasDecimals ? 2 : 0}
        />
      ) : (
        <span>{value}</span>
      )}
      </div>
    </Card>
  );
};

const ShareIcon: React.FC<{ path: string }> = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
    </svg>
);

interface UserDashboardProps {
  user: User;
  onNavigate: (page: 'deposit' | 'withdraw') => void;
  dailyClaim: DailyClaim | null;
  onClaimSuccess: () => Promise<void>;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onNavigate, dailyClaim, onClaimSuccess }) => {
  const [copiedReferral, setCopiedReferral] = React.useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const shareContainerRef = useRef<HTMLDivElement>(null);
  const [profitHistory, setProfitHistory] = useState<ProfitHistoryItem[]>(user.profitHistory);
  const [countdown, setCountdown] = useState('');

  const referralLink = user.referralLink || `https://flareautoearning.com/ref/${user.referralCode}`;

  useEffect(() => {
    setProfitHistory(user.profitHistory);
  }, [user.profitHistory]);

  useEffect(() => {
    if (dailyClaim && !dailyClaim.eligible && dailyClaim.nextClaimAt) {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const nextClaimTime = new Date(dailyClaim.nextClaimAt).getTime();
            const distance = nextClaimTime - now;

            if (distance < 0) {
                setCountdown('Ready to claim!');
                clearInterval(interval);
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [dailyClaim]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleClaimProfit = async () => {
    try {
        await api.post('/api/profit/claim-daily', {});
        setClaimMessage(`Congratulations! Your daily profit has been claimed.`);
        await onClaimSuccess();
    } catch (err: any) {
        setClaimMessage(err.message || 'Failed to claim profit.');
    } finally {
        setTimeout(() => setClaimMessage(''), 3000);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (shareContainerRef.current && !shareContainerRef.current.contains(event.target as Node)) {
            setIsShareOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const shareText = `Join me on Flare Auto Earning and start earning! Use my referral link to sign up:`;
  const shareOptions = [
    { name: 'WhatsApp', icon: <ShareIcon path="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.62 15.35 3.52 16.84L2.25 21.75L7.33 20.52C8.75 21.36 10.36 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2M12.04 3.67C16.56 3.67 20.28 7.39 20.28 11.91C20.28 16.43 16.56 20.15 12.04 20.15C10.48 20.15 8.99 19.72 7.73 18.96L7.33 18.72L4.39 19.57L5.27 16.71L5.02 16.31C4.18 14.97 3.8 13.47 3.8 11.91C3.8 7.39 7.52 3.67 12.04 3.67M9.13 7.5C8.91 7.5 8.7 7.58 8.54 7.82C8.38 8.06 7.83 8.67 7.83 9.81C7.83 10.95 8.56 12.04 8.7 12.22C8.84 12.4 10.41 14.82 12.83 15.76C15.25 16.7 15.65 16.53 16.01 16.49C16.37 16.45 17.32 15.9 17.51 15.31C17.7 14.72 17.7 14.23 17.61 14.13C17.52 14.03 17.33 13.97 17.08 13.85C16.83 13.73 15.65 13.16 15.41 13.06C15.17 12.96 15.01 12.91 14.85 13.16C14.69 13.4 14.18 13.97 14.03 14.13C13.88 14.29 13.73 14.33 13.48 14.21C13.23 14.09 12.24 13.76 11.08 12.74C10.16 11.95 9.53 11.01 9.39 10.77C9.25 10.53 9.38 10.4 9.51 10.27C9.62 10.16 9.77 9.97 9.92 9.81C10.07 9.65 10.12 9.54 10.22 9.35C10.32 9.15 10.27 8.99 10.2 8.87C10.13 8.75 9.61 7.5 9.39 7.5" />, url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}%20${encodeURIComponent(referralLink)}` },
    { name: 'Facebook', icon: <ShareIcon path="M17 2H14C11.24 2 9 4.24 9 7V10H6V14H9V22H13V14H16L17 10H13V7C13 6.45 13.45 6 14 6H17V2Z" />, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}` },
    { name: 'Twitter', icon: <ShareIcon path="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.22-1.95-.55v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.94.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.01-.06C3.43 18.5 5.66 19.5 8.14 19.5c5.64 0 8.73-4.67 8.73-8.73 0-.13 0-.26-.01-.39.6-.43 1.12-.98 1.54-1.6z" />, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}` },
    { name: 'Telegram', icon: <ShareIcon path="M11.95 14.94l.46-2.25-2.32.99-2.2-1.03 8.1-3.41c.64-.26.23.1.02.26l-6.1 5.46-1.77 5.43c.27-.05.51-.17.7-.33l1.9-1.82 3.84 2.82c.4.23.83.12 1-.29l2.4-11.4c.23-.9-.45-1.38-1.12-1.12l-12.8 4.94c-.9.34-.89.88-.14 1.1l3.23.99 7.4-4.66c.35-.22.67-.1.39.18" />, url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}` },
    { name: 'Email', icon: <ShareIcon path="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />, url: `mailto:?subject=${encodeURIComponent('Invitation to join Flare Auto Earning')}&body=${encodeURIComponent(shareText)}%20${encodeURIComponent(referralLink)}` },
  ];
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedShare(true);
    setTimeout(() => {
        setCopiedShare(false);
        setIsShareOpen(false); // Close dropdown after copying
    }, 1500);
  };
  
  return (
    <div className="space-y-8">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-2">Wallet Balance</h2>
          <p className="text-5xl font-bold text-brand-orange mb-4">
            <AnimatedNumber value={user.walletBalance} prefix="$" decimals={2} />
          </p>
          <div className="flex space-x-4">
            <Button onClick={() => onNavigate('deposit')}>Deposit</Button>
            <Button onClick={() => onNavigate('withdraw')} variant="secondary">Withdraw</Button>
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-bold text-white mb-2">Referral Link</h2>
          <div className="flex items-center bg-gray-800 rounded-md p-2 border border-gray-600">
            <input type="text" readOnly value={referralLink} className="bg-transparent text-sm text-gray-300 w-full focus:outline-none"/>
            <button onClick={copyReferralLink} className="ml-2 px-3 py-1 bg-brand-orange text-white rounded text-sm">
              {copiedReferral ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Share this link to grow your team.</p>
        </Card>
      </div>

      {/* Claim Daily Profit */}
       <Card className="bg-gradient-to-r from-brand-orange/10 to-transparent">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-grow text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">Claim Your Daily Profit</h2>
            {claimMessage && <p className="text-sm text-green-400 mt-2 transition-opacity duration-300">{claimMessage}</p>}
            {user.walletBalance < 35 ? (
              <p className="text-sm text-yellow-500 mt-1">Your wallet balance must be at least $35 to claim the bonus.</p>
            ) : (
              !dailyClaim?.eligible && countdown && (
                <p className="text-sm text-gray-400 mt-1">Next claim in: <span className="font-semibold text-gray-300">{countdown}</span></p>
              )
            )}
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
            <img 
              src="https://placehold.co/200x80/ff7a00/161616/png?text=BONUS!" 
              alt="Advertisement" 
              className="rounded-lg object-cover"
            />
            <Button 
              onClick={handleClaimProfit} 
              disabled={!dailyClaim?.eligible || user.walletBalance < 35}
              className="w-full sm:w-auto flex-shrink-0 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
            >
              {dailyClaim?.eligible ? 'Claim Now' : 'Claimed for Today'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Earnings Summary Section */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4">Earnings Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard title="Today's Profit" value={user.dailyProfit} />
          <StatCard title="Total Profit" value={user.totalProfit} />
        </div>
      </div>
      
      {/* Advertisement Card */}
      <Card className="!p-0">
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-8 flex items-center justify-between flex-wrap gap-4 rounded-xl">
          <div>
            <h3 className="text-3xl font-extrabold text-white">Invite Friends & Earn More!</h3>
            <p className="text-blue-200 mt-1">Get up to <span className="font-bold">10% commission</span> on every referral investment.</p>
          </div>
          <div ref={shareContainerRef} className="relative">
            <Button 
              onClick={() => setIsShareOpen(prev => !prev)}
              className="flex items-center !px-4"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                Share Now
            </Button>
            {isShareOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-brand-surface ring-1 ring-white/10 z-20 border border-white/10 origin-top-right animate-scale-in-dropdown">
                <div className="p-2">
                  {shareOptions.map(option => (
                    <a
                      key={option.name}
                      href={option.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {option.icon}
                      <span className="ml-3">{option.name}</span>
                    </a>
                  ))}
                  <button
                    onClick={copyShareLink}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-left"
                  >
                    <ShareIcon path="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                    <span className="ml-3">{copiedShare ? 'Link Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Profit History Section */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4">Profit History</h2>
        <Card>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="p-4 text-sm font-semibold text-gray-400">Date</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Type</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Description</th>
                            <th className="p-4 text-sm font-semibold text-gray-400 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profitHistory.map((item, index) => (
                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                                <td className="p-4 text-sm text-gray-300 whitespace-nowrap">{item.date}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                                    item.type === 'Daily Profit' ? 'bg-blue-500/20 text-blue-400' :
                                    item.type === 'Referral Bonus' ? 'bg-green-500/20 text-green-400' :
                                    'bg-purple-500/20 text-purple-400'
                                  }`}>
                                    {item.type}
                                  </span>
                                </td>
                                <td className="p-4 text-sm">{item.description}</td>
                                <td className="p-4 font-semibold text-green-400 text-right whitespace-nowrap">+${(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
      </div>

      {/* Network Stats Section */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4">Network Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Team Size" value={user.teamSize} />
          <StatCard title="Withdrawal" value={user.totalWithdrawal} />
          <StatCard title="Investment" value={user.totalInvested} />
        </div>
      </div>
      
      {/* Documents Section */}
      <div>
          <h2 className="text-2xl font-semibold text-white mb-4">Documents & Resources</h2>
          <Card>
            <div className="flex flex-col sm:flex-row gap-4 justify-around">
                <a href="/whitepaper.pdf" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="secondary" className="w-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        Whitepaper
                    </Button>
                </a>
                <a href="/terms-of-service.pdf" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="secondary" className="w-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        Terms of Service
                    </Button>
                </a>
            </div>
          </Card>
      </div>

      <style>{`
        @keyframes scale-in-dropdown {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-scale-in-dropdown {
          animation: scale-in-dropdown 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;