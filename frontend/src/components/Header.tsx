import { Moon, Sun, Heart } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  votesRemaining?: number;
  totalVotes?: number;
}

export function Header({
  isDarkMode,
  onToggleDarkMode,
  votesRemaining = 0,
  totalVotes = 50
}: HeaderProps) {
  const votesUsed = totalVotes - votesRemaining;
  const percentage = (votesUsed / totalVotes) * 100;

  return (
    <header className="sticky top-0 z-100 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 pt-8 pb-4 transition-all duration-300">
      <div className="max-w-md mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#1e40af] to-[#fbbf24] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">IAI</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">IAI Campus</h1>
            <p className="text-xs text-muted-foreground">Concours Miss & Master</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Vote Counter */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30">
            <Heart className="w-4 h-4 text-[#1e40af]" />
            <span className="text-sm font-semibold">{votesRemaining}/{totalVotes}</span>
          </div>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDarkMode}
            className="rounded-full"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Vote Progress Bar */}
      {votesRemaining > 0 && (
        <div className="max-w-md mx-auto px-4 pb-3">
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1e40af] to-[#fbbf24] transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
