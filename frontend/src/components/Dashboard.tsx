import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getStats, type Stats } from '../lib/api';

interface DashboardProps {
  loading: boolean;
}

export function Dashboard({ loading }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch((e) => {
        if (!cancelled) setStatsError(e instanceof Error ? e.message : 'Erreur stats');
      });
    return () => { cancelled = true; };
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 pb-20">
        <div className="bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] p-6 rounded-2xl text-white">
          <h1 className="text-white mb-2">Statistiques Globales</h1>
          <p className="text-blue-100 text-sm">Concours Miss & Master IAI-Cameroun</p>
        </div>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          {loading ? 'Chargement...' : statsError || 'Chargement des statistiques...'}
        </div>
      </div>
    );
  }

  const { totalVotes, missVotes, masterVotes, missRanking, masterRanking } = stats;
  const pieData = [
    { name: 'Miss', value: missVotes, color: '#fbbf24' },
    { name: 'Master', value: masterVotes, color: '#1e40af' },
  ];

  const getLeaderGap = (ranking: { totalVotes: number }[]) => {
    if (ranking.length < 2) return 0;
    return ranking[0].totalVotes - ranking[1].totalVotes;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] p-6 rounded-2xl text-white">
        <h1 className="text-white mb-2">Statistiques Globales</h1>
        <p className="text-blue-100 text-sm">Concours Miss & Master IAI-Cameroun</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 backdrop-blur-md bg-white/60 dark:bg-gray-800/60 border-none shadow-lg">
          <div className="flex flex-col items-center text-center">
            <Users className="w-6 h-6 text-[#1e40af] mb-2" />
            <p className="text-sm text-muted-foreground">Total Votes</p>
            <p className="text-2xl mt-1">{totalVotes}</p>
          </div>
        </Card>

        <Card className="p-4 backdrop-blur-md bg-white/60 dark:bg-gray-800/60 border-none shadow-lg">
          <div className="flex flex-col items-center text-center">
            <Trophy className="w-6 h-6 text-[#fbbf24] mb-2" />
            <p className="text-sm text-muted-foreground">Miss Votes</p>
            <p className="text-2xl mt-1">{missVotes}</p>
          </div>
        </Card>

        <Card className="p-4 backdrop-blur-md bg-white/60 dark:bg-gray-800/60 border-none shadow-lg">
          <div className="flex flex-col items-center text-center">
            <TrendingUp className="w-6 h-6 text-[#1e40af] mb-2" />
            <p className="text-sm text-muted-foreground">Master Votes</p>
            <p className="text-2xl mt-1">{masterVotes}</p>
          </div>
        </Card>
      </div>

      {/* Vote Distribution Chart */}
      <Card className="p-4 backdrop-blur-md bg-white/60 dark:bg-gray-800/60 border-none shadow-lg">
        <h3 className="mb-4">Distribution des Votes</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Miss Leaderboard */}
      <Card className="p-5 backdrop-blur-md bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-[#fbbf24]" />
          <h2 className="text-[#fbbf24]">Top Miss</h2>
        </div>
        {missRanking.length >= 2 && (
          <div className="mb-4 p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Écart 1er - 2ème</p>
            <div className="flex items-center gap-2">
              <Progress value={missRanking[0].totalVotes ? (getLeaderGap(missRanking) / missRanking[0].totalVotes) * 100 : 0} className="flex-1 h-2" />
              <span className="text-sm">{getLeaderGap(missRanking)} votes</span>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {missRanking.slice(0, 3).map((entry, index) => (
            <div key={entry.id} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                index === 0 ? 'bg-[#fbbf24] text-white' :
                index === 1 ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300' :
                'bg-orange-300 dark:bg-orange-700 text-orange-800 dark:text-orange-200'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate">{entry.name}</p>
                <p className="text-xs text-muted-foreground">{entry.totalVotes} votes</p>
              </div>
              {index === 0 && <Trophy className="w-5 h-5 text-[#fbbf24]" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Top Master Leaderboard */}
      <Card className="p-5 backdrop-blur-md bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-[#1e40af]" />
          <h2 className="text-[#1e40af]">Top Master</h2>
        </div>
        {masterRanking.length >= 2 && (
          <div className="mb-4 p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Écart 1er - 2ème</p>
            <div className="flex items-center gap-2">
              <Progress value={masterRanking[0].totalVotes ? (getLeaderGap(masterRanking) / masterRanking[0].totalVotes) * 100 : 0} className="flex-1 h-2" />
              <span className="text-sm">{getLeaderGap(masterRanking)} votes</span>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {masterRanking.slice(0, 3).map((entry, index) => (
            <div key={entry.id} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                index === 0 ? 'bg-[#1e40af] text-white' :
                index === 1 ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300' :
                'bg-orange-300 dark:bg-orange-700 text-orange-800 dark:text-orange-200'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate">{entry.name}</p>
                <p className="text-xs text-muted-foreground">{entry.totalVotes} votes</p>
              </div>
              {index === 0 && <Trophy className="w-5 h-5 text-[#1e40af]" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
