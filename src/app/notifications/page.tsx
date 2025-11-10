'use client';

import dynamic from 'next/dynamic';

// Importer le composant notifications avec ssr: false pour éviter le rendu serveur
const NotificationsContent = dynamic(() => import('./notifications-client'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Chargement...</div>,
});

export default function NotificationsPage() {
  return <NotificationsContent />;
}
