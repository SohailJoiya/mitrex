import React, { useState, useMemo, useEffect } from 'react';
import { User, TeamMember } from '../../types';
import Card from '../../components/Card';
import api from '../../services/api';
import Icon from '../../components/Icon';
import { formatDate } from '../../processors';

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

// Define interfaces for the new API response
interface TeamLevelStats {
  count: number;
  investment: number;
  active: number;
  inactive: number;
}

interface TeamLevel {
  members: TeamMember[];
  stats: TeamLevelStats;
}

interface TeamLevelsData {
  [level: string]: TeamLevel;
}

const TeamPage: React.FC<{ user: User }> = ({ user }) => {
  const [activeLevel, setActiveLevel] = useState(1);
  const [teamLevels, setTeamLevels] = useState<TeamLevelsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [filterLevels, setFilterLevels] = useState<number | null>(null);
  const [appliedTier, setAppliedTier] = useState<number | null>(null);

  useEffect(() => {
    const fetchTeamLevels = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filterTier) {
          params.append('tier', filterTier.toString());
        }
        if (filterLevels) {
          params.append('levels', filterLevels.toString());
        }
        const queryString = params.toString() ? `?${params.toString()}` : '';
        
        const response: { levels: TeamLevelsData; appliedTier: number | null } = await api.get(`/api/team/levels${queryString}`);
        
        setAppliedTier(response.appliedTier);

        // Process members inside the response to format dates and map IDs
        const processedLevels: TeamLevelsData = {};
        for (const level in response.levels) {
            processedLevels[level] = {
                ...response.levels[level],
                members: response.levels[level].members.map((member: any) => ({
                    id: member._id,
                    name: member.name,
                    joinDate: formatDate(member.joinDate),
                    status: member.status,
                    investment: member.investment,
                    directCount: member.directCount ?? 0,
                    indirectCount: member.indirectCount ?? 0,
                }))
            }
        }
        setTeamLevels(processedLevels);
      } catch (error) {
        console.error("Failed to fetch team levels data:", error);
        setTeamLevels(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamLevels();
  }, [filterTier, filterLevels]);

  useEffect(() => {
    if (teamLevels && !teamLevels[activeLevel]) {
      setActiveLevel(1);
    }
  }, [teamLevels, activeLevel]);

  const overviewStats = useMemo(() => {
    if (!teamLevels) {
      return { totalMembers: 0, totalInvestment: 0, activeMembers: 0, inactiveMembers: 0 };
    }
    // FIX: Explicitly type `acc` and `level` to resolve TypeScript inference errors.
    return Object.values(teamLevels).reduce((acc: { totalMembers: number; totalInvestment: number; activeMembers: number; inactiveMembers: number; }, level: TeamLevel) => {
      acc.totalMembers += level.stats.count;
      acc.totalInvestment += level.stats.investment;
      acc.activeMembers += level.stats.active;
      acc.inactiveMembers += level.stats.inactive;
      return acc;
    }, { totalMembers: 0, totalInvestment: 0, activeMembers: 0, inactiveMembers: 0 });
  }, [teamLevels]);

  const membersByLevel = useMemo(() => {
    if (!teamLevels || !teamLevels[activeLevel]) {
      return [];
    }
    return teamLevels[activeLevel].members;
  }, [teamLevels, activeLevel]);

  const levelTabs = useMemo(() => {
    if (isLoading || !teamLevels) {
        const defaultTabs = filterLevels ? Array.from({ length: filterLevels }, (_, i) => i + 1) : [1, 2, 3, 4, 5];
        return defaultTabs;
    }
    const levels = Object.keys(teamLevels).map(Number).sort((a,b) => a - b);
    return levels.length > 0 ? levels : [1];
  }, [teamLevels, isLoading, filterLevels]);

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
        <StatCard title="Total Team Members" value={isLoading ? '...' : overviewStats.totalMembers} icon={<Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1-3.72a4 4 0 00-3-3.72m-3 3.72a4 4 0 00-3 3.72M3 21v-1a6 6 0 016-6m-6 6h12M15 21a6 6 0 00-6-6m6 6v-1a6 6 0 01-6-6" />} />
        <StatCard title="Total Team Investment" value={isLoading ? '...' : overviewStats.totalInvestment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<Icon path="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125h.375m18 3.75h.75a.75.75 0 00.75-.75v-.75m0 0h-.75a.75.75 0 00-.75.75v.75m-7.5-3v4.5m-4.5-4.5v4.5m1.5.75h1.5m-1.5-1.5h1.5m-1.5-1.5h1.5m3-3h1.5m-1.5-1.5h1.5m-1.5-1.5h1.5" />} />
        <StatCard title="Active Members" value={isLoading ? '...' : overviewStats.activeMembers} icon={<Icon path="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />} />
        <StatCard title="Inactive Members" value={isLoading ? '...' : overviewStats.inactiveMembers} icon={<Icon path="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />} />
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
                <label htmlFor="tier-filter" className="block text-sm font-medium text-gray-400 mb-1">Filter by Tier Qualification</label>
                <select 
                  id="tier-filter" 
                  onChange={e => setFilterTier(e.target.value ? parseInt(e.target.value) : null)} 
                  value={filterTier || ''}
                  className="w-full bg-brand-dark/50 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-brand-orange focus:border-transparent focus:bg-brand-surface transition-all duration-200 shadow-inner shadow-black/20"
                >
                    <option value="">All Tiers</option>
                    {[1, 2, 3, 4, 5].map(t => <option key={t} value={t}>Tier {t}</option>)}
                </select>
            </div>
            <div className="flex-1 w-full">
                <label htmlFor="levels-filter" className="block text-sm font-medium text-gray-400 mb-1">Limit Level Depth</label>
                <select 
                  id="levels-filter"
                  onChange={e => setFilterLevels(e.target.value ? parseInt(e.target.value) : null)}
                  value={filterLevels || ''}
                  className="w-full bg-brand-dark/50 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-brand-orange focus:border-transparent focus:bg-brand-surface transition-all duration-200 shadow-inner shadow-black/20"
                >
                    <option value="">All Levels</option>
                    {[1, 2, 3, 4, 5].map(l => <option key={l} value={l}>Up to Level {l}</option>)}
                </select>
            </div>
            {appliedTier !== null && (
                <div className="text-sm text-green-400 p-2.5 bg-green-500/10 rounded-lg whitespace-nowrap mt-2 md:mt-6">
                    Applied Tier {appliedTier} Rules
                </div>
            )}
        </div>
      </Card>

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
                <th className="p-4 text-sm font-semibold text-gray-400 text-center">Directs</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-center">Indirects</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Investment</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">Loading team members...</td>
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
                    <td className="p-4 text-center text-gray-300">{member.directCount}</td>
                    <td className="p-4 text-center text-gray-300">{member.indirectCount}</td>
                    <td className="p-4 text-right font-semibold text-green-400">${(member.investment || 0).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500">
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
