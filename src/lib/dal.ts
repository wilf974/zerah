import 'server-only';
import { cache } from 'react';
import { getSession as getSessionFromCookie } from './session';

/**
 * DAL (Data Access Layer) - Récupère la session utilisateur
 */
export const getSession = getSessionFromCookie;

/**
 * DAL (Data Access Layer) - Vérifie et retourne la session utilisateur
 * Cette fonction est cachée par React pour éviter les appels multiples
 * @returns Session utilisateur vérifiée ou null
 */
export const verifySession = cache(async () => {
  const session = await getSession();

  if (!session || !session.userId) {
    return null;
  }

  // Vérifier si la session n'est pas expirée
  if (new Date(session.expiresAt) < new Date()) {
    return null;
  }

  return {
    isAuth: true,
    userId: session.userId,
    email: session.email,
  };
});



