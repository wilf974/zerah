'use client';

import dynamic from 'next/dynamic';

// Importer le composant challenges avec ssr: false pour éviter le rendu serveur
const ChallengesContent = dynamic(() => import('./challenges-client'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Chargement...</div>,
});

export default function ChallengesPage() {
  return <ChallengesContent />;
}
