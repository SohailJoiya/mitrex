import React, { useState, useEffect } from 'react';
import Button from './Button';

interface InvestmentPlan {
  name: string;
  range: string;
}

interface InvestmentModalProps {
  plan: InvestmentPlan | null;
  onClose: () => void;
}

const planThemes: { [key: string]: { gradient: string; glowFrom: string; glowTo: string; } } = {
  'BASIC': {
    gradient: 'from-green-400 to-green-600',
    glowFrom: 'from-green-400/40',
    glowTo: 'to-green-600/40',
  },
  'STANDARD': {
    gradient: 'from-orange-400 to-orange-600',
    glowFrom: 'from-orange-400/40',
    glowTo: 'to-orange-600/40',
  },
  'PREMIUM': {
    gradient: 'from-blue-500 to-blue-700',
    glowFrom: 'from-blue-500/40',
    glowTo: 'to-blue-700/40',
  },
  'Crypto Forge': {
    gradient: 'from-yellow-500 to-orange-500',
    glowFrom: 'from-yellow-500/40',
    glowTo: 'to-orange-500/40',
  },
  'Hash Power': {
    gradient: 'from-cyan-400 to-blue-500',
    glowFrom: 'from-cyan-400/40',
    glowTo: 'to-blue-500/40',
  },
  'Block Pulse': {
    gradient: 'from-blue-500 to-purple-600',
    glowFrom: 'from-blue-500/40',
    glowTo: 'to-purple-600/40',
  },
  'Core Miner': {
    gradient: 'from-purple-500 to-pink-500',
    glowFrom: 'from-purple-500/40',
    glowTo: 'to-pink-500/40',
  },
  'Quantum Rig': {
    gradient: 'from-brand-orange to-red-500',
    glowFrom: 'from-brand-orange/40',
    glowTo: 'to-red-500/40',
  },
  'Titan Rig': {
    gradient: 'from-red-600 to-gray-900',
    glowFrom: 'from-red-600/40',
    glowTo: 'to-gray-900/40',
  },
};


const InvestmentModal: React.FC<InvestmentModalProps> = ({ plan, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const theme = plan ? planThemes[plan.name] : null;

  useEffect(() => {
    if (plan) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [plan]);


  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  if (!plan) return null;

  const binanceId = '123456789';
  const network = 'BEP20';

  const handleCopy = () => {
    navigator.clipboard.writeText(binanceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const animationClass = isClosing ? 'animate-fade-out' : 'animate-fade-in';

  return (
    <div
      className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${animationClass}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="investment-modal-title"
    >
      <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {theme && (
            <div className={`absolute -inset-4 bg-gradient-to-br ${theme.glowFrom} ${theme.glowTo} rounded-full blur-3xl opacity-80 animate-pulse-slow -z-10`}></div>
        )}
        <div className={`relative bg-brand-surface/70 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
            <div className="absolute top-0 left-0 w-full h-40">
                <div className={`w-full h-full bg-gradient-to-br ${theme?.gradient} opacity-20`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-surface/70 via-brand-surface/50 to-transparent"></div>
            </div>

            <div className="relative p-8">
                <div className="flex justify-end items-start -mt-4 -mr-4">
                    <button onClick={handleClose} className="text-gray-400 hover:text-white text-3xl leading-none" aria-label="Close modal">&times;</button>
                </div>

                <div className="text-center -mt-4">
                    <h2 id="investment-modal-title" className="text-3xl font-bold text-white">
                        {plan.name}
                    </h2>
                    <p className="text-2xl font-bold text-brand-orange mt-1 mb-6">{plan.range}</p>
                </div>
                
                <div className="space-y-4">
                    <p className="text-gray-300 text-center text-sm">
                      To complete your investment, please send the desired amount to our official Binance account.
                    </p>

                    <div className="bg-brand-dark/50 p-4 rounded-xl border border-white/10">
                        <h3 className="text-lg font-semibold text-brand-orange mb-3">Official Binance Account</h3>
                        
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Account ID:</p>
                            <div 
                                className="flex items-center justify-between font-mono bg-gray-900/50 p-3 rounded-md my-1 border border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-colors"
                                onClick={handleCopy}
                                tabIndex={0}
                                onKeyPress={(e) => e.key === 'Enter' && handleCopy()}
                                role="button"
                            >
                                <span className="text-white">{binanceId}</span>
                                <span className="text-sm font-sans font-semibold text-brand-orange">
                                    {copied ? 'Copied!' : 'Copy'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Network:</p>
                            <p className="font-mono bg-gray-900/50 p-3 rounded-md my-1 border border-gray-700 text-white">{network}</p>
                        </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center pt-2">
                        After sending payment, go to the <strong className="font-semibold text-gray-400">Deposit</strong> page and submit your transaction details for verification.
                    </p>
                </div>

                <div className="mt-6 text-right">
                    <Button onClick={handleClose} variant="secondary">Close</Button>
                </div>
            </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-fade-out {
            animation: fade-out 0.3s ease-in forwards;
        }
        @keyframes scale-in {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        @keyframes scale-out {
            from { transform: scale(1); opacity: 1; }
            to { transform: scale(0.95); opacity: 0; }
        }
        .animate-scale-in {
            animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scale-out {
            animation: scale-out 0.3s cubic-bezier(0.7, 0, 0.84, 0) forwards;
        }
        @keyframes pulse-slow {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
        }
        .animate-pulse-slow {
            animation: pulse-slow 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default InvestmentModal;