import { useState } from 'react';
import { BarChart3, Users, Heart } from 'lucide-react';
import { Header } from './components/Header';
import { useFavorites } from './hooks/useFavorites';
import { Dashboard } from './components/Dashboard';
import { CandidateGallery } from './components/CandidateGallery';
import { CandidateProfile } from './components/CandidateProfile';
import { PaymentModal } from './components/PaymentModal';
import { Toaster } from './components/ui/sonner';
import { AnimatePresence, motion } from 'framer-motion';

type View = 'dashboard' | 'gallery' | 'profile' | 'favorites' | 'profile-user';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [votingCandidateId, setVotingCandidateId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { favorites, toggleFavorite } = useFavorites();
  
  // Calculate votes remaining (assuming max 50 votes)
  const totalVotes = 50;
  const votesUsed = Object.values(votes).reduce((a, b) => a + b, 0);
  const votesRemaining = totalVotes - votesUsed;

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

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header 
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        votesRemaining={votesRemaining}
        totalVotes={totalVotes}
      />

      {/* Main Content */}
      <div className="max-w-md mx-auto pt-4 pb-32 min-h-screen">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={{ duration: 0.3 }}
            >
              <Dashboard votes={votes} />
            </motion.div>
          )}
          
          {currentView === 'gallery' && (
            <motion.div
              key="gallery"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={{ duration: 0.3 }}
            >
              <CandidateGallery
                votes={votes}
                onSelectCandidate={handleSelectCandidate}
                onVote={handleVote}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            </motion.div>
          )}

          {currentView === 'favorites' && (
            <motion.div
              key="favorites"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={{ duration: 0.3 }}
            >
              <CandidateGallery
                votes={votes}
                onSelectCandidate={handleSelectCandidate}
                onVote={handleVote}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                showFavoritesOnly={true}
              />
            </motion.div>
          )}

          {currentView === 'profile' && selectedCandidateId && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 z-50 bg-background"
            >
              <CandidateProfile
                candidateId={selectedCandidateId}
                votes={votes}
                onBack={handleBackFromProfile}
                onVote={handleVote}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      {currentView !== 'profile' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t dark:border-gray-800 nav-safe-area z-40">
          <div className="max-w-md mx-auto flex justify-between p-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'text-[#1e40af] dark:text-[#3b82f6] bg-blue-50 dark:bg-blue-950/30'
                  : 'text-muted-foreground'
              }`}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-[10px] font-medium">Dashboard</span>
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
              <span className="text-[10px] font-medium">Candidats</span>
            </button>

            <button
              onClick={() => setCurrentView('favorites')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'favorites'
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30'
                  : 'text-muted-foreground'
              }`}
            >
              <Heart className={`w-6 h-6 ${currentView === 'favorites' ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">Favoris</span>
            </button>

            {/* <button
              onClick={() => setCurrentView('profile-user')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'profile-user'
                  ? 'text-purple-600 bg-purple-50 dark:bg-purple-950/30'
                  : 'text-muted-foreground'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-[10px] font-medium">Profil</span>
            </button> */}
          </div>
        </div>
      )}

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
