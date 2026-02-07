# Code Examples - Composants Réutilisables

## 1. Composant Header Amélioré

```tsx
// src/components/Header.tsx
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
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
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
```

---

## 2. Barre de Recherche et Filtres

```tsx
// src/components/SearchBar.tsx
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Rechercher un candidat...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value);
        }}
        className="pl-10 pr-10"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
```

```tsx
// src/components/FilterTabs.tsx
import { Badge } from './ui/badge';
import { Filter } from 'lucide-react';

interface FilterTabsProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterTabs({ filters, activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
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
```

---

## 3. Système de Favoris

```tsx
// src/hooks/useFavorites.ts
import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const saved = localStorage.getItem('favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  const isFavorite = (candidateId: string) => favorites.has(candidateId);

  const toggleFavorite = (candidateId: string) => {
    setFavorites((prev) => {
      const newFavs = new Set(prev);
      if (newFavs.has(candidateId)) {
        newFavs.delete(candidateId);
      } else {
        newFavs.add(candidateId);
      }
      return newFavs;
    });
  };

  return { favorites, isFavorite, toggleFavorite };
}
```

```tsx
// src/components/FavoriteButton.tsx
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({ isFavorite, onToggle, size = 'md' }: FavoriteButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
    >
      <Button
        variant={isFavorite ? 'default' : 'outline'}
        size={size}
        className={`gap-2 rounded-full ${
          isFavorite ? 'bg-rose-500 hover:bg-rose-600 border-0' : ''
        }`}
      >
        <Heart
          className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
        />
        {isFavorite ? 'Favorisé' : 'Ajouter aux favoris'}
      </Button>
    </motion.button>
  );
}
```

---

## 4. Composant Stepper pour Modal Paiement

```tsx
// src/components/Stepper.tsx
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          {/* Step Indicator */}
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full font-semibold transition-all',
              currentStep > step.id
                ? 'bg-green-500 text-white'
                : currentStep === step.id
                ? 'bg-[#1e40af] text-white ring-2 ring-blue-300'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            )}
          >
            {currentStep > step.id ? (
              <Check className="w-4 h-4" />
            ) : (
              step.id
            )}
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-1 mx-2 transition-all',
                currentStep > step.id
                  ? 'bg-green-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 5. Animation Confetti

```tsx
// src/components/ConfettiAnimation.tsx
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export function ConfettiAnimation() {
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 2 + Math.random() * 0.5,
    color: ['#1e40af', '#fbbf24', '#ec4899', '#14b8a6'][
      Math.floor(Math.random() * 4)
    ],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: `${piece.left}%`,
            y: -20,
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            y: window.innerHeight,
            opacity: 0,
            rotate: 720,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn',
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: piece.color }}
        />
      ))}
    </div>
  );
}
```

---

## 6. Skeleton Loader

```tsx
// src/components/LoadingSkeleton.tsx
export function CandidateSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 animate-pulse"
        />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 pb-20">
      {/* Header Skeleton */}
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

      {/* Cards Skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
    </div>
  );
}
```

---

## 7. Carousel d'Images

```tsx
// src/components/ImageCarousel.tsx
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface ImageCarouselProps {
  images: string[];
  title?: string;
}

export function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}

      <div className="relative group">
        {/* Main Image */}
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            {/* Indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-white w-6'
                      : 'bg-white/50'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Counter */}
      <p className="text-xs text-center text-muted-foreground">
        {currentIndex + 1} / {images.length}
      </p>
    </div>
  );
}
```

---

## 8. Carte Statistique Animée

```tsx
// src/components/StatCard.tsx
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  trend?: { direction: 'up' | 'down'; percentage: number };
  color?: 'blue' | 'amber' | 'green' | 'rose';
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
```

---

## 9. Notifications Système

```tsx
// src/hooks/useNotifications.ts
import { toast } from 'sonner';

export const showNotification = {
  success: (message: string) =>
    toast.success(message, {
      position: 'top-center',
      duration: 3000,
    }),

  error: (message: string) =>
    toast.error(message, {
      position: 'top-center',
      duration: 3000,
    }),

  info: (message: string) =>
    toast.loading(message, {
      position: 'top-center',
      duration: 3000,
    }),

  voteSuccess: (candidateName: string, voteCount: number) =>
    toast.success(
      `✨ ${voteCount} vote(s) ajouté(s) pour ${candidateName}!`,
      { position: 'top-center', duration: 4000 }
    ),

  newLeader: (candidateName: string) =>
    toast.info(`🏆 ${candidateName} est nouveau leader!`, {
      position: 'top-center',
      duration: 4000,
    }),

  trending: (candidateName: string) =>
    toast.info(`📈 ${candidateName} gagne en popularité!`, {
      position: 'top-center',
      duration: 4000,
    }),
};
```

---

## 10. Utils et Helpers

```tsx
// src/lib/animation-utils.ts
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};
```

---

**Tous ces composants sont prêts à être intégrés dans votre application!** ✨
