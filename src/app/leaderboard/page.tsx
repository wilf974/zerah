'use client';

import dynamic from 'next/dynamic';

// Importer le composant leaderboard avec ssr: false pour éviter le rendu serveur
const LeaderboardContent = dynamic(() => import('./leaderboard-client'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Chargement...</div>,
});

export default function LeaderboardPage() {
  return <LeaderboardContent />;
}
