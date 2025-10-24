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

    // Compter les utilisateurs actifs aujourd'hui
    // Critères: ont créé une entrée OU se sont connectés aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrowStart = new Date(today);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    console.log('[stats] Date range:', { today, tomorrowStart });

    // 1. Utilisateurs avec entrées créées aujourd'hui
    const entriesWithUsers = await prisma.habitEntry.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrowStart,
        },
      },
      select: {
        habit: {
          select: {
            userId: true,
          },
        },
      },
    });

    // 2. Utilisateurs avec sessions créées aujourd'hui (connectés aujourd'hui)
    const sessionsToday = await prisma.session.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrowStart,
        },
      },
      select: {
        userId: true,
      },
    });

    console.log('[stats] Entries today:', entriesWithUsers.length);
    console.log('[stats] Sessions today:', sessionsToday.length);

    // Combiner les deux listes et compter les utilisateurs uniques
    const userIds = new Set<number>();
    
    entriesWithUsers.forEach(e => userIds.add(e.habit.userId));
    sessionsToday.forEach(s => userIds.add(s.userId));

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
