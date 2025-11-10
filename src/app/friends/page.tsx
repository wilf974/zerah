'use client';

import dynamic from 'next/dynamic';

// Importer le composant friends avec ssr: false pour éviter le rendu serveur
const FriendsContent = dynamic(() => import('./friends-client'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Chargement...</div>,
});

export default function FriendsPage() {
  return <FriendsContent />;
}
