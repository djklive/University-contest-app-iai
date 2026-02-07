import { useState } from 'react';
import { Heart, Award, Star } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { candidates } from '../lib/mockData';
import { SearchBar } from './SearchBar';
import { FilterTabs } from './FilterTabs';
import { FavoriteButton } from './FavoriteButton';

interface CandidateGalleryProps {
  votes: Record<string, number>;
  onSelectCandidate: (candidateId: string) => void;
  onVote: (candidateId: string) => void;
  favorites: Set<string>;
  toggleFavorite: (candidateId: string) => void;
  showFavoritesOnly?: boolean;
}

export function CandidateGallery({ 
  votes, 
  onSelectCandidate, 
  onVote,
  favorites,
  toggleFavorite,
  showFavoritesOnly = false
}: CandidateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');

  const getCandidateVotes = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    return (candidate?.votes || 0) + (votes[candidateId] || 0);
  };

  const filters = ['Tous', 'Miss', 'Master', 'Populaire', 'Jury'];

  const filteredCandidates = candidates.filter(candidate => {
    // Search filter
    if (searchQuery && !candidate.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Favorites filter
    if (showFavoritesOnly && !favorites.has(candidate.id)) {
      return false;
    }

    // Category/Tag filter
    if (activeFilter === 'Tous') return true;
    if (activeFilter === 'Miss') return candidate.category === 'miss';
    if (activeFilter === 'Master') return candidate.category === 'master';
    if (activeFilter === 'Populaire') return candidate.badges.includes('popular');
    if (activeFilter === 'Jury') return candidate.badges.includes('jury');
    
    return true;
  });

  const renderCandidateCard = (candidate: typeof candidates[0]) => (
    <Card
      key={candidate.id}
      className="overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-105"
      onClick={() => onSelectCandidate(candidate.id)}
    >
      <div className="relative aspect-[3/4]">
        <img
          src={candidate.photo}
          alt={candidate.name}
          className="w-full h-full object-cover"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1 flex-col items-start">
          {candidate.badges.includes('jury') && (
            <Badge className="bg-purple-500 text-white border-none">
              <Award className="w-3 h-3 mr-1" />
              Jury
            </Badge>
          )}
          {candidate.badges.includes('popular') && (
            <Badge className="bg-rose-500 text-white border-none">
              <Star className="w-3 h-3 mr-1" />
              Populaire
            </Badge>
          )}
        </div>

        {/* Favorite & Vote Count */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
             <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Heart className="w-3 h-3 fill-white" />
            {getCandidateVotes(candidate.id)}
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <FavoriteButton 
              isFavorite={favorites.has(candidate.id)}
              onToggle={() => toggleFavorite(candidate.id)}
              size="sm"
            />
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-white mb-2 font-bold">{candidate.name}</h3>
          <p className="text-gray-300 text-xs mb-3 line-clamp-1">{candidate.biography}</p>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onVote(candidate.id);
            }}
            size="sm"
            className={`w-full ${
              candidate.category === 'miss' 
                ? 'bg-[#fbbf24] hover:bg-[#f59e0b] text-black' 
                : 'bg-[#1e40af] hover:bg-[#1e3a8a]'
            }`}
          >
            Voter
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="pb-20 px-4">
      {!showFavoritesOnly && (
        <>
          <div className="bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] p-6 rounded-2xl text-white mb-6 shadow-lg">
            <h1 className="text-white text-xl font-bold mb-1">Candidats</h1>
            <p className="text-blue-100 text-sm">Découvrez nos talents et votez!</p>
          </div>

          <div className="mb-6 flex flex-col sm:items-center gap-6">
            <SearchBar onSearch={setSearchQuery} />
            <FilterTabs 
              filters={filters} 
              activeFilter={activeFilter} 
              onFilterChange={setActiveFilter} 
            />
          </div>
        </>
      )}

      {showFavoritesOnly && (
        <div className="mb-6 mt-2">
            <h1 className="text-2xl font-bold mb-2">Mes Favoris</h1>
            <p className="text-muted-foreground text-sm">
                {filteredCandidates.length > 0 
                    ? `Vous avez ${filteredCandidates.length} favori(s).` 
                    : "Vous n'avez pas encore de favoris."}
            </p>
        </div>
      )}

      {filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-20">
            {filteredCandidates.map(renderCandidateCard)}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
            <p>Aucun candidat trouvé.</p>
        </div>
      )}
    </div>
  );
}
