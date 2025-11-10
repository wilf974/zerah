'use client';

import dynamic from 'next/dynamic';

// Importer le composant discussions avec ssr: false pour éviter le rendu serveur
const DiscussionsContent = dynamic(() => import('./discussions-client'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Chargement...</div>,
});

export default function DiscussionsPage() {
  return <DiscussionsContent />;
}
