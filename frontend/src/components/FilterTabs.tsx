import { Badge } from './ui/badge';
import { Filter } from 'lucide-react';

interface FilterTabsProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterTabs({ filters, activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      {filters.map((filter) => (
        <Badge
          key={filter}
          variant={activeFilter === filter ? 'default' : 'outline'}
          className="cursor-pointer whitespace-nowrap"
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </Badge>
      ))}
    </div>
  );
}
