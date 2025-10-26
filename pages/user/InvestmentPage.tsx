import React, { useState } from 'react';
import InvestmentModal from '../../components/InvestmentModal';

interface InvestmentPlan {
  name: string;
  investment: number;
  dailyProfit: number;
  monthlyProfit: number;
}

const investmentPlans: InvestmentPlan[] = [
  { name: 'Crypto Forge', investment: 35, dailyProfit: 0.70, monthlyProfit: 21.00 },
  { name: 'Crypto Forge', investment: 50, dailyProfit: 1.00, monthlyProfit: 30.00 },
  { name: 'Hash Power', investment: 100, dailyProfit: 2.00, monthlyProfit: 60.00 },
  { name: 'Hash Power', investment: 150, dailyProfit: 3.00, monthlyProfit: 90.00 },
  { name: 'Block Pulse', investment: 200, dailyProfit: 4.00, monthlyProfit: 120.00 },
  { name: 'Core Miner', investment: 500, dailyProfit: 10.00, monthlyProfit: 300.00 },
  { name: 'Quantum Rig', investment: 1000, dailyProfit: 20.00, monthlyProfit: 600.00 },
  { name: 'Titan Rig', investment: 5000, dailyProfit: 100.00, monthlyProfit: 3000.00 },
];

const planThemes: { [key: string]: { gradient: string } } = {
  'Crypto Forge': { gradient: 'from-yellow-500 to-orange-500' },
  'Hash Power': { gradient: 'from-cyan-400 to-blue-500' },
  'Block Pulse': { gradient: 'from-blue-500 to-purple-600' },
  'Core Miner': { gradient: 'from-purple-500 to-pink-500' },
  'Quantum Rig': { gradient: 'from-brand-orange to-red-500' },
  'Titan Rig': { gradient: 'from-red-600 to-gray-900' },
};

const InvestmentPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<{name: string, range: string} | null>(null);

  const handleSelectPlan = (plan: InvestmentPlan) => {
    setSelectedPlan({
        name: plan.name,
        range: `$${plan.investment}`,
    });
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">Investment Packages</h1>
        <p className="text-lg text-gray-400 mt-2">Choose a plan that fits your ambition.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {investmentPlans.map((plan, index) => (
          <div
            key={plan.investment}
            className="relative rounded-xl animated-border-wrapper transform transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_35px_rgba(255,122,0,0.2)]"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div 
              className={`flex flex-col h-full rounded-xl overflow-hidden shadow-2xl shadow-black/30 bg-gradient-to-br ${planThemes[plan.name]?.gradient ?? 'from-gray-700 to-gray-800'}`}
            >
              <div className="p-6 text-white flex-grow flex flex-col justify-between text-center">
                <div>
                  <p className="text-sm uppercase tracking-wider opacity-80">Investment</p>
                  <p className="text-5xl font-extrabold my-2 text-shadow">
                    ${plan.investment}
                  </p>
                  <div className="mt-6 space-y-3 text-left bg-black/20 p-4 rounded-lg border border-white/10">
                    <div className="flex justify-between items-baseline text-sm">
                        <span className="text-white/80">Daily Profit (2%)</span>
                        <span className="font-semibold text-white">${plan.dailyProfit.toFixed(2)} / day</span>
                    </div>
                     <hr className="border-white/10" />
                    <div className="flex justify-between items-baseline text-sm">
                        <span className="text-white/80">Monthly Profit</span>
                        <span className="font-semibold text-white">${plan.monthlyProfit.toFixed(2)} / month</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                    <button 
                        onClick={() => handleSelectPlan(plan)}
                        className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                        Invest Now
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <InvestmentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />

      <style>{`
        @keyframes card-enter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes rotate-border {
          100% {
            transform: rotate(1turn);
          }
        }
        .animated-border-wrapper {
          opacity: 0;
          animation: card-enter 0.5s ease-out forwards;
        }
        .animated-border-wrapper::before {
          content: '';
          position: absolute;
          z-index: -1;
          inset: -2px; /* Controls border thickness */
          border-radius: inherit;
          background: conic-gradient(
            from 180deg at 50% 50%,
            #ff7a00 0%, 
            #ffdd00 25%, 
            #1affd1 50%, 
            #007bff 75%, 
            #ff7a00 100%
          );
          animation: rotate-border 4s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .animated-border-wrapper:hover::before {
          opacity: 1;
        }
        .text-shadow {
            text-shadow: 0px 2px 10px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default InvestmentPage;