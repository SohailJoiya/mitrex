import React from 'react';

const Icon = ({ path, className }: { path: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

interface TeamLevelData {
  level: number;
  title: string;
  investment: string;
  directMembers?: number;
  indirectMembers?: number;
  theme: {
    gradient: string;
    iconColor: string;
  };
}

const levelsData: TeamLevelData[] = [
  {
    level: 1,
    title: 'Starter',
    investment: '$35 - $499',
    theme: {
      gradient: 'from-gray-700 to-gray-800',
      iconColor: 'text-gray-300',
    },
  },
  {
    level: 2,
    title: 'Builder',
    investment: '$500 - $1499',
    directMembers: 3,
    indirectMembers: 5,
    theme: {
      gradient: 'from-cyan-500 to-blue-500',
      iconColor: 'text-cyan-200',
    },
  },
  {
    level: 3,
    title: 'Leader',
    investment: '$1500 - $2999',
    directMembers: 5,
    indirectMembers: 15,
    theme: {
      gradient: 'from-purple-500 to-indigo-500',
      iconColor: 'text-purple-200',
    },
  },
  {
    level: 4,
    title: 'Pro',
    investment: '$3000 - $4999',
    directMembers: 10,
    indirectMembers: 25,
    theme: {
      gradient: 'from-pink-500 to-rose-500',
      iconColor: 'text-pink-200',
    },
  },
  {
    level: 5,
    title: 'Elite',
    investment: '$5000+',
    directMembers: 20,
    indirectMembers: 70,
    theme: {
      gradient: 'from-brand-orange to-red-600',
      iconColor: 'text-orange-200',
    },
  },
];

const RequirementItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3">
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <p className="text-sm text-white/70">{label}</p>
      <p className="font-bold text-white">{value}</p>
    </div>
  </div>
);

const TeamLevelsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">Team Levels</h1>
        <p className="text-lg text-gray-400 mt-2">Unlock new potentials as you grow your team and investment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {levelsData.map((level, index) => (
          <div
            key={level.level}
            className={`level-card rounded-xl shadow-2xl shadow-black/30 bg-gradient-to-br ${level.theme.gradient} transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-[0_0_35px_rgba(255,255,255,0.1)]`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-8 text-white flex flex-col h-full">
              <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold opacity-80">Level {level.level}</p>
                    <h3 className="text-3xl font-bold">{level.title}</h3>
                  </div>
                  <div className="text-5xl font-black opacity-10">{level.level}</div>
              </div>
              
              <div className="mt-8 space-y-5 flex-grow">
                <RequirementItem
                  icon={<Icon path="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" className={level.theme.iconColor} />}
                  label="Investment Range"
                  value={level.investment}
                />
                {level.directMembers !== undefined && (
                  <RequirementItem
                    icon={<Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" className={level.theme.iconColor} />}
                    label="Direct Members"
                    value={level.directMembers}
                  />
                )}
                {level.indirectMembers !== undefined && (
                  <RequirementItem
                    icon={<Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" className={level.theme.iconColor} />}
                    label="Indirect Members"
                    value={level.indirectMembers}
                  />
                )}
              </div>

            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes card-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .level-card {
          opacity: 0;
          animation: card-fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TeamLevelsPage;