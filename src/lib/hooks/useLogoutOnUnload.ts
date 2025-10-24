import { useEffect } from 'react';

/**
 * Hook personnalisé pour appeler le logout quand l'utilisateur ferme la page
 * Utilise l'événement beforeunload pour envoyer une requête de déconnexion
 */
export function useLogoutOnUnload() {
  useEffect(() => {
    const handleBeforeUnload = async () => {
      console.log('[logout] User closing page, logging out...');
      try {
        await fetch('/api/auth/logout', { 
          method: 'POST',
          keepalive: true, // Important: garder la requête même si la page se ferme
        });
      } catch (error) {
        console.error('[logout] Error logging out on page close:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
