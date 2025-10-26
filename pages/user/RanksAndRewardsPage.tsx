import React from 'react';
import Card from '../../components/Card';
import { User } from '../../types';

const Icon = ({ path, className }: { path: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${className}`} fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

interface RewardTier {
  target: number;
  reward: number;
  title: string;
  description: string;
  theme: {
    gradient: string;
    textColor: string;
    shadow: string;
  };
}

const rewardTiers: RewardTier[] = [
  {
    target: 2000,
    reward: 300,
    title: 'Achiever',
    description: 'For dedicated team builders.',
    theme: {
      gradient: 'from-cyan-500 to-blue-500',
      textColor: 'text-cyan-200',
      shadow: 'shadow-cyan-500/30',
    },
  },
  {
    target: 5000,
    reward: 750,
    title: 'Motivator',
    description: 'For strong network leaders.',
    theme: {
      gradient: 'from-purple-500 to-indigo-500',
      textColor: 'text-purple-200',
      shadow: 'shadow-purple-500/30',
    },
  },
  {
    target: 10000,
    reward: 1550,
    title: 'Visionary',
    description: 'For elite platform champions.',
    theme: {
      gradient: 'from-brand-orange to-red-600',
      textColor: 'text-orange-200',
      shadow: 'shadow-orange-500/30',
    },
  },
];

interface RanksAndRewardsPageProps {
    user: User;
}

const RanksAndRewardsPage: React.FC<RanksAndRewardsPageProps> = ({ user }) => {
    const currentProgress = user.teamInvested; 
    const nextTier = rewardTiers.find(tier => tier.target > currentProgress) || rewardTiers[rewardTiers.length - 1];
    const progressPercentage = Math.min((currentProgress / nextTier.target) * 100, 100);
    const achievedTier = rewardTiers.slice().reverse().find(tier => currentProgress >= tier.target);


    return (
        <div className="space-y-12 max-w-6xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white">Monthly Target Rewards</h1>
                <p className="text-lg text-gray-400 mt-2">Achieve monthly team investment goals to unlock powerful bonuses.</p>
            </div>

            {/* Progress Section */}
            <Card>
                <h2 className="text-2xl font-semibold text-white mb-4">Your Progress This Month</h2>
                <div className="flex justify-between items-end mb-2 text-sm sm:text-base">
                    <p className="text-gray-300">Current Team Investment: <span className="font-bold text-white">${currentProgress.toLocaleString()}</span></p>
                    {/* FIX: Correctly access textColor from the theme object. */}
                    <p className={`font-semibold ${nextTier.theme.textColor}`}>Next Target: ${nextTier.target.toLocaleString()}</p>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-5 border border-gray-600">
                    <div className="bg-gradient-to-r from-orange-500 to-brand-orange h-full rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                {currentProgress < nextTier.target ? (
                    <p className="text-xs text-gray-400 mt-2 text-right">
                        ${(nextTier.target - currentProgress).toLocaleString()} more to unlock the {nextTier.title} reward!
                    </p>
                 ) : (
                    <p className="text-sm font-semibold text-green-400 mt-2 text-right">
                        Congratulations! You've unlocked all rewards for this month.
                    </p>
                 )
                }
            </Card>

            {/* Reward Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {rewardTiers.map((tier, index) => (
                    <div
                        key={tier.title}
                        className={`reward-card rounded-xl shadow-2xl ${tier.theme.shadow} bg-gradient-to-br ${tier.theme.gradient} transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] ${currentProgress >= tier.target ? 'border-2 border-green-400' : ''}`}
                        style={{ animationDelay: `${index * 150}ms` }}
                    >
                        {currentProgress >= tier.target && 
                            <div className="absolute top-4 right-4 bg-green-500/80 text-white text-xs font-bold px-3 py-1 rounded-full">ACHIEVED</div>
                        }
                        <div className="p-8 text-white flex flex-col h-full">
                            <h3 className="text-3xl font-bold">{tier.title}</h3>
                            <p className="opacity-80 mb-6">{tier.description}</p>
                            
                            <div className="space-y-4 my-auto">
                                <div className="flex items-center space-x-4">
                                    <Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" className={tier.theme.textColor} />
                                    <div>
                                        <p className="text-sm opacity-80">Monthly Team Investment</p>
                                        <p className="font-bold text-xl">${tier.target.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Icon path="M13 10V3L4 14h7v7l9-11h-7z" className={tier.theme.textColor} />
                                    <div>
                                        <p className="text-sm opacity-80">Reward</p>
                                        <p className="font-bold text-xl">${tier.reward.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Card>
                <h2 className="text-2xl font-semibold text-white mb-4">How It Works</h2>
                <div className="space-y-4 text-gray-300">
                    <p>The Monthly Target Reward is a bonus paid out for achieving specific team investment goals within a single calendar month.</p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>The "Team Investment" is the total sum of new investments made by you and <strong className="text-white">every member in your downline</strong> (direct and indirect referrals across all levels).</li>
                        <li>The calculation resets on the 1st of every month.</li>
                        <li>If you reach a target, you will receive the corresponding reward. You only receive the reward for the highest tier you achieve in a month.</li>
                    </ul>
                    <div className="bg-brand-dark/50 p-4 rounded-lg border border-gray-700">
                        <p className="font-semibold text-white">Example:</p>
                        <p className="text-sm">If your team (including your own investment) collectively invests <strong className="text-brand-orange">$5,500</strong> in November, you will qualify for the <strong className="text-purple-300">Motivator</strong> tier and receive a <strong className="text-green-400">$750</strong> bonus at the end of the month.</p>
                    </div>
                </div>
            </Card>

            <style>{`
                @keyframes card-fade-in {
                    from { opacity: 0; transform: translateY(25px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .reward-card {
                    opacity: 0;
                    animation: card-fade-in 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default RanksAndRewardsPage;
