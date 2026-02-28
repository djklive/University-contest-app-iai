import { StatCard } from './StatCard';
import { Trophy, TrendingUp, PieChart } from 'lucide-react';

interface StatsBarProps {
  rank: number;
  votes: number;
  categoryPercentage: number;
}

export function StatsBar({ rank, votes, categoryPercentage }: StatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-2 px-4 -mt-10 relative z-10 pt-4">
      <StatCard
        icon={Trophy}
        label="Rang"
        value={rank > 0 ? `#${rank}` : '–'}
        color="amber"
      />
      <StatCard
        icon={TrendingUp}
        label="Votes"
        value={votes}
        color="rose"
        trend={{ direction: 'up', percentage: 12 }}
      />
      <StatCard
        icon={PieChart}
        label="Part"
        value={categoryPercentage > 0 ? `${categoryPercentage}%` : '–'}
        color="blue"
      />
    </div>
  );
}
