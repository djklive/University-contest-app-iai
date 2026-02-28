import { useState } from 'react';
import { AdminCandidates } from '../components/AdminCandidates';
import { AdminVotePacks } from '../components/AdminVotePacks';
import { AdminPayments } from '../components/AdminPayments';
import { AdminVotes } from '../components/AdminVotes';

type Tab = 'candidates' | 'packs' | 'payments' | 'votes';

type Props = { onLogout: () => void };

export function Dashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('candidates');

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>Admin – Vote IAI</h1>
        <button type="button" className="btn btn-secondary" onClick={onLogout}>
          Déconnexion
        </button>
      </div>

      <div className="tabs">
        <button type="button" className={tab === 'candidates' ? 'active' : ''} onClick={() => setTab('candidates')}>
          Candidats
        </button>
        <button type="button" className={tab === 'packs' ? 'active' : ''} onClick={() => setTab('packs')}>
          Packs de vote
        </button>
        <button type="button" className={tab === 'payments' ? 'active' : ''} onClick={() => setTab('payments')}>
          Paiements
        </button>
        <button type="button" className={tab === 'votes' ? 'active' : ''} onClick={() => setTab('votes')}>
          Votes
        </button>
      </div>

      {tab === 'candidates' && <AdminCandidates />}
      {tab === 'packs' && <AdminVotePacks />}
      {tab === 'payments' && <AdminPayments />}
      {tab === 'votes' && <AdminVotes />}
    </div>
  );
}
