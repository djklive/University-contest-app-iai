import { motion } from 'framer-motion';
import { Card } from './ui/card';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  trend?: { direction: 'up' | 'down'; percentage: number };
  color?: 'blue' | 'amber' | 'green' | 'rose' | 'purple';
  animated?: boolean;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color = 'blue',
  animated = true,
}: StatCardProps) {
  const colorClasses = {
    blue: 'text-[#1e40af] bg-blue-50 dark:bg-blue-950/30',
    amber: 'text-[#fbbf24] bg-amber-50 dark:bg-amber-950/30',
    green: 'text-green-600 bg-green-50 dark:bg-green-950/30',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30',
  };

  return (
    <Card className="p-4 backdrop-blur-md bg-white/60 dark:bg-gray-800/60 border-none shadow-lg">
      <motion.div
        initial={animated ? { opacity: 0, y: 10 } : false}
        animate={animated ? { opacity: 1, y: 0 } : false}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <span className={`text-xs font-semibold ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}%
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <motion.p
          className="text-2xl font-bold"
          initial={animated ? { opacity: 0 } : false}
          animate={animated ? { opacity: 1 } : false}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {typeof value === 'number' && animated ? (
            <CountingNumber value={value} />
          ) : (
            value
          )}
        </motion.p>
      </motion.div>
    </Card>
  );
}

// Composant auxiliaire pour animer les chiffres
function CountingNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const increment = value / 30;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 30);

    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue.toLocaleString()}</>;
}
