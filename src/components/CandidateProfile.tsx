import { ArrowLeft, Share2, Heart, Award, Star, Play } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { candidates } from '../lib/mockData';
import { toast } from 'sonner';

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
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2>{candidate.name}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-6 p-4">
        {/* Video Player */}
        {candidate.videoUrl && (
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-gray-900">
              <iframe
                src={candidate.videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Play className="w-16 h-16 text-white opacity-50" />
              </div>
            </div>
          </Card>
        )}

        {/* Stats & Badges */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="w-5 h-5 fill-current text-red-500" />
              <span>{totalVotes} votes</span>
            </div>
            <div className="flex gap-2">
              {candidate.badges.includes('jury') && (
                <Badge className="bg-purple-500 text-white border-none">
                  <Award className="w-3 h-3 mr-1" />
                  Coup de cœur Jury
                </Badge>
              )}
              {candidate.badges.includes('popular') && (
                <Badge className="bg-rose-500 text-white border-none">
                  <Star className="w-3 h-3 mr-1" />
                  Plus Populaire
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Image Gallery */}
        <div>
          <h3 className="mb-3">Galerie Photos</h3>
          <div className="grid grid-cols-3 gap-2">
            {candidate.gallery.map((photo, index) => (
              <Card key={index} className="overflow-hidden aspect-square">
                <img
                  src={photo}
                  alt={`${candidate.name} - Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </Card>
            ))}
          </div>
        </div>

        {/* Biography */}
        <Card className="p-4">
          <h3 className="mb-3">Biographie</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {candidate.biography}
          </p>
        </Card>

        {/* Vote Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t">
          <Button
            onClick={() => onVote(candidate.id)}
            className={`w-full h-14 text-lg ${
              candidate.category === 'miss'
                ? 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#fbbf24] text-black'
                : 'bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] hover:from-[#1e3a8a] hover:to-[#1e40af]'
            }`}
          >
            <Heart className="w-5 h-5 mr-2" />
            Voter pour 100 FCFA
          </Button>
        </div>
      </div>
    </div>
  );
}
