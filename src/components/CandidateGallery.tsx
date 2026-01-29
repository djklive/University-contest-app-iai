import { Heart, Award, Star } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { candidates } from '../lib/mockData';

interface CandidateGalleryProps {
  votes: Record<string, number>;
  onSelectCandidate: (candidateId: string) => void;
  onVote: (candidateId: string) => void;
}

export function CandidateGallery({ votes, onSelectCandidate, onVote }: CandidateGalleryProps) {
  const getCandidateVotes = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    return (candidate?.votes || 0) + (votes[candidateId] || 0);
  };

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
        <div className="absolute top-2 left-2 flex gap-1">
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

        {/* Vote Count */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <Heart className="w-3 h-3 fill-white" />
          {getCandidateVotes(candidate.id)}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-white mb-2">{candidate.name}</h3>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onVote(candidate.id);
            }}
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

  const missCandidates = candidates.filter(c => c.category === 'miss');
  const masterCandidates = candidates.filter(c => c.category === 'master');

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] p-6 rounded-2xl text-white mb-6">
        <h1 className="text-white mb-2">Candidats</h1>
        <p className="text-blue-100 text-sm">Votez pour votre favori(e)</p>
      </div>

      <Tabs defaultValue="miss" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="miss" className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-black">
            Miss ({missCandidates.length})
          </TabsTrigger>
          <TabsTrigger value="master" className="data-[state=active]:bg-[#1e40af]">
            Master ({masterCandidates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="miss" className="mt-0">
          <div className="grid grid-cols-2 gap-4">
            {missCandidates.map(renderCandidateCard)}
          </div>
        </TabsContent>

        <TabsContent value="master" className="mt-0">
          <div className="grid grid-cols-2 gap-4">
            {masterCandidates.map(renderCandidateCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
