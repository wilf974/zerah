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

    // Compter les utilisateurs actifs aujourd'hui (ont une entrée d'habitude créée aujourd'hui)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrowStart = new Date(today);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    console.log('[stats] Date range:', { today, tomorrowStart });

    const activeUsers = await prisma.habitEntry.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrowStart,
        },
      },
      distinct: ['habitId'],
      select: {
        habit: {
          select: {
            userId: true,
          },
        },
      },
    });

    console.log('[stats] Active entries today:', activeUsers.length);

    // Compter les utilisateurs uniques
    const uniqueUserIds = new Set(activeUsers.map(e => e.habit.userId));
    const onlineUsers = uniqueUserIds.size;

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
