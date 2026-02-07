import { ArrowLeft, Share2, Heart, Play } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { candidates } from '../lib/mockData';
import { toast } from 'sonner';
import { HeroImage } from './HeroImage';
import { StatsBar } from './StatsBar';
import { ImageCarousel } from './ImageCarousel';
import { motion } from 'framer-motion';

interface CandidateProfileProps {
  candidateId: string;
  votes: Record<string, number>;
  onBack: () => void;
  onVote: (candidateId: string) => void;
}

export function CandidateProfile({ candidateId, votes, onBack, onVote }: CandidateProfileProps) {
  const candidate = candidates.find(c => c.id === candidateId);

  if (!candidate) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Candidat non trouvé</p>
      </div>
    );
  }

  const totalVotes = candidate.votes + (votes[candidateId] || 0);

  const handleShare = () => {
    const text = `Votez pour ${candidate.name} au concours Miss & Master IAI-Cameroun! 🌟`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: `Miss & Master IAI - ${candidate.name}`,
        text: text,
        url: url,
      }).catch(() => {});
    } else {
      // Fallback to WhatsApp
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
      {/* Header fixed */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 pt-10 pb-4 pointer-events-none">
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={onBack}
          className="rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-sm hover:bg-white/80 dark:hover:bg-black/80 pointer-events-auto"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-gray-100" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={handleShare}
          className="rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-sm hover:bg-white/80 dark:hover:bg-black/80 pointer-events-auto"
        >
          <Share2 className="w-5 h-5 text-gray-900 dark:text-gray-100" />
        </Button>
      </div>

      {/* Hero Section */}
      <HeroImage src={candidate.photo} alt={candidate.name} />

      <div className="max-w-md mx-auto relative z-10">
        {/* Title & Category - Floating on top of hero */}
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

        {/* Stats Bar */}
        <StatsBar 
            rank={2} // Mock rank for now
            votes={totalVotes}
            categoryPercentage={45} // Mock percentage
        />

        <div className="px-4 mt-6 space-y-6">
            
          {/* Biography */}
          <section>
            <h3 className="text-lg font-semibold mb-3 px-1">À Propos</h3>
            <Card className="p-5 border-none shadow-sm bg-white dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                {candidate.biography}
              </p>
              
              {/* Badges Tags */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                {candidate.badges.map(badge => (
                    <span key={badge} className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                        #{badge === 'popular' ? 'Populaire' : 'JuryChoice'}
                    </span>
                ))}
              </div>
            </Card>
          </section>

          {/* Gallery */}
          <section>
            <ImageCarousel images={candidate.gallery} title="Galerie Photos" />
          </section>

          {/* Video */}
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

          {/* Bottom Spacing */}
          <div className="h-4" />
        </div>
      </div>

      {/* Floating Vote Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 z-50 safe-area-pb">
        <div className="max-w-md mx-auto flex gap-3">
            <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-2xl border-2 flex-shrink-0"
            >
                <Heart className="w-6 h-6 text-rose-500" />
            </Button>
            <Button
                onClick={() => onVote(candidate.id)}
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
