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
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <Button
        variant={isFavorite ? 'default' : 'outline'}
        size={size === 'md' ? 'default' : size as any}
        className={`gap-2 rounded-full ${
          isFavorite ? 'bg-rose-500 hover:bg-rose-600 border-0' : ''
        }`}
        onClick={onToggle}
      >
        <Heart
          className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
        />
        {isFavorite ? 'Favorisé' : 'Ajouter aux favoris'}
      </Button>
    </motion.div>
  );
}
