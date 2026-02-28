import { ArrowLeft, Share2, Heart, Play } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { HeroImage } from './HeroImage';
import { StatsBar } from './StatsBar';
import { ImageCarousel } from './ImageCarousel';
import { motion } from 'framer-motion';
import type { Candidate } from '../lib/api';

interface CandidateProfileProps {
  candidate: Candidate | undefined;
  onBack: () => void;
  onVote: (candidateId: string) => void;
  rank?: number;
  categoryPercentage?: number;
  favorites?: string[];
  toggleFavorite?: (candidateId: string) => void;
}

export function CandidateProfile({ candidate, onBack, onVote, rank = 0, categoryPercentage = 0, favorites = [], toggleFavorite }: CandidateProfileProps) {
  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Candidat non trouvé</p>
      </div>
    );
  }

  const totalVotes = candidate.votes;

  const handleShare = () => {
    const text = `Votez pour ${candidate.name} au concours Miss & Master IAI-Cameroun! 🌟`;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Miss & Master IAI - ${candidate.name}`,
        text,
        url,
      }).catch(() => {});
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
      window.open(whatsappUrl, '_blank');
    }
    toast.success('Lien de partage copié!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-900"
    >
      <div className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center px-4 pt-10 pb-4">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBack(); }}
          className="rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-lg hover:bg-white border border-gray-200 dark:border-gray-700 min-w-[44px] min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-gray-100" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(); }}
          className="rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-lg hover:bg-white border border-gray-200 dark:border-gray-700 min-w-[44px] min-h-[44px]"
        >
          <Share2 className="w-5 h-5 text-gray-900 dark:text-gray-100" />
        </Button>
      </div>

      <HeroImage src={candidate.photo} alt={candidate.name} />

      <div className="max-w-md mx-auto relative z-10">
        <div className="text-center -mt-20 mb-8 relative z-20">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-white mb-1 drop-shadow-md">{candidate.name}</h1>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium border border-white/30 uppercase tracking-wider">
              Candidat {candidate.category.toUpperCase()}
            </span>
          </motion.div>
        </div>

        <StatsBar
          rank={rank}
          votes={totalVotes}
          categoryPercentage={categoryPercentage}
        />

        <div className="px-4 mt-6 space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-3 px-1">À Propos</h3>
            <Card className="p-5 border-none shadow-sm bg-white dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                {candidate.biography}
              </p>
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                {candidate.badges.map((badge) => (
                  <span
                    key={badge}
                    className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md"
                  >
                    #{badge === 'popular' ? 'Populaire' : 'JuryChoice'}
                  </span>
                ))}
              </div>
            </Card>
          </section>

          <section>
            <ImageCarousel images={candidate.gallery} title="Galerie Photos" />
          </section>

          {candidate.videoUrl && (
            <section>
              <h3 className="text-lg font-semibold mb-3 px-1">Vidéo de présentation</h3>
              <Card className="overflow-hidden rounded-xl border-none shadow-md">
                <div className="relative aspect-video bg-black">
                  <iframe
                    src={candidate.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play className="w-12 h-12 text-white/50" />
                  </div>
                </div>
              </Card>
            </section>
          )}

          <div className="h-4" />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 z-[100] safe-area-pb">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={`h-14 w-14 rounded-2xl border-2 flex-shrink-0 min-w-[56px] min-h-[56px] ${favorites.includes(candidate.id) ? 'bg-rose-50 border-rose-300 dark:bg-rose-950/30' : ''}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite?.(candidate.id); }}
          >
            <Heart className={`w-6 h-6 text-rose-500 ${favorites.includes(candidate.id) ? 'fill-current' : ''}`} />
          </Button>
          <Button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onVote(candidate.id); }}
            className={`flex-1 h-14 rounded-2xl text-lg font-semibold shadow-xl shadow-blue-900/20 ${
              candidate.category === 'miss'
                ? 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#fbbf24] text-black'
                : 'bg-gradient-to-r from-[#1e40af] to-[#2563eb] hover:from-[#1e3a8a] hover:to-[#1e40af]'
            }`}
          >
            Voter maintenant
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
