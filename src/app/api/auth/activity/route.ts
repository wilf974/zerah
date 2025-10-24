import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/session';

/**
 * API Route: POST /api/auth/activity
 * Met à jour la dernière activité de l'utilisateur
 * Appelé régulièrement pour tracker l'inactivité
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer le cookie de session
    const session = request.cookies.get('session')?.value;
    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Déchiffrer le session token
    const sessionData = await decrypt(session);
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Session invalide' },
        { status: 401 }
      );
    }

    // Mettre à jour la dernière session active de l'utilisateur
    // Chercher la session la plus récente pour cet utilisateur
    const latestSession = await prisma.session.findFirst({
      where: {
        userId: sessionData.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (latestSession) {
      await prisma.session.update({
        where: {
          id: latestSession.id,
        },
        data: {
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('[activity] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour d\'activité' },
      { status: 500 }
    );
  }
}
