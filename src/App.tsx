import { useState } from 'react';
import { BarChart3, Users, Moon, Sun } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { CandidateGallery } from './components/CandidateGallery';
import { CandidateProfile } from './components/CandidateProfile';
import { PaymentModal } from './components/PaymentModal';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';

type View = 'dashboard' | 'gallery' | 'profile';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [votingCandidateId, setVotingCandidateId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setCurrentView('profile');
  };

  const handleVote = (candidateId: string) => {
    setVotingCandidateId(candidateId);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (candidateId: string, votesCount: number) => {
    setVotes((prev) => ({
      ...prev,
      [candidateId]: (prev[candidateId] || 0) + votesCount,
    }));
  };

  const handleBackFromProfile = () => {
    setCurrentView('gallery');
    setSelectedCandidateId(null);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto">
        {currentView === 'dashboard' && <Dashboard votes={votes} />}
        
        {currentView === 'gallery' && (
          <CandidateGallery
            votes={votes}
            onSelectCandidate={handleSelectCandidate}
            onVote={handleVote}
          />
        )}

        {currentView === 'profile' && selectedCandidateId && (
          <CandidateProfile
            candidateId={selectedCandidateId}
            votes={votes}
            onBack={handleBackFromProfile}
            onVote={handleVote}
          />
        )}

        {/* Bottom Navigation */}
        {currentView !== 'profile' && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t dark:border-gray-800">
            <div className="max-w-md mx-auto flex justify-around p-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
                  currentView === 'dashboard'
                    ? 'text-[#1e40af] dark:text-[#3b82f6] bg-blue-50 dark:bg-blue-950/30'
                    : 'text-muted-foreground'
                }`}
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-xs">Statistiques</span>
              </button>

              <button
                onClick={() => setCurrentView('gallery')}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
                  currentView === 'gallery'
                    ? 'text-[#fbbf24] dark:text-[#fbbf24] bg-amber-50 dark:bg-amber-950/30'
                    : 'text-muted-foreground'
                }`}
              >
                <Users className="w-6 h-6" />
                <span className="text-xs">Candidats</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        candidateId={votingCandidateId}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setVotingCandidateId(null);
        }}
        onSuccess={handlePaymentSuccess}
      />

      {/* Toast Notifications */}
      <Toaster position="top-center" />
    </div>
  );
}
