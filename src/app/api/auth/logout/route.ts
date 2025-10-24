import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/session';

/**
 * API Route: POST /api/auth/logout
 * Supprime la session de l'utilisateur et efface le cookie
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    // Supprimer la session de la base de données si elle existe
    if (session) {
      try {
        const sessionData = await decrypt(session);
        if (sessionData?.userId) {
          // Supprimer toutes les sessions de cet utilisateur
          await prisma.session.deleteMany({
            where: {
              userId: sessionData.userId,
            },
          });
          console.log(`[logout] Sessions supprimées pour userId: ${sessionData.userId}`);
        }
      } catch (error) {
        console.error('[logout] Erreur lors du déchiffrement:', error);
      }
    }

    // Supprimer le cookie
    cookieStore.delete('session');

    return NextResponse.json(
      { message: 'Déconnexion réussie' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[logout] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}







