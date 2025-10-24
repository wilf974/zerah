import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API Route: GET /api/auth/stats
 * Retourne les statistiques d'utilisation de l'application
 * - Nombre d'utilisateurs inscrits
 * - Nombre d'utilisateurs actifs aujourd'hui
 */
export async function GET(request: NextRequest) {
  try {
    // Compter tous les utilisateurs inscrits (non supprimés)
    const totalUsers = await prisma.user.count({
      where: {
        isDeleted: false,
      },
    });

    console.log('[stats] Total users:', totalUsers);

    // Compter les utilisateurs ACTIFS EN CE MOMENT (10 dernières minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    console.log('[stats] Time window:', { tenMinutesAgo, now: new Date() });

    // Trouver les sessions actives (modifiées dans les 10 dernières minutes)
    const activeSessions = await prisma.session.findMany({
      where: {
        updatedAt: {
          gte: tenMinutesAgo,
        },
      },
      select: {
        userId: true,
      },
    });

    console.log('[stats] Active sessions (10min):', activeSessions.length);

    // Compter les utilisateurs uniques
    const userIds = new Set(activeSessions.map(s => s.userId));
    const onlineUsers = userIds.size;

    console.log('[stats] Online users (unique):', onlineUsers);

    return NextResponse.json(
      {
        totalUsers,
        onlineUsers,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[stats] Error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des statistiques',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
