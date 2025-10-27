'use client';

import dynamic from 'next/dynamic';

// Importer le composant de feedback avec ssr: false pour éviter le rendu serveur
const FeedbackContent = dynamic(() => import('./feedback-client'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Chargement...</div>,
});

export default function FeedbackPage() {
  return <FeedbackContent />;
}
