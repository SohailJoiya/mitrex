import React, { useState, useMemo, useEffect } from 'react';
import { User, TeamMember } from '../../types';
import Card from '../../components/Card';
import api from '../../services/api';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <Card>
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0 bg-brand-orange/10 text-brand-orange p-3 rounded-full">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  </Card>
);

const Icon = ({ path, className = 'w-6 h-6' }: { path: string; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

const TeamPage: React.FC<{ user: User }> = ({ user }) => {
  const [activeLevel, setActiveLevel] = useState(1);
  const [team, setTeam] = useState<TeamMember[]>(user.team || []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      setIsLoading(true);
      try {
        // FIX: Handle API responses that might be an object with a 'results' property or a plain array.
        const response: any = await api.get('/api/users/referral-tree');
        setTeam(response.results || response || []);
      } catch (error) {
        console.error("Failed to fetch team data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const teamStats = useMemo(() => {
    const totalMembers = team.length;
    const activeMembers = team.filter(m => m.status === 'Active').length;
    const totalInvestment = team.reduce((sum, member) => sum + (member.investment || 0), 0);
    return {
      totalMembers,
      activeMembers,
      inactiveMembers: totalMembers - activeMembers,
      totalInvestment: totalInvestment.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    };
  }, [team]);

  const membersByLevel = useMemo(() => {
    return team.filter(member => member.level === activeLevel);
  }, [team, activeLevel]);

  const levelTabs = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">My Team Network</h1>
        <p className="text-gray-400 mt-2">
          View your team's structure, performance, and growth across different levels.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Team Members" value={teamStats.totalMembers} icon={<Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1-3.72a4 4 0 00-3-3.72m-3 3.72a4 4 0 00-3 3.72M3 21v-1a6 6 0 016-6m-6 6h12M15 21a6 6 0 00-6-6m6 6v-1a6 6 0 01-6-6" />} />
        <StatCard title="Total Team Investment" value={teamStats.totalInvestment} icon={<Icon path="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125h.375m18 3.75h.75a.75.75 0 00.75-.75v-.75m0 0h-.75a.75.75 0 00-.75.75v.75m-7.5-3v4.5m-4.5-4.5v4.5m1.5.75h1.5m-1.5-1.5h1.5m-1.5-1.5h1.5m3-3h1.5m-1.5-1.5h1.5m-1.5-1.5h1.5" />} />
        <StatCard title="Active Members" value={teamStats.activeMembers} icon={<Icon path="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />} />
        <StatCard title="Inactive Members" value={teamStats.inactiveMembers} icon={<Icon path="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />} />
      </div>

      {/* Team Table Section */}
      <Card>
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Team Levels">
            {levelTabs.map(level => (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                className={`${
                  activeLevel === level
                    ? 'border-brand-orange text-brand-orange'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                } whitespace-nowrap py-3 px-2 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
              >
                Level {level}
              </button>
            ))}
          </nav>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-4 text-sm font-semibold text-gray-400">Name</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Join Date</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Investment</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                    <td colSpan={4} className="text-center p-8 text-gray-500">Loading team members...</td>
                </tr>
              ) : membersByLevel.length > 0 ? (
                membersByLevel.map((member) => (
                  <tr key={member.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4 font-medium text-white">{member.name}</td>
                    <td className="p-4 text-gray-300">{member.joinDate}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        member.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold text-green-400">${(member.investment || 0).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-gray-500">
                    No members at this level yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TeamPage;
